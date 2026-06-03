"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [output, setOutput] = useState("");
  const [headerOutput, setHeaderOutput] =
    useState("");
  const [error, setError] = useState("");

  const decodeJWT = () => {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        setError("Invalid JWT token.");
        setOutput("");
        setHeaderOutput("");
        return;
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      setHeaderOutput(
        JSON.stringify(header, null, 2)
      );

      setOutput(
        JSON.stringify(payload, null, 2)
      );

      setError("");
    } catch {
      setError("Unable to decode JWT token.");
      setOutput("");
      setHeaderOutput("");
    }
  };

  const resetAll = () => {
    setToken("");
    setOutput("");
    setHeaderOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JWT Decoder"
      description="Decode JWT tokens instantly and inspect payload data securely with this free online JWT Decoder."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT Token
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste JWT token here..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={decodeJWT}
          className="yoryantra-btn"
        >
          Decode JWT
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

      {/* HEADER OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Decoded Header
          </h3>

          {headerOutput && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  headerOutput
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[140px] whitespace-pre-wrap break-words">
          {headerOutput ||
            "Decoded JWT header will appear here..."}
        </pre>
      </div>

      {/* PAYLOAD OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Decoded Payload
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
            "Decoded JWT payload will appear here..."}
        </pre>
      </div>

      {/* SECURITY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Security Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JWT tokens are decoded locally inside your browser. Your token data
          is not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reading JWT Tokens Without Guessing the Payload
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JWT tokens are commonly used for authentication, authorization,
            API access, session handling, identity systems, and secure web
            application workflows. A JSON Web Token usually contains encoded
            header information, payload claims, and a signature section.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During API development and debugging, JWT payloads often contain
            useful information such as user IDs, permissions, roles, issuer
            details, expiration timestamps, and session metadata. This JWT
            Decoder helps inspect token contents instantly without manually
            decoding Base64 values.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for frontend debugging, authentication systems,
            API testing, OAuth workflows, developer troubleshooting, and
            session inspection directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JWT Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your JWT token into the editor.
            </li>

            <li>
              Click <strong>Decode JWT</strong>.
            </li>

            <li>
              Review the decoded header and payload data.
            </li>

            <li>
              Copy the decoded JSON output if needed.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Inspecting JWT payload claims during debugging.</li>

            <li>Checking token expiration timestamps.</li>

            <li>Debugging API authentication issues.</li>

            <li>Inspecting OAuth and session tokens.</li>

            <li>Reading user role and permission claims.</li>

            <li>Testing frontend authentication flows.</li>

            <li>Analyzing token structure during development.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JWT Payload
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`{
  "sub": "1234567890",
  "name": "John Doe",
  "role": "admin",
  "iat": 1715940000,
  "exp": 1715943600
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding JWT Token Structure
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Header:</strong> Contains token type and signing
                algorithm information.
              </li>

              <li>
                <strong>Payload:</strong> Contains claims, permissions, user
                data, and token metadata.
              </li>

              <li>
                <strong>Signature:</strong> Helps verify token integrity and
                authenticity.
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
                What is a JWT token?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JWT stands for JSON Web Token, a compact format commonly used
                for authentication, authorization, and secure data exchange.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this JWT Decoder verify signatures?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool decodes JWT content for inspection only and does
                not verify signatures or token trust.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JWT token uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JWT decoding happens locally inside your browser and token
                data is not uploaded or stored.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are JWT tokens Base64 encoded?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JWT sections use Base64 URL-safe encoding so tokens can travel
                safely through browsers, APIs, and HTTP headers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I decode expired JWT tokens?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Expired tokens can still be decoded for inspection unless
                the token format itself is invalid.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            JWT debugging often connects with Base64 decoding, API testing,
            cookies, HTTP headers, and authentication workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
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

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}