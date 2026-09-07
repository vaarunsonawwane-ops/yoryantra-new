"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const MAX_INPUT_CHARS = 2_000_000;
const MAX_JSON_DEPTH = 120;
const MAX_ROWS = 50_000;
const MAX_COLUMNS = 2_000;

const exampleJson = `[
  {"name":"Sneha","role":"Developer","active":true,"tags":["api","data"]},
  {"name":"Varoun","role":"Designer","active":false,"tags":["ui"]}
]`;

type CsvSummary = {
  rows: number;
  columns: number;
  nestedCells: number;
  nullCells: number;
  missingCells: number;
  formulaLikeCells: number;
  bomRemoved: boolean;
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [protectSpreadsheetFormulas, setProtectSpreadsheetFormulas] = useState(false);
  const [summary, setSummary] = useState<CsvSummary | null>(null);

  const showsFormulaWarning = useMemo(
    () => Boolean(summary && summary.formulaLikeCells > 0 && !protectSpreadsheetFormulas),
    [summary, protectSpreadsheetFormulas]
  );

  const convertJSONToCSV = () => {
    try {
      if (!input.trim()) throw new Error("Enter JSON before converting.");
      if (input.length > MAX_INPUT_CHARS) {
        throw new Error(
          `Input exceeds the ${MAX_INPUT_CHARS.toLocaleString()}-character browser limit. Split the data into smaller batches.`
        );
      }

      const normalizedInput = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
      assertLosslessJsonText(normalizedInput, "JSON input");
      const parsed = JSON.parse(normalizedInput) as unknown;
      const data = Array.isArray(parsed) ? parsed : [parsed];

      if (data.length === 0) throw new Error("The JSON array is empty.");
      if (data.length > MAX_ROWS) {
        throw new Error(`JSON contains more than ${MAX_ROWS.toLocaleString()} records. Split the array before converting it.`);
      }

      data.forEach((item, index) => {
        if (!isPlainObject(item)) {
          throw new Error(
            `Record ${index + 1} is ${describeJsonType(item)}, not an object. CSV columns require an object or an array containing only objects.`
          );
        }
      });

      const headers: string[] = [];
      const seen = new Set<string>();
      data.forEach((item) => {
        Object.keys(item as Record<string, unknown>).forEach((key) => {
          if (!seen.has(key)) {
            seen.add(key);
            headers.push(key);
          }
        });
      });

      if (headers.length === 0) throw new Error("The JSON objects do not contain any properties to turn into CSV columns.");
      if (headers.length > MAX_COLUMNS) {
        throw new Error(`The union of object keys exceeds the ${MAX_COLUMNS.toLocaleString()}-column browser limit.`);
      }

      let nestedCells = 0;
      let nullCells = 0;
      let missingCells = 0;
      let formulaLikeCells = 0;

      const csvHeaders = headers.map((header) => {
        if (!looksLikeSpreadsheetFormula(header)) return header;
        formulaLikeCells += 1;
        return protectSpreadsheetFormulas ? `'${header}` : header;
      });

      const rows = data.map((item) => {
        const record = item as Record<string, unknown>;
        return headers.map((header) => {
          if (!Object.prototype.hasOwnProperty.call(record, header)) {
            missingCells += 1;
            return "";
          }

          const value = record[header];
          if (value === null) {
            nullCells += 1;
            return "null";
          }

          let text: string;
          if (typeof value === "object") {
            nestedCells += 1;
            text = JSON.stringify(value);
          } else {
            text = String(value);
          }

          if (typeof value === "string" && looksLikeSpreadsheetFormula(text)) {
            formulaLikeCells += 1;
            if (protectSpreadsheetFormulas) text = `'${text}`;
          }

          return text;
        });
      });

      const csvLines = [csvHeaders, ...rows].map((row) => row.map(escapeCsvCell).join(","));
      setOutput(csvLines.join("\r\n"));
      setSummary({
        rows: data.length,
        columns: headers.length,
        nestedCells,
        nullCells,
        missingCells,
        formulaLikeCells,
        bomRemoved: input.charCodeAt(0) === 0xfeff,
      });
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to convert this JSON safely.");
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
      setError("Copy failed. Select the CSV output and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(exampleJson);
    setOutput("");
    setError("");
    setSummary(null);
    setCopied(false);
    setProtectSpreadsheetFormulas(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setSummary(null);
    setCopied(false);
    setProtectSpreadsheetFormulas(false);
  };

  return (
    <ToolShell
      title="JSON to CSV Converter"
      description="Turn JSON object records into CSV rows while keeping nested values explicit."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">JSON input</label>
        <textarea
          className="h-64 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder={exampleJson}
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
          Accepts one JSON object or an array made only of objects. Column order follows the first appearance of each property name.
        </p>
      </div>

      <div className="mt-5 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={protectSpreadsheetFormulas}
            onChange={(event: { target: { checked: boolean } }) => {
              setProtectSpreadsheetFormulas(event.target.checked);
              setOutput("");
              setSummary(null);
              setError("");
              setCopied(false);
            }}
            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#d9a928]"
          />
          <span>
            <span className="font-medium text-gray-900">Prefix formula-like text with an apostrophe</span>
            <span className="mt-1 block leading-relaxed text-gray-500">
              Changes string data that begins like a spreadsheet formula. Leave it off when byte-for-byte cell text matters.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertJSONToCSV} className="yoryantra-btn min-h-[44px] whitespace-nowrap">Convert to CSV</button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Records" value={summary.rows.toLocaleString()} />
          <Metric label="Columns" value={summary.columns.toLocaleString()} />
          <Metric label="Nested cells" value={summary.nestedCells.toLocaleString()} />
          <Metric label="Missing cells" value={summary.missingCells.toLocaleString()} />
        </div>
      )}

      {showsFormulaWarning && summary && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          <strong className="text-amber-900">{summary.formulaLikeCells.toLocaleString()} formula-like cell{summary.formulaLikeCells === 1 ? "" : "s"} found.</strong>{" "}
          CSV quoting does not stop a spreadsheet from interpreting cell text beginning with characters such as <code className="rounded bg-amber-100 px-1">=</code>, <code className="rounded bg-amber-100 px-1">+</code>, <code className="rounded bg-amber-100 px-1">-</code>, or <code className="rounded bg-amber-100 px-1">@</code>. Enable the apostrophe option before opening untrusted data in spreadsheet software, understanding that it changes the cell text.
        </div>
      )}

      {summary && (summary.nullCells > 0 || summary.bomRemoved) && (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          {summary.nullCells > 0 && (
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              JSON <code className="rounded bg-white px-1">null</code> is written as the text <code className="rounded bg-white px-1">null</code>; a missing property becomes an empty CSV cell. CSV has no native null type, so this distinction is a convention rather than a reversible type guarantee.
            </div>
          )}
          {summary.bomRemoved && (
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              A leading Unicode BOM was ignored before JSON parsing. RFC 8259 says networked JSON must not add a BOM, although parsers may choose to tolerate one for interoperability.
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">CSV output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Converted CSV rows will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Conversion runs locally in this browser session. The page does not send the JSON to Yoryantra. Opening the resulting CSV in another application is a separate trust boundary, especially when the input came from users or external systems.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A CSV row needs a flatter model than JSON</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON can nest objects and arrays at any property. A CSV row cannot. Here, top-level object properties become columns and nested arrays or objects become compact JSON text inside a single cell. That keeps their content visible without inventing a flattening path convention or unexpectedly multiplying rows.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When records have different properties, the header is the union of property names in first-seen order. A property that does not exist in a record becomes an empty cell. An explicit JSON <code className="rounded bg-gray-100 px-1">null</code> becomes the text <code className="rounded bg-gray-100 px-1">null</code>. The two cases remain visually distinguishable, though CSV itself carries no type metadata.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">CSV escaping applies to headers too</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Property names can contain commas, quotes, or line breaks just like values. Every header and cell is therefore passed through the same CSV escaping rule: fields that need quoting are enclosed in double quotes and embedded quotes are doubled. Output records use CRLF line endings, matching the common form documented by RFC 4180.
          </p>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">CSV quoting is not spreadsheet sanitization</h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-800">
              A quoted CSV field can still be interpreted as a formula after a spreadsheet opens it. The optional apostrophe prefix is a defensive export choice for formula-like text; it is deliberately opt-in because it changes the original string.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">JSON numbers pass through JavaScript</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Before conversion, duplicate object member names and numbers that exceed a conservative JavaScript precision boundary are stopped. Otherwise parsing could discard one duplicate member or round a value before CSV serialization. Quote precision-sensitive identifiers in the source JSON when exact digits matter more than numeric typing.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What a nested record looks like in CSV</h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`JSON\n{"name":"Sneha","tags":["api","data"]}\n\nCSV\nname,tags\nSneha,"[""api"",""data""]"`}</pre>
            <p className="mt-4 leading-relaxed">
              The array remains one cell containing valid compact JSON text. A later CSV importer will still see it as text unless that application explicitly parses the cell as JSON.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Round trips are inherently lossy</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>CSV does not distinguish strings, booleans, numbers, nulls, and dates by itself.</li>
            <li>Nested containers are serialized into text rather than reconstructed as table structure.</li>
            <li>Missing properties and empty strings can both produce visually empty cells.</li>
            <li>Spreadsheet formula protection changes formula-like string values when enabled.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Two specifications worth keeping separate</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <a href="https://www.rfc-editor.org/rfc/rfc8259.html" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] hover:underline">RFC 8259</a>{" "}
            defines JSON&apos;s interoperable data model and discusses duplicate names and number limits. The separate
            <a href="https://www.rfc-editor.org/rfc/rfc4180.html" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-[var(--green)] hover:underline">RFC 4180</a>{" "}
            documents a common CSV form and the <code className="rounded bg-gray-100 px-1">text/csv</code> media type. CSV implementations vary, so the RFC is a useful baseline rather than a universal spreadsheet contract.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-to-csv" />
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

function escapeCsvCell(value: string) {
  if (/[",\r\n]/.test(value) || /^\s|\s$/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function looksLikeSpreadsheetFormula(value: string) {
  const withoutLeadingSpaces = value.replace(/^ +/, "");
  return /^[=+\-@\t\r\n]/.test(withoutLeadingSpaces);
}

function describeJsonType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "an array";
  return typeof value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
        if (frame.keys?.has(key)) {
          throw new Error(`${label} contains duplicate member ${JSON.stringify(key)}, which JSON.parse would collapse.`);
        }
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
          throw new Error(`${label} contains JSON number ${token}, which cannot be rewritten conservatively with JavaScript number semantics. Quote it if exact digits matter.`);
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
  if (Number.isInteger(numericValue) && !Number.isSafeInteger(numericValue)) return false;
  if (/^-?(?:0|[1-9]\d*)$/.test(token)) return Number.isSafeInteger(numericValue);
  const significantDigits = token
    .replace(/^[+-]/, "")
    .split(/[eE]/)[0]
    .replace(".", "")
    .replace(/^0+/, "").length;
  if (significantDigits > 15) return false;
  if (numericValue === 0 && /[1-9]/.test(token)) return false;
  return true;
}
