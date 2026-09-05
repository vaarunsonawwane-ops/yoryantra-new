"use client";

import { useEffect, useRef, useState } from "react";
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
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirected, setRedirected] = useState(false);
  const [copied, setCopied] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => activeRequest.current?.abort();
  }, []);

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

    if (parsed.username || parsed.password) {
      throw new Error("URLs containing embedded usernames or passwords are not supported.");
    }

    parsed.hash = "";
    return parsed.toString();
  };

  const checkHeaders = async () => {
    activeRequest.current?.abort();

    const controller = new AbortController();
    activeRequest.current = controller;

    setLoading(true);
    setError("");
    setWarning("");
    setCopied(false);
    setStatusCode("");
    setFinalUrl("");
    setHeaders([]);
    setRedirected(false);

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
      setRedirected(response.redirected);

      if (!headerRows.length) {
        setWarning(
          "The request completed, but no response headers were exposed to page JavaScript. Cross-origin response rules may be limiting what the browser reveals."
        );
      }
    } catch (err) {
      if (activeRequest.current !== controller) {
        return;
      }

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
    setWarning("");
    setLoading(false);
    setRedirected(false);
    setCopied(false);
  };

  const loadExample = () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setUrl("https://example.com/");
    setStatusCode("");
    setFinalUrl("");
    setHeaders([]);
    setError("");
    setWarning("");
    setLoading(false);
    setRedirected(false);
    setCopied(false);
  };

  const handleUrlChange = (value: string) => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setUrl(value);
    setStatusCode("");
    setFinalUrl("");
    setHeaders([]);
    setError("");
    setWarning("");
    setLoading(false);
    setRedirected(false);
    setCopied(false);
  };

  const copyHeaders = async () => {
    const output = [
      statusCode ? `Status: ${statusCode}` : "",
      finalUrl ? `Final URL: ${finalUrl}` : "",
      `Redirect followed: ${redirected ? "yes" : "no"}`,
      "",
      ...headers.map((header) => `${header.name}: ${header.value}`),
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Clipboard access was blocked. Select the results and copy them manually.");
      setCopied(false);
    }
  };

  const hasResults = statusCode || headers.length > 0;

  return (
    <ToolShell
      title="HTTP Headers Checker"
      description="Inspect browser-visible response headers, final status and URL, caching, content type, and security-related fields."
    >
      {/* INPUT */}
      <div>
        <label htmlFor="headers-url" className="block mb-2 text-sm font-medium text-gray-700">
          Website URL
        </label>

        <input
          id="headers-url"
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={checkHeaders}
          disabled={loading}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          {loading ? "Checking..." : "Check Headers"}
        </button>

        <button
          onClick={copyHeaders}
          disabled={!hasResults}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          {copied ? "Copied" : "Copy Results"}
        </button>

        <button
          onClick={loadExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Example
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {warning && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          {warning}
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
        <div className="grid items-start gap-4 md:grid-cols-3">
          <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status Code
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {statusCode}
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Final URL
            </p>

            <p className="mt-2 break-words text-sm text-gray-700">
              {finalUrl || "Not available"}
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Redirect Followed
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {redirected ? "Yes" : "No"}
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
    <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
      HTTP response headers will appear here after checking a URL.
    </pre>
  )}
</div>

      {/* IMPORTANT NOTE */}
      <div className="mt-8 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">
          The target site receives a real browser request
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Checking a URL sends a GET request from your browser to that site. CORS
          decides whether page JavaScript may read the response, and a failed
          cross-origin check does not prove that the site is down or missing a
          header. Avoid testing confidential internal URLs from a shared screen
          or environment.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A browser can see only part of an HTTP response
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Fetch exposes the final response only when the browser permits the
            page to read it. On cross-origin requests, CORS-safelisted response
            fields are available by default and other fields generally need
            <code className="mx-1">Access-Control-Expose-Headers</code>. Some
            response fields are never exposed to frontend JavaScript.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <code className="mx-1">Set-Cookie</code> is a forbidden response
            header name in the Fetch model, so its absence here says nothing
            about whether the server sent cookies. Repeated field lines may also
            be combined by the browser&apos;s Headers interface.
          </p>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Read status and final URL together
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Fetch follows redirects in this check. A changed final URL confirms
              that at least one redirect was followed, but the intermediate hops,
              status codes, and Location fields are not preserved in the result.
              Use a redirect-chain trace when those hops matter.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Headers make more sense in groups
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Read Cache-Control with Age, Expires, ETag, Last-Modified, and Vary;
              read Content-Type with Content-Encoding; and review CSP, HSTS,
              framing, referrer, and permissions policies as separate security
              controls rather than a single pass/fail score.
            </p>
          </div>
        </div>

        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-amber-900">
            Missing from the table does not always mean missing on the wire
          </h2>
          <p className="mt-3 text-amber-800 leading-relaxed">
            CORS can hide non-safelisted fields from JavaScript even when the
            server returned them. Mixed-content rules, private-network policies,
            extensions, authentication, and redirects can also change what a
            browser request can reach. Confirm uncertain cases with DevTools,
            curl, or a server-side HTTP client you control.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What the check can and cannot establish
          </h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Shows the browser-exposed fields from the final GET response.</li>
            <li>Shows the final status and URL after browser-followed redirects.</li>
            <li>Does not prove a hidden security header is absent.</li>
            <li>Does not show request headers, TLS certificate details, DNS, or the complete redirect chain.</li>
            <li>Does not validate whether a present security policy is appropriate for the application.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Protocol and browser references
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 9110 defines HTTP field and status semantics. MDN documents the
            browser-side CORS exposure rules and the special treatment of
            Set-Cookie in Fetch. Those browser boundaries are why a frontend
            header check cannot replace a server-side trace.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="https://www.rfc-editor.org/rfc/rfc9110.html" target="_blank" rel="noreferrer" className="yoryantra-btn-outline whitespace-nowrap">
              RFC 9110 HTTP Semantics
            </a>
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Expose-Headers" target="_blank" rel="noreferrer" className="yoryantra-btn-outline whitespace-nowrap">
              MDN header exposure
            </a>
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie" target="_blank" rel="noreferrer" className="yoryantra-btn-outline whitespace-nowrap">
              MDN Set-Cookie
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/http-headers-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
