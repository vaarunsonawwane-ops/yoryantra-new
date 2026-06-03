"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

const statusCodes: Record<string, string> = {
  "200": "OK - The request succeeded.",
  "201": "Created - The request succeeded and a resource was created.",
  "204": "No Content - The request succeeded but has no response body.",
  "301": "Moved Permanently - The resource has permanently moved.",
  "302": "Found - The resource is temporarily redirected.",
  "304": "Not Modified - Cached version can be used.",
  "400": "Bad Request - The server could not understand the request.",
  "401": "Unauthorized - Authentication is required.",
  "403": "Forbidden - Access is not allowed.",
  "404": "Not Found - The resource could not be found.",
  "405": "Method Not Allowed - HTTP method is not supported.",
  "409": "Conflict - Request conflicts with current resource state.",
  "429": "Too Many Requests - Rate limit exceeded.",
  "500": "Internal Server Error - The server encountered an error.",
  "502": "Bad Gateway - Invalid response from upstream server.",
  "503": "Service Unavailable - Server is temporarily unavailable.",
  "504": "Gateway Timeout - Upstream server timeout.",
};

export default function ToolClient() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const findStatusCode = () => {
    const cleaned = code.trim();

    if (!cleaned) {
      setOutput("");
      return;
    }

    setOutput(
      statusCodes[cleaned] ||
        "HTTP status code not found in common list."
    );
  };

  const resetAll = () => {
    setCode("");
    setOutput("");
  };

  return (
    <ToolShell
      title="HTTP Status Code Explorer"
      description="Search and understand HTTP status codes instantly with this free online HTTP Status Code Explorer."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTTP Status Code
        </label>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="404"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={findStatusCode} className="yoryantra-btn">
          Find Status Code
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Status Code Result
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
            "HTTP status code explanation will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding HTTP Status Codes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP status codes help browsers, APIs, servers, CDNs, proxies,
            and applications communicate the result of a request. These
            response codes indicate whether a request succeeded, failed,
            redirected, required authentication, or encountered a server-side
            problem.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During debugging workflows, developers often inspect status codes
            while troubleshooting API failures, authentication problems,
            redirects, caching behavior, rate limits, server outages, and
            frontend request issues.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This explorer helps you quickly understand common HTTP response
            codes directly inside your browser without searching through
            documentation or server logs manually.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HTTP Status Code Explorer
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter an HTTP status code into the input field.</li>

            <li>
              Click <strong>Find Status Code</strong>.
            </li>

            <li>
              Review the explanation for the response code.
            </li>

            <li>
              Copy the result for debugging or troubleshooting workflows.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging REST API responses and failed requests.</li>

            <li>Understanding redirects and SEO-related response behavior.</li>

            <li>Inspecting authentication and permission issues.</li>

            <li>Reviewing CDN, proxy, and server-side responses.</li>

            <li>Analyzing rate limiting and API usage restrictions.</li>

            <li>Learning common HTTP response codes during development.</li>

            <li>Debugging frontend requests copied from browser DevTools.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common HTTP Status Codes
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`200 → OK
301 → Moved Permanently
401 → Unauthorized
403 → Forbidden
404 → Not Found
429 → Too Many Requests
500 → Internal Server Error`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding HTTP Status Code Categories
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>1xx:</strong> Informational responses.
              </li>

              <li>
                <strong>2xx:</strong> Successful requests.
              </li>

              <li>
                <strong>3xx:</strong> Redirect responses.
              </li>

              <li>
                <strong>4xx:</strong> Client-side errors such as invalid
                requests or authentication problems.
              </li>

              <li>
                <strong>5xx:</strong> Server-side failures and infrastructure
                issues.
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
                What are HTTP status codes?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTTP status codes are standard response codes returned by
                servers to indicate whether a request succeeded, failed,
                redirected, or encountered an issue.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does a 404 status code mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A 404 Not Found response means the requested page, API route,
                or resource could not be located on the server.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between 401 and 403?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A 401 Unauthorized response means authentication is required,
                while 403 Forbidden means the request was understood but access
                is not allowed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are HTTP status codes important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Status codes help developers debug applications, troubleshoot
                API requests, analyze redirects, monitor server behavior, and
                improve website reliability.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is HTTP status code lookup processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Status code lookup happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            HTTP status code debugging often connects with request headers,
            redirects, API testing, CORS troubleshooting, and browser
            networking workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/curl-command-builder"
              className="yoryantra-btn-outline"
            >
              CURL Command Builder
            </Link>

            <Link
              href="/tools/cors-header-checker"
              className="yoryantra-btn-outline"
            >
              CORS Header Checker
            </Link>

            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>

            <Link
              href="/tools/user-agent-parser"
              className="yoryantra-btn-outline"
            >
              User Agent Parser
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}