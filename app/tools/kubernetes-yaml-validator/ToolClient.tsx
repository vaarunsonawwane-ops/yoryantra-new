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

  const validateKubernetesYaml =
    () => {
      try {
        if (!input.trim()) {
          setError(
            "Please enter Kubernetes YAML."
          );

          setOutput("");
          return;
        }

        const parsed =
          yaml.load(input) as any;

        if (!parsed.kind) {
          setOutput(
            "Invalid Kubernetes manifest. Missing 'kind' field."
          );

          setError("");
          return;
        }

        if (
          !parsed.metadata?.name
        ) {
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
            setInput(
              e.target.value
            )
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
          onClick={
            validateKubernetesYaml
          }
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
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

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "Kubernetes YAML validation result will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Kubernetes YAML validation happens locally inside your browser. Your
          manifests and infrastructure configuration are not uploaded, stored,
          or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Kubernetes YAML Before Deployment
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Kubernetes YAML validation helps developers and DevOps teams verify
            deployment manifests, services, pods, ingress resources, config
            maps, secrets, and infrastructure configuration before deploying
            workloads into Kubernetes clusters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Even small YAML mistakes or missing manifest fields can cause failed
            deployments, broken services, invalid resource definitions, or
            unexpected cluster behavior. Validating manifests early helps reduce
            deployment issues during CI/CD workflows and production releases.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Kubernetes YAML Validator checks YAML structure and validates
            important Kubernetes manifest fields directly inside your browser
            without requiring kubectl or external APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Kubernetes YAML Validator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your Kubernetes YAML manifest into the editor.
            </li>

            <li>
              Click <strong>Validate Kubernetes YAML</strong>.
            </li>

            <li>
              Review validation messages instantly.
            </li>

            <li>
              Fix missing fields or YAML formatting issues if needed.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Kubernetes Resources
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-2">
              <li>
                <strong>Deployment</strong> — Manages replicated application
                workloads.
              </li>

              <li>
                <strong>Service</strong> — Exposes applications inside or
                outside the cluster.
              </li>

              <li>
                <strong>Pod</strong> — Smallest deployable Kubernetes unit.
              </li>

              <li>
                <strong>Ingress</strong> — Handles external HTTP and HTTPS
                routing.
              </li>

              <li>
                <strong>ConfigMap</strong> — Stores non-sensitive configuration
                values.
              </li>

              <li>
                <strong>Secret</strong> — Stores sensitive credentials and keys.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Validating Kubernetes deployment manifests.
            </li>

            <li>
              Reviewing YAML before cluster deployment.
            </li>

            <li>
              Debugging infrastructure configuration issues.
            </li>

            <li>
              Testing Kubernetes resources locally.
            </li>

            <li>
              Verifying YAML structure during CI/CD workflows.
            </li>

            <li>
              Checking required manifest fields quickly.
            </li>

            <li>
              Preparing Kubernetes configuration for production releases.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Kubernetes Manifest
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`apiVersion: apps/v1
kind: Deployment

metadata:
  name: my-app

spec:
  replicas: 2`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Kubernetes Validation Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Fewer deployment failures:</strong> Detect missing
                fields and YAML mistakes before deployment.
              </li>

              <li>
                <strong>Cleaner DevOps workflows:</strong> Validate manifests
                during CI/CD automation.
              </li>

              <li>
                <strong>Safer infrastructure updates:</strong> Reduce cluster
                configuration errors.
              </li>

              <li>
                <strong>Faster debugging:</strong> Identify manifest problems
                quickly during development.
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
                What is Kubernetes YAML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Kubernetes YAML files define cluster resources such as
                deployments, services, pods, ingress rules, and infrastructure
                configuration.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why validate Kubernetes manifests?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Validation helps prevent deployment failures caused by missing
                fields, invalid YAML formatting, or incorrect resource
                definitions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate required fields?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The validator checks for important fields such as kind and
                metadata.name.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for Kubernetes CI/CD workflows?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Kubernetes YAML validation is commonly used before
                deployments and infrastructure automation workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is validation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Kubernetes YAML validation happens entirely inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/kubernetes-yaml-validator" />
        </div>
      </section>
    </ToolShell>
  );
}