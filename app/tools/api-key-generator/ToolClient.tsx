"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const MIN_LENGTH = 16;
const DEFAULT_LENGTH = 32;
const MAX_LENGTH = 128;
const BITS_PER_CHARACTER = 6;
const MIN_128_BIT_LENGTH = Math.ceil(128 / BITS_PER_CHARACTER);

function generateRandomString(length: number): string {
  const random: Uint8Array = new Uint8Array(length);
  window.crypto.getRandomValues(random);

  // 256 is exactly divisible by 64, so masking the low six bits does not
  // introduce modulo bias for this alphabet.
  return Array.from(random, (value) => ALPHABET[value & 63]).join("");
}

export default function ToolClient() {
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateKey = () => {
    if (!Number.isInteger(length)) {
      setError("Key length must be a whole number.");
      setOutput("");
      return;
    }

    if (length < MIN_LENGTH || length > MAX_LENGTH) {
      setError(
        `Choose a key length from ${MIN_LENGTH} to ${MAX_LENGTH} characters.`
      );
      setOutput("");
      return;
    }

    try {
      setOutput(generateRandomString(length));
      setError("");
      setCopied(false);
    } catch {
      setError("Your browser could not generate cryptographically strong random values.");
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the generated value and copy it manually.");
    }
  };

  const resetAll = () => {
    setLength(DEFAULT_LENGTH);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const nominalBits = length * BITS_PER_CHARACTER;
  const below128Bits = length < MIN_128_BIT_LENGTH;

  return (
    <ToolShell
      title="API Key Generator"
      description="Create random Base64URL-alphabet secret material and see how length changes the search space."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Secret Length
        </label>

        <input
          type="number"
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          step="1"
          value={length}
          onChange={(event: { target: { value: string } }) =>
            setLength(Number(event.target.value))
          }
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          The 64-character alphabet contributes a nominal 6 bits per character,
          so {length} characters represent a {nominalBits}-bit search space under
          the uniform-random model.
        </p>
      </div>

      {below128Bits && (
        <div className="mt-5 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Length caution:</strong> {length} characters provide less than
          a 128-bit nominal search space. Choose at least {MIN_128_BIT_LENGTH}
          characters when you want 128 bits or more from this alphabet.
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateKey}
          className="yoryantra-btn min-h-11 whitespace-nowrap"
        >
          Generate Secret
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-11 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Random Secret
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[150px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {output || "Generated secret material will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Browser-local generation
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Random bytes come from <code>crypto.getRandomValues()</code> in your
          browser and are mapped to a 64-character URL-safe alphabet. The value
          is not sent to Yoryantra. Copying it does place the secret on your
          system clipboard, where other local software may be able to read it.
        </p>
      </div>

      <div className="mt-5 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">
          A random string is not an API-key system
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-900">
          A production design still needs identity, scoped permissions, secure
          storage, rotation, revocation, rate limits, monitoring, and logging
          rules that do not expose the full credential.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What the generated value actually is
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Each character is selected independently from uppercase letters,
            lowercase letters, digits, hyphen, and underscore. Those 64 symbols
            are the Base64URL alphabet, but the result is <strong>not</strong> an
            encoded copy of some hidden byte string; it is random secret
            material generated directly from that alphabet.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The choice is deliberate: a URL-safe alphabet avoids spaces,
            slashes, plus signs, and padding characters, which makes the secret
            easier to carry in headers, environment variables, configuration,
            and URLs when a protocol genuinely allows credentials there.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading the search-space number
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            With 64 equally likely characters, every position contributes six
            bits to the nominal search space. A 16-character value therefore
            has 96 bits, 22 characters have 132 bits, and the 32-character
            default has 192 bits. This is a mathematical property of the
            alphabet and length; it is not a claim that every browser exposes a
            separately measurable entropy value of exactly that many bits.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Storage changes the threat model
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Server-side record</h3>
              <p className="mt-2 leading-relaxed">
                Many systems keep a public identifier or prefix separately from
                the secret portion. That lets the server locate the right record
                without logging or indexing the entire credential.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Secret storage</h3>
              <p className="mt-2 leading-relaxed">
                Whether the server stores a one-way digest, an encrypted value,
                or a reference depends on how the key must later be used. A key
                that only needs equality verification can often be stored
                differently from a key that must be forwarded to another system.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Small implementation details that matter
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Do not place long-lived API keys in source control or client-side bundles.</li>
            <li>Prefer authorization headers over query-string keys when the protocol allows it; URLs are more likely to appear in logs, history, and diagnostics.</li>
            <li>Prefer short-lived, scoped credentials when the receiving system supports them.</li>
            <li>Show the full secret only at creation time when possible.</li>
            <li>Log a key identifier or prefix instead of the complete credential.</li>
            <li>Rotate and revoke keys independently of user passwords.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Browser randomness reference
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The browser API used here is documented by MDN as providing
            cryptographically strong random values. The Web Cryptography
            specification does not promise a fixed minimum entropy figure for
            every user agent, so the page reports the mathematical search space
            instead of pretending to measure the browser&apos;s entropy source.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            References:{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              Crypto.getRandomValues()
            </a>
            {" · "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc4648.html#section-5"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              RFC 4648 Base64URL alphabet
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/api-key-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
