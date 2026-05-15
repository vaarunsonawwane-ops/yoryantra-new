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
        <button onClick={encodeURL} className="yoryantra-btn">
          Encode URL
        </button>

        <button onClick={decodeURL} className="yoryantra-btn-outline">
          Decode URL
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Encoded or decoded URL output will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This URL Encoder Decoder
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This URL Encoder Decoder helps you convert normal text into a
            URL-safe format and decode encoded URLs back into readable text.
            It is useful when working with links, query parameters, APIs,
            redirects, tracking URLs, and web forms.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            URL encoding replaces special characters such as spaces, symbols,
            and reserved characters with encoded values. For example, a space
            is commonly converted into <code>%20</code>. This makes URLs safer
            to send through browsers, servers, and web applications.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the URL Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your URL, text, or query string into the input box.</li>
            <li>Click <strong>Encode URL</strong> to make the text URL-safe.</li>
            <li>Click <strong>Decode URL</strong> to convert encoded text back to readable text.</li>
            <li>Use the copy button to copy the final result.</li>
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
            <li>Preparing redirect URLs for web apps.</li>
            <li>Debugging tracking links and campaign URLs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">Original text:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              https://example.com/search?q=hello world
            </pre>

            <p className="mt-4 font-medium text-gray-900">Encoded output:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world
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
                What is URL encoding?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                URL encoding converts unsafe or reserved characters into a
                format that can be safely used inside a URL.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is URL decoding?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                URL decoding converts encoded URL text back into its original,
                readable format.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this URL Encoder Decoder secure?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool runs directly in your browser. Your input is not
                uploaded to a server.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                When should I encode a URL?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                You should encode a URL when it contains spaces, special
                symbols, query values, or characters that may break a web link.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/slug-generator" className="yoryantra-btn-outline">
              Slug Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}