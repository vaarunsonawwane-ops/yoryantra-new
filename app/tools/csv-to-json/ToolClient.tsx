"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const MAX_INPUT_CHARS = 2_000_000;
const MAX_ROWS = 50_000;
const MAX_COLUMNS = 2_000;

const exampleCsv = `name,role,note
Sneha,Developer,"Handles APIs, CSV exports"
Varoun,Designer,"Line one
Line two"`;

type ParseSummary = {
  rows: number;
  columns: number;
  multilineFields: number;
  removedBom: boolean;
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<ParseSummary | null>(null);

  const headerWhitespaceNote = useMemo(() => {
    if (!summary || !input) return false;
    try {
      const parsed = parseCSV(input);
      return parsed.rows[0]?.some((value) => value !== value.trim()) ?? false;
    } catch {
      return false;
    }
  }, [input, summary]);

  const convertCSVToJSON = () => {
    try {
      if (!input.trim()) throw new Error("Enter CSV data before converting.");
      if (input.length > MAX_INPUT_CHARS) {
        throw new Error(
          `Input exceeds the ${MAX_INPUT_CHARS.toLocaleString()}-character browser limit. Split the CSV into smaller parts.`
        );
      }

      const parsed = parseCSV(input);
      const rows = parsed.rows;

      if (rows.length < 2) {
        throw new Error("The CSV needs a header row and at least one data record.");
      }

      const headers = rows[0].slice();
      if (parsed.removedBom && headers.length > 0) headers[0] = headers[0].replace(/^\uFEFF/, "");

      headers.forEach((header, index) => {
        if (!header.trim()) {
          throw new Error(`Header column ${index + 1} is empty. Give every column a property name.`);
        }
      });

      const seen = new Set<string>();
      headers.forEach((header) => {
        if (seen.has(header)) {
          throw new Error(
            `Duplicate header ${JSON.stringify(header)} would collapse two CSV columns into one JSON property.`
          );
        }
        seen.add(header);
      });

      const columnCount = headers.length;
      const result = rows.slice(1).map((row, rowIndex) => {
        if (row.length !== columnCount) {
          throw new Error(
            `Record ${rowIndex + 2} has ${row.length.toLocaleString()} field${row.length === 1 ? "" : "s"}; the header has ${columnCount.toLocaleString()}. Fix the row rather than silently filling or dropping columns.`
          );
        }

        const record = Object.create(null) as Record<string, string>;
        headers.forEach((header, index) => {
          Object.defineProperty(record, header, {
            value: row[index],
            enumerable: true,
            writable: true,
            configurable: true,
          });
        });
        return record;
      });

      setOutput(JSON.stringify(result, null, 2));
      setSummary({
        rows: result.length,
        columns: columnCount,
        multilineFields: parsed.multilineFields,
        removedBom: parsed.removedBom,
      });
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse this CSV safely.");
      setOutput("");
      setSummary(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the JSON output and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(exampleCsv);
    setOutput("");
    setError("");
    setSummary(null);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setSummary(null);
    setCopied(false);
  };

  return (
    <ToolShell
      title="CSV to JSON Converter"
      description="Parse header-based CSV into JSON records while preserving every field as text."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">CSV input</label>
        <textarea
          className="h-64 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder={exampleCsv}
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setSummary(null);
            setCopied(false);
          }}
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          The first record becomes the property-name row. Commas, line breaks, and doubled quotes inside quoted fields are preserved.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertCSVToJSON} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          Convert to JSON
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Data records" value={summary.rows.toLocaleString()} />
          <Metric label="Columns" value={summary.columns.toLocaleString()} />
          <Metric label="Multiline fields" value={summary.multilineFields.toLocaleString()} />
          <Metric label="Leading BOM" value={summary.removedBom ? "Removed" : "None"} />
        </div>
      )}

      {(headerWhitespaceNote || summary?.removedBom) && (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          {headerWhitespaceNote && (
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              <strong className="text-amber-900">Header whitespace is being preserved.</strong>{" "}
              Spaces are data in CSV. A heading such as <code className="rounded bg-amber-100 px-1"> name </code> becomes that exact JSON property name.
            </div>
          )}
          {summary?.removedBom && (
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              <strong className="text-amber-900">UTF-8 BOM removed from the first header.</strong>{" "}
              The byte-order marker is treated as an encoding marker rather than part of the property name.
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">JSON output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Converted JSON records will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing and conversion run in this browser session. The page does not send the pasted CSV to Yoryantra. Clipboard permissions still belong to your browser and operating system.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Where a CSV row becomes a JSON object</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A header-based CSV has two jobs hidden in one text file: the first record names the fields and every later record supplies values in the same positions. Conversion is straightforward only when those positions stay aligned. This page therefore rejects short or wide records instead of quietly inventing missing cells or discarding extras.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Every CSV field remains a JSON string. Values such as <code className="rounded bg-gray-100 px-1">0012</code>, <code className="rounded bg-gray-100 px-1">true</code>, and <code className="rounded bg-gray-100 px-1">2026-09-07</code> are not guessed into numbers, booleans, or dates. That keeps identifiers and formatting intact; type conversion can happen later with domain knowledge.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quoted fields are records, not simple string splits</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A comma inside a quoted field is content, not a separator. The same is true for line breaks. A literal quote inside a quoted field is represented by two consecutive quotes. The parser also rejects characters after a closing quote until the next comma or record break, which catches inputs such as <code className="rounded bg-gray-100 px-1">&quot;value&quot;x</code> instead of accepting an ambiguous record.
          </p>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">CSV is less universal than the extension suggests</h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-800">
              RFC 4180 documents a widely used comma-separated form with CRLF records and quoted-field rules, but it is informational and explicitly notes variation between implementations. This page expects commas and accepts CRLF, LF, or CR record endings. Semicolon and tab exports belong in a delimiter-aware parser rather than being guessed here.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Unusual property names stay data</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Headers are preserved exactly, including names such as <code className="rounded bg-white px-1">__proto__</code>. Records are built without inheriting from <code className="rounded bg-white px-1">Object.prototype</code>, so those names cannot alter the intermediate object&apos;s prototype.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A small example with the parts that usually break</h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`name,note\nSneha,"comma, stays here"\nVaroun,"quote: ""hello"""`}</pre>
            <p className="mt-4 leading-relaxed">
              The two data records become JSON objects; the comma and quote stay inside their original field values. A row with a different field count stops conversion so column alignment is visible rather than guessed.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Before the JSON goes into an API or database</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Decide which fields are genuinely numeric or boolean after conversion, not from their appearance alone.</li>
            <li>Check header whitespace and capitalization when downstream property names are case-sensitive.</li>
            <li>Keep multiline text as strings unless the destination has a different newline convention.</li>
            <li>For very large exports, stream or batch the conversion instead of loading the whole file into a browser tab.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The CSV reference behind the parser</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The quoted-field and record-shape rules are based on the common format documented in{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc4180.html" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] hover:underline">RFC 4180</a>.
            The RFC is useful as a baseline, not a claim that every spreadsheet export follows one master CSV grammar.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/csv-to-json" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function parseCSV(source: string): {
  rows: string[][];
  multilineFields: number;
  removedBom: boolean;
} {
  const removedBom = source.charCodeAt(0) === 0xfeff;
  const input = removedBom ? source.slice(1) : source;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let afterClosingQuote = false;
  let line = 1;
  let column = 1;
  let multilineFields = 0;
  let currentFieldIsMultiline = false;
  let endedWithRecordBreak = false;

  const pushField = () => {
    row.push(field);
    if (row.length > MAX_COLUMNS) {
      throw new Error(`CSV exceeds the ${MAX_COLUMNS.toLocaleString()}-column browser limit.`);
    }
    if (currentFieldIsMultiline) multilineFields += 1;
    field = "";
    currentFieldIsMultiline = false;
  };

  const pushRow = () => {
    rows.push(row);
    if (rows.length > MAX_ROWS + 1) {
      throw new Error(`CSV exceeds the ${MAX_ROWS.toLocaleString()}-data-record browser limit.`);
    }
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (inQuotes) {
      endedWithRecordBreak = false;
      if (char === '"') {
        if (next === '"') {
          field += '"';
          index += 1;
          column += 2;
          continue;
        }
        inQuotes = false;
        afterClosingQuote = true;
        column += 1;
        continue;
      }
      if (char === "\r" && next === "\n") {
        field += "\r\n";
        currentFieldIsMultiline = true;
        index += 1;
        line += 1;
        column = 1;
        continue;
      }
      if (char === "\r" || char === "\n") {
        field += char;
        currentFieldIsMultiline = true;
        line += 1;
        column = 1;
        continue;
      }
      field += char;
      column += 1;
      continue;
    }

    if (afterClosingQuote) {
      if (char === ",") {
        pushField();
        afterClosingQuote = false;
        endedWithRecordBreak = false;
        column += 1;
        continue;
      }
      if (char === "\r" || char === "\n") {
        pushField();
        pushRow();
        afterClosingQuote = false;
        endedWithRecordBreak = true;
        if (char === "\r" && next === "\n") index += 1;
        line += 1;
        column = 1;
        continue;
      }
      throw new Error(
        `Unexpected ${JSON.stringify(char)} after a closing quote at line ${line}, column ${column}. A quoted field must be followed by a comma or record break.`
      );
    }

    if (char === '"') {
      if (field.length !== 0) {
        throw new Error(
          `Unexpected quote inside an unquoted field at line ${line}, column ${column}. Quote the whole field and double embedded quotes.`
        );
      }
      inQuotes = true;
      endedWithRecordBreak = false;
      column += 1;
      continue;
    }

    if (char === ",") {
      pushField();
      endedWithRecordBreak = false;
      column += 1;
      continue;
    }

    if (char === "\r" || char === "\n") {
      pushField();
      pushRow();
      endedWithRecordBreak = true;
      if (char === "\r" && next === "\n") index += 1;
      line += 1;
      column = 1;
      continue;
    }

    field += char;
    endedWithRecordBreak = false;
    column += 1;
  }

  if (inQuotes) throw new Error(`Quoted field ending near line ${line} is not closed.`);

  if (afterClosingQuote || field.length > 0 || row.length > 0 || !endedWithRecordBreak) {
    pushField();
    pushRow();
  }

  return { rows, multilineFields, removedBom };
}
