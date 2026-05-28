"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

export default function ToolClient() {
  const [message, setMessage] =
    useState("");

  const [secret, setSecret] =
    useState("");

  const [algorithm, setAlgorithm] =
    useState("SHA-256");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const generateHMAC =
    async () => {
      try {
        if (!secret.trim()) {
          setError(
            "Secret key is required."
          );

          setOutput("");
          return;
        }

        const encoder =
          new TextEncoder();

        const key =
          await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            {
              name: "HMAC",
              hash: algorithm,
            },
            false,
            ["sign"]
          );

        const signature =
          await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(message)
          );

        const hashArray =
          Array.from(
            new Uint8Array(
              signature
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
        setError("");
      } catch {
        setError(
          "Unable to generate HMAC signature."
        );

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
      description="Generate secure HMAC SHA signatures instantly with this free online HMAC Generator."
    >
      {/* MESSAGE */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Message or Payload
        </label>

        <textarea
          className="w-full h-40 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Enter message, request body, or payload..."
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
        />
      </div>

      {/* SECRET */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Secret Key
        </label>

        <input
          type="text"
          value={secret}
          onChange={(e) =>
            setSecret(
              e.target.value
            )
          }
          placeholder="Enter secret key..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ALGORITHM */}
      <div className="mt-6">
        <YoryantraSelect
          label="HMAC Algorithm"
          value={algorithm}
          onChange={(value) =>
            setAlgorithm(value)
          }
          options={[
            { label: "SHA-256", value: "SHA-256" },
            { label: "SHA-384", value: "SHA-384" },
            { label: "SHA-512", value: "SHA-512" },
          ]}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateHMAC}
          className="yoryantra-btn"
        >
          Generate HMAC
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
            Generated HMAC Signature
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
            "Generated HMAC signature will appear here..."}
        </pre>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          HMAC generation happens locally inside your browser using the Web
          Crypto API. Your payloads and secret keys are not uploaded or stored
          on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating HMAC Signatures for API Requests
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HMAC generation helps developers create secure request signatures
            for APIs, webhooks, backend services, payment gateways,
            authentication systems, and message verification workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HMAC stands for Hash-based Message Authentication Code. It combines
            a cryptographic hash function with a secret key to verify both the
            authenticity and integrity of data being transmitted between
            systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HMAC Generator supports SHA-256, SHA-384, and SHA-512
            algorithms directly inside your browser without requiring external
            APIs or backend processing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Supported HMAC Algorithms
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-2">
              <li>
                <strong>HMAC SHA-256</strong> — Commonly used in APIs, JWT
                workflows, and webhook verification.
              </li>

              <li>
                <strong>HMAC SHA-384</strong> — Higher-length SHA-2 family
                signing algorithm.
              </li>

              <li>
                <strong>HMAC SHA-512</strong> — Strong long-length signing
                algorithm for advanced security workflows.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the HMAC Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter the message or request payload.
            </li>

            <li>
              Enter the secret signing key.
            </li>

            <li>
              Select the desired HMAC algorithm.
            </li>

            <li>
              Click <strong>Generate HMAC</strong> to create the signature.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Generating signed API requests.
            </li>

            <li>
              Verifying webhook payload integrity.
            </li>

            <li>
              Testing authentication workflows.
            </li>

            <li>
              Creating secure request signatures.
            </li>

            <li>
              Debugging backend verification systems.
            </li>

            <li>
              Building signed communication between services.
            </li>

            <li>
              Verifying that request payloads were not modified.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example HMAC Signature
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Payload:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{"user":"varun","action":"login"}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Secret key:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`my-secret-key`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Generated HMAC SHA-256:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`8f5c7e7d0f1f4a2e7d6f1b0b0d8c5c9f1a7d6c2e5f8a1d3b4c6e9f0a1b2c3d4`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why HMAC Signatures Matter
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Message authenticity:</strong> HMAC helps verify who
                generated a request or payload.
              </li>

              <li>
                <strong>Integrity protection:</strong> Modified payloads produce
                different signatures.
              </li>

              <li>
                <strong>API security:</strong> Many authentication systems rely
                on signed requests.
              </li>

              <li>
                <strong>Webhook verification:</strong> HMAC signatures help
                validate trusted event payloads.
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
                What is HMAC?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HMAC stands for Hash-based Message Authentication Code. It uses
                a secret key together with a hashing algorithm to create a
                secure signature.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is HMAC used in APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Many APIs and webhook systems use HMAC signatures to
                verify authenticity and prevent tampering.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which HMAC algorithm should I use?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HMAC SHA-256 is the most commonly used option for modern API and
                authentication workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this HMAC Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. HMAC signatures are generated locally using browser
                cryptography APIs without sending your data externally.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is HMAC generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. HMAC generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            HMAC generation often connects with API authentication, JWT
            workflows, webhook verification, cryptography utilities, and
            backend security systems.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/hash-generator"
              className="yoryantra-btn-outline"
            >
              Hash Generator
            </Link>

            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/password-generator"
              className="yoryantra-btn-outline"
            >
              Password Generator
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}