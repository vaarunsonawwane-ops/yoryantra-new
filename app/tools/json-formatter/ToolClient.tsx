"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import {
  ToolContent,
  ToolExampleCard,
  ToolInsightBox,
} from "@/app/components/ToolContent";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);

      const formatted = JSON.stringify(
        parsed,
        null,
        2
      );

      setOutput(formatted);
      setError("");
    } catch {
      setError("Invalid JSON format.");
      setOutput("");
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);

      const minified =
        JSON.stringify(parsed);

      setOutput(minified);
      setError("");
    } catch {
      setError("Invalid JSON format.");
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
      title="JSON Formatter"
      description="Format, validate, beautify, and minify JSON instantly with this free online JSON Formatter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste JSON here..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={formatJSON}
          className="yoryantra-btn"
        >
          Format JSON
        </button>

        <button
          onClick={minifyJSON}
          className="yoryantra-btn-outline"
        >
          Minify JSON
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
            Formatted Output
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
            "Formatted JSON output will appear here..."}
        </pre>
      </div>

      {/* SECURITY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JSON formatting and validation happen locally inside your browser.
          Your JSON data is not uploaded or stored on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <ToolContent>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting JSON So It Is Easier to Read
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON formatting helps developers organize, validate, and inspect
            structured data more easily during development and debugging
            workflows. JSON is widely used in APIs, configuration files,
            databases, frontend applications, cloud systems, authentication
            payloads, and modern web development.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw JSON copied from APIs or logs is often difficult to read because
            it appears compressed into a single line. This JSON Formatter helps
            beautify messy JSON into properly indented readable structures while
            also validating whether the JSON syntax is correct.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for API testing, frontend debugging, server
            responses, JWT inspection, configuration management, and structured
            data analysis directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your JSON data into the input editor.
            </li>

            <li>
              Click <strong>Format JSON</strong> to beautify and organize the
              structure.
            </li>

            <li>
              Click <strong>Minify JSON</strong> to compress the JSON into a
              single line.
            </li>

            <li>
              Review and copy the formatted output instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Beautifying API responses for debugging.</li>

            <li>Validating JSON syntax before deployment.</li>

            <li>Formatting configuration files for readability.</li>

            <li>Inspecting authentication payloads and JWT data.</li>

            <li>Cleaning JSON copied from logs and databases.</li>

            <li>Preparing structured data for frontend applications.</li>

            <li>Minifying JSON for optimized transfer and storage.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Formatted JSON
          </h2>

          <ToolExampleCard>
            <pre className="whitespace-pre-wrap break-words text-[14px] leading-7 text-gray-700">
{`{
  "name": "Yoryantra",
  "type": "Developer Tools",
  "active": true,
  "tools": [
    "JSON Formatter",
    "JWT Decoder"
  ]
}`}
            </pre>
          </ToolExampleCard>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why JSON Formatting Matters
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                <strong>Better readability:</strong> Proper indentation makes
                structured data easier to inspect.
              </li>

              <li>
                <strong>Faster debugging:</strong> Developers can identify
                missing brackets, invalid syntax, and broken structures quickly.
              </li>

              <li>
                <strong>Improved collaboration:</strong> Clean JSON is easier to
                review and edit across teams.
              </li>

              <li>
                <strong>Cleaner APIs:</strong> Formatted responses simplify API
                testing and development workflows.
              </li>
            </ul>
          </ToolInsightBox>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a JSON Formatter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A JSON Formatter converts compressed or unorganized JSON into a
                clean readable structure using indentation and spacing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate JSON syntax?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid JSON structures and syntax errors will display an
                error instead of formatted output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is JSON minification?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON minification removes unnecessary spaces and line breaks to
                reduce file size and improve transfer efficiency.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this JSON Formatter useful for APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. API developers commonly use JSON formatting while testing
                endpoints and inspecting server responses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JSON processing handled on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON formatting and validation happen locally inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-formatter" />
        </div>
      </ToolContent>
    </ToolShell>
  );
}