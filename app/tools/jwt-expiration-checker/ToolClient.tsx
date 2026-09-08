"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JwtObject = Record<string, unknown>;

type ParsedJwt = {
  header: JwtObject;
  payload: JwtObject;
  algorithm: string;
  unsecured: boolean;
};

type TimingEvaluation = {
  headline: string;
  caution: boolean;
  lines: string[];
  observations: string[];
};

type InspectionResult = {
  parsed: ParsedJwt;
  timing: TimingEvaluation;
  checkedAt: number;
  toleranceSeconds: number;
};

const CLAIMS = ["exp", "nbf", "iat"] as const;
type TimingClaim = (typeof CLAIMS)[number];

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64UrlBytes(value: string, label: string, allowEmpty = false) {
  if (!value) {
    if (allowEmpty) return new Uint8Array();
    throw new Error(`${label} is empty.`);
  }

  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`${label} contains characters outside unpadded Base64URL.`);
  }

  if (value.length % 4 === 1) {
    throw new Error(`${label} has an impossible Base64URL length.`);
  }

  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

    if (bytesToBase64Url(bytes) !== value) {
      throw new Error(`${label} is not canonical unpadded Base64URL.`);
    }

    return bytes;
  } catch (caughtError) {
    if (caughtError instanceof Error && caughtError.message.includes(label)) {
      throw caughtError;
    }

    throw new Error(`${label} could not be decoded as Base64URL.`);
  }
}

function decodeJsonObject(value: string, label: string) {
  const bytes = decodeBase64UrlBytes(value, label);
  let text = "";

  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8.`);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`${label} is not valid JSON.`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must decode to a JSON object.`);
  }

  return parsed as JwtObject;
}

function parseCompactJwt(token: string): ParsedJwt {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("A readable signed or unsecured compact JWT has three dot-separated sections.");
  }

  const header = decodeJsonObject(parts[0], "JWT header");

  if (header.b64 === false) {
    throw new Error('JWTs must not use the JWS "b64": false unencoded-payload option.');
  }

  const payload = decodeJsonObject(parts[1], "JWT payload");
  const algorithm = header.alg;

  if (typeof algorithm !== "string" || !algorithm) {
    throw new Error('The JWT header needs a non-empty string "alg" value.');
  }

  const signature = parts[2];

  if (algorithm === "none") {
    if (signature !== "") {
      throw new Error('A compact JWS using alg="none" must have an empty signature section.');
    }
  } else {
    if (!signature) {
      throw new Error(`The ${algorithm} JWS has an empty signature section.`);
    }

    decodeBase64UrlBytes(signature, "JWT signature");
  }

  return {
    header,
    payload,
    algorithm,
    unsecured: algorithm === "none",
  };
}

function readNumericDate(payload: JwtObject, claim: TimingClaim) {
  const value = payload[claim];

  if (value === undefined) return undefined;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`The ${claim} claim must be a finite JSON number containing a NumericDate value.`);
  }

  return value;
}

function formatUtc(value: number | undefined) {
  if (value === undefined) return "Not present";

  const milliseconds = value * 1000;

  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > 8.64e15) {
    return "Outside the JavaScript Date range";
  }

  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? "Outside the JavaScript Date range" : date.toUTCString();
}

