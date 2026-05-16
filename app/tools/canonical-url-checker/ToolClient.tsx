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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Canonical URLs Matter for SEO
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Canonical URLs help search engines understand which version of a
            page should be treated as the primary version for indexing and
            ranking. They are commonly used to prevent duplicate content issues
            caused by query parameters, category pages, pagination, tracking
            URLs, or multiple versions of the same content.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During technical SEO audits, incorrect canonical tags can split
            ranking signals, confuse search engines, reduce crawl efficiency,
            and create indexing problems. This checker helps validate whether a
            page URL matches the intended canonical URL.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for SEO audits, content migrations, blog
            optimization, ecommerce product pages, multilingual websites,
            frontend routing systems, and duplicate content debugging directly
            inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Canonical URL Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the page URL you want to inspect.</li>

            <li>
              Enter the canonical URL configured for the page.
            </li>

            <li>
              Click <strong>Check Canonical URL</strong>.
            </li>

            <li>
              Review whether the canonical URL matches the page URL.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking duplicate content SEO setups.</li>

            <li>Validating canonical tags during site migrations.</li>

            <li>Auditing ecommerce product and category pages.</li>

            <li>Reviewing tracking parameter canonicalization.</li>

            <li>Testing preferred indexed URLs.</li>

            <li>Improving technical SEO structure.</li>

            <li>Debugging indexing inconsistencies in search engines.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Canonical URL Validation
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Page URL:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
https://example.com/blog-post?utm_source=twitter
            </pre>

            <p className="mt-4">Canonical URL:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
https://example.com/blog-post
            </pre>

            <p className="mt-4">Validation Result:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Canonical URL is different from the page URL.
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Canonical SEO Scenarios
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Tracking URLs:</strong> Canonical tags help consolidate
                ranking signals from URLs containing UTM parameters.
              </li>

              <li>
                <strong>Pagination:</strong> Similar pages may point to a
                preferred canonical version.
              </li>

              <li>
                <strong>Ecommerce filters:</strong> Filtered category URLs can
                create duplicate content variations.
              </li>

              <li>
                <strong>HTTP vs HTTPS:</strong> Canonical tags help reinforce
                the preferred secure version of a page.
              </li>
            </ul>
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
                A canonical URL tells search engines which version of a page
                should be treated as the primary version for indexing and
                ranking.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are canonical tags important for SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Canonical tags help prevent duplicate content issues and
                consolidate SEO ranking signals across multiple versions of
                similar pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should canonical URLs always match the page URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Not always. Some pages intentionally point to a different
                canonical URL to consolidate indexing signals.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can canonical tags affect Google indexing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Incorrect canonical tags can confuse search engines and
                affect which pages are indexed or ranked.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is canonical validation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Canonical URL validation happens directly inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Canonical URL auditing often connects with redirects, meta tags,
            sitemaps, robots.txt configuration, duplicate content analysis, and
            technical SEO workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>

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