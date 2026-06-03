"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputShape = "auto" | "array" | "object" | "objectValues";
type OutputMode = "markdown" | "preview" | "html" | "csv" | "json" | "checklist";
type ColumnMode = "union" | "firstRow" | "common" | "manual";
type MissingValueMode = "empty" | "dash" | "null";
type NestedMode = "flatten" | "json" | "omit";

type TableRow = Record<string, unknown>;

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  rows: TableRow[];
  columns: string[];
  issues: Issue[];
  inputLength: number;
  rowCount: number;
  columnCount: number;
  outputLength: number;
  detectedShape: string;
};

const sampleInput = `[
  {
    "tool": "JSON Formatter",
    "category": "JSON & Data",
    "status": "live",
    "notes": {
      "priority": "high",
      "local": true
    }
  },
  {
    "tool": "JSON Validator",
    "category": "JSON & Data",
    "status": "live",
    "notes": {
      "priority": "high",
      "local": true
    }
  },
  {
    "tool": "JSON Lines to JSON Converter",
    "category": "JSON & Data",
    "status": "new",
    "notes": {
      "priority": "medium",
      "local": true
    }
  }
]`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputShape, setInputShape] = useState<InputShape>("auto");
  const [outputMode, setOutputMode] = useState<OutputMode>("markdown");
  const [columnMode, setColumnMode] = useState<ColumnMode>("union");
  const [missingValueMode, setMissingValueMode] = useState<MissingValueMode>("empty");
  const [nestedMode, setNestedMode] = useState<NestedMode>("flatten");
  const [manualColumns, setManualColumns] = useState("");
  const [trimCellText, setTrimCellText] = useState(true);
  const [escapeMarkdownPipes, setEscapeMarkdownPipes] = useState(true);
  const [includeAlignmentRow, setIncludeAlignmentRow] = useState(true);
  const [humanizeHeaders, setHumanizeHeaders] = useState(true);
  const [sortColumns, setSortColumns] = useState(false);
  const [limitRows, setLimitRows] = useState(false);
  const [warnNestedValues, setWarnNestedValues] = useState(true);
  const [warnWideTables, setWarnWideTables] = useState(true);
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
      setError("Please paste a JSON array or object to convert into a Markdown table.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      inputShape,
      outputMode,
      columnMode,
      missingValueMode,
      nestedMode,
      manualColumns,
      trimCellText,
      escapeMarkdownPipes,
      includeAlignmentRow,
      humanizeHeaders,
      sortColumns,
      limitRows,
      warnNestedValues,
      warnWideTables,
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
    setInputShape("auto");
    setOutputMode("markdown");
    setColumnMode("union");
    setMissingValueMode("empty");
    setNestedMode("flatten");
    setManualColumns("");
    setTrimCellText(true);
    setEscapeMarkdownPipes(true);
    setIncludeAlignmentRow(true);
    setHumanizeHeaders(true);
    setSortColumns(false);
    setLimitRows(false);
    setWarnNestedValues(true);
    setWarnWideTables(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setInputShape("auto");
    setOutputMode("markdown");
    setColumnMode("union");
    setMissingValueMode("empty");
    setNestedMode("flatten");
    setManualColumns("");
    setTrimCellText(true);
    setEscapeMarkdownPipes(true);
    setIncludeAlignmentRow(true);
    setHumanizeHeaders(true);
    setSortColumns(false);
    setLimitRows(false);
    setWarnNestedValues(true);
    setWarnWideTables(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON to Markdown Table Converter"
      description="Convert JSON arrays and objects into Markdown tables for GitHub, documentation, issue comments, reports, and readable data previews."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Array or Object</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste an array of objects, a single object, or an object containing records you want to turn into a Markdown table.
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
          <h3 className="text-lg font-semibold text-gray-900">Table Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Input Shape"
              value={inputShape}
              onChange={(value) => {
                setInputShape(value as InputShape);
                clearResult();
              }}
              options={[
                { label: "Auto detect", value: "auto" },
                { label: "Array of records", value: "array" },
                { label: "Single object", value: "object" },
                { label: "Object values as rows", value: "objectValues" },
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
                { label: "Markdown table", value: "markdown" },
                { label: "Readable preview", value: "preview" },
                { label: "HTML table", value: "html" },
                { label: "CSV", value: "csv" },
                { label: "JSON report", value: "json" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Columns"
              value={columnMode}
              onChange={(value) => {
                setColumnMode(value as ColumnMode);
                clearResult();
              }}
              options={[
                { label: "Use all discovered columns", value: "union" },
                { label: "Use first row columns", value: "firstRow" },
                { label: "Use common columns only", value: "common" },
                { label: "Use manual columns", value: "manual" },
              ]}
            />

            <YoryantraSelect
              label="Nested Values"
              value={nestedMode}
              onChange={(value) => {
                setNestedMode(value as NestedMode);
                clearResult();
              }}
              options={[
                { label: "Flatten nested objects", value: "flatten" },
                { label: "Keep as JSON text", value: "json" },
                { label: "Omit nested values", value: "omit" },
              ]}
            />

            <YoryantraSelect
              label="Missing Values"
              value={missingValueMode}
              onChange={(value) => {
                setMissingValueMode(value as MissingValueMode);
                clearResult();
              }}
              options={[
                { label: "Leave empty", value: "empty" },
                { label: "Use dash", value: "dash" },
                { label: "Use null", value: "null" },
              ]}
            />

            {columnMode === "manual" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Manual Columns</label>
                <input
                  value={manualColumns}
                  onChange={(event) => {
                    setManualColumns(event.target.value);
                    clearResult();
                  }}
                  placeholder="tool, category, status"
                  className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />
                <p className="mt-1 text-xs text-gray-500">Comma-separated keys. Dot paths work after flattening, such as notes.priority.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimCellText} onChange={setTrimCellText} label="Trim long cell whitespace" />
          <Toggle checked={escapeMarkdownPipes} onChange={setEscapeMarkdownPipes} label="Escape Markdown pipe characters" />
          <Toggle checked={includeAlignmentRow} onChange={setIncludeAlignmentRow} label="Include Markdown alignment row" />
          <Toggle checked={humanizeHeaders} onChange={setHumanizeHeaders} label="Humanize column headings" />
          <Toggle checked={sortColumns} onChange={setSortColumns} label="Sort columns alphabetically" />
          <Toggle checked={limitRows} onChange={setLimitRows} label="Limit output to first 100 rows" />
          <Toggle checked={warnNestedValues} onChange={setWarnNestedValues} label="Warn about nested data" />
          <Toggle checked={warnWideTables} onChange={setWarnWideTables} label="Warn about very wide tables" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options keep Markdown tables readable while preserving enough structure for documentation, GitHub comments, and quick data reviews.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processJson}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Convert to Table
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
                <p className="mt-1 text-sm text-gray-500">Generated table output for copying into docs, issues, or reports.</p>
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
            <StatCard label="Rows" value={String(result.rowCount)} />
            <StatCard label="Columns" value={String(result.columnCount)} />
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

      {result?.rows.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Table Preview</h3>
          <p className="mt-1 text-sm text-gray-500">Previewing the first 20 rows and first 12 columns to keep the page readable.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  {result.columns.slice(0, 12).map((column) => (
                    <th key={column} className="px-4 py-3 font-semibold">{humanizeHeaders ? humanize(column) : column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.rows.slice(0, 20).map((row, index) => (
                  <tr key={`preview-${index}`}>
                    {result.columns.slice(0, 12).map((column) => (
                      <td key={`${index}-${column}`} className="px-4 py-3">{formatCell(row[column], missingValueMode, false)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Turning JSON Data Into Markdown Tables</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON is useful for APIs and data exchange, but it is not always easy to read inside GitHub issues, project notes, changelogs, or documentation pages. A Markdown table makes small datasets easier to scan without asking readers to mentally parse brackets and quotes.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This converter takes JSON arrays, objects, and nested records and turns them into copy-ready Markdown tables. It can flatten nested fields, clean headings, handle missing values, and warn when the table may become too wide to read comfortably.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This JSON to Markdown Converter Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Creating Markdown tables for GitHub READMEs, pull requests, issues, release notes, and documentation pages.</p>
            <p className="mt-2">Turning API response samples into readable tables for teammates, clients, or troubleshooting notes.</p>
            <p className="mt-2">Flattening small JSON datasets before pasting them into docs, bug reports, or technical explanations.</p>
            <p className="mt-2">Checking whether JSON records share consistent columns before converting them into a table.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the JSON to Markdown Table Converter</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JSON array, single object, or object containing record values.</li>
            <li>Choose the input shape or leave it on auto detect.</li>
            <li>Select Markdown table output, preview, HTML, CSV, JSON report, or checklist.</li>
            <li>Choose how columns and nested values should be handled.</li>
            <li>Review the generated table and preview, then copy the output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Markdown Table Output</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`| Tool | Category | Status |
|---|---|---|
| JSON Formatter | JSON & Data | live |
| JSON Validator | JSON & Data | live |`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Markdown Tables Work Best With Flat Records</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Markdown tables are simple text tables. They work best when each row has flat values such as strings, numbers, booleans, and short labels. Deeply nested JSON can be flattened into dot-path columns, but very wide tables may become difficult to read in GitHub or documentation pages.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What JSON formats can this converter read?">
              It can read arrays of objects, single objects, and objects whose values should be treated as rows. Arrays of objects usually produce the cleanest tables.
            </Faq>
            <Faq title="Can this flatten nested JSON?">
              Yes. Use the flatten nested objects option to create columns such as notes.priority or user.email from nested fields.
            </Faq>
            <Faq title="Can I choose only specific columns?">
              Yes. Select manual columns and enter a comma-separated list of keys or flattened paths.
            </Faq>
            <Faq title="Why is my Markdown table too wide?">
              Wide JSON records can create many columns. Use first-row, common-columns, or manual-columns mode to keep the table readable.
            </Faq>
            <Faq title="Is anything uploaded while converting JSON to Markdown?">
              No. The conversion runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            JSON table conversion often connects with formatting, CSV conversion, validation, and documentation workflows.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">JSON Formatter</Link>
            <Link href="/tools/json-validator" className="yoryantra-btn-outline">JSON Validator</Link>
            <Link href="/tools/json-to-csv-converter" className="yoryantra-btn-outline">JSON to CSV Converter</Link>
            <Link href="/tools/csv-to-markdown-table-converter" className="yoryantra-btn-outline">CSV to Markdown Table Converter</Link>
            <Link href="/tools/json-flatten-unflatten-tool" className="yoryantra-btn-outline">JSON Flatten / Unflatten Tool</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  inputShape: InputShape;
  outputMode: OutputMode;
  columnMode: ColumnMode;
  missingValueMode: MissingValueMode;
  nestedMode: NestedMode;
  manualColumns: string;
  trimCellText: boolean;
  escapeMarkdownPipes: boolean;
  includeAlignmentRow: boolean;
  humanizeHeaders: boolean;
  sortColumns: boolean;
  limitRows: boolean;
  warnNestedValues: boolean;
  warnWideTables: boolean;
}): Result {
  let parsed: unknown;

  try {
    parsed = JSON.parse(options.input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON input.";
    return emptyResult(`__ERROR__:The input is not valid JSON: ${message}`, options.input.length);
  }

  const detectedShape = detectInputShape(parsed);
  const rows = normalizeRows(parsed, options.inputShape);
  if (!rows.length) {
    return emptyResult("__ERROR__:No table rows could be found. Paste an object, an array, or an object whose values are records.", options.input.length);
  }

  const normalizedRows = rows.map((row) => normalizeRow(row, options.nestedMode));
  const finalRows = options.limitRows ? normalizedRows.slice(0, 100) : normalizedRows;
  const columns = chooseColumns(finalRows, options);
  const issues = buildIssues(normalizedRows, columns, options);

  let output = "";
  if (options.outputMode === "markdown") {
    output = buildMarkdownTable(finalRows, columns, options);
  } else if (options.outputMode === "preview") {
    output = buildPreview(finalRows, columns, options);
  } else if (options.outputMode === "html") {
    output = buildHtmlTable(finalRows, columns, options);
  } else if (options.outputMode === "csv") {
    output = buildCsv(finalRows, columns, options);
  } else if (options.outputMode === "json") {
    output = JSON.stringify({
      rowCount: finalRows.length,
      columnCount: columns.length,
      columns,
      rows: finalRows,
      issues,
    }, null, 2);
  } else {
    output = buildChecklist(finalRows, columns, issues);
  }

  return {
    output,
    rows: finalRows,
    columns,
    issues,
    inputLength: options.input.length,
    rowCount: finalRows.length,
    columnCount: columns.length,
    outputLength: output.length,
    detectedShape,
  };
}

function emptyResult(output: string, inputLength: number): Result {
  return {
    output,
    rows: [],
    columns: [],
    issues: [],
    inputLength,
    rowCount: 0,
    columnCount: 0,
    outputLength: 0,
    detectedShape: "invalid JSON",
  };
}

function normalizeRows(value: unknown, inputShape: InputShape): TableRow[] {
  if (inputShape === "array") {
    return Array.isArray(value) ? value.map(asRow) : [];
  }

  if (inputShape === "object") {
    return value && typeof value === "object" && !Array.isArray(value) ? [asRow(value)] : [];
  }

  if (inputShape === "objectValues") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    return Object.entries(value as Record<string, unknown>).map(([key, item]) => ({
      key,
      ...asRow(item),
    }));
  }

  if (Array.isArray(value)) {
    return value.map(asRow);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length && entries.every(([, item]) => item && typeof item === "object")) {
      return entries.map(([key, item]) => ({ key, ...asRow(item) }));
    }
    return [asRow(value)];
  }

  return [{ value }];
}

function asRow(value: unknown): TableRow {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as TableRow;
  }
  return { value };
}

function normalizeRow(row: TableRow, nestedMode: NestedMode): TableRow {
  if (nestedMode === "flatten") {
    return flattenObject(row);
  }

  const next: TableRow = {};
  Object.entries(row).forEach(([key, value]) => {
    if (isNested(value)) {
      if (nestedMode === "json") {
        next[key] = JSON.stringify(value);
      }
      return;
    }
    next[key] = value;
  });
  return next;
}

function flattenObject(value: unknown, prefix = ""): TableRow {
  const output: TableRow = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    if (prefix) output[prefix] = value;
    return output;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      Object.assign(output, flattenObject(item, path));
    } else if (Array.isArray(item)) {
      output[path] = JSON.stringify(item);
    } else {
      output[path] = item;
    }
  });

  return output;
}

function chooseColumns(rows: TableRow[], options: {
  columnMode: ColumnMode;
  manualColumns: string;
  sortColumns: boolean;
}) {
  let columns: string[];

  if (options.columnMode === "manual") {
    columns = options.manualColumns.split(",").map((column) => column.trim()).filter(Boolean);
  } else if (options.columnMode === "firstRow") {
    columns = Object.keys(rows[0] ?? {});
  } else if (options.columnMode === "common") {
    const [first, ...rest] = rows;
    columns = Object.keys(first ?? {}).filter((key) => rest.every((row) => Object.prototype.hasOwnProperty.call(row, key)));
  } else {
    columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  }

  if (options.sortColumns) {
    columns = [...columns].sort((a, b) => a.localeCompare(b));
  }

  return columns;
}

function buildMarkdownTable(rows: TableRow[], columns: string[], options: {
  missingValueMode: MissingValueMode;
  trimCellText: boolean;
  escapeMarkdownPipes: boolean;
  includeAlignmentRow: boolean;
  humanizeHeaders: boolean;
}) {
  const headers = columns.map((column) => cleanMarkdownCell(options.humanizeHeaders ? humanize(column) : column, options));
  const lines = [`| ${headers.join(" | ")} |`];

  if (options.includeAlignmentRow) {
    lines.push(`| ${columns.map(() => "---").join(" | ")} |`);
  }

  rows.forEach((row) => {
    lines.push(`| ${columns.map((column) => cleanMarkdownCell(formatCell(row[column], options.missingValueMode, options.trimCellText), options)).join(" | ")} |`);
  });

  return lines.join("\n");
}

function buildPreview(rows: TableRow[], columns: string[], options: {
  missingValueMode: MissingValueMode;
  trimCellText: boolean;
  humanizeHeaders: boolean;
}) {
  const lines = [
    `Rows: ${rows.length}`,
    `Columns: ${columns.length}`,
    "",
    columns.map((column) => options.humanizeHeaders ? humanize(column) : column).join(" | "),
    columns.map(() => "---").join(" | "),
  ];

  rows.slice(0, 25).forEach((row) => {
    lines.push(columns.map((column) => formatCell(row[column], options.missingValueMode, options.trimCellText)).join(" | "));
  });

  if (rows.length > 25) {
    lines.push(`... ${rows.length - 25} more row${rows.length - 25 === 1 ? "" : "s"}`);
  }

  return lines.join("\n");
}

function buildHtmlTable(rows: TableRow[], columns: string[], options: {
  missingValueMode: MissingValueMode;
  trimCellText: boolean;
  humanizeHeaders: boolean;
}) {
  const header = columns.map((column) => `    <th>${escapeHtml(options.humanizeHeaders ? humanize(column) : column)}</th>`).join("\n");
  const body = rows.map((row) => {
    const cells = columns.map((column) => `    <td>${escapeHtml(formatCell(row[column], options.missingValueMode, options.trimCellText))}</td>`).join("\n");
    return `  <tr>\n${cells}\n  </tr>`;
  }).join("\n");

  return `<table>\n  <thead>\n  <tr>\n${header}\n  </tr>\n  </thead>\n  <tbody>\n${body}\n  </tbody>\n</table>`;
}

function buildCsv(rows: TableRow[], columns: string[], options: {
  missingValueMode: MissingValueMode;
  trimCellText: boolean;
  humanizeHeaders: boolean;
}) {
  const header = columns.map((column) => csvCell(options.humanizeHeaders ? humanize(column) : column)).join(",");
  const body = rows.map((row) => columns.map((column) => csvCell(formatCell(row[column], options.missingValueMode, options.trimCellText))).join(","));
  return [header, ...body].join("\n");
}

function buildChecklist(rows: TableRow[], columns: string[], issues: Issue[]) {
  const lines = [
    "# JSON to Markdown Table Checklist",
    "",
    `- [${rows.length ? "x" : " "}] Parsed ${rows.length} row${rows.length === 1 ? "" : "s"}.`,
    `- [${columns.length ? "x" : " "}] Selected ${columns.length} column${columns.length === 1 ? "" : "s"}.`,
    `- [${columns.length <= 8 ? "x" : " "}] Table width is comfortable for most Markdown readers.`,
    `- [${rows.length <= 100 ? "x" : " "}] Row count is manageable for docs and GitHub comments.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => {
      lines.push(`- ${issue.title}: ${issue.message}`);
    });
  }

  return lines.join("\n");
}

function buildIssues(rows: TableRow[], columns: string[], options: {
  warnNestedValues: boolean;
  warnWideTables: boolean;
  nestedMode: NestedMode;
  limitRows: boolean;
}): Issue[] {
  const issues: Issue[] = [];

  if (options.warnWideTables && columns.length > 8) {
    issues.push({
      severity: "warning",
      title: "Wide Markdown table",
      message: `The table has ${columns.length} columns. Markdown tables can become hard to read when they are very wide.`,
    });
  }

  if (rows.length > 100 && !options.limitRows) {
    issues.push({
      severity: "info",
      title: "Large table",
      message: "The table has more than 100 rows. Consider limiting rows before pasting into a README, issue, or comment.",
    });
  }

  if (options.warnNestedValues && options.nestedMode !== "flatten") {
    const nestedCount = rows.filter((row) => Object.values(row).some(isNested)).length;
    if (nestedCount) {
      issues.push({
        severity: "info",
        title: "Nested values detected",
        message: `${nestedCount} row${nestedCount === 1 ? "" : "s"} contain nested objects or arrays.`,
      });
    }
  }

  if (!columns.length) {
    issues.push({
      severity: "high",
      title: "No columns selected",
      message: "No columns were available for the table. Try using all columns or check your manual column list.",
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
      message: "The generated table is large. Some Markdown editors and issue fields may slow down with very long tables.",
    });
  }

  return notes;
}

function detectInputShape(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") return "object";
  return typeof value;
}

function isNested(value: unknown) {
  return Boolean(value && typeof value === "object");
}

function formatCell(value: unknown, missingValueMode: MissingValueMode, trimCellText: boolean) {
  if (value === undefined || value === null) {
    if (missingValueMode === "dash") return "-";
    if (missingValueMode === "null") return "null";
    return "";
  }

  let text = "";
  if (typeof value === "string") {
    text = value;
  } else if (typeof value === "number" || typeof value === "boolean") {
    text = String(value);
  } else {
    text = JSON.stringify(value);
  }

  text = text.replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\r/g, " ");
  if (trimCellText) {
    text = text.replace(/\s+/g, " ").trim();
  }

  return text;
}

function cleanMarkdownCell(value: string, options: {
  escapeMarkdownPipes: boolean;
}) {
  let next = value;
  if (options.escapeMarkdownPipes) {
    next = next.replace(/\|/g, "\\|");
  }
  return next;
}

function humanize(value: string) {
  return value
    .replace(/\./g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
