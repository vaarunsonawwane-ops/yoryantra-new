"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "env" | "compose" | "mixed";
type OutputMode = "summary" | "report" | "json" | "dotenv" | "markdown";
type StrictnessMode = "balanced" | "strict" | "relaxed";

type EnvIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type EnvEntry = {
  key: string;
  value: string;
  raw: string;
  source: "env" | "compose" | "list";
  line: number;
  quoted: boolean;
  empty: boolean;
  duplicate: boolean;
  interpolated: boolean;
  likelySecret: boolean;
  validName: boolean;
  issues: EnvIssue[];
};

type EnvResult = {
  entries: EnvEntry[];
  issues: EnvIssue[];
  output: string;
  totalVariables: number;
  duplicateCount: number;
  emptyCount: number;
  secretCount: number;
  invalidNameCount: number;
  interpolatedCount: number;
  score: number;
};

type EnvNote = {
  title: string;
  message: string;
};

const sampleInput = `# Docker .env example
APP_ENV=production
APP_PORT=3000
DATABASE_URL=postgres://app:password@db:5432/app
REDIS_URL=redis://redis:6379
API_KEY=
JWT_SECRET=change-me
DEBUG=false
APP_PORT=8080

# Compose-style environment values can also be checked:
environment:
  NODE_ENV: production
  API_URL: "\${API_URL}"
  EMPTY_VALUE:
  - QUEUE_NAME=default
  - WORKER_COUNT=2`;

