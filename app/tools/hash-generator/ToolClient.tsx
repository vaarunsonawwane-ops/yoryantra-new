"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

type HashResult = {
  hash: string;
  algorithm: HashAlgorithm;
  bits: number;
  bytes: number;
  warnings: string[];
};

const algorithmBits: Record<HashAlgorithm, number> = {
  "SHA-1": 160,
  "SHA-256": 256,
  "SHA-384": 384,
  "SHA-512": 512,
};

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getWarnings(algorithm: HashAlgorithm, input: string) {
  const warnings: string[] = [
    "A hash is one-way output, not encryption. It cannot be decoded back to the original text.",
  ];

  if (algorithm === "SHA-1") {
    warnings.push(
      "SHA-1 is kept for legacy checks only. Avoid it for new security-sensitive designs.",
    );
  }

  if (/password|secret|token|api[_-]?key/i.test(input)) {
    warnings.push(
      "Plain hashes are not a safe password-storage method. Passwords need a dedicated slow password hashing function with a salt.",
    );
  } else {
    warnings.push(
      "For password storage, use a dedicated password hashing function instead of a plain SHA hash.",
    );
  }

  warnings.push(
    "Exact input matters. Spaces, case, Unicode characters, and line endings change the hash.",
  );

  return warnings;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [result, setResult] = useState<HashResult | null>(null);
  const [error, setError] = useState("");

  const generateHash = async () => {
    if (!input.length) {
      setError("Enter text before generating a hash.");
      setResult(null);
      return;
    }

    try {
      const data = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);

      setResult({
        hash: bufferToHex(hashBuffer),
        algorithm,
        bits: algorithmBits[algorithm],
        bytes: data.byteLength,
        warnings: getWarnings(algorithm, input),
      });
      setError("");
    } catch {
      setError("Unable to generate a hash with the selected algorithm in this browser.");
      setResult(null);
    }
  };

  const resetAll = () => {
    setInput("");
    setAlgorithm("SHA-256");
    setResult(null);
    setError("");
  };

  return (
    <ToolShell
      title="Hash Generator"
      description="Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text locally in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full h-56 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Enter the exact text you want to hash..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Hash Algorithm
        </label>

        <YoryantraSelect
          value={algorithm}
          onChange={(value) => setAlgorithm(value as HashAlgorithm)}
          options={[
            { label: "SHA-1 (legacy)", value: "SHA-1" },
            { label: "SHA-256", value: "SHA-256" },
            { label: "SHA-384", value: "SHA-384" },
            { label: "SHA-512", value: "SHA-512" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateHash} className="yoryantra-btn">
          Generate Hash
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Generated Hash</h3>

          {result?.hash && (
            <button
              onClick={() => navigator.clipboard.writeText(result.hash)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[160px] text-sm break-words whitespace-pre-wrap overflow-auto">
          {result?.hash || "Generated hash will appear here..."}
        </div>
      </div>

      {result && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Hash Details</h3>
            <dl className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between gap-4">
                <dt>Algorithm</dt>
                <dd className="font-mono">{result.algorithm}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Output size</dt>
                <dd>{result.bits} bits</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Input bytes</dt>
                <dd>{result.bytes}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Hex length</dt>
                <dd>{result.hash.length} characters</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="text-sm font-semibold text-yellow-900">Important</h3>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-yellow-800 leading-relaxed">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Privacy Note</h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Hash generation happens locally inside your browser using the Web
          Crypto API. Your text is not uploaded by this tool. Still, avoid
          pasting live passwords, production API keys, or private tokens unless
          you understand the risk.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Hashes for Text, APIs, and Integrity Checks
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hash generation converts text into a fixed-length value that can be
            used for comparison, integrity checks, debugging, signing workflows,
            and development tasks where the same input should produce the same
            output.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool supports SHA-1, SHA-256, SHA-384, and SHA-512 through the
            browser Web Crypto API. It does not support MD5 because MD5 is not
            available through the standard Web Crypto digest API used here.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A hash is different from encryption. It is designed to be one-way,
            so it is useful for matching and verification, not for recovering
            the original input later.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Supported Hash Algorithms</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>SHA-1:</strong> Legacy hash output. Use only when you
                need to compare against an older system.
              </li>
              <li>
                <strong>SHA-256:</strong> Common SHA-2 hash used in many API,
                signing, checksum, and integrity workflows.
              </li>
              <li>
                <strong>SHA-384:</strong> Longer SHA-2 output used where a
                larger digest size is required.
              </li>
              <li>
                <strong>SHA-512:</strong> SHA-2 hash with a 512-bit output for
                systems that require a longer digest.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Hash Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the exact text you want to hash.</li>
            <li>Select SHA-1, SHA-256, SHA-384, or SHA-512.</li>
            <li>Click <strong>Generate Hash</strong>.</li>
            <li>Review the output size and copy the hexadecimal hash.</li>
            <li>Keep whitespace and line endings the same when comparing hashes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Use Cases</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating a quick hash for text comparison.</li>
            <li>Checking whether two text values are exactly the same.</li>
            <li>Preparing examples for API documentation or tests.</li>
            <li>Debugging webhook, signing, or checksum workflows.</li>
            <li>Comparing values against a known SHA digest.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example SHA-256 Hash</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Input text:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">{`hello-world`}</pre>

            <p className="mt-4 font-medium text-gray-900">SHA-256 hash:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
{`afa27b44d43b02a9fea41d13cedc2e4016cfcf87c5dbf990e593669aa8ce286d`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Hashes, Passwords, and Security Limits
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Not encryption:</strong> A hash is not meant to be
                decoded back to the original text.
              </li>
              <li>
                <strong>Not password storage by itself:</strong> Passwords need
                slow password hashing such as bcrypt, scrypt, Argon2, or a
                platform-approved equivalent.
              </li>
              <li>
                <strong>SHA-1 is legacy:</strong> Keep SHA-1 for compatibility
                checks, not new security-sensitive designs.
              </li>
              <li>
                <strong>Input must match exactly:</strong> A trailing space or
                different line ending changes the generated hash.
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
              <h3 className="font-semibold text-gray-900">What does a hash generator do?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                It converts text into a fixed-length digest using a selected
                hashing algorithm. The digest can be compared later to check if
                the same exact input was used.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Can a hash be decoded?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. A cryptographic hash is designed to be one-way. You compare
                hashes; you do not decode them back into the original text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Why is MD5 not included?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool uses the browser Web Crypto digest API, which supports
                SHA algorithms here. MD5 is intentionally not part of this
                browser hashing flow.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Should I use SHA-1?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Use SHA-1 only when an older system requires it for comparison.
                Prefer SHA-256 or stronger SHA-2 outputs for new workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Does this run locally?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Hash generation runs in your browser with the Web Crypto API.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/hash-generator" />
        </div>
      </section>
    </ToolShell>
  );
}
