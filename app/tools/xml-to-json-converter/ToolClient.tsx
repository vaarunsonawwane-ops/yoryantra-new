"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type MappingMode = "compact" | "ordered";
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type XmlStats = {
  elements: number;
  attributes: number;
  cdata: number;
  comments: number;
  processingInstructions: number;
  mixedContentElements: number;
  hasDoctype: boolean;
};

type Result = {
  output: string;
  stats: XmlStats;
  mode: MappingMode;
};

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
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, "application/xml");
      const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
      if (parserError) throw new Error("The XML is not well-formed. Check mismatched tags, quoting, and entity references.");
      if (!xmlDoc.documentElement) throw new Error("No XML document element was found.");

      const stats = collectXmlStats(xmlDoc.documentElement, Boolean(xmlDoc.doctype));
      const mapped = mode === "compact"
        ? { [xmlDoc.documentElement.nodeName]: compactElement(xmlDoc.documentElement) }
        : { [xmlDoc.documentElement.nodeName]: orderedElement(xmlDoc.documentElement, ignoreIndentationWhitespace, false) };

      setResult({ output: JSON.stringify(mapped, null, 2), stats, mode });
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to convert this XML document.");
      setResult(null);
    }
  };

  const loadExample = () => {
    setInput(mode === "compact" ? compactExample : orderedExample);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setMode("compact");
    setIgnoreIndentationWhitespace(true);
    clearResult();
  };

  const copyOutput = async () => {
    if (!result?.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <ToolShell
      title="XML to JSON Converter"
      description="Convert well-formed XML using an explicit compact or ordered JSON mapping. Preserve attributes and qualified names, handle repeated elements, and choose ordered mode when mixed content or node order matters."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">XML Input</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste a complete XML document. Conversion parses XML structure; it is not XSD or DTD validity checking.
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
          className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Mapping Settings</h3>
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

          {mode === "ordered" ? (
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={ignoreIndentationWhitespace}
                onChange={(event: { target: { checked: boolean } }) => {
                  setIgnoreIndentationWhitespace(event.target.checked);
                  clearResult();
                }}
                className="h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
              />
              Ignore whitespace-only text nodes used for indentation
            </label>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              Compact mode groups repeated sibling elements into arrays, stores attributes under <code>@attributes</code>, and represents direct mixed text under <code>#text</code>.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={convert} className="yoryantra-btn">Convert to JSON</button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">{error}</div>
      ) : null}

      {result ? (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">JSON Output</h3>
                <p className="mt-1 text-sm text-gray-500">
                  XML text and attribute values remain strings; this tool does not guess numbers or booleans.
                </p>
              </div>
              <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>
            <pre className="mt-4 yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">{result.output}</pre>
          </div>

            <div className="space-y-4">
              <StatCard label="Mapping" value={result.mode === "compact" ? "Compact" : "Ordered"} />
              <StatCard label="Elements / attributes" value={`${result.stats.elements.toLocaleString()} / ${result.stats.attributes.toLocaleString()}`} />
              <StatCard label="CDATA / mixed content" value={`${result.stats.cdata.toLocaleString()} / ${result.stats.mixedContentElements.toLocaleString()}`} />
              <StatCard label="Comments / processing instructions" value={`${result.stats.comments.toLocaleString()} / ${result.stats.processingInstructions.toLocaleString()}`} />
            </div>
          </div>

          {result.mode === "compact" && result.stats.mixedContentElements > 0 ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              Mixed content was detected. Compact mode keeps the text and child values but cannot preserve their exact interleaving. Use Ordered node mapping when that sequence matters.
            </div>
          ) : null}

          {result.mode === "compact" && (result.stats.comments > 0 || result.stats.processingInstructions > 0) ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              Compact mode omits comments and processing instructions. Ordered mode represents them in <code>#children</code>.
            </div>
          ) : null}

          {result.stats.hasDoctype ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              A DOCTYPE declaration was detected. It participates in XML parsing but is not copied into this JSON mapping.
            </div>
          ) : null}
        </>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">XML to JSON Has No Single Lossless Standard Mapping</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            XML and JSON have different data models. XML can carry attributes, qualified names, comments, processing instructions, CDATA sections, and text interleaved with child elements. A converter therefore has to choose a mapping rather than pretending there is one universal JSON representation.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool makes that choice visible. Compact mode is convenient for API-style data. Ordered mode is safer when mixed content or child-node order matters because it stores nodes in a <code>#children</code> array instead of grouping everything by element name.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Compact Mapping Conventions</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Attributes are stored under <code>@attributes</code>, including namespace declaration attributes such as <code>xmlns</code>.</li>
            <li>Qualified element and attribute names keep their prefixes through the DOM <code>nodeName</code>.</li>
            <li>Repeated sibling elements with the same qualified name become arrays.</li>
            <li>Text-only elements become strings. Direct text in an element that also has child elements is stored under <code>#text</code>.</li>
            <li>CDATA contributes text in compact mode. Comments and processing instructions are not represented there.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ordered Mapping for Mixed Content</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            XML mixed content can interleave character data and child elements, so order can carry meaning. Ordered mode keeps attributes under <code>@attributes</code> and places text, elements, CDATA, comments, and processing instructions into <code>#children</code> in document order. Whitespace-only indentation nodes can be omitted for readability, but an inherited <code>xml:space=&quot;preserve&quot;</code> instruction is honored.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A document type declaration is parsed for well-formedness but is not copied into the JSON mapping. Entity references may already be resolved by the browser XML parser. If your workflow requires byte-for-byte XML fidelity, canonical XML, schema validation, or exact DTD semantics, conversion to JSON is the wrong representation step.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/xml-to-json-converter" />
        </div>
      </section>
    </ToolShell>
  );
}

