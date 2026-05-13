"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encodeURL = () => {
    try {
      setOutput(encodeURIComponent(input));
      setError("");
    } catch {
      setError("Unable to encode URL.");
    }
  };

  const decodeURL = () => {
    try {
      setOutput(decodeURIComponent(input));
      setError("");
    } catch {
      setError("Invalid encoded URL.");
    }
  };

  return (
    <ToolShell
      title="URL Encoder Decoder"
      description="Encode and decode URLs instantly."
    >
      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste URL here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={encodeURL}
          className="px-5 py-2 bg-[var(--green)] text-white rounded-lg"
        >
          Encode
        </button>

        <button
          onClick={decodeURL}
          className="px-5 py-2 bg-[var(--green)] text-white rounded-lg"
        >
          Decode
        </button>
      </div>

      {error && (
        <p className="mt-4 text-red-500 font-medium">
          {error}
        </p>
      )}

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Output</h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output p-4 overflow-auto text-sm min-h-[150px]">
          {output || "Output will appear here..."}
        </pre>
      </div>
    </ToolShell>
  );
}