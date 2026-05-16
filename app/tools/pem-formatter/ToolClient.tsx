"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatPEM = () => {
    try {
      let cleaned = input
        .replace(/-----BEGIN [^-]+-----/g, "")
        .replace(/-----END [^-]+-----/g, "")
        .replace(/\s+/g, "");

      if (!cleaned) {
        setOutput("");
        return;
      }

      const formatted = cleaned.match(/.{1,64}/g)?.join("\n") || cleaned;

      const detectedType =
        input.match(/BEGIN ([^-]+)-----/)?.[1] || "PRIVATE KEY";

      const pem = `-----BEGIN ${detectedType}-----\n${formatted}\n-----END ${detectedType}-----`;

      setOutput(pem);
    } catch {
      setOutput("Unable to format PEM content.");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="PEM Formatter"
      description="Format PEM public keys, private keys, and certificates instantly."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          PEM Input
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste PEM key or certificate here..."
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={formatPEM}
          className="yoryantra-btn"
        >
          Format PEM
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
            Formatted PEM Output
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

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Formatted PEM output will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is PEM Formatter?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            PEM Formatter helps you properly format PEM public keys,
            private keys, certificates, and cryptographic files instantly.
            PEM formatting is commonly used in SSL certificates, JWT signing,
            RSA keys, SSH workflows, APIs, and authentication systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool automatically removes extra whitespace, formats PEM content
            into standard 64-character lines, and preserves the correct PEM
            header and footer structure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the PEM Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your PEM key or certificate.</li>
            <li>Click <strong>Format PEM</strong>.</li>
            <li>View the cleaned and formatted PEM output.</li>
            <li>Copy the formatted PEM content.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Formatting RSA public and private keys.</li>
            <li>Cleaning PEM certificates for SSL workflows.</li>
            <li>Fixing malformed PEM structures.</li>
            <li>Preparing JWT signing keys.</li>
            <li>Formatting cryptographic files for APIs and servers.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              PEM header:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
-----BEGIN PRIVATE KEY-----
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Formatted PEM structure:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
-----END PRIVATE KEY-----
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
                What is PEM format?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                PEM is a Base64-encoded text format commonly used for public
                keys, private keys, certificates, and cryptographic data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are PEM files split into lines?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                PEM files are traditionally formatted into 64-character lines
                for readability and compatibility.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool change the key content?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The tool only reformats the PEM structure and whitespace.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this PEM Formatter privacy-friendly?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. PEM formatting happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/rsa-key-generator" className="yoryantra-btn-outline">
              RSA Key Generator
            </Link>

            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/base64url-encoder-decoder" className="yoryantra-btn-outline">
              Base64URL Encoder Decoder
            </Link>

            <Link href="/tools/hmac-generator" className="yoryantra-btn-outline">
              HMAC Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