function compactElement(element: Element): JsonValue {
  const attributes = attributesObject(element);
  const childElements = Array.from(element.children);
  const directTextNodes = Array.from(element.childNodes).filter(
    (node) => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE
  );
  const directText = directTextNodes.map((node) => node.nodeValue || "").join("");

  if (Object.keys(attributes).length === 0 && childElements.length === 0) return directText;

  const result: { [key: string]: JsonValue } = {};
  if (Object.keys(attributes).length > 0) result["@attributes"] = attributes;

  const meaningfulMixedText = childElements.length > 0
    ? directTextNodes.map((node) => node.nodeValue || "").filter((value) => value.trim().length > 0).join("")
    : directText;
  if (meaningfulMixedText.length > 0) result["#text"] = meaningfulMixedText;

  for (const child of childElements) {
    const key = child.nodeName;
    const mapped = compactElement(child);
    if (!Object.prototype.hasOwnProperty.call(result, key)) result[key] = mapped;
    else if (Array.isArray(result[key])) (result[key] as JsonValue[]).push(mapped);
    else result[key] = [result[key], mapped];
  }

  return result;
}

function orderedElement(
  element: Element,
  ignoreIndentationWhitespace: boolean,
  inheritedPreserveWhitespace: boolean
): JsonValue {
  const result: { [key: string]: JsonValue } = {};
  const attributes = attributesObject(element);
  if (Object.keys(attributes).length > 0) result["@attributes"] = attributes;

  const xmlSpace =
    element.getAttributeNS("http://www.w3.org/XML/1998/namespace", "space") ||
    element.getAttribute("xml:space");
  const preserveWhitespace =
    xmlSpace === "preserve" ? true : xmlSpace === "default" ? false : inheritedPreserveWhitespace;

  const children: JsonValue[] = [];
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      children.push({
        [child.nodeName]: orderedElement(child, ignoreIndentationWhitespace, preserveWhitespace),
      });
    } else if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue || "";
      if (!ignoreIndentationWhitespace || preserveWhitespace || value.trim().length > 0) {
        children.push({ "#text": value });
      }
    } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
      children.push({ "#cdata": node.nodeValue || "" });
    } else if (node.nodeType === Node.COMMENT_NODE) {
      children.push({ "#comment": node.nodeValue || "" });
    } else if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      const pi = node as ProcessingInstruction;
      children.push({ "#pi": { target: pi.target, data: pi.data } });
    }
  }

  if (children.length > 0) result["#children"] = children;
  return result;
}

function attributesObject(element: Element) {
  const attributes: { [key: string]: JsonValue } = {};
  for (const attribute of Array.from(element.attributes)) attributes[attribute.name] = attribute.value;
  return attributes;
}

function collectXmlStats(root: Element, hasDoctype: boolean): XmlStats {
  const stats: XmlStats = {
    elements: 0,
    attributes: 0,
    cdata: 0,
    comments: 0,
    processingInstructions: 0,
    mixedContentElements: 0,
    hasDoctype,
  };

  const visit = (element: Element) => {
    stats.elements += 1;
    stats.attributes += element.attributes.length;
    let hasElementChild = false;
    let hasMeaningfulText = false;

    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        hasElementChild = true;
        visit(node as Element);
      } else if (node.nodeType === Node.TEXT_NODE) {
        if ((node.nodeValue || "").trim().length > 0) hasMeaningfulText = true;
      } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
        stats.cdata += 1;
        if ((node.nodeValue || "").length > 0) hasMeaningfulText = true;
      } else if (node.nodeType === Node.COMMENT_NODE) stats.comments += 1;
      else if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) stats.processingInstructions += 1;
    }

    if (hasElementChild && hasMeaningfulText) stats.mixedContentElements += 1;
  };

  visit(root);
  return stats;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
