"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type StructuredIssue = {
  level: "Warning" | "Note";
  path: string;
  message: string;
};

type EntityNode = {
  path: string;
  types: string[];
  id: string;
  context: string;
  properties: string[];
};

type StructuredReport = {
  documentCount: number;
  nodes: EntityNode[];
  issues: StructuredIssue[];
};

const sampleJsonLd = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://example.com/articles/json-ld#article",
  "headline": "Understanding JSON-LD",
  "url": "https://example.com/articles/json-ld",
  "author": {
    "@type": "Person",
    "name": "Example Author"
  }
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleJsonLd);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!input.trim()) {
      setError("Paste JSON-LD or HTML containing JSON-LD scripts.");
      setOutput("");
      return;
    }

    try {
      const report = inspectStructuredData(input);
      setOutput(formatStructuredReport(report));
      setError("");
    } catch (err) {
      setOutput("");
      setError(
        err instanceof Error ? err.message : "Unable to inspect this structured data."
      );
    }
  };

  const resetAll = () => {
    setInput(sampleJsonLd);
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Structured Data Validator"
      description="Inspect Schema.org JSON-LD structure, contexts, types, identifiers, graphs, and common JSON-LD mistakes without pretending to certify rich-result eligibility."
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          JSON-LD or HTML source
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => setInput(event.target.value)}
          rows={14}
          placeholder={sampleJsonLd}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          You can paste raw JSON-LD, a JSON-LD array, an @graph document, or HTML
          containing one or more application/ld+json script blocks.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validate} className="yoryantra-btn">
          Inspect Structured Data
        </button>
        <button
          onClick={() => {
            setInput(sampleJsonLd);
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
            Structured data report
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
        <pre className="yoryantra-output mt-3 min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Structured data inspection results will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Structural JSON-LD checks without fake rich-result guarantees
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON-LD can be syntactically valid while still using the wrong
            vocabulary, incomplete properties, or markup that is not eligible
            for a search feature. This tool checks the structure it can verify
            locally: JSON syntax, script extraction, @context inheritance,
            @graph shape, @type values, @id values, and discovered entity nodes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            It deliberately does not maintain a hard-coded list of “required
            fields” for every Schema.org type. Schema.org vocabulary validity
            and Google rich-result requirements are different questions and
            change independently.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What to verify after this local check
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Check the intended type and properties against Schema.org documentation.</li>
            <li>For Google search features, check the current feature-specific documentation and Rich Results Test.</li>
            <li>Test the final rendered page, not only a copied JSON-LD fragment.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References</h2>
          <div className="mt-4 space-y-2 text-gray-600">
            <p>
              <a href="https://schema.org/" target="_blank" rel="noreferrer" className="font-medium underline">
                Schema.org vocabulary
              </a>
            </p>
            <p>
              <a href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" target="_blank" rel="noreferrer" className="font-medium underline">
                Google Search structured data guidance
              </a>
            </p>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            Inspection runs locally in the browser; pasted markup is not fetched
            or sent to a validation service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/structured-data-validator" />
        </div>
      </section>
    </ToolShell>
  );
}

function inspectStructuredData(source: string): StructuredReport {
  const documents = extractStructuredDocuments(source);
  if (!documents.length) {
    throw new Error("No JSON-LD document was found.");
  }

  const nodes: EntityNode[] = [];
  const issues: StructuredIssue[] = [];

  documents.forEach((documentValue, index) => {
    const path = documents.length === 1 ? "$" : `$document[${index}]`;
    inspectValue(documentValue, path, "", nodes, issues, true);
  });

  if (!nodes.length) {
    issues.push({
      level: "Warning",
      path: "$",
      message: "No JSON-LD entity object with @type, @id, or normal properties was found.",
    });
  }

  return {
    documentCount: documents.length,
    nodes,
    issues,
  };
}

function extractStructuredDocuments(source: string): unknown[] {
  const trimmed = source.trim();

  if (trimmed.startsWith("<")) {
    if (typeof window === "undefined") {
      throw new Error("HTML extraction must run in the browser.");
    }

    const document = new DOMParser().parseFromString(trimmed, "text/html");
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );

    if (!scripts.length) {
      throw new Error("No <script type=\"application/ld+json\"> block was found.");
    }

    return scripts.map((script, index) => {
      const text = script.textContent?.trim() || "";
      if (!text) {
        throw new Error(`JSON-LD script ${index + 1} is empty.`);
      }
      try {
        return JSON.parse(text) as unknown;
      } catch (err) {
        throw new Error(
          `JSON-LD script ${index + 1} contains invalid JSON: ${jsonErrorMessage(err)}`
        );
      }
    });
  }

  try {
    return [JSON.parse(trimmed) as unknown];
  } catch (err) {
    throw new Error(`Invalid JSON-LD JSON: ${jsonErrorMessage(err)}`);
  }
}

