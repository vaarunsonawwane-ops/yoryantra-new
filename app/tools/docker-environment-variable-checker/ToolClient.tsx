"use client";

import { useMemo, useState } from "react";
import { parseAllDocuments } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "auto" | "compose" | "env";
type Severity = "high" | "warning" | "note";

type EnvIssue = {
  severity: Severity;
  scope: string;
  key: string;
  title: string;
  message: string;
};

type EnvEntry = {
  scope: string;
  key: string;
  value: string;
  source: "compose-map" | "compose-list" | "env-file";
  unresolved: boolean;
  empty: boolean;
  interpolated: boolean;
  likelySecret: boolean;
  duplicate: boolean;
  issues: EnvIssue[];
};

type EnvFileRef = {
  service: string;
  path: string;
  required: boolean;
  format: string;
};

type Report = {
  mode: "compose" | "env";
  entries: EnvEntry[];
  envFiles: EnvFileRef[];
  issues: EnvIssue[];
  yamlWarnings: string[];
  sourceBytes: number;
};

const SAMPLE_COMPOSE = `services:
  api:
    image: node:22-alpine
    env_file:
      - path: ./.env
        required: true
    environment:
      NODE_ENV: production
      LOG_LEVEL: \${LOG_LEVEL:-info}
      DATABASE_URL: \${DATABASE_URL:?DATABASE_URL is required}
      FEATURE_FLAG: "false"
      OPTIONAL_FROM_SHELL:

  worker:
    image: node:22-alpine
    environment:
      - NODE_ENV=production
      - API_TOKEN
      - RETRIES=3`;

const SAMPLE_ENV = `NODE_ENV=development
LOG_LEVEL=debug
API_URL=https://api.example.com
FEATURE_FLAG=false
EMPTY_VALUE=
DATABASE_PASSWORD=replace-me
GREETING="Hello Sneha"`;

const SECRET_NAME_PATTERN =
  /(?:^|_)(?:PASSWORD|PASSWD|SECRET|TOKEN|API_?KEY|ACCESS_?KEY|PRIVATE_?KEY|CREDENTIAL|DATABASE_URL|DB_URL)(?:_|$)/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isValidEnvName(value: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}

function containsInterpolation(value: string) {
  return /\$(?:[A-Za-z_][A-Za-z0-9_]*|\{[^}]+\})/.test(value);
}

function parseDoubleQuoted(value: string) {
  let result = "";

  for (let index = 1; index < value.length - 1; index += 1) {
    const char = value.charAt(index);

    if (char !== "\\") {
      result += char;
      continue;
    }

    index += 1;

    if (index >= value.length - 1) {
      result += "\\";
      break;
    }

    const escaped = value.charAt(index);

    if (escaped === "n") result += "\n";
    else if (escaped === "r") result += "\r";
    else if (escaped === "t") result += "\t";
    else if (escaped === "\\") result += "\\";
    else if (escaped === '"') result += '"';
    else result += escaped;
  }

  return result;
}

function parseSingleQuoted(value: string) {
  let result = "";

  for (let index = 1; index < value.length - 1; index += 1) {
    const char = value.charAt(index);

    if (
      char === "\\" &&
      value.charAt(index + 1) === "'"
    ) {
      result += "'";
      index += 1;
    } else {
      result += char;
    }
  }

  return result;
}

function stripEnvInlineComment(value: string) {
  let single = false;
  let double = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value.charAt(index);

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\" && double) {
      escaped = true;
      continue;
    }

    if (char === "'" && !double) {
      single = !single;
      continue;
    }

    if (char === '"' && !single) {
      double = !double;
      continue;
    }

    if (
      char === "#" &&
      !single &&
      !double &&
      index > 0 &&
      /\s/.test(value.charAt(index - 1))
    ) {
      return value.slice(0, index).replace(/\s+$/g, "");
    }
  }

  return value.replace(/\s+$/g, "");
}

function closingSingleQuote(
  value: string
) {
  let escaped = false;

  for (
    let index = 1;
    index < value.length;
    index += 1
  ) {
    const char =
      value.charAt(index);

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "'") {
      return index;
    }
  }

  return -1;
}

