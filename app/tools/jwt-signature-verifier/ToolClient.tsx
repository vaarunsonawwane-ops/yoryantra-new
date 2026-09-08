"use client";

import { useRef, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JsonObject = Record<string, unknown>;

type VerificationResult = {
  valid: boolean;
  header: JsonObject;
  payload: JsonObject;
  secretBytes: number;
  keyLengthWarning: string;
};

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiJTbmVoYSIsInJvbGUiOiJlZGl0b3IifQ.Xz_v3GTxUOmj6g25na2jtJYy3GBWVf5pCt3nrXFLuZ4";
const SAMPLE_SECRET = "sN3ha-7xL9P2vQ6mR8tU1wY4zA5bC0dE";

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodeCanonicalBase64Url(value: string, label: string) {
  if (!value) {
    throw new Error(`${label} is empty.`);
  }

  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(
      `${label} must use unpadded Base64URL characters only: A-Z, a-z, 0-9, - and _.`
    );
  }

  if (value.length % 4 === 1) {
    throw new Error(`${label} has an impossible Base64URL length.`);
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  let binary: string;

  try {
    binary = atob(padded);
  } catch {
    throw new Error(`${label} is not valid Base64URL data.`);
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  if (encodeBase64Url(bytes) !== value) {
    throw new Error(
      `${label} is not canonical unpadded Base64URL. The encoded characters do not round-trip to the same value.`
    );
  }

  return bytes;
}

function decodeUtf8JsonObject(segment: string, label: string) {
  const bytes = decodeCanonicalBase64Url(segment, label);
  let text: string;

  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} does not decode to valid UTF-8 text.`);
  }

  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(`${label} does not decode to valid JSON.`);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must decode to a JSON object for a compact JWT.`);
  }

  return value as JsonObject;
}

function validateProtectedHeader(header: JsonObject) {
  if (header.alg !== "HS256") {
    const declared =
      typeof header.alg === "string" ? header.alg : "no string alg value";
    throw new Error(
      `Only HS256 is verified here. The protected header declares ${declared}.`
    );
  }

  if (header.b64 === false) {
    throw new Error(
      "JWS with b64=false uses an unencoded payload and a different signing-input rule. That extension is not accepted by this JWT verifier."
    );
  }

  if (header.crit !== undefined) {
    if (
      !Array.isArray(header.crit) ||
      header.crit.some((item) => typeof item !== "string")
    ) {
      throw new Error("The crit protected-header parameter must be an array of strings.");
    }

    if (header.crit.length === 0) {
      throw new Error("The crit protected-header parameter must not be an empty array.");
    }

    throw new Error(
      `Critical JWS extensions are present (${header.crit.join(", ")}). Verification stops because those extensions are not implemented here.`
    );
  }
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

export async function verifyHs256Jwt(
  compactToken: string,
  secret: string
): Promise<VerificationResult> {
  const cleanedToken = compactToken.trim();

  if (!cleanedToken) {
    throw new Error("Paste a compact JWT before verifying it.");
  }

  if (!secret) {
    throw new Error("Enter the expected HS256 shared secret.");
  }

  if (/\s/.test(cleanedToken)) {
    throw new Error("A compact JWT cannot contain spaces or line breaks inside the token.");
  }

  const parts = cleanedToken.split(".");

  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error(
      "Enter a compact signed JWT with three non-empty dot-separated sections: header.payload.signature."
    );
  }

  const header = decodeUtf8JsonObject(parts[0], "JWT header");
  const payload = decodeUtf8JsonObject(parts[1], "JWT payload");
  validateProtectedHeader(header);

  const signature = decodeCanonicalBase64Url(parts[2], "JWT signature");

  if (signature.byteLength !== 32) {
    throw new Error(
      `HS256 produces a 32-byte HMAC-SHA-256 value, but this signature decodes to ${signature.byteLength} bytes.`
    );
  }

  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  const signingInput = encoder.encode(`${parts[0]}.${parts[1]}`);

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    toArrayBuffer(signature),
    toArrayBuffer(signingInput)
  );

  return {
    valid,
    header,
    payload,
    secretBytes: secretBytes.byteLength,
    keyLengthWarning:
      secretBytes.byteLength < 32
        ? `The entered secret is ${secretBytes.byteLength} UTF-8 bytes. RFC 7518 requires an HS256 key at least as large as the 256-bit hash output.`
        : "The entered secret is at least 32 UTF-8 bytes. Length meets the HS256 size floor, but length alone does not prove that the key has strong entropy.",
  };
}

