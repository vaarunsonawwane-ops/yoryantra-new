"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "prettyNdjson" | "compactNdjson" | "jsonArray" | "summary" | "errorsOnly";
type LineNumberMode = "none" | "prefix" | "jsonField";

type ParsedRecord = {
  line: number;
  raw: string;
  value: unknown;
  valid: boolean;
  error: string;
  type: string;
  keyCount: number;
};

type NDJSONResult = {
  records: ParsedRecord[];
  validRecords: ParsedRecord[];
  invalidRecords: ParsedRecord[];
  output: string;
  warnings: string[];
  totalLines: number;
  emptyLines: number;
  objectCount: number;
  arrayCount: number;
  primitiveCount: number;
};

type NDJSONNote = {
  title: string;
  message: string;
};

const sampleNdjson = `{"time":"2026-05-31T10:00:00Z","level":"info","message":"Tool opened","tool":"ndjson-formatter-validator"}
{"time":"2026-05-31T10:01:12Z","level":"warn","message":"Slow response","durationMs":842}
{"time":"2026-05-31T10:02:45Z","level":"error","message":"Invalid payload","code":"BAD_JSON"}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("prettyNdjson");
  const [lineNumberMode, setLineNumberMode] = useState<LineNumberMode>("none");
  const [indentSize, setIndentSize] = useState("2");
  const [skipEmptyLines, setSkipEmptyLines] = useState(true);
  const [requireObjects, setRequireObjects] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const [keepInvalidLines, setKeepInvalidLines] = useState(false);
  const [result, setResult] = useState<NDJSONResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNDJSONNotes(result) : []), [result]);

  const validateNDJSON = () => {
    if (!input.trim()) {
      setError("Please paste NDJSON or JSONL data.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = processNDJSON(input, {
        outputMode,
        lineNumberMode,
        indentSize: Math.max(0, Math.min(Number(indentSize) || 2, 8)),
        skipEmptyLines,
        requireObjects,
        sortKeys,
        keepInvalidLines,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process this NDJSON input."
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
    setInput(sampleNdjson);
    setOutputMode("prettyNdjson");
    setLineNumberMode("none");
    setIndentSize("2");
    setSkipEmptyLines(true);
    setRequireObjects(false);
    setSortKeys(false);
    setKeepInvalidLines(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("prettyNdjson");
    setLineNumberMode("none");
    setIndentSize("2");
    setSkipEmptyLines(true);
    setRequireObjects(false);
    setSortKeys(false);
    setKeepInvalidLines(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="NDJSON Formatter Validator"
      description="Validate, format, compact, and inspect NDJSON newline-delimited JSON. Find line errors, parse JSONL logs, count records, and convert NDJSON to JSON array directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          NDJSON / JSONL Input
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleNdjson}
          className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste newline-delimited JSON, JSONL logs, event streams, or exported
          records. Each non-empty line should be a complete JSON value.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
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
              { label: "Pretty NDJSON", value: "prettyNdjson" },
              { label: "Compact NDJSON", value: "compactNdjson" },
              { label: "JSON array", value: "jsonArray" },
              { label: "Summary", value: "summary" },
              { label: "Errors only", value: "errorsOnly" },
            ]}
          />

          <YoryantraSelect
            label="Line Numbers"
            value={lineNumberMode}
            onChange={(value) => {
              setLineNumberMode(value as LineNumberMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "None", value: "none" },
              { label: "Prefix output lines", value: "prefix" },
              { label: "Add _line field", value: "jsonField" },
            ]}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Indent Size
            </label>

            <input
              value={indentSize}
              onChange={(event) => {
                setIndentSize(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="2"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={skipEmptyLines}
              onChange={(event) => {
                setSkipEmptyLines(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Skip empty lines
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireObjects}
              onChange={(event) => {
                setRequireObjects(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Require each line to be a JSON object
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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

            Sort object keys
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={keepInvalidLines}
              onChange={(event) => {
                setKeepInvalidLines(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Keep invalid lines in output as comments
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          NDJSON means each line is a separate JSON value. It is common in logs,
          streams, exports, queues, and data pipelines.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateNDJSON} className="yoryantra-btn">
          Validate NDJSON
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
          <SummaryCard label="Total Lines" value={result.totalLines.toLocaleString()} />
          <SummaryCard label="Valid Records" value={result.validRecords.length.toLocaleString()} />
          <SummaryCard label="Invalid Lines" value={result.invalidRecords.length.toLocaleString()} />
          <SummaryCard label="Empty Lines" value={result.emptyLines.toLocaleString()} />
        </div>
      )}

      {result && result.invalidRecords.length > 0 && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="text-lg font-semibold text-red-900">
            Line Errors
          </h3>

          <p className="mt-2 text-sm text-red-700">
            These lines could not be parsed as valid JSON.
          </p>

          <div className="mt-4 space-y-3">
            {result.invalidRecords.slice(0, 20).map((record) => (
              <div key={`error-${record.line}`} className="rounded-xl border border-red-200 bg-white p-4">
                <p className="text-sm font-semibold text-red-900">
                  Line {record.line}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-red-700">
                  {record.error}
                </p>

                <pre className="mt-2 overflow-auto rounded-lg bg-red-50 p-3 text-xs text-red-900 whitespace-pre-wrap break-words">
                  {record.raw}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.validRecords.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed Records
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Preview of valid NDJSON records found in the input.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Keys</th>
                  <th className="px-4 py-3 font-semibold">Preview</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.validRecords.slice(0, 50).map((record) => (
                  <tr key={`record-${record.line}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {record.line}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {record.type}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {record.keyCount}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[560px] break-words">
                        {JSON.stringify(record.value)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.validRecords.length > 50 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 50 valid records. Copy the output to use the full result.
            </p>
          )}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            NDJSON notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[360px] whitespace-pre-wrap break-words">
          {output || "Formatted NDJSON output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        NDJSON validation and formatting happens directly in your browser. Your
        pasted data is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Validating Newline Delimited JSON Records
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            NDJSON, also called JSONL or JSON Lines, stores one JSON value per
            line. It is common in logs, event streams, analytics exports, message
            queues, and data processing pipelines.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This NDJSON Formatter Validator checks every line separately, shows
            line-specific JSON errors, formats valid records, converts records to
            a JSON array, and gives a quick summary of the data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Formatting or Validating NDJSON
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste NDJSON, JSONL logs, or newline-delimited records.</li>
            <li>Choose whether output should be pretty NDJSON, compact NDJSON, or a JSON array.</li>
            <li>Turn on object-only validation if every line should be an object.</li>
            <li>Run the validator and review line errors or parsed record previews.</li>
            <li>Copy the formatted output for debugging, docs, or data cleanup.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common NDJSON Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Finding the exact bad line in JSONL logs.</li>
            <li>Converting NDJSON exports into a JSON array.</li>
            <li>Compacting pretty JSON records into one record per line.</li>
            <li>Checking event stream payloads before importing them.</li>
            <li>Sorting object keys for cleaner record comparison.</li>
            <li>Reviewing queue, analytics, or pipeline data samples.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example NDJSON Input
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`{"level":"info","message":"Started"}
{"level":"warn","message":"Slow response"}
{"level":"error","message":"Invalid payload"}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            NDJSON Is Not the Same as a JSON Array
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A normal JSON array wraps records inside square brackets and commas.
            NDJSON keeps each record on its own line without wrapping the whole
            file. This makes it easier to stream, append, and process one record
            at a time.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use JSON array output when you need to paste the records into a tool
            that expects normal JSON instead of line-based JSON.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is NDJSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                NDJSON means newline-delimited JSON. Each line is a separate JSON
                value, often a JSON object.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is NDJSON the same as JSONL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JSONL, JSON Lines, and NDJSON are commonly used for the same
                line-based JSON format.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this show which line is invalid?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid records are reported with their original line
                number and error message.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this convert NDJSON to a JSON array?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Choose JSON array output to wrap valid records into a normal
                JSON array.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my NDJSON uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Validation and formatting happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/ndjson-formatter-validator" />
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

function processNDJSON(
  input: string,
  options: {
    outputMode: OutputMode;
    lineNumberMode: LineNumberMode;
    indentSize: number;
    skipEmptyLines: boolean;
    requireObjects: boolean;
    sortKeys: boolean;
    keepInvalidLines: boolean;
  }
): NDJSONResult {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const records: ParsedRecord[] = [];
  const warnings: string[] = [];
  let emptyLines = 0;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const raw = line;
    const trimmed = line.trim();

    if (!trimmed) {
      emptyLines += 1;

      if (!options.skipEmptyLines) {
        records.push({
          line: lineNumber,
          raw,
          value: "",
          valid: false,
          error: "Empty line",
          type: "empty",
          keyCount: 0,
        });
      }

      return;
    }

    try {
      let value = JSON.parse(trimmed);

      if (options.requireObjects && !isPlainObject(value)) {
        records.push({
          line: lineNumber,
          raw,
          value,
          valid: false,
          error: "Line is valid JSON but not a JSON object",
          type: getValueType(value),
          keyCount: 0,
        });
        return;
      }

      if (options.sortKeys) {
        value = sortObjectKeys(value);
      }

      records.push({
        line: lineNumber,
        raw,
        value,
        valid: true,
        error: "",
        type: getValueType(value),
        keyCount: isPlainObject(value) ? Object.keys(value as Record<string, unknown>).length : 0,
      });
    } catch (err) {
      records.push({
        line: lineNumber,
        raw,
        value: null,
        valid: false,
        error: err instanceof Error ? err.message : "Invalid JSON",
        type: "invalid",
        keyCount: 0,
      });
    }
  });

  const validRecords = records.filter((record) => record.valid);
  const invalidRecords = records.filter((record) => !record.valid);
  const objectCount = validRecords.filter((record) => record.type === "object").length;
  const arrayCount = validRecords.filter((record) => record.type === "array").length;
  const primitiveCount = validRecords.filter(
    (record) => !["object", "array"].includes(record.type)
  ).length;

  if (invalidRecords.length > 0) {
    warnings.push(`${invalidRecords.length} invalid line${invalidRecords.length === 1 ? "" : "s"} found.`);
  }

  if (emptyLines > 0) {
    warnings.push(`${emptyLines} empty line${emptyLines === 1 ? "" : "s"} found.`);
  }

  if (primitiveCount > 0 && !options.requireObjects) {
    warnings.push("Some valid lines are primitive JSON values instead of objects.");
  }

  const output = formatOutput({
    validRecords,
    invalidRecords,
    warnings,
    options,
    totalLines: lines.length,
    emptyLines,
    objectCount,
    arrayCount,
    primitiveCount,
  });

  return {
    records,
    validRecords,
    invalidRecords,
    output,
    warnings,
    totalLines: lines.length,
    emptyLines,
    objectCount,
    arrayCount,
    primitiveCount,
  };
}

function formatOutput({
  validRecords,
  invalidRecords,
  warnings,
  options,
  totalLines,
  emptyLines,
  objectCount,
  arrayCount,
  primitiveCount,
}: {
  validRecords: ParsedRecord[];
  invalidRecords: ParsedRecord[];
  warnings: string[];
  options: {
    outputMode: OutputMode;
    lineNumberMode: LineNumberMode;
    indentSize: number;
    keepInvalidLines: boolean;
  };
  totalLines: number;
  emptyLines: number;
  objectCount: number;
  arrayCount: number;
  primitiveCount: number;
}) {
  if (options.outputMode === "summary") {
    return [
      "NDJSON Summary",
      "-------------",
      `Total lines: ${totalLines}`,
      `Valid records: ${validRecords.length}`,
      `Invalid lines: ${invalidRecords.length}`,
      `Empty lines: ${emptyLines}`,
      `Objects: ${objectCount}`,
      `Arrays: ${arrayCount}`,
      `Primitive values: ${primitiveCount}`,
      "",
      "Warnings:",
      ...(warnings.length === 0 ? ["(none)"] : warnings.map((warning) => `- ${warning}`)),
    ].join("\n");
  }

  if (options.outputMode === "errorsOnly") {
    if (invalidRecords.length === 0) {
      return "No NDJSON errors found.";
    }

    return invalidRecords
      .map((record) => `Line ${record.line}: ${record.error}\n${record.raw}`)
      .join("\n\n");
  }

  if (options.outputMode === "jsonArray") {
    return JSON.stringify(validRecords.map((record) => record.value), null, options.indentSize);
  }

  const formatted = validRecords.map((record) => {
    let value = record.value;

    if (options.lineNumberMode === "jsonField" && isPlainObject(value)) {
      value = {
        _line: record.line,
        ...(value as Record<string, unknown>),
      };
    }

    const json =
      options.outputMode === "compactNdjson"
        ? JSON.stringify(value)
        : JSON.stringify(value, null, options.indentSize);

    return options.lineNumberMode === "prefix" ? `${record.line}: ${json}` : json;
  });

  if (options.keepInvalidLines && invalidRecords.length > 0) {
    invalidRecords.forEach((record) => {
      formatted.push(`# Invalid line ${record.line}: ${record.error}`);
      formatted.push(`# ${record.raw}`);
    });
  }

  return formatted.join("\n");
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getValueType(value: unknown) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (isPlainObject(value)) {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}

function getNDJSONNotes(result: NDJSONResult): NDJSONNote[] {
  const notes: NDJSONNote[] = [];

  if (result.invalidRecords.length > 0) {
    notes.push({
      title: "Invalid lines found",
      message:
        "One or more lines are not valid JSON. Check the line errors before using the output.",
    });
  }

  if (result.emptyLines > 0) {
    notes.push({
      title: "Empty lines found",
      message:
        "Empty lines were found. NDJSON usually expects one JSON value per non-empty line.",
    });
  }

  if (result.primitiveCount > 0) {
    notes.push({
      title: "Primitive records found",
      message:
        "Some valid records are strings, numbers, booleans, or null instead of objects.",
    });
  }

  if (result.validRecords.length > 1000) {
    notes.push({
      title: "Large NDJSON input",
      message:
        "This input has many records. Browser formatting may become slower with very large data.",
    });
  }

  return notes;
}
