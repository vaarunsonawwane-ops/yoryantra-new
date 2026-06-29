"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Mode = "single" | "lines";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("lines");
  const [error, setError] = useState("");

  const escapeCsvValue = (value: string) => {
    const needsQuotes =
      value.includes(",") ||
      value.includes('"') ||
      value.includes("\\n") ||
      value.includes("\\r") ||
      value.trim() !== value;

    const escaped = value.replace(/"/g, '""');

    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const formatCsv = () => {
    if (!input.trim()) {
      setError("Please enter text or values to escape.");
      setOutput("");
      return;
    }

    try {
      if (mode === "single") {
        setOutput(escapeCsvValue(input));
        setError("");
        return;
      }

      const lines = input
        .split(/\\r?\\n/)
        .map((line) => escapeCsvValue(line));

      setOutput(lines.join("\\n"));
      setError("");
    } catch {
      setError("Unable to format this CSV value.");
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setMode("lines");
  };

  const loadExample = () => {
    setInput('Yoryantra tools\\nText with, comma\\nHe said "hello"\\nValue with spaces ');
    setOutput("");
    setError("");
    setMode("lines");
  };

  const summary = useMemo(() => {
    const totalLines = input ? input.split(/\\r?\\n/).length : 0;
    const escapedLines = output ? output.split(/\\r?\\n/).length : 0;

    return {
      totalLines,
      escapedLines,
    };
  }, [input, output]);

  return (
    <ToolShell
      title="CSV Escape Formatter"
      description="Escape and format CSV values for spreadsheets, exports, logs, data cleanup, and API workflows."
    >
      {/* INPUT */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Values
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={'Example:\\nText with, comma\\nHe said "hello"\\nValue with spaces '}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* OPTIONS */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-800">
          Formatting Mode
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="csv-mode"
              value="lines"
              checked={mode === "lines"}
              onChange={() => setMode("lines")}
              className="accent-[var(--green)]"
            />
            Escape each line separately
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="csv-mode"
              value="single"
              checked={mode === "single"}
              onChange={() => setMode("single")}
              className="accent-[var(--green)]"
            />
            Treat input as one value
          </label>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={formatCsv}
          className="yoryantra-btn"
        >
          Escape CSV Values
        </button>

        <button
          onClick={copyOutput}
          disabled={!output}
          className="yoryantra-btn-outline"
        >
          Copy Output
        </button>

        <button
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

		{/* OUTPUT */}
		<div className="mt-8">
		  <div className="flex items-center justify-between mb-3">
			<div>
			  <h3 className="text-lg font-semibold text-gray-900">
				Escaped Output
			  </h3>

			  <p className="text-sm text-gray-500 mt-1">
				{summary.escapedLines > 0
				  ? `${summary.escapedLines} formatted line${
					  summary.escapedLines === 1 ? "" : "s"
					}`
				  : "Output will appear below"}
			  </p>
			</div>

			{output && (
			  <button
				onClick={() =>
				  navigator.clipboard.writeText(
					output
				  )
				}
				className="yoryantra-btn-outline text-sm"
			  >
				Copy
			  </button>
			)}
		  </div>

		  <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
			{output ||
			  "Escaped CSV values will appear here."}
		  </pre>
		</div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Preparing CSV Values for Clean Exports and Imports
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CSV looks simple until values contain commas, quotes, line breaks,
            or spaces that matter. A single unescaped value can shift columns,
            break spreadsheet imports, or make exported data harder to trust.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CSV Escape Formatter helps prepare individual values or lists
            of values so they can be copied into CSV files, spreadsheet exports,
            logs, scripts, or data cleanup workflows with fewer formatting
            surprises.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CSV Escape Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste one value or multiple values into the input box.</li>
            <li>Choose whether each line should be escaped separately or treated as one value.</li>
            <li>Click <strong>Escape CSV Values</strong> to format commas, quotes, and line-sensitive values safely.</li>
            <li>Copy the output into a CSV file, spreadsheet workflow, script, or export process.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            CSV Values That Usually Need Escaping
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CSV values are typically wrapped in quotes when they contain
            characters that can confuse parsers or spreadsheet tools.
          </p>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Text with, comma</strong> → "Text with, comma"
              </li>

              <li>
                <strong>He said "hello"</strong> → "He said ""hello"""
              </li>

              <li>
                <strong>Value with spaces </strong> → "Value with spaces "
              </li>

              <li>
                <strong>Line breaks</strong> are quoted so the value stays together.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where CSV Escaping Helps
          </h2>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                Preparing values before pasting them into spreadsheet columns.
              </li>

              <li>
                Cleaning exported text that contains commas or quotation marks.
              </li>

              <li>
                Formatting log values before sharing or importing them.
              </li>

              <li>
                Testing CSV output from scripts, APIs, forms, or internal tools.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does CSV escaping do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CSV escaping wraps values in quotes when needed and doubles
                internal quotation marks so commas, quotes, and line breaks do
                not break the structure of a CSV row.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                When should a CSV value be quoted?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A value usually needs quotes when it contains a comma, quote,
                line break, or leading/trailing spaces that should be preserved.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I escape multiple values at once?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Use the line-by-line mode to treat each input line as a
                separate CSV value.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my CSV values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Formatting happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/csv-escape-formatter" />
        </div>
      </section>
    </ToolShell>
  );
}
