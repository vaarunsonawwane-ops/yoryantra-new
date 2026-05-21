"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encodeAscii = () => {
    if (!input.trim()) {
      setError("Please enter text to convert.");
      setOutput("");
      return;
    }

    try {
      const encoded = Array.from(input)
        .map((char) => {
          const code = char.charCodeAt(0);

          if (code > 127) {
            return `${code} (non-ASCII)`;
          }

          return code.toString();
        })
        .join(" ");

      setOutput(encoded);
      setError("");
    } catch {
      setError("Unable to convert this text to ASCII.");
      setOutput("");
    }
  };

  const decodeAscii = () => {
    if (!input.trim()) {
      setError("Please enter ASCII codes to decode.");
      setOutput("");
      return;
    }

    const values = input
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);

    const invalidValue = values.find((value) => !/^\d+$/.test(value));

    if (invalidValue) {
      setError("ASCII input should contain numbers separated by spaces or commas.");
      setOutput("");
      return;
    }

    try {
      const decoded = values
        .map((value) => {
          const code = Number(value);

          if (code < 0 || code > 127) {
            throw new Error("ASCII code out of range.");
          }

          return String.fromCharCode(code);
        })
        .join("");

      setOutput(decoded);
      setError("");
    } catch {
      setError("ASCII values must be numbers between 0 and 127.");
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
    setInput("89 111 114 121 97 110 116 114 97");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="ASCII Converter"
      description="Convert text to ASCII codes and decode ASCII values back into readable text for debugging, logs, scripts, encoding workflows, and development checks."
    >
      {/* INPUT */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text or ASCII Codes
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="Example: 89 111 114 121 97 110 116 114 97"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={decodeAscii}
          className="yoryantra-btn"
        >
          Decode ASCII
        </button>

        <button
          onClick={encodeAscii}
          className="yoryantra-btn-outline"
        >
          Encode to ASCII
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
              ASCII conversion output will appear here.
            </p>
          )}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting Between Text and Character Codes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            ASCII represents common letters, numbers, punctuation, and control
            characters as numeric values. Even though modern text often uses
            Unicode, ASCII values still appear in logs, legacy systems, scripts,
            debugging output, protocol examples, and simple encoding workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This ASCII Converter helps you quickly convert readable text into
            ASCII codes, or decode ASCII values back into text when you need to
            understand copied numbers or inspect character-level data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the ASCII Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text or ASCII numbers into the input box.</li>
            <li>Use <strong>Decode ASCII</strong> when numeric codes should become readable text.</li>
            <li>Use <strong>Encode to ASCII</strong> when text should become character codes.</li>
            <li>Copy the output for logs, scripts, documentation, debugging, or test data.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            ASCII Values Commonly Checked
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            ASCII codes are often copied as numbers separated by spaces or
            commas. This tool accepts both formats so you can quickly check what
            those values mean.
          </p>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>72 101 108 108 111</strong> → Hello
              </li>

              <li>
                <strong>89 111 114 121 97 110 116 114 97</strong> → Yoryantra
              </li>

              <li>
                <strong>65 66 67</strong> → ABC
              </li>

              <li>
                <strong>48 49 50</strong> → 012
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where ASCII Conversion Helps
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                Decoding numeric character values found in logs or old systems.
              </li>

              <li>
                Converting short text into character codes for examples or tests.
              </li>

              <li>
                Checking simple encoded strings while debugging scripts or payloads.
              </li>

              <li>
                Comparing readable text with the numbers behind each character.
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
                What is ASCII?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                ASCII is a character encoding system that represents common
                English letters, numbers, punctuation, and control characters
                using numeric values from 0 to 127.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode comma-separated ASCII values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The decoder accepts ASCII values separated by spaces or
                commas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does this only decode 0 to 127?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Standard ASCII uses values from 0 to 127. For Unicode escape
                sequences or modern characters, use the Unicode Encoder Decoder.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            ASCII conversion often connects with hex, Unicode, Base64, URL
            encoding, and text debugging workflows.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tools/hex-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Hex Encoder Decoder
            </Link>

            <Link
              href="/tools/unicode-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Unicode Encoder Decoder
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
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
