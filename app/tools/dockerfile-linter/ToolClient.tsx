"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type LintLevel = "Warning" | "Suggestion" | "Info";

type LintIssue = {
  line: number;
  level: LintLevel;
  rule: string;
  message: string;
};

type Instruction = {
  keyword: string;
  value: string;
  raw: string;
  startLine: number;
  endLine: number;
};

const sampleDockerfile = `# syntax=docker/dockerfile:1
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

USER node
CMD ["node", "server.js"]`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [issues, setIssues] = useState<LintIssue[] | null>(null);
  const [error, setError] = useState("");

  const lint = () => {
    if (!input.trim()) {
      setError("Paste Dockerfile content to review.");
      setIssues(null);
      return;
    }

    try {
      setIssues(checkDockerfile(input));
      setError("");
    } catch (err) {
      setIssues(null);
      setError(
        err instanceof Error ? err.message : "Unable to review this Dockerfile."
      );
    }
  };

  const loadExample = () => {
    setInput(sampleDockerfile);
    setIssues(null);
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setIssues(null);
    setError("");
  };

  const report = issues ? formatLintReport(input, issues) : "";

  return (
    <ToolShell
      title="Dockerfile Linter"
      description="Review Dockerfile text for common package-install, cache, base-image, secret, COPY, ADD, USER, CMD, ENTRYPOINT, and shell-pattern issues."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Dockerfile
        </label>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleDockerfile}
          className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={lint} className="yoryantra-btn">
          Lint Dockerfile
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

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Dockerfile Review
          </h3>
          {report && (
            <button
              onClick={() => navigator.clipboard.writeText(report)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy Report
            </button>
          )}
        </div>

        {issues ? (
          <div className="yoryantra-output">
            <div className="grid gap-4 md:grid-cols-3">
              <CountCard
                label="Warnings"
                value={issues.filter((issue) => issue.level === "Warning").length}
              />
              <CountCard
                label="Suggestions"
                value={issues.filter((issue) => issue.level === "Suggestion").length}
              />
              <CountCard
                label="Informational"
                value={issues.filter((issue) => issue.level === "Info").length}
              />
            </div>

            {issues.length ? (
              <div className="mt-6 space-y-4">
                {issues.map((issue, index) => (
                  <div
                    key={`${issue.rule}-${issue.line}-${index}`}
                    className="rounded-xl border border-gray-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {issue.level}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {issue.rule}
                      </span>
                      {issue.line > 0 && (
                        <span className="text-xs text-gray-500">
                          line {issue.line}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700">
                      {issue.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-gray-700">
                No issues from this tool&apos;s rule set were found. That does
                not prove the Dockerfile builds or that the resulting image is
                secure.
              </p>
            )}
          </div>
        ) : (
          <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
            Dockerfile findings will appear here.
          </pre>
        )}
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Browser Linter Cannot Replace a Docker Build
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool reads Dockerfile text and flags practical patterns. It
            does not execute the Dockerfile, resolve base images, evaluate
            BuildKit features, inspect files from your build context, or prove
            that commands succeed. Use a real Docker or BuildKit build for
            syntax and build verification.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Package Installation and Build Cache
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            For Debian and Ubuntu style images, Docker recommends keeping
            <code> apt-get update</code> and <code>apt-get install</code> in
            the same RUN instruction so an old cached update layer does not
            leave later installs using stale package metadata. This linter also
            checks for common package-cache cleanup patterns and Alpine&apos;s
            <code> apk add --no-cache</code> form.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Secrets Need More Than a Text Scan
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            ENV or ARG instructions containing names such as PASSWORD, TOKEN,
            SECRET, or API_KEY deserve review because build arguments and image
            layers are not a safe secret store. Modern Dockerfile syntax also
            supports BuildKit secret mounts for build-time secrets. The linter
            can flag suspicious text, but it cannot know what files are copied
            by a broad COPY instruction.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Docker References
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://docs.docker.com/build/building/best-practices/"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              Docker build best practices
            </a>
            <a
              href="https://docs.docker.com/reference/dockerfile/"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              Dockerfile reference
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/dockerfile-linter" />
        </div>
      </section>
    </ToolShell>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function checkDockerfile(source: string) {
  const instructions = parseInstructions(source);
  const issues: LintIssue[] = [];

  if (!instructions.length) {
    return [
      {
        line: 0,
        level: "Warning" as const,
        rule: "empty-file",
        message: "No Dockerfile instructions were found.",
      },
    ];
  }

  const fromInstructions = instructions.filter(
    (instruction) => instruction.keyword === "FROM"
  );

  if (!fromInstructions.length) {
    issues.push({
      line: 0,
      level: "Warning",
      rule: "missing-from",
      message:
        "No FROM instruction was found. Normal Dockerfile build stages start from FROM unless a specialized frontend changes the grammar.",
    });
  }

  fromInstructions.forEach((instruction) => {
    const image = getFromImage(instruction.value);
    if (!image) return;

    const imageTail = image.split("/").pop() || image;
    const usesLatest = /:latest$/i.test(imageTail);
    const hasExplicitTag = imageTail.includes(":");
    const hasDigest = image.includes("@");
    const isVariableImage = image.includes("$");

    if (!isVariableImage && (usesLatest || (!hasExplicitTag && !hasDigest))) {
      issues.push({
        line: instruction.startLine,
        level: "Suggestion",
        rule: "base-image-tag",
        message:
          "The base image uses latest or an implicit latest tag. Consider a deliberate version tag or digest when reproducibility matters.",
      });
    }
  });

  const finalStageStart =
    fromInstructions.length > 0
      ? fromInstructions[fromInstructions.length - 1].startLine
      : 1;
  const finalStage = instructions.filter(
    (instruction) => instruction.startLine >= finalStageStart
  );

  if (!finalStage.some((instruction) => instruction.keyword === "WORKDIR")) {
    issues.push({
      line: finalStageStart,
      level: "Suggestion",
      rule: "workdir",
      message:
        "No WORKDIR was found in the final stage. An explicit working directory usually makes COPY, RUN, CMD, and ENTRYPOINT paths easier to reason about.",
    });
  }

  if (!finalStage.some((instruction) => instruction.keyword === "USER")) {
    issues.push({
      line: finalStageStart,
      level: "Suggestion",
      rule: "non-root-user",
      message:
        "No USER instruction was found in the final stage. Where the application allows it, running as a non-root user reduces container privileges.",
    });
  }

  if (
    !finalStage.some(
      (instruction) =>
        instruction.keyword === "CMD" || instruction.keyword === "ENTRYPOINT"
    )
  ) {
    issues.push({
      line: finalStageStart,
      level: "Info",
      rule: "default-command",
      message:
        "The final stage has no CMD or ENTRYPOINT. That can be intentional for base images, but application images often define a default process.",
    });
  }

  instructions.forEach((instruction) => {
    const { keyword, value, raw, startLine } = instruction;

    if (keyword === "MAINTAINER") {
      issues.push({
        line: startLine,
        level: "Suggestion",
        rule: "maintainer",
        message:
          "MAINTAINER is deprecated. Use a LABEL such as org.opencontainers.image.authors instead.",
      });
    }

    if (keyword === "ADD" && looksLikeSimpleLocalAdd(value)) {
      issues.push({
        line: startLine,
        level: "Suggestion",
        rule: "add-vs-copy",
        message:
          "This ADD appears to copy local content without using ADD-specific behavior. COPY communicates that intent more clearly.",
      });
    }

    if (keyword === "COPY" && copiesWholeContext(value)) {
      issues.push({
        line: startLine,
        level: "Suggestion",
        rule: "copy-context",
        message:
          "COPY . can include more build-context files than intended. Review .dockerignore and consider copying dependency files before application source to improve cache reuse.",
      });
    }

    if (keyword === "RUN") {
      lintRunInstruction(instruction, issues);
    }

    if (keyword === "ENV" || keyword === "ARG") {
      const names = getAssignmentNames(value);
      names.forEach((name) => {
        if (/(password|passwd|secret|token|api[_-]?key|private[_-]?key|credential)/i.test(name)) {
          issues.push({
            line: startLine,
            level: "Warning",
            rule: "possible-secret",
            message:
              `${keyword} defines a secret-looking name "${name}". Do not bake sensitive values into image metadata or layers; use an appropriate runtime secret mechanism or BuildKit secret mount.`,
          });
        }
      });

      if (keyword === "ENV" && looksLikeLegacyEnvSyntax(value)) {
        issues.push({
          line: startLine,
          level: "Suggestion",
          rule: "env-syntax",
          message:
            "This ENV instruction appears to use the legacy space-separated key/value form. Prefer ENV key=value for clearer parsing.",
        });
      }
    }

    if (
      (keyword === "COPY" || keyword === "ADD") &&
      /(^|[\s"'\/])(\.env|id_rsa|id_ed25519|credentials(?:\.json)?|.*\.pem)(?=$|[\s"'\/])/i.test(
        raw
      )
    ) {
      issues.push({
        line: startLine,
        level: "Warning",
        rule: "sensitive-copy",
        message:
          "This instruction appears to copy a potentially sensitive file. Confirm that credentials, private keys, and .env files are excluded from the image and build context when they are not intentionally required.",
      });
    }

    if (
      (keyword === "CMD" || keyword === "ENTRYPOINT") &&
      !value.trim().startsWith("[")
    ) {
      issues.push({
        line: startLine,
        level: "Info",
        rule: "shell-form-command",
        message:
          `${keyword} uses shell form. JSON exec form can make signal handling and argument boundaries more predictable for application processes.`,
      });
    }
  });

  return dedupeIssues(issues);
}

function parseInstructions(source: string) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const instructions: Instruction[] = [];
  let buffer = "";
  let startLine = 0;

  const flush = (endLine: number) => {
    const raw = buffer.trim();
    buffer = "";
    if (!raw) return;

    const match = raw.match(/^([A-Za-z]+)\s+([\s\S]*)$/);
    if (!match) return;

    instructions.push({
      keyword: match[1].toUpperCase(),
      value: match[2].trim(),
      raw,
      startLine,
      endLine,
    });
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (!buffer && (!trimmed || trimmed.startsWith("#"))) return;

    if (!buffer) startLine = lineNumber;

    const continued = /\\\s*$/.test(line);
    const piece = continued ? line.replace(/\\\s*$/, "") : line;
    buffer += `${buffer ? " " : ""}${piece.trim()}`;

    if (!continued) flush(lineNumber);
  });

  if (buffer) flush(lines.length);

  return instructions;
}

function lintRunInstruction(instruction: Instruction, issues: LintIssue[]) {
  const text = instruction.value;
  const lower = text.toLowerCase();

  if (/\bsudo\b/.test(lower)) {
    issues.push({
      line: instruction.startLine,
      level: "Suggestion",
      rule: "sudo",
      message:
        "RUN uses sudo. Docker build steps normally run as the current build user, so sudo is usually unnecessary and may not exist in the image.",
    });
  }

  if (/\b(curl|wget)\b[\s\S]*\|\s*(sh|bash)\b/i.test(text)) {
    issues.push({
      line: instruction.startLine,
      level: "Warning",
      rule: "remote-script-pipe",
      message:
        "A downloaded script is piped directly into a shell. Review integrity, version pinning, and verification instead of executing remote content blindly.",
    });
  }

  if (/\bapt-get\s+install\b/i.test(text)) {
    if (!/\bapt-get\s+update\b/i.test(text)) {
      issues.push({
        line: instruction.startLine,
        level: "Warning",
        rule: "apt-update-install",
        message:
          "apt-get install appears without apt-get update in the same RUN instruction. Docker recommends combining them to avoid stale cached package indexes.",
      });
    }

    if (!/--no-install-recommends\b/i.test(text)) {
      issues.push({
        line: instruction.startLine,
        level: "Suggestion",
        rule: "apt-recommends",
        message:
          "Consider --no-install-recommends when recommended packages are not required by the image.",
      });
    }

    if (!/rm\s+-rf\s+\/var\/lib\/apt\/lists\/\*/i.test(text)) {
      issues.push({
        line: instruction.startLine,
        level: "Suggestion",
        rule: "apt-lists",
        message:
          "Consider removing /var/lib/apt/lists/* in the same RUN instruction after apt package installation to avoid retaining package-list data in that layer.",
      });
    }
  }

  if (/\bapt-get\s+update\b/i.test(text) && !/\bapt-get\s+install\b/i.test(text)) {
    issues.push({
      line: instruction.startLine,
      level: "Warning",
      rule: "apt-update-alone",
      message:
        "apt-get update is in a separate RUN instruction. Docker documents cache problems with this pattern; combine update and install when they belong to the same package-install step.",
    });
  }

  if (/\bapk\s+add\b/i.test(text) && !/\bapk\s+add\b[\s\S]*--no-cache\b/i.test(text)) {
    issues.push({
      line: instruction.startLine,
      level: "Suggestion",
      rule: "apk-cache",
      message:
        "Consider apk add --no-cache when package-index caching is not needed in the image layer.",
    });
  }
}

function getFromImage(value: string) {
  const tokens = value.split(/\s+/);
  let index = 0;
  while (tokens[index]?.startsWith("--")) index += 1;
  return tokens[index] || "";
}

function copiesWholeContext(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();

  if (compact.startsWith("[")) {
    try {
      const parsed = JSON.parse(compact) as unknown;
      return (
        Array.isArray(parsed) &&
        parsed.length >= 2 &&
        parsed.slice(0, -1).some((item) => item === ".")
      );
    } catch {
      return false;
    }
  }

  const tokens = compact.split(/\s+/).filter(Boolean);
  const withoutOptions = tokens.filter((token) => !token.startsWith("--"));
  return withoutOptions.slice(0, -1).includes(".");
}

function looksLikeSimpleLocalAdd(value: string) {
  return !/https?:\/\//i.test(value) && !/\.tar(\.(gz|bz2|xz))?\b/i.test(value);
}

function getAssignmentNames(value: string) {
  const names: string[] = [];
  const matches = value.match(/[A-Za-z_][A-Za-z0-9_]*(?=\s*=)/g);
  if (matches) names.push(...matches);

  if (!names.length) {
    const first = value.trim().split(/\s+/)[0];
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(first)) names.push(first);
  }

  return names;
}

function looksLikeLegacyEnvSyntax(value: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*\s+[^=]/.test(value.trim());
}

function dedupeIssues(issues: LintIssue[]) {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.line}|${issue.rule}|${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatLintReport(source: string, issues: LintIssue[]) {
  const instructionCount = parseInstructions(source).length;
  const lines = [
    `Instructions reviewed: ${instructionCount}`,
    `Warnings: ${issues.filter((issue) => issue.level === "Warning").length}`,
    `Suggestions: ${issues.filter((issue) => issue.level === "Suggestion").length}`,
    `Informational: ${issues.filter((issue) => issue.level === "Info").length}`,
    "",
  ];

  if (!issues.length) {
    lines.push(
      "No issues from this browser rule set were found.",
      "A real Docker/BuildKit build is still required to validate the Dockerfile and build context."
    );
    return lines.join("\n");
  }

  issues.forEach((issue, index) => {
    lines.push(
      `${index + 1}. ${issue.level}${issue.line ? ` · line ${issue.line}` : ""} · ${issue.rule}`,
      `   ${issue.message}`,
      ""
    );
  });

  return lines.join("\n").trim();
}
