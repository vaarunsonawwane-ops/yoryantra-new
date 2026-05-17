"use client";

import { useState } from "react";
import Link from "next/link";
import YAML from "yaml";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatYAML = () => {
    try {
      const parsed = YAML.parse(input);

      const formatted =
        YAML.stringify(parsed);

      setOutput(formatted.trim());
      setError("");
    } catch {
      setError(
        "Invalid YAML. Please check your input."
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
      title="YAML Formatter"
      description="Format and beautify YAML configuration files instantly with this free online YAML Formatter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          YAML Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste YAML here..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={formatYAML}
          className="yoryantra-btn"
        >
          Format YAML
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
            Formatted YAML
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
            "Formatted YAML will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          YAML formatting happens locally inside your browser. Your YAML content
          is not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting YAML Files So Indentation Errors Are Easier to Spot
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML formatting helps organize configuration files into a cleaner
            and more readable structure. Proper indentation is extremely
            important in YAML because spacing defines hierarchy and structure
            directly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML is widely used in Kubernetes manifests, Docker Compose files,
            CI/CD pipelines, cloud infrastructure, DevOps workflows,
            application settings, and automation systems. Even a small
            indentation mistake can break deployments or change how
            configurations behave.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This YAML Formatter helps beautify YAML instantly while also
            validating whether the YAML structure can be parsed correctly before
            generating formatted output directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the YAML Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste YAML content into the editor.
            </li>

            <li>
              Click <strong>Format YAML</strong>.
            </li>

            <li>
              Review the beautified YAML structure.
            </li>

            <li>
              Copy the formatted YAML output instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Formatting Kubernetes YAML manifests.
            </li>

            <li>
              Cleaning Docker Compose configuration files.
            </li>

            <li>
              Debugging CI/CD pipeline YAML.
            </li>

            <li>
              Organizing cloud infrastructure configuration.
            </li>

            <li>
              Improving readability of application settings.
            </li>

            <li>
              Reviewing nested YAML structures more easily.
            </li>

            <li>
              Validating YAML before deployment workflows.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example YAML Formatting
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Before formatting:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name: Yoryantra
tools:
- JSON Formatter
- YAML Formatter
active: true`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              After formatting:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name: Yoryantra
tools:
  - JSON Formatter
  - YAML Formatter
active: true`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why YAML Formatting Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Cleaner readability:</strong> Proper indentation makes
                nested YAML structures easier to inspect.
              </li>

              <li>
                <strong>Faster debugging:</strong> Formatting helps identify
                spacing and hierarchy issues quickly.
              </li>

              <li>
                <strong>Safer deployments:</strong> Correct YAML structure helps
                reduce infrastructure and pipeline errors.
              </li>

              <li>
                <strong>Better collaboration:</strong> Organized YAML files are
                easier to review and maintain across teams.
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
                What is a YAML Formatter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A YAML Formatter organizes YAML content into a clean readable
                structure with proper indentation and spacing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is YAML indentation important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                YAML uses indentation to define structure and hierarchy.
                Incorrect spacing can break configuration files or change their
                meaning.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate YAML syntax?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid YAML structures will display an error instead of
                formatted output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is YAML still widely used in DevOps?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. YAML is heavily used in Kubernetes, Docker Compose, CI/CD
                pipelines, cloud infrastructure, and automation systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is YAML formatting processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. YAML formatting happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            YAML formatting often connects with DevOps workflows, Kubernetes
            manifests, APIs, configuration management, and structured data
            debugging.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/yaml-to-json-converter"
              className="yoryantra-btn-outline"
            >
              YAML to JSON Converter
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/xml-formatter"
              className="yoryantra-btn-outline"
            >
              XML Formatter
            </Link>

            <Link
              href="/tools/sql-formatter"
              className="yoryantra-btn-outline"
            >
              SQL Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}