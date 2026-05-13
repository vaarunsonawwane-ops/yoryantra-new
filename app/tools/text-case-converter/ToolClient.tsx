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
        txt.substr(1).toLowerCase()
    );

    setOutput(result);
  };

  const toSentenceCase = () => {
    const result =
      input.charAt(0).toUpperCase() +
      input.slice(1).toLowerCase();

    setOutput(result);
  };

  return (
    <ToolShell
      title="Text Case Converter"
      description="Convert text into uppercase, lowercase, title case and sentence case instantly."
    >
      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={toUpperCase}
          className="px-4 py-2 bg-[var(--green)] text-white rounded-lg"
        >
          UPPERCASE
        </button>

        <button
          onClick={toLowerCase}
          className="px-4 py-2 bg-[var(--green)] text-white rounded-lg"
        >
          lowercase
        </button>

        <button
          onClick={toTitleCase}
          className="px-4 py-2 bg-[var(--green)] text-white rounded-lg"
        >
          Title Case
        </button>

        <button
          onClick={toSentenceCase}
          className="px-4 py-2 bg-[var(--green)] text-white rounded-lg"
        >
          Sentence case
        </button>
      </div>

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

        <pre className="p-4 yoryantra-output overflow-auto text-sm min-h-[150px]">
          {output || "Output will appear here..."}
        </pre>
      </div>
    </ToolShell>
  );
}