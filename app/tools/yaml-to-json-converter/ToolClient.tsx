"use client";

import { useState } from "react";
import Link from "next/link";
import yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertToJSON = () => {
    try {
      const parsed = yaml.load(input);

      const formatted = JSON.stringify(parsed, null, 2);

      setOutput(formatted);
      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid YAML input.");
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
      title="YAML to JSON Converter"
      description="Convert YAML to JSON instantly with this free online YAML to JSON Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          YAML Input
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste YAML here..."
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertToJSON}
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            JSON Output
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
          {output || "Converted JSON output will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This YAML to JSON Converter
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This YAML to JSON Converter helps you convert YAML data into JSON
            instantly. It is useful for developers working with APIs,
            Kubernetes, DevOps workflows, configuration files, CI/CD pipelines,
            and structured data transformations.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML is commonly used for human-readable configuration files, while
            JSON is widely used for APIs and structured application data. This
            tool helps you quickly transform YAML into valid JSON format.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the YAML to JSON Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your YAML content into the input field.</li>
            <li>Click <strong>Convert to JSON</strong>.</li>
            <li>View the generated JSON output.</li>
            <li>Copy the JSON result if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Converting Kubernetes YAML manifests into JSON.</li>
            <li>Transforming configuration files for APIs.</li>
            <li>Working with DevOps and CI/CD workflows.</li>
            <li>Converting structured YAML data into JSON payloads.</li>
            <li>Testing YAML and JSON interoperability.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              YAML input:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name: Yoryantra
type: Developer Utility`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              JSON output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "type": "Developer Utility"
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
                What is YAML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                YAML is a human-readable structured data format commonly used
                for configuration files and DevOps workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why convert YAML to JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON is widely used in APIs, applications, and structured data
                systems, while YAML is often preferred for readability.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate YAML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid YAML input will show an error message during
                conversion.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is the conversion done on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. YAML conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/yaml-formatter" className="yoryantra-btn-outline">
              YAML Formatter
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/json-minifier" className="yoryantra-btn-outline">
              JSON Minifier
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}