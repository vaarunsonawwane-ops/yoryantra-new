"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type SitemapIssue = {
  level: "Error" | "Warning" | "Suggestion";
  message: string;
};

type SitemapUrl = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

type SitemapReport = {
  valid: boolean;
  rootElement: string;
  urls: SitemapUrl[];
  sitemapIndexes: string[];
  issues: SitemapIssue[];
};

const sampleSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yoryantra.com/</loc>
    <lastmod>2026-05-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yoryantra.com/tools</loc>
    <lastmod>2026-05-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

const validChangefreqValues = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateSitemap = () => {
    if (!input.trim()) {
      setError("Please enter XML sitemap content to validate.");
      setOutput("");
      return;
    }

    try {
      const report = analyzeSitemap(input);
      setOutput(formatReport(report));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to validate this sitemap.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleSitemap);
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
      title="Sitemap Validator"
      description="Validate XML sitemap syntax, inspect sitemap URLs, and find common sitemap issues directly in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          XML Sitemap
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleSitemap}
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste sitemap.xml content from your site, build output, CMS, or SEO
          workflow to check syntax and common sitemap issues.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateSitemap} className="yoryantra-btn">
          Validate Sitemap
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
            Sitemap Validation Report
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
          {output || "Sitemap validation report will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool validates pasted XML sitemap content. It does not fetch live
        sitemap URLs or confirm whether search engines have processed them.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Validating XML Sitemaps Before Search Engine Submission
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            XML sitemaps help search engines discover important pages on a
            website. They are commonly submitted in Google Search Console, Bing
            Webmaster Tools, and other search platforms. A broken sitemap,
            missing loc tag, invalid URL, or malformed XML can make discovery
            slower or harder to review.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Sitemap Validator helps you check sitemap XML syntax, inspect
            URL entries, review sitemap index files, check lastmod,
            changefreq, and priority values, and find common sitemap issues
            directly in your browser before submission.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking Sitemap URLs, Lastmod, Changefreq, and Priority
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste sitemap XML content into the input box.</li>
            <li>
              Click <strong>Validate Sitemap</strong>.
            </li>
            <li>Review detected URLs, sitemap index entries, and issues.</li>
            <li>Fix invalid XML or URL problems before search submission.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Sitemap Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking sitemap.xml before submitting it in Search Console.</li>
            <li>Finding missing or empty <strong>loc</strong> values.</li>
            <li>Reviewing sitemap index files that point to multiple sitemaps.</li>
            <li>Checking lastmod date format and priority values.</li>
            <li>Inspecting generated sitemaps from frameworks, CMS tools, or plugins.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example XML Sitemap
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleSitemap}
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
                What does a sitemap validator check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A sitemap validator checks XML syntax, root sitemap elements,
                URL entries, sitemap index entries, loc values, lastmod dates,
                changefreq values, priority values, and common sitemap mistakes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this validate sitemap index files?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool can detect sitemap index files that use
                <strong> sitemapindex</strong> and list child sitemap URLs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this submit the sitemap to Google?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only validates pasted XML content. You still need
                to submit the final sitemap in Google Search Console or another
                webmaster platform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my sitemap uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Sitemap validation happens directly in your browser. Your
                sitemap content is not uploaded to a server.
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
              href="/tools/sitemap-generator"
              className="yoryantra-btn-outline"
            >
              Sitemap Generator
            </Link>

            <Link
              href="/tools/robots-txt-validator"
              className="yoryantra-btn-outline"
            >
              Robots.txt Validator
            </Link>

            <Link
              href="/tools/robots-txt-tester"
              className="yoryantra-btn-outline"
            >
              Robots.txt Tester
            </Link>

            <Link
              href="/tools/xml-validator"
              className="yoryantra-btn-outline"
            >
              XML Validator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function analyzeSitemap(source: string): SitemapReport {
  if (typeof window === "undefined") {
    throw new Error("This tool must run in the browser.");
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(source, "application/xml");
  const parserError = document.querySelector("parsererror");

  if (parserError) {
    return {
      valid: false,
      rootElement: "Not available",
      urls: [],
      sitemapIndexes: [],
      issues: [
        {
          level: "Error",
          message:
            parserError.textContent?.replace(/\s+/g, " ").trim() ||
            "Invalid XML sitemap syntax.",
        },
      ],
    };
  }

  const root = document.documentElement;
  const rootName = root?.tagName || "";
  const issues: SitemapIssue[] = [];
  const urls: SitemapUrl[] = [];
  const sitemapIndexes: string[] = [];

  if (!root) {
    issues.push({
      level: "Error",
      message: "No XML root element was found.",
    });

    return {
      valid: false,
      rootElement: "Not available",
      urls,
      sitemapIndexes,
      issues,
    };
  }

  const normalizedRootName = rootName.toLowerCase();

  if (normalizedRootName !== "urlset" && normalizedRootName !== "sitemapindex") {
    issues.push({
      level: "Error",
      message: "Root element should be urlset or sitemapindex.",
    });
  }

  if (normalizedRootName === "urlset") {
    Array.from(root.getElementsByTagName("url")).forEach((urlElement, index) => {
      const loc = getChildText(urlElement, "loc");
      const lastmod = getChildText(urlElement, "lastmod");
      const changefreq = getChildText(urlElement, "changefreq");
      const priority = getChildText(urlElement, "priority");

      urls.push({
        loc,
        lastmod,
        changefreq,
        priority,
      });

      validateUrlEntry(index + 1, loc, lastmod, changefreq, priority, issues);
    });

    if (!urls.length) {
      issues.push({
        level: "Warning",
        message: "No url entries were found inside urlset.",
      });
    }
  }

  if (normalizedRootName === "sitemapindex") {
    Array.from(root.getElementsByTagName("sitemap")).forEach(
      (sitemapElement, index) => {
        const loc = getChildText(sitemapElement, "loc");
        const lastmod = getChildText(sitemapElement, "lastmod");

        sitemapIndexes.push(loc);

        if (!loc) {
          issues.push({
            level: "Error",
            message: `Sitemap index entry ${index + 1} is missing loc.`,
          });
        } else if (!/^https?:\/\//i.test(loc)) {
          issues.push({
            level: "Warning",
            message: `Sitemap index entry ${index + 1} loc should be an absolute URL.`,
          });
        }

        if (lastmod && !isValidDateLike(lastmod)) {
          issues.push({
            level: "Suggestion",
            message: `Sitemap index entry ${index + 1} has a lastmod value that does not look like a valid date.`,
          });
        }
      }
    );

    if (!sitemapIndexes.length) {
      issues.push({
        level: "Warning",
        message: "No sitemap entries were found inside sitemapindex.",
      });
    }
  }

  if (!source.trim().startsWith("<?xml")) {
    issues.push({
      level: "Suggestion",
      message:
        "XML declaration is missing. Many sitemap files include version and encoding information.",
    });
  }

  if (urls.length > 50000) {
    issues.push({
      level: "Warning",
      message:
        "This sitemap has more than 50,000 URLs. Split large sitemaps into multiple files.",
    });
  }

  return {
    valid: issues.filter((issue) => issue.level === "Error").length === 0,
    rootElement: rootName,
    urls,
    sitemapIndexes,
    issues,
  };
}

function validateUrlEntry(
  index: number,
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
  issues: SitemapIssue[]
) {
  if (!loc) {
    issues.push({
      level: "Error",
      message: `URL entry ${index} is missing loc.`,
    });
  } else if (!/^https?:\/\//i.test(loc)) {
    issues.push({
      level: "Warning",
      message: `URL entry ${index} loc should be an absolute URL.`,
    });
  } else {
    try {
      const url = new URL(loc);

      if (url.hash) {
        issues.push({
          level: "Suggestion",
          message: `URL entry ${index} contains a fragment. Sitemap loc values usually should not include fragments.`,
        });
      }
    } catch {
      issues.push({
        level: "Error",
        message: `URL entry ${index} loc is not a valid URL.`,
      });
    }
  }

  if (lastmod && !isValidDateLike(lastmod)) {
    issues.push({
      level: "Suggestion",
      message: `URL entry ${index} has a lastmod value that does not look like a valid date.`,
    });
  }

  if (changefreq && !validChangefreqValues.includes(changefreq.toLowerCase())) {
    issues.push({
      level: "Suggestion",
      message: `URL entry ${index} has an unknown changefreq value.`,
    });
  }

  if (priority) {
    const priorityNumber = Number(priority);

    if (
      Number.isNaN(priorityNumber) ||
      priorityNumber < 0 ||
      priorityNumber > 1
    ) {
      issues.push({
        level: "Suggestion",
        message: `URL entry ${index} priority should be between 0.0 and 1.0.`,
      });
    }
  }
}

function formatReport(report: SitemapReport) {
  const errorCount = report.issues.filter((issue) => issue.level === "Error").length;
  const warningCount = report.issues.filter((issue) => issue.level === "Warning").length;
  const suggestionCount = report.issues.filter(
    (issue) => issue.level === "Suggestion"
  ).length;

  const lines = [
    "Sitemap validation completed.",
    "",
    `Status: ${report.valid ? "Valid sitemap check" : "Needs review"}`,
    `Root element: ${report.rootElement}`,
    `URL entries: ${report.urls.length}`,
    `Sitemap index entries: ${report.sitemapIndexes.length}`,
    `Errors: ${errorCount}`,
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
  ];

  if (report.urls.length) {
    lines.push("URL samples:");
    report.urls.slice(0, 20).forEach((item, index) => {
      lines.push(`${index + 1}. ${item.loc || "Missing loc"}`);

      if (item.lastmod) {
        lines.push(`   lastmod: ${item.lastmod}`);
      }

      if (item.changefreq) {
        lines.push(`   changefreq: ${item.changefreq}`);
      }

      if (item.priority) {
        lines.push(`   priority: ${item.priority}`);
      }
    });

    if (report.urls.length > 20) {
      lines.push(`...and ${report.urls.length - 20} more URL entries.`);
    }

    lines.push("");
  }

  if (report.sitemapIndexes.length) {
    lines.push("Sitemap index entries:");
    report.sitemapIndexes.slice(0, 20).forEach((item, index) => {
      lines.push(`${index + 1}. ${item || "Missing loc"}`);
    });

    if (report.sitemapIndexes.length > 20) {
      lines.push(
        `...and ${report.sitemapIndexes.length - 20} more sitemap entries.`
      );
    }

    lines.push("");
  }

  lines.push("Issues:");

  if (report.issues.length) {
    report.issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
    });
  } else {
    lines.push("No common sitemap issues found.");
  }

  return lines.join("\n");
}

function getChildText(parent: Element, tagName: string) {
  return parent.getElementsByTagName(tagName)[0]?.textContent?.trim() || "";
}

function isValidDateLike(value: string) {
  return /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value));
}
