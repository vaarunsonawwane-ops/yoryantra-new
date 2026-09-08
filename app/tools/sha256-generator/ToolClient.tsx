"use client";

import { useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Sha256Result = {
  hash: string;
  inputBytes: number;
  codePoints: number;
  utf16Units: number;
  lineEndings: string;
  observations: string[];
};

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hasLoneSurrogate(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);

      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return true;
      }

      index += 1;
      continue;
    }

    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function describeLineEndings(value: string) {
  const hasCrlf = value.includes("\r\n");
  const withoutCrlf = value.replace(/\r\n/g, "");
  const hasLf = withoutCrlf.includes("\n");
  const hasCr = withoutCrlf.includes("\r");

  if (hasCrlf && (hasLf || hasCr)) return "Mixed line endings are present.";
  if (hasCrlf) return "CRLF line endings are present.";
  if (hasLf) return "LF line endings are present.";
  if (hasCr) return "CR line endings are present.";
  return "No line-break characters are present.";
}

function inspectInput(value: string) {
  const observations: string[] = [];

  if (value.length === 0) {
    observations.push("The empty UTF-8 byte sequence is being hashed; SHA-256 has a defined digest for empty input.");
  }

  if (/^\s|\s$/.test(value)) {
    observations.push("Leading or trailing whitespace is part of the input and changes the digest.");
  }

  if (value.includes("\r")) {
    observations.push("Carriage-return characters are present. CRLF and LF versions of visually similar text hash differently.");
  }

  if (value.normalize("NFC") !== value) {
    observations.push("The text is not already NFC-normalized. Visually equivalent Unicode sequences can therefore produce different hashes.");
  }

  if (hasLoneSurrogate(value)) {
    observations.push("An unpaired UTF-16 surrogate is present. TextEncoder converts it to the Unicode replacement character before UTF-8 encoding.");
  }

  return observations;
}

