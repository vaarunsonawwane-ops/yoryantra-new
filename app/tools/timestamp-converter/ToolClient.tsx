"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [timestamp, setTimestamp] = useState("");
  const [output, setOutput] = useState("");

  const convertTimestamp = () => {
    try {
      const date = new Date(Number(timestamp) * 1000);

      if (isNaN(date.getTime())) {
        setOutput("Invalid timestamp");
        return;
      }

      setOutput(date.toUTCString());
    } catch {
      setOutput("Invalid timestamp");
    }
  };

  const currentTimestamp = () => {
    setTimestamp(Math.floor(Date.now() / 1000).toString());
  };

  return (
    <ToolShell
      title="Timestamp Converter"
      description="Convert Unix timestamps into readable dates instantly."
    >
      <input
        type="text"
        value={timestamp}
        onChange={(e) => setTimestamp(e.target.value)}
        placeholder="Enter Unix timestamp..."
        className="w-full border p-4 rounded-lg"
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={convertTimestamp}
          className="px-5 py-2 bg-[var(--green)] text-white rounded-lg"
        >
          Convert
        </button>

        <button
          onClick={currentTimestamp}
          className="px-5 py-2 border rounded-lg"
        >
          Current Timestamp
        </button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">
          Output
        </h3>

        <div className="yoryantra-output p-4 rounded-lg border min-h-[100px]">
          {output || "Converted date will appear here..."}
        </div>
      </div>
    </ToolShell>
  );
}