"use client";

import { useState } from "react";
import Link from "next/link";
import yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateKubernetesYaml = () => {
    try {
      if (!input.trim()) {
        setError(
          "Please enter Kubernetes YAML."
        );

        setOutput("");
        return;
      }

      const parsed = yaml.load(input) as any;

      if (!parsed.kind) {
        setOutput(
          "Invalid Kubernetes manifest. Missing 'kind' field."
        );

        setError("");
        return;
      }

      if (!parsed.metadata?.name) {
        setOutput(
          "Invalid Kubernetes manifest. Missing metadata.name field."
        );

        setError("");
        return;
      }

      setOutput(
        `Kubernetes YAML validation passed.\n\nKind: ${parsed.kind}\nName: ${parsed.metadata.name}`
      );

      setError("");
    } catch {
      setError(
        "Invalid Kubernetes YAML."
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
      title="Kubernetes YAML Validator"
      description="Validate Kubernetes YAML manifests instantly with this free online Kubernetes YAML Validator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Kubernetes YAML Manifest
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder={`apiVersion: apps/v1
kind: Deployment

metadata:
  name: my-app`}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={validateKubernetesYaml}
          className="yoryantra-btn"
        >
          Validate Kubernetes YAML
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
            "Kubernetes YAML validation result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This Kubernetes YAML Validator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Kubernetes YAML Validator helps you validate Kubernetes manifests instantly. It is useful for DevOps engineers, cloud infrastructure teams, backend developers, and Kubernetes deployment workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes manifests define deployments, services, pods, ingress resources, and infrastructure configuration using YAML files. This tool helps detect missing fields and invalid manifest structures before deployment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking Kubernetes YAML syntax.</li>
            <li>Validating deployment manifests.</li>
            <li>Debugging infrastructure configuration.</li>
            <li>Reviewing manifests before cluster deployment.</li>
            <li>Testing Kubernetes resources locally.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Kubernetes YAML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Kubernetes YAML files define cluster resources such as deployments, services, config maps, pods, and ingress configuration.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why validate Kubernetes manifests?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Validation helps prevent deployment failures caused by missing fields, invalid YAML formatting, or incorrect resource definitions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this validate required fields?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The validator checks for required fields such as kind and metadata.name.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is validation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Kubernetes YAML validation happens directly in your browser.
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
              href="/tools/docker-compose-validator"
              className="yoryantra-btn-outline"
            >
              Docker Compose Validator
            </Link>

            <Link
              href="/tools/yaml-formatter"
              className="yoryantra-btn-outline"
            >
              YAML Formatter
            </Link>

            <Link
              href="/tools/yaml-to-json-converter"
              className="yoryantra-btn-outline"
            >
              YAML to JSON Converter
            </Link>

            <Link
              href="/tools/json-schema-validator"
              className="yoryantra-btn-outline"
            >
              JSON Schema Validator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}