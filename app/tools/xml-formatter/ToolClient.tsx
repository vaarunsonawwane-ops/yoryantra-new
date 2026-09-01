"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type IndentMode = "2" | "4" | "tab";

type Inspection = {
  root: string;
  elements: number;
  attributes: number;
  namespaces: number;
  comments: number;
  cdataSections: number;
  processingInstructions: number;
  xmlSpacePreserve: number;
  hasDoctype: boolean;
  hasDeclaration: boolean;
  declaredEncoding: string;
};

type FormatResult = {
  output: string;
  preservedElements: number;
  inspection: Inspection;
  warnings: string[];
};

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_TYPE_NODE = 10;
const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";

const exampleXml =
  '<?xml version="1.0"?>\n<feed xmlns="urn:example"><title>Yoryantra</title><entry id="1"><name>Asha</name><note>Text with <b>inline</b> markup.</note></entry><!-- review me --></feed>';

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [indentMode, setIndentMode] = useState<IndentMode>("2");
  const [result, setResult] = useState<FormatResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const indentUnit =
    indentMode === "tab" ? "\t" : " ".repeat(Number(indentMode));

  const outputLines = useMemo(
    () =>
      result && result.output
        ? result.output.split("\n").length
        : 0,
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const formatXml = () => {
    if (!input.trim()) {
      setError("Paste an XML document to format.");
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(input, "application/xml");
      const parserError = getParserError(parser, xml);

      if (parserError) {
        setError(`XML is not well-formed. ${parserError}`);
        setResult(null);
        setCopied(false);
        return;
      }

      const formatted = formatXmlDocument(xml, input, indentUnit);
      const inspection = inspectXml(xml, input);
      const warnings = buildWarnings(
        formatted.preservedElements,
        inspection
      );

      setResult({
        output: formatted.output,
        preservedElements: formatted.preservedElements,
        inspection,
        warnings,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unknown XML parsing error.";

      setError(`Unable to format this XML. ${message}`);
      setResult(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The formatted XML could not be copied. Select and copy it manually."
      );
    }
  };

  const loadExample = () => {
    setInput(exampleXml);
    setIndentMode("2");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setIndentMode("2");
    clearResult();
  };

  return (
    <ToolShell
      title="XML Formatter"
      description="Pretty print well-formed XML while conservatively preserving text-only, mixed-content, CDATA, and xml:space-sensitive elements where added indentation could change character data."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              XML Input
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste one XML document. The browser parser checks
              well-formedness before formatting.
            </p>

            <textarea
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                clearResult();
              }}
              placeholder={exampleXml}
              spellCheck={false}
              className="mt-4 w-full min-h-[360px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <YoryantraSelect
              label="Indentation"
              value={indentMode}
              onChange={(value) => {
                setIndentMode(value as IndentMode);
                clearResult();
              }}
              options={[
                { label: "2 spaces", value: "2" },
                { label: "4 spaces", value: "4" },
                { label: "Tab", value: "tab" },
              ]}
            />

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              Text-only, mixed-content, CDATA-bearing, and{" "}
              <code>xml:space=&quot;preserve&quot;</code> elements are kept
              inline instead of receiving new whitespace inside the element.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={formatXml} className="yoryantra-btn">
          Format XML
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Root"
              value={result.inspection.root || "—"}
            />
            <StatCard
              label="Elements"
              value={result.inspection.elements.toLocaleString()}
            />
            <StatCard
              label="Attributes"
              value={result.inspection.attributes.toLocaleString()}
            />
            <StatCard
              label="Namespaces"
              value={result.inspection.namespaces.toLocaleString()}
            />
            <StatCard
              label="Output lines"
              value={outputLines.toLocaleString()}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Comments"
              value={result.inspection.comments.toLocaleString()}
            />
            <StatCard
              label="CDATA"
              value={result.inspection.cdataSections.toLocaleString()}
            />
            <StatCard
              label="Processing instructions"
              value={result.inspection.processingInstructions.toLocaleString()}
            />
            <StatCard
              label="DOCTYPE"
              value={result.inspection.hasDoctype ? "Present" : "None"}
            />
          </div>

          {result.warnings.length > 0 ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                Formatting review notes
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-amber-800">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Formatted XML
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  The result is intended for inspection and editing, not
                  canonical XML or byte-for-byte preservation.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline text-sm"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="mt-4 yoryantra-output min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {result.output}
            </pre>
          </div>
        </>
      ) : (
        <div className="mt-8 yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Formatted XML will appear here.
        </div>
      )}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser-local parsing and formatting
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          This tool does not send the pasted XML to a backend formatting API.
          Parsing and serialization use browser XML APIs. Site-wide analytics
          or advertising scripts, if enabled by the website, are separate from
          this formatting operation.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Pretty Printing XML Can Change Character Data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML whitespace is not always decoration. In element-only data,
            indentation is often used only to make the tree readable. In
            text-heavy or mixed content, however, a space or line break can be
            part of the actual character data. Blindly inserting a newline
            before every child element can therefore change what an
            application sees.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Yoryantra takes a conservative approach: it adds indentation around
            element-oriented structure but keeps text-only, mixed-content,
            CDATA-bearing, and <code>xml:space=&quot;preserve&quot;</code>{" "}
            elements inline. That produces less aggressive pretty printing,
            but it reduces the chance of inventing whitespace inside
            text-sensitive content.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            xml:space Is a Signal, Not a General Pretty-Print Switch
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML defines <code>xml:space</code> values such as{" "}
            <code>preserve</code> and <code>default</code> so applications can
            communicate whitespace-handling intent. This formatter treats
            <code>preserve</code> conservatively and avoids injecting
            indentation inside that element. Application-specific whitespace
            semantics can still go beyond what a generic formatter can infer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Well-Formed XML Is Different from Schema-Valid XML
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The browser parser checks whether the XML can be parsed as a
            well-formed document: markup is structurally valid, tags and
            attributes obey XML syntax, and there is an acceptable document
            element. This page does not validate the result against XSD, a DTD
            content model, RELAX NG, Schematron, or your application&apos;s
            business rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A document can therefore format successfully and still be invalid
            for the service, feed reader, SOAP endpoint, configuration loader,
            or schema that consumes it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Formatting Preserves Structure, Not Original XML Spelling
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The XML is parsed into a DOM and serialized again. That round trip
            can normalize lexical details even when the parsed information is
            equivalent. Entity-reference spelling can become ordinary
            characters, attribute quote style can change, empty-element syntax
            can change, and line endings can be normalized. Attribute order
            should not be treated as semantic XML data.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The formatter preserves the source XML declaration when one is
            detected at the beginning and attempts to preserve the original
            DOCTYPE text, including an internal subset. Those conveniences do
            not turn the output into a byte-preserving transformation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Declared Encoding Does Not Re-Decode Pasted Browser Text
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            By the time XML is pasted into this page it is already a JavaScript
            Unicode string. An XML declaration such as{" "}
            <code>encoding=&quot;ISO-8859-1&quot;</code> describes an external
            byte representation; it cannot make the browser reinterpret the
            characters already present in the textarea. To diagnose a real
            byte-encoding problem, inspect the original file or HTTP response
            before it is converted into browser text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            DOCTYPE and Entity Handling Needs Extra Care
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A DOCTYPE can contain declarations and entity definitions, and XML
            parsers outside the browser can have very different policies for
            external resources and entities. This formatter is not an XXE
            scanner and does not predict how a server-side Java, .NET, libxml,
            PHP, Python, or other XML parser is configured. Do not use a clean
            browser formatting result as proof that an untrusted XML document
            is safe for another parser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Do Not Pretty Print Signed or Canonicalization-Sensitive XML
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML digital signatures and other workflows can depend on
            canonicalization rules rather than visual formatting. This tool is
            not a Canonical XML implementation. If signatures, hashes,
            canonical byte sequences, or exact source comparison matter, work
            with the required canonicalization/signature tooling instead of a
            generic pretty printer.
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
                href="https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                MDN — XMLSerializer
              </a>
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

function getParserError(
  parser: DOMParser,
  documentNode: Document
) {
  const probe = parser.parseFromString(
    "<yoryantra-freeze-probe>",
    "application/xml"
  );

  const probeRoot = probe.documentElement;
  const resultRoot = documentNode.documentElement;

  if (!probeRoot || !resultRoot) return "";

  const sameErrorDocumentShape =
    resultRoot.localName === probeRoot.localName &&
    resultRoot.namespaceURI === probeRoot.namespaceURI;

  if (!sameErrorDocumentShape) return "";

  return (
    resultRoot.textContent?.replace(/\s+/g, " ").trim() ||
    "The browser XML parser reported a well-formedness error."
  );
}

function formatXmlDocument(
  documentNode: Document,
  source: string,
  indentUnit: string
) {
  const serializer = new XMLSerializer();
  const originalDoctype = extractDoctypeSource(source);
  const declaration = extractXmlDeclaration(source);
  let doctypeUsed = false;
  let preservedElements = 0;

  const serializeInlineElement = (element: Element): string => {
    const children = Array.from(element.childNodes);

    if (children.length === 0) {
      return elementEmptyTag(element);
    }

    const contents = children
      .map((child) => {
        if (child.nodeType === ELEMENT_NODE) {
          return serializeInlineElement(child as Element);
        }

        return serializer.serializeToString(child);
      })
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

      const preserve = shouldPreserveElementLayout(
        element,
        inheritedPreserve
      );

      if (preserve) {
        preservedElements += 1;
        return [`${indent}${serializeInlineElement(element)}`];
      }

      const meaningfulChildren = children.filter((child) => {
        return !(
          child.nodeType === TEXT_NODE &&
          (child.nodeValue || "").trim() === ""
        );
      });

      if (meaningfulChildren.length === 0) {
        return [`${indent}${serializeInlineElement(element)}`];
      }

      const lines = [`${indent}${elementStartTag(element)}`];

      meaningfulChildren.forEach((child) => {
        lines.push(...formatNode(child, depth + 1, false));
      });

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
      const value = node.nodeValue || "";

      return value.trim()
        ? [`${indent}${serializer.serializeToString(node)}`]
        : [];
    }

    return [];
  };

  const lines: string[] = declaration ? [declaration] : [];

  Array.from(documentNode.childNodes).forEach((child) => {
    lines.push(...formatNode(child, 0, false));
  });

  return {
    output: lines.join("\n"),
    preservedElements,
  };
}

