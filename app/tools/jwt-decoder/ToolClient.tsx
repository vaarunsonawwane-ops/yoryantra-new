"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JsonObject = Record<string, unknown>;
type TokenKind = "JWS" | "JWE";

type ClaimRow = {
  name: string;
  value: string;
  note?: string;
};

type DecodeResult = {
  kind: TokenKind;
  header: JsonObject;
  payload: JsonObject | null;
  headerText: string;
  payloadText: string;
  claimRows: ClaimRow[];
  cautions: string[];
  signatureChars?: number;
};

const MAX_TOKEN_CHARS = 100_000;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64UrlBytes(value: string, label: string): Uint8Array {
  if (!value.length) return new Uint8Array();
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`${label} contains characters outside the unpadded Base64URL alphabet.`);
  }
  if (value.length % 4 === 1) {
    throw new Error(`${label} has an impossible Base64URL length.`);
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  let binary = "";
  try {
    binary = atob(padded);
  } catch {
    throw new Error(`${label} is not valid Base64URL data.`);
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytesToBase64Url(bytes) !== value) {
    throw new Error(`${label} is not canonical Base64URL data; unused pad bits are not zero.`);
  }
  return bytes;
}

function decodeJsonObject(value: string, label: string): JsonObject {
  const bytes = decodeBase64UrlBytes(value, label);
  let text = "";
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8 JSON.`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`${label} does not contain valid JSON.`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must decode to a JSON object for a JWT.`);
  }
  return parsed as JsonObject;
}

function formatNumericDate(value: unknown): { value: string; valid: boolean; seconds?: number } {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { value: JSON.stringify(value), valid: false };
  }
  const milliseconds = value * 1000;
  const date = new Date(milliseconds);
  if (!Number.isFinite(date.getTime())) {
    return { value: String(value), valid: false };
  }
  return { value: `${value} (${date.toISOString()})`, valid: true, seconds: value };
}

function claimValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function analyzeClaims(payload: JsonObject, nowSeconds: number): { rows: ClaimRow[]; cautions: string[] } {
  const rows: ClaimRow[] = [];
  const cautions: string[] = [];

  const plainClaims: Array<[string, string]> = [
    ["iss", "Issuer"],
    ["sub", "Subject"],
    ["aud", "Audience"],
    ["jti", "JWT ID"],
  ];

  for (const [key, label] of plainClaims) {
    if (!(key in payload)) continue;
    const value = payload[key];
    let note: string | undefined;

    if (key === "aud") {
      const validAudience =
        typeof value === "string" ||
        (Array.isArray(value) && value.every((item) => typeof item === "string"));
      if (!validAudience) {
        note = "JWT audience should be a string or an array of strings.";
        cautions.push("aud is present but is not a string or an array of strings.");
      }
    } else if (typeof value !== "string") {
      note = `JWT ${key} is defined as a string value.`;
      cautions.push(`${key} is present but is not a string.`);
    }

    rows.push({ name: label, value: claimValue(value), note });
  }

  const timeClaims: Array<["exp" | "nbf" | "iat", string]> = [
    ["exp", "Expires"],
    ["nbf", "Not before"],
    ["iat", "Issued at"],
  ];

  for (const [key, label] of timeClaims) {
    if (!(key in payload)) continue;
    const parsed = formatNumericDate(payload[key]);
    let note: string | undefined;

    if (!parsed.valid) {
      note = "Expected a NumericDate number of seconds since the Unix epoch.";
      cautions.push(`${key} is present but is not a valid NumericDate number.`);
    } else if (key === "exp" && parsed.seconds !== undefined && parsed.seconds <= nowSeconds) {
      note = "This timestamp is in the past according to this device clock.";
      cautions.push("The decoded exp timestamp is in the past. Signature and application validation are still required.");
    } else if (key === "nbf" && parsed.seconds !== undefined && parsed.seconds > nowSeconds) {
      note = "This timestamp is still in the future according to this device clock.";
      cautions.push("The decoded nbf timestamp is in the future. Signature and application validation are still required.");
    } else if (key === "iat" && parsed.seconds !== undefined && parsed.seconds > nowSeconds + 300) {
      note = "This timestamp is more than five minutes ahead of this device clock.";
      cautions.push("The decoded iat timestamp is noticeably ahead of this device clock.");
    }

    rows.push({ name: label, value: parsed.value, note });
  }

  return { rows, cautions };
}

