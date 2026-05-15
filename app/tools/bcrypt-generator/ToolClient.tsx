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
      <div className="space-y-8">

        {/* INPUT */}
        <div className="grid gap-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Password
            </label>

            <textarea
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="min-h-[120px] w-full rounded-2xl border border-gray-200 p-4 outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Salt Rounds
            </label>

            <select
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-400"
            >
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={14}>14</option>
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

        </div>

        {/* OUTPUT */}
        {hash && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

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

        {/* SEO CONTENT */}
        <section className="prose prose-gray max-w-none">

          <h2>What is bcrypt?</h2>

          <p>
            bcrypt is a secure password hashing algorithm commonly used for
            storing passwords safely in web applications and backend systems.
            It helps protect user credentials even if a database is exposed.
          </p>

          <h2>How does this bcrypt generator work?</h2>

          <p>
            Enter a password and choose the number of salt rounds to instantly
            generate a bcrypt hash online. Higher salt rounds increase security
            but require more processing time.
          </p>

          <h2>Why use bcrypt instead of plain hashing?</h2>

          <p>
            bcrypt is designed specifically for password security. Unlike simple
            hashing algorithms, bcrypt automatically includes salting and is
            intentionally slow to resist brute-force attacks.
          </p>

          <h2>FAQs</h2>

          <h3>What are salt rounds in bcrypt?</h3>

          <p>
            Salt rounds control the computational cost of generating the hash.
            Higher rounds improve security but make hashing slower.
          </p>

          <h3>Is bcrypt secure for production use?</h3>

          <p>
            Yes. bcrypt is widely used in production applications for securely
            storing passwords and authentication credentials.
          </p>

          <h3>Can bcrypt hashes be reversed?</h3>

          <p>
            No. bcrypt is a one-way hashing algorithm, meaning the original
            password cannot be directly recovered from the hash.
          </p>

          <h2>Related tools</h2>

          <ul>

            <li>
              <Link href="/tools/api-key-generator">
                API Key Generator
              </Link>
            </li>

            <li>
              <Link href="/tools/jwt-decoder">
                JWT Decoder
              </Link>
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