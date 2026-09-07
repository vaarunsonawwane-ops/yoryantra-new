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
  stageIndex: number;
  known: boolean;
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
  MAINTAINER: {
    explanation: "Sets legacy author metadata for the image.",
    note: "MAINTAINER is deprecated; use an OCI-style LABEL such as org.opencontainers.image.authors instead.",
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
      description="Read Dockerfile stages, parser directives, runtime commands, and stage-specific review concerns in context."
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
              <p className="text-sm font-medium text-gray-700">Instruction coverage</p>
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
          <CheckboxRow checked={warnRootUser} label="Review the final stage USER" onChange={(checked) => { setWarnRootUser(checked); clearResult(); }} />
          <CheckboxRow checked={warnSecrets} label="Warn about possible secrets in ENV or ARG" onChange={(checked) => { setWarnSecrets(checked); clearResult(); }} />
          <CheckboxRow checked={warnLatestTag} label="Review base image pinning" onChange={(checked) => { setWarnLatestTag(checked); clearResult(); }} />
          <CheckboxRow checked={warnAddUsage} label="Warn when ADD may be better as COPY" onChange={(checked) => { setWarnAddUsage(checked); clearResult(); }} />
          <CheckboxRow checked={warnMissingHealthcheck} label="Warn when HEALTHCHECK is missing" onChange={(checked) => { setWarnMissingHealthcheck(checked); clearResult(); }} />
          <CheckboxRow checked={warnManyRunLayers} label="Note unusually many RUN instructions" onChange={(checked) => { setWarnManyRunLayers(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          The parser understands Dockerfile continuations, top-of-file parser directives, and a single heredoc delimiter per instruction. It does not run a build or inspect the referenced images and build context.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={explainDockerfile} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          Explain Dockerfile
        </button>

        <button onClick={copyOutput} className="yoryantra-btn min-h-[44px] whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
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
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {result.issues.map((issue, index) => {
            const classes = issueClassNames(issue.severity);
            return (
              <div key={`${issue.title}-${index}`} className={`${classes.card} self-start rounded-xl border p-4`}>
                <p className={`text-sm font-semibold ${classes.title}`}>{issue.title}</p>
                <p className={`mt-1 text-sm leading-relaxed ${classes.body}`}>{issue.message}</p>
              </div>
            );
          })}
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
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "Dockerfile explanation output will appear here."}
        </pre>
      </div>

      <div className="mt-5 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Dockerfile text stays in your browser on this page. No image is pulled, no build context is uploaded, and no container is started.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A Dockerfile is ordered build state, not just a list of commands</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <code className="font-mono">FROM</code> starts a stage, <code className="font-mono">RUN</code> changes image filesystem state during the build, and runtime instructions such as <code className="font-mono">USER</code>, <code className="font-mono">ENTRYPOINT</code>, and <code className="font-mono">CMD</code> affect what happens after the image starts. The explanation therefore tracks stage position instead of treating every occurrence as globally equivalent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Shell form and exec form behave differently</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <code className="font-mono">RUN</code>, <code className="font-mono">CMD</code>, and <code className="font-mono">ENTRYPOINT</code> can use shell or JSON exec form. Exec form avoids an automatic command shell. Shell-form <code className="font-mono">ENTRYPOINT</code> also changes signal and argument behavior, which is why the page calls it out rather than describing both forms as interchangeable.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Parser directives, continuations, and heredocs need their own handling</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Top-of-file directives such as <code className="font-mono"># syntax=</code> and <code className="font-mono"># escape=</code> affect parsing without becoming image layers. The selected escape character changes line continuation behavior. Heredoc bodies are kept with their owning instruction so script lines are not misreported as Dockerfile instructions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A warning is not a build verdict</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A missing <code className="font-mono">USER</code> in the final stage is worth reviewing, but the base image may already define one. A missing <code className="font-mono">HEALTHCHECK</code> may be fine for a short-lived job. A tagged base image can still move even when it is not tagged <code className="font-mono">latest</code>. These are review boundaries, not automatic failures.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Secrets need build-specific handling</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Explicit secret-looking assignments in <code className="font-mono">ENV</code> or defaulted <code className="font-mono">ARG</code> values are flagged because they can persist in image metadata, history, provenance, or later layers. BuildKit secret mounts are a better fit for credentials needed only during a build.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Confirm exact behavior against Docker&apos;s reference</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker documents the instruction grammar, parser directives, shell/exec forms, heredocs, and last-instruction-wins behavior in the <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://docs.docker.com/reference/dockerfile/" target="_blank" rel="noreferrer">Dockerfile reference</a>. This page deliberately stops short of emulating BuildKit, resolving base-image defaults, or examining <code className="font-mono">.dockerignore</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/dockerfile-instruction-explainer" />
          </div>
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
  const stageCount = instructions.filter((item) => item.instruction === "FROM").length;
  const runCount = instructions.filter((item) => item.instruction === "RUN").length;
  const finalStage = Math.max(0, ...instructions.map((item) => item.stageIndex));
  const finalStageItems = instructions.filter((item) => item.stageIndex === finalStage);
  const lastUser = [...finalStageItems].reverse().find((item) => item.instruction === "USER");
  const lastHealthcheck = [...finalStageItems].reverse().find((item) => item.instruction === "HEALTHCHECK");
  const hasUser = Boolean(lastUser && lastUser.value.trim());
  const hasHealthcheck = Boolean(lastHealthcheck && !/^NONE\b/i.test(lastHealthcheck.value.trim()));
  const base = {
    instructions,
    issues: buildIssues(instructions, options),
    instructionCount: instructions.filter((item) => item.instruction !== "DIRECTIVE").length,
    stageCount,
    runCount,
    hasUser,
    hasHealthcheck,
  };
  return { ...base, output: formatOutput(base, options.outputMode) };
}

type LogicalDockerfileEntry = { lineNumber: number; text: string; directive: boolean };

function parseDockerfile(value: string, detailLevel: DetailLevel): DockerInstruction[] {
  const logicalLines = scanDockerfile(value);
  let stageIndex = 0;
  return logicalLines.map((entry) => {
    if (entry.directive) {
      const directiveValue = entry.text.replace(/^#\s*/, "");
      return {
        lineNumber: entry.lineNumber,
        instruction: "DIRECTIVE",
        value: directiveValue,
        explanation: "Changes how the Dockerfile frontend parses the file without creating an image layer.",
        note: directiveNote(directiveValue),
        category: "metadata" as DockerInstruction["category"],
        stageIndex,
        known: true,
      };
    }

    const match = entry.text.match(/^([A-Za-z]+)\s*([\s\S]*)$/);
    const instruction = match ? match[1].toUpperCase() : "UNKNOWN";
    const rawValue = match ? match[2].trim() : entry.text.trim();
    if (instruction === "FROM") stageIndex += 1;
    const info = instructionExplanations[instruction];
    const known = Boolean(info);
    const explanation = known ? info.explanation : "Docker does not recognize this as a supported Dockerfile instruction in the current reference.";
    const note = known ? info.note : "Check for a typo or a frontend-specific syntax extension before building.";
    return {
      lineNumber: entry.lineNumber,
      instruction,
      value: rawValue,
      explanation: detailLevel === "simple" ? simplify(explanation) : explanation,
      note: detailLevel === "detailed" ? addDetailedNote(instruction, note) : note,
      category: info?.category || "other",
      stageIndex,
      known,
    };
  });
}

function scanDockerfile(value: string): LogicalDockerfileEntry[] {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const entries: LogicalDockerfileEntry[] = [];
  let escapeChar = "\\";
  let directivesOpen = true;
  let index = 0;

  while (index < lines.length) {
    const raw = lines[index];
    const trimmed = raw.trim();
    if (directivesOpen) {
      const directive = raw.match(/^\s*#\s*(syntax|escape|check)\s*=\s*(.+?)\s*$/i);
      if (directive) {
        const key = directive[1].toLowerCase();
        const directiveValue = directive[2];
        entries.push({ lineNumber: index + 1, text: `# ${key}=${directiveValue}`, directive: true });
        if (key === "escape" && (directiveValue === "\\" || directiveValue === "`")) escapeChar = directiveValue;
        index += 1;
        continue;
      }
      if (trimmed !== "") directivesOpen = false;
      else if (entries.length > 0) directivesOpen = false;
    }

    if (!trimmed || trimmed.startsWith("#")) {
      index += 1;
      continue;
    }

    const startLine = index + 1;
    let logical = raw.replace(/^\s+/, "");
    while (endsWithContinuation(logical, escapeChar) && index + 1 < lines.length) {
      logical = removeContinuation(logical, escapeChar) + " " + lines[index + 1].replace(/^\s+/, "");
      index += 1;
    }

    const heredoc = findHeredoc(logical);
    if (heredoc) {
      const body: string[] = [];
      let foundEnd = false;
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        const candidate = heredoc.stripTabs ? lines[cursor].replace(/^\t+/, "") : lines[cursor];
        if (candidate === heredoc.delimiter) {
          logical += `\n${body.join("\n")}\n${lines[cursor]}`;
          index = cursor;
          foundEnd = true;
          break;
        }
        body.push(lines[cursor]);
      }
      if (!foundEnd) logical += `\n${body.join("\n")}`;
    }

    entries.push({ lineNumber: startLine, text: logical.replace(/\s+$/, ""), directive: false });
    index += 1;
  }
  return entries;
}

function endsWithContinuation(value: string, escapeChar: string): boolean {
  const trimmed = value.replace(/\s+$/, "");
  let count = 0;
  for (let index = trimmed.length - 1; index >= 0 && trimmed[index] === escapeChar; index -= 1) count += 1;
  return count % 2 === 1;
}

function removeContinuation(value: string, escapeChar: string): string {
  const trimmed = value.replace(/\s+$/, "");
  return trimmed.slice(0, -escapeChar.length).replace(/\s+$/, "");
}

function findHeredoc(value: string): { delimiter: string; stripTabs: boolean } | null {
  const match = value.match(/<<(-)?\s*['"]?([A-Za-z0-9_.-]+)['"]?/);
  return match ? { delimiter: match[2], stripTabs: Boolean(match[1]) } : null;
}

function directiveNote(value: string): string {
  if (/^escape=/i.test(value)) return "The escape directive changes the line-continuation character for instructions that follow.";
  if (/^syntax=/i.test(value)) return "The syntax directive selects the Dockerfile frontend used by BuildKit.";
  if (/^check=/i.test(value)) return "The check directive configures Dockerfile build checks supported by the selected frontend.";
  return "Parser directives must appear before normal Dockerfile content to be recognized as directives.";
}

function simplify(value: string): string {
  const first = value.split(/\.\s+/)[0];
  return first.endsWith(".") ? first : `${first}.`;
}

function addDetailedNote(instruction: string, note: string): string {
  if (instruction === "RUN") return `${note} Shell and exec forms also differ in variable expansion and shell invocation.`;
  if (instruction === "COPY") return `${note} Build context and .dockerignore determine what source files are available.`;
  if (instruction === "FROM") return `${note} A digest is immutable; a tag can move even when it is not latest.`;
  if (instruction === "ENTRYPOINT") return `${note} Shell form changes signal forwarding and how runtime arguments are handled.`;
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
}): Issue[] {
  const issues: Issue[] = [];
  const buildInstructions = instructions.filter((item) => item.instruction !== "DIRECTIVE");
  const stages = instructions.filter((item) => item.instruction === "FROM");
  const finalStageIndex = Math.max(0, ...instructions.map((item) => item.stageIndex));
  const finalStage = instructions.filter((item) => item.stageIndex === finalStageIndex);
  const finalUser = [...finalStage].reverse().find((item) => item.instruction === "USER");
  const finalHealthcheck = [...finalStage].reverse().find((item) => item.instruction === "HEALTHCHECK");

  if (buildInstructions.length === 0) issues.push({ severity: "high", title: "No build instructions found", message: "The input contains no Dockerfile instructions to build." });
  if (stages.length === 0) issues.push({ severity: "high", title: "No FROM instruction found", message: "A build stage is required. ARG may appear before the first FROM, but the Dockerfile still needs a FROM instruction." });

  const unknown = instructions.filter((item) => !item.known);
  if (unknown.length > 0) issues.push({ severity: "high", title: "Unknown Dockerfile instruction", message: unknown.map((item) => `line ${item.lineNumber}: ${item.instruction}`).join(", ") });

  if (options.warnRootUser) {
    if (!finalUser) issues.push({ severity: "info", title: "No USER in the final stage", message: "The runtime user will be inherited from the base image unless another mechanism changes it. Confirm the final image does not unintentionally run as root." });
    else if (/^(root|0)(?::|$)/i.test(finalUser.value.trim())) issues.push({ severity: "warning", title: "Final stage explicitly uses root", message: `Line ${finalUser.lineNumber} sets USER ${finalUser.value}. Confirm the runtime process actually needs root privileges.` });
  }

  if (options.warnMissingHealthcheck && ["general", "node", "python", "go", "static"].includes(options.buildTarget)) {
    if (!finalHealthcheck || /^NONE\b/i.test(finalHealthcheck.value.trim())) issues.push({ severity: "info", title: "No active final-stage HEALTHCHECK", message: "Long-running services may benefit from an image health check, while batch jobs and orchestrator-managed probes may not need one." });
  }

  if (options.warnLatestTag) {
    const refs = stages.map((item) => extractFromReference(item.value)).filter(Boolean);
    const movable = refs.filter((ref) => !ref.includes("@sha256:") && ref !== "scratch" && !ref.includes("$"));
    const latest = movable.filter((ref) => !hasImageTag(ref) || /:latest$/i.test(ref));
    if (latest.length > 0) issues.push({ severity: "warning", title: "Base image uses latest or no explicit tag", message: `Review: ${latest.join(", ")}. Tags without a digest can move over time.` });
    else if (movable.length > 0) issues.push({ severity: "info", title: "Tagged base images are still movable", message: `These references are versioned by tag but not pinned by digest: ${movable.join(", ")}. Decide whether reproducibility requires a digest.` });
  }

  if (options.warnAddUsage && instructions.some((item) => item.instruction === "ADD")) issues.push({ severity: "info", title: "ADD is present", message: "COPY is simpler for ordinary build-context files. Keep ADD when you intentionally need its remote-source or local archive behavior." });

  if (options.warnManyRunLayers) {
    const runCount = instructions.filter((item) => item.instruction === "RUN").length;
    if (runCount >= 8) issues.push({ severity: "info", title: "Many RUN instructions", message: `${runCount} RUN instructions are present. Count alone is not a defect; review cache boundaries, cleanup, readability, and resulting image size together.` });
  }

  if (options.warnSecrets) {
    const secretAssignments = instructions.filter((item) => ["ENV", "ARG"].includes(item.instruction) && hasSecretAssignment(item.instruction, item.value));
    if (secretAssignments.length > 0) issues.push({ severity: "high", title: "Secret-looking value is assigned in ENV or ARG", message: `Review ${secretAssignments.map((item) => `line ${item.lineNumber}`).join(", ")}. Build credentials should normally use BuildKit secret or SSH mounts instead of Dockerfile defaults.` });
  }

  for (let stage = 1; stage <= Math.max(1, stages.length); stage += 1) {
    for (const instruction of ["CMD", "ENTRYPOINT", "HEALTHCHECK"] as const) {
      const matches = instructions.filter((item) => item.stageIndex === stage && item.instruction === instruction);
      if (matches.length > 1) issues.push({ severity: "warning", title: `Multiple ${instruction} instructions in one stage`, message: `Stage ${stage} has ${matches.length} ${instruction} instructions; only the last one takes effect for that stage.` });
    }
  }

  const shellEntrypoints = instructions.filter((item) => item.instruction === "ENTRYPOINT" && !item.value.trim().startsWith("["));
  if (shellEntrypoints.length > 0) issues.push({ severity: "warning", title: "Shell-form ENTRYPOINT found", message: "Shell-form ENTRYPOINT runs through a command shell and changes signal forwarding and runtime argument behavior. Confirm that is intentional." });

  if (issues.length === 0) issues.push({ severity: "info", title: "No enabled finding triggered", message: "The Dockerfile structure parsed cleanly under these checks. A successful image still needs docker build, runtime tests, and vulnerability review." });
  return issues;
}

function extractFromReference(value: string): string {
  const withoutPlatform = value.replace(/^--platform=\S+\s+/, "").trim();
  return withoutPlatform.split(/\s+AS\s+/i)[0].trim();
}

function hasImageTag(reference: string): boolean {
  const tail = reference.split("/").pop() || reference;
  return tail.includes(":");
}

function hasSecretAssignment(instruction: string, value: string): boolean {
  if (instruction === "ARG") {
    const match = value.match(/^([A-Za-z_][A-Za-z0-9_]*)=([\s\S]+)$/);
    return Boolean(match && /(SECRET|TOKEN|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|ACCESS_KEY|CREDENTIAL)/i.test(match[1]) && match[2].trim());
  }
  const pairs = value.match(/(?:^|\s)([A-Za-z_][A-Za-z0-9_]*)=([^\s]+)/g) || [];
  if (pairs.some((pair) => /(SECRET|TOKEN|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|ACCESS_KEY|CREDENTIAL)/i.test(pair.split("=")[0]) && pair.split("=").slice(1).join("=").trim())) return true;
  const legacy = value.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/);
  return Boolean(legacy && /(SECRET|TOKEN|PASSWORD|PASSWD|API_KEY|PRIVATE_KEY|ACCESS_KEY|CREDENTIAL)/i.test(legacy[1]) && legacy[2].trim());
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode): string {
  if (mode === "json") return JSON.stringify(result, null, 2);
  if (mode === "markdown") return [
    "| Line | Stage | Instruction | Value | Meaning | Note |",
    "| --- | --- | --- | --- | --- | --- |",
    ...result.instructions.map((item) => `| ${item.lineNumber} | ${item.stageIndex || "-"} | ${item.instruction} | ${escapeMarkdown(item.value || "-")} | ${escapeMarkdown(item.explanation)} | ${escapeMarkdown(item.note)} |`),
    "",
    "## Findings",
    ...result.issues.map((issue) => `- **${escapeMarkdown(issue.title)}:** ${escapeMarkdown(issue.message)}`),
  ].join("\n");
  if (mode === "csv") {
    const rows = [["line", "stage", "instruction", "value", "explanation", "note"], ...result.instructions.map((item) => [String(item.lineNumber), String(item.stageIndex || ""), item.instruction, item.value, item.explanation, item.note])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }
  if (mode === "checklist") return [
    "Dockerfile review",
    "-----------------",
    "- [ ] Confirm parser directives are intentional and at the top of the file.",
    "- [ ] Confirm every FROM reference and build stage is intentional.",
    "- [ ] Confirm build credentials use secret mounts rather than Dockerfile defaults.",
    "- [ ] Confirm final-stage USER, ENTRYPOINT, CMD, and HEALTHCHECK behavior.",
    "- [ ] Confirm COPY/ADD sources match the build context and .dockerignore.",
    "- [ ] Build the image and test shutdown, logs, ports, and startup behavior.",
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
  if (mode === "explanations") return result.instructions.map((item) => [`Line ${item.lineNumber}${item.stageIndex ? ` · stage ${item.stageIndex}` : ""}: ${item.instruction}`, `Value: ${item.value || "-"}`, `Meaning: ${item.explanation}`, `Note: ${item.note}`].join("\n")).join("\n\n");
  return [
    "Dockerfile instruction summary",
    "------------------------------",
    `Instructions: ${result.instructionCount}`,
    `Build stages: ${result.stageCount}`,
    `RUN instructions: ${result.runCount}`,
    `Explicit USER in final stage: ${result.hasUser ? "yes" : "no"}`,
    `Active HEALTHCHECK in final stage: ${result.hasHealthcheck ? "yes" : "no"}`,
    "",
    "Instructions:",
    ...result.instructions.map((item) => `- Line ${item.lineNumber}${item.stageIndex ? ` / stage ${item.stageIndex}` : ""}: ${item.instruction} — ${item.explanation}`),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function csvEscape(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, "\\n");
}

function issueClassNames(severity: Issue["severity"]): { card: string; title: string; body: string } {
  if (severity === "high") return { card: "border-red-200 bg-red-50", title: "text-red-900", body: "text-red-800" };
  if (severity === "warning") return { card: "border-amber-200 bg-amber-50", title: "text-amber-900", body: "text-amber-800" };
  return { card: "border-gray-200 bg-gray-50", title: "text-gray-900", body: "text-gray-600" };
}

function getNotes(result: Result, buildTarget: BuildTarget): { title: string; message: string }[] {
  const notes: { title: string; message: string }[] = [];
  if (result.stageCount > 1) notes.push({ title: "Multi-stage boundaries matter", message: "Files, ARG values, users, and installed tools do not automatically carry from one stage into the next; only what you explicitly inherit or copy is available." });
  if (buildTarget === "node") notes.push({ title: "Dependency-copy order can affect Node build caching", message: "Copying package metadata before the rest of the source often lets dependency installation reuse cache when application code changes." });
  if (result.instructions.some((item) => item.instruction === "DIRECTIVE")) notes.push({ title: "Parser directives were included", message: "They influence parsing but do not create image layers or ordinary build steps." });
  return notes;
}

