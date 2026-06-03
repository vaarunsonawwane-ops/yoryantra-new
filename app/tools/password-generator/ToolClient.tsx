"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);

  const generatePassword = () => {
    const safeLength = Math.min(
      Math.max(length, 4),
      64
    );

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

    const randomValues =
      new Uint32Array(safeLength);

    window.crypto.getRandomValues(
      randomValues
    );

    let result = "";

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
                navigator.clipboard.writeText(
                  password
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[160px] whitespace-pre-wrap break-words">
          {password ||
            "Generated password will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Password generation happens locally inside your browser using secure
          browser cryptography APIs. Generated passwords are not uploaded,
          stored, or transmitted to any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Strong Passwords Without Reusing Old Ones
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Password generation helps create strong random passwords for online
            accounts, applications, databases, admin dashboards, developer
            tools, cloud services, authentication systems, and security-focused
            workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Weak or reused passwords increase the risk of unauthorized access,
            credential leaks, and account compromise. Strong passwords are
            typically longer, unpredictable, and include a combination of
            uppercase letters, lowercase letters, numbers, and symbols.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Password Generator creates secure random passwords instantly
            inside your browser without sending sensitive data to external
            servers or APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Password Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Select the desired password length.
            </li>

            <li>
              Click <strong>Generate Password</strong>.
            </li>

            <li>
              Copy the generated password instantly.
            </li>

            <li>
              Use the password securely for accounts, applications, or testing.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Creating secure passwords for online accounts.
            </li>

            <li>
              Generating admin dashboard credentials.
            </li>

            <li>
              Creating temporary passwords for testing environments.
            </li>

            <li>
              Improving security practices across applications.
            </li>

            <li>
              Generating strong passwords for databases and servers.
            </li>

            <li>
              Creating unique credentials for cloud services.
            </li>

            <li>
              Avoiding password reuse across multiple platforms.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Strong Password
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`G7#pL2!xQ9@wT4zK`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Strong Passwords Matter
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better account protection:</strong> Random passwords are
                harder to guess or brute-force.
              </li>

              <li>
                <strong>Reduced credential reuse:</strong> Unique passwords help
                isolate security risks across platforms.
              </li>

              <li>
                <strong>Improved security practices:</strong> Strong passwords
                reduce exposure to common attacks.
              </li>

              <li>
                <strong>Safer development workflows:</strong> Random credentials
                are useful during testing and staging.
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
                What makes a password strong?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Strong passwords are typically long, random, and contain a mix
                of uppercase letters, lowercase letters, numbers, and symbols.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Password Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Passwords are generated locally inside your browser using
                cryptographically secure random values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I choose password length?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can select custom password lengths between 4 and 64
                characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I reuse the same password everywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Using unique passwords for different services improves
                overall account security.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is password generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Password generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Password generation often connects with authentication systems,
            cryptography utilities, API security workflows, and backend
            development tools.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/hash-generator"
              className="yoryantra-btn-outline"
            >
              Hash Generator
            </Link>

            <Link
              href="/tools/uuid-generator"
              className="yoryantra-btn-outline"
            >
              UUID Generator
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}