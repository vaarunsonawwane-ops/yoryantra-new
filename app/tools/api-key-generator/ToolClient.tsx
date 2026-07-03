"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const MIN_LENGTH = 16;
const MAX_LENGTH = 128;

function generateRandomString(length: number) {
  const random = new Uint8Array(length);
  window.crypto.getRandomValues(random);

  return Array.from(random, (value) => ALPHABET[value & 63]).join("");
}

export default function ToolClient() {
  const [length, setLength] = useState(32);
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
      setError("Your browser could not generate cryptographically random data.");
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
      setError("Copy failed. Select the generated string and copy it manually.");
    }
  };

  const resetAll = () => {
    setLength(32);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const estimatedBits = length * 6;

  return (
    <ToolShell
      title="API Key Generator"
      description="Generate Base64URL-safe random secret strings locally in your browser and review their estimated entropy."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Key Length
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
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Uses 64 URL-safe characters. At the selected length, the estimated
          search space is about {estimatedBits} bits when every character is
          generated independently.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateKey} className="yoryantra-btn">
          Generate Random String
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
            Generated Secret String
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[160px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {output || "Generated secret string will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Security and Storage Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Generation happens locally with the browser Web Crypto API. The
          string is not sent to Yoryantra, but copying it places it on your
          clipboard. A random string is only one part of an API-key system:
          production keys also need secure storage, access limits, rotation,
          revocation, monitoring, and careful logging rules.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Creating Random Secret Strings for API-Key Workflows
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool generates a random string from uppercase letters,
            lowercase letters, numbers, hyphens, and underscores. That alphabet
            is safe to place in many headers, URLs, configuration files, and
            environment variables without Base64 padding characters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The result can be used as test data or as the random secret portion
            of a key design. It does not create an account record, assign
            permissions, hash the stored value, or build a complete
            authentication system.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the API Key Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose a whole-number length from 16 to 128 characters.</li>
            <li>Click <strong>Generate Random String</strong>.</li>
            <li>Review the estimated search-space size.</li>
            <li>Copy the value and store it using an appropriate secret-management process.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Practical Uses
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating test API-key values for local development.</li>
            <li>Creating random webhook-secret material.</li>
            <li>Preparing one-time tokens for controlled internal workflows.</li>
            <li>Generating random configuration secrets before secure storage.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What This Tool Does Not Decide
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li><strong>Permissions:</strong> The generated value has no access rights by itself.</li>
              <li><strong>Storage:</strong> Your application must decide whether to store a hash, encrypted value, or reference.</li>
              <li><strong>Rotation:</strong> Expiry and replacement rules belong to the application using the key.</li>
              <li><strong>Identification:</strong> Prefixes and public key IDs can help identify records without exposing the full secret.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">Is the result a complete API key?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                It is random secret material that can be used in an API-key design. A complete system still needs identity, permissions, storage, rotation, revocation, and audit controls.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Why use a URL-safe alphabet?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                The generated value avoids spaces, plus signs, slashes, and padding characters, which makes it easier to use in many headers and configuration formats.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Can I use an eight-character key?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool requires at least 16 characters. Short secrets have a much smaller search space and are easier to guess or exhaust.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Is anything uploaded?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No generated value is sent to Yoryantra. Clipboard software, browser extensions, device monitoring, or local malware can still affect confidentiality after generation.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/api-key-generator" />
        </div>
      </section>
    </ToolShell>
  );
}
