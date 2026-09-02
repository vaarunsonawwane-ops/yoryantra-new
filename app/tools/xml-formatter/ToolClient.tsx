"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";

function escapeAttributeValue(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\"/g, "&quot;");
}

function openingTag(element: Element, selfClosing: boolean) {
  const attributes = Array.from(element.attributes)
    .map((attribute) => ` ${attribute.name}="${escapeAttributeValue(attribute.value)}"`)
    .join("");

  return `<${element.tagName}${attributes}${selfClosing ? "/>" : ">"}`;
}

function effectiveSpaceMode(element: Element, inherited: boolean) {
  const own = element.getAttributeNS(XML_NAMESPACE, "space");

  if (own === "preserve") return true;
  if (own === "default") return false;
  return inherited;
}

function formatNode(
  node: Node,
  depth: number,
  indentSize: number,
  serializer: XMLSerializer,
  preserveSpace: boolean
): string {
  const indent = " ".repeat(depth * indentSize);

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const preserve = effectiveSpaceMode(element, preserveSpace);
    const children = Array.from(element.childNodes);

    if (children.length === 0) {
      return `${indent}${openingTag(element, true)}`;
    }

    const hasMeaningfulText = children.some(
      (child) => child.nodeType === Node.TEXT_NODE && (child.nodeValue || "").trim() !== ""
    );
    const hasCdata = children.some((child) => child.nodeType === Node.CDATA_SECTION_NODE);
    const structuralChildren = children.filter(
      (child) => !(child.nodeType === Node.TEXT_NODE && (child.nodeValue || "").trim() === "")
    );

    // Mixed/text content and xml:space="preserve" are kept compact so the
    // formatter does not inject indentation into content where whitespace may matter.
    if (preserve || hasMeaningfulText || hasCdata || structuralChildren.length === 0) {
      return `${indent}${serializer.serializeToString(element)}`;
    }

    const body = structuralChildren
      .map((child) => formatNode(child, depth + 1, indentSize, serializer, preserve))
      .filter(Boolean)
      .join("\n");

    return `${indent}${openingTag(element, false)}\n${body}\n${indent}</${element.tagName}>`;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const value = node.nodeValue || "";
    return value.trim() ? `${indent}${value}` : "";
  }

  if (
    node.nodeType === Node.COMMENT_NODE ||
    node.nodeType === Node.PROCESSING_INSTRUCTION_NODE ||
    node.nodeType === Node.DOCUMENT_TYPE_NODE ||
    node.nodeType === Node.CDATA_SECTION_NODE
  ) {
    return `${indent}${serializer.serializeToString(node)}`;
  }

  return "";
}

function formatXMLDocument(source: string, document: XMLDocument, indentSize: number) {
  const serializer = new XMLSerializer();
  const declarationMatch = source.match(/^\s*(<\?xml\s+[\s\S]*?\?>)/i);
  const declaration = declarationMatch ? declarationMatch[1] : "";
  const lines = Array.from(document.childNodes)
    .map((node) => formatNode(node, 0, indentSize, serializer, false))
    .filter(Boolean);

  const body = lines.join("\n");
  return declaration ? `${declaration}\n${body}`.trim() : body.trim();
}

