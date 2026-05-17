"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [password, setPassword] =
    useState("");

  const [rounds, setRounds] =
    useState(10);

  const [hash, setHash] =
    useState("");

  const generateHash =
    async () => {
      if (!password.trim())
        return;

      const result =
        await bcrypt.hash(
          password,
          rounds
        );

      setHash(result);
    };

  const resetAll = () => {
    setPassword("");
    setRounds(10);
    setHash("");
  };

  return (
    <ToolShell
      title="bcrypt Generator"
      description="Generate secure bcrypt password hashes instantly with this free online bcrypt Generator."
    >
      {/* PASSWORD */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Password
        </label>

        <textarea
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          placeholder="Enter password..."
          className="w-full min-h-[120px] rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* SALT ROUNDS */}
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Salt Rounds
        </label>

        <select
          value={rounds}
          onChange={(e) =>
            setRounds(
              Number(
                e.target.value
              )
            )
          }
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition bg-white"
        >
          <option value={8}>
            8
          </option>

          <option value={10}>
            10 Recommended
          </option>

          <option value={12}>
            12 Stronger
          </option>

          <option value={14}>
            14 High Security
          </option>
        </select>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateHash}
          className="yoryantra-btn"
        >
          Generate bcrypt Hash
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
            Generated bcrypt Hash
          </h3>

          {hash && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  hash
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {hash ||
            "Generated bcrypt hash will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          bcrypt hashing happens locally inside your browser. Passwords are not
          uploaded, stored, or transmitted to any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating bcrypt Hashes for Password Testing
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            bcrypt hashing helps developers securely transform passwords into
            protected hash values for authentication systems, login workflows,
            backend applications, user management systems, APIs, and testing
            environments.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unlike simple hashing algorithms such as MD5 or SHA-based password
            storage, bcrypt is specifically designed for password hashing. It
            automatically includes salting and configurable work factors to make
            brute-force attacks significantly harder.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This bcrypt Generator creates secure password hashes directly inside
            your browser using bcryptjs without requiring server-side
            processing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the bcrypt Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter the password you want to hash.
            </li>

            <li>
              Select the bcrypt salt rounds.
            </li>

            <li>
              Click <strong>Generate bcrypt Hash</strong>.
            </li>

            <li>
              Copy the generated hash for testing or backend workflows.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding bcrypt Salt Rounds
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>8 rounds:</strong> Faster hashing useful for lightweight
                testing.
              </li>

              <li>
                <strong>10 rounds:</strong> Common recommended balance between
                speed and security.
              </li>

              <li>
                <strong>12 rounds:</strong> Stronger security with slower hash
                generation.
              </li>

              <li>
                <strong>14 rounds:</strong> High-security hashing for sensitive
                systems.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Creating secure password hashes for applications.
            </li>

            <li>
              Testing login and authentication systems.
            </li>

            <li>
              Generating sample hashes for backend development.
            </li>

            <li>
              Learning how bcrypt password hashing works.
            </li>

            <li>
              Comparing different salt round strengths.
            </li>

            <li>
              Building secure user authentication workflows.
            </li>

            <li>
              Preparing test credentials for development environments.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example bcrypt Hash
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Password:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`mySecurePassword123`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              bcrypt hash:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`$2a$10$examplebcryptpasswordhashvalue`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why bcrypt Matters for Password Security
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Automatic salting:</strong> bcrypt generates unique
                salts automatically for every password.
              </li>

              <li>
                <strong>Slower brute-force attacks:</strong> Configurable work
                factors increase attack difficulty.
              </li>

              <li>
                <strong>Password-focused security:</strong> bcrypt is designed
                specifically for password storage workflows.
              </li>

              <li>
                <strong>Modern authentication support:</strong> Widely used in
                backend frameworks and authentication systems.
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
                What is bcrypt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                bcrypt is a password hashing algorithm designed specifically for
                secure password storage and authentication systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What are bcrypt salt rounds?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Salt rounds control how much computational work bcrypt performs
                while generating hashes. Higher rounds increase security but
                also increase processing time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can bcrypt hashes be decrypted?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. bcrypt is a one-way hashing algorithm designed so the
                original password cannot be directly recovered from the hash.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this bcrypt Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Password hashing happens locally inside your browser
                without uploading passwords externally.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is bcrypt generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. bcrypt hashing happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            bcrypt hashing often connects with authentication systems, password
            management workflows, API security, JWT authentication, and backend
            application development.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
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
              href="/tools/hash-generator"
              className="yoryantra-btn-outline"
            >
              Hash Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}