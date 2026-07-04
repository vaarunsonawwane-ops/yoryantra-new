"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type TokenFormat = {
  id: string;
  label: string;
  chars: string;
  note: string;
};

const TOKEN_FORMATS: TokenFormat[] = [
  {
    id: "base64url",
    label: "Base64URL safe",
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    note: "Good default for API tokens, URLs, headers, and webhook secrets.",
  },
  {
    id: "alphanumeric",
    label: "Alphanumeric",
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    note: "Readable tokens using letters and numbers only.",
  },
  {
    id: "hex",
    label: "Hexadecimal",
    chars: "0123456789abcdef",
    note: "Useful when a system expects lowercase hex characters.",
  },
  {
    id: "numeric",
    label: "Numeric only",
    chars: "0123456789",
    note: "Use only when a system specifically requires digits. Longer length is important.",
  },
];

function clampLength(value: number) {
  if (!Number.isFinite(value)) return 32;
  return Math.min(Math.max(Math.floor(value), 8), 512);
}

function getFormat(formatId: string) {
  return TOKEN_FORMATS.find((format) => format.id === formatId) || TOKEN_FORMATS[0];
}

function generateRandomString(length: number, chars: string) {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure browser randomness is not available in this environment.");
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

function estimateEntropyBits(length: number, charsetSize: number) {
  return Math.round(length * Math.log2(charsetSize) * 10) / 10;
}

function buildTokenReport(token: string, format: TokenFormat) {
  const entropyBits = estimateEntropyBits(token.length, format.chars.length);
  const warnings: string[] = [];

  if (entropyBits < 128) {
    warnings.push(
      "Estimated entropy is below 128 bits. Use a longer token for long-lived secrets or high-value systems."
    );
  }

  if (format.id === "numeric") {
    warnings.push(
      "Numeric-only tokens have a smaller character set. Use longer lengths and rate limiting if they are used in verification flows."
    );
  }

  if (token.length < 32 && format.id !== "hex") {
    warnings.push(
      "Consider 32 characters or more for API tokens and webhook secrets."
    );
  }

  return [
    "Random Token Report",
    "===================",
    `Format: ${format.label}`,
    `Length: ${token.length} characters`,
    `Character set size: ${format.chars.length}`,
    `Estimated entropy: about ${entropyBits} bits`,
    `Format note: ${format.note}`,
    "",
    "Warnings",
    "--------",
    warnings.length > 0 ? warnings.map((item) => `- ${item}`).join("\n") : "No warnings.",
    "",
    "Important Limit",
    "---------------",
    "This tool generates random text only. It does not register the token in your application, store it, rotate it, hash it, or check whether it has been leaked.",
  ].join("\n");
}

export default function ToolClient() {
  const [length, setLength] = useState(32);
  const [formatId, setFormatId] = useState("base64url");
  const [output, setOutput] = useState("");
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const generateToken = () => {
    try {
      const safeLength = clampLength(length);
      const format = getFormat(formatId);
      const token = generateRandomString(safeLength, format.chars);

      setLength(safeLength);
      setOutput(token);
      setReport(buildTokenReport(token, format));
      setError("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate a random token."
      );
      setOutput("");
      setReport("");
    }
  };

  const resetAll = () => {
    setLength(32);
    setFormatId("base64url");
    setOutput("");
    setReport("");
    setError("");
  };

  const selectedFormat = getFormat(formatId);

  return (
    <ToolShell
      title="Random Token Generator"
      description="Generate browser-based random tokens for API keys, webhook secrets, session IDs, and testing with Base64URL, alphanumeric, or hex output."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Token Length
          </label>

          <input
            type="number"
            min="8"
            max="512"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
          <p className="mt-2 text-xs text-gray-500">
            Allowed range: 8 to 512 characters. Longer tokens give more search space.
          </p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Token Format
          </label>

          <select
            value={formatId}
            onChange={(e) => setFormatId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition bg-white"
          >
            {TOKEN_FORMATS.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">{selectedFormat.note}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateToken} className="yoryantra-btn">
          Generate Token
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
            Generated Random Token
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy Token
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[160px] flex items-center text-sm break-words whitespace-pre-wrap overflow-auto">
          {output || "Generated random token will appear here..."}
        </div>
      </div>

      {report && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
          {report}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Security Note
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Token generation happens locally in your browser using Web Crypto
          randomness. Generated tokens are not uploaded or stored by this tool.
          Copy and store real production secrets only in your own trusted secret
          manager or application environment.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Random Tokens for APIs, Webhooks, and Testing
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Random tokens are used as API keys, webhook secrets, session IDs,
            password reset values, verification strings, invitation codes,
            temporary credentials, and test identifiers. Good tokens should be
            hard to guess, long enough for the risk level, and stored carefully
            after they are created.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This generator uses browser cryptographic randomness and avoids
            modulo bias by rejecting random bytes that would not map evenly into
            the selected character set. You can generate Base64URL-safe tokens,
            alphanumeric tokens, hexadecimal tokens, or numeric-only values when
            a system requires digits.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool only creates the token string. Your application still needs
            the right storage, hashing, rotation, expiration, rate limiting, and
            access-control rules around any token that becomes a real secret.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Random Token Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose a token length.</li>
            <li>Select Base64URL, alphanumeric, hex, or numeric output.</li>
            <li>Click <strong>Generate Token</strong>.</li>
            <li>Review the estimated entropy and any warnings.</li>
            <li>Copy the token into your application or secret storage workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating development API keys and test bearer tokens.</li>
            <li>Generating webhook signing or verification secrets.</li>
            <li>Creating random session identifiers for local experiments.</li>
            <li>Preparing invitation, reset, or one-time workflow values.</li>
            <li>Generating unique strings for integration tests and fixtures.</li>
            <li>Creating URL-safe secrets for headers, links, and config files.</li>
            <li>Replacing weak placeholder values during development.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Random Tokens
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Base64URL-style token:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
{`qM7kLp2xW9vBa8NdR4sHt1YuE6zFc0Jp`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">Example API header:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Authorization: Bearer your_random_token_here`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Choosing a Token Format
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Base64URL:</strong> A good default for API tokens,
                headers, URLs, and config values because it avoids plus, slash,
                and padding characters.
              </li>
              <li>
                <strong>Alphanumeric:</strong> Useful when you want tokens that
                are easier to paste into systems that reject punctuation.
              </li>
              <li>
                <strong>Hex:</strong> Useful when a library or database expects
                lowercase hexadecimal strings.
              </li>
              <li>
                <strong>Numeric:</strong> Use only when required. Numeric codes
                need extra controls such as short expiry, rate limiting, and
                replay protection.
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
              <h3 className="font-semibold text-gray-900">Is this using Math.random?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The generator uses the browser Web Crypto API through
                crypto.getRandomValues, which is designed for cryptographic
                random values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which token length should I choose?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                For long-lived API tokens and webhook secrets, use at least 128
                bits of estimated entropy. The report shows an estimate based on
                the selected length and character set.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use these tokens directly in production?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                The generated string can be used as a secret, but production use
                also needs safe storage, rotation, logging controls, expiry, and
                access checks in your own system.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are generated tokens uploaded anywhere?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Token generation happens locally in your browser.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does numeric-only output show stronger warnings?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Numeric tokens have fewer possible characters per position.
                They need longer lengths or extra application protections to be
                suitable for sensitive workflows.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/random-token-generator" />
        </div>
      </section>
    </ToolShell>
  );
}
