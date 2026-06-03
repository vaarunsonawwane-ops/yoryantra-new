"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [algorithm, setAlgorithm] =
    useState("SHA-256");

  const generateHash = async () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    const encoder =
      new TextEncoder();

    const data = encoder.encode(
      input
    );

    const hashBuffer =
      await crypto.subtle.digest(
        algorithm,
        data
      );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    );

    const hashHex = hashArray
      .map((b) =>
        b
          .toString(16)
          .padStart(2, "0")
      )
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
      description="Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly with this free online Hash Generator."
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
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
        />
      </div>

      {/* HASH TYPE */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Hash Algorithm
        </label>

        <YoryantraSelect
          value={algorithm}
          onChange={(value) =>
            setAlgorithm(value)
          }
          options={[
            { label: "SHA-1", value: "SHA-1" },
            { label: "SHA-256", value: "SHA-256" },
            { label: "SHA-384", value: "SHA-384" },
            { label: "SHA-512", value: "SHA-512" },
          ]}
        />
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output ||
            "Generated hash will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Hash generation happens locally inside your browser using the Web
          Crypto API. Your text input is not uploaded, stored, or transmitted
          to any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Hashes for Text, Tokens, and Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hash generation helps developers create cryptographic hash values
            from text input for security workflows, APIs, authentication
            systems, integrity verification, digital signatures, debugging, and
            backend development.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A cryptographic hash converts text into a fixed-length encoded
            value. Even small input changes produce completely different hash
            outputs, making hashing useful for verification, security checks,
            password workflows, and detecting modifications.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Hash Generator supports SHA-1, SHA-256, SHA-384, and SHA-512
            hashing algorithms directly inside your browser without requiring
            external APIs or server-side processing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Supported Hash Algorithms
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-2">
              <li>
                <strong>SHA-1</strong> — Older hashing algorithm commonly used
                in legacy systems.
              </li>

              <li>
                <strong>SHA-256</strong> — Widely used secure hashing algorithm
                for APIs, security systems, and blockchain workflows.
              </li>

              <li>
                <strong>SHA-384</strong> — Longer SHA-2 family hashing
                algorithm with stronger output length.
              </li>

              <li>
                <strong>SHA-512</strong> — High-length cryptographic hash used
                in advanced security workflows.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Hash Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter text into the input field.
            </li>

            <li>
              Select the desired hashing algorithm.
            </li>

            <li>
              Click <strong>Generate Hash</strong>.
            </li>

            <li>
              Copy the generated hash output instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Generating secure hash values for APIs.
            </li>

            <li>
              Verifying file and text integrity.
            </li>

            <li>
              Creating signatures for backend systems.
            </li>

            <li>
              Debugging authentication workflows.
            </li>

            <li>
              Building security and verification systems.
            </li>

            <li>
              Comparing data changes during development.
            </li>

            <li>
              Creating deterministic encoded outputs from text.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example SHA-256 Hash
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Input text:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Yoryantra`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              SHA-256 output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`6e4f2d5d9c9e2df4b98f70c1717d5a6fcb6dc4b2f7bb8fd21d0ecf6f7c39c11f`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Cryptographic Hashing Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Integrity verification:</strong> Hashes help detect
                whether data has changed.
              </li>

              <li>
                <strong>Security workflows:</strong> Hashing is widely used in
                authentication and verification systems.
              </li>

              <li>
                <strong>Deterministic output:</strong> The same input always
                produces the same hash value.
              </li>

              <li>
                <strong>Efficient debugging:</strong> Developers can compare
                hash values quickly during testing.
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
                Cryptographic hashes are designed as one-way functions and
                cannot easily be reversed back into the original input.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which hash algorithm should I use?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                SHA-256 is commonly recommended for modern applications and API
                workflows because it offers stronger security than older
                algorithms like SHA-1.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Hash Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Hashes are generated locally using browser cryptography
                APIs without sending data externally.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is hashing processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Hash generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Hash generation often connects with authentication systems,
            cryptography utilities, JWT workflows, API security, and backend
            development tools.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/uuid-generator"
              className="yoryantra-btn-outline"
            >
              UUID Generator
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}