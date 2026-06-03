"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type RobotsIssue = {
  line: number;
  level: "Error" | "Warning" | "Suggestion";
  message: string;
};

type RobotsRule = {
  line: number;
  directive: string;
  value: string;
};

type RobotsGroup = {
  userAgents: string[];
  rules: RobotsRule[];
};

type RobotsReport = {
  groups: RobotsGroup[];
  sitemaps: string[];
  issues: RobotsIssue[];
  totalLines: number;
};

const sampleRobots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://yoryantra.com/sitemap.xml`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateRobots = () => {
    if (!input.trim()) {
      setError("Please enter robots.txt content to validate.");
      setOutput("");
      return;
    }

    try {
      const report = analyzeRobotsTxt(input);
      setOutput(formatReport(report));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to validate this robots.txt file.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleRobots);
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
      title="Robots.txt Validator"
      description="Validate robots.txt syntax, check crawler rules, review sitemap lines, and find common robots.txt issues."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Robots.txt Content
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleRobots}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste robots.txt rules from your site, staging environment, or SEO
          notes to check syntax and common crawler rule issues.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateRobots} className="yoryantra-btn">
          Validate Robots.txt
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
          {output || "Robots.txt validation report will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Robots.txt controls crawling, not guaranteed indexing. Use Google Search
        Console and page-level robots meta tags when reviewing indexability.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Validating Robots.txt Rules Before Publishing SEO Changes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A robots.txt file tells crawlers which areas of a website they can
            crawl. It is often used for admin paths, search result pages,
            private folders, staging-like paths, duplicate sections, and sitemap
            discovery. A small robots.txt mistake can accidentally block
            important pages or expose crawler rules that should be reviewed.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Robots.txt Validator helps you check robots.txt syntax, inspect
            user-agent groups, review Allow and Disallow rules, find sitemap
            lines, check crawl-delay values, and catch common robots.txt issues
            directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking User-Agent Groups, Allow Rules, and Disallow Rules
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your robots.txt content into the input box.</li>
            <li>
              Click <strong>Validate Robots.txt</strong>.
            </li>
            <li>Review detected user-agent groups, sitemap URLs, and issues.</li>
            <li>Fix risky or invalid rules before publishing the file.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Robots.txt Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking robots.txt before submitting a site to Search Console.</li>
            <li>Finding accidental site-wide blocks such as <strong>Disallow: /</strong>.</li>
            <li>Reviewing sitemap lines for absolute sitemap URLs.</li>
            <li>Checking crawler-specific rules for Googlebot or Bingbot.</li>
            <li>Finding unknown directives, empty values, or misplaced rules.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Robots.txt File
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleRobots}
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
                What does a robots.txt validator check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks robots.txt content for valid directive syntax, crawler
                groups, Allow and Disallow rules, sitemap URLs, crawl-delay
                values, and common mistakes that should be reviewed before
                publishing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does robots.txt prevent indexing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Robots.txt mainly controls crawling. A blocked URL can still
                appear in search results in some cases if other pages link to it.
                For indexing control, review robots meta tags and noindex rules.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this test a live URL against robots.txt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool validates pasted robots.txt content. For live URL
                testing, use your search engine webmaster tools alongside this
                syntax check.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my robots.txt content uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Robots.txt validation happens directly in your browser. Your
                robots.txt content is not uploaded to a server.
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
              href="/tools/robots-txt-tester"
              className="yoryantra-btn-outline"
            >
              Robots.txt Tester
            </Link>

            <Link
              href="/tools/robots-txt-generator"
              className="yoryantra-btn-outline"
            >
              Robots.txt Generator
            </Link>

            <Link
              href="/tools/sitemap-generator"
              className="yoryantra-btn-outline"
            >
              Sitemap Generator
            </Link>

            <Link
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function analyzeRobotsTxt(source: string): RobotsReport {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  const issues: RobotsIssue[] = [];
  let currentGroup: RobotsGroup | null = null;
  let hasUserAgent = false;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmed = stripComment(rawLine).trim();

    if (!trimmed) {
      return;
    }

    const colonIndex = trimmed.indexOf(":");

    if (colonIndex <= 0) {
      issues.push({
        line: lineNumber,
        level: "Error",
        message: "Directive should use the format Name: value.",
      });
      return;
    }

    const directive = trimmed.slice(0, colonIndex).trim();
    const directiveLower = directive.toLowerCase();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (!directive) {
      issues.push({
        line: lineNumber,
        level: "Error",
        message: "Directive name is missing.",
      });
      return;
    }

    if (directiveLower === "user-agent") {
      if (!value) {
        issues.push({
          line: lineNumber,
          level: "Error",
          message: "User-agent value is missing.",
        });
        return;
      }

      hasUserAgent = true;

      if (
        !currentGroup ||
        currentGroup.rules.length ||
        currentGroup.userAgents.length === 0
      ) {
        currentGroup = {
          userAgents: [],
          rules: [],
        };
        groups.push(currentGroup);
      }

      currentGroup.userAgents.push(value);
      return;
    }

    if (directiveLower === "sitemap") {
      if (!value) {
        issues.push({
          line: lineNumber,
          level: "Warning",
          message: "Sitemap directive is empty.",
        });
      } else {
        sitemaps.push(value);

        if (!/^https?:\/\//i.test(value)) {
          issues.push({
            line: lineNumber,
            level: "Suggestion",
            message: "Sitemap URL should usually be an absolute http or https URL.",
          });
        }

        if (!/\.xml($|\?)/i.test(value)) {
          issues.push({
            line: lineNumber,
            level: "Suggestion",
            message: "Sitemap URL does not look like an XML sitemap URL.",
          });
        }
      }

      return;
    }

    if (!currentGroup) {
      currentGroup = {
        userAgents: [],
        rules: [],
      };
      groups.push(currentGroup);

      issues.push({
        line: lineNumber,
        level: "Warning",
        message: "Rule appears before any User-agent directive.",
      });
    }

    if (!["allow", "disallow", "crawl-delay", "clean-param"].includes(directiveLower)) {
      issues.push({
        line: lineNumber,
        level: "Suggestion",
        message: `Unknown or less common robots.txt directive: ${directive}.`,
      });
    }

    if ((directiveLower === "allow" || directiveLower === "disallow") && value && !value.startsWith("/")) {
      issues.push({
        line: lineNumber,
        level: "Suggestion",
        message: `${directive} path usually starts with /.`,
      });
    }

    if (directiveLower === "disallow" && value === "/") {
      issues.push({
        line: lineNumber,
        level: "Warning",
        message: "Disallow: / blocks crawling for this user-agent group.",
      });
    }

    if (directiveLower === "crawl-delay") {
      if (!value || !/^\d+(\.\d+)?$/.test(value)) {
        issues.push({
          line: lineNumber,
          level: "Warning",
          message: "Crawl-delay should be a numeric value.",
        });
      }
    }

    currentGroup.rules.push({
      line: lineNumber,
      directive,
      value,
    });
  });

  if (!hasUserAgent) {
    issues.push({
      line: 0,
      level: "Error",
      message: "No User-agent directive was found.",
    });
  }

  if (!sitemaps.length) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "No Sitemap directive found. Adding a sitemap URL can help crawler discovery.",
    });
  }

  groups.forEach((group) => {
    if (!group.userAgents.length) {
      issues.push({
        line: 0,
        level: "Warning",
        message: "A rule group exists without a user-agent.",
      });
    }

    const hasRules = group.rules.some((rule) =>
      ["allow", "disallow"].includes(rule.directive.toLowerCase())
    );

    if (!hasRules) {
      issues.push({
        line: 0,
        level: "Suggestion",
        message: `User-agent group ${group.userAgents.join(", ") || "(missing)"} has no Allow or Disallow rules.`,
      });
    }
  });

  return {
    groups,
    sitemaps,
    issues,
    totalLines: lines.length,
  };
}

