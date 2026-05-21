"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encodeHex = () => {
    if (!input.trim()) {
      setError("Please enter text to encode.");
      setOutput("");
      return;
    }

    try {
      const encoded = Array.from(new TextEncoder().encode(input))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(" ");

      setOutput(encoded);
      setError("");
    } catch {
      setError("Unable to encode this text.");
      setOutput("");
    }
  };

  const decodeHex = () => {
    const cleaned = input
      .trim()
      .replace(/^0x/i, "")
      .replace(/\\s+/g, "")
      .replace(/:/g, "")
      .replace(/-/g, "");

    if (!cleaned) {
      setError("Please enter hex values to decode.");
      setOutput("");
      return;
    }

    if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
      setError("Hex input can only contain characters 0-9 and A-F.");
      setOutput("");
      return;
    }

    if (cleaned.length % 2 !== 0) {
      setError("Hex input must contain an even number of characters.");
      setOutput("");
      return;
    }

    try {
      const bytes = new Uint8Array(
        cleaned.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );

      const decoded = new TextDecoder().decode(bytes);

      setOutput(decoded);
      setError("");
    } catch {
      setError("Unable to decode this hex value.");
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
    setInput("59 6f 72 79 61 6e 74 72 61");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Hex Encoder Decoder"
      description="Encode text to hexadecimal and decode hex values back into readable text for debugging, APIs, logs, and encoding workflows."
    >
      {/* INPUT */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text or Hex
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="Example: 59 6f 72 79 61 6e 74 72 61"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={decodeHex}
          className="yoryantra-btn"
        >
          Decode Hex
        </button>

        <button
          onClick={encodeHex}
          className="yoryantra-btn-outline"
        >
          Encode to Hex
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
              Encoded or decoded hex output will appear here.
            </p>
          )}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Hex Encoding Shows Up in Development
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hexadecimal values often appear when developers work with binary
            data, encoded text, logs, hashes, colors, buffers, network data,
            and low-level debugging. Hex is compact, readable, and useful when
            raw bytes need to be inspected or copied safely.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Hex Encoder Decoder helps convert normal text into hex values
            and decode hex back into readable text when you are debugging,
            testing, or inspecting encoded data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Hex Examples
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>48 65 6c 6c 6f</strong> → Hello
              </li>

              <li>
                <strong>59 6f 72 79 61 6e 74 72 61</strong> → Yoryantra
              </li>

              <li>
                <strong>e2 9c 93</strong> → ✓
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use This Tool
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste normal text or hex values into the input box.</li>
            <li>Click <strong>Decode Hex</strong> to convert hex into readable text.</li>
            <li>Click <strong>Encode to Hex</strong> to convert text into hexadecimal values.</li>
            <li>Copy the output for debugging, logs, scripts, APIs, or documentation.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Everyday Situations Where This Helps
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                Decode hex values found in logs, buffers, or debugging output.
              </li>

              <li>
                Convert readable text into byte-friendly hexadecimal form.
              </li>

              <li>
                Inspect encoded values when API data or payloads look unclear.
              </li>

              <li>
                Work with low-level strings, binary-safe values, or copied byte output.
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
                What is hexadecimal encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Hexadecimal encoding represents bytes using base-16 values.
                Each byte is commonly written as two characters, such as 48 for
                the letter H.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode spaced hex values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The decoder accepts common formats with spaces, dashes, or
                colons, then cleans them before decoding.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Encoding and decoding happen directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hex encoding often appears alongside Unicode, Base64, URL encoding,
            JSON debugging, and text transformation workflows.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
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
