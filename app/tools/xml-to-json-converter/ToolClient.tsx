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
  const byName = documentNode.getElementsByTagName("parsererror").item(0);
  const byNamespace = documentNode.getElementsByTagNameNS("*", "parsererror").item(0);
  const errorNode = byName || byNamespace;
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
    throw new Error(`XML nesting is deeper than this tool's ${MAX_TREE_DEPTH}-level conversion limit.`);
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

  if (elementChildCount > 0 && hasMeaningfulText) {
    addWarning(
      state,
      "compact-mixed-content",
      "Mixed content was detected. Compact mode cannot preserve the exact order between text and child elements; use ordered mode when that order matters."
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
    throw new Error(`XML nesting is deeper than this tool's ${MAX_TREE_DEPTH}-level conversion limit.`);
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

function convertXml(input: string, mode: MappingMode, preserveWhitespace: boolean): { output: string; warnings: string[] } {
  if (input.trim().length === 0) {
    throw new Error("Enter XML before converting.");
  }

  if (containsDoctypeDeclaration(input)) {
    throw new Error(
      "DOCTYPE declarations are intentionally not supported by this browser converter. Remove the DOCTYPE or process trusted DTD/entity-dependent XML in an XML environment designed for that document."
    );
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(input, "application/xml");
  const parseError = parserErrorMessage(documentNode);
  if (parseError) throw new Error(parseError);
  if (!documentNode.documentElement) throw new Error("The XML document has no root element.");

  const state: ConversionState = { warnings: [], warningKeys: new Set<string>() };

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
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <h2 className="font-semibold">Mapping notes for this conversion</h2>
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

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h2 className="text-sm font-semibold text-yellow-900">Privacy and parser boundary</h2>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Conversion happens in this browser component with <code>DOMParser</code>, and parsed nodes are serialized as text rather than inserted into the visible page. This tool intentionally rejects XML containing a DOCTYPE, reducing ambiguity around DTD/entity processing. Do not treat conversion as sanitization or as validation against an XSD, DTD, or business schema.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">There is no single universal XML-to-JSON mapping</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON and XML have different data models. JSON has objects, arrays, strings, numbers, booleans, and null. XML has elements, attributes, ordered child nodes, namespaces, text nodes, comments, processing instructions, CDATA sections, and document-level constructs. A converter must therefore choose a mapping; it cannot simply reveal one standard JSON form hidden inside every XML document.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool makes that choice visible. <strong>Compact mode</strong> is convenient when the source resembles API data with nested elements. <strong>Ordered mode</strong> is intended for inspection when node sequence, mixed content, namespaces, or node types matter more than compactness.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Compact mapping rules used by this tool</h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900"><tr><th className="px-4 py-3">XML feature</th><th className="px-4 py-3">Compact JSON representation</th></tr></thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                <tr><td className="px-4 py-3">Leaf element</td><td className="px-4 py-3">Its direct text becomes a JSON string when there are no attributes or child elements.</td></tr>
                <tr><td className="px-4 py-3">Attributes</td><td className="px-4 py-3">Collected under an <code>@attributes</code> object using their qualified names.</td></tr>
                <tr><td className="px-4 py-3">Direct text beside attributes/children</td><td className="px-4 py-3">Stored under <code>#text</code>.</td></tr>
                <tr><td className="px-4 py-3">Repeated child names</td><td className="px-4 py-3">Converted to a JSON array under that child name.</td></tr>
                <tr><td className="px-4 py-3">CDATA</td><td className="px-4 py-3">Merged into text; the CDATA-vs-text distinction is lost.</td></tr>
                <tr><td className="px-4 py-3">Comments / processing instructions</td><td className="px-4 py-3">Omitted, with a conversion warning when encountered.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Compact example</h2>
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
            <h2 className="text-lg font-semibold text-gray-900">Mixed content needs order</h2>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`<p>Hello <strong>world</strong>!</p>`}</pre>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              A compact object can store the <code>strong</code> child and the surrounding text, but it cannot faithfully express that <code>Hello </code> occurs before the child and <code>!</code> occurs after it. Ordered mode represents each text and element node in sequence.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Namespaces: prefixes are not the namespace identity</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In namespace-aware XML, the namespace URI identifies the vocabulary; a prefix is only a binding used in the document. Two documents can use different prefixes for the same namespace URI. Compact mode keeps qualified names such as <code>soap:Body</code> and namespace declaration attributes, which is practical but not fully namespace-normalized. Ordered mode records <code>name</code>, <code>localName</code>, <code>prefix</code>, and <code>namespaceURI</code> separately for elements and attributes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Whitespace and xml:space</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML processors pass character data to applications, and whitespace can be meaningful. Pretty-printed XML also commonly contains indentation that an API consumer does not want as data. In compact mode, this tool trims direct text by default, while the optional whitespace setting keeps it. An inherited <code>xml:space=&quot;preserve&quot;</code> request is treated as an instruction to retain direct text whitespace even when the checkbox is off. Ordered mode always keeps parsed text nodes exactly as the DOM exposes them.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That policy is a conversion choice, not a universal XML rule. If whitespace has document-level meaning—publishing, signatures, mixed prose, or protocol-specific canonicalization—prefer an XML-native workflow or inspect ordered mode rather than relying on compact JSON.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">DOCTYPE, entities, and security boundaries</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            DTDs can define entities and document constraints, and entity handling has historically been a security-sensitive area in server-side XML libraries. This browser tool does not need a DTD to perform its mapping, so it rejects any input containing a DOCTYPE rather than pretending to support DTD-dependent documents safely and consistently.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The parsed XML is not inserted into the active document. Even so, the JSON output should still be treated as data. If you later render values as HTML, build URLs, query a database, or pass them to another interpreter, apply the validation or output encoding required by that destination context.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Well-formed XML is not the same as valid XML</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The browser XML parser can reject malformed syntax such as mismatched tags. Passing that parser check only means the document is well-formed enough to create an XML DOM. This tool does not validate an XSD, Relax NG schema, DTD, SOAP contract, feed profile, or application-specific rules. A perfectly well-formed document can still be invalid for the system that expects it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Information that cannot be round-tripped exactly</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>The XML declaration is not represented as an ordinary DOM child and is not reproduced by these JSON mappings.</li>
            <li>Character references are resolved by the XML parser, so the JSON cannot tell whether a character originally appeared literally or as a numeric/predefined entity reference.</li>
            <li>Compact mode loses sibling ordering semantics, CDATA boundaries, comments, processing instructions, and some namespace identity detail.</li>
            <li>Ordered mode preserves much more of the parsed node model, but not original lexical choices such as quote style, exact entity spelling, or byte-level formatting.</li>
            <li>Attribute values are strings. The converter does not guess that <code>"001"</code> is a number, <code>"true"</code> is a boolean, or an empty value should become null.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Practical developer workflows</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li><strong>Legacy API inspection:</strong> convert a simple XML response to compact JSON before adapting it to a JavaScript or TypeScript data model.</li>
            <li><strong>SOAP debugging:</strong> use ordered mode when namespace URIs, prefixes, or element sequence are relevant to the envelope/body structure.</li>
            <li><strong>RSS or feed exploration:</strong> compact mode can make repetitive elements easier to inspect, but preserve XML-native semantics if mixed content or namespaces drive downstream behavior.</li>
            <li><strong>Migration planning:</strong> compare what each mapping loses before designing a permanent server-side XML-to-JSON contract. Do not let a convenience converter silently define your production data model.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Official references</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-gray-600">
            <li><a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.w3.org/TR/xml/" target="_blank" rel="noreferrer">W3C — Extensible Markup Language (XML) 1.0</a></li>
            <li><a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.w3.org/TR/xml-names/" target="_blank" rel="noreferrer">W3C — Namespaces in XML</a></li>
            <li><a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.w3.org/XML/1998/namespace" target="_blank" rel="noreferrer">W3C — The xml: namespace, including xml:space</a></li>
            <li><a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString" target="_blank" rel="noreferrer">MDN — DOMParser.parseFromString()</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 leading-relaxed text-gray-600">Use an XML formatter when you need readable XML without changing data models, a JSON validator after conversion when you need JSON syntax checks, or schema-specific tooling when the receiving application has a formal contract.</p>
          <YoryantraRelatedTools currentHref="/tools/xml-to-json-converter" />
        </div>
      </section>
    </ToolShell>
  );
}
