"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

const MAX_BCRYPT_BYTES = 72;
const DEFAULT_COST = 10;

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function readBcryptMetadata(hash: string): { version: string; cost: number } | null {
  const match = /^\$(2[aby])\$(\d{2})\$/.exec(hash);
  if (!match) return null;
  return {
    version: match[1],
    cost: Number(match[2]),
  };
}

export default function ToolClient() {
  const [password, setPassword] = useState("");
  const [cost, setCost] = useState(DEFAULT_COST);
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const byteLength = utf8ByteLength(password);
  const metadata = hash ? readBcryptMetadata(hash) : null;

  const generateHash = async () => {
    if (!password.length) {
      setError("Enter a sample password or text value to hash.");
      setHash("");
      return;
    }

    if (!Number.isInteger(cost) || cost < 8 || cost > 14) {
      setError("Choose a bcrypt cost factor from 8 to 14.");
      setHash("");
      return;
    }

    if (byteLength > MAX_BCRYPT_BYTES) {
      setError(
        `bcrypt uses only the first ${MAX_BCRYPT_BYTES} password bytes in common implementations. This UTF-8 input is ${byteLength} bytes, so it is blocked instead of being silently truncated.`
      );
      setHash("");
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const result = await bcrypt.hash(password, cost);
      setHash(result);
    } catch {
      setError("Unable to generate the bcrypt hash in this browser.");
      setHash("");
    } finally {
      setLoading(false);
    }
  };

  const copyHash = async () => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the generated hash and copy it manually.");
    }
  };

  const resetAll = () => {
    setPassword("");
    setCost(DEFAULT_COST);
    setHash("");
    setError("");
    setLoading(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="bcrypt Generator"
      description="Create salted bcrypt hashes while checking UTF-8 byte length and a selectable cost factor."
    >
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="block text-sm font-medium text-gray-700">
            Sample Password
          </label>
          <span className={`text-xs ${byteLength > MAX_BCRYPT_BYTES ? "text-red-700" : "text-gray-500"}`}>
            {byteLength}/{MAX_BCRYPT_BYTES} UTF-8 bytes
          </span>
        </div>

        <textarea
          value={password}
          autoComplete="off"
          spellCheck={false}
          onChange={(event: { target: { value: string } }) =>
            setPassword(event.target.value)
          }
          placeholder="Enter a sample password..."
          className="min-h-[120px] w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5">
        <YoryantraSelect
          label="Cost Factor"
          value={String(cost)}
          onChange={(value: string) => setCost(Number(value))}
          options={[
            { label: "8 — local speed comparison", value: "8" },
            { label: "10 — OWASP legacy minimum", value: "10" },
            { label: "11 — more work", value: "11" },
            { label: "12 — slower", value: "12" },
            { label: "13 — substantially slower", value: "13" },
            { label: "14 — heavy browser workload", value: "14" },
          ]}
        />
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          bcrypt performs roughly 2<sup>cost</sup> key-setup work. A higher
          value slows both legitimate verification and password guessing.
        </p>
      </div>

      {cost < 10 && (
        <div className="mt-5 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Testing-only cost:</strong> current OWASP password-storage
          guidance lists a bcrypt work factor of at least 10 for legacy systems.
          Cost 8 is kept here only for local performance comparison.
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateHash}
          disabled={loading}
          className="yoryantra-btn min-h-11 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate bcrypt Hash"}
        </button>
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-11 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated bcrypt Hash
          </h3>
          {hash && (
            <button
              onClick={copyHash}
              className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[145px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {hash || "Generated bcrypt hash will appear here."}
        </pre>

        {metadata && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              Version marker: <strong className="text-gray-900">${metadata.version}$</strong>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              Encoded cost: <strong className="text-gray-900">{metadata.cost}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Local processing</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Hashing runs in your browser with <code>bcryptjs</code>. Yoryantra does
          not receive the password or resulting hash. Clipboard utilities,
          extensions, local monitoring, and the device itself remain outside
          that browser-local privacy boundary.
        </p>
      </div>

      <div className="mt-5 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">
          bcrypt is mainly a compatibility choice in 2026
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-900">
          OWASP currently recommends Argon2id first, then scrypt when Argon2id
          is unavailable. bcrypt remains relevant for legacy systems and
          existing password databases. Use sample values here; production
          password hashing belongs in the trusted authentication environment.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What changes when the cost factor changes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            bcrypt stores its cost inside the final hash string. Raising that
            value makes each password guess more expensive, but it also slows
            every legitimate login. The right production value is therefore a
            performance decision measured on the real authentication hardware,
            not a number copied from a browser benchmark.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The options here stop at 14 because browser-side JavaScript can take
            a noticeable amount of time at higher costs. That UI limit is not a
            bcrypt format limit.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why 72 bytes matters more than 72 characters
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Common bcrypt implementations only consume the first 72 password
            bytes. ASCII usually uses one UTF-8 byte per character, while many
            other characters use two, three, or four. A visually short Unicode
            password can therefore reach the bcrypt limit sooner than its
            character count suggests.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This page blocks longer UTF-8 input rather than hashing a truncated
            prefix. That makes the limitation visible instead of creating two
            different-looking passwords that could feed bcrypt the same first
            72 bytes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Salt, cost and hash travel together
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A bcrypt string contains a version marker, two-digit cost, salt, and
            hash data. A fresh random salt means the same password normally
            produces a different stored string each time. Verification reads
            the parameters from that stored value and recalculates bcrypt with
            the candidate password.
          </p>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-all">$2b$10$...salt-and-hash-data...</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where browser-generated hashes fit
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Preparing fixtures for authentication tests.</li>
            <li>Checking whether another bcrypt implementation accepts a stored hash format.</li>
            <li>Comparing cost-factor latency on the current browser and device.</li>
            <li>Learning how a bcrypt record carries its version, cost, salt, and result.</li>
          </ul>
          <p className="mt-4 leading-relaxed text-gray-600">
            It is not a replacement for server-side password enrollment,
            rate-limited verification, breached-password screening, account
            recovery, or secret-management controls.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Current password-storage guidance
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            OWASP&apos;s current Password Storage Cheat Sheet places bcrypt behind
            Argon2id and scrypt for new designs, while still documenting bcrypt
            for legacy systems with a work factor of 10 or more and the 72-byte
            input limit.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Reference:{" "}
            <a
              href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              OWASP Password Storage Cheat Sheet
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/bcrypt-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
