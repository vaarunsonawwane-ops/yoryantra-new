"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputFormat = "summary" | "json" | "list";
type ReplacementMode = "disabled" | "enabled";

type RegexFlag = {
  key: string;
  label: string;
  description: string;
};

type RegexMatch = {
  value: string;
  index: number;
  endIndex: number;
  groups: string[];
  namedGroups: Record<string, string>;
};

type HighlightSegment = {
  text: string;
  matched: boolean;
  index: number;
};

const regexFlags: RegexFlag[] = [
  {
    key: "g",
    label: "Global",
    description: "Find every match instead of stopping after the first match.",
  },
  {
    key: "i",
    label: "Ignore case",
    description: "Match uppercase and lowercase letters without distinction.",
  },
  {
    key: "m",
    label: "Multiline",
    description: "^ and $ match the start and end of each line.",
  },
  {
    key: "s",
    label: "Dot all",
    description: "Allow . to match line breaks.",
  },
  {
    key: "u",
    label: "Unicode",
    description: "Use Unicode-aware matching behavior.",
  },
];

const samplePattern = String.raw`\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b`;

const sampleText = `Contact support@example.com for product help.
Billing questions can go to billing@example.org.
Invalid examples like support@local should not match.
You can also reach admin.team+alerts@example.co.in for alerts.`;

