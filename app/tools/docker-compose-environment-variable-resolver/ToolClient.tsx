"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "resolvedCompose" | "variableReport" | "envTemplate" | "markdown" | "json" | "checklist";
type MissingMode = "keep" | "empty" | "placeholder";
type EnvSourceMode = "envOnly" | "shellOverrides" | "composeOnly";
type DefaultMode = "useDefaults" | "reportOnly" | "ignoreDefaults";

type VariableUse = {
  name: string;
  raw: string;
  replacement: string;
  hasValue: boolean;
  usedDefault: boolean;
  required: boolean;
  message: string;
  line: number;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  variables: VariableUse[];
  issues: Issue[];
  inputLength: number;
  variableCount: number;
  missingCount: number;
  defaultCount: number;
  outputLength: number;
};

const sampleCompose = `services:
  web:
    image: "\${APP_IMAGE:-nginx:alpine}"
    ports:
      - "\${APP_PORT:-8080}:80"
    environment:
      NODE_ENV: "\${NODE_ENV:-production}"
      API_URL: "\${API_URL}"
      SECRET_KEY: "\${SECRET_KEY?SECRET_KEY is required}"
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: "\${POSTGRES_DB:-app}"
      POSTGRES_USER: "\${POSTGRES_USER:-app_user}"
      POSTGRES_PASSWORD: "\${POSTGRES_PASSWORD}"`;

const sampleEnv = `APP_IMAGE=my-app:latest
APP_PORT=3000
NODE_ENV=development
API_URL=https://api.example.com
POSTGRES_PASSWORD=change-me`;

