"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);

      setOutput(formatted);
      setError("");
    } catch (err: any) {
      setError("Invalid JSON format");
      setOutput("");
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert("Copied to clipboard!");
  };

  return (
  <>
    <a
      href="/tools"
      className="inline-block mb-6 text-sm text-[var(--green)] hover:underline"
    >
      ← Back to Tools
    </a>

    <ToolShell
      title="JSON Formatter"
      description="Format, validate and beautify JSON instantly."
    >
      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste JSON here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={formatJSON}
        className="mt-4 px-6 py-2 bg-[var(--green)] text-white rounded-lg"
      >
        Format JSON
      </button>

      {error && (
        <p className="mt-4 text-red-500 font-medium">{error}</p>
      )}

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Output</h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="p-4 bg-gray-50 border rounded-lg overflow-auto text-sm min-h-[150px]">
          {output || "Output will appear here..."}
        </pre>
      </div>
    </ToolShell>
  </>
);