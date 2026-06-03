"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseHeaders = () => {
    try {
      if (!input.trim()) {
        setError("Please enter HTTP headers.");
        setOutput("");
        return;
      }

      const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const headers: Record<string, string> = {};

      lines.forEach((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) {
          return;
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();

        headers[key] = value;
      });

      setOutput(JSON.stringify(headers, null, 2));
      setError("");
    } catch {
      setError("Unable to parse HTTP headers.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="HTTP Headers Parser"
      description="Parse and format HTTP headers instantly with this free online HTTP Headers Parser."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTTP Headers
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Content-Type: application/json
Authorization: Bearer token`}
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseHeaders} className="yoryantra-btn">
          Parse Headers
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
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
            Parsed Output
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

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Parsed HTTP headers will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding HTTP Headers
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP headers carry important information between browsers, servers,
            APIs, CDNs, proxies, and web applications. They help describe how a
            request or response should be handled, including content type,
            authentication, caching, compression, cookies, CORS rules, and more.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            When debugging APIs or web requests, raw headers can become difficult
            to inspect manually. This parser converts plain HTTP header text into
            structured JSON so the values are easier to read, copy, compare, and
            use during development.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HTTP Headers Parser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste raw HTTP request or response headers.</li>
            <li>
              Click <strong>Parse Headers</strong>.
            </li>
            <li>View the structured JSON output.</li>
            <li>Copy the parsed result for debugging or documentation.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Parsing API request and response headers.</li>
            <li>Checking caching, CORS, authentication, and content-type headers.</li>
            <li>Debugging Authorization, Cookie, and Set-Cookie values.</li>
            <li>Formatting raw networking data into readable JSON.</li>
            <li>Inspecting headers copied from browser DevTools or API clients.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example HTTP Headers
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Raw headers:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
Cache-Control: no-cache
X-Forwarded-For: 192.168.1.10`}
            </pre>

            <p className="mt-4">Parsed output:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOi...",
  "Cache-Control": "no-cache",
  "X-Forwarded-For": "192.168.1.10"
}`}
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
                What are HTTP headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTTP headers are key-value pairs sent with web requests and
                responses. They describe information such as content type,
                authentication, caching, cookies, compression, and browser
                behavior.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do developers inspect HTTP headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Developers inspect headers to debug API requests, authentication
                issues, CORS problems, caching behavior, redirects, cookies, and
                server responses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool parse headers copied from DevTools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can paste raw request or response headers copied from
                browser DevTools, API clients, server logs, or debugging tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is header parsing processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. HTTP header parsing happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Working with HTTP headers often also involves checking response
            codes, cookies, CORS configuration, browser requests, and API
            debugging workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-status-code-explorer"
              className="yoryantra-btn-outline"
            >
              HTTP Status Code Explorer
            </Link>

            <Link
              href="/tools/cors-header-checker"
              className="yoryantra-btn-outline"
            >
              CORS Header Checker
            </Link>

            <Link
              href="/tools/cookie-parser"
              className="yoryantra-btn-outline"
            >
              Cookie Parser
            </Link>

            <Link
              href="/tools/user-agent-parser"
              className="yoryantra-btn-outline"
            >
              User Agent Parser
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