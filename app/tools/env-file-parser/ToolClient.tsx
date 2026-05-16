"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseEnv = () => {
    try {
      if (!input.trim()) {
        setError("Please enter .env content.");
        setOutput("");
        return;
      }

      const parsed: Record<string, string> = {};

      input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .forEach((line) => {
          const index = line.indexOf("=");

          if (index === -1) return;

          const key = line.slice(0, index).trim();
          const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");

          parsed[key] = value;
        });

      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Unable to parse .env file.");
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
      title=".env File Parser"
      description="Parse and format .env files instantly with this free online .env File Parser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          .env Content
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`DATABASE_URL=postgres://localhost:5432/app
API_KEY=your_secret_key`}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseEnv} className="yoryantra-btn">
          Parse .env
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
            Parsed Output
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

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Parsed .env output will appear here..."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This .env File Parser
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This .env File Parser helps developers parse environment variable
            files into readable JSON format. It is useful for debugging backend
            configuration, local development setups, deployment variables, and
            application secrets.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Environment files are commonly used in Node.js, Next.js, Docker,
            Laravel, Python, and cloud deployment workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Parsing local .env files.</li>
            <li>Debugging environment variables.</li>
            <li>Checking deployment configuration.</li>
            <li>Converting environment variables into JSON.</li>
            <li>Reviewing backend application settings.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">
              Docker Compose Validator
            </Link>

            <Link href="/tools/api-key-generator" className="yoryantra-btn-outline">
              API Key Generator
            </Link>

            <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
              CURL Command Builder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}