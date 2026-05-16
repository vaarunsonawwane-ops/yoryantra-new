"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [length, setLength] = useState(32);
  const [output, setOutput] = useState("");

  const generateKey = () => {
    const safeLength = Math.min(Math.max(length, 8), 128);

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";
    const randomValues = new Uint32Array(safeLength);

    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < safeLength; i++) {
      result += chars[randomValues[i] % chars.length];
    }

    setOutput(result);
  };

  const resetAll = () => {
    setLength(32);
    setOutput("");
  };

  return (
    <ToolShell
      title="API Key Generator"
      description="Generate random API keys, secret tokens, and secure strings instantly with this free online API Key Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Key Length
        </label>

        <input
          type="number"
          min="8"
          max="128"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateKey} className="yoryantra-btn">
          Generate API Key
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated API Key
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output || "Generated API key will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is API Key Generator?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            API Key Generator helps you create random API keys, secret
            tokens, access keys, and secure strings instantly. It is useful for
            developers working on APIs, authentication systems, dashboards,
            webhooks, testing environments, and internal tools.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            You can use the generated key as a sample API token, temporary
            secret, test credential, webhook secret, or random identifier during
            development. For production systems, always store sensitive keys
            securely and avoid exposing them in frontend code.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the API Key Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the length of the API key you want to generate.</li>
            <li>Click <strong>Generate API Key</strong>.</li>
            <li>Copy the generated key.</li>
            <li>Use it as a test token, secret string, or sample API key.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating sample API keys for documentation.</li>
            <li>Creating test tokens for API authentication flows.</li>
            <li>Making random secret strings for local development.</li>
            <li>Creating webhook signing secrets for testing.</li>
            <li>Generating temporary access keys for internal tools.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Example API key:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              a9Kx72LpQm40VzTnBc18RsYwE6JhD3Uf
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Common usage:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              Authorization: Bearer your_api_key_here
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is an API key?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An API key is a unique string used to identify or authenticate
                an application, service, or user when making requests to an API.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What length should an API key be?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A 32-character key is common for testing. For stronger secrets,
                developers often use 64 characters or more depending on system
                requirements.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use this API key in production?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool is useful for generating random strings, but for
                production systems it is better to create and manage API keys
                through your backend, database, or secret management system.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this API Key Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The key is generated directly in your browser. For sensitive
                production credentials, use a dedicated secret management
                workflow.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/bcrypt-generator" className="yoryantra-btn-outline">
              bcrypt Generator
            </Link>

            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/password-generator" className="yoryantra-btn-outline">
              Password Generator
            </Link>

            <Link href="/tools/hmac-generator" className="yoryantra-btn-outline">
              HMAC Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
