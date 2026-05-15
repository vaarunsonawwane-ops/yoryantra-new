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

  const copyKey = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  const resetAll = () => {
    setLength(32);
    setOutput("");
  };

  return (
    <ToolShell
      title="API Key Generator"
      description="Generate random API keys, secret tokens, and secure strings instantly."
    >
      <div className="space-y-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Key Length
              </label>

              <input
                type="number"
                min="8"
                max="128"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateKey}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Generate API Key
              </button>

              <button
                onClick={resetAll}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            {output && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Generated API Key
                  </p>

                  <button
                    onClick={copyKey}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Copy
                  </button>
                </div>

                <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm text-gray-800">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>

        <section className="space-y-8 text-sm leading-7 text-gray-700">
          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              About This API Key Generator
            </h2>

            <p>
              This API Key Generator helps you create random API keys, secret
              tokens, access keys, and secure strings directly in your browser.
              It is useful for developers working on APIs, authentication
              systems, dashboards, testing environments, and internal tools.
            </p>

            <p className="mt-3">
              The generated key can be used as a sample API token, temporary
              secret, test credential, webhook secret, or random identifier
              during development. For production systems, always store secret
              values securely and avoid exposing them in frontend code.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              API Key Generator Features
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>Generate random API keys instantly.</li>
              <li>Choose a key length between 8 and 128 characters.</li>
              <li>Create secure-looking tokens for testing and development.</li>
              <li>Copy generated keys with one click.</li>
              <li>Runs directly in your browser for a fast workflow.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              How to Use the API Key Generator
            </h2>

            <ol className="list-decimal space-y-2 pl-5">
              <li>Enter the length of the API key you want to generate.</li>
              <li>Click Generate API Key.</li>
              <li>Copy the generated key.</li>
              <li>Use it as a test token, secret string, or sample key.</li>
            </ol>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Common Use Cases
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>Generating sample API keys for documentation.</li>
              <li>Creating test tokens for API authentication flows.</li>
              <li>Making random secret strings for local development.</li>
              <li>Creating webhook signing secrets for testing.</li>
              <li>Generating temporary access keys for internal tools.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900">
                  What is an API key?
                </h3>
                <p>
                  An API key is a unique string used to identify or authenticate
                  an application, service, or user when making requests to an
                  API.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  What length should an API key be?
                </h3>
                <p>
                  A 32-character key is common for general testing. For stronger
                  secrets, developers often use 64 characters or more depending
                  on the system requirements.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Can I use this API key in production?
                </h3>
                <p>
                  This tool is useful for generating random strings, but for
                  production systems, it is better to create and manage API keys
                  through your backend, database, or secret management system.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Is the API key generated on the server?
                </h3>
                <p>
                  No. The key is generated in your browser, which makes the tool
                  fast and convenient for development workflows.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Related Tools
            </h2>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/bcrypt-generator"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                bcrypt Generator
              </Link>

              <Link
                href="/tools/jwt-decoder"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                JWT Decoder
              </Link>

              <Link
                href="/tools/password-generator"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Password Generator
              </Link>

              <Link
                href="/tools/hmac-generator"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                HMAC Generator
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ToolShell>
  );
}