function formatDuration(seconds: number) {
  const absolute = Math.abs(seconds);

  if (absolute < 1) return `${absolute.toFixed(3)}s`;

  const whole = Math.floor(absolute);
  const days = Math.floor(whole / 86400);
  const hours = Math.floor((whole % 86400) / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remainingSeconds = whole % 60;

  return [
    days ? `${days}d` : "",
    hours ? `${hours}h` : "",
    minutes ? `${minutes}m` : "",
    remainingSeconds || (!days && !hours && !minutes) ? `${remainingSeconds}s` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function evaluateTiming(payload: JwtObject, toleranceSeconds: number, checkedAt: number): TimingEvaluation {
  const exp = readNumericDate(payload, "exp");
  const nbf = readNumericDate(payload, "nbf");
  const iat = readNumericDate(payload, "iat");
  const observations: string[] = [];
  const lines: string[] = [];

  const tooEarly = nbf !== undefined && checkedAt + toleranceSeconds < nbf;
  const expired = exp !== undefined && checkedAt - toleranceSeconds >= exp;

  if (exp !== undefined) {
    const delta = exp - checkedAt;
    lines.push(
      delta > 0
        ? `exp is ${formatDuration(delta)} ahead of the browser clock.`
        : delta < 0
          ? `exp is ${formatDuration(delta)} behind the browser clock.`
          : "exp matches the browser clock to the current millisecond."
    );
  }

  if (nbf !== undefined) {
    const delta = nbf - checkedAt;
    lines.push(
      delta > 0
        ? `nbf is ${formatDuration(delta)} ahead of the browser clock.`
        : delta < 0
          ? `nbf is ${formatDuration(delta)} behind the browser clock.`
          : "nbf matches the browser clock to the current millisecond."
    );
  }

  if (iat !== undefined) {
    const delta = iat - checkedAt;

    if (delta > toleranceSeconds) {
      observations.push(`iat is ${formatDuration(delta)} in the future beyond the selected clock tolerance.`);
    }
  }

  if (exp !== undefined && nbf !== undefined && exp <= nbf) {
    observations.push("exp is at or before nbf, so the declared acceptance window is empty or contradictory.");
  }

  if (iat !== undefined && exp !== undefined && iat > exp) {
    observations.push("iat is later than exp. That ordering is unusual and deserves issuer-side review.");
  }

  if (tooEarly && expired) {
    return {
      headline: "The browser clock falls outside both declared timing boundaries.",
      caution: true,
      lines,
      observations,
    };
  }

  if (tooEarly) {
    return {
      headline: "The nbf boundary has not been reached after applying the selected tolerance.",
      caution: true,
      lines,
      observations,
    };
  }

  if (expired) {
    return {
      headline: "The exp boundary has been reached after applying the selected tolerance.",
      caution: true,
      lines,
      observations,
    };
  }

  if (exp === undefined && nbf === undefined) {
    return {
      headline: "No exp or nbf claim is present, so no acceptance window can be inferred.",
      caution: true,
      lines,
      observations,
    };
  }

  if (exp === undefined) {
    return {
      headline: "The nbf boundary has passed, but no exp upper boundary is declared.",
      caution: true,
      lines,
      observations,
    };
  }

  if (nbf === undefined) {
    return {
      headline: "The exp boundary has not been reached; no nbf lower boundary is declared.",
      caution: false,
      lines,
      observations,
    };
  }

  return {
    headline: "The browser clock is inside the declared exp and nbf window.",
    caution: observations.length > 0,
    lines,
    observations,
  };
}

function buildCopyText(result: InspectionResult) {
  const { payload } = result.parsed;
  const rows = CLAIMS.map((claim) => {
    const raw = payload[claim];
    return `${claim}: ${raw === undefined ? "Not present" : String(raw)} | ${formatUtc(typeof raw === "number" ? raw : undefined)}`;
  });

  return [
    "JWT timing inspection",
    result.timing.headline,
    `Checked at: ${new Date(result.checkedAt * 1000).toUTCString()}`,
    `Clock tolerance: ${result.toleranceSeconds} seconds`,
    `Header alg: ${result.parsed.algorithm}`,
    ...rows,
    ...result.timing.lines,
    ...result.timing.observations.map((item) => `Observation: ${item}`),
    "Signature, issuer, audience, and application policy were not verified.",
  ].join("\n");
}

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [toleranceInput, setToleranceInput] = useState("0");
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const checkTiming = () => {
    const cleanedToken = token.trim();

    if (!cleanedToken) {
      setError("Paste a JWT before checking its timing claims.");
      setNotice("");
      setResult(null);
      return;
    }

    const parsedTolerance = Number(toleranceInput);

    if (!Number.isInteger(parsedTolerance) || parsedTolerance < 0 || parsedTolerance > 300) {
      setError("Clock tolerance must be a whole number from 0 to 300 seconds.");
      setNotice("");
      setResult(null);
      return;
    }

    const parts = cleanedToken.split(".");

    if (parts.length === 5) {
      setNotice(
        "This is a five-part compact JWE. Its claims are encrypted, so exp, nbf, and iat cannot be read without decrypting the payload first."
      );
      setError("");
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const parsed = parseCompactJwt(cleanedToken);
      const checkedAt = Date.now() / 1000;
      const timing = evaluateTiming(parsed.payload, parsedTolerance, checkedAt);

      setResult({ parsed, timing, checkedAt, toleranceSeconds: parsedTolerance });
      setError("");
      setNotice("");
      setCopied(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to inspect this JWT.");
      setNotice("");
      setResult(null);
      setCopied(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(buildCopyText(result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the visible timing details and copy them manually.");
    }
  };

  const resetAll = () => {
    setToken("");
    setToleranceInput("0");
    setResult(null);
    setError("");
    setNotice("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JWT Expiration Checker"
      description="Read exp, nbf, and iat against your browser clock without treating decoded claims as trusted."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">JWT</label>
        <textarea
          value={token}
          onChange={(event: { target: { value: string } }) => {
            setToken(event.target.value);
            setResult(null);
            setError("");
            setNotice("");
            setCopied(false);
          }}
          placeholder="Paste a compact JWT here..."
          spellCheck={false}
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 max-w-xs">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Clock tolerance (seconds)
        </label>
        <input
          type="number"
          min="0"
          max="300"
          step="1"
          value={toleranceInput}
          onChange={(event: { target: { value: string } }) => {
            setToleranceInput(event.target.value);
            setResult(null);
            setError("");
            setNotice("");
            setCopied(false);
          }}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Keep 0 for an exact browser-clock comparison; add only the small leeway your system actually allows.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkTiming} className="yoryantra-btn whitespace-nowrap">
          Check Timing Claims
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="mt-6 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-800">
          {notice}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Timing result</h3>
          {result && (
            <button onClick={copyResult} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy Result"}
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[190px] text-sm break-words">
          {!result ? (
            <p>Decoded timing details will appear here.</p>
          ) : (
            <div className="space-y-5">
              <div
                className={
                  result.timing.caution
                    ? "rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900"
                    : "rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-800"
                }
              >
                <p className="font-semibold">{result.timing.headline}</p>
                <p className="mt-2 text-xs leading-relaxed">
                  Compared at {new Date(result.checkedAt * 1000).toUTCString()} with {result.toleranceSeconds}s tolerance.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {CLAIMS.map((claim) => {
                  const rawValue = result.parsed.payload[claim];
                  const numericValue = typeof rawValue === "number" ? rawValue : undefined;

                  return (
                    <div key={claim} className="self-start rounded-lg border border-gray-200 bg-white p-4">
                      <p className="font-mono text-xs font-semibold uppercase text-gray-500">{claim}</p>
                      <p className="mt-2 break-all font-mono text-gray-900">
                        {rawValue === undefined ? "Not present" : String(rawValue)}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-gray-600">{formatUtc(numericValue)}</p>
                    </div>
                  );
                })}
              </div>

              {result.timing.lines.length > 0 && (
                <ul className="space-y-2 text-gray-700">
                  {result.timing.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}

              {result.timing.observations.length > 0 && (
                <div className="self-start rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
                  <p className="font-semibold">Timing observations</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
                    {result.timing.observations.map((observation) => (
                      <li key={observation}>{observation}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 text-xs text-gray-600">
                Header algorithm: <span className="font-mono">{result.parsed.algorithm}</span>
                {result.parsed.unsecured ? " — unsecured JWS; there is no signature to verify." : " — signature bytes are present but were not verified."}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Decoded time is not token trust</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          A plausible <code>exp</code> value says nothing about who issued the JWT or whether its signature is valid. Production acceptance still needs the expected algorithm and key, issuer, audience, subject or permissions where relevant, plus application-specific revocation and session rules. An unsecured <code>alg=&quot;none&quot;</code> JWT is shown only as data; it is never treated as authenticated.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Local decoding boundary</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Header and payload decoding runs in the browser. No issuer lookup, key download, signature check, or server-side token validation is performed here. Avoid pasting production bearer tokens into pages you do not trust; a bearer token can grant access to whoever obtains it.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What the three time claims actually say</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JWT time claims use <strong>NumericDate</strong>: a JSON number counting seconds from 1970-01-01T00:00:00Z, ignoring leap seconds. Fractional seconds are legal, so the parser keeps them instead of forcing every claim to an integer.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <code>exp</code> is an upper acceptance boundary: processing requires the current time to be before it. <code>nbf</code> is a lower boundary: processing requires the current time to be at or after it. <code>iat</code> records issue time and can help measure age, but it does not create an acceptance boundary on its own.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Those definitions come from <a href="https://www.rfc-editor.org/rfc/rfc7519.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">RFC 7519</a>. The RFC also permits a small implementation-defined leeway for clock skew; the tolerance field above lets you reproduce that policy deliberately instead of silently assuming one.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why an expiry check can disagree with your API</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">Different clocks</h3>
              <p className="mt-2">The comparison uses your device clock. A server with a different clock—or a configured skew allowance—can cross the same boundary at a slightly different moment.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">More claims than time</h3>
              <p className="mt-2">A server may reject a JWT whose time window looks fine because the signature, issuer, audience, scope, nonce, token type, session state, or another rule fails.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Signed, unsecured, and encrypted compact JWTs</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A compact JWS has three sections: protected header, payload, and signature. The signature section is empty only for the explicitly unsecured <code>alg=&quot;none&quot;</code> form. A compact JWE has five sections and encrypts the claims, so its timing values cannot be read until decryption succeeds.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The compact JWS structure and unpadded Base64URL rules are defined by <a href="https://www.rfc-editor.org/rfc/rfc7515.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">RFC 7515</a>. JWT security guidance in <a href="https://www.rfc-editor.org/rfc/rfc8725.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">RFC 8725</a> is the important next read before accepting tokens in production: verification must constrain algorithms and validate every required cryptographic operation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Malformed time data worth catching early</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>A quoted timestamp such as <code>&quot;1735689600&quot;</code> is a string, not a NumericDate number.</li>
            <li><code>exp</code> at or before <code>nbf</code> leaves no normal acceptance interval.</li>
            <li><code>iat</code> later than <code>exp</code> is unusual and often points to an issuer or unit-conversion mistake.</li>
            <li>Milliseconds accidentally stored where seconds are expected produce dates thousands of years away.</li>
            <li>Missing <code>exp</code> is not automatically malformed; whether expiry is mandatory comes from the application or protocol using the JWT.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A safer debugging sequence</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Read the timing claims and confirm that seconds—not milliseconds—were issued.</li>
            <li>Compare with the same tolerance configured by the receiving service.</li>
            <li>Verify the JWS/JWE cryptography with a mature JWT library and an explicit algorithm allow-list.</li>
            <li>Validate issuer, audience, token type, and the claims your application actually relies on.</li>
            <li>Check server-side state such as revocation, session termination, or one-time-token consumption where the design requires it.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/jwt-expiration-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
