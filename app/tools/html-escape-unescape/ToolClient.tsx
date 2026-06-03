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
		  "Escaped or unescaped HTML output will appear here."}
	  </pre>
	</div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Escaping HTML Text for Safe Display
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML escaping turns characters like angle brackets, quotes, and
            ampersands into entities so browsers show them as text instead of
            reading them as markup. It is useful when you need to display code
            snippets, user-entered text, CMS content, or raw HTML safely.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool also works in reverse, helping you decode entity-heavy
            text copied from templates, feeds, APIs, databases, CMS fields, or
            logs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HTML Escape Unescape Tool
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text, HTML, or entity-encoded content into the input box.</li>
            <li>Use <strong>Escape HTML</strong> when markup should be displayed as text.</li>
            <li>Use <strong>Unescape HTML</strong> when entities should become readable characters.</li>
            <li>Copy the output for frontend code, CMS content, API debugging, or documentation.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            HTML Characters Commonly Escaped
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            These characters often need escaping because browsers may otherwise
            interpret them as markup, attributes, or entity syntax.
          </p>

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

              <li>
                <strong>&amp;#39;</strong> → apostrophe
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where HTML Entity Decoding Helps
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                Showing raw HTML snippets on a page without letting the browser render them.
              </li>

              <li>
                Reading entity-encoded text copied from CMS fields, templates, or feeds.
              </li>

              <li>
                Cleaning API values that contain encoded quotes, ampersands, or tags.
              </li>

              <li>
                Debugging content that looks broken because entities are mixed with normal text.
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
                safely displayed as text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                When should I unescape HTML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Use unescape when you need to read or inspect entity-encoded
                content from APIs, templates, databases, CMS output, or copied
                HTML snippets.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is escaping the same as sanitizing HTML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Escaping converts special characters into entities.
                Sanitizing is a broader security process that removes or limits
                unsafe markup. This tool is for escaping and decoding text.
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
