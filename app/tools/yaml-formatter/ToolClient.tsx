"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import YAML from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "formattedYaml" | "jsonPreview" | "validationReport" | "checklist";
type IndentMode = "2" | "4";
type LineWidthMode = "80" | "120" | "0";

type Issue = {
  severity: "info" | "warning";
  title: string;
  message: string;
};

type Result = {
  output: string;
  issues: Issue[];
  inputLength: number;
  outputLength: number;
  lineCount: number;
  keyCount: number;
  detectedRoot: string;
};

const sampleYaml = `name: Yoryantra
type: utility-site
tools:
- YAML Formatter
- JSON Formatter
- Docker Compose Validator
settings:
  browser_only: true
  clean_layout: true
deployment:
  provider: Cloudflare Pages
  framework: Next.js`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("formattedYaml");
  const [indentMode, setIndentMode] = useState<IndentMode>("2");
  const [lineWidthMode, setLineWidthMode] = useState<LineWidthMode>("120");
  const [sortKeys, setSortKeys] = useState(false);
  const [trimInput, setTrimInput] = useState(true);
  const [warnTabs, setWarnTabs] = useState(true);
  const [warnDuplicateKeys, setWarnDuplicateKeys] = useState(true);
  const [warnLongLines, setWarnLongLines] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => result?.issues ?? [], [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const formatYAML = () => {
    if (!input.trim()) {
      setError("Please paste YAML content to format.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      outputMode,
      indentMode,
      lineWidthMode,
      sortKeys,
      trimInput,
      warnTabs,
      warnDuplicateKeys,
      warnLongLines,
      includeStats,
    });

    if (next.output.startsWith("__ERROR__:")) {
      setError(next.output.replace("__ERROR__:", ""));
      setResult(next);
      setOutput("");
      setCopied(false);
      return;
    }

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleYaml);
    setOutputMode("formattedYaml");
    setIndentMode("2");
    setLineWidthMode("120");
    setSortKeys(false);
    setTrimInput(true);
    setWarnTabs(true);
    setWarnDuplicateKeys(true);
    setWarnLongLines(true);
    setIncludeStats(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("formattedYaml");
    setIndentMode("2");
    setLineWidthMode("120");
    setSortKeys(false);
    setTrimInput(true);
    setWarnTabs(true);
    setWarnDuplicateKeys(true);
    setWarnLongLines(true);
    setIncludeStats(true);
    clearResult();
  };

  return (
    <ToolShell
      title="YAML Formatter"
      description="Format YAML online, beautify indentation, validate YAML syntax, and clean configuration files for Kubernetes, Docker Compose, CI/CD, and DevOps workflows."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">YAML Input</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste YAML from Kubernetes, Docker Compose, GitHub Actions, CI/CD pipelines, cloud config, or application settings.
          </p>
        </div>

        <textarea
          className="w-full min-h-[420px] max-h-[520px] resize-y overflow-auto rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder="Paste YAML here..."
          value={input}
          spellCheck={false}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Formatter Settings</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Keep the main editor wide, then choose only the formatting options needed for the output.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Formatted YAML", value: "formattedYaml" },
              { label: "JSON preview", value: "jsonPreview" },
              { label: "Validation report", value: "validationReport" },
              { label: "Review checklist", value: "checklist" },
            ]}
          />

          <YoryantraSelect
            label="Indentation"
            value={indentMode}
            onChange={(value) => {
              setIndentMode(value as IndentMode);
              clearResult();
            }}
            options={[
              { label: "2 spaces", value: "2" },
              { label: "4 spaces", value: "4" },
            ]}
          />

          <YoryantraSelect
            label="Line Width"
            value={lineWidthMode}
            onChange={(value) => {
              setLineWidthMode(value as LineWidthMode);
              clearResult();
            }}
            options={[
              { label: "80 characters", value: "80" },
              { label: "120 characters", value: "120" },
              { label: "No wrapping preference", value: "0" },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={sortKeys} onChange={setSortKeys} label="Sort object keys alphabetically" />
          <Toggle checked={trimInput} onChange={setTrimInput} label="Trim outer whitespace before formatting" />
          <Toggle checked={warnTabs} onChange={setWarnTabs} label="Warn about tab characters" />
          <Toggle checked={warnDuplicateKeys} onChange={setWarnDuplicateKeys} label="Warn about possible duplicate keys" />
          <Toggle checked={warnLongLines} onChange={setWarnLongLines} label="Warn about very long lines" />
          <Toggle checked={includeStats} onChange={setIncludeStats} label="Include YAML stats in reports" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={formatYAML} className="yoryantra-btn">
          Format YAML
        </button>

        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 overflow-auto">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Input Size" value={`${result.inputLength.toLocaleString()} chars`} />
          <SummaryCard label="Output Size" value={`${result.outputLength.toLocaleString()} chars`} />
          <SummaryCard label="Lines" value={result.lineCount.toLocaleString()} />
          <SummaryCard label="Root Type" value={result.detectedRoot} />
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Output</h3>
            <p className="mt-1 text-sm text-gray-500">
              Formatted YAML, JSON preview, validation report, or review checklist will appear here.
            </p>
          </div>

          {output ? (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy Output"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Formatted YAML will appear here."}
        </pre>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        YAML formatting runs locally in your browser. The tool helps format and parse YAML, but platform-specific validation for Kubernetes, Docker Compose, or CI/CD systems should still be reviewed separately.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting YAML Files So Indentation Is Easier to Review
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            YAML formatting makes configuration files easier to read by cleaning indentation, spacing, lists, objects, and nested structure. This is especially useful because YAML depends on whitespace to describe hierarchy.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Developers and DevOps teams use YAML in Kubernetes manifests, Docker Compose files, GitHub Actions, CI/CD pipelines, infrastructure configuration, application settings, and automation workflows. A small indentation mistake can change how a deployment or pipeline behaves.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This YAML Formatter parses pasted YAML, reports syntax problems, and creates a cleaner formatted version directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This YAML Formatter Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Cleaning Kubernetes YAML manifests before review or deployment.</p>
            <p className="mt-2">Formatting Docker Compose files with nested services, volumes, ports, and environment values.</p>
            <p className="mt-2">Checking GitHub Actions, GitLab CI, or other pipeline YAML before committing changes.</p>
            <p className="mt-2">Making application configuration files easier to compare, copy, and debug.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the YAML Formatter</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste YAML content into the input box.</li>
            <li>Choose formatted YAML, JSON preview, validation report, or checklist output.</li>
            <li>Select indentation and line width preferences.</li>
            <li>Click <strong>Format YAML</strong> and review any validation notes.</li>
            <li>Copy the cleaned YAML output for your config, documentation, or pull request.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example YAML Formatting</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Before formatting:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">{`name: Yoryantra
tools:
- JSON Formatter
- YAML Formatter
active: true`}</pre>

            <p className="mt-4 font-medium text-gray-900">After formatting:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">{`name: Yoryantra
tools:
  - JSON Formatter
  - YAML Formatter
active: true`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">YAML Formatting Is Helpful, but Validation Still Matters</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A formatter can make YAML easier to read, but it cannot guarantee that a Kubernetes manifest, Docker Compose file, or CI/CD pipeline is logically correct for your environment. After formatting, still review required fields, versions, secrets, indentation-sensitive blocks, and deployment-specific values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What is a YAML Formatter?">
              A YAML Formatter cleans YAML content into a readable structure with consistent indentation, spacing, and nested layout.
            </Faq>

            <Faq title="Can I format YAML online without uploading it?">
              Yes. This tool formats YAML locally inside your browser, so pasted configuration text is not sent to a server.
            </Faq>

            <Faq title="Does this tool validate YAML syntax?">
              Yes. If the YAML cannot be parsed, the tool shows an error instead of generating formatted output.
            </Faq>

            <Faq title="Why is indentation important in YAML?">
              YAML uses indentation to define hierarchy. Incorrect spacing can break configuration files or change how nested values are interpreted.
            </Faq>

            <Faq title="Can I use this for Kubernetes or Docker Compose YAML?">
              Yes. It is useful for reviewing Kubernetes manifests, Docker Compose files, CI/CD pipeline YAML, and other configuration files. It formats syntax, but it does not validate platform-specific schema rules.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            YAML formatting often connects with JSON conversion, Kubernetes validation, Docker Compose review, and CI/CD configuration checks.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/yaml-to-json-converter" className="yoryantra-btn-outline">
              YAML to JSON Converter
            </Link>

            <Link href="/tools/json-to-yaml-converter" className="yoryantra-btn-outline">
              JSON to YAML Converter
            </Link>

            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">
              Docker Compose Validator
            </Link>

            <Link href="/tools/kubernetes-yaml-validator" className="yoryantra-btn-outline">
              Kubernetes YAML Validator
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  outputMode: OutputMode;
  indentMode: IndentMode;
  lineWidthMode: LineWidthMode;
  sortKeys: boolean;
  trimInput: boolean;
  warnTabs: boolean;
  warnDuplicateKeys: boolean;
  warnLongLines: boolean;
  includeStats: boolean;
}): Result {
  const source = options.trimInput ? options.input.trim() : options.input;
  const issues = buildTextIssues(source, options);

  try {
    const parsed = YAML.parse(source);
    const prepared = options.sortKeys ? sortObjectKeys(parsed) : parsed;
    const lineWidth = Number(options.lineWidthMode);
    const formatted = YAML.stringify(prepared, {
      indent: Number(options.indentMode),
      lineWidth,
    }).trim();

    const output = formatOutput({
      outputMode: options.outputMode,
      formatted,
      parsed: prepared,
      issues,
      source,
    });

    return {
      output,
      issues,
      inputLength: options.input.length,
      outputLength: output.length,
      lineCount: source ? source.split(/\r?\n/).length : 0,
      keyCount: countKeys(prepared),
      detectedRoot: detectRoot(prepared),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid YAML input.";
    return {
      output: `__ERROR__:Invalid YAML. ${message}`,
      issues,
      inputLength: options.input.length,
      outputLength: 0,
      lineCount: source ? source.split(/\r?\n/).length : 0,
      keyCount: 0,
      detectedRoot: "invalid",
    };
  }
}

function buildTextIssues(
  source: string,
  options: {
    warnTabs: boolean;
    warnDuplicateKeys: boolean;
    warnLongLines: boolean;
  }
) {
  const issues: Issue[] = [];

  if (options.warnTabs && /	/.test(source)) {
    issues.push({
      severity: "warning",
      title: "Tab characters found",
      message: "YAML indentation should use spaces. Tabs can cause parsing or readability problems.",
    });
  }

  if (options.warnLongLines) {
    const longLines = source.split(/\r?\n/).filter((line) => line.length > 140).length;
    if (longLines) {
      issues.push({
        severity: "info",
        title: "Long YAML lines",
        message: `${longLines} line${longLines === 1 ? "" : "s"} are longer than 140 characters. Consider wrapping long values if readability matters.`,
      });
    }
  }

  if (options.warnDuplicateKeys) {
    const duplicateKeys = findLikelyDuplicateKeys(source);
    if (duplicateKeys.length) {
      issues.push({
        severity: "warning",
        title: "Possible duplicate keys",
        message: `Possible repeated key name${duplicateKeys.length === 1 ? "" : "s"} found: ${duplicateKeys.slice(0, 5).join(", ")}.`,
      });
    }
  }

  return issues;
}

function formatOutput(options: {
  outputMode: OutputMode;
  formatted: string;
  parsed: unknown;
  issues: Issue[];
  source: string;
}) {
  if (options.outputMode === "jsonPreview") {
    return JSON.stringify(options.parsed, null, 2);
  }

  if (options.outputMode === "validationReport") {
    const lines = [
      "YAML validation report",
      "",
      "Status: valid YAML",
      `Root type: ${detectRoot(options.parsed)}`,
      `Lines: ${options.source.split(/\r?\n/).length}`,
      `Keys: ${countKeys(options.parsed)}`,
    ];

    if (options.issues.length) {
      lines.push("", "Review notes:");
      options.issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
    } else {
      lines.push("", "Review notes: none");
    }

    return lines.join("\n");
  }

  if (options.outputMode === "checklist") {
    const lines = [
      "# YAML Review Checklist",
      "",
      "- [x] YAML parsed successfully.",
      `- [${options.issues.some((issue) => issue.title === "Tab characters found") ? " " : "x"}] No tab indentation detected.`,
      `- [${options.issues.some((issue) => issue.title === "Possible duplicate keys") ? " " : "x"}] No obvious duplicate keys detected.`,
      "- [ ] Platform-specific schema reviewed separately if this is Kubernetes, Docker Compose, or CI/CD YAML.",
    ];

    if (options.issues.length) {
      lines.push("", "Notes:");
      options.issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
    }

    return lines.join("\n");
  }

  return options.formatted;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countKeys(item), 0);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce(
      (total, [, item]) => total + 1 + countKeys(item),
      0
    );
  }

  return 0;
}

function detectRoot(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (typeof value === "object") return "object";
  return typeof value;
}

function findLikelyDuplicateKeys(source: string) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  source.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Za-z0-9_.-]+)\s*:/);
    if (!match) return;
    const key = match[1];
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  });

  return Array.from(duplicates);
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-[var(--light-gold)]"
      />
      <span>{label}</span>
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

function Faq({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
