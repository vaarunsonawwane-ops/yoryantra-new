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
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Password
        </label>

        <textarea
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password..."
          className="w-full min-h-[120px] rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Salt Rounds
        </label>

        <select
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition bg-white"
        >
          <option value={8}>8</option>
          <option value={10}>10 Recommended</option>
          <option value={12}>12 Stronger</option>
          <option value={14}>14 High Security</option>
        </select>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateHash} className="yoryantra-btn">
          Generate Hash
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
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
              onClick={() => navigator.clipboard.writeText(hash)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {hash || "Generated bcrypt hash will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is bcrypt Generator?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            bcrypt Generator lets you create secure bcrypt password hashes
            directly in your browser. It is useful for developers who need to
            hash passwords for testing, backend authentication, user login
            systems, or password storage workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            bcrypt is designed for password hashing and includes automatic
            salting. This makes it much safer for password storage than simple
            hashing methods such as MD5 or SHA-based hashes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the bcrypt Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the password you want to hash.</li>
            <li>Select the bcrypt salt rounds.</li>
            <li>Click <strong>Generate Hash</strong>.</li>
            <li>Copy the generated bcrypt hash and use it where needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating test password hashes for backend projects.</li>
            <li>Testing login and authentication systems.</li>
            <li>Generating sample hashes for documentation.</li>
            <li>Learning how bcrypt password hashing works.</li>
            <li>Checking how salt rounds affect generated hashes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Password:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              mySecurePassword123
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              bcrypt hash:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              $2a$10$examplebcryptpasswordhashvalue
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
                What is bcrypt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                bcrypt is a password hashing algorithm used to store passwords
                securely. It adds a salt and uses a configurable work factor to
                make brute-force attacks harder.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What are salt rounds?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Salt rounds control how much work bcrypt performs while
                generating a hash. Higher rounds are stronger but slower.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can bcrypt hashes be decrypted?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. bcrypt is a one-way hashing algorithm. The original password
                cannot be directly recovered from the hash.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this bcrypt Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The hash is generated directly in your browser. Your input
                is not uploaded to any server.
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
