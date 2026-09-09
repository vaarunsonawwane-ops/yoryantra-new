"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputFormat = "summary" | "json" | "list";
type ReplacementMode = "disabled" | "enabled";
type CopyState = "idle" | "copied" | "failed";

type RegexFlag = {
  key: "g" | "i" | "m" | "s" | "u" | "y";
  label: string;
  description: string;
};

type RegexMatch = {
  value: string;
  index: number;
  endIndex: number;
  groups: Array<string | null>;
  namedGroups: Record<string, string | null>;
};

type RunResult = {
  matches: RegexMatch[];
  replacementOutput: string;
  truncated: boolean;
  elapsedMs: number;
};

type HighlightSegment = {
  text: string;
  matched: boolean;
  key: string;
};

const MAX_PATTERN_LENGTH = 5000;
const MAX_TEXT_LENGTH = 200000;
const MAX_MATCHES = 1000;

const regexFlags: RegexFlag[] = [
  {
    key: "g",
    label: "Global",
    description: "Continue after the first match and collect later matches.",
  },
  {
    key: "i",
    label: "Ignore case",
    description: "Use case-insensitive matching where JavaScript supports it.",
  },
  {
    key: "m",
    label: "Multiline",
    description: "Let ^ and $ work at line boundaries as well as text boundaries.",
  },
  {
    key: "s",
    label: "Dot all",
    description: "Let . match line terminators as well as other characters.",
  },
  {
    key: "u",
    label: "Unicode",
    description: "Use Unicode-aware code point handling for the pattern.",
  },
  {
    key: "y",
    label: "Sticky",
    description: "Require a match to begin exactly at the regex lastIndex position.",
  },
];

const samplePattern = String.raw`(?<name>[A-Z][a-z]+)\s+(?<id>USR-\d{4})`;
const sampleText = `Sneha USR-1042
Varoun USR-2088
invalid usr-3099`;