function parseEnvText(source: string) {
  const entries: EnvEntry[] = [];
  const issues: EnvIssue[] = [];
  const lines = source
    .replace(/\r\n?/g, "\n")
    .split("\n");

  for (
    let lineIndex = 0;
    lineIndex < lines.length;
    lineIndex += 1
  ) {
    const rawLine =
      lines[lineIndex];
    const lineNumber =
      lineIndex + 1;
    const trimmed =
      rawLine.trim();

    if (
      !trimmed ||
      trimmed.charAt(0) ===
        "#"
    ) {
      continue;
    }

    const withoutExport =
      trimmed.indexOf(
        "export "
      ) === 0
        ? trimmed
            .slice(7)
            .replace(
              /^\s+/g,
              ""
            )
        : trimmed;
    const delimiter = (() => {
      const equals =
        withoutExport.indexOf(
          "="
        );
      const colon =
        withoutExport.indexOf(
          ":"
        );

      if (equals === -1) {
        return colon;
      }

      if (colon === -1) {
        return equals;
      }

      return Math.min(
        equals,
        colon
      );
    })();

    let key = "";
    let rawValue = "";
    let unresolved = false;

    if (delimiter === -1) {
      key =
        withoutExport.trim();
      unresolved = true;
    } else {
      key =
        withoutExport
          .slice(
            0,
            delimiter
          )
          .trim();
      rawValue =
        withoutExport
          .slice(
            delimiter + 1
          )
          .trim();
    }

    if (
      !isValidEnvName(key)
    ) {
      issues.push({
        severity: "high",
        scope: ".env",
        key,
        title:
          `Invalid variable name on line ${lineNumber}`,
        message:
          `"${key}" is not a portable environment-variable identifier for Compose review. Use letters, digits and underscore, starting with a letter or underscore.`,
      });
    }

    let value = "";

    if (!unresolved) {
      if (
        rawValue.charAt(0) ===
        "'"
      ) {
        let combined =
          rawValue;
        let closing =
          closingSingleQuote(
            combined
          );

        while (
          closing === -1 &&
          lineIndex + 1 <
            lines.length
        ) {
          lineIndex += 1;
          combined +=
            `\n${lines[
              lineIndex
            ]}`;
          closing =
            closingSingleQuote(
              combined
            );
        }

        if (
          closing === -1
        ) {
          issues.push({
            severity:
              "warning",
            scope: ".env",
            key,
            title:
              `Unclosed single quote starting on line ${lineNumber}`,
            message:
              "Compose env_file syntax permits multiline single-quoted values, but the quote still needs a closing apostrophe.",
          });
          value =
            combined.slice(1);
        } else {
          const quoted =
            combined.slice(
              0,
              closing + 1
            );
          value =
            parseSingleQuoted(
              quoted
            );

          const trailing =
            combined
              .slice(
                closing + 1
              )
              .trim();

          if (
            trailing &&
            trailing.charAt(0) !==
              "#"
          ) {
            issues.push({
              severity:
                "warning",
              scope: ".env",
              key,
              title:
                "Unexpected text after single-quoted value",
              message:
                `Text after the closing quote is "${trailing}". Compose env_file lines normally allow only whitespace/comment text there.`,
            });
          }
        }
      } else {
        const withoutComment =
          stripEnvInlineComment(
            rawValue
          );

        if (
          withoutComment.length >=
            2 &&
          withoutComment.charAt(
            0
          ) === '"' &&
          withoutComment.charAt(
            withoutComment.length -
              1
          ) === '"'
        ) {
          value =
            parseDoubleQuoted(
              withoutComment
            );
        } else if (
          withoutComment.charAt(
            0
          ) === '"'
        ) {
          issues.push({
            severity:
              "warning",
            scope: ".env",
            key,
            title:
              `Unclosed double quote on line ${lineNumber}`,
            message:
              "Double-quoted env_file values should close on the same logical assignment.",
          });
          value =
            withoutComment.slice(
              1
            );
        } else {
          value =
            withoutComment;
        }
      }
    }

    entries.push({
      scope: ".env",
      key,
      value,
      source: "env-file",
      unresolved,
      empty:
        !unresolved &&
        value === "",
      interpolated:
        containsInterpolation(
          value
        ),
      likelySecret:
        SECRET_NAME_PATTERN.test(
          key
        ),
      duplicate: false,
      issues: [],
    });
  }

  const counts =
    Object.create(
      null
    ) as Record<
      string,
      number
    >;

  entries.forEach(
    (entry) => {
      counts[entry.key] =
        (counts[entry.key] ||
          0) + 1;
    }
  );

  entries.forEach(
    (entry) => {
      entry.duplicate =
        counts[entry.key] >
        1;
    }
  );

  return {
    entries,
    issues,
  };
}

