"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CSPDirective = {
  name: string;
  values: string[];
};

type CSPIssue = {
  level: "Warning" | "Suggestion";
  message: string;
};

const sampleCSP = `default-src 'self';
script-src 'self' https://cdn.example.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://api.example.com;
frame-ancestors 'none';
base-uri 'self';
object-src 'none';`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const analyzeCSP = () => {
    if (!input.trim()) {
      setError("Please enter a Content Security Policy header to analyze.");
      setOutput("");
      return;
    }

    try {
      const directives = parseCSP(input);
      const issues = analyzeDirectives(directives);
      setOutput(formatReport(directives, issues));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to analyze this Content Security Policy.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleCSP);
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
      title="CSP Analyzer"
      description="Inspect CSP directives, source values, duplicate rules, unsafe keywords, and common policy gaps before testing the policy in a real application."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Content Security Policy Header
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleCSP}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a CSP header value from response headers, server configuration,
          or security testing notes.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeCSP} className="yoryantra-btn">
          Analyze CSP
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
            CSP Analysis Report
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
          {output || "Content Security Policy analysis will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        CSP changes can block scripts, styles, images, frames, and API calls.
        Test policy changes carefully before applying them to production pages.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Analyzing Content Security Policy Headers Before Deployment
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Content Security Policy helps control where scripts, styles, images,
            frames, fonts, and network requests can load from. A weak CSP header
            can allow unsafe sources, while an overly strict policy can break
            real page behavior.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This analyzer parses a policy and highlights common review points
            such as duplicate directives, wildcard sources, unsafe keywords,
            missing fallback protections, and source values that deserve closer
            inspection.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing CSP Directives and Unsafe Source Values
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a Content Security Policy header into the input box.</li>
            <li>
              Click <strong>Analyze CSP</strong>.
            </li>
            <li>Review detected directives, warnings, and suggestions.</li>
            <li>Test any policy changes carefully before production rollout.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CSP Analyzer Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking CSP headers copied from HTTP responses.</li>
            <li>Finding unsafe-inline or unsafe-eval in script and style rules.</li>
            <li>Reviewing frame-ancestors protection against unwanted framing.</li>
            <li>Checking whether object-src and base-uri are defined.</li>
            <li>Reviewing source lists before tightening a security policy.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Content Security Policy
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleCSP}
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
                What does a CSP analyzer check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks the policy text for common structural and source-list
                concerns. It does not load your application, observe runtime
                requests, or prove that the policy blocks every unwanted action.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are unsafe-inline and unsafe-eval important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                These values can weaken CSP protection because they allow inline
                code or dynamic code execution. Sometimes they are used for
                compatibility, but they should be reviewed carefully.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool confirm that my CSP is perfect?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The report is a static review of the policy text. Test the
                policy with the actual application, preferably in report-only
                mode first, and inspect browser violations and required sources.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my CSP header uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The CSP analysis happens directly in your browser. Your
                policy header is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/csp-analyzer" />
        </div>
      </section>
    </ToolShell>
  );
}

function parseCSP(source: string): CSPDirective[] {
  const cleaned = source
    .replace(
      /^content-security-policy(?:-report-only)?:\s*/i,
      ""
    )
    .replace(/\r?\n/g, " ")
    .trim();

  const parts = cleaned
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    throw new Error("No CSP directives were found.");
  }

  const directives = parts.map((part) => {
    const [name, ...values] = part.split(/\s+/);

    if (!name) {
      throw new Error("Invalid CSP directive found.");
    }

    return {
      name: name.toLowerCase(),
      values,
    };
  });

  return directives;
}

