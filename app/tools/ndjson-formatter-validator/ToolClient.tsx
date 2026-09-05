"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "compactNdjson" | "prettyRecords" | "jsonArray" | "summary" | "errorsOnly";
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
  outputMode: OutputMode;
};

type NDJSONNote = {
  severity: "warning" | "info";
  title: string;
  message: string;
};

const sampleNdjson = `{"time":"2026-05-31T10:00:00Z","level":"info","message":"Tool opened","tool":"ndjson-formatter-validator"}
{"time":"2026-05-31T10:01:12Z","level":"warn","message":"Slow response","durationMs":842}
{"time":"2026-05-31T10:02:45Z","level":"error","message":"Invalid payload","code":"BAD_JSON"}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("compactNdjson");
  const [indentSize, setIndentSize] = useState("2");
  const [skipEmptyLines, setSkipEmptyLines] = useState(true);
  const [requireObjects, setRequireObjects] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
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
        indentSize: Math.max(0, Math.min(Number(indentSize) || 2, 8)),
        skipEmptyLines,
        requireObjects,
        sortKeys,
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
    setOutputMode("compactNdjson");
    setIndentSize("2");
    setSkipEmptyLines(true);
    setRequireObjects(false);
    setSortKeys(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("compactNdjson");
    setIndentSize("2");
    setSkipEmptyLines(true);
    setRequireObjects(false);
    setSortKeys(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="NDJSON Formatter Validator"
      description="Validate one JSON value per line, locate failures, and produce standards-aware outputs."
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
          Record handling
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
              { label: "Compact NDJSON", value: "compactNdjson" },
              { label: "Pretty record view (not NDJSON)", value: "prettyRecords" },
              { label: "JSON array", value: "jsonArray" },
              { label: "Summary", value: "summary" },
              { label: "Errors only", value: "errorsOnly" },
            ]}
          />


          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Indent Size (pretty view / JSON array)
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

            Sort object keys in output
          </label>

        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Compact NDJSON keeps exactly one JSON text per output line. The pretty
          record view is only for reading; it is intentionally not labelled as
          valid NDJSON because indentation creates physical line breaks.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateNDJSON} className="yoryantra-btn min-h-10 whitespace-nowrap">
          Validate NDJSON
        </button>

        <button onClick={copyOutput} className="yoryantra-btn min-h-10 whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline min-h-10 whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-10 whitespace-nowrap">
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

      {notes.some((note) => note.severity === "warning") && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Record cautions
          </h3>

          <div className="mt-3 space-y-3">
            {notes
              .filter((note) => note.severity === "warning")
              .map((note) => (
                <div key={note.title}>
                  <p className="text-sm font-semibold text-amber-900">{note.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-800">
                    {note.message}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {notes.some((note) => note.severity === "info") && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="space-y-3">
            {notes
              .filter((note) => note.severity === "info")
              .map((note) => (
                <div key={note.title}>
                  <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
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
            Processed output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[360px] whitespace-pre-wrap break-words">
          {output || "Processed output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Validation and formatting run in your browser. Pasted records are not
        sent to a Yoryantra server by this page.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            One physical line has to be one complete JSON text
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            NDJSON is deliberately simpler than a large JSON array: each record is
            independently parseable and ends at the newline delimiter. Strings may
            contain the escaped sequence
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">\\n</code>,
            but a pretty-printed object spread across several physical lines is not
            one NDJSON record.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The community NDJSON 1.0 specification requires UTF-8 JSON texts,
            accepts LF or CRLF record endings, and allows a parser to ignore empty
            lines only when that behavior is documented.{" "}
            <a
              href="https://github.com/ndjson/ndjson-spec"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              NDJSON specification
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A trailing newline is not an extra empty record
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Ending the file with a newline is normal stream formatting. The parser
            removes the terminal split artifact before counting blank lines, so
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">record\\n</code>
            is one record, not one record plus an empty line. Genuine blank lines
            inside the input are either skipped or reported according to the
            selected option.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            “Pretty NDJSON” would be a contradiction
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Indenting an object inserts structural line breaks, which breaks the
            one-record-per-line rule. Compact output is therefore the
            standards-preserving NDJSON mode. “Pretty record view” formats each
            valid value for a person to read and separates records visually, but
            the page labels that output as non-NDJSON rather than pretending it can
            be streamed as-is.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Valid JSON can still be unsafe to rewrite in JavaScript
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JavaScript's JSON parser keeps only one value when an object repeats a
            member name, and numbers outside its safe range can be rounded before
            they are formatted again. Each record is checked before parsing so
            duplicate names, negative zero normalization, non-finite conversion,
            and precision-sensitive numeric tokens are reported on the original
            line instead of being silently rewritten.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 8259 discusses both duplicate-name interoperability and numeric
            range or precision limits. If every digit is an identifier rather than
            a quantity, a JSON string is the safer representation.{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 8259
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Object-only validation is an application rule
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            NDJSON itself can contain any JSON value on a line: objects, arrays,
            strings, numbers, booleans, or null. Log and event pipelines often
            impose a stricter object-only contract, which is why that check is
            optional rather than treated as part of the format.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sorting keys changes text, not JSON meaning
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The sort option recursively orders object member names in generated
            output while leaving array element order untouched. JSON object member order is not
            semantically significant, but textual signatures, byte-for-byte
            comparisons, or systems with their own presentation conventions may
            still care about the original serialization. Leave sorting off when
            preserving source text shape matters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            NDJSON and JSON Lines names overlap, media types do not fully agree
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            “NDJSON”, “JSONL”, and “JSON Lines” commonly describe the same
            line-delimited idea, but there is no single IETF media-type standard
            covering all of those names. The NDJSON community specification uses
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">application/x-ndjson</code>,
            while JSON Lines documents the
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">.jsonl</code>
            convention. Match the contract expected by the receiving system
            instead of assuming the label alone settles interoperability.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/ndjson-formatter-validator" />
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

const MAX_NDJSON_INPUT_CHARS = 2_000_000;
const MAX_NDJSON_RECORDS = 50_000;
const MAX_JSON_DEPTH = 200;

function processNDJSON(
  input: string,
  options: {
    outputMode: OutputMode;
    indentSize: number;
    skipEmptyLines: boolean;
    requireObjects: boolean;
    sortKeys: boolean;
  }
): NDJSONResult {
  if (input.length > MAX_NDJSON_INPUT_CHARS) {
    throw new Error(
      `Input is larger than ${MAX_NDJSON_INPUT_CHARS.toLocaleString()} characters. Stream or split very large NDJSON files instead of loading them into one browser text area.`
    );
  }

  const normalized = input.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  if (normalized.endsWith("\n")) {
    lines.pop();
  }

  if (lines.length > MAX_NDJSON_RECORDS) {
    throw new Error(
      `Input contains more than ${MAX_NDJSON_RECORDS.toLocaleString()} source lines, beyond this browser preview limit.`
    );
  }

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
          error: "Blank lines are not JSON values.",
          type: "empty",
          keyCount: 0,
        });
      }

      return;
    }

    try {
      if (lineNumber === 1 && raw.charCodeAt(0) === 0xfeff) {
        throw new Error("UTF-8 BOM (U+FEFF) is not permitted at the start of JSON Lines data.");
      }

      assertLosslessJsonText(trimmed, lineNumber);
      let value = JSON.parse(trimmed) as unknown;

      if (options.requireObjects && !isPlainObject(value)) {
        records.push({
          line: lineNumber,
          raw,
          value,
          valid: false,
          error: "The selected object-only rule requires a JSON object on this line.",
          type: getValueType(value),
          keyCount: 0,
        });
        return;
      }

      records.push({
        line: lineNumber,
        raw,
        value,
        valid: true,
        error: "",
        type: getValueType(value),
        keyCount: isPlainObject(value)
          ? Object.keys(value as Record<string, unknown>).length
          : 0,
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
    (record) => record.type !== "object" && record.type !== "array"
  ).length;

  if (invalidRecords.length > 0) {
    warnings.push(
      `${invalidRecords.length} line${invalidRecords.length === 1 ? "" : "s"} failed validation and are excluded from converted data output.`
    );
  }

  if (emptyLines > 0 && options.skipEmptyLines) {
    warnings.push(
      `${emptyLines} blank source line${emptyLines === 1 ? " was" : "s were"} skipped by the selected empty-line policy.`
    );
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
    outputMode: options.outputMode,
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
    indentSize: number;
    sortKeys: boolean;
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
      "--------------",
      `Source lines: ${totalLines}`,
      `Valid records: ${validRecords.length}`,
      `Invalid lines: ${invalidRecords.length}`,
      `Blank lines: ${emptyLines}`,
      `Objects: ${objectCount}`,
      `Arrays: ${arrayCount}`,
      `Primitive values: ${primitiveCount}`,
      "",
      "Cautions:",
      ...(warnings.length === 0 ? ["(none)"] : warnings.map((warning) => `- ${warning}`)),
    ].join("\n");
  }

  if (options.outputMode === "errorsOnly") {
    if (invalidRecords.length === 0) {
      return "No line errors found.";
    }

    return invalidRecords
      .map((record) => `Line ${record.line}: ${record.error}\n${record.raw}`)
      .join("\n\n");
  }

  if (options.outputMode === "jsonArray") {
    return stringifyJsonValue(
      validRecords.map((record) => record.value),
      options.indentSize,
      options.sortKeys
    );
  }

  if (options.outputMode === "prettyRecords") {
    return validRecords
      .map(
        (record) =>
          `Line ${record.line}\n${stringifyJsonValue(
            record.value,
            options.indentSize,
            options.sortKeys
          )}`
      )
      .join("\n\n");
  }

  return validRecords
    .map((record) => stringifyJsonValue(record.value, 0, options.sortKeys))
    .join("\n");
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

function stringifyJsonValue(
  value: unknown,
  indentSize: number,
  sortKeys: boolean,
  depth = 0
): string {
  if (value === null || typeof value !== "object") {
    const primitive = JSON.stringify(value);
    return typeof primitive === "string" ? primitive : "null";
  }

  const currentIndent = indentSize > 0 ? " ".repeat(depth * indentSize) : "";
  const childIndent = indentSize > 0 ? " ".repeat((depth + 1) * indentSize) : "";

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    const items = value.map((item) =>
      stringifyJsonValue(item, indentSize, sortKeys, depth + 1)
    );

    return indentSize > 0
      ? `[\n${items.map((item) => `${childIndent}${item}`).join(",\n")}\n${currentIndent}]`
      : `[${items.join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue);

  if (sortKeys) {
    keys.sort(compareUtf16);
  }

  if (keys.length === 0) {
    return "{}";
  }

  const entries = keys.map((key) => {
    const separator = indentSize > 0 ? ": " : ":";
    return `${JSON.stringify(key)}${separator}${stringifyJsonValue(
      objectValue[key],
      indentSize,
      sortKeys,
      depth + 1
    )}`;
  });

  return indentSize > 0
    ? `{\n${entries.map((entry) => `${childIndent}${entry}`).join(",\n")}\n${currentIndent}}`
    : `{${entries.join(",")}}`;
}