export default function ToolClient() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [selectedFlags, setSelectedFlags] = useState<string[]>(["g"]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("summary");
  const [replacementMode, setReplacementMode] =
    useState<ReplacementMode>("disabled");
  const [replacementText, setReplacementText] = useState("$<id>:$<name>");
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const flags = orderedFlags(selectedFlags);
  const matches = result?.matches ?? [];
  const highlightedSegments = buildHighlightSegments(testText, matches);
  const output = result
    ? formatMatchOutput({
        pattern,
        flags,
        result,
        outputFormat,
        replacementMode,
      })
    : "";

  const markInputChanged = () => {
    setResult(null);
    setError("");
    setCopyState("idle");
  };

  const toggleFlag = (flag: string) => {
    setSelectedFlags((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag]
    );
    markInputChanged();
  };

  const runTest = () => {
    setCopyState("idle");

    if (pattern.length > MAX_PATTERN_LENGTH) {
      setError(`Keep the regex pattern at or below ${MAX_PATTERN_LENGTH.toLocaleString()} UTF-16 code units.`);
      setResult(null);
      return;
    }

    if (testText.length > MAX_TEXT_LENGTH) {
      setError(`Keep test text at or below ${MAX_TEXT_LENGTH.toLocaleString()} UTF-16 code units for an interactive browser test.`);
      setResult(null);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const started = performance.now();
      const matchResult = findRegexMatches(regex, testText, MAX_MATCHES);
      const replacementOutput =
        replacementMode === "enabled"
          ? testText.replace(new RegExp(pattern, flags), replacementText)
          : "";
      const elapsedMs = performance.now() - started;

      setResult({
        matches: matchResult.matches,
        replacementOutput,
        truncated: matchResult.truncated,
        elapsedMs,
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "JavaScript could not run this regular expression.");
      setResult(null);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const loadExample = () => {
    setPattern(samplePattern);
    setTestText(sampleText);
    setSelectedFlags(["g"]);
    setOutputFormat("summary");
    setReplacementMode("disabled");
    setReplacementText("$<id>:$<name>");
    setResult(null);
    setError("");
    setCopyState("idle");
  };

  const resetAll = () => {
    setPattern("");
    setTestText("");
    setSelectedFlags(["g"]);
    setOutputFormat("summary");
    setReplacementMode("disabled");
    setReplacementText("");
    setResult(null);
    setError("");
    setCopyState("idle");
  };

  return (
    <ToolShell
      title="Regex Match Tester"
      description="Run JavaScript regex patterns with selected flags, capture groups, match indexes, and replacement semantics."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Regex Pattern
        </label>

        <div className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
          <span className="hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-500 md:block">
            /
          </span>
          <input
            value={pattern}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setPattern(event.target.value);
              markInputChanged();
            }}
            placeholder={String.raw`(?<id>USR-\d{4})`}
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <span className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
            /{flags || "no flags"}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Enter the JavaScript pattern body without surrounding slashes. An
          empty pattern is valid JavaScript and can produce zero-length matches.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Matching behavior</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {regexFlags.map((flag) => (
            <label
              key={flag.key}
              className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4"
            >
              <input
                type="checkbox"
                checked={selectedFlags.includes(flag.key)}
                onChange={() => toggleFlag(flag.key)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--green)]"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">
                  {flag.label} <span className="font-mono text-gray-500">/{flag.key}</span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                  {flag.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output Format"
            value={outputFormat}
            onChange={(value) => {
              setOutputFormat(value as OutputFormat);
              setCopyState("idle");
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "JSON", value: "json" },
              { label: "Match List", value: "list" },
            ]}
          />
          <YoryantraSelect
            label="Replacement Preview"
            value={replacementMode}
            onChange={(value) => {
              setReplacementMode(value as ReplacementMode);
              setResult(null);
              setCopyState("idle");
            }}
            options={[
              { label: "Disabled", value: "disabled" },
              { label: "Enabled", value: "enabled" },
            ]}
          />
        </div>

        {replacementMode === "enabled" && (
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Replacement Text
            </label>
            <input
              value={replacementText}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setReplacementText(event.target.value);
                setResult(null);
                setCopyState("idle");
              }}
              placeholder="$1 or $<name>"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Replacement follows JavaScript String.replace() rules. Without /g,
              only the first match is replaced.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">Test Text</label>
        <textarea
          value={testText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setTestText(event.target.value);
            markInputChanged();
          }}
          placeholder="Paste text to test against the pattern."
          spellCheck={false}
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm text-gray-500">
          Match indexes below are JavaScript string indexes, measured in UTF-16 code units.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runTest} className="yoryantra-btn whitespace-nowrap">Run Test</button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
        {result && (
          <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap">
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy Results"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        Some regular expressions can take extremely long on carefully chosen
        input. JavaScript regex execution is synchronous here, so a pathological
        pattern can still make the page unresponsive until the browser finishes
        it. Test untrusted or complex patterns on small representative samples first.
      </div>

      {result && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Matches" value={String(matches.length)} />
            <SummaryCard label="Flags" value={flags || "none"} />
            <SummaryCard label="Pattern Units" value={pattern.length.toLocaleString()} />
            <SummaryCard label="Text Units" value={testText.length.toLocaleString()} />
          </div>

          {(result.truncated || result.elapsedMs >= 100) && (
            <div className="mt-5 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              {result.truncated
                ? `Only the first ${MAX_MATCHES.toLocaleString()} matches are shown to keep the page responsive.`
                : `This run took about ${formatDuration(result.elapsedMs)}. Complex patterns can become expensive on larger input.`}
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">Highlighted Match Preview</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Non-empty matches use a neutral highlight. Zero-length matches are
              listed in Match Details because there is no text span to highlight.
            </p>
            <div className="mt-4 min-h-[180px] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-7 text-gray-800 whitespace-pre-wrap break-words">
              {testText ? (
                highlightedSegments.map((segment) => (
                  <span
                    key={segment.key}
                    className={segment.matched ? "rounded bg-gray-200 px-1 font-semibold text-gray-950" : ""}
                  >
                    {segment.text}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">The test text is empty.</span>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold text-gray-900">Match Details</h3>
            {matches.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">No match was found with the selected flags.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {matches.map((match, index) => (
                  <div key={`${match.index}-${match.endIndex}-${index}`} className="self-start rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Match {index + 1}</div>
                        <div className="mt-1 text-xs text-gray-500">Index {match.index} to {match.endIndex}</div>
                      </div>
                      <span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                        {match.value.length} UTF-16 units
                      </span>
                    </div>

                    <pre className="mt-3 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 whitespace-pre-wrap break-words">
{match.value === "" ? "(zero-length match)" : match.value}
                    </pre>

                    {match.groups.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-gray-900">Capture Groups</div>
                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          {match.groups.map((group, groupIndex) => (
                            <ValueCard key={`${match.index}-group-${groupIndex}`} label={`Group ${groupIndex + 1}`} value={displayGroup(group)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(match.namedGroups).length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-gray-900">Named Groups</div>
                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          {Object.entries(match.namedGroups).map(([name, value]) => (
                            <ValueCard key={`${match.index}-named-${name}`} label={name} value={displayGroup(value)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {replacementMode === "enabled" && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">Replacement Preview</h3>
              <pre className="mt-4 yoryantra-output min-h-[180px] overflow-auto whitespace-pre-wrap break-words text-sm">
                {result.replacementOutput}
              </pre>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Match Output</h3>
              <button onClick={copyOutput} className="yoryantra-btn-outline text-sm whitespace-nowrap">
                {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy"}
              </button>
            </div>
            <pre className="yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">{output}</pre>
          </div>
        </>
      )}

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Pattern, text, matches, and replacement previews stay in the browser.
        Running a regex does not send the sample text to a server.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What JavaScript actually matches</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A regular expression is interpreted by the browser's JavaScript
            engine. Flags are part of that behavior: <code>g</code> changes a
            single search into repeated matching, <code>y</code> requires the
            next match at the current position, and <code>u</code> changes how
            Unicode code points are consumed by several pattern constructs.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Match positions are still JavaScript string indexes. Those indexes
            count UTF-16 code units, so a visible character outside the Basic
            Multilingual Plane can occupy two index positions even under
            Unicode-aware matching.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Global matching and replacement are separate decisions</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Without <code>g</code>, the tester reports the first match only and
            String.replace() replaces the first match only. With <code>g</code>,
            both operations continue through later matches. The page does not
            force global behavior behind the scenes, because doing so would
            test a different regular expression from the one you selected.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">Unmatched is different from empty</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              An optional capture can be unmatched, which JavaScript reports as
              undefined. A capture can also participate and match an empty
              string. Match Details preserves that distinction instead of
              displaying both cases as the same blank value.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">Zero-length matches need care</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Patterns such as anchors can match without consuming text. The
              iterator advances manually after a zero-length global match so it
              cannot loop forever at one index; Unicode mode advances by a full
              code point when needed.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Performance is part of regex correctness</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Backtracking regex engines can spend a long time exploring failed
            alternatives. Nested ambiguous quantifiers and attacker-controlled
            input are especially risky. The page caps text and displayed match
            counts, but it cannot safely interrupt a synchronous regex that is
            already consuming CPU in the browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JavaScript references</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            MDN's RegExp.exec() documentation covers stateful global and sticky
            matching and the zero-length-loop pitfall. String.replace() defines
            replacement tokens such as <code>$1</code>, <code>$&lt;name&gt;</code>,
            and the rule that repeated replacement requires a global regex.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">MDN RegExp.exec()</a>
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">MDN String.replace()</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/regex-match-tester" /></div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function ValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-xs text-gray-900">{value}</div>
    </div>
  );
}

function orderedFlags(selected: string[]): string {
  return regexFlags.filter((flag) => selected.includes(flag.key)).map((flag) => flag.key).join("");
}

function findRegexMatches(regex: RegExp, text: string, limit: number): { matches: RegexMatch[]; truncated: boolean } {
  const matches: RegexMatch[] = [];
  const repeated = regex.global;
  regex.lastIndex = 0;

  while (true) {
    const match = regex.exec(text);
    if (!match) break;

    matches.push({
      value: match[0],
      index: match.index,
      endIndex: match.index + match[0].length,
      groups: match.slice(1).map((group) => (group === undefined ? null : group)),
      namedGroups: normalizeNamedGroups(match.groups),
    });

    if (!repeated) break;

    if (matches.length >= limit) {
      return { matches, truncated: true };
    }

    if (match[0] === "") {
      regex.lastIndex = advanceStringIndex(text, regex.lastIndex, regex.unicode);
    }
  }

  return { matches, truncated: false };
}

function normalizeNamedGroups(groups: Record<string, string> | undefined): Record<string, string | null> {
  if (!groups) return {};
  const normalized: Record<string, string | null> = {};
  Object.entries(groups).forEach(([name, value]) => {
    normalized[name] = value === undefined ? null : value;
  });
  return normalized;
}

function advanceStringIndex(text: string, index: number, unicode: boolean): number {
  if (!unicode || index >= text.length) return index + 1;
  const first = text.charCodeAt(index);
  if (first < 0xd800 || first > 0xdbff || index + 1 >= text.length) return index + 1;
  const second = text.charCodeAt(index + 1);
  return second >= 0xdc00 && second <= 0xdfff ? index + 2 : index + 1;
}

function buildHighlightSegments(text: string, matches: RegexMatch[]): HighlightSegment[] {
  if (!text) return [];
  const visibleMatches = matches.filter((match) => match.endIndex > match.index);
  if (visibleMatches.length === 0) return [{ text, matched: false, key: "plain-0" }];

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  visibleMatches.forEach((match, index) => {
    if (match.index > cursor) {
      segments.push({ text: text.slice(cursor, match.index), matched: false, key: `plain-${cursor}-${index}` });
    }
    if (match.index >= cursor) {
      segments.push({ text: text.slice(match.index, match.endIndex), matched: true, key: `match-${match.index}-${index}` });
      cursor = match.endIndex;
    }
  });

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), matched: false, key: `plain-${cursor}-end` });
  }

  return segments;
}

function formatMatchOutput({
  pattern,
  flags,
  result,
  outputFormat,
  replacementMode,
}: {
  pattern: string;
  flags: string;
  result: RunResult;
  outputFormat: OutputFormat;
  replacementMode: ReplacementMode;
}): string {
  if (outputFormat === "json") {
    return JSON.stringify(
      {
        pattern,
        flags,
        matchCount: result.matches.length,
        truncated: result.truncated,
        matches: result.matches,
        replacement: replacementMode === "enabled" ? result.replacementOutput : undefined,
      },
      null,
      2
    );
  }

  if (outputFormat === "list") {
    if (result.matches.length === 0) return "No matches found.";
    return result.matches.map((match) => (match.value === "" ? "(zero-length match)" : match.value)).join("\n");
  }

  const lines = [
    `Pattern: /${pattern}/${flags}`,
    `Matches: ${result.matches.length}${result.truncated ? ` (first ${MAX_MATCHES} shown)` : ""}`,
    `Run time: ${formatDuration(result.elapsedMs)}`,
  ];

  result.matches.forEach((match, index) => {
    lines.push("");
    lines.push(`Match ${index + 1}: ${match.value === "" ? "(zero-length match)" : match.value}`);
    lines.push(`Index: ${match.index} - ${match.endIndex}`);
    if (match.groups.length > 0) {
      lines.push(`Groups: ${match.groups.map((group, groupIndex) => `${groupIndex + 1}=${displayGroup(group)}`).join(", ")}`);
    }
    const names = Object.keys(match.namedGroups);
    if (names.length > 0) {
      lines.push(`Named: ${names.map((name) => `${name}=${displayGroup(match.namedGroups[name])}`).join(", ")}`);
    }
  });

  if (replacementMode === "enabled") {
    lines.push("", "Replacement Preview:", result.replacementOutput);
  }

  return lines.join("\n");
}

function displayGroup(value: string | null): string {
  if (value === null) return "(unmatched)";
  if (value === "") return "(empty string)";
  return value;
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1) return "<1 ms";
  if (milliseconds < 1000) return `${Math.round(milliseconds)} ms`;
  return `${(milliseconds / 1000).toFixed(2)} s`;
}
