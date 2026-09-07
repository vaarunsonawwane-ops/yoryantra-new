"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputShape = "auto" | "array" | "object" | "objectValues";
type OutputMode = "markdown" | "preview" | "html" | "csv" | "json" | "checklist";
type ColumnMode = "union" | "firstRow" | "common" | "manual";
type MissingValueMode = "empty" | "dash" | "null";
type NestedMode = "flatten" | "json" | "omit";

type TableRow = Record<string, unknown>;

type Issue = {
  severity: "info" | "warning";
  title: string;
  message: string;
};

type Result = {
  output: string;
  rows: TableRow[];
  columns: string[];
  issues: Issue[];
  sourceRowCount: number;
  rowCount: number;
  columnCount: number;
  outputLength: number;
  detectedShape: string;
};

const MAX_INPUT_CHARS = 2_000_000;
const MAX_JSON_DEPTH = 100;
const OUTPUT_ROW_LIMIT = 100;
const MAX_SOURCE_ROWS = 20_000;

const sampleInput = `[
  {
    "tool": "JSON Formatter",
    "category": "JSON & Data",
    "owner": "Sneha",
    "status": "live",
    "notes": { "priority": "high", "local": true }
  },
  {
    "tool": "JSON Validator",
    "category": "JSON & Data",
    "owner": "Sneha",
    "status": "live",
    "notes": { "priority": "medium", "local": true }
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
      setError("Paste JSON data before building a table.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
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
        humanizeHeaders,
        sortColumns,
        limitRows,
        warnNestedValues,
        warnWideTables,
      });
      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The JSON could not be converted into table rows.");
      setResult(null);
      setOutput("");
      setCopied(false);
    }
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
      description="Turn JSON records into GFM tables while keeping nested field choices visible."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">JSON data</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Arrays of objects are the clearest table source, but single objects, primitive arrays, and object-value collections are also supported.
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
          <h3 className="text-lg font-semibold text-gray-900">Shape the rows first</h3>
          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Input shape"
              value={inputShape}
              onChange={(value) => {
                setInputShape(value as InputShape);
                clearResult();
              }}
              options={[
                { label: "Auto detect", value: "auto" },
                { label: "Array values become rows", value: "array" },
                { label: "Whole object becomes one row", value: "object" },
                { label: "Object values become rows", value: "objectValues" },
              ]}
            />
            <YoryantraSelect
              label="Nested values"
              value={nestedMode}
              onChange={(value) => {
                setNestedMode(value as NestedMode);
                clearResult();
              }}
              options={[
                { label: "Flatten nested objects", value: "flatten" },
                { label: "Keep nested values as JSON text", value: "json" },
                { label: "Omit nested values", value: "omit" },
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
                { label: "Union of discovered columns", value: "union" },
                { label: "Columns from first row", value: "firstRow" },
                { label: "Only columns present in every row", value: "common" },
                { label: "Manual column list", value: "manual" },
              ]}
            />
            <YoryantraSelect
              label="Missing fields"
              value={missingValueMode}
              onChange={(value) => {
                setMissingValueMode(value as MissingValueMode);
                clearResult();
              }}
              options={[
                { label: "Leave cell empty", value: "empty" },
                { label: "Show dash", value: "dash" },
                { label: "Show null", value: "null" },
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
                { label: "GitHub Flavored Markdown table", value: "markdown" },
                { label: "Readable text preview", value: "preview" },
                { label: "Escaped HTML table source", value: "html" },
                { label: "CSV", value: "csv" },
                { label: "JSON conversion report", value: "json" },
                { label: "Table checklist", value: "checklist" },
              ]}
            />
          </div>

          {columnMode === "manual" ? (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Manual columns — one exact column name per line</label>
              <textarea
                value={manualColumns}
                onChange={(event) => {
                  setManualColumns(event.target.value);
                  clearResult();
                }}
                placeholder={`tool\ncategory\nnotes.priority`}
                spellCheck={false}
                className="mt-2 min-h-[112px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
              <p className="mt-1 text-xs leading-relaxed text-gray-500">Use the exact discovered path. Keys containing dots or brackets are emitted with bracket notation so they do not collide with nested paths.</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Presentation choices</h3>
        <div className="mt-4 grid items-start gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimCellText} onChange={setTrimCellText} label="Collapse repeated whitespace inside cell text" />
          <Toggle checked={escapeMarkdownPipes} onChange={setEscapeMarkdownPipes} label="Escape pipe characters for GFM cells" />
          <Toggle checked={humanizeHeaders} onChange={setHumanizeHeaders} label="Humanize simple column headings" />
          <Toggle checked={sortColumns} onChange={setSortColumns} label="Sort columns by UTF-16 code-unit order" />
          <Toggle checked={limitRows} onChange={setLimitRows} label={`Limit generated output to ${OUTPUT_ROW_LIMIT} rows`} />
          <Toggle checked={warnNestedValues} onChange={setWarnNestedValues} label="Flag nested-data choices that remove structure" />
          <Toggle checked={warnWideTables} onChange={setWarnWideTables} label="Flag tables wider than eight columns" />
        </div>
      </div>

      {!escapeMarkdownPipes && outputMode === "markdown" ? (
        <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Unescaped pipe characters can split one value into multiple GFM table cells. Disable escaping only when you know the selected data contains no literal pipes that must remain inside a cell.
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={processJson} className="yoryantra-btn min-h-[44px] whitespace-nowrap">Build Table</button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Reset</button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">The selected text representation is ready to copy after you check the row and column choices.</p>
              </div>
              <button type="button" onClick={copyOutput} disabled={!output} className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>
            <pre className="mt-4 max-h-[540px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-gray-950 p-4 font-mono text-sm leading-6 text-gray-100">{output}</pre>
          </div>
          <div className="space-y-4">
            <StatCard label="Source rows" value={String(result.sourceRowCount)} />
            <StatCard label="Rows output" value={String(result.rowCount)} />
            <StatCard label="Columns" value={String(result.columnCount)} />
            <StatCard label="Detected shape" value={result.detectedShape} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Table decisions to verify</h3>
          <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
            {notes.map((note) => <IssueCard key={`${note.title}-${note.message}`} issue={note} />)}
          </div>
        </div>
      ) : null}

      {result?.rows.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Data preview</h3>
          <p className="mt-1 text-sm text-gray-500">The browser preview shows at most 20 rows and 12 columns; the copied output follows the selected output limit.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  {result.columns.slice(0, 12).map((column) => (
                    <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{headerLabel(column, humanizeHeaders)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.rows.slice(0, 20).map((row, index) => (
                  <tr key={`preview-${index}`}>
                    {result.columns.slice(0, 12).map((column) => (
                      <td key={`${index}-${column}`} className="max-w-[320px] break-words px-4 py-3">{formatCell(row[column], missingValueMode, false)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Conversion runs in your browser. HTML output is emitted as escaped source text and is not injected into this page as executable markup.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A table needs a row model before it needs Markdown</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The hardest part of JSON-to-table conversion is not drawing pipes. It is deciding what counts as one row and which fields deserve columns. An array maps naturally to rows. A single object can be one row. An object whose values are records can instead use each value as a row while keeping the original member name in a collision-safe source-key column.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Auto detection only treats an object as a record collection when all of its values are objects. That avoids turning an ordinary settings object containing arrays or mixed primitive values into a surprising set of rows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Flattened paths must not confuse a dotted key with nesting</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A naive flattener can map both <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">{"{\"a.b\":1}"}</code> and <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">{"{\"a\":{\"b\":1}}"}</code> to the same <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">a.b</code> column. Here, simple member names use dot paths while names containing dots, brackets, quotes, commas, or other ambiguous characters use quoted bracket notation. Empty nested objects are retained as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">{"{}"}</code> text instead of disappearing during flattening.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">GFM tables require the delimiter row</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            GitHub Flavored Markdown defines tables as an extension with a header row followed by a delimiter row made from hyphens and optional alignment colons. A pipe-separated header without that delimiter is not a GFM table, so the generated Markdown always includes it. Literal pipe characters inside cells are escaped by default because an unescaped pipe separates cells in the table syntax.{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://github.github.com/gfm/#tables-extension-" target="_blank" rel="noreferrer">GitHub Flavored Markdown table specification</a>
          </p>
          <p className="mt-3 leading-relaxed text-gray-600">
            Pipe escaping protects table boundaries; it is not a general Markdown sanitizer. Values containing links, images, raw HTML, or other Markdown syntax can still be interpreted by the destination renderer. Treat untrusted content according to that renderer&apos;s security rules before publishing it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Missing and null are not the same value</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A field can be absent from one row while another row explicitly contains JSON null. The missing-field setting only controls absent fields. Explicit null remains the text <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">null</code> so that absence is not silently conflated with a value the source deliberately supplied.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Human-readable headings are presentation, not identity</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Humanizing can turn names such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">created_at</code> into “Created At”, but two different source columns can humanize to the same visible label. The underlying column paths remain unchanged, and the page flags duplicate displayed headings so you can disable humanizing when exact field identity matters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Valid JSON can still be unsafe to round-trip through JavaScript numbers</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Duplicate object member names and precision-sensitive numeric tokens are rejected before table conversion. Otherwise JavaScript parsing could collapse one duplicate member or round a number before it reaches the cell formatter. RFC 8259 recommends unique member names and describes the interoperability range commonly available for JSON numbers.{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc8259.html" target="_blank" rel="noreferrer">RFC 8259</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When a Markdown table is the wrong destination</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Tables work best for a modest number of rows and columns with short scalar values. Very wide records, deeply nested documents, long prose fields, or thousands of rows are usually clearer as JSON, a downloadable data file, or a purpose-built data viewer. The row-limit and width cautions are readability heuristics, not Markdown validity rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser limits</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Input is capped at {MAX_INPUT_CHARS.toLocaleString()} characters, {MAX_SOURCE_ROWS.toLocaleString()} derived rows, and {MAX_JSON_DEPTH} nested levels. Preview rendering is deliberately smaller than the generated output so one large paste does not create an enormous DOM table.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-to-markdown-table-converter" />
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
  humanizeHeaders: boolean;
  sortColumns: boolean;
  limitRows: boolean;
  warnNestedValues: boolean;
  warnWideTables: boolean;
}): Result {
  if (options.input.length > MAX_INPUT_CHARS) {
    throw new Error(`Input is larger than ${MAX_INPUT_CHARS.toLocaleString()} characters, beyond this browser table limit.`);
  }

  assertLosslessJsonText(options.input, "Input JSON");
  const parsed = JSON.parse(options.input) as unknown;
  const detectedShape = detectInputShape(parsed);
  const sourceRows = normalizeRows(parsed, options.inputShape);
  if (!sourceRows.length) throw new Error("No rows could be derived from the selected input shape.");
  if (sourceRows.length > MAX_SOURCE_ROWS) {
    throw new Error(`Input produces more than ${MAX_SOURCE_ROWS.toLocaleString()} rows, beyond this browser table limit.`);
  }

  const normalizedRows = sourceRows.map((row) => normalizeRow(row, options.nestedMode));
  const finalRows = options.limitRows ? normalizedRows.slice(0, OUTPUT_ROW_LIMIT) : normalizedRows;
  const columns = chooseColumns(finalRows, options);
  if (!columns.length) {
    throw new Error("No columns remain after the selected row, nesting, and column rules. Choose a broader column mode or keep nested values.");
  }

  const issues = buildIssues(sourceRows, normalizedRows, finalRows, columns, options);
  let output: string;
  if (options.outputMode === "markdown") output = buildMarkdownTable(finalRows, columns, options);
  else if (options.outputMode === "preview") output = buildPreview(finalRows, columns, options);
  else if (options.outputMode === "html") output = buildHtmlTable(finalRows, columns, options);
  else if (options.outputMode === "csv") output = buildCsv(finalRows, columns, options);
  else if (options.outputMode === "json") output = JSON.stringify({ sourceRowCount: sourceRows.length, rowCount: finalRows.length, columns, rows: finalRows, issues }, null, 2);
  else output = buildChecklist(sourceRows.length, finalRows.length, columns, issues);

  return {
    output,
    rows: finalRows,
    columns,
    issues,
    sourceRowCount: sourceRows.length,
    rowCount: finalRows.length,
    columnCount: columns.length,
    outputLength: output.length,
    detectedShape,
  };
}

function normalizeRows(value: unknown, inputShape: InputShape): TableRow[] {
  if (inputShape === "array") return Array.isArray(value) ? value.map(asRow) : [];
  if (inputShape === "object") return isPlainObject(value) ? [asRow(value)] : [];
  if (inputShape === "objectValues") return isPlainObject(value) ? objectValuesToRows(value as Record<string, unknown>) : [];

  if (Array.isArray(value)) return value.map(asRow);
  if (isPlainObject(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length && entries.every((entry) => isPlainObject(entry[1]))) {
      return objectValuesToRows(value as Record<string, unknown>);
    }
    return [asRow(value)];
  }
  return [asRow(value)];
}

function objectValuesToRows(value: Record<string, unknown>) {
  const entries = Object.entries(value);
  const rows = entries.map((entry) => asRow(entry[1]));
  const sourceKeyColumn = chooseSourceKeyColumn(rows);
  return rows.map((row, index) => {
    const next = copyRow(row);
    setOwn(next, sourceKeyColumn, entries[index][0]);
    return next;
  });
}

function chooseSourceKeyColumn(rows: TableRow[]) {
  let candidate = "$key";
  let suffix = 2;
  while (rows.some((row) => Object.prototype.hasOwnProperty.call(row, candidate))) {
    candidate = `$key_${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function asRow(value: unknown): TableRow {
  if (isPlainObject(value)) return copyRow(value as Record<string, unknown>);
  const row = createSafeObject();
  setOwn(row, "value", value);
  return row;
}

function copyRow(source: Record<string, unknown>) {
  const target = createSafeObject();
  Object.keys(source).forEach((key) => setOwn(target, key, source[key]));
  return target;
}

function normalizeRow(row: TableRow, nestedMode: NestedMode): TableRow {
  if (nestedMode === "flatten") return flattenObject(row);
  const next = createSafeObject();
  Object.keys(row).forEach((key) => {
    const value = row[key];
    if (isNested(value)) {
      if (nestedMode === "json") setOwn(next, key, JSON.stringify(value));
      return;
    }
    setOwn(next, key, value);
  });
  return next;
}

function flattenObject(value: unknown, prefix = "", output: TableRow = createSafeObject()): TableRow {
  if (!isPlainObject(value)) {
    if (prefix) setOwn(output, prefix, Array.isArray(value) ? JSON.stringify(value) : value);
    return output;
  }

  const source = value as Record<string, unknown>;
  const keys = Object.keys(source);
  if (!keys.length && prefix) {
    setOwn(output, prefix, "{}");
    return output;
  }

  keys.forEach((key) => {
    const item = source[key];
    const path = joinColumnPath(prefix, key);
    if (isPlainObject(item)) flattenObject(item, path, output);
    else if (Array.isArray(item)) setOwn(output, path, JSON.stringify(item));
    else setOwn(output, path, item);
  });
  return output;
}

function joinColumnPath(prefix: string, key: string) {
  const simple = /^[A-Za-z_$][A-Za-z0-9_$-]*$/.test(key);
  if (simple) return prefix ? `${prefix}.${key}` : key;
  const bracket = `[${JSON.stringify(key)}]`;
  return prefix ? `${prefix}${bracket}` : bracket;
}

function chooseColumns(rows: TableRow[], options: { columnMode: ColumnMode; manualColumns: string; sortColumns: boolean }) {
  let columns: string[] = [];
  if (options.columnMode === "manual") {
    const seen = new Set<string>();
    options.manualColumns.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").forEach((line) => {
      const column = line.trim();
      if (column && !seen.has(column)) {
        seen.add(column);
        columns.push(column);
      }
    });
  } else if (options.columnMode === "firstRow") {
    columns = Object.keys(rows[0] || {});
  } else if (options.columnMode === "common") {
    const first = rows[0] || createSafeObject();
    columns = Object.keys(first).filter((key) => rows.slice(1).every((row) => Object.prototype.hasOwnProperty.call(row, key)));
  } else {
    const seen = new Set<string>();
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!seen.has(key)) {
          seen.add(key);
          columns.push(key);
        }
      });
    });
  }
  if (options.sortColumns) columns = columns.slice().sort(compareUtf16);
  return columns;
}

