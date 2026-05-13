"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encodeText = () => {
    try {
      setOutput(btoa(input));
      setError("");
    } catch {
      setError("Unable to encode text.");
    }
  };

  const decodeText = () => {
    try {
      setOutput(atob(input));
      setError("");
    } catch {
      setError("Invalid Base64 string.");
    }
  };

  return (
    <ToolShell
      title="Base64 Encoder Decoder"
      description="Encode and decode Base64 text instantly."
    >
      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste text or Base64 here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={encodeText}
          className="mt-4 yoryantra-btn"
        >
          Encode
        </button>

        <button
          onClick={decodeText}
          className="mt-4 yoryantra-btn"
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