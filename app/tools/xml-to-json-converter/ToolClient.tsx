"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type MappingMode = "compact" | "ordered";
type NameMode = "qualified" | "namespace-uri";
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type XmlStats = {
  elements: number;
  attributes: number;
  namespaces: number;
  cdata: number;
  comments: number;
  processingInstructions: number;
  mixedContentElements: number;
  xmlSpacePreserve: number;
  namespaceCollisions: number;
  outsideRootNodes: number;
  hasDoctype: boolean;
  declaredEncoding: string;
};

type Result = {
  output: string;
  stats: XmlStats;
  mode: MappingMode;
  nameMode: NameMode;
  warnings: string[];
};

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_TYPE_NODE = 10;
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";

const compactExample = `<catalog xmlns="urn:example:catalog">
  <book id="b1">
    <title>XML &amp; JSON</title>
    <author>Asha</author>
    <author>Varun</author>
  </book>
</catalog>`;

const orderedExample = `<p id="intro">Hello <strong>XML</strong> <![CDATA[& JSON]]><!--note--></p>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<MappingMode>("compact");
  const [nameMode, setNameMode] = useState<NameMode>("qualified");
  const [ignoreIndentationWhitespace, setIgnoreIndentationWhitespace] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const convert = () => {
    if (input.trim().length === 0) {
      setError("Please enter an XML document to convert.");
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, "application/xml");
      const parserError = getParserError(parser, xmlDoc);

      if (parserError) {
        throw new Error(`The XML is not well-formed. ${parserError}`);
      }

      if (!xmlDoc.documentElement) {
        throw new Error("No XML document element was found.");
      }

      const stats = collectXmlStats(xmlDoc, input);
      const root = xmlDoc.documentElement;
      const rootKey = elementKey(root, nameMode);
      const mapped = mode === "compact"
        ? { [rootKey]: compactElement(root, nameMode, false) }
        : {
            [rootKey]: orderedElement(
              root,
              nameMode,
              ignoreIndentationWhitespace,
              false
            ),
          };
      const warnings = buildWarnings(stats, mode, nameMode);

      setResult({
        output: JSON.stringify(mapped, null, 2),
        stats,
        mode,
        nameMode,
        warnings,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to convert this XML document."
      );
      setResult(null);
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(mode === "compact" ? compactExample : orderedExample);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setMode("compact");
    setNameMode("qualified");
    setIgnoreIndentationWhitespace(true);
    clearResult();
  };

  const copyOutput = async () => {
    if (!result?.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The JSON output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="XML to JSON Converter"
      description="Convert well-formed XML using an explicit compact or ordered JSON mapping. Keep attributes and repeated elements visible, choose how namespaces become JSON keys, and use ordered mode when mixed content or node order matters."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            XML Input
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste one XML document. The browser checks well-formedness before
            mapping the parsed XML tree to JSON; this is not XSD or DTD validity
            checking.
          </p>
        </div>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder="Paste XML here..."
          spellCheck={false}
          className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Mapping Settings
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="JSON Mapping"
            value={mode}
            onChange={(value: string) => {
              setMode(value as MappingMode);
              clearResult();
            }}
            options={[
              { label: "Compact object mapping", value: "compact" },
              { label: "Ordered node mapping", value: "ordered" },
            ]}
          />

          <YoryantraSelect
            label="XML Name Representation"
            value={nameMode}
            onChange={(value: string) => {
              setNameMode(value as NameMode);
              clearResult();
            }}
            options={[
              {
                label: "Qualified names (prefix:name)",
                value: "qualified",
              },
              {
                label: "Namespace URI keys ({uri}name)",
                value: "namespace-uri",
              },
            ]}
          />

          {mode === "ordered" ? (
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 md:col-span-2">
              <input
                type="checkbox"
                checked={ignoreIndentationWhitespace}
                onChange={(event: { target: { checked: boolean } }) => {
                  setIgnoreIndentationWhitespace(event.target.checked);
                  clearResult();
                }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
              />
              <span>
                Ignore whitespace-only text nodes that look like indentation.
                Whitespace is still retained when an inherited
                <code> xml:space=&quot;preserve&quot;</code> instruction applies.
              </span>
            </label>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600 md:col-span-2">
              Compact mode groups repeated child element names into arrays,
              stores attributes under <code>@attributes</code>, and combines
              direct text under <code>#text</code> when an element also has
              child elements. Exact mixed-content interleaving is not retained.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={convert} className="yoryantra-btn">
          Convert to JSON
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    JSON Output
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    XML text and attribute values remain strings. The converter
                    does not guess numbers, booleans, dates, or null values.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyOutput}
                  className="yoryantra-btn-outline text-sm"
                >
                  {copied ? "Copied" : "Copy JSON"}
                </button>
              </div>

              <pre className="mt-4 yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
                {result.output}
              </pre>
            </div>

            <div className="space-y-4">
              <StatCard
                label="Mapping"
                value={result.mode === "compact" ? "Compact" : "Ordered"}
              />
              <StatCard
                label="Elements / attributes"
                value={`${result.stats.elements.toLocaleString()} / ${result.stats.attributes.toLocaleString()}`}
              />
              <StatCard
                label="Namespaces"
                value={result.stats.namespaces.toLocaleString()}
              />
              <StatCard
                label="CDATA / mixed"
                value={`${result.stats.cdata.toLocaleString()} / ${result.stats.mixedContentElements.toLocaleString()}`}
              />
            </div>
          </div>

          {result.warnings.length > 0 ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                Mapping review notes
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-amber-800">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Comments"
              value={result.stats.comments.toLocaleString()}
            />
            <StatCard
              label="Processing instructions"
              value={result.stats.processingInstructions.toLocaleString()}
            />
            <StatCard
              label="xml:space preserve"
              value={result.stats.xmlSpacePreserve.toLocaleString()}
            />
            <StatCard
              label="DOCTYPE"
              value={result.stats.hasDoctype ? "Present" : "None"}
            />
          </div>
        </>
      ) : null}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser-local conversion
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          The XML is parsed and converted in your browser. This tool does not
          send the pasted document to a conversion API. Site-wide analytics or
          advertising scripts, if enabled by the website, are separate from
          the XML-to-JSON operation itself.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            XML to JSON Has No Universal Lossless Mapping
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML and JSON use different data models. XML can carry attributes,
            namespace-qualified names, comments, processing instructions,
            CDATA sections, document type declarations, and character data
            interleaved with child elements. JSON has objects, arrays, strings,
            numbers, booleans, and null, but no built-in equivalent for several
            of those XML concepts.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This converter therefore exposes its mapping rules instead of
            presenting one representation as a standard. Compact mode is
            convenient for data-oriented XML. Ordered mode is more appropriate
            when the order of text, elements, CDATA, comments, or processing
            instructions inside an element matters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Compact Mapping Conventions
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>
              Attributes are stored under <code>@attributes</code>.
            </li>
            <li>
              Repeated child elements with the same generated key become an
              array.
            </li>
            <li>
              A text-only element becomes a string when it has no attributes.
            </li>
            <li>
              Direct text in an element that also has attributes or child
              elements is stored under <code>#text</code>.
            </li>
            <li>
              CDATA contributes character data to <code>#text</code>; its
              lexical distinction from ordinary text is not preserved.
            </li>
            <li>
              Comments and processing instructions inside the root are omitted
              in compact mode.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Ordered Mapping for Mixed Content
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Mixed XML content can look like
            <code> Hello &lt;strong&gt;world&lt;/strong&gt; !</code>. Grouping
            the element and text into separate JSON properties loses the fact
            that one text fragment came before the child and another came after
            it. Ordered mode stores child nodes in a <code>#children</code>
            array so text, elements, CDATA, comments, and processing
            instructions remain in document order inside the root element.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The indentation-whitespace option can remove whitespace-only text
            nodes that commonly exist only because the source was pretty
            printed. An inherited <code>xml:space=&quot;preserve&quot;</code>
            instruction overrides that convenience because whitespace may be
            meaningful to the application.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Qualified Names and Namespace URI Keys Solve Different Problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Qualified-name mode keeps lexical names such as
            <code> atom:title</code>. That is readable and resembles the source,
            but prefixes are aliases: two documents can use different prefixes
            for the same namespace URI, and different default namespaces can
            produce the same unprefixed <code>nodeName</code>. When sibling
            names would collide across different namespace URIs, the tool
            reports the risk.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Namespace-URI mode uses keys in a Clark-like form such as
            <code>{`{http://www.w3.org/2005/Atom}title`}</code>. This is more
            verbose but ties the JSON key to the expanded XML name rather than
            whichever prefix happened to be used in the source. Namespace
            declaration attributes remain readable as <code>xmlns</code> or
            <code>xmlns:prefix</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Document-Level Nodes Are Outside This Root Mapping
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generated JSON is rooted at the XML document element. Comments
            or processing instructions that appear before or after that root
            element are not inserted into the JSON tree, even in ordered mode.
            The tool counts and reports those nodes when they exist so a
            document with a significant prolog or epilog is not mistaken for a
            lossless conversion.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            DOCTYPE, Entities, and Browser Parsing Are Separate Concerns
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A DOCTYPE can contain declarations and entity definitions. The
            browser&apos;s XML DOM reflects what its parser produced, not the
            original lexical spelling of every entity reference or the behavior
            of a server-side XML library. This converter does not copy the
            DOCTYPE into the JSON mapping and is not an XXE scanner, DTD
            validator, or prediction of how Java, .NET, libxml, Python, PHP, or
            another XML stack is configured.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            XML Text Stays Text
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML element text and attribute values do not carry JSON number,
            boolean, or null types. A value such as <code>0012</code>,
            <code>false</code>, or <code>null</code> therefore remains a JSON
            string. Guessing types can silently change identifiers, leading
            zeros, decimal precision, or domain-specific values, so type
            coercion belongs in an application-aware step after conversion.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Declared Byte Encoding Cannot Re-Decode Pasted Text
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When XML is pasted into a browser textarea, it is already a
            JavaScript Unicode string. An XML declaration such as
            <code> encoding=&quot;ISO-8859-1&quot;</code> describes the byte
            representation of an external XML entity; it cannot make this page
            reinterpret characters that have already been decoded by another
            layer. Diagnose byte-encoding problems from the original file or
            HTTP response before converting the text to JSON.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Official References
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              <a
                href="https://www.w3.org/TR/xml/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                W3C — Extensible Markup Language (XML) 1.0
              </a>
            </p>
            <p>
              <a
                href="https://www.w3.org/TR/xml-names/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                W3C — Namespaces in XML 1.0
              </a>
            </p>
            <p>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                MDN — DOMParser.parseFromString()
              </a>
            </p>
            <p>
              <a
                href="https://www.rfc-editor.org/rfc/rfc8259"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                RFC 8259 — JSON data model and interoperability
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/xml-to-json-converter" />
        </div>
      </section>
    </ToolShell>
  );
}