function shouldPreserveElementLayout(
  element: Element,
  inheritedPreserve: boolean
) {
  const xmlSpace =
    element.getAttributeNS(XML_NAMESPACE, "space") ||
    element.getAttribute("xml:space") ||
    "";

  let preserveSpace = inheritedPreserve;

  if (xmlSpace === "preserve") {
    preserveSpace = true;
  } else if (xmlSpace === "default") {
    preserveSpace = false;
  }

  const children = Array.from(element.childNodes);
  const hasElement = children.some(
    (child) => child.nodeType === ELEMENT_NODE
  );
  const hasSignificantText = children.some((child) => {
    return (
      child.nodeType === CDATA_SECTION_NODE ||
      (child.nodeType === TEXT_NODE &&
        (child.nodeValue || "").trim() !== "")
    );
  });

  return (
    preserveSpace ||
    (hasElement && hasSignificantText) ||
    (!hasElement && hasSignificantText)
  );
}

function elementStartTag(element: Element) {
  const attributes = Array.from(element.attributes)
    .map((attribute) => {
      return `${attribute.name}="${escapeAttributeValue(attribute.value)}"`;
    })
    .join(" ");

  return `<${element.tagName}${attributes ? ` ${attributes}` : ""}>`;
}

function elementEmptyTag(element: Element) {
  const attributes = Array.from(element.attributes)
    .map((attribute) => {
      return `${attribute.name}="${escapeAttributeValue(attribute.value)}"`;
    })
    .join(" ");

  return `<${element.tagName}${attributes ? ` ${attributes}` : ""}/>`;
}

