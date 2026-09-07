"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "groupedJson" | "countsJson" | "markdown" | "csv" | "checklist";
type GroupMode = "exact" | "lowercase" | "trimmed";
type SortMode = "countDesc" | "countAsc" | "keyAsc" | "keyDesc" | "sumDesc";
type MissingMode = "missingLabel" | "emptyLabel" | "skip";
type NumericMode = "sum" | "average" | "minmax" | "none";

type GroupRow = {
  key: string;
  displayKey: string;
  valueType: string;
  count: number;
  percentage: number;
  numericCount: number;
  sum: number;
  average: number | null;
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
  const [includeRecordsInJson, setIncludeRecordsInJson] = useState(true);
  const [includePercentages, setIncludePercentages] = useState(true);
  const [limitRecordsPerGroup, setLimitRecordsPerGroup] = useState(false);
  const [sortKeysCaseInsensitive, setSortKeysCaseInsensitive] = useState(true);
  const [treatArraysAsJoinedText, setTreatArraysAsJoinedText] = useState(false);
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
    setIncludeRecordsInJson(true);
    setIncludePercentages(true);
    setLimitRecordsPerGroup(false);
    setSortKeysCaseInsensitive(true);
    setTreatArraysAsJoinedText(false);
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
    setIncludeRecordsInJson(true);
    setIncludePercentages(true);
    setLimitRecordsPerGroup(false);
    setSortKeysCaseInsensitive(true);
    setTreatArraysAsJoinedText(false);
    setWarnMissingKeys(true);
    setWarnHighCardinality(true);
    setWarnNonNumericSummary(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Array Group By Tool"
      description="Group JSON records by escaped dot paths while keeping types and numeric summaries distinct."
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
              <p className="mt-1 text-xs text-gray-500">Use dot paths such as user.role. Escape a literal dot as \. and a backslash as \\.</p>
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
          <Toggle checked={includeRecordsInJson} onChange={setIncludeRecordsInJson} label="Include records in grouped JSON output" />
          <Toggle checked={includePercentages} onChange={setIncludePercentages} label="Include group percentages" />
          <Toggle checked={limitRecordsPerGroup} onChange={setLimitRecordsPerGroup} label="Limit grouped records to first 25 per group" />
          <Toggle checked={sortKeysCaseInsensitive} onChange={setSortKeysCaseInsensitive} label="Sort group keys case-insensitively" />
          <Toggle checked={treatArraysAsJoinedText} onChange={setTreatArraysAsJoinedText} label="Join array values into display text (lossy)" />
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
          className="min-h-[44px] whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Group JSON Array
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
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
                className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div key={`${note.title}-${note.message}`} className={issueCardClass(note.severity)}>
                <p className={issueTitleClass(note.severity)}>{note.title}</p>
                <p className={issueTextClass(note.severity)}>{note.message}</p>
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
                    <td className="px-4 py-3">{group.numericCount ? formatNumber(group.sum) : "—"}</td>
                    <td className="px-4 py-3">{group.average === null ? "—" : formatNumber(group.average)}</td>
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
          <h2 className="text-2xl font-semibold text-gray-900">Group counts are only meaningful when the key is unambiguous</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Grouping sounds simple until the data contains nested fields, literal dots in member names, arrays, missing values, or a mix of strings and numbers that happen to look alike. The grouping key here is read as an escaped dot path: <code className="rounded bg-gray-100 px-1 py-0.5">user.role</code> walks into a nested object, while <code className="rounded bg-gray-100 px-1 py-0.5">user\.role</code> addresses a literal key named <code className="rounded bg-gray-100 px-1 py-0.5">user.role</code>.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Value types stay separate. The JSON number <code className="rounded bg-gray-100 px-1 py-0.5">1</code> and the JSON string <code className="rounded bg-gray-100 px-1 py-0.5">"1"</code> may look identical in a table, but they are not merged into one group. That matters when data came from different APIs, CSV imports, or loosely typed storage.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Nested paths without flattening the record</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Records are grouped from their original structure. No flattened copy is created first, so a nested path cannot silently overwrite a literal dotted member name. Array indexes can be addressed with paths such as <code className="rounded bg-white px-1 py-0.5">items.0.status</code>.
            </p>
          </div>
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">Joined arrays are deliberately marked as lossy</h2>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              Keeping an array as JSON text preserves its boundaries. Joining array items into display text can make different arrays collapse to the same label, especially when values contain the separator. Leave the joined-array option off when exact grouping matters.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Numeric summaries count numeric observations, not group rows</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            An average is calculated from the finite numeric values actually found in the selected numeric field. Missing, string, <code className="rounded bg-gray-100 px-1 py-0.5">null</code>, and non-finite values are not added to the denominator. A group with ten records but only six numeric observations therefore divides the sum by six, not ten.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Sum, minimum, maximum, and average are descriptive summaries only. They do not coerce numeric-looking strings such as <code className="rounded bg-gray-100 px-1 py-0.5">"42"</code>. If the source uses strings for numbers, normalize that data deliberately before treating it as numeric.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Missing, empty, and null values need a policy</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A missing path, an explicit JSON <code className="rounded bg-gray-100 px-1 py-0.5">null</code>, and an empty string are all treated as unavailable for the group key, then handled by the selected missing-value policy. They can be collected under a visible label or skipped. Percentages are calculated from the records that remain after that choice.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Grouped JSON can retain source records for inspection. If the 25-record cap is enabled, counts still describe the full group while the embedded record sample is truncated; a note makes that distinction visible.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON itself has a few interoperability boundaries</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Duplicate object member names are rejected before grouping because different JSON parsers can disagree about which duplicate wins. Integers that JavaScript cannot represent safely are also stopped before they can be rounded. RFC 8259 recommends unique object names and notes that interoperable number handling is constrained by implementation limits.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Primary reference:{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A small example with a nested field</h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`[
  {"user":{"role":"editor"},"views":12},
  {"user":{"role":"editor"},"views":"9"},
  {"user":{"role":"viewer"},"views":7}
]

Group path: user.role
Numeric field: views

editor  → count 2, numeric values used 1, sum 12
viewer  → count 1, numeric values used 1, sum 7`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser-side limits are part of the result</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Parsing, grouping, sorting, and export happen in the current browser tab; pasted JSON is not sent to a Yoryantra server by the page code. Large arrays still consume local memory because the full document and group map must exist at once. For very large datasets, a database aggregation, dataframe, or streaming script is a better fit than a browser textarea.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/json-array-group-by-tool" /></div>
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

  const dataRisk = findJsonDataRisk(options.input);
  if (dataRisk) {
    return emptyResult(`__ERROR__:${dataRisk}`, options.input.length);
  }

  if (!Array.isArray(parsed)) {
    return emptyResult("__ERROR__:Paste a JSON array. Grouping is defined across array records.", options.input.length);
  }

  const groupPath = parseDotPath(options.groupKey);
  if (!groupPath.valid) {
    return emptyResult(`__ERROR__:Group path: ${groupPath.error}`, options.input.length);
  }

  if (options.numericMode !== "none" && options.numericKey.trim()) {
    const numericPath = parseDotPath(options.numericKey);
    if (!numericPath.valid) {
      return emptyResult(`__ERROR__:Numeric path: ${numericPath.error}`, options.input.length);
    }
  }

  if (parsed.length > 25000) {
    return emptyResult("__ERROR__:This pasted array contains more than 25,000 records. Use a streaming script, dataframe, or database aggregation for a dataset of that size.", options.input.length);
  }

  const records = parsed as unknown[];
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

    const missingLabel = options.missingMode === "emptyLabel" ? "(empty)" : "(missing)";
    const groupIdentity = normalized ?? {
      key: "missing:",
      displayKey: missingLabel,
      valueType: "missing",
    };

    const numericValue = options.numericKey.trim() ? readPath(record, options.numericKey) : undefined;
    const numberValue = typeof numericValue === "number" && Number.isFinite(numericValue) ? numericValue : null;

    if (!map.has(groupIdentity.key)) {
      map.set(groupIdentity.key, {
        key: groupIdentity.key,
        displayKey: groupIdentity.displayKey,
        valueType: groupIdentity.valueType,
        count: 0,
        percentage: 0,
        numericCount: 0,
        sum: 0,
        average: null,
        min: null,
        max: null,
        records: [],
      });
    }

    const group = map.get(groupIdentity.key)!;
    group.count += 1;

    if (!options.limitRecordsPerGroup || group.records.length < 25) {
      group.records.push(record);
    }

    if (numberValue !== null && options.numericMode !== "none") {
      group.numericCount += 1;
      group.sum += numberValue;
      group.min = group.min === null ? numberValue : Math.min(group.min, numberValue);
      group.max = group.max === null ? numberValue : Math.max(group.max, numberValue);
    }

    includedCount += 1;
  });

  const groups = Array.from(map.values());
  groups.forEach((group) => {
    group.percentage = includedCount ? (group.count / includedCount) * 100 : 0;
    group.average = group.numericCount ? group.sum / group.numericCount : null;
  });

  return groups;
}

function normalizeGroupValue(value: unknown, options: {
  groupMode: GroupMode;
  treatArraysAsJoinedText: boolean;
}): { key: string; displayKey: string; valueType: string } | null {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "string") {
    let text = value;
    if (options.groupMode === "trimmed") text = text.trim();
    if (options.groupMode === "lowercase") text = text.trim().toLowerCase();
    if (!text) return null;
    return { key: `string:${text}`, displayKey: text, valueType: "string" };
  }

  if (typeof value === "number") {
    const text = Object.is(value, -0) ? "-0" : String(value);
    return { key: `number:${text}`, displayKey: text, valueType: "number" };
  }

  if (typeof value === "boolean") {
    const text = value ? "true" : "false";
    return { key: `boolean:${text}`, displayKey: text, valueType: "boolean" };
  }

  if (Array.isArray(value)) {
    const text = options.treatArraysAsJoinedText
      ? value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join(" | ")
      : JSON.stringify(value);
    return { key: `array:${text}`, displayKey: text, valueType: "array" };
  }

  const text = JSON.stringify(value);
  return { key: `object:${text}`, displayKey: text, valueType: "object" };
}

function sortGroups(groups: GroupRow[], options: {
  sortMode: SortMode;
  sortKeysCaseInsensitive: boolean;
}) {
  const keyCompare = (a: GroupRow, b: GroupRow) => {
    const left = options.sortKeysCaseInsensitive ? a.displayKey.toLowerCase() : a.displayKey;
    const right = options.sortKeysCaseInsensitive ? b.displayKey.toLowerCase() : b.displayKey;
    if (left < right) return -1;
    if (left > right) return 1;
    return a.valueType < b.valueType ? -1 : a.valueType > b.valueType ? 1 : 0;
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
      group: group.displayKey,
      valueType: group.valueType,
      count: group.count,
      percentage: options.includePercentages ? group.percentage : undefined,
      numeric: numericSummary(group, options.numericMode, options.numericKey),
      records: options.includeRecordsInJson ? group.records : undefined,
    })), null, 2);
  }

  if (options.outputMode === "countsJson") {
    return JSON.stringify(groups.map((group) => ({
      group: group.displayKey,
      valueType: group.valueType,
      count: group.count,
      percentage: options.includePercentages ? group.percentage : undefined,
      numeric: numericSummary(group, options.numericMode, options.numericKey),
    })), null, 2);
  }

  if (options.outputMode === "markdown") return buildMarkdown(groups, issues, options);
  if (options.outputMode === "csv") return buildCsv(groups, options);
  if (options.outputMode === "checklist") return buildChecklist(groups, issues, recordCount);

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
    `Records in input: ${recordCount}`,
    `Groups: ${groups.length}`,
    "",
  ];

  groups.forEach((group) => {
    lines.push(`${group.displayKey} (${group.valueType})`);
    lines.push(`Count: ${group.count}`);
    if (options.includePercentages) lines.push(`Percentage: ${group.percentage.toFixed(2)}%`);
    if (options.numericMode !== "none" && options.numericKey.trim()) {
      const summary = numericSummary(group, options.numericMode, options.numericKey);
      Object.entries(summary).forEach(([key, value]) => {
        lines.push(`${key}: ${value === null ? "not available" : formatNumber(value)}`);
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
  const headers = ["Group", "Type", "Count"];
  if (options.includePercentages) headers.push("Percentage");
  if (options.numericMode !== "none" && options.numericKey.trim()) {
    headers.push("Numeric values used");
    if (options.numericMode === "sum") headers.push(`Sum ${options.numericKey}`);
    if (options.numericMode === "average") headers.push(`Average ${options.numericKey}`);
    if (options.numericMode === "minmax") headers.push(`Min ${options.numericKey}`, `Max ${options.numericKey}`);
  }

  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];

  groups.forEach((group) => {
    const row = [escapeMarkdown(group.displayKey), group.valueType, String(group.count)];
    if (options.includePercentages) row.push(`${group.percentage.toFixed(2)}%`);
    if (options.numericMode !== "none" && options.numericKey.trim()) row.push(String(group.numericCount));
    if (options.numericMode === "sum") row.push(group.numericCount ? formatNumber(group.sum) : "");
    if (options.numericMode === "average") row.push(group.average === null ? "" : formatNumber(group.average));
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
  const headers = ["group", "type", "count"];
  if (options.includePercentages) headers.push("percentage");
  if (options.numericMode !== "none" && options.numericKey.trim()) {
    headers.push("numeric_values_used", "sum", "average", "min", "max");
  }

  const rows = [headers];
  groups.forEach((group) => {
    const row = [group.displayKey, group.valueType, String(group.count)];
    if (options.includePercentages) row.push(group.percentage.toFixed(2));
    if (options.numericMode !== "none" && options.numericKey.trim()) {
      row.push(
        String(group.numericCount),
        group.numericCount ? formatNumber(group.sum) : "",
        group.average === null ? "" : formatNumber(group.average),
        group.min === null ? "" : formatNumber(group.min),
        group.max === null ? "" : formatNumber(group.max),
      );
    }
    rows.push(row);
  });

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildChecklist(groups: GroupRow[], issues: Issue[], recordCount: number) {
  const lines = [
    "# JSON grouping check",
    "",
    `- [${recordCount ? "x" : " "}] Parsed ${recordCount} record${recordCount === 1 ? "" : "s"}.`,
    `- [${groups.length ? "x" : " "}] Created ${groups.length} distinct typed group${groups.length === 1 ? "" : "s"}.`,
    `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] No high-severity data-integrity problems remain.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function numericSummary(group: GroupRow, mode: NumericMode, numericKey: string): Record<string, number | null> {
  if (mode === "none" || !numericKey.trim()) return {};
  const output: Record<string, number | null> = {
    [`${numericKey} values used`]: group.numericCount,
  };
  if (mode === "average") output[`Average ${numericKey}`] = group.average;
  else if (mode === "minmax") {
    output[`Min ${numericKey}`] = group.min;
    output[`Max ${numericKey}`] = group.max;
  } else {
    output[`Sum ${numericKey}`] = group.numericCount ? group.sum : null;
  }
  return output;
}

