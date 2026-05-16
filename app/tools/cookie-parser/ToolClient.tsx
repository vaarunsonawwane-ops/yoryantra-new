"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseCookies = () => {
    try {
      if (!input.trim()) {
        setError("Please enter cookie header content.");
        setOutput("");
        return;
      }

      const parsed: Record<string, string> = {};

      input.split(";").forEach((cookie) => {
        const index = cookie.indexOf("=");

        if (index === -1) return;

        const key = cookie.slice(0, index).trim();
        const value = cookie.slice(index + 1).trim();

        parsed[key] = decodeURIComponent(value);
      });

      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Unable to parse cookie header.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Cookie Parser"
      description="Parse HTTP cookies into readable key-value pairs instantly with this free online Cookie Parser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Cookie Header
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="session_id=abc123; theme=dark; user_id=42"
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseCookies} className="yoryantra-btn">
          Parse Cookies
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed Cookies
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[200px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Parsed cookie output will appear here..."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This Cookie Parser
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Cookie Parser helps you parse HTTP cookie headers into readable
            key-value pairs. It is useful for developers debugging sessions,
            authentication, browser storage, tracking cookies, and API requests.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Cookie headers can become difficult to read when multiple values are
            stored together. This tool converts them into structured JSON for
            easier inspection.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging authentication cookies.</li>
            <li>Parsing browser cookie headers.</li>
            <li>Inspecting session values.</li>
            <li>Analyzing request headers.</li>
            <li>Formatting cookies into JSON.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">
              HTTP Headers Parser
            </Link>

            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/cors-header-checker" className="yoryantra-btn-outline">
              CORS Header Checker
            </Link>

            <Link href="/tools/user-agent-parser" className="yoryantra-btn-outline">
              User Agent Parser
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}