function escapeAttributeValue(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/\t/g, "&#9;")
    .replace(/\n/g, "&#10;")
    .replace(/\r/g, "&#13;");
}

function extractXmlDeclaration(source: string) {
  const withoutBom =
    source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;

  const match = withoutBom.match(/^(<\?xml[\s\S]*?\?>)/);
  return match ? match[1] : "";
}

function extractDoctypeSource(source: string) {
  let index = 0;

  while (index < source.length) {
    if (source.startsWith("<!--", index)) {
      const end = source.indexOf("-->", index + 4);
      if (end === -1) return "";
      index = end + 3;
      continue;
    }

    if (source.startsWith("<?", index)) {
      const end = source.indexOf("?>", index + 2);
      if (end === -1) return "";
      index = end + 2;
      continue;
    }

    if (source.startsWith("<!DOCTYPE", index)) {
      return readDoctypeAt(source, index);
    }

    if (source[index] === "<" && !/\s/.test(source[index + 1] || "")) {
      if (
        source.startsWith("<![CDATA[", index) ||
        source.startsWith("<!", index)
      ) {
        index += 2;
        continue;
      }

      return "";
    }

    index += 1;
  }

  return "";
}

function readDoctypeAt(source: string, start: number) {
  let quote = "";
  let subsetDepth = 0;
  let inComment = false;

  for (let index = start; index < source.length; index += 1) {
    if (inComment) {
      if (source.startsWith("-->", index)) {
        inComment = false;
        index += 2;
      }
      continue;
    }

    if (!quote && source.startsWith("<!--", index)) {
      inComment = true;
      index += 3;
      continue;
    }

    const character = source[index];

    if (quote) {
      if (character === quote) {
        quote = "";
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === "[") {
      subsetDepth += 1;
      continue;
    }

    if (character === "]" && subsetDepth > 0) {
      subsetDepth -= 1;
      continue;
    }

    if (character === ">" && subsetDepth === 0) {
      return source.slice(start, index + 1);
    }
  }

  return "";
}

function inspectXml(
  documentNode: Document,
  source: string
): Inspection {
  const elements = Array.from(
    documentNode.getElementsByTagName("*")
  );
  const namespaces = new Set<string>();
  let attributes = 0;
  let xmlSpacePreserve = 0;

  elements.forEach((element) => {
    attributes += element.attributes.length;

    if (element.namespaceURI) {
      namespaces.add(element.namespaceURI);
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (
        attribute.name === "xmlns" ||
        attribute.name.startsWith("xmlns:")
      ) {
        namespaces.add(attribute.value);
      }
    });

    const xmlSpace =
      element.getAttributeNS(XML_NAMESPACE, "space") ||
      element.getAttribute("xml:space");

    if (xmlSpace === "preserve") {
      xmlSpacePreserve += 1;
    }
  });

  const allNodes = collectNodes(documentNode);
  const declaration = extractXmlDeclaration(source);

  return {
    root: documentNode.documentElement?.tagName || "",
    elements: elements.length,
    attributes,
    namespaces: namespaces.size,
    comments: allNodes.filter(
      (node) => node.nodeType === COMMENT_NODE
    ).length,
    cdataSections: allNodes.filter(
      (node) => node.nodeType === CDATA_SECTION_NODE
    ).length,
    processingInstructions: allNodes.filter(
      (node) => node.nodeType === PROCESSING_INSTRUCTION_NODE
    ).length,
    xmlSpacePreserve,
    hasDoctype: Boolean(documentNode.doctype),
    hasDeclaration: Boolean(declaration),
    declaredEncoding: readDeclaredEncoding(declaration),
  };
}