function decodeToken(token: string): DecodeResult {
  const cleaned = token.trim();
  if (!cleaned) throw new Error("Paste a compact JWT before decoding.");
  if (cleaned.length > MAX_TOKEN_CHARS) {
    throw new Error(`The token is too large for this browser inspector (${MAX_TOKEN_CHARS.toLocaleString()} character limit).`);
  }
  if (/\s/.test(cleaned)) {
    throw new Error("Compact JWT serialization must not contain whitespace inside the token.");
  }

  const parts = cleaned.split(".");
  const nowSeconds = Date.now() / 1000;

  if (parts.length === 3) {
    if (!parts[0] || !parts[1]) {
      throw new Error("A compact JWS JWT needs non-empty header and payload sections.");
    }

    const header = decodeJsonObject(parts[0], "JWT header");
    const payload = decodeJsonObject(parts[1], "JWT payload");
    const cautions: string[] = [];

    if (typeof header.alg !== "string" || !header.alg) {
      cautions.push("The protected header does not contain a usable alg value.");
    } else if (header.alg === "none") {
      cautions.push("The header declares alg=none, so this token has no cryptographic integrity protection.");
    }

    if (!parts[2] && header.alg !== "none") {
      cautions.push("The signature section is empty even though the header does not declare alg=none.");
    }
    if (parts[2]) {
      decodeBase64UrlBytes(parts[2], "JWS signature");
    }

    const claimAnalysis = analyzeClaims(payload, nowSeconds);
    cautions.push(...claimAnalysis.cautions);
    cautions.push("Decoded content is not trusted until the signature, algorithm, issuer, audience, and application-required claims are validated.");

    return {
      kind: "JWS",
      header,
      payload,
      headerText: JSON.stringify(header, null, 2),
      payloadText: JSON.stringify(payload, null, 2),
      claimRows: claimAnalysis.rows,
      cautions,
      signatureChars: parts[2].length,
    };
  }

  if (parts.length === 5) {
    if (!parts[0]) {
      throw new Error("A compact JWE needs a protected-header section.");
    }
    const header = decodeJsonObject(parts[0], "JWE protected header");
    const cautions = [
      "This is a five-part JWE compact serialization. Its claims are encrypted, so a decoder without the decryption key cannot show the payload.",
      "Reading the protected header does not authenticate the sender or prove that the encrypted token is acceptable to your application.",
    ];
    if (typeof header.alg !== "string" || !header.alg) {
      cautions.push("The JWE protected header does not contain a usable alg value.");
    }
    if (typeof header.enc !== "string" || !header.enc) {
      cautions.push("The JWE protected header does not contain a usable enc value.");
    }

    for (let index = 1; index < parts.length; index += 1) {
      if (parts[index]) decodeBase64UrlBytes(parts[index], `JWE section ${index + 1}`);
    }

    return {
      kind: "JWE",
      header,
      payload: null,
      headerText: JSON.stringify(header, null, 2),
      payloadText: "Encrypted JWT payload — a decryption key and the declared JWE algorithms are required before claims can be read.",
      claimRows: [],
      cautions,
    };
  }

  throw new Error("Expected a three-part JWS JWT or a five-part JWE compact JWT.");
}

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"header" | "payload" | "">("");

  const decodeJWT = () => {
    try {
      setResult(decodeToken(token));
      setError("");
      setCopied("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to decode this JWT.");
      setResult(null);
      setCopied("");
    }
  };

  const copyOutput = async (kind: "header" | "payload") => {
    if (!result) return;
    const text = kind === "header" ? result.headerText : result.payloadText;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setError("The decoded text could not be copied. Select and copy it manually.");
    }
  };

  const resetAll = () => {
    setToken("");
    setResult(null);
    setError("");
    setCopied("");
  };

  return (
    <ToolShell
      title="JWT Decoder"
      description="Read JWT headers, claims, timestamps, and encrypted-token structure without performing signature verification."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">JWT Token</label>
        <textarea
          className="h-64 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder="Paste a compact JWS or JWE JWT here..."
          value={token}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setToken(event.target.value);
            setResult(null);
            setError("");
            setCopied("");
          }}
          spellCheck={false}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={decodeJWT} className="yoryantra-btn min-h-11 whitespace-nowrap">Decode JWT</button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Serialization</div>
            <div className="mt-1 font-semibold text-gray-900">{result.kind === "JWS" ? "3-part JWS" : "5-part JWE"}</div>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">alg</div>
            <div className="mt-1 break-all font-mono text-sm text-gray-900">{typeof result.header.alg === "string" ? result.header.alg : "not declared"}</div>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{result.kind === "JWE" ? "enc" : "Signature"}</div>
            <div className="mt-1 break-all font-mono text-sm text-gray-900">
              {result.kind === "JWE"
                ? (typeof result.header.enc === "string" ? result.header.enc : "not declared")
                : `${result.signatureChars ?? 0} encoded characters`}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Decoded Header</h3>
            {result && (
              <button onClick={() => copyOutput("header")} className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm">
                {copied === "header" ? "Copied" : "Copy Header"}
              </button>
            )}
          </div>
          <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
            {result?.headerText || "Decoded protected header will appear here..."}
          </pre>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{result?.kind === "JWE" ? "Payload Status" : "Decoded Claims"}</h3>
            {result && (
              <button onClick={() => copyOutput("payload")} className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm">
                {copied === "payload" ? "Copied" : "Copy Output"}
              </button>
            )}
          </div>
          <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
            {result?.payloadText || "Decoded JWT claims will appear here..."}
          </pre>
        </div>
      </div>

      {result?.claimRows.length ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Registered claims found in the payload</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-gray-200 text-gray-500">
                <tr><th className="pb-2 pr-4 font-medium">Claim</th><th className="pb-2 pr-4 font-medium">Decoded value</th><th className="pb-2 font-medium">Local interpretation</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {result.claimRows.map((row) => (
                  <tr key={row.name}>
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{row.value}</td>
                    <td className="py-3">{row.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {result?.cautions.length ? (
        <div className="mt-6 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold text-yellow-900">What decoding cannot establish</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-yellow-800">
            {result.cautions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Sensitive-token handling</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Parsing runs in your browser; no server request is needed to decode the compact token. JWTs can still contain names,
          identifiers, roles, internal URLs, or session data. Avoid exposing production bearer tokens to screenshots, logs,
          clipboard history, browser extensions, or people who do not need them.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A readable JWT is not automatically a valid JWT</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compact JWTs are commonly protected as a JWS with three dot-separated sections. The header and claims are Base64URL-encoded,
            which makes them transport-friendly and readable after decoding; Base64URL is not encryption. A five-part compact JWE is different:
            its protected header is readable, while the claims remain encrypted until the recipient decrypts the token.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Neither case becomes trustworthy simply because the JSON parses. A receiving application has to apply the security rules for its own
            issuer, expected audience, algorithms, keys, time claims, and any application-specific requirements.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Time claims are timestamps, not verdicts</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>exp</code>, <code>nbf</code>, and <code>iat</code> use JWT NumericDate values: seconds from the Unix epoch. The table above converts valid numbers
            using this device clock so you can spot an obviously expired or not-yet-valid timestamp. That local observation does not replace verifier
            clock-skew policy, signature validation, or the application's decision about whether a claim is required.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Issuer and audience matter as much as the signature</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A cryptographically valid signature only proves something useful after the verifier knows which key and algorithm were expected. JWT validation
            also commonly checks <code>iss</code> and <code>aud</code>. RFC 7519 requires a processor to reject a token when an audience claim is present but the processor
            is not one of its intended recipients.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards behind the compact format</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <a href="https://www.rfc-editor.org/rfc/rfc7519" target="_blank" rel="noreferrer" className="underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500">RFC 7519</a>
            {" "}defines JWT claims and validation requirements. Signed/MAC-protected compact tokens use the JWS rules in{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc7515" target="_blank" rel="noreferrer" className="underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500">RFC 7515</a>.
            An unsecured JWS can legitimately use <code>alg: &quot;none&quot;</code>, which is why this page can decode it while prominently treating it as unprotected.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/jwt-decoder" /></div>
        </div>
      </section>
    </ToolShell>
  );
}
