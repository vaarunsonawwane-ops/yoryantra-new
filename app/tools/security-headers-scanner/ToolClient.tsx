"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type HeaderResult = {
  name: string;
  label: string;
  value: string | null;
  status: "found" | "missing";
  severity: "High" | "Medium" | "Low";
  purpose: string;
  suggestion: string;
};

const securityHeaderRules = [
  {
    name: "content-security-policy",
    label: "Content-Security-Policy",
    severity: "High" as const,
    purpose:
      "Helps reduce cross-site scripting and content injection risks by controlling which sources can load scripts, styles, images, frames, and other resources.",
    suggestion:
      "Add a Content-Security-Policy header with carefully defined source rules. Start with a strict policy and test before enforcing it on production pages.",
  },
  {
    name: "strict-transport-security",
    label: "Strict-Transport-Security",
    severity: "High" as const,
    purpose:
      "Tells browsers to use HTTPS for future visits, reducing downgrade and protocol-based risks.",
    suggestion:
      "Add Strict-Transport-Security with an appropriate max-age value after confirming HTTPS works correctly across the site.",
  },
  {
    name: "x-frame-options",
    label: "X-Frame-Options",
    severity: "Medium" as const,
    purpose:
      "Helps protect pages from clickjacking by controlling whether the page can be embedded inside frames.",
    suggestion:
      "Use DENY or SAMEORIGIN where framing is not required. For newer setups, also review frame-ancestors in Content-Security-Policy.",
  },
  {
    name: "x-content-type-options",
    label: "X-Content-Type-Options",
    severity: "Medium" as const,
    purpose:
      "Helps prevent browsers from MIME-sniffing responses away from the declared Content-Type.",
    suggestion:
      "Use X-Content-Type-Options: nosniff for most web responses.",
  },
  {
    name: "referrer-policy",
    label: "Referrer-Policy",
    severity: "Medium" as const,
    purpose:
      "Controls how much referrer information is sent when users navigate from one page to another.",
    suggestion:
      "Use a privacy-conscious policy such as strict-origin-when-cross-origin or no-referrer depending on your requirements.",
  },
  {
    name: "permissions-policy",
    label: "Permissions-Policy",
    severity: "Medium" as const,
    purpose:
      "Controls browser features such as camera, microphone, geolocation, payment, fullscreen, and other powerful APIs.",
    suggestion:
      "Limit features that your site does not need. Keep permissions narrow and explicit.",
  },
  {
    name: "cross-origin-opener-policy",
    label: "Cross-Origin-Opener-Policy",
    severity: "Low" as const,
    purpose:
      "Helps isolate browsing contexts and reduce cross-origin interaction risks for certain modern browser features.",
    suggestion:
      "Consider Cross-Origin-Opener-Policy: same-origin when your application needs stronger browsing context isolation.",
  },
  {
    name: "cross-origin-embedder-policy",
    label: "Cross-Origin-Embedder-Policy",
    severity: "Low" as const,
    purpose:
      "Controls whether documents can load cross-origin resources without explicit permission, often used with stronger isolation setups.",
    suggestion:
      "Use carefully, because COEP can affect third-party resource loading. Test before production use.",
  },
  {
    name: "cross-origin-resource-policy",
    label: "Cross-Origin-Resource-Policy",
    severity: "Low" as const,
    purpose:
      "Controls whether other origins can include your resources, helping reduce unwanted cross-origin resource usage.",
    suggestion:
      "Use same-origin or same-site where appropriate for sensitive resources.",
  },
];

