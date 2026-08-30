"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type IndentMode = "2" | "4" | "tab";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_TYPE_NODE = 10;
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";

const escapeAttributeValue = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/\t/g, "&#9;")
    .replace(/\n/g, "&#10;")
    .replace(/\r/g, "&#13;");

const elementStartTag = (element: Element) => {
  const attributes = Array.from(element.attributes)
    .map((attribute) => `${attribute.name}="${escapeAttributeValue(attribute.value)}"`)
    .join(" ");

  return `<${element.tagName}${attributes ? ` ${attributes}` : ""}>`;
};

const elementEmptyTag = (element: Element) => {
  const attributes = Array.from(element.attributes)
    .map((attribute) => `${attribute.name}="${escapeAttributeValue(attribute.value)}"`)
    .join(" ");

  return `<${element.tagName}${attributes ? ` ${attributes}` : ""}/>`;
};

const hasSignificantCharacterData = (node: Node) =>
  Array.from(node.childNodes).some(
    (child) =>
      child.nodeType === CDATA_SECTION_NODE ||
      (child.nodeType === TEXT_NODE && (child.nodeValue ?? "").trim() !== "")
  );

const hasElementChild = (node: Node) =>
  Array.from(node.childNodes).some((child) => child.nodeType === ELEMENT_NODE);

const shouldPreserveElementLayout = (element: Element, inherited: boolean) => {
  const xmlSpace =
    element.getAttributeNS(XML_NAMESPACE, "space") ?? element.getAttribute("xml:space");
  const preservesSpace = inherited || xmlSpace === "preserve";
  const mixedContent = hasSignificantCharacterData(element) && hasElementChild(element);
  const textOnly = hasSignificantCharacterData(element) && !hasElementChild(element);

  return preservesSpace || mixedContent || textOnly;
};

const extractDoctypeSource = (source: string) => {
  const start = source.indexOf("<!DOCTYPE");
  if (start < 0) return "";

  let quote = "";
  let subsetDepth = 0;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (character === quote) quote = "";
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === "[") subsetDepth += 1;
    if (character === "]" && subsetDepth > 0) subsetDepth -= 1;

    if (character === ">" && subsetDepth === 0) {
      return source.slice(start, index + 1);
    }
  }

  return "";
};

const formatXmlDocument = (
  documentNode: Document,
  source: string,
  indentUnit: string
) => {
  const serializer = new XMLSerializer();
  const originalDoctype = extractDoctypeSource(source);
  let doctypeUsed = false;
  let preservedElements = 0;

  const serializeInlineElement = (element: Element): string => {
    const children = Array.from(element.childNodes);
    if (children.length === 0) return elementEmptyTag(element);

    const contents = children
      .map((child) =>
        child.nodeType === ELEMENT_NODE
          ? serializeInlineElement(child as Element)
          : serializer.serializeToString(child)
      )
      .join("");

    return `${elementStartTag(element)}${contents}</${element.tagName}>`;
  };

  const formatNode = (
    node: Node,
    depth: number,
    inheritedPreserve = false
  ): string[] => {
    const indent = indentUnit.repeat(depth);

    if (node.nodeType === ELEMENT_NODE) {
      const element = node as Element;
      const children = Array.from(element.childNodes);

      if (children.length === 0) {
        return [`${indent}${elementEmptyTag(element)}`];
      }

      const preserve = shouldPreserveElementLayout(element, inheritedPreserve);
      if (preserve) {
        preservedElements += 1;
        return [`${indent}${serializeInlineElement(element)}`];
      }

      const meaningfulChildren = children.filter(
        (child) =>
          !(child.nodeType === TEXT_NODE && (child.nodeValue ?? "").trim() === "")
      );

      if (meaningfulChildren.length === 0) {
        return [`${indent}${serializeInlineElement(element)}`];
      }

      const lines = [`${indent}${elementStartTag(element)}`];
      for (const child of meaningfulChildren) {
        lines.push(...formatNode(child, depth + 1, false));
      }
      lines.push(`${indent}</${element.tagName}>`);
      return lines;
    }

    if (node.nodeType === DOCUMENT_TYPE_NODE) {
      if (originalDoctype && !doctypeUsed) {
        doctypeUsed = true;
        return [`${indent}${originalDoctype}`];
      }
      return [`${indent}${serializer.serializeToString(node)}`];
    }

    if (
      node.nodeType === COMMENT_NODE ||
      node.nodeType === PROCESSING_INSTRUCTION_NODE ||
      node.nodeType === CDATA_SECTION_NODE
    ) {
      return [`${indent}${serializer.serializeToString(node)}`];
    }

    if (node.nodeType === TEXT_NODE) {
      const value = node.nodeValue ?? "";
      return value.trim() ? [`${indent}${serializer.serializeToString(node)}`] : [];
    }

    return [];
  };

  const declaration = source.match(/^\s*(<\?xml[\s\S]*?\?>)/)?.[1] ?? "";
  const lines: string[] = declaration ? [declaration] : [];

  for (const child of Array.from(documentNode.childNodes)) {
    lines.push(...formatNode(child, 0, false));
  }

  return {
    output: lines.join("\n"),
    preservedElements,
  };
};

