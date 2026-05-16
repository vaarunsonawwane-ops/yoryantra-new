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

    setOutput(statusCodes[cleaned] || "HTTP status code not found in common list.");
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

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={findStatusCode} className="yoryantra-btn">
          Find Status Code
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Status Code Result
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

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output || "HTTP status code explanation will appear here..."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This HTTP Status Code Explorer
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Status Code Explorer helps you quickly understand common
            HTTP response codes. It is useful for developers, API testing,
            debugging web requests, server troubleshooting, and SEO audits.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP status codes tell clients whether a request succeeded, failed,
            redirected, or encountered a server-side issue.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging API responses.</li>
            <li>Understanding server errors.</li>
            <li>Checking redirect and SEO issues.</li>
            <li>Learning common HTTP status codes.</li>
            <li>Troubleshooting web application requests.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">
              HTTP Headers Parser
            </Link>

            <Link href="/tools/redirect-checker" className="yoryantra-btn-outline">
              Redirect Checker
            </Link>

            <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
              CURL Command Builder
            </Link>

            <Link href="/tools/cors-header-checker" className="yoryantra-btn-outline">
              CORS Header Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}