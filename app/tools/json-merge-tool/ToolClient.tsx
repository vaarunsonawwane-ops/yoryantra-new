"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type MergeMode = "deep" | "shallow" | "leftOnly" | "rightOnly";
type ConflictMode = "rightWins" | "leftWins" | "keepBoth" | "reportOnly";
type ArrayMode = "replace" | "concat" | "uniqueConcat" | "mergeByIndex";
type OutputMode = "merged" | "summary" | "report" | "json" | "markdown";

type MergeConflict = {
  path: string;
  leftValue: unknown;
  rightValue: unknown;
  resolution: string;
};

type MergeIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type MergeResult = {
  merged: unknown;
  conflicts: MergeConflict[];
  issues: MergeIssue[];
  output: string;
  leftSize: number;
  rightSize: number;
  mergedSize: number;
  conflictCount: number;
  addedKeys: number;
  overwrittenKeys: number;
  arrayMerges: number;
};

type MergeNote = {
  title: string;
  message: string;
};

const sampleLeft = `{
  "name": "Yoryantra",
  "version": 1,
  "settings": {
    "theme": "light",
    "ads": false,
    "features": ["json", "csv"]
  },
  "limits": {
    "maxTools": 150
  }
}`;

const sampleRight = `{
  "version": 2,
  "settings": {
    "ads": true,
    "layout": "clean",
    "features": ["seo", "devops"]
  },
  "limits": {
    "maxTools": 250,
    "dailyBuilds": 20
  },
  "published": true
}`;

