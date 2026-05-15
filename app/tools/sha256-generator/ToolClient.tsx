"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const generateSHA256 = async () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
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
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to generate SHA256 hash..."
          className="w-full min-h-[140px] rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateSHA256}
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
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output || "Generated SHA256 hash will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This SHA256 Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This SHA256 Generator helps you create SHA256 hashes from text
            instantly. SHA256 is a widely used cryptographic hashing algorithm
            commonly used for data integrity verification, authentication,
            digital signatures, blockchain systems, and security workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The generated SHA256 hash is deterministic, meaning the same input
            always produces the same output. Even a small change in the input
            creates a completely different hash value.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the SHA256 Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the text you want to hash.</li>
            <li>Click <strong>Generate SHA256</strong>.</li>
            <li>Copy the generated SHA256 hash.</li>
            <li>Use the hash in your development or security workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating SHA256 hashes for data verification.</li>
            <li>Checking file or text integrity.</li>
            <li>Using SHA256 in authentication systems.</li>
            <li>Creating consistent cryptographic fingerprints.</li>
            <li>Learning how SHA256 hashing works.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Input text:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              hello-world
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              SHA256 hash:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              afa27b44d43b02a9fea41d13be5b47ab
            </pre>
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
                SHA256 is a cryptographic hashing algorithm that converts input
                data into a fixed-length 256-bit hash value.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is SHA256 reversible?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. SHA256 is a one-way hashing algorithm. The original input
                cannot be directly recovered from the hash.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does a small input change create a different hash?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Cryptographic hash functions are designed so that even tiny input
                changes generate completely different outputs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this SHA256 Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The hash is generated directly in your browser using the
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
            <Link href="/tools/hash-generator" className="yoryantra-btn-outline">
              Hash Generator
            </Link>

            <Link href="/tools/hmac-generator" className="yoryantra-btn-outline">
              HMAC Generator
            </Link>

            <Link href="/tools/bcrypt-generator" className="yoryantra-btn-outline">
              bcrypt Generator
            </Link>

            <Link href="/tools/api-key-generator" className="yoryantra-btn-outline">
              API Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}