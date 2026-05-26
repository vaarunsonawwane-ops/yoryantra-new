"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type MetaCheck = {
  label: string;
  value: string;
  status: "Found" | "Missing" | "Warning";
  note: string;
};

const sampleHtml = `<!doctype html>
<html lang="en">
<head>
  <title>Yoryantra | Practical Tools for Everyday Work</title>
  <meta name="description" content="Simple browser tools to help you format, convert, check, clean, validate, and prepare things quickly.">
  <link rel="canonical" href="https://yoryantra.com/">
  <meta name="robots" content="index, follow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="og:title" content="Yoryantra | Practical Tools for Everyday Work">
  <meta property="og:description" content="Simple browser tools for everyday work.">
  <meta property="og:url" content="https://yoryantra.com/">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>Practical tools for everyday work</h1>
</body>
</html>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const checkMetaTags = () => {
    if (!input.trim()) {
      setError("Please paste HTML source code to check meta tags.");
      setOutput("");
      return;
    }

    try {
      const checks = analyzeMetaTags(input);
      setOutput(formatReport(checks));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to check meta tags from this HTML.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleHtml);
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
      title="Meta Tags Checker"
      description="Check title tags, meta descriptions, canonical links, Open Graph tags, Twitter card tags, and common SEO page signals."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTML Source
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleHtml}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste the HTML source of a page to inspect its SEO meta tags. This
          tool does not fetch remote pages, so there are no CORS issues.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkMetaTags} className="yoryantra-btn">
          Check Meta Tags
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
            Meta Tag Report
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
          {output || "Meta tag check results will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Meta Tags Before Publishing Pages
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Meta tags help search engines, browsers, and social platforms
            understand how a page should appear. A missing title tag, weak meta
            description, wrong canonical link, or incomplete Open Graph tags can
            make a page harder to review before publishing.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Meta Tags Checker helps you inspect title tags, meta
            descriptions, robots tags, canonical links, Open Graph tags, Twitter
            card tags, viewport settings, and common SEO page signals directly
            in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing SEO Tags from HTML Source
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Open the page source of the page you want to check.</li>
            <li>Copy the HTML source and paste it into the input box.</li>
            <li>
              Click <strong>Check Meta Tags</strong>.
            </li>
            <li>Review missing tags, warnings, and useful SEO signals.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Meta Tag Checker Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking title tags and meta descriptions before publishing.</li>
            <li>Reviewing canonical tags on important SEO pages.</li>
            <li>Checking Open Graph tags used for social sharing previews.</li>
            <li>Inspecting Twitter card tags for shared links.</li>
            <li>Finding missing robots, viewport, or language signals.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example HTML with Meta Tags
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleHtml}
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
                What does a meta tags checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A meta tags checker reads HTML and reports important page tags
                such as the title, meta description, canonical link, robots tag,
                Open Graph tags, and Twitter card tags.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why should I check title and meta description length?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Very short or very long titles and descriptions may not display
                well in search results. This tool gives quick length warnings so
                you can review them before publishing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool fetch a URL automatically?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This browser tool checks pasted HTML source. That keeps the
                tool simple and avoids browser restrictions when fetching
                external pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my HTML uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The meta tag check happens directly in your browser. Your
                HTML source is not uploaded to a server.
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
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
            </Link>

            <Link
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>

            <Link
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
            </Link>

            <Link
              href="/tools/robots-txt-tester"
              className="yoryantra-btn-outline"
            >
              Robots.txt Tester
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function analyzeMetaTags(source: string) {
  if (typeof window === "undefined") {
    throw new Error("This tool must run in the browser.");
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(source, "text/html");
  const title = document.querySelector("title")?.textContent?.trim() || "";
  const description = getMetaContent(document, "name", "description");
  const robots = getMetaContent(document, "name", "robots");
  const viewport = getMetaContent(document, "name", "viewport");
  const charset =
    document.querySelector("meta[charset]")?.getAttribute("charset") || "";
  const canonical =
    document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
  const htmlLang = document.documentElement.getAttribute("lang") || "";
  const h1Count = document.querySelectorAll("h1").length;

  const checks: MetaCheck[] = [
    checkValue("Title tag", title, "Found", getTitleNote(title)),
    checkValue(
      "Meta description",
      description,
      "Found",
      getDescriptionNote(description)
    ),
    checkValue(
      "Canonical link",
      canonical,
      "Found",
      canonical ? "Canonical URL is present." : "Canonical link is missing."
    ),
    checkValue(
      "Robots meta tag",
      robots,
      "Found",
      robots ? "Robots meta tag is present." : "Robots meta tag is missing."
    ),
    checkValue(
      "Viewport meta tag",
      viewport,
      "Found",
      viewport
        ? "Viewport tag is present."
        : "Viewport tag is missing. It is important for mobile pages."
    ),
    checkValue(
      "Charset",
      charset,
      "Found",
      charset ? "Charset is present." : "Charset meta tag is missing."
    ),
    checkValue(
      "HTML lang",
      htmlLang,
      "Found",
      htmlLang
        ? "HTML language attribute is present."
        : "HTML lang attribute is missing."
    ),
    {
      label: "H1 count",
      value: String(h1Count),
      status: h1Count === 1 ? "Found" : "Warning",
      note:
        h1Count === 1
          ? "One H1 heading found."
          : "Review H1 usage. Most pages should have one clear H1.",
    },
    checkValue(
      "Open Graph title",
      getMetaContent(document, "property", "og:title"),
      "Found",
      "Used for social sharing previews."
    ),
    checkValue(
      "Open Graph description",
      getMetaContent(document, "property", "og:description"),
      "Found",
      "Used for social sharing previews."
    ),
    checkValue(
      "Open Graph URL",
      getMetaContent(document, "property", "og:url"),
      "Found",
      "Used for social sharing previews."
    ),
    checkValue(
      "Open Graph type",
      getMetaContent(document, "property", "og:type"),
      "Found",
      "Used for social sharing previews."
    ),
    checkValue(
      "Twitter card",
      getMetaContent(document, "name", "twitter:card"),
      "Found",
      "Used for Twitter/X link previews."
    ),
    checkValue(
      "Twitter title",
      getMetaContent(document, "name", "twitter:title"),
      "Found",
      "Used for Twitter/X link previews."
    ),
    checkValue(
      "Twitter description",
      getMetaContent(document, "name", "twitter:description"),
      "Found",
      "Used for Twitter/X link previews."
    ),
  ];

  return checks;
}

function getMetaContent(
  document: Document,
  attribute: "name" | "property",
  value: string
) {
  return (
    document
      .querySelector(`meta[${attribute}="${value}"]`)
      ?.getAttribute("content")
      ?.trim() || ""
  );
}

function checkValue(
  label: string,
  value: string,
  presentStatus: "Found",
  note: string
): MetaCheck {
  return {
    label,
    value: value || "-",
    status: value ? presentStatus : "Missing",
    note,
  };
}

function getTitleNote(title: string) {
  if (!title) {
    return "Title tag is missing.";
  }

  if (title.length < 30) {
    return "Title is present but may be short.";
  }

  if (title.length > 65) {
    return "Title is present but may be long for search results.";
  }

  return "Title length looks reasonable.";
}

function getDescriptionNote(description: string) {
  if (!description) {
    return "Meta description is missing.";
  }

  if (description.length < 70) {
    return "Meta description is present but may be short.";
  }

  if (description.length > 170) {
    return "Meta description is present but may be long.";
  }

  return "Meta description length looks reasonable.";
}

function formatReport(checks: MetaCheck[]) {
  const foundCount = checks.filter((check) => check.status === "Found").length;
  const warningCount = checks.filter(
    (check) => check.status === "Warning"
  ).length;
  const missingCount = checks.filter(
    (check) => check.status === "Missing"
  ).length;

  const lines = [
    "Meta tag check completed.",
    "",
    `Found: ${foundCount}`,
    `Warnings: ${warningCount}`,
    `Missing: ${missingCount}`,
    "",
    "Results:",
    "",
  ];

  checks.forEach((check, index) => {
    lines.push(`${index + 1}. ${check.label}`);
    lines.push(`   Status: ${check.status}`);
    lines.push(`   Value: ${check.value}`);
    lines.push(`   Note: ${check.note}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}
