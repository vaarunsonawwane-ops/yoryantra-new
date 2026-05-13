"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [text, setText] = useState("");

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const characters = text.length;

  const readingTime = Math.ceil(words / 200);

  return (
    <ToolShell
      title="Word Counter"
      description="Count words, characters and reading time instantly."
    >
      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="yoryantra-output p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">
            Words
          </h3>

          <p className="text-2xl font-bold">
            {words}
          </p>
        </div>

        <div className="yoryantra-output p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">
            Characters
          </h3>

          <p className="text-2xl font-bold">
            {characters}
          </p>
        </div>

        <div className="yoryantra-output p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">
            Reading Time
          </h3>

          <p className="text-2xl font-bold">
            {readingTime} min
          </p>
        </div>
      </div>
    </ToolShell>
  );
}