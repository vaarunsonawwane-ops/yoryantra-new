"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type QuoteKind = "'" | '"' | null;

type EnvEntry = {
  key: string;
  value: string;
  rawValue: string;
  startLine: number;
  endLine: number;
  quoted: boolean;
  quote: QuoteKind;
  exported: boolean;
};

type Diagnostic = {
  level: "error" | "warning" | "info";
  line: number;
  message: string;
};

type EnvParseResult = {
  entries: EnvEntry[];
  diagnostics: Diagnostic[];
};

const VALID_NAME = /^[a-zA-Z_]+[a-zA-Z0-9_]*$/;
const SECRETISH_NAME =
  /(?:^|_)(?:PASSWORD|PASSWD|PWD|SECRET|TOKEN|API_KEY|PRIVATE_KEY|CLIENT_SECRET|ACCESS_KEY|AUTH_TOKEN|CREDENTIALS?|CONNECTION_STRING)(?:_|$)/i;

function createStringMap() {
  return Object.create(null) as Record<string, string>;
}

function createNumberMap() {
  return Object.create(null) as Record<string, number>;
}

function stripUnquotedComment(value: string) {
  const hash = value.indexOf("#");
  const beforeComment = hash === -1 ? value : value.slice(0, hash);
  return beforeComment.trim();
}

function parseQuotedValue(
  lines: string[],
  startIndex: number,
  initial: string,
  quote: "'" | '"',
  diagnostics: Diagnostic[]
) {
  let index = startIndex;
  let content = initial.slice(1);
  const chunks: string[] = [];
  let closed = false;
  let trailing = "";

  while (true) {
    const closing = content.indexOf(quote);

    if (closing !== -1) {
      chunks.push(content.slice(0, closing));
      trailing = content.slice(closing + 1).trim();
      closed = true;
      break;
    }

    chunks.push(content);
    index += 1;

    if (index >= lines.length) {
      break;
    }

    chunks.push("\n");
    content = lines[index];
  }

  let value = chunks.join("");

  if (quote === '"') {
    value = value.replace(/\\n/g, "\n");
  }

  if (!closed) {
    diagnostics.push({
      level: "error",
      line: startIndex + 1,
      message: `Unterminated ${
        quote === '"' ? "double" : "single"
      }-quoted value.`,
    });
  } else if (
    trailing &&
    trailing.charAt(0) !== "#"
  ) {
    diagnostics.push({
      level: "warning",
      line: index + 1,
      message:
        "Text appears after the closing quote. Node-style dotenv parsing uses the quoted value and ignores trailing non-comment text, but other dotenv consumers can behave differently.",
    });
  }

  return {
    value,
    rawValue: lines
      .slice(startIndex, index + 1)
      .join("\n"),
    endIndex: index,
    closed,
  };
}