function inspectValue(
  value: unknown,
  path: string,
  inheritedContext: string,
  nodes: EntityNode[],
  issues: StructuredIssue[],
  topLevel: boolean
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      inspectValue(item, `${path}[${index}]`, inheritedContext, nodes, issues, topLevel)
    );
    return;
  }

  if (!isRecord(value)) {
    if (topLevel) {
      issues.push({
        level: "Warning",
        path,
        message: "Top-level JSON-LD value is not an object or array of objects.",
      });
    }
    return;
  }

  const localContext = describeContext(value["@context"]) || inheritedContext;
  if (topLevel && !value["@context"] && !inheritedContext) {
    issues.push({
      level: "Warning",
      path,
      message:
        "No @context is available at the document root. Bare Schema.org type and property names normally need a Schema.org context.",
    });
  }

  if (value["@context"] !== undefined && !isValidContextShape(value["@context"])) {
    issues.push({
      level: "Warning",
      path: `${path}['@context']`,
      message: "@context should be a string, object, or array accepted by JSON-LD.",
    });
  }

  const types = readTypes(value["@type"], path, issues);
  const id = value["@id"];
  if (id !== undefined && typeof id !== "string") {
    issues.push({
      level: "Warning",
      path: `${path}['@id']`,
      message: "@id should be a string IRI/reference when it is present.",
    });
  }

  const properties = Object.keys(value).filter((key) => !key.startsWith("@"));
  const looksLikeEntity =
    types.length > 0 || typeof id === "string" || properties.length > 0;

  if (looksLikeEntity) {
    nodes.push({
      path,
      types,
      id: typeof id === "string" ? id : "",
      context: localContext,
      properties,
    });
  }

  if (value["@graph"] !== undefined) {
    if (!Array.isArray(value["@graph"])) {
      issues.push({
        level: "Warning",
        path: `${path}['@graph']`,
        message: "@graph is usually an array of JSON-LD nodes.",
      });
    } else {
      value["@graph"].forEach((item, index) =>
        inspectValue(
          item,
          `${path}['@graph'][${index}]`,
          localContext,
          nodes,
          issues,
          false
        )
      );
    }
  }

  Object.entries(value).forEach(([key, child]) => {
    if (key === "@context" || key === "@graph") return;
    if (child && typeof child === "object") {
      inspectValue(child, appendPath(path, key), localContext, nodes, issues, false);
    }
  });
}

function readTypes(
  value: unknown,
  path: string,
  issues: StructuredIssue[]
): string[] {
  if (value === undefined) return [];

  if (typeof value === "string") {
    return value.trim() ? [value] : [];
  }

  if (Array.isArray(value)) {
    const strings = value.filter(
      (item): item is string => typeof item === "string" && Boolean(item.trim())
    );
    if (strings.length !== value.length) {
      issues.push({
        level: "Warning",
        path: `${path}['@type']`,
        message: "@type arrays should contain type strings.",
      });
    }
    return strings;
  }

  issues.push({
    level: "Warning",
    path: `${path}['@type']`,
    message: "@type should be a string or an array of strings.",
  });
  return [];
}

function formatStructuredReport(report: StructuredReport) {
  const warnings = report.issues.filter((issue) => issue.level === "Warning").length;
  const notes = report.issues.filter((issue) => issue.level === "Note").length;
  const typeSet = new Set<string>();
  report.nodes.forEach((node) => node.types.forEach((type) => typeSet.add(type)));

  const lines = [
    "Structured data inspection completed.",
    "",
    `JSON-LD documents: ${report.documentCount}`,
    `Entity objects found: ${report.nodes.length}`,
    `Types found: ${typeSet.size ? Array.from(typeSet).join(", ") : "None"}`,
    `Warnings: ${warnings}`,
    `Notes: ${notes}`,
    "",
    "Entities:",
  ];

  if (!report.nodes.length) {
    lines.push("No entity objects found.");
  } else {
    report.nodes.forEach((node, index) => {
      lines.push("");
      lines.push(`${index + 1}. ${node.path}`);
      lines.push(`   @type: ${node.types.length ? node.types.join(", ") : "Not set"}`);
      lines.push(`   @id: ${node.id || "Not set"}`);
      lines.push(`   @context: ${node.context || "Not resolved"}`);
      lines.push(
        `   properties: ${node.properties.length ? node.properties.join(", ") : "None"}`
      );
    });
  }

  lines.push("");
  lines.push("Issues:");
  if (!report.issues.length) {
    lines.push("No structural JSON-LD warnings found.");
  } else {
    report.issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level} at ${issue.path}: ${issue.message}`);
    });
  }

  lines.push("");
  lines.push(
    "This is a structural browser check. It does not certify Schema.org vocabulary correctness or Google rich-result eligibility."
  );

  return lines.join("\n");
}

function describeContext(value: unknown): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => describeContext(item))
      .filter(Boolean)
      .join(", ");
  }

  if (isRecord(value)) {
    const vocab = value["@vocab"];
    return typeof vocab === "string" ? `@vocab ${vocab}` : "Inline context object";
  }

  return "";
}

function isValidContextShape(value: unknown): boolean {
  if (value === null || typeof value === "string" || isRecord(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isValidContextShape(item));
  }

  return false;
}

function appendPath(path: string, key: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)
    ? `${path}.${key}`
    : `${path}['${key.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}']`;
}

function jsonErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "JSON parse error";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
