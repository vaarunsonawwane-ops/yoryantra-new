"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encodeHTML = () => {
    const encoded = input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    setOutput(encoded);
  };

  const decodeHTML = () => {
    const decoded = input
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");

    setOutput(decoded);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="HTML Encoder Decoder"
      description="Encode and decode HTML entities instantly with this free online HTML Encoder Decoder."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTML Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste HTML or text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={encodeHTML}
          className="yoryantra-btn"
        >
          Encode HTML
        </button>

        <button
          onClick={decodeHTML}
          className="yoryantra-btn-outline"
        >
          Decode HTML
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

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
          {output || "Encoded or decoded HTML will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is HTML Encoder Decoder?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML Encoder Decoder helps you safely encode and decode
            HTML entities directly in your browser. It is useful for
            developers, content editors, security testing, and handling
            HTML text safely in web applications.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Encoding HTML converts reserved characters into HTML entities,
            while decoding converts HTML entities back into readable text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HTML Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste HTML or text into the input field.</li>
            <li>Select Encode HTML or Decode HTML.</li>
            <li>View the converted output instantly.</li>
            <li>Copy the result for use in your project.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Escaping HTML special characters safely.</li>
            <li>Displaying raw HTML in webpages.</li>
            <li>Preventing HTML injection issues.</li>
            <li>Working with CMS or user-generated content.</li>
            <li>Debugging encoded HTML content.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Original HTML:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`<h1>Hello World</h1>`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Encoded Output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`&lt;h1&gt;Hello World&lt;/h1&gt;`}
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
                What is HTML encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTML encoding converts special characters into HTML entities
                so they can be displayed safely in web pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is HTML encoding important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Encoding helps prevent rendering issues and reduces risks
                related to unsafe HTML content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this HTML Encoder Decoder secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. All processing happens directly in your browser.
                Your content is not uploaded anywhere.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/regex-tester" className="yoryantra-btn-outline">
              Regex Tester
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
