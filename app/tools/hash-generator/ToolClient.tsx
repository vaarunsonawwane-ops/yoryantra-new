"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

type HashResult = {
  hash: string;
  algorithm: HashAlgorithm;
  bits: number;
  inputBytes: number;
  unicodeCodePoints: number;
  hasCrLf: boolean;
  differsFromNfc: boolean;
};

const ALGORITHM_BITS: Record<HashAlgorithm, number> = {
  "SHA-1": 160,
  "SHA-256": 256,
  "SHA-384": 384,
  "SHA-512": 512,
};

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function countCodePoints(value: string): number {
  return Array.from(value).length;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [result, setResult] = useState<HashResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateHash = async () => {
    if (!input.length) {
      setError("Enter text before generating a digest.");
      setResult(null);
      return;
    }

    try {
      const data = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);

      setResult({
        hash: bufferToHex(hashBuffer),
        algorithm,
        bits: ALGORITHM_BITS[algorithm],
        inputBytes: data.byteLength,
        unicodeCodePoints: countCodePoints(input),
        hasCrLf: input.includes("\r\n"),
        differsFromNfc: input !== input.normalize("NFC"),
      });
      setError("");
      setCopied(false);
    } catch {
      setError("The browser could not generate a digest with the selected algorithm.");
      setResult(null);
    }
  };

  const copyHash = async () => {
    if (!result?.hash) return;

    try {
      await navigator.clipboard.writeText(result.hash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The digest could not be copied. Select and copy it manually.");
    }
  };

  const resetAll = () => {
    setInput("");
    setAlgorithm("SHA-256");
    setResult(null);
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Hash Generator"
      description="Create SHA-1 or SHA-2 digests from exact UTF-8 text and compare hexadecimal output."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Text Input
        </label>
        <textarea
          className="h-56 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder="Enter the exact text you want to hash..."
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setInput(event.target.value);
            setResult(null);
            setError("");
            setCopied(false);
          }}
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Text is encoded as UTF-8 exactly as entered. Whitespace, line endings,
          case, and Unicode normalization are not changed first.
        </p>
      </div>

      <div className="mt-6">
        <YoryantraSelect
          label="Hash Algorithm"
          value={algorithm}
          onChange={(value) => {
            setAlgorithm(value as HashAlgorithm);
            setResult(null);
            setError("");
            setCopied(false);
          }}
          options={[
            { label: "SHA-1 (legacy comparison only)", value: "SHA-1" },
            { label: "SHA-256", value: "SHA-256" },
            { label: "SHA-384", value: "SHA-384" },
            { label: "SHA-512", value: "SHA-512" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateHash}
          className="yoryantra-btn min-h-11 whitespace-nowrap"
        >
          Generate Hash
        </button>
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-11 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Generated Digest</h3>
          {result?.hash && (
            <button
              onClick={copyHash}
              className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <div className="yoryantra-output min-h-[150px] overflow-auto break-all whitespace-pre-wrap text-sm">
          {result?.hash || "The hexadecimal digest will appear here..."}
        </div>
      </div>

      {result && (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">What was hashed</h3>
            <dl className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between gap-4">
                <dt>Algorithm</dt>
                <dd className="font-mono">{result.algorithm}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Digest size</dt>
                <dd>{result.bits} bits</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>UTF-8 input</dt>
                <dd>{result.inputBytes} bytes</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Unicode text</dt>
                <dd>{result.unicodeCodePoints} code points</dd>
              </div>
            </dl>
          </div>

          <div className="self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="text-sm font-semibold text-yellow-900">Before you compare digests</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-yellow-800">
              {result.algorithm === "SHA-1" && (
                <li>SHA-1 is retained for legacy comparison, not new cryptographic security decisions.</li>
              )}
              {result.hasCrLf && (
                <li>The input contains CRLF line endings. Changing them to LF changes the digest.</li>
              )}
              {result.differsFromNfc && (
                <li>The text is not NFC-normalized. Visually similar Unicode text can hash to different bytes.</li>
              )}
              <li>A plain SHA digest is not a password-storage scheme and does not make guessable secrets safe to publish.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Browser-local processing</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Digest generation runs in this browser with Web Crypto. Yoryantra does
          not need to upload the text to calculate the result. A browser extension,
          clipboard action, screen recording, or compromised device can still expose
          sensitive input, so production secrets are better handled in an approved local workflow.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">The digest is a fingerprint of bytes, not appearance</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            SHA functions operate on bytes. Here, the text is first encoded as UTF-8,
            then the selected SHA algorithm produces a fixed-size digest. Two inputs
            that look the same on screen can still differ at the byte level because of
            spaces, line endings, case, or Unicode normalization.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That distinction matters when reproducing an API example or comparing a
            known digest. If another system hashes a file, a binary buffer, UTF-16
            text, or normalized text, its result is not directly comparable to this
            UTF-8 text digest unless the exact input bytes match.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Choosing among the SHA options shown here</h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <h3 className="font-semibold text-gray-900">SHA-256, SHA-384, SHA-512</h3>
              <p className="mt-2">
                These are SHA-2 family digests. Choose the algorithm required by the
                protocol, checksum, API, test fixture, or system you are comparing against;
                a longer digest is not interchangeable with a shorter one.
              </p>
            </div>
            <div className="self-start rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-800">
              <h3 className="font-semibold text-yellow-900">SHA-1 is a compatibility choice</h3>
              <p className="mt-2">
                SHA-1 has known collision weaknesses. Its presence here is for reproducing
                legacy values, not as a recommendation for new signatures, certificates,
                or adversarial integrity checks.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A matching digest answers a narrow question</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            If two independently produced digests match, that is strong evidence that the
            same bytes were hashed with the same algorithm. It does not by itself prove who
            created those bytes. Authenticity normally needs a keyed construction such as
            HMAC or a digital signature, depending on the protocol.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Password storage is another separate problem. Fast general-purpose SHA functions
            are intentionally cheap to compute, which is the opposite of what password
            verification needs after a database leak. Password verifiers should use a salted,
            purpose-built password hashing scheme with an appropriate cost factor.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference points for implementation work</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser support and digest names are defined by the Web Crypto API. MDN documents
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest"
              target="_blank"
              rel="noreferrer"
              className="ml-1 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500"
            >
              SubtleCrypto.digest()
            </a>
            , including SHA-1, SHA-256, SHA-384, and SHA-512. The algorithms themselves are specified by NIST's
            <a
              href="https://csrc.nist.gov/pubs/fips/180-4/upd1/final"
              target="_blank"
              rel="noreferrer"
              className="ml-1 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500"
            >
              Secure Hash Standard
            </a>
            . NIST is transitioning away from SHA-1 for cryptographic protection, which is why SHA-1 is labeled as a legacy comparison option here.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/hash-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
