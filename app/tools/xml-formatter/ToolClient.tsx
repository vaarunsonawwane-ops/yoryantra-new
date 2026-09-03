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
    .map(
      (attribute) =>
        ` ${attribute.name}="${escapeAttributeValue(attribute.value)}"`
    )
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
      (child) =>
        child.nodeType === Node.TEXT_NODE &&
        (child.nodeValue || "").trim() !== ""
    );
    const hasCdata = children.some(
      (child) => child.nodeType === Node.CDATA_SECTION_NODE
    );
    const structuralChildren = children.filter(
      (child) =>
        !(
          child.nodeType === Node.TEXT_NODE &&
          (child.nodeValue || "").trim() === ""
        )
    );

    // Do not inject indentation into text/mixed content, CDATA, whitespace-only
    // content, or an xml:space="preserve" subtree.
    if (
      preserve ||
      hasMeaningfulText ||
      hasCdata ||
      structuralChildren.length === 0
    ) {
      return `${indent}${serializer.serializeToString(element)}`;
    }

    const body = structuralChildren
      .map((child) =>
        formatNode(child, depth + 1, indentSize, serializer, preserve)
      )
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

function formatXMLDocument(
  source: string,
  document: XMLDocument,
  indentSize: number
) {
  const serializer = new XMLSerializer();
  const declarationMatch = source.match(/^\s*(<\?xml\s+[\s\S]*?\?>)/);
  const declaration = declarationMatch ? declarationMatch[1] : "";
  const lines = Array.from(document.childNodes)
    .map((node) => formatNode(node, 0, indentSize, serializer, false))
    .filter(Boolean);

  const body = lines.join("\n");
  return declaration ? `${declaration}\n${body}`.trim() : body.trim();
}

