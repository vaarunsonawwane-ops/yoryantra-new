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
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [error, setError] = useState("");

  const decodeBase64Url = (value: string) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Not found";
    return new Date(timestamp * 1000).toUTCString();
  };

  const getStatus = (exp?: number) => {
    if (!exp) return "Expiration claim not found.";

    const now = Math.floor(Date.now() / 1000);

    if (exp < now) {
      const secondsAgo = now - exp;
      return `Expired ${secondsAgo} seconds ago.`;
    }

    const secondsLeft = exp - now;
    return `Valid for ${secondsLeft} more seconds.`;
  };

  const checkExpiration = () => {
    try {
      const parts = token.trim().split(".");

      if (parts.length !== 3) {
        setError("Invalid JWT token format.");
        setOutput("");
        setPayload(null);
        return;
      }

      const decodedPayload = JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;

      setPayload(decodedPayload);
      setOutput(getStatus(decodedPayload.exp));
      setError("");
    } catch {
      setError("Unable to decode JWT token.");
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
      description="Check JWT token expiration, issued time, and validity instantly with this free online JWT Expiration Checker."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT Token
        </label>

        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="w-full min-h-[160px] rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkExpiration} className="yoryantra-btn">
          Check Expiration
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            JWT Expiration Result
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

        <div className="yoryantra-output min-h-[140px] text-sm break-words">
          {output || "JWT expiration result will appear here..."}

          {payload && (
            <div className="mt-5 space-y-2">
              <p>
                <strong>Expires At:</strong> {formatDate(payload.exp)}
              </p>
              <p>
                <strong>Issued At:</strong> {formatDate(payload.iat)}
              </p>
              <p>
                <strong>Not Before:</strong> {formatDate(payload.nbf)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is JWT Expiration Checker?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JWT Expiration Checker helps you inspect a JSON Web Token and
            quickly understand whether the token is expired, still valid, or
            missing an expiration claim. It is useful for debugging login
            systems, APIs, authentication flows, and bearer tokens.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JWT tokens often include claims such as <code>exp</code>,
            <code>iat</code>, and <code>nbf</code>. This tool converts those
            Unix timestamp claims into readable UTC dates so you can understand
            token timing without manually decoding the payload.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JWT Expiration Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your JWT token into the input box.</li>
            <li>Click <strong>Check Expiration</strong>.</li>
            <li>View whether the token is expired or still valid.</li>
            <li>Check the readable expiry, issued, and not-before dates.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking whether a JWT access token has expired.</li>
            <li>Debugging login sessions and authentication issues.</li>
            <li>Reading JWT expiry dates without manual timestamp conversion.</li>
            <li>Testing bearer tokens during API development.</li>
            <li>Inspecting token timing claims such as exp, iat, and nbf.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              JWT claim:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              {"{ \"exp\": 1715788800, \"iat\": 1715702400 }"}
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
                The exp claim represents the token expiration time. It is usually
                stored as a Unix timestamp in seconds.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does iat mean in JWT?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The iat claim means issued at. It shows when the JWT token was
                created.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool verify JWT signatures?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool checks JWT timing claims only. Use a JWT signature
                verifier when you need to validate the token signature.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this JWT Expiration Checker secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The token is decoded in your browser for quick inspection.
                Avoid pasting sensitive production tokens into any online tool.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/timestamp-converter" className="yoryantra-btn-outline">
              Timestamp Converter
            </Link>

            <Link href="/tools/api-key-generator" className="yoryantra-btn-outline">
              API Key Generator
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
