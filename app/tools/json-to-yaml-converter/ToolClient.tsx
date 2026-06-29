"use client";

import { useState } from "react";
import yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const convertToYAML = () => {
    try {
      const parsed = JSON.parse(
        input
      );

      const converted =
        yaml.dump(parsed, {
          indent: 2,
          lineWidth: -1,
          noRefs: true,
        });

      setOutput(converted);
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
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JSON to YAML Converter"
      description="Convert JSON data into readable YAML configuration instantly with this free online JSON to YAML Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="Paste JSON here..."
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertToYAML}
          className="yoryantra-btn"
        >
          Convert to YAML
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
            YAML Output
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
            "Converted YAML output will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          JSON to YAML conversion happens locally inside your browser. Your
          structured data is not uploaded, stored, or processed on any external
          server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting JSON Data Into Readable YAML Configuration
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON to YAML conversion helps developers transform structured JSON
            data into cleaner YAML configuration files for Kubernetes manifests,
            Docker Compose setups, CI/CD pipelines, cloud infrastructure,
            automation systems, and DevOps workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON is commonly used in APIs and application data exchange, while
            YAML is often preferred for configuration management because of its
            cleaner indentation and easier readability.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON to YAML Converter validates JSON input automatically and
            generates readable YAML output instantly inside your browser without
            requiring external APIs or backend processing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON to YAML Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste JSON content into the input field.
            </li>

            <li>
              Click <strong>Convert to YAML</strong>.
            </li>

            <li>
              Review the generated YAML configuration output.
            </li>

            <li>
              Copy the converted YAML instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Converting API JSON responses into YAML.
            </li>

            <li>
              Building Kubernetes configuration manifests.
            </li>

            <li>
              Preparing Docker Compose configuration files.
            </li>

            <li>
              Working with CI/CD pipeline configuration.
            </li>

            <li>
              Transforming structured data for DevOps workflows.
            </li>

            <li>
              Improving readability of nested configuration objects.
            </li>

            <li>
              Testing JSON and YAML interoperability.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON to YAML Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              JSON input:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "type": "Developer Utility"
}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              YAML output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name: Yoryantra
type: Developer Utility`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why YAML Is Popular in DevOps Workflows
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better readability:</strong> YAML is easier to scan and
                maintain compared to deeply nested JSON.
              </li>

              <li>
                <strong>DevOps adoption:</strong> Kubernetes, Docker Compose,
                and CI/CD systems rely heavily on YAML configuration.
              </li>

              <li>
                <strong>Cleaner configuration files:</strong> YAML reduces
                visual clutter in infrastructure and automation workflows.
              </li>

              <li>
                <strong>Structured data support:</strong> YAML handles nested
                configuration objects clearly and efficiently.
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
                JSON is a structured data format widely used in APIs,
                applications, databases, and web services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why convert JSON to YAML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                YAML is often easier to read and maintain for configuration
                files, DevOps workflows, Kubernetes manifests, and automation
                systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate JSON input?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid JSON structures display an error before conversion
                begins.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is YAML formatting preserved?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The generated YAML output is formatted with readable
                indentation automatically.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is conversion processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON to YAML conversion happens entirely inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-to-yaml-converter" />
        </div>
      </section>
    </ToolShell>
  );
}