"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type SchemaIssue = {
  level: "Warning" | "Suggestion";
  message: string;
};

type SchemaReport = {
  type: string;
  context: string;
  issues: SchemaIssue[];
  keys: string[];
};

const sampleJsonLd = `{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Yoryantra",
  "url": "https://yoryantra.com",
  "description": "Practical browser tools for everyday work."
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateStructuredData = () => {
    if (!input.trim()) {
      setError("Please enter JSON-LD structured data to validate.");
      setOutput("");
      return;
    }

    try {
      const reports = analyzeStructuredData(input);
      setOutput(formatReport(reports));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to validate this structured data.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleJsonLd);
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
      title="Structured Data Validator"
      description="Validate JSON-LD structured data, inspect schema markup, and find common schema issues in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON-LD Structured Data
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleJsonLd}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste JSON-LD schema markup from a page, template, or structured data
          script tag.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateStructuredData} className="yoryantra-btn">
          Validate Structured Data
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
            Validation Report
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
          {output || "Structured data validation report will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking JSON-LD Schema Before Publishing Pages
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Structured data helps search engines understand page details such as
            articles, products, breadcrumbs, organizations, websites, FAQs, and
            other schema types. Small JSON-LD mistakes can break schema parsing
            or make structured data harder to review before publishing.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Structured Data Validator helps you check JSON-LD syntax,
            inspect schema types, review required-looking fields, and find
            common schema markup issues directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Validating Schema Markup from HTML or JSON-LD
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste JSON-LD structured data into the input box.</li>
            <li>
              Click <strong>Validate Structured Data</strong>.
            </li>
            <li>Review the detected schema type, context, fields, and issues.</li>
            <li>Fix missing or weak fields before adding schema to a page.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Structured Data Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking JSON-LD schema syntax before publishing pages.</li>
            <li>Reviewing Article, WebSite, Organization, FAQ, and Product schema.</li>
            <li>Finding missing <strong>@context</strong> or <strong>@type</strong> values.</li>
            <li>Inspecting schema fields copied from templates or generators.</li>
            <li>Preparing cleaner schema markup for technical SEO checks.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON-LD Structured Data
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleJsonLd}
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
                What does a structured data validator check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks JSON-LD syntax, looks for important schema fields such
                as <strong>@context</strong> and <strong>@type</strong>, and
                highlights common issues that are useful to review before
                publishing schema markup.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this replace Google&apos;s rich results testing tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool is useful for quick browser checks while editing
                JSON-LD. For eligibility of rich results, you should still test
                final pages with official search engine tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I validate multiple schema objects?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool supports a single JSON-LD object, an array of
                objects, and common <strong>@graph</strong> structures.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my structured data uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The structured data check happens directly in your browser.
                Your JSON-LD content is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/meta-tags-checker"
              className="yoryantra-btn-outline"
            >
              Meta Tags Checker
            </Link>

            <Link
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
            </Link>

            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function analyzeStructuredData(source: string) {
  const cleaned = extractJsonLd(source);
  const parsed = JSON.parse(cleaned);
  const nodes = normalizeNodes(parsed);

  if (!nodes.length) {
    throw new Error("No structured data objects were found.");
  }

  return nodes.map(analyzeNode);
}

function extractJsonLd(source: string) {
  const scriptMatch = source.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );

  if (scriptMatch?.[1]) {
    return scriptMatch[1].trim();
  }

  return source.trim();
}

function normalizeNodes(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) {
    return parsed.filter(isRecord);
  }

  if (isRecord(parsed)) {
    if (Array.isArray(parsed["@graph"])) {
      return parsed["@graph"].filter(isRecord);
    }

    return [parsed];
  }

  return [];
}

function analyzeNode(node: Record<string, unknown>): SchemaReport {
  const type = getStringValue(node["@type"]);
  const context = getStringValue(node["@context"]);
  const keys = Object.keys(node);
  const issues: SchemaIssue[] = [];

  if (!context) {
    issues.push({
      level: "Warning",
      message: "Missing @context. JSON-LD schema usually uses https://schema.org.",
    });
  } else if (!context.includes("schema.org")) {
    issues.push({
      level: "Suggestion",
      message: "@context is present, but it does not look like a schema.org context.",
    });
  }

  if (!type) {
    issues.push({
      level: "Warning",
      message: "Missing @type. Schema markup should clearly define the schema type.",
    });
  }

  if (!keys.includes("name") && !keys.includes("headline")) {
    issues.push({
      level: "Suggestion",
      message: "Consider adding a name or headline field when it fits this schema type.",
    });
  }

  if (!keys.includes("url") && ["WebSite", "Organization", "Product", "Article"].includes(type)) {
    issues.push({
      level: "Suggestion",
      message: "Consider adding a url field for this schema type.",
    });
  }

  if (type === "Article" || type === "BlogPosting") {
    if (!keys.includes("headline")) {
      issues.push({
        level: "Warning",
        message: "Article schema usually needs a headline field.",
      });
    }

    if (!keys.includes("author")) {
      issues.push({
        level: "Suggestion",
        message: "Consider adding author information for Article schema.",
      });
    }

    if (!keys.includes("datePublished")) {
      issues.push({
        level: "Suggestion",
        message: "Consider adding datePublished for Article schema.",
      });
    }
  }

  if (type === "Product") {
    if (!keys.includes("offers")) {
      issues.push({
        level: "Suggestion",
        message: "Product schema commonly includes offers information.",
      });
    }

    if (!keys.includes("image")) {
      issues.push({
        level: "Suggestion",
        message: "Product schema commonly includes image information.",
      });
    }
  }

  if (type === "FAQPage" && !keys.includes("mainEntity")) {
    issues.push({
      level: "Warning",
      message: "FAQPage schema should include mainEntity questions and answers.",
    });
  }

  return {
    type: type || "Not found",
    context: context || "Not found",
    issues,
    keys,
  };
}

function formatReport(reports: SchemaReport[]) {
  const warningCount = reports.reduce(
    (total, report) =>
      total + report.issues.filter((issue) => issue.level === "Warning").length,
    0
  );

  const suggestionCount = reports.reduce(
    (total, report) =>
      total +
      report.issues.filter((issue) => issue.level === "Suggestion").length,
    0
  );

  const lines = [
    "Structured data check completed.",
    "",
    `Schema objects found: ${reports.length}`,
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
  ];

  reports.forEach((report, index) => {
    lines.push(`Schema ${index + 1}`);
    lines.push(`Type: ${report.type}`);
    lines.push(`Context: ${report.context}`);
    lines.push(`Fields: ${report.keys.join(", ") || "No fields found"}`);

    if (report.issues.length) {
      lines.push("Issues:");
      report.issues.forEach((issue) => {
        lines.push(`  - ${issue.level}: ${issue.message}`);
      });
    } else {
      lines.push("Issues: No common issues found.");
    }

    lines.push("");
  });

  return lines.join("\n").trim();
}

function getStringValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").join(", ");
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