function analyzeDirectives(directives: CSPDirective[]) {
  const issues: CSPIssue[] = [];
  const names = directives.map((directive) => directive.name);
  const directiveMap = new Map<string, CSPDirective>();

  directives.forEach((directive) => {
    if (!directiveMap.has(directive.name)) {
      directiveMap.set(directive.name, directive);
    }
  });

  const duplicateDirectives = names.filter(
    (name, index) => names.indexOf(name) !== index
  );

  if (duplicateDirectives.length) {
    issues.push({
      level: "Warning",
      message: `Duplicate directives found: ${[
        ...new Set(duplicateDirectives),
      ].join(", ")}. Browsers may ignore later duplicate directives.`,
    });
  }

  const requiredSuggestions = [
    {
      name: "default-src",
      message:
        "Missing default-src. It is commonly used as a fallback for other fetch directives.",
    },
    {
      name: "object-src",
      message:
        "Missing object-src. Setting object-src 'none' is commonly recommended.",
    },
    {
      name: "base-uri",
      message:
        "Missing base-uri. Setting base-uri 'self' can help reduce base tag abuse.",
    },
    {
      name: "frame-ancestors",
      message:
        "Missing frame-ancestors. It helps control which pages can frame this page.",
    },
  ];

  requiredSuggestions.forEach((item) => {
    if (!names.includes(item.name)) {
      issues.push({
        level: item.name === "default-src" ? "Warning" : "Suggestion",
        message: item.message,
      });
    }
  });

  directives.forEach((directive) => {
    const values = directive.values;

    if (!values.length) {
      issues.push({
        level: "Warning",
        message: `${directive.name} has no source values.`,
      });
    }

    if (values.includes("'none'") && values.length > 1) {
      issues.push({
        level: "Warning",
        message: `${directive.name} combines 'none' with other source values. 'none' should be used by itself.`,
      });
    }

    if (values.includes("*")) {
      issues.push({
        level: "Warning",
        message: `${directive.name} allows wildcard source *. Review whether this is necessary.`,
      });
    }

    if (values.includes("'unsafe-inline'")) {
      issues.push({
        level:
          directive.name === "script-src" || directive.name === "default-src"
            ? "Warning"
            : "Suggestion",
        message: `${directive.name} includes 'unsafe-inline'. Review inline code usage carefully.`,
      });
    }

    if (values.includes("'unsafe-eval'")) {
      issues.push({
        level: "Warning",
        message: `${directive.name} includes 'unsafe-eval'. This can weaken script protections.`,
      });
    }

    if (values.includes("data:") && directive.name !== "img-src") {
      issues.push({
        level: "Suggestion",
        message: `${directive.name} allows data:. Review whether data URLs are needed here.`,
      });
    }

    if (
      values.some((value) => value.startsWith("http:")) &&
      !values.some((value) => value.startsWith("https:"))
    ) {
      issues.push({
        level: "Suggestion",
        message: `${directive.name} includes http: sources. Prefer https: where possible.`,
      });
    }

    const duplicateValues = values.filter(
      (value, index) => values.indexOf(value) !== index
    );

    if (duplicateValues.length) {
      issues.push({
        level: "Suggestion",
        message: `${directive.name} contains duplicate source values: ${[
          ...new Set(duplicateValues),
        ].join(", ")}.`,
      });
    }
  });

  const scriptSrc = directiveMap.get("script-src");

  if (scriptSrc && !scriptSrc.values.includes("'self'")) {
    issues.push({
      level: "Suggestion",
      message: "script-src does not include 'self'. Check whether same-origin scripts are intentionally blocked.",
    });
  }

  const frameAncestors = directiveMap.get("frame-ancestors");

  if (frameAncestors && frameAncestors.values.includes("*")) {
    issues.push({
      level: "Warning",
      message: "frame-ancestors allows all origins. This weakens framing protection.",
    });
  }

  return issues;
}

function formatReport(directives: CSPDirective[], issues: CSPIssue[]) {
  const warningCount = issues.filter((issue) => issue.level === "Warning").length;
  const suggestionCount = issues.filter(
    (issue) => issue.level === "Suggestion"
  ).length;

  const lines = [
    "Content Security Policy analysis completed.",
    "",
    `Directives found: ${directives.length}`,
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
    "Directives:",
    "",
  ];

  directives.forEach((directive, index) => {
    lines.push(`${index + 1}. ${directive.name}`);
    lines.push(
      `   Values: ${
        directive.values.length ? directive.values.join(" ") : "No values"
      }`
    );
    lines.push("");
  });

  lines.push("Issues:");

  if (issues.length) {
    issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
    });
  } else {
    lines.push("No common CSP issues found.");
  }

  return lines.join("\n");
}
