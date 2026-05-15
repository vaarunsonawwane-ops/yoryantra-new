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

        const key = line
          .slice(0, separatorIndex)
          .trim();

        const value = line
          .slice(separatorIndex + 1)
          .trim();

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
        <button
          onClick={parseHeaders}
          className="yoryantra-btn"
        >
          Parse Headers
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
            Parsed Output
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

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Parsed HTTP headers will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This HTTP Headers Parser
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Headers Parser helps you parse
            and format HTTP headers instantly. It is
            useful for developers, API testing,
            debugging requests, security analysis,
            networking workflows, and SEO audits.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool converts raw HTTP header text
            into structured JSON format for easier
            readability and debugging.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HTTP Headers Parser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste raw HTTP headers.</li>
            <li>
              Click <strong>Parse Headers</strong>.
            </li>
            <li>View the structured JSON output.</li>
            <li>Copy the parsed result if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Parsing API request headers.</li>
            <li>Debugging HTTP responses.</li>
            <li>Analyzing authorization headers.</li>
            <li>Formatting raw networking data.</li>
            <li>Inspecting SEO-related headers.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              Raw headers:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Content-Type: application/json
Authorization: Bearer token`}
            </pre>

            <p className="mt-4">
              Parsed output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "Content-Type": "application/json",
  "Authorization": "Bearer token"
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
                HTTP headers contain metadata about
                requests and responses exchanged
                between browsers, servers, and APIs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why parse HTTP headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Parsing headers helps developers
                inspect authentication, content type,
                caching, and networking behavior.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The tool parses structured header
                lines into JSON format for easier
                analysis.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is parsing done on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. HTTP header parsing happens
                directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/base64url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64URL Encoder Decoder
            </Link>

            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}