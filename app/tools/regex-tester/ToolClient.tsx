"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const testRegex = () => {
    try {
      const regex = new RegExp(pattern, "g");

      const matches = text.match(regex);

      setResult(
        matches
          ? JSON.stringify(matches, null, 2)
          : "No matches found"
      );
    } catch {
      setResult("Invalid regex pattern");
    }
  };

  return (
    <ToolShell
      title="Regex Tester"
      description="Test regular expressions instantly."
    >
      <input
        type="text"
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        placeholder="Enter regex pattern..."
        className="w-full border p-4 rounded-lg mb-4"
      />

      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste test text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={testRegex}
        className="mt-4 px-5 py-2 bg-[var(--green)] text-white rounded-lg"
      >
        Test Regex
      </button>

      <pre className="yoryantra-output p-4 mt-6 overflow-auto text-sm min-h-[150px]">
        {result || "Matches will appear here..."}
      </pre>
    </ToolShell>
  );
}