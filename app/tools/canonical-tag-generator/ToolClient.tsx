"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type CanonicalIssue = {
  level: "Warning" | "Suggestion";
  message: string;
};

type OutputMode = "html" | "nextjs" | "json";

const sampleUrl = "https://yoryantra.com/tools/canonical-tag-generator";

export default function ToolClient() {
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("html");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generateCanonical = () => {
    if (!canonicalUrl.trim()) {
      setError("Please enter a canonical URL.");
      setOutput("");
      return;
    }

    try {
      const normalizedUrl = normalizeCanonicalUrl(canonicalUrl.trim());
      const issues = analyzeCanonicalUrl(normalizedUrl);
      const generated = buildCanonicalOutput(normalizedUrl, outputMode, issues);

      setOutput(generated);
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to generate a canonical tag for this URL.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setCanonicalUrl(sampleUrl);
    setOutputMode("html");
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setCanonicalUrl("");
    setOutputMode("html");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Canonical Tag Generator"
      description="Generate canonical link tags, review canonical URL format, and prepare SEO canonical markup in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Canonical URL
        </label>

        <input
          value={canonicalUrl}
          onChange={(event) => setCanonicalUrl(event.target.value)}
          placeholder={sampleUrl}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Enter the final preferred URL for the page. Canonical URLs should
          usually be absolute, clean, and indexable.
        </p>
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Output Format
        </label>

        <YoryantraSelect
          value={outputMode}
          onChange={(value) => {
            setOutputMode(value as OutputMode);
            setOutput("");
            setError("");
          }}
          options={[
            { label: "HTML link tag", value: "html" },
            { label: "Next.js metadata alternates", value: "nextjs" },
            { label: "JSON summary", value: "json" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateCanonical} className="yoryantra-btn">
          Generate Canonical Tag
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
            Generated Canonical Markup
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
          {output || "Canonical tag output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        A canonical tag is a search signal, not a forced redirect. Make sure the
        canonical URL matches the preferred indexable page.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Creating Canonical Tags for Cleaner SEO Signals
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Canonical tags help search engines understand the preferred version
            of a page when similar or duplicate URLs exist. They are commonly
            used for pages with tracking parameters, duplicate paths, filtered
            URLs, print versions, HTTP to HTTPS cleanup, and www or non-www
            consistency.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Canonical Tag Generator helps you create canonical link tags,
            review canonical URL format, prepare Next.js metadata snippets, and
            catch common canonical URL issues directly in your browser before
            publishing technical SEO changes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preparing Canonical Markup Before Publishing Pages
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the preferred canonical URL for the page.</li>
            <li>Select HTML, Next.js metadata, or JSON output.</li>
            <li>
              Click <strong>Generate Canonical Tag</strong>.
            </li>
            <li>Review warnings and copy the generated markup.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Canonical Tag Generator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating canonical tags for new SEO pages.</li>
            <li>Cleaning duplicate URLs with query parameters.</li>
            <li>Preparing canonical metadata for Next.js pages.</li>
            <li>Checking whether a canonical URL is absolute and clean.</li>
            <li>Reviewing canonical tags before submitting pages for indexing.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Canonical Tag
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<link rel="canonical" href="https://yoryantra.com/tools/canonical-tag-generator" />`}
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
                What does a canonical tag generator do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It creates canonical link tag markup from a preferred page URL.
                This helps you prepare the canonical HTML or metadata before
                adding it to a page template.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should canonical URLs be absolute?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Canonical URLs should usually be absolute URLs with the
                full protocol and domain, such as https://example.com/page.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is a canonical tag the same as a redirect?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. A canonical tag is an SEO signal that points to the
                preferred version of a page. A redirect actually sends users and
                crawlers to another URL.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my canonical URL uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Canonical tag generation happens directly in your browser.
                Your URL is not uploaded to a server.
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
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
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
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function normalizeCanonicalUrl(value: string) {
  const trimmed = value.trim();

  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Canonical URL should start with http:// or https://.");
  }

  const url = new URL(trimmed);

  url.hash = "";

  return url.toString();
}

function analyzeCanonicalUrl(value: string): CanonicalIssue[] {
  const issues: CanonicalIssue[] = [];
  const url = new URL(value);

  if (url.protocol !== "https:") {
    issues.push({
      level: "Warning",
      message: "Canonical URL is not HTTPS. HTTPS is usually preferred for live sites.",
    });
  }

  if (url.search) {
    issues.push({
      level: "Suggestion",
      message: "Canonical URL contains query parameters. Confirm this is intentional.",
    });
  }

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    issues.push({
      level: "Suggestion",
      message: "Canonical URL has a trailing slash. Make sure it matches your preferred URL style.",
    });
  }

  if (url.hostname.startsWith("www.")) {
    issues.push({
      level: "Suggestion",
      message: "Canonical URL uses www. Make sure this matches your preferred domain version.",
    });
  }

  if (value.includes("#")) {
    issues.push({
      level: "Suggestion",
      message: "URL fragments are removed from canonical URLs.",
    });
  }

  return issues;
}

function buildCanonicalOutput(
  canonicalUrl: string,
  mode: OutputMode,
  issues: CanonicalIssue[]
) {
  const report = formatIssueReport(issues);

  if (mode === "html") {
    return [
      `<link rel="canonical" href="${canonicalUrl}" />`,
      "",
      report,
    ].join("\n");
  }

  if (mode === "nextjs") {
    return [
      "alternates: {",
      `  canonical: "${canonicalUrl}",`,
      "},",
      "",
      report,
    ].join("\n");
  }

  return JSON.stringify(
    {
      canonical: canonicalUrl,
      issues,
    },
    null,
    2
  );
}

function formatIssueReport(issues: CanonicalIssue[]) {
  if (!issues.length) {
    return [
      "Canonical URL review:",
      "- No common canonical URL issues found.",
    ].join("\n");
  }

  const lines = ["Canonical URL review:"];

  issues.forEach((issue, index) => {
    lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
  });

  return lines.join("\n");
}
