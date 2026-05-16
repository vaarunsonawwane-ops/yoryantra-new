"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertJSONToCSV = () => {
    try {
      const parsed = JSON.parse(input);
      const data = Array.isArray(parsed) ? parsed : [parsed];

      if (data.length === 0) {
        setError("JSON array is empty.");
        setOutput("");
        return;
      }

      const headers = Array.from(
        new Set(
          data.flatMap((item) =>
            typeof item === "object" && item !== null
              ? Object.keys(item)
              : []
          )
        )
      );

      if (headers.length === 0) {
        setError("JSON must contain an object or an array of objects.");
        setOutput("");
        return;
      }

      const escapeCSVValue = (value: unknown) => {
        if (value === null || value === undefined) return "";

        const stringValue =
          typeof value === "object"
            ? JSON.stringify(value)
            : String(value);

        return `"${stringValue.replace(/"/g, '""')}"`;
      };

      const rows = data.map((item) =>
        headers
          .map((header) =>
            escapeCSVValue(
              typeof item === "object" && item !== null
                ? (item as Record<string, unknown>)[header]
                : ""
            )
          )
          .join(",")
      );

      setOutput([headers.join(","), ...rows].join("\n"));
      setError("");
    } catch {
      setError("Invalid JSON. Please check your input and try again.");
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
      title="JSON to CSV Converter"
      description="Convert JSON data into CSV format instantly with this free online JSON to CSV Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder='Paste JSON here, for example: [{"name":"John","age":30}]'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertJSONToCSV} className="yoryantra-btn">
          Convert to CSV
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
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
            CSV Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Converted CSV output will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is JSON to CSV Converter?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON to CSV Converter helps you convert JSON data into CSV
            format instantly. It is useful when you need to move data from APIs,
            applications, or JSON files into spreadsheets, reports, databases,
            or data analysis tools.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CSV is widely supported by spreadsheet software like Excel and
            Google Sheets, while JSON is commonly used by APIs and web
            applications. This tool helps bridge both formats quickly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON to CSV Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JSON object or an array of JSON objects.</li>
            <li>Click <strong>Convert to CSV</strong>.</li>
            <li>Review the generated CSV output.</li>
            <li>Copy the CSV and use it in spreadsheets or data tools.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Converting API responses into spreadsheet-friendly data.</li>
            <li>Preparing JSON exports for Excel or Google Sheets.</li>
            <li>Transforming app data into CSV reports.</li>
            <li>Cleaning data for analysis or migration.</li>
            <li>Converting structured JSON records into table format.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">JSON input:</p>

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

            <p className="mt-4 font-medium text-gray-900">CSV output:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name,role
"Asha","Developer"
"Ravi","Designer"`}
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
                What is a JSON to CSV converter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A JSON to CSV converter transforms JSON objects or arrays into
                comma-separated values that can be opened in spreadsheet and
                data tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What JSON format works best?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An array of objects works best because each object becomes a row
                and each key becomes a CSV column.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool handle nested JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Basic nested values are converted into JSON strings inside CSV
                cells. For deeply nested data, flattening the JSON first may be
                better.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this JSON to CSV Converter secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Conversion happens directly in your browser. Your JSON data
                is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-minifier" className="yoryantra-btn-outline">
              JSON Minifier
            </Link>

            <Link href="/tools/csv-to-json" className="yoryantra-btn-outline">
              CSV to JSON Converter
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
