"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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

  const [loading, setLoading] =
    useState(false);

  const generateHMAC = async () => {
    if (!secret.length) {
      setError("Enter the shared secret key.");
      setOutput("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const encoder = new TextEncoder();
      const secretBytes = encoder.encode(secret);
      const messageBytes = encoder.encode(message);

      const secretBuffer = secretBytes.buffer.slice(
        secretBytes.byteOffset,
        secretBytes.byteOffset + secretBytes.byteLength
      ) as ArrayBuffer;

      const messageBuffer = messageBytes.buffer.slice(
        messageBytes.byteOffset,
        messageBytes.byteOffset + messageBytes.byteLength
      ) as ArrayBuffer;

      const key = await crypto.subtle.importKey(
        "raw",
        secretBuffer,
        {
          name: "HMAC",
          hash: algorithm,
        },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        messageBuffer
      );

      const hashHex = Array.from(new Uint8Array(signature))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      setOutput(hashHex);
    } catch {
      setError("Unable to generate the HMAC value.");
      setOutput("");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setMessage("");
    setSecret("");
    setAlgorithm("SHA-256");
    setOutput("");
    setError("");
    setLoading(false);
  };

  return (
    <ToolShell
      title="HMAC Generator"
      description="Generate an HMAC SHA-256, SHA-384, or SHA-512 value from UTF-8 text and a shared secret directly in your browser."
    >
      {/* MESSAGE */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Message or Payload
        </label>

        <textarea
          spellCheck={false}
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
          type="password"
          value={secret}
          autoComplete="off"
          spellCheck={false}
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
          disabled={loading}
          className="yoryantra-btn"
        >
          {loading ? "Generating..." : "Generate HMAC"}
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
          Crypto API. Avoid using live production secrets in browser tools.
          Matching another system also requires the same text encoding, exact
          message bytes, secret bytes, algorithm, and output format.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating HMAC Signatures for API Requests
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HMAC values are commonly used when APIs, webhook providers, and
            backend services need to detect message changes using a shared
            secret.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HMAC stands for Hash-based Message Authentication Code. A verifier
            can recalculate the value with the same secret and message bytes.
            A match supports integrity and shared-secret authentication, but it
            does not encrypt the message.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This generator treats the message and secret as UTF-8 text and returns
            lowercase hexadecimal output. Other systems may expect Base64,
            binary keys, canonicalized JSON, timestamps, or prefixed request
            data, so follow the exact signing specification you are testing.
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
              Generating request authentication codes for testing.
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
{`ab5b21516c2ad6eb5f6bd3ec23f9c026a8bb782a1ffa44d322b3e9412575f98e`}
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
                <strong>Shared-secret authentication:</strong> A matching HMAC
                shows that the sender had access to the same secret, assuming the
                secret has remained private.
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
                message authentication code.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is HMAC used in APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Many APIs and webhook systems use HMAC signatures to
                check message integrity and confirm that the sender had access to the shared secret.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which HMAC algorithm should I use?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Follow the algorithm required by the API or system you are testing.
                HMAC SHA-256 is common, but the verifier and generator must use
                the same algorithm.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does my HMAC not match another service?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The message bytes, secret bytes, algorithm, and output encoding
                must match exactly. This tool uses UTF-8 text and lowercase
                hexadecimal output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this HMAC Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Generation runs locally with the browser Web Crypto API. Still,
                avoid entering live production secrets, and compare results with
                the exact signing rules used by the target system.
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

          <YoryantraRelatedTools currentHref="/tools/hmac-generator" />
        </div>
      </section>
    </ToolShell>
  );
}