function getParserError(document: XMLDocument, parserErrorNamespace: string | null) {
  let errorNode: Element | null = null;

  if (parserErrorNamespace) {
    errorNode = document.getElementsByTagNameNS(parserErrorNamespace, "parsererror")[0] || null;
  } else {
    const candidates = Array.from(document.getElementsByTagName("parsererror"));
    errorNode =
      candidates.find((candidate) => {
        const namespace = candidate.namespaceURI || "";
        return (
          namespace.indexOf("parsererror") !== -1 ||
          namespace === "http://www.w3.org/1999/xhtml"
        );
      }) || null;
  }

  if (!errorNode) return "";

  const text = (errorNode.textContent || "Invalid XML")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 360 ? `${text.slice(0, 357)}...` : text;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [copyStatus, setCopyStatus] = useState("");

  const formatXML = () => {
    setError("");
    setCopyStatus("");

    if (!input.trim()) {
      setOutput("");
      setError("Paste an XML document before formatting.");
      return;
    }

    try {
      const parser = new DOMParser();
      const parserProbe = parser.parseFromString("<", "application/xml");
      const probeError = parserProbe.getElementsByTagName("parsererror")[0] || null;
      const parserErrorNamespace = probeError ? probeError.namespaceURI : null;
      const xml = parser.parseFromString(input, "application/xml");
      const parserError = getParserError(xml, parserErrorNamespace);

      if (parserError) {
        setOutput("");
        setError(`The XML is not well-formed. ${parserError}`);
        return;
      }

      setOutput(formatXMLDocument(input, xml, indentSize));
    } catch (caught) {
      setOutput("");
      setError(
        caught instanceof Error
          ? `Unable to format XML: ${caught.message}`
          : "Unable to format XML."
      );
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Copy failed. Select the output and copy it manually.");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopyStatus("");
    setIndentSize(2);
  };

  return (
    <ToolShell
      title="XML Formatter"
      description="Check XML well-formedness and pretty-print element-oriented XML while taking mixed content and xml:space into account."
    >
      <div>
        <label htmlFor="xml-indent" className="block mb-2 text-sm font-medium text-gray-700">
          Indentation
        </label>
        <select
          id="xml-indent"
          value={indentSize}
          onChange={(e) => {
            setIndentSize(Number(e.target.value));
            setOutput("");
            setError("");
            setCopyStatus("");
          }}
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-4">
          <label htmlFor="xml-input" className="text-sm font-medium text-gray-700">
            XML input
          </label>
          <span className="text-xs text-gray-500">{input.length.toLocaleString()} characters</span>
        </div>

        <textarea
          id="xml-input"
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder={'<users><user id="1"><name>Asha</name></user></users>'}
          value={input}
          spellCheck={false}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
            setError("");
            setCopyStatus("");
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={formatXML} className="yoryantra-btn">
          Format XML
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 overflow-auto"
        >
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Formatted XML</h3>
          {output && (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Formatted XML will appear here..."}
        </pre>

        {copyStatus && (
          <p aria-live="polite" className="mt-2 text-sm text-gray-600">
            {copyStatus}
          </p>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Privacy and parser boundary</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Parsing and formatting run in your browser with <code>DOMParser</code> and <code>XMLSerializer</code>; the text is not sent to a Yoryantra formatting API. This is a well-formedness check, not XSD/DTD validation or a security scanner. Avoid treating formatted output as trusted simply because it parsed successfully, and be cautious with very large or hostile XML because parsing happens on the browser&apos;s main thread.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Pretty-printing XML without pretending whitespace never matters</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML formatters usually insert line breaks and indentation between nested elements. That is convenient for API responses, sitemaps, SOAP envelopes, configuration documents, RSS/Atom feeds, and other element-oriented XML. But XML whitespace can be data. A formatter that blindly inserts spaces around every tag can change mixed-content documents such as prose, code, poetry, or elements using <code>xml:space=&quot;preserve&quot;</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This formatter first asks the browser&apos;s XML parser whether the document is well-formed. For elements that contain meaningful text, CDATA, or an inherited <code>xml:space=&quot;preserve&quot;</code> instruction, it keeps the subtree compact rather than injecting new indentation inside that content. Element-only structures are expanded using your selected 2- or 4-space indentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What “well-formed XML” means on this page</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The tool checks <strong>well-formedness</strong>: matching start/end tags, proper nesting, quoted attributes, legal entity/reference syntax, a single document element, and other rules enforced by the browser XML parser. It does <strong>not</strong> validate your document against an XSD, Relax NG schema, or application-specific contract.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For example, <code>&lt;order&gt;&lt;total&gt;abc&lt;/total&gt;&lt;/order&gt;</code> can be well-formed XML even if your application schema requires <code>total</code> to be numeric. Formatting cannot answer that schema question.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the formatter preserves and what it may normalize</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li><strong>Namespaces:</strong> element and attribute namespace information is parsed as XML and retained in the serialized structure.</li>
            <li><strong>Comments and processing instructions:</strong> these nodes are kept and indented when they occur in element-oriented content.</li>
            <li><strong>CDATA:</strong> CDATA-containing elements are left compact to avoid inserting whitespace into text content.</li>
            <li><strong>XML declaration:</strong> when the input begins with an XML declaration, the formatter keeps that declaration at the top.</li>
            <li><strong>Whitespace-only text between structural children:</strong> this is the whitespace that pretty-printing replaces with new indentation. If byte-for-byte or whitespace-node identity matters, do not use a beautifier as a round-trip serializer.</li>
            <li><strong>Lexical representation:</strong> quote style, empty-element spelling, entity spelling, and other equivalent surface details may be normalized by browser parsing/serialization even when the XML information represented is equivalent.</li>
            <li><strong>DTD-defined entities:</strong> browser parsing may resolve or normalize entity references before serialization. Do not use this formatter when preserving DTD/entity-reference spelling is part of the document contract.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Worked examples</h2>
          <div className="mt-4 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <div>
              <p className="font-medium text-gray-900">Element-oriented XML</p>
              <pre className="mt-2 whitespace-pre-wrap break-words">{`Input:
<users><user id="1"><name>Asha</name></user></users>

Formatted:
<users>
  <user id="1">
    <name>Asha</name>
  </user>
</users>`}</pre>
            </div>
            <div>
              <p className="font-medium text-gray-900">Mixed content</p>
              <pre className="mt-2 whitespace-pre-wrap break-words">{`<p>Hello <strong>world</strong>!</p>`}</pre>
              <p className="mt-2 leading-relaxed">The formatter does not split this sentence across indented lines, because added whitespace could become part of the text content.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Troubleshooting parser errors</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li><strong>Mismatched tags:</strong> XML is case-sensitive, so <code>&lt;Item&gt;&lt;/item&gt;</code> does not match.</li>
            <li><strong>Unescaped ampersands:</strong> literal <code>&amp;</code> inside text or attributes must normally be written as <code>&amp;amp;</code> unless it begins a valid entity/reference.</li>
            <li><strong>Multiple root elements:</strong> a document cannot contain two independent top-level elements such as <code>&lt;a/&gt;&lt;b/&gt;</code>.</li>
            <li><strong>HTML-style boolean attributes:</strong> XML requires attribute values, so <code>disabled</code> by itself is not valid XML syntax.</li>
            <li><strong>Unquoted attributes:</strong> write <code>id=&quot;1&quot;</code>, not <code>id=1</code>.</li>
            <li><strong>HTML entities:</strong> XML predefines only a small core set such as <code>&amp;amp;</code>, <code>&amp;lt;</code>, <code>&amp;gt;</code>, <code>&amp;quot;</code>, and <code>&amp;apos;</code> unless additional entities are declared.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Security, DTDs, and external data</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Formatting success is not a security guarantee. Server-side XML processors can have dangerous features such as external entity resolution, network access, schema loading, or application-specific entity processing depending on their configuration. A browser formatter cannot tell you that another runtime is hardened against XXE or resource-exhaustion attacks.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Treat untrusted XML according to the parser and platform that will actually consume it. Disable unnecessary external resource features there, set sensible input/resource limits, and validate expected structure separately. This page does not fetch an XSD or remote DTD to validate your document.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When formatting is useful—and when it is not</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Good fit</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
                <li>Inspecting minified SOAP or API responses.</li>
                <li>Reading XML sitemaps, RSS/Atom feeds, and config documents.</li>
                <li>Finding nesting mistakes after a parser reports an error.</li>
                <li>Preparing element-oriented XML for a code review or support ticket.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Use another check</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
                <li>XSD/DTD/schema validation.</li>
                <li>Canonical XML or digital-signature workflows.</li>
                <li>Byte-for-byte round trips where whitespace and lexical form must not change.</li>
                <li>Security testing of the XML parser used by your backend.</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards and primary references</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://www.w3.org/TR/xml/" target="_blank" rel="noreferrer">W3C — XML 1.0 (Fifth Edition)</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/API/DOMParser" target="_blank" rel="noreferrer">MDN — DOMParser</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer" target="_blank" rel="noreferrer">MDN — XMLSerializer</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/XML/Guides/Parsing_and_serializing_XML" target="_blank" rel="noreferrer">MDN — Parsing and serializing XML</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related tools</h2>
          <YoryantraRelatedTools currentHref="/tools/xml-formatter" />
        </div>
      </section>
    </ToolShell>
  );
}
