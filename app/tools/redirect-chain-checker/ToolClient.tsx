"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type RedirectStep = {
  url: string;
  status: number | string;
  type: string;
};

export default function ToolClient() {
  const [url, setUrl] = useState("");
  const [redirects, setRedirects] = useState<RedirectStep[]>([]);
  const [finalUrl, setFinalUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const checkRedirects = async () => {
    const targetUrl = normalizeUrl(url);

    if (!targetUrl) {
      setError("Please enter a website URL.");
      setRedirects([]);
      setFinalUrl("");
      return;
    }

    setLoading(true);
    setError("");
    setRedirects([]);
    setFinalUrl("");

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
      });

      const redirectChain: RedirectStep[] = [
        {
          url: targetUrl,
          status: response.redirected ? "Redirected" : response.status,
          type: response.redirected ? "Original URL" : "Direct Response",
        },
      ];

      if (response.redirected) {
        redirectChain.push({
          url: response.url,
          status: response.status,
          type: "Final Destination",
        });
      }

      setRedirects(redirectChain);
      setFinalUrl(response.url);
    } catch {
      setError(
        "Unable to check redirects from the browser. The website may block browser requests or restrict cross-origin access."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setUrl("");
    setRedirects([]);
    setFinalUrl("");
    setError("");
    setLoading(false);
  };

  const copyResults = () => {
    const output = redirects
      .map(
        (step, index) =>
          `${index + 1}. ${step.url}\nStatus: ${step.status}\nType: ${step.type}`
      )
      .join("\n\n");

    navigator.clipboard.writeText(output);
  };

  const hasResults = redirects.length > 0;

  const summary = useMemo(() => {
    return {
      hops: redirects.length > 1 ? redirects.length - 1 : 0,
      finalStatus:
        redirects.length > 0
          ? redirects[redirects.length - 1].status
          : "-",
    };
  }, [redirects]);

  return (
    <ToolShell
      title="Redirect Chain Checker"
      description="Analyze redirect chains, redirect hops, status codes, loops, and final destination URLs for technical SEO debugging."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Website URL
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
          onClick={checkRedirects}
          disabled={loading}
          className="yoryantra-btn"
        >
          {loading ? "Checking..." : "Check Redirect Chain"}
        </button>

        <button
          onClick={copyResults}
          disabled={!hasResults}
          className="yoryantra-btn-outline"
        >
          Copy Results
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
			  Redirect Chain Results
			</h3>
		  </div>

		  {hasResults ? (
			<div className="yoryantra-output">
			  <div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-3">
				  <div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					  Redirect Hops
					</p>

					<p className="mt-2 text-lg font-semibold text-gray-900">
					  {summary.hops}
					</p>
				  </div>

				  <div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					  Final Status
					</p>

					<p className="mt-2 text-lg font-semibold text-gray-900">
					  {summary.finalStatus}
					</p>
				  </div>

				  <div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					  Final URL
					</p>

					<p className="mt-2 break-words text-sm text-gray-700">
					  {finalUrl}
					</p>
				  </div>
				</div>

				<div className="space-y-4">
				  {redirects.map((step, index) => (
					<div
					  key={`${step.url}-${index}`}
					  className="rounded-xl border border-gray-200 bg-white p-5"
					>
					  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
						<div>
						  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
							Step {index + 1}
						  </p>

						  <p className="mt-2 break-words text-sm text-gray-700">
							{step.url}
						  </p>
						</div>

						<div className="flex flex-wrap gap-2">
						  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
							{step.status}
						  </span>

						  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
							{step.type}
						  </span>
						</div>
					  </div>
					</div>
				  ))}
				</div>
			  </div>
			</div>
		  ) : (
			<pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
			  Redirect chain results will appear here after checking a URL.
			</pre>
		  )}
		</div>

      {/* NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser Request Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          This checker runs in the browser. Some websites may block cross-origin
          requests or restrict redirect visibility, so results may differ from
          server-side redirect crawlers.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding Redirect Chains
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Redirect chains happen when one URL redirects to another URL, which
            then redirects again before reaching the final destination. Multiple
            redirect hops can slow down page loading, reduce crawl efficiency,
            and create technical SEO issues.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Redirect Chain Checker helps developers, SEO teams, and site
            owners inspect redirect behavior, final URLs, status codes, and
            redirect hops during debugging and optimization workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Redirect Chain Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the URL you want to inspect.</li>
            <li>Click <strong>Check Redirect Chain</strong>.</li>
            <li>Review redirect hops and status codes.</li>
            <li>Check the final destination URL.</li>
            <li>Identify unnecessary redirects or SEO inefficiencies.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Redirect Status Codes
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>301 — Permanent Redirect</li>
            <li>302 — Temporary Redirect</li>
            <li>307 — Temporary Redirect preserving request method</li>
            <li>308 — Permanent Redirect preserving request method</li>
            <li>200 — Successful final destination response</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Redirect Chains Matter for SEO
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Crawl efficiency:</strong>{" "}
                Multiple redirect hops can waste crawl budget and slow indexing.
              </li>

              <li>
                <strong>Page performance:</strong>{" "}
                Redirect chains increase request time before users reach the final page.
              </li>

              <li>
                <strong>Technical SEO:</strong>{" "}
                Long redirect chains can create avoidable SEO complexity during migrations and URL updates.
              </li>

              <li>
                <strong>User experience:</strong>{" "}
                Cleaner redirects improve loading consistency and navigation flow.
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
                What is a redirect chain?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A redirect chain happens when one redirected URL points to
                another redirected URL before reaching the final destination page.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are redirect chains bad for SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Redirect chains can slow crawling, increase latency, reduce
                efficiency, and create technical SEO issues during indexing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I use 301 or 302 redirects?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Use 301 redirects for permanent URL changes and 302 redirects
                for temporary changes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool detect redirect loops?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Browser-based checks may not always fully expose redirect loops,
                but repeated redirect behavior can indicate a loop issue.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Redirect analysis often connects with canonical URLs, HTTP headers,
            technical SEO debugging, sitemap management, and crawl optimization.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>

            <Link
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
            </Link>

            <Link
              href="/tools/http-headers-checker"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Checker
            </Link>

            <Link
              href="/tools/sitemap-generator"
              className="yoryantra-btn-outline"
            >
              Sitemap Generator
            </Link>

            <Link
              href="/categories/seo-tools"
              className="yoryantra-btn-outline"
            >
              SEO Tools
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
