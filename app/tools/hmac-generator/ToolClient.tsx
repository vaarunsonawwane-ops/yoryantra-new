"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generateHMAC = async () => {
    try {
      if (!secret.trim()) {
        setError("Secret key is required.");
        setOutput("");
        return;
      }

      const encoder = new TextEncoder();

      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: algorithm },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(message)
      );

      const hashArray = Array.from(new Uint8Array(signature));

      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setOutput(hashHex);
      setError("");
    } catch {
      setError("Unable to generate HMAC signature.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setMessage("");
    setSecret("");
    setAlgorithm("SHA-256");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="HMAC Generator"
      description="Generate HMAC signatures using SHA algorithms instantly with this free online HMAC Generator."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Message
        </label>

        <textarea
          className="w-full h-40 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Enter message or payload..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Secret Key
        </label>

        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter secret key..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Algorithm
        </label>

        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option>SHA-256</option>
          <option>SHA-384</option>
          <option>SHA-512</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateHMAC} className="yoryantra-btn">
          Generate HMAC
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated HMAC Signature
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Generated HMAC signature will appear here..."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This HMAC Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HMAC Generator helps you create HMAC signatures from a message
            and secret key directly in your browser. HMAC signatures are widely
            used in APIs, webhooks, authentication systems, and secure request
            verification.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HMAC combines a cryptographic hash function with a secret key to
            verify both the data integrity and authenticity of a message.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Supported Algorithms
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>HMAC SHA-256</li>
            <li>HMAC SHA-384</li>
            <li>HMAC SHA-512</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HMAC Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter your message or payload.</li>
            <li>Enter your secret key.</li>
            <li>Select the HMAC algorithm.</li>
            <li>Click <strong>Generate HMAC</strong> and copy the signature.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating API request signatures.</li>
            <li>Testing webhook signature verification.</li>
            <li>Signing payloads with secret keys.</li>
            <li>Debugging authentication workflows.</li>
            <li>Verifying message integrity in applications.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is HMAC?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HMAC stands for Hash-based Message Authentication Code. It uses
                a secret key and hash algorithm to generate a secure signature.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is HMAC used for APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Many APIs use HMAC signatures to verify that requests are
                authentic and have not been modified.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this HMAC Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. HMAC generation happens directly in your browser. Your
                message and secret key are not uploaded to a server.
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

            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/password-generator" className="yoryantra-btn-outline">
              Password Generator
            </Link>

            <Link href="/tools/uuid-generator" className="yoryantra-btn-outline">
              UUID Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}