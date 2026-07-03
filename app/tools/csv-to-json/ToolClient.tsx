"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
 const [input, setInput] = useState("");
 const [output, setOutput] = useState("");
 const [error, setError] = useState("");
 const [copied, setCopied] = useState(false);

 const convertCSVToJSON = () => {
 try {
 if (!input.trim()) {
 throw new Error("Please enter CSV data.");
 }

 const rows = parseCSV(input);

 if (rows.length < 2) {
 throw new Error(
 "CSV must contain a header row and at least one data row."
 );
 }

 const headers = rows[0].map((header) => header.trim());

 if (headers.some((header) => !header)) {
 throw new Error("Every header cell must contain a property name.");
 }

 const duplicateHeader = headers.find(
 (header, index) => headers.indexOf(header) !== index
 );

 if (duplicateHeader) {
 throw new Error(
 `Duplicate header "${duplicateHeader}" would overwrite JSON values. Rename one of the columns.`
 );
 }

 const result = rows.slice(1).map((row, rowIndex) => {
 if (row.length > headers.length) {
 throw new Error(
 `Data row ${rowIndex + 2} has more fields than the header row.`
 );
 }

 return headers.reduce<Record<string, string>>(
 (record, header, index) => {
 record[header] = row[index] ?? "";
 return record;
 },
 {}
 );
 });

 setOutput(JSON.stringify(result, null, 2));
 setError("");
 setCopied(false);
 } catch (err) {
 setError(
 err instanceof Error
 ? err.message
 : "Unable to convert this CSV input."
 );
 setOutput("");
 setCopied(false);
 }
 };

 const copyOutput = async () => {
 if (!output) {
 return;
 }

 try {
 await navigator.clipboard.writeText(output);
 setCopied(true);
 window.setTimeout(() => setCopied(false), 1400);
 } catch {
 setError("Copy failed. Select the JSON output and copy it manually.");
 }
 };

 const resetAll = () => {
 setInput("");
 setOutput("");
 setError("");
 setCopied(false);
 };

 return (
 <ToolShell
 title="CSV to JSON Converter"
 description="Convert CSV rows into a JSON array with support for quoted commas, escaped quotes, multiline fields, and empty values."
 >
 {/* INPUT */}
 <div>
 <label className="block mb-2 text-sm font-medium text-gray-700">
 CSV Input
 </label>

 <textarea
 className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
 placeholder={`name,role
Asha,Developer
Ravi,Designer`}
 value={input}
 onChange={(e) =>
 setInput(e.target.value)
 }
 />
 </div>

 {/* ACTIONS */}
 <div className="mt-5 flex flex-wrap gap-3">
 <button
 onClick={convertCSVToJSON}
 className="yoryantra-btn"
 >
 Convert to JSON
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
 <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
 {error}
 </div>
 )}

 {/* OUTPUT */}
 <div className="mt-8">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-lg font-semibold text-gray-900">
 JSON Output
 </h3>

 {output && (
 <button
 onClick={copyOutput}
 className="yoryantra-btn-outline text-sm"
 >
 {copied ? "Copied" : "Copy"}
 </button>
 )}
 </div>

 <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
 {output ||
 "Converted JSON output will appear here..."}
 </pre>
 </div>

 {/* PRIVACY NOTE */}
 <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
 <h3 className="text-sm font-semibold text-yellow-900">
 Privacy Note
 </h3>

 <p className="mt-2 text-sm leading-relaxed text-yellow-800">
 Conversion happens locally inside your browser. Your CSV content is
 not sent to Yoryantra. Avoid pasting sensitive data on devices or
 browser profiles you do not trust.
 </p>
 </div>

 {/* SEO CONTENT */}
 <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
 <div>
 <h2 className="text-2xl font-semibold text-gray-900">
 Turning CSV Rows Into JSON Data
 </h2>

 <p className="mt-4 text-gray-600 leading-relaxed">
 CSV to JSON conversion helps transform spreadsheet-style rows into
 structured JSON objects that can be used in APIs, frontend
 applications, databases, analytics systems, automation workflows,
 and modern web applications.
 </p>

 <p className="mt-4 text-gray-600 leading-relaxed">
 CSV files are commonly used for exports, reports, and spreadsheets,
 while JSON is widely used in APIs and application development. This
 CSV to JSON Converter helps quickly transform tabular data into a
 machine-readable JSON structure directly inside your browser.
 </p>

 <p className="mt-4 text-gray-600 leading-relaxed">
 The tool is useful for API preparation, spreadsheet conversion,
 database migration, structured data transformation, analytics
 workflows, and importing CSV records into applications.
 </p>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 How to Use the CSV to JSON Converter
 </h2>

 <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
 <li>
 Paste CSV data into the input editor.
 </li>

 <li>
 Ensure the first row contains column headers.
 </li>

 <li>
 Click <strong>Convert to JSON</strong>.
 </li>

 <li>
 Review and copy the generated JSON output.
 </li>
 </ol>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Common Use Cases
 </h2>

 <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
 <li>
 Converting spreadsheet exports into JSON objects.
 </li>

 <li>
 Preparing CSV data for APIs and applications.
 </li>

 <li>
 Transforming reports into structured JSON arrays.
 </li>

 <li>
 Migrating CSV records into databases.
 </li>

 <li>
 Importing spreadsheet data into frontend applications.
 </li>

 <li>
 Cleaning tabular data for automation workflows.
 </li>

 <li>
 Converting exported reports into machine-readable formats.
 </li>
 </ul>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Example CSV to JSON Conversion
 </h2>

 <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
 <p className="font-medium text-gray-900">
 CSV input:
 </p>

 <pre className="mt-2 whitespace-pre-wrap break-words">
{`name,role
Asha,Developer
Ravi,Designer`}
 </pre>

 <p className="mt-4 font-medium text-gray-900">
 JSON output:
 </p>

 <pre className="mt-2 whitespace-pre-wrap break-words">
{`[
 {
 "name": "Asha",
 "role": "Developer"
 },
 {
 "name": "Ravi",
 "role": "Designer"
 }
]`}
 </pre>
 </div>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Why JSON Conversion Matters
 </h2>

 <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
 <ul className="space-y-3">
 <li>
 <strong>API compatibility:</strong> JSON is widely used in APIs
 and modern applications.
 </li>

 <li>
 <strong>Structured records:</strong> JSON objects make data
 easier to process programmatically.
 </li>

 <li>
 <strong>Spreadsheet transformation:</strong> CSV exports can be
 converted into machine-readable formats quickly.
 </li>

 <li>
 <strong>Automation workflows:</strong> Structured JSON simplifies
 integrations and data processing.
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
 What is a CSV to JSON Converter?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 A CSV to JSON Converter transforms comma-separated spreadsheet
 rows into structured JSON objects and arrays.
 </p>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900">
 Does the first CSV row need headers?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 Yes. The first row is used as JSON object property names.
 </p>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900">
 Can this tool handle multiple rows?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 Yes. Each CSV row becomes a separate JSON object inside the
 output array.
 </p>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900">
 Is this converter useful for APIs?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 Yes. Developers commonly convert CSV exports into JSON before
 importing data into APIs and applications.
 </p>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900">
 Is CSV conversion processed on the server?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 No. CSV to JSON conversion happens locally inside your browser.
 </p>
 </div>
 </div>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Related Tools
 </h2>

 <YoryantraRelatedTools currentHref="/tools/csv-to-json" />
 </div>
 </section>
 </ToolShell>
 );
}

function parseCSV(source: string): string[][] {
 const rows: string[][] = [];
 let row: string[] = [];
 let field = "";
 let inQuotes = false;

 for (let index = 0; index < source.length; index += 1) {
 const character = source[index];

 if (inQuotes) {
 if (character === '"') {
 if (source[index + 1] === '"') {
 field += '"';
 index += 1;
 } else {
 inQuotes = false;
 }
 } else {
 field += character;
 }

 continue;
 }

 if (character === '"') {
 if (field.length > 0) {
 throw new Error(
 "A quoted field must begin at the start of a CSV field."
 );
 }

 inQuotes = true;
 } else if (character === ",") {
 row.push(field);
 field = "";
 } else if (character === "\n") {
 row.push(field.replace(/\r$/, ""));
 rows.push(row);
 row = [];
 field = "";
 } else {
 field += character;
 }
 }

 if (inQuotes) {
 throw new Error("The CSV contains an unclosed quoted field.");
 }

 row.push(field.replace(/\r$/, ""));

 if (row.some((value) => value !== "") || rows.length === 0) {
 rows.push(row);
 }

 return rows.filter(
 (currentRow) =>
 currentRow.length > 1 ||
 currentRow.some((value) => value.trim() !== "")
 );
}