function parseEnvText(text: string): EnvParseResult {
  const entries: EnvEntry[] = [];
  const diagnostics: Diagnostic[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const seen = createNumberMap();

  let index = 0;

  while (index < lines.length) {
    const originalLine = lines[index];
    const lineNumber = index + 1;
    const trimmedStart = originalLine.replace(/^\s+/, "");

    if (!trimmedStart || trimmedStart.charAt(0) === "#") {
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
      diagnostics.push({
        level: "error",
        line: lineNumber,
        message:
          "Missing = separator. This line was not parsed as an environment-variable assignment.",
      });
      index += 1;
      continue;
    }

    const key = declaration.slice(0, equals).trim();

    if (!key) {
      diagnostics.push({
        level: "error",
        line: lineNumber,
        message: "Variable name is empty.",
      });
    } else if (!VALID_NAME.test(key)) {
      diagnostics.push({
        level: "error",
        line: lineNumber,
        message: `Variable name "${key}" does not match the documented Node.js dotenv name pattern ^[a-zA-Z_]+[a-zA-Z0-9_]*$.`,
      });
    }

    let rest = declaration
      .slice(equals + 1)
      .replace(/^\s+/, "");

    let value = "";
    let rawValue = rest;
    let quoted = false;
    let quote: QuoteKind = null;
    let endIndex = index;

    if (rest.charAt(0) === '"' || rest.charAt(0) === "'") {
      quoted = true;
      quote = rest.charAt(0) as "'" | '"';

      const parsed = parseQuotedValue(
        lines,
        index,
        rest,
        quote,
        diagnostics
      );

      value = parsed.value;
      rawValue = parsed.rawValue;
      endIndex = parsed.endIndex;
    } else {
      value = stripUnquotedComment(rest);
      rawValue = rest;

      if (rest.indexOf("#") !== -1) {
        diagnostics.push({
          level: "info",
          line: lineNumber,
          message:
            "An unquoted # starts a comment in the Node.js dotenv grammar, so text after it is not part of the value.",
        });
      }
    }

    const previousLine = key ? seen[key] : 0;

    if (previousLine) {
      diagnostics.push({
        level: "warning",
        line: lineNumber,
        message: `Duplicate variable "${key}". Its previous assignment begins on line ${previousLine}; the effective view below uses the later value.`,
      });
    }

    if (key) {
      seen[key] = lineNumber;
    }

    entries.push({
      key,
      value,
      rawValue,
      startLine: lineNumber,
      endLine: endIndex + 1,
      quoted,
      quote,
      exported,
    });

    index = endIndex + 1;
  }

  if (!entries.length) {
    diagnostics.push({
      level: "warning",
      line: 1,
      message: "No environment-variable assignments were found.",
    });
  }

  const secretCount = entries.filter((entry) =>
    SECRETISH_NAME.test(entry.key)
  ).length;

  if (secretCount) {
    diagnostics.push({
      level: "info",
      line: 1,
      message: `${secretCount} variable name${
        secretCount === 1 ? "" : "s"
      } look credential-related. Secret masking is enabled by default in visible output.`,
    });
  }

  return { entries, diagnostics };
}

function maskValue(value: string) {
  return value ? "••••••••" : "";
}

function displayValue(entry: EnvEntry, maskSecrets: boolean) {
  return maskSecrets && SECRETISH_NAME.test(entry.key)
    ? maskValue(entry.value)
    : entry.value;
}

function formatResult(
  result: EnvParseResult,
  maskSecrets: boolean
) {
  const effective = createStringMap();

  result.entries.forEach((entry) => {
    effective[entry.key] = displayValue(entry, maskSecrets);
  });

  const entryLines = result.entries.map((entry, index) => {
    const shown = displayValue(entry, maskSecrets);
    const range =
      entry.startLine === entry.endLine
        ? `line ${entry.startLine}`
        : `lines ${entry.startLine}-${entry.endLine}`;
    const flags: string[] = [];

    if (entry.exported) flags.push("export prefix");
    flags.push(
      entry.quoted
        ? entry.quote === '"'
          ? "double-quoted"
          : "single-quoted"
        : "unquoted"
    );

    if (SECRETISH_NAME.test(entry.key)) {
      flags.push(
        maskSecrets
          ? "secret-like name masked"
          : "secret-like name visible"
      );
    }

    return `${index + 1}. ${range}  ${entry.key}=${JSON.stringify(
      shown
    )}\n   ${flags.join(", ")}`;
  });

  const diagnosticLines = result.diagnostics.length
    ? result.diagnostics
        .map(
          (item) =>
            `${item.level.toUpperCase()} line ${item.line}: ${item.message}`
        )
        .join("\n")
    : "No parser diagnostics.";

  return [
    `Assignments: ${result.entries.length}`,
    `Diagnostics: ${result.diagnostics.length}`,
    `Secret masking in visible output: ${
      maskSecrets ? "on" : "off"
    }`,
    "",
    "Assignments in source order",
    "---------------------------",
    entryLines.join("\n\n") || "No assignments found.",
    "",
    "Effective key/value view",
    "------------------------",
    "Later duplicate assignments replace earlier values in this display.",
    JSON.stringify(effective, null, 2),
    "",
    "Diagnostics",
    "-----------",
    diagnosticLines,
    "",
    "Parser profile",
    "--------------",
    "This tool follows the documented Node.js dotenv model for variable names, comments, whitespace, export prefixes, and quoted/multiline values. It does not perform variable expansion or execute shell syntax.",
  ].join("\n");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [maskSecrets, setMaskSecrets] = useState(true);
  const [copied, setCopied] = useState(false);

  const lineCount = useMemo(
    () =>
      input
        ? input.replace(/\r\n?/g, "\n").split("\n").length
        : 0,
    [input]
  );

  const parseEnv = () => {
    if (!input.trim()) {
      setError("Enter .env content to inspect.");
      setOutput("");
      setCopied(false);
      return;
    }

    const result = parseEnvText(input);

    setOutput(formatResult(result, maskSecrets));
    setError("");
    setCopied(false);
  };

  const updateMaskSecrets = (checked: boolean) => {
    setMaskSecrets(checked);
    setCopied(false);

    if (input.trim()) {
      setOutput(formatResult(parseEnvText(input), checked));
    }
  };

  const loadExample = () => {
    setInput(`APP_NAME="Sneha's local app"
PORT=3000
FEATURE_ENABLED=true
MESSAGE='hello # this stays in the value'
MULTILINE="first line
second line"
API_TOKEN=replace-me
PORT=4000
export NODE_ENV=production`);
    setMaskSecrets(true);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setMaskSecrets(true);
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The visible parsed output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title=".env File Parser"
      description="Inspect Node-style dotenv assignments in source order, understand quoting and comments, spot duplicate variables, and mask likely credentials before copying the visible result."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              .env Content
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste the file text itself. Nothing is sourced or executed.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {lineCount.toLocaleString()} line
            {lineCount === 1 ? "" : "s"}
          </p>
        </div>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={`DATABASE_URL=postgres://localhost:5432/app\nAPI_TOKEN="replace-me"\nexport NODE_ENV=production\nMESSAGE='hello # not a comment'`}
          spellCheck={false}
          className="mt-4 w-full min-h-[340px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <label className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <input
            type="checkbox"
            checked={maskSecrets}
            onChange={(event) =>
              updateMaskSecrets(event.target.checked)
            }
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
          />
          <span>
            <strong>Mask likely secret values in visible output.</strong>{" "}
            Names containing patterns such as TOKEN, PASSWORD, SECRET,
            API_KEY, PRIVATE_KEY, or CLIENT_SECRET are masked by default.
            The original textarea is never altered.
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={parseEnv}
          className="yoryantra-btn"
        >
          Parse .env
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Parsed Environment Data
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Source order is shown separately from the effective later-value-wins view.
            </p>
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy visible output"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Assignments, duplicate warnings, effective values, and parser diagnostics will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
        <h3 className="text-sm font-semibold text-red-900">
          Treat real .env files as secret material
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-red-800">
          .env files often contain database passwords, cloud keys, API tokens,
          signing secrets, and connection strings. Parsing happens in your
          browser and this tool does not send the pasted file to a parsing API,
          but the input still exists on your screen and secret masking applies
          only to the visible result. Avoid screenshots, screen sharing, or
          copying unmasked credentials. Site-wide analytics or advertising
          scripts, if enabled, are separate from this parsing operation.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The Useful Question Is: What Value Will the Process Receive?
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A dotenv file looks like a simple list of{" "}
            <code>NAME=value</code> assignments, but small formatting choices
            can change the value a program receives. Quotes can preserve spaces
            and # characters, quoted values can span lines, comments can remove
            the rest of an unquoted line, and the same variable can be assigned
            more than once.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This parser keeps the original assignment order visible first. Only
            after that does it show an effective key/value view. That prevents a
            duplicate near the bottom of the file from disappearing silently
            behind an object conversion.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Four Lines That Look Similar but Parse Differently
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`NAME=Sneha # comment
NAME="Sneha # Pune"
EMPTY=
FEATURE=true`}</pre>
          <div className="mt-4 space-y-3 leading-relaxed text-gray-600">
            <p>
              The first value is <code>Sneha</code>; the unquoted # begins a
              comment.
            </p>
            <p>
              The second value includes <code># Pune</code> because the hash is
              inside quotes.
            </p>
            <p>
              <code>EMPTY=</code> is a real assignment whose value is the empty
              string.
            </p>
            <p>
              <code>true</code> remains text. Node.js dotenv parsing does not
              turn it into a JavaScript boolean.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Everything Is a String
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Values such as <code>0</code>, <code>false</code>,{" "}
            <code>null</code>, or <code>{`{"mode":"dev"}`}</code> may look like
            numbers, booleans, null, or JSON, but a dotenv parser supplies them
            as text. Your application is responsible for converting them to the
            type it expects.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This is a common source of configuration bugs. For example, the
            string <code>"false"</code> is truthy in ordinary JavaScript if an
            application checks it without explicitly parsing the intended
            boolean meaning.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Variables Deserve to Stay Visible
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Configuration files are frequently edited by several people,
            generated by scripts, or assembled during deployment. A variable
            can be defined near the top and then accidentally redefined much
            later. A normal JSON object cannot represent both assignments at
            once.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The source-order section preserves every occurrence and reports the
            previous line. The effective view deliberately uses the later
            assignment, making it easier to understand why a value you changed
            earlier in the file does not appear to take effect.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quoting Protects Content From Comment and Whitespace Rules
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Leading and trailing whitespace around an unquoted value is ignored
            in the Node.js dotenv model. Inside quotes it belongs to the value.
            A # outside quotes starts a comment; inside quotes it is ordinary
            text. Quoted values can also continue across multiple physical
            lines.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The parser keeps single-quoted and double-quoted entries labeled
            separately. It does not try to turn the file into shell syntax,
            because dotenv quoting and shell quoting are related-looking but
            different configuration languages.
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            There Is No Universal .env Standard
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            “Dotenv” is a convention used by many ecosystems, not one universal
            cross-platform file format. Node.js documents its own grammar.
            Docker Compose has its own env-file/interpolation behavior. Popular
            dotenv libraries and frameworks can differ on expansion, escaping,
            comments, delimiters, override precedence, and multiline syntax.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Yoryantra therefore states its parser profile instead of claiming
            that one browser result predicts every runtime.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why $VARIABLE Is Left Alone
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Variable expansion is not part of the documented Node.js dotenv
            grammar used here. A value such as{" "}
            <code>API_URL=$BASE_URL/api</code> is therefore preserved as text.
            Some libraries add expansion as a separate feature, and Docker
            Compose performs its own interpolation in Compose-related
            workflows. Expanding variables in a generic parser would require
            assumptions about environment precedence and could reveal secret
            values unexpectedly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Secret Masking Is a Sharing Aid, Not Secret Detection
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The mask looks only at variable names that resemble credentials.
            It can hide <code>API_TOKEN</code> while completely missing a secret
            stored under an innocent name such as <code>VALUE</code>. It can
            also mask a harmless variable whose name contains SECRET or TOKEN.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use masking to reduce accidental exposure in copied parser output,
            not as a security guarantee. The safest workflow is still to use
            placeholder credentials whenever possible.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why the Node.js Documentation Is Relevant Here
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Because dotenv behavior varies between ecosystems, an explicit
            parser baseline adds value. Node.js documents variable-name rules,
            string values, whitespace, # comments, multiline quoted values, and
            the optional export prefix used by this inspector.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="https://nodejs.org/api/environment_variables.html#dotenv"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Node.js DotEnv documentation
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/env-file-parser" />
        </div>
      </section>
    </ToolShell>
  );
}
