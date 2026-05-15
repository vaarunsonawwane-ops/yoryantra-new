"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    setPassword(result);
  };

  const resetAll = () => {
    setPassword("");
    setLength(16);
  };

  return (
    <ToolShell
      title="Password Generator"
      description="Generate strong random passwords instantly with this free online Password Generator."
    >
      {/* LENGTH */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Password Length
        </label>

        <input
          type="number"
          min="4"
          max="64"
          value={length}
          onChange={(e) =>
            setLength(Number(e.target.value))
          }
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generatePassword}
          className="yoryantra-btn"
        >
          Generate Password
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
            Generated Password
          </h3>

          {password && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(password)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[140px] whitespace-pre-wrap break-words">
          {password || "Generated password will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This Password Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Password Generator helps you instantly create strong,
            random, and secure passwords directly in your browser.
            Strong passwords are important for protecting online accounts,
            applications, databases, and sensitive information.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Using long and unpredictable passwords reduces the risk of
            unauthorized access and improves overall account security.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Password Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Select the desired password length.</li>
            <li>Click <strong>Generate Password</strong>.</li>
            <li>Copy the generated password.</li>
            <li>Use it for accounts or applications securely.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating secure account passwords.</li>
            <li>Generating passwords for applications or databases.</li>
            <li>Improving online security practices.</li>
            <li>Creating temporary credentials for testing.</li>
            <li>Managing strong passwords for multiple services.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Password
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
              G7#pL2!xQ9@wT4zK
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
                What makes a password strong?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Strong passwords are long, random, and contain a mix of
                uppercase letters, lowercase letters, numbers, and symbols.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Password Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Passwords are generated directly in your browser and are
                not stored or transmitted to a server.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I choose password length?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can select the desired password length before
                generating the password.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/hash-generator" className="yoryantra-btn-outline">
              Hash Generator
            </Link>

            <Link href="/tools/uuid-generator" className="yoryantra-btn-outline">
              UUID Generator
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}