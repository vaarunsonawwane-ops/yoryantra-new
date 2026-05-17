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
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste HTML or text here..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output ||
            "Encoded or decoded HTML will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          HTML encoding and decoding happen locally inside your browser. Your
          content is not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding and Decoding HTML Entities Safely
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML encoding helps convert reserved characters into safe HTML
            entities so they can be displayed correctly inside webpages,
            templates, CMS systems, APIs, forms, frontend applications, and
            user-generated content platforms.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw HTML characters such as angle brackets, quotes, and ampersands
            can break layouts or create rendering issues when inserted directly
            into webpages. This HTML Encoder Decoder helps safely encode and
            decode HTML entities instantly inside your browser.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for frontend debugging, content management,
            security testing, template handling, escaped HTML inspection,
            JavaScript workflows, and displaying raw HTML safely.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HTML Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste HTML or plain text into the editor.
            </li>

            <li>
              Click <strong>Encode HTML</strong> to convert characters into HTML
              entities.
            </li>

            <li>
              Click <strong>Decode HTML</strong> to convert entities back into
              readable HTML.
            </li>

            <li>
              Copy the converted output instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Escaping HTML before displaying raw code snippets.
            </li>

            <li>
              Preventing HTML rendering inside content editors.
            </li>

            <li>
              Debugging encoded HTML entities.
            </li>

            <li>
              Working with CMS and user-generated content.
            </li>

            <li>
              Inspecting escaped HTML responses from APIs.
            </li>

            <li>
              Encoding special characters safely in templates.
            </li>

            <li>
              Testing frontend rendering workflows.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example HTML Encoding
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Original HTML:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`<h1>Hello World</h1>`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Encoded output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`&lt;h1&gt;Hello World&lt;/h1&gt;`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why HTML Encoding Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Safer rendering:</strong> Encoded HTML prevents raw tags
                from rendering unintentionally.
              </li>

              <li>
                <strong>Cleaner debugging:</strong> Developers can inspect raw
                HTML content more easily.
              </li>

              <li>
                <strong>Better content handling:</strong> Escaped HTML works
                safely inside CMS systems and editors.
              </li>

              <li>
                <strong>Frontend reliability:</strong> Proper encoding helps
                reduce rendering and formatting issues.
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
                What is HTML encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTML encoding converts reserved characters such as angle
                brackets and quotes into safe HTML entities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is HTML decoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTML decoding converts HTML entities back into readable text and
                HTML characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are HTML entities important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTML entities help display special characters safely without
                breaking webpage rendering.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this HTML Encoder Decoder secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. All encoding and decoding happen locally inside your
                browser.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is HTML processing handled on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. HTML processing happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            HTML encoding often connects with APIs, frontend debugging, text
            transformation, Base64 encoding, and structured content workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/url-encoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/regex-tester"
              className="yoryantra-btn-outline"
            >
              Regex Tester
            </Link>

            <Link
              href="/tools/text-case-converter"
              className="yoryantra-btn-outline"
            >
              Text Case Converter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}