function formatResult(result: VerificationResult) {
  const claimNames = Object.keys(result.payload);

  return [
    result.valid ? "Signature verification passed." : "Signature verification failed.",
    "",
    "Algorithm: HS256",
    `Secret input: ${result.secretBytes} UTF-8 bytes`,
    `Payload claims parsed: ${claimNames.length}`,
    "",
    result.valid
      ? "The HMAC matches the exact encoded header and payload for the secret entered."
      : "The HMAC does not match the exact encoded header and payload for the secret entered.",
    "",
    result.keyLengthWarning,
    "",
    result.valid
      ? "A matching signature does not validate exp, nbf, iss, aud, permissions, revocation, or application policy."
      : "Check the exact secret bytes and token value before assuming the token was signed by a different system.",
  ].join("\n");
}

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shortKeyWarning, setShortKeyWarning] = useState("");
  const verificationVersion = useRef(0);

  const invalidateVerification = () => {
    verificationVersion.current += 1;
  };

  const clearResult = () => {
    setOutput("");
    setError("");
    setCopied(false);
    setShortKeyWarning("");
  };

  const verifyJWT = async () => {
    const version = verificationVersion.current + 1;
    verificationVersion.current = version;

    try {
      const result = await verifyHs256Jwt(token, secret);

      if (verificationVersion.current !== version) return;

      setOutput(formatResult(result));
      setError("");
      setCopied(false);
      setShortKeyWarning(result.secretBytes < 32 ? result.keyLengthWarning : "");
    } catch (caught) {
      if (verificationVersion.current !== version) return;

      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to verify this HS256 JWT signature."
      );
      setOutput("");
      setCopied(false);
      setShortKeyWarning("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The verification report could not be copied. Select the output and copy it manually."
      );
    }
  };

  const loadExample = () => {
    invalidateVerification();
    setToken(SAMPLE_TOKEN);
    setSecret(SAMPLE_SECRET);
    clearResult();
  };

  const resetAll = () => {
    invalidateVerification();
    setToken("");
    setSecret("");
    clearResult();
  };

  return (
    <ToolShell
      title="JWT Signature Verifier"
      description="Verify an HS256 JWT against an exact UTF-8 secret without treating signature validity as claim acceptance."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Compact JWT
        </label>
        <textarea
          value={token}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            invalidateVerification();
            setToken(event.target.value);
            clearResult();
          }}
          placeholder="header.payload.signature"
          spellCheck={false}
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Expected HS256 Secret
        </label>
        <input
          type="password"
          value={secret}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            invalidateVerification();
            setSecret(event.target.value);
            clearResult();
          }}
          placeholder="Enter the exact shared secret"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Interpreted as exact UTF-8 text. Base64 or Base64URL-looking text is not decoded first.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={verifyJWT} className="yoryantra-btn whitespace-nowrap">
          Verify Signature
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {shortKeyWarning && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          <strong className="text-amber-900">The secret is shorter than the HS256 key-size requirement.</strong>
          <p className="mt-2">{shortKeyWarning}</p>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Verification Result</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm whitespace-nowrap">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <div className="yoryantra-output min-h-[180px] whitespace-pre-wrap break-words text-sm">
          {output || "Paste a three-part HS256 JWT and its expected secret to compare the signature."}
        </div>
      </div>

      <div className="mt-8 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">
          A matching signature is not an authorization decision
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Signature verification proves that the encoded header and payload match the supplied key. The application still has to validate time claims, issuer, audience, token type, permissions, revocation and its own acceptance rules.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Verification uses the browser's Web Crypto API. The token and secret are not sent to a verification endpoint by this page.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Matching the MAC is only the first gate
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HS256 is HMAC with SHA-256. The signer and verifier share the same secret, and the MAC covers the exact compact-JWS signing input: the protected header segment, a dot, and the payload segment. Change one encoded character and the expected MAC changes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Before cryptography runs, the token is checked as a JWT rather than arbitrary JWS text: three non-empty compact sections, canonical unpadded Base64URL, strict UTF-8 JSON objects for the protected header and claims set, and an <code>alg</code> value of exactly <code>HS256</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why the exact secret bytes matter
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The secret field is encoded as UTF-8 exactly as entered. If another library first decodes a Base64 or Base64URL key string into bytes, pasting that encoded text here describes a different HMAC key and verification will fail even when the visible characters look familiar.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7518 requires an HS256 key at least 256 bits in size. A 32-byte string reaches that length threshold, but a predictable phrase can still have poor entropy. JWT Best Current Practices specifically warns about weak, human-memorable symmetric keys because a captured token can be used for offline guessing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Critical extensions are stopped rather than guessed
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A JWS <code>crit</code> header says that listed extensions must be understood before the signature can be safely processed. Unknown critical extensions are therefore rejected instead of ignored. The unencoded-payload <code>b64=false</code> extension is also rejected because it changes the JWS signing input and does not fit the normal compact JWT form handled here.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            After a signature matches
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Check time.</strong>
              <p className="mt-2">Evaluate exp and nbf against the application's clock-skew policy. iat can be useful context but is not an expiry rule by itself.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Check who issued it and who it is for.</strong>
              <p className="mt-2">Validate iss and aud against values configured by the relying application, not values learned from the token itself.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Keep token kinds separate.</strong>
              <p className="mt-2">An access token, ID token and session token can carry overlapping claims but have different acceptance rules and should not be interchangeable.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Apply application policy.</strong>
              <p className="mt-2">Roles, scopes, revocation, account state and endpoint authorization remain application decisions after cryptographic verification.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why verification can fail even when the token looks normal
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>The shared secret differs by one character, space, line break or text encoding.</li>
            <li>The application stores key bytes as decoded Base64 while the visible configuration contains the encoded form.</li>
            <li>The protected header names another algorithm or uses a critical extension.</li>
            <li>The compact segments contain padding, malformed Base64URL or non-canonical trailing bits.</li>
            <li>The payload or protected header is not valid UTF-8 JSON for a JWT.</li>
            <li>The signature was computed over a different header or payload than the token now contains.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Standards behind the result
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7519 defines JWT, RFC 7515 defines JWS compact signing input, and RFC 7518 defines HS256 and its key-size requirement. RFC 8725 is the current best-practice reference for avoiding weak symmetric keys and algorithm confusion.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc7519" target="_blank" rel="noreferrer">RFC 7519 — JSON Web Token</a>
            <span className="mx-2 text-gray-300">·</span>
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc7515" target="_blank" rel="noreferrer">RFC 7515 — JSON Web Signature</a>
            <span className="mx-2 text-gray-300">·</span>
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc7518" target="_blank" rel="noreferrer">RFC 7518 — JSON Web Algorithms</a>
            <span className="mx-2 text-gray-300">·</span>
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc8725" target="_blank" rel="noreferrer">RFC 8725 — JWT Best Current Practices</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/jwt-signature-verifier" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