function compareUtf16(a: string, b: string) {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
}

function getNDJSONNotes(result: NDJSONResult): NDJSONNote[] {
  const notes: NDJSONNote[] = [];

  if (
    result.invalidRecords.length > 0 &&
    result.outputMode !== "errorsOnly" &&
    result.outputMode !== "summary"
  ) {
    notes.push({
      severity: "warning",
      title: "Converted output is partial",
      message:
        "Invalid lines are shown separately and are not inserted into compact NDJSON, pretty-record, or JSON-array output. Resolve them before treating converted data as a complete replacement for the source.",
    });
  }

  if (result.emptyLines > 0) {
    notes.push({
      severity: "warning",
      title: "Blank physical lines are present",
      message:
        "A terminal newline is not counted as a blank record. Any blank lines reported here occur inside the source data and follow the selected skip/error policy.",
    });
  }

  if (result.primitiveCount > 0) {
    notes.push({
      severity: "info",
      title: "Not every record is an object",
      message:
        "Strings, numbers, booleans, and null are valid JSON values and therefore valid NDJSON records unless your receiving system requires objects.",
    });
  }

  if (result.validRecords.length > 1_000) {
    notes.push({
      severity: "warning",
      title: "Large browser-side record set",
      message:
        "Thousands of records can make pretty formatting and previews slower. Stream-oriented tooling is a better fit for large production files.",
    });
  }

  return notes;
}

