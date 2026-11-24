"use client";

import { useEffect, useMemo, useState } from "react";
import type { WorkflowPanelProps } from "../workflow-types";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Mode = "single" | "lines";

type CsvResult = {
  fieldCount: number;
  mode: Mode;
  outputLength: number;
};

function escapeCsvField(value: string) {
  const hasRfcQuotingTrigger = /[",\r\n]/.test(value);
  const hasBoundaryWhitespace = value.trim() !== value;
  const needsQuotes =
    value.length === 0 || hasRfcQuotingTrigger || hasBoundaryWhitespace;

  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function splitInputFields(value: string) {
  return value.split(/\r\n|\n|\r/);
}

function startsLikeSpreadsheetFormula(value: string) {
  return /^[\t\r\n]|^[ \t]*[=+\-@]/.test(value);
}

export default function CsvEscapePanel({ incoming }: WorkflowPanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("lines");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<CsvResult | null>(null);

  const clearResult = () => {
    setOutput("");
    setError("");
    setWarning("");
    setCopied(false);
    setResult(null);
  };

  const formatCsv = () => {
    if (input.length === 0) {
      setError("Enter at least one field value to escape.");
      setOutput("");
      setWarning("");
      setResult(null);
      return;
    }

    const fields = mode === "single" ? [input] : splitInputFields(input);
    const escapedFields = fields.map(escapeCsvField);
    const formatted =
      mode === "single" ? escapedFields[0] : escapedFields.join("\r\n");
    const formulaLikeFields = fields.filter(startsLikeSpreadsheetFormula).length;

    setOutput(formatted);
    setError("");
    setCopied(false);
    setResult({
      fieldCount: fields.length,
      mode,
      outputLength: formatted.length,
    });

    if (formulaLikeFields > 0) {
      setWarning(
        `${formulaLikeFields} field${formulaLikeFields === 1 ? "" : "s"} begin with characters that spreadsheet software may interpret as a formula. CSV quoting preserves structure; it does not neutralize spreadsheet formulas.`,
      );
    } else {
      setWarning("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError("Clipboard access was blocked. Select and copy the output manually.");
    }
  };

  const resetAll = () => {
    setInput("");
    setMode("lines");
    clearResult();
  };

  const loadExample = () => {
    setInput('Yoryantra tools\nText with, comma\nHe said "hello"\n Value with spaces ');
    setMode("lines");
    clearResult();
  };

  const modeLabel = useMemo(
    () => (mode === "single" ? "One field" : "One field per input line"),
    [mode],
  );

  useEffect(() => {
    if (!incoming) return;
    setInput(incoming.value);
    setOutput("");
    setError("");
    setCopied(false);
    setResult(null);
    setWarning("");
  }, [incoming]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">CSV Escape Formatter</h2>
        <p className="mt-2 leading-relaxed text-gray-600">Quote CSV fields, double embedded quotation marks, and preserve commas, line breaks, and boundary whitespace.</p>
      </div>
      <div>
        <label htmlFor="csvescapepanel-input-1" className="mb-2 block text-sm font-medium text-gray-700">
          Field Value or Values
        </label>
        <textarea spellCheck={false} id="csvescapepanel-input-1"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          rows={8}
          placeholder={'Example:\nText with, comma\nHe said "hello"\n Value with spaces '}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)] text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="mt-6">
        <YoryantraSelect
          width="wide"
          label="Input Interpretation"
          value={mode}
          onChange={(value) => { setMode(value as Mode); clearResult(); }}
          options={[
            { label: "One field per input line", value: "lines" },
            { label: "Treat everything as one field", value: "single" },
          ]}
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {mode === "lines" ? "Each physical line becomes a separate one-column CSV record." : "Embedded line breaks stay inside the field and trigger quoting."}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={formatCsv}
          className="yoryantra-btn min-h-10 whitespace-nowrap"
        >
          Escape CSV Fields
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {warning ? (
        <div className="mt-6 self-start">
          <p className="text-sm font-semibold text-gray-900">Spreadsheet formula caution</p>
          <p className="mt-1 text-sm leading-6 text-gray-700">{warning}</p>
        </div>
      ) : null}

      <div className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Escaped Output</h3>
            <p className="mt-1 text-sm text-gray-500">
              {result
                ? `${result.fieldCount} field${result.fieldCount === 1 ? "" : "s"} · ${modeLabel}`
                : "Quoted CSV field output will appear below."}
            </p>
          </div>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!output}
            className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy Output"}
          </button>
        </div>

        <pre className="mt-4 min-h-[180px] overflow-auto yoryantra-output text-sm leading-6 whitespace-pre-wrap break-words">
          {output || "Escaped CSV fields will appear here."}
        </pre>

        {result ? (
          <p className="mt-3 text-xs leading-5 text-gray-500">
            Line-by-line mode joins records with CRLF. Output length: {result.outputLength.toLocaleString()} characters.
          </p>
        ) : null}
      </div>

      <section className="mt-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Escaping a field is different from parsing a CSV file
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A CSV row is made from fields separated by commas. The hard part is that a comma,
            quotation mark, or line break can also be part of a field&apos;s data. RFC 4180 documents
            the widely used convention: fields containing commas, double quotes, or record line
            breaks are enclosed in double quotes, and a double quote inside a quoted field is
            written twice.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The input model works one level lower than a CSV parser. Give it raw field values and it
            produces escaped field text. It does not split an existing row into columns, infer a
            header, validate equal column counts, or repair a malformed CSV document. In
            line-by-line mode, each physical input line is deliberately treated as a separate
            field; switch to one-field mode when the value itself contains line breaks.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Reference: {" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc4180.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 4180 — Common Format and MIME Type for CSV Files
            </a>
            . RFC 4180 is Informational rather than an Internet Standard, which matters because
            spreadsheet and database applications still have dialect differences.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            What changes when a field is written to CSV
          </h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Raw field</th>
                  <th className="px-4 py-3 font-semibold">Escaped field</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr>
                  <td className="px-4 py-3 font-mono">Pune, India</td>
                  <td className="px-4 py-3 font-mono">&quot;Pune, India&quot;</td>
                  <td className="px-4 py-3">The comma must stay inside one field.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">He said &quot;hello&quot;</td>
                  <td className="px-4 py-3 font-mono">&quot;He said &quot;&quot;hello&quot;&quot;&quot;</td>
                  <td className="px-4 py-3">Embedded quotes are doubled inside the quoted field.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">A value containing a line break</td>
                  <td className="px-4 py-3">One quoted field spanning that line break</td>
                  <td className="px-4 py-3">The record boundary must not be confused with field data.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono"> value </td>
                  <td className="px-4 py-3 font-mono">&quot; value &quot;</td>
                  <td className="px-4 py-3">Boundary whitespace is quoted here as a compatibility choice.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            RFC 4180 says spaces are part of a field and should not be ignored; it does not require
            quoting merely because spaces appear at an edge. Boundary whitespace is quoted conservatively here because import tools sometimes trim
            unquoted values.
          </p>
        </div>

        <div className="mt-10 self-start">
          <h2 className="text-lg font-semibold text-gray-900">
            CSV quoting does not make spreadsheet formulas safe
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            Spreadsheet applications can interpret cells beginning with characters such as
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">=</code>,
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">+</code>,
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">-</code>, or
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">@</code> as formulas. Correct CSV
            quoting protects the CSV structure, but it is not a universal formula-injection
            defense. The formatter therefore warns rather than silently prefixing a character that
            would change your data. Exports containing untrusted values need a mitigation chosen
            for the spreadsheet applications and downstream consumers that will open them.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Security guidance: {" "}
            <a
              href="https://owasp.org/www-community/attacks/CSV_Injection"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              OWASP — CSV Injection
            </a>
            .
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Record boundaries and importer differences still belong to the destination
          </h2>
          <ul className="mt-4 space-y-3 text-gray-600 leading-relaxed">
            <li>
              <strong className="text-gray-900">Line endings:</strong> line-by-line output uses CRLF,
              the record separator documented by RFC 4180. One-field mode keeps line breaks as field
              data and quotes the value.
            </li>
            <li>
              <strong className="text-gray-900">Empty fields:</strong> an empty line becomes
              <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">&quot;&quot;</code> so the empty field is visible
              instead of disappearing in copied output.
            </li>
            <li>
              <strong className="text-gray-900">Other delimiters:</strong> semicolon- or tab-separated
              files are different dialects. Only comma-separated CSV rules are applied here.
            </li>
            <li>
              <strong className="text-gray-900">Character encoding:</strong> the browser preserves the
              JavaScript text you enter. The encoding used when you later save a file—normally UTF-8
              in modern systems—is a separate file-writing decision.
            </li>
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/csv-escape-formatter" presentation="links" />
          </div>
        </div>
      </section>
    </>
  );
}
