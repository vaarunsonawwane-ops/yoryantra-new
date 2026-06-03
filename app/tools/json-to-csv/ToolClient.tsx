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

      const data = Array.isArray(parsed)
        ? parsed
        : [parsed];

      if (data.length === 0) {
        setError("JSON array is empty.");
        setOutput("");
        return;
      }

      const headers = Array.from(
        new Set(
          data.flatMap((item) =>
            typeof item === "object" &&
            item !== null
              ? Object.keys(item)
              : []
          )
        )
      );

      if (headers.length === 0) {
        setError(
          "JSON must contain an object or an array of objects."
        );

        setOutput("");
        return;
      }

      const escapeCSVValue = (
        value: unknown
      ) => {
        if (
          value === null ||
          value === undefined
        ) {
          return "";
        }

        const stringValue =
          typeof value === "object"
            ? JSON.stringify(value)
            : String(value);

        return `"${stringValue.replace(
          /"/g,
          '""'
        )}"`;
      };

      const rows = data.map((item) =>
        headers
          .map((header) =>
            escapeCSVValue(
              typeof item === "object" &&
                item !== null
                ? (
                    item as Record<
                      string,
                      unknown
                    >
                  )[header]
                : ""
            )
          )
          .join(",")
      );

      setOutput(
        [headers.join(","), ...rows].join(
          "\n"
        )
      );

      setError("");
    } catch {
      setError(
        "Invalid JSON. Please check your input and try again."
      );

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
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder='Paste JSON here, for example: [{"name":"John","age":30}]'
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertJSONToCSV}
          className="yoryantra-btn"
        >
          Convert to CSV
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            CSV Output
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  output
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output ||
            "Converted CSV output will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JSON to CSV conversion happens locally inside your browser. Your data
          is not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Turning JSON Data Into CSV Rows
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON to CSV conversion helps transform structured API data into a
            spreadsheet-friendly format that can be opened inside Excel, Google
            Sheets, analytics platforms, reporting systems, and database tools.
            JSON is commonly used by APIs and applications, while CSV is widely
            used for tables, exports, reporting, and data analysis workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw JSON responses are often difficult to analyze visually because
            the data is nested inside objects and arrays. This JSON to CSV
            Converter helps flatten structured records into readable CSV rows
            and columns instantly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for API exports, analytics workflows, reporting,
            spreadsheet imports, database migration, structured data cleanup,
            and business reporting directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON to CSV Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste a JSON object or array into the editor.
            </li>

            <li>
              Click <strong>Convert to CSV</strong>.
            </li>

            <li>
              Review the generated CSV rows and columns.
            </li>

            <li>
              Copy the CSV output into spreadsheets or reporting tools.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Converting API responses into spreadsheet-ready data.
            </li>

            <li>
              Preparing JSON exports for Excel or Google Sheets.
            </li>

            <li>
              Transforming structured records into CSV tables.
            </li>

            <li>
              Cleaning application data for analytics workflows.
            </li>

            <li>
              Exporting JSON datasets for reporting systems.
            </li>

            <li>
              Preparing structured data for database imports.
            </li>

            <li>
              Simplifying JSON inspection using CSV rows.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON to CSV Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              JSON input:
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

            <p className="mt-4 font-medium text-gray-900">
              CSV output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name,role
"Asha","Developer"
"Ravi","Designer"`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why CSV Conversion Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Spreadsheet compatibility:</strong> CSV works with Excel,
                Google Sheets, and reporting tools.
              </li>

              <li>
                <strong>Readable data tables:</strong> Structured rows simplify
                analytics and review workflows.
              </li>

              <li>
                <strong>API export workflows:</strong> JSON responses become
                easier to process outside applications.
              </li>

              <li>
                <strong>Data portability:</strong> CSV is supported across many
                platforms and systems.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a JSON to CSV Converter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A JSON to CSV Converter transforms structured JSON data into
                comma-separated values that can be used inside spreadsheets and
                reporting systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which JSON format works best?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Arrays of objects work best because each object becomes a CSV
                row and each key becomes a column.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool handle nested JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Nested objects are converted into JSON strings inside CSV cells.
                Deeply nested structures may require flattening first.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this converter useful for APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Developers and analysts commonly convert API responses into
                CSV for reporting and spreadsheet analysis.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JSON conversion processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON to CSV conversion happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            JSON conversion often connects with APIs, formatting, spreadsheets,
            structured data cleanup, and analytics workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/json-minifier"
              className="yoryantra-btn-outline"
            >
              JSON Minifier
            </Link>

            <Link
              href="/tools/csv-to-json"
              className="yoryantra-btn-outline"
            >
              CSV to JSON Converter
            </Link>

            <Link
              href="/tools/sql-formatter"
              className="yoryantra-btn-outline"
            >
              SQL Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}