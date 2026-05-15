"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Link from "next/link";

export default function ToolClient() {
  const [length, setLength] = useState(32);
  const [output, setOutput] = useState("");

  const generateKey = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
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
      <div className="space-y-8">
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
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
        </div>

        {output && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
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

        <section className="prose prose-gray max-w-none">
          <h2>Free online API key generator</h2>

          <p>
            This API Key Generator helps you create random API keys, secret
            tokens, access keys, and secure strings for development,
            authentication, testing, and internal tools.
          </p>

          <h2>What is an API key?</h2>

          <p>
            An API key is a unique token used to identify and authenticate an
            application, service, or user when connecting to an API. Developers
            commonly use API keys for private dashboards, backend services,
            integrations, and testing environments.
          </p>

          <h2>When should you use this tool?</h2>

          <p>
            Use this tool when you need a quick random key for development,
            dummy credentials, test projects, internal tools, or temporary
            secret values. For production systems, always store API keys
            securely and avoid exposing them in frontend code.
          </p>

          <h2>FAQs</h2>

          <h3>Is this API key generator free?</h3>
          <p>
            Yes. This tool is free to use and can generate random API keys
            instantly in your browser.
          </p>

          <h3>What length should an API key be?</h3>
          <p>
            A length of 32 characters is common for general use. For stronger
            secret tokens, you can use 64 characters or more.
          </p>

          <h3>Can I use generated keys in production?</h3>
          <p>
            You can use generated keys as secret strings, but for production
            security, generate and manage keys through your backend or secret
            management system.
          </p>

          <h2>Related tools</h2>

          <ul>
            <li>
              <Link href="/tools/bcrypt-generator">bcrypt Generator</Link>
            </li>
            <li>
              <Link href="/tools/jwt-decoder">JWT Decoder</Link>
            </li>
            <li>
              <Link href="/tools/cron-expression-generator">
                Cron Expression Generator
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </ToolShell>
  );
}