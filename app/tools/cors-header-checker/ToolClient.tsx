"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

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
          placeholder={`Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization`}
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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This CORS Header Checker
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CORS Header Checker helps you analyze Cross-Origin Resource
            Sharing headers from HTTP responses. It is useful for developers
            debugging API access issues, frontend requests, browser security
            errors, authentication flows, and cross-origin integrations.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CORS headers control which origins, methods, and request headers are
            allowed when a browser makes cross-origin requests. Incorrect CORS
            settings can cause failed API calls, blocked frontend requests, or
            security misconfigurations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CORS Header Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your HTTP response headers into the input box.</li>
            <li>Click <strong>Analyze CORS Headers</strong>.</li>
            <li>Review detected CORS headers and missing values.</li>
            <li>Fix your server or API configuration if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging browser CORS errors.</li>
            <li>Checking API response headers.</li>
            <li>Validating frontend and backend integrations.</li>
            <li>Testing allowed origins and methods.</li>
            <li>Reviewing security header configuration.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CORS Headers
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Access-Control-Allow-Origin:</strong> Defines allowed
                origins.
              </li>
              <li>
                <strong>Access-Control-Allow-Methods:</strong> Defines allowed
                HTTP methods.
              </li>
              <li>
                <strong>Access-Control-Allow-Headers:</strong> Defines allowed
                request headers.
              </li>
              <li>
                <strong>Access-Control-Allow-Credentials:</strong> Controls
                whether credentials are allowed.
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
                security mechanism that controls how websites can request
                resources from different origins.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do CORS errors happen?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CORS errors usually happen when an API response does not include
                the required headers for the requesting origin, method, or
                request headers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is wildcard origin safe?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A wildcard origin can be acceptable for public APIs, but it
                should not be used with credentials or sensitive authenticated
                requests.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this analysis done on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. CORS header analysis happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">
              HTTP Headers Parser
            </Link>

            <Link href="/tools/csp-generator" className="yoryantra-btn-outline">
              CSP Generator
            </Link>

            <Link href="/tools/api-key-generator" className="yoryantra-btn-outline">
              API Key Generator
            </Link>

            <Link href="/tools/jwt-signature-verifier" className="yoryantra-btn-outline">
              JWT Signature Verifier
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}