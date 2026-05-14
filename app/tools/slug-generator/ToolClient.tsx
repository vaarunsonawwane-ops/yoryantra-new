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

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="Slug Generator"
      description="Generate clean SEO-friendly URL slugs instantly with this free online Slug Generator."
    >

      {/* INPUT */}
      <div>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full h-56 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Enter title or text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">

        <button
          onClick={generateSlug}
          className="yoryantra-btn"
        >
          Generate Slug
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
            Generated Slug
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[140px] whitespace-pre-wrap break-words">
          {output || "Generated SEO-friendly slug will appear here..."}
        </pre>

      </div>

      {/* SEO CONTENT */}
      <div className="mt-10 border-t border-gray-200 pt-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          About This Slug Generator
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          This free online Slug Generator helps you convert titles and
          text into clean SEO-friendly URL slugs. Generate readable,
          optimized, and web-safe URLs for blogs, pages, articles,
          products, and content management workflows.
        </p>

      </div>

    </ToolShell>
  );
}