function getParserError(parser: DOMParser, documentNode: Document) {
  const probe = parser.parseFromString(
    "<yoryantra-freeze-probe>",
    "application/xml"
  );
  const probeRoot = probe.documentElement;
  const resultRoot = documentNode.documentElement;

  if (!probeRoot || !resultRoot) return "";

  const sameErrorShape =
    resultRoot.localName === probeRoot.localName &&
    resultRoot.namespaceURI === probeRoot.namespaceURI;

  if (!sameErrorShape) return "";

  return (
    resultRoot.textContent?.replace(/\s+/g, " ").trim() ||
    "The browser XML parser reported a well-formedness error."
  );
}

function compactElement(
  element: Element,
  nameMode: NameMode,
  inheritedPreserveWhitespace: boolean
): JsonValue {
  const attributes = attributesObject(element, nameMode);
  const childElements = Array.from(element.children);
  const preserveWhitespace = resolvePreserveWhitespace(
    element,
    inheritedPreserveWhitespace
  );
  const directTextNodes = Array.from(element.childNodes).filter(
    (node) =>
      node.nodeType === TEXT_NODE || node.nodeType === CDATA_SECTION_NODE
  );

  const directText = directTextNodes
    .map((node) => node.nodeValue || "")
    .join("");

  if (Object.keys(attributes).length === 0 && childElements.length === 0) {
    return directText;
  }

  const result: { [key: string]: JsonValue } = {};

  if (Object.keys(attributes).length > 0) {
    result["@attributes"] = attributes;
  }

  const textForMapping =
    childElements.length === 0 || preserveWhitespace
      ? directText
      : directTextNodes
          .map((node) => node.nodeValue || "")
          .filter((value) => value.trim().length > 0)
          .join("");

  if (textForMapping.length > 0) {
    result["#text"] = textForMapping;
  }

  for (const child of childElements) {
    const key = elementKey(child, nameMode);
    const mapped = compactElement(
      child,
      nameMode,
      preserveWhitespace
    );

    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      result[key] = mapped;
    } else if (Array.isArray(result[key])) {
      (result[key] as JsonValue[]).push(mapped);
    } else {
      result[key] = [result[key], mapped];
    }
  }

  return result;
}

