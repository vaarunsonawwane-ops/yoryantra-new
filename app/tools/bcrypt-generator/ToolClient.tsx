"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [password, setPassword] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");

  const generateHash = async () => {
    if (!password.trim()) return;
    const result = await bcrypt.hash(password, rounds);
    setHash(result);
  };

  const copyHash = async () => {
    if (!hash) return;
    await navigator.clipboard.writeText(hash);
  };

  const resetAll = () => {
    setPassword("");
    setRounds(10);
    setHash("");
  };

  return (
    <ToolShell
      title="bcrypt Generator"
      description="Generate secure bcrypt password hashes instantly online."
    >
      <div className="space-y-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Password
              </label>

              <textarea
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="min-h-[120px] w-full rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Salt Rounds
              </label>

              <select
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
              >
                <option value={8}>8</option>
                <option value={10}>10 Recommended</option>
                <option value={12}>12 Stronger</option>
                <option value={14}>14 High Security</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateHash}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Generate Hash
              </button>

              <button
                onClick={resetAll}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            {hash && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Generated bcrypt Hash
                  </p>

                  <button
                    onClick={copyHash}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Copy
                  </button>
                </div>

                <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm text-gray-800">
                  {hash}
                </pre>
              </div>
            )}
          </div>
        </div>

        <section className="space-y-8 text-sm leading-7 text-gray-700">
          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              About This bcrypt Generator
            </h2>

            <p>
              This bcrypt Generator lets you create secure bcrypt password hashes
              directly in your browser. It is useful for developers who need to
              hash passwords for testing, backend authentication, user login
              systems, or password storage workflows.
            </p>

            <p className="mt-3">
              bcrypt is designed for password hashing and includes automatic
              salting. This makes it much safer for password storage than simple
              hashing methods such as MD5 or SHA-based hashes.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              bcrypt Features
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>Generate bcrypt hashes instantly.</li>
              <li>Choose salt rounds based on your security needs.</li>
              <li>Copy generated hashes with one click.</li>
              <li>Useful for authentication testing and backend development.</li>
              <li>Runs in your browser for quick developer workflows.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              How to Use the bcrypt Generator
            </h2>

            <ol className="list-decimal space-y-2 pl-5">
              <li>Enter the password you want to hash.</li>
              <li>Select the bcrypt salt rounds.</li>
              <li>Click Generate Hash.</li>
              <li>Copy the generated bcrypt hash and use it where needed.</li>
            </ol>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Common Use Cases
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>Creating test password hashes for backend projects.</li>
              <li>Testing login and authentication systems.</li>
              <li>Generating sample hashes for documentation.</li>
              <li>Learning how bcrypt password hashing works.</li>
              <li>Checking how salt rounds affect generated hashes.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900">
                  What is bcrypt?
                </h3>
                <p>
                  bcrypt is a password hashing algorithm used to store passwords
                  securely. It adds a salt and uses a configurable work factor to
                  make brute-force attacks harder.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  What are salt rounds?
                </h3>
                <p>
                  Salt rounds control how much work bcrypt performs while
                  generating a hash. Higher rounds are stronger but slower.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Can bcrypt hashes be decrypted?
                </h3>
                <p>
                  No. bcrypt is a one-way hashing algorithm. The original
                  password cannot be directly recovered from the hash.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Is bcrypt good for password storage?
                </h3>
                <p>
                  Yes. bcrypt is commonly used for password storage in web
                  applications because it is slow, salted, and designed for
                  password hashing.
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
                href="/tools/api-key-generator"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                API Key Generator
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
                href="/tools/api-tester"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                API Tester
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ToolShell>
  );
}