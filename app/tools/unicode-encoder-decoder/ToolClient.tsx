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

          if (!codePoint) return "";

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
      setError("Unable to decode Unicode text. Please check the format.");
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
          placeholder="Example: Hello \u0059\u006f\u0072\u0079\u0061\u006e\u0074\u0072\u0061"
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
              Encoded or decoded Unicode output will appear here.
            </p>
          )}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Unicode Encoding Appears in Development
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unicode escape sequences often appear inside JavaScript strings,
            JSON payloads, APIs, logs, encoded text, and debugging workflows.
            They make text safer to store and transfer, but quickly become hard
            to read when you are troubleshooting real data.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Unicode Encoder Decoder helps convert readable text into
            Unicode escapes or turn escaped values back into normal text when
            debugging or inspecting payloads.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Unicode Examples
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>\u0048\u0065\u006c\u006c\u006f</strong> → Hello
              </li>

              <li>
                <strong>\u2764</strong> → ❤
              </li>

              <li>
                <strong>\u&#123;1f600&#125;</strong> → 😀
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use This Tool
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text or Unicode escape sequences into the input box.</li>
            <li>Click <strong>Decode Unicode</strong> to read escaped text.</li>
            <li>Click <strong>Encode Unicode</strong> to convert normal text.</li>
            <li>Copy the output for APIs, logs, JSON, scripts, or debugging.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Everyday Situations Where This Helps
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                Decode unreadable Unicode inside API responses or logs.
              </li>

              <li>
                Inspect encoded multilingual text, symbols, or emojis.
              </li>

              <li>
                Prepare Unicode-safe text for scripts and development work.
              </li>

              <li>
                Understand escaped values returned by JSON or JavaScript.
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
                value such as \u0041. These are commonly used in JavaScript,
                JSON, APIs, and encoded text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode emojis?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This tool supports extended Unicode formats such as
                \u&#123;1f600&#125; for emojis and other modern characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Everything runs directly in your browser.
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
