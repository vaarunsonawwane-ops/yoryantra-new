"use client";

import { useState } from "react";
import Link from "next/link";
import yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertToYAML = () => {
    try {
      const parsed = JSON.parse(input);
      const converted = yaml.dump(parsed, {
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
        setError("Invalid JSON input.");
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
      description="Convert JSON to YAML instantly with this free online JSON to YAML Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste JSON here..."
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertToYAML} className="yoryantra-btn">
          Convert to YAML
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
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
            YAML Output
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
          {output || "Converted YAML output will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is JSON to YAML Converter?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON to YAML Converter helps you convert JSON data into YAML
            instantly. It is useful for developers working with APIs,
            configuration files, Kubernetes manifests, DevOps workflows, CI/CD
            pipelines, and structured data transformations.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON is widely used for APIs and application data, while YAML is
            often preferred for readable configuration files. This tool helps
            you transform JSON into clean YAML format quickly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON to YAML Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your JSON content into the input field.</li>
            <li>Click <strong>Convert to YAML</strong>.</li>
            <li>View the generated YAML output.</li>
            <li>Copy the YAML result if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Converting API JSON responses into YAML.</li>
            <li>Transforming JSON configuration files into YAML.</li>
            <li>Preparing Kubernetes and DevOps configuration data.</li>
            <li>Working with CI/CD pipeline configuration formats.</li>
            <li>Testing JSON and YAML interoperability.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
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
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON is a lightweight structured data format commonly used in
                APIs, applications, databases, and web services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why convert JSON to YAML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                YAML is easier to read for configuration files, DevOps
                workflows, Kubernetes manifests, and CI/CD pipelines.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid JSON input will show an error message during
                conversion.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is the conversion done on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON to YAML conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/yaml-to-json-converter" className="yoryantra-btn-outline">
              YAML to JSON Converter
            </Link>

            <Link href="/tools/yaml-formatter" className="yoryantra-btn-outline">
              YAML Formatter
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