export default function ToolClient() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [selectedFlags, setSelectedFlags] = useState(["g", "i"]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("summary");
  const [replacementMode, setReplacementMode] =
    useState<ReplacementMode>("disabled");
  const [replacementText, setReplacementText] = useState("[email]");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const regex = useMemo(() => {
    try {
      setError("");
      return createRegex(pattern, selectedFlags);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create this regex."
      );
      return null;
    }
  }, [pattern, selectedFlags]);

  const matches = useMemo(() => {
    if (!regex || !testText) {
      return [];
    }

    try {
      return findRegexMatches(regex, testText);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to run this regex."
      );
      return [];
    }
  }, [regex, testText]);

  const highlightedSegments = useMemo(
    () => buildHighlightSegments(testText, matches),
    [testText, matches]
  );

  const replacementOutput = useMemo(() => {
    if (!regex || replacementMode === "disabled") {
      return "";
    }

    try {
      const replacementRegex = ensureGlobalRegex(regex);
      return testText.replace(replacementRegex, replacementText);
    } catch {
      return "";
    }
  }, [regex, replacementMode, replacementText, testText]);

  const output = useMemo(
    () =>
      formatMatchOutput({
        pattern,
        flags: selectedFlags.join(""),
        matches,
        outputFormat,
        replacementOutput,
        replacementMode,
      }),
    [
      pattern,
      selectedFlags,
      matches,
      outputFormat,
      replacementOutput,
      replacementMode,
    ]
  );

  const toggleFlag = (flag: string) => {
    setSelectedFlags((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag]
    );
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setPattern(samplePattern);
    setTestText(sampleText);
    setSelectedFlags(["g", "i"]);
    setOutputFormat("summary");
    setReplacementMode("disabled");
    setReplacementText("[email]");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setPattern("");
    setTestText("");
    setSelectedFlags(["g"]);
    setOutputFormat("summary");
    setReplacementMode("disabled");
    setReplacementText("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Regex Match Tester"
      description="Test regular expressions against sample text, preview matches, inspect capture groups, toggle regex flags, and copy match results directly in your browser."
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
            placeholder={String.raw`\bword\b`}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <span className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700">
            /{selectedFlags.join("") || "no flags"}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Enter a JavaScript-style regular expression pattern without the outer
          slash characters. Toggle flags below to control how matching works.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Regex Flags and Output Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {regexFlags.map((flag) => (
            <label
              key={flag.key}
              className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4"
            >
              <input
                type="checkbox"
                checked={selectedFlags.includes(flag.key)}
                onChange={() => toggleFlag(flag.key)}
                className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
              />

              <span>
                <span className="block text-sm font-medium text-gray-900">
                  {flag.label}{" "}
                  <span className="font-mono text-gray-500">/{flag.key}</span>
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
              setCopied(false);
            }}
            options={[
              {
                label: "Summary",
                value: "summary",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Match List",
                value: "list",
              },
            ]}
          />

          <YoryantraSelect
            label="Replacement Preview"
            value={replacementMode}
            onChange={(value) => {
              setReplacementMode(value as ReplacementMode);
              setCopied(false);
            }}
            options={[
              {
                label: "Disabled",
                value: "disabled",
              },
              {
                label: "Enabled",
                value: "enabled",
              },
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
              onChange={(event) => {
                setReplacementText(event.target.value);
                setCopied(false);
              }}
              placeholder="[match]"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />

            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              JavaScript replacement syntax such as $1, $2, or named capture
              references can be used when supported by your pattern.
            </p>
          </div>
        )}
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
          placeholder="Paste text to test against your regex pattern."
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste logs, sample input, validation text, API responses, form data, or
          any text you want to test against the regular expression.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>

        {output && (
          <button onClick={copyOutput} className="yoryantra-btn">
            {copied ? "Copied" : "Copy Results"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <SummaryCard label="Matches" value={String(matches.length)} />
        <SummaryCard
          label="Flags"
          value={selectedFlags.join("") || "none"}
        />
        <SummaryCard
          label="Pattern Length"
          value={String(pattern.length)}
        />
        <SummaryCard
          label="Text Length"
          value={testText.length.toLocaleString()}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Highlighted Match Preview
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Matching text is highlighted below so you can quickly check whether the
          pattern is selecting the intended content.
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
              Highlighted matches will appear here.
            </span>
          )}
        </div>
      </div>

      {matches.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Match Details
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Review match positions, full values, capture groups, and named groups.
          </p>

          <div className="mt-4 space-y-4">
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
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-900">
                      Capture Groups
                    </div>

                    <div className="mt-2 grid gap-2 md:grid-cols-2">
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
                  </div>
                )}

                {Object.keys(match.namedGroups).length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-900">
                      Named Groups
                    </div>

                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {Object.entries(match.namedGroups).map(([name, value]) => (
                        <div
                          key={`${match.index}-${name}`}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                        >
                          <div className="text-xs font-semibold text-gray-500">
                            {name}
                          </div>

                          <div className="mt-1 break-words font-mono text-xs text-gray-900">
                            {value || "(empty)"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {replacementMode === "enabled" && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Replacement Preview
          </h3>

          <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
            {replacementOutput || "Replacement output will appear here."}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Match Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Regex match results will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Regex testing happens directly in your browser. Your pattern and test
        text are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Testing Regular Expressions Against Real Text
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Regular expressions are powerful, but they are easy to get wrong
            when you cannot see exactly what the pattern matches. A regex can
            pass over the wrong text, miss expected values, or capture groups in
            a different way than you intended.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Regex Match Tester lets you enter a JavaScript-style regular
            expression, toggle common flags, test against sample text, inspect
            match indexes, review capture groups, preview replacements, and copy
            structured match results for debugging or documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Debugging Regex Patterns Without Guesswork
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a regex pattern without the surrounding slash characters.</li>
            <li>Choose flags such as global, ignore case, multiline, or dot all.</li>
            <li>Paste the text you want to test.</li>
            <li>Review highlighted matches, indexes, capture groups, and named groups.</li>
            <li>Copy the results or enable replacement preview when needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Regex Match Tester Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing validation patterns for emails, URLs, IDs, and codes.</li>
            <li>Debugging capture groups before using regex in code.</li>
            <li>Extracting values from logs, API responses, or pasted text.</li>
            <li>Checking multiline matching behavior before using a pattern.</li>
            <li>Previewing replacements with JavaScript replacement syntax.</li>
            <li>Documenting regex examples with sample input and expected matches.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Regex Match
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
            Understanding Regex Flags
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Regex flags change how the same pattern behaves. The global flag
            finds all matches. Ignore case allows uppercase and lowercase
            variants. Multiline changes how line anchors behave. Dot all allows
            the dot character to match line breaks. Unicode mode improves
            behavior with Unicode-aware patterns.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Testing flags together is important because a pattern that works on
            one line may behave differently across a long text block, log file,
            or copied API response.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a regex match tester?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A regex match tester checks a regular expression against sample
                text and shows which parts of the text match the pattern.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I include slash characters around the pattern?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Enter only the pattern body. For example, use \d+ instead of
                /\d+/g, then select flags separately using the checkboxes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support capture groups?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The match details section shows numbered capture groups and
                named capture groups when your pattern includes them.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I preview replacements?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Enable replacement preview and enter replacement text. The
                tool uses JavaScript replacement behavior, including references
                such as $1 when applicable.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do I only see one match?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Enable the global flag to find every match. Without global
                matching, JavaScript regular expressions usually stop after the
                first match.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my regex or test text uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Regex testing happens directly in your browser, and your
                pattern and test text are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
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

function createRegex(pattern: string, flags: string[]) {
  if (!pattern) {
    return null;
  }

  const uniqueFlags = Array.from(new Set(flags)).join("");

  return new RegExp(pattern, uniqueFlags);
}

function ensureGlobalRegex(regex: RegExp) {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  return new RegExp(regex.source, flags);
}

function findRegexMatches(regex: RegExp, text: string): RegexMatch[] {
  if (!regex || !text) {
    return [];
  }

  const searchRegex = ensureGlobalRegex(regex);
  const matches: RegexMatch[] = [];
  let match: RegExpExecArray | null;
  let safetyCounter = 0;

  while ((match = searchRegex.exec(text)) !== null) {
    const value = match[0];
    const index = match.index;
    const groups = match.slice(1).map((group) => group ?? "");
    const namedGroups = match.groups ? { ...match.groups } : {};

    matches.push({
      value,
      index,
      endIndex: index + value.length,
      groups,
      namedGroups,
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

function formatMatchOutput({
  pattern,
  flags,
  matches,
  outputFormat,
  replacementOutput,
  replacementMode,
}: {
  pattern: string;
  flags: string;
  matches: RegexMatch[];
  outputFormat: OutputFormat;
  replacementOutput: string;
  replacementMode: ReplacementMode;
}) {
  if (outputFormat === "json") {
    return JSON.stringify(
      {
        pattern,
        flags,
        matchCount: matches.length,
        matches,
        replacement:
          replacementMode === "enabled" ? replacementOutput : undefined,
      },
      null,
      2
    );
  }

  if (outputFormat === "list") {
    if (matches.length === 0) {
      return "No matches found.";
    }

    return matches.map((match) => match.value).join("\n");
  }

  return [
    `Pattern: /${pattern}/${flags}`,
    `Matches: ${matches.length}`,
    "",
    ...matches.map(
      (match, index) =>
        `Match ${index + 1}: ${match.value}\nIndex: ${match.index} - ${match.endIndex}${
          match.groups.length > 0
            ? `\nGroups: ${match.groups
                .map((group, groupIndex) => `${groupIndex + 1}=${group}`)
                .join(", ")}`
            : ""
        }`
    ),
    replacementMode === "enabled" ? "" : "",
    replacementMode === "enabled" ? "Replacement Preview:" : "",
    replacementMode === "enabled" ? replacementOutput : "",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}