const riskyKeyPattern = /(secret|token|password|passwd|pwd|private|credential|apikey|api_key|access_key|jwt|auth|database_url|db_url)/i;
const placeholderPattern = /^(change-me|changeme|example|sample|test|todo|replace-me|replace_me|your_.+|xxx+|dummy)$/i;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [requiredInput, setRequiredInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("mixed");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [strictnessMode, setStrictnessMode] = useState<StrictnessMode>("balanced");
  const [warnSecrets, setWarnSecrets] = useState(true);
  const [warnEmptyValues, setWarnEmptyValues] = useState(true);
  const [warnDuplicates, setWarnDuplicates] = useState(true);
  const [warnQuotedValues, setWarnQuotedValues] = useState(false);
  const [warnInterpolation, setWarnInterpolation] = useState(true);
  const [result, setResult] = useState<EnvResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getEnvNotes(result) : []), [result]);

  const checkEnvironment = () => {
    if (!input.trim()) {
      setError("Please paste a .env file, docker-compose environment block, or variable list.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = analyzeEnvironmentVariables(input, {
        requiredInput,
        inputMode,
        outputMode,
        strictnessMode,
        warnSecrets,
        warnEmptyValues,
        warnDuplicates,
        warnQuotedValues,
        warnInterpolation,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check these Docker environment variables."
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
    setInput(sampleInput);
    setRequiredInput("APP_ENV\nAPP_PORT\nDATABASE_URL\nJWT_SECRET\nREDIS_URL\nAPI_URL");
    setInputMode("mixed");
    setOutputMode("summary");
    setStrictnessMode("balanced");
    setWarnSecrets(true);
    setWarnEmptyValues(true);
    setWarnDuplicates(true);
    setWarnQuotedValues(false);
    setWarnInterpolation(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setRequiredInput("");
    setInputMode("mixed");
    setOutputMode("summary");
    setStrictnessMode("balanced");
    setWarnSecrets(true);
    setWarnEmptyValues(true);
    setWarnDuplicates(true);
    setWarnQuotedValues(false);
    setWarnInterpolation(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Docker Environment Variable Checker"
      description="Check Docker environment variables from .env files and docker-compose.yml snippets. Find missing values, duplicate keys, invalid names, empty variables, quoted values, and risky secrets exposure."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Docker Environment Input
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
            placeholder={sampleInput}
            className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste a Docker .env file, docker-compose.yml environment block, or
            mixed variable list. The checker runs locally in your browser.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Required Variables
          </label>

          <textarea
            value={requiredInput}
            onChange={(event) => {
              setRequiredInput(event.target.value);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={"APP_ENV\nAPP_PORT\nDATABASE_URL\nJWT_SECRET\nREDIS_URL"}
            className="w-full min-h-[170px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Optional. Enter one required variable name per line to find missing
            values before deployment.
          </p>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            Do not paste real production secrets if you do not need to. This tool
            works in the browser, but masking real values before sharing screenshots
            is still a safer habit.
          </div>
        </div>
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
              { label: ".env file", value: "env" },
              { label: "Compose environment block", value: "compose" },
              { label: "Mixed input", value: "mixed" },
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
              { label: "Clean .env", value: "dotenv" },
              { label: "Markdown table", value: "markdown" },
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
                checked={warnSecrets}
                onChange={(event) => {
                  setWarnSecrets(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about likely secrets or placeholder secret values
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnEmptyValues}
                onChange={(event) => {
                  setWarnEmptyValues(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about empty values
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnDuplicates}
                onChange={(event) => {
                  setWarnDuplicates(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about duplicate variable names
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnQuotedValues}
                onChange={(event) => {
                  setWarnQuotedValues(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about quoted values
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnInterpolation}
                onChange={(event) => {
                  setWarnInterpolation(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about unresolved interpolation like ${"{API_URL}"}
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Checks variable names, duplicates, empty values, required variables,
          Compose-style environment entries, interpolation, and common secret-key patterns.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkEnvironment} className="yoryantra-btn">
          Check Docker Env
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
          <SummaryCard label="Variables" value={result.totalVariables.toLocaleString()} />
          <SummaryCard label="Duplicates" value={result.duplicateCount.toLocaleString()} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.entries.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Variable Review
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Parsed environment variables and common deployment risks.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Flags</th>
                  <th className="px-4 py-3 font-semibold">Issues</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.entries.slice(0, 100).map((entry, index) => (
                  <tr key={`${entry.key}-${entry.line}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      {entry.key || "(missing key)"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[280px] break-words">
                        {entry.likelySecret && entry.value ? maskValue(entry.value) : entry.value || "(empty)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {entry.source}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {entry.line}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {[
                        entry.duplicate ? "duplicate" : "",
                        entry.empty ? "empty" : "",
                        entry.quoted ? "quoted" : "",
                        entry.interpolated ? "interpolated" : "",
                        entry.likelySecret ? "secret-like" : "",
                      ].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {entry.issues.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.entries.length > 100 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 100 variables. Copy the output for the full result.
            </p>
          )}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Environment findings
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
            Docker env notes
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
          {output || "Docker environment check output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Docker environment checking happens directly in your browser. Your
        variables and values are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Docker Environment Variables Before Deployment
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker apps often depend on environment variables for ports,
            database URLs, API keys, feature flags, and runtime configuration.
            One missing or duplicated variable can make a container fail at
            startup or behave differently than expected.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Docker Environment Variable Checker reviews .env files and
            docker-compose environment blocks for common problems, including
            duplicate keys, empty values, invalid names, unresolved interpolation,
            placeholder secrets, and missing required variables.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Docker Env Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a Docker .env file, Compose environment block, or mixed variable list.</li>
            <li>Optionally enter required variable names, one per line.</li>
            <li>Choose the input type, output format, and checking style.</li>
            <li>Run the checker and review duplicates, empty values, and risky entries.</li>
            <li>Copy a clean report, JSON, Markdown table, or normalized .env output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Docker Environment Variable Issues
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Duplicate variables where the later value silently wins.</li>
            <li>Required variables missing from a deployment environment.</li>
            <li>Empty values such as API_KEY= or YAML keys without values.</li>
            <li>Invalid variable names with spaces, dashes, or unsupported characters.</li>
            <li>Placeholder secrets such as change-me, example, test, or dummy.</li>
            <li>Unresolved Compose interpolation like ${"{DATABASE_URL}"}.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Docker .env Input
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`APP_ENV=production
APP_PORT=3000
DATABASE_URL=postgres://app:password@db:5432/app
JWT_SECRET=change-me
API_KEY=`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            .env Files and Compose Environment Blocks Are Different
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A .env file usually uses KEY=value lines. Docker Compose environment
            blocks can use YAML map style or list style. These formats look
            similar, but quoting, interpolation, and empty values can behave
            differently.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool is designed for quick review and debugging. For production
            deployments, still verify behavior in the actual Docker, Compose, or
            platform environment where the containers will run.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a Docker Environment Variable Checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks .env and Compose-style environment values for missing,
                empty, duplicate, invalid, or risky variables before deployment.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse docker-compose.yml files?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It can parse common environment sections and mixed snippets, but
                it is not a full YAML parser for every Compose feature.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I paste real secrets here?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The checker runs in your browser, but it is still safer to mask
                production secrets when you do not need to inspect the exact value.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does an empty variable always mean an error?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Not always. Some apps intentionally use empty values. But empty
                secrets, URLs, and required variables are common deployment issues.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I check env values?
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
            <Link href="/tools/env-file-parser" className="yoryantra-btn-outline">
              .env File Parser
            </Link>

            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">
              Docker Compose Validator
            </Link>

            <Link href="/tools/docker-compose-ports-checker" className="yoryantra-btn-outline">
              Docker Compose Ports Checker
            </Link>

            <Link href="/tools/yaml-validator" className="yoryantra-btn-outline">
              YAML Validator
            </Link>

            <Link href="/tools/kubernetes-secret-decoder" className="yoryantra-btn-outline">
              Kubernetes Secret Decoder
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

function analyzeEnvironmentVariables(
  input: string,
  options: {
    requiredInput: string;
    inputMode: InputMode;
    outputMode: OutputMode;
    strictnessMode: StrictnessMode;
    warnSecrets: boolean;
    warnEmptyValues: boolean;
    warnDuplicates: boolean;
    warnQuotedValues: boolean;
    warnInterpolation: boolean;
  }
): EnvResult {
  const parsedEntries = parseEnvironmentInput(input, options.inputMode);

  if (parsedEntries.length === 0) {
    throw new Error("No environment variables were found.");
  }

  const duplicateKeys = findDuplicateKeys(parsedEntries);
  const entriesWithDuplicates = parsedEntries.map((entry) => ({
    ...entry,
    duplicate: duplicateKeys.has(entry.key),
  }));
  const entries = entriesWithDuplicates.map((entry) => ({
    ...entry,
    issues: getEntryIssues(entry, options),
  }));
  const globalIssues = getGlobalIssues(entries, options.requiredInput, options);
  const issues = [
    ...globalIssues,
    ...entries.flatMap((entry) =>
      entry.issues.map((issue) => ({
        ...issue,
        title: `${entry.key || "Variable"}: ${issue.title}`,
      }))
    ),
  ];
  const score = calculateScore(issues);
  const base = {
    entries,
    issues,
    totalVariables: entries.length,
    duplicateCount: entries.filter((entry) => entry.duplicate).length,
    emptyCount: entries.filter((entry) => entry.empty).length,
    secretCount: entries.filter((entry) => entry.likelySecret).length,
    invalidNameCount: entries.filter((entry) => !entry.validName).length,
    interpolatedCount: entries.filter((entry) => entry.interpolated).length,
    score,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function parseEnvironmentInput(input: string, inputMode: InputMode): EnvEntry[] {
  const lines = input.split(/\r?\n/);
  const entries: EnvEntry[] = [];

  lines.forEach((line, index) => {
    const parsed = parseLine(line, index + 1, inputMode);

    if (parsed) {
      entries.push(parsed);
    }
  });

  return entries;
}

function parseLine(line: string, lineNumber: number, inputMode: InputMode): EnvEntry | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  if (trimmed === "environment:" || trimmed.endsWith(": |") || trimmed.endsWith(": >")) {
    return null;
  }

  let key = "";
  let value = "";
  let source: EnvEntry["source"] = inputMode === "env" ? "env" : inputMode === "compose" ? "compose" : "list";

  const listMatch = trimmed.match(/^-\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  const mapMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
  const envMatch = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

  if (listMatch) {
    key = listMatch[1];
    value = listMatch[2] || "";
    source = "list";
  } else if (mapMatch && inputMode !== "env") {
    key = mapMatch[1];
    value = mapMatch[2] || "";
    source = "compose";
  } else if (envMatch) {
    key = envMatch[1];
    value = envMatch[2] || "";
    source = "env";
  } else {
    const loose = trimmed.match(/^([^\s:=]+)\s*[:=]\s*(.*)$/);

    if (!loose) {
      return null;
    }

    key = loose[1];
    value = loose[2] || "";
  }

  const cleanValue = stripInlineComment(value).trim();
  const quoted = isQuoted(cleanValue);
  const unquotedValue = removeQuotes(cleanValue);
  const likelySecret = riskyKeyPattern.test(key);
  const empty = unquotedValue.length === 0;
  const interpolated = /\$\{[^}]+}/.test(unquotedValue);
  const validName = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);

  return {
    key,
    value: unquotedValue,
    raw: line,
    source,
    line: lineNumber,
    quoted,
    empty,
    duplicate: false,
    interpolated,
    likelySecret,
    validName,
    issues: [],
  };
}

function stripInlineComment(value: string) {
  let quote: string | null = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if ((char === "'" || char === '"') && value[index - 1] !== "\\") {
      quote = quote === char ? null : quote || char;
    }

    if (char === "#" && quote === null && /\s/.test(value[index - 1] || " ")) {
      return value.slice(0, index);
    }
  }

  return value;
}

function isQuoted(value: string) {
  return (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));
}

function removeQuotes(value: string) {
  if (isQuoted(value)) {
    return value.slice(1, -1);
  }

  return value;
}

function findDuplicateKeys(entries: EnvEntry[]) {
  const counts = new Map<string, number>();

  entries.forEach((entry) => {
    counts.set(entry.key, (counts.get(entry.key) || 0) + 1);
  });

  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([key]) => key)
  );
}

function getEntryIssues(
  entry: EnvEntry,
  options: {
    strictnessMode: StrictnessMode;
    warnSecrets: boolean;
    warnEmptyValues: boolean;
    warnDuplicates: boolean;
    warnQuotedValues: boolean;
    warnInterpolation: boolean;
  }
): EnvIssue[] {
  const issues: EnvIssue[] = [];

  if (!entry.validName) {
    issues.push({
      severity: "high",
      title: "Invalid variable name",
      message: "Environment variable names should usually use letters, numbers, and underscores, and should not start with a number.",
    });
  }

  if (options.warnDuplicates && entry.duplicate) {
    issues.push({
      severity: "warning",
      title: "Duplicate variable",
      message: "This variable appears more than once. Docker or Compose may use the later value depending on the context.",
    });
  }

  if (options.warnEmptyValues && entry.empty) {
    issues.push({
      severity: entry.likelySecret ? "high" : "warning",
      title: "Empty value",
      message: "This variable has an empty value. Confirm this is intentional before deployment.",
    });
  }

  if (options.warnSecrets && entry.likelySecret) {
    if (placeholderPattern.test(entry.value)) {
      issues.push({
        severity: "high",
        title: "Placeholder secret value",
        message: "This secret-like variable appears to use a placeholder value.",
      });
    } else {
      issues.push({
        severity: options.strictnessMode === "strict" ? "warning" : "info",
        title: "Secret-like variable",
        message: "This key looks like it may contain a secret. Avoid committing real production values.",
      });
    }
  }

  if (options.warnQuotedValues && entry.quoted) {
    issues.push({
      severity: "info",
      title: "Quoted value",
      message: "Quoted values can behave differently across .env parsers and Compose contexts.",
    });
  }

  if (options.warnInterpolation && entry.interpolated) {
    issues.push({
      severity: "info",
      title: "Interpolated value",
      message: "This value uses ${...} interpolation. Confirm the referenced variable exists in the target environment.",
    });
  }

  if (/localhost|127\.0\.0\.1/.test(entry.value) && /url|host|endpoint|database|redis|api/i.test(entry.key)) {
    issues.push({
      severity: "info",
      title: "Localhost reference",
      message: "Inside Docker containers, localhost points to the container itself. Confirm this value is correct.",
    });
  }

  return issues;
}

function getGlobalIssues(
  entries: EnvEntry[],
  requiredInput: string,
  options: {
    strictnessMode: StrictnessMode;
  }
): EnvIssue[] {
  const issues: EnvIssue[] = [];
  const keys = new Set(entries.map((entry) => entry.key));
  const required = requiredInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const missing = required.filter((key) => !keys.has(key));

  if (missing.length > 0) {
    issues.push({
      severity: "high",
      title: "Required variables missing",
      message: `${missing.length} required variable${missing.length === 1 ? " is" : "s are"} missing: ${missing.join(", ")}.`,
    });
  }

  if (entries.length > 50 && options.strictnessMode !== "relaxed") {
    issues.push({
      severity: "info",
      title: "Large environment file",
      message: "This file has many variables. Consider grouping and documenting deployment-critical values.",
    });
  }

  return issues;
}

function calculateScore(issues: EnvIssue[]) {
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
  result: Omit<EnvResult, "output">,
  outputMode: OutputMode
) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "dotenv") {
    return result.entries
      .map((entry) => `${entry.key}=${formatDotenvValue(entry.value)}`)
      .join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Key | Value | Source | Line | Issues |",
      "| --- | --- | --- | --- | --- |",
      ...result.entries.map((entry) =>
        `| ${escapeMarkdown(entry.key)} | ${escapeMarkdown(entry.likelySecret && entry.value ? maskValue(entry.value) : entry.value || "(empty)")} | ${entry.source} | ${entry.line} | ${entry.issues.length} |`
      ),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.entries
      .map((entry) => {
        const issues = entry.issues.length
          ? entry.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
          : ["- No common issues found."];

        return [
          entry.key || "Variable",
          "-".repeat(Math.max(8, entry.key.length || 8)),
          `Line: ${entry.line}`,
          `Source: ${entry.source}`,
          `Value: ${entry.likelySecret && entry.value ? maskValue(entry.value) : entry.value || "(empty)"}`,
          `Flags: ${[
            entry.duplicate ? "duplicate" : "",
            entry.empty ? "empty" : "",
            entry.quoted ? "quoted" : "",
            entry.interpolated ? "interpolated" : "",
            entry.likelySecret ? "secret-like" : "",
          ].filter(Boolean).join(", ") || "none"}`,
          "",
          "Findings:",
          ...issues,
        ].join("\n");
      })
      .join("\n\n");
  }

  const issues = result.issues.length
    ? result.issues.slice(0, 15).map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
    : ["- No common Docker environment issues found."];

  return [
    "Docker Environment Variable Summary",
    "-----------------------------------",
    `Score: ${result.score}/100`,
    `Variables: ${result.totalVariables}`,
    `Duplicates: ${result.duplicateCount}`,
    `Empty values: ${result.emptyCount}`,
    `Secret-like keys: ${result.secretCount}`,
    `Invalid names: ${result.invalidNameCount}`,
    `Interpolated values: ${result.interpolatedCount}`,
    "",
    "Findings:",
    ...issues,
  ].join("\n");
}

function formatDotenvValue(value: string) {
  if (/\s|#|=/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }

  return value;
}

function maskValue(value: string) {
  if (!value) {
    return "";
  }

  if (value.length <= 6) {
    return "******";
  }

  return `${value.slice(0, 3)}***${value.slice(-2)}`;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getEnvNotes(result: EnvResult): EnvNote[] {
  const notes: EnvNote[] = [];

  if (result.secretCount > 0) {
    notes.push({
      title: "Secret-like variables found",
      message:
        "Some keys look like secrets or credentials. Avoid committing real production secrets to source control.",
    });
  }

  if (result.duplicateCount > 0) {
    notes.push({
      title: "Duplicate variables",
      message:
        "Duplicate variables can cause confusing deployments because one value may override another.",
    });
  }

  if (result.emptyCount > 0) {
    notes.push({
      title: "Empty values",
      message:
        "Empty values can be valid, but they are also a common cause of failed Docker deployments.",
    });
  }

  if (result.score >= 90) {
    notes.push({
      title: "Clean environment file",
      message:
        "Only minor or no common environment variable issues were found.",
    });
  }

  return notes;
}
