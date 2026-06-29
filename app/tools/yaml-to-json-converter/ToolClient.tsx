"use client";

import { useState } from "react";
import yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertToJSON = () => {
    try {
      const parsed = yaml.load(input);

      const formatted = JSON.stringify(
        parsed,
        null,
        2
      );

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
      description="Convert YAML configuration files into JSON instantly with this free online YAML to JSON Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          YAML Input
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
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

        <pre className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "Converted JSON output will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          YAML conversion happens locally inside your browser. Your YAML data is
          not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting YAML Config Files Into JSON
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML to JSON conversion helps transform human-readable configuration
            files into structured JSON data used by APIs, applications,
            databases, automation systems, cloud infrastructure, and frontend
            development workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML is commonly used in Kubernetes manifests, Docker Compose files,
            CI/CD pipelines, infrastructure configuration, and DevOps
            environments because it is easier for humans to read and edit.
            JSON, however, is more commonly used by APIs and structured data
            systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This YAML to JSON Converter helps quickly transform YAML structures
            into valid formatted JSON while also validating the YAML syntax
            before generating output directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the YAML to JSON Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste YAML content into the editor.
            </li>

            <li>
              Click <strong>Convert to JSON</strong>.
            </li>

            <li>
              Review the generated JSON structure.
            </li>

            <li>
              Copy the formatted JSON output instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Converting Kubernetes YAML manifests into JSON.
            </li>

            <li>
              Transforming CI/CD configuration files for APIs.
            </li>

            <li>
              Working with Docker Compose and infrastructure files.
            </li>

            <li>
              Converting structured YAML into machine-readable JSON.
            </li>

            <li>
              Debugging DevOps configuration workflows.
            </li>

            <li>
              Preparing YAML data for application imports.
            </li>

            <li>
              Testing YAML and JSON interoperability.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example YAML to JSON Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              YAML input:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name: Yoryantra
type: Developer Utility
active: true`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              JSON output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "type": "Developer Utility",
  "active": true
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why YAML Conversion Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>API compatibility:</strong> JSON is widely used in APIs
                and structured application workflows.
              </li>

              <li>
                <strong>Readable configuration:</strong> YAML simplifies editing
                infrastructure and DevOps files.
              </li>

              <li>
                <strong>Better interoperability:</strong> Conversion helps move
                data between systems more easily.
              </li>

              <li>
                <strong>Cleaner debugging:</strong> Structured JSON simplifies
                inspection and validation workflows.
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
                What is YAML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                YAML is a human-readable structured data format commonly used
                for configuration files, DevOps workflows, and infrastructure
                systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why convert YAML to JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON is widely used in APIs and applications, while YAML is
                commonly used for configuration and infrastructure management.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate YAML syntax?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid YAML structures will display an error instead of
                generating JSON output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this converter useful for Kubernetes and DevOps?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Developers commonly convert Kubernetes manifests and DevOps
                configuration files between YAML and JSON formats.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is YAML conversion processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. YAML conversion happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/yaml-to-json-converter" />
        </div>
      </section>
    </ToolShell>
  );
}