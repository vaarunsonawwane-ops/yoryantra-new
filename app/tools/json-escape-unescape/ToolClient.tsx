"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const escapeJSON = () => {
    try {
      const escaped = JSON.stringify(input);
      setOutput(escaped);
      setError("");
    } catch {
      setError("Unable to escape JSON string.");
      setOutput("");
    }
  };

  const unescapeJSON = () => {
    try {
      const unescaped = JSON.parse(input);
      setOutput(unescaped);
      setError("");
    } catch {
      setError("Invalid escaped JSON string.");
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
          onChange={(e) => setInput(e.target.value)}
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[180px] text-sm break-words whitespace-pre-wrap overflow-auto">
          {output || "Escaped or unescaped JSON output will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This JSON Escape Unescape Tool
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Escape Unescape tool helps you quickly escape or unescape
            JSON strings for APIs, logs, configuration files, payloads, and
            development workflows. It is useful when dealing with quotes,
            backslashes, newline characters, and encoded JSON content.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Escaping JSON converts special characters into safe escaped
            sequences, while unescaping converts escaped JSON back into readable
            text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Escape Unescape Tool
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your JSON string into the input field.</li>
            <li>Click <strong>Escape JSON</strong> or <strong>Unescape JSON</strong>.</li>
            <li>View the transformed output instantly.</li>
            <li>Copy the result if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Escaping JSON strings for API payloads.</li>
            <li>Cleaning escaped log output.</li>
            <li>Formatting JSON inside configuration files.</li>
            <li>Debugging encoded JSON responses.</li>
            <li>Preparing JSON strings for databases or scripts.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
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
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does escaping JSON mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Escaping JSON converts special characters into escaped sequences
                so the string can safely be used inside APIs, scripts, or other
                JSON structures.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does unescaping JSON do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Unescaping converts escaped JSON sequences back into readable
                text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are backslashes added while escaping?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Backslashes are used to safely encode special characters such as
                quotes and newline characters inside JSON strings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this tool privacy-friendly?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. All escaping and unescaping happens directly in your browser.
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

            <Link href="/tools/yaml-formatter" className="yoryantra-btn-outline">
              YAML Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}