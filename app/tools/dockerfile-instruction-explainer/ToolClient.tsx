"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "explanations" | "json" | "markdown" | "csv" | "checklist";
type DetailLevel = "simple" | "balanced" | "detailed";
type BuildTarget = "general" | "node" | "python" | "go" | "static" | "multiStage";

type DockerInstruction = {
  lineNumber: number;
  instruction: string;
  value: string;
  explanation: string;
  note: string;
  category: "base" | "files" | "build" | "runtime" | "metadata" | "security" | "other";
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  instructions: DockerInstruction[];
  issues: Issue[];
  output: string;
  instructionCount: number;
  stageCount: number;
  runCount: number;
  hasUser: boolean;
  hasHealthcheck: boolean;
};

const sampleDockerfile = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
USER node
EXPOSE 3000
CMD ["npm", "start"]`;

const instructionExplanations: Record<string, { explanation: string; note: string; category: DockerInstruction["category"] }> = {
  FROM: {
    explanation: "Sets the base image for a build stage.",
    note: "Every Dockerfile needs at least one FROM instruction. Multi-stage builds use more than one FROM.",
    category: "base",
  },
  RUN: {
    explanation: "Runs a command while building the image and stores the result in a new image layer.",
    note: "Use RUN for build-time installation, compilation, and setup work.",
    category: "build",
  },
  COPY: {
    explanation: "Copies files or folders from the build context into the image.",
    note: "COPY is usually preferred when you only need local files from your project.",
    category: "files",
  },
  ADD: {
    explanation: "Copies files into the image and can also unpack archives or fetch remote URLs.",
    note: "Prefer COPY unless you specifically need ADD behavior.",
    category: "files",
  },
  CMD: {
    explanation: "Provides the default command that runs when a container starts.",
    note: "A Dockerfile usually has one final CMD. Later CMD instructions override earlier ones.",
    category: "runtime",
  },
  ENTRYPOINT: {
    explanation: "Sets the main executable for the container.",
    note: "ENTRYPOINT is useful when the image should always run the same executable.",
    category: "runtime",
  },
  ENV: {
    explanation: "Sets environment variables inside the image and at container runtime.",
    note: "Avoid baking real secrets into ENV values.",
    category: "metadata",
  },
  ARG: {
    explanation: "Defines a build-time variable available during docker build.",
    note: "ARG is not the same as ENV, but ARG values can still appear in image history.",
    category: "metadata",
  },
  EXPOSE: {
    explanation: "Documents the port the containerized app expects to listen on.",
    note: "EXPOSE does not publish the port by itself. Use docker run -p or Compose port mappings.",
    category: "runtime",
  },
  WORKDIR: {
    explanation: "Sets the working directory for following instructions.",
    note: "WORKDIR is cleaner than repeatedly using cd inside RUN commands.",
    category: "build",
  },
  USER: {
    explanation: "Sets which user runs following instructions and the container process.",
    note: "Running as a non-root user is usually safer for runtime containers.",
    category: "security",
  },
  HEALTHCHECK: {
    explanation: "Defines a command Docker can run to check whether the container is healthy.",
    note: "Health checks are useful for services that need runtime readiness checks.",
    category: "runtime",
  },
  LABEL: {
    explanation: "Adds metadata to the image.",
    note: "Labels can document maintainers, source repositories, versions, and descriptions.",
    category: "metadata",
  },
  VOLUME: {
    explanation: "Declares a mount point for persistent or external data.",
    note: "Use carefully because volumes can change how files are persisted at runtime.",
    category: "runtime",
  },
  SHELL: {
    explanation: "Changes the default shell used by shell-form RUN, CMD, and ENTRYPOINT.",
    note: "This is useful for Windows containers or advanced shell behavior.",
    category: "build",
  },
  ONBUILD: {
    explanation: "Registers a trigger instruction that runs when another image uses this image as a base.",
    note: "ONBUILD can surprise downstream users, so document it clearly.",
    category: "other",
  },
  STOPSIGNAL: {
    explanation: "Sets the system call signal used to stop the container.",
    note: "Useful when the main process handles a specific shutdown signal.",
    category: "runtime",
  },
};

export default function ToolClient() {
  const [dockerfile, setDockerfile] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("balanced");
  const [buildTarget, setBuildTarget] = useState<BuildTarget>("general");
  const [warnRootUser, setWarnRootUser] = useState(true);
  const [warnSecrets, setWarnSecrets] = useState(true);
  const [warnLatestTag, setWarnLatestTag] = useState(true);
  const [warnAddUsage, setWarnAddUsage] = useState(true);
  const [warnMissingHealthcheck, setWarnMissingHealthcheck] = useState(true);
  const [warnManyRunLayers, setWarnManyRunLayers] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result, buildTarget) : []), [result, buildTarget]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const explainDockerfile = () => {
    if (!dockerfile.trim()) {
      setError("Please paste a Dockerfile.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      dockerfile,
      outputMode,
      detailLevel,
      buildTarget,
      warnRootUser,
      warnSecrets,
      warnLatestTag,
      warnAddUsage,
      warnMissingHealthcheck,
      warnManyRunLayers,
    });

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setDockerfile(sampleDockerfile);
    setOutputMode("summary");
    setDetailLevel("balanced");
    setBuildTarget("node");
    setWarnRootUser(true);
    setWarnSecrets(true);
    setWarnLatestTag(true);
    setWarnAddUsage(true);
    setWarnMissingHealthcheck(true);
    setWarnManyRunLayers(true);
    clearResult();
  };

  const resetAll = () => {
    setDockerfile("");
    setOutputMode("summary");
    setDetailLevel("balanced");
    setBuildTarget("general");
    setWarnRootUser(true);
    setWarnSecrets(true);
    setWarnLatestTag(true);
    setWarnAddUsage(true);
    setWarnMissingHealthcheck(true);
    setWarnManyRunLayers(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Dockerfile Instruction Explainer"
      description="Explain Dockerfile instructions such as FROM, RUN, COPY, ADD, CMD, ENTRYPOINT, ENV, ARG, EXPOSE, WORKDIR, USER, HEALTHCHECK, and common Dockerfile mistakes."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Dockerfile Input
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a Dockerfile to explain each instruction and find common build or runtime issues.
            </p>
          </div>

          <textarea
            value={dockerfile}
            onChange={(event) => {
              setDockerfile(event.target.value);
              clearResult();
            }}
            placeholder={sampleDockerfile}
            spellCheck={false}
            className="w-full min-h-[460px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Explanation Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Summary", value: "summary" },
                { label: "Instruction explanations", value: "explanations" },
                { label: "JSON", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Detail Level"
              value={detailLevel}
              onChange={(value) => {
                setDetailLevel(value as DetailLevel);
                clearResult();
              }}
              options={[
                { label: "Simple", value: "simple" },
                { label: "Balanced", value: "balanced" },
                { label: "Detailed", value: "detailed" },
              ]}
            />

            <YoryantraSelect
              label="Build Target"
              value={buildTarget}
              onChange={(value) => {
                setBuildTarget(value as BuildTarget);
                clearResult();
              }}
              options={[
                { label: "General", value: "general" },
                { label: "Node.js app", value: "node" },
                { label: "Python app", value: "python" },
                { label: "Go app", value: "go" },
                { label: "Static site", value: "static" },
                { label: "Multi-stage build", value: "multiStage" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">Common instructions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["FROM", "RUN", "COPY", "CMD", "ENTRYPOINT", "ENV", "USER", "EXPOSE"].map((item) => (
                  <span key={item} className="rounded-full border border-gray-200 bg-white px-2.5 py-1 font-mono text-xs text-gray-500">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Checks</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={warnRootUser} label="Warn when no non-root USER is set" onChange={(checked) => { setWarnRootUser(checked); clearResult(); }} />
          <CheckboxRow checked={warnSecrets} label="Warn about possible secrets in ENV or ARG" onChange={(checked) => { setWarnSecrets(checked); clearResult(); }} />
          <CheckboxRow checked={warnLatestTag} label="Warn about latest or unpinned base image tags" onChange={(checked) => { setWarnLatestTag(checked); clearResult(); }} />
          <CheckboxRow checked={warnAddUsage} label="Warn when ADD may be better as COPY" onChange={(checked) => { setWarnAddUsage(checked); clearResult(); }} />
          <CheckboxRow checked={warnMissingHealthcheck} label="Warn when HEALTHCHECK is missing" onChange={(checked) => { setWarnMissingHealthcheck(checked); clearResult(); }} />
          <CheckboxRow checked={warnManyRunLayers} label="Warn when many RUN layers are used" onChange={(checked) => { setWarnManyRunLayers(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          These checks are practical hints for Dockerfile reviews. They do not replace testing, scanning, or build logs.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={explainDockerfile} className="yoryantra-btn">
          Explain Dockerfile
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
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

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Instructions" value={result.instructionCount.toLocaleString()} />
          <SummaryCard label="Build Stages" value={result.stageCount.toLocaleString()} />
          <SummaryCard label="RUN Layers" value={result.runCount.toLocaleString()} />
          <SummaryCard label="Findings" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.instructions.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Instruction Breakdown</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Instruction</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Meaning</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.instructions.map((instruction) => (
                  <tr key={`${instruction.lineNumber}-${instruction.instruction}-${instruction.value}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{instruction.lineNumber}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{instruction.instruction}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[260px] break-words">{instruction.value || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="block max-w-[300px]">{instruction.explanation}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="block max-w-[300px]">{instruction.note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Dockerfile findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Dockerfile review guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "Dockerfile explanation output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Understanding Dockerfile Instructions Before You Build</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Dockerfiles are easy to copy but harder to review. A small instruction such as RUN, COPY, USER, or CMD can affect image size, cache behavior, security, and how the container starts.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Dockerfile Instruction Explainer breaks down each instruction, explains what it does, and highlights common issues such as missing non-root users, possible secrets, unpinned image tags, and unnecessary ADD usage.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Dockerfile Instruction Explainer</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a Dockerfile into the input box.</li>
            <li>Choose the output format and target app type.</li>
            <li>Keep the checks that match your review style.</li>
            <li>Review the instruction table and findings.</li>
            <li>Copy the summary, explanation table, JSON, Markdown, CSV, or checklist output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Dockerfile Instructions Explained</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>FROM</strong> chooses the base image and starts a build stage.</li>
            <li><strong>RUN</strong> executes build-time commands.</li>
            <li><strong>COPY</strong> copies project files into the image.</li>
            <li><strong>CMD</strong> sets the default container command.</li>
            <li><strong>ENTRYPOINT</strong> sets the main executable.</li>
            <li><strong>ENV</strong> stores environment variables in the image.</li>
            <li><strong>USER</strong> changes which user runs the process.</li>
            <li><strong>HEALTHCHECK</strong> defines runtime health behavior.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Dockerfile Snippet</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "start"]`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dockerfile Review Is About Intent</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Not every warning means the Dockerfile is wrong. For example, a missing health check may be fine for a one-off job, and multiple RUN instructions may be useful while debugging. The important part is knowing what each instruction does before shipping the image.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this explainer as a practical review helper, then confirm behavior with Docker build output, container logs, security scans, and runtime tests.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Dockerfile Instruction Explainer do?">
              It reads a pasted Dockerfile and explains each instruction, along with practical notes and common warnings.
            </Faq>

            <Faq title="Does this build my Docker image?">
              No. It only analyzes the Dockerfile text in your browser.
            </Faq>

            <Faq title="Can it detect secrets in Dockerfiles?">
              It can flag common secret-looking ENV or ARG names, but it is not a full secret scanner.
            </Faq>

            <Faq title="Does it replace Docker linting tools?">
              No. It is a readable explanation and review helper. Use dedicated linters and scanners for strict CI checks.
            </Faq>

            <Faq title="Is anything uploaded when I explain a Dockerfile?">
              No. The analysis runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/dockerfile-instruction-explainer" />
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function buildResult(options: {
  dockerfile: string;
  outputMode: OutputMode;
  detailLevel: DetailLevel;
  buildTarget: BuildTarget;
  warnRootUser: boolean;
  warnSecrets: boolean;
  warnLatestTag: boolean;
  warnAddUsage: boolean;
  warnMissingHealthcheck: boolean;
  warnManyRunLayers: boolean;
}): Result {
  const instructions = parseDockerfile(options.dockerfile, options.detailLevel);
  const issues = buildIssues(instructions, options);
  const stageCount = instructions.filter((item) => item.instruction === "FROM").length;
  const runCount = instructions.filter((item) => item.instruction === "RUN").length;
  const hasUser = instructions.some((item) => item.instruction === "USER");
  const hasHealthcheck = instructions.some((item) => item.instruction === "HEALTHCHECK");
  const base = {
    instructions,
    issues,
    instructionCount: instructions.length,
    stageCount,
    runCount,
    hasUser,
    hasHealthcheck,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function parseDockerfile(value: string, detailLevel: DetailLevel) {
  const logicalLines = combineDockerfileLines(value);

  return logicalLines
    .map((entry) => {
      const match = entry.text.match(/^([A-Za-z]+)\s*(.*)$/);
      if (!match) return null;

      const instruction = match[1].toUpperCase();
      const info = instructionExplanations[instruction] || {
        explanation: "Dockerfile instruction or parser directive.",
        note: "Check Docker documentation for exact behavior if this is a less common instruction.",
        category: "other" as DockerInstruction["category"],
      };

      return {
        lineNumber: entry.lineNumber,
        instruction,
        value: match[2].trim(),
        explanation: detailLevel === "simple" ? simplify(info.explanation) : info.explanation,
        note: detailLevel === "detailed" ? addDetailedNote(instruction, info.note) : info.note,
        category: info.category,
      };
    })
    .filter((item): item is DockerInstruction => Boolean(item));
}

function combineDockerfileLines(value: string) {
  const lines = value.split(/\r?\n/);
  const entries: { lineNumber: number; text: string }[] = [];
  let buffer = "";
  let startLine = 1;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) return;

    if (!buffer) startLine = lineNumber;

    if (trimmed.endsWith("\\")) {
      buffer += `${trimmed.slice(0, -1)} `;
    } else {
      buffer += trimmed;
      entries.push({ lineNumber: startLine, text: buffer.trim() });
      buffer = "";
    }
  });

  if (buffer.trim()) {
    entries.push({ lineNumber: startLine, text: buffer.trim() });
  }

  return entries;
}

function simplify(value: string) {
  return value.replace(/\s+and\s+.*$/, ".");
}

function addDetailedNote(instruction: string, note: string) {
  if (instruction === "RUN") return `${note} Combine related commands carefully to reduce layers, but keep readability.`;
  if (instruction === "COPY") return `${note} Use a .dockerignore file to keep unnecessary files out of the build context.`;
  if (instruction === "FROM") return `${note} Pin image versions intentionally for more predictable builds.`;
  return note;
}

function buildIssues(instructions: DockerInstruction[], options: {
  buildTarget: BuildTarget;
  warnRootUser: boolean;
  warnSecrets: boolean;
  warnLatestTag: boolean;
  warnAddUsage: boolean;
  warnMissingHealthcheck: boolean;
  warnManyRunLayers: boolean;
}) {
  const issues: Issue[] = [];
  const fromValues = instructions.filter((item) => item.instruction === "FROM").map((item) => item.value);
  const hasUser = instructions.some((item) => item.instruction === "USER");
  const hasHealthcheck = instructions.some((item) => item.instruction === "HEALTHCHECK");
  const runCount = instructions.filter((item) => item.instruction === "RUN").length;
  const addCount = instructions.filter((item) => item.instruction === "ADD").length;

  if (instructions.length === 0) {
    issues.push({
      severity: "warning",
      title: "No Dockerfile instructions found",
      message: "The input did not contain recognizable Dockerfile instructions.",
    });
  }

  if (options.warnRootUser && !hasUser) {
    issues.push({
      severity: "warning",
      title: "No USER instruction found",
      message: "Without USER, the runtime process may run as root depending on the base image.",
    });
  }

  if (options.warnMissingHealthcheck && !hasHealthcheck && ["node", "python", "go", "general"].includes(options.buildTarget)) {
    issues.push({
      severity: "info",
      title: "No HEALTHCHECK instruction found",
      message: "Services often benefit from a runtime health check, though one-off jobs may not need it.",
    });
  }

  if (options.warnLatestTag && fromValues.some((value) => /:latest\b/.test(value) || !value.includes(":"))) {
    issues.push({
      severity: "info",
      title: "Base image may be unpinned",
      message: "Using latest or omitting a tag can make builds less predictable over time.",
    });
  }

  if (options.warnAddUsage && addCount > 0) {
    issues.push({
      severity: "info",
      title: "ADD instruction used",
      message: "Prefer COPY unless you need ADD features such as archive extraction.",
    });
  }

  if (options.warnManyRunLayers && runCount >= 6) {
    issues.push({
      severity: "info",
      title: "Many RUN instructions",
      message: "Many RUN instructions can increase layers. Combine related commands when it improves image size without hurting readability.",
    });
  }

  if (options.warnSecrets) {
    const secretLike = instructions.filter((item) =>
      ["ENV", "ARG"].includes(item.instruction) &&
      /(SECRET|TOKEN|PASSWORD|API_KEY|PRIVATE_KEY|ACCESS_KEY)/i.test(item.value)
    );

    if (secretLike.length > 0) {
      issues.push({
        severity: "high",
        title: "Possible secret in ENV or ARG",
        message: "Secret-looking names were found. Avoid baking real secrets into Docker images or image history.",
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Dockerfile explained",
      message: "No obvious Dockerfile review warning was found from the enabled checks.",
    });
  }

  return issues;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "markdown") {
    return [
      "| Line | Instruction | Value | Meaning | Note |",
      "| --- | --- | --- | --- | --- |",
      ...result.instructions.map((item) => `| ${item.lineNumber} | ${item.instruction} | ${escapeMarkdown(item.value || "-")} | ${escapeMarkdown(item.explanation)} | ${escapeMarkdown(item.note)} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "csv") {
    const rows = [
      ["line", "instruction", "value", "explanation", "note"],
      ...result.instructions.map((item) => [String(item.lineNumber), item.instruction, item.value, item.explanation, item.note]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "checklist") {
    return [
      "Dockerfile Review Checklist",
      "---------------------------",
      "- [ ] Confirm the base image is intentionally chosen and versioned.",
      "- [ ] Confirm dependencies are installed in the right stage.",
      "- [ ] Confirm .dockerignore excludes unnecessary files.",
      "- [ ] Confirm runtime image does not include avoidable build-only files.",
      "- [ ] Confirm the container runs as a non-root user when possible.",
      "- [ ] Confirm real secrets are not stored in ENV, ARG, or copied files.",
      "- [ ] Confirm CMD or ENTRYPOINT matches how the app should start.",
      "- [ ] Confirm exposed ports match the app configuration.",
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  if (mode === "explanations") {
    return result.instructions
      .map((item) => [
        `Line ${item.lineNumber}: ${item.instruction}`,
        `Value: ${item.value || "-"}`,
        `Meaning: ${item.explanation}`,
        `Note: ${item.note}`,
      ].join("\n"))
      .join("\n\n");
  }

  return [
    "Dockerfile Instruction Summary",
    "------------------------------",
    `Instructions: ${result.instructionCount}`,
    `Build stages: ${result.stageCount}`,
    `RUN instructions: ${result.runCount}`,
    `Non-root USER present: ${result.hasUser ? "yes" : "no"}`,
    `HEALTHCHECK present: ${result.hasHealthcheck ? "yes" : "no"}`,
    "",
    "Instructions:",
    ...result.instructions.map((item) => `- Line ${item.lineNumber}: ${item.instruction} — ${item.explanation}`),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result, buildTarget: BuildTarget) {
  const notes: { title: string; message: string }[] = [];

  if (result.stageCount > 1) {
    notes.push({
      title: "Multi-stage build detected",
      message: "Multi-stage builds can keep runtime images smaller by copying only required output from earlier stages.",
    });
  }

  if (!result.hasUser) {
    notes.push({
      title: "Consider a non-root runtime user",
      message: "A USER instruction can reduce risk when the container process does not need root privileges.",
    });
  }

  if (buildTarget === "node") {
    notes.push({
      title: "Node Dockerfiles benefit from cache-friendly COPY order",
      message: "Copy package files before source files so dependency installation can reuse Docker cache more often.",
    });
  }

  notes.push({
    title: "Test the final image",
    message: "A readable Dockerfile still needs build tests, runtime logs, vulnerability scans, and container startup checks.",
  });

  return notes;
}