async function hashUtf8(value: string): Promise<Sha256Result> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto digest support is unavailable in this browser context.");
  }

  const data = new TextEncoder().encode(value);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);

  return {
    hash: bufferToHex(hashBuffer),
    inputBytes: data.byteLength,
    codePoints: Array.from(value).length,
    utf16Units: value.length,
    lineEndings: describeLineEndings(value),
    observations: inspectInput(value),
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Sha256Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const hashRequestId = useRef(0);

  const generateSHA256 = async () => {
    const requestId = hashRequestId.current + 1;
    hashRequestId.current = requestId;
    const valueToHash = input;

    try {
      const nextResult = await hashUtf8(valueToHash);

      if (requestId !== hashRequestId.current) return;

      setResult(nextResult);
      setError("");
      setCopied(false);
    } catch (caughtError) {
      if (requestId !== hashRequestId.current) return;

      setError(caughtError instanceof Error ? caughtError.message : "Unable to generate a SHA-256 digest.");
      setResult(null);
      setCopied(false);
    }
  };

  const copyHash = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.hash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the hash and copy it manually.");
    }
  };

  const resetAll = () => {
    hashRequestId.current += 1;
    setInput("");
    setResult(null);
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="SHA256 Generator"
      description="Hash exact UTF-8 text with SHA-256 and see the bytes that determine the digest."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Text to hash</label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            hashRequestId.current += 1;
            setInput(event.target.value);
            setResult(null);
            setError("");
            setCopied(false);
          }}
          placeholder="Enter text, or leave it empty to hash the empty byte sequence..."
          spellCheck={false}
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          UTF-8 encoding is applied exactly as entered; whitespace, line endings, case, and Unicode normalization are not rewritten.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateSHA256} className="yoryantra-btn whitespace-nowrap">
          Generate SHA-256
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
          <h3 className="text-lg font-semibold text-gray-900">SHA-256 digest</h3>
          {result && (
            <button onClick={copyHash} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy Hash"}
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[150px] text-sm break-all whitespace-pre-wrap overflow-auto">
          {result?.hash || "The 64-character hexadecimal digest will appear here."}
        </div>
      </div>

      {result && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Input and digest details</h3>
            <dl className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex flex-wrap justify-between gap-3">
                <dt>Algorithm</dt>
                <dd className="font-mono">SHA-256</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>Digest size</dt>
                <dd>256 bits / 32 bytes</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>Hex characters</dt>
                <dd>{result.hash.length}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>UTF-8 input bytes</dt>
                <dd>{result.inputBytes}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>Unicode code points</dt>
                <dd>{result.codePoints}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>JavaScript UTF-16 units</dt>
                <dd>{result.utf16Units}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">{result.lineEndings}</p>
          </div>

          {result.observations.length > 0 ? (
            <div className="self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="text-sm font-semibold text-yellow-900">Input details worth noticing</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-yellow-800">
                {result.observations.map((observation) => (
                  <li key={observation}>{observation}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">Input representation</h3>
              <p className="mt-2">No leading or trailing whitespace, carriage returns, NFC difference, or unpaired surrogate was detected. The digest still depends on every UTF-8 byte shown by the current text.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">A hash is not authentication or password storage</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          SHA-256 can show that bytes match a known digest, but a digest copied from the same untrusted source cannot prove who supplied those bytes. Keyed integrity needs a construction such as HMAC, and passwords need a deliberately slow password-hashing scheme with salts and appropriate cost settings rather than plain SHA-256.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">What leaves the browser</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          UTF-8 encoding and SHA-256 calculation run through the browser Web Crypto API; the hashing code does not upload the entered text. Sensitive production secrets are still better kept out of webpages, clipboard history, screenshots, and shared debugging sessions whenever possible.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">The digest is over bytes, not what the text looks like</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Text is first encoded as UTF-8 with <code>TextEncoder</code>, then those bytes are passed to SHA-256. The same bytes always produce the same 256-bit digest, normally displayed as 64 lowercase hexadecimal characters.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That byte boundary explains many “wrong hash” reports. <code>Sneha</code> and <code>Sneha </code> differ by one trailing space. Windows CRLF and Unix LF line endings differ. Unicode text can also have visually equivalent composed and decomposed forms with different UTF-8 bytes. No normalization is applied before hashing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A known value for checking another implementation</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">UTF-8 text</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">hello-world</pre>
            <p className="mt-4 font-medium text-gray-900">SHA-256</p>
            <pre className="mt-2 whitespace-pre-wrap break-all">afa27b44d43b02a9fea41d13cedc2e4016cfcf87c5dbf990e593669aa8ce286d</pre>
            <p className="mt-4 font-medium text-gray-900">Empty UTF-8 input</p>
            <pre className="mt-2 whitespace-pre-wrap break-all">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</pre>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            The empty value is intentional: a hash function accepts a zero-byte message, so an empty textarea is a valid input after you press Generate SHA-256.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where SHA-256 fits—and where it does not</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">Checking integrity against a trusted digest</h3>
              <p className="mt-2">If a software publisher gives you a SHA-256 digest through a trusted channel, matching your downloaded bytes against that value can reveal accidental corruption or unexpected modification.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">Creating content fingerprints</h3>
              <p className="mt-2">Stable digests are useful for deduplication, cache keys, test fixtures, and change detection when the exact byte representation is controlled.</p>
            </div>
            <div className="self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-800">
              <h3 className="font-semibold text-yellow-900">Not a secret-key signature</h3>
              <p className="mt-2">Anyone can calculate a plain SHA-256 digest. When the receiver must know that data came from someone holding a shared secret, HMAC-SHA-256 is the relevant construction instead.</p>
            </div>
            <div className="self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-800">
              <h3 className="font-semibold text-yellow-900">Not a password database scheme</h3>
              <p className="mt-2">SHA-256 is intentionally fast. Password storage calls for a password-hashing design such as Argon2id, scrypt, bcrypt, or the platform’s current approved equivalent, with unique salts and tuned work factors.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The standards behind the result</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            SHA-256 is specified by NIST in <a href="https://csrc.nist.gov/pubs/fips/180-4/upd1/final" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">FIPS 180-4, Secure Hash Standard</a>. The browser implementation here calls <a href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">SubtleCrypto.digest()</a> with <code>SHA-256</code> after UTF-8 encoding the text.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Web Crypto&apos;s digest operation is not streaming: the complete encoded input has to be available in memory before hashing. That is fine for normal text input, but a dedicated streaming implementation is a better fit for very large files or continuous data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When two SHA-256 results disagree</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Check the character encoding; this page uses UTF-8.</li>
            <li>Compare trailing spaces, tabs, final newlines, and CRLF versus LF.</li>
            <li>Confirm whether either side normalizes Unicode before hashing.</li>
            <li>Make sure one side is not hashing the hexadecimal display of bytes instead of the bytes themselves.</li>
            <li>For files, compare raw file bytes rather than copying visible file contents into a text field.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/sha256-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
