"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "preview" | "result" | "matches" | "json" | "markdown";
type ReplacementMode = "javascript" | "literal";
type LineMode = "all" | "changedOnly";

type MatchRow = {
  number: number;
  match: string;
  replacement: string;
  start: number;
  end: number;
  line: number;
  groups: string[];
  namedGroups: Record<string, string>;
};

type LineChange = {
  line: number;
  before: string;
  after: string;
  changed: boolean;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  replacedText: string;
  matches: MatchRow[];
  lineChanges: LineChange[];
  issues: Issue[];
  output: string;
  matchCount: number;
  changedLines: number;
  inputLength: number;
  outputLength: number;
};

const sampleInput = `Contact: john@example.com
Contact: sneha@example.in
Support: help@yoryantra.com

IDs:
user-1024
user-2048`;

const samplePattern = String.raw`(?<name>[a-z]+)@(?<domain>[a-z0-9.-]+\.[a-z]{2,})`;
const sampleReplacement = String.raw`\${name} [at] \${domain}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [pattern, setPattern] = useState("");
  const [replacement, setReplacement] = useState("");
  const [flags, setFlags] = useState("gi");
  const [outputMode, setOutputMode] = useState<OutputMode>("preview");
  const [replacementMode, setReplacementMode] = useState<ReplacementMode>("javascript");
  const [lineMode, setLineMode] = useState<LineMode>("all");
  const [replaceAll, setReplaceAll] = useState(true);
  const [showPositions, setShowPositions] = useState(true);
  const [showGroups, setShowGroups] = useState(true);
  const [escapeReplacementText, setEscapeReplacementText] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result, flags) : []), [result, flags]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const testReplacement = () => {
    if (!input) {
      setError("Please enter input text to test against.");
      setResult(null);
      setOutput("");
      return;
    }

    if (!pattern) {
      setError("Please enter a regex pattern.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = runRegexReplace(input, {
        pattern,
        replacement,
        flags,
        outputMode,
        replacementMode,
        lineMode,
        replaceAll,
        showPositions,
        showGroups,
        escapeReplacementText,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to test this regex replacement.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setPattern(samplePattern);
    setReplacement(sampleReplacement);
    setFlags("gi");
    setOutputMode("preview");
    setReplacementMode("javascript");
    setLineMode("all");
    setReplaceAll(true);
    setShowPositions(true);
    setShowGroups(true);
    setEscapeReplacementText(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setPattern("");
    setReplacement("");
    setFlags("gi");
    setOutputMode("preview");
    setReplacementMode("javascript");
    setLineMode("all");
    setReplaceAll(true);
    setShowPositions(true);
    setShowGroups(true);
    setEscapeReplacementText(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Regex Replace Tester"
      description="Test regex find and replace patterns directly in your browser. Preview replacements, capture groups, named groups, changed lines, match positions, flags, and before-after output."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Input Text
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleInput}
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste the text you want to search and replace. Everything runs locally in your browser.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Regex Pattern
          </label>

          <input
            value={pattern}
            onChange={(event) => {
              setPattern(event.target.value);
              clearResult();
            }}
            placeholder={samplePattern}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <label className="mt-4 block mb-2 text-sm font-medium text-gray-700">
            Flags
          </label>

          <input
            value={flags}
            onChange={(event) => {
              setFlags(event.target.value);
              clearResult();
            }}
            placeholder="gi"
            className="w-full max-w-[180px] rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Use JavaScript flags such as g, i, m, s, u, or y.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Replacement
          </label>

          <textarea
            value={replacement}
            onChange={(event) => {
              setReplacement(event.target.value);
              clearResult();
            }}
            placeholder={sampleReplacement}
            className="w-full min-h-[128px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            In JavaScript mode, use $1, $2, $&amp;, $`, $&apos;, or ${"{name}"} for named groups.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Before / after preview", value: "preview" },
              { label: "Result only", value: "result" },
              { label: "Match details", value: "matches" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
            ]}
          />

          <YoryantraSelect
            label="Replacement Mode"
            value={replacementMode}
            onChange={(value) => {
              setReplacementMode(value as ReplacementMode);
              clearResult();
            }}
            options={[
              { label: "JavaScript replacement", value: "javascript" },
              { label: "Literal replacement", value: "literal" },
            ]}
          />

          <YoryantraSelect
            label="Line Preview"
            value={lineMode}
            onChange={(value) => {
              setLineMode(value as LineMode);
              clearResult();
            }}
            options={[
              { label: "All lines", value: "all" },
              { label: "Changed lines only", value: "changedOnly" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow
              checked={replaceAll}
              label="Replace all matches"
              onChange={(checked) => {
                setReplaceAll(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={showPositions}
              label="Show match positions"
              onChange={(checked) => {
                setShowPositions(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={showGroups}
              label="Show capture groups"
              onChange={(checked) => {
                setShowGroups(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={escapeReplacementText}
              label="Escape replacement text literally"
              onChange={(checked) => {
                setEscapeReplacementText(checked);
                clearResult();
              }}
            />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Tests JavaScript-style regex replacement behavior, including capture groups, named groups,
          replacement tokens, match positions, and changed lines.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={testReplacement} className="yoryantra-btn">
          Test Replacement
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
          <SummaryCard label="Matches" value={result.matchCount.toLocaleString()} />
          <SummaryCard label="Changed Lines" value={result.changedLines.toLocaleString()} />
          <SummaryCard label="Input Length" value={result.inputLength.toLocaleString()} />
          <SummaryCard label="Output Length" value={result.outputLength.toLocaleString()} />
        </div>
      )}

      {result && result.matches.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Match and Replacement Review
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Matched text, positions, line numbers, groups, and replacement preview.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Match</th>
                  <th className="px-4 py-3 font-semibold">Replacement</th>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Position</th>
                  <th className="px-4 py-3 font-semibold">Groups</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.matches.slice(0, 100).map((match) => (
                  <tr key={`${match.number}-${match.start}-${match.match}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{match.number}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      <span className="block max-w-[220px] break-words">{match.match}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[260px] break-words">{match.replacement}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{match.line}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{match.start}-{match.end}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{formatGroups(match)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.matches.length > 100 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 100 matches. Copy the output for the full result.
            </p>
          )}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Regex findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Regex replace guidance</h3>

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
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Regex replacement output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Regex replacement testing happens directly in your browser. Your input text and patterns are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Testing Regex Find and Replace Before Running It
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Regex replacement is powerful, but a small pattern or replacement mistake can change more text than expected. Testing the pattern, replacement string, capture groups, and output first makes bulk edits safer.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Regex Replace Tester lets you preview before-and-after text, inspect matches, check capture groups, review named groups, and copy the final replacement result without running it in your editor or script first.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Regex Replace Tester</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the text you want to search and replace.</li>
            <li>Enter a JavaScript-style regex pattern and flags.</li>
            <li>Enter the replacement text, including capture references if needed.</li>
            <li>Choose preview, result-only, match details, JSON, or Markdown output.</li>
            <li>Review changed lines and copy the final replacement output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Regex Replace Use Cases</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing capture group replacements such as $1, $2, and ${"{name}"}.</li>
            <li>Renaming text patterns across logs, CSV exports, or code snippets.</li>
            <li>Previewing changed lines before applying replacements in an editor.</li>
            <li>Checking whether a global replacement matches too much text.</li>
            <li>Debugging named groups and replacement tokens.</li>
            <li>Creating before-and-after examples for documentation or scripts.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Regex Replacement</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Pattern:     (?<name>[a-z]+)@(?<domain>[a-z0-9.-]+\\.[a-z]{2,})
Replacement: \${name} [at] \${domain}

john@example.com -> john [at] example.com`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Replacement Tokens Can Change the Result</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JavaScript replacement strings support special tokens such as $1 for the first capture group, $&amp; for the full match, and ${"{name}"} for a named capture group. This is useful, but it also means dollar signs in replacement text may need attention.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use literal replacement mode or escape replacement text when you want the replacement string to be inserted exactly as typed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">What does a Regex Replace Tester do?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                It lets you test a regex pattern and replacement string, then preview the replaced output before applying it elsewhere.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Is this different from a Regex Tester?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. A regex tester focuses on matching. This tool focuses on replacement output, changed lines, and replacement tokens.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Does it support named capture groups?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JavaScript-style named groups can be referenced in the replacement string with ${"{name}"}.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Why does replace all depend on the g flag?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                In JavaScript regex, global replacement uses the g flag. The tool can add it for replace-all preview when needed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Is my text uploaded anywhere?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Regex replacement testing happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/regex-tester" className="yoryantra-btn-outline">Regex Tester</Link>
            <Link href="/tools/regex-match-tester" className="yoryantra-btn-outline">Regex Match Tester</Link>
            <Link href="/tools/text-case-converter" className="yoryantra-btn-outline">Text Case Converter</Link>
            <Link href="/tools/word-counter" className="yoryantra-btn-outline">Word Counter</Link>
            <Link href="/tools/query-string-builder" className="yoryantra-btn-outline">Query String Builder</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
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
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function runRegexReplace(
  input: string,
  options: {
    pattern: string;
    replacement: string;
    flags: string;
    outputMode: OutputMode;
    replacementMode: ReplacementMode;
    lineMode: LineMode;
    replaceAll: boolean;
    showPositions: boolean;
    showGroups: boolean;
    escapeReplacementText: boolean;
  }
): Result {
  const cleanFlags = normalizeFlags(options.flags, options.replaceAll);
  const regex = new RegExp(options.pattern, cleanFlags);
  const matchRegex = new RegExp(options.pattern, cleanFlags.includes("g") ? cleanFlags : `${cleanFlags}g`);
  const matches = collectMatches(input, matchRegex, options.replacement, options.replacementMode === "literal" || options.escapeReplacementText);
  const replacementValue = options.replacementMode === "literal" || options.escapeReplacementText
    ? options.replacement.replace(/\$/g, "$$$$")
    : options.replacement;
  const replacedText = input.replace(regex, replacementValue);
  const lineChanges = getLineChanges(input, replacedText);
  const issues = getIssues(input, matches, cleanFlags, options);
  const base = {
    replacedText,
    matches,
    lineChanges,
    issues,
    matchCount: matches.length,
    changedLines: lineChanges.filter((line) => line.changed).length,
    inputLength: input.length,
    outputLength: replacedText.length,
  };
  const output = formatOutput(base, options);

  return {
    ...base,
    output,
  };
}

function normalizeFlags(flags: string, replaceAll: boolean) {
  const allowed = new Set(["g", "i", "m", "s", "u", "y"]);
  const clean = Array.from(new Set(flags.split("").filter((flag) => allowed.has(flag))));

  if (replaceAll && !clean.includes("g")) {
    clean.push("g");
  }

  if (!replaceAll) {
    return clean.filter((flag) => flag !== "g").join("");
  }

  return clean.join("");
}

function collectMatches(input: string, regex: RegExp, replacement: string, literalReplacement: boolean) {
  const rows: MatchRow[] = [];
  let match: RegExpExecArray | null;
  let safety = 0;

  while ((match = regex.exec(input)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    rows.push({
      number: rows.length + 1,
      match: match[0],
      replacement: previewReplacement(match, input, replacement, literalReplacement),
      start,
      end,
      line: getLineNumber(input, start),
      groups: match.slice(1).map((group) => group ?? ""),
      namedGroups: match.groups ? { ...match.groups } : {},
    });

    if (match[0] === "") {
      regex.lastIndex += 1;
    }

    safety += 1;

    if (safety > 10000) {
      break;
    }
  }

  return rows;
}

function previewReplacement(match: RegExpExecArray, input: string, replacement: string, literal: boolean) {
  if (literal) {
    return replacement;
  }

  return replacement.replace(/\$\$|\$&|\$`|\$'|\$(\d{1,2})|\$<([A-Za-z][A-Za-z0-9_]*)>|\$\{([A-Za-z][A-Za-z0-9_]*)}/g, (token, numberGroup, angleName, braceName) => {
    if (token === "$$") return "$";
    if (token === "$&") return match[0];
    if (token === "$`") return input.slice(0, match.index);
    if (token === "$'") return input.slice(match.index + match[0].length);

    if (numberGroup) {
      return match[Number(numberGroup)] ?? "";
    }

    const groupName = angleName || braceName;

    if (groupName && match.groups) {
      return match.groups[groupName] ?? "";
    }

    return token;
  });
}

function getLineChanges(before: string, after: string) {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const max = Math.max(beforeLines.length, afterLines.length);
  const rows: LineChange[] = [];

  for (let index = 0; index < max; index += 1) {
    const beforeLine = beforeLines[index] ?? "";
    const afterLine = afterLines[index] ?? "";

    rows.push({
      line: index + 1,
      before: beforeLine,
      after: afterLine,
      changed: beforeLine !== afterLine,
    });
  }

  return rows;
}

function getLineNumber(input: string, index: number) {
  return input.slice(0, index).split(/\r?\n/).length;
}

function getIssues(
  input: string,
  matches: MatchRow[],
  flags: string,
  options: {
    replaceAll: boolean;
    replacement: string;
    replacementMode: ReplacementMode;
  }
) {
  const issues: Issue[] = [];

  if (matches.length === 0) {
    issues.push({
      severity: "warning",
      title: "No matches found",
      message: "The regex pattern did not match the input text.",
    });
  }

  if (matches.some((match) => match.match === "")) {
    issues.push({
      severity: "warning",
      title: "Zero-length match",
      message: "The regex can match empty strings. This can create surprising replacement output.",
    });
  }

  if (matches.length > 500) {
    issues.push({
      severity: "info",
      title: "Large match count",
      message: "More than 500 matches were found. Review the pattern before applying it to large files.",
    });
  }

  if (options.replaceAll && !flags.includes("g")) {
    issues.push({
      severity: "info",
      title: "Global flag needed",
      message: "JavaScript replace-all behavior uses the g flag.",
    });
  }

  if (
    options.replacementMode === "javascript" &&
    /\$\d|\$<|\$\{/.test(options.replacement) &&
    matches.every((match) => match.groups.length === 0 && Object.keys(match.namedGroups).length === 0)
  ) {
    issues.push({
      severity: "info",
      title: "Replacement references groups",
      message: "The replacement text references groups, but the pattern did not capture any groups.",
    });
  }

  if (input.length > 200000) {
    issues.push({
      severity: "info",
      title: "Large input",
      message: "Large text can be slower to preview in the browser.",
    });
  }

  return issues;
}

function formatOutput(
  result: Omit<Result, "output">,
  options: {
    outputMode: OutputMode;
    lineMode: LineMode;
    showPositions: boolean;
    showGroups: boolean;
  }
) {
  if (options.outputMode === "result") {
    return result.replacedText;
  }

  if (options.outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.outputMode === "markdown") {
    return [
      "| # | Match | Replacement | Line | Position |",
      "| --- | --- | --- | --- | --- |",
      ...result.matches.map((match) =>
        `| ${match.number} | ${escapeMarkdown(match.match)} | ${escapeMarkdown(match.replacement)} | ${match.line} | ${match.start}-${match.end} |`
      ),
    ].join("\n");
  }

  if (options.outputMode === "matches") {
    if (result.matches.length === 0) {
      return "No matches found.";
    }

    return result.matches
      .map((match) => {
        const lines = [
          `Match ${match.number}`,
          "-------",
          `Text: ${match.match}`,
          `Replacement: ${match.replacement}`,
        ];

        if (options.showPositions) {
          lines.push(`Position: ${match.start}-${match.end}`);
          lines.push(`Line: ${match.line}`);
        }

        if (options.showGroups) {
          lines.push(`Groups: ${match.groups.length ? match.groups.map((group, index) => `$${index + 1}=${group}`).join(", ") : "none"}`);
          lines.push(`Named groups: ${Object.keys(match.namedGroups).length ? JSON.stringify(match.namedGroups) : "none"}`);
        }

        return lines.join("\n");
      })
      .join("\n\n");
  }

  const lines = options.lineMode === "changedOnly"
    ? result.lineChanges.filter((line) => line.changed)
    : result.lineChanges;
  const preview = lines.length
    ? lines.map((line) => line.changed ? `${line.line}:\n- ${line.before}\n+ ${line.after}` : `${line.line}: ${line.before}`)
    : ["No changed lines."];

  return [
    "Regex Replace Preview",
    "---------------------",
    `Matches: ${result.matchCount}`,
    `Changed lines: ${result.changedLines}`,
    `Input length: ${result.inputLength}`,
    `Output length: ${result.outputLength}`,
    "",
    "Line Preview:",
    ...preview,
    "",
    "Result:",
    result.replacedText,
  ].join("\n");
}

function formatGroups(match: MatchRow) {
  const numbered = match.groups.length
    ? match.groups.map((group, index) => `$${index + 1}=${group}`).join(", ")
    : "";
  const named = Object.keys(match.namedGroups).length
    ? Object.entries(match.namedGroups).map(([key, value]) => `${key}=${value}`).join(", ")
    : "";

  return [numbered, named].filter(Boolean).join("; ") || "-";
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result, flags: string) {
  const notes: { title: string; message: string }[] = [];

  if (result.matchCount > 0) {
    notes.push({
      title: "Review before applying",
      message: "Preview the changed lines before running the same replacement in an editor, script, or production data file.",
    });
  }

  if (!flags.includes("g") && result.matchCount > 1) {
    notes.push({
      title: "Multiple possible matches",
      message: "The pattern can match more than once. Use replace all when you want every match replaced.",
    });
  }

  if (result.changedLines === 0 && result.matchCount > 0) {
    notes.push({
      title: "Matches did not change output",
      message: "The pattern matched, but the replacement output did not change any lines. Check the replacement string.",
    });
  }

  return notes;
}
