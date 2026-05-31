"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "compose" | "volumesOnly" | "mixed";
type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type StrictnessMode = "balanced" | "strict" | "relaxed";

type VolumeIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type VolumeMount = {
  service: string;
  source: string;
  target: string;
  mode: string;
  raw: string;
  line: number;
  type: "bind" | "named" | "anonymous" | "socket" | "unknown";
  readOnly: boolean;
  duplicateTarget: boolean;
  riskySource: boolean;
  issues: VolumeIssue[];
};

type VolumeResult = {
  mounts: VolumeMount[];
  issues: VolumeIssue[];
  output: string;
  totalMounts: number;
  bindCount: number;
  namedCount: number;
  anonymousCount: number;
  duplicateTargetCount: number;
  riskyCount: number;
  readOnlyCount: number;
  score: number;
};

type VolumeNote = {
  title: string;
  message: string;
};

const sampleCompose = `services:
  web:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./public:/usr/share/nginx/html:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - app-cache:/cache

  api:
    build: .
    volumes:
      - .:/app
      - /:/host
      - api-data:/var/lib/app
      - /tmp:/tmp
      - /app/node_modules

volumes:
  app-cache:
  api-data:`;

const riskySourcePatterns = [
  { pattern: /^\/$/, label: "root filesystem" },
  { pattern: /^\/var\/run\/docker\.sock$/, label: "Docker socket" },
  { pattern: /^\/etc(?:\/|$)/, label: "/etc system path" },
  { pattern: /^\/var(?:\/|$)/, label: "/var system path" },
  { pattern: /^\/usr(?:\/|$)/, label: "/usr system path" },
  { pattern: /^\/boot(?:\/|$)/, label: "/boot system path" },
  { pattern: /^\/proc(?:\/|$)/, label: "/proc system path" },
  { pattern: /^\/sys(?:\/|$)/, label: "/sys system path" },
  { pattern: /^\/dev(?:\/|$)/, label: "/dev system path" },
  { pattern: /^~(?:\/|$)/, label: "home directory shorthand" },
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("compose");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [strictnessMode, setStrictnessMode] = useState<StrictnessMode>("balanced");
  const [warnDockerSocket, setWarnDockerSocket] = useState(true);
  const [warnRiskyHostPaths, setWarnRiskyHostPaths] = useState(true);
  const [warnDuplicateTargets, setWarnDuplicateTargets] = useState(true);
  const [warnAnonymousVolumes, setWarnAnonymousVolumes] = useState(true);
  const [warnMissingMode, setWarnMissingMode] = useState(true);
  const [warnWritableCodeMounts, setWarnWritableCodeMounts] = useState(true);
  const [result, setResult] = useState<VolumeResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getVolumeNotes(result) : []), [result]);

  const checkVolumes = () => {
    if (!input.trim()) {
      setError("Please paste a docker-compose.yml snippet or volume mount list.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = analyzeComposeVolumes(input, {
        inputMode,
        outputMode,
        strictnessMode,
        warnDockerSocket,
        warnRiskyHostPaths,
        warnDuplicateTargets,
        warnAnonymousVolumes,
        warnMissingMode,
        warnWritableCodeMounts,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check these Docker Compose volumes."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleCompose);
    setInputMode("compose");
    setOutputMode("summary");
    setStrictnessMode("balanced");
    setWarnDockerSocket(true);
    setWarnRiskyHostPaths(true);
    setWarnDuplicateTargets(true);
    setWarnAnonymousVolumes(true);
    setWarnMissingMode(true);
    setWarnWritableCodeMounts(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setInputMode("compose");
    setOutputMode("summary");
    setStrictnessMode("balanced");
    setWarnDockerSocket(true);
    setWarnRiskyHostPaths(true);
    setWarnDuplicateTargets(true);
    setWarnAnonymousVolumes(true);
    setWarnMissingMode(true);
    setWarnWritableCodeMounts(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Docker Compose Volume Checker"
      description="Check Docker Compose volume mounts for duplicate targets, risky host paths, Docker socket mounts, anonymous volumes, missing modes, read-only recommendations, and data-loss risks."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Docker Compose YAML or Volume List
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleCompose}
          className="w-full min-h-[430px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a full docker-compose.yml snippet, a service block, or only the
          volume mount lines you want to review.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input Type"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Docker Compose YAML", value: "compose" },
              { label: "Volumes only", value: "volumesOnly" },
              { label: "Mixed snippet", value: "mixed" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
              { label: "CSV", value: "csv" },
            ]}
          />

          <YoryantraSelect
            label="Checking Style"
            value={strictnessMode}
            onChange={(value) => {
              setStrictnessMode(value as StrictnessMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Balanced", value: "balanced" },
              { label: "Strict", value: "strict" },
              { label: "Relaxed", value: "relaxed" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnDockerSocket}
                onChange={(event) => {
                  setWarnDockerSocket(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about Docker socket mounts
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnRiskyHostPaths}
                onChange={(event) => {
                  setWarnRiskyHostPaths(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about risky host paths
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnDuplicateTargets}
                onChange={(event) => {
                  setWarnDuplicateTargets(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about duplicate container targets per service
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnAnonymousVolumes}
                onChange={(event) => {
                  setWarnAnonymousVolumes(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about anonymous volumes
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnMissingMode}
                onChange={(event) => {
                  setWarnMissingMode(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn when mount mode is missing
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnWritableCodeMounts}
                onChange={(event) => {
                  setWarnWritableCodeMounts(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Suggest read-only mode for config and static mounts
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Checks bind mounts, named volumes, anonymous volumes, socket mounts,
          duplicate targets, risky host paths, and read-only mode recommendations.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkVolumes} className="yoryantra-btn">
          Check Compose Volumes
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
          <SummaryCard label="Score" value={`${result.score}/100`} />
          <SummaryCard label="Mounts" value={result.totalMounts.toLocaleString()} />
          <SummaryCard label="Risky" value={result.riskyCount.toLocaleString()} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.mounts.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Volume Mount Review
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Parsed mounts from your Compose snippet and the main risks found.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Issues</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.mounts.slice(0, 100).map((mount, index) => (
                  <tr key={`${mount.service}-${mount.target}-${mount.line}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      {mount.service || "unknown"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[240px] break-words">
                        {mount.source || "(anonymous)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[260px] break-words">
                        {mount.target || "(missing target)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {mount.mode || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mount.type}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mount.issues.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.mounts.length > 100 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 100 mounts. Copy the output for the full result.
            </p>
          )}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Volume findings
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues.slice(0, 15).map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {issue.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {issue.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            Compose volume notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Docker Compose volume check output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Docker Compose volume checking happens directly in your browser. Your
        Compose YAML and mount paths are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Docker Compose Volume Mounts Before Deployment
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker Compose volume mounts are powerful, but small mistakes can
            cause data loss, security exposure, broken containers, or confusing
            file overrides. A single duplicate target can hide files inside a
            container, and a risky host mount can expose more of the system than
            intended.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Docker Compose Volume Checker reviews Compose volume mounts for
            duplicate container targets, Docker socket mounts, risky host paths,
            anonymous volumes, missing access modes, and read-only recommendations
            for config and static file mounts.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Compose Volume Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a docker-compose.yml snippet, service block, or volume list.</li>
            <li>Choose the input type and checking style.</li>
            <li>Run the checker and review each mount source, target, and mode.</li>
            <li>Fix duplicate targets, risky host paths, and unexpected writable mounts.</li>
            <li>Copy the summary, detailed report, JSON, Markdown, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Docker Compose Volume Problems
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Mounting the Docker socket into a container without realizing the risk.</li>
            <li>Mounting root or system directories such as /, /etc, /var, /proc, or /sys.</li>
            <li>Using the same container target twice in one service.</li>
            <li>Creating anonymous volumes accidentally.</li>
            <li>Leaving config files writable when they could be read-only.</li>
            <li>Mounting project source over built container files in production.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Compose Volume Mounts
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`services:
  web:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./public:/usr/share/nginx/html:ro
      - app-cache:/cache`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Bind Mounts, Named Volumes, and Anonymous Volumes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A bind mount maps a host path into the container. A named volume is
            managed by Docker and is usually better for persistent app data. An
            anonymous volume has no clear name in the Compose file, which can
            make cleanup and debugging harder.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use bind mounts carefully in production. They are useful for local
            development, config files, and static assets, but they can also create
            security and portability problems when host paths differ between
            machines.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a Docker Compose Volume Checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks Compose volume mounts for risky paths, duplicate
                targets, anonymous volumes, missing modes, socket mounts, and
                read-only recommendations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is mounting /var/run/docker.sock risky?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Docker socket access can allow a container to control Docker
                on the host, so it should only be used when truly needed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should config file mounts be read-only?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Often yes. Mounts like nginx.conf, static assets, certificates,
                and config files are usually safer with :ro when the container
                does not need to modify them.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this fully parse every Compose file?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It handles common Compose volume syntax and snippets, but it is
                designed for quick review rather than full Docker Compose execution.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I check volumes?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The check happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">
              Docker Compose Validator
            </Link>

            <Link href="/tools/docker-compose-ports-checker" className="yoryantra-btn-outline">
              Docker Compose Ports Checker
            </Link>

            <Link href="/tools/docker-environment-variable-checker" className="yoryantra-btn-outline">
              Docker Environment Variable Checker
            </Link>

            <Link href="/tools/dockerfile-linter" className="yoryantra-btn-outline">
              Dockerfile Linter
            </Link>

            <Link href="/tools/yaml-validator" className="yoryantra-btn-outline">
              YAML Validator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function analyzeComposeVolumes(
  input: string,
  options: {
    inputMode: InputMode;
    outputMode: OutputMode;
    strictnessMode: StrictnessMode;
    warnDockerSocket: boolean;
    warnRiskyHostPaths: boolean;
    warnDuplicateTargets: boolean;
    warnAnonymousVolumes: boolean;
    warnMissingMode: boolean;
    warnWritableCodeMounts: boolean;
  }
): VolumeResult {
  const parsedMounts = parseVolumeMounts(input, options.inputMode);

  if (parsedMounts.length === 0) {
    throw new Error("No Docker Compose volume mounts were found.");
  }

  const duplicateTargets = findDuplicateTargets(parsedMounts);
  const mountsWithFlags = parsedMounts.map((mount) => ({
    ...mount,
    duplicateTarget: duplicateTargets.has(`${mount.service}::${mount.target}`),
    riskySource: isRiskySource(mount.source),
  }));
  const mounts = mountsWithFlags.map((mount) => ({
    ...mount,
    issues: getMountIssues(mount, options),
  }));
  const issues = mounts.flatMap((mount) =>
    mount.issues.map((issue) => ({
      ...issue,
      title: `${mount.service || "service"} ${mount.target || mount.raw}: ${issue.title}`,
    }))
  );
  const score = calculateScore(issues);
  const base = {
    mounts,
    issues,
    totalMounts: mounts.length,
    bindCount: mounts.filter((mount) => mount.type === "bind").length,
    namedCount: mounts.filter((mount) => mount.type === "named").length,
    anonymousCount: mounts.filter((mount) => mount.type === "anonymous").length,
    duplicateTargetCount: mounts.filter((mount) => mount.duplicateTarget).length,
    riskyCount: mounts.filter((mount) => mount.riskySource || mount.type === "socket").length,
    readOnlyCount: mounts.filter((mount) => mount.readOnly).length,
    score,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function parseVolumeMounts(input: string, inputMode: InputMode): VolumeMount[] {
  const lines = input.split(/\r?\n/);
  const mounts: VolumeMount[] = [];
  let currentService = "unknown";
  let inVolumes = inputMode === "volumesOnly";
  let serviceIndent = -1;
  let volumeIndent = -1;

  lines.forEach((line, index) => {
    const raw = line;
    const trimmed = line.trim();
    const indent = getIndent(line);

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const serviceMatch = line.match(/^(\s{2,})([A-Za-z0-9_.-]+):\s*$/);
    if (serviceMatch && !["volumes", "environment", "ports", "networks", "depends_on", "labels"].includes(serviceMatch[2])) {
      currentService = serviceMatch[2];
      serviceIndent = serviceMatch[1].length;
      inVolumes = inputMode === "volumesOnly";
      return;
    }

    if (/^\s*volumes:\s*$/.test(line)) {
      inVolumes = true;
      volumeIndent = indent;
      return;
    }

    if (inVolumes && volumeIndent >= 0 && indent <= volumeIndent && !trimmed.startsWith("-")) {
      inVolumes = inputMode === "volumesOnly";
      return;
    }

    if (!inVolumes && inputMode === "compose") {
      return;
    }

    const mount = parseVolumeLine(trimmed, index + 1, raw, currentService);

    if (mount) {
      mounts.push(mount);
    }

    if (serviceIndent >= 0 && indent <= serviceIndent && /^[A-Za-z0-9_.-]+:\s*$/.test(trimmed)) {
      currentService = trimmed.replace(/:\s*$/, "");
    }
  });

  return mounts;
}

function parseVolumeLine(trimmed: string, line: number, raw: string, service: string): VolumeMount | null {
  const listMatch = trimmed.match(/^-\s*(.+)$/);
  const value = listMatch ? listMatch[1].trim() : trimmed;

  if (!listMatch && !value.includes(":")) {
    return null;
  }

  if (value.startsWith("{") && value.endsWith("}")) {
    return parseInlineObjectVolume(value, line, raw, service);
  }

  if (/^type:\s*/.test(value) || /^source:\s*/.test(value) || /^target:\s*/.test(value)) {
    return null;
  }

  const cleanValue = stripQuotes(value);
  const parts = splitVolumeSpec(cleanValue);

  if (parts.length === 1 && isContainerPath(parts[0])) {
    return buildMount({
      service,
      source: "",
      target: parts[0],
      mode: "",
      raw,
      line,
    });
  }

  if (parts.length < 2) {
    return null;
  }

  const source = parts[0] || "";
  const target = parts[1] || "";
  const mode = parts.slice(2).join(":");

  return buildMount({
    service,
    source,
    target,
    mode,
    raw,
    line,
  });
}

function parseInlineObjectVolume(value: string, line: number, raw: string, service: string): VolumeMount | null {
  const source = readInlineObjectValue(value, "source") || readInlineObjectValue(value, "src") || "";
  const target = readInlineObjectValue(value, "target") || readInlineObjectValue(value, "dst") || readInlineObjectValue(value, "destination") || "";
  const readOnlyValue = readInlineObjectValue(value, "read_only");
  const mode = readOnlyValue === "true" ? "ro" : readInlineObjectValue(value, "mode") || "";

  if (!source && !target) {
    return null;
  }

  return buildMount({
    service,
    source,
    target,
    mode,
    raw,
    line,
  });
}

function readInlineObjectValue(value: string, key: string) {
  const match = value.match(new RegExp(`${key}\\s*:\\s*([^,}]+)`, "i"));
  return match ? stripQuotes(match[1].trim()) : "";
}

function buildMount({
  service,
  source,
  target,
  mode,
  raw,
  line,
}: {
  service: string;
  source: string;
  target: string;
  mode: string;
  raw: string;
  line: number;
}): VolumeMount {
  const type = classifyMount(source, target);
  const readOnly = mode.split(",").includes("ro") || mode === "ro";

  return {
    service,
    source,
    target,
    mode,
    raw,
    line,
    type,
    readOnly,
    duplicateTarget: false,
    riskySource: false,
    issues: [],
  };
}

function splitVolumeSpec(value: string) {
  const parts: string[] = [];
  let current = "";
  let index = 0;

  while (index < value.length) {
    const char = value[index];

    if (char === ":" && !isWindowsDriveColon(value, index)) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }

    index += 1;
  }

  parts.push(current);

  return parts.map((part) => part.trim());
}

function isWindowsDriveColon(value: string, index: number) {
  return index === 1 && /^[A-Za-z]$/.test(value[0]) && (value[2] === "\\" || value[2] === "/");
}

function classifyMount(source: string, target: string): VolumeMount["type"] {
  if (!source && target) {
    return "anonymous";
  }

  if (source === "/var/run/docker.sock" || target === "/var/run/docker.sock") {
    return "socket";
  }

  if (source.startsWith(".") || source.startsWith("/") || source.startsWith("~") || /^[A-Za-z]:[\\/]/.test(source)) {
    return "bind";
  }

  if (source) {
    return "named";
  }

  return "unknown";
}

function findDuplicateTargets(mounts: VolumeMount[]) {
  const counts = new Map<string, number>();

  mounts.forEach((mount) => {
    if (!mount.target) {
      return;
    }

    const key = `${mount.service}::${mount.target}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([key]) => key)
  );
}

function getMountIssues(
  mount: VolumeMount,
  options: {
    strictnessMode: StrictnessMode;
    warnDockerSocket: boolean;
    warnRiskyHostPaths: boolean;
    warnDuplicateTargets: boolean;
    warnAnonymousVolumes: boolean;
    warnMissingMode: boolean;
    warnWritableCodeMounts: boolean;
  }
): VolumeIssue[] {
  const issues: VolumeIssue[] = [];

  if (!mount.target) {
    issues.push({
      severity: "high",
      title: "Missing container target",
      message: "This mount does not appear to include a container target path.",
    });
  }

  if (options.warnDuplicateTargets && mount.duplicateTarget) {
    issues.push({
      severity: "warning",
      title: "Duplicate container target",
      message: "This service mounts more than one volume to the same container target.",
    });
  }

  if (options.warnDockerSocket && mount.type === "socket") {
    issues.push({
      severity: "high",
      title: "Docker socket mounted",
      message: "Mounting /var/run/docker.sock can give the container control over Docker on the host.",
    });
  }

  if (options.warnRiskyHostPaths && mount.riskySource) {
    issues.push({
      severity: getRiskSeverity(mount.source, options.strictnessMode),
      title: "Risky host path",
      message: `${mount.source} is a sensitive host path. Confirm this mount is truly needed.`,
    });
  }

  if (options.warnAnonymousVolumes && mount.type === "anonymous") {
    issues.push({
      severity: "info",
      title: "Anonymous volume",
      message: "Anonymous volumes can be harder to inspect, back up, and clean up than named volumes.",
    });
  }

  if (options.warnMissingMode && mount.mode === "" && mount.type !== "anonymous") {
    issues.push({
      severity: options.strictnessMode === "strict" ? "warning" : "info",
      title: "Mount mode missing",
      message: "No :ro or :rw mode was found. Docker defaults to writable mounts.",
    });
  }

  if (options.warnWritableCodeMounts && !mount.readOnly && looksLikeConfigOrStaticMount(mount)) {
    issues.push({
      severity: "info",
      title: "Consider read-only mode",
      message: "Config, certificate, and static file mounts are often safer with :ro.",
    });
  }

  if (mount.type === "bind" && mount.source === ".") {
    issues.push({
      severity: "info",
      title: "Project root bind mount",
      message: "Mounting the full project root is common in development but may be risky or noisy in production.",
    });
  }

  return issues;
}

function isRiskySource(source: string) {
  return riskySourcePatterns.some((item) => item.pattern.test(source));
}

function getRiskSeverity(source: string, strictnessMode: StrictnessMode): VolumeIssue["severity"] {
  if (source === "/" || source === "/var/run/docker.sock") {
    return "high";
  }

  return strictnessMode === "relaxed" ? "info" : "warning";
}

function looksLikeConfigOrStaticMount(mount: VolumeMount) {
  const value = `${mount.source} ${mount.target}`.toLowerCase();

  return /\.(conf|config|json|yaml|yml|toml|ini|crt|key|pem|cert)$/.test(value) ||
    value.includes("/etc/") ||
    value.includes("/config") ||
    value.includes("/cert") ||
    value.includes("/static") ||
    value.includes("/public") ||
    value.includes("/usr/share/nginx/html");
}

function isContainerPath(value: string) {
  return value.startsWith("/") || /^[A-Za-z]:[\\/]/.test(value);
}

function stripQuotes(value: string) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function getIndent(line: string) {
  return line.match(/^\s*/)?.[0].length || 0;
}

function calculateScore(issues: VolumeIssue[]) {
  let score = 100;

  issues.forEach((issue) => {
    if (issue.severity === "high") {
      score -= 25;
    } else if (issue.severity === "warning") {
      score -= 12;
    } else {
      score -= 4;
    }
  });

  return Math.max(0, score);
}

function formatOutput(
  result: Omit<VolumeResult, "output">,
  outputMode: OutputMode
) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "csv") {
    const rows = [
      ["service", "source", "target", "mode", "type", "line", "issues"],
      ...result.mounts.map((mount) => [
        mount.service,
        mount.source,
        mount.target,
        mount.mode,
        mount.type,
        String(mount.line),
        String(mount.issues.length),
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Service | Source | Target | Mode | Type | Issues |",
      "| --- | --- | --- | --- | --- | --- |",
      ...result.mounts.map((mount) =>
        `| ${escapeMarkdown(mount.service)} | ${escapeMarkdown(mount.source || "(anonymous)")} | ${escapeMarkdown(mount.target || "(missing)")} | ${mount.mode || "-"} | ${mount.type} | ${mount.issues.length} |`
      ),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.mounts
      .map((mount) => {
        const issues = mount.issues.length
          ? mount.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
          : ["- No common issues found."];

        return [
          `${mount.service}: ${mount.target || mount.raw}`,
          "-".repeat(28),
          `Line: ${mount.line}`,
          `Source: ${mount.source || "(anonymous)"}`,
          `Target: ${mount.target || "(missing)"}`,
          `Mode: ${mount.mode || "(default writable)"}`,
          `Type: ${mount.type}`,
          "",
          "Findings:",
          ...issues,
        ].join("\n");
      })
      .join("\n\n");
  }

  const issues = result.issues.length
    ? result.issues.slice(0, 15).map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
    : ["- No common Docker Compose volume issues found."];

  return [
    "Docker Compose Volume Summary",
    "-----------------------------",
    `Score: ${result.score}/100`,
    `Mounts: ${result.totalMounts}`,
    `Bind mounts: ${result.bindCount}`,
    `Named volumes: ${result.namedCount}`,
    `Anonymous volumes: ${result.anonymousCount}`,
    `Duplicate targets: ${result.duplicateTargetCount}`,
    `Risky mounts: ${result.riskyCount}`,
    `Read-only mounts: ${result.readOnlyCount}`,
    "",
    "Findings:",
    ...issues,
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getVolumeNotes(result: VolumeResult): VolumeNote[] {
  const notes: VolumeNote[] = [];

  if (result.riskyCount > 0) {
    notes.push({
      title: "Risky mounts found",
      message:
        "Some mounts expose sensitive host paths or the Docker socket. Review them carefully before deployment.",
    });
  }

  if (result.duplicateTargetCount > 0) {
    notes.push({
      title: "Duplicate targets",
      message:
        "Mounting more than one volume to the same container path can hide files or make behavior confusing.",
    });
  }

  if (result.anonymousCount > 0) {
    notes.push({
      title: "Anonymous volumes",
      message:
        "Anonymous volumes can be valid, but named volumes are easier to inspect, back up, and remove intentionally.",
    });
  }

  if (result.score >= 90) {
    notes.push({
      title: "Clean volume setup",
      message:
        "Only minor or no common Compose volume issues were found in the pasted snippet.",
    });
  }

  return notes;
}
