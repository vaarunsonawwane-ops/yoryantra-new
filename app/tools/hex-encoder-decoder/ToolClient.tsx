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
      .replace(/\s+/g, "")
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
            Reading Hex Values in Logs, Payloads, and Debug Output
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hexadecimal values appear in logs, buffers, hashes, copied byte
            output, debugging tools, and low-level data formats. Hex keeps byte
            values compact and precise, but it is not always easy to understand
            without converting it back to readable text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Hex Encoder Decoder helps you move between normal text and
            hexadecimal values when inspecting data, testing examples, or
            cleaning up copied debug output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Hex Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste readable text or hex values into the input box.</li>
            <li>Use <strong>Decode Hex</strong> when hex should become readable text.</li>
            <li>Use <strong>Encode to Hex</strong> when text should become byte-style hex output.</li>
            <li>Copy the result for logs, scripts, API debugging, documentation, or test data.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Hex Formats This Tool Accepts
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hex is often copied from different tools in different formats. The
            decoder accepts common pasted forms and cleans separators before
            converting the value.
          </p>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>48 65 6c 6c 6f</strong> → Hello
              </li>

              <li>
                <strong>48:65:6c:6c:6f</strong> → Hello
              </li>

              <li>
                <strong>48-65-6c-6c-6f</strong> → Hello
              </li>

              <li>
                <strong>596f7279616e747261</strong> → Yoryantra
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where Hex Conversion Helps
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                Decoding byte values copied from logs, buffers, or debugging output.
              </li>

              <li>
                Checking whether encoded payload fragments contain readable text.
              </li>

              <li>
                Converting short examples into hex for testing or documentation.
              </li>

              <li>
                Cleaning pasted hex values that include spaces, dashes, or colons.
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
                What is hex encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Hex encoding represents bytes using base-16 values. A single
                byte is commonly written as two hex characters, such as 48 for
                the letter H.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode spaced or separated hex?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The decoder accepts plain hex, spaced hex, colon-separated
                hex, and dash-separated hex.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does the input need an even number of characters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Hex text is decoded in byte pairs. Each byte needs two hex
                characters, so an odd-length value is incomplete.
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
            Hex conversion often appears alongside Unicode, Base64, URL
            encoding, JSON debugging, and text transformation workflows.
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