function buildMarkdownTable(rows: TableRow[], columns: string[], options: {
  missingValueMode: MissingValueMode;
  trimCellText: boolean;
  escapeMarkdownPipes: boolean;
  humanizeHeaders: boolean;
}) {
  const headers = columns.map((column) => cleanMarkdownCell(headerLabel(column, options.humanizeHeaders), options.escapeMarkdownPipes));
  const lines = [`| ${headers.join(" | ")} |`, `| ${columns.map(() => "---").join(" | ")} |`];
  rows.forEach((row) => {
    lines.push(`| ${columns.map((column) => cleanMarkdownCell(formatCell(row[column], options.missingValueMode, options.trimCellText), options.escapeMarkdownPipes)).join(" | ")} |`);
  });
  return lines.join("\n");
}

function buildPreview(rows: TableRow[], columns: string[], options: { missingValueMode: MissingValueMode; trimCellText: boolean; humanizeHeaders: boolean }) {
  const lines = [
    `Rows: ${rows.length}`,
    `Columns: ${columns.length}`,
    "",
    columns.map((column) => headerLabel(column, options.humanizeHeaders)).join(" | "),
    columns.map(() => "---").join(" | "),
  ];
  rows.slice(0, 25).forEach((row) => lines.push(columns.map((column) => formatCell(row[column], options.missingValueMode, options.trimCellText)).join(" | ")));
  if (rows.length > 25) lines.push(`... ${rows.length - 25} more rows`);
  return lines.join("\n");
}

