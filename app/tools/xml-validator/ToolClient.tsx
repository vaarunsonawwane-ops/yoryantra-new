"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type XMLIssue = {
  level: "Error" | "Warning" | "Suggestion";
  message: string;
};

type XMLReport = {
  valid: boolean;
  rootElement: string;
  totalElements: number;
  uniqueTags: string[];
  issues: XMLIssue[];
};

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <title>Yoryantra XML Guide</title>
    <author>Yoryantra</author>
    <price>19.99</price>
  </book>
  <book id="bk102">
    <title>Working With Data</title>
    <author>Example Author</author>
    <price>24.50</price>
  </book>
</catalog>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateXml = () => {
    if (!input.trim()) {
      setError("Please enter XML content to validate.");
      setOutput("");
      return;
    }

    try {
      const report = analyzeXml(input);
      setOutput(formatReport(report));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to validate this XML.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleXml);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="XML Validator"
      description="Validate XML syntax, check XML structure, inspect tags, and find XML parsing errors directly in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          XML Input
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleXml}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste XML from an API response, sitemap, feed, configuration file, or
          data export.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateXml} className="yoryantra-btn">
          Validate XML
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Validation Result
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "XML validation result will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking XML Syntax Before Using Data Files
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            XML is still used in sitemaps, RSS feeds, API responses, data
            exports, configuration files, SOAP payloads, and integration
            workflows. A missing closing tag, invalid character, or broken
            nesting structure can make XML fail to parse.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This XML Validator helps you validate XML syntax, check XML
            structure, find parsing errors, inspect the root element, and review
            common XML issues directly in your browser before using the file in
            code, SEO checks, or data workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Validating XML Structure in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste XML content into the input box.</li>
            <li>
              Click <strong>Validate XML</strong>.
            </li>
            <li>Review syntax errors, root element details, and tag counts.</li>
            <li>Fix broken XML before using it in APIs, feeds, or tools.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common XML Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking XML API responses before parsing them in code.</li>
            <li>Validating sitemap XML before submitting or publishing.</li>
            <li>Reviewing RSS or Atom feed XML for syntax issues.</li>
            <li>Checking exported XML data files before importing them.</li>
            <li>Finding missing closing tags or broken nested XML structure.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example XML to Validate
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleXml}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an XML validator check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An XML validator checks whether XML content can be parsed
                correctly. It helps find syntax problems such as missing closing
                tags, invalid nesting, broken markup, or invalid characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this validate sitemap XML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can paste sitemap XML into the validator to check
                whether the XML syntax is valid before using it in SEO or search
                engine submission workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this check XML schema or XSD rules?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool checks XML syntax and basic structure. It does not
                validate against an XSD schema or custom XML schema rules.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my XML uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The XML validation happens directly in your browser. Your
                XML content is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/xml-validator" />
        </div>
      </section>
    </ToolShell>
  );
}

function analyzeXml(source: string): XMLReport {
  if (typeof window === "undefined") {
    throw new Error("This tool must run in the browser.");
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(source, "application/xml");
  const parserError = document.querySelector("parsererror");

  if (parserError) {
    const errorText = parserError.textContent?.trim() || "Invalid XML syntax.";

    return {
      valid: false,
      rootElement: "Not available",
      totalElements: 0,
      uniqueTags: [],
      issues: [
        {
          level: "Error",
          message: cleanParserError(errorText),
        },
      ],
    };
  }

  const root = document.documentElement;

  if (!root) {
    return {
      valid: false,
      rootElement: "Not available",
      totalElements: 0,
      uniqueTags: [],
      issues: [
        {
          level: "Error",
          message: "No XML root element was found.",
        },
      ],
    };
  }

  const elements = Array.from(document.getElementsByTagName("*"));
  const uniqueTags = Array.from(
    new Set(elements.map((element) => element.tagName))
  ).sort();

  const issues = buildXmlSuggestions(source, root, elements);

  return {
    valid: true,
    rootElement: root.tagName,
    totalElements: elements.length,
    uniqueTags,
    issues,
  };
}

function buildXmlSuggestions(
  source: string,
  root: Element,
  elements: Element[]
): XMLIssue[] {
  const issues: XMLIssue[] = [];

  if (!source.trim().startsWith("<?xml")) {
    issues.push({
      level: "Suggestion",
      message:
        "XML declaration is missing. This may be fine, but many XML files include version and encoding information.",
    });
  }

  if (root.tagName.toLowerCase() === "urlset") {
    const urls = elements.filter(
      (element) => element.tagName.toLowerCase() === "url"
    );

    if (!urls.length) {
      issues.push({
        level: "Warning",
        message: "Sitemap XML root is urlset, but no url elements were found.",
      });
    }
  }

  if (root.tagName.toLowerCase() === "rss") {
    const channels = elements.filter(
      (element) => element.tagName.toLowerCase() === "channel"
    );

    if (!channels.length) {
      issues.push({
        level: "Warning",
        message: "RSS XML root is rss, but no channel element was found.",
      });
    }
  }

  if (elements.length === 1) {
    issues.push({
      level: "Suggestion",
      message:
        "Only one XML element was found. Check whether the XML content is complete.",
    });
  }

  return issues;
}

function formatReport(report: XMLReport) {
  if (!report.valid) {
    return [
      "XML validation failed.",
      "",
      "Status: Invalid XML",
      "",
      "Issues:",
      ...report.issues.map((issue, index) => {
        return `${index + 1}. ${issue.level}: ${issue.message}`;
      }),
    ].join("\n");
  }

  const warningCount = report.issues.filter(
    (issue) => issue.level === "Warning"
  ).length;

  const suggestionCount = report.issues.filter(
    (issue) => issue.level === "Suggestion"
  ).length;

  const lines = [
    "XML validation completed.",
    "",
    "Status: Valid XML",
    `Root element: ${report.rootElement}`,
    `Total elements: ${report.totalElements}`,
    `Unique tags: ${report.uniqueTags.length ? report.uniqueTags.join(", ") : "None"}`,
    "",
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
    "Issues:",
  ];

  if (report.issues.length) {
    report.issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
    });
  } else {
    lines.push("No common XML issues found.");
  }

  return lines.join("\n");
}

function cleanParserError(errorText: string) {
  return errorText
    .replace(/\s+/g, " ")
    .replace("This page contains the following errors:", "")
    .trim();
}
