"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [pageUrl, setPageUrl] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const checkCanonical = () => {
    try {
      if (!pageUrl.trim()) {
        setError("Please enter the page URL.");
        setOutput("");
        return;
      }

      if (!canonicalUrl.trim()) {
        setError("Please enter the canonical URL.");
        setOutput("");
        return;
      }

      const normalizedPage = new URL(pageUrl).href;
      const normalizedCanonical =
        new URL(canonicalUrl).href;

      if (
        normalizedPage === normalizedCanonical
      ) {
        setOutput(
          "Canonical URL matches the page URL."
        );
      } else {
        setOutput(
          "Canonical URL is different from the page URL."
        );
      }

      setError("");
    } catch {
      setError("Please enter valid URLs.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setPageUrl("");
    setCanonicalUrl("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Canonical URL Checker"
      description="Check and validate canonical URLs instantly with this free online Canonical URL Checker."
    >
      {/* PAGE URL */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Page URL
        </label>

        <input
          type="url"
          value={pageUrl}
          onChange={(e) =>
            setPageUrl(e.target.value)
          }
          placeholder="https://example.com/blog-post"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* CANONICAL URL */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Canonical URL
        </label>

        <input
          type="url"
          value={canonicalUrl}
          onChange={(e) =>
            setCanonicalUrl(e.target.value)
          }
          placeholder="https://example.com/blog-post"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={checkCanonical}
          className="yoryantra-btn"
        >
          Check Canonical URL
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output ||
            "Canonical URL validation result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Canonical URL Checker?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Canonical URL Checker helps you
            validate canonical URLs instantly. It is
            useful for SEO professionals, bloggers,
            developers, marketers, and website
            owners managing duplicate content issues.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Canonical URLs help search engines
            understand which version of a page should
            be indexed and ranked in search results.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Canonical URL Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the page URL.</li>
            <li>Enter the canonical URL.</li>
            <li>
              Click <strong>Check Canonical URL</strong>.
            </li>
            <li>Review the validation result.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking duplicate content setup.</li>
            <li>Validating canonical tags.</li>
            <li>Auditing SEO page structure.</li>
            <li>Testing preferred indexed URLs.</li>
            <li>Improving technical SEO.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              Page URL:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
https://example.com/blog-post
            </pre>

            <p className="mt-4">
              Canonical URL:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
https://example.com/blog-post
            </pre>

            <p className="mt-4">
              Result:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Canonical URL matches the page URL.
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
                What is a canonical URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A canonical URL tells search engines
                which version of a page should be
                indexed and treated as primary.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are canonical tags important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Canonical tags help prevent duplicate
                content issues and consolidate SEO
                ranking signals.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should canonical URLs always match?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Not always. Some pages intentionally
                point to a different canonical URL.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Canonical URL validation happens
                directly in your browser.
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
              href="/tools/robots-txt-tester"
              className="yoryantra-btn-outline"
            >
              Robots.txt Tester
            </Link>

            <Link
              href="/tools/sitemap-generator"
              className="yoryantra-btn-outline"
            >
              Sitemap Generator
            </Link>

            <Link
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