function buildHtmlTable(rows: TableRow[], columns: string[], options: { missingValueMode: MissingValueMode; trimCellText: boolean; humanizeHeaders: boolean }) {
  const header = columns.map((column) => `      <th>${escapeHtml(headerLabel(column, options.humanizeHeaders))}</th>`).join("\n");
  const body = rows.map((row) => {
    const cells = columns.map((column) => `      <td>${escapeHtml(formatCell(row[column], options.missingValueMode, options.trimCellText))}</td>`).join("\n");
    return `    <tr>\n${cells}\n    </tr>`;
  }).join("\n");
  return `<table>\n  <thead>\n    <tr>\n${header}\n    </tr>\n  </thead>\n  <tbody>\n${body}\n  </tbody>\n</table>`;
}

function buildCsv(rows: TableRow[], columns: string[], options: { missingValueMode: MissingValueMode; trimCellText: boolean; humanizeHeaders: boolean }) {
  const header = columns.map((column) => csvCell(headerLabel(column, options.humanizeHeaders))).join(",");
  const body = rows.map((row) => columns.map((column) => csvCell(formatCell(row[column], options.missingValueMode, options.trimCellText))).join(","));
  return [header, ...body].join("\n");
}

function buildChecklist(sourceRows: number, outputRows: number, columns: string[], issues: Issue[]) {
  const lines = [
    "# JSON Table Checklist",
    "",
    `- [${outputRows > 0 ? "x" : " "}] ${outputRows} of ${sourceRows} source row${sourceRows === 1 ? "" : "s"} included.`,
    `- [${columns.length > 0 ? "x" : " "}] ${columns.length} column${columns.length === 1 ? "" : "s"} selected.`,
    `- [${columns.length <= 8 ? "x" : " "}] Table is eight columns wide or less.`,
  ];
  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }
  return lines.join("\n");
}