function collectNodes(root: Node) {
  const nodes: Node[] = [];

  const visit = (node: Node) => {
    nodes.push(node);
    Array.from(node.childNodes).forEach(visit);
  };

  Array.from(root.childNodes).forEach(visit);
  return nodes;
}

function readDeclaredEncoding(declaration: string) {
  if (!declaration) return "";

  const match = declaration.match(
    /\bencoding\s*=\s*(["'])([^"']+)\1/i
  );

  return match ? match[2] : "";
}

function buildWarnings(
  preservedElements: number,
  inspection: Inspection
) {
  const warnings: string[] = [];

  if (preservedElements > 0) {
    warnings.push(
      `Conservative formatting kept ${preservedElements.toLocaleString()} text-bearing or whitespace-sensitive element${
        preservedElements === 1 ? "" : "s"
      } inline instead of adding indentation inside them.`
    );
  }

  if (inspection.xmlSpacePreserve > 0) {
    warnings.push(
      `${inspection.xmlSpacePreserve.toLocaleString()} element${
        inspection.xmlSpacePreserve === 1 ? " uses" : "s use"
      } xml:space="preserve". The formatter avoids adding internal whitespace to those preserved regions.`
    );
  }

  if (inspection.hasDoctype) {
    warnings.push(
      "A DOCTYPE is present. The formatter preserves its source text when possible, but parsed entity text and browser DOM behavior are not a byte-for-byte representation of the original XML source."
    );
  }

  if (
    inspection.declaredEncoding &&
    inspection.declaredEncoding.toLowerCase() !== "utf-8" &&
    inspection.declaredEncoding.toLowerCase() !== "utf8"
  ) {
    warnings.push(
      `The XML declaration says encoding="${inspection.declaredEncoding}". Pasted textarea content is already a browser Unicode string, so this tool cannot re-decode the original bytes according to that declaration.`
    );
  }

  return warnings;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
