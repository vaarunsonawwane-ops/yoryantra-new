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
      const formatted = YAML.stringify(parsed);

      setOutput(formatted.trim());
      setError("");
    } catch {
      setError("Invalid YAML. Please check your input.");
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
      description="Format and beautify YAML instantly with this free online YAML Formatter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          YAML Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste YAML here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatYAML} className="yoryantra-btn">
          Format YAML
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Formatted YAML
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Formatted YAML will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is YAML Formatter?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML Formatter helps you clean, format, and beautify YAML data
            into a readable structure. YAML is commonly used in configuration
            files, deployment workflows, CI/CD pipelines, Docker Compose,
            Kubernetes manifests, and application settings.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Properly formatted YAML is easier to read, edit, debug, and share.
            This tool also checks whether your YAML can be parsed before showing
            the formatted output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the YAML Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your YAML content into the input box.</li>
            <li>Click <strong>Format YAML</strong>.</li>
            <li>Review the formatted YAML output.</li>
            <li>Copy the result for use in your project.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Formatting YAML configuration files.</li>
            <li>Cleaning Docker Compose YAML files.</li>
            <li>Reviewing Kubernetes YAML manifests.</li>
            <li>Debugging CI/CD pipeline configuration.</li>
            <li>Improving readability of application settings.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">YAML input:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`name: Yoryantra
tools:
- JSON Formatter
- YAML Formatter
active: true`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">Formatted YAML:</p>

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
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a YAML formatter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A YAML formatter organizes YAML content into a cleaner and more
                readable structure with consistent spacing and indentation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is YAML indentation important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                YAML uses indentation to define structure. Incorrect indentation
                can break configuration files or change their meaning.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this YAML Formatter secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Formatting happens directly in your browser. Your YAML
                content is not uploaded to any server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/xml-formatter" className="yoryantra-btn-outline">
              XML Formatter
            </Link>

            <Link href="/tools/json-minifier" className="yoryantra-btn-outline">
              JSON Minifier
            </Link>

            <Link href="/tools/sql-formatter" className="yoryantra-btn-outline">
              SQL Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
