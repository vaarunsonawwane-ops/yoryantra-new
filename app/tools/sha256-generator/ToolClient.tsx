"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Sha256Result = {
  hash: string;
  inputBytes: number;
  warnings: string[];
};

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getWarnings(input: string) {
  const warnings = [
    "SHA-256 is one-way hashing, not encryption. It cannot be decoded back to the original text.",
    "Exact input matters. Case, spaces, Unicode characters, and line endings change the hash.",
    "Plain SHA-256 is not a password-storage method by itself. Use a dedicated password hashing function for passwords.",
  ];

  if (/password|secret|token|api[_-]?key/i.test(input)) {
    warnings.push(
      "The input looks like it may contain sensitive text. This tool runs locally, but live secrets should still be handled carefully.",
    );
  }

  return warnings;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Sha256Result | null>(null);
  const [error, setError] = useState("");

  const generateSHA256 = async () => {
    if (!input.length) {
      setError("Enter text before generating a SHA-256 hash.");
      setResult(null);
      return;
    }

    try {
      const data = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);

      setResult({
        hash: bufferToHex(hashBuffer),
        inputBytes: data.byteLength,
        warnings: getWarnings(input),
      });
      setError("");
    } catch {
      setError("Unable to generate a SHA-256 hash in this browser.");
      setResult(null);
    }
  };

  const resetAll = () => {
    setInput("");
    setResult(null);
    setError("");
  };

  return (
    <ToolShell
      title="SHA256 Generator"
      description="Generate SHA-256 hashes from text locally in your browser and check the output safely."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Enter the exact text you want to hash..."
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateSHA256} className="yoryantra-btn">
          Generate SHA-256
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
          <h3 className="text-lg font-semibold text-gray-900">
            Generated SHA-256 Hash
          </h3>

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
          {result?.hash || "Generated SHA-256 hash will appear here..."}
        </div>
      </div>

      {result && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Hash Details</h3>
            <dl className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between gap-4">
                <dt>Algorithm</dt>
                <dd className="font-mono">SHA-256</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Output size</dt>
                <dd>256 bits</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Hex length</dt>
                <dd>{result.hash.length} characters</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Input bytes</dt>
                <dd>{result.inputBytes}</dd>
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
          SHA-256 hash generation happens locally inside your browser using the
          Web Crypto API. Your text is not uploaded by this tool. Still, avoid
          pasting live passwords, production API keys, or private tokens unless
          you understand the risk.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating SHA-256 Hashes for Text and Verification
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            SHA-256 turns text into a 256-bit hash value. Developers use this
            kind of digest for integrity checks, API examples, webhook debugging,
            content fingerprints, and comparison workflows where exact input
            matching matters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The same input produces the same SHA-256 hash. A small change, such
            as one extra space or a different line ending, produces a different
            hash. This is useful for checking whether two inputs match exactly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool creates SHA-256 hashes directly inside your browser. It is
            a hashing tool, not an encryption tool and not a full security audit.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the SHA256 Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the exact text you want to hash.</li>
            <li>Click <strong>Generate SHA-256</strong>.</li>
            <li>Review the 64-character hexadecimal output.</li>
            <li>Copy the hash for your test, comparison, or documentation workflow.</li>
            <li>Keep whitespace and line endings unchanged when comparing hashes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Use Cases</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating SHA-256 examples for API documentation.</li>
            <li>Checking whether two text values match exactly.</li>
            <li>Creating content fingerprints for debugging.</li>
            <li>Comparing payloads in webhook and signing workflows.</li>
            <li>Learning how one-way hash output changes with small input edits.</li>
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
            SHA-256 Security Limits
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Not reversible:</strong> SHA-256 is designed as a
                one-way hash. It is not meant to be decoded.
              </li>
              <li>
                <strong>Not password storage by itself:</strong> Password
                storage needs a slow password hashing method with a salt.
              </li>
              <li>
                <strong>Not a signature alone:</strong> Webhook and API
                signatures usually need HMAC or another keyed signing method,
                not only a plain hash.
              </li>
              <li>
                <strong>Exact bytes matter:</strong> Encoding, whitespace, and
                line endings affect the result.
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
              <h3 className="font-semibold text-gray-900">What is SHA-256?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                SHA-256 is a cryptographic hash algorithm that creates a
                fixed-length 256-bit digest from input data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Is SHA-256 encryption?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Encryption is designed to be decrypted with a key. SHA-256
                is one-way hashing and is used for comparison and verification.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can SHA-256 store passwords safely?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Plain SHA-256 is not enough for password storage. Use a proper
                password hashing function such as bcrypt, scrypt, Argon2, or a
                platform-approved equivalent.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why did my hash change after a tiny edit?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Hash algorithms are sensitive to exact input bytes. A changed
                space, letter case, or line ending changes the output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Does this run locally?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. SHA-256 generation runs inside your browser using the Web
                Crypto API.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/sha256-generator" />
        </div>
      </section>
    </ToolShell>
  );
}
