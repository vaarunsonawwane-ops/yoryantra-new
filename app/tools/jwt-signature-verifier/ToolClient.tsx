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
      description="Verify JWT signatures instantly using HS256 secret keys with this free online JWT Signature Verifier."
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

      {/* SECURITY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Security Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JWT verification happens locally inside your browser. Tokens and
          secret keys are not uploaded or stored on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Verifying JWT Signatures Before Trusting Tokens
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JWT signature verification helps confirm whether a JSON Web Token
            was signed using the expected secret key and whether the token
            contents may have been modified. JWT verification is commonly used
            in authentication systems, APIs, session handling, OAuth flows, and
            secure backend applications.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During authentication debugging and API testing, developers often
            need to validate whether a token signature matches the expected
            secret. This JWT Signature Verifier helps verify HS256-signed JWT
            tokens directly inside your browser without manually calculating
            HMAC signatures.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for backend development, API debugging, session
            inspection, authentication troubleshooting, token validation, and
            security-focused development workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JWT Signature Verifier
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your JWT token into the editor.
            </li>

            <li>
              Enter the secret key used to sign the token.
            </li>

            <li>
              Click <strong>Verify JWT Signature</strong>.
            </li>

            <li>
              Review the verification result instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing JWT authentication systems.</li>

            <li>Debugging invalid token signature errors.</li>

            <li>Inspecting HS256-signed JWT tokens.</li>

            <li>Verifying API authentication workflows.</li>

            <li>Checking token integrity during development.</li>

            <li>Testing session and authorization systems.</li>

            <li>Debugging OAuth and backend authentication flows.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding JWT Signature Verification
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Header:</strong> Contains token metadata and signing
                algorithm details.
              </li>

              <li>
                <strong>Payload:</strong> Contains claims, permissions, and
                token information.
              </li>

              <li>
                <strong>Signature:</strong> Confirms whether the token was
                signed using the correct secret key.
              </li>

              <li>
                <strong>Verification:</strong> Helps detect modified or invalid
                tokens during authentication workflows.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Verification Workflow
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`1. Paste JWT token
2. Enter secret key
3. Verify signature
4. Confirm token authenticity`}
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
                What is JWT signature verification?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JWT signature verification checks whether the token signature
                matches the expected secret key and whether the token content
                may have been modified.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which JWT algorithm does this tool support?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This verifier currently supports HS256 JWT signature
                verification using HMAC SHA-256.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool decode JWT payloads?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool focuses on signature verification. You can use the
                JWT Decoder tool to inspect payload data separately.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are JWT secrets uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Verification happens locally inside your browser and secrets
                are not uploaded or stored.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why would JWT verification fail?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Verification can fail because of invalid signatures, incorrect
                secrets, modified payloads, unsupported algorithms, or malformed
                tokens.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            JWT verification often connects with token decoding, Base64
            encoding, API authentication, cookies, and HTTP debugging
            workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/cookie-parser"
              className="yoryantra-btn-outline"
            >
              Cookie Parser
            </Link>

            <Link
              href="/tools/curl-command-builder"
              className="yoryantra-btn-outline"
            >
              CURL Command Builder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}