function scalarComposeValue(
  value: unknown,
  service: string,
  key: string,
  issues: EnvIssue[]
) {
  if (value === null || value === undefined) {
    return {
      value: "",
      unresolved: true,
    };
  }

  if (typeof value === "string") {
    return {
      value,
      unresolved: false,
    };
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    if (typeof value === "boolean") {
      issues.push({
        severity: "warning",
        scope: service,
        key,
        title: "Boolean YAML value should be quoted",
        message:
          `Compose documentation recommends quoting boolean-looking environment values so YAML does not transform them. Write "${String(
            value
          )}" when text is intended.`,
      });
    }

    return {
      value: String(value),
      unresolved: false,
    };
  }

  issues.push({
    severity: "high",
    scope: service,
    key,
    title: "Environment value is not scalar",
    message:
      "Compose environment values should be scalar/null entries, not arrays or nested mappings.",
  });

  return {
    value: "",
    unresolved: false,
  };
}

function parseEnvFileRefs(
  value: unknown,
  service: string,
  issues: EnvIssue[]
) {
  const refs: EnvFileRef[] = [];
  const list = Array.isArray(value) ? value : value === undefined ? [] : [value];

  list.forEach((item) => {
    if (typeof item === "string") {
      refs.push({
        service,
        path: item,
        required: true,
        format: "default",
      });

      if (/^(?:\/|[A-Za-z]:[\\/])/.test(item)) {
        issues.push({
          severity: "note",
          scope: service,
          key: "env_file",
          title: "Absolute env_file path",
          message:
            `env_file "${item}" is absolute. Compose warns about absolute env_file paths because they reduce portability.`,
        });
      }
      return;
    }

    if (isRecord(item)) {
      const path =
        typeof item.path === "string"
          ? item.path
          : "";

      if (!path) {
        issues.push({
          severity: "high",
          scope: service,
          key: "env_file",
          title: "env_file mapping has no path",
          message:
            "Long env_file syntax needs a path entry.",
        });
        return;
      }

      refs.push({
        service,
        path,
        required:
          typeof item.required === "boolean"
            ? item.required
            : true,
        format:
          typeof item.format === "string"
            ? item.format
            : "default",
      });
      return;
    }

    issues.push({
      severity: "high",
      scope: service,
      key: "env_file",
      title: "Unsupported env_file entry",
      message:
        "env_file should be a string, sequence of strings, or supported long-syntax mappings.",
    });
  });

  return refs;
}

