"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type EnvEntry = {
  key: string;
  value: string;
  rawValue: string;
  line: number;
  quoted: boolean;
  quote: "'" | "\"" | null;
  exported: boolean;
};

type EnvDiagnostic = {
  level: "error" | "warning";
  line: number;
  message: string;
};

type EnvParseResult = {
  entries: EnvEntry[];
  diagnostics: EnvDiagnostic[];
};

const VALID_NAME = /^[a-zA-Z_]+[a-zA-Z0-9_]*$/;
const SECRETISH_NAME = /(?:^|_)(?:PASSWORD|PASSWD|PWD|SECRET|TOKEN|API_KEY|PRIVATE_KEY|CLIENT_SECRET|ACCESS_KEY|AUTH_TOKEN|CREDENTIALS?)(?:_|$)/i;

const stripUnquotedComment = (value: string) => {
  const hash = value.indexOf("#");
  return (hash === -1 ? value : value.slice(0, hash)).trim();
};

export const parseEnvText = (text: string): EnvParseResult => {
  const entries: EnvEntry[] = [];
  const diagnostics: EnvDiagnostic[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const seen = new Map<string, number>();

  let index = 0;
  while (index < lines.length) {
    const originalLine = lines[index];
    const lineNumber = index + 1;
    const trimmedStart = originalLine.replace(/^\s+/, "");

    if (!trimmedStart || trimmedStart.startsWith("#")) {
      index += 1;
      continue;
    }

    let declaration = trimmedStart;
    let exported = false;
    if (/^export\s+/.test(declaration)) {
      exported = true;
      declaration = declaration.replace(/^export\s+/, "");
    }

    const equals = declaration.indexOf("=");
    if (equals === -1) {
      diagnostics.push({ level: "error", line: lineNumber, message: "Missing = separator." });
      index += 1;
      continue;
    }

    const key = declaration.slice(0, equals).trim();
    if (!VALID_NAME.test(key)) {
      diagnostics.push({
        level: "error",
        line: lineNumber,
        message: `Invalid variable name "${key}" for the Node.js dotenv grammar.`,
      });
    }

    let rest = declaration.slice(equals + 1).replace(/^\s+/, "");
    let value = "";
    let rawValue = rest;
    let quoted = false;
    let quote: "'" | "\"" | null = null;

    if (rest.startsWith("\"") || rest.startsWith("'")) {
      quoted = true;
      quote = rest.charAt(0) as "'" | "\"";
      let content = rest.slice(1);
      const chunks: string[] = [];
      let closed = false;

      while (true) {
        const closing = content.indexOf(quote);
        if (closing !== -1) {
          chunks.push(content.slice(0, closing));
          const trailing = content.slice(closing + 1).trim();
          if (trailing && !trailing.startsWith("#")) {
            diagnostics.push({
              level: "warning",
              line: index + 1,
              message: "Unexpected text after the closing quote; only whitespace or a comment is expected.",
            });
          }
          closed = true;
          break;
        }

        chunks.push(content);
        index += 1;
        if (index >= lines.length) break;
        chunks.push("\n");
        content = lines[index];
      }

      value = chunks.join("");
      rawValue = `${quote}${value}${closed ? quote : ""}`;

      if (!closed) {
        diagnostics.push({
          level: "error",
          line: lineNumber,
          message: `Unterminated ${quote === "\"" ? "double" : "single"}-quoted value.`,
        });
      }
    } else {
      value = stripUnquotedComment(rest);
      rawValue = rest;
    }

    const previousLine = seen.get(key);
    if (previousLine) {
      diagnostics.push({
        level: "warning",
        line: lineNumber,
        message: `Duplicate variable "${key}"; a consumer may use the later value. Previous definition was on line ${previousLine}.`,
      });
    }
    if (key) seen.set(key, lineNumber);

    entries.push({ key, value, rawValue, line: lineNumber, quoted, quote, exported });
    index += 1;
  }

  return { entries, diagnostics };
};

const maskValue = (value: string) => {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `${value.slice(0, 2)}${"•".repeat(Math.min(value.length - 4, 12))}${value.slice(-2)}`;
};

const formatEnvResult = (result: EnvParseResult, maskSecrets: boolean) => {
  const effective: Record<string, string> = {};
  result.entries.forEach((entry) => {
    effective[entry.key] = maskSecrets && SECRETISH_NAME.test(entry.key) ? maskValue(entry.value) : entry.value;
  });

  const entryLines = result.entries.map((entry, index) => {
    const shown = maskSecrets && SECRETISH_NAME.test(entry.key) ? maskValue(entry.value) : entry.value;
    const flags = [entry.exported ? "export" : "", entry.quoted ? `${entry.quote}quoted${entry.quote}` : "unquoted"]
      .filter(Boolean)
      .join(", ");
    return `${index + 1}. line ${entry.line}  ${entry.key}=${JSON.stringify(shown)}  (${flags})`;
  });

  const diagnosticLines = result.diagnostics.length
    ? result.diagnostics.map((item) => `${item.level.toUpperCase()} line ${item.line}: ${item.message}`).join("\n")
    : "No parser diagnostics.";

  return `Entries: ${result.entries.length}\nDiagnostics: ${result.diagnostics.length}\nSecret masking: ${maskSecrets ? "on" : "off"}\n\nEntries in source order\n-----------------------\n${entryLines.join("\n") || "No assignments found."}\n\nEffective JSON (later duplicate wins)\n-------------------------------------\n${JSON.stringify(effective, null, 2)}\n\nDiagnostics\n-----------\n${diagnosticLines}\n\nParser profile: Node-style dotenv rules. Other frameworks and dotenv libraries can differ, especially around escaping and expansion.`;
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [maskSecrets, setMaskSecrets] = useState(true);

  const parseEnv = () => {
    if (!input.trim()) {
      setError("Please enter .env content.");
      setOutput("");
      return;
    }

    const result = parseEnvText(input);
    setOutput(formatEnvResult(result, maskSecrets));
    setError("");
  };

  const updateMaskSecrets = (checked: boolean) => {
    setMaskSecrets(checked);
    if (input.trim()) {
      setOutput(formatEnvResult(parseEnvText(input), checked));
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setMaskSecrets(true);
  };

  return (
    <ToolShell
      title=".env File Parser"
      description="Inspect Node-style dotenv assignments, quoted and multiline values, comments, duplicates, and likely secrets without uploading the file."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">.env Content</label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => setInput(event.target.value)}
          placeholder={`DATABASE_URL=postgres://localhost:5432/app\nAPI_KEY="your-secret"\nexport NODE_ENV=production\nMESSAGE='hello # not a comment'`}
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={maskSecrets}
          onChange={(event: { target: { checked: boolean } }) => updateMaskSecrets(event.target.checked)}
          className="mt-1"
        />
        <span>
          <strong>Mask likely secret values in output.</strong> Names such as API_KEY, PASSWORD, SECRET, TOKEN, PRIVATE_KEY, and CLIENT_SECRET are masked by default. The input editor itself is unchanged.
        </span>
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseEnv} className="yoryantra-btn">Parse .env</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Parsed Output</h3>
          {output && (
            <button onClick={() => navigator.clipboard.writeText(output)} className="yoryantra-btn-outline text-sm">
              Copy visible output
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[240px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Parsed assignments, effective JSON, and diagnostics will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Sensitive file caution</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Parsing happens in your browser and this tool makes no request to an external parsing service. .env files often contain credentials, so secret-like values are masked in the result by default. Avoid sharing screenshots or copied output that contains real credentials.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">There is no universal .env file standard</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Dotenv files are widely used, but different runtimes and libraries do not all parse them identically. This tool follows the documented Node.js dotenv model for variable names, comments, optional <code>export</code> prefixes, quoted values, and multiline quoted values. Values remain strings; <code>true</code>, <code>0</code>, and JSON-looking text are not converted into JavaScript booleans, numbers, or objects.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why source order and duplicate keys matter</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A plain JSON object hides repeated assignments. This parser keeps every entry in source order, reports duplicate variable names, and then shows an effective JSON view where the later occurrence wins. That makes it easier to spot a value that was silently replaced farther down the file.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the parser intentionally does not do</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            It does not expand <code>$VARIABLE</code> references, execute shell syntax, source the file, or guess framework-specific transformations. Those behaviors are not portable across dotenv consumers and would make an inspection tool misleading.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <a className="text-[var(--light-gold)] hover:underline" href="https://nodejs.org/api/environment_variables.html#dotenv" target="_blank" rel="noreferrer">
              Node.js environment variables and DotEnv documentation
            </a>{" "}documents the grammar used as the baseline for this parser.
          </p>
        </div>

        <YoryantraRelatedTools currentHref="/tools/env-file-parser" />
      </section>
    </ToolShell>
  );
}
