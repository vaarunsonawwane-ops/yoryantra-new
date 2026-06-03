"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [length, setLength] = useState(32);
  const [output, setOutput] = useState("");

  const generateKey = () => {
    const safeLength = Math.min(
      Math.max(length, 8),
      128
    );

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    const randomValues =
      new Uint32Array(safeLength);

    window.crypto.getRandomValues(
      randomValues
    );

    for (
      let i = 0;
      i < safeLength;
      i++
    ) {
      result +=
        chars[
          randomValues[i] %
            chars.length
        ];
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
          onChange={(e) =>
            setLength(
              Number(e.target.value)
            )
          }
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateKey}
          className="yoryantra-btn"
        >
          Generate API Key
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
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
              onClick={() =>
                navigator.clipboard.writeText(
                  output
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[160px] flex items-center text-sm break-words">
          {output ||
            "Generated API key will appear here..."}
        </div>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          API key generation happens locally inside your browser using the
          built-in crypto API. No generated secrets are uploaded or stored on
          any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating API Keys for Testing and Development
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            API key generation helps developers create random secret strings,
            authentication tokens, webhook secrets, access keys, and temporary
            credentials for APIs, applications, internal tools, testing
            workflows, and development environments.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            API keys are commonly used to identify applications and authorize
            requests between services. Randomized keys help reduce predictable
            patterns and are widely used across backend systems, cloud services,
            SaaS platforms, dashboards, automation tools, and authentication
            workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This API Key Generator creates random secure strings instantly using
            browser cryptography APIs without requiring server-side processing
            or external services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the API Key Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter the desired API key length.
            </li>

            <li>
              Click <strong>Generate API Key</strong>.
            </li>

            <li>
              Copy the generated secret string instantly.
            </li>

            <li>
              Use the key for testing, authentication, or development
              workflows.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Creating API authentication tokens.
            </li>

            <li>
              Generating webhook signing secrets.
            </li>

            <li>
              Building temporary access credentials for testing.
            </li>

            <li>
              Creating secure random strings for applications.
            </li>

            <li>
              Generating identifiers for backend systems.
            </li>

            <li>
              Testing authentication and authorization workflows.
            </li>

            <li>
              Creating random tokens for internal development tools.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example API Key
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Generated API key:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`a9Kx72LpQm40VzTnBc18RsYwE6JhD3Uf`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Example usage:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Authorization: Bearer your_api_key_here`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why API Keys Matter in Modern Applications
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Authentication support:</strong> API keys help verify
                requests between systems and services.
              </li>

              <li>
                <strong>Secure integrations:</strong> Randomized tokens reduce
                predictable credential patterns.
              </li>

              <li>
                <strong>Backend workflows:</strong> API keys are widely used in
                cloud platforms, SaaS tools, and dashboards.
              </li>

              <li>
                <strong>Testing flexibility:</strong> Developers can quickly
                generate temporary credentials for development environments.
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
              <h3 className="font-semibold text-gray-900">
                What is an API key?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An API key is a unique secret string used to identify or
                authenticate applications and services when making API requests.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What API key length should I use?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Thirty-two characters are common for testing, while longer keys
                are often used for stronger security requirements.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use generated API keys in production?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool is useful for generating secure random strings, but
                production systems should manage credentials through secure
                backend infrastructure and secret management workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this API Key Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Keys are generated locally using the browser crypto API
                without sending data externally.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is API key generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. API key generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            API key generation often connects with authentication systems,
            backend APIs, JWT workflows, cryptography utilities, and secure
            application development.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/bcrypt-generator"
              className="yoryantra-btn-outline"
            >
              bcrypt Generator
            </Link>

            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/password-generator"
              className="yoryantra-btn-outline"
            >
              Password Generator
            </Link>

            <Link
              href="/tools/hmac-generator"
              className="yoryantra-btn-outline"
            >
              HMAC Generator
            </Link>

            <Link
              href="/tools/uuid-generator"
              className="yoryantra-btn-outline"
            >
              UUID Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}