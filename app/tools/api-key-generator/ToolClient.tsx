"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [length, setLength] = useState(32);
  const [output, setOutput] = useState("");

  const generateAPIKey = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    setOutput(result);
  };

  const resetAll = () => {
    setLength(32);
    setOutput("");
  };

  return (
    <ToolShell
      title="API Key Generator"
      description="Generate random API keys and secret tokens instantly with this free online API Key Generator."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Key Length
        </label>

        <input
          type="number"
          min={8}
          max={128}
          value={length}
          onChange={(e) =>
            setLength(Number(e.target.value))
          }
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateAPIKey}
          className="yoryantra-btn"
        >
          Generate API Key
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
            Generated API Key
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
          {output || "Generated API key will appear here..."}
        </pre>
      </div>
    </ToolShell>
  );
}