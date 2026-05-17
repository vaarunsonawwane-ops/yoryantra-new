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

      setOutput(
        JSON.stringify(parsed, null, 2)
      );

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
      description="Validate JSON syntax, detect JSON errors, and inspect structured data instantly with this free online JSON Validator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder="Paste JSON here..."
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
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
            "Validated JSON output will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JSON validation happens locally inside your browser. Your JSON data
          is not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking JSON Syntax Before It Breaks APIs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON validation helps developers detect syntax errors, malformed
            structures, missing commas, broken brackets, invalid quotes, and
            incorrect formatting before JSON data is used in APIs, applications,
            databases, and configuration systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Invalid JSON is one of the most common causes of failed API
            requests, broken frontend applications, authentication issues, and
            webhook errors. This JSON Validator helps inspect structured data
            instantly while also displaying readable formatted output for valid
            JSON.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for API testing, debugging REST requests,
            inspecting server responses, validating configuration files, and
            troubleshooting structured data directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Validator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your JSON data into the editor.
            </li>

            <li>
              Click <strong>Validate JSON</strong>.
            </li>

            <li>
              Review whether the JSON syntax is valid or invalid.
            </li>

            <li>
              Inspect the readable formatted JSON output if validation succeeds.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON Validation Errors
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Missing commas between properties.</li>

            <li>Incorrect use of single quotes instead of double quotes.</li>

            <li>Trailing commas inside arrays or objects.</li>

            <li>Unclosed brackets or braces.</li>

            <li>Malformed key-value structures.</li>

            <li>Invalid string escaping.</li>

            <li>Broken API response formatting.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Validating API request and response payloads.</li>

            <li>Checking JSON configuration files before deployment.</li>

            <li>Debugging invalid webhook data.</li>

            <li>Inspecting frontend application state data.</li>

            <li>Validating structured data copied from logs.</li>

            <li>Testing REST APIs and GraphQL responses.</li>

            <li>Formatting readable JSON during development.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Validation
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Example JSON:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "type": "Developer Utility",
  "active": true
}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Validation Result:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Valid JSON
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why JSON Validation Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Prevents broken APIs:</strong> Invalid JSON often causes
                failed requests and parsing errors.
              </li>

              <li>
                <strong>Improves debugging:</strong> Validation helps identify
                syntax problems faster.
              </li>

              <li>
                <strong>Cleaner development workflows:</strong> Structured JSON
                is easier to maintain and inspect.
              </li>

              <li>
                <strong>Safer deployments:</strong> Validation reduces malformed
                configuration issues.
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
                What is JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON stands for JavaScript Object Notation and is a structured
                data format commonly used in APIs and applications.
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
                Yes. Valid JSON is automatically displayed in a formatted
                readable structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this JSON Validator useful for APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Developers commonly validate JSON before sending API
                requests or processing responses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JSON validation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON validation happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            JSON validation often connects with APIs, formatting, JWT debugging,
            structured data inspection, and frontend development workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/regex-tester"
              className="yoryantra-btn-outline"
            >
              Regex Tester
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}