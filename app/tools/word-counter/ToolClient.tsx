"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [text, setText] = useState("");

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const characters = text.length;

  const sentences = text.trim()
    ? text.split(/[.!?]+/).filter(Boolean).length
    : 0;

  const readingTime = Math.max(
    1,
    Math.ceil(words / 200)
  );

  const resetAll = () => {
    setText("");
  };

  return (
    <ToolShell
      title="Word Counter"
      description="Count words, characters, sentences, and reading time instantly with this free online Word Counter."
    >

      {/* INPUT */}
      <div>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste or type text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>

      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">

        <div className="yoryantra-output p-5 text-center">
          <h3 className="text-sm font-medium text-gray-600">
            Words
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {words}
          </p>
        </div>

        <div className="yoryantra-output p-5 text-center">
          <h3 className="text-sm font-medium text-gray-600">
            Characters
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {characters}
          </p>
        </div>

        <div className="yoryantra-output p-5 text-center">
          <h3 className="text-sm font-medium text-gray-600">
            Sentences
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {sentences}
          </p>
        </div>

        <div className="yoryantra-output p-5 text-center">
          <h3 className="text-sm font-medium text-gray-600">
            Reading Time
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {readingTime} min
          </p>
        </div>

      </div>

      {/* SEO CONTENT */}
      <div className="mt-10 border-t border-gray-200 pt-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          About This Word Counter
        </h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          This free online Word Counter helps you instantly calculate
          word count, character count, sentence count, and estimated
          reading time. Useful for writing, blogging, SEO content,
          academic work, productivity, and content optimization tasks.
        </p>

      </div>

    </ToolShell>
  );
}