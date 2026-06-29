"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "groupedJson" | "countsJson" | "markdown" | "csv" | "checklist";
type GroupMode = "exact" | "lowercase" | "trimmed" | "missing";
type SortMode = "countDesc" | "countAsc" | "keyAsc" | "keyDesc" | "sumDesc";
type MissingMode = "missingLabel" | "emptyLabel" | "skip";
type NumericMode = "sum" | "average" | "minmax" | "none";

type GroupRow = {
  key: string;
  displayKey: string;
  count: number;
  percentage: number;
  sum: number;
  average: number;
  min: number | null;
  max: number | null;
  records: unknown[];
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  groups: GroupRow[];
  issues: Issue[];
  inputLength: number;
  recordCount: number;
  groupCount: number;
  outputLength: number;
  detectedShape: string;
};

const sampleInput = `[
  {
    "tool": "JSON Formatter",
    "category": "JSON & Data",
    "status": "live",
    "views": 120
  },
  {
    "tool": "JSON Validator",
    "category": "JSON & Data",
    "status": "live",
    "views": 95
  },
  {
    "tool": "URL Encoder Decoder",
    "category": "Encoding",
    "status": "live",
    "views": 76
  },
  {
    "tool": "JSON Array Group By Tool",
    "category": "JSON & Data",
    "status": "new",
    "views": 0
  }
]`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [groupKey, setGroupKey] = useState("");
  const [numericKey, setNumericKey] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [groupMode, setGroupMode] = useState<GroupMode>("trimmed");
  const [sortMode, setSortMode] = useState<SortMode>("countDesc");
  const [missingMode, setMissingMode] = useState<MissingMode>("missingLabel");
  const [numericMode, setNumericMode] = useState<NumericMode>("none");
  const [flattenNestedObjects, setFlattenNestedObjects] = useState(true);
  const [includeRecordsInJson, setIncludeRecordsInJson] = useState(true);
  const [includePercentages, setIncludePercentages] = useState(true);
  const [limitRecordsPerGroup, setLimitRecordsPerGroup] = useState(false);
  const [sortKeysCaseInsensitive, setSortKeysCaseInsensitive] = useState(true);
  const [treatArraysAsJoinedText, setTreatArraysAsJoinedText] = useState(true);
  const [warnMissingKeys, setWarnMissingKeys] = useState(true);
  const [warnHighCardinality, setWarnHighCardinality] = useState(true);
  const [warnNonNumericSummary, setWarnNonNumericSummary] = useState(true);
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

  const processJson = () => {
    if (!input.trim()) {
      setError("Please paste a JSON array of records to group.");
      setResult(null);
      setOutput("");
      return;
    }

    if (!groupKey.trim()) {
      setError("Please enter the key or dot path to group by.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      groupKey,
      numericKey,
      outputMode,
      groupMode,
      sortMode,
      missingMode,
      numericMode,
      flattenNestedObjects,
      includeRecordsInJson,
      includePercentages,
      limitRecordsPerGroup,
      sortKeysCaseInsensitive,
      treatArraysAsJoinedText,
      warnMissingKeys,
      warnHighCardinality,
      warnNonNumericSummary,
    });

    if (next.output.startsWith("__ERROR__:")) {
      setError(next.output.replace("__ERROR__:", ""));
      setResult(next);
      setOutput("");
      setCopied(false);
      return;
    }

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
    setGroupKey("category");
    setNumericKey("views");
    setOutputMode("summary");
    setGroupMode("trimmed");
    setSortMode("countDesc");
    setMissingMode("missingLabel");
    setNumericMode("sum");
    setFlattenNestedObjects(true);
    setIncludeRecordsInJson(true);
    setIncludePercentages(true);
    setLimitRecordsPerGroup(false);
    setSortKeysCaseInsensitive(true);
    setTreatArraysAsJoinedText(true);
    setWarnMissingKeys(true);
    setWarnHighCardinality(true);
    setWarnNonNumericSummary(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setGroupKey("");
    setNumericKey("");
    setOutputMode("summary");
    setGroupMode("trimmed");
    setSortMode("countDesc");
    setMissingMode("missingLabel");
    setNumericMode("none");
    setFlattenNestedObjects(true);
    setIncludeRecordsInJson(true);
    setIncludePercentages(true);
    setLimitRecordsPerGroup(false);
    setSortKeysCaseInsensitive(true);
    setTreatArraysAsJoinedText(true);
    setWarnMissingKeys(true);
    setWarnHighCardinality(true);
    setWarnNonNumericSummary(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Array Group By Tool"
      description="Group JSON array records by a key or dot path, count records, summarize numeric fields, and export grouped JSON, Markdown, CSV, or checklist output locally."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Array of Records</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste an array of objects from an API response, export, log sample, analytics report, or small dataset.
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
          <h3 className="text-lg font-semibold text-gray-900">Grouping Settings</h3>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Group By Key</label>
              <input
                value={groupKey}
                onChange={(event) => {
                  setGroupKey(event.target.value);
                  clearResult();
                }}
                placeholder="category or user.role"
                className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
              <p className="mt-1 text-xs text-gray-500">Use a direct key or dot path such as category, status, user.role, or meta.source.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Numeric Field</label>
              <input
                value={numericKey}
                onChange={(event) => {
                  setNumericKey(event.target.value);
                  clearResult();
                }}
                placeholder="views, count, amount"
                className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Readable summary", value: "summary" },
                { label: "Grouped JSON", value: "groupedJson" },
                { label: "Counts JSON", value: "countsJson" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Group Value Handling"
              value={groupMode}
              onChange={(value) => {
                setGroupMode(value as GroupMode);
                clearResult();
              }}
              options={[
                { label: "Exact values", value: "exact" },
                { label: "Trim string values", value: "trimmed" },
                { label: "Lowercase string values", value: "lowercase" },
                { label: "Group missing values", value: "missing" },
              ]}
            />

            <YoryantraSelect
              label="Sort Groups"
              value={sortMode}
              onChange={(value) => {
                setSortMode(value as SortMode);
                clearResult();
              }}
              options={[
                { label: "Count high to low", value: "countDesc" },
                { label: "Count low to high", value: "countAsc" },
                { label: "Key A to Z", value: "keyAsc" },
                { label: "Key Z to A", value: "keyDesc" },
                { label: "Numeric sum high to low", value: "sumDesc" },
              ]}
            />

            <YoryantraSelect
              label="Missing Group Key"
              value={missingMode}
              onChange={(value) => {
                setMissingMode(value as MissingMode);
                clearResult();
              }}
              options={[
                { label: "Use (missing)", value: "missingLabel" },
                { label: "Use (empty)", value: "emptyLabel" },
                { label: "Skip missing records", value: "skip" },
              ]}
            />

            <YoryantraSelect
              label="Numeric Summary"
              value={numericMode}
              onChange={(value) => {
                setNumericMode(value as NumericMode);
                clearResult();
              }}
              options={[
                { label: "Sum numeric field", value: "sum" },
                { label: "Average numeric field", value: "average" },
                { label: "Min and max", value: "minmax" },
                { label: "No numeric summary", value: "none" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={flattenNestedObjects} onChange={setFlattenNestedObjects} label="Flatten nested objects for dot-path grouping" />
          <Toggle checked={includeRecordsInJson} onChange={setIncludeRecordsInJson} label="Include records in grouped JSON output" />
          <Toggle checked={includePercentages} onChange={setIncludePercentages} label="Include group percentages" />
          <Toggle checked={limitRecordsPerGroup} onChange={setLimitRecordsPerGroup} label="Limit grouped records to first 25 per group" />
          <Toggle checked={sortKeysCaseInsensitive} onChange={setSortKeysCaseInsensitive} label="Sort group keys case-insensitively" />
          <Toggle checked={treatArraysAsJoinedText} onChange={setTreatArraysAsJoinedText} label="Treat arrays as joined group text" />
          <Toggle checked={warnMissingKeys} onChange={setWarnMissingKeys} label="Warn about missing group keys" />
          <Toggle checked={warnHighCardinality} onChange={setWarnHighCardinality} label="Warn when too many groups are created" />
          <Toggle checked={warnNonNumericSummary} onChange={setWarnNonNumericSummary} label="Warn when numeric summary skips values" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options keep grouped output easier to inspect while still preserving enough detail for API responses, reports, and data cleanup.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processJson}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Group JSON Array
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
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
                <p className="mt-1 text-sm text-gray-500">Grouped summary, JSON, Markdown, CSV, or checklist output.</p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Records" value={String(result.recordCount)} />
            <StatCard label="Groups" value={String(result.groupCount)} />
            <StatCard label="Detected shape" value={result.detectedShape} />
            <StatCard label="Output size" value={`${result.outputLength.toLocaleString()} chars`} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result?.groups.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Group Preview</h3>
          <p className="mt-1 text-sm text-gray-500">Review grouped keys, counts, percentages, and numeric summaries.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Group</th>
                  <th className="px-4 py-3 font-semibold">Count</th>
                  <th className="px-4 py-3 font-semibold">Percent</th>
                  <th className="px-4 py-3 font-semibold">Sum</th>
                  <th className="px-4 py-3 font-semibold">Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.groups.slice(0, 80).map((group) => (
                  <tr key={group.key}>
                    <td className="px-4 py-3 font-mono">{group.displayKey}</td>
                    <td className="px-4 py-3">{group.count}</td>
                    <td className="px-4 py-3">{group.percentage.toFixed(2)}%</td>
                    <td className="px-4 py-3">{formatNumber(group.sum)}</td>
                    <td className="px-4 py-3">{formatNumber(group.average)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.groups.length > 80 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 80 groups to keep the preview readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Grouping JSON Arrays Into Useful Summaries</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON arrays often contain many records with repeated categories, statuses, owners, types, sources, or tags. Grouping those records makes it easier to see counts, spot missing fields, and summarize numeric values without writing a quick script.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool groups an array of JSON objects by a selected key or dot path. It can count records, calculate percentages, summarize a numeric field, and export the result as readable text, grouped JSON, Markdown, CSV, or a checklist.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This JSON Group By Tool Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Summarizing API response records by status, type, category, source, owner, region, or any repeated field.</p>
            <p className="mt-2">Checking how many records belong to each group before converting data into a report or table.</p>
            <p className="mt-2">Finding missing grouping keys in exported JSON data before importing it elsewhere.</p>
            <p className="mt-2">Creating grouped JSON, Markdown summaries, or CSV reports from small datasets directly in the browser.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the JSON Array Group By Tool</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JSON array of records into the input box.</li>
            <li>Enter the key or dot path you want to group by, such as category, status, or user.role.</li>
            <li>Optionally enter a numeric field to summarize, such as views, count, amount, or duration.</li>
            <li>Choose sorting, missing-key handling, and output format.</li>
            <li>Review the group preview and copy the summary or exported data.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Grouped Summary</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`Group by: category
Records: 4
Groups: 2

JSON & Data
Count: 3
Percentage: 75.00%
Sum views: 215

Encoding
Count: 1
Percentage: 25.00%
Sum views: 76`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Grouping Is Best for Small and Medium JSON Samples</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This browser tool is useful for quick checks, pasted API responses, examples, and small exports. Very large datasets are better handled in a database, spreadsheet, or local script because grouping thousands of complex records can become slow and difficult to review in a browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does this JSON group by tool do?">
              It groups records in a JSON array by a selected key or dot path, then counts records and optionally summarizes a numeric field.
            </Faq>
            <Faq title="Can I group by nested fields?">
              Yes. Enable flattening and use dot paths like user.role, meta.source, or product.category.
            </Faq>
            <Faq title="Can this summarize numbers?">
              Yes. Enter a numeric field and choose sum, average, or min/max summary. Non-numeric values are skipped and can be reported in the notes.
            </Faq>
            <Faq title="What happens when a record is missing the group key?">
              You can label missing records as (missing), label them as (empty), or skip them depending on the setting.
            </Faq>
            <Faq title="Is anything uploaded while grouping JSON?">
              No. The grouping runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-array-group-by-tool" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  groupKey: string;
  numericKey: string;
  outputMode: OutputMode;
  groupMode: GroupMode;
  sortMode: SortMode;
  missingMode: MissingMode;
  numericMode: NumericMode;
  flattenNestedObjects: boolean;
  includeRecordsInJson: boolean;
  includePercentages: boolean;
  limitRecordsPerGroup: boolean;
  sortKeysCaseInsensitive: boolean;
  treatArraysAsJoinedText: boolean;
  warnMissingKeys: boolean;
  warnHighCardinality: boolean;
  warnNonNumericSummary: boolean;
}): Result {
  let parsed: unknown;

  try {
    parsed = JSON.parse(options.input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON input.";
    return emptyResult(`__ERROR__:The input is not valid JSON: ${message}`, options.input.length);
  }

  if (!Array.isArray(parsed)) {
    return emptyResult("__ERROR__:Please paste a JSON array. This tool groups arrays of records.", options.input.length);
  }

  const records = parsed.map((record) => options.flattenNestedObjects ? flattenRecord(record) : record);
  const groups = buildGroups(records, options);
  const sortedGroups = sortGroups(groups, options);
  const issues = buildIssues(records, sortedGroups, options);
  const output = formatOutput(sortedGroups, issues, records.length, options);

  return {
    output,
    groups: sortedGroups,
    issues,
    inputLength: options.input.length,
    recordCount: records.length,
    groupCount: sortedGroups.length,
    outputLength: output.length,
    detectedShape: "JSON array",
  };
}

function emptyResult(output: string, inputLength: number): Result {
  return {
    output,
    groups: [],
    issues: [],
    inputLength,
    recordCount: 0,
    groupCount: 0,
    outputLength: 0,
    detectedShape: "invalid or unsupported JSON",
  };
}

function buildGroups(records: unknown[], options: {
  groupKey: string;
  numericKey: string;
  groupMode: GroupMode;
  missingMode: MissingMode;
  numericMode: NumericMode;
  treatArraysAsJoinedText: boolean;
  limitRecordsPerGroup: boolean;
}) {
  const map = new Map<string, GroupRow>();
  let includedCount = 0;

  records.forEach((record) => {
    const groupValue = readPath(record, options.groupKey);
    const normalized = normalizeGroupValue(groupValue, options);

    if (normalized === null && options.missingMode === "skip") {
      return;
    }

    const displayKey = normalized ?? (options.missingMode === "emptyLabel" ? "(empty)" : "(missing)");
    const key = String(displayKey);
    const numericValue = readPath(record, options.numericKey);
    const numberValue = typeof numericValue === "number" && Number.isFinite(numericValue) ? numericValue : null;

    if (!map.has(key)) {
      map.set(key, {
        key,
        displayKey: key,
        count: 0,
        percentage: 0,
        sum: 0,
        average: 0,
        min: null,
        max: null,
        records: [],
      });
    }

    const group = map.get(key)!;
    group.count += 1;
    if (!options.limitRecordsPerGroup || group.records.length < 25) {
      group.records.push(record);
    }

    if (numberValue !== null && options.numericMode !== "none") {
      group.sum += numberValue;
      group.min = group.min === null ? numberValue : Math.min(group.min, numberValue);
      group.max = group.max === null ? numberValue : Math.max(group.max, numberValue);
    }

    includedCount += 1;
  });

  const groups = Array.from(map.values());
  groups.forEach((group) => {
    group.percentage = includedCount ? (group.count / includedCount) * 100 : 0;
    group.average = group.count ? group.sum / group.count : 0;
  });

  return groups;
}

function normalizeGroupValue(value: unknown, options: {
  groupMode: GroupMode;
  treatArraysAsJoinedText: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;

  let text = "";
  if (Array.isArray(value)) {
    text = options.treatArraysAsJoinedText ? value.map(String).join(", ") : JSON.stringify(value);
  } else if (typeof value === "object") {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  if (options.groupMode === "trimmed") text = text.trim();
  if (options.groupMode === "lowercase") text = text.trim().toLowerCase();

  return text || null;
}

function sortGroups(groups: GroupRow[], options: {
  sortMode: SortMode;
  sortKeysCaseInsensitive: boolean;
}) {
  const keyCompare = (a: GroupRow, b: GroupRow) => {
    const left = options.sortKeysCaseInsensitive ? a.displayKey.toLowerCase() : a.displayKey;
    const right = options.sortKeysCaseInsensitive ? b.displayKey.toLowerCase() : b.displayKey;
    return left.localeCompare(right);
  };

  return [...groups].sort((a, b) => {
    if (options.sortMode === "countAsc") return a.count - b.count || keyCompare(a, b);
    if (options.sortMode === "keyAsc") return keyCompare(a, b);
    if (options.sortMode === "keyDesc") return keyCompare(b, a);
    if (options.sortMode === "sumDesc") return b.sum - a.sum || keyCompare(a, b);
    return b.count - a.count || keyCompare(a, b);
  });
}

function formatOutput(groups: GroupRow[], issues: Issue[], recordCount: number, options: {
  outputMode: OutputMode;
  groupKey: string;
  numericKey: string;
  numericMode: NumericMode;
  includeRecordsInJson: boolean;
  includePercentages: boolean;
}) {
  if (options.outputMode === "groupedJson") {
    return JSON.stringify(groups.map((group) => ({
      key: group.displayKey,
      count: group.count,
      percentage: options.includePercentages ? group.percentage : undefined,
      numeric: numericSummary(group, options.numericMode, options.numericKey),
      records: options.includeRecordsInJson ? group.records : undefined,
    })), null, 2);
  }

  if (options.outputMode === "countsJson") {
    return JSON.stringify(groups.reduce<Record<string, unknown>>((acc, group) => {
      acc[group.displayKey] = {
        count: group.count,
        percentage: options.includePercentages ? group.percentage : undefined,
        numeric: numericSummary(group, options.numericMode, options.numericKey),
      };
      return acc;
    }, {}), null, 2);
  }

  if (options.outputMode === "markdown") {
    return buildMarkdown(groups, issues, options);
  }

  if (options.outputMode === "csv") {
    return buildCsv(groups, options);
  }

  if (options.outputMode === "checklist") {
    return buildChecklist(groups, issues, recordCount);
  }

  return buildSummary(groups, issues, recordCount, options);
}

function buildSummary(groups: GroupRow[], issues: Issue[], recordCount: number, options: {
  groupKey: string;
  numericKey: string;
  numericMode: NumericMode;
  includePercentages: boolean;
}) {
  const lines = [
    `Group by: ${options.groupKey}`,
    `Records: ${recordCount}`,
    `Groups: ${groups.length}`,
    "",
  ];

  groups.forEach((group) => {
    lines.push(group.displayKey);
    lines.push(`Count: ${group.count}`);
    if (options.includePercentages) lines.push(`Percentage: ${group.percentage.toFixed(2)}%`);
    if (options.numericMode !== "none" && options.numericKey.trim()) {
      const summary = numericSummary(group, options.numericMode, options.numericKey);
      Object.entries(summary).forEach(([key, value]) => {
        lines.push(`${key}: ${formatNumber(Number(value))}`);
      });
    }
    lines.push("");
  });

  if (issues.length) {
    lines.push("Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n").trim();
}

function buildMarkdown(groups: GroupRow[], issues: Issue[], options: {
  numericMode: NumericMode;
  numericKey: string;
  includePercentages: boolean;
}) {
  const headers = ["Group", "Count"];
  if (options.includePercentages) headers.push("Percentage");
  if (options.numericMode !== "none" && options.numericKey.trim()) {
    if (options.numericMode === "sum") headers.push(`Sum ${options.numericKey}`);
    if (options.numericMode === "average") headers.push(`Average ${options.numericKey}`);
    if (options.numericMode === "minmax") headers.push(`Min ${options.numericKey}`, `Max ${options.numericKey}`);
  }

  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];

  groups.forEach((group) => {
    const row = [escapeMarkdown(group.displayKey), String(group.count)];
    if (options.includePercentages) row.push(`${group.percentage.toFixed(2)}%`);
    if (options.numericMode === "sum") row.push(formatNumber(group.sum));
    if (options.numericMode === "average") row.push(formatNumber(group.average));
    if (options.numericMode === "minmax") row.push(group.min === null ? "" : formatNumber(group.min), group.max === null ? "" : formatNumber(group.max));
    lines.push(`| ${row.join(" | ")} |`);
  });

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function buildCsv(groups: GroupRow[], options: {
  numericMode: NumericMode;
  numericKey: string;
  includePercentages: boolean;
}) {
  const headers = ["group", "count"];
  if (options.includePercentages) headers.push("percentage");
  if (options.numericMode !== "none" && options.numericKey.trim()) headers.push("sum", "average", "min", "max");

  const rows = [headers];
  groups.forEach((group) => {
    const row = [group.displayKey, String(group.count)];
    if (options.includePercentages) row.push(group.percentage.toFixed(2));
    if (options.numericMode !== "none" && options.numericKey.trim()) {
      row.push(formatNumber(group.sum), formatNumber(group.average), group.min === null ? "" : formatNumber(group.min), group.max === null ? "" : formatNumber(group.max));
    }
    rows.push(row);
  });

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildChecklist(groups: GroupRow[], issues: Issue[], recordCount: number) {
  const lines = [
    "# JSON Group By Checklist",
    "",
    `- [${recordCount ? "x" : " "}] Parsed ${recordCount} record${recordCount === 1 ? "" : "s"}.`,
    `- [${groups.length ? "x" : " "}] Created ${groups.length} group${groups.length === 1 ? "" : "s"}.`,
    `- [${groups.length <= 50 ? "x" : " "}] Group count is manageable for manual review.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function numericSummary(group: GroupRow, mode: NumericMode, numericKey: string) {
  if (mode === "none" || !numericKey.trim()) return {};
  if (mode === "average") return { [`Average ${numericKey}`]: group.average };
  if (mode === "minmax") return { [`Min ${numericKey}`]: group.min, [`Max ${numericKey}`]: group.max };
  return { [`Sum ${numericKey}`]: group.sum };
}

function buildIssues(records: unknown[], groups: GroupRow[], options: {
  groupKey: string;
  numericKey: string;
  missingMode: MissingMode;
  numericMode: NumericMode;
  warnMissingKeys: boolean;
  warnHighCardinality: boolean;
  warnNonNumericSummary: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnMissingKeys) {
    const missingCount = records.filter((record) => readPath(record, options.groupKey) === undefined || readPath(record, options.groupKey) === null || readPath(record, options.groupKey) === "").length;
    if (missingCount && options.missingMode !== "skip") {
      issues.push({
        severity: "warning",
        title: "Missing group keys",
        message: `${missingCount} record${missingCount === 1 ? "" : "s"} are missing the selected group key.`,
      });
    }
  }

  if (options.warnHighCardinality && groups.length > Math.max(20, records.length * 0.6)) {
    issues.push({
      severity: "info",
      title: "Many groups created",
      message: "The selected key creates many groups. You may be grouping by a unique ID instead of a category-like field.",
    });
  }

  if (options.warnNonNumericSummary && options.numericMode !== "none" && options.numericKey.trim()) {
    const nonNumeric = records.filter((record) => {
      const value = readPath(record, options.numericKey);
      return value !== undefined && value !== null && (typeof value !== "number" || !Number.isFinite(value));
    }).length;

    if (nonNumeric) {
      issues.push({
        severity: "info",
        title: "Non-numeric values skipped",
        message: `${nonNumeric} value${nonNumeric === 1 ? "" : "s"} in the numeric field were not finite numbers and were skipped in numeric summaries.`,
      });
    }
  }

  return issues;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.recordCount > 1000) {
    notes.push({
      severity: "info",
      title: "Large JSON array",
      message: "This tool is best for quick browser-side grouping. Very large datasets may be better handled in a database, spreadsheet, or local script.",
    });
  }

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated grouped output is large. Consider CSV or counts JSON if you only need a compact summary.",
    });
  }

  return notes;
}

function flattenRecord(value: unknown, prefix = ""): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    if (prefix) output[prefix] = value;
    return output;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      Object.assign(output, flattenRecord(item, path));
    } else {
      output[path] = item;
    }
  });

  return output;
}

function readPath(value: unknown, path: string): unknown {
  if (!path.trim()) return undefined;
  const direct = value && typeof value === "object" ? (value as Record<string, unknown>)[path] : undefined;
  if (direct !== undefined) return direct;

  return path.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && Object.prototype.hasOwnProperty.call(current as Record<string, unknown>, part)) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, value);
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
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
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
