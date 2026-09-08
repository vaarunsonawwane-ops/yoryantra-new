"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type TokenFormat = {
  id: "base64url" | "alphanumeric" | "hex" | "numeric";
  label: string;
  chars: string;
  note: string;
};

type TokenResult = {
  token: string;
  format: TokenFormat;
  nominalBits: number;
  recommendations: string[];
};

const TOKEN_FORMATS: TokenFormat[] = [
  {
    id: "base64url",
    label: "Base64URL alphabet",
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    note: "64 URL-safe characters; sampled directly rather than Base64URL-encoding a byte array.",
  },
  {
    id: "alphanumeric",
    label: "Alphanumeric",
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    note: "Letters and digits only for systems that reject punctuation.",
  },
  {
    id: "hex",
    label: "Lowercase hexadecimal",
    chars: "0123456789abcdef",
    note: "Four bits of nominal search space per character; choose it when lowercase hex is required.",
  },
  {
    id: "numeric",
    label: "Numeric only",
    chars: "0123456789",
    note: "Smallest alphabet here; sensitive verification flows need stronger lifecycle and rate-limit controls.",
  },
];

function getFormat(formatId: string) {
  return TOKEN_FORMATS.find((format) => format.id === formatId) ?? TOKEN_FORMATS[0];
}

function generateRandomString(length: number, chars: string) {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Cryptographic browser randomness is unavailable in this environment.");
  }

  const result: string[] = [];
  const charsetSize = chars.length;
  const maxValidByte = Math.floor(256 / charsetSize) * charsetSize;
  const buffer = new Uint8Array(Math.max(64, length * 2));

  while (result.length < length) {
    globalThis.crypto.getRandomValues(buffer);

    for (const byte of buffer) {
      if (byte >= maxValidByte) continue;

      result.push(chars[byte % charsetSize]);

      if (result.length === length) break;
    }
  }

  return result.join("");
}

function nominalSearchSpaceBits(length: number, charsetSize: number) {
  return Math.round(length * Math.log2(charsetSize) * 10) / 10;
}

function minimumLengthForBits(bits: number, charsetSize: number) {
  return Math.ceil(bits / Math.log2(charsetSize));
}

function buildRecommendations(length: number, format: TokenFormat) {
  const nominalBits = nominalSearchSpaceBits(length, format.chars.length);
  const recommendations: string[] = [];
  const baselineLength = minimumLengthForBits(128, format.chars.length);

  if (nominalBits < 128) {
    recommendations.push(
      `The nominal search space is below 128 bits. ${format.label} needs at least ${baselineLength} characters to cross that mathematical threshold.`
    );
  }

  if (format.id === "numeric") {
    recommendations.push(
      "Digits alone have a much smaller guessing space at short lengths. Add short expiry, strict attempt limits, and single-use handling when the value is a verification code."
    );
  }

  if (length > 128) {
    recommendations.push(
      "Very long tokens can run into database, header, form, or vendor length limits. Confirm the receiving system before standardizing on this size."
    );
  }

  return { nominalBits, recommendations };
}

