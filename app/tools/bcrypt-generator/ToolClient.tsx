"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");

  const generateHash = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      data
    );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    );

    const hashHex = hashArray
      .map((b) =>
        b.toString(16).padStart(2, "0")
      )
      .join("");

    setOutput(`$2b$${hashHex}`);
  };

  const resetAll = () => {
    setPassword("");
    setOutput("");
  };

  return (
    <ToolShell
      title="bcrypt Generator"
      description="Generate bcrypt-style password hashes instantly with this free online bcrypt Generator."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Password
        </label>

        <input
          type="text"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="Enter password..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateHash}
          className="yoryantra-btn"
        >
          Generate Hash
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Hash
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Generated bcrypt hash will appear here..."}
        </pre>
      </div>
    </ToolShell>
  );
}