function parseComposeEnvironment(source: string) {
  const docs = parseAllDocuments(source, {
    uniqueKeys: true,
    prettyErrors: true,
  });
  const yamlErrors: string[] = [];
  const yamlWarnings: string[] = [];

  docs.forEach((doc, index) => {
    doc.errors.forEach((error) =>
      yamlErrors.push(`Document ${index + 1}: ${error.message}`)
    );
    doc.warnings.forEach((warning) =>
      yamlWarnings.push(`Document ${index + 1}: ${warning.message}`)
    );
  });

  if (yamlErrors.length) {
    throw new Error(`YAML parsing failed:\n${yamlErrors.join("\n")}`);
  }

  const values = docs
    .map((doc) => doc.toJS({ maxAliasCount: 100 }))
    .filter((value) => value !== null && value !== undefined);

  if (values.length !== 1 || !isRecord(values[0])) {
    throw new Error("Expected one Docker Compose YAML mapping.");
  }

  const root = values[0];

  if (!isRecord(root.services)) {
    throw new Error("No top-level services mapping was found.");
  }

  const services = root.services;
  const entries: EnvEntry[] = [];
  const issues: EnvIssue[] = [];
  const envFiles: EnvFileRef[] = [];

  Object.keys(services).forEach((serviceName) => {
    const service = services[serviceName];

    if (!isRecord(service)) {
      return;
    }

    parseEnvFileRefs(service.env_file, serviceName, issues).forEach((ref) =>
      envFiles.push(ref)
    );

    const environment = service.environment;

    if (environment === undefined) {
      return;
    }

    if (isRecord(environment)) {
      Object.keys(environment).forEach((key) => {
        const parsed = scalarComposeValue(
          environment[key],
          serviceName,
          key,
          issues
        );

        entries.push({
          scope: serviceName,
          key,
          value: parsed.value,
          source: "compose-map",
          unresolved: parsed.unresolved,
          empty: !parsed.unresolved && parsed.value === "",
          interpolated: containsInterpolation(parsed.value),
          likelySecret: SECRET_NAME_PATTERN.test(key),
          duplicate: false,
          issues: [],
        });
      });
      return;
    }

    if (Array.isArray(environment)) {
      const seen: Record<string, number> = Object.create(null);

      environment.forEach((item) => {
        if (typeof item !== "string") {
          issues.push({
            severity: "high",
            scope: serviceName,
            key: "environment",
            title: "Environment list entry is not a string",
            message:
              "Compose list syntax uses KEY=VALUE or KEY strings.",
          });
          return;
        }

        const equals = item.indexOf("=");
        const key =
          equals === -1
            ? item.trim()
            : item.slice(0, equals).trim();
        const value =
          equals === -1
            ? ""
            : item.slice(equals + 1);
        const unresolved = equals === -1;

        if (!isValidEnvName(key)) {
          issues.push({
            severity: "high",
            scope: serviceName,
            key,
            title: "Invalid environment-variable name",
            message:
              `"${key}" is not a portable variable name for this checker.`,
          });
        }

        const entry: EnvEntry = {
          scope: serviceName,
          key,
          value,
          source: "compose-list",
          unresolved,
          empty: !unresolved && value === "",
          interpolated: containsInterpolation(value),
          likelySecret: SECRET_NAME_PATTERN.test(key),
          duplicate: Boolean(seen[key]),
          issues: [],
        };

        if (seen[key]) {
          issues.push({
            severity: "warning",
            scope: serviceName,
            key,
            title: "Duplicate list-syntax variable",
            message:
              `Service "${serviceName}" lists ${key} more than once. Prefer one explicit value so the effective configuration is obvious.`,
          });
        }

        seen[key] = 1;
        entries.push(entry);
      });
      return;
    }

    issues.push({
      severity: "high",
      scope: serviceName,
      key: "environment",
      title: "environment has unsupported shape",
      message:
        "Compose environment should be a mapping or sequence/list.",
    });
  });

  return {
    entries,
    envFiles,
    issues,
    yamlWarnings,
  };
}

function entryIssues(entry: EnvEntry, mode: "compose" | "env") {
  const issues: EnvIssue[] = [];
  const add = (
    severity: Severity,
    title: string,
    message: string
  ) =>
    issues.push({
      severity,
      scope: entry.scope,
      key: entry.key,
      title,
      message,
    });

  if (!isValidEnvName(entry.key)) {
    add(
      "high",
      "Invalid variable name",
      `"${entry.key}" is not a portable environment-variable identifier.`
    );
  }

  if (entry.duplicate) {
    add(
      "warning",
      "Duplicate variable",
      "The same variable name appears more than once in this parsed scope. Remove accidental duplicates or make the intended override source explicit."
    );
  }

  if (entry.unresolved) {
    add(
      "warning",
      "Value must be resolved externally",
      mode === "compose"
        ? "Compose allows a key without a value and attempts to resolve it from the environment. If it cannot be resolved, the variable is unset/removed from the service container environment."
        : "An env_file line with only a variable name represents an unset value under Compose env_file rules."
    );
  } else if (entry.empty) {
    add(
      "note",
      "Explicit empty value",
      "An empty value is different from an unresolved/unset variable. Check whether the application treats empty and missing differently."
    );
  }

  if (entry.interpolated) {
    add(
      "note",
      "Interpolation expression present",
      "The displayed value contains Compose-style $ interpolation. This checker does not know your shell, .env/--env-file inputs or interpolation precedence, so it does not claim a final resolved value."
    );
  }

  if (entry.likelySecret) {
    add(
      "warning",
      "Secret-like variable name",
      "This name commonly carries credentials or tokens. Docker recommends using secrets rather than environment variables for sensitive data where practical."
    );
  }

  if (
    /^(?:true|false|yes|no)$/i.test(entry.value) &&
    entry.source === "compose-map"
  ) {
    add(
      "note",
      "Boolean-looking text",
      "If this value should be literal text in Compose YAML, quote it to avoid YAML type conversion."
    );
  }

  if (/\r|\n/.test(entry.value)) {
    add(
      "note",
      "Multiline value",
      "Multiline environment values are valid in some Compose/.env forms but can be awkward in logs, shells and deployment systems. Verify the target application expects embedded line breaks."
    );
  }

  return issues;
}

