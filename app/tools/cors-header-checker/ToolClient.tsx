"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [headersInput, setHeadersInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const analyzeCors = () => {
    try {
      if (!headersInput.trim()) {
        setError("Please enter HTTP headers.");
        setOutput("");
        return;
      }

      const lines = headersInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const headers: Record<string, string> = {};

      lines.forEach((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) return;

        const key = line.slice(0, separatorIndex).trim().toLowerCase();
        const value = line.slice(separatorIndex + 1).trim();

        headers[key] = value;
      });

      const origin = headers["access-control-allow-origin"];
      const methods = headers["access-control-allow-methods"];
      const headersAllowed = headers["access-control-allow-headers"];
      const credentials = headers["access-control-allow-credentials"];

      const result: string[] = [];

      if (origin) {
        result.push(`Access-Control-Allow-Origin: ${origin}`);
      } else {
        result.push("Missing Access-Control-Allow-Origin header.");
      }

      if (methods) {
        result.push(`Access-Control-Allow-Methods: ${methods}`);
      } else {
        result.push("Missing Access-Control-Allow-Methods header.");
      }

      if (headersAllowed) {
        result.push(`Access-Control-Allow-Headers: ${headersAllowed}`);
      } else {
        result.push("Access-Control-Allow-Headers header not found.");
      }

      if (credentials) {
        result.push(`Access-Control-Allow-Credentials: ${credentials}`);
      }

      if (origin === "*" && credentials === "true") {
        result.push(
          "Warning: Access-Control-Allow-Origin cannot be wildcard (*) when credentials are enabled."
        );
      }

      setOutput(result.join("\n"));
      setError("");
    } catch {
      setError("Unable to analyze CORS headers.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setHeadersInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="CORS Header Checker"
      description="Analyze and validate CORS headers instantly with this free online CORS Header Checker."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTTP Response Headers
        </label>

        <textarea
          value={headersInput}
          onChange={(e) => setHeadersInput(e.target.value)}
          placeholder={`Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true`}
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeCors} className="yoryantra-btn">
          Analyze CORS Headers
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
            CORS Analysis Result
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

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "CORS header analysis will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding CORS Headers
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CORS headers control how browsers allow websites to request
            resources from another domain. When an API works in Postman or CURL
            but fails in the browser, CORS configuration is often one of the
            first things to check.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This checker helps you inspect response headers such as
            Access-Control-Allow-Origin, Access-Control-Allow-Methods,
            Access-Control-Allow-Headers, and Access-Control-Allow-Credentials.
            It is useful when debugging frontend API calls, login requests,
            token-based authentication, browser errors, and cross-origin
            integrations.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The analysis happens directly in your browser. Paste the response
            headers copied from DevTools, server logs, API clients, or debugging
            tools and quickly see which CORS headers are present or missing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CORS Header Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Copy the HTTP response headers from your API response.</li>
            <li>Paste the headers into the input box.</li>
            <li>
              Click <strong>Analyze CORS Headers</strong>.
            </li>
            <li>Review the detected headers, missing values, and warnings.</li>
            <li>Update your API or server configuration if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging browser CORS errors during frontend development.</li>
            <li>Checking API response headers copied from DevTools.</li>
            <li>Testing allowed origins, methods, and request headers.</li>
            <li>Reviewing credential-based requests using cookies or tokens.</li>
            <li>Finding unsafe wildcard origin settings with credentials.</li>
            <li>Debugging login, OAuth, webhook, and REST API integrations.</li>
            <li>Checking CORS behavior before deploying frontend changes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example CORS Response Headers
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p>Response headers:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true`}
            </pre>

            <p className="mt-4">Possible analysis:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CORS Headers
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Access-Control-Allow-Origin:</strong> Defines which
                origin is allowed to access the response.
              </li>

              <li>
                <strong>Access-Control-Allow-Methods:</strong> Defines which
                HTTP methods are allowed for cross-origin requests.
              </li>

              <li>
                <strong>Access-Control-Allow-Headers:</strong> Defines which
                request headers are allowed, such as Content-Type or
                Authorization.
              </li>

              <li>
                <strong>Access-Control-Allow-Credentials:</strong> Controls
                whether cookies, authorization headers, or credentials can be
                included in cross-origin requests.
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
                What is CORS?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CORS stands for Cross-Origin Resource Sharing. It is a browser
                security mechanism that controls whether a website can request
                resources from another origin, such as a different domain,
                subdomain, port, or protocol.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does my API work in Postman but not in the browser?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Tools like Postman and CURL are not restricted by the same
                browser CORS rules. A browser request can fail if the API
                response does not include the required CORS headers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is wildcard origin safe for CORS?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A wildcard origin can be fine for public APIs, but it should not
                be used with credential-based requests. Browsers do not allow
                Access-Control-Allow-Origin: * together with
                Access-Control-Allow-Credentials: true.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which CORS headers are most important to check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The most common headers to inspect are
                Access-Control-Allow-Origin, Access-Control-Allow-Methods,
                Access-Control-Allow-Headers, and
                Access-Control-Allow-Credentials.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is CORS header analysis processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. CORS header analysis happens directly inside your browser.
                The headers you paste are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/cors-header-checker" />
        </div>
      </section>
    </ToolShell>
  );
}