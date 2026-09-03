"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type MappingMode = "compact" | "ordered";
type CompactValue = string | { [key: string]: CompactValue | CompactValue[] };

type OrderedAttribute = {
  name: string;
  localName: string;
  prefix: string | null;
  namespaceURI: string | null;
  value: string;
};

type OrderedNode =
  | {
      type: "element";
      name: string;
      localName: string;
      prefix: string | null;
      namespaceURI: string | null;
      attributes: OrderedAttribute[];
      children: OrderedNode[];
    }
  | { type: "text"; value: string }
  | { type: "cdata"; value: string }
  | { type: "comment"; value: string }
  | { type: "processing-instruction"; target: string; data: string };

type ConversionState = {
  warnings: string[];
  warningKeys: Set<string>;
};

const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const MAX_TREE_DEPTH = 200;

function containsDoctypeDeclaration(text: string): boolean {
  let index = 0;

  while (index < text.length) {
    const nextMarkup = text.indexOf("<", index);
    if (nextMarkup === -1) return false;

    if (text.startsWith("<!--", nextMarkup)) {
      const end = text.indexOf("-->", nextMarkup + 4);
      if (end === -1) return false;
      index = end + 3;
      continue;
    }

    if (text.startsWith("<![CDATA[", nextMarkup)) {
      const end = text.indexOf("]]>", nextMarkup + 9);
      if (end === -1) return false;
      index = end + 3;
      continue;
    }

    if (text.startsWith("<?", nextMarkup)) {
      const end = text.indexOf("?>", nextMarkup + 2);
      if (end === -1) return false;
      index = end + 2;
      continue;
    }

    if (text.slice(nextMarkup, nextMarkup + 9).toUpperCase() === "<!DOCTYPE") {
      return true;
    }

    index = nextMarkup + 1;
  }

  return false;
}

function addWarning(state: ConversionState, key: string, message: string) {
  if (state.warningKeys.has(key)) return;
  state.warningKeys.add(key);
  state.warnings.push(message);
}

function parserErrorMessage(documentNode: Document): string | null {
  const mozillaNamespace = "http://www.mozilla.org/newlayout/xml/parsererror.xml";
  const xhtmlNamespace = "http://www.w3.org/1999/xhtml";
  const mozillaError = documentNode.getElementsByTagNameNS(mozillaNamespace, "parsererror").item(0);
  const xhtmlErrors = Array.from(documentNode.getElementsByTagNameNS(xhtmlNamespace, "parsererror"));
  const xhtmlError = xhtmlErrors.find((node) => {
    const text = (node.textContent || "").toLowerCase();
    return node.hasAttribute("style") || text.includes("error on line") || text.includes("following errors");
  });
  const errorNode = mozillaError || xhtmlError || null;
  if (!errorNode) return null;

  const text = (errorNode.textContent || "").replace(/\s+/g, " ").trim();
  if (!text) return "XML is not well-formed.";
  return `XML is not well-formed: ${text.slice(0, 320)}${text.length > 320 ? "…" : ""}`;
}

function shouldPreserveSpace(element: Element, inherited: boolean): boolean {
  const value = element.getAttributeNS(XML_NAMESPACE, "space") || element.getAttribute("xml:space");
  if (value === "preserve") return true;
  if (value === "default") return false;
  return inherited;
}