function orderedElement(
  element: Element,
  nameMode: NameMode,
  ignoreIndentationWhitespace: boolean,
  inheritedPreserveWhitespace: boolean
): JsonValue {
  const result: { [key: string]: JsonValue } = {};
  const attributes = attributesObject(element, nameMode);

  if (Object.keys(attributes).length > 0) {
    result["@attributes"] = attributes;
  }

  const preserveWhitespace = resolvePreserveWhitespace(
    element,
    inheritedPreserveWhitespace
  );
  const children: JsonValue[] = [];

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === ELEMENT_NODE) {
      const child = node as Element;
      children.push({
        [elementKey(child, nameMode)]: orderedElement(
          child,
          nameMode,
          ignoreIndentationWhitespace,
          preserveWhitespace
        ),
      });
      continue;
    }

    if (node.nodeType === TEXT_NODE) {
      const value = node.nodeValue || "";

      if (
        !ignoreIndentationWhitespace ||
        preserveWhitespace ||
        value.trim().length > 0
      ) {
        children.push({ "#text": value });
      }
      continue;
    }

    if (node.nodeType === CDATA_SECTION_NODE) {
      children.push({ "#cdata": node.nodeValue || "" });
      continue;
    }

    if (node.nodeType === COMMENT_NODE) {
      children.push({ "#comment": node.nodeValue || "" });
      continue;
    }

    if (node.nodeType === PROCESSING_INSTRUCTION_NODE) {
      const pi = node as ProcessingInstruction;
      children.push({
        "#pi": {
          target: pi.target,
          data: pi.data,
        },
      });
    }
  }

  if (children.length > 0) {
    result["#children"] = children;
  }

  return result;
}