function buildIssues(records: unknown[], groups: GroupRow[], options: {
  groupKey: string;
  numericKey: string;
  missingMode: MissingMode;
  numericMode: NumericMode;
  treatArraysAsJoinedText: boolean;
  limitRecordsPerGroup: boolean;
  includeRecordsInJson: boolean;
  warnMissingKeys: boolean;
  warnHighCardinality: boolean;
  warnNonNumericSummary: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnMissingKeys) {
    const missingCount = records.filter((record) => {
      const value = readPath(record, options.groupKey);
      return value === undefined || value === null || value === "";
    }).length;

    if (missingCount) {
      issues.push({
        severity: options.missingMode === "skip" ? "info" : "warning",
        title: options.missingMode === "skip" ? "Records skipped for a missing group value" : "Missing group values",
        message: `${missingCount} record${missingCount === 1 ? "" : "s"} had no usable value at the selected group path.`,
      });
    }
  }

  if (options.warnHighCardinality && records.length > 0 && groups.length > Math.max(20, records.length * 0.6)) {
    issues.push({
      severity: "info",
      title: "The key is close to unique",
      message: "Most records became separate groups. Check whether the selected field is an identifier rather than a category-like value.",
    });
  }

  if (options.warnNonNumericSummary && options.numericMode !== "none" && options.numericKey.trim()) {
    const nonNumeric = records.filter((record) => {
      const value = readPath(record, options.numericKey);
      return value !== undefined && value !== null && (typeof value !== "number" || !Number.isFinite(value));
    }).length;
    const missing = records.filter((record) => {
      const value = readPath(record, options.numericKey);
      return value === undefined || value === null;
    }).length;

    if (nonNumeric) {
      issues.push({
        severity: "warning",
        title: "Numeric-looking data was not coerced",
        message: `${nonNumeric} present value${nonNumeric === 1 ? "" : "s"} were not finite JSON numbers and were excluded from numeric summaries.`,
      });
    }
    if (missing) {
      issues.push({
        severity: "info",
        title: "Some records have no numeric observation",
        message: `${missing} record${missing === 1 ? "" : "s"} had no value at the numeric path. Averages use only finite numeric observations.`,
      });
    }
  }

  if (options.treatArraysAsJoinedText && records.some((record) => Array.isArray(readPath(record, options.groupKey)))) {
    issues.push({
      severity: "warning",
      title: "Joined array labels can collide",
      message: "Array boundaries are being flattened into display text. Keep arrays as JSON text when distinct array structure must remain distinct.",
    });
  }

  if (options.limitRecordsPerGroup && options.includeRecordsInJson && groups.some((group) => group.count > group.records.length)) {
    issues.push({
      severity: "info",
      title: "Embedded record samples are capped",
      message: "Group counts cover every included record, but grouped JSON embeds at most 25 source records per group.",
    });
  }

  return issues;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.recordCount > 5000) {
    notes.push({
      severity: "info",
      title: "Large in-browser grouping job",
      message: "The full JSON array and group map are held in browser memory. A streaming or database aggregation is safer for substantially larger data.",
    });
  }

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large export",
      message: "Grouped records make the export sizeable. Counts JSON or CSV is more compact when source records are not needed.",
    });
  }

  return notes;
}

