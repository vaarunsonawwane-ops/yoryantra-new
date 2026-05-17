"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const generateSHA256 =
    async () => {
      if (!input.trim()) {
        setOutput("");
        return;
      }

      const encoder =
        new TextEncoder();

      const data =
        encoder.encode(input);

      const hashBuffer =
        await crypto.subtle.digest(
          "SHA-256",
          data
        );

      const hashArray =
        Array.from(
          new Uint8Array(
            hashBuffer
          )
        );

      const hashHex =
        hashArray
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
  };

  return (
    <ToolShell
      title="SHA256 Generator"
      description="Generate SHA256 hashes from text instantly with this free online SHA256 Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="Enter text to generate SHA256 hash..."
          className="w-full min-h-[160px] rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={
            generateSHA256
          }
          className="yoryantra-btn"
        >
          Generate SHA256
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
            Generated SHA256 Hash
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

        <div className="yoryantra-output min-h-[160px] flex items-center text-sm break-words whitespace-pre-wrap overflow-auto">
          {output ||
            "Generated SHA256 hash will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          SHA256 hash generation happens locally inside your browser using the
          Web Crypto API. Your text, secrets, and generated hashes are not
          uploaded, stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating SHA256 Hashes for Text and API Checks
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            SHA256 hash generation helps developers create cryptographic hashes
            for API verification, authentication systems, file integrity checks,
            blockchain workflows, digital signatures, webhook validation,
            security testing, and backend verification systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            SHA256 is one of the most widely used cryptographic hashing
            algorithms in modern infrastructure and security workflows. The same
            input always generates the same 256-bit hash, while even tiny input
            changes create completely different outputs.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This SHA256 Generator creates hashes directly inside your browser
            using the Web Crypto API without requiring backend processing or
            external APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the SHA256 Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter the text you want
              to hash.
            </li>

            <li>
              Click{" "}
              <strong>
                Generate SHA256
              </strong>.
            </li>

            <li>
              Review the generated
              SHA256 hash instantly.
            </li>

            <li>
              Copy the generated hash
              for your workflow.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Generating SHA256 hashes
              for API verification.
            </li>

            <li>
              Checking file and text
              integrity.
            </li>

            <li>
              Creating cryptographic
              fingerprints.
            </li>

            <li>
              Verifying webhook
              payloads and signatures.
            </li>

            <li>
              Learning cryptographic
              hashing workflows.
            </li>

            <li>
              Comparing hashed values
              during testing.
            </li>

            <li>
              Building secure backend
              validation systems.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example SHA256 Hash
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Input text:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`hello-world`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              SHA256 hash:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`afa27b44d43b02a9fea41d13be5b47ab`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why SHA256 Hashing Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>
                  Data integrity:
                </strong>{" "}
                Detect changes in files,
                payloads, and structured
                data.
              </li>

              <li>
                <strong>
                  API security:
                </strong>{" "}
                SHA256 is widely used in
                authentication and
                verification workflows.
              </li>

              <li>
                <strong>
                  Deterministic output:
                </strong>{" "}
                The same input always
                produces the same hash.
              </li>

              <li>
                <strong>
                  Modern cryptography:
                </strong>{" "}
                SHA256 remains heavily
                used across blockchain,
                APIs, and security
                systems.
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
                What is SHA256?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                SHA256 is a cryptographic hashing algorithm that converts data
                into a fixed-length 256-bit hash value.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is SHA256 reversible?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. SHA256 is a one-way hashing algorithm and cannot be directly
                reversed back into the original input.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does a small input change create a different hash?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Cryptographic hashing algorithms are designed so tiny input
                changes generate completely different outputs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this SHA256 Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. SHA256 hashes are generated directly inside your browser
                using the Web Crypto API.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are generated hashes uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. SHA256 generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            SHA256 hashing often connects with API verification, authentication
            systems, HMAC workflows, backend security, blockchain systems, and
            cryptographic validation workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/hash-generator"
              className="yoryantra-btn-outline"
            >
              Hash Generator
            </Link>

            <Link
              href="/tools/hmac-generator"
              className="yoryantra-btn-outline"
            >
              HMAC Generator
            </Link>

            <Link
              href="/tools/bcrypt-generator"
              className="yoryantra-btn-outline"
            >
              bcrypt Generator
            </Link>

            <Link
              href="/tools/random-token-generator"
              className="yoryantra-btn-outline"
            >
              Random Token Generator
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