export default function ToolClient() {
  const [url, setUrl] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [results, setResults] = useState<HeaderResult[]>([]);
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

  const scanHeaders = async () => {
    const targetUrl = normalizeUrl(url);

    if (!targetUrl) {
      setError("Please enter a website URL.");
      setStatusCode("");
      setFinalUrl("");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");
    setStatusCode("");
    setFinalUrl("");
    setResults([]);

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
      });

      const scannedResults: HeaderResult[] = securityHeaderRules.map((rule) => {
        const value = response.headers.get(rule.name);

        return {
          ...rule,
          value,
          status: value ? "found" as const : "missing" as const,
        };
      });

      setStatusCode(String(response.status));
      setFinalUrl(response.url);
      setResults(scannedResults);
    } catch {
      setError(
        "Unable to scan this URL from the browser. The website may block cross-origin browser requests, require server-side checking, or restrict header access."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setUrl("");
    setStatusCode("");
    setFinalUrl("");
    setResults([]);
    setError("");
    setLoading(false);
  };

  const summary = useMemo(() => {
    const found = results.filter((result) => result.status === "found").length;
    const missing = results.filter((result) => result.status === "missing").length;

    return {
      found,
      missing,
      total: results.length,
    };
  }, [results]);

  const copyResults = () => {
    const output = [
      statusCode ? `Status: ${statusCode}` : "",
      finalUrl ? `Final URL: ${finalUrl}` : "",
      "",
      ...results.map((result) =>
        [
          `${result.label}: ${result.status === "found" ? "Found" : "Missing"}`,
          result.value ? `Value: ${result.value}` : "",
          `Severity: ${result.severity}`,
          `Purpose: ${result.purpose}`,
          `Suggestion: ${result.suggestion}`,
        ]
          .filter(Boolean)
          .join("\n")
      ),
    ]
      .filter(Boolean)
      .join("\n\n");

    navigator.clipboard.writeText(output);
  };

  const hasResults = results.length > 0;

  return (
    <ToolShell
      title="Security Headers Scanner"
      description="Scan common website security headers including CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, COEP, and related browser security headers."
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
          onClick={scanHeaders}
          disabled={loading}
          className="yoryantra-btn"
        >
          {loading ? "Scanning..." : "Scan Security Headers"}
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
			  Security Header Results
			</h3>
		  </div>

		  {hasResults ? (
			<div className="yoryantra-output">
			  <div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-3">
				  <div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					  Status Code
					</p>

					<p className="mt-2 text-lg font-semibold text-gray-900">
					  {statusCode}
					</p>
				  </div>

				  <div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					  Found
					</p>

					<p className="mt-2 text-lg font-semibold text-gray-900">
					  {summary.found} / {summary.total}
					</p>
				  </div>

				  <div className="rounded-xl border border-gray-200 bg-white p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					  Missing
					</p>

					<p className="mt-2 text-lg font-semibold text-gray-900">
					  {summary.missing}
					</p>
				  </div>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-4">
				  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
					Final URL
				  </p>

				  <p className="mt-2 break-words text-sm text-gray-700">
					{finalUrl || "Not available"}
				  </p>
				</div>

				<div className="grid gap-4">
				  {results.map((result) => (
					<div
					  key={result.name}
					  className="rounded-xl border border-gray-200 bg-white p-5"
					>
					  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
						<div>
						  <h4 className="font-semibold text-gray-900">
							{result.label}
						  </h4>

						  <p className="mt-2 text-sm leading-relaxed text-gray-600">
							{result.purpose}
						  </p>
						</div>

						<div className="flex flex-wrap gap-2">
						  <span
							className={
							  result.status === "found"
								? "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
								: "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
							}
						  >
							{result.status === "found" ? "Found" : "Missing"}
						  </span>

						  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
							{result.severity}
						  </span>
						</div>
					  </div>

					  {result.value && (
						<pre className="mt-4 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
						  {result.value}
						</pre>
					  )}

					  <p className="mt-4 text-sm leading-relaxed text-gray-600">
						<strong className="text-gray-900">Suggestion:</strong>{" "}
						{result.suggestion}
					  </p>
					</div>
				  ))}
				</div>
			  </div>
			</div>
		  ) : (
			<pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
			  Security header results will appear here after scanning a URL.
			</pre>
		  )}
		</div>

      {/* IMPORTANT NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser Request Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          This scanner runs from your browser. Some websites block cross-origin
          browser requests, so a scan may fail even when the website is online.
          For blocked websites, server-side scanning can provide more complete
          header results.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Scanning Security Headers for Safer Websites
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Security headers help browsers apply safer rules when loading a
            website. They can reduce risks from cross-site scripting, clickjacking,
            MIME sniffing, insecure transport, overexposed referrer data, and
            unnecessary browser feature access.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Security Headers Scanner checks common response headers such as
            Content-Security-Policy, Strict-Transport-Security, X-Frame-Options,
            X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and
            cross-origin isolation headers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Security Headers Scanner
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the website URL you want to scan.</li>
            <li>Click <strong>Scan Security Headers</strong>.</li>
            <li>Review which headers are found or missing.</li>
            <li>Read the purpose and suggestion for each security header.</li>
            <li>Copy the results if you need to share them with a developer or team.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Security Headers Checked
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Content-Security-Policy for script, style, image, and resource control.</li>
            <li>Strict-Transport-Security for stronger HTTPS behavior.</li>
            <li>X-Frame-Options for clickjacking protection.</li>
            <li>X-Content-Type-Options for MIME sniffing protection.</li>
            <li>Referrer-Policy for controlling referrer information.</li>
            <li>Permissions-Policy for limiting browser features.</li>
            <li>COOP, COEP, and CORP for cross-origin isolation behavior.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Security Headers Matter
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Frontend protection:</strong>{" "}
                Headers like CSP can reduce common script injection and content loading risks.
              </li>

              <li>
                <strong>Safer browser behavior:</strong>{" "}
                HSTS, X-Content-Type-Options, and Referrer-Policy help browsers handle responses more safely.
              </li>

              <li>
                <strong>Security review:</strong>{" "}
                Header scans give developers a quick overview of missing browser-side protections.
              </li>

              <li>
                <strong>Technical SEO support:</strong>{" "}
                Secure, consistent server responses support a more reliable website experience.
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
                What are security headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Security headers are HTTP response headers that tell browsers how
                to handle a page more safely. They can control scripts, frames,
                referrers, HTTPS behavior, browser permissions, and cross-origin
                loading.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does every website need all security headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Not always. Different websites need different policies. A static
                content site, SaaS app, API dashboard, and ecommerce website may
                need different header values and strictness levels.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does the scan fail for some websites?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This scanner runs from your browser. Some websites block
                cross-origin browser requests or restrict visible headers, so a
                browser-based scan may fail even if the website is online.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this a complete security audit?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This scanner checks common security headers. A full security
                review also includes application logic, authentication, access
                control, dependencies, infrastructure, monitoring, and testing.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Security header scanning connects naturally with HTTP header checks,
            CSP creation, CORS review, JWT debugging, and security-focused
            development workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-headers-checker"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Checker
            </Link>

            <Link
              href="/tools/csp-generator"
              className="yoryantra-btn-outline"
            >
              CSP Generator
            </Link>

            <Link
              href="/tools/cors-header-checker"
              className="yoryantra-btn-outline"
            >
              CORS Header Checker
            </Link>

            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/security-guides"
              className="yoryantra-btn-outline"
            >
              Security Guides
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
