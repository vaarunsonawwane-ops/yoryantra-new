"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "jsonlToJson" | "jsonToJsonl" | "inspect";
type OutputMode = "pretty" | "compact" | "jsonl" | "markdown" | "csv" | "checklist";
type ErrorMode = "stop" | "continue";
type EmptyLineMode = "ignore" | "warn" | "null";

type LineRecord = {
  line: number;
  raw: string;
  valid: boolean;
  value: unknown;
  error: string;
  type: string;
  keyCount: number;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  records: LineRecord[];
  issues: Issue[];
  validCount: number;
  invalidCount: number;
  emptyLineCount: number;
  sourceLineCount: number;
  outputLength: number;
  detectedShape: string;
};

const MAX_INPUT_CHARS = 2_000_000;
const MAX_SOURCE_LINES = 20_000;
const MAX_JSON_DEPTH = 100;

const sampleInput = `{"id":1,"name":"Sneha","active":true}
{"id":2,"name":"Yoryantra","active":true}
{"id":3,"name":"Docs export","active":false}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("jsonlToJson");
  const [outputMode, setOutputMode] = useState<OutputMode>("pretty");
  const [errorMode, setErrorMode] = useState<ErrorMode>("stop");
  const [emptyLineMode, setEmptyLineMode] = useState<EmptyLineMode>("ignore");
  const [wrapAsObject, setWrapAsObject] = useState(false);
  const [includeLineNumbers, setIncludeLineNumbers] = useState(false);
  const [sortObjectKeys, setSortObjectKeys] = useState(false);
  const [warnMixedRecordTypes, setWarnMixedRecordTypes] = useState(true);
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

  const processInput = () => {
    if (!input.trim()) {
      setError("Paste JSON Lines, NDJSON, or JSON data first.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      actionMode,
      outputMode,
      errorMode,
      emptyLineMode,
      wrapAsObject,
      includeLineNumbers,
      sortObjectKeys,
      warnMixedRecordTypes,
    });

    setResult(next);
    setCopied(false);

    if (next.output.startsWith("__ERROR__:")) {
      setError(next.output.replace("__ERROR__:", ""));
      setOutput("");
      return;
    }

    if (actionMode !== "jsonToJsonl" && errorMode === "stop" && next.invalidCount > 0) {
      const firstInvalid = next.records.find((record) => !record.valid);
      setError(
        firstInvalid
          ? `Line ${firstInvalid.line}: ${firstInvalid.error}`
          : "The input contains an invalid JSON record."
      );
      setOutput("");
      return;
    }

    setError("");
    setOutput(next.output);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setActionMode("jsonlToJson");
    setOutputMode("pretty");
    setErrorMode("stop");
    setEmptyLineMode("ignore");
    setWrapAsObject(false);
    setIncludeLineNumbers(false);
    setSortObjectKeys(false);
    setWarnMixedRecordTypes(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("jsonlToJson");
    setOutputMode("pretty");
    setErrorMode("stop");
    setEmptyLineMode("ignore");
    setWrapAsObject(false);
    setIncludeLineNumbers(false);
    setSortObjectKeys(false);
    setWarnMixedRecordTypes(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Lines to JSON Converter"
      description="Move between one-record-per-line JSON and arrays without hiding malformed records."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            JSON Lines, NDJSON, or JSON
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            For JSON Lines input, keep each complete JSON value on one physical line.
          </p>
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleInput}
            spellCheck={false}
            className="mt-4 min-h-[420px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Record handling</h3>
          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Direction"
              value={actionMode}
              onChange={(value) => {
                const next = value as ActionMode;
                setActionMode(next);
                setOutputMode(next === "jsonToJsonl" ? "jsonl" : "pretty");
                clearResult();
              }}
              options={[
                { label: "JSON Lines → JSON array", value: "jsonlToJson" },
                { label: "JSON → JSON Lines", value: "jsonToJsonl" },
                { label: "Inspect JSON Lines", value: "inspect" },
              ]}
            />

            {actionMode !== "inspect" ? (
              <YoryantraSelect
                label="Output"
                value={outputMode}
                onChange={(value) => {
                  setOutputMode(value as OutputMode);
                  clearResult();
                }}
                options={[
                  { label: "Pretty JSON", value: "pretty" },
                  { label: "Compact JSON", value: "compact" },
                  { label: "JSON Lines", value: "jsonl" },
                  { label: "Markdown line report", value: "markdown" },
                  { label: "CSV line report", value: "csv" },
                  { label: "Validation checklist", value: "checklist" },
                ]}
              />
            ) : null}

            {actionMode !== "jsonToJsonl" ? (
              <>
                <YoryantraSelect
                  label="Malformed records"
                  value={errorMode}
                  onChange={(value) => {
                    setErrorMode(value as ErrorMode);
                    clearResult();
                  }}
                  options={[
                    { label: "Stop converted output", value: "stop" },
                    { label: "Continue with valid records", value: "continue" },
                  ]}
                />

                <YoryantraSelect
                  label="Blank physical lines"
                  value={emptyLineMode}
                  onChange={(value) => {
                    setEmptyLineMode(value as EmptyLineMode);
                    clearResult();
                  }}
                  options={[
                    { label: "Ignore them", value: "ignore" },
                    { label: "Skip and warn", value: "warn" },
                    { label: "Insert null records", value: "null" },
                  ]}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Output choices</h3>
        <div className="mt-4 grid items-start gap-x-8 gap-y-3 md:grid-cols-2">
          {actionMode === "jsonlToJson" && outputMode !== "jsonl" ? (
            <Toggle checked={wrapAsObject} onChange={setWrapAsObject} label="Wrap the array in a records object" />
          ) : null}
          {actionMode !== "inspect" ? (
            <Toggle
              checked={includeLineNumbers}
              onChange={setIncludeLineNumbers}
              label={
                actionMode === "jsonToJsonl"
                  ? "Wrap each output value with a generated record number"
                  : "Wrap each converted value with its source line number"
              }
            />
          ) : null}
          {actionMode !== "inspect" ? (
            <Toggle checked={sortObjectKeys} onChange={setSortObjectKeys} label="Sort object keys in generated output" />
          ) : null}
          {actionMode !== "jsonToJsonl" ? (
            <Toggle checked={warnMixedRecordTypes} onChange={setWarnMixedRecordTypes} label="Flag mixed JSON value types" />
          ) : null}
        </div>
      </div>

      {(includeLineNumbers || emptyLineMode === "null") && actionMode !== "inspect" ? (
        <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          These selections change the data shape. Line-number wrapping adds metadata, and inserting null for a blank line creates a value that was not present in valid JSON Lines input.
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={processInput} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          {actionMode === "inspect" ? "Inspect Records" : "Convert"}
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Reset
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Converted data or a line-by-line report, depending on the selected output.
                </p>
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
            <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-gray-950 p-4 font-mono text-sm leading-6 text-gray-100">
              {output || "No converted output is emitted while a blocking record error remains."}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Valid records" value={String(result.validCount)} />
            <StatCard label="Malformed lines" value={String(result.invalidCount)} />
            <StatCard label="Blank lines" value={String(result.emptyLineCount)} />
            <StatCard label="Detected shape" value={result.detectedShape} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">What needs attention</h3>
          <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
            {notes.map((note) => (
              <IssueCard key={`${note.title}-${note.message}`} issue={note} />
            ))}
          </div>
        </div>
      ) : null}

      {result?.records.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Source-line inspection</h3>
          <p className="mt-1 text-sm text-gray-500">
            The first 100 parsed or rejected records are shown without rendering their contents as HTML.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[760px] divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Keys</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.records.slice(0, 100).map((record) => (
                  <tr key={`${record.line}-${record.raw.slice(0, 24)}`}>
                    <td className="px-4 py-3 font-mono text-gray-500">{record.line}</td>
                    <td className="px-4 py-3">{record.valid ? "Valid" : "Invalid"}</td>
                    <td className="px-4 py-3 font-mono">{record.type}</td>
                    <td className="px-4 py-3">{record.keyCount || "-"}</td>
                    <td className="max-w-[360px] break-words px-4 py-3">
                      {record.valid ? "Parsed without lossy JSON normalization" : record.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.records.length > 100 ? (
            <p className="mt-3 text-sm text-gray-500">Only the first 100 records are rendered in the table; conversion still uses the full accepted input.</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing and conversion happen in your browser. The page does not send the pasted JSON to a conversion API; avoid pasting secrets into any browser page you do not trust.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">The line break is part of the format</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON Lines is not a JSON array with the brackets removed. Each non-blank physical line is its own complete JSON value. That makes records convenient to stream, append, grep, or process one at a time, but it also means a pretty-printed multi-line object is not one valid JSON Lines record.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A final newline is normal and is not counted here as an empty record. Blank lines inside the data are different: the JSON Lines documentation says each line must contain a JSON value, so an internal blank line is either skipped or deliberately converted to null according to the policy you choose.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Conversion should not silently rewrite valid-looking data</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript&apos;s JSON parser can collapse duplicate object member names and can round numbers that carry more precision than its number type can represent exactly. A formatter that parses and serializes such input can therefore change the data even though parsing appears to succeed. Before conversion, each record is checked for duplicate decoded member names, negative zero normalization, non-finite conversion, excessive nesting, and precision-sensitive numeric tokens.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 8259 recommends unique object member names and discusses the interoperability limits of numbers beyond common IEEE 754 binary64 precision. If a long numeric identifier must retain every digit, store it as a JSON string rather than relying on a generic JavaScript-number round trip.{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc8259.html" target="_blank" rel="noreferrer">RFC 8259</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Stopping and continuing mean different things</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Stopping on malformed input keeps the converter from presenting a partial array as though it represented the whole source. Continue mode is useful when you are diagnosing a large export and deliberately want the valid subset, but the result is marked as partial and the rejected lines stay visible in the inspection report.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Adding source-line metadata is also explicit because it changes every record from its original value into an object containing a line number and value. That can be useful during debugging, but it should not be mistaken for a lossless representation of the source data model.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">From an array back to JSON Lines</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Array-to-lines mode serializes every array element as one compact JSON value. A single non-array JSON value becomes one output line rather than being rejected. Objects, arrays, strings, numbers, booleans, and null are all JSON values; downstream systems sometimes impose a stricter object-only rule, so check the receiving system before assuming every valid JSON Lines value is accepted there.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Format notes worth keeping nearby</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            The JSON Lines documentation specifies UTF-8, one valid JSON value per line, and a line terminator convention. It also says a UTF-8 BOM must not be included. This page treats a BOM at the beginning of the first record as an error rather than quietly stripping it.{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://jsonlines.org/" target="_blank" rel="noreferrer">JSON Lines format notes</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser limits are deliberate</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The page caps pasted input at {MAX_INPUT_CHARS.toLocaleString()} characters, {MAX_SOURCE_LINES.toLocaleString()} physical lines, and {MAX_JSON_DEPTH} nested JSON levels. Those limits keep accidental multi-megabyte pastes or deeply nested records from turning a quick inspection into a frozen tab. Large production streams are better handled incrementally with a streaming parser or command-line pipeline.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-lines-to-json-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  outputMode: OutputMode;
  errorMode: ErrorMode;
  emptyLineMode: EmptyLineMode;
  wrapAsObject: boolean;
  includeLineNumbers: boolean;
  sortObjectKeys: boolean;
  warnMixedRecordTypes: boolean;
}): Result {
  if (options.input.length > MAX_INPUT_CHARS) {
    return emptyResult(`__ERROR__:Input is larger than ${MAX_INPUT_CHARS.toLocaleString()} characters, beyond this browser conversion limit.`);
  }

  if (options.actionMode === "jsonToJsonl") {
    return convertJsonToJsonl(options);
  }

  let parsed: ReturnType<typeof parseJsonLines>;
  try {
    parsed = parseJsonLines(options.input, options.emptyLineMode);
  } catch (error) {
    return emptyResult(`__ERROR__:${error instanceof Error ? error.message : "Unable to inspect the JSON Lines input."}`);
  }
  const validRecords = parsed.records.filter((record) => record.valid);
  const invalidRecords = parsed.records.filter((record) => !record.valid);
  const values = validRecords.map((record) => record.value);
  const issues = buildIssues({
    records: parsed.records,
    emptyLineCount: parsed.emptyLineCount,
    emptyLineMode: options.emptyLineMode,
    errorMode: options.errorMode,
    warnMixedRecordTypes: options.warnMixedRecordTypes,
  });

  let output = "";
  if (options.errorMode === "stop" && invalidRecords.length > 0) {
    output = "";
  } else if (options.actionMode === "inspect") {
    output = formatInspection(parsed.records, issues);
  } else {
    const converted = buildConvertedValue(validRecords, options);
    output = formatOutput(converted, parsed.records, issues, options.outputMode);
  }

  return {
    output,
    records: parsed.records,
    issues,
    validCount: validRecords.length,
    invalidCount: invalidRecords.length,
    emptyLineCount: parsed.emptyLineCount,
    sourceLineCount: parsed.sourceLineCount,
    outputLength: output.length,
    detectedShape: detectShape(values),
  };
}

function convertJsonToJsonl(options: {
  input: string;
  outputMode: OutputMode;
  includeLineNumbers: boolean;
  sortObjectKeys: boolean;
}): Result {
  try {
    assertLosslessJsonText(options.input, "Input JSON");
    const parsed = JSON.parse(options.input) as unknown;
    const values = Array.isArray(parsed) ? parsed : [parsed];
    const normalized = values.map((value, index) => {
      const prepared = options.sortObjectKeys ? sortDeep(value) : value;
      return options.includeLineNumbers ? { record: index + 1, value: prepared } : prepared;
    });
    const records = makeRecordsFromValues(normalized);
    const issues: Issue[] = [];

    if (!Array.isArray(parsed)) {
      issues.push({
        severity: "info",
        title: "Single JSON value",
        message: "The input is not an array, so it becomes one JSON Lines record.",
      });
    }

    let output: string;
    if (options.outputMode === "pretty") {
      output = JSON.stringify(normalized, null, 2);
    } else if (options.outputMode === "compact") {
      output = JSON.stringify(normalized);
    } else if (options.outputMode === "markdown") {
      output = buildMarkdownSummary(records, issues);
    } else if (options.outputMode === "csv") {
      output = buildCsvSummary(records);
    } else if (options.outputMode === "checklist") {
      output = buildChecklistOutput(records, issues);
    } else {
      output = normalized.map((value) => JSON.stringify(value)).join("\n");
    }

    return {
      output,
      records,
      issues,
      validCount: records.length,
      invalidCount: 0,
      emptyLineCount: 0,
      sourceLineCount: Array.isArray(parsed) ? values.length : 1,
      outputLength: output.length,
      detectedShape: Array.isArray(parsed) ? "JSON array" : "single JSON value",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The input is not valid JSON.";
    return emptyResult(`__ERROR__:${message}`);
  }
}

function parseJsonLines(input: string, emptyLineMode: EmptyLineMode) {
  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  if (normalized.endsWith("\n")) lines.pop();

  if (lines.length > MAX_SOURCE_LINES) {
    throw new Error(`Input contains more than ${MAX_SOURCE_LINES.toLocaleString()} physical lines.`);
  }

  const records: LineRecord[] = [];
  let emptyLineCount = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (!trimmed) {
      emptyLineCount += 1;
      if (emptyLineMode === "null") {
        records.push({ line: lineNumber, raw: line, valid: true, value: null, error: "", type: "null", keyCount: 0 });
      }
      return;
    }

    try {
      if (lineNumber === 1 && line.charCodeAt(0) === 0xfeff) {
        throw new Error("UTF-8 BOM (U+FEFF) is not permitted at the start of JSON Lines data.");
      }
      assertLosslessJsonText(trimmed, `Line ${lineNumber}`);
      const value = JSON.parse(trimmed) as unknown;
      records.push({
        line: lineNumber,
        raw: line,
        valid: true,
        value,
        error: "",
        type: valueType(value),
        keyCount: keyCount(value),
      });
    } catch (error) {
      records.push({
        line: lineNumber,
        raw: line,
        valid: false,
        value: null,
        error: error instanceof Error ? error.message : "Invalid JSON value.",
        type: "invalid",
        keyCount: 0,
      });
    }
  });

  return { records, emptyLineCount, sourceLineCount: lines.length };
}

function buildConvertedValue(records: LineRecord[], options: {
  outputMode: OutputMode;
  wrapAsObject: boolean;
  includeLineNumbers: boolean;
  sortObjectKeys: boolean;
}) {
  const prepared = records.map((record) => {
    const value = options.sortObjectKeys ? sortDeep(record.value) : record.value;
    return options.includeLineNumbers ? { line: record.line, value } : value;
  });

  if (options.wrapAsObject && options.outputMode !== "jsonl") {
    return { records: prepared, count: prepared.length };
  }
  return prepared;
}

function formatOutput(value: unknown, records: LineRecord[], issues: Issue[], outputMode: OutputMode) {
  if (outputMode === "pretty") return JSON.stringify(value, null, 2);
  if (outputMode === "compact") return JSON.stringify(value);
  if (outputMode === "jsonl") {
    const list = Array.isArray(value) ? value : [value];
    return list.map((item) => JSON.stringify(item)).join("\n");
  }
  if (outputMode === "markdown") return buildMarkdownSummary(records, issues);
  if (outputMode === "csv") return buildCsvSummary(records);
  return buildChecklistOutput(records, issues);
}

function formatInspection(records: LineRecord[], issues: Issue[]) {
  const lines = [
    "# JSON Lines Inspection",
    "",
    `Valid records: ${records.filter((record) => record.valid).length}`,
    `Invalid records: ${records.filter((record) => !record.valid).length}`,
    "",
    "| Line | Status | Type | Keys | Message |",
    "|---:|---|---|---:|---|",
  ];
  records.forEach((record) => {
    lines.push(`| ${record.line} | ${record.valid ? "Valid" : "Invalid"} | ${escapeMarkdown(record.type)} | ${record.keyCount || 0} | ${escapeMarkdown(record.valid ? "Parsed" : record.error)} |`);
  });
  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }
  return lines.join("\n");
}

function buildMarkdownSummary(records: LineRecord[], issues: Issue[]) {
  const lines = ["| Line | Status | Type | Keys | Message |", "|---:|---|---|---:|---|"];
  records.forEach((record) => {
    lines.push(`| ${record.line} | ${record.valid ? "Valid" : "Invalid"} | ${escapeMarkdown(record.type)} | ${record.keyCount || 0} | ${escapeMarkdown(record.valid ? "Parsed" : record.error)} |`);
  });
  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }
  return lines.join("\n");
}

function buildCsvSummary(records: LineRecord[]) {
  const rows = [["line", "status", "type", "key_count", "message"]];
  records.forEach((record) => {
    rows.push([String(record.line), record.valid ? "valid" : "invalid", record.type, String(record.keyCount || 0), record.valid ? "parsed" : record.error]);
  });
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildChecklistOutput(records: LineRecord[], issues: Issue[]) {
  const valid = records.filter((record) => record.valid).length;
  const invalid = records.filter((record) => !record.valid);
  const lines = [
    "# JSON Lines Validation Checklist",
    "",
    `- [${valid > 0 ? "x" : " "}] ${valid} valid JSON record${valid === 1 ? "" : "s"} parsed.`,
    `- [${invalid.length === 0 ? "x" : " "}] No malformed records remain.`,
  ];
  if (invalid.length) {
    lines.push("", "Malformed records:");
    invalid.slice(0, 20).forEach((record) => lines.push(`- Line ${record.line}: ${record.error}`));
  }
  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }
  return lines.join("\n");
}

function buildIssues(options: {
  records: LineRecord[];
  emptyLineCount: number;
  emptyLineMode: EmptyLineMode;
  errorMode: ErrorMode;
  warnMixedRecordTypes: boolean;
}): Issue[] {
  const issues: Issue[] = [];
  const invalid = options.records.filter((record) => !record.valid);
  const valid = options.records.filter((record) => record.valid);

  if (invalid.length) {
    issues.push({
      severity: "high",
      title: "Malformed JSON records",
      message: `${invalid.length} source line${invalid.length === 1 ? "" : "s"} cannot be converted without first resolving the reported JSON problem${invalid.length === 1 ? "" : "s"}.`,
    });
    if (options.errorMode === "continue") {
      issues.push({
        severity: "warning",
        title: "Converted data is partial",
        message: "Continue mode excludes malformed source lines from converted data while keeping them visible in the report.",
      });
    }
  }

  if (options.emptyLineCount && options.emptyLineMode === "warn") {
    issues.push({
      severity: "warning",
      title: "Blank lines were skipped",
      message: `${options.emptyLineCount} internal blank line${options.emptyLineCount === 1 ? "" : "s"} were not treated as JSON values.`,
    });
  }

  if (options.emptyLineCount && options.emptyLineMode === "null") {
    issues.push({
      severity: "warning",
      title: "Blank lines became null",
      message: `${options.emptyLineCount} blank line${options.emptyLineCount === 1 ? "" : "s"} were converted into explicit null values.`,
    });
  }

  if (options.warnMixedRecordTypes) {
    const types = Array.from(new Set(valid.map((record) => record.type)));
    if (types.length > 1) {
      issues.push({
        severity: "warning",
        title: "Mixed JSON value types",
        message: `Accepted records include ${types.join(", ")}. Confirm the receiving system accepts that mixture.`,
      });
    }
  }

  return issues;
}

function getNotes(result: Result): Issue[] {
  const notes = result.issues.slice();
  if (result.validCount > 1_000) {
    notes.push({
      severity: "info",
      title: "Large record set",
      message: "A streaming parser is a better fit than a browser textarea for very large production JSON Lines files.",
    });
  }
  if (result.outputLength > 100_000) {
    notes.push({
      severity: "info",
      title: "Large generated text",
      message: "Copying or pasting the generated output may be slower in some editors.",
    });
  }
  return notes;
}

function emptyResult(output: string): Result {
  return {
    output,
    records: [],
    issues: [],
    validCount: 0,
    invalidCount: 0,
    emptyLineCount: 0,
    sourceLineCount: 0,
    outputLength: 0,
    detectedShape: "none",
  };
}

function detectShape(values: unknown[]) {
  if (!values.length) return "no accepted records";
  const types = Array.from(new Set(values.map(valueType)));
  if (types.length === 1 && types[0] === "object") return "object records";
  if (types.length === 1) return `${types[0]} records`;
  return "mixed records";
}

function valueType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function keyCount(value: unknown) {
  return isPlainObject(value) ? Object.keys(value as Record<string, unknown>).length : 0;
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (isPlainObject(value)) {
    const source = value as Record<string, unknown>;
    const target = createSafeObject();
    Object.keys(source).sort(compareUtf16).forEach((key) => setOwn(target, key, sortDeep(source[key])));
    return target;
  }
  return value;
}

function makeRecordsFromValues(values: unknown[]): LineRecord[] {
  return values.map((value, index) => ({
    line: index + 1,
    raw: JSON.stringify(value),
    valid: true,
    value,
    error: "",
    type: valueType(value),
    keyCount: keyCount(value),
  }));
}

function assertLosslessJsonText(text: string, label: string) {
  try {
    JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : "parse failed"}`);
  }

  const stack: Array<{ type: "object" | "array"; keys?: Set<string> }> = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === "{") {
      stack.push({ type: "object", keys: new Set<string>() });
      if (stack.length > MAX_JSON_DEPTH) throw new Error(`${label} is nested more than ${MAX_JSON_DEPTH} levels.`);
      index += 1;
      continue;
    }
    if (char === "[") {
      stack.push({ type: "array" });
      if (stack.length > MAX_JSON_DEPTH) throw new Error(`${label} is nested more than ${MAX_JSON_DEPTH} levels.`);
      index += 1;
      continue;
    }
    if (char === "}" || char === "]") {
      stack.pop();
      index += 1;
      continue;
    }
    if (char === '"') {
      const end = findJsonStringEnd(text, index);
      const token = text.slice(index, end + 1);
      let next = end + 1;
      while (next < text.length && /\s/.test(text[next])) next += 1;
      const frame = stack[stack.length - 1];
      if (frame?.type === "object" && text[next] === ":") {
        const key = JSON.parse(token) as string;
        if (frame.keys?.has(key)) throw new Error(`${label} contains duplicate member ${JSON.stringify(key)}, which JavaScript parsing would collapse.`);
        frame.keys?.add(key);
      }
      index = end + 1;
      continue;
    }
    if (char === "-" || /\d/.test(char)) {
      const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (match) {
        const token = match[0];
        const numericValue = Number(token);
        if (!isSafeNumberToken(token, numericValue)) {
          throw new Error(`${label} contains JSON number ${token}, which cannot be rewritten safely with JavaScript number semantics. Keep precision-sensitive identifiers as strings.`);
        }
        index += token.length;
        continue;
      }
    }
    index += 1;
  }
}

