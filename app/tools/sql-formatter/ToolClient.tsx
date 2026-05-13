"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatSQL = () => {
    let formatted = input
      .replace(/select/gi, "\nSELECT")
      .replace(/from/gi, "\nFROM")
      .replace(/where/gi, "\nWHERE")
      .replace(/and/gi, "\nAND")
      .replace(/order by/gi, "\nORDER BY")
      .replace(/group by/gi, "\nGROUP BY");

    setOutput(formatted.trim());
  };

  return (
    <ToolShell
      title="SQL Formatter"
      description="Format SQL queries instantly."
    >
      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste SQL query here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={formatSQL}
        className="mt-4 px-5 py-2 bg-[var(--green)] text-white rounded-lg"
      >
        Format SQL
      </button>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Output</h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="text-sm px-3 py-1 border rounded"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output p-4 overflow-auto text-sm min-h-[150px]">
          {output || "Formatted SQL will appear here..."}
        </pre>
      </div>
    </ToolShell>
  );
}