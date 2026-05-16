"use client";

import { useState } from "react";
import Link from "next/link";
import yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateCompose = () => {
    try {
      if (!input.trim()) {
        setError("Please enter Docker Compose YAML.");
        setOutput("");
        return;
      }

      const parsed = yaml.load(input) as any;

      if (!parsed.services) {
        setOutput(
          "Invalid Docker Compose file. Missing 'services' section."
        );

        setError("");
        return;
      }

      const serviceNames = Object.keys(
        parsed.services
      );

      setOutput(
        `Docker Compose validation passed.\n\nDetected services:\n- ${serviceNames.join(
          "\n- "
        )}`
      );

      setError("");
    } catch {
      setError(
        "Invalid Docker Compose YAML."
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
      title="Docker Compose Validator"
      description="Validate Docker Compose YAML files instantly with this free online Docker Compose Validator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Docker Compose YAML
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder={`version: "3"

services:
  app:
    image: nginx`}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={validateCompose}
          className="yoryantra-btn"
        >
          Validate Docker Compose
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

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "Docker Compose validation result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This Docker Compose Validator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Docker Compose Validator helps you validate Docker Compose YAML files instantly. It is useful for DevOps engineers, backend developers, containerized application workflows, and deployment debugging.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker Compose files define multi-container application setups using YAML configuration. This tool helps identify formatting issues and missing service definitions before deployment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking Docker Compose syntax.</li>
            <li>Validating container service definitions.</li>
            <li>Debugging deployment configuration files.</li>
            <li>Reviewing YAML before production deployment.</li>
            <li>Testing containerized application setups.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Docker Compose?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Docker Compose is a tool used to define and run multi-container Docker applications using YAML configuration files.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why validate Docker Compose files?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Validation helps prevent deployment errors caused by invalid YAML formatting or missing configuration sections.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is validation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Docker Compose validation happens directly in your browser.
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
              href="/tools/kubernetes-yaml-validator"
              className="yoryantra-btn-outline"
            >
              Kubernetes YAML Validator
            </Link>

            <Link
              href="/tools/yaml-formatter"
              className="yoryantra-btn-outline"
            >
              YAML Formatter
            </Link>

            <Link
              href="/tools/json-schema-validator"
              className="yoryantra-btn-outline"
            >
              JSON Schema Validator
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