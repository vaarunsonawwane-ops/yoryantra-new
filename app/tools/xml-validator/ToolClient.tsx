"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type XmlIssue = {
  level: "Error" | "Note";
  message: string;
};

type XmlReport = {
  wellFormed: boolean;
  rootName: string;
  rootNamespace: string;
  elementCount: number;
  attributeCount: number;
  namespaces: string[];
  doctype: string;
  issues: XmlIssue[];
};

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="https://example.com/catalog">
  <book id="bk101">
    <title>Yoryantra XML Guide</title>
    <price currency="USD">19.99</price>
  </book>
</catalog>`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleXml);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!input.trim()) {
      setError("Paste XML content to check.");
      setOutput("");
      return;
    }

    try {
      const report = inspectXml(input);
      setOutput(formatXmlReport(report));
      setError("");
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Unable to inspect this XML.");
    }
  };

  const resetAll = () => {
    setInput(sampleXml);
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="XML Validator"
      description="Check XML well-formedness in the browser, inspect the root element, namespaces, attributes, and DOCTYPE, and distinguish parsing from DTD or XSD validation."
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          XML input
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => setInput(event.target.value)}
          rows={15}
          placeholder={sampleXml}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Useful for XML API responses, feeds, sitemaps, configuration, exports,
          SVG/XML fragments promoted to documents, and other XML text.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validate} className="yoryantra-btn">
          Check XML
        </button>
        <button
          onClick={() => {
            setInput(sampleXml);
            setOutput("");
            setError("");
          }}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            XML report
          </h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output mt-3 min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "XML well-formedness results will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Well-formed XML and valid XML are different checks
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            XML 1.0 calls a document well-formed when its syntax and nesting obey
            the XML well-formedness rules. A document is “valid” in the stricter
            XML sense only when it also satisfies declared constraints such as a
            DTD. XSD validation is another schema-level check.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool uses the browser XML parser to check well-formedness and
            inspect the parsed document. It does not claim DTD or XSD validity.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What the report includes
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Parser errors for malformed XML.</li>
            <li>The root element and its namespace URI.</li>
            <li>Total element and attribute counts.</li>
            <li>Distinct namespace URIs used by parsed elements and attributes.</li>
            <li>DOCTYPE presence with a reminder that schema/DTD validity is not checked here.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Terminology follows the{" "}
            <a href="https://www.w3.org/TR/xml/" target="_blank" rel="noreferrer" className="font-medium underline">
              W3C XML 1.0 specification
            </a>
            . Parsing is local in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/xml-validator" />
        </div>
      </section>
    </ToolShell>
  );
}

function inspectXml(source: string): XmlReport {
  if (typeof window === "undefined") {
    throw new Error("XML parsing must run in the browser.");
  }

  const document = new DOMParser().parseFromString(source, "application/xml");
  const parserError = findParserError(document);

  if (parserError) {
    return {
      wellFormed: false,
      rootName: "",
      rootNamespace: "",
      elementCount: 0,
      attributeCount: 0,
      namespaces: [],
      doctype: "",
      issues: [
        {
          level: "Error",
          message: cleanParserError(parserError.textContent || "Malformed XML."),
        },
      ],
    };
  }

  const root = document.documentElement;
  if (!root) {
    return {
      wellFormed: false,
      rootName: "",
      rootNamespace: "",
      elementCount: 0,
      attributeCount: 0,
      namespaces: [],
      doctype: "",
      issues: [{ level: "Error", message: "No XML document element was found." }],
    };
  }

  const elements = Array.from(document.getElementsByTagName("*"));
  let attributeCount = 0;
  const namespaces = new Set<string>();

  elements.forEach((element) => {
    if (element.namespaceURI) namespaces.add(element.namespaceURI);
    attributeCount += element.attributes.length;

    Array.from(element.attributes).forEach((attribute) => {
      if (
        attribute.namespaceURI &&
        attribute.namespaceURI !== "http://www.w3.org/2000/xmlns/"
      ) {
        namespaces.add(attribute.namespaceURI);
      }
    });
  });

  const issues: XmlIssue[] = [];
  const doctype = document.doctype?.name || "";

  if (doctype) {
    issues.push({
      level: "Note",
      message:
        `DOCTYPE "${doctype}" is present. This browser check does not certify DTD validity or verify external schema resources.`,
    });
  }

  if (/xsi:(?:schemaLocation|noNamespaceSchemaLocation)\s*=/.test(source)) {
    issues.push({
      level: "Note",
      message:
        "An XML Schema location hint is present. The referenced XSD is not loaded or validated by this tool.",
    });
  }

  return {
    wellFormed: true,
    rootName: root.tagName,
    rootNamespace: root.namespaceURI || "",
    elementCount: elements.length,
    attributeCount,
    namespaces: Array.from(namespaces).sort(),
    doctype,
    issues,
  };
}

function findParserError(document: Document) {
  const direct = document.getElementsByTagName("parsererror");
  if (direct.length) return direct[0];

  const namespaced = document.getElementsByTagNameNS("*", "parsererror");
  return namespaced.length ? namespaced[0] : null;
}

function formatXmlReport(report: XmlReport) {
  if (!report.wellFormed) {
    return [
      "XML check failed.",
      "",
      "Status: Not well-formed",
      "",
      ...report.issues.map((issue, index) => `${index + 1}. ${issue.level}: ${issue.message}`),
    ].join("\n");
  }

  const lines = [
    "XML check completed.",
    "",
    "Status: Well-formed XML",
    `Root element: ${report.rootName}`,
    `Root namespace: ${report.rootNamespace || "None"}`,
    `Elements: ${report.elementCount}`,
    `Attributes: ${report.attributeCount}`,
    `Namespace URIs: ${report.namespaces.length ? report.namespaces.join(", ") : "None"}`,
    `DOCTYPE: ${report.doctype || "None"}`,
    "",
    "Notes:",
  ];

  if (!report.issues.length) {
    lines.push("No additional structural notes.");
  } else {
    report.issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
    });
  }

  lines.push("");
  lines.push("Scope: XML well-formedness and parsed structure only; not DTD/XSD validity.");

  return lines.join("\n");
}

function cleanParserError(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace("This page contains the following errors:", "")
    .trim();
}
