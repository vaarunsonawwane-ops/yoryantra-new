"use client";

import { useState } from "react";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);

      setOutput(formatted);
      setError("");
    } catch (err: any) {
      setOutput("");
      setError("Invalid JSON: " + err.message);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);

      setOutput(minified);
      setError("");
    } catch (err: any) {
      setOutput("");
      setError("Invalid JSON: " + err.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[var(--dark)] mb-6">
        JSON Formatter
      </h1>

      <p className="text-gray-600 mb-8">
        Paste your JSON below to format or validate it instantly.
      </p>

      {/* INPUT */}
      <textarea
        className="w-full h-64 p-4 border rounded-xl font-mono text-sm"
        placeholder="Paste JSON here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* BUTTONS */}
      <div className="flex gap-4 mt-6 flex-wrap">
        <button
          onClick={formatJson}
          className="px-6 py-3 rounded-lg text-white"
          style={{ backgroundColor: "var(--green)" }}
        >
          Format JSON
        </button>

        <button
          onClick={minifyJson}
          className="px-6 py-3 rounded-lg border"
          style={{ borderColor: "var(--green)", color: "var(--green)" }}
        >
          Minify JSON
        </button>

        <button
          onClick={copyToClipboard}
          className="px-6 py-3 rounded-lg bg-gray-100"
        >
          Copy Output
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 text-red-600 font-medium">{error}</div>
      )}

      {/* OUTPUT */}
      {output && (
        <pre className="mt-6 p-4 bg-gray-50 border rounded-xl overflow-auto text-sm">
          {output}
        </pre>
      )}
    </div>
  );
}