function assertLosslessJsonText(text: string, lineNumber: number) {
  try {
    JSON.parse(text);
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "The line is not valid JSON."
    );
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
      if (stack.length > MAX_JSON_DEPTH) {
        throw new Error(
          `Line ${lineNumber} is nested more than ${MAX_JSON_DEPTH} levels, beyond this browser formatting limit.`
        );
      }
      index += 1;
      continue;
    }

    if (char === "[") {
      stack.push({ type: "array" });
      if (stack.length > MAX_JSON_DEPTH) {
        throw new Error(
          `Line ${lineNumber} is nested more than ${MAX_JSON_DEPTH} levels, beyond this browser formatting limit.`
        );
      }
      index += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      stack.pop();
      index += 1;
      continue;
    }

    if (char === '"') {
      const tokenEnd = findJsonStringEnd(text, index);
      const token = text.slice(index, tokenEnd + 1);
      let next = tokenEnd + 1;

      while (next < text.length && /\s/.test(text[next])) {
        next += 1;
      }

      const frame = stack[stack.length - 1];

      if (frame?.type === "object" && text[next] === ":") {
        const key = JSON.parse(token) as string;

        if (frame.keys?.has(key)) {
          throw new Error(
            `Duplicate member ${JSON.stringify(key)} would be collapsed by JavaScript parsing.`
          );
        }

        frame.keys?.add(key);
      }

      index = tokenEnd + 1;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const numberMatch = text
        .slice(index)
        .match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);

      if (numberMatch) {
        const token = numberMatch[0];
        const numericValue = Number(token);

        if (!isSafeNumberToken(token, numericValue)) {
          throw new Error(
            `JSON number ${token} cannot be rewritten safely with JavaScript number semantics. Keep precision-sensitive values as strings.`
          );
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

    if (char === '"') {
      return index;
    }
  }

  return text.length - 1;
}

function isSafeNumberToken(token: string, numericValue: number) {
  if (!Number.isFinite(numericValue) || Object.is(numericValue, -0)) {
    return false;
  }

  if (/^-?(?:0|[1-9]\d*)$/.test(token)) {
    return Number.isSafeInteger(numericValue);
  }

  const significantDigits = token
    .replace(/^[+-]/, "")
    .split(/[eE]/)[0]
    .replace(".", "")
    .replace(/^0+/, "").length;

  if (significantDigits > 15) {
    return false;
  }

  if (numericValue === 0 && /[1-9]/.test(token)) {
    return false;
  }

  return true;
}