export default function ToolClient() {
  const [lengthInput, setLengthInput] = useState("32");
  const [formatId, setFormatId] = useState<TokenFormat["id"]>("base64url");
  const [result, setResult] = useState<TokenResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedFormat = getFormat(formatId);
  const selectedBaselineLength = minimumLengthForBits(128, selectedFormat.chars.length);

  const generateToken = () => {
    const parsedLength = Number(lengthInput);

    if (!Number.isInteger(parsedLength) || parsedLength < 8 || parsedLength > 512) {
      setError("Token length must be a whole number from 8 to 512 characters.");
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const format = getFormat(formatId);
      const token = generateRandomString(parsedLength, format.chars);
      const { nominalBits, recommendations } = buildRecommendations(parsedLength, format);

      setResult({ token, format, nominalBits, recommendations });
      setError("");
      setCopied(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to generate a random token.");
      setResult(null);
      setCopied(false);
    }
  };

  const copyToken = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.token);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the generated token and copy it manually.");
    }
  };

  const resetAll = () => {
    setLengthInput("32");
    setFormatId("base64url");
    setResult(null);
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Random Token Generator"
      description="Create cryptographically random token strings with unbiased character selection and visible search-space estimates."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="self-start">
          <label className="block mb-2 text-sm font-medium text-gray-700">Token Length</label>
          <input
            type="number"
            min="8"
            max="512"
            step="1"
            value={lengthInput}
            onChange={(event: { target: { value: string } }) => {
              setLengthInput(event.target.value);
              setResult(null);
              setError("");
              setCopied(false);
            }}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Range: 8–512 characters. With {selectedFormat.label.toLowerCase()}, {selectedBaselineLength} characters crosses a nominal 128-bit search space.
          </p>
        </div>

        <div className="self-start">
          <label className="block mb-2 text-sm font-medium text-gray-700">Character Set</label>
          <select
            value={formatId}
            onChange={(event: { target: { value: string } }) => {
              setFormatId(event.target.value as TokenFormat["id"]);
              setResult(null);
              setError("");
              setCopied(false);
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          >
            {TOKEN_FORMATS.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">{selectedFormat.note}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateToken} className="yoryantra-btn whitespace-nowrap">
          Generate Token
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

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Generated token</h3>
          {result && (
            <button onClick={copyToken} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy Token"}
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[150px] text-sm break-all whitespace-pre-wrap overflow-auto">
          {result?.token || "A newly generated token will appear here."}
        </div>
      </div>

      {result && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Generation details</h3>
            <dl className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex flex-wrap justify-between gap-3">
                <dt>Character set</dt>
                <dd className="text-right">{result.format.label}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>Length</dt>
                <dd>{result.token.length} characters</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>Alphabet size</dt>
                <dd>{result.format.chars.length}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>Nominal search space</dt>
                <dd>≈ {result.nominalBits} bits</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              The bit figure describes the mathematical search space if characters are independently uniform; it is not a measurement of entropy collected from your device.
            </p>
          </div>

          <div className="self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="text-sm font-semibold text-yellow-900">Before treating it as a secret</h3>
            {result.recommendations.length > 0 ? (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-yellow-800">
                {result.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-yellow-800">
                The nominal search space is at least 128 bits. Storage, expiry, rotation, permissions, logging, and revocation still determine whether a real token is handled safely.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Browser-local generation</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Random bytes come from <code>crypto.getRandomValues()</code> and token construction runs in the browser. The generator code does not send generated values to a server. A copied secret can still enter clipboard history, logs, screenshots, shell history, or another application, so production handling matters after generation.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Where the randomness comes from</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Browser <code>crypto.getRandomValues()</code> supplies cryptographically strong random values rather than the predictable pseudo-random output intended for simulations and UI effects. MDN documents the browser API and its security properties in the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">Crypto.getRandomValues reference</a>.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Mapping a random byte with a simple remainder operation can favor some characters whenever the alphabet size does not divide 256 evenly. Rejection sampling avoids that bias: bytes above the largest evenly divisible range are discarded and replaced before character selection.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Base64URL alphabet is not the same as Base64URL encoding</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The Base64URL option samples directly from the 64-character alphabet <code>A–Z a–z 0–9 - _</code>. It therefore produces URL-safe token text, but it is not claiming that the result is the canonical Base64URL encoding of a particular underlying byte sequence.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The URL- and filename-safe alphabet itself is standardized in <a href="https://www.rfc-editor.org/rfc/rfc4648.html#section-5" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">RFC 4648 section 5</a>. That distinction matters when another protocol expects encoded binary bytes rather than merely a random string drawn from the same characters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Choose length from the alphabet, not from habit</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[620px] text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Alphabet</th>
                  <th className="px-4 py-3 font-semibold">Possible characters</th>
                  <th className="px-4 py-3 font-semibold">Characters for ≥128 nominal bits</th>
                </tr>
              </thead>
              <tbody>
                {TOKEN_FORMATS.map((format) => (
                  <tr key={format.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">{format.label}</td>
                    <td className="px-4 py-3">{format.chars.length}</td>
                    <td className="px-4 py-3">{minimumLengthForBits(128, format.chars.length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            “128 bits” here is a search-space reference, not a universal token requirement. Short-lived numeric verification codes often use smaller spaces and rely heavily on expiry plus server-side attempt limits; long-lived bearer secrets generally deserve a much larger guessing margin.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A random string becomes a credential only after your system gives it meaning</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">API or webhook secret</h3>
              <p className="mt-2">Associate the value with the intended account or integration, restrict permissions, keep it out of logs, rotate it, and provide a revocation path. A random string by itself has no identity or authorization semantics.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">Reset or verification value</h3>
              <p className="mt-2">Set a short lifetime, make successful use consume the value, limit repeated guesses, and avoid exposing it through analytics, referrers, logs, or URLs longer than necessary.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">Session identifier</h3>
              <p className="mt-2">Randomness is only the identifier layer. Browser sessions also need appropriate cookie transport and script-access controls, renewal rules, server-side invalidation, and protection against session fixation.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">Stored bearer token</h3>
              <p className="mt-2">Consider whether the server needs the raw token after issuance. For many lookup-style bearer tokens, storing a one-way verifier rather than the raw secret can reduce damage if the credential database leaks.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Failures that still happen with strong random text</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Putting production secrets in source control, client-side bundles, support tickets, screenshots, or application logs.</li>
            <li>Giving a long-lived token broad permissions when a narrower scope or shorter lifetime would do.</li>
            <li>Generating a good token but comparing it insecurely, leaking it in URLs, or never providing a revocation path.</li>
            <li>Assuming a “unique-looking” value is automatically an API key, session, CSRF token, or password-reset design.</li>
            <li>Using numeric-only values without compensating for their much smaller guessing space.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/random-token-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
