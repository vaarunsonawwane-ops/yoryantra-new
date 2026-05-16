"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [length, setLength] = useState(32);
  const [output, setOutput] = useState("");

  const generateToken = () => {
    const safeLength = Math.min(Math.max(length, 8), 256);

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const randomValues = new Uint32Array(safeLength);

    let result = "";

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
      title="Random Token Generator"
      description="Generate random tokens, secret strings, and secure identifiers instantly."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Token Length
        </label>

        <input
          type="number"
          min="8"
          max="256"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateToken} className="yoryantra-btn">
          Generate Token
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Random Token
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
          {output || "Generated random token will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Random Token Generator?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Random Token Generator helps you create random tokens, secure
            identifiers, access strings, temporary secrets, and unique values
            instantly. It is useful for developers building APIs,
            authentication systems, sessions, webhooks, and testing workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The token is generated directly in your browser using secure random
            values. You can use generated tokens for development, testing,
            temporary credentials, unique identifiers, and security workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Random Token Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose the token length.</li>
            <li>Click <strong>Generate Token</strong>.</li>
            <li>Copy the generated token.</li>
            <li>Use it in your development or testing workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating temporary API tokens.</li>
            <li>Creating random access strings.</li>
            <li>Generating secure session identifiers.</li>
            <li>Creating webhook verification tokens.</li>
            <li>Generating random secrets for testing.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Example random token:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              qM7kLp2xW9vBa8NdR4sHt1YuE6zFc0Jp
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Example use:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              Authorization: Bearer your_random_token
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
                What is a random token?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A random token is a randomly generated string commonly used for
                authentication, session management, API access, verification,
                and temporary identifiers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Random Token Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The token is generated in your browser using secure random
                values. For highly sensitive production secrets, use dedicated
                backend secret management systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What token length should I use?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A 32-character token is common for testing and general usage.
                Longer tokens provide more randomness and uniqueness.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use this for API authentication?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Generated tokens can be used for development, testing, and
                temporary authentication workflows.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/api-key-generator" className="yoryantra-btn-outline">
              API Key Generator
            </Link>

            <Link href="/tools/password-generator" className="yoryantra-btn-outline">
              Password Generator
            </Link>

            <Link href="/tools/hmac-generator" className="yoryantra-btn-outline">
              HMAC Generator
            </Link>

            <Link href="/tools/bcrypt-generator" className="yoryantra-btn-outline">
              bcrypt Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
