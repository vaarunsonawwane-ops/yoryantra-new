"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "jsonlToJson" | "jsonToJsonl" | "inspect";
type OutputMode = "pretty" | "compact" | "jsonl" | "markdown" | "csv" | "checklist";
type ErrorMode = "stop" | "skip" | "keep";
type EmptyLineMode = "ignore" | "warn" | "record";

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
  inputLength: number;
  validCount: number;
  invalidCount: number;
  emptyLineCount: number;
  outputLength: number;
  detectedShape: string;
};

const sampleInput = `{"id":1,"name":"Yoryantra","category":"JSON & Data","active":true}
{"id":2,"name":"API Tools","category":"Developer","active":true}
{"id":3,"name":"Encoding Tools","category":"Encoding","active":false}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("jsonlToJson");
  const [outputMode, setOutputMode] = useState<OutputMode>("pretty");
  const [errorMode, setErrorMode] = useState<ErrorMode>("stop");
  const [emptyLineMode, setEmptyLineMode] = useState<EmptyLineMode>("ignore");
  const [trimLines, setTrimLines] = useState(true);
  const [wrapAsObject, setWrapAsObject] = useState(false);
  const [includeLineNumbers, setIncludeLineNumbers] = useState(false);
  const [preserveInvalidLines, setPreserveInvalidLines] = useState(false);
  const [sortObjectKeys, setSortObjectKeys] = useState(false);
  const [escapeSlashes, setEscapeSlashes] = useState(false);
  const [warnMixedRecordTypes, setWarnMixedRecordTypes] = useState(true);
  const [warnLargeRecords, setWarnLargeRecords] = useState(true);
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
      setError("Please paste JSON Lines, NDJSON, or a JSON array to convert.");
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
      trimLines,
      wrapAsObject,
      includeLineNumbers,
      preserveInvalidLines,
      sortObjectKeys,
      escapeSlashes,
      warnMixedRecordTypes,
      warnLargeRecords,
    });

    if (next.invalidCount > 0 && errorMode === "stop" && actionMode !== "jsonToJsonl") {
      const firstInvalid = next.records.find((record) => !record.valid);
      setError(firstInvalid ? `Line ${firstInvalid.line} is not valid JSON: ${firstInvalid.error}` : "The input contains invalid JSON lines.");
      setResult(next);
      setOutput(next.output);
      setCopied(false);
      return;
    }

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
    setActionMode("jsonlToJson");
    setOutputMode("pretty");
    setErrorMode("stop");
    setEmptyLineMode("ignore");
    setTrimLines(true);
    setWrapAsObject(false);
    setIncludeLineNumbers(false);
    setPreserveInvalidLines(false);
    setSortObjectKeys(false);
    setEscapeSlashes(false);
    setWarnMixedRecordTypes(true);
    setWarnLargeRecords(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("jsonlToJson");
    setOutputMode("pretty");
    setErrorMode("stop");
    setEmptyLineMode("ignore");
    setTrimLines(true);
    setWrapAsObject(false);
    setIncludeLineNumbers(false);
    setPreserveInvalidLines(false);
    setSortObjectKeys(false);
    setEscapeSlashes(false);
    setWarnMixedRecordTypes(true);
    setWarnLargeRecords(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Lines to JSON Converter"
      description="Convert JSON Lines and NDJSON into JSON arrays, inspect each record, or convert JSON arrays back into newline-delimited JSON locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Lines, NDJSON, or JSON Array</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste one JSON value per line, newline-delimited records from logs or exports, or a JSON array you want to turn into JSONL.
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
          <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                const nextAction = value as ActionMode;
                setActionMode(nextAction);
                if (nextAction === "jsonToJsonl") {
                  setOutputMode("jsonl");
                } else if (outputMode === "jsonl") {
                  setOutputMode("pretty");
                }
                clearResult();
              }}
              options={[
                { label: "JSON Lines to JSON array", value: "jsonlToJson" },
                { label: "JSON array to JSON Lines", value: "jsonToJsonl" },
                { label: "Inspect JSON Lines", value: "inspect" },
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
                { label: "Pretty JSON", value: "pretty" },
                { label: "Compact JSON", value: "compact" },
                { label: "JSON Lines", value: "jsonl" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV summary", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Invalid Line Handling"
              value={errorMode}
              onChange={(value) => {
                setErrorMode(value as ErrorMode);
                clearResult();
              }}
              options={[
                { label: "Stop on first invalid line", value: "stop" },
                { label: "Skip invalid lines", value: "skip" },
                { label: "Keep invalid lines in report", value: "keep" },
              ]}
            />

            <YoryantraSelect
              label="Empty Lines"
              value={emptyLineMode}
              onChange={(value) => {
                setEmptyLineMode(value as EmptyLineMode);
                clearResult();
              }}
              options={[
                { label: "Ignore empty lines", value: "ignore" },
                { label: "Warn about empty lines", value: "warn" },
                { label: "Treat as null records", value: "record" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimLines} onChange={setTrimLines} label="Trim whitespace around each line" />
          <Toggle checked={wrapAsObject} onChange={setWrapAsObject} label="Wrap converted array in a records object" />
          <Toggle checked={includeLineNumbers} onChange={setIncludeLineNumbers} label="Include original line numbers" />
          <Toggle checked={preserveInvalidLines} onChange={setPreserveInvalidLines} label="Preserve invalid lines in reports" />
          <Toggle checked={sortObjectKeys} onChange={setSortObjectKeys} label="Sort object keys in output" />
          <Toggle checked={escapeSlashes} onChange={setEscapeSlashes} label="Escape forward slashes in JSON output" />
          <Toggle checked={warnMixedRecordTypes} onChange={setWarnMixedRecordTypes} label="Warn about mixed record types" />
          <Toggle checked={warnLargeRecords} onChange={setWarnLargeRecords} label="Warn about unusually large records" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options help clean pasted JSONL, keep source line references, and make exported data easier to review before copying it elsewhere.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processInput}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Convert JSON Lines
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
                <p className="mt-1 text-sm text-gray-500">Converted JSON, JSON Lines, or formatted inspection output.</p>
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
              {output || "Fix the reported issue, then run the converter again."}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Valid records" value={String(result.validCount)} />
            <StatCard label="Invalid lines" value={String(result.invalidCount)} />
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

      {result?.records.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Line Inspection</h3>
          <p className="mt-1 text-sm text-gray-500">
            Showing parsed line status, value type, and parse errors for the first 100 records.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
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
                  <tr key={`${record.line}-${record.raw.slice(0, 20)}`}>
                    <td className="px-4 py-3 font-mono text-gray-500">{record.line}</td>
                    <td className="px-4 py-3">{record.valid ? "Valid" : "Invalid"}</td>
                    <td className="px-4 py-3 font-mono">{record.type}</td>
                    <td className="px-4 py-3">{record.keyCount || "-"}</td>
                    <td className="px-4 py-3">{record.valid ? "Parsed successfully" : record.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.records.length > 100 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 100 records to keep the table readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Converting JSON Lines Into Usable JSON</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Lines and NDJSON files store one JSON value per line. This format is common in logs, exports, streaming APIs, analytics data, queues, and data pipelines because each record can be processed independently.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This converter helps turn newline-delimited records into a normal JSON array, inspect line-by-line parse problems, or convert a JSON array back into compact JSON Lines for tools that expect one record per line.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This JSON Lines Converter Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Turning log exports, analytics events, or streamed API records into a JSON array you can inspect or share.</p>
            <p className="mt-2">Checking which line in a JSONL or NDJSON file is broken before importing it into another tool.</p>
            <p className="mt-2">Converting a JSON array into newline-delimited records for pipelines, data scripts, queues, and command-line workflows.</p>
            <p className="mt-2">Creating Markdown, CSV, or checklist summaries before copying the data into documentation or issue reports.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the JSON Lines to JSON Converter</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste JSON Lines, NDJSON, or a JSON array into the input box.</li>
            <li>Choose whether to convert JSONL to a JSON array, convert an array to JSONL, or inspect records.</li>
            <li>Select how invalid lines and empty lines should be handled.</li>
            <li>Use the options to keep line numbers, sort object keys, or wrap records in an object.</li>
            <li>Review the output and line inspection table before copying the result.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example JSON Lines Input</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`{"id":1,"event":"page_view"}
{"id":2,"event":"scroll"}
{"id":3,"event":"conversion"}`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON Lines and NDJSON Are Not the Same as One Big JSON File</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A normal JSON document has one top-level value, often an object or array. JSON Lines and NDJSON use separate JSON values on separate lines. That makes the format convenient for large streams and append-only logs, but many tools need it converted into an array before they can read it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does this JSON Lines converter do?">
              It converts one-JSON-value-per-line text into a JSON array, or converts a JSON array back into newline-delimited JSON records.
            </Faq>
            <Faq title="Is JSON Lines the same as NDJSON?">
              They are commonly used to describe the same style of newline-delimited JSON records. Each non-empty line should contain one valid JSON value.
            </Faq>
            <Faq title="Can this find the broken line in a JSONL file?">
              Yes. The line inspection table shows which lines parsed successfully and which lines have JSON parse errors.
            </Faq>
            <Faq title="Can I convert a JSON array into JSON Lines?">
              Yes. Choose the JSON array to JSON Lines action and the tool will output one compact JSON value per line.
            </Faq>
            <Faq title="Is anything uploaded while converting JSON Lines?">
              No. The conversion runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            JSON Lines work often connects with formatting, validation, path testing, conversion, and structured data cleanup.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/ndjson-formatter-validator" className="yoryantra-btn-outline">NDJSON Formatter Validator</Link>
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">JSON Formatter</Link>
            <Link href="/tools/json-validator" className="yoryantra-btn-outline">JSON Validator</Link>
            <Link href="/tools/json-to-csv-converter" className="yoryantra-btn-outline">JSON to CSV Converter</Link>
            <Link href="/tools/json-path-tester" className="yoryantra-btn-outline">JSON Path Tester</Link>
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
  trimLines: boolean;
  wrapAsObject: boolean;
  includeLineNumbers: boolean;
  preserveInvalidLines: boolean;
  sortObjectKeys: boolean;
  escapeSlashes: boolean;
  warnMixedRecordTypes: boolean;
  warnLargeRecords: boolean;
}): Result {
  if (options.actionMode === "jsonToJsonl") {
    return convertJsonToJsonl(options);
  }

  const records = parseJsonLines(options);
  const validValues = records.filter((record) => record.valid).map((record) => record.value);
  const invalidCount = records.filter((record) => !record.valid).length;
  const emptyLineCount = countEmptyLines(options.input);
  const detectedShape = detectShape(validValues);

  const issues = buildIssues({
    records,
    emptyLineCount,
    warnMixedRecordTypes: options.warnMixedRecordTypes,
    warnLargeRecords: options.warnLargeRecords,
  });

  let output = "";
  if (options.errorMode === "stop" && invalidCount > 0) {
    output = buildChecklistOutput(records, issues);
  } else if (options.actionMode === "inspect") {
    output = formatInspection(records, issues);
  } else {
    const converted = buildConvertedValue(validValues, records, options);
    output = formatOutput(converted, records, issues, options);
  }

  return {
    output,
    records,
    issues,
    inputLength: options.input.length,
    validCount: validValues.length,
    invalidCount,
    emptyLineCount,
    outputLength: output.length,
    detectedShape,
  };
}

function convertJsonToJsonl(options: {
  input: string;
  outputMode: OutputMode;
  sortObjectKeys: boolean;
  escapeSlashes: boolean;
  wrapAsObject: boolean;
  includeLineNumbers: boolean;
}): Result {
  const issues: Issue[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(options.input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON input.";
    return {
      output: `__ERROR__:The input is not valid JSON: ${message}`,
      records: [],
      issues: [{ severity: "high", title: "Invalid JSON", message }],
      inputLength: options.input.length,
      validCount: 0,
      invalidCount: 1,
      emptyLineCount: 0,
      outputLength: 0,
      detectedShape: "invalid JSON",
    };
  }

  const values = Array.isArray(parsed) ? parsed : [parsed];
  if (!Array.isArray(parsed)) {
    issues.push({
      severity: "info",
      title: "Single JSON value",
      message: "The input was not an array, so the tool exported it as one JSON Lines record.",
    });
  }

  const normalizedValues = values.map((value, index) => {
    const prepared = options.sortObjectKeys ? sortDeep(value) : value;
    return options.includeLineNumbers ? { line: index + 1, value: prepared } : prepared;
  });

  let output = normalizedValues.map((value) => stringifyJson(value, 0, options.escapeSlashes)).join("\n");

  if (options.outputMode === "pretty") {
    output = stringifyJson(normalizedValues, 2, options.escapeSlashes);
  } else if (options.outputMode === "compact") {
    output = stringifyJson(normalizedValues, 0, options.escapeSlashes);
  } else if (options.outputMode === "markdown") {
    output = buildMarkdownSummary(makeRecordsFromValues(normalizedValues), issues);
  } else if (options.outputMode === "csv") {
    output = buildCsvSummary(makeRecordsFromValues(normalizedValues));
  } else if (options.outputMode === "checklist") {
    output = buildChecklistOutput(makeRecordsFromValues(normalizedValues), issues);
  }

  return {
    output,
    records: makeRecordsFromValues(normalizedValues),
    issues,
    inputLength: options.input.length,
    validCount: normalizedValues.length,
    invalidCount: 0,
    emptyLineCount: 0,
    outputLength: output.length,
    detectedShape: Array.isArray(parsed) ? "JSON array" : "single JSON value",
  };
}

function parseJsonLines(options: {
  input: string;
  errorMode: ErrorMode;
  emptyLineMode: EmptyLineMode;
  trimLines: boolean;
  preserveInvalidLines: boolean;
}): LineRecord[] {
  const lines = options.input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const records: LineRecord[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const raw = options.trimLines ? line.trim() : line;

    if (!raw) {
      if (options.emptyLineMode === "record") {
        records.push({
          line: lineNumber,
          raw: line,
          valid: true,
          value: null,
          error: "",
          type: "null",
          keyCount: 0,
        });
      } else if (options.emptyLineMode === "warn") {
        records.push({
          line: lineNumber,
          raw: line,
          valid: false,
          value: null,
          error: "Empty line",
          type: "empty",
          keyCount: 0,
        });
      }
      return;
    }

    try {
      const value = JSON.parse(raw);
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
      const message = error instanceof Error ? error.message : "Invalid JSON";
      records.push({
        line: lineNumber,
        raw: line,
        valid: false,
        value: options.preserveInvalidLines ? raw : null,
        error: message,
        type: "invalid",
        keyCount: 0,
      });
    }
  });

  return records;
}

function buildConvertedValue(values: unknown[], records: LineRecord[], options: {
  wrapAsObject: boolean;
  includeLineNumbers: boolean;
  sortObjectKeys: boolean;
}) {
  const prepared = values.map((value, index) => {
    const sortedValue = options.sortObjectKeys ? sortDeep(value) : value;
    if (!options.includeLineNumbers) return sortedValue;
    const sourceLine = records.filter((record) => record.valid)[index]?.line ?? index + 1;
    return { line: sourceLine, value: sortedValue };
  });

  if (options.wrapAsObject) {
    return {
      records: prepared,
      count: prepared.length,
    };
  }

  return prepared;
}

function formatOutput(value: unknown, records: LineRecord[], issues: Issue[], options: {
  outputMode: OutputMode;
  escapeSlashes: boolean;
}) {
  if (options.outputMode === "pretty") {
    return stringifyJson(value, 2, options.escapeSlashes);
  }
  if (options.outputMode === "compact") {
    return stringifyJson(value, 0, options.escapeSlashes);
  }
  if (options.outputMode === "jsonl") {
    const list = Array.isArray(value) ? value : [value];
    return list.map((item) => stringifyJson(item, 0, options.escapeSlashes)).join("\n");
  }
  if (options.outputMode === "markdown") {
    return buildMarkdownSummary(records, issues);
  }
  if (options.outputMode === "csv") {
    return buildCsvSummary(records);
  }
  return buildChecklistOutput(records, issues);
}

function formatInspection(records: LineRecord[], issues: Issue[]) {
  const lines = [
    "# JSON Lines Inspection",
    "",
    `Total records inspected: ${records.length}`,
    `Valid records: ${records.filter((record) => record.valid).length}`,
    `Invalid lines: ${records.filter((record) => !record.valid).length}`,
    "",
    "## Line Summary",
    "",
    "| Line | Status | Type | Keys | Message |",
    "|---:|---|---|---:|---|",
    ...records.map((record) => `| ${record.line} | ${record.valid ? "Valid" : "Invalid"} | ${escapeMarkdown(record.type)} | ${record.keyCount || 0} | ${escapeMarkdown(record.valid ? "Parsed" : record.error)} |`),
  ];

  if (issues.length) {
    lines.push("", "## Notes", "", ...issues.map((issue) => `- **${issue.title}:** ${issue.message}`));
  }

  return lines.join("\n");
}

function buildMarkdownSummary(records: LineRecord[], issues: Issue[]) {
  const lines = [
    "| Line | Status | Type | Keys | Message |",
    "|---:|---|---|---:|---|",
    ...records.map((record) => `| ${record.line} | ${record.valid ? "Valid" : "Invalid"} | ${escapeMarkdown(record.type)} | ${record.keyCount || 0} | ${escapeMarkdown(record.valid ? "Parsed" : record.error)} |`),
  ];

  if (issues.length) {
    lines.push("", "Notes:", ...issues.map((issue) => `- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function buildCsvSummary(records: LineRecord[]) {
  const rows = [["line", "status", "type", "key_count", "message"]];
  records.forEach((record) => {
    rows.push([
      String(record.line),
      record.valid ? "valid" : "invalid",
      record.type,
      String(record.keyCount || 0),
      record.valid ? "parsed" : record.error,
    ]);
  });
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function buildChecklistOutput(records: LineRecord[], issues: Issue[]) {
  const validCount = records.filter((record) => record.valid).length;
  const invalidRecords = records.filter((record) => !record.valid);
  const lines = [
    "# JSON Lines Review Checklist",
    "",
    `- [${validCount > 0 ? "x" : " "}] Parsed ${validCount} valid record${validCount === 1 ? "" : "s"}.`,
    `- [${invalidRecords.length === 0 ? "x" : " "}] No invalid JSON lines found.`,
    `- [${records.length > 0 ? "x" : " "}] Input contains ${records.length} inspected line${records.length === 1 ? "" : "s"}.`,
  ];

  if (invalidRecords.length) {
    lines.push("", "Invalid lines:");
    invalidRecords.slice(0, 20).forEach((record) => {
      lines.push(`- Line ${record.line}: ${record.error}`);
    });
  }

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => {
      lines.push(`- ${issue.title}: ${issue.message}`);
    });
  }

  return lines.join("\n");
}

