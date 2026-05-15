"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");

  const generateHash = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const hashBuffer = await crypto.subtle.digest(
      algorithm,
      data
    );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    );

    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    setOutput(hashHex);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setAlgorithm("SHA-256");
  };

  return (
    <ToolShell
      title="Hash Generator"
      description="Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly with this free online Hash Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full h-56 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Enter text to hash..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* HASH TYPE */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Hash Algorithm
        </label>

        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option>SHA-1</option>
          <option>SHA-256</option>
          <option>SHA-384</option>
          <option>SHA-512</option>
        </select>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateHash}
          className="yoryantra-btn"
        >
          Generate Hash
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
            Generated Hash
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
          {output || "Generated hash will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This Hash Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Hash Generator helps you create SHA hashes instantly
            from text input directly in your browser. Hashes are commonly
            used in security systems, password storage, APIs, digital
            signatures, integrity checks, and software development.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A cryptographic hash converts text into a fixed-length string
            that cannot easily be reversed back into the original value.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Supported Algorithms
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>SHA-1</li>
            <li>SHA-256</li>
            <li>SHA-384</li>
            <li>SHA-512</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Hash Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter text into the input field.</li>
            <li>Select the hash algorithm.</li>
            <li>Click <strong>Generate Hash</strong>.</li>
            <li>Copy the generated hash value.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating secure hash values.</li>
            <li>Checking file or text integrity.</li>
            <li>Creating signatures for APIs.</li>
            <li>Security and authentication workflows.</li>
            <li>Software testing and development.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a hash?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A hash is a fixed-length cryptographic value generated from
                input data using a hashing algorithm.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can hashes be reversed?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Cryptographic hashes are designed to be one-way functions and
                cannot easily be reversed back into the original input.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Hash Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Hashes are generated directly in your browser using the
                Web Crypto API.
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

            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/uuid-generator" className="yoryantra-btn-outline">
              UUID Generator
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}