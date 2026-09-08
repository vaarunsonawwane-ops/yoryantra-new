"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "escape" | "unescape" | "inspect" | "env";
type ShellStyle = "posix-single" | "posix-double" | "powershell" | "cmd" | "env";
type OutputMode = "text" | "json" | "markdown" | "csv" | "checklist";
type NewlineMode = "preserve" | "space" | "lf";

type CharacterRow = {
  character: string;
  display: string;
  count: number;
  meaning: string;
  risk: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  escapedText: string;
  rows: CharacterRow[];
  issues: Issue[];
  inputLength: number;
  outputLength: number;
  riskyCharacterCount: number;
  newlineCount: number;
};

const sampleInput = `deploy path/with spaces && echo "$TOKEN"
Yoryantra's encoding tools`;

const shellCharacters: Record<string, { meaning: string; risk: string }> = {
  " ": { meaning: "Argument separator", risk: "Can split one value into multiple shell arguments." },
  "'": { meaning: "Single quote", risk: "Can end single-quoted strings if not handled." },
  '"': { meaning: "Double quote", risk: "Can end double-quoted strings if not escaped." },
  "&": { meaning: "Command operator", risk: "Can chain commands in many shells." },
  "|": { meaning: "Pipe operator", risk: "Can pass output into another command." },
  ";": { meaning: "Command separator", risk: "Can start another command." },
  "$": { meaning: "Variable expansion", risk: "Can expand environment variables in POSIX shells." },
  "`": { meaning: "Command substitution", risk: "Can trigger command substitution in some shells." },
  "\\": { meaning: "Escape character", risk: "Can change how the next character is interpreted." },
  "<": { meaning: "Input redirection", risk: "Can redirect command input." },
  ">": { meaning: "Output redirection", risk: "Can redirect command output." },
  "(": { meaning: "Grouping/subshell", risk: "Can be interpreted specially by shells." },
  ")": { meaning: "Grouping/subshell", risk: "Can be interpreted specially by shells." },
  "*": { meaning: "Glob wildcard", risk: "Can expand to filenames." },
  "?": { meaning: "Glob wildcard", risk: "Can expand to matching filenames." },
  "[": { meaning: "Glob pattern", risk: "Can take part in filename pattern expansion." },
  "]": { meaning: "Glob pattern", risk: "Can take part in filename pattern expansion." },
  "%": { meaning: "CMD percent expansion", risk: "Can expand environment variables or batch parameters in cmd.exe contexts." },
  "!": { meaning: "CMD delayed expansion", risk: "Can expand variables when cmd.exe delayed expansion is enabled." },
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("escape");
  const [shellStyle, setShellStyle] = useState<ShellStyle>("posix-single");
  const [outputMode, setOutputMode] = useState<OutputMode>("text");
  const [newlineMode, setNewlineMode] = useState<NewlineMode>("preserve");
  const [trimInput, setTrimInput] = useState(false);
  const [quoteEmptyStrings, setQuoteEmptyStrings] = useState(true);
  const [wrapResult, setWrapResult] = useState(true);
  const [escapeDollarExpansion, setEscapeDollarExpansion] = useState(true);
  const [warnShellOperators, setWarnShellOperators] = useState(true);
  const [warnVariableExpansion, setWarnVariableExpansion] = useState(true);
  const [warnNewlines, setWarnNewlines] = useState(true);
  const [warnSecretLikeText, setWarnSecretLikeText] = useState(true);
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

  const processShellText = () => {
    if (!input.length || (trimInput && !input.trim())) {
      setError("Please paste a command argument, path, token-like value, or text to escape.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      actionMode,
      shellStyle,
      outputMode,
      newlineMode,
      trimInput,
      quoteEmptyStrings,
      wrapResult,
      escapeDollarExpansion,
      warnShellOperators,
      warnVariableExpansion,
      warnNewlines,
      warnSecretLikeText,
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
    setInput(sampleInput);
    setActionMode("escape");
    setShellStyle("posix-single");
    setOutputMode("text");
    setNewlineMode("preserve");
    setTrimInput(false);
    setQuoteEmptyStrings(true);
    setWrapResult(true);
    setEscapeDollarExpansion(true);
    setWarnShellOperators(true);
    setWarnVariableExpansion(true);
    setWarnNewlines(true);
    setWarnSecretLikeText(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("escape");
    setShellStyle("posix-single");
    setOutputMode("text");
    setNewlineMode("preserve");
    setTrimInput(false);
    setQuoteEmptyStrings(true);
    setWrapResult(true);
    setEscapeDollarExpansion(true);
    setWarnShellOperators(true);
    setWarnVariableExpansion(true);
    setWarnNewlines(true);
    setWarnSecretLikeText(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Shell Command Escape Tool"
      description="Quote one argument for POSIX or PowerShell and expose CMD and dotenv context limits before copying."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Command Argument or Text</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a path, argument value, copied command text, token-like string, .env value, or text that needs safer command-line quoting.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleInput}
            spellCheck={false}
            className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Escape Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                setActionMode(value as ActionMode);
                clearResult();
              }}
              options={[
                { label: "Escape / quote text", value: "escape" },
                { label: "Best-effort unescape", value: "unescape" },
                { label: "Inspect risky characters", value: "inspect" },
                { label: "Format as .env value", value: "env" },
              ]}
            />

            <YoryantraSelect
              label="Shell Style"
              value={shellStyle}
              onChange={(value) => {
                setShellStyle(value as ShellStyle);
                clearResult();
              }}
              options={[
                { label: "POSIX / Bash single quotes", value: "posix-single" },
                { label: "POSIX / Bash double quotes", value: "posix-double" },
                { label: "PowerShell single quotes", value: "powershell" },
                { label: "Windows CMD (context-sensitive)", value: "cmd" },
                { label: "Dotenv-style quoted value", value: "env" },
              ]}
            />

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Escaped text", value: "text" },
                { label: "JSON report", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Newlines"
              value={newlineMode}
              onChange={(value) => {
                setNewlineMode(value as NewlineMode);
                clearResult();
              }}
              options={[
                { label: "Preserve newlines", value: "preserve" },
                { label: "Replace newlines with spaces", value: "space" },
                { label: "Normalize to LF", value: "lf" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimInput} onChange={setTrimInput} label="Trim outer whitespace" />
          <Toggle checked={quoteEmptyStrings} onChange={setQuoteEmptyStrings} label="Quote empty strings" />
          <Toggle checked={wrapResult} onChange={setWrapResult} label="Wrap result as one argument" />
          {shellStyle === "posix-double" ? (
            <Toggle checked={escapeDollarExpansion} onChange={setEscapeDollarExpansion} label="Escape dollar expansion in double quotes" />
          ) : null}
          <Toggle checked={warnShellOperators} onChange={setWarnShellOperators} label="Warn about shell operators" />
          <Toggle checked={warnVariableExpansion} onChange={setWarnVariableExpansion} label="Warn about variable expansion" />
          <Toggle checked={warnNewlines} onChange={setWarnNewlines} label="Warn about newlines" />
          <Toggle checked={warnSecretLikeText} onChange={setWarnSecretLikeText} label="Warn about secret-like text" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Nothing is executed. Quoting one argument is also different from validating an entire command, and Windows CMD or dotenv syntax can depend on the exact caller and parser.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processShellText}
          className="min-h-11 whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Escape Text
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="min-h-11 whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="min-h-11 whitespace-nowrap rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
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
                <p className="mt-1 text-sm text-gray-500">Escaped argument, report, or character inspection output.</p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="min-h-11 whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Input characters" value={String(result.inputLength)} />
            <StatCard label="Output characters" value={String(result.outputLength)} />
            <StatCard label="Risky characters" value={String(result.riskyCharacterCount)} />
            <StatCard label="Newlines" value={String(result.newlineCount)} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((issue, index) => (
              <div
                key={`${issue.title}-${index}`}
                className={`self-start rounded-xl border p-4 ${
                  issue.severity === "high"
                    ? "border-red-200 bg-red-50"
                    : issue.severity === "warning"
                      ? "border-amber-200 bg-amber-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <p className={`text-sm font-semibold ${issue.severity === "high" ? "text-red-900" : issue.severity === "warning" ? "text-amber-900" : "text-gray-900"}`}>{issue.title}</p>
                <p className={`mt-1 text-sm leading-6 ${issue.severity === "high" ? "text-red-700" : issue.severity === "warning" ? "text-amber-800" : "text-gray-600"}`}>{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result?.rows.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Character Summary</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Character</th>
                  <th className="px-4 py-3 font-semibold">Count</th>
                  <th className="px-4 py-3 font-semibold">Meaning</th>
                  <th className="px-4 py-3 font-semibold">Why it matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.rows.map((row) => (
                  <tr key={row.character}>
                    <td className="px-4 py-3 font-mono text-gray-900">{row.display}</td>
                    <td className="px-4 py-3">{row.count}</td>
                    <td className="px-4 py-3">{row.meaning}</td>
                    <td className="px-4 py-3">{row.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quoting is grammar-specific, not a universal escape operation</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A literal argument that is correct in a POSIX shell is not automatically correct in PowerShell or <code>cmd.exe</code>. The strongest output on this page is a quoted <em>single argument</em> for the selected grammar. It is not a review of a whole command line and it never approves pasted command text for execution.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            <p className="font-semibold text-gray-900">POSIX single quotes</p>
            <p className="mt-2">Single quotes preserve every enclosed character literally. Because a single quote cannot occur inside that quote pair, an embedded apostrophe is represented by closing the quote, adding an escaped quote, then reopening it.</p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            <p className="font-semibold text-gray-900">PowerShell single quotes</p>
            <p className="mt-2">PowerShell single-quoted strings are verbatim strings; an embedded single quote is written twice. Passing that value to a native executable can still involve PowerShell's native-argument serialization rules.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why CMD is deliberately marked context-sensitive</h2>
          <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p><code>cmd.exe</code> has several parsing layers. Carets and quotes can protect metacharacters such as <code>&amp;</code>, <code>|</code>, <code>&lt;</code>, and <code>&gt;</code>, but percent expansion, delayed <code>!</code> expansion, batch-file rules, <code>cmd /c</code> quote stripping, and the target program's own argument parser can change the result. The CMD output here is therefore a reviewable fragment, not a universal escaping guarantee.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dotenv files do not share one universal quoting grammar</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The dotenv option produces a conservative double-quoted representation with escaped backslashes, quotes, CR and LF. Node, Docker Compose, libraries, CI systems, and application frameworks do not all parse dotenv files identically. Check the parser that will actually load the file before treating the generated value as portable.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Unescape is intentionally best-effort</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Shell source cannot in general be reversed by string replacement because parsing may involve expansions, concatenated quote segments, command substitution, variables, redirection and multiple arguments. Unescape mode only reverses the narrow quote forms generated here; it is not a shell parser.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
          <p className="font-semibold text-gray-900">Security boundary</p>
          <p className="mt-2">The browser never runs the pasted command. Treat real tokens, passwords and API keys as sensitive even when processing is local, because copied output can still end up in shell history, logs, screenshots, tickets or source control.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Authoritative syntax references</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            POSIX quoting rules are defined by <a href="https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html#tag_19_02" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">The Open Group Shell Command Language</a>. Microsoft documents <a href="https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_quoting_rules" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">PowerShell quoting</a> and <a href="https://learn.microsoft.com/windows-server/administration/windows-commands/cmd" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">cmd.exe parsing and special characters</a> separately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/shell-command-escape-tool" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  shellStyle: ShellStyle;
  outputMode: OutputMode;
  newlineMode: NewlineMode;
  trimInput: boolean;
  quoteEmptyStrings: boolean;
  wrapResult: boolean;
  escapeDollarExpansion: boolean;
  warnShellOperators: boolean;
  warnVariableExpansion: boolean;
  warnNewlines: boolean;
  warnSecretLikeText: boolean;
}): Result {
  const prepared = prepareInput(options.input, options.trimInput, options.newlineMode);
  const rows = summarizeShellCharacters(prepared);
  const issues = buildIssues(prepared, options, rows);

  let escapedText = prepared;
  if (options.actionMode === "escape") {
    escapedText = escapeForShell(prepared, options.shellStyle, options);
  } else if (options.actionMode === "unescape") {
    escapedText = bestEffortUnescape(prepared, options.shellStyle);
  } else if (options.actionMode === "env") {
    escapedText = escapeEnvValue(prepared, options.wrapResult);
  }

  const result: Result = {
    output: "",
    escapedText,
    rows,
    issues,
    inputLength: prepared.length,
    outputLength: escapedText.length,
    riskyCharacterCount: rows.reduce((sum, row) => sum + row.count, 0),
    newlineCount: (prepared.match(/\n/g) ?? []).length,
  };

  return {
    ...result,
    output: formatOutput(result, options.outputMode, options.actionMode, options.shellStyle),
  };
}

function prepareInput(input: string, trimInput: boolean, newlineMode: NewlineMode) {
  let text = trimInput ? input.trim() : input;
  if (newlineMode === "space") text = text.replace(/\r\n/g, "\n").replace(/[\r\n]+/g, " ");
  if (newlineMode === "lf") text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return text;
}

function escapeForShell(text: string, style: ShellStyle, options: { quoteEmptyStrings: boolean; wrapResult: boolean; escapeDollarExpansion: boolean }) {
  if (!text && !options.quoteEmptyStrings) return "";

  if (style === "posix-single") {
    const escaped = text.replace(/'/g, "'\\''");
    return options.wrapResult ? `'${escaped}'` : escaped;
  }

  if (style === "posix-double") {
    let escaped = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`");
    if (options.escapeDollarExpansion) escaped = escaped.replace(/\$/g, "\\$");
    return options.wrapResult ? `"${escaped}"` : escaped;
  }

  if (style === "powershell") {
    const escaped = text.replace(/'/g, "''");
    return options.wrapResult ? `'${escaped}'` : escaped;
  }

  if (style === "cmd") {
    if (options.wrapResult) return `"${text.replace(/"/g, '""')}"`;
    return text.replace(/([&|<>^()])/g, "^$1");
  }

  return escapeEnvValue(text, options.wrapResult);
}

function escapeEnvValue(text: string, wrapResult: boolean) {
  const escaped = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r");
  return wrapResult ? `"${escaped}"` : escaped;
}

function bestEffortUnescape(text: string, style: ShellStyle) {
  if (style === "posix-single") {
    let value = text;
    if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) value = value.slice(1, -1);
    return value.replace(/'\\''/g, "'");
  }

  if (style === "posix-double" || style === "env") {
    let value = text;
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1);
    return value.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\([\\"$`])/g, "$1");
  }

  if (style === "powershell") {
    let value = text;
    if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) value = value.slice(1, -1);
    return value.replace(/''/g, "'");
  }

  let value = text;
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1);
  return value.replace(/\^([&|<>^()])/g, "$1").replace(/\\"/g, '"');
}

function summarizeShellCharacters(text: string): CharacterRow[] {
  const counts = new Map<string, number>();
  for (const char of Array.from(text)) {
    if (shellCharacters[char]) counts.set(char, (counts.get(char) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([character, count]) => ({
    character,
    display: character === " " ? "space" : character,
    count,
    meaning: shellCharacters[character].meaning,
    risk: shellCharacters[character].risk,
  }));
}

function buildIssues(
  text: string,
  options: { warnShellOperators: boolean; warnVariableExpansion: boolean; warnNewlines: boolean; warnSecretLikeText: boolean; actionMode: ActionMode; shellStyle: ShellStyle; wrapResult: boolean },
  rows: CharacterRow[],
): Issue[] {
  const issues: Issue[] = [];

  if (text.includes("\0")) {
    issues.push({ severity: "high", title: "NUL cannot be a normal command argument", message: "Operating-system command argument strings cannot contain an embedded NUL byte. Quoting cannot make that value portable as argv text." });
  }

  if (options.warnShellOperators && /[;&|<>]/.test(text)) {
    issues.push({ severity: "warning", title: "Command operators are present", message: "These characters can separate, pipe or redirect commands when they reach a shell unquoted. Review the selected quoting style before insertion into a command." });
  }

  if (options.warnVariableExpansion && /[$`]/.test(text)) {
    issues.push({ severity: "warning", title: "Expansion characters are present", message: "Dollar signs and backticks have expansion or substitution meaning in POSIX-family shells and PowerShell contexts. Literal quoting must match the selected shell." });
  }

  if (options.shellStyle === "cmd" && /"/.test(text)) {
    issues.push({ severity: "high", title: "Embedded CMD quotes need caller-specific handling", message: "cmd.exe quote removal and the target program's argv parser can disagree about embedded double quotes. The displayed form is only a review aid when the value itself contains quotes." });
  }

  if (options.shellStyle === "cmd" && /%/.test(text)) {
    issues.push({ severity: "high", title: "CMD percent expansion is context-dependent", message: "Percent signs participate in environment and batch-parameter expansion. Interactive cmd.exe and .bat/.cmd files do not use one universal escaping rule, so the generated fragment cannot guarantee a literal percent sequence." });
  }

  if (options.shellStyle === "cmd" && /!/.test(text)) {
    issues.push({ severity: "warning", title: "Delayed expansion may affect exclamation marks", message: "With cmd.exe delayed expansion enabled, !name! can be expanded after other parsing. Verify the actual /v or setlocal state before using the fragment." });
  }

  if (!options.wrapResult && options.actionMode === "escape" && rows.length) {
    issues.push({ severity: "warning", title: "Result is not wrapped as one argument", message: "Escaped fragments without their surrounding quote pair are not a general one-argument boundary. Keep wrapping enabled when the goal is a literal argument." });
  }

  if (options.warnNewlines && /[\r\n]/.test(text)) {
    issues.push({ severity: "warning", title: "Newlines are part of the value", message: "Quoted strings can sometimes contain line breaks, but pasted multi-line command examples are harder to review and may behave differently in scripts or terminals." });
  }

  if (options.warnSecretLikeText && /(token|secret|password|api[_-]?key|bearer)\s*[:=]/i.test(text)) {
    issues.push({ severity: "warning", title: "Secret-like text detected", message: "Local processing does not make a credential safe to paste elsewhere. Shell history, logs, screenshots and source files can still expose copied output." });
  }

  if (!rows.length && options.actionMode === "inspect") {
    issues.push({ severity: "info", title: "No tracked metacharacters found", message: "The input does not contain the metacharacters summarized by this page. The target shell and program can still impose their own argument rules." });
  }

  return issues;
}

function formatOutput(result: Result, outputMode: OutputMode, actionMode: ActionMode, shellStyle: ShellStyle) {
  if (outputMode === "text") return result.escapedText;

  if (outputMode === "json") {
    return JSON.stringify(
      {
        action: actionMode,
        shellStyle,
        inputLength: result.inputLength,
        outputLength: result.outputLength,
        riskyCharacterCount: result.riskyCharacterCount,
        newlineCount: result.newlineCount,
        escapedText: result.escapedText,
        riskyCharacters: result.rows,
        issues: result.issues,
      },
      null,
      2,
    );
  }

  if (outputMode === "markdown") {
    const lines = ["| Character | Count | Meaning | Why it matters |", "|---|---:|---|---|"];
    if (result.rows.length) {
      result.rows.forEach((row) => lines.push(`| ${row.display.replace(/\|/g, "\\|")} | ${row.count} | ${row.meaning} | ${row.risk} |`));
    } else {
      lines.push("| None | 0 | No common shell metacharacters found | Still test in the target shell |");
    }
    return lines.join("\n");
  }

  if (outputMode === "csv") {
    const rows = [["character", "count", "meaning", "risk"], ...result.rows.map((row) => [row.display, String(row.count), row.meaning, row.risk])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  const checklist = [
    "# Shell Escaping Checklist",
    "",
    `- [ ] Action reviewed: ${actionMode}`,
    `- [ ] Shell style checked: ${shellStyle}`,
    `- [ ] Risky character count checked: ${result.riskyCharacterCount}`,
    `- [ ] Newline count checked: ${result.newlineCount}`,
    `- [ ] Warnings reviewed: ${result.issues.length}`,
    "- [ ] Full command reviewed before running",
    "- [ ] Tested in the actual target shell or script context",
  ];
  return checklist.join("\n");
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];
  if (result.outputLength > result.inputLength * 2 && result.inputLength > 20) {
    notes.push({
      severity: "info",
      title: "Escaped value is much longer",
      message: "Escaping adds quotes and backslashes. Check readability before using the result in docs or examples.",
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
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

