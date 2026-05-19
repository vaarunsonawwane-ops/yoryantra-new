"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encodeURL = () => {
    try {
      setOutput(encodeURIComponent(input));
      setError("");
    } catch {
      setError("Unable to encode URL.");
      setOutput("");
    }
  };

  const decodeURL = () => {
    try {
      setOutput(decodeURIComponent(input));
      setError("");
    } catch {
      setError("Invalid encoded URL.");
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
      title="URL Encoder Decoder"
      description="Encode and decode URLs instantly with this free online URL Encoder Decoder."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          URL Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste a URL, query string, or text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={encodeURL}
          className="yoryantra-btn"
        >
          Encode URL
        </button>

        <button
          onClick={decodeURL}
          className="yoryantra-btn-outline"
        >
          Decode URL
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
            Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output ||
            "Encoded or decoded URL output will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding and Decoding URLs Without Breaking Links
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            URL encoding helps browsers, APIs, servers, and web applications
            safely process links that contain spaces, special characters,
            symbols, Unicode text, query parameters, and reserved URL values.
            URL decoding converts encoded text back into a human-readable
            format.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During development and SEO workflows, unencoded URLs can break API
            requests, redirect logic, tracking links, search parameters, and
            browser routing. This URL Encoder Decoder helps quickly transform
            URLs into safe encoded formats and decode encoded values back into
            readable text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for API testing, query parameter debugging,
            redirect URLs, campaign tracking links, frontend applications,
            search URLs, and technical debugging directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the URL Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your URL, query string, or text into the editor.
            </li>

            <li>
              Click <strong>Encode URL</strong> to convert the text into a
              URL-safe format.
            </li>

            <li>
              Click <strong>Decode URL</strong> to convert encoded text back
              into readable text.
            </li>

            <li>
              Copy the final output for use in applications, APIs, or websites.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Encoding query parameters for APIs.</li>

            <li>Decoding copied browser URLs.</li>

            <li>Fixing links with spaces or special characters.</li>

            <li>Preparing redirect URLs for web applications.</li>

            <li>Debugging campaign tracking URLs.</li>

            <li>Working with encoded search parameters.</li>

            <li>Testing frontend routing and URL handling.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example URL Encoding
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Original URL:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
https://example.com/search?q=hello world
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Encoded URL:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why URL Encoding Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Safe URL handling:</strong> Encoded URLs prevent broken
                links caused by unsupported characters.
              </li>

              <li>
                <strong>Better API compatibility:</strong> APIs often require
                encoded query parameters and request URLs.
              </li>

              <li>
                <strong>Reliable redirects:</strong> Encoding helps preserve
                tracking parameters and redirect paths correctly.
              </li>

              <li>
                <strong>Improved debugging:</strong> Decoding helps developers
                inspect encoded URLs more easily.
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
                What is URL encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                URL encoding converts special or reserved characters into a
                format that can safely travel through browsers, servers, and web
                applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is URL decoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                URL decoding converts encoded values back into normal readable
                text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do URLs use %20 for spaces?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Spaces are not valid inside URLs, so they are commonly encoded
                as <code>%20</code>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is URL encoding useful for APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. API requests often require encoded query strings and
                parameters to avoid broken requests.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is URL encoding processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. URL encoding and decoding happen directly inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            URL encoding often connects with query parameters, redirects, API
            debugging, slug generation, and frontend routing workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/url-query-params-parser"
              className="yoryantra-btn-outline"
            >
              URL Query Params Parser
            </Link>

            <Link
              href="/tools/slug-generator"
              className="yoryantra-btn-outline"
            >
              Slug Generator
            </Link>

            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>

            <Link
              href="/tools/curl-command-builder"
              className="yoryantra-btn-outline"
            >
              CURL Command Builder
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}