function getParserError(
  document: XMLDocument,
  parserErrorNamespace: string | null
) {
  let errorNode: Element | null = null;

  if (parserErrorNamespace) {
    errorNode =
      document.getElementsByTagNameNS(parserErrorNamespace, "parsererror")[0] ||
      null;
  }

  if (!errorNode) {
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

function buildSerializationNote(source: string) {
  const notes: string[] = [];
  const declaration = source.match(/^\s*<\?xml\s+([\s\S]*?)\?>/);
  const encoding = declaration
    ? declaration[1].match(/\bencoding\s*=\s*(["'])([^"']+)\1/i)
    : null;

  if (/<!DOCTYPE\b/i.test(source)) {
    notes.push(
      "A DOCTYPE is present. Parsing and serializing can normalize DTD declarations and entity references, so do not treat the formatted text as a lexical or signature-preserving round trip."
    );
  }

  if (encoding) {
    notes.push(
      `The declaration says encoding=\"${encoding[2]}\", but pasted textarea content is already a JavaScript Unicode string. Formatting cannot recover or verify the original file bytes or character encoding.`
    );
  }

  return notes.join(" ");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [copyStatus, setCopyStatus] = useState("");

  const formatXML = () => {
    setError("");
    setNote("");
    setCopyStatus("");

    if (!input.trim()) {
      setOutput("");
      setError("Paste an XML document before formatting.");
      return;
    }

    try {
      const parser = new DOMParser();
      const parserProbe = parser.parseFromString("<", "application/xml");
      const probeError =
        parserProbe.getElementsByTagName("parsererror")[0] || null;
      const parserErrorNamespace = probeError ? probeError.namespaceURI : null;
      const xml = parser.parseFromString(input, "application/xml");
      const parserError = getParserError(xml, parserErrorNamespace);

      if (parserError) {
        setOutput("");
        setError(`The XML is not well-formed. ${parserError}`);
        return;
      }

      setOutput(formatXMLDocument(input, xml, indentSize));
      setNote(buildSerializationNote(input));
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
    setNote("");
    setCopyStatus("");
    setIndentSize(2);
  };

  return (
    <ToolShell
      title="XML Formatter"
      description={'Check XML well-formedness and indent element-oriented XML without blindly inserting whitespace into mixed content or xml:space="preserve" subtrees.'}
    >
      <div>
        <label
          htmlFor="xml-indent"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Indentation
        </label>
        <select
          id="xml-indent"
          value={indentSize}
          onChange={(event) => {
            setIndentSize(Number(event.target.value));
            setOutput("");
            setError("");
            setNote("");
            setCopyStatus("");
          }}
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
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
          <span className="text-xs text-gray-500">
            {input.length.toLocaleString()} characters
          </span>
        </div>

        <textarea
          id="xml-input"
          className="min-h-[260px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder={'<users><user id="1"><name>Sneha</name></user></users>'}
          value={input}
          spellCheck={false}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setNote("");
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

      {error ? (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
        >
          {error}
        </div>
      ) : null}

      {note ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-700">
          {note}
        </div>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Formatted XML</h3>
          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          ) : null}
        </div>

        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Formatted XML will appear here..."}
        </pre>

        {copyStatus ? (
          <p aria-live="polite" className="mt-2 text-sm text-gray-600">
            {copyStatus}
          </p>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Formatting can change whitespace and lexical spelling
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Parsing happens in the browser with <code>DOMParser</code>, and DOM nodes are
          serialized with <code>XMLSerializer</code>. No request to an XML endpoint is
          made by the page code. Successful parsing proves well-formedness only; it
          does not prove schema validity, signature validity, trust, or safety in the
          server-side XML parser that will eventually consume the document.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Pretty indentation is safe only when the inserted whitespace is not data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Element-oriented XML is easy to read when nested elements start on their
            own lines. Mixed content is different. In
            <code> &lt;p&gt;Hello &lt;strong&gt;world&lt;/strong&gt;!&lt;/p&gt;</code>, inserting
            line breaks around <code>&lt;strong&gt;</code> can change the text seen by an
            application.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Elements containing meaningful text, CDATA, whitespace-only content, or
            an inherited <code>xml:space=&quot;preserve&quot;</code> instruction are therefore
            kept compact. The 2- or 4-space indentation is applied to structural,
            element-oriented subtrees instead of being forced through every node.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Well-formed does not mean valid for your application
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML well-formedness covers syntax such as matching start and end tags,
            proper nesting, quoted attributes, legal references, and one document
            element. A document can satisfy all of those rules and still violate an
            XSD, DTD validity constraint, or an application contract.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For example,
            <code> &lt;order&gt;&lt;total&gt;abc&lt;/total&gt;&lt;/order&gt;</code> is structurally
            plausible XML even if the receiving system requires <code>total</code> to
            be numeric. Formatting cannot answer that data-model question.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What survives the DOM round trip, and what may look different
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li><strong>Element and attribute names:</strong> the parsed DOM keeps namespace information, but serialization may alter an equivalent namespace prefix arrangement.</li>
            <li><strong>Comments and processing instructions:</strong> they remain nodes and are retained in structural output.</li>
            <li><strong>CDATA:</strong> a CDATA-containing element stays compact so indentation is not injected into its text.</li>
            <li><strong>XML declaration:</strong> an initial declaration is kept as written at the top, but its encoding label cannot verify the bytes that existed before the text was pasted into the browser.</li>
            <li><strong>Whitespace-only nodes:</strong> structural indentation can replace them when the subtree is treated as element-oriented.</li>
            <li><strong>Lexical details:</strong> quote style, empty-element spelling, attribute normalization, namespace prefixes, and entity spelling are not guaranteed to round-trip byte for byte.</li>
            <li><strong>DOCTYPE/entity spelling:</strong> parsing and serialization may normalize declarations or resolved entity content, so canonicalization and signature work need purpose-built XML tooling.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Element-only data and mixed content need different treatment
          </h2>
          <div className="mt-4 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900">Element-oriented input</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">{`Input:
<users><user id="1"><name>Sneha</name></user></users>

Formatted:
<users>
  <user id="1">
    <name>Sneha</name>
  </user>
</users>`}</pre>
            </div>
            <div>
              <p className="font-medium text-gray-900">Mixed content</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">{`<p>Hello <strong>world</strong>!</p>`}</pre>
              <p className="mt-2 leading-relaxed">
                The sentence remains compact because new indentation between the text
                and <code>&lt;strong&gt;</code> could become part of the content.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Most parser failures come from a small set of XML rules
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li><strong>Case matters:</strong> <code>&lt;Item&gt;&lt;/item&gt;</code> has mismatched element names.</li>
            <li><strong>Ampersands introduce references:</strong> a literal ampersand normally needs <code>&amp;amp;</code>.</li>
            <li><strong>Attributes need quoted values:</strong> write <code>id=&quot;1&quot;</code>, not <code>id=1</code>.</li>
            <li><strong>HTML boolean-attribute syntax does not carry over:</strong> XML cannot use a bare attribute such as <code>disabled</code>.</li>
            <li><strong>There is one document element:</strong> <code>&lt;a/&gt;&lt;b/&gt;</code> is not one well-formed XML document.</li>
            <li><strong>Only five entities are predefined by XML itself:</strong> <code>&amp;amp;</code>, <code>&amp;lt;</code>, <code>&amp;gt;</code>, <code>&amp;quot;</code>, and <code>&amp;apos;</code>. Other named entities need declarations.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A browser parse says nothing about how a backend handles external XML features
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Different server-side parsers can enable external entities, schema loading,
            network access, or other features that are unrelated to pretty-printing.
            A document that formats cleanly here has not been tested for XXE resistance,
            expansion limits, schema trust, or the configuration of another runtime.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Keep resource limits and external-resource policy in the parser that will
            actually consume untrusted XML. Do not move a parsed DOM into an active HTML
            document and assume formatting has sanitized its elements or attributes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The XML specification explains why whitespace needs care
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The{" "}
            <a
              href="https://www.w3.org/TR/xml/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              W3C XML 1.0 specification
            </a>{" "}
            defines well-formedness and says processors pass non-markup characters to
            applications. It also defines <code>xml:space</code> as the signal for
            preserving whitespace intent. Browser-side parsing and serialization are
            documented by{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              DOMParser.parseFromString()
            </a>{" "}
            and{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer/serializeToString"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              XMLSerializer.serializeToString()
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where a formatter should stop
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>XSD, Relax NG, DTD validity, or application-schema checking.</li>
            <li>Canonical XML and digital-signature byte-for-byte workflows.</li>
            <li>Verifying an XML declaration&apos;s encoding against original file bytes.</li>
            <li>Testing the security configuration of a backend XML parser.</li>
            <li>Preserving every lexical choice, entity reference, prefix, or whitespace node exactly as typed.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When XML needs more than formatting
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/xml-formatter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