function formatReport(report: RobotsReport) {
  const errorCount = report.issues.filter((issue) => issue.level === "Error").length;
  const warningCount = report.issues.filter((issue) => issue.level === "Warning").length;
  const suggestionCount = report.issues.filter(
    (issue) => issue.level === "Suggestion"
  ).length;

  const lines = [
    "Robots.txt validation completed.",
    "",
    `Status: ${errorCount ? "Needs review" : "Valid syntax check"}`,
    `Groups found: ${report.groups.length}`,
    `Sitemaps found: ${report.sitemaps.length}`,
    `Total lines: ${report.totalLines}`,
    `Errors: ${errorCount}`,
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
  ];

  lines.push("Groups:");
  if (report.groups.length) {
    report.groups.forEach((group, index) => {
      lines.push(`${index + 1}. User-agent: ${group.userAgents.join(", ") || "Missing"}`);

      if (group.rules.length) {
        group.rules.forEach((rule) => {
          lines.push(`   Line ${rule.line}: ${rule.directive}: ${rule.value}`);
        });
      } else {
        lines.push("   No rules found.");
      }
    });
  } else {
    lines.push("No user-agent groups found.");
  }

  lines.push("");
  lines.push("Sitemaps:");
  if (report.sitemaps.length) {
    report.sitemaps.forEach((sitemap) => {
      lines.push(`- ${sitemap}`);
    });
  } else {
    lines.push("No sitemap directives found.");
  }

  lines.push("");
  lines.push("Issues:");

  if (report.issues.length) {
    report.issues.forEach((issue, index) => {
      lines.push(
        `${index + 1}. ${issue.level}${issue.line ? ` on line ${issue.line}` : ""}: ${issue.message}`
      );
    });
  } else {
    lines.push("No common robots.txt issues found.");
  }

  return lines.join("\n");
}

function stripComment(line: string) {
  const hashIndex = line.indexOf("#");

  if (hashIndex === -1) {
    return line;
  }

  return line.slice(0, hashIndex);
}
