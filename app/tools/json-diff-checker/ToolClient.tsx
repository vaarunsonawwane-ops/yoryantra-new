"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const compareJSON = () => {
    try {
      const left = JSON.parse(leftInput);
      const right = JSON.parse(rightInput);

      const leftFormatted = JSON.stringify(left, null, 2);
      const rightFormatted = JSON.stringify(right, null, 2);

      if (leftFormatted === rightFormatted) {
        setOutput("Both JSON objects are identical.");
      } else {
        const leftLines = leftFormatted.split("\n");
        const rightLines = rightFormatted.split("\n");

        const differences: string[] = [];

        const maxLines = Math.max(leftLines.length, rightLines.length);

        for (let i = 0; i < maxLines; i++) {
          if (leftLines[i] !== rightLines[i]) {
            differences.push(
              `Line ${i + 1}:\nLEFT: ${leftLines[i] || ""}\nRIGHT: ${rightLines[i] || ""}\n`
            );
          }
        }

        setOutput(differences.join("\n"));
      }

      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid JSON input.");
      }

      setOutput("");
    }
  };

  const resetAll = () => {
    setLeftInput("");
    setRightInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JSON Diff Checker"
      description="Compare two JSON objects and find differences instantly with this free online JSON Diff Checker."
    >
      {/* INPUTS */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Left JSON
          </label>

          <textarea
            value={leftInput}
            onChange={(e) => setLeftInput(e.target.value)}
            placeholder="Paste first JSON here..."
            className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Right JSON
          </label>

          <textarea
            value={rightInput}
            onChange={(e) => setRightInput(e.target.value)}
            placeholder="Paste second JSON here..."
            className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={compareJSON}
          className="yoryantra-btn"
        >
          Compare JSON
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
            Comparison Result
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
          {output || "JSON comparison result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This JSON Diff Checker
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Diff Checker helps you compare two JSON objects and find
            differences instantly. It is useful for developers working with API
            responses, configuration files, webhook payloads, application state,
            and structured data workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool validates both JSON inputs, formats them consistently, and
            highlights line-by-line differences between the two JSON objects.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Diff Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the first JSON object into the left editor.</li>
            <li>Paste the second JSON object into the right editor.</li>
            <li>Click <strong>Compare JSON</strong>.</li>
            <li>Review the detected differences instantly.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Comparing API responses.</li>
            <li>Debugging JSON configuration changes.</li>
            <li>Checking webhook payload differences.</li>
            <li>Reviewing structured data updates.</li>
            <li>Testing backend or frontend JSON outputs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Left JSON:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "version": 1
}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Right JSON:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "version": 2
}`}
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
                What is a JSON Diff Checker?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A JSON Diff Checker compares two JSON objects and identifies
                differences between them.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool detect invalid JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Both JSON inputs are validated before comparison.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does formatting affect the comparison?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The tool formats both JSON objects before comparing them.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this JSON comparison done on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON comparison happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-minifier" className="yoryantra-btn-outline">
              JSON Minifier
            </Link>

            <Link href="/tools/json-escape-unescape" className="yoryantra-btn-outline">
              JSON Escape Unescape
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}