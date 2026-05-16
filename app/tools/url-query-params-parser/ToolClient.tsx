"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseQueryParams = () => {
    try {
      if (!input.trim()) {
        setError("Please enter a URL or query string.");
        setOutput("");
        return;
      }

      let query = input.trim();

      if (query.includes("?")) {
        query = query.split("?")[1];
      }

      const params = new URLSearchParams(query);
      const parsed: Record<string, string> = {};

      params.forEach((value, key) => {
        parsed[key] = value;
      });

      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Unable to parse query parameters.");
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
      title="URL Query Params Parser"
      description="Parse URL query parameters instantly with this free online URL Query Params Parser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          URL or Query String
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com?utm_source=google&utm_campaign=test"
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseQueryParams} className="yoryantra-btn">
          Parse Query Params
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
            Parsed Query Parameters
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
          {output || "Parsed query parameters will appear here..."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This URL Query Params Parser
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This URL Query Params Parser helps you extract query parameters from
            URLs and convert them into readable JSON. It is useful for debugging
            tracking links, API requests, UTM URLs, search URLs, and web
            application routes.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Query parameters are commonly used to pass data in URLs. This tool
            makes long URLs easier to inspect and debug.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Parsing UTM tracking links.</li>
            <li>Debugging API query strings.</li>
            <li>Inspecting search URL parameters.</li>
            <li>Converting query strings into JSON.</li>
            <li>Checking marketing campaign links.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/utm-builder" className="yoryantra-btn-outline">
              UTM Builder
            </Link>

            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
              CURL Command Builder
            </Link>

            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">
              HTTP Headers Parser
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}