function compactElement(
  element: Element,
  preserveAllWhitespace: boolean,
  inheritedPreserve: boolean,
  state: ConversionState,
  depth: number
): CompactValue {
  if (depth > MAX_TREE_DEPTH) {
    throw new Error(`XML nesting is deeper than the ${MAX_TREE_DEPTH}-level browser conversion limit.`);
  }

  const preserveSpace = preserveAllWhitespace || shouldPreserveSpace(element, inheritedPreserve);
  const result = Object.create(null) as { [key: string]: CompactValue | CompactValue[] };

  if (element.namespaceURI) {
    addWarning(
      state,
      "compact-namespaces",
      "Compact mode keeps qualified names and xmlns attributes, but it does not attach namespaceURI metadata to every element. Use ordered mode when namespace identity must be explicit."
    );
  }

  if (element.attributes.length > 0) {
    const attributes = Object.create(null) as { [key: string]: CompactValue };
    Array.from(element.attributes).forEach((attribute) => {
      attributes[attribute.name] = attribute.value;
    });
    result["@attributes"] = attributes;
  }

  const textSegments: string[] = [];
  let elementChildCount = 0;
  let hasMeaningfulText = false;

  Array.from(element.childNodes).forEach((child) => {
    if (child.nodeType === 1) {
      elementChildCount += 1;
      const childElement = child as Element;
      const childName = childElement.nodeName;
      const childValue = compactElement(childElement, preserveAllWhitespace, preserveSpace, state, depth + 1);
      const existing = result[childName];

      if (typeof existing === "undefined") {
        result[childName] = childValue;
      } else if (Array.isArray(existing)) {
        existing.push(childValue);
      } else {
        result[childName] = [existing, childValue];
      }
      return;
    }

    if (child.nodeType === 3 || child.nodeType === 4) {
      const value = child.nodeValue || "";
      textSegments.push(value);
      if (value.trim().length > 0) hasMeaningfulText = true;

      if (child.nodeType === 4) {
        addWarning(
          state,
          "compact-cdata",
          "Compact mode merges CDATA content into text, so the distinction between a CDATA section and an ordinary text node is lost. Ordered mode preserves that distinction."
        );
      }
      return;
    }

    if (child.nodeType === 8) {
      addWarning(state, "compact-comments", "Compact mode omits XML comments. Ordered mode can preserve comments as explicit nodes.");
      return;
    }

    if (child.nodeType === 7) {
      addWarning(
        state,
        "compact-pi",
        "Compact mode omits processing instructions. Ordered mode can preserve their target and data."
      );
    }
  });

  if (elementChildCount > 0 && (hasMeaningfulText || (preserveSpace && textSegments.some((value) => value.length > 0)))) {
    addWarning(
      state,
      "compact-mixed-content",
      "Text and child elements occur together. Compact mode cannot preserve their exact sequence; ordered mode is safer when mixed text or preserved whitespace carries meaning."
    );
  }

  let text = textSegments.join("");
  if (!preserveSpace) text = text.trim();

  const hasAttributes = element.attributes.length > 0;
  if (elementChildCount === 0 && !hasAttributes) {
    return text;
  }

  if (text.length > 0 || (preserveSpace && textSegments.length > 0)) {
    result["#text"] = text;
  }

  return result;
}

function orderedNode(node: Node, depth: number): OrderedNode | null {
  if (depth > MAX_TREE_DEPTH) {
    throw new Error(`XML nesting is deeper than the ${MAX_TREE_DEPTH}-level browser conversion limit.`);
  }

  if (node.nodeType === 1) {
    const element = node as Element;
    const attributes = Array.from(element.attributes).map((attribute) => ({
      name: attribute.name,
      localName: attribute.localName,
      prefix: attribute.prefix,
      namespaceURI: attribute.namespaceURI,
      value: attribute.value,
    }));

    const children = Array.from(element.childNodes)
      .map((child) => orderedNode(child, depth + 1))
      .filter((child): child is OrderedNode => child !== null);

    return {
      type: "element",
      name: element.nodeName,
      localName: element.localName,
      prefix: element.prefix,
      namespaceURI: element.namespaceURI,
      attributes,
      children,
    };
  }

  if (node.nodeType === 3) return { type: "text", value: node.nodeValue || "" };
  if (node.nodeType === 4) return { type: "cdata", value: node.nodeValue || "" };
  if (node.nodeType === 8) return { type: "comment", value: node.nodeValue || "" };

  if (node.nodeType === 7) {
    const instruction = node as ProcessingInstruction;
    return { type: "processing-instruction", target: instruction.target, data: instruction.data };
  }

  return null;
}