function buildIssues(sourceRows: TableRow[], normalizedRows: TableRow[], finalRows: TableRow[], columns: string[], options: {
  warnNestedValues: boolean;
  warnWideTables: boolean;
  nestedMode: NestedMode;
  limitRows: boolean;
  humanizeHeaders: boolean;
  escapeMarkdownPipes: boolean;
  outputMode: OutputMode;
  columnMode: ColumnMode;
}): Issue[] {
  const issues: Issue[] = [];

  if (options.warnWideTables && columns.length > 8) {
    issues.push({ severity: "warning", title: "Wide table", message: `${columns.length} columns can become difficult to scan in a README, issue, or narrow documentation layout.` });
  }

  if (options.limitRows && normalizedRows.length > finalRows.length) {
    issues.push({ severity: "warning", title: "Rows were intentionally truncated", message: `${normalizedRows.length - finalRows.length} source row${normalizedRows.length - finalRows.length === 1 ? "" : "s"} are not present in generated output.` });
  } else if (sourceRows.length > 100) {
    issues.push({ severity: "info", title: "Large table source", message: "Large Markdown tables are valid text but can be cumbersome to review and edit." });
  }

  const nestedRowCount = sourceRows.filter((row) => Object.keys(row).some((key) => isNested(row[key]))).length;
  if (options.warnNestedValues && nestedRowCount && options.nestedMode === "omit") {
    issues.push({ severity: "warning", title: "Nested values were omitted", message: `${nestedRowCount} row${nestedRowCount === 1 ? "" : "s"} contained object or array values that were left out by the selected nesting policy.` });
  } else if (options.warnNestedValues && nestedRowCount && options.nestedMode === "json") {
    issues.push({ severity: "info", title: "Nested values became JSON text", message: "Objects and arrays stay in one cell as serialized JSON rather than expanding into separate columns." });
  }

  if (options.humanizeHeaders) {
    const labels = columns.map((column) => headerLabel(column, true));
    const duplicates = labels.filter((label, index) => labels.indexOf(label) !== index);
    if (duplicates.length) {
      issues.push({ severity: "warning", title: "Humanized headings collide", message: `Different source columns display with the same heading: ${Array.from(new Set(duplicates)).join(", ")}. Disable humanized headings when exact names matter.` });
    }
  }

  if (options.outputMode === "markdown" && !options.escapeMarkdownPipes) {
    const containsPipe = columns.some((column) => headerLabel(column, options.humanizeHeaders).includes("|")) || finalRows.some((row) => columns.some((column) => formatCell(row[column], "empty", false).includes("|")));
    if (containsPipe) {
      issues.push({ severity: "warning", title: "Literal pipes can split cells", message: "At least one selected heading or value contains | while pipe escaping is disabled." });
    }
  }

  const missingManual = options.columnMode === "manual"
    ? columns.filter((column) => !normalizedRows.some((row) => Object.prototype.hasOwnProperty.call(row, column)))
    : [];
  if (missingManual.length && missingManual.length === columns.length) {
    issues.push({ severity: "warning", title: "Selected columns have no matching fields", message: "The manual column names do not match any normalized row fields, so every generated cell will be a missing value." });
  }

  return issues;
}

