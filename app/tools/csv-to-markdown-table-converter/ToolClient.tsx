"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type DelimiterMode = "comma" | "semicolon" | "tab" | "pipe" | "auto";
type OutputMode = "markdown" | "compact" | "json";
type AlignmentMode = "left" | "center" | "right" | "none";
type HeaderMode = "firstRow" | "generate";

type ParsedCsvResult = {
  rows: string[][];
  delimiter: string;
  warnings: string[];
};

type ConvertResult = {
  markdown: string;
  rows: string[][];
  headers: string[];
  bodyRows: string[][];
  delimiter: string;
  rowCount: number;
  columnCount: number;
  warnings: string[];
};

type TableNote = {
  severity: "warning" | "info";
  title: string;
  message: string;
};

const sampleCsv = `Tool,Category,Status,Notes
JSON Formatter,JSON & Data Tools,Live,"Formats and validates JSON"
CSV to Markdown Table Converter,JSON & Data Tools,Draft,"Converts CSV into Markdown"
Security Headers Checker,Security Tools,Live,"Checks important HTTP headers"`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [delimiterMode, setDelimiterMode] = useState<DelimiterMode>("auto");
  const [outputMode, setOutputMode] = useState<OutputMode>("markdown");
  const [headerMode, setHeaderMode] = useState<HeaderMode>("firstRow");
  const [alignmentMode, setAlignmentMode] = useState<AlignmentMode>("left");
  const [trimCells, setTrimCells] = useState(false);
  const [escapePipes, setEscapePipes] = useState(true);
  const [normalizeRows, setNormalizeRows] = useState(true);
  const [includeEmptyRows, setIncludeEmptyRows] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getTableNotes(result) : []), [result]);

  const convertCsv = () => {
    if (!input.trim()) {
      setError("Please paste CSV data to convert.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = convertCsvToMarkdown(input, {
        delimiterMode,
        outputMode,
        headerMode,
        alignmentMode,
        trimCells,
        escapePipes,
        normalizeRows,
        includeEmptyRows,
      });

      setResult(nextResult);
      setOutput(nextResult.markdown);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to convert this CSV into a Markdown table."
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
    setInput(sampleCsv);
    setDelimiterMode("auto");
    setOutputMode("markdown");
    setHeaderMode("firstRow");
    setAlignmentMode("left");
    setTrimCells(false);
    setEscapePipes(true);
    setNormalizeRows(true);
    setIncludeEmptyRows(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setDelimiterMode("auto");
    setOutputMode("markdown");
    setHeaderMode("firstRow");
    setAlignmentMode("left");
    setTrimCells(false);
    setEscapePipes(true);
    setNormalizeRows(true);
    setIncludeEmptyRows(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="CSV to Markdown Table Converter"
      description="Parse delimited rows into Markdown tables while preserving quoted fields and flagging dialect ambiguity."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          CSV Input
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
          placeholder={sampleCsv}
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste CSV, TSV, semicolon-separated, or pipe-separated data. Quoted
          values and commas inside quotes are supported.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Table choices
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Delimiter"
            value={delimiterMode}
            onChange={(value) => {
              setDelimiterMode(value as DelimiterMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Auto detect", value: "auto" },
              { label: "Comma", value: "comma" },
              { label: "Semicolon", value: "semicolon" },
              { label: "Tab", value: "tab" },
              { label: "Pipe", value: "pipe" },
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
              { label: "Markdown table", value: "markdown" },
              { label: "Compact Markdown", value: "compact" },
              { label: "JSON", value: "json" },
            ]}
          />

          <YoryantraSelect
            label="Headers"
            value={headerMode}
            onChange={(value) => {
              setHeaderMode(value as HeaderMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "First row is header", value: "firstRow" },
              { label: "Generate headers", value: "generate" },
            ]}
          />

          <YoryantraSelect
            label="Alignment"
            value={alignmentMode}
            onChange={(value) => {
              setAlignmentMode(value as AlignmentMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
              { label: "None", value: "none" },
            ]}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={trimCells}
              onChange={(event) => {
                setTrimCells(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Trim leading and trailing whitespace in cells (changes values)
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={escapePipes}
              onChange={(event) => {
                setEscapePipes(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Escape pipe characters inside cells
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={normalizeRows}
              onChange={(event) => {
                setNormalizeRows(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Normalize uneven rows
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeEmptyRows}
              onChange={(event) => {
                setIncludeEmptyRows(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Keep blank physical lines as empty rows
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Auto detection is a best-effort guess across the first records. Pick the
          delimiter manually when a file uses an unusual dialect or a single column.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertCsv} className="yoryantra-btn min-h-10 whitespace-nowrap">
          Convert to Markdown
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
          <SummaryCard label="Rows" value={result.rowCount.toLocaleString()} />
          <SummaryCard label="Columns" value={result.columnCount.toLocaleString()} />
          <SummaryCard
            label="Delimiter"
            value={result.delimiter === "\t" ? "Tab" : result.delimiter}
          />
          <SummaryCard label="Warnings" value={result.warnings.length.toLocaleString()} />
        </div>
      )}

      {result && result.rows.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Table Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Preview of the parsed CSV before or after Markdown conversion.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {result.headers.map((header, index) => (
                    <th key={`${header}-${index}`} className="px-4 py-3 font-semibold">
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.bodyRows.slice(0, 50).map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {result.headers.map((_header, cellIndex) => (
                      <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 text-gray-700">
                        <span className="block max-w-[260px] break-words">
                          {row[cellIndex] || ""}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.bodyRows.length > 50 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 50 body rows only. Copy the Markdown output for
              the full table.
            </p>
          )}
        </div>
      )}

      {notes.some((note) => note.severity === "warning") && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Check before copying
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
            Converted Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "Markdown table output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Parsing and conversion run in your browser. Pasted rows are not sent to a
        Yoryantra server by this page.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            CSV looks simple until the rows stop being simple
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A comma is only a separator when it is outside a quoted field. Quotes
            inside a quoted field are doubled, and a quoted field may contain a
            line break. Those details are why splitting a CSV row on every comma
            breaks as soon as an address, sentence, or exported note contains one.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 4180 documents the widely used comma-separated conventions and the
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">text/csv</code>
            media type, but it is informational rather than a universal CSV
            standard. Semicolon, tab, and pipe inputs are treated here as related
            delimited-text dialects.{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc4180"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 4180
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Auto-detect is a clue, not a guarantee
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Delimiter detection compares comma, semicolon, tab, and pipe counts
            across several complete records while ignoring separators inside
            quoted fields. A file with one column, mixed delimiters, or only one
            short record can still be ambiguous, so the result calls that out
            instead of pretending the guess is certain.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            If an export came from software that already tells you its delimiter,
            selecting it manually is safer than relying on detection.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Whitespace and uneven rows are data decisions
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Leading and trailing spaces are preserved by default because RFC-style
            CSV treats spaces as part of an unquoted field. Turning on trimming is
            convenient for messy exports, but it deliberately changes cell values.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Row normalization pads short rows so every Markdown row has the same
            number of cells. It never discards a longer row: the widest parsed row
            determines the table width. A line containing separators such as
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">,,</code>
            is kept as a real record even when all of its cells are empty; the
            “blank physical lines” option applies only to genuinely blank lines.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Markdown tables have a different set of constraints
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Pipe tables are an extension used by GitHub Flavored Markdown rather
            than part of core CommonMark. GFM expects a header row plus a delimiter
            row, uses colons for alignment, and treats an unescaped pipe as a cell
            boundary.{" "}
            <a
              href="https://github.github.com/gfm/#tables-extension-"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              GFM table syntax
            </a>
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Embedded CSV line breaks are written as
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">&lt;br&gt;</code>
            so one CSV record stays on one Markdown table row. That relies on the
            destination renderer accepting inline HTML. Cell text is otherwise
            preserved; HTML from the source is not sanitized, so review untrusted
            content before publishing it in a renderer that permits raw HTML.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A quoted field that should survive intact
          </h2>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">CSV</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-sm text-gray-700">
{`Name,Note
Sneha,"Pune, Maharashtra"
Varoun,"Said ""ship it"" today"`}
              </pre>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Markdown</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-sm text-gray-700">
{`| Name | Note |
| :--- | :--- |
| Sneha | Pune, Maharashtra |
| Varoun | Said "ship it" today |`}
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When a table is the wrong shape
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Very wide or very long datasets are technically convertible but often
            make poor documentation tables. The page flags those shapes so you can
            decide whether a short summary, downloadable data file, or smaller
            selection communicates the information better.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/csv-to-markdown-table-converter" />
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

const MAX_CSV_INPUT_CHARS = 1_500_000;
const MAX_CSV_ROWS = 20_000;
const MAX_CSV_COLUMNS = 250;

function convertCsvToMarkdown(
  input: string,
  options: {
    delimiterMode: DelimiterMode;
    outputMode: OutputMode;
    headerMode: HeaderMode;
    alignmentMode: AlignmentMode;
    trimCells: boolean;
    escapePipes: boolean;
    normalizeRows: boolean;
    includeEmptyRows: boolean;
  }
): ConvertResult {
  if (input.length > MAX_CSV_INPUT_CHARS) {
    throw new Error(
      `Input is larger than ${MAX_CSV_INPUT_CHARS.toLocaleString()} characters. Split very large exports before converting them in the browser.`
    );
  }

  const parsed = parseCsv(input, {
    delimiterMode: options.delimiterMode,
    trimCells: options.trimCells,
    includeEmptyRows: options.includeEmptyRows,
  });

  if (parsed.rows.length === 0) {
    throw new Error("No delimited records were found.");
  }

  const maxColumns = Math.max(...parsed.rows.map((row) => row.length));

  if (maxColumns > MAX_CSV_COLUMNS) {
    throw new Error(
      `The widest row has ${maxColumns.toLocaleString()} columns. The browser preview is limited to ${MAX_CSV_COLUMNS.toLocaleString()} columns.`
    );
  }

  let rows = parsed.rows;

  if (options.normalizeRows) {
    rows = rows.map((row) => normalizeRow(row, maxColumns));
  }

  let headers: string[] = [];
  let bodyRows: string[][] = [];

  if (options.headerMode === "firstRow") {
    headers = normalizeRow(rows[0] || [], maxColumns).map((header, index) =>
      header || `Column ${index + 1}`
    );
    bodyRows = rows.slice(1);
  } else {
    headers = Array.from({ length: maxColumns }, (_item, index) => `Column ${index + 1}`);
    bodyRows = rows;
  }

  if (options.normalizeRows) {
    bodyRows = bodyRows.map((row) => normalizeRow(row, headers.length));
  }

  const warnings = [...parsed.warnings];

  if (rows.some((row) => row.length !== maxColumns)) {
    warnings.push(
      options.normalizeRows
        ? "Uneven rows were padded to the widest parsed row."
        : "Some rows have fewer cells than the widest row; the Markdown output preserves those shorter rows."
    );
  }

  const markdown = formatMarkdownTable({
    headers,
    bodyRows,
    alignmentMode: options.alignmentMode,
    outputMode: options.outputMode,
    escapePipes: options.escapePipes,
    delimiter: parsed.delimiter,
    warnings,
  });

  return {
    markdown,
    rows,
    headers,
    bodyRows,
    delimiter: parsed.delimiter,
    rowCount: rows.length,
    columnCount: headers.length,
    warnings,
  };
}

function parseCsv(
  input: string,
  options: {
    delimiterMode: DelimiterMode;
    trimCells: boolean;
    includeEmptyRows: boolean;
  }
): ParsedCsvResult {
  const detection = resolveDelimiter(input, options.delimiterMode);
  const delimiter = detection.delimiter;
  const warnings = detection.warning ? [detection.warning] : [];
  const rows: string[][] = [];

  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;
  let afterClosingQuote = false;
  let rowHasSyntax = false;
  let line = 1;
  let column = 1;
  let endedWithRecordBreak = false;

  const pushCell = () => {
    currentRow.push(cleanCell(currentCell, options.trimCells));
    currentCell = "";

    if (currentRow.length > MAX_CSV_COLUMNS) {
      throw new Error(
        `Line ${line} exceeds the ${MAX_CSV_COLUMNS.toLocaleString()}-column browser limit.`
      );
    }
  };

  const pushCurrentRow = () => {
    if (rowHasSyntax || options.includeEmptyRows) {
      rows.push(currentRow);

      if (rows.length > MAX_CSV_ROWS) {
        throw new Error(
          `Input exceeds the ${MAX_CSV_ROWS.toLocaleString()}-record browser limit. Split the data before converting it.`
        );
      }
    }

    currentRow = [];
    rowHasSyntax = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (inQuotes) {
      endedWithRecordBreak = false;

      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          index += 1;
          column += 2;
          continue;
        }

        inQuotes = false;
        afterClosingQuote = true;
        column += 1;
        continue;
      }

      if (char === "\r" && nextChar === "\n") {
        currentCell += "\n";
        index += 1;
        line += 1;
        column = 1;
        continue;
      }

      if (char === "\n" || char === "\r") {
        currentCell += "\n";
        line += 1;
        column = 1;
        continue;
      }

      currentCell += char;
      column += 1;
      continue;
    }

    if (afterClosingQuote) {
      if (char === delimiter) {
        pushCell();
        rowHasSyntax = true;
        afterClosingQuote = false;
        endedWithRecordBreak = false;
        column += 1;
        continue;
      }

      if (char === "\n" || char === "\r") {
        pushCell();
        pushCurrentRow();
        afterClosingQuote = false;
        endedWithRecordBreak = true;

        if (char === "\r" && nextChar === "\n") {
          index += 1;
        }

        line += 1;
        column = 1;
        continue;
      }

      throw new Error(
        `Unexpected ${JSON.stringify(char)} after a closing quote at line ${line}, column ${column}. A quoted field must be followed by a delimiter or line break.`
      );
    }

    if (char === '"') {
      if (currentCell.length !== 0) {
        throw new Error(
          `Unexpected quote inside an unquoted field at line ${line}, column ${column}. Quote the whole field and double embedded quotes.`
        );
      }

      inQuotes = true;
      rowHasSyntax = true;
      endedWithRecordBreak = false;
      column += 1;
      continue;
    }

    if (char === delimiter) {
      pushCell();
      rowHasSyntax = true;
      endedWithRecordBreak = false;
      column += 1;
      continue;
    }

    if (char === "\n" || char === "\r") {
      pushCell();
      pushCurrentRow();
      endedWithRecordBreak = true;

      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      line += 1;
      column = 1;
      continue;
    }

    currentCell += char;
    rowHasSyntax = true;
    endedWithRecordBreak = false;
    column += 1;
  }

  if (inQuotes) {
    throw new Error(`Quoted field beginning before line ${line} is not closed.`);
  }

  if (afterClosingQuote || rowHasSyntax || currentCell.length > 0 || !endedWithRecordBreak) {
    pushCell();
    pushCurrentRow();
  }

  return {
    rows,
    delimiter,
    warnings,
  };
}

function cleanCell(value: string, trimCells: boolean) {
  return trimCells ? value.trim() : value;
}

function resolveDelimiter(
  input: string,
  mode: DelimiterMode
): { delimiter: string; warning?: string } {
  if (mode === "comma") {
    return { delimiter: "," };
  }

  if (mode === "semicolon") {
    return { delimiter: ";" };
  }

  if (mode === "tab") {
    return { delimiter: "\t" };
  }

  if (mode === "pipe") {
    return { delimiter: "|" };
  }

  return detectDelimiter(input);
}

function detectDelimiter(input: string): { delimiter: string; warning?: string } {
  const candidates = [",", ";", "\t", "|"];
  const scored = candidates.map((delimiter) => {
    const counts = getRecordDelimiterCounts(input, delimiter, 20);
    const nonZero = counts.filter((count) => count > 0);

    if (nonZero.length === 0) {
      return { delimiter, score: 0, modeCount: 0, supportingRows: 0 };
    }

    const frequencies: Record<string, number> = {};
    nonZero.forEach((count) => {
      frequencies[String(count)] = (frequencies[String(count)] || 0) + 1;
    });

    const modes = Object.keys(frequencies)
      .map((key) => ({ count: Number(key), frequency: frequencies[key] }))
      .sort((a, b) => b.frequency - a.frequency || b.count - a.count);
    const best = modes[0];

    return {
      delimiter,
      modeCount: best.count,
      supportingRows: best.frequency,
      score: best.frequency * 10_000 + best.count * 100 + nonZero.length,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  if (best.score === 0) {
    return {
      delimiter: ",",
      warning:
        "No repeated delimiter was detected. The input is being treated as a single-column comma CSV; choose a delimiter manually if that is not intended.",
    };
  }

  const tied = scored.filter((candidate) => candidate.score === best.score);

  if (tied.length > 1) {
    return {
      delimiter: best.delimiter,
      warning: `Delimiter detection is ambiguous. ${describeDelimiter(
        best.delimiter
      )} was selected; choose the delimiter manually if the preview is wrong.`,
    };
  }

  if (best.supportingRows < 2) {
    return {
      delimiter: best.delimiter,
      warning: `Delimiter detection is based on only one structured record. ${describeDelimiter(
        best.delimiter
      )} was selected, so check the preview before copying.`,
    };
  }

  return { delimiter: best.delimiter };
}

function getRecordDelimiterCounts(input: string, delimiter: string, maxRecords: number) {
  const counts: number[] = [];
  let inQuotes = false;
  let count = 0;
  let hasVisibleContent = false;

  for (let index = 0; index < input.length && counts.length < maxRecords; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      hasVisibleContent = true;

      if (inQuotes && nextChar === '"') {
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && char === delimiter) {
      count += 1;
      hasVisibleContent = true;
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (hasVisibleContent || count > 0) {
        counts.push(count);
      }

      count = 0;
      hasVisibleContent = false;

      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      continue;
    }

    if (!/\s/.test(char)) {
      hasVisibleContent = true;
    }
  }

  if ((hasVisibleContent || count > 0) && counts.length < maxRecords) {
    counts.push(count);
  }

  return counts;
}

function describeDelimiter(delimiter: string) {
  if (delimiter === "\t") {
    return "Tab";
  }

  if (delimiter === ",") {
    return "Comma";
  }

  if (delimiter === ";") {
    return "Semicolon";
  }

  return "Pipe";
}

function normalizeRow(row: string[], length: number) {
  const next = [...row];

  while (next.length < length) {
    next.push("");
  }

  return next;
}

function formatMarkdownTable({
  headers,
  bodyRows,
  alignmentMode,
  outputMode,
  escapePipes,
  delimiter,
  warnings,
}: {
  headers: string[];
  bodyRows: string[][];
  alignmentMode: AlignmentMode;
  outputMode: OutputMode;
  escapePipes: boolean;
  delimiter: string;
  warnings: string[];
}) {
  if (outputMode === "json") {
    return JSON.stringify(
      {
        headers,
        rows: bodyRows,
        delimiter: delimiter === "\t" ? "tab" : delimiter,
        warnings,
      },
      null,
      2
    );
  }

  const cleanHeaders = headers.map((cell) => formatMarkdownCell(cell, escapePipes));
  const cleanRows = bodyRows.map((row) =>
    row.map((cell) => formatMarkdownCell(cell, escapePipes))
  );
  const separator = headers.map(() => getAlignmentMarker(alignmentMode));
  const tableRows = [cleanHeaders, separator, ...cleanRows];

  if (outputMode === "compact") {
    return tableRows.map((row) => `|${row.join("|")}|`).join("\n");
  }

  return tableRows.map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function formatMarkdownCell(value: string, escapePipes: boolean) {
  const clean = value.replace(/\r\n|\r|\n/g, "<br>");

  return escapePipes ? clean.replace(/\|/g, "\\|") : clean;
}

function getAlignmentMarker(alignmentMode: AlignmentMode) {
  if (alignmentMode === "center") {
    return ":---:";
  }

  if (alignmentMode === "right") {
    return "---:";
  }

  if (alignmentMode === "none") {
    return "---";
  }

  return ":---";
}

function getTableNotes(result: ConvertResult): TableNote[] {
  const notes: TableNote[] = [];

  result.warnings.forEach((warning, index) => {
    notes.push({
      severity: "warning",
      title: index === 0 ? "Parsing decision" : `Parsing decision ${index + 1}`,
      message: warning,
    });
  });

  if (result.rowCount > 100) {
    notes.push({
      severity: "warning",
      title: "Long documentation table",
      message:
        "More than 100 parsed rows will usually be awkward to scan in Markdown. Consider publishing a smaller selection and linking the full data separately.",
    });
  }

  if (result.columnCount > 8) {
    notes.push({
      severity: "warning",
      title: "Wide documentation table",
      message:
        "More than eight columns can overflow narrow documentation layouts even when the Markdown syntax is valid.",
    });
  }

  if (result.markdown.includes("<br>")) {
    notes.push({
      severity: "info",
      title: "Embedded line breaks became <br>",
      message:
        "A Markdown table row cannot contain the CSV record's physical line break directly, so embedded cell line breaks are represented with inline HTML.",
    });
  }

  return notes;
}
