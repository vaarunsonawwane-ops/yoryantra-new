"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [timestamp, setTimestamp] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertTimestamp = () => {
    try {
      const date = new Date(Number(timestamp) * 1000);

      if (isNaN(date.getTime())) {
        setError("Invalid Unix timestamp.");
        setOutput("");
        return;
      }

      setOutput(date.toUTCString());
      setError("");
    } catch {
      setError("Invalid Unix timestamp.");
      setOutput("");
    }
  };

  const currentTimestamp = () => {
    setTimestamp(
      Math.floor(Date.now() / 1000).toString()
    );

    setError("");
  };

  const resetAll = () => {
    setTimestamp("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Timestamp Converter"
      description="Convert Unix timestamps into readable dates instantly with this free online Unix Timestamp Converter."
    >

      {/* INPUT */}
      <div>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Unix Timestamp
        </label>

        <input
          type="text"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          placeholder="Enter Unix timestamp..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">

        <button
          onClick={convertTimestamp}
          className="yoryantra-btn"
        >
          Convert
        </button>

        <button
          onClick={currentTimestamp}
          className="yoryantra-btn-outline"
        >
          Current Timestamp
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
            Converted Date
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

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output || "Converted date and time will appear here..."}
        </div>

      </div>

      {/* SEO CONTENT */}
      <div className="mt-10 border-t border-gray-200 pt-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          About This Timestamp Converter
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          This free online Unix Timestamp Converter helps you quickly
          transform epoch timestamps into readable UTC date and time
          formats. Useful for APIs, databases, server logs, debugging,
          and development workflows involving Unix time values.
        </p>

      </div>

    </ToolShell>
  );
}