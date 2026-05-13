"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const generateSlug = () => {
    const slug = input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setOutput(slug);
  };

  return (
    <ToolShell
      title="Slug Generator"
      description="Convert text into clean SEO-friendly URLs instantly."
    >
      <textarea
        className="w-full h-52 border p-4 rounded-lg"
        placeholder="Enter title or text..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={generateSlug}
        className="mt-4 px-6 py-2 bg-[var(--green)] text-white rounded-lg"
      >
        Generate Slug
      </button>

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

        <pre className="p-4 bg-gray-50 border rounded-lg overflow-auto text-sm min-h-[120px]">
          {output || "Generated slug will appear here..."}
        </pre>
      </div>
    </ToolShell>
  );
}