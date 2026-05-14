"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const testRegex = () => {
    try {
      const regex = new RegExp(pattern, "g");

      const matches = text.match(regex);

      setResult(
        matches
          ? JSON.stringify(matches, null, 2)
          : "No matches found."
      );

      setError("");
    } catch {
      setError("Invalid regex pattern.");
      setResult("");
    }
  };

  const resetAll = () => {
    setPattern("");
    setText("");
    setResult("");
    setError("");
  };

  return (
    <ToolShell
      title="Regex Tester"
      description="Test, validate, and debug regular expressions instantly with this free online Regex Tester."
    >

      {/* REGEX PATTERN */}
      <div>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Regex Pattern
        </label>

        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Enter regex pattern..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

      </div>

      {/* TEST TEXT */}
      <div className="mt-6">

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Test Text
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste or type test text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">

        <button
          onClick={testRegex}
          className="yoryantra-btn"
        >
          Test Regex
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
            Match Results
          </h3>

          {result && result !== "No matches found." && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(result)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}

        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {result || "Regex match results will appear here..."}
        </pre>

      </div>

      {/* SEO CONTENT */}
      <div className="mt-10 border-t border-gray-200 pt-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          About This Regex Tester
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          This free online Regex Tester helps you validate and debug
          regular expressions instantly. Test regex patterns, inspect
          matches, troubleshoot text processing workflows, and improve
          pattern accuracy for development and automation tasks.
        </p>

      </div>

    </ToolShell>
  );
}