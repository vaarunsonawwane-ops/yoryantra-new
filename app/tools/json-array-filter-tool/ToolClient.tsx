"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Operator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "exists"
  | "missing"
  | "greaterThan"
  | "lessThan"
  | "between"
  | "regex"
  | "truthy"
  | "falsy";

type OutputMode = "filteredJson" | "matchedOnly" | "rejectedJson" | "markdown" | "csv" | "jsonReport" | "checklist";
type ValueMode = "string" | "number" | "boolean" | "auto";
type MatchMode = "keepMatches" | "keepNonMatches";
type SortMode = "original" | "keyAsc" | "keyDesc";

type FilterResult = {
  index: number;
  matched: boolean;
  value: unknown;
  reason: string;
  record: unknown;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  rows: FilterResult[];
  issues: Issue[];
  inputLength: number;
  recordCount: number;
  matchedCount: number;
  rejectedCount: number;
  outputLength: number;
};

const sampleInput = `[
  {
    "tool": "JSON Formatter",
    "category": "JSON & Data",
    "status": "live",
    "views": 120,
    "featured": true
  },
  {
    "tool": "JSON Validator",
    "category": "JSON & Data",
    "status": "live",
    "views": 95,
    "featured": true
  },
  {
    "tool": "URL Encoder Decoder",
    "category": "Encoding",
    "status": "live",
    "views": 76,
    "featured": false
  },
  {
    "tool": "JSON Array Filter Tool",
    "category": "JSON & Data",
    "status": "new",
    "views": 0,
    "featured": false
  }
]`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [filterKey, setFilterKey] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [secondValue, setSecondValue] = useState("");
  const [operator, setOperator] = useState<Operator>("equals");
  const [outputMode, setOutputMode] = useState<OutputMode>("filteredJson");
  const [valueMode, setValueMode] = useState<ValueMode>("auto");
  const [matchMode, setMatchMode] = useState<MatchMode>("keepMatches");
  const [sortMode, setSortMode] = useState<SortMode>("original");
  const [flattenNestedObjects, setFlattenNestedObjects] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimValues, setTrimValues] = useState(true);
  const [includeOriginalIndex, setIncludeOriginalIndex] = useState(true);
  const [includeMatchReason, setIncludeMatchReason] = useState(true);
  const [limitOutputRows, setLimitOutputRows] = useState(false);
  const [warnMissingKeys, setWarnMissingKeys] = useState(true);
  const [warnTypeCoercion, setWarnTypeCoercion] = useState(true);
  const [warnRegexErrors, setWarnRegexErrors] = useState(true);
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
      setError("Please paste a JSON array of records to filter.");
      setResult(null);
      setOutput("");
      return;
    }

    if (!filterKey.trim() && !["truthy", "falsy"].includes(operator)) {
      setError("Please enter a key or dot path to filter by.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      filterKey,
      filterValue,
      secondValue,
      operator,
      outputMode,
      valueMode,
      matchMode,
      sortMode,
      flattenNestedObjects,
      caseSensitive,
      trimValues,
      includeOriginalIndex,
      includeMatchReason,
      limitOutputRows,
      warnMissingKeys,
      warnTypeCoercion,
      warnRegexErrors,
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
    setFilterKey("category");
    setFilterValue("JSON & Data");
    setSecondValue("");
    setOperator("equals");
    setOutputMode("filteredJson");
    setValueMode("auto");
    setMatchMode("keepMatches");
    setSortMode("original");
    setFlattenNestedObjects(true);
    setCaseSensitive(false);
    setTrimValues(true);
    setIncludeOriginalIndex(true);
    setIncludeMatchReason(true);
    setLimitOutputRows(false);
    setWarnMissingKeys(true);
    setWarnTypeCoercion(true);
    setWarnRegexErrors(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setFilterKey("");
    setFilterValue("");
    setSecondValue("");
    setOperator("equals");
    setOutputMode("filteredJson");
    setValueMode("auto");
    setMatchMode("keepMatches");
    setSortMode("original");
    setFlattenNestedObjects(true);
    setCaseSensitive(false);
    setTrimValues(true);
    setIncludeOriginalIndex(true);
    setIncludeMatchReason(true);
    setLimitOutputRows(false);
    setWarnMissingKeys(true);
    setWarnTypeCoercion(true);
    setWarnRegexErrors(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Array Filter Tool"
      description="Filter JSON array records by key, value, comparison rule, and dot path. Preview matches and export filtered JSON, Markdown, CSV, or review reports locally."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Array of Records</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste an array of objects from an API response, export, log sample, or small dataset you want to filter.
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
            className="w-full min-h-[420px] max-h-[520px] resize-y overflow-auto rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Filter Settings</h3>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Filter Key or Dot Path</label>
              <input
                value={filterKey}
                onChange={(event) => {
                  setFilterKey(event.target.value);
                  clearResult();
                }}
                placeholder="category, status, user.role"
                className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            <YoryantraSelect
              label="Condition"
              value={operator}
              onChange={(value) => {
                setOperator(value as Operator);
                clearResult();
              }}
              options={[
                { label: "Equals", value: "equals" },
                { label: "Does not equal", value: "notEquals" },
                { label: "Contains", value: "contains" },
                { label: "Does not contain", value: "notContains" },
                { label: "Starts with", value: "startsWith" },
                { label: "Ends with", value: "endsWith" },
                { label: "Exists", value: "exists" },
                { label: "Missing", value: "missing" },
                { label: "Greater than", value: "greaterThan" },
                { label: "Less than", value: "lessThan" },
                { label: "Between two numbers", value: "between" },
                { label: "Matches regex", value: "regex" },
                { label: "Truthy", value: "truthy" },
                { label: "Falsy", value: "falsy" },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Filter Value</label>
              <input
                value={filterValue}
                onChange={(event) => {
                  setFilterValue(event.target.value);
                  clearResult();
                }}
                placeholder="JSON & Data, live, 100, true"
                className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            {operator === "between" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Second Value</label>
                <input
                  value={secondValue}
                  onChange={(event) => {
                    setSecondValue(event.target.value);
                    clearResult();
                  }}
                  placeholder="200"
                  className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />
              </div>
            ) : null}

            <YoryantraSelect
              label="Value Type"
              value={valueMode}
              onChange={(value) => {
                setValueMode(value as ValueMode);
                clearResult();
              }}
              options={[
                { label: "Auto detect", value: "auto" },
                { label: "Text", value: "string" },
                { label: "Number", value: "number" },
                { label: "Boolean", value: "boolean" },
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
                { label: "Filtered JSON", value: "filteredJson" },
                { label: "Matched values only", value: "matchedOnly" },
                { label: "Rejected records JSON", value: "rejectedJson" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "JSON report", value: "jsonReport" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Result Mode"
              value={matchMode}
              onChange={(value) => {
                setMatchMode(value as MatchMode);
                clearResult();
              }}
              options={[
                { label: "Keep matching records", value: "keepMatches" },
                { label: "Keep non-matching records", value: "keepNonMatches" },
              ]}
            />

            <YoryantraSelect
              label="Sort Output"
              value={sortMode}
              onChange={(value) => {
                setSortMode(value as SortMode);
                clearResult();
              }}
              options={[
                { label: "Keep original order", value: "original" },
                { label: "Filter key A to Z", value: "keyAsc" },
                { label: "Filter key Z to A", value: "keyDesc" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={flattenNestedObjects} onChange={setFlattenNestedObjects} label="Flatten nested objects for dot-path filtering" />
          <Toggle checked={caseSensitive} onChange={setCaseSensitive} label="Use case-sensitive text matching" />
          <Toggle checked={trimValues} onChange={setTrimValues} label="Trim text values before matching" />
          <Toggle checked={includeOriginalIndex} onChange={setIncludeOriginalIndex} label="Include original record index" />
          <Toggle checked={includeMatchReason} onChange={setIncludeMatchReason} label="Include match reason in reports" />
          <Toggle checked={limitOutputRows} onChange={setLimitOutputRows} label="Limit output to first 100 records" />
          <Toggle checked={warnMissingKeys} onChange={setWarnMissingKeys} label="Warn about missing filter keys" />
          <Toggle checked={warnTypeCoercion} onChange={setWarnTypeCoercion} label="Warn when values are coerced for comparison" />
          <Toggle checked={warnRegexErrors} onChange={setWarnRegexErrors} label="Warn about invalid regex patterns" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options help filter pasted JSON data safely while keeping enough context to understand why records matched or did not match.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processJson}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Filter JSON Array
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
                <p className="mt-1 text-sm text-gray-500">Filtered JSON, rejected records, table output, report, or checklist.</p>
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
            <StatCard label="Matched" value={String(result.matchedCount)} />
            <StatCard label="Rejected" value={String(result.rejectedCount)} />
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

      {result?.rows.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Filter Preview</h3>
          <p className="mt-1 text-sm text-gray-500">Showing match status, selected value, and reason for the first 100 records.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Index</th>
                  <th className="px-4 py-3 font-semibold">Matched</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.rows.slice(0, 100).map((row) => (
                  <tr key={row.index}>
                    <td className="px-4 py-3">{row.index}</td>
                    <td className="px-4 py-3">{row.matched ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 font-mono break-words">{formatValueForDisplay(row.value)}</td>
                    <td className="px-4 py-3">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rows.length > 100 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 100 records to keep the preview readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Filtering JSON Arrays Without Writing a Script</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON arrays from APIs, logs, exports, and test data often contain more records than you need. Filtering by a key, status, category, number, boolean flag, or nested path helps you quickly isolate the records that matter.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool filters an array of JSON objects locally in your browser. You can match text, numbers, booleans, missing fields, regex patterns, ranges, and nested dot paths before copying the filtered JSON or exporting a report.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This JSON Array Filter Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Filtering API response records by status, category, owner, region, environment, feature flag, or error type.</p>
            <p className="mt-2">Finding records where a field is missing, empty, truthy, falsy, above a number, or inside a range.</p>
            <p className="mt-2">Creating a smaller JSON sample before converting it to CSV, Markdown, or a bug report.</p>
            <p className="mt-2">Testing dot-path filters such as user.role, meta.source, or product.category before writing code.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the JSON Array Filter Tool</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JSON array of objects into the input box.</li>
            <li>Enter the key or dot path you want to filter by.</li>
            <li>Select a condition such as equals, contains, greater than, between, missing, or regex.</li>
            <li>Choose the output format and whether to keep matching or non-matching records.</li>
            <li>Review the filter preview and copy the filtered output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Filter</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`Filter key:
category

Condition:
equals

Value:
JSON & Data

Result:
Only records where category is "JSON & Data" are kept.`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Filtering Is Best for Small and Medium JSON Samples</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This browser tool is useful for pasted API responses, examples, exports, and moderate JSON samples. Very large datasets are better filtered in a database, command-line tool, or local script because browser previews can become hard to review at scale.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does this JSON array filter tool do?">
              It filters records in a JSON array by a selected key, value, comparison condition, and optional nested dot path.
            </Faq>
            <Faq title="Can I filter nested fields?">
              Yes. Enable flattening and use dot paths such as user.role, meta.source, or product.category.
            </Faq>
            <Faq title="Can I filter numbers and booleans?">
              Yes. Use the value type setting to compare text, numbers, booleans, or auto-detected values.
            </Faq>
            <Faq title="Can I find records where a key is missing?">
              Yes. Choose the Missing condition to find records that do not contain the selected key or dot path.
            </Faq>
            <Faq title="Is anything uploaded while filtering JSON?">
              No. The filtering runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            JSON filtering often connects with grouping, flattening, formatting, CSV export, and path inspection.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-array-group-by-tool" className="yoryantra-btn-outline">JSON Array Group By Tool</Link>
            <Link href="/tools/json-flatten-unflatten-tool" className="yoryantra-btn-outline">JSON Flatten / Unflatten Tool</Link>
            <Link href="/tools/json-to-csv-converter" className="yoryantra-btn-outline">JSON to CSV Converter</Link>
            <Link href="/tools/json-path-tester" className="yoryantra-btn-outline">JSON Path Tester</Link>
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">JSON Formatter</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  filterKey: string;
  filterValue: string;
  secondValue: string;
  operator: Operator;
  outputMode: OutputMode;
  valueMode: ValueMode;
  matchMode: MatchMode;
  sortMode: SortMode;
  flattenNestedObjects: boolean;
  caseSensitive: boolean;
  trimValues: boolean;
  includeOriginalIndex: boolean;
  includeMatchReason: boolean;
  limitOutputRows: boolean;
  warnMissingKeys: boolean;
  warnTypeCoercion: boolean;
  warnRegexErrors: boolean;
}): Result {
  let parsed: unknown;

  try {
    parsed = JSON.parse(options.input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON input.";
    return emptyResult(`__ERROR__:The input is not valid JSON: ${message}`, options.input.length);
  }

  if (!Array.isArray(parsed)) {
    return emptyResult("__ERROR__:Please paste a JSON array. This tool filters arrays of records.", options.input.length);
  }

  const records = parsed.map((record) => options.flattenNestedObjects ? flattenRecord(record) : record);
  const rows = records.map((record, index) => evaluateRecord(record, index, options));
  const selected = options.matchMode === "keepMatches" ? rows.filter((row) => row.matched) : rows.filter((row) => !row.matched);
  const sorted = sortRows(selected, options);
  const limited = options.limitOutputRows ? sorted.slice(0, 100) : sorted;
  const issues = buildIssues(rows, options);
  const output = formatOutput(limited, rows, issues, options);

  return {
    output,
    rows,
    issues,
    inputLength: options.input.length,
    recordCount: rows.length,
    matchedCount: rows.filter((row) => row.matched).length,
    rejectedCount: rows.filter((row) => !row.matched).length,
    outputLength: output.length,
  };
}

function emptyResult(output: string, inputLength: number): Result {
  return {
    output,
    rows: [],
    issues: [],
    inputLength,
    recordCount: 0,
    matchedCount: 0,
    rejectedCount: 0,
    outputLength: 0,
  };
}

function evaluateRecord(record: unknown, index: number, options: {
  filterKey: string;
  filterValue: string;
  secondValue: string;
  operator: Operator;
  valueMode: ValueMode;
  caseSensitive: boolean;
  trimValues: boolean;
}) {
  const value = readPath(record, options.filterKey);
  const exists = value !== undefined;
  const expected = coerceValue(options.filterValue, options.valueMode);
  const second = coerceValue(options.secondValue, options.valueMode);

  let matched = false;
  let reason = "";

  try {
    if (options.operator === "exists") {
      matched = exists;
      reason = exists ? "Key exists" : "Key is missing";
    } else if (options.operator === "missing") {
      matched = !exists;
      reason = matched ? "Key is missing" : "Key exists";
    } else if (options.operator === "truthy") {
      matched = Boolean(value);
      reason = matched ? "Value is truthy" : "Value is not truthy";
    } else if (options.operator === "falsy") {
      matched = !value;
      reason = matched ? "Value is falsy" : "Value is not falsy";
    } else if (options.operator === "greaterThan") {
      matched = Number(value) > Number(expected);
      reason = matched ? "Number is greater than filter value" : "Number is not greater than filter value";
    } else if (options.operator === "lessThan") {
      matched = Number(value) < Number(expected);
      reason = matched ? "Number is less than filter value" : "Number is not less than filter value";
    } else if (options.operator === "between") {
      const num = Number(value);
      const low = Number(expected);
      const high = Number(second);
      matched = num >= Math.min(low, high) && num <= Math.max(low, high);
      reason = matched ? "Number is inside range" : "Number is outside range";
    } else if (options.operator === "regex") {
      const regex = new RegExp(String(options.filterValue), options.caseSensitive ? "" : "i");
      matched = regex.test(normalizeText(value, options));
      reason = matched ? "Value matches regex" : "Value does not match regex";
    } else {
      const actualText = normalizeText(value, options);
      const expectedText = normalizeText(expected, options);

      if (options.operator === "equals") matched = actualText === expectedText;
      if (options.operator === "notEquals") matched = actualText !== expectedText;
      if (options.operator === "contains") matched = actualText.includes(expectedText);
      if (options.operator === "notContains") matched = !actualText.includes(expectedText);
      if (options.operator === "startsWith") matched = actualText.startsWith(expectedText);
      if (options.operator === "endsWith") matched = actualText.endsWith(expectedText);

      reason = matched ? "Condition matched" : "Condition did not match";
    }
  } catch (error) {
    matched = false;
    reason = error instanceof Error ? error.message : "Comparison failed";
  }

  return {
    index,
    matched,
    value,
    reason,
    record,
  };
}

function normalizeText(value: unknown, options: { caseSensitive: boolean; trimValues: boolean }) {
  let text = value === undefined || value === null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  if (options.trimValues) text = text.trim();
  if (!options.caseSensitive) text = text.toLowerCase();
  return text;
}

function coerceValue(value: string, mode: ValueMode): unknown {
  const trimmed = value.trim();

  if (mode === "string") return value;
  if (mode === "number") return Number(trimmed);
  if (mode === "boolean") return trimmed.toLowerCase() === "true";

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return value;
}

function sortRows(rows: FilterResult[], options: { sortMode: SortMode }) {
  if (options.sortMode === "original") return rows;
  return [...rows].sort((a, b) => {
    const left = formatValueForDisplay(a.value).toLowerCase();
    const right = formatValueForDisplay(b.value).toLowerCase();
    return options.sortMode === "keyAsc" ? left.localeCompare(right) : right.localeCompare(left);
  });
}

function formatOutput(selectedRows: FilterResult[], allRows: FilterResult[], issues: Issue[], options: {
  outputMode: OutputMode;
  includeOriginalIndex: boolean;
  includeMatchReason: boolean;
}) {
  const selectedRecords = selectedRows.map((row) => {
    if (!options.includeOriginalIndex && !options.includeMatchReason) return row.record;
    return {
      ...(typeof row.record === "object" && row.record !== null && !Array.isArray(row.record) ? row.record as Record<string, unknown> : { value: row.record }),
      ...(options.includeOriginalIndex ? { _index: row.index } : {}),
      ...(options.includeMatchReason ? { _match: row.matched, _reason: row.reason } : {}),
    };
  });

  if (options.outputMode === "filteredJson") return JSON.stringify(selectedRecords, null, 2);
  if (options.outputMode === "rejectedJson") return JSON.stringify(allRows.filter((row) => !row.matched).map((row) => row.record), null, 2);
  if (options.outputMode === "matchedOnly") return selectedRows.map((row) => formatValueForDisplay(row.value)).join("\n");

  if (options.outputMode === "jsonReport") {
    return JSON.stringify({
      totalRecords: allRows.length,
      matchedRecords: allRows.filter((row) => row.matched).length,
      rejectedRecords: allRows.filter((row) => !row.matched).length,
      selectedRecords,
      issues,
    }, null, 2);
  }

  if (options.outputMode === "markdown") {
    const lines = [
      "| Index | Matched | Value | Reason |",
      "|---:|---|---|---|",
      ...allRows.map((row) => `| ${row.index} | ${row.matched ? "yes" : "no"} | ${escapeMarkdown(formatValueForDisplay(row.value))} | ${escapeMarkdown(row.reason)} |`),
    ];
    if (issues.length) {
      lines.push("", "Notes:");
      issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
    }
    return lines.join("\n");
  }

  if (options.outputMode === "csv") {
    const rows = [["index", "matched", "value", "reason"]];
    allRows.forEach((row) => rows.push([String(row.index), row.matched ? "true" : "false", formatValueForDisplay(row.value), row.reason]));
    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }

  const lines = [
    "# JSON Array Filter Checklist",
    "",
    `- [${allRows.length ? "x" : " "}] Parsed ${allRows.length} record${allRows.length === 1 ? "" : "s"}.`,
    `- [${selectedRows.length ? "x" : " "}] Selected ${selectedRows.length} record${selectedRows.length === 1 ? "" : "s"} for output.`,
    `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] No high-severity filter issues found.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function buildIssues(rows: FilterResult[], options: {
  filterKey: string;
  operator: Operator;
  valueMode: ValueMode;
  filterValue: string;
  warnMissingKeys: boolean;
  warnTypeCoercion: boolean;
  warnRegexErrors: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnMissingKeys) {
    const missing = rows.filter((row) => row.value === undefined).length;
    if (missing) {
      issues.push({
        severity: "warning",
        title: "Missing filter keys",
        message: `${missing} record${missing === 1 ? "" : "s"} do not contain the selected key or dot path.`,
      });
    }
  }

  if (options.warnTypeCoercion && options.valueMode === "auto" && ["greaterThan", "lessThan", "between"].includes(options.operator)) {
    issues.push({
      severity: "info",
      title: "Numeric comparison",
      message: "Numeric comparisons coerce values with Number(). Check the preview if your data contains mixed text and numbers.",
    });
  }

  if (options.warnRegexErrors && options.operator === "regex") {
    try {
      new RegExp(options.filterValue);
    } catch {
      issues.push({
        severity: "high",
        title: "Invalid regex pattern",
        message: "The regex pattern could not be created. Check escaping and pattern syntax.",
      });
    }
  }

  if (rows.length > 1000) {
    issues.push({
      severity: "info",
      title: "Large JSON array",
      message: "This tool is best for quick browser-side filtering. Very large datasets may be better handled in a local script or database.",
    });
  }

  return issues;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated output is large. Consider limiting rows or exporting CSV for easier review.",
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

function formatValueForDisplay(value: unknown) {
  if (value === undefined) return "(missing)";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
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