const inspectXml = (documentNode: Document) => {
  const elements = Array.from(documentNode.getElementsByTagName("*"));
  const namespaces = new Set<string>();
  let attributes = 0;
  let xmlSpacePreserve = 0;

  for (const element of elements) {
    attributes += element.attributes.length;
    if (element.namespaceURI) namespaces.add(element.namespaceURI);
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name === "xmlns" || attribute.name.startsWith("xmlns:")) {
        namespaces.add(attribute.value);
      }
    }
    if (
      (element.getAttributeNS(XML_NAMESPACE, "space") ?? element.getAttribute("xml:space")) ===
      "preserve"
    ) {
      xmlSpacePreserve += 1;
    }
  }

  return {
    root: documentNode.documentElement?.tagName ?? "",
    elements: elements.length,
    attributes,
    namespaces: namespaces.size,
    xmlSpacePreserve,
  };
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indentMode, setIndentMode] = useState<IndentMode>("2");
  const [hasResult, setHasResult] = useState(false);
  const [preservedElements, setPreservedElements] = useState(0);
  const [inspection, setInspection] = useState({
    root: "",
    elements: 0,
    attributes: 0,
    namespaces: 0,
    xmlSpacePreserve: 0,
  });

  const indentUnit = indentMode === "tab" ? "\t" : " ".repeat(Number(indentMode));

  const formatXML = () => {
    if (!input.trim()) {
      setError("Paste an XML document to format.");
      setOutput("");
      setHasResult(false);
      return;
    }

    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(input, "application/xml");
      const parserErrors = xml.getElementsByTagName("parsererror");
      const rootIsParserError = xml.documentElement?.localName === "parsererror";

      if (parserErrors.length > 0 || rootIsParserError) {
        const details =
          parserErrors[0]?.textContent?.replace(/\s+/g, " ").trim() ||
          xml.documentElement?.textContent?.replace(/\s+/g, " ").trim() ||
          "The browser XML parser reported a well-formedness error.";
        setError(`XML is not well-formed. ${details}`);
        setOutput("");
        setHasResult(false);
        return;
      }

      const formatted = formatXmlDocument(xml, input, indentUnit);
      setOutput(formatted.output);
      setPreservedElements(formatted.preservedElements);
      setInspection(inspectXml(xml));
      setError("");
      setHasResult(true);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unknown XML parsing error.";
      setError(`Unable to format this XML. ${message}`);
      setOutput("");
      setHasResult(false);
    }
  };

  const loadExample = () => {
    setInput(
      '<?xml version="1.0"?>\n<feed xmlns="urn:example"><title>Yoryantra</title><entry id="1"><name>Asha</name><note>Text with <b>inline</b> markup.</note></entry><!-- review me --></feed>'
    );
    setOutput("");
    setError("");
    setHasResult(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setHasResult(false);
    setPreservedElements(0);
    setInspection({
      root: "",
      elements: 0,
      attributes: 0,
      namespaces: 0,
      xmlSpacePreserve: 0,
    });
  };

  const outputLines = useMemo(
    () => (hasResult && output ? output.split("\n").length : 0),
    [hasResult, output]
  );

  return (
    <ToolShell
      title="XML Formatter"
      description="Pretty print well-formed XML while avoiding added indentation inside mixed text and xml:space-sensitive content."
    >
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            XML Input
          </label>
          <textarea
            className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
            placeholder="Paste XML here..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Indentation
          </label>
          <select
            value={indentMode}
            onChange={(event) => setIndentMode(event.target.value as IndentMode)}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Mixed text, CDATA/text-only elements, and <code>xml:space="preserve"</code> content are kept inline instead of receiving new indentation inside the element.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatXML} className="yoryantra-btn">
          Format XML
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 overflow-auto">
          {error}
        </div>
      )}

      {hasResult && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Root", inspection.root || "—"],
            ["Elements", inspection.elements.toLocaleString()],
            ["Attributes", inspection.attributes.toLocaleString()],
            ["Namespaces", inspection.namespaces.toLocaleString()],
            ["Output lines", outputLines.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
              <div className="mt-1 break-words text-sm font-semibold text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      )}

      {hasResult && (preservedElements > 0 || inspection.xmlSpacePreserve > 0) && (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-800">
          Conservative formatting kept {preservedElements.toLocaleString()} whitespace-sensitive or text-bearing element{preservedElements === 1 ? "" : "s"} inline. {inspection.xmlSpacePreserve > 0 ? `${inspection.xmlSpacePreserve.toLocaleString()} element${inspection.xmlSpacePreserve === 1 ? " uses" : "s use"} xml:space="preserve".` : ""}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Formatted XML</h3>
          {hasResult && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {hasResult ? output : "Formatted XML will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Privacy Note</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Parsing and formatting run in this browser. This page does not send your XML to a backend API.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Pretty printing XML can change whitespace, so the formatter is conservative
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            XML whitespace is not always decorative. Text-heavy and mixed-content elements can depend on spaces exactly where they appear, and <code>xml:space="preserve"</code> explicitly signals that applications should preserve whitespace. This formatter therefore adds indentation between element-oriented nodes but avoids injecting new whitespace inside text-only, mixed-content, CDATA-bearing, and preserved-space elements.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The output is intended for inspection and editing, not byte-for-byte canonicalization. Browser parsing and serialization can normalize lexical details such as attribute quote style, entity spelling, and line endings even when the parsed XML information remains equivalent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Well-formed XML is different from schema-valid XML
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The browser parser checks whether the document is well-formed: tags close correctly, attributes are quoted correctly, markup is syntactically usable, and the document can be parsed as XML. This tool does not validate the document against an XSD, DTD content model, RELAX NG schema, or application-specific rules. A document can therefore be well-formed and still be invalid for the system that consumes it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What the formatter keeps visible
          </h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <p>
              Comments, processing instructions, CDATA sections, namespaces, attributes, and document type nodes are kept in the parsed output. XML declarations are retained when present at the start of the pasted document. If your workflow depends on exact source bytes, entity-reference spelling, a complex internal DTD subset, or digital signatures over the XML text, do not run the document through a pretty printer before verification.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/xml-formatter" />
        </div>
      </section>
    </ToolShell>
  );
}
