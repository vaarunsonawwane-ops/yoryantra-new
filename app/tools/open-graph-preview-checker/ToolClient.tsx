"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type OgData = {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

type OgIssue = {
  level: "Warning" | "Suggestion";
  message: string;
};

const sampleHtml = `<!doctype html>
<html lang="en">
<head>
  <title>Yoryantra | Practical Tools for Everyday Work</title>
  <meta name="description" content="Simple browser tools to help you format, convert, check, clean, validate, and prepare things quickly.">

  <meta property="og:title" content="Yoryantra | Practical Tools for Everyday Work">
  <meta property="og:description" content="Simple browser tools for everyday work.">
  <meta property="og:image" content="https://yoryantra.com/og-image.png">
  <meta property="og:url" content="https://yoryantra.com/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Yoryantra">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Yoryantra | Practical Tools for Everyday Work">
  <meta name="twitter:description" content="Simple browser tools for everyday work.">
  <meta name="twitter:image" content="https://yoryantra.com/og-image.png">
</head>
<body>
  <h1>Yoryantra</h1>
</body>
</html>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [preview, setPreview] = useState<OgData | null>(null);
  const [error, setError] = useState("");

  const checkOpenGraph = () => {
    if (!input.trim()) {
      setError("Please paste HTML source code to check Open Graph tags.");
      setOutput("");
      setPreview(null);
      return;
    }

    try {
      const result = extractOpenGraphData(input);
      const issues = analyzeOpenGraphData(result);

      setPreview(result);
      setOutput(formatReport(result, issues));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to check Open Graph tags from this HTML.";

      setError(message);
      setOutput("");
      setPreview(null);
    }
  };

  const loadExample = () => {
    setInput(sampleHtml);
    setOutput("");
    setPreview(null);
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setPreview(null);
    setError("");
  };

  return (
    <ToolShell
      title="Open Graph Preview Checker"
      description="Check Open Graph tags, inspect social preview fields, and review Twitter card metadata from HTML source."
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
          Paste page HTML to check Open Graph and Twitter card tags. This tool
          does not fetch remote URLs, so your HTML stays in the browser.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkOpenGraph} className="yoryantra-btn">
          Check Open Graph
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

      {preview && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Social Preview
          </h3>

          <div className="mt-4 max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex min-h-[180px] items-center justify-center bg-gray-100 px-6 text-center text-sm text-gray-500">
              {preview.image ? (
                <span className="break-all">
                  Image URL: {preview.image}
                </span>
              ) : (
                "No og:image found"
              )}
            </div>

            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {preview.siteName || getHostFromUrl(preview.url) || "Preview"}
              </p>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {preview.title || "No Open Graph title found"}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {preview.description || "No Open Graph description found"}
              </p>

              {preview.url && (
                <p className="mt-3 break-all text-xs text-gray-500">
                  {preview.url}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Open Graph Report
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
          {output || "Open Graph check results will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Open Graph Tags Before Sharing Pages
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Open Graph tags control how a page can appear when shared on social
            platforms and messaging apps. Missing or weak values for og:title,
            og:description, og:image, or og:url can make link previews look
            incomplete or unclear.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Open Graph Preview Checker helps you inspect Open Graph tags,
            Twitter card metadata, social preview text, image URLs, and common
            sharing tag issues directly in your browser before publishing or
            sharing a page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing Social Preview Metadata from HTML
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Copy the HTML source from the page you want to check.</li>
            <li>Paste the HTML into the input box.</li>
            <li>
              Click <strong>Check Open Graph</strong>.
            </li>
            <li>Review the preview, extracted tags, warnings, and suggestions.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Open Graph Checker Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking og:title and og:description before publishing pages.</li>
            <li>Reviewing og:image URLs used for social link previews.</li>
            <li>Checking Twitter card tags alongside Open Graph tags.</li>
            <li>Finding missing or weak social preview metadata.</li>
            <li>Reviewing shared link previews for SEO and content pages.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example HTML with Open Graph Tags
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
                What does an Open Graph checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads HTML source and extracts Open Graph tags such as
                og:title, og:description, og:image, og:url, og:type, and
                og:site_name so you can review social preview metadata.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this show an exact social media preview?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It gives a clean browser preview based on your tags. Actual
                platforms may crop images or display text differently.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this check Twitter card tags too?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The report also checks common Twitter card tags such as
                twitter:card, twitter:title, twitter:description, and
                twitter:image.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my HTML uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The Open Graph check happens directly in your browser. Your
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
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>

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

function extractOpenGraphData(source: string): OgData {
  if (typeof window === "undefined") {
    throw new Error("This tool must run in the browser.");
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(source, "text/html");

  return {
    title:
      getMeta(document, "property", "og:title") ||
      document.querySelector("title")?.textContent?.trim() ||
      "",
    description:
      getMeta(document, "property", "og:description") ||
      getMeta(document, "name", "description"),
    image:
      getMeta(document, "property", "og:image") ||
      getMeta(document, "name", "twitter:image"),
    url: getMeta(document, "property", "og:url"),
    type: getMeta(document, "property", "og:type"),
    siteName: getMeta(document, "property", "og:site_name"),
    twitterCard: getMeta(document, "name", "twitter:card"),
    twitterTitle: getMeta(document, "name", "twitter:title"),
    twitterDescription: getMeta(document, "name", "twitter:description"),
    twitterImage: getMeta(document, "name", "twitter:image"),
  };
}

function analyzeOpenGraphData(data: OgData): OgIssue[] {
  const issues: OgIssue[] = [];

  if (!data.title) {
    issues.push({
      level: "Warning",
      message: "Missing og:title or title fallback.",
    });
  } else if (data.title.length > 70) {
    issues.push({
      level: "Suggestion",
      message: "Open Graph title may be long for social previews.",
    });
  }

  if (!data.description) {
    issues.push({
      level: "Warning",
      message: "Missing og:description or meta description fallback.",
    });
  } else if (data.description.length > 200) {
    issues.push({
      level: "Suggestion",
      message: "Open Graph description may be long for social previews.",
    });
  }

  if (!data.image) {
    issues.push({
      level: "Warning",
      message: "Missing og:image. Social previews often need an image.",
    });
  } else if (!/^https?:\/\//i.test(data.image)) {
    issues.push({
      level: "Suggestion",
      message: "og:image should usually be an absolute URL.",
    });
  }

  if (!data.url) {
    issues.push({
      level: "Suggestion",
      message: "Missing og:url. Add the canonical sharing URL when possible.",
    });
  }

  if (!data.type) {
    issues.push({
      level: "Suggestion",
      message: "Missing og:type. Common value for pages is website or article.",
    });
  }

  if (!data.twitterCard) {
    issues.push({
      level: "Suggestion",
      message: "Missing twitter:card. Add it for better Twitter/X previews.",
    });
  }

  return issues;
}

function formatReport(data: OgData, issues: OgIssue[]) {
  const warningCount = issues.filter((issue) => issue.level === "Warning").length;
  const suggestionCount = issues.filter(
    (issue) => issue.level === "Suggestion"
  ).length;

  const lines = [
    "Open Graph check completed.",
    "",
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
    "Open Graph tags:",
    `og:title: ${data.title || "Not found"}`,
    `og:description: ${data.description || "Not found"}`,
    `og:image: ${data.image || "Not found"}`,
    `og:url: ${data.url || "Not found"}`,
    `og:type: ${data.type || "Not found"}`,
    `og:site_name: ${data.siteName || "Not found"}`,
    "",
    "Twitter card tags:",
    `twitter:card: ${data.twitterCard || "Not found"}`,
    `twitter:title: ${data.twitterTitle || "Not found"}`,
    `twitter:description: ${data.twitterDescription || "Not found"}`,
    `twitter:image: ${data.twitterImage || "Not found"}`,
    "",
    "Issues:",
  ];

  if (issues.length) {
    issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
    });
  } else {
    lines.push("No common Open Graph issues found.");
  }

  return lines.join("\n");
}

function getMeta(
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

function getHostFromUrl(value: string) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}
