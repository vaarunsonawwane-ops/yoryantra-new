"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type DelimiterMode = "comma" | "semicolon" | "tab" | "pipe" | "auto";
type OutputMode = "markdown" | "github" | "compact" | "json";
type AlignmentMode = "left" | "center" | "right" | "none";
type HeaderMode = "firstRow" | "generate" | "none";

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
  const [trimCells, setTrimCells] = useState(true);
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
    setTrimCells(true);
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
    setTrimCells(true);
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
      description="Convert CSV data into clean Markdown tables. Handle headers, delimiters, quoted values, alignment, escaped pipes, trimmed cells, and table previews directly in your browser."
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
          Options
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
              { label: "GitHub Markdown", value: "github" },
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
              { label: "No header row", value: "none" },
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

            Trim cell values
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

            Keep empty rows
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Markdown tables need a header row and separator row. If your CSV has no
          header, generated column names can be used.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertCsv} className="yoryantra-btn">
          Convert to Markdown
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

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Table notes
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
            Markdown Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "Markdown table output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        CSV to Markdown conversion happens directly in your browser. Your pasted
        data is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting CSV Data Into Markdown Tables
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CSV is easy to export from spreadsheets, dashboards, and data tools,
            but it is not always easy to paste into documentation. Markdown
            tables are easier to read in GitHub, README files, notes, issues,
            docs, and static site content.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CSV to Markdown Table Converter turns pasted CSV into a clean
            Markdown table. It can detect delimiters, handle quoted values, use
            the first row as headers, generate headers, align columns, and escape
            pipe characters inside cells.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating a Markdown Table From CSV
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste CSV, TSV, semicolon-separated, or pipe-separated data.</li>
            <li>Choose delimiter detection or select the delimiter manually.</li>
            <li>Choose header, alignment, and cleanup options.</li>
            <li>Convert the data and review the table preview.</li>
            <li>Copy the Markdown output into your docs, README, or notes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CSV to Markdown Table Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Turning spreadsheet exports into Markdown documentation.</li>
            <li>Creating README tables from CSV data.</li>
            <li>Formatting tool lists, changelogs, comparison tables, and reports.</li>
            <li>Cleaning copied CSV before pasting into GitHub issues.</li>
            <li>Converting TSV data from spreadsheets into Markdown tables.</li>
            <li>Escaping pipe characters that would otherwise break Markdown tables.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Markdown Table
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`| Tool | Category | Status |
| --- | --- | --- |
| JSON Formatter | JSON & Data Tools | Live |
| CSV to Markdown Table Converter | JSON & Data Tools | Draft |`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Markdown Tables Need Clean Rows
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Markdown tables work best when every row has the same number of
            columns. If a CSV row has fewer or more cells than the header row,
            the table can look broken after pasting.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use the normalize rows option when the input has uneven rows. It pads
            missing cells and keeps the table structure easier to read.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a CSV to Markdown converter do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads CSV rows and turns them into a Markdown table that can
                be pasted into README files, docs, notes, or GitHub issues.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support quoted CSV values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Quoted values, commas inside quotes, and escaped quotes are
                handled by the parser.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this convert TSV to Markdown?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Choose tab as the delimiter, or use auto detect for pasted
                tab-separated data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do pipe characters need escaping?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Markdown tables use pipe characters to separate columns. If a
                cell contains a pipe, escaping it helps keep the table intact.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my CSV uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/csv-to-json-converter" className="yoryantra-btn-outline">
              CSV to JSON Converter
            </Link>

            <Link href="/tools/json-to-csv-converter" className="yoryantra-btn-outline">
              JSON to CSV Converter
            </Link>

            <Link href="/tools/csv-escape-formatter" className="yoryantra-btn-outline">
              CSV Escape Formatter
            </Link>

            <Link href="/tools/markdown-table-generator" className="yoryantra-btn-outline">
              Markdown Table Generator
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
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
  const parsed = parseCsv(input, {
    delimiterMode: options.delimiterMode,
    trimCells: options.trimCells,
    includeEmptyRows: options.includeEmptyRows,
  });

  if (parsed.rows.length === 0) {
    throw new Error("No CSV rows were found.");
  }

  const maxColumns = Math.max(...parsed.rows.map((row) => row.length));
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
  } else if (options.headerMode === "generate") {
    headers = Array.from({ length: maxColumns }, (_item, index) => `Column ${index + 1}`);
    bodyRows = rows;
  } else {
    headers = Array.from({ length: maxColumns }, (_item, index) => `Column ${index + 1}`);
    bodyRows = rows;
  }

  if (options.normalizeRows) {
    bodyRows = bodyRows.map((row) => normalizeRow(row, headers.length));
  }

  const warnings = [...parsed.warnings];

  if (rows.some((row) => row.length !== maxColumns)) {
    warnings.push("Some rows have a different number of columns.");
  }

  if (headers.length === 0) {
    throw new Error("No table columns were found.");
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
  const delimiter = getDelimiter(input, options.delimiterMode);
  const warnings: string[] = [];
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === delimiter && !inQuotes) {
      currentRow.push(cleanCell(currentCell, options.trimCells));
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(cleanCell(currentCell, options.trimCells));
      pushRow(rows, currentRow, options.includeEmptyRows);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (inQuotes) {
    warnings.push("The CSV input has an unmatched quote. The result may need review.");
  }

  currentRow.push(cleanCell(currentCell, options.trimCells));
  pushRow(rows, currentRow, options.includeEmptyRows);

  return {
    rows,
    delimiter,
    warnings,
  };
}

