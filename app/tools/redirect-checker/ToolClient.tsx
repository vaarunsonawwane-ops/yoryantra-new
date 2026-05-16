"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const checkRedirect = () => {
    try {
      if (!url.trim()) {
        setError("Please enter a URL.");
        setOutput("");
        return;
      }

      const parsedUrl = new URL(url);

      setOutput(
        `URL looks valid.\n\nRedirect testing requires live server response checking, which browsers restrict for security reasons.\n\nUse this tool to validate and inspect redirect-ready URLs before deployment.`
      );

      setError("");
    } catch {
      setError("Please enter a valid URL.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setUrl("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Redirect Checker"
      description="Check URL redirects and HTTP redirect status instantly with this free online Redirect Checker."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          URL
        </label>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={checkRedirect}
          className="yoryantra-btn"
        >
          Check Redirect
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
            Redirect Result
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

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "Redirect validation result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Redirect Checker?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Redirect Checker helps you validate
            URLs and inspect redirect-ready links for
            SEO, website migrations, canonicalization,
            and technical audits.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Redirects are important for preserving SEO
            rankings, improving user experience, and
            ensuring search engines reach the correct
            destination pages.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Redirect Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the URL you want to inspect.</li>
            <li>
              Click <strong>Check Redirect</strong>.
            </li>
            <li>Review the validation result.</li>
            <li>Use the URL in your SEO workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Preparing website migrations.</li>
            <li>Checking redirect-ready URLs.</li>
            <li>Auditing SEO redirect structures.</li>
            <li>Validating canonical destination URLs.</li>
            <li>Improving technical SEO workflows.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Redirect Status Codes
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>301:</strong> Permanent Redirect
              </li>

              <li>
                <strong>302:</strong> Temporary Redirect
              </li>

              <li>
                <strong>307:</strong> Temporary Redirect
              </li>

              <li>
                <strong>308:</strong> Permanent Redirect
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
                What is a redirect?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A redirect automatically sends users
                and search engines from one URL to
                another.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are redirects important for SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Redirects help preserve rankings,
                prevent broken links, and consolidate
                search engine signals.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is a 301 redirect?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A 301 redirect is a permanent redirect
                commonly used during URL migrations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool follow live redirects?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Browser security restrictions limit
                direct live redirect inspection in
                client-side tools.
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
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
