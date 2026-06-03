"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encodeUnicode = () => {
    if (!input.trim()) {
      setError("Please enter text to encode.");
      setOutput("");
      return;
    }

    try {
      const encoded = Array.from(input)
        .map((char) => {
          const codePoint = char.codePointAt(0);

          if (!codePoint) {
            return "";
          }

          if (codePoint <= 0xffff) {
            return `\\u${codePoint.toString(16).padStart(4, "0")}`;
          }

          return `\\u{${codePoint.toString(16)}}`;
        })
        .join("");

      setOutput(encoded);
      setError("");
    } catch {
      setError("Unable to encode this text.");
      setOutput("");
    }
  };

  const decodeUnicode = () => {
    if (!input.trim()) {
      setError("Please enter Unicode escape text to decode.");
      setOutput("");
      return;
    }

    try {
      const decoded = input
        .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) =>
          String.fromCodePoint(parseInt(hex, 16))
        )
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        );

      setOutput(decoded);
      setError("");
    } catch {
      setError("Unable to decode this Unicode text. Please check the escape format.");
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
    setInput(
      "Hello \\u0059\\u006f\\u0072\\u0079\\u0061\\u006e\\u0074\\u0072\\u0061 \\u2764"
    );
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Unicode Encoder Decoder"
      description="Encode and decode Unicode escape sequences for JavaScript, JSON, APIs, logs, debugging, and encoded text."
    >
      {/* INPUT */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="Example: Hello \\u0059\\u006f\\u0072\\u0079\\u0061\\u006e\\u0074\\u0072\\u0061"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={decodeUnicode}
          className="yoryantra-btn"
        >
          Decode Unicode
        </button>

        <button
          onClick={encodeUnicode}
          className="yoryantra-btn-outline"
        >
          Encode Unicode
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
			  "Encoded or decoded Unicode output will appear here."}
		  </pre>
		</div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Working With Unicode Escapes in APIs, JSON, and Text
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unicode escapes are common in API responses, JavaScript strings,
            logs, translation files, JSON payloads, and stored content. They
            help systems represent characters safely, but they can make real
            text harder to understand when you are debugging.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Unicode Encoder Decoder keeps the workflow simple: paste the
            escaped value, decode it into readable text, or turn normal text
            into escape sequences when you need a safer representation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Unicode Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste plain text or Unicode escape sequences into the input box.</li>
            <li>Use <strong>Decode Unicode</strong> when escaped values need to become readable.</li>
            <li>Use <strong>Encode Unicode</strong> when normal text needs Unicode escape formatting.</li>
            <li>Copy the output for scripts, APIs, JSON, logs, documentation, or debugging notes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode Escape Formats You May See
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Different systems may represent characters in slightly different
            Unicode escape styles. This tool supports the formats developers
            commonly meet while reading logs, JSON, JavaScript, and copied
            payloads.
          </p>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>\\u0048\\u0065\\u006c\\u006c\\u006f</strong> → Hello
              </li>

              <li>
                <strong>\\u2764</strong> → ❤
              </li>

              <li>
                <strong>\\u&#123;1f600&#125;</strong> → 😀
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where Unicode Decoding Helps During Debugging
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                Reading escaped text inside API responses, logs, or stored JSON.
              </li>

              <li>
                Checking multilingual strings, accented characters, symbols, or emojis.
              </li>

              <li>
                Cleaning encoded values before sharing them with a teammate.
              </li>

              <li>
                Understanding strings copied from JavaScript, translation files, or backend output.
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
                What is a Unicode escape sequence?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Unicode escape sequence represents a character using a code
                value, such as \\u0041 for the letter A. These values often
                appear in JavaScript, JSON, logs, APIs, and encoded text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode emojis?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool supports extended Unicode code point notation
                such as \\u&#123;1f600&#125;, which is commonly used for emojis and
                other modern characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for JSON debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Unicode escapes often appear inside JSON strings, API
                responses, stored values, and logs. Decoding them makes the data
                easier to inspect.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Encoding and decoding run directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unicode encoding often appears alongside URL encoding, Base64URL,
            JSON payload debugging, and escaped text handling.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tools/url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
            </Link>

            <Link
              href="/tools/base64url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64URL Encoder Decoder
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
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