function analyze(source: string, inputMode: InputMode): Report {
  const mode =
    inputMode === "auto"
      ? /^\s*(?:name:|version:|services:)/m.test(source)
        ? "compose"
        : "env"
      : inputMode;

  let entries: EnvEntry[] = [];
  let envFiles: EnvFileRef[] = [];
  let issues: EnvIssue[] = [];
  let yamlWarnings: string[] = [];

  if (mode === "compose") {
    const parsed = parseComposeEnvironment(source);
    entries = parsed.entries;
    envFiles = parsed.envFiles;
    issues = parsed.issues;
    yamlWarnings = parsed.yamlWarnings;
  } else {
    const parsed = parseEnvText(source);
    entries = parsed.entries;
    issues = parsed.issues;
  }

  if (!entries.length && !envFiles.length) {
    throw new Error(
      mode === "compose"
        ? "No service environment or env_file entries were found."
        : "No .env-style variable assignments were found."
    );
  }

  entries.forEach((entry) => {
    entry.issues = entryIssues(entry, mode);
    entry.issues.forEach((issue) => issues.push(issue));
  });

  if (mode === "compose" && envFiles.length) {
    const serviceGroups: Record<string, EnvFileRef[]> = Object.create(null);

    envFiles.forEach((ref) => {
      if (!serviceGroups[ref.service]) serviceGroups[ref.service] = [];
      serviceGroups[ref.service].push(ref);
    });

    Object.keys(serviceGroups).forEach((service) => {
      if (serviceGroups[service].length > 1) {
        issues.push({
          severity: "note",
          scope: service,
          key: "env_file",
          title: "Multiple env_file sources",
          message:
            "Compose processes multiple service env_file entries from top to bottom; for the same variable, later env files override earlier ones. The service environment attribute then has precedence over env_file values.",
        });
      }
    });
  }

  return {
    mode,
    entries,
    envFiles,
    issues,
    yamlWarnings,
    sourceBytes: new TextEncoder().encode(source).length,
  };
}

function displayValue(entry: EnvEntry, mask: boolean) {
  if (entry.unresolved) return "[unresolved / unset if not supplied]";
  if (mask && entry.likelySecret && entry.value) {
    return `•••••• (${new TextEncoder().encode(entry.value).length} bytes hidden)`;
  }
  if (entry.value === "") return "(empty string)";
  return entry.value;
}

