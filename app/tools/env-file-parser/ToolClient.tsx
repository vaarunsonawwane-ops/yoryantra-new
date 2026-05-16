"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseEnv = () => {
    try {
      if (!input.trim()) {
        setError("Please enter .env content.");
        setOutput("");
        return;
      }

      const parsed: Record<string, string> = {};

      input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .forEach((line) => {
          const index = line.indexOf("=");

          if (index === -1) return;

          const key = line.slice(0, index).trim();
          const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");

          parsed[key] = value;
        });

      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Unable to parse .env file.");
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
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          .env Content
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`DATABASE_URL=postgres://localhost:5432/app
API_KEY=your_secret_key`}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseEnv} className="yoryantra-btn">
          Parse .env
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed Output
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
          {output || "Parsed .env output will appear here..."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
  {/* ABOUT */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900">
      About This .env File Parser
    </h2>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This .env File Parser helps developers parse environment variable
      files into structured JSON instantly. It is useful for backend
      development, cloud deployments, Docker containers, local
      development setups, CI/CD workflows, and debugging application
      configuration files.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      Environment variable files are commonly used in frameworks and
      platforms such as Next.js, Node.js, Laravel, Express, Python,
      Docker, Kubernetes, and serverless applications. These files often
      contain API keys, database URLs, authentication secrets, feature
      flags, and deployment configuration values.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This tool converts raw .env content into readable JSON format for
      easier inspection, debugging, formatting, and validation directly
      inside your browser.
    </p>
  </div>

  {/* HOW TO USE */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      How to Use the .env File Parser
    </h2>

    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
      <li>Paste your .env file content into the input box.</li>

      <li>
        Click <strong>Parse .env</strong>.
      </li>

      <li>
        Review the parsed JSON output generated from the environment
        variables.
      </li>

      <li>
        Copy the formatted output for debugging or development workflows.
      </li>
    </ol>
  </div>

  {/* COMMON USE CASES */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Common Use Cases
    </h2>

    <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
      <li>Parsing local development .env files.</li>

      <li>Debugging deployment environment variables.</li>

      <li>Inspecting API keys and application settings.</li>

      <li>Converting .env values into JSON format.</li>

      <li>Reviewing backend configuration files.</li>

      <li>Testing Docker and cloud deployment setups.</li>

      <li>Analyzing CI/CD pipeline environment variables.</li>
    </ul>
  </div>

  {/* EXAMPLE */}
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

  {/* FAQ */}
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
          during development and deployment. These files commonly contain
          database credentials, API keys, URLs, secrets, and application
          configuration values.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Why parse .env files?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          Parsing .env files makes environment variables easier to read,
          debug, validate, and convert into structured formats such as
          JSON for development workflows.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Does this tool upload my .env file?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          No. All parsing happens directly inside your browser. Your
          environment variables and configuration data are never uploaded
          to a server.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Which frameworks use .env files?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          .env files are commonly used in Next.js, Node.js, React,
          Express, Laravel, Python, Docker, Kubernetes, and many cloud
          deployment environments.
        </p>
      </div>
    </div>
  </div>

  {/* RELATED TOOLS */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Related Tools
    </h2>

    <div className="mt-4 flex flex-wrap gap-3">
      <Link
        href="/tools/json-formatter"
        className="yoryantra-btn-outline"
      >
        JSON Formatter
      </Link>

      <Link
        href="/tools/docker-compose-validator"
        className="yoryantra-btn-outline"
      >
        Docker Compose Validator
      </Link>

      <Link
        href="/tools/kubernetes-yaml-validator"
        className="yoryantra-btn-outline"
      >
        Kubernetes YAML Validator
      </Link>

      <Link
        href="/tools/api-key-generator"
        className="yoryantra-btn-outline"
      >
        API Key Generator
      </Link>

      <Link
        href="/tools/curl-command-builder"
        className="yoryantra-btn-outline"
      >
        CURL Command Builder
      </Link>
    </div>
  </div>
</section>
    </ToolShell>
  );
}