function getNotes(result: Result): Issue[] {
  const notes = result.issues.slice();
  if (result.outputLength > 50_000) notes.push({ severity: "info", title: "Large generated text", message: "Some Markdown editors and issue fields become sluggish when a table grows very large." });
  return notes;
}

function detectInputShape(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (isPlainObject(value)) return "object";
  if (value === null) return "null";
  return typeof value;
}

function isNested(value: unknown) {
  return Boolean(value) && typeof value === "object";
}

function formatCell(value: unknown, missingValueMode: MissingValueMode, trimCellText: boolean) {
  if (value === undefined) {
    if (missingValueMode === "dash") return "-";
    if (missingValueMode === "null") return "null";
    return "";
  }
  if (value === null) return "null";

  let text: string;
  if (typeof value === "string") text = value;
  else if (typeof value === "number" || typeof value === "boolean") text = String(value);
  else text = JSON.stringify(value);

  text = text.replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\r/g, " ");
  if (trimCellText) text = text.replace(/\s+/g, " ").trim();
  return text;
}

function cleanMarkdownCell(value: string, escapePipes: boolean) {
  if (!escapePipes) return value;
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

function headerLabel(value: string, humanizeHeaders: boolean) {
  if (!humanizeHeaders || value.includes("[")) return value;
  return value
    .replace(/\./g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
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
    if (/\s/.test(char)) { index += 1; continue; }
    if (char === "{") {
      stack.push({ type: "object", keys: new Set<string>() });
      if (stack.length > MAX_JSON_DEPTH) throw new Error(`${label} is nested more than ${MAX_JSON_DEPTH} levels.`);
      index += 1; continue;
    }
    if (char === "[") {
      stack.push({ type: "array" });
      if (stack.length > MAX_JSON_DEPTH) throw new Error(`${label} is nested more than ${MAX_JSON_DEPTH} levels.`);
      index += 1; continue;
    }
    if (char === "}" || char === "]") { stack.pop(); index += 1; continue; }
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
      index = end + 1; continue;
    }
    if (char === "-" || /\d/.test(char)) {
      const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (match) {
        const token = match[0];
        const numericValue = Number(token);
        if (!isSafeNumberToken(token, numericValue)) throw new Error(`${label} contains JSON number ${token}, which cannot be rewritten safely with JavaScript number semantics.`);
        index += token.length; continue;
      }
    }
    index += 1;
  }
}

function findJsonStringEnd(text: string, start: number) {
  let escaped = false;
  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) { escaped = false; continue; }
    if (char === "\\") { escaped = true; continue; }
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

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#d9a928]" />
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
  const className = issue.severity === "warning"
    ? "self-start rounded-xl border border-amber-200 bg-amber-50 p-4"
    : "self-start rounded-xl border border-gray-200 bg-gray-50 p-4";
  return (
    <div className={className}>
      <p className={`text-sm font-semibold ${issue.severity === "warning" ? "text-amber-900" : "text-gray-900"}`}>{issue.title}</p>
      <p className={`mt-1 text-sm leading-6 ${issue.severity === "warning" ? "text-amber-800" : "text-gray-600"}`}>{issue.message}</p>
    </div>
  );
}
