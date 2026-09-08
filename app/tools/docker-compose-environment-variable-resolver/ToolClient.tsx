"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { parseAllDocuments } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "resolvedCompose" | "variableReport" | "envTemplate" | "markdown" | "json" | "checklist";
type MissingMode = "empty" | "keep" | "placeholder";
type EnvSourceMode = "envOnly" | "shellOverrides" | "composeOnly";
type DefaultMode = "useDefaults" | "reportOnly" | "ignoreDefaults";
type SourceName = ".env" | "shell" | "default" | "alternative" | "missing";

type VariableUse = {
  name: string;
  raw: string;
  replacement: string;
  displayReplacement: string;
  isSet: boolean;
  isEmpty: boolean;
  usedDefault: boolean;
  usedAlternative: boolean;
  required: boolean;
  message: string;
  line: number;
  source: SourceName;
  operator: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type ParsedEnvironment = {
  values: Map<string, string>;
  duplicates: string[];
};

type Result = {
  output: string;
  variables: VariableUse[];
  issues: Issue[];
  variableCount: number;
  uniqueVariableCount: number;
  missingCount: number;
  requiredMissingCount: number;
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
      SECRET_KEY: "\${SECRET_KEY:?SECRET_KEY is required}"
      LITERAL_DOLLAR: "$$HOME"
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: "\${POSTGRES_DB:-app}"
      POSTGRES_USER: "\${POSTGRES_USER:-app_user}"
      POSTGRES_PASSWORD: "\${POSTGRES_PASSWORD}"`;

const sampleEnv = `APP_IMAGE=my-app:1.8.0
APP_PORT=3000
NODE_ENV=development
API_URL=https://api.example.com
POSTGRES_PASSWORD=change-me`;

export default function ToolClient() {
  const [composeInput, setComposeInput] = useState("");
  const [envInput, setEnvInput] = useState("");
  const [shellInput, setShellInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("resolvedCompose");
  const [missingMode, setMissingMode] = useState<MissingMode>("empty");
  const [envSourceMode, setEnvSourceMode] = useState<EnvSourceMode>("envOnly");
  const [defaultMode, setDefaultMode] = useState<DefaultMode>("useDefaults");
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
      setError("Paste a Docker Compose YAML snippet before resolving variables.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildResult({
        composeInput,
        envInput,
        shellInput,
        outputMode,
        missingMode,
        envSourceMode,
        defaultMode,
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
    } catch (caught) {
      setResult(null);
      setOutput("");
      setCopied(false);
      setError(caught instanceof Error ? caught.message : "Unable to resolve the Compose variables.");
    }
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
    setMissingMode("empty");
    setEnvSourceMode("envOnly");
    setDefaultMode("useDefaults");
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
    setMissingMode("empty");
    setEnvSourceMode("envOnly");
    setDefaultMode("useDefaults");
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
      description="Preview Compose interpolation with shell precedence, operator semantics, missing values, and masked secret-aware output."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Compose YAML</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a Compose file containing $VAR, ${"{"}VAR{"}"}, fallback, required, or alternative expressions.
            </p>
          </div>

          <textarea
            value={composeInput}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setComposeInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleCompose}
            spellCheck={false}
            className="min-h-[420px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-900">.env values</label>
              <textarea
                value={envInput}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  setEnvInput(event.target.value);
                  clearResult();
                }}
                placeholder={sampleEnv}
                spellCheck={false}
                className="mt-2 min-h-[190px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900">Shell values</label>
              <textarea
                value={shellInput}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  setShellInput(event.target.value);
                  clearResult();
                }}
                placeholder={"APP_PORT=8081\nNODE_ENV=staging"}
                spellCheck={false}
                className="mt-2 min-h-[190px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
              <p className="mt-2 text-xs leading-5 text-gray-500">
                In shell-override mode these values take precedence over the pasted .env block, matching Compose interpolation precedence.
              </p>
            </div>
          </div>
        </div>

        <div className="self-start rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Resolution settings</h3>
          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value: string) => {
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
              label="Unset plain variables"
              value={missingMode}
              onChange={(value: string) => {
                setMissingMode(value as MissingMode);
                clearResult();
              }}
              options={[
                { label: "Compose behavior: empty string", value: "empty" },
                { label: "Keep placeholder for review", value: "keep" },
                { label: "Insert visible missing marker", value: "placeholder" },
              ]}
            />

            <YoryantraSelect
              label="Interpolation sources"
              value={envSourceMode}
              onChange={(value: string) => {
                setEnvSourceMode(value as EnvSourceMode);
                clearResult();
              }}
              options={[
                { label: ".env values", value: "envOnly" },
                { label: "Shell overrides .env", value: "shellOverrides" },
                { label: "No supplied values", value: "composeOnly" },
              ]}
            />

            <YoryantraSelect
              label="Fallback / alternative operators"
              value={defaultMode}
              onChange={(value: string) => {
                setDefaultMode(value as DefaultMode);
                clearResult();
              }}
              options={[
                { label: "Apply Compose semantics", value: "useDefaults" },
                { label: "Show when fallback would apply", value: "reportOnly" },
                { label: "Ignore fallback values", value: "ignoreDefaults" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Report controls</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={includeLineNumbers} onChange={setIncludeLineNumbers} label="Include Compose line numbers" />
          <Toggle checked={includeResolvedPreview} onChange={setIncludeResolvedPreview} label="Include resolved preview in reports" />
          <Toggle checked={maskSensitiveValues} onChange={setMaskSensitiveValues} label="Mask secret-looking values in generated output" />
          <Toggle checked={warnMissingVariables} onChange={setWarnMissingVariables} label="Flag unresolved variables" />
          <Toggle checked={warnRequiredVariables} onChange={setWarnRequiredVariables} label="Flag failed required expressions" />
          <Toggle checked={warnSensitiveVariables} onChange={setWarnSensitiveVariables} label="Flag secret-looking variable names" />
          <Toggle checked={warnUnusedEnvValues} onChange={setWarnUnusedEnvValues} label="Report supplied values that are unused" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Values stay in this browser session. No local .env file is read automatically, and nothing here starts Docker or inspects a running container.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={processCompose} className="min-h-11 whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
          Resolve Variables
        </button>
        <button type="button" onClick={loadExample} className="min-h-11 whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="min-h-11 whitespace-nowrap rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50">
          Reset
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generated output</h3>
                <p className="mt-1 text-sm text-gray-500">Masked values are deliberately not suitable as deployable configuration.</p>
              </div>
              <button type="button" onClick={copyOutput} disabled={!output} className="min-h-11 whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>
            <pre className="mt-4 max-h-[560px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">{output}</pre>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard label="References" value={String(result.variableCount)} />
            <StatCard label="Unique variables" value={String(result.uniqueVariableCount)} />
            <StatCard label="Unresolved" value={String(result.missingCount)} />
            <StatCard label="Required failures" value={String(result.requiredMissingCount)} />
            <StatCard label="Fallbacks used" value={String(result.defaultCount)} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">What the result means</h3>
          <div className="mt-4 divide-y divide-gray-200">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Interpolation happens before the container gets its environment</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compose interpolation replaces variables in the Compose model. That is a different question from which value finally appears inside a container through <code>environment</code>, <code>env_file</code>, image <code>ENV</code>, or <code>docker compose run -e</code>. A value can win interpolation precedence without being a container environment variable by itself.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For interpolation, shell values take precedence over an environment file. Docker exposes the environment used for interpolation through <code>docker compose config --environment</code>; that command remains the authoritative check for a real project with its actual files and CLI flags.
          </p>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Colon changes empty-string behavior</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
              <p><code>${"{"}VAR:-fallback{"}"}</code> uses the fallback when VAR is unset <strong>or empty</strong>.</p>
              <p><code>${"{"}VAR-fallback{"}"}</code> uses it only when VAR is unset.</p>
              <p><code>${"{"}VAR:?message{"}"}</code> fails for unset or empty values; <code>${"{"}VAR?message{"}"}</code> fails only when unset.</p>
              <p><code>:+</code> and <code>+</code> use the same empty-versus-unset distinction for alternative values.</p>
            </div>
          </div>

          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">Preview modes can intentionally differ from Compose</h2>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              “Keep placeholder”, visible missing markers, report-only fallbacks, and ignored fallbacks are review aids. Normal Compose behavior substitutes an unset plain variable with an empty string and applies supported operators. Do not copy an analysis-mode preview into production and assume Docker produced it.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What is parsed from the pasted .env block</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The parser accepts <code>=</code> or <code>:</code> delimiters, ignores blank/comment lines, keeps <code>#</code> inside unquoted values unless whitespace starts a comment, decodes common escapes inside double quotes, and keeps single-quoted values literal. Single-quoted values may span lines. Duplicate names are reported and the later pasted definition wins inside that source.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unquoted and double-quoted .env values can themselves contain Compose-style interpolation. Single quotes deliberately prevent it. These details matter when a seemingly simple .env value contains another variable, a literal dollar sign, or an inline comment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Boundaries worth keeping visible</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li><code>$$</code> emits a literal dollar sign and suppresses Compose interpolation for that dollar.</li>
            <li>Interpolation applies to values, not YAML mapping keys. Compose commonly uses an equal-sign list form when a key itself needs interpolation.</li>
            <li>Multiple <code>--env-file</code> arguments, project-directory discovery, <code>COMPOSE_FILE</code> relocation, and host process state are not inferred from pasted text.</li>
            <li><code>env_file:</code> under a service controls the container environment and is not the same thing as the .env file used to interpolate the Compose model.</li>
            <li>Swarm <code>docker stack deploy</code> does not provide the same .env substitution feature as Docker Compose CLI.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Keep secrets out of copied previews</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Secret-looking names are masked in generated output by default. That reduces accidental exposure in tickets and screenshots, but name matching cannot identify every credential. Docker also recommends using secrets rather than ordinary environment variables for sensitive material when the platform supports that design.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Docker references behind these rules</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Docker documents interpolation syntax and .env parsing in its environment-variable guide, and separately documents container environment precedence. Those are intentionally separate concepts here too.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a className="font-semibold text-[var(--green)] underline-offset-4 hover:underline" href="https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/" target="_blank" rel="noreferrer">Compose interpolation</a>
            <a className="font-semibold text-[var(--green)] underline-offset-4 hover:underline" href="https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/" target="_blank" rel="noreferrer">Environment precedence</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/docker-compose-environment-variable-resolver" />
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
  includeLineNumbers: boolean;
  includeResolvedPreview: boolean;
  maskSensitiveValues: boolean;
  warnMissingVariables: boolean;
  warnRequiredVariables: boolean;
  warnSensitiveVariables: boolean;
  warnUnusedEnvValues: boolean;
}): Result {
  validateComposeYaml(options.composeInput);

  const emptyEnvironment: ParsedEnvironment = { values: new Map<string, string>(), duplicates: [] };
  const shell = options.envSourceMode === "shellOverrides"
    ? parseEnvValues(options.shellInput, "shell", new Map<string, string>())
    : emptyEnvironment;
  const env = options.envSourceMode === "composeOnly"
    ? emptyEnvironment
    : parseEnvValues(options.envInput, ".env", shell.values);

  const effective = new Map<string, { value: string; source: ".env" | "shell" }>();
  env.values.forEach((value, key) => effective.set(key, { value, source: ".env" }));
  if (options.envSourceMode === "shellOverrides") {
    shell.values.forEach((value, key) => effective.set(key, { value, source: "shell" }));
  }

  const variables: VariableUse[] = [];
  const resolvedLines = options.composeInput.replace(/\r\n?/g, "\n").split("\n").map((line, index) =>
    resolveComposeLine(line, index + 1, effective, options, variables)
  );
  const issues = buildIssues(variables, env, shell, effective, options);
  const resolvedCompose = resolvedLines.join("\n");
  const output = formatOutput(resolvedCompose, variables, issues, options, env, shell);
  const uniqueNames = new Set(variables.map((item) => item.name));

  return {
    output,
    variables,
    issues,
    variableCount: variables.length,
    uniqueVariableCount: uniqueNames.size,
    missingCount: variables.filter((item) => item.source === "missing").length,
    requiredMissingCount: variables.filter((item) => item.required && item.source === "missing").length,
    defaultCount: variables.filter((item) => item.usedDefault || item.usedAlternative).length,
    outputLength: output.length,
  };
}

function validateComposeYaml(input: string): void {
  const documents = parseAllDocuments(input, { uniqueKeys: true, prettyErrors: true });
  documents.forEach((document, index) => {
    if (document.errors.length > 0) {
      throw new Error(`Compose YAML document ${index + 1}: ${document.errors[0].message}`);
    }
  });
}

function parseEnvValues(
  input: string,
  source: ".env" | "shell",
  baseValues: Map<string, string>,
): ParsedEnvironment {
  const text = input.replace(/\r\n?/g, "\n");
  const values = new Map<string, string>();
  const duplicates: string[] = [];
  let offset = 0;
  let lineNumber = 1;

  while (offset < text.length) {
    const physicalEndIndex = text.indexOf("\n", offset);
    const lineEnd = physicalEndIndex === -1 ? text.length : physicalEndIndex;
    const rawLine = text.slice(offset, lineEnd);
    const leading = rawLine.replace(/^\s+/, "");

    if (!leading || leading.startsWith("#")) {
      offset = physicalEndIndex === -1 ? text.length : physicalEndIndex + 1;
      lineNumber += 1;
      continue;
    }

    let cursor = offset;
    while (text[cursor] === " " || text[cursor] === "\t") cursor += 1;
    const keyStart = cursor;
    while (cursor < text.length && /[A-Za-z0-9_]/.test(text[cursor])) cursor += 1;
    const key = text.slice(keyStart, cursor);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      throw new Error(`${source} line ${lineNumber}: invalid variable name.`);
    }

    while (text[cursor] === " " || text[cursor] === "\t") cursor += 1;
    if (text[cursor] !== "=" && text[cursor] !== ":") {
      if (cursor < text.length && text[cursor] !== "\n") {
        throw new Error(`${source} line ${lineNumber}: invalid variable name near ${key}.`);
      }
      throw new Error(`${source} line ${lineNumber}: expected "=" or ":" after ${key}.`);
    }
    cursor += 1;
    while (text[cursor] === " " || text[cursor] === "\t") cursor += 1;

    let value = "";
    let mode: "single" | "double" | "unquoted" = "unquoted";
    if (text[cursor] === "'") mode = "single";
    if (text[cursor] === '"') mode = "double";

    if (mode === "single") {
      cursor += 1;
      let closed = false;
      while (cursor < text.length) {
        const char = text[cursor];
        if (char === "\\" && text[cursor + 1] === "'") {
          value += "'";
          cursor += 2;
          continue;
        }
        if (char === "'") {
          closed = true;
          cursor += 1;
          break;
        }
        if (char === "\n") lineNumber += 1;
        value += char;
        cursor += 1;
      }
      if (!closed) throw new Error(`${source} line ${lineNumber}: unterminated single-quoted value for ${key}.`);
      cursor = skipSpaces(text, cursor);
      if (text[cursor] === "#") cursor = skipToLineEnd(text, cursor);
      if (cursor < text.length && text[cursor] !== "\n") {
        throw new Error(`${source} line ${lineNumber}: unexpected text after ${key}.`);
      }
    } else if (mode === "double") {
      cursor += 1;
      let closed = false;
      while (cursor < text.length && text[cursor] !== "\n") {
        const char = text[cursor];
        if (char === "\\") {
          const next = text[cursor + 1];
          const escapes: Record<string, string> = { n: "\n", r: "\r", t: "\t", "\\": "\\", '"': '"' };
          value += next && Object.prototype.hasOwnProperty.call(escapes, next) ? escapes[next] : next ? `\\${next}` : "\\";
          cursor += next ? 2 : 1;
          continue;
        }
        if (char === '"') {
          closed = true;
          cursor += 1;
          break;
        }
        value += char;
        cursor += 1;
      }
      if (!closed) throw new Error(`${source} line ${lineNumber}: unterminated double-quoted value for ${key}.`);
      cursor = skipSpaces(text, cursor);
      if (text[cursor] === "#") cursor = skipToLineEnd(text, cursor);
      if (cursor < text.length && text[cursor] !== "\n") {
        throw new Error(`${source} line ${lineNumber}: unexpected text after ${key}.`);
      }
    } else {
      const start = cursor;
      while (cursor < text.length && text[cursor] !== "\n") {
        if (text[cursor] === "#" && (cursor === start || /\s/.test(text[cursor - 1]))) break;
        cursor += 1;
      }
      value = text.slice(start, cursor).replace(/[ \t]+$/, "");
      cursor = skipToLineEnd(text, cursor);
    }

    if (mode !== "single") {
      const environment = new Map<string, { value: string; source: ".env" | "shell" }>();
      baseValues.forEach((baseValue, baseKey) => environment.set(baseKey, { value: baseValue, source: "shell" }));
      values.forEach((currentValue, currentKey) => environment.set(currentKey, { value: currentValue, source }));
      value = resolveFragmentValue(value, environment);
    }

    if (values.has(key)) duplicates.push(key);
    values.set(key, value);

    if (cursor < text.length && text[cursor] === "\n") {
      cursor += 1;
      lineNumber += 1;
    }
    offset = cursor;
  }

  return { values, duplicates: uniqueSorted(duplicates) };
}

function resolveComposeLine(
  line: string,
  lineNumber: number,
  env: Map<string, { value: string; source: ".env" | "shell" }>,
  options: { missingMode: MissingMode; defaultMode: DefaultMode; maskSensitiveValues: boolean },
  variables: VariableUse[]
): string {
  const valueStart = findYamlValueStart(line);
  const prefix = line.slice(0, valueStart);
  const valuePart = line.slice(valueStart);
  let output = "";
  let quote: "single" | "double" | null = null;
  let index = 0;

  while (index < valuePart.length) {
    const char = valuePart[index];
    if (quote === "single") {
      output += char;
      if (char === "'" && valuePart[index + 1] === "'") {
        output += "'";
        index += 2;
        continue;
      }
      if (char === "'") quote = null;
      index += 1;
      continue;
    }
    if (quote === "double") {
      if (char === '"') {
        quote = null;
        output += char;
        index += 1;
        continue;
      }
      if (char === "\\" && index + 1 < valuePart.length) {
        output += char + valuePart[index + 1];
        index += 2;
        continue;
      }
    } else {
      if (char === "#" && (index === 0 || /\s/.test(valuePart[index - 1]))) {
        output += valuePart.slice(index);
        break;
      }
      if (char === "'") {
        quote = "single";
        output += char;
        index += 1;
        continue;
      }
      if (char === '"') {
        quote = "double";
        output += char;
        index += 1;
        continue;
      }
    }

    if (char !== "$") {
      output += char;
      index += 1;
      continue;
    }

    if (valuePart[index + 1] === "$") {
      output += "$";
      index += 2;
      continue;
    }

    const token = readVariableToken(valuePart, index);
    if (!token) {
      output += "$";
      index += 1;
      continue;
    }

    const resolved = resolveVariableToken(token.raw, token.expression, env, options);
    variables.push({ ...resolved, raw: token.raw, line: lineNumber });
    output += resolved.displayReplacement;
    index = token.end;
  }

  return prefix + output;
}

function findYamlValueStart(line: string): number {
  let single = false;
  let double = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "'" && !double) single = !single;
    if (char === '"' && !single && line[index - 1] !== "\\") double = !double;
    if (!single && !double && char === ":" && (index + 1 === line.length || /\s/.test(line[index + 1]))) {
      return index + 1;
    }
  }
  return 0;
}

function readVariableToken(text: string, start: number): { raw: string; expression: string; end: number } | null {
  if (text[start + 1] === "{") {
    const close = findClosingBrace(text, start + 2);
    if (close === -1) throw new Error("Unclosed ${...} interpolation expression in Compose YAML.");
    return { raw: text.slice(start, close + 1), expression: text.slice(start + 2, close), end: close + 1 };
  }
  const match = text.slice(start + 1).match(/^[A-Za-z_][A-Za-z0-9_]*/);
  if (!match) return null;
  return { raw: `$${match[0]}`, expression: match[0], end: start + 1 + match[0].length };
}

function findClosingBrace(text: string, start: number): number {
  let nested = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === "$" && text[index + 1] === "{") {
      nested += 1;
      index += 1;
      continue;
    }
    if (text[index] === "}") {
      if (nested === 0) return index;
      nested -= 1;
    }
  }
  return -1;
}

function resolveVariableToken(
  raw: string,
  expression: string,
  env: Map<string, { value: string; source: ".env" | "shell" }>,
  options: { missingMode: MissingMode; defaultMode: DefaultMode; maskSensitiveValues: boolean }
): Omit<VariableUse, "raw" | "line"> {
  const parsed = parseExpression(expression);
  const entry = env.get(parsed.name);
  const isSet = Boolean(entry);
  const value = entry ? entry.value : "";
  const nonEmpty = isSet && value !== "";
  const requiresNonEmpty = parsed.operator === ":-" || parsed.operator === ":?" || parsed.operator === ":+";
  const conditionMet = requiresNonEmpty ? nonEmpty : isSet;
  const masked = options.maskSensitiveValues && isSensitive(parsed.name);

  if (!parsed.operator) {
    if (isSet) return variableResult(parsed, value, masked, entry ? entry.source : "missing", true, value === "", false, false, "Resolved from supplied environment");
    return missingVariableResult(parsed, raw, options, false, "Variable is unset");
  }

  if (parsed.operator === ":-" || parsed.operator === "-") {
    if (conditionMet) return variableResult(parsed, value, masked, entry ? entry.source : "missing", true, value === "", false, false, "Resolved from supplied environment");
    if (options.defaultMode === "useDefaults") {
      const fallback = resolveFragmentValue(parsed.payload, env);
      return variableResult(parsed, fallback, masked, "default", false, false, true, false, "Used Compose fallback value");
    }
    if (options.defaultMode === "reportOnly") {
      return variableResult(parsed, raw, false, "missing", false, false, false, false, "Fallback would apply in Compose (report-only mode)");
    }
    return missingVariableResult(parsed, raw, options, false, "Fallback ignored by selected analysis mode");
  }

  if (parsed.operator === ":?" || parsed.operator === "?") {
    if (conditionMet) return variableResult(parsed, value, masked, entry ? entry.source : "missing", true, value === "", false, false, "Required value is present");
    const message = parsed.payload ? resolveFragmentValue(parsed.payload, env) : `${parsed.name} is required`;
    return missingVariableResult(parsed, raw, options, true, message);
  }

  if (parsed.operator === ":+" || parsed.operator === "+") {
    if (!conditionMet) return variableResult(parsed, "", false, "alternative", isSet, value === "", false, true, "Alternative condition was not met; Compose uses an empty string");
    if (options.defaultMode === "useDefaults") {
      const alternative = resolveFragmentValue(parsed.payload, env);
      return variableResult(parsed, alternative, masked, "alternative", isSet, value === "", false, true, "Used Compose alternative value");
    }
    if (options.defaultMode === "reportOnly") {
      return variableResult(parsed, raw, false, "alternative", isSet, value === "", false, false, "Alternative would apply in Compose (report-only mode)");
    }
    return variableResult(parsed, "", false, "alternative", isSet, value === "", false, false, "Alternative ignored by selected analysis mode");
  }

  throw new Error(`Unsupported Compose interpolation operator in ${raw}.`);
}

function variableResult(
  parsed: { name: string; operator: string; payload: string },
  replacement: string,
  masked: boolean,
  source: SourceName,
  isSet: boolean,
  isEmpty: boolean,
  usedDefault: boolean,
  usedAlternative: boolean,
  message: string
): Omit<VariableUse, "raw" | "line"> {
  return {
    name: parsed.name,
    replacement,
    displayReplacement: masked ? "••••••" : replacement,
    isSet,
    isEmpty,
    usedDefault,
    usedAlternative,
    required: parsed.operator === ":?" || parsed.operator === "?",
    message,
    source,
    operator: parsed.operator,
  };
}

function missingVariableResult(
  parsed: { name: string; operator: string; payload: string },
  raw: string,
  options: { missingMode: MissingMode },
  required: boolean,
  message: string
): Omit<VariableUse, "raw" | "line"> {
  const replacement = options.missingMode === "empty" ? "" : options.missingMode === "placeholder" ? `__MISSING_${parsed.name}__` : raw;
  return {
    name: parsed.name,
    replacement,
    displayReplacement: replacement,
    isSet: false,
    isEmpty: false,
    usedDefault: false,
    usedAlternative: false,
    required,
    message,
    source: "missing",
    operator: parsed.operator,
  };
}

function parseExpression(expression: string): { name: string; operator: string; payload: string } {
  const nameMatch = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)(.*)$/);
  if (!nameMatch) throw new Error(`Invalid Compose interpolation expression: \${${expression}}`);
  const name = nameMatch[1];
  const rest = nameMatch[2];
  if (!rest) return { name, operator: "", payload: "" };
  const operators = [":-", ":?", ":+", "-", "?", "+"];
  for (const operator of operators) {
    if (rest.startsWith(operator)) return { name, operator, payload: rest.slice(operator.length) };
  }
  throw new Error(`Unsupported Compose interpolation expression: \${${expression}}`);
}

function resolveFragmentValue(text: string, env: Map<string, { value: string; source: ".env" | "shell" }>, depth = 0): string {
  if (depth > 20) throw new Error("Nested interpolation is too deep to resolve safely.");
  let output = "";
  let index = 0;
  while (index < text.length) {
    if (text[index] !== "$") {
      output += text[index];
      index += 1;
      continue;
    }
    if (text[index + 1] === "$") {
      output += "$";
      index += 2;
      continue;
    }
    const token = readVariableToken(text, index);
    if (!token) {
      output += "$";
      index += 1;
      continue;
    }
    const parsed = parseExpression(token.expression);
    const entry = env.get(parsed.name);
    const isSet = Boolean(entry);
    const value = entry ? entry.value : "";
    const nonEmpty = isSet && value !== "";
    let replacement = "";
    if (!parsed.operator) replacement = value;
    else if (parsed.operator === ":-") replacement = nonEmpty ? value : resolveFragmentValue(parsed.payload, env, depth + 1);
    else if (parsed.operator === "-") replacement = isSet ? value : resolveFragmentValue(parsed.payload, env, depth + 1);
    else if (parsed.operator === ":+") replacement = nonEmpty ? resolveFragmentValue(parsed.payload, env, depth + 1) : "";
    else if (parsed.operator === "+") replacement = isSet ? resolveFragmentValue(parsed.payload, env, depth + 1) : "";
    else if (parsed.operator === ":?") {
      if (!nonEmpty) throw new Error(resolveFragmentValue(parsed.payload, env, depth + 1) || `${parsed.name} is required`);
      replacement = value;
    } else if (parsed.operator === "?") {
      if (!isSet) throw new Error(resolveFragmentValue(parsed.payload, env, depth + 1) || `${parsed.name} is required`);
      replacement = value;
    }
    output += replacement;
    index = token.end;
  }
  return output;
}

function buildIssues(
  variables: VariableUse[],
  env: ParsedEnvironment,
  shell: ParsedEnvironment,
  effective: Map<string, { value: string; source: ".env" | "shell" }>,
  options: { warnMissingVariables: boolean; warnRequiredVariables: boolean; warnSensitiveVariables: boolean; warnUnusedEnvValues: boolean; defaultMode: DefaultMode; missingMode: MissingMode; maskSensitiveValues: boolean }
): Issue[] {
  const issues: Issue[] = [];
  const missing = variables.filter((item) => item.source === "missing");
  const requiredMissing = missing.filter((item) => item.required);

  if (options.warnRequiredVariables && requiredMissing.length) {
    issues.push({ severity: "high", title: "Required interpolation failed", message: `${requiredMissing.length} required reference${requiredMissing.length === 1 ? "" : "s"} would stop normal Compose interpolation.` });
  }
  if (options.warnMissingVariables && missing.length) {
    issues.push({ severity: "warning", title: "Unresolved references", message: `${missing.length} reference${missing.length === 1 ? "" : "s"} had no supplied value or applied fallback.` });
  }
  const duplicateNames = uniqueSorted([...env.duplicates, ...shell.duplicates]);
  if (duplicateNames.length) {
    issues.push({ severity: "warning", title: "Duplicate environment names", message: `Later pasted definitions win for: ${duplicateNames.join(", ")}.` });
  }
  if (options.defaultMode !== "useDefaults" || options.missingMode !== "empty") {
    issues.push({ severity: "warning", title: "Analysis mode differs from Compose", message: "One or more selected review modes intentionally change normal interpolation output." });
  }
  if (options.warnSensitiveVariables && variables.some((item) => isSensitive(item.name))) {
    issues.push({ severity: "info", title: "Secret-looking names detected", message: options.maskSensitiveValues ? "Generated output masks matching values, but name-based masking cannot identify every secret." : "Masking is disabled; copied output may contain credentials or tokens." });
  }
  if (options.warnUnusedEnvValues) {
    const used = new Set(variables.map((item) => item.name));
    const unused = Array.from(effective.keys()).filter((key) => !used.has(key)).sort(compareText);
    if (unused.length) issues.push({ severity: "info", title: "Supplied values not referenced", message: `${unused.length} effective value${unused.length === 1 ? " was" : "s were"} not referenced by this Compose snippet.` });
  }
  if (!issues.length) issues.push({ severity: "info", title: "Interpolation preview completed", message: "The supplied references resolved without a finding from the enabled checks." });
  return issues;
}

function formatOutput(
  resolvedCompose: string,
  variables: VariableUse[],
  issues: Issue[],
  options: { outputMode: OutputMode; includeLineNumbers: boolean; includeResolvedPreview: boolean },
  env: ParsedEnvironment,
  shell: ParsedEnvironment
): string {
  if (options.outputMode === "resolvedCompose") return resolvedCompose;

  if (options.outputMode === "variableReport") {
    const lines = ["Compose interpolation report", ""];
    variables.forEach((item) => {
      const prefix = options.includeLineNumbers ? `Line ${item.line}: ` : "";
      lines.push(`${prefix}${item.raw} -> ${item.displayReplacement || "<empty>"} [${item.source}] — ${item.message}`);
    });
    lines.push("", "Findings:", ...issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`));
    return lines.join("\n");
  }

  if (options.outputMode === "envTemplate") {
    return uniqueSorted(variables.map((item) => item.name)).map((name) => `${name}=`).join("\n");
  }

  if (options.outputMode === "json") {
    return JSON.stringify({
      variables: variables.map((item) => ({ ...item, replacement: item.displayReplacement, displayReplacement: undefined })),
      issues,
      envKeys: Array.from(env.values.keys()),
      shellKeys: Array.from(shell.values.keys()),
      resolvedCompose: options.includeResolvedPreview ? resolvedCompose : undefined,
    }, null, 2);
  }

  if (options.outputMode === "markdown") {
    const lines = [
      "| Variable | Line | Operator | Source | Replacement | Status |",
      "|---|---:|---|---|---|---|",
      ...variables.map((item) => `| ${escapeMarkdown(item.name)} | ${item.line} | ${escapeMarkdown(item.operator || "plain")} | ${item.source} | ${escapeMarkdown(item.displayReplacement || "<empty>")} | ${escapeMarkdown(item.message)} |`),
    ];
    if (options.includeResolvedPreview) lines.push("", "## Resolved preview", "", "```yaml", resolvedCompose, "```");
    lines.push("", "## Findings", "", ...issues.map((issue) => `- **${issue.title}:** ${issue.message}`));
    return lines.join("\n");
  }

  return [
    "Compose interpolation review",
    "----------------------------",
    `- [${variables.length ? "x" : " "}] Found ${variables.length} interpolation reference${variables.length === 1 ? "" : "s"}.`,
    `- [${variables.every((item) => !item.required || item.source !== "missing") ? "x" : " "}] Required expressions are satisfied.`,
    `- [${variables.every((item) => item.source !== "missing") ? "x" : " "}] Every reference resolved under the selected review settings.`,
    "",
    "Findings:",
    ...issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function getNotes(result: Result): Issue[] {
  return result.issues;
}

function isSensitive(name: string): boolean {
  return /secret|password|passwd|token|api[_-]?key|private[_-]?key|credential|auth/i.test(name);
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort(compareText);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function skipSpaces(text: string, start: number): number {
  let cursor = start;
  while (text[cursor] === " " || text[cursor] === "\t") cursor += 1;
  return cursor;
}

function skipToLineEnd(text: string, start: number): number {
  let cursor = start;
  while (cursor < text.length && text[cursor] !== "\n") cursor += 1;
  return cursor;
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
      <span className="leading-6">{label}</span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}
