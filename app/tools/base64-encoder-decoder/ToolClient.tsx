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

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Base64 Encoder Decoder"
      description="Encode and decode Base64 text instantly with this free online Base64 utility."
    >

      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste text or Base64 content here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">

        <button
          onClick={encodeText}
          className="yoryantra-btn"
        >
          Encode
        </button>

        <button
          onClick={decodeText}
          className="yoryantra-btn-outline"
        >
          Decode
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">

        <div className="flex items-center justify-between mb-3">

          <h3 className="text-lg font-semibold text-gray-900">
            Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Encoded or decoded output will appear here..."}
        </pre>

      </div>

      {/* SEO CONTENT */}
      <div className="mt-10 border-t border-gray-200 pt-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          About This Base64 Encoder Decoder
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          This free online Base64 encoder and decoder helps you quickly
          convert plain text into Base64 format and decode Base64 strings
          back into readable text. Useful for developers, APIs, authentication
          workflows, data transfer, and debugging encoded content.
        </p>

      </div>

    </ToolShell>
  );
}