function reviewParsedDocument(documentNode: Document, input: string, state: ConversionState, mode: MappingMode) {
  const declaration = input.match(/^\s*<\?xml\s+[^?]*encoding\s*=\s*(["'])([^"']+)\1[^?]*\?>/i);
  if (declaration) {
    addWarning(
      state,
      "xml-declaration-encoding",
      `The XML declaration says encoding="${declaration[2]}". A pasted JavaScript string has already been decoded to Unicode, so the original byte encoding cannot be verified from this text alone.`
    );
  }

  const elements = [documentNode.documentElement, ...Array.from(documentNode.getElementsByTagName("*"))];
  const seen = new Set<Element>();
  elements.forEach((element) => {
    if (!element || seen.has(element)) return;
    seen.add(element);
    const xmlSpace = element.getAttributeNS(XML_NAMESPACE, "space") || element.getAttribute("xml:space");
    if (xmlSpace && xmlSpace !== "default" && xmlSpace !== "preserve") {
      addWarning(
        state,
        "invalid-xml-space",
        `xml:space="${xmlSpace}" is outside the XML 1.0 values default/preserve. The value is left visible, but compact whitespace handling does not assign it a special meaning.`
      );
    }
  });

  if (mode === "compact") {
    const documentLevelNodes = Array.from(documentNode.childNodes).filter(
      (node) => node !== documentNode.documentElement && (node.nodeType === 7 || node.nodeType === 8)
    );
    if (documentLevelNodes.length > 0) {
      addWarning(
        state,
        "compact-document-misc",
        "Comments or processing instructions outside the root element are omitted by compact mapping. Ordered mode keeps those parsed document-level nodes."
      );
    }
  }
}

function convertXml(input: string, mode: MappingMode, preserveWhitespace: boolean): { output: string; warnings: string[] } {
  if (input.trim().length === 0) {
    throw new Error("Enter XML before converting.");
  }

  if (containsDoctypeDeclaration(input)) {
    throw new Error(
      "DOCTYPE declarations are intentionally rejected here. Remove the DOCTYPE, or process trusted DTD/entity-dependent XML in an XML environment designed for that document."
    );
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(input, "application/xml");
  const parseError = parserErrorMessage(documentNode);
  if (parseError) throw new Error(parseError);
  if (!documentNode.documentElement) throw new Error("The XML document has no root element.");

  const state: ConversionState = { warnings: [], warningKeys: new Set<string>() };
  reviewParsedDocument(documentNode, input, state, mode);

  if (mode === "compact") {
    const root = documentNode.documentElement;
    const result = Object.create(null) as { [key: string]: CompactValue };
    result[root.nodeName] = compactElement(root, preserveWhitespace, false, state, 0);

    addWarning(
      state,
      "compact-order",
      "Compact JSON groups child elements by name, so XML sibling order is not a reliable part of this mapping. Use ordered mode when sequence is significant."
    );

    return { output: JSON.stringify(result, null, 2), warnings: state.warnings };
  }

  const documentChildren = Array.from(documentNode.childNodes)
    .map((child) => orderedNode(child, 0))
    .filter((child): child is OrderedNode => child !== null);

  state.warnings.push(
    "Ordered mode preserves parsed node order, whitespace text nodes, CDATA, comments, processing instructions, qualified names, and namespace metadata. It still cannot reproduce the original XML byte-for-byte after parsing."
  );

  return {
    output: JSON.stringify({ document: documentChildren }, null, 2),
    warnings: state.warnings,
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [mode, setMode] = useState<MappingMode>("compact");
  const [preserveWhitespace, setPreserveWhitespace] = useState(false);
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setOutput("");
    setError("");
    setWarnings([]);
    setCopied(false);
  };

  const xmlToJson = () => {
    try {
      const result = convertXml(input, mode, preserveWhitespace);
      setOutput(result.output);
      setWarnings(result.warnings);
      setError("");
      setCopied(false);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Unable to convert XML to JSON.");
      setOutput("");
      setWarnings([]);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setError("The browser could not copy the JSON output. Select it and copy manually.");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setWarnings([]);
    setMode("compact");
    setPreserveWhitespace(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="XML to JSON Converter"
      description="Convert well-formed XML to either practical compact JSON or an order-preserving node representation, with explicit handling notes for attributes, namespaces, mixed content, whitespace, CDATA, comments, and processing instructions."
    >
      <div>
        <label htmlFor="xml-json-input" className="mb-2 block text-sm font-medium text-gray-700">XML input</label>
        <textarea
          id="xml-json-input"
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={'<catalog><book id="1"><title>Example</title></book></catalog>'}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          spellCheck={false}
        />
        <p className="mt-2 text-xs text-gray-500">{input.length.toLocaleString()} characters</p>
      </div>

      <fieldset className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-900">JSON mapping</legend>
        <div className="mt-1 grid gap-3 md:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
            <input
              type="radio"
              name="xml-json-mode"
              checked={mode === "compact"}
              onChange={() => {
                setMode("compact");
                clearResult();
              }}
              className="mt-1 shrink-0"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Compact object mapping</span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-600">Good for ordinary API-style XML. Attributes use <code>@attributes</code>, direct text uses <code>#text</code>, and repeated child names become arrays.</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
            <input
              type="radio"
              name="xml-json-mode"
              checked={mode === "ordered"}
              onChange={() => {
                setMode("ordered");
                clearResult();
              }}
              className="mt-1 shrink-0"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Order-preserving node mapping</span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-600">Verbose, but retains parsed child order, text nodes, CDATA, comments, processing instructions, and namespace metadata.</span>
            </span>
          </label>
        </div>

        {mode === "compact" && (
          <label className="mt-4 flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={preserveWhitespace}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setPreserveWhitespace(event.target.checked);
                clearResult();
              }}
              className="mt-1 shrink-0"
            />
            <span>
              <span className="font-medium text-gray-900">Preserve direct text whitespace</span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                Keep indentation and whitespace-only direct text in compact mode. Even when unchecked, an inherited <code>xml:space=&quot;preserve&quot;</code> request is respected by this mapping.
              </span>
            </span>
          </label>
        )}
      </fieldset>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={xmlToJson} className="yoryantra-btn">Convert to JSON</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
          <h2 className="font-semibold text-gray-900">Details that may change the meaning of the mapping</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
            {warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">JSON output</h2>
          {output && (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">{output || "Converted JSON will appear here..."}</pre>
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-gray-900">The XML is parsed locally, not validated as an application contract</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Parsing and mapping happen in the browser with <code>DOMParser</code>; parsed values are serialized as JSON text rather than inserted into the active page. DOCTYPE input is rejected before parsing. A successful conversion still does not mean the document satisfies an XSD, DTD, SOAP profile, feed format, or business rule.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">XML and JSON do not share one universal data model</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON has objects, arrays, strings, numbers, booleans, and null. XML has elements, attributes, ordered child nodes, namespace bindings, character data, comments, processing instructions, CDATA sections, and document-level syntax. A JSON representation therefore has to choose what to preserve and what to simplify; there is no single standard mapping hidden inside every XML document.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compact mapping works well for element-centric API data. Ordered mapping stays closer to the parsed XML node sequence when mixed content, namespaces, comments, processing instructions, or exact child order matter. The underlying XML concepts are defined by <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.w3.org/TR/xml/" target="_blank" rel="noreferrer">XML 1.0</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How compact mapping turns XML features into JSON</h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900"><tr><th className="px-4 py-3">XML feature</th><th className="px-4 py-3">Compact representation</th></tr></thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                <tr><td className="px-4 py-3">Leaf element</td><td className="px-4 py-3">Direct character data becomes a JSON string when there are no attributes or child elements.</td></tr>
                <tr><td className="px-4 py-3">Attributes</td><td className="px-4 py-3">Collected under <code>@attributes</code> using qualified attribute names.</td></tr>
                <tr><td className="px-4 py-3">Text beside attributes/children</td><td className="px-4 py-3">Collected under <code>#text</code>.</td></tr>
                <tr><td className="px-4 py-3">Repeated child names</td><td className="px-4 py-3">Become an array under that qualified child name.</td></tr>
                <tr><td className="px-4 py-3">CDATA</td><td className="px-4 py-3">Merged into text, so the CDATA boundary is no longer distinguishable.</td></tr>
                <tr><td className="px-4 py-3">Comments / processing instructions</td><td className="px-4 py-3">Omitted in compact mode and reported in the mapping notes.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Element-centric data stays compact</h2>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`<book id="7">
  <title>XML in Practice</title>
  <tag>api</tag>
  <tag>data</tag>
</book>`}</pre>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`{
  "book": {
    "@attributes": { "id": "7" },
    "title": "XML in Practice",
    "tag": ["api", "data"]
  }
}`}</pre>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Mixed content needs sequence</h2>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`<p>Hello <strong>world</strong>!</p>`}</pre>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              The words before and after <code>strong</code> are separate text nodes. Grouping child elements by name cannot say that <code>Hello </code> came first and <code>!</code> came last. Ordered mapping keeps those nodes in sequence.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A namespace prefix is only a label</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Namespace identity comes from the namespace URI, not from the particular prefix written in the file. Two documents can use different prefixes for the same vocabulary, and the same prefix can be rebound in different scopes. <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.w3.org/TR/xml-names/" target="_blank" rel="noreferrer">Namespaces in XML</a> defines that relationship.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compact mapping keeps qualified names such as <code>soap:Body</code> and the namespace declaration attributes but does not attach a namespace URI to every element. Ordered mapping records <code>name</code>, <code>localName</code>, <code>prefix</code>, and <code>namespaceURI</code> separately. Unprefixed attributes remain in no namespace even when a default element namespace is active.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Whitespace can be data</h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Pretty-printed API XML often contains indentation that is not useful in the resulting data model, while prose, source code, signatures, and other document-oriented XML can depend on whitespace. Compact mapping trims direct text by default; the checkbox keeps it, and an inherited <code>xml:space=&quot;preserve&quot;</code> request also keeps it.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            XML 1.0 describes <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.w3.org/TR/xml/#sec-white-space" target="_blank" rel="noreferrer"><code>xml:space</code> and application whitespace handling</a>. Values other than <code>default</code> and <code>preserve</code> are reported because assigning them a private meaning would make the mapping harder to reason about.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">DOCTYPE and entity-dependent XML need an XML-native path</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A DTD can declare entities, default attributes, and validity constraints. External entity handling has also been a security-sensitive area in server-side XML stacks. DOCTYPE input is rejected before browser parsing so the page does not pretend to support DTD-dependent documents or external entity resolution.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The five predefined XML entities and numeric character references do not require a DTD. After parsing, references have already become characters, so the JSON cannot tell whether a character was written literally, with <code>&amp;#x...</code>, or with a predefined entity such as <code>&amp;amp;</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Well-formed is not the same as valid for your system</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser <code>DOMParser</code> can identify malformed XML such as mismatched tags or unbound namespace prefixes. MDN documents that XML parsing returns a document containing a <code>parsererror</code> node when parsing fails; browser engines do not expose one universal exception object for every XML parse error. See <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString" target="_blank" rel="noreferrer">DOMParser.parseFromString()</a> for that browser behavior.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Passing the parser only establishes a browser-parsed XML document. It does not check XSD, Relax NG, DTD validity, SOAP rules, RSS/Atom profiles, or application-specific constraints. A perfectly well-formed document can still be unusable by the receiving system.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What cannot be reconstructed after parsing</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>The XML declaration is not represented as an ordinary child node; a pasted string also cannot prove the original byte encoding named by that declaration.</li>
            <li>Character and predefined entity references are resolved to characters.</li>
            <li>Compact mapping loses exact sibling sequence across differently named children, CDATA boundaries, comments, processing instructions, and some namespace identity detail.</li>
            <li>Ordered mapping keeps far more of the parsed node model but still loses lexical choices such as quote style, exact entity spelling, original byte encoding, and source formatting.</li>
            <li>Attribute and text values remain strings. <code>&quot;001&quot;</code>, <code>&quot;true&quot;</code>, and an empty string are not guessed into numbers, booleans, or null.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Choose the next step from what you are trying to preserve</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            If readability is the only goal, keep the data as XML and format it. If a JSON contract is the goal, decide explicitly how attributes, namespaces, arrays, mixed content, and types should map before making that representation part of an API.
          </p>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/xml-to-json-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
