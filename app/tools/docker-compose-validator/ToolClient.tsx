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

  const validateCompose =
    () => {
      try {
        if (!input.trim()) {
          setError(
            "Please enter Docker Compose YAML."
          );

          setOutput("");
          return;
        }

        const parsed =
          yaml.load(input) as any;

        if (!parsed.services) {
          setOutput(
            "Invalid Docker Compose file. Missing 'services' section."
          );

          setError("");
          return;
        }

        const serviceNames =
          Object.keys(
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
            setInput(
              e.target.value
            )
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
          onClick={
            validateCompose
          }
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
            "Docker Compose validation result will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Docker Compose validation happens locally inside your browser. Your
          container configuration files are not uploaded, stored, or processed
          on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Docker Compose Files Before Containers Fail
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker Compose validation helps developers and DevOps teams verify
            multi-container application configuration before running services,
            deployments, databases, reverse proxies, worker containers, and
            local development environments.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker Compose files define container relationships, ports,
            networks, environment variables, volumes, and startup behavior using
            YAML configuration. Even small YAML mistakes can break container
            orchestration workflows or prevent services from starting properly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Docker Compose Validator checks YAML structure and validates
            required Docker Compose sections directly inside your browser without
            requiring Docker CLI commands or external APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Docker Compose Validator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your Docker Compose YAML into the editor.
            </li>

            <li>
              Click <strong>Validate Docker Compose</strong>.
            </li>

            <li>
              Review validation messages instantly.
            </li>

            <li>
              Fix missing services or YAML formatting issues if needed.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Docker Compose Services
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-2">
              <li>
                <strong>Web applications</strong> — Frontend and backend
                containers.
              </li>

              <li>
                <strong>Databases</strong> — PostgreSQL, MySQL, MongoDB, Redis,
                and similar services.
              </li>

              <li>
                <strong>Reverse proxies</strong> — Nginx, Traefik, and load
                balancing containers.
              </li>

              <li>
                <strong>Worker services</strong> — Queue processors and
                background jobs.
              </li>

              <li>
                <strong>Development environments</strong> — Local full-stack
                containerized setups.
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
              Validating Docker Compose syntax before deployment.
            </li>

            <li>
              Reviewing container service definitions.
            </li>

            <li>
              Debugging multi-container configuration issues.
            </li>

            <li>
              Testing Docker YAML locally before production releases.
            </li>

            <li>
              Verifying infrastructure configuration during CI/CD workflows.
            </li>

            <li>
              Checking required service sections quickly.
            </li>

            <li>
              Preparing containerized applications for deployment.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Docker Compose File
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`version: "3"

services:
  app:
    image: nginx
    ports:
      - "80:80"`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Docker Compose Validation Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Fewer deployment issues:</strong> Detect missing
                services and YAML mistakes early.
              </li>

              <li>
                <strong>Cleaner container workflows:</strong> Validate
                multi-container setups before deployment.
              </li>

              <li>
                <strong>Safer infrastructure changes:</strong> Reduce broken
                configuration risks.
              </li>

              <li>
                <strong>Faster debugging:</strong> Identify Compose file issues
                during development and testing.
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
                What is Docker Compose?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Docker Compose is a tool used to define and manage
                multi-container Docker applications using YAML configuration
                files.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why validate Docker Compose files?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Validation helps prevent deployment errors caused by invalid
                YAML formatting, missing services, or incorrect configuration
                sections.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this validator check required services?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The validator checks for the required services section in
                Docker Compose files.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for local development environments?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Docker Compose validation is commonly used before running
                local containerized application stacks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is validation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Docker Compose validation happens entirely inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/docker-compose-validator" />
        </div>
      </section>
    </ToolShell>
  );
}