export default function ToolClient() {
  const [leftJson, setLeftJson] = useState("");
  const [rightJson, setRightJson] = useState("");
  const [mergeMode, setMergeMode] = useState<MergeMode>("deep");
  const [conflictMode, setConflictMode] = useState<ConflictMode>("rightWins");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("replace");
  const [outputMode, setOutputMode] = useState<OutputMode>("merged");
  const [prettyOutput, setPrettyOutput] = useState(true);
  const [sortKeys, setSortKeys] = useState(false);
  const [includeConflictReport, setIncludeConflictReport] = useState(true);
  const [ignoreNullValues, setIgnoreNullValues] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getMergeNotes(result) : []), [result]);

  const mergeJson = () => {
    if (!leftJson.trim() || !rightJson.trim()) {
      setError("Please enter both left JSON and right JSON.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = buildMergeResult(leftJson, rightJson, {
        mergeMode,
        conflictMode,
        arrayMode,
        outputMode,
        prettyOutput,
        sortKeys,
        includeConflictReport,
        ignoreNullValues,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to merge these JSON values."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
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
    setLeftJson(sampleLeft);
    setRightJson(sampleRight);
    setMergeMode("deep");
    setConflictMode("rightWins");
    setArrayMode("replace");
    setOutputMode("merged");
    setPrettyOutput(true);
    setSortKeys(false);
    setIncludeConflictReport(true);
    setIgnoreNullValues(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setLeftJson("");
    setRightJson("");
    setMergeMode("deep");
    setConflictMode("rightWins");
    setArrayMode("replace");
    setOutputMode("merged");
    setPrettyOutput(true);
    setSortKeys(false);
    setIncludeConflictReport(true);
    setIgnoreNullValues(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON Merge Tool"
      description="Merge two JSON objects directly in your browser. Supports shallow merge, deep merge, array handling, conflict detection, overwrite rules, clean output, reports, and JSON merge summaries."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Left JSON
          </label>

          <textarea
            value={leftJson}
            onChange={(event) => {
              setLeftJson(event.target.value);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={sampleLeft}
            className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste the base JSON object or first JSON value.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Right JSON
          </label>

          <textarea
            value={rightJson}
            onChange={(event) => {
              setRightJson(event.target.value);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={sampleRight}
            className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste the override JSON object or second JSON value.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Merge Type"
            value={mergeMode}
            onChange={(value) => {
              setMergeMode(value as MergeMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Deep merge", value: "deep" },
              { label: "Shallow merge", value: "shallow" },
              { label: "Left only", value: "leftOnly" },
              { label: "Right only", value: "rightOnly" },
            ]}
          />

          <YoryantraSelect
            label="Conflicts"
            value={conflictMode}
            onChange={(value) => {
              setConflictMode(value as ConflictMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Right wins", value: "rightWins" },
              { label: "Left wins", value: "leftWins" },
              { label: "Keep both as array", value: "keepBoth" },
              { label: "Report only", value: "reportOnly" },
            ]}
          />

          <YoryantraSelect
            label="Arrays"
            value={arrayMode}
            onChange={(value) => {
              setArrayMode(value as ArrayMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Replace arrays", value: "replace" },
              { label: "Concatenate arrays", value: "concat" },
              { label: "Unique concatenate", value: "uniqueConcat" },
              { label: "Merge by index", value: "mergeByIndex" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Merged JSON", value: "merged" },
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "Full JSON result", value: "json" },
              { label: "Markdown table", value: "markdown" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={prettyOutput}
                onChange={(event) => {
                  setPrettyOutput(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Pretty-print JSON output
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(event) => {
                  setSortKeys(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Sort object keys in merged output
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={includeConflictReport}
                onChange={(event) => {
                  setIncludeConflictReport(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Include conflict report
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={ignoreNullValues}
                onChange={(event) => {
                  setIgnoreNullValues(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Ignore null values from right JSON
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Merges two JSON values with configurable overwrite rules, array handling,
          conflict reporting, sorted keys, and clean browser-only output.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={mergeJson} className="yoryantra-btn">
          Merge JSON
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
          <SummaryCard label="Conflicts" value={result.conflictCount.toLocaleString()} />
          <SummaryCard label="Added Keys" value={result.addedKeys.toLocaleString()} />
          <SummaryCard label="Overwritten" value={result.overwrittenKeys.toLocaleString()} />
          <SummaryCard label="Array Merges" value={result.arrayMerges.toLocaleString()} />
        </div>
      )}

      {result && result.conflicts.length > 0 && includeConflictReport && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Merge Conflicts
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Paths where both JSON values had different values.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Path</th>
                  <th className="px-4 py-3 font-semibold">Left</th>
                  <th className="px-4 py-3 font-semibold">Right</th>
                  <th className="px-4 py-3 font-semibold">Resolution</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.conflicts.slice(0, 100).map((conflict, index) => (
                  <tr key={`${conflict.path}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      {conflict.path || "/"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[260px] break-words">
                        {stringifyShort(conflict.leftValue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[260px] break-words">
                        {stringifyShort(conflict.rightValue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {conflict.resolution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.conflicts.length > 100 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 100 conflicts. Copy the output for the full result.
            </p>
          )}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Merge findings
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {issue.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {issue.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            JSON merge guidance
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Merged JSON output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JSON merging happens directly in your browser. Your JSON data is not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Merging Two JSON Objects Without Losing Important Changes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON merge tasks come up often when combining configuration files,
            API payloads, test fixtures, export data, and environment-specific
            settings. A simple copy-paste merge can accidentally overwrite nested
            fields or replace arrays in a way that is hard to notice.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Merge Tool lets you combine two JSON values with deep merge,
            shallow merge, configurable conflict handling, array options, and a
            conflict report so you can see what changed before using the merged
            result.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the JSON Merge Tool
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the base JSON into the left input box.</li>
            <li>Paste the override or second JSON into the right input box.</li>
            <li>Choose deep merge, shallow merge, or one-side output.</li>
            <li>Select how conflicts and arrays should be handled.</li>
            <li>Copy the merged JSON, summary, report, JSON result, or Markdown table.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON Merge Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Merging base and environment-specific configuration files.</li>
            <li>Combining API response examples for documentation or tests.</li>
            <li>Adding override settings without rewriting the full JSON object.</li>
            <li>Checking conflicts before merging JSON manually.</li>
            <li>Combining arrays with replace, concat, unique concat, or index merge rules.</li>
            <li>Creating clean merged JSON for fixtures, scripts, and data reviews.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Merge
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Left:  { "settings": { "theme": "light", "ads": false } }
Right: { "settings": { "ads": true, "layout": "clean" } }

Merged:
{
  "settings": {
    "theme": "light",
    "ads": true,
    "layout": "clean"
  }
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Deep Merge vs Shallow Merge
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A shallow merge only combines the top-level keys. If both objects
            contain the same nested object key, the right value usually replaces
            the left value. A deep merge goes inside nested objects and merges
            their keys too.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Deep merge is often better for configuration files. Shallow merge can
            be useful when you intentionally want top-level sections to be
            replaced as whole values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a JSON Merge Tool do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It combines two JSON values and lets you control how conflicts,
                nested objects, arrays, and null values should be handled.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this different from JSON Diff Checker?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. A diff checker shows differences. A merge tool creates a new
                combined JSON result.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can it merge arrays?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Arrays can be replaced, concatenated, uniquely concatenated,
                or merged by index.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What happens when the same key exists on both sides?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                You can choose whether the right value wins, the left value wins,
                both values are kept as an array, or conflicts are only reported.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The merge runs directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-patch-generator" className="yoryantra-btn-outline">
              JSON Patch Generator
            </Link>

            <Link href="/tools/json-diff-checker" className="yoryantra-btn-outline">
              JSON Diff Checker
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/json-flatten-unflatten-tool" className="yoryantra-btn-outline">
              JSON Flatten / Unflatten Tool
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

function buildMergeResult(
  leftText: string,
  rightText: string,
  options: {
    mergeMode: MergeMode;
    conflictMode: ConflictMode;
    arrayMode: ArrayMode;
    outputMode: OutputMode;
    prettyOutput: boolean;
    sortKeys: boolean;
    includeConflictReport: boolean;
    ignoreNullValues: boolean;
  }
): MergeResult {
  const left = parseJsonInput(leftText, "left");
  const right = parseJsonInput(rightText, "right");
  const conflicts: MergeConflict[] = [];
  const counters = {
    addedKeys: 0,
    overwrittenKeys: 0,
    arrayMerges: 0,
  };

  let merged: unknown;

  if (options.mergeMode === "leftOnly") {
    merged = left;
  } else if (options.mergeMode === "rightOnly") {
    merged = right;
  } else if (options.mergeMode === "shallow") {
    merged = shallowMerge(left, right, options, conflicts, counters);
  } else {
    merged = deepMerge(left, right, "", options, conflicts, counters);
  }

  if (options.sortKeys) {
    merged = sortObjectKeys(merged);
  }

  const issues = getMergeIssues(conflicts, counters, options);
  const mergedString = stringifyJson(merged, options.prettyOutput);

  const base = {
    merged,
    conflicts,
    issues,
    leftSize: leftText.length,
    rightSize: rightText.length,
    mergedSize: mergedString.length,
    conflictCount: conflicts.length,
    addedKeys: counters.addedKeys,
    overwrittenKeys: counters.overwrittenKeys,
    arrayMerges: counters.arrayMerges,
  };
  const output = formatOutput(base, options);

  return {
    ...base,
    output,
  };
}

function parseJsonInput(text: string, label: string) {
  try {
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Invalid ${label} JSON: ${err.message}`);
    }

    throw new Error(`Invalid ${label} JSON.`);
  }
}

function shallowMerge(
  left: unknown,
  right: unknown,
  options: {
    conflictMode: ConflictMode;
    ignoreNullValues: boolean;
  },
  conflicts: MergeConflict[],
  counters: {
    addedKeys: number;
    overwrittenKeys: number;
    arrayMerges: number;
  }
) {
  if (!isPlainObject(left) || !isPlainObject(right)) {
    if (!valuesEqual(left, right)) {
      conflicts.push({
        path: "",
        leftValue: left,
        rightValue: right,
        resolution: getConflictResolution(options.conflictMode),
      });
      counters.overwrittenKeys += options.conflictMode === "rightWins" ? 1 : 0;
    }

    return resolveConflict(left, right, options.conflictMode);
  }

  const result: Record<string, unknown> = {
    ...(left as Record<string, unknown>),
  };
  const rightObject = right as Record<string, unknown>;

  Object.keys(rightObject).forEach((key) => {
    if (options.ignoreNullValues && rightObject[key] === null) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(result, key)) {
      if (!valuesEqual(result[key], rightObject[key])) {
        conflicts.push({
          path: joinPointer("", key),
          leftValue: result[key],
          rightValue: rightObject[key],
          resolution: getConflictResolution(options.conflictMode),
        });
        counters.overwrittenKeys += options.conflictMode === "rightWins" ? 1 : 0;
        result[key] = resolveConflict(result[key], rightObject[key], options.conflictMode);
      }
    } else {
      counters.addedKeys += 1;
      result[key] = rightObject[key];
    }
  });

  return result;
}

function deepMerge(
  left: unknown,
  right: unknown,
  path: string,
  options: {
    conflictMode: ConflictMode;
    arrayMode: ArrayMode;
    ignoreNullValues: boolean;
  },
  conflicts: MergeConflict[],
  counters: {
    addedKeys: number;
    overwrittenKeys: number;
    arrayMerges: number;
  }
): unknown {
  if (options.ignoreNullValues && right === null) {
    return left;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    counters.arrayMerges += 1;
    return mergeArrays(left, right, path, options, conflicts, counters);
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const result: Record<string, unknown> = {
      ...(left as Record<string, unknown>),
    };
    const rightObject = right as Record<string, unknown>;

    Object.keys(rightObject).forEach((key) => {
      if (options.ignoreNullValues && rightObject[key] === null) {
        return;
      }

      const childPath = joinPointer(path, key);

      if (Object.prototype.hasOwnProperty.call(result, key)) {
        result[key] = deepMerge(result[key], rightObject[key], childPath, options, conflicts, counters);
      } else {
        counters.addedKeys += 1;
        result[key] = rightObject[key];
      }
    });

    return result;
  }

  if (!valuesEqual(left, right)) {
    conflicts.push({
      path,
      leftValue: left,
      rightValue: right,
      resolution: getConflictResolution(options.conflictMode),
    });

    if (options.conflictMode === "rightWins") {
      counters.overwrittenKeys += 1;
    }
  }

  return resolveConflict(left, right, options.conflictMode);
}

function mergeArrays(
  left: unknown[],
  right: unknown[],
  path: string,
  options: {
    conflictMode: ConflictMode;
    arrayMode: ArrayMode;
    ignoreNullValues: boolean;
  },
  conflicts: MergeConflict[],
  counters: {
    addedKeys: number;
    overwrittenKeys: number;
    arrayMerges: number;
  }
) {
  if (options.arrayMode === "concat") {
    return [...left, ...right];
  }

  if (options.arrayMode === "uniqueConcat") {
    const seen = new Set<string>();
    const merged: unknown[] = [];

    [...left, ...right].forEach((item) => {
      const key = stableStringify(item);

      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    });

    return merged;
  }

  if (options.arrayMode === "mergeByIndex") {
    const max = Math.max(left.length, right.length);
    const merged: unknown[] = [];

    for (let index = 0; index < max; index += 1) {
      if (index >= left.length) {
        counters.addedKeys += 1;
        merged[index] = right[index];
      } else if (index >= right.length) {
        merged[index] = left[index];
      } else {
        merged[index] = deepMerge(left[index], right[index], `${path}/${index}`, options, conflicts, counters);
      }
    }

    return merged;
  }

  if (!valuesEqual(left, right)) {
    conflicts.push({
      path,
      leftValue: left,
      rightValue: right,
      resolution: "right array replaced left array",
    });
    counters.overwrittenKeys += 1;
  }

  return right;
}

function resolveConflict(left: unknown, right: unknown, mode: ConflictMode) {
  if (mode === "leftWins" || mode === "reportOnly") {
    return left;
  }

  if (mode === "keepBoth") {
    return [left, right];
  }

  return right;
}

function getConflictResolution(mode: ConflictMode) {
  if (mode === "leftWins") {
    return "left value kept";
  }

  if (mode === "keepBoth") {
    return "both values kept as array";
  }

  if (mode === "reportOnly") {
    return "reported only, left value kept";
  }

  return "right value used";
}

function getMergeIssues(
  conflicts: MergeConflict[],
  counters: {
    addedKeys: number;
    overwrittenKeys: number;
    arrayMerges: number;
  },
  options: {
    conflictMode: ConflictMode;
    arrayMode: ArrayMode;
  }
): MergeIssue[] {
  const issues: MergeIssue[] = [];

  if (conflicts.length > 0) {
    issues.push({
      severity: "info",
      title: "Conflicts found",
      message: `${conflicts.length} path${conflicts.length === 1 ? "" : "s"} had different values on both sides.`,
    });
  }

  if (options.conflictMode === "reportOnly" && conflicts.length > 0) {
    issues.push({
      severity: "warning",
      title: "Report-only conflict mode",
      message: "Conflicts were reported, but right-side conflicting values were not applied.",
    });
  }

  if (options.arrayMode === "replace" && counters.arrayMerges > 0) {
    issues.push({
      severity: "info",
      title: "Arrays replaced",
      message: "Changed arrays were replaced by right-side arrays. Use concat or merge by index if that is not intended.",
    });
  }

  if (conflicts.length > 100) {
    issues.push({
      severity: "warning",
      title: "Large conflict set",
      message: "More than 100 conflicts were found. Review whether the files are too different for a safe merge.",
    });
  }

  return issues;
}

function valuesEqual(left: unknown, right: unknown) {
  return stableStringify(left) === stableStringify(right);
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function joinPointer(parent: string, key: string) {
  const escaped = key.replace(/~/g, "~0").replace(/\//g, "~1");
  return parent ? `${parent}/${escaped}` : `/${escaped}`;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (isPlainObject(value)) {
    const objectValue = value as Record<string, unknown>;
    return Object.keys(objectValue)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectKeys(objectValue[key]);
        return acc;
      }, {});
  }

  return value;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (isPlainObject(value)) {
    const objectValue = value as Record<string, unknown>;
    return `{${Object.keys(objectValue)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function formatOutput(
  result: Omit<MergeResult, "output">,
  options: {
    outputMode: OutputMode;
    prettyOutput: boolean;
    includeConflictReport: boolean;
  }
) {
  if (options.outputMode === "merged") {
    return stringifyJson(result.merged, options.prettyOutput);
  }

  if (options.outputMode === "json") {
    return stringifyJson(result, options.prettyOutput);
  }

  if (options.outputMode === "markdown") {
    const rows = result.conflicts.length
      ? result.conflicts.map((conflict) =>
          `| ${escapeMarkdown(conflict.path || "/")} | ${escapeMarkdown(stringifyShort(conflict.leftValue))} | ${escapeMarkdown(stringifyShort(conflict.rightValue))} | ${escapeMarkdown(conflict.resolution)} |`
        )
      : ["| - | - | - | No conflicts |"];

    return [
      "| Path | Left | Right | Resolution |",
      "| --- | --- | --- | --- |",
      ...rows,
    ].join("\n");
  }

  if (options.outputMode === "report") {
    const conflicts = result.conflicts.length && options.includeConflictReport
      ? result.conflicts.map((conflict, index) =>
          `${index + 1}. ${conflict.path || "/"}\n   left: ${stringifyShort(conflict.leftValue)}\n   right: ${stringifyShort(conflict.rightValue)}\n   resolution: ${conflict.resolution}`
        )
      : ["No conflicts found or conflict report disabled."];

    return [
      "JSON Merge Report",
      "-----------------",
      `Conflicts: ${result.conflictCount}`,
      `Added keys: ${result.addedKeys}`,
      `Overwritten keys: ${result.overwrittenKeys}`,
      `Array merges: ${result.arrayMerges}`,
      `Left input size: ${result.leftSize}`,
      `Right input size: ${result.rightSize}`,
      `Merged output size: ${result.mergedSize}`,
      "",
      "Conflicts:",
      ...conflicts,
      "",
      "Merged JSON:",
      stringifyJson(result.merged, options.prettyOutput),
    ].join("\n");
  }

  return [
    "JSON Merge Summary",
    "------------------",
    `Conflicts: ${result.conflictCount}`,
    `Added keys: ${result.addedKeys}`,
    `Overwritten keys: ${result.overwrittenKeys}`,
    `Array merges: ${result.arrayMerges}`,
    `Left input size: ${result.leftSize}`,
    `Right input size: ${result.rightSize}`,
    `Merged output size: ${result.mergedSize}`,
  ].join("\n");
}

function stringifyJson(value: unknown, pretty: boolean) {
  return JSON.stringify(value, null, pretty ? 2 : 0);
}

function stringifyShort(value: unknown) {
  const text = JSON.stringify(value);

  if (!text) {
    return String(value);
  }

  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getMergeNotes(result: MergeResult): MergeNote[] {
  const notes: MergeNote[] = [];

  if (result.conflictCount > 0) {
    notes.push({
      title: "Review merge conflicts",
      message:
        "Some paths had different values on both sides. Check the conflict table before using the merged JSON.",
    });
  }

  if (result.arrayMerges > 0) {
    notes.push({
      title: "Array handling matters",
      message:
        "Array merge behavior can change the final data shape. Confirm that the selected array mode matches your use case.",
    });
  }

  if (result.conflictCount === 0) {
    notes.push({
      title: "Clean merge",
      message:
        "No conflicting values were found with the selected merge settings.",
    });
  }

  return notes;
}
