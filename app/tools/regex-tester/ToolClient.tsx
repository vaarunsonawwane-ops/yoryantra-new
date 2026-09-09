"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type RegexMatch = {
  value: string;
  index: number;
  endIndex: number;
  groups: Array<string | undefined>;
};

type HighlightSegment = {
  text: string;
  matched: boolean;
  index: number;
};

type RunSnapshot = {
  pattern: string;
  text: string;
  flags: string;
};

type MatchRun = {
  snapshot: RunSnapshot;
  matches: RegexMatch[];
  truncated: boolean;
};

const FLAG_ORDER = ["g", "i", "m", "s", "u"] as const;
const MAX_MATCHES = 5000;

const samplePattern = String.raw`\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b`;
const sampleText = `Contact support@example.com for product help.
Billing questions can go to billing@example.org.
Invalid examples like support@local should not match.`;

export default function ToolClient() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [flags, setFlags] = useState<string[]>(["g", "i"]);
  const [run, setRun] = useState<MatchRun | null>(null);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle"
  );

  const selectedFlags = useMemo(
    () => FLAG_ORDER.filter((flag) => flags.includes(flag)).join(""),
    [flags]
  );

  const highlightedSegments = useMemo(
    () => buildHighlightSegments(run?.snapshot.text ?? "", run?.matches ?? []),
    [run]
  );

  const resultText = useMemo(() => {
    if (!run) {
      return "";
    }

    if (run.matches.length === 0) {
      return "No matches found.";
    }

    const body = run.matches
      .map((match, index) => {
        const printableValue = match.value === "" ? "(empty match)" : match.value;
        const groupText =
          match.groups.length > 0
            ? `\nGroups: ${match.groups
                .map((group, groupIndex) => {
                  const value =
                    group === undefined
                      ? "(unmatched)"
                      : group === ""
                        ? "(empty)"
                        : group;
                  return `${groupIndex + 1}=${value}`;
                })
                .join(", ")}`
            : "";

        return `Match ${index + 1}: ${printableValue}\nIndex: ${match.index} - ${match.endIndex}${groupText}`;
      })
      .join("\n\n");

    return run.truncated
      ? `${body}\n\nResult limit reached after ${MAX_MATCHES.toLocaleString()} matches.`
      : body;
  }, [run]);

  const clearResult = () => {
    setRun(null);
    setError("");
    setCopyState("idle");
  };

  const toggleFlag = (flag: string) => {
    setFlags((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag]
    );
    clearResult();
  };

  const runTest = () => {
    try {
      const regex = new RegExp(pattern, selectedFlags);
      const result = findRegexMatches(regex, testText);

      setRun({
        snapshot: {
          pattern,
          text: testText,
          flags: selectedFlags,
        },
        matches: result.matches,
        truncated: result.truncated,
      });
      setError("");
      setCopyState("idle");
    } catch (err) {
      setRun(null);
      setError(
        err instanceof Error ? err.message : "Unable to create this regular expression."
      );
    }
  };

  const copyResults = async () => {
    if (!resultText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(resultText);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("failed");
    }
  };

  const loadExample = () => {
    setPattern(samplePattern);
    setTestText(sampleText);
    setFlags(["g", "i"]);
    setRun(null);
    setError("");
    setCopyState("idle");
  };

  const resetAll = () => {
    setPattern("");
    setTestText("");
    setFlags(["g", "i"]);
    setRun(null);
    setError("");
    setCopyState("idle");
  };

  return (
    <ToolShell
      title="Regex Tester"
      description="Test JavaScript regular expressions with selectable flags, match positions, capture groups, and highlighted text."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Regular Expression Pattern
        </label>

        <div className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
          <span className="hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-500 md:block">
            /
          </span>

          <input
            value={pattern}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setPattern(event.target.value);
              clearResult();
            }}
            placeholder={samplePattern}
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <span className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
            /{selectedFlags || "no flags"}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Enter the pattern body without surrounding slash characters. Matching
          follows the JavaScript <code>RegExp</code> engine used by your browser.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Match Options</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FlagCard
            label="Global"
            flag="g"
            description="Find successive matches. Without g, only the first match is returned."
            checked={flags.includes("g")}
            onChange={() => toggleFlag("g")}
          />
          <FlagCard
            label="Ignore case"
            flag="i"
            description="Compare letters without case-sensitive matching."
            checked={flags.includes("i")}
            onChange={() => toggleFlag("i")}
          />
          <FlagCard
            label="Multiline"
            flag="m"
            description="Let ^ and $ also match line boundaries."
            checked={flags.includes("m")}
            onChange={() => toggleFlag("m")}
          />
          <FlagCard
            label="Dot all"
            flag="s"
            description="Allow . to match line terminators as well as other characters."
            checked={flags.includes("s")}
            onChange={() => toggleFlag("s")}
          />
          <FlagCard
            label="Unicode"
            flag="u"
            description="Use Unicode-aware parsing and code-point handling where JavaScript defines it."
            checked={flags.includes("u")}
            onChange={() => toggleFlag("u")}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Test Text
        </label>

        <textarea
          value={testText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setTestText(event.target.value);
            clearResult();
          }}
          placeholder={sampleText}
          spellCheck={false}
          className="min-h-[300px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Run the test after changing the pattern, flags, or text. Explicit execution
          avoids running an expensive expression on every keystroke.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runTest} className="yoryantra-btn whitespace-nowrap">
          Run Test
        </button>
        <button
          onClick={loadExample}
          className="yoryantra-btn-outline whitespace-nowrap"
        >
          Load Example
        </button>
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline whitespace-nowrap"
        >
          Reset
        </button>
        <Link
          href="/tools/regex-match-tester"
          className="yoryantra-btn-outline whitespace-nowrap"
        >
          Advanced Match Tester
        </Link>
      </div>

      {error && (
        <div className="mt-6 self-start rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {run && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Matches" value={String(run.matches.length)} />
            <SummaryCard
              label="Mode"
              value={run.snapshot.flags.includes("g") ? "all matches" : "first match"}
            />
            <SummaryCard
              label="Pattern length"
              value={run.snapshot.pattern.length.toLocaleString()}
            />
            <SummaryCard
              label="Text length"
              value={run.snapshot.text.length.toLocaleString()}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">Match Preview</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Non-empty matches are highlighted. Zero-length matches appear in the
              result list because there is no visible text to highlight.
            </p>

            <div className="mt-4 min-h-[180px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-7 text-gray-800">
              {run.snapshot.text ? (
                highlightedSegments.map((segment) => (
                  <span
                    key={`${segment.index}-${segment.text}`}
                    className={
                      segment.matched
                        ? "rounded bg-gray-200 px-1 font-semibold text-gray-950 ring-1 ring-[var(--light-gold)]"
                        : ""
                    }
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
            <h3 className="text-lg font-semibold text-gray-900">Match Results</h3>

            {run.matches.length > 0 ? (
              <div className="mt-4 space-y-3">
                {run.matches.map((match, index) => (
                  <div
                    key={`${match.index}-${match.endIndex}-${index}`}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          Match {index + 1}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          UTF-16 index {match.index} to {match.endIndex}
                        </div>
                      </div>
                      <span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                        {match.value.length} code units
                      </span>
                    </div>

                    <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800">
{match.value === "" ? "(empty match)" : match.value}
                    </pre>

                    {match.groups.length > 0 && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {match.groups.map((group, groupIndex) => (
                          <div
                            key={`${match.index}-${groupIndex}`}
                            className="self-start rounded-lg border border-gray-200 bg-gray-50 p-3"
                          >
                            <div className="text-xs font-semibold text-gray-500">
                              Group {groupIndex + 1}
                            </div>
                            <div className="mt-1 break-words font-mono text-xs text-gray-900">
                              {group === undefined
                                ? "(unmatched)"
                                : group === ""
                                  ? "(empty)"
                                  : group}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {run.truncated && (
                  <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
                    The result list stops at {MAX_MATCHES.toLocaleString()} matches
                    to keep the page usable. Narrow the pattern or test a smaller
                    sample when you need to inspect more.
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-600">No matches were found.</p>
            )}
          </div>

          <div className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Result Output</h3>
              {resultText && (
                <button
                  onClick={copyResults}
                  className="yoryantra-btn-outline whitespace-nowrap text-sm"
                >
                  {copyState === "copied" ? "Copied" : "Copy Results"}
                </button>
              )}
            </div>

            <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {resultText || "Regex test results will appear here."}
            </pre>

            {copyState === "failed" && (
              <p className="mt-2 text-sm text-red-700">
                The browser blocked clipboard access. Select and copy the output manually.
              </p>
            )}
          </div>
        </>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <p className="font-semibold text-gray-900">Local processing</p>
          <p className="mt-1">
            The pattern and test text stay in this browser tab. No server request is
            needed to execute the regular expression.
          </p>
        </div>
        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          <p className="font-semibold">Complex expressions can stall the tab</p>
          <p className="mt-1">
            JavaScript regular expressions run synchronously here. Pathological
            backtracking can consume significant CPU time, so test unfamiliar or
            complex patterns against short text first.
          </p>
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What the match result actually means
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The result follows JavaScript regular-expression semantics, not PCRE,
            Python, .NET, or a server-side regex engine. A pattern that works here can
            behave differently in another language when syntax, Unicode handling, or
            supported features differ.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Match positions are JavaScript string indexes, so they are measured in
            UTF-16 code units. A visible emoji or combined character can occupy more
            than one code unit even when it looks like a single character on screen.
            An empty pattern is also valid JavaScript regex syntax and can produce
            zero-length matches.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The global flag changes how many results you get
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            With <code>g</code> enabled, JavaScript advances through the string and
            returns successive matches. Without <code>g</code>, this page returns the
            first match only. Zero-length global matches need special handling so the
            search can move forward instead of repeating forever at the same index.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Capture groups can be empty or unmatched
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            An optional capture group that did not participate in a match is different
            from a group that participated and matched an empty string. The result
            cards preserve that distinction instead of displaying both as blank text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When a quick browser test is not enough
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A successful sample match does not prove that a validation regex is safe,
            complete, or resistant to adversarial input. Production validators should
            be tested with realistic boundary cases, malformed input, and the exact
            regex engine used by the application.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For named groups, replacement preview, structured output, and deeper match
            details, continue with the{" "}
            <Link
              href="/tools/regex-match-tester"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              Regex Match Tester
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference behavior</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript&apos;s <code>RegExp.exec()</code> behavior and the stateful
            <code>lastIndex</code> rules for global expressions are documented by MDN
            and defined by ECMAScript.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              MDN: RegExp.exec()
            </a>
            <a
              href="https://tc39.es/ecma262/multipage/text-processing.html#sec-regexp-regular-expression-objects"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              ECMAScript RegExp specification
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/regex-tester" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function FlagCard({
  label,
  flag,
  description,
  checked,
  onChange,
}: {
  label: string;
  flag: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
      />
      <span>
        <span className="block text-sm font-medium text-gray-900">
          {label} <span className="font-mono text-gray-500">/{flag}</span>
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-gray-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-base font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function findRegexMatches(regex: RegExp, text: string): {
  matches: RegexMatch[];
  truncated: boolean;
} {
  const searchRegex = new RegExp(regex.source, regex.flags);
  searchRegex.lastIndex = 0;

  if (!searchRegex.global) {
    const match = searchRegex.exec(text);
    return {
      matches: match ? [toRegexMatch(match)] : [],
      truncated: false,
    };
  }

  const matches: RegexMatch[] = [];

  while (matches.length < MAX_MATCHES) {
    const match = searchRegex.exec(text);
    if (!match) {
      return { matches, truncated: false };
    }

    matches.push(toRegexMatch(match));

    if (match[0] === "") {
      searchRegex.lastIndex = advanceStringIndex(
        text,
        searchRegex.lastIndex,
        searchRegex.unicode
      );
    }
  }

  return {
    matches,
    truncated: searchRegex.exec(text) !== null,
  };
}

function toRegexMatch(match: RegExpExecArray): RegexMatch {
  return {
    value: match[0],
    index: match.index,
    endIndex: match.index + match[0].length,
    groups: match.slice(1),
  };
}

function advanceStringIndex(text: string, index: number, unicode: boolean): number {
  if (!unicode || index >= text.length) {
    return index + 1;
  }

  const first = text.charCodeAt(index);
  if (first < 0xd800 || first > 0xdbff || index + 1 >= text.length) {
    return index + 1;
  }

  const second = text.charCodeAt(index + 1);
  return second >= 0xdc00 && second <= 0xdfff ? index + 2 : index + 1;
}

function buildHighlightSegments(
  text: string,
  matches: RegexMatch[]
): HighlightSegment[] {
  if (!text) {
    return [];
  }

  const visibleMatches = matches.filter((match) => match.endIndex > match.index);
  if (visibleMatches.length === 0) {
    return [{ text, matched: false, index: 0 }];
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  visibleMatches.forEach((match, matchIndex) => {
    if (match.index > cursor) {
      segments.push({
        text: text.slice(cursor, match.index),
        matched: false,
        index: cursor,
      });
    }

    if (match.index >= cursor) {
      segments.push({
        text: text.slice(match.index, match.endIndex),
        matched: true,
        index: match.index + matchIndex,
      });
    }

    cursor = Math.max(cursor, match.endIndex);
  });

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      matched: false,
      index: cursor,
    });
  }

  return segments;
}
