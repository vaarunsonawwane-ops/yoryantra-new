"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const unescapeHtml = (value: string) => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleEscape = () => {
    if (!input.trim()) {
      setError("Please enter HTML or text to escape.");
      setOutput("");
      return;
    }

    try {
      setOutput(escapeHtml(input));
      setError("");
    } catch {
      setError("Unable to escape this text.");
      setOutput("");
    }
  };

  const handleUnescape = () => {
    if (!input.trim()) {
      setError("Please enter HTML entities to unescape.");
      setOutput("");
      return;
    }

    try {
      setOutput(unescapeHtml(input));
      setError("");
    } catch {
      setError("Unable to unescape this HTML text.");
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const loadExample = () => {
    setInput("<div class=\"message\">Yoryantra & tools</div>");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="HTML Escape Unescape"
      description="Escape and unescape HTML entities for safe text rendering, frontend debugging, APIs, and web development workflows."
    >
      {/* INPUT */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input HTML or Text
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="<div class=&quot;message&quot;>Yoryantra & tools</div>"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={handleEscape}
          className="yoryantra-btn"
        >
          Escape HTML
        </button>

        <button
          onClick={handleUnescape}
          className="yoryantra-btn-outline"
        >
          Unescape HTML
        </button>

        <button
          onClick={copyOutput}
          disabled={!output}
          className="yoryantra-btn-outline"
        >
          Copy Output
        </button>

        <button
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
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
        <h3 className="text-lg font-semibold text-gray-900">
          Output
        </h3>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {output ? (
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
              {output}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">
              Escaped or unescaped HTML output will appear here.
            </p>
          )}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why HTML Escaping Matters in Web Development
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML escaping converts characters like angle brackets, quotes, and
            ampersands into safe HTML entities. This helps text appear as text
            instead of being interpreted as actual markup by the browser.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTML Escape Unescape tool helps you quickly prepare raw text for
            safe display, decode entity-heavy content, and debug frontend or API
            values that contain HTML entities.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common HTML Entity Examples
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>&amp;lt;</strong> → &lt;
              </li>

              <li>
                <strong>&amp;gt;</strong> → &gt;
              </li>

              <li>
                <strong>&amp;amp;</strong> → &amp;
              </li>

              <li>
                <strong>&amp;quot;</strong> → &quot;
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use This Tool
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste plain text, HTML, or entity-encoded content into the input box.</li>
            <li>Click <strong>Escape HTML</strong> to convert unsafe characters into entities.</li>
            <li>Click <strong>Unescape HTML</strong> to decode entities back into readable text.</li>
            <li>Copy the output for frontend code, content systems, APIs, or debugging.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Everyday Situations Where This Helps
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                Show raw HTML snippets on a page without rendering them.
              </li>

              <li>
                Decode entity-filled text copied from templates, feeds, or APIs.
              </li>

              <li>
                Prepare user-facing text before inserting it into HTML output.
              </li>

              <li>
                Debug content where quotes, ampersands, or tags look broken.
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
                What does HTML escaping do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTML escaping converts special characters such as &lt;, &gt;,
                &, quotes, and apostrophes into HTML entities so they can be
                displayed safely as text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                When should I unescape HTML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Unescape HTML when you need to read or inspect entity-encoded
                text, such as values copied from APIs, templates, databases, or
                content systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Escaping and unescaping happen directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML escaping often connects with URL encoding, Unicode text,
            JSON escaping, and frontend debugging workflows.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tools/url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
            </Link>

            <Link
              href="/tools/unicode-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Unicode Encoder Decoder
            </Link>

            <Link
              href="/tools/json-escape-unescape"
              className="yoryantra-btn-outline"
            >
              JSON Escape Unescape
            </Link>

            <Link
              href="/tools/html-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              HTML Encoder Decoder
            </Link>

            <Link
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
