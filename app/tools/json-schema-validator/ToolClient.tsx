"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [jsonInput, setJsonInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateSchema = () => {
    try {
      if (!jsonInput.trim()) {
        setError("Please enter JSON data.");
        setOutput("");
        return;
      }

      if (!schemaInput.trim()) {
        setError("Please enter a JSON schema.");
        setOutput("");
        return;
      }

      const jsonData = JSON.parse(jsonInput);
      const schema = JSON.parse(schemaInput);

      if (
        schema.type &&
        typeof jsonData !== schema.type
      ) {
        setOutput(
          `Validation failed. Expected type "${schema.type}".`
        );

        setError("");
        return;
      }

      if (
        schema.required &&
        Array.isArray(schema.required)
      ) {
        const missingFields = schema.required.filter(
          (field: string) =>
            !(field in jsonData)
        );

        if (missingFields.length > 0) {
          setOutput(
            `Validation failed. Missing required fields: ${missingFields.join(
              ", "
            )}`
          );

          setError("");
          return;
        }
      }

      setOutput(
        "JSON validation passed against the provided schema."
      );

      setError("");
    } catch {
      setError(
        "Invalid JSON data or schema."
      );

      setOutput("");
    }
  };

  const resetAll = () => {
    setJsonInput("");
    setSchemaInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JSON Schema Validator"
      description="Validate JSON data against a JSON schema instantly with this free online JSON Schema Validator."
    >
      {/* JSON INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Data
        </label>

        <textarea
          value={jsonInput}
          onChange={(e) =>
            setJsonInput(e.target.value)
          }
          placeholder={`{
  "name": "Yoryantra"
}`}
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* SCHEMA */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Schema
        </label>

        <textarea
          value={schemaInput}
          onChange={(e) =>
            setSchemaInput(e.target.value)
          }
          placeholder={`{
  "type": "object",
  "required": ["name"]
}`}
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={validateSchema}
          className="yoryantra-btn"
        >
          Validate JSON Schema
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
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[160px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "JSON schema validation result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is JSON Schema Validator?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema Validator helps you validate JSON data against a
            schema instantly. It is useful for API testing, backend validation,
            configuration validation, structured data workflows, and developer
            debugging.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Schema defines the structure, required fields, and validation
            rules for JSON data. This tool helps ensure your JSON payloads match
            the expected format before they are used in applications or APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Schema Validator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your JSON data into the first input box.</li>
            <li>Paste your JSON schema into the schema box.</li>
            <li>Click <strong>Validate JSON Schema</strong>.</li>
            <li>Review the validation result and fix errors if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Validating API request payloads.</li>
            <li>Testing backend data validation.</li>
            <li>Checking structured configuration files.</li>
            <li>Debugging JSON formatting issues.</li>
            <li>Improving schema-driven development workflows.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Schema
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`{
  "type": "object",
  "required": ["name", "email"]
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
                What is JSON Schema?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON Schema is a specification used to define the structure,
                rules, and validation requirements for JSON data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why validate JSON against a schema?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Schema validation helps ensure APIs and applications receive
                properly structured and valid JSON data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support required field validation?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The validator checks for missing required fields defined in
                the schema.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is validation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON schema validation happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

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
              href="/tools/json-diff-checker"
              className="yoryantra-btn-outline"
            >
              JSON Diff Checker
            </Link>

            <Link
              href="/tools/yaml-to-json-converter"
              className="yoryantra-btn-outline"
            >
              YAML to JSON Converter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