function formatReport(report: Report, mask: boolean) {
  const lines = [
    "Docker environment review",
    `Input mode: ${report.mode}`,
    `Variables: ${report.entries.length}`,
    `env_file references: ${report.envFiles.length}`,
    `High findings: ${report.issues.filter((i) => i.severity === "high").length}`,
    `Warnings: ${report.issues.filter((i) => i.severity === "warning").length}`,
    "",
    "Variables:",
  ];

  report.entries.forEach((entry, index) => {
    lines.push(
      `${index + 1}. [${entry.scope}] ${entry.key} = ${displayValue(entry, mask)}`,
      `   source: ${entry.source}`
    );
  });

  if (report.envFiles.length) {
    lines.push("", "env_file references:");

    report.envFiles.forEach((ref) => {
      lines.push(
        `- ${ref.service}: ${ref.path} · required=${String(
          ref.required
        )} · format=${ref.format}`
      );
    });
  }

  if (report.issues.length) {
    lines.push("", "Findings:");

    report.issues.forEach((issue, index) => {
      lines.push(
        `${index + 1}. ${issue.severity.toUpperCase()} — ${issue.scope}${
          issue.key ? ` ${issue.key}` : ""
        }: ${issue.title}`,
        `   ${issue.message}`
      );
    });
  }

  lines.push(
    "",
    "Boundary: this is static browser review. It does not read your shell environment, .env files referenced by Compose, --env-file inputs, image ENV instructions, runtime -e overrides or the fully merged Compose model. Use docker compose config and docker compose config --environment when the final resolved value matters."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("auto");
  const [maskSecrets, setMaskSecrets] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => (report ? formatReport(report, maskSecrets) : ""),
    [report, maskSecrets]
  );

  const clear = () => {
    setReport(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    if (!input.trim()) {
      setError("Paste Docker Compose YAML or .env text.");
      setReport(null);
      return;
    }

    try {
      setReport(analyze(input, inputMode));
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to review these environment variables."
      );
    }
  };

  const loadCompose = () => {
    setInput(SAMPLE_COMPOSE);
    setInputMode("compose");
    setMaskSecrets(true);
    clear();
  };

  const loadEnv = () => {
    setInput(SAMPLE_ENV);
    setInputMode("env");
    setMaskSecrets(true);
    clear();
  };

  const reset = () => {
    setInput("");
    setInputMode("auto");
    setMaskSecrets(true);
    clear();
  };

  const copy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The report could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="Docker Environment Variable Checker"
      description="Review Docker Compose environment map/list syntax or .env text, distinguish empty from unresolved values, surface interpolation and env_file precedence clues, and keep secret-like values masked by default."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <YoryantraSelect
          label="Input type"
          value={inputMode}
          onChange={(value: string) => {
            setInputMode(value as InputMode);
            clear();
          }}
          options={[
            { label: "Auto detect", value: "auto" },
            { label: "Docker Compose YAML", value: "compose" },
            { label: ".env / env_file text", value: "env" },
          ]}
        />

        <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <input
            type="checkbox"
            checked={maskSecrets}
            onChange={(event: { target: { checked: boolean } }) => {
              setMaskSecrets(event.target.checked);
              setCopied(false);
            }}
            className="mt-1"
          />
          <span>
            <strong className="text-gray-900">Mask secret-like values.</strong>
            <span className="mt-1 block text-gray-500">
              Password/token/key-style names remain useful for review without
              putting their values into copied output.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Compose YAML or .env text
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clear();
          }}
          rows={22}
          placeholder={SAMPLE_COMPOSE}
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          Check Environment
        </button>
        <button type="button" onClick={loadCompose} className="yoryantra-btn-outline">
          Compose Example
        </button>
        <button type="button" onClick={loadEnv} className="yoryantra-btn-outline">
          .env Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Mode" value={report.mode} />
            <Stat label="Variables" value={String(report.entries.length)} />
            <Stat
              label="Unresolved"
              value={String(report.entries.filter((entry) => entry.unresolved).length)}
            />
            <Stat
              label="Secret-like"
              value={String(report.entries.filter((entry) => entry.likelySecret).length)}
            />
            <Stat
              label="Warnings"
              value={String(
                report.issues.filter((issue) => issue.severity === "warning").length
              )}
            />
          </div>

          {report.issues.length ? (
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="font-semibold text-yellow-900">
                Environment findings
              </h3>
              <div className="mt-4 space-y-3">
                {report.issues.map((issue, index) => (
                  <div
                    key={`${issue.scope}-${issue.key}-${issue.title}-${index}`}
                    className="rounded-xl border border-yellow-200 bg-white/60 p-4 text-sm leading-relaxed text-yellow-900"
                  >
                    <strong>
                      {issue.severity.toUpperCase()} · {issue.scope}
                      {issue.key ? ` · ${issue.key}` : ""}
                    </strong>
                    <p className="mt-1">{issue.title}: {issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Scope</th>
                  <th className="px-4 py-3 font-semibold">Variable</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {report.entries.map((entry, index) => (
                  <tr key={`${entry.scope}-${entry.key}-${index}`}>
                    <td className="px-4 py-3">{entry.scope}</td>
                    <td className="px-4 py-3 font-mono text-xs">{entry.key}</td>
                    <td className="px-4 py-3 max-w-[520px] break-words font-mono text-xs">
                      {displayValue(entry, maskSecrets)}
                    </td>
                    <td className="px-4 py-3">{entry.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.envFiles.length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                env_file references
              </h3>
              <div className="mt-4 space-y-3">
                {report.envFiles.map((ref, index) => (
                  <div
                    key={`${ref.service}-${ref.path}-${index}`}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
                  >
                    <strong>{ref.service}</strong> ·{" "}
                    <code>{ref.path}</code> · required={String(ref.required)} ·
                    format={ref.format}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Copyable review
              </h3>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Report"}
              </button>
            </div>
            <pre className="yoryantra-output mt-4 min-h-[280px] max-h-[650px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {output}
            </pre>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Parsed environment variables, unresolved/empty states, env_file
          references, interpolation and secret-handling findings will appear
          here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Review happens on the pasted text in your browser. The checker does not
        read referenced env files, your shell environment, Docker images or a
        running container. Site-wide analytics or advertising scripts, if
        enabled, are separate from this review.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            “What Is in My .env File?” and “What Reaches the Container?” Are Different Questions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Docker Compose can receive values from command-line overrides,
            service <code>environment</code>, service <code>env_file</code>,
            shell variables, interpolation .env files and image-level{" "}
            <code>ENV</code>. Those sources participate in different precedence
            rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This checker reviews the source you paste. It deliberately does not
            invent a final value when the real resolution depends on files and
            shell state it cannot see.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Empty and Unresolved Are Not the Same State
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`environment:
  EMPTY_VALUE: ""
  FROM_SHELL:

# list syntax
environment:
  - EMPTY_VALUE=
  - FROM_SHELL`}</pre>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The explicit empty forms create an empty-string value. A key with no
            value asks Compose to resolve it; if Compose cannot resolve it, the
            variable is unset and removed from the container environment.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            That distinction matters when application code treats “missing” as
            use-a-default but treats an empty string as a deliberate override.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            environment Overrides env_file for the Same Service Variable
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compose service-level <code>env_file</code> loads variables into the
            container environment, but explicit entries in the service{" "}
            <code>environment</code> attribute take precedence—even when the
            environment value is empty or undefined.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When multiple env_file entries are listed, Docker Compose processes
            them in order and a later file can override a variable from an
            earlier file. This page shows references and ordering clues, but it
            cannot read those files from your filesystem.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Interpolation Happens Before You See the Final Compose Model
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compose supports forms such as <code>${"${VAR}"}</code>,{" "}
            <code>${"${VAR:-default}"}</code>,{" "}
            <code>${"${VAR-default}"}</code>,{" "}
            <code>${"${VAR:?error}"}</code> and alternative-value operators.
            Shell and .env/--env-file inputs determine what those expressions
            become.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use <code>docker compose config --environment</code> to inspect the
            variables Compose used for interpolation, and{" "}
            <code>docker compose config</code> to inspect the resolved
            application model.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Environment Variables Are Convenient, but They Are Not a Secret Store
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Passwords, API tokens and database URLs often arrive through
            environment variables because libraries support them. They can also
            leak through process inspection, debugging output, crash reports,
            deployment dashboards and accidental config dumps.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Docker&apos;s own Compose guidance recommends secrets instead of
            environment variables for sensitive information where practical.
            This checker masks secret-like values by default, but name-based
            detection is only a reminder—not proof that a value is secret or
            safe.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Quote Boolean-Looking Compose Values When You Mean Text
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The Compose documentation specifically warns about YAML boolean
            conversion. An environment variable ultimately reaches the process
            as text, but the YAML parser can first interpret an unquoted value as
            a boolean. Quoting <code>"true"</code> or <code>"false"</code> makes
            the intended string explicit.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          Docker&apos;s{" "}
          <a
            href="https://docs.docker.com/reference/compose-file/services/#environment"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            environment/env_file reference
          </a>{" "}
          documents map/list forms, unresolved variables, env_file ordering and
          environment precedence. The{" "}
          <a
            href="https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            interpolation guide
          </a>{" "}
          covers .env, shell sources and <code>docker compose config
          --environment</code>.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/docker-environment-variable-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