function findJsonStringEnd(text: string, start: number) {
  let escaped = false;
  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') return index;
  }
  return text.length - 1;
}

function isSafeNumberToken(token: string, numericValue: number) {
  if (!Number.isFinite(numericValue) || Object.is(numericValue, -0)) return false;
  if (/^-?(?:0|[1-9]\d*)$/.test(token)) return Number.isSafeInteger(numericValue);
  const significantDigits = token.replace(/^[+-]/, "").split(/[eE]/)[0].replace(".", "").replace(/^0+/, "").length;
  if (significantDigits > 15) return false;
  if (numericValue === 0 && /[1-9]/.test(token)) return false;
  return true;
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createSafeObject() {
  return Object.create(null) as Record<string, unknown>;
}

function setOwn(target: Record<string, unknown>, key: string, value: unknown) {
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
}

function compareUtf16(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
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
    <div className="self-start rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const className = issue.severity === "high"
    ? "self-start rounded-xl border border-red-200 bg-red-50 p-4"
    : issue.severity === "warning"
      ? "self-start rounded-xl border border-amber-200 bg-amber-50 p-4"
      : "self-start rounded-xl border border-gray-200 bg-gray-50 p-4";
  const titleClass = issue.severity === "high" ? "text-red-800" : issue.severity === "warning" ? "text-amber-900" : "text-gray-900";
  const bodyClass = issue.severity === "high" ? "text-red-700" : issue.severity === "warning" ? "text-amber-800" : "text-gray-600";
  return (
    <div className={className}>
      <p className={`text-sm font-semibold ${titleClass}`}>{issue.title}</p>
      <p className={`mt-1 text-sm leading-6 ${bodyClass}`}>{issue.message}</p>
    </div>
  );
}