export default function ToolClient() {
  const [composeInput, setComposeInput] = useState("");
  const [envInput, setEnvInput] = useState("");
  const [shellInput, setShellInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("resolvedCompose");
  const [missingMode, setMissingMode] = useState<MissingMode>("keep");
  const [envSourceMode, setEnvSourceMode] = useState<EnvSourceMode>("envOnly");
  const [defaultMode, setDefaultMode] = useState<DefaultMode>("useDefaults");
  const [trimEnvValues, setTrimEnvValues] = useState(true);
  const [stripEnvQuotes, setStripEnvQuotes] = useState(true);
  const [includeLineNumbers, setIncludeLineNumbers] = useState(true);
  const [includeResolvedPreview, setIncludeResolvedPreview] = useState(true);
  const [maskSensitiveValues, setMaskSensitiveValues] = useState(true);
  const [warnMissingVariables, setWarnMissingVariables] = useState(true);
  const [warnRequiredVariables, setWarnRequiredVariables] = useState(true);
  const [warnSensitiveVariables, setWarnSensitiveVariables] = useState(true);
  const [warnUnusedEnvValues, setWarnUnusedEnvValues] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const processCompose = () => {
    if (!composeInput.trim()) {
      setError("Please paste a Docker Compose YAML snippet to resolve variables.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      composeInput,
      envInput,
      shellInput,
      outputMode,
      missingMode,
      envSourceMode,
      defaultMode,
      trimEnvValues,
      stripEnvQuotes,
      includeLineNumbers,
      includeResolvedPreview,
      maskSensitiveValues,
      warnMissingVariables,
      warnRequiredVariables,
      warnSensitiveVariables,
      warnUnusedEnvValues,
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
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setComposeInput(sampleCompose);
    setEnvInput(sampleEnv);
    setShellInput("");
    setOutputMode("resolvedCompose");
    setMissingMode("keep");
    setEnvSourceMode("envOnly");
    setDefaultMode("useDefaults");
    setTrimEnvValues(true);
    setStripEnvQuotes(true);
    setIncludeLineNumbers(true);
    setIncludeResolvedPreview(true);
    setMaskSensitiveValues(true);
    setWarnMissingVariables(true);
    setWarnRequiredVariables(true);
    setWarnSensitiveVariables(true);
    setWarnUnusedEnvValues(true);
    clearResult();
  };

  const resetAll = () => {
    setComposeInput("");
    setEnvInput("");
    setShellInput("");
    setOutputMode("resolvedCompose");
    setMissingMode("keep");
    setEnvSourceMode("envOnly");
    setDefaultMode("useDefaults");
    setTrimEnvValues(true);
    setStripEnvQuotes(true);
    setIncludeLineNumbers(true);
    setIncludeResolvedPreview(true);
    setMaskSensitiveValues(true);
    setWarnMissingVariables(true);
    setWarnRequiredVariables(true);
    setWarnSensitiveVariables(true);
    setWarnUnusedEnvValues(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Docker Compose Environment Variable Resolver"
      description="Preview Docker Compose environment variable substitution, inspect .env values, defaults, required variables, and missing placeholders without running Docker."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Docker Compose YAML</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste compose.yaml content that contains placeholders such as ${"{"}APP_PORT{"}"}, ${"{"}TAG:-latest{"}"}, or ${"{"}SECRET_KEY?required{"}"}.
            </p>
          </div>

          <textarea
            value={composeInput}
            onChange={(event) => {
              setComposeInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleCompose}
            spellCheck={false}
            className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900">.env Values</label>
              <textarea
                value={envInput}
                onChange={(event) => {
                  setEnvInput(event.target.value);
                  clearResult();
                }}
                placeholder={sampleEnv}
                spellCheck={false}
                className="mt-2 w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">Shell Overrides</label>
              <textarea
                value={shellInput}
                onChange={(event) => {
                  setShellInput(event.target.value);
                  clearResult();
                }}
                placeholder={"APP_PORT=8081\nNODE_ENV=staging"}
                spellCheck={false}
                className="mt-2 w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Resolver Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Resolved Compose preview", value: "resolvedCompose" },
                { label: "Variable report", value: "variableReport" },
                { label: ".env template", value: "envTemplate" },
                { label: "Markdown report", value: "markdown" },
                { label: "JSON report", value: "json" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Missing Variables"
              value={missingMode}
              onChange={(value) => {
                setMissingMode(value as MissingMode);
                clearResult();
              }}
              options={[
                { label: "Keep original placeholder", value: "keep" },
                { label: "Resolve to empty string", value: "empty" },
                { label: "Use visible missing marker", value: "placeholder" },
              ]}
            />

            <YoryantraSelect
              label="Environment Source"
              value={envSourceMode}
              onChange={(value) => {
                setEnvSourceMode(value as EnvSourceMode);
                clearResult();
              }}
              options={[
                { label: ".env values only", value: "envOnly" },
                { label: "Shell overrides .env", value: "shellOverrides" },
                { label: "Compose placeholders only", value: "composeOnly" },
              ]}
            />

            <YoryantraSelect
              label="Default Values"
              value={defaultMode}
              onChange={(value) => {
                setDefaultMode(value as DefaultMode);
                clearResult();
              }}
              options={[
                { label: "Use Compose defaults", value: "useDefaults" },
                { label: "Report defaults only", value: "reportOnly" },
                { label: "Ignore defaults", value: "ignoreDefaults" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimEnvValues} onChange={setTrimEnvValues} label="Trim whitespace around .env values" />
          <Toggle checked={stripEnvQuotes} onChange={setStripEnvQuotes} label="Strip matching quotes from .env values" />
          <Toggle checked={includeLineNumbers} onChange={setIncludeLineNumbers} label="Include source line numbers in reports" />
          <Toggle checked={includeResolvedPreview} onChange={setIncludeResolvedPreview} label="Include resolved value preview" />
          <Toggle checked={maskSensitiveValues} onChange={setMaskSensitiveValues} label="Mask sensitive values in reports" />
          <Toggle checked={warnMissingVariables} onChange={setWarnMissingVariables} label="Warn about missing variables" />
          <Toggle checked={warnRequiredVariables} onChange={setWarnRequiredVariables} label="Warn about required placeholders" />
          <Toggle checked={warnSensitiveVariables} onChange={setWarnSensitiveVariables} label="Warn about sensitive variable names" />
          <Toggle checked={warnUnusedEnvValues} onChange={setWarnUnusedEnvValues} label="Warn about unused .env values" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          This resolver previews Compose-style substitution only. It does not run Docker, validate YAML, start containers, or read files from your machine.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processCompose}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Resolve Variables
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">Resolved Compose preview, variable report, .env template, or checklist.</p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Variables found" value={String(result.variableCount)} />
            <StatCard label="Missing values" value={String(result.missingCount)} />
            <StatCard label="Defaults used" value={String(result.defaultCount)} />
            <StatCard label="Output size" value={`${result.outputLength.toLocaleString()} chars`} />
          </div>
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

      {result?.variables.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Variable Preview</h3>
          <p className="mt-1 text-sm text-gray-500">Review placeholders, resolved values, defaults, required markers, and source lines.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Variable</th>
                  <th className="px-4 py-3 font-semibold">Replacement</th>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.variables.slice(0, 100).map((variable, index) => (
                  <tr key={`${variable.name}-${variable.line}-${index}`}>
                    <td className="px-4 py-3 font-mono">{variable.name}</td>
                    <td className="px-4 py-3 break-words font-mono">{variable.replacement}</td>
                    <td className="px-4 py-3">{variable.line}</td>
                    <td className="px-4 py-3">{variable.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.variables.length > 100 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 100 variable uses to keep the preview readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Previewing Docker Compose Variables Before Running Containers</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Docker Compose files often use variables from a <code className="rounded bg-gray-100 px-1 py-0.5">.env</code> file or shell environment. Placeholders such as <code className="rounded bg-gray-100 px-1 py-0.5">${"{"}APP_PORT:-8080{"}"}</code> are helpful, but missing values can cause confusing ports, tags, passwords, and service settings.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This resolver previews those substitutions in the browser. It helps you see which values are resolved, which defaults are used, which required variables are missing, and which <code className="rounded bg-gray-100 px-1 py-0.5">.env</code> entries are not used.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This Compose Variable Resolver Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Checking Compose files before sharing them with teammates or committing examples to a repository.</p>
            <p className="mt-2">Finding missing variables that would make image tags, ports, secrets, database names, or URLs resolve incorrectly.</p>
            <p className="mt-2">Building a clean .env template from placeholders found in a Compose file.</p>
            <p className="mt-2">Reviewing whether shell overrides should take priority over .env values in a deployment note or runbook.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the Docker Compose Environment Variable Resolver</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your Docker Compose YAML snippet into the main input box.</li>
            <li>Paste matching <code className="rounded bg-gray-100 px-1 py-0.5">.env</code> values and optional shell override values.</li>
            <li>Choose how missing values, defaults, and environment sources should be handled.</li>
            <li>Review the resolved preview, variable report, or generated <code className="rounded bg-gray-100 px-1 py-0.5">.env</code> template.</li>
            <li>Copy the result into your notes, pull request, runbook, or local Compose workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Compose Placeholder</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`ports:
  - "\${APP_PORT:-8080}:80"

environment:
  API_URL: "\${API_URL}"
  SECRET_KEY: "\${SECRET_KEY?SECRET_KEY is required}"`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">This Tool Does Not Run Docker Compose</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This is a text preview tool. It does not execute Docker, read your local files, contact registries, validate every Compose schema rule, or start containers. Use it to inspect variable substitution before running real Compose commands in your own terminal.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does this Docker Compose variable resolver do?">
              It scans pasted Compose YAML for variable placeholders, compares them with pasted .env values, applies defaults when selected, and shows what would be substituted.
            </Faq>
            <Faq title="Does this run docker compose config?">
              No. It only previews text substitution in your browser. It does not run Docker or call your system shell.
            </Faq>
            <Faq title="Can it find missing environment variables?">
              Yes. It reports placeholders that do not have matching .env or shell values and do not have usable defaults.
            </Faq>
            <Faq title="Can it create a .env template?">
              Yes. Choose .env template output to generate a starter list of variables found in the Compose file.
            </Faq>
            <Faq title="Is anything uploaded while resolving variables?">
              No. Compose text and environment values stay in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Docker Compose variable checks often connect with Compose validation, port review, dependency mapping, and environment file parsing.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/docker-compose-validator" className="yoryantra-btn-outline">Docker Compose Validator</Link>
            <Link href="/tools/docker-compose-ports-checker" className="yoryantra-btn-outline">Docker Compose Ports Checker</Link>
            <Link href="/tools/docker-environment-variable-checker" className="yoryantra-btn-outline">Docker Environment Variable Checker</Link>
            <Link href="/tools/env-file-parser" className="yoryantra-btn-outline">.env File Parser</Link>
            <Link href="/tools/docker-compose-service-dependency-visualizer" className="yoryantra-btn-outline">Docker Compose Service Dependency Visualizer</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  composeInput: string;
  envInput: string;
  shellInput: string;
  outputMode: OutputMode;
  missingMode: MissingMode;
  envSourceMode: EnvSourceMode;
  defaultMode: DefaultMode;
  trimEnvValues: boolean;
  stripEnvQuotes: boolean;
  includeLineNumbers: boolean;
  includeResolvedPreview: boolean;
  maskSensitiveValues: boolean;
  warnMissingVariables: boolean;
  warnRequiredVariables: boolean;
  warnSensitiveVariables: boolean;
  warnUnusedEnvValues: boolean;
}): Result {
  const envValues = options.envSourceMode === "composeOnly" ? new Map<string, string>() : parseEnvValues(options.envInput, options);
  const shellValues = options.envSourceMode === "shellOverrides" ? parseEnvValues(options.shellInput, options) : new Map<string, string>();
  const effectiveEnv = new Map([...envValues, ...shellValues]);
  const variables: VariableUse[] = [];
  const lines = options.composeInput.split(/\r?\n/);

  const resolvedLines = lines.map((line, index) => {
    return line.replace(/\$\{([^}]+)\}/g, (raw, expression: string) => {
      const resolved = resolveExpression(expression, raw, effectiveEnv, options);
      variables.push({ ...resolved, raw, line: index + 1 });
      return resolved.replacement;
    });
  });

  const issues = buildIssues(variables, envValues, shellValues, options);
  const output = formatOutput(resolvedLines.join("\n"), variables, issues, options, envValues, shellValues);

  return {
    output,
    variables,
    issues,
    inputLength: options.composeInput.length + options.envInput.length + options.shellInput.length,
    variableCount: variables.length,
    missingCount: variables.filter((item) => !item.hasValue && !item.usedDefault).length,
    defaultCount: variables.filter((item) => item.usedDefault).length,
    outputLength: output.length,
  };
}

function parseEnvValues(input: string, options: { trimEnvValues: boolean; stripEnvQuotes: boolean }) {
  const map = new Map<string, string>();

  input.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index === -1) return;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1);
    if (options.trimEnvValues) value = value.trim();
    if (options.stripEnvQuotes) value = stripQuotes(value);
    if (key) map.set(key, value);
  });

  return map;
}

function stripQuotes(value: string) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function resolveExpression(expression: string, raw: string, env: Map<string, string>, options: {
  missingMode: MissingMode;
  defaultMode: DefaultMode;
  maskSensitiveValues: boolean;
}): Omit<VariableUse, "raw" | "line"> {
  const parsed = parseExpression(expression);
  const value = env.get(parsed.name);
  const hasValue = value !== undefined && value !== "";

  if (hasValue) {
    return {
      name: parsed.name,
      replacement: options.maskSensitiveValues && isSensitive(parsed.name) ? "••••••" : value,
      hasValue: true,
      usedDefault: false,
      required: parsed.required,
      message: "Resolved from environment",
    };
  }

  if (parsed.defaultValue !== null && options.defaultMode === "useDefaults") {
    return {
      name: parsed.name,
      replacement: options.maskSensitiveValues && isSensitive(parsed.name) ? "••••••" : parsed.defaultValue,
      hasValue: false,
      usedDefault: true,
      required: parsed.required,
      message: "Used Compose default",
    };
  }

  const replacement = options.missingMode === "empty" ? "" : options.missingMode === "placeholder" ? `__MISSING_${parsed.name}__` : raw;

  return {
    name: parsed.name,
    replacement,
    hasValue: false,
    usedDefault: false,
    required: parsed.required,
    message: parsed.required ? parsed.requiredMessage || "Required variable missing" : "Missing variable",
  };
}

function parseExpression(expression: string) {
  const requiredMatch = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\?(.*)$/);
  if (requiredMatch) {
    return {
      name: requiredMatch[1],
      defaultValue: null as string | null,
      required: true,
      requiredMessage: requiredMatch[2] || "required",
    };
  }

  const defaultMatch = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)(:-|-)(.*)$/);
  if (defaultMatch) {
    return {
      name: defaultMatch[1],
      defaultValue: defaultMatch[3],
      required: false,
      requiredMessage: "",
    };
  }

  return {
    name: expression.trim(),
    defaultValue: null as string | null,
    required: false,
    requiredMessage: "",
  };
}

function buildIssues(variables: VariableUse[], envValues: Map<string, string>, shellValues: Map<string, string>, options: {
  warnMissingVariables: boolean;
  warnRequiredVariables: boolean;
  warnSensitiveVariables: boolean;
  warnUnusedEnvValues: boolean;
}) {
  const issues: Issue[] = [];
  const missing = variables.filter((item) => !item.hasValue && !item.usedDefault);
  const requiredMissing = missing.filter((item) => item.required);

  if (options.warnMissingVariables && missing.length) {
    issues.push({
      severity: "warning",
      title: "Missing variables",
      message: `${missing.length} placeholder${missing.length === 1 ? "" : "s"} did not resolve from the provided environment values.`,
    });
  }

  if (options.warnRequiredVariables && requiredMissing.length) {
    issues.push({
      severity: "high",
      title: "Required variables missing",
      message: `${requiredMissing.length} required placeholder${requiredMissing.length === 1 ? "" : "s"} are missing values.`,
    });
  }

  if (options.warnSensitiveVariables && variables.some((item) => isSensitive(item.name))) {
    issues.push({
      severity: "info",
      title: "Sensitive variable names",
      message: "Some variable names look sensitive. Avoid sharing real secrets, passwords, keys, and tokens in screenshots or public issues.",
    });
  }

  if (options.warnUnusedEnvValues) {
    const used = new Set(variables.map((item) => item.name));
    const unused = [...envValues.keys(), ...shellValues.keys()].filter((key) => !used.has(key));
    if (unused.length) {
      issues.push({
        severity: "info",
        title: "Unused environment values",
        message: `${unused.length} provided environment value${unused.length === 1 ? "" : "s"} were not referenced by the Compose snippet.`,
      });
    }
  }

  return issues;
}

function formatOutput(resolvedCompose: string, variables: VariableUse[], issues: Issue[], options: {
  outputMode: OutputMode;
  includeLineNumbers: boolean;
  includeResolvedPreview: boolean;
}, envValues: Map<string, string>, shellValues: Map<string, string>) {
  if (options.outputMode === "resolvedCompose") return resolvedCompose;

  if (options.outputMode === "variableReport") {
    const lines = ["Variable report", ""];
    variables.forEach((item) => {
      const linePrefix = options.includeLineNumbers ? `Line ${item.line}: ` : "";
      lines.push(`${linePrefix}${item.name} -> ${item.replacement} (${item.message})`);
    });
    if (issues.length) {
      lines.push("", "Notes:");
      issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
    }
    return lines.join("\n");
  }

  if (options.outputMode === "envTemplate") {
    const unique = Array.from(new Set(variables.map((item) => item.name))).sort((a, b) => a.localeCompare(b));
    return unique.map((name) => `${name}=`).join("\n");
  }

  if (options.outputMode === "json") {
    return JSON.stringify({
      variables,
      issues,
      envKeys: [...envValues.keys()],
      shellOverrideKeys: [...shellValues.keys()],
      resolvedCompose: options.includeResolvedPreview ? resolvedCompose : undefined,
    }, null, 2);
  }

  if (options.outputMode === "markdown") {
    const lines = [
      "| Variable | Line | Replacement | Status |",
      "|---|---:|---|---|",
      ...variables.map((item) => `| ${escapeMarkdown(item.name)} | ${item.line} | ${escapeMarkdown(item.replacement)} | ${escapeMarkdown(item.message)} |`),
    ];

    if (options.includeResolvedPreview) {
      lines.push("", "## Resolved Compose Preview", "", "```yaml", resolvedCompose, "```");
    }

    if (issues.length) {
      lines.push("", "## Notes", "", ...issues.map((issue) => `- **${issue.title}:** ${issue.message}`));
    }

    return lines.join("\n");
  }

  const lines = [
    "# Docker Compose Environment Review",
    "",
    `- [${variables.length ? "x" : " "}] Found ${variables.length} variable placeholder${variables.length === 1 ? "" : "s"}.`,
    `- [${variables.every((item) => item.hasValue || item.usedDefault || !item.required) ? "x" : " "}] No required variables are missing.`,
    `- [${variables.every((item) => item.hasValue || item.usedDefault) ? "x" : " "}] All placeholders resolved from env values or defaults.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function isSensitive(name: string) {
  return /secret|password|passwd|token|key|credential|private/i.test(name);
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.variableCount > 100) {
    notes.push({
      severity: "info",
      title: "Many placeholders",
      message: "This Compose snippet has many variable references. Review generated reports carefully before copying values into documentation.",
    });
  }

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated output is large. Consider using the variable report or .env template output for easier review.",
    });
  }

  return notes;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
      />
      <span>{label}</span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
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
