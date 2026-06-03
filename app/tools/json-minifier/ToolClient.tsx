"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);

      setOutput(
        JSON.stringify(parsed)
      );

      setError("");
    } catch {
      setError(
        "Invalid JSON. Please check your input and try again."
      );

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
      title="JSON Minifier"
      description="Minify and compress JSON data instantly with this free online JSON Minifier."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste JSON here..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={minifyJSON}
          className="yoryantra-btn"
        >
          Minify JSON
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Minified Output
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  output
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output ||
            "Minified JSON output will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JSON minification happens locally inside your browser. Your JSON data
          is not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Minifying JSON Before Sending It Through APIs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON minification helps reduce payload size by removing unnecessary
            spaces, line breaks, indentation, and formatting while keeping the
            actual JSON structure unchanged. Minified JSON is commonly used in
            APIs, frontend applications, configuration files, cloud systems,
            server responses, and production deployments.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Large formatted JSON responses can increase transfer size and make
            payloads heavier than necessary during API communication. This JSON
            Minifier helps compress structured JSON data instantly while also
            validating the syntax before generating output.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for optimizing API payloads, preparing production
            configuration files, reducing bandwidth usage, debugging JSON
            structures, and cleaning copied structured data directly inside your
            browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Minifier
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your JSON data into the editor.
            </li>

            <li>
              Click <strong>Minify JSON</strong>.
            </li>

            <li>
              Review the compressed JSON output instantly.
            </li>

            <li>
              Copy the minified JSON for use in APIs, applications, or
              configuration files.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Reducing JSON size for API requests and responses.</li>

            <li>Preparing configuration files for production deployment.</li>

            <li>Compressing structured JSON payloads.</li>

            <li>Optimizing frontend and backend data transfer.</li>

            <li>Cleaning formatted JSON copied from logs.</li>

            <li>Reducing bandwidth usage during API communication.</li>

            <li>Validating JSON before deployment or integration.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Minification
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Before minifying:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "type": "Developer Tools",
  "active": true
}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              After minifying:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{"name":"Yoryantra","type":"Developer Tools","active":true}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why JSON Minification Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Smaller payloads:</strong> Minified JSON reduces API
                transfer size and bandwidth usage.
              </li>

              <li>
                <strong>Faster responses:</strong> Smaller JSON payloads can
                improve transfer performance.
              </li>

              <li>
                <strong>Production optimization:</strong> Minified JSON is
                commonly used in production systems and deployments.
              </li>

              <li>
                <strong>Cleaner transfers:</strong> Removes unnecessary
                formatting while preserving the actual data structure.
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
                What does JSON minify mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON minification removes unnecessary whitespace, indentation,
                and line breaks while keeping the actual data unchanged.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does JSON minification change the data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON minification changes formatting only and preserves all
                keys, values, arrays, and objects.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool detect invalid JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid JSON structures will display an error instead of
                generating minified output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is JSON minification useful for APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Smaller payloads can reduce transfer size and improve API
                communication efficiency.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JSON minification processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON minification happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            JSON minification often connects with APIs, formatting, validation,
            JWT debugging, and structured data workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/url-encoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
            </Link>

            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}