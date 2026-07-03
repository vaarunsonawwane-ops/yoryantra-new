"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JwtPayload = Record<string, unknown> & {
  exp?: number;
  iat?: number;
  nbf?: number;
};

type TimingResult = {
  status: string;
  lines: string[];
};

function decodeBase64UrlJson(value: string) {
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("The JWT payload is not valid Base64URL data.");
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const parsed: unknown = JSON.parse(text);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The JWT payload must be a JSON object.");
  }

  return parsed as JwtPayload;
}

function readNumericDate(payload: JwtPayload, claim: "exp" | "iat" | "nbf") {
  const value = payload[claim];

  if (value === undefined) return undefined;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`The ${claim} claim must be a finite NumericDate value in seconds.`);
  }

  return value;
}

function formatDate(value: number | undefined) {
  if (value === undefined) return "Not found";

  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toUTCString();
}

function formatDuration(seconds: number) {
  const absolute = Math.abs(Math.trunc(seconds));
  const days = Math.floor(absolute / 86400);
  const hours = Math.floor((absolute % 86400) / 3600);
  const minutes = Math.floor((absolute % 3600) / 60);
  const remainingSeconds = absolute % 60;

  return [
    days ? `${days}d` : "",
    hours ? `${hours}h` : "",
    minutes ? `${minutes}m` : "",
    remainingSeconds || (!days && !hours && !minutes) ? `${remainingSeconds}s` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function evaluateTiming(payload: JwtPayload): TimingResult {
  const now = Math.floor(Date.now() / 1000);
  const exp = readNumericDate(payload, "exp");
  const nbf = readNumericDate(payload, "nbf");
  const iat = readNumericDate(payload, "iat");
  const lines = [`Checked at: ${new Date(now * 1000).toUTCString()}`];

  if (nbf !== undefined && now < nbf) {
    lines.push(`Starts in: ${formatDuration(nbf - now)}`);
    return {
      status: "The token is not active yet according to its nbf claim.",
      lines,
    };
  }

  if (exp !== undefined && now >= exp) {
    lines.push(`Expired by: ${formatDuration(now - exp)}`);
    return {
      status: "The token is expired according to its exp claim.",
      lines,
    };
  }

  if (exp !== undefined) {
    lines.push(`Time until exp: ${formatDuration(exp - now)}`);
  }

  if (iat !== undefined && iat > now) {
    lines.push(`Warning: iat is ${formatDuration(iat - now)} in the future.`);
  }

  if (exp === undefined && nbf === undefined) {
    return {
      status: "No exp or nbf claim was found, so no active time window can be determined.",
      lines,
    };
  }

  return {
    status: "The current time is within the token's declared exp and nbf window.",
    lines,
  };
}

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [output, setOutput] = useState("");
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const checkExpiration = () => {
    try {
      const cleanedToken = token.trim();
      const parts = cleanedToken.split(".");

      if (!cleanedToken) {
        throw new Error("Please enter a JWT token.");
      }

      if (parts.length !== 3 || parts.some((part) => !part)) {
        throw new Error("Enter a compact JWT with three dot-separated sections.");
      }

      const decodedPayload = decodeBase64UrlJson(parts[1]);
      const result = evaluateTiming(decodedPayload);

      setPayload(decodedPayload);
      setOutput([result.status, "", ...result.lines].join("\n"));
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to inspect this JWT.");
      setOutput("");
      setPayload(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the result and copy it manually.");
    }
  };

  const resetAll = () => {
    setToken("");
    setOutput("");
    setPayload(null);
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JWT Expiration Checker"
      description="Inspect JWT exp, nbf, and iat claims and convert their NumericDate values to readable UTC without verifying the signature."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JWT Token
        </label>

        <textarea
          value={token}
          onChange={(event: { target: { value: string } }) =>
            setToken(event.target.value)
          }
          placeholder="Paste a compact JWT here..."
          spellCheck={false}
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkExpiration} className="yoryantra-btn">
          Check Timing Claims
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            JWT Timing Result
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[190px] text-sm break-words">
          <pre className="whitespace-pre-wrap break-words">
            {output || "JWT timing results will appear here."}
          </pre>

          {payload && (
            <div className="mt-5 space-y-3 border-t border-gray-200 pt-5">
              <p><strong>Expires At:</strong> {formatDate(payload.exp)}</p>
              <p><strong>Issued At:</strong> {formatDate(payload.iat)}</p>
              <p><strong>Not Before:</strong> {formatDate(payload.nbf)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Signature and Trust Limitation
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Decoding happens locally in your browser. This tool does not verify
          the JWT signature, issuer, audience, revocation state, permissions, or
          application policy. A matching time window does not prove that the
          token is authentic or acceptable.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Inspecting JWT Timing Claims Without Calling the Issuer
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JWT payloads can include NumericDate claims measured in seconds from
            the Unix epoch. The <code>exp</code> claim sets an expiry boundary,
            <code>nbf</code> sets a not-before boundary, and <code>iat</code>
            records when the token was issued.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This checker decodes those values and compares them with the current
            browser time. It is useful during API and session debugging, but it
            is not a substitute for server-side token verification.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JWT Expiration Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a compact JWT with three dot-separated sections.</li>
            <li>Click <strong>Check Timing Claims</strong>.</li>
            <li>Review the current status and readable UTC values.</li>
            <li>Verify the signature and application-specific claims separately.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How Timing Is Interpreted
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li><strong>exp:</strong> The token should not be accepted at or after this time.</li>
              <li><strong>nbf:</strong> The token should not be accepted before this time.</li>
              <li><strong>iat:</strong> Records issue time but does not by itself define validity.</li>
              <li><strong>Clock skew:</strong> Real systems may allow a small configured tolerance.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">Does this verify the JWT signature?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It only decodes the payload and inspects timing claims. Use a verifier with the expected key and algorithm for signature checking.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Why can an expired token still be decoded?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                JWT payloads are encoded, not encrypted by default. Expiry affects whether software should accept the token, not whether its payload can be read.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">What happens when exp is missing?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                The tool reports that no expiry boundary is available. Whether a token without exp is acceptable depends on the issuing system and application policy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Can server time differ from browser time?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This tool uses your device clock. Production systems may use a different clock and may apply a small clock-skew tolerance.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/jwt-expiration-checker" />
        </div>
      </section>
    </ToolShell>
  );
}
