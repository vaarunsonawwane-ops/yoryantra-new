"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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
  groups: Array<string | null>;
  namedGroups: Record<string, string | null>;
};

type LineChange = {
  line: number;
  before: string;
  after: string;
  changed: boolean;
};

type Issue = {
  severity: "info" | "warning";
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
  matchCountCapped: boolean;
  changedLines: number;
  inputLength: number;
  outputLength: number;
};

const sampleInput = `Contact: varoun@example.com
Contact: sneha@example.in
Support: help@yoryantra.com

IDs:
user-1024
user-2048`;

const samplePattern = String.raw`(?<name>[a-z]+)@(?<domain>[a-z0-9.-]+\.[a-z]{2,})`;
const sampleReplacement = String.raw`$<name> [at] $<domain>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [pattern, setPattern] = useState("");
  const [replacement, setReplacement] = useState("");
  const [flags, setFlags] = useState("i");
  const [outputMode, setOutputMode] = useState<OutputMode>("preview");
  const [replacementMode, setReplacementMode] = useState<ReplacementMode>("javascript");
  const [lineMode, setLineMode] = useState<LineMode>("all");
  const [replaceAll, setReplaceAll] = useState(true);
  const [showPositions, setShowPositions] = useState(true);
  const [showGroups, setShowGroups] = useState(true);
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
    setFlags("i");
    setOutputMode("preview");
    setReplacementMode("javascript");
    setLineMode("all");
    setReplaceAll(true);
    setShowPositions(true);
    setShowGroups(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setPattern("");
    setReplacement("");
    setFlags("i");
    setOutputMode("preview");
    setReplacementMode("javascript");
    setLineMode("all");
    setReplaceAll(true);
    setShowPositions(true);
    setShowGroups(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Regex Replace Tester"
      description="Preview JavaScript regex replacements with capture groups, replacement tokens, match positions, and changed-line output."
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
            placeholder="i"
            className="w-full max-w-[180px] rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Enter JavaScript flags other than <code>g</code>. The “Replace all matches” option controls global replacement.
            Runtime-supported flags such as <code>d</code>, <code>i</code>, <code>m</code>, <code>s</code>, <code>u</code>, <code>v</code>, and <code>y</code> are accepted.
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
            In JavaScript mode, use $1, $2, $&amp;, $`, $&apos;, or $&lt;name&gt; for named groups.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
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

          <div className="md:col-span-3 space-y-3">
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
              label="Show positions in match details"
              onChange={(checked) => {
                setShowPositions(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={showGroups}
              label="Show groups in match details"
              onChange={(checked) => {
                setShowGroups(checked);
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
        <button onClick={testReplacement} className="yoryantra-btn whitespace-nowrap">
          Test Replacement
        </button>

        <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
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
          <SummaryCard
            label="Matches"
            value={result.matchCountCapped ? `${result.matchCount.toLocaleString()}+` : result.matchCount.toLocaleString()}
          />
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
                  {showPositions && <th className="px-4 py-3 font-semibold">Line</th>}
                  {showPositions && <th className="px-4 py-3 font-semibold">Position</th>}
                  {showGroups && <th className="px-4 py-3 font-semibold">Groups</th>}
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
                    {showPositions && (
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{match.line}</td>
                    )}
                    {showPositions && (
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{match.start}-{match.end}</td>
                    )}
                    {showGroups && (
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{formatGroups(match)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.matches.length > 100 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 100 collected matches in the table.
              {result.matchCountCapped ? " Match-detail collection is capped at 10,000; the replacement result can contain more replacements." : " Copy a text output mode when you need more detail."}
            </p>
          )}
        </div>
      )}

      {result && result.issues.some((issue) => issue.severity === "warning") && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Replacement cautions</h3>
          <div className="mt-3 space-y-3">
            {result.issues
              .filter((issue) => issue.severity === "warning")
              .map((issue, index) => (
                <div key={`${issue.title}-${index}`}>
                  <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {result && result.issues.some((issue) => issue.severity === "info") && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Replacement observations</h3>
          <div className="mt-3 space-y-3">
            {result.issues
              .filter((issue) => issue.severity === "info")
              .map((issue, index) => (
                <div key={`${issue.title}-${index}`}>
                  <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">{issue.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Regex replace guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm whitespace-nowrap">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Regex replacement output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Matching and replacement run in this browser session. The page does not send your input text or pattern to an API.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Test the Replacement Semantics, Not Just the Match
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A pattern can match exactly what you expect and still produce the wrong edit because JavaScript replacement strings have their own syntax.
            Numbered captures, named captures, the complete match, and the text before or after a match can all be inserted by special dollar tokens.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Literal mode avoids those substitutions and inserts the replacement text as written. That distinction matters when the replacement itself contains dollar signs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JavaScript Replacement Tokens</h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr><th className="px-4 py-3 font-semibold">Token</th><th className="px-4 py-3 font-semibold">Meaning</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr><td className="px-4 py-3 font-mono">$$</td><td className="px-4 py-3">A literal dollar sign</td></tr>
                <tr><td className="px-4 py-3 font-mono">$&amp;</td><td className="px-4 py-3">The complete match</td></tr>
                <tr><td className="px-4 py-3 font-mono">$1 … $99</td><td className="px-4 py-3">Numbered capturing groups when they exist</td></tr>
                <tr><td className="px-4 py-3 font-mono">$&lt;name&gt;</td><td className="px-4 py-3">A named capturing group</td></tr>
                <tr><td className="px-4 py-3 font-mono">$` / $&apos;</td><td className="px-4 py-3">Text before / after the current match</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-gray-600 leading-relaxed">
            These are the replacement-string rules used by JavaScript <code>String.prototype.replace()</code>.
            The <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace" target="_blank" rel="noreferrer">MDN replacement reference</a>
            gives compact examples, while the <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://tc39.es/ecma262/multipage/text-processing.html#sec-regexp.prototype-%40%40replace" target="_blank" rel="noreferrer">ECMAScript specification</a> defines the normative behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Flags and Replace-All Behavior</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The “Replace all matches” option owns the <code>g</code> flag so the UI cannot silently disagree with the requested replacement scope.
            Other flags are passed to the browser’s RegExp engine and rejected if that runtime does not support them or if they conflict.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Match positions are JavaScript string indexes, which are UTF-16 code-unit offsets rather than Unicode code-point counts.
            With Unicode-aware matching, zero-length matches are advanced by a full Unicode code point to avoid splitting surrogate pairs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Performance and Safety Boundaries</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Regular expressions execute in the browser’s JavaScript engine. Certain patterns can take a very long time because of backtracking, even when the input is not huge.
            A preview cannot prove that a pattern is safe for arbitrary production data. Test representative input and keep backups before bulk replacement.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The table intentionally caps rendered rows while copied output can still contain the full replacement result. Very large input is flagged because rendering and regex execution can become expensive.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/regex-replace-tester" />
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
  }
): Result {
  if (input.length > 500000) {
    throw new Error("Input is limited to 500,000 UTF-16 code units to keep the browser preview manageable.");
  }

  if (options.pattern.length > 5000) {
    throw new Error("Regex pattern is limited to 5,000 characters.");
  }

  const cleanFlags = normalizeFlags(options.flags, options.replaceAll);
  const regex = new RegExp(options.pattern, cleanFlags);
  const matchRegex = new RegExp(options.pattern, cleanFlags);
  const literalReplacement = options.replacementMode === "literal";
  const collected = collectMatches(input, matchRegex, options.replacement, literalReplacement, options.replaceAll);
  const matches = collected.rows;
  const replacementValue = literalReplacement
    ? options.replacement.replace(/\$/g, "$$$$")
    : options.replacement;
  const replacedText = input.replace(regex, replacementValue);
  const lineChanges = getLineChanges(input, replacedText);
  const issues = getIssues(input, matches, options, collected.truncated);
  const base = {
    replacedText,
    matches,
    lineChanges,
    issues,
    matchCount: matches.length,
    matchCountCapped: collected.truncated,
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
  const raw = flags.trim();

  if (/\s/.test(raw)) {
    throw new Error("Regex flags cannot contain spaces.");
  }

  const seen = new Set<string>();
  for (const flag of raw) {
    if (seen.has(flag)) {
      throw new Error(`Duplicate regex flag: ${flag}`);
    }
    seen.add(flag);
  }

  if (seen.has("g")) {
    throw new Error("Use the “Replace all matches” option instead of typing the g flag.");
  }

  const normalized = `${raw}${replaceAll ? "g" : ""}`;

  try {
    // Let the current JavaScript runtime decide which flags and combinations it supports.
    new RegExp("", normalized);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid JavaScript regex flags.");
  }

  return normalized;
}

function collectMatches(
  input: string,
  regex: RegExp,
  replacement: string,
  literalReplacement: boolean,
  replaceAll: boolean
) {
  const rows: MatchRow[] = [];
  let match: RegExpExecArray | null;
  let truncated = false;

  while ((match = regex.exec(input)) !== null) {
    if (rows.length >= 10000) {
      truncated = true;
      break;
    }

    const start = match.index;
    const end = start + match[0].length;

    rows.push({
      number: rows.length + 1,
      match: match[0],
      replacement: previewReplacement(match, input, replacement, literalReplacement),
      start,
      end,
      line: getLineNumber(input, start),
      groups: match.slice(1).map((group) => group ?? null),
      namedGroups: normalizeNamedGroups(match.groups),
    });

    if (!replaceAll) {
      break;
    }

    if (match[0] === "") {
      regex.lastIndex = advanceStringIndex(input, regex.lastIndex, regex.unicode || hasUnicodeSetsFlag(regex.flags));
    }

  }

  return { rows, truncated };
}

function normalizeNamedGroups(groups: Record<string, string | undefined> | undefined) {
  const normalized: Record<string, string | null> = {};

  if (!groups) {
    return normalized;
  }

  Object.entries(groups).forEach(([key, value]) => {
    normalized[key] = value ?? null;
  });

  return normalized;
}

function previewReplacement(
  match: RegExpExecArray,
  input: string,
  replacement: string,
  literal: boolean
) {
  if (literal) {
    return replacement;
  }

  let result = "";

  for (let index = 0; index < replacement.length; index += 1) {
    const char = replacement[index];
    if (char !== "$" || index + 1 >= replacement.length) {
      result += char;
      continue;
    }

    const next = replacement[index + 1];

    if (next === "$") {
      result += "$";
      index += 1;
      continue;
    }
    if (next === "&") {
      result += match[0];
      index += 1;
      continue;
    }
    if (next === "`") {
      result += input.slice(0, match.index);
      index += 1;
      continue;
    }
    if (next === "'") {
      result += input.slice(match.index + match[0].length);
      index += 1;
      continue;
    }

    if (next === "<") {
      const close = replacement.indexOf(">", index + 2);
      if (close !== -1 && match.groups) {
        const name = replacement.slice(index + 2, close);
        result += match.groups[name] ?? "";
        index = close;
        continue;
      }
    }

    if (next === "0") {
      const secondChar = replacement[index + 2];
      if (secondChar && /[1-9]/.test(secondChar)) {
        const capture = Number(secondChar);
        if (capture < match.length) {
          result += match[capture] ?? "";
          index += 2;
          continue;
        }
      }
    }

    if (/\d/.test(next) && next !== "0") {
      const first = Number(next);
      const secondChar = replacement[index + 2];
      const twoDigit = secondChar && /\d/.test(secondChar) ? Number(next + secondChar) : 0;

      if (twoDigit > 0 && twoDigit < match.length) {
        result += match[twoDigit] ?? "";
        index += 2;
        continue;
      }

      if (first < match.length) {
        result += match[first] ?? "";
        index += 1;
        continue;
      }
    }

    result += "$";
  }

  return result;
}

function advanceStringIndex(input: string, index: number, unicode: boolean) {
  if (!unicode || index + 1 >= input.length) {
    return index + 1;
  }

  const first = input.charCodeAt(index);
  if (first < 0xd800 || first > 0xdbff) {
    return index + 1;
  }

  const second = input.charCodeAt(index + 1);
  return second >= 0xdc00 && second <= 0xdfff ? index + 2 : index + 1;
}

function hasUnicodeSetsFlag(flags: string) {
  return flags.includes("v");
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
  options: {
    replaceAll: boolean;
    replacement: string;
    replacementMode: ReplacementMode;
    pattern: string;
  },
  matchCountCapped: boolean
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

  if (matchCountCapped) {
    issues.push({
      severity: "warning",
      title: "Match detail limit reached",
      message: "Match-detail collection stops at 10,000 rows. The replacement itself still uses JavaScript's full replace operation, so the result can contain more replacements than the collected count.",
    });
  }

  if (matches.length > 500) {
    issues.push({
      severity: "info",
      title: "Large match count",
      message: "More than 500 matches were found. Review the pattern before applying it to large files.",
    });
  }


  if (
    options.replacementMode === "javascript" &&
    /\$\d|\$</.test(options.replacement) &&
    matches.every((match) => match.groups.length === 0 && Object.keys(match.namedGroups).length === 0)
  ) {
    issues.push({
      severity: "info",
      title: "Replacement references groups",
      message: "The replacement text references groups, but the pattern did not capture any groups.",
    });
  }

  if (looksBacktrackingProne(options.pattern)) {
    issues.push({
      severity: "warning",
      title: "Backtracking risk",
      message: "The pattern contains a nested quantified group that can become expensive on some inputs. Test representative data before using it for bulk replacement.",
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

function looksBacktrackingProne(pattern: string) {
  return /\((?:[^()\\]|\\.)*[+*](?:[^()\\]|\\.)*\)[+*{]/.test(pattern);
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
    return JSON.stringify(
      {
        ...result,
        matches: result.matches.map((match) => ({
          number: match.number,
          match: match.match,
          replacement: match.replacement,
          ...(options.showPositions ? { start: match.start, end: match.end, line: match.line } : {}),
          ...(options.showGroups ? { groups: match.groups, namedGroups: match.namedGroups } : {}),
        })),
      },
      null,
      2
    );
  }

  if (options.outputMode === "markdown") {
    const headers = ["#", "Match", "Replacement"];
    if (options.showPositions) headers.push("Line", "Position");
    if (options.showGroups) headers.push("Groups");

    const divider = headers.map(() => "---");
    const rows = result.matches.map((match) => {
      const cells = [
        String(match.number),
        escapeMarkdown(match.match),
        escapeMarkdown(match.replacement),
      ];
      if (options.showPositions) {
        cells.push(String(match.line), `${match.start}-${match.end}`);
      }
      if (options.showGroups) {
        cells.push(escapeMarkdown(formatGroups(match)));
      }
      return `| ${cells.join(" | ")} |`;
    });

    return [
      `| ${headers.join(" | ")} |`,
      `| ${divider.join(" | ")} |`,
      ...rows,
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
          lines.push(`Groups: ${match.groups.length ? match.groups.map((group, index) => `$${index + 1}=${group ?? "(unmatched)"}`).join(", ") : "none"}`);
          lines.push(`Named groups: ${Object.keys(match.namedGroups).length ? Object.entries(match.namedGroups).map(([key, value]) => `${key}=${value ?? "(unmatched)"}`).join(", ") : "none"}`);
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
    `Matches: ${result.matchCount}${result.matchCountCapped ? "+" : ""}`,
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
    ? match.groups.map((group, index) => `$${index + 1}=${group ?? "(unmatched)"}`).join(", ")
    : "";
  const named = Object.keys(match.namedGroups).length
    ? Object.entries(match.namedGroups).map(([key, value]) => `${key}=${value ?? "(unmatched)"}`).join(", ")
    : "";

  return [numbered, named].filter(Boolean).join("; ") || "-";
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.matchCount > 0) {
    notes.push({
      title: "Review before applying",
      message: "Preview the changed lines before running the same replacement in an editor, script, or production data file.",
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
