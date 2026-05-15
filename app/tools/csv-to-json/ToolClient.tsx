"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertCSVToJSON = () => {
    try {
      const lines = input.trim().split("\n");

      if (lines.length < 2) {
        setError("CSV must contain headers and at least one row.");
        setOutput("");
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((header) => header.trim());

      const result = lines.slice(1).map((line) => {
        const values = line.split(",");

        return headers.reduce(
          (obj, header, index) => ({
            ...obj,
            [header]: values[index]?.trim() || "",
          }),
          {}
        );
      });

      setOutput(JSON.stringify(result, null, 2));
      setError("");
    } catch {
      setError("Invalid CSV input.");
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
      title="CSV to JSON Converter"
      description="Convert CSV data into JSON format instantly with this free online CSV to JSON Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          CSV Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder={`name,role
Asha,Developer
Ravi,Designer`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertCSVToJSON}
          className="yoryantra-btn"
        >
          Convert to JSON
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            JSON Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Converted JSON output will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This CSV to JSON Converter
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CSV to JSON Converter helps you transform CSV data into
            structured JSON format instantly. It is useful for APIs,
            applications, databases, spreadsheets, and data migration
            workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CSV is commonly used for spreadsheets and exported reports,
            while JSON is widely used in APIs and modern applications.
            This tool helps convert between both formats quickly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CSV to JSON Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste CSV data into the input field.</li>
            <li>Ensure the first row contains column headers.</li>
            <li>Click <strong>Convert to JSON</strong>.</li>
            <li>Copy the generated JSON output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Converting spreadsheet data into JSON.</li>
            <li>Preparing CSV exports for APIs.</li>
            <li>Migrating tabular data into applications.</li>
            <li>Working with structured records in development.</li>
            <li>Transforming CSV reports into JSON arrays.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              CSV input:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name,role
Asha,Developer
Ravi,Designer`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              JSON output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`[
  {
    "name": "Asha",
    "role": "Developer"
  },
  {
    "name": "Ravi",
    "role": "Designer"
  }
]`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a CSV to JSON converter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A CSV to JSON converter transforms comma-separated values
                into structured JSON objects or arrays.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does the first CSV row need headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The first row is used as JSON object keys.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this CSV to JSON Converter secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Conversion happens directly in your browser.
                Your CSV data is not uploaded anywhere.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-to-csv" className="yoryantra-btn-outline">
              JSON to CSV Converter
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-minifier" className="yoryantra-btn-outline">
              JSON Minifier
            </Link>

            <Link href="/tools/sql-formatter" className="yoryantra-btn-outline">
              SQL Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}