function buildIssues(options: {
  records: LineRecord[];
  emptyLineCount: number;
  warnMixedRecordTypes: boolean;
  warnLargeRecords: boolean;
}): Issue[] {
  const issues: Issue[] = [];
  const invalidRecords = options.records.filter((record) => !record.valid);
  const validRecords = options.records.filter((record) => record.valid);

  if (invalidRecords.length) {
    issues.push({
      severity: "high",
      title: "Invalid JSON lines found",
      message: `${invalidRecords.length} line${invalidRecords.length === 1 ? "" : "s"} could not be parsed as JSON.`,
    });
  }

  if (options.emptyLineCount) {
    issues.push({
      severity: "info",
      title: "Empty lines detected",
      message: `${options.emptyLineCount} empty line${options.emptyLineCount === 1 ? "" : "s"} found in the input.`,
    });
  }

  if (options.warnMixedRecordTypes) {
    const types = Array.from(new Set(validRecords.map((record) => record.type)));
    if (types.length > 1) {
      issues.push({
        severity: "warning",
        title: "Mixed record types",
        message: `The valid lines contain multiple JSON value types: ${types.join(", ")}.`,
      });
    }
  }

  if (options.warnLargeRecords) {
    const large = options.records.filter((record) => record.raw.length > 5000);
    if (large.length) {
      issues.push({
        severity: "info",
        title: "Large records",
        message: `${large.length} record${large.length === 1 ? "" : "s"} are longer than 5,000 characters.`,
      });
    }
  }

  return issues;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.validCount > 1000) {
    notes.push({
      severity: "info",
      title: "Large JSONL input",
      message: "This file has many records. Browser conversion is fine for moderate data, but very large files may be better handled in a local script.",
    });
  }

  if (result.outputLength > 100000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated output is large. Copying may take a moment, and some editors may slow down when pasting it.",
    });
  }

  return notes;
}

function countEmptyLines(input: string) {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => !line.trim()).length;
}

function detectShape(values: unknown[]) {
  if (!values.length) return "no valid records";
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
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value as Record<string, unknown>).length;
  }
  return 0;
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function stringifyJson(value: unknown, spaces: number, escapeSlashes: boolean) {
  const json = JSON.stringify(value, null, spaces);
  return escapeSlashes ? json.replace(/\//g, "\\/") : json;
}

function makeRecordsFromValues(values: unknown[]): LineRecord[] {
  return values.map((value, index) => ({
    line: index + 1,
    raw: stringifyJson(value, 0, false),
    valid: true,
    value,
    error: "",
    type: valueType(value),
    keyCount: keyCount(value),
  }));
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
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
