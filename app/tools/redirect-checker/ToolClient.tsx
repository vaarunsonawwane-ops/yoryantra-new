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

      new URL(url);

      setOutput(
        `URL looks valid.\n\nLive redirect inspection requires server-side request checking, which browsers restrict for security reasons.\n\nUse this tool to validate redirect-ready URLs during SEO audits, migrations, API workflows, and deployment checks.`
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
      description="Check redirect-ready URLs and understand HTTP redirects with this free online Redirect Checker."
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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Following Redirects Without Guesswork
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Redirects help browsers, search engines, APIs, and applications
            move traffic from one URL to another. They are commonly used during
            website migrations, domain changes, canonicalization, HTTPS
            upgrades, shortened links, authentication flows, and SEO cleanup.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During debugging workflows, redirect chains and invalid destination
            URLs can create broken pages, SEO issues, failed API requests,
            caching problems, or infinite redirect loops. This tool helps
            validate redirect-ready URLs before deployment or troubleshooting.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The checker is useful for technical SEO audits, frontend routing,
            API integrations, deployment validation, redirect mapping, and URL
            migration workflows directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Redirect Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the URL you want to inspect.</li>

            <li>
              Click <strong>Check Redirect</strong>.
            </li>

            <li>
              Review the validation result and redirect guidance.
            </li>

            <li>
              Use the URL during SEO, deployment, or debugging workflows.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Preparing website migrations and domain changes.</li>

            <li>Reviewing redirect chains during SEO audits.</li>

            <li>Checking canonical destination URLs.</li>

            <li>Debugging redirect loops and broken links.</li>

            <li>Inspecting shortened tracking URLs.</li>

            <li>Testing frontend routing and navigation flows.</li>

            <li>Validating API callback and OAuth redirect URLs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Redirect Status Codes
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>301:</strong> Permanent redirect commonly used during
                migrations and canonical URL changes.
              </li>

              <li>
                <strong>302:</strong> Temporary redirect often used for testing
                or short-term routing changes.
              </li>

              <li>
                <strong>307:</strong> Temporary redirect that preserves the
                original request method.
              </li>

              <li>
                <strong>308:</strong> Permanent redirect that preserves the
                original request method.
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
                A redirect automatically sends browsers, users, APIs, or search
                engines from one URL to another destination URL.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are redirects important for SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Redirects help preserve rankings, consolidate search signals,
                avoid broken links, and guide search engines toward the correct
                canonical pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between 301 and 302 redirects?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A 301 redirect indicates a permanent move, while a 302 redirect
                indicates a temporary redirect.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do redirect loops happen?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Redirect loops occur when URLs redirect back to each other
                repeatedly, preventing browsers from reaching the final
                destination page.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool follow live redirects?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Browser security restrictions limit direct live redirect
                inspection inside fully client-side tools.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Redirect debugging often connects with HTTP status codes, tracking
            URLs, query parameters, headers, canonicalization, and SEO auditing
            workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-status-code-explorer"
              className="yoryantra-btn-outline"
            >
              HTTP Status Code Explorer
            </Link>

            <Link
              href="/tools/url-query-params-parser"
              className="yoryantra-btn-outline"
            >
              URL Query Params Parser
            </Link>

            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
            </Link>

            <Link
              href="/tools/curl-command-builder"
              className="yoryantra-btn-outline"
            >
              CURL Command Builder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}