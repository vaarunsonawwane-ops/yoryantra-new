"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

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
      title="bcrypt Hash Generator"
      description="Generate salted bcrypt password hashes online with selectable cost factors. Hashing runs locally in your browser for development and testing."
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

        <YoryantraSelect
          value={String(rounds)}
          onChange={(value) =>
            setRounds(
              Number(value)
            )
          }
          options={[
            {
              label: "8",
              value: "8",
            },
            {
              label: "10 Recommended",
              value: "10",
            },
            {
              label: "12 Stronger",
              value: "12",
            },
            {
              label: "14 High Security",
              value: "14",
            },
          ]}
        />
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
      <div className="mt-8 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-3">
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

        <div className="yoryantra-output min-h-[140px] min-w-0 flex items-center text-sm break-all">
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
            Generate bcrypt Password Hashes Online
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            bcrypt is a password-hashing algorithm designed for storing passwords more safely than fast general-purpose hashes. It creates a salted hash and applies a configurable cost factor so each hashing operation requires deliberate computing work.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This bcrypt hash generator runs locally in your browser using bcryptjs. Enter a test password, choose the salt rounds, generate the hash, and copy it into a development or testing workflow.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Avoid entering a real production password into any online tool, even when processing happens locally. Use sample credentials when testing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the bcrypt Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the password or sample text you want to hash.</li>
            <li>Select the bcrypt cost factor, commonly called salt rounds.</li>
            <li>Click <strong>Generate bcrypt Hash</strong>.</li>
            <li>Copy the generated hash for development or testing.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            bcrypt Cost Factor and Salt Rounds
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The cost factor controls how much work bcrypt performs. Increasing it makes each hash slower to calculate, which can make large-scale password guessing more expensive. It also increases the time required by your own application, so the value should be tested on the hardware and environment where authentication will run.
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li><strong>8 rounds:</strong> Faster output for lightweight local testing.</li>
              <li><strong>10 rounds:</strong> A practical starting point for many test environments.</li>
              <li><strong>12 rounds:</strong> More computational work and slower generation.</li>
              <li><strong>14 rounds:</strong> Significantly slower and useful for performance comparison.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What a bcrypt Hash Contains
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A bcrypt hash normally includes the bcrypt version marker, cost factor, salt, and resulting hash data in one string. Because a fresh salt is generated each time, the same password can produce different bcrypt hashes.
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-all">
{`$2a$10$exampleSaltAndHashValue`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Uses
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating sample bcrypt hashes for backend development.</li>
            <li>Testing login and password-verification workflows.</li>
            <li>Comparing the performance of different cost factors.</li>
            <li>Preparing test fixtures for authentication systems.</li>
            <li>Learning how salted password hashing works.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            bcrypt Compared With Fast Hash Functions
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            General-purpose hash functions are designed to run quickly. That speed is useful for checksums and integrity checks, but it is not ideal for password storage. bcrypt is intentionally slower and includes a cost setting that can be increased as hardware becomes faster.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Applications should store only the bcrypt hash, not the original password. During login, the entered password is checked against the stored hash using a bcrypt verification function.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">What is bcrypt?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                bcrypt is a password-hashing algorithm that combines salting with a configurable cost factor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Can bcrypt hashes be decrypted?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. bcrypt is designed as a one-way password-hashing function. Password verification compares an entered password against the stored hash.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Why does the same password generate different hashes?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                bcrypt generates a random salt for each hash. The salt is stored inside the final bcrypt string, allowing verification without storing it separately.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">What bcrypt rounds should I choose?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Choose a cost that your application can calculate within an acceptable login time. Test it in the real deployment environment rather than relying on one universal value.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Does this tool upload passwords?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Hash generation runs in your browser. For safety, use sample passwords rather than real credentials.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Can I use the generated hash in my application?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                You can use it for development, testing, fixtures, and compatible bcrypt workflows. Production authentication should generate and verify hashes inside the trusted application environment.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/bcrypt-generator" />
        </div>
      </section>
    </ToolShell>
  );
}