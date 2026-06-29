"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const escapeJSON = () => {
    try {
      const escaped =
        JSON.stringify(input);

      setOutput(escaped);
      setError("");
    } catch {
      setError(
        "Unable to escape JSON string."
      );

      setOutput("");
    }
  };

  const unescapeJSON = () => {
    try {
      const unescaped =
        JSON.parse(input);

      setOutput(unescaped);
      setError("");
    } catch {
      setError(
        "Invalid escaped JSON string."
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
      title="JSON Escape Unescape"
      description="Escape and unescape JSON strings instantly with this free online JSON Escape Unescape tool."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Input
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="Paste JSON string here..."
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={escapeJSON}
          className="yoryantra-btn"
        >
          Escape JSON
        </button>

        <button
          onClick={unescapeJSON}
          className="yoryantra-btn-outline"
        >
          Unescape JSON
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
            Result
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

        <div className="yoryantra-output min-h-[180px] text-sm break-words whitespace-pre-wrap overflow-auto">
          {output ||
            "Escaped or unescaped JSON output will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JSON escaping and unescaping happens locally inside your browser. Your
          payloads, configuration values, and structured data are not uploaded,
          stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Escaping JSON Strings Before They Break Payloads
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON escaping and unescaping helps developers safely handle API
            payloads, configuration files, structured logs, webhook data,
            embedded JSON strings, automation workflows, and encoded application
            responses.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Escaping converts special characters into safe encoded sequences so
            JSON can be embedded inside APIs, scripts, databases, environment
            variables, or nested JSON objects without breaking parsing logic.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Escape Unescape tool transforms encoded JSON strings
            directly inside your browser without requiring backend processing or
            external APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Escape Unescape Tool
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your JSON string into the editor.
            </li>

            <li>
              Click <strong>Escape JSON</strong> or{" "}
              <strong>Unescape JSON</strong>.
            </li>

            <li>
              Review the transformed output instantly.
            </li>

            <li>
              Copy the processed JSON string if needed.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Escaping JSON strings for API payloads.
            </li>

            <li>
              Cleaning escaped log output.
            </li>

            <li>
              Embedding JSON inside configuration files.
            </li>

            <li>
              Debugging encoded API responses.
            </li>

            <li>
              Preparing JSON strings for scripts and databases.
            </li>

            <li>
              Working with nested JSON structures.
            </li>

            <li>
              Formatting escaped webhook payloads.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Escaping
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Original JSON:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{"name":"Yoryantra"}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Escaped JSON:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`"{\\"name\\":\\"Yoryantra\\"}"`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why JSON Escaping Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Safer payloads:</strong> Prevent broken JSON formatting
                inside APIs and scripts.
              </li>

              <li>
                <strong>Cleaner debugging:</strong> Decode escaped responses and
                structured logs quickly.
              </li>

              <li>
                <strong>Better interoperability:</strong> Safely embed JSON
                inside nested systems and applications.
              </li>

              <li>
                <strong>Improved reliability:</strong> Reduce parsing issues
                caused by special characters.
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
                What does escaping JSON mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Escaping JSON converts special characters into encoded sequences
                so the string can safely be embedded inside APIs, scripts, or
                other JSON objects.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does unescaping JSON do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Unescaping converts encoded JSON sequences back into readable
                text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are backslashes added during escaping?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Backslashes safely encode quotes, newline characters, and other
                special characters inside JSON strings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for API debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JSON escaping and unescaping is commonly used while working
                with APIs, webhook payloads, logs, and encoded responses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is processing done on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON escaping and unescaping happens entirely inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-escape-unescape" />
        </div>
      </section>
    </ToolShell>
  );
}