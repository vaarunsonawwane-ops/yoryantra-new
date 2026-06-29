"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const formatPEM = () => {
    try {
      if (!input.trim()) {
        setError(
          "Please enter PEM content."
        );

        setOutput("");
        return;
      }

      let cleaned = input
        .replace(
          /-----BEGIN [^-]+-----/g,
          ""
        )
        .replace(
          /-----END [^-]+-----/g,
          ""
        )
        .replace(/\s+/g, "");

      if (!cleaned) {
        setError(
          "Invalid PEM content."
        );

        setOutput("");
        return;
      }

      const formatted =
        cleaned
          .match(/.{1,64}/g)
          ?.join("\n") ||
        cleaned;

      const detectedType =
        input.match(
          /BEGIN ([^-]+)-----/
        )?.[1] ||
        "PRIVATE KEY";

      const pem = `-----BEGIN ${detectedType}-----\n${formatted}\n-----END ${detectedType}-----`;

      setOutput(pem);

      setError("");
    } catch {
      setError(
        "Unable to format PEM content."
      );

      setOutput("");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="PEM Formatter"
      description="Format PEM certificates, private keys, and public keys instantly with this free online PEM Formatter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          PEM Input
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
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

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Formatted PEM Output
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

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "Formatted PEM output will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          PEM formatting happens locally inside your browser. Your certificates,
          RSA keys, private keys, and cryptographic content are not uploaded,
          stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting PEM Certificates and Keys Before Using Them
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            PEM formatting helps developers clean and structure PEM certificates,
            RSA private keys, public keys, SSL certificates, JWT signing keys,
            SSH keys, and cryptographic files before using them inside APIs,
            authentication systems, cloud infrastructure, and secure server
            environments.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            PEM files use Base64-encoded content wrapped inside BEGIN and END
            headers. Broken whitespace, malformed formatting, or missing line
            breaks can cause authentication failures, SSL issues, JWT signing
            problems, or deployment errors.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This PEM Formatter automatically cleans PEM content, restores
            standard formatting, and rebuilds readable PEM structure directly
            inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the PEM Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your PEM key or certificate into the editor.
            </li>

            <li>
              Click <strong>Format PEM</strong>.
            </li>

            <li>
              Review the cleaned and formatted PEM structure instantly.
            </li>

            <li>
              Copy the formatted PEM output if needed.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Formatting RSA public and private keys.
            </li>

            <li>
              Cleaning SSL and TLS certificates.
            </li>

            <li>
              Fixing malformed PEM structures.
            </li>

            <li>
              Preparing JWT signing keys.
            </li>

            <li>
              Formatting cryptographic files for APIs and servers.
            </li>

            <li>
              Cleaning PEM values copied from cloud platforms.
            </li>

            <li>
              Restoring readable PEM line formatting.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example PEM Structure
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              PEM header:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`-----BEGIN PRIVATE KEY-----`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Formatted PEM structure:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
-----END PRIVATE KEY-----`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why PEM Formatting Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Cleaner certificates:</strong> Restore readable PEM
                formatting quickly.
              </li>

              <li>
                <strong>Fewer authentication errors:</strong> Prevent malformed
                PEM structures from breaking APIs and JWT systems.
              </li>

              <li>
                <strong>Better interoperability:</strong> Ensure compatibility
                with SSL servers, cloud services, and authentication workflows.
              </li>

              <li>
                <strong>Faster debugging:</strong> Clean copied PEM values from
                terminals, dashboards, and cloud platforms.
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
                for readability and compatibility across systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool change the key content?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The tool only reformats PEM structure and whitespace.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for JWT and SSL workflows?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. PEM formatting is commonly used while working with JWT
                signing keys, SSL certificates, APIs, and authentication
                systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is formatting processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. PEM formatting happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/pem-formatter" />
        </div>
      </section>
    </ToolShell>
  );
}