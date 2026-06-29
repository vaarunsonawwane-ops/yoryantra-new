"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const parseEnv = () => {
    try {
      if (!input.trim()) {
        setError(
          "Please enter .env content."
        );

        setOutput("");
        return;
      }

      const parsed: Record<
        string,
        string
      > = {};

      input
        .split("\n")
        .map((line) =>
          line.trim()
        )
        .filter(
          (line) =>
            line &&
            !line.startsWith("#")
        )
        .forEach((line) => {
          const index =
            line.indexOf("=");

          if (index === -1)
            return;

          const key = line
            .slice(0, index)
            .trim();

          const value = line
            .slice(index + 1)
            .trim()
            .replace(
              /^["']|["']$/g,
              ""
            );

          parsed[key] = value;
        });

      setOutput(
        JSON.stringify(
          parsed,
          null,
          2
        )
      );

      setError("");
    } catch {
      setError(
        "Unable to parse .env file."
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
      title=".env File Parser"
      description="Parse and format .env files instantly with this free online .env File Parser."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          .env Content
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder={`DATABASE_URL=postgres://localhost:5432/app
API_KEY=your_secret_key`}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={parseEnv}
          className="yoryantra-btn"
        >
          Parse .env
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
            Parsed Output
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

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "Parsed .env output will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          .env parsing happens locally inside your browser. Environment
          variables, API keys, and configuration values are not uploaded,
          stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reading .env Files Without Missing Broken Variables
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            .env file parsing helps developers inspect environment variables,
            API keys, database credentials, authentication secrets, deployment
            configuration, cloud service URLs, feature flags, and backend
            application settings more easily.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Environment variable files are commonly used in Next.js, Node.js,
            Express, Laravel, Docker, Kubernetes, Python applications, CI/CD
            pipelines, and cloud deployment systems. Broken formatting or
            missing values can cause application startup failures and deployment
            issues.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This .env File Parser converts raw environment variables into
            readable JSON output directly inside your browser without requiring
            backend processing or external APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the .env File Parser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your .env file content into the editor.
            </li>

            <li>
              Click <strong>Parse .env</strong>.
            </li>

            <li>
              Review the generated JSON output instantly.
            </li>

            <li>
              Copy the parsed configuration for debugging or development
              workflows.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Parsing local development .env files.
            </li>

            <li>
              Debugging deployment environment variables.
            </li>

            <li>
              Inspecting API keys and application settings.
            </li>

            <li>
              Converting .env values into JSON format.
            </li>

            <li>
              Reviewing backend configuration files.
            </li>

            <li>
              Testing Docker and Kubernetes deployments.
            </li>

            <li>
              Analyzing CI/CD pipeline environment variables.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example .env File
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`DATABASE_URL=postgres://localhost:5432/app
API_KEY=your_secret_key
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Environment Variable Parsing Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Cleaner debugging:</strong> Structured output makes
                environment variables easier to inspect.
              </li>

              <li>
                <strong>Safer deployments:</strong> Detect broken or missing
                variables before production releases.
              </li>

              <li>
                <strong>Better DevOps workflows:</strong> Review deployment
                configuration more efficiently.
              </li>

              <li>
                <strong>Improved readability:</strong> JSON formatting reduces
                configuration confusion during development.
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
                What is a .env file?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A .env file stores environment variables used by applications
                during development and deployment.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why parse .env files?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Parsing makes environment variables easier to read, debug,
                validate, and inspect during backend and DevOps workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which frameworks use .env files?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                .env files are commonly used in Next.js, Node.js, Express,
                Laravel, Docker, Kubernetes, Python applications, and cloud
                deployment systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool upload my .env file?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. All parsing happens directly inside your browser.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is parsing processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. .env parsing happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/env-file-parser" />
        </div>
      </section>
    </ToolShell>
  );
}