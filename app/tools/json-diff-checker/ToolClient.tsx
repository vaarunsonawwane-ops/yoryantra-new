"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [leftInput, setLeftInput] =
    useState("");

  const [rightInput, setRightInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const compareJSON = () => {
    try {
      const left = JSON.parse(
        leftInput
      );

      const right = JSON.parse(
        rightInput
      );

      const leftFormatted =
        JSON.stringify(
          left,
          null,
          2
        );

      const rightFormatted =
        JSON.stringify(
          right,
          null,
          2
        );

      if (
        leftFormatted ===
        rightFormatted
      ) {
        setOutput(
          "Both JSON objects are identical."
        );
      } else {
        const leftLines =
          leftFormatted.split("\n");

        const rightLines =
          rightFormatted.split("\n");

        const differences: string[] =
          [];

        const maxLines =
          Math.max(
            leftLines.length,
            rightLines.length
          );

        for (
          let i = 0;
          i < maxLines;
          i++
        ) {
          if (
            leftLines[i] !==
            rightLines[i]
          ) {
            differences.push(
              `Line ${i + 1}:\nLEFT: ${
                leftLines[i] || ""
              }\nRIGHT: ${
                rightLines[i] || ""
              }\n`
            );
          }
        }

        setOutput(
          differences.join("\n")
        );
      }

      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Invalid JSON input."
        );
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
      description="Compare two JSON objects and detect differences instantly with this free online JSON Diff Checker."
    >
      {/* INPUTS */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Left JSON
          </label>

          <textarea
            value={leftInput}
            onChange={(e) =>
              setLeftInput(
                e.target.value
              )
            }
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
            onChange={(e) =>
              setRightInput(
                e.target.value
              )
            }
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
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

        <div className="yoryantra-output min-h-[240px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "JSON comparison result will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JSON comparison happens locally inside your browser. Your JSON data is
          not uploaded, stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Comparing Two JSON Responses During API Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON comparison helps developers identify differences between API
            responses, configuration files, webhook payloads, structured data,
            application state objects, backend outputs, and testing snapshots.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Even small JSON changes can affect application behavior, API
            integrations, authentication workflows, frontend rendering, or
            automation systems. A JSON Diff Checker makes these differences
            easier to inspect line by line.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Diff Checker validates and formats both JSON objects
            before generating readable comparison results directly inside your
            browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Diff Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste the first JSON object into the left editor.
            </li>

            <li>
              Paste the second JSON object into the right editor.
            </li>

            <li>
              Click <strong>Compare JSON</strong>.
            </li>

            <li>
              Review the detected JSON differences instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Comparing API responses during debugging.
            </li>

            <li>
              Reviewing JSON configuration changes.
            </li>

            <li>
              Comparing webhook payload structures.
            </li>

            <li>
              Testing frontend and backend JSON outputs.
            </li>

            <li>
              Identifying modified fields in structured data.
            </li>

            <li>
              Reviewing application state changes.
            </li>

            <li>
              Debugging automation and integration workflows.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Comparison
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
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

            <p className="mt-4 font-medium text-gray-900">
              Difference detected:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Line 3:
LEFT:   "version": 1
RIGHT:  "version": 2`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why JSON Comparison Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Faster debugging:</strong> Quickly identify modified
                fields and changed values.
              </li>

              <li>
                <strong>API verification:</strong> Compare request and response
                payloads during integration testing.
              </li>

              <li>
                <strong>Cleaner workflows:</strong> Formatted JSON is easier to
                review and validate.
              </li>

              <li>
                <strong>Safer deployments:</strong> Detect unintended
                configuration changes before production updates.
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
                What is a JSON Diff Checker?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A JSON Diff Checker compares two JSON objects and highlights
                differences between them.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does formatting affect JSON comparison?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Both JSON objects are formatted consistently before
                comparison begins.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool detect invalid JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Both inputs are validated before generating comparison
                results.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for API debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JSON comparison is commonly used while debugging APIs,
                webhook payloads, integrations, and backend services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JSON comparison processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON comparison happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            JSON comparison often connects with API debugging, structured data
            workflows, backend testing, configuration management, and automation
            systems.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/json-escape-unescape"
              className="yoryantra-btn-outline"
            >
              JSON Escape Unescape
            </Link>

            <Link
              href="/tools/json-to-yaml-converter"
              className="yoryantra-btn-outline"
            >
              JSON to YAML Converter
            </Link>

            <Link
              href="/tools/xml-to-json-converter"
              className="yoryantra-btn-outline"
            >
              XML to JSON Converter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}