function resolvePreserveWhitespace(
  element: Element,
  inheritedPreserveWhitespace: boolean
) {
  const xmlSpace =
    element.getAttributeNS(XML_NAMESPACE, "space") ||
    element.getAttribute("xml:space") ||
    "";

  if (xmlSpace === "preserve") return true;
  if (xmlSpace === "default") return false;
  return inheritedPreserveWhitespace;
}

function elementKey(element: Element, mode: NameMode) {
  if (mode === "qualified") return element.nodeName;

  const namespace = element.namespaceURI || "";
  const localName = element.localName || element.nodeName;
  return namespace ? `{${namespace}}${localName}` : localName;
}

function attributeKey(attribute: Attr, mode: NameMode) {
  if (mode === "qualified") return attribute.name;

  if (
    attribute.namespaceURI === XMLNS_NAMESPACE ||
    attribute.name === "xmlns" ||
    attribute.name.startsWith("xmlns:")
  ) {
    return attribute.name;
  }

  const namespace = attribute.namespaceURI || "";
  const localName = attribute.localName || attribute.name;
  return namespace ? `{${namespace}}${localName}` : localName;
}

function attributesObject(element: Element, mode: NameMode) {
  const attributes: { [key: string]: JsonValue } = {};

  for (const attribute of Array.from(element.attributes)) {
    attributes[attributeKey(attribute, mode)] = attribute.value;
  }

  return attributes;
}

function collectXmlStats(documentNode: Document, source: string): XmlStats {
  const root = documentNode.documentElement;
  const stats: XmlStats = {
    elements: 0,
    attributes: 0,
    namespaces: 0,
    cdata: 0,
    comments: 0,
    processingInstructions: 0,
    mixedContentElements: 0,
    xmlSpacePreserve: 0,
    namespaceCollisions: 0,
    outsideRootNodes: 0,
    hasDoctype: Boolean(documentNode.doctype),
    declaredEncoding: readDeclaredEncoding(source),
  };
  const namespaces = new Set<string>();

  const visit = (element: Element) => {
    stats.elements += 1;
    stats.attributes += element.attributes.length;

    if (element.namespaceURI) {
      namespaces.add(element.namespaceURI);
    }

    const xmlSpace =
      element.getAttributeNS(XML_NAMESPACE, "space") ||
      element.getAttribute("xml:space");

    if (xmlSpace === "preserve") {
      stats.xmlSpacePreserve += 1;
    }

    let hasElementChild = false;
    let hasMeaningfulText = false;
    const siblingNamespaces = new Map<string, Set<string>>();

    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === ELEMENT_NODE) {
        hasElementChild = true;
        const child = node as Element;
        const lexicalName = child.nodeName;
        const namespace = child.namespaceURI || "";
        const set = siblingNamespaces.get(lexicalName) || new Set<string>();
        set.add(namespace);
        siblingNamespaces.set(lexicalName, set);
        visit(child);
      } else if (node.nodeType === TEXT_NODE) {
        if ((node.nodeValue || "").trim().length > 0) {
          hasMeaningfulText = true;
        }
      } else if (node.nodeType === CDATA_SECTION_NODE) {
        stats.cdata += 1;
        if ((node.nodeValue || "").length > 0) {
          hasMeaningfulText = true;
        }
      } else if (node.nodeType === COMMENT_NODE) {
        stats.comments += 1;
      } else if (node.nodeType === PROCESSING_INSTRUCTION_NODE) {
        stats.processingInstructions += 1;
      }
    }

    siblingNamespaces.forEach((set) => {
      if (set.size > 1) stats.namespaceCollisions += 1;
    });

    if (hasElementChild && hasMeaningfulText) {
      stats.mixedContentElements += 1;
    }
  };

  visit(root);

  for (const node of Array.from(documentNode.childNodes)) {
    if (node === root || node.nodeType === DOCUMENT_TYPE_NODE) continue;

    if (
      node.nodeType === COMMENT_NODE ||
      node.nodeType === PROCESSING_INSTRUCTION_NODE
    ) {
      stats.outsideRootNodes += 1;
    }
  }

  stats.namespaces = namespaces.size;
  return stats;
}

