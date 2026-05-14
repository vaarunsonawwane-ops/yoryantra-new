"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const toUpperCase = () => {
    setOutput(input.toUpperCase());
  };

  const toLowerCase = () => {
    setOutput(input.toLowerCase());
  };

  const toTitleCase = () => {
    const result = input.replace(
      /\w\S*/g,
      (txt) =>
        txt.charAt(0).toUpperCase() +
        txt.slice(1).toLowerCase()
    );

    setOutput(result);
  };

  const toSentenceCase = () => {
    const result =
      input.charAt(0).toUpperCase() +
      input.slice(1).toLowerCase();

    setOutput(result);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="Text Case Converter"
      description="Convert text into uppercase, lowercase, title case, and sentence case instantly with this free online Text Case Converter."
    >

      {/* INPUT */}
      <div>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">

        <button
          onClick={toUpperCase}
          className="yoryantra-btn"
        >
          UPPERCASE
        </button>

        <button
          onClick={toLowerCase}
          className="yoryantra-btn-outline"
        >
          lowercase
        </button>

        <button
          onClick={toTitleCase}
          className="yoryantra-btn-outline"
        >
          Title Case
        </button>

        <button
          onClick={toSentenceCase}
          className="yoryantra-btn-outline"
        >
          Sentence case
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>

      </div>

      {/* OUTPUT */}
      <div className="mt-8">

        <div className="flex items-center justify-between mb-3">

          <h3 className="text-lg font-semibold text-gray-900">
            Converted Output
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
          {output || "Converted text will appear here..."}
        </pre>

      </div>

      {/* SEO CONTENT */}
      <div className="mt-10 border-t border-gray-200 pt-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          About This Text Case Converter
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          This free online Text Case Converter helps you instantly
          transform text into uppercase, lowercase, title case,
          and sentence case formats. Useful for writing, editing,
          formatting, productivity, SEO workflows, and content creation.
        </p>

      </div>

    </ToolShell>
  );
}