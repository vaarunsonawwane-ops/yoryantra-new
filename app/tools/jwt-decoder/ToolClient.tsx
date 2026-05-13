"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [token, setToken] = useState("");
  const [output, setOutput] = useState("");

  const decodeJWT = () => {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        setOutput("Invalid JWT token");
        return;
      }

      const payload = JSON.parse(
        atob(parts[1])
      );

      setOutput(
        JSON.stringify(payload, null, 2)
      );
    } catch {
      setOutput("Unable to decode token");
    }
  };

  return (
    <ToolShell
      title="JWT Decoder"
      description="Decode JWT tokens instantly."
    >
      <textarea
        className="w-full h-60 border p-4 rounded-lg"
        placeholder="Paste JWT token here..."
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      <button
        onClick={decodeJWT}
        className="mt-4 px-5 py-2 bg-[var(--green)] text-white rounded-lg"
      >
        Decode JWT
      </button>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Payload</h3>

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
          {output || "Decoded payload will appear here..."}
        </pre>
      </div>
    </ToolShell>
  );
}