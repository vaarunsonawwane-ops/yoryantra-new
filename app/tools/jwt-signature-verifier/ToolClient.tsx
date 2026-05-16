"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const verifyJWT = async () => {
    try {
      if (!token.trim()) {
        setError("Please enter a JWT token.");
        setOutput("");
        return;
      }

      if (!secret.trim()) {
        setError("Please enter a secret key.");
        setOutput("");
        return;
      }

      const parts = token.split(".");

      if (parts.length !== 3) {
        setError("Invalid JWT format.");
        setOutput("");
        return;
      }

      const encoder = new TextEncoder();

      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["sign"]
      );

      const data = `${parts[0]}.${parts[1]}`;

      const signatureBuffer =
        await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(data)
        );

      const generatedSignature = btoa(
        String.fromCharCode(
          ...new Uint8Array(signatureBuffer)
        )
      )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const isValid =
        generatedSignature === parts[2];

      setOutput(
        isValid
          ? "JWT signature is valid."
          : "JWT signature verification failed."
      );

      setError("");
    } catch {
      setError("Unable to verify JWT signature.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setToken("");
    setSecret("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JWT Signature Verifier"
      description="Verify JWT signatures using a secret key instantly with this free online JWT Signature Verifier."
    >
      {/* TOKEN */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT Token
        </label>

        <textarea
          value={token}
          onChange={(e) =>
            setToken(e.target.value)
          }
          placeholder="Paste JWT token here..."
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
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
            setSecret(e.target.value)
          }
          placeholder="Enter JWT secret key..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={verifyJWT}
          className="yoryantra-btn"
        >
          Verify JWT Signature
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Verification Result
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

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output ||
            "JWT verification result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This JWT Signature Verifier
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JWT Signature Verifier helps you
            verify JWT token signatures instantly
            using a secret key. It is useful for API
            authentication, debugging JWT tokens,
            security testing, backend development,
            and authentication workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool validates whether a JWT token
            signature matches the provided secret
            using HMAC SHA-256 verification.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JWT Signature Verifier
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your JWT token.</li>
            <li>Enter the secret key.</li>
            <li>
              Click <strong>Verify JWT Signature</strong>.
            </li>
            <li>Review the verification result.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging authentication systems.</li>
            <li>Testing JWT token validity.</li>
            <li>Verifying API authentication flows.</li>
            <li>Inspecting signed JWT tokens.</li>
            <li>Security and backend development.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is JWT?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JWT stands for JSON Web Token, a
                secure format used for authentication
                and authorization.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does JWT signature verification do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks whether the token signature
                matches the provided secret key.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool support HS256?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This verifier currently supports
                HMAC SHA-256 signed JWT tokens.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is verification processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JWT verification happens directly
                in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/jwt-expiration-checker"
              className="yoryantra-btn-outline"
            >
              JWT Expiration Checker
            </Link>

            <Link
              href="/tools/hmac-generator"
              className="yoryantra-btn-outline"
            >
              HMAC Generator
            </Link>

            <Link
              href="/tools/base64url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64URL Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}