function parseDotPath(path: string): { valid: boolean; parts: string[]; error: string } {
  if (!path) return { valid: false, parts: [], error: "Enter a key or escaped dot path." };

  const parts: string[] = [];
  let current = "";
  let escaping = false;

  for (let index = 0; index < path.length; index += 1) {
    const char = path[index];
    if (escaping) {
      if (char !== "." && char !== "\\") {
        current += "\\";
      }
      current += char;
      escaping = false;
      continue;
    }
    if (char === "\\") {
      escaping = true;
      continue;
    }
    if (char === ".") {
      if (!current) return { valid: false, parts: [], error: "Empty path segments are not allowed. Escape a literal dot as \\." };
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  if (escaping) return { valid: false, parts: [], error: "The path ends with an unfinished backslash escape." };
  if (!current) return { valid: false, parts: [], error: "The path cannot end with an unescaped dot." };
  parts.push(current);
  return { valid: true, parts, error: "" };
}

function readPath(value: unknown, path: string): unknown {
  const parsed = parseDotPath(path);
  if (!parsed.valid) return undefined;

  let current = value;
  for (const part of parsed.parts) {
    if (!current || typeof current !== "object") return undefined;
    if (!Object.prototype.hasOwnProperty.call(current as Record<string, unknown>, part)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function findJsonDataRisk(text: string): string | null {
  let index = 0;

  const skipWhitespace = () => {
    while (index < text.length && /\s/.test(text[index])) index += 1;
  };

  const parseString = (): string => {
    const start = index;
    index += 1;
    while (index < text.length) {
      const char = text[index];
      if (char === "\\") {
        index += 2;
        continue;
      }
      if (char === '"') {
        index += 1;
        return JSON.parse(text.slice(start, index)) as string;
      }
      index += 1;
    }
    throw new Error("syntax");
  };

  const parseNumber = () => {
    const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error("syntax");
    const token = match[0];
    index += token.length;
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new Error("JSON number is outside JavaScript's finite numeric range. Convert it to a string before grouping.");
    }
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new Error(`JSON integer ${token} cannot be represented exactly by JavaScript. Convert it to a string before grouping.`);
    }
    if (Object.is(value, -0)) {
      throw new Error("JSON number -0 can lose its sign during generated JSON output. Convert it to a string if that distinction matters.");
    }
  };

  const parseValue = (depth: number): void => {
    if (depth > 200) throw new Error("JSON nesting is deeper than 200 levels, which is unsafe for this browser-side grouping pass.");
    skipWhitespace();
    const char = text[index];

    if (char === "{") {
      index += 1;
      skipWhitespace();
      const names = new Set<string>();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      while (index < text.length) {
        skipWhitespace();
        if (text[index] !== '"') throw new Error("syntax");
        const name = parseString();
        if (names.has(name)) {
          throw new Error(`Duplicate object member "${name}" would be collapsed by JSON.parse. Rename or remove the duplicate before grouping.`);
        }
        names.add(name);
        skipWhitespace();
        if (text[index] !== ":") throw new Error("syntax");
        index += 1;
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "}") {
          index += 1;
          return;
        }
        if (text[index] !== ",") throw new Error("syntax");
        index += 1;
      }
      throw new Error("syntax");
    }

    if (char === "[") {
      index += 1;
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      while (index < text.length) {
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "]") {
          index += 1;
          return;
        }
        if (text[index] !== ",") throw new Error("syntax");
        index += 1;
      }
      throw new Error("syntax");
    }

    if (char === '"') {
      parseString();
      return;
    }

    if (char === "-" || (char >= "0" && char <= "9")) {
      parseNumber();
      return;
    }

    if (text.slice(index, index + 4) === "true" || text.slice(index, index + 4) === "null") {
      index += 4;
      return;
    }
    if (text.slice(index, index + 5) === "false") {
      index += 5;
      return;
    }
    throw new Error("syntax");
  };

  try {
    parseValue(0);
    return null;
  } catch (error) {
    if (error instanceof Error && error.message !== "syntax") return error.message;
    return null;
  }
}

function issueCardClass(severity: Issue["severity"]) {
  if (severity === "high") return "self-start rounded-xl border border-red-200 bg-red-50 p-4";
  if (severity === "warning") return "self-start rounded-xl border border-amber-200 bg-amber-50 p-4";
  return "self-start rounded-xl border border-gray-200 bg-gray-50 p-4";
}

function issueTitleClass(severity: Issue["severity"]) {
  if (severity === "high") return "text-sm font-semibold text-red-900";
  if (severity === "warning") return "text-sm font-semibold text-amber-900";
  return "text-sm font-semibold text-gray-900";
}

function issueTextClass(severity: Issue["severity"]) {
  if (severity === "high") return "mt-1 text-sm leading-6 text-red-800";
  if (severity === "warning") return "mt-1 text-sm leading-6 text-amber-800";
  return "mt-1 text-sm leading-6 text-gray-600";
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#d9a928]"
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

