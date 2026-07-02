"use client";

import { useRef, useState } from "react";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import ToolShell from "@/app/components/ToolShell";

type HeaderRow = {
  name: string;
  value: string;
};

export default function ToolClient() {
  const [url, setUrl] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [headers, setHeaders] = useState<HeaderRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error("Please enter a website URL.");
    }

    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    let parsed: URL;

    try {
      parsed = new URL(candidate);
    } catch {
      throw new Error("Enter a valid HTTP or HTTPS URL.");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs are supported.");
    }

    return parsed.toString();
  };

  const checkHeaders = async () => {
    activeRequest.current?.abort();

    const controller = new AbortController();
    activeRequest.current = controller;

    setLoading(true);
    setError("");
    setStatusCode("");
    setFinalUrl("");
    setHeaders([]);

    const timeoutId = window.setTimeout(
      () => controller.abort(),
      12000
    );

    try {
      const targetUrl = normalizeUrl(url);

      const response = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        cache: "no-store",
      });

      const headerRows = Array.from(response.headers.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((left, right) => left.name.localeCompare(right.name));

      setStatusCode(
        `${response.status}${response.statusText ? ` ${response.statusText}` : ""}`
      );
      setFinalUrl(response.url || targetUrl);
      setHeaders(headerRows);

      if (!headerRows.length) {
        setError(
          "The request completed, but the browser did not expose any response headers. Cross-origin response rules may be limiting access."
        );
      }
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? "The request timed out after 12 seconds."
          : err instanceof Error
            ? err.message
            : "Unable to inspect this URL from the browser."
      );
    } finally {
      window.clearTimeout(timeoutId);

      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  };

  const resetAll = () => {
    activeRequest.current?.abort();
    activeRequest.current = null;

    setUrl("");
    setStatusCode("");
    setFinalUrl("");
    setHeaders([]);
    setError("");
    setLoading(false);
  };

  const copyHeaders = () => {
    const output = [
      statusCode ? `Status: ${statusCode}` : "",
      finalUrl ? `Final URL: ${finalUrl}` : "",
      "",
      ...headers.map((header) => `${header.name}: ${header.value}`),
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(output);
  };

  const hasResults = statusCode || headers.length > 0;

  return (
    <ToolShell
      title="HTTP Headers Checker"
      description="Inspect browser-visible HTTP response headers, the final status, final URL, cache directives, content type, and security-related headers."
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
          onClick={checkHeaders}
          disabled={loading}
          className="yoryantra-btn"
        >
          {loading ? "Checking..." : "Check Headers"}
        </button>

        <button
          onClick={copyHeaders}
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
      Header Results
    </h3>
  </div>

  {hasResults ? (
    <div className="yoryantra-output">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
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
              Final URL
            </p>

            <p className="mt-2 break-words text-sm text-gray-700">
              {finalUrl || "Not available"}
            </p>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  Header
                </th>

                <th className="px-4 py-3 font-semibold">
                  Value
                </th>
              </tr>
            </thead>

            <tbody>
              {headers.map((header) => (
                <tr
                  key={header.name}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {header.name}
                  </td>

                  <td className="px-4 py-3 break-words text-gray-600">
                    {header.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
      HTTP response headers will appear here after checking a URL.
    </pre>
  )}
</div>

      {/* IMPORTANT NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser Request Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          This checker sends a browser request to the URL you enter. The target
          site receives that request, and CORS rules decide which headers the
          browser exposes. A failed or incomplete result does not prove the site
          is offline or missing those headers. Redirect chains and non-exposed
          response details require a server-side checker.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Inspecting Browser-Visible HTTP Response Headers
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Response headers can describe content type, caching, browser
            security policies, server behaviour, and the final response status.
            They are useful while debugging websites, APIs, CDN behaviour, and
            technical SEO issues.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool shows only the headers that the browser is allowed to
            expose for the final response. It does not display the complete
            redirect chain, hidden cross-origin headers, request headers, or
            server-side network details.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HTTP Headers Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the website URL you want to inspect.</li>
            <li>Click <strong>Check Headers</strong>.</li>
            <li>Review the status code, final URL, and returned headers.</li>
            <li>Copy the results if you need to save or share them.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Headers Commonly Checked
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Status codes such as 200, 301, 302, 404, and 500.</li>
            <li>Cache headers like Cache-Control, Expires, and ETag.</li>
            <li>Content-Type and charset values.</li>
            <li>The final URL after browser-followed redirects.</li>
            <li>Security headers such as CSP, HSTS, X-Frame-Options, and Referrer-Policy.</li>
            <li>Server and platform-related response details.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why HTTP Headers Matter
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>SEO debugging:</strong>{" "}
                Final status, final URL, content type, and caching can help explain crawl or delivery problems. Canonical tags are HTML signals and are not confirmed by this tool.
              </li>

              <li>
                <strong>Security review:</strong>{" "}
                Headers such as Content-Security-Policy and Strict-Transport-Security help reduce common browser-side risks.
              </li>

              <li>
                <strong>Performance checks:</strong>{" "}
                Cache headers affect how browsers and CDNs store assets and page responses.
              </li>

              <li>
                <strong>API debugging:</strong>{" "}
                Response headers can explain content types, allowed methods, caching rules, and server behavior.
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
                What are HTTP headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTTP headers are key-value pairs sent with requests and
                responses. They describe server behavior, content type, caching,
                security policies, redirects, and other response details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does some URL checking fail?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool runs in the browser, so some websites may block
                cross-origin requests. A failed browser check does not always
                mean the site is offline.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this check security headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It can display security-related headers only when the browser
                exposes them. Their presence does not prove that the complete
                application security configuration is correct.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for technical SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. HTTP status codes, redirects, caching, and response headers
                are important parts of technical SEO debugging.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/http-headers-checker" />
        </div>
      </section>
    </ToolShell>
  );
}
