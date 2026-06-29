"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type LintIssue = {
  line: number;
  level: "Warning" | "Suggestion";
  message: string;
};

const sampleDockerfile = `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const lintDockerfile = () => {
    if (!input.trim()) {
      setError("Please enter Dockerfile content to check.");
      setOutput("");
      return;
    }

    const issues = checkDockerfile(input);
    const result = formatLintResult(input, issues);

    setOutput(result);
    setError("");
  };

  const loadExample = () => {
    setInput(sampleDockerfile);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Dockerfile Linter"
      description="Check Dockerfile content for common issues, risky patterns, and basic Dockerfile best practices in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Dockerfile Input
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleDockerfile}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={lintDockerfile} className="yoryantra-btn">
          Check Dockerfile
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Lint Result
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "Dockerfile lint result will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Dockerfiles for Common Issues Before Building Images
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Dockerfiles are used to define how container images are built.
            Small mistakes in a Dockerfile can create larger images, slower
            builds, missing runtime files, security risks, or deployment
            problems later.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Dockerfile Linter helps you check Dockerfile content for common
            issues such as missing base images, risky root usage, unpinned base
            images, unnecessary cache files, exposed secrets, and basic Docker
            best practice problems directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing Dockerfile Syntax and Build Instructions
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your Dockerfile content into the input box.</li>
            <li>
              Click <strong>Check Dockerfile</strong>.
            </li>
            <li>Review the warnings and suggestions in the output.</li>
            <li>Update your Dockerfile before building or deploying the image.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Dockerfile Lint Checks
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking whether a Dockerfile has a <strong>FROM</strong> instruction.</li>
            <li>Finding unpinned base images such as <strong>latest</strong>.</li>
            <li>Reviewing risky package installation patterns.</li>
            <li>Checking whether a non-root user is configured.</li>
            <li>Finding possible secret values copied into the image.</li>
            <li>Reviewing common Dockerfile best practice suggestions.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Dockerfile to Check
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleDockerfile}
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
                What does a Dockerfile linter check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Dockerfile linter checks Dockerfile content for common issues,
                risky patterns, missing instructions, and basic best practice
                problems that may affect image builds or deployments.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool replace a full Docker build?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool is meant for quick checks before building an
                image. A real Docker build is still needed to confirm that the
                image builds and runs correctly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why should I avoid using latest in Docker images?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The latest tag can change over time. Pinning a more specific
                image version makes builds easier to repeat and reduces
                unexpected changes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this Dockerfile checker upload my file?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The Dockerfile check happens directly in your browser. Your
                Dockerfile content is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/dockerfile-linter" />
        </div>
      </section>
    </ToolShell>
  );
}

function checkDockerfile(source: string) {
  const lines = source.split(/\r?\n/);
  const issues: LintIssue[] = [];
  const normalizedLines = lines.map((line) => line.trim());
  const nonEmptyLines = normalizedLines.filter(Boolean);

  const hasFrom = normalizedLines.some((line) => /^FROM\s+/i.test(line));
  const hasWorkdir = normalizedLines.some((line) => /^WORKDIR\s+/i.test(line));
  const hasCmdOrEntrypoint = normalizedLines.some((line) =>
    /^(CMD|ENTRYPOINT)\s+/i.test(line)
  );
  const hasUser = normalizedLines.some((line) => /^USER\s+/i.test(line));
  const hasCopyDot = normalizedLines.some((line) => /^COPY\s+\.\s+/i.test(line));
  const hasAptInstall = normalizedLines.some((line) =>
    /apt(-get)?\s+install/i.test(line)
  );
  const hasApkAdd = normalizedLines.some((line) => /apk\s+add/i.test(line));

  if (!nonEmptyLines.length) {
    issues.push({
      line: 0,
      level: "Warning",
      message: "Dockerfile content is empty.",
    });

    return issues;
  }

  if (!hasFrom) {
    issues.push({
      line: 0,
      level: "Warning",
      message: "Missing FROM instruction. A Dockerfile should start from a base image.",
    });
  }

  if (!hasWorkdir) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "Consider adding WORKDIR to make file paths clearer inside the image.",
    });
  }

  if (!hasCmdOrEntrypoint) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "Consider adding CMD or ENTRYPOINT to define the default container command.",
    });
  }

  if (!hasUser) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "Consider using a non-root USER when possible for safer containers.",
    });
  }

  if (hasCopyDot) {
    issues.push({
      line: findLine(lines, /^COPY\s+\.\s+/i),
      level: "Suggestion",
      message: "COPY . can include unnecessary files. Use a .dockerignore file to keep images smaller.",
    });
  }

  if (hasAptInstall) {
    issues.push({
      line: findLine(lines, /apt(-get)?\s+install/i),
      level: "Suggestion",
      message:
        "For apt installs, consider using --no-install-recommends and cleaning apt cache in the same layer.",
    });
  }

  if (hasApkAdd) {
    issues.push({
      line: findLine(lines, /apk\s+add/i),
      level: "Suggestion",
      message:
        "For Alpine images, consider using apk add --no-cache to avoid keeping package cache.",
    });
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (/^FROM\s+.+:latest$/i.test(trimmed) || /^FROM\s+[^:\s]+$/i.test(trimmed)) {
      issues.push({
        line: index + 1,
        level: "Suggestion",
        message:
          "Consider pinning the base image version instead of relying on latest or an implicit tag.",
      });
    }

    if (/^(ADD)\s+/i.test(trimmed)) {
      issues.push({
        line: index + 1,
        level: "Suggestion",
        message:
          "Use COPY instead of ADD unless you specifically need ADD behavior such as archive extraction or remote URLs.",
      });
    }

    if (/password|secret|token|api[_-]?key/i.test(trimmed)) {
      issues.push({
        line: index + 1,
        level: "Warning",
        message:
          "Possible secret value found. Avoid copying passwords, tokens, or API keys into Docker images.",
      });
    }

    if (/^RUN\s+.*sudo\s+/i.test(trimmed)) {
      issues.push({
        line: index + 1,
        level: "Suggestion",
        message:
          "Avoid sudo inside Dockerfiles. Docker build steps usually run as root unless changed.",
      });
    }

    if (/^RUN\s+.*(curl|wget)\s+.*\|\s*(sh|bash)/i.test(trimmed)) {
      issues.push({
        line: index + 1,
        level: "Warning",
        message:
          "Piping downloaded scripts directly to sh/bash can be risky. Review and verify scripts before running them.",
      });
    }
  });

  return issues;
}

function formatLintResult(source: string, issues: LintIssue[]) {
  const lines = source.split(/\r?\n/).filter((line) => line.trim());
  const warningCount = issues.filter((issue) => issue.level === "Warning").length;
  const suggestionCount = issues.filter(
    (issue) => issue.level === "Suggestion"
  ).length;

  if (!issues.length) {
    return [
      "No common Dockerfile issues found.",
      "",
      `Checked ${lines.length} non-empty line${lines.length === 1 ? "" : "s"}.`,
      "",
      "This does not replace a real Docker build, but the Dockerfile passed the basic checks in this browser tool.",
    ].join("\n");
  }

  const result = [
    "Dockerfile check completed.",
    "",
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
    "Issues found:",
    "",
  ];

  issues.forEach((issue, index) => {
    result.push(
      `${index + 1}. ${issue.level}${issue.line ? ` on line ${issue.line}` : ""}: ${issue.message}`
    );
  });

  return result.join("\n");
}

function findLine(lines: string[], pattern: RegExp) {
  const index = lines.findIndex((line) => pattern.test(line.trim()));
  return index >= 0 ? index + 1 : 0;
}
