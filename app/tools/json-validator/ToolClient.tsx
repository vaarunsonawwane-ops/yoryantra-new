"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateJSON = () => {
    try {
      const parsed = JSON.parse(input);

      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid JSON.");
      }

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
      title="JSON Validator"
      description="Validate JSON syntax and find JSON errors instantly with this free online JSON Validator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste JSON here...'
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={validateJSON}
          className="yoryantra-btn"
        >
          Validate JSON
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Validation Result
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

        <div className="yoryantra-output min-h-[180px] text-sm break-words whitespace-pre-wrap overflow-auto">
          {output || "Validated JSON output will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This JSON Validator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Validator helps you validate JSON syntax instantly and
            detect formatting errors quickly. It is useful for developers
            working with APIs, configuration files, JSON payloads, webhooks,
            databases, and structured data workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool checks whether your JSON is valid and displays readable
            formatted output if the input is correct. If the JSON contains
            syntax errors, the validator shows the parsing error message.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Validator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your JSON into the input field.</li>
            <li>Click <strong>Validate JSON</strong>.</li>
            <li>Check whether the JSON is valid.</li>
            <li>Copy the formatted JSON output if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Validating API request and response payloads.</li>
            <li>Checking JSON configuration files.</li>
            <li>Debugging invalid JSON syntax errors.</li>
            <li>Formatting readable JSON output.</li>
            <li>Testing webhook and REST API data.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Example JSON:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "type": "Developer Utility"
}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Validation result:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Valid JSON
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
                What is JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON stands for JavaScript Object Notation. It is a lightweight
                structured data format commonly used in APIs and applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What causes invalid JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Common JSON errors include missing commas, invalid quotes,
                trailing commas, incorrect brackets, and malformed values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool format JSON too?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. If the JSON is valid, the tool displays formatted and
                readable JSON output automatically.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is the JSON processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON validation happens directly in your browser for fast
                and privacy-friendly processing.
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

            <Link href="/tools/json-to-csv-converter" className="yoryantra-btn-outline">
              JSON to CSV Converter
            </Link>

            <Link href="/tools/csv-to-json-converter" className="yoryantra-btn-outline">
              CSV to JSON Converter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}