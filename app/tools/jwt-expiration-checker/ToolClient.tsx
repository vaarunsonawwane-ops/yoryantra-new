"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type JwtPayload = {
  exp?: number;
  iat?: number;
  nbf?: number;
  [key: string]: unknown;
};

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [output, setOutput] = useState("");
  const [payload, setPayload] =
    useState<JwtPayload | null>(null);
  const [error, setError] = useState("");

  const decodeBase64Url = (
    value: string
  ) => {
    const base64 = value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length +
        ((4 - (base64.length % 4)) % 4),
      "="
    );

    return decodeURIComponent(
      atob(padded)
        .split("")
        .map(
          (char) =>
            `%${`00${char
              .charCodeAt(0)
              .toString(16)}`.slice(-2)}`
        )
        .join("")
    );
  };

  const formatDate = (
    timestamp?: number
  ) => {
    if (!timestamp) return "Not found";

    return new Date(
      timestamp * 1000
    ).toUTCString();
  };

  const getStatus = (exp?: number) => {
    if (!exp)
      return "Expiration claim not found.";

    const now = Math.floor(
      Date.now() / 1000
    );

    if (exp < now) {
      const secondsAgo = now - exp;

      return `Expired ${secondsAgo} seconds ago.`;
    }

    const secondsLeft = exp - now;

    return `Valid for ${secondsLeft} more seconds.`;
  };

  const checkExpiration = () => {
    try {
      const parts = token
        .trim()
        .split(".");

      if (parts.length !== 3) {
        setError(
          "Invalid JWT token format."
        );

        setOutput("");
        setPayload(null);
        return;
      }

      const decodedPayload = JSON.parse(
        decodeBase64Url(parts[1])
      ) as JwtPayload;

      setPayload(decodedPayload);

      setOutput(
        getStatus(decodedPayload.exp)
      );

      setError("");
    } catch {
      setError(
        "Unable to decode JWT token."
      );

      setOutput("");
      setPayload(null);
    }
  };

  const resetAll = () => {
    setToken("");
    setOutput("");
    setPayload(null);
    setError("");
  };

  return (
    <ToolShell
      title="JWT Expiration Checker"
      description="Check JWT expiration, issued time, and token validity instantly with this free online JWT Expiration Checker."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT Token
        </label>

        <textarea
          value={token}
          onChange={(e) =>
            setToken(e.target.value)
          }
          placeholder="Paste your JWT token here..."
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={checkExpiration}
          className="yoryantra-btn"
        >
          Check Expiration
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
            JWT Expiration Result
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

        <div className="yoryantra-output min-h-[160px] text-sm break-words">
          {output ||
            "JWT expiration result will appear here..."}

          {payload && (
            <div className="mt-5 space-y-3">
              <p>
                <strong>
                  Expires At:
                </strong>{" "}
                {formatDate(payload.exp)}
              </p>

              <p>
                <strong>
                  Issued At:
                </strong>{" "}
                {formatDate(payload.iat)}
              </p>

              <p>
                <strong>
                  Not Before:
                </strong>{" "}
                {formatDate(payload.nbf)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECURITY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Security Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JWT decoding happens locally inside your browser. Tokens are not
          uploaded or stored on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking JWT Expiration Before Tokens Fail
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JWT expiration checking helps developers understand whether a JSON
            Web Token is still valid, already expired, or missing important
            timing claims. JWT tokens are widely used in authentication systems,
            APIs, OAuth workflows, session management, and bearer token-based
            authorization.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During API debugging and authentication testing, expired tokens are
            one of the most common reasons for login failures, unauthorized
            responses, and broken sessions. This JWT Expiration Checker helps
            inspect expiration timing instantly without manually decoding Unix
            timestamps or token payloads.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool converts JWT timing claims such as{" "}
            <code>exp</code>, <code>iat</code>, and <code>nbf</code> into
            readable UTC dates directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JWT Expiration Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your JWT token into the editor.
            </li>

            <li>
              Click{" "}
              <strong>
                Check Expiration
              </strong>.
            </li>

            <li>
              Review whether the token is valid or expired.
            </li>

            <li>
              Inspect readable expiration and issued timestamps.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Checking whether JWT access tokens are expired.
            </li>

            <li>
              Debugging API authentication failures.
            </li>

            <li>
              Inspecting OAuth and session token timing.
            </li>

            <li>
              Reading exp, iat, and nbf claims quickly.
            </li>

            <li>
              Testing authentication flows during development.
            </li>

            <li>
              Inspecting bearer tokens in frontend applications.
            </li>

            <li>
              Converting JWT Unix timestamps into readable dates.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding JWT Timing Claims
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>exp:</strong>{" "}
                Defines the token expiration timestamp.
              </li>

              <li>
                <strong>iat:</strong>{" "}
                Shows when the token was originally issued.
              </li>

              <li>
                <strong>nbf:</strong>{" "}
                Defines when the token becomes valid.
              </li>

              <li>
                <strong>Unix Timestamp:</strong>{" "}
                JWT timing claims are usually stored in Unix seconds.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JWT Expiration
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              JWT claim:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "exp": 1715788800,
  "iat": 1715702400
}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Readable expiry:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Wed, 15 May 2024 00:00:00 GMT
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
                What does exp mean in JWT?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The exp claim defines the JWT expiration timestamp and determines
                when the token should no longer be accepted.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does iat mean in JWT?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The iat claim means issued at and shows when the token was
                originally created.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool verify JWT signatures?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool checks expiration-related claims only. Use the JWT
                Signature Verifier tool to validate token signatures.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can expired JWT tokens still be decoded?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Expired tokens can still be decoded for inspection unless
                the token format itself is invalid.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JWT expiration checking processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JWT decoding and expiration checking happen locally inside
                your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            JWT expiration debugging often connects with token decoding,
            authentication workflows, Base64 encoding, timestamps, and API
            testing.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/jwt-signature-verifier"
              className="yoryantra-btn-outline"
            >
              JWT Signature Verifier
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/timestamp-converter"
              className="yoryantra-btn-outline"
            >
              Timestamp Converter
            </Link>

            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}