function buildWarnings(
  stats: XmlStats,
  mode: MappingMode,
  nameMode: NameMode
) {
  const warnings: string[] = [];

  if (mode === "compact" && stats.mixedContentElements > 0) {
    warnings.push(
      `${stats.mixedContentElements.toLocaleString()} mixed-content element${
        stats.mixedContentElements === 1 ? " was" : "s were"
      } detected. Compact mode combines direct text and groups child elements, so exact text/element interleaving is lost. Use ordered mode when sequence matters.`
    );
  }

  if (
    mode === "compact" &&
    (stats.comments > 0 || stats.processingInstructions > 0)
  ) {
    warnings.push(
      `Compact mode omits comments and processing instructions inside the root. The document contains ${stats.comments.toLocaleString()} comment node${
        stats.comments === 1 ? "" : "s"
      } and ${stats.processingInstructions.toLocaleString()} processing instruction${
        stats.processingInstructions === 1 ? "" : "s"
      }.`
    );
  }

  if (stats.outsideRootNodes > 0) {
    warnings.push(
      `${stats.outsideRootNodes.toLocaleString()} comment or processing-instruction node${
        stats.outsideRootNodes === 1 ? " exists" : "s exist"
      } outside the document element. This converter maps the root element tree and does not copy those document-level nodes into JSON.`
    );
  }

  if (stats.hasDoctype) {
    warnings.push(
      "A DOCTYPE is present. It participates in browser XML parsing but is not copied into the JSON mapping; entity/reference spelling and DTD semantics are therefore not preserved as source text."
    );
  }

  if (nameMode === "qualified" && stats.namespaceCollisions > 0) {
    warnings.push(
      `${stats.namespaceCollisions.toLocaleString()} sibling-name namespace collision${
        stats.namespaceCollisions === 1 ? " was" : "s were"
      } detected: the same qualified nodeName appeared with different namespace URIs under one parent. Namespace URI key mode avoids grouping those expanded names under one JSON key.`
    );
  }

  if (stats.xmlSpacePreserve > 0) {
    warnings.push(
      `${stats.xmlSpacePreserve.toLocaleString()} element${
        stats.xmlSpacePreserve === 1 ? " uses" : "s use"
      } xml:space="preserve". Ordered mode honors inherited preserve/default behavior for whitespace-only text nodes; compact mode retains direct whitespace text but still cannot preserve mixed-content interleaving.`
    );
  }

  if (
    stats.declaredEncoding &&
    stats.declaredEncoding.toLowerCase() !== "utf-8" &&
    stats.declaredEncoding.toLowerCase() !== "utf8"
  ) {
    warnings.push(
      `The XML declaration says encoding="${stats.declaredEncoding}". Pasted browser text is already a Unicode string, so this page cannot re-decode the original bytes according to that declaration.`
    );
  }

  return warnings;
}

function readDeclaredEncoding(source: string) {
  const withoutBom =
    source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
  const declaration = withoutBom.match(/^\s*<\?xml\s+[\s\S]*?\?>/i)?.[0] || "";

  if (!declaration) return "";

  const match = declaration.match(/\bencoding\s*=\s*(["'])([^"']+)\1/i);
  return match ? match[2] : "";
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
