"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type RegexMatch = {
  value: string;
  index: number;
  endIndex: number;
  groups: string[];
};

type HighlightSegment = {
  text: string;
  matched: boolean;
  index: number;
};

const samplePattern = String.raw`\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b`;

const sampleText = `Contact support@example.com for product help.
Billing questions can go to billing@example.org.
Invalid examples like support@local should not match.`;

export default function ToolClient() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [flags, setFlags] = useState(["g", "i"]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const regex = useMemo(() => {
    if (!pattern.trim()) {
      setError("");
      return null;
    }

    try {
      setError("");
      return new RegExp(pattern, Array.from(new Set(flags)).join(""));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create this regex."
      );
      return null;
    }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex || !testText) {
      return [];
    }

    return findRegexMatches(regex, testText);
  }, [regex, testText]);

  const highlightedSegments = useMemo(
    () => buildHighlightSegments(testText, matches),
    [testText, matches]
  );

  const resultText = useMemo(() => {
    if (!pattern.trim()) {
      return "";
    }

    if (error) {
      return "";
    }

    if (!testText.trim()) {
      return "Enter test text to see regex matches.";
    }

    if (matches.length === 0) {
      return "No matches found.";
    }

    return matches
      .map(
        (match, index) =>
          `Match ${index + 1}: ${match.value}\nIndex: ${match.index} - ${match.endIndex}${
            match.groups.length > 0
              ? `\nGroups: ${match.groups
                  .map((group, groupIndex) => `${groupIndex + 1}=${group}`)
                  .join(", ")}`
              : ""
          }`
      )
      .join("\n\n");
  }, [pattern, testText, matches, error]);

  const toggleFlag = (flag: string) => {
    setFlags((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag]
    );
    setCopied(false);
  };

  const copyResults = async () => {
    if (!resultText) {
      return;
    }

    await navigator.clipboard.writeText(resultText);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setPattern(samplePattern);
    setTestText(sampleText);
    setFlags(["g", "i"]);
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setPattern("");
    setTestText("");
    setFlags(["g", "i"]);
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Regex Tester"
      description="Quickly test a regular expression against sample text and see matched results directly in your browser."
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
            onChange={(event) => {
              setPattern(event.target.value);
              setCopied(false);
            }}
            placeholder={samplePattern}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <span className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
            /{flags.join("") || "no flags"}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Enter the regex pattern without the surrounding slash characters. Use
          the flag cards below to change matching behavior.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Match Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <FlagCard
            label="Global"
            flag="g"
            description="Find all matches instead of stopping after the first match."
            checked={flags.includes("g")}
            onChange={() => toggleFlag("g")}
          />

          <FlagCard
            label="Ignore case"
            flag="i"
            description="Match uppercase and lowercase letters without distinction."
            checked={flags.includes("i")}
            onChange={() => toggleFlag("i")}
          />

          <FlagCard
            label="Multiline"
            flag="m"
            description="Let ^ and $ work at the start and end of each line."
            checked={flags.includes("m")}
            onChange={() => toggleFlag("m")}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Test Text
        </label>

        <textarea
          value={testText}
          onChange={(event) => {
            setTestText(event.target.value);
            setCopied(false);
          }}
          placeholder={sampleText}
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste the text you want to check. The tool highlights matches and shows
          match positions below.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>

        {resultText && (
          <button onClick={copyResults} className="yoryantra-btn">
            {copied ? "Copied" : "Copy Results"}
          </button>
        )}

        <Link href="/tools/regex-match-tester" className="yoryantra-btn-outline">
          Advanced Regex Match Tester
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <SummaryCard label="Matches" value={String(matches.length)} />
        <SummaryCard label="Flags" value={flags.join("") || "none"} />
        <SummaryCard label="Pattern Length" value={pattern.length.toLocaleString()} />
        <SummaryCard label="Text Length" value={testText.length.toLocaleString()} />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Match Preview
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Matching text is highlighted below. Use the advanced regex tool when
          you need named groups, replacement preview, or JSON output.
        </p>

        <div className="mt-4 min-h-[180px] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-7 text-gray-800 whitespace-pre-wrap break-words">
          {testText ? (
            highlightedSegments.map((segment) => (
              <span
                key={`${segment.index}-${segment.text}`}
                className={
                  segment.matched
                    ? "rounded bg-amber-200 px-1 text-gray-950"
                    : ""
                }
              >
                {segment.text}
              </span>
            ))
          ) : (
            <span className="text-gray-500">
              Match preview will appear here.
            </span>
          )}
        </div>
      </div>

      {matches.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Match Results
          </h3>

          <div className="mt-4 space-y-3">
            {matches.map((match, index) => (
              <div
                key={`${match.index}-${match.endIndex}-${index}`}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Match {index + 1}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      Index {match.index} to {match.endIndex}
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {match.value.length} chars
                  </span>
                </div>

                <pre className="mt-3 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 whitespace-pre-wrap break-words">
{match.value}
                </pre>

                {match.groups.length > 0 && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {match.groups.map((group, groupIndex) => (
                      <div
                        key={`${match.index}-${groupIndex}`}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="text-xs font-semibold text-gray-500">
                          Group {groupIndex + 1}
                        </div>

                        <div className="mt-1 break-words font-mono text-xs text-gray-900">
                          {group || "(empty)"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Result Output
          </h3>

          {resultText && (
            <button
              onClick={copyResults}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[240px] whitespace-pre-wrap break-words">
          {resultText || "Regex test results will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Regex testing happens directly in your browser. Your pattern and test
        text are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Testing Regex Patterns Quickly
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Regular expressions are useful for matching emails, IDs, URLs, logs,
            codes, and text patterns. But a small change in a pattern can change
            what gets matched, so it helps to test against real sample text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Regex Tester is a quick browser-first way to check a pattern,
            toggle common flags, highlight matches, and inspect basic capture
            groups without sending your text anywhere.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking a Regular Expression
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a regex pattern without the outer slash characters.</li>
            <li>Choose flags such as global, ignore case, or multiline.</li>
            <li>Paste text into the test box.</li>
            <li>Review highlighted matches and match positions.</li>
            <li>Copy the match results when needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Regex Tester Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking email, URL, ID, slug, or code patterns.</li>
            <li>Testing a validation regex before using it in code.</li>
            <li>Extracting simple values from logs or pasted text.</li>
            <li>Checking whether global and ignore-case flags are needed.</li>
            <li>Reviewing basic capture groups before writing code.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quick Regex Tester vs Advanced Match Tester
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This page is for fast pattern checks. For named groups, replacement
            preview, structured JSON output, and deeper match details, use the{" "}
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
          <h2 className="text-xl font-semibold text-gray-900">
            Example Regex Test
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Pattern:
\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b

Flags:
gi

Text:
Contact support@example.com or billing@example.org.

Matches:
support@example.com
billing@example.org`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a regex tester?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A regex tester checks a regular expression against sample text
                and shows which parts of the text match.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I include slashes around the regex?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Enter only the pattern body, then select flags separately.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do I only see one match?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Enable the global flag to find every match instead of stopping
                after the first one.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my text uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Regex testing happens directly in your browser, and your text
                is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/regex-match-tester" className="yoryantra-btn-outline">
              Regex Match Tester
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/sql-formatter" className="yoryantra-btn-outline">
              SQL Formatter
            </Link>
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
    <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
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

function findRegexMatches(regex: RegExp, text: string): RegexMatch[] {
  const searchRegex = ensureGlobalRegex(regex);
  const matches: RegexMatch[] = [];
  let match: RegExpExecArray | null;
  let safetyCounter = 0;

  while ((match = searchRegex.exec(text)) !== null) {
    const value = match[0];
    const index = match.index;

    matches.push({
      value,
      index,
      endIndex: index + value.length,
      groups: match.slice(1).map((group) => group ?? ""),
    });

    if (value === "") {
      searchRegex.lastIndex += 1;
    }

    safetyCounter += 1;

    if (safetyCounter > 10000) {
      break;
    }
  }

  return matches;
}

function ensureGlobalRegex(regex: RegExp) {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  return new RegExp(regex.source, flags);
}

function buildHighlightSegments(
  text: string,
  matches: RegexMatch[]
): HighlightSegment[] {
  if (!text) {
    return [];
  }

  if (matches.length === 0) {
    return [
      {
        text,
        matched: false,
        index: 0,
      },
    ];
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  matches.forEach((match, matchIndex) => {
    if (match.index > cursor) {
      segments.push({
        text: text.slice(cursor, match.index),
        matched: false,
        index: cursor,
      });
    }

    if (match.endIndex > match.index) {
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
