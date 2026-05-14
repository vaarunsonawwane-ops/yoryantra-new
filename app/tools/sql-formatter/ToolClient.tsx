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
      .replace(/or/gi, "\nOR")
      .replace(/order by/gi, "\nORDER BY")
      .replace(/group by/gi, "\nGROUP BY")
      .replace(/inner join/gi, "\nINNER JOIN")
      .replace(/left join/gi, "\nLEFT JOIN")
      .replace(/right join/gi, "\nRIGHT JOIN")
      .replace(/limit/gi, "\nLIMIT");

    setOutput(formatted.trim());
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="SQL Formatter"
      description="Format and beautify SQL queries instantly with this free online SQL Formatter."
    >

      {/* INPUT */}
      <div>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          SQL Query
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste SQL query here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">

        <button
          onClick={formatSQL}
          className="yoryantra-btn"
        >
          Format SQL
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
            Formatted Output
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
          {output || "Formatted SQL query will appear here..."}
        </pre>

      </div>

      {/* SEO CONTENT */}
      <div className="mt-10 border-t border-gray-200 pt-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          About This SQL Formatter
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          This free online SQL Formatter helps developers beautify and
          structure SQL queries for better readability and debugging.
          Format SELECT queries, JOIN statements, filtering clauses,
          and database commands instantly in a clean and readable layout.
        </p>

      </div>

    </ToolShell>
  );
}