function pushRow(rows: string[][], row: string[], includeEmptyRows: boolean) {
  const isEmpty = row.every((cell) => cell === "");

  if (!isEmpty || includeEmptyRows) {
    rows.push(row);
  }
}

function cleanCell(value: string, trimCells: boolean) {
  return trimCells ? value.trim() : value;
}

function getDelimiter(input: string, mode: DelimiterMode) {
  if (mode === "comma") {
    return ",";
  }

  if (mode === "semicolon") {
    return ";";
  }

  if (mode === "tab") {
    return "\t";
  }

  if (mode === "pipe") {
    return "|";
  }

  const firstLines = input.split(/\r?\n/).slice(0, 5).join("\n");
  const candidates = [",", ";", "\t", "|"];
  const counts = candidates.map((candidate) => ({
    delimiter: candidate,
    count: countDelimiterOutsideQuotes(firstLines, candidate),
  }));

  counts.sort((a, b) => b.count - a.count);

  return counts[0].count > 0 ? counts[0].delimiter : ",";
}

function countDelimiterOutsideQuotes(value: string, delimiter: string) {
  let count = 0;
  let inQuotes = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const nextChar = value[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === delimiter && !inQuotes) {
      count += 1;
    }
  }

  return count;
}

function normalizeRow(row: string[], length: number) {
  const next = [...row];

  while (next.length < length) {
    next.push("");
  }

  return next.slice(0, length);
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
  const clean = value.replace(/\r?\n/g, "<br>");

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

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review warnings",
      message: result.warnings.join(" "),
    });
  }

  if (result.rowCount > 100) {
    notes.push({
      title: "Large table",
      message:
        "This table has more than 100 rows. Markdown tables can become hard to read when they are very long.",
    });
  }

  if (result.columnCount > 8) {
    notes.push({
      title: "Wide table",
      message:
        "This table has many columns. It may be difficult to read on smaller screens or in narrow documentation layouts.",
    });
  }

  if (result.markdown.includes("<br>")) {
    notes.push({
      title: "Line breaks converted",
      message:
        "One or more cell line breaks were converted to <br> so the Markdown table stays in one row per record.",
    });
  }

  return notes;
}
