"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "patch" | "summary" | "report" | "json" | "markdown";
type CompareMode = "strict" | "loose";
type ArrayMode = "index" | "replaceWholeArray";
type PatchOperation = {
  op: "add" | "remove" | "replace";
  path: string;
  value?: unknown;
  oldValue?: unknown;
};

type PatchIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type PatchResult = {
  operations: PatchOperation[];
  issues: PatchIssue[];
  output: string;
  addCount: number;
  removeCount: number;
  replaceCount: number;
  totalOperations: number;
  originalSize: number;
  modifiedSize: number;
};

type PatchNote = {
  title: string;
  message: string;
};

const sampleOriginal = `{
  "name": "Yoryantra",
  "category": "Developer Tools",
  "active": true,
  "tools": [
    "JSON Formatter",
    "CSV Converter"
  ],
  "settings": {
    "theme": "light",
    "ads": false
  }
}`;

const sampleModified = `{
  "name": "Yoryantra",
  "category": "Developer and SEO Tools",
  "active": true,
  "tools": [
    "JSON Formatter",
    "CSV Converter",
    "JSON Patch Generator"
  ],
  "settings": {
    "theme": "light",
    "ads": true,
    "layout": "clean"
  }
}`;

export default function ToolClient() {
  const [originalJson, setOriginalJson] = useState("");
  const [modifiedJson, setModifiedJson] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("patch");
  const [compareMode, setCompareMode] = useState<CompareMode>("strict");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("index");
  const [includeOldValues, setIncludeOldValues] = useState(false);
  const [sortOperations, setSortOperations] = useState(false);
  const [prettyOutput, setPrettyOutput] = useState(true);
  const [ignoreObjectKeyOrder, setIgnoreObjectKeyOrder] = useState(true);
  const [result, setResult] = useState<PatchResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getPatchNotes(result) : []), [result]);

  const generatePatch = () => {
    if (!originalJson.trim() || !modifiedJson.trim()) {
      setError("Please enter both original JSON and modified JSON.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = buildPatchResult(originalJson, modifiedJson, {
        outputMode,
        compareMode,
        arrayMode,
        includeOldValues,
        sortOperations,
        prettyOutput,
        ignoreObjectKeyOrder,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate JSON Patch operations."
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
    setOriginalJson(sampleOriginal);
    setModifiedJson(sampleModified);
    setOutputMode("patch");
    setCompareMode("strict");
    setArrayMode("index");
    setIncludeOldValues(false);
    setSortOperations(false);
    setPrettyOutput(true);
    setIgnoreObjectKeyOrder(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setOriginalJson("");
    setModifiedJson("");
    setOutputMode("patch");
    setCompareMode("strict");
    setArrayMode("index");
    setIncludeOldValues(false);
    setSortOperations(false);
    setPrettyOutput(true);
    setIgnoreObjectKeyOrder(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON Patch Generator"
      description="Generate JSON Patch operations by comparing original and modified JSON. Create add, remove, and replace operations with JSON Pointer paths, summaries, reports, and clean patch output."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Original JSON
          </label>

          <textarea
            value={originalJson}
            onChange={(event) => {
              setOriginalJson(event.target.value);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={sampleOriginal}
            className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste the current or before version of your JSON data.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Modified JSON
          </label>

          <textarea
            value={modifiedJson}
            onChange={(event) => {
              setModifiedJson(event.target.value);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={sampleModified}
            className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste the new or after version to generate patch operations.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
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
              { label: "JSON Patch", value: "patch" },
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "Full JSON result", value: "json" },
              { label: "Markdown table", value: "markdown" },
            ]}
          />

          <YoryantraSelect
            label="Compare Mode"
            value={compareMode}
            onChange={(value) => {
              setCompareMode(value as CompareMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Strict values", value: "strict" },
              { label: "Loose primitive comparison", value: "loose" },
            ]}
          />

          <YoryantraSelect
            label="Array Handling"
            value={arrayMode}
            onChange={(value) => {
              setArrayMode(value as ArrayMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Compare by index", value: "index" },
              { label: "Replace whole changed arrays", value: "replaceWholeArray" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={includeOldValues}
                onChange={(event) => {
                  setIncludeOldValues(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Include old values in report/full JSON output
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={sortOperations}
                onChange={(event) => {
                  setSortOperations(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Sort operations by path
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={prettyOutput}
                onChange={(event) => {
                  setPrettyOutput(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Pretty-print JSON output
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={ignoreObjectKeyOrder}
                onChange={(event) => {
                  setIgnoreObjectKeyOrder(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Ignore object key order when comparing nested objects
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Generates practical JSON Patch-style operations using JSON Pointer paths.
          The output is useful for APIs, config changes, test fixtures, and data reviews.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generatePatch} className="yoryantra-btn">
          Generate JSON Patch
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
          <SummaryCard label="Operations" value={result.totalOperations.toLocaleString()} />
          <SummaryCard label="Add" value={result.addCount.toLocaleString()} />
          <SummaryCard label="Remove" value={result.removeCount.toLocaleString()} />
          <SummaryCard label="Replace" value={result.replaceCount.toLocaleString()} />
        </div>
      )}

      {result && result.operations.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Patch Operations
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Generated add, remove, and replace operations with JSON Pointer paths.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Operation</th>
                  <th className="px-4 py-3 font-semibold">Path</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.operations.slice(0, 100).map((operation, index) => (
                  <tr key={`${operation.op}-${operation.path}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      {operation.op}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      {operation.path}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[420px] break-words">
                        {operation.op === "remove"
                          ? "(removed)"
                          : stringifyShort(operation.value)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.operations.length > 100 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 100 operations. Copy the output for the full patch.
            </p>
          )}
        </div>
      )}

      {result && result.operations.length === 0 && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-green-800">
          No changes were found between the original and modified JSON.
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Patch notes
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {issue.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {issue.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            JSON Patch guidance
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
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
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Generated JSON Patch output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JSON Patch generation happens directly in your browser. Your JSON data is
        not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating JSON Patch Operations from Two JSON Files
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Patch is a practical way to describe changes to JSON data as a
            list of operations. Instead of sending a full updated document, you
            can describe what changed with paths such as /settings/theme or
            /items/2.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Patch Generator compares an original JSON value with a
            modified JSON value and creates add, remove, and replace operations
            using JSON Pointer-style paths. It is useful for API updates,
            configuration changes, testing, and data review workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the JSON Patch Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the original JSON in the left input box.</li>
            <li>Paste the modified JSON in the right input box.</li>
            <li>Choose patch output, report output, JSON output, or Markdown output.</li>
            <li>Select how arrays should be compared.</li>
            <li>Generate the patch and copy the operations.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON Patch Generator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating patch operations for API update requests.</li>
            <li>Reviewing changes between two JSON configuration files.</li>
            <li>Generating test fixture updates from before and after data.</li>
            <li>Documenting exact JSON changes for pull requests.</li>
            <li>Finding changed object fields without manually scanning large JSON.</li>
            <li>Creating compact change payloads for JSON-based systems.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Patch Output
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`[
  {
    "op": "replace",
    "path": "/settings/ads",
    "value": true
  },
  {
    "op": "add",
    "path": "/settings/layout",
    "value": "clean"
  }
]`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JSON Pointer Paths in Patch Operations
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Patch operations use paths that point to a specific location in
            the JSON value. Object keys are separated with slashes, and array
            indexes are represented as numbers. For example, /tools/0 points to
            the first item in the tools array.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Special characters in object keys need escaping inside JSON Pointer
            paths. This tool escapes ~ as ~0 and / as ~1 so paths remain safe and
            predictable.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a JSON Patch Generator do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It compares original JSON and modified JSON, then generates patch
                operations that describe the changes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this the same as JSON Diff Checker?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. A diff checker shows differences. A patch generator creates
                operations that can be used to apply changes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support arrays?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It can compare arrays by index or replace a whole changed
                array depending on the selected option.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What operations does it generate?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It generates add, remove, and replace operations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The patch is generated directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-patch-generator" />
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

function buildPatchResult(
  originalText: string,
  modifiedText: string,
  options: {
    outputMode: OutputMode;
    compareMode: CompareMode;
    arrayMode: ArrayMode;
    includeOldValues: boolean;
    sortOperations: boolean;
    prettyOutput: boolean;
    ignoreObjectKeyOrder: boolean;
  }
): PatchResult {
  const original = parseJsonInput(originalText, "original");
  const modified = parseJsonInput(modifiedText, "modified");
  let operations = generatePatchOperations(original, modified, "", options);

  if (options.sortOperations) {
    operations = [...operations].sort((a, b) => a.path.localeCompare(b.path));
  }

  if (!options.includeOldValues) {
    operations = operations.map((operation) => {
      const { oldValue, ...cleanOperation } = operation;
      return cleanOperation;
    });
  }

  const issues = getPatchIssues(operations, options);
  const base = {
    operations,
    issues,
    addCount: operations.filter((operation) => operation.op === "add").length,
    removeCount: operations.filter((operation) => operation.op === "remove").length,
    replaceCount: operations.filter((operation) => operation.op === "replace").length,
    totalOperations: operations.length,
    originalSize: originalText.length,
    modifiedSize: modifiedText.length,
  };
  const output = formatOutput(base, options);

  return {
    ...base,
    output,
  };
}

function parseJsonInput(text: string, label: string) {
  try {
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Invalid ${label} JSON: ${err.message}`);
    }

    throw new Error(`Invalid ${label} JSON.`);
  }
}

function generatePatchOperations(
  original: unknown,
  modified: unknown,
  path: string,
  options: {
    compareMode: CompareMode;
    arrayMode: ArrayMode;
    ignoreObjectKeyOrder: boolean;
  }
): PatchOperation[] {
  if (valuesEqual(original, modified, options)) {
    return [];
  }

  if (Array.isArray(original) && Array.isArray(modified)) {
    if (options.arrayMode === "replaceWholeArray") {
      return [{ op: "replace", path: path || "", value: modified, oldValue: original }];
    }

    return diffArrays(original, modified, path, options);
  }

  if (isPlainObject(original) && isPlainObject(modified)) {
    return diffObjects(
      original as Record<string, unknown>,
      modified as Record<string, unknown>,
      path,
      options
    );
  }

  if (typeof original === "undefined") {
    return [{ op: "add", path: path || "", value: modified }];
  }

  if (typeof modified === "undefined") {
    return [{ op: "remove", path: path || "", oldValue: original }];
  }

  return [{ op: "replace", path: path || "", value: modified, oldValue: original }];
}

function diffObjects(
  original: Record<string, unknown>,
  modified: Record<string, unknown>,
  path: string,
  options: {
    compareMode: CompareMode;
    arrayMode: ArrayMode;
    ignoreObjectKeyOrder: boolean;
  }
): PatchOperation[] {
  const operations: PatchOperation[] = [];
  const originalKeys = Object.keys(original);
  const modifiedKeys = Object.keys(modified);
  const allKeys = new Set([...originalKeys, ...modifiedKeys]);

  allKeys.forEach((key) => {
    const childPath = joinPointer(path, key);
    const hasOriginal = Object.prototype.hasOwnProperty.call(original, key);
    const hasModified = Object.prototype.hasOwnProperty.call(modified, key);

    if (!hasOriginal && hasModified) {
      operations.push({ op: "add", path: childPath, value: modified[key] });
      return;
    }

    if (hasOriginal && !hasModified) {
      operations.push({ op: "remove", path: childPath, oldValue: original[key] });
      return;
    }

    operations.push(
      ...generatePatchOperations(original[key], modified[key], childPath, options)
    );
  });

  return operations;
}

function diffArrays(
  original: unknown[],
  modified: unknown[],
  path: string,
  options: {
    compareMode: CompareMode;
    arrayMode: ArrayMode;
    ignoreObjectKeyOrder: boolean;
  }
): PatchOperation[] {
  const operations: PatchOperation[] = [];
  const minLength = Math.min(original.length, modified.length);

  for (let index = 0; index < minLength; index += 1) {
    operations.push(
      ...generatePatchOperations(original[index], modified[index], joinPointer(path, String(index)), options)
    );
  }

  for (let index = original.length - 1; index >= modified.length; index -= 1) {
    operations.push({
      op: "remove",
      path: joinPointer(path, String(index)),
      oldValue: original[index],
    });
  }

  for (let index = original.length; index < modified.length; index += 1) {
    operations.push({
      op: "add",
      path: joinPointer(path, String(index)),
      value: modified[index],
    });
  }

  return operations;
}

function valuesEqual(
  a: unknown,
  b: unknown,
  options: {
    compareMode: CompareMode;
    ignoreObjectKeyOrder: boolean;
  }
) {
  if (Object.is(a, b)) {
    return true;
  }

  if (options.compareMode === "loose" && isPrimitive(a) && isPrimitive(b)) {
    return String(a) === String(b);
  }

  if (options.ignoreObjectKeyOrder && isPlainObject(a) && isPlainObject(b)) {
    return stableStringify(a) === stableStringify(b);
  }

  return false;
}

function isPrimitive(value: unknown) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function joinPointer(parent: string, key: string) {
  const escaped = key.replace(/~/g, "~0").replace(/\//g, "~1");
  return parent ? `${parent}/${escaped}` : `/${escaped}`;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (isPlainObject(value)) {
    const objectValue = value as Record<string, unknown>;
    return `{${Object.keys(objectValue)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function getPatchIssues(
  operations: PatchOperation[],
  options: {
    arrayMode: ArrayMode;
  }
): PatchIssue[] {
  const issues: PatchIssue[] = [];

  if (operations.length === 0) {
    issues.push({
      severity: "info",
      title: "No changes found",
      message: "The original and modified JSON values are equivalent with the selected comparison options.",
    });
  }

  if (operations.length > 100) {
    issues.push({
      severity: "warning",
      title: "Large patch",
      message: "More than 100 operations were generated. Review whether a full replacement or smaller update scope is better.",
    });
  }

  if (options.arrayMode === "index" && operations.some((operation) => /\/\d+(?:\/|$)/.test(operation.path))) {
    issues.push({
      severity: "info",
      title: "Array index operations",
      message: "Array patches are index-based. If array order changes, the generated operations may be noisy.",
    });
  }

  return issues;
}

function formatOutput(
  result: Omit<PatchResult, "output">,
  options: {
    outputMode: OutputMode;
    prettyOutput: boolean;
    includeOldValues: boolean;
  }
) {
  if (options.outputMode === "patch") {
    return stringifyJson(result.operations, options.prettyOutput);
  }

  if (options.outputMode === "json") {
    return stringifyJson(result, options.prettyOutput);
  }

  if (options.outputMode === "markdown") {
    return [
      "| Operation | Path | Value |",
      "| --- | --- | --- |",
      ...result.operations.map((operation) =>
        `| ${operation.op} | ${escapeMarkdown(operation.path || "/")} | ${escapeMarkdown(operation.op === "remove" ? "(removed)" : stringifyShort(operation.value))} |`
      ),
    ].join("\n");
  }

  if (options.outputMode === "report") {
    const operationLines = result.operations.length
      ? result.operations.map((operation, index) => {
          const lines = [
            `${index + 1}. ${operation.op.toUpperCase()} ${operation.path || "/"}`,
          ];

          if (operation.op !== "remove") {
            lines.push(`   value: ${stringifyShort(operation.value)}`);
          }

          if (options.includeOldValues && "oldValue" in operation) {
            lines.push(`   old: ${stringifyShort(operation.oldValue)}`);
          }

          return lines.join("\n");
        })
      : ["No operations generated."];

    return [
      "JSON Patch Report",
      "-----------------",
      `Operations: ${result.totalOperations}`,
      `Add: ${result.addCount}`,
      `Remove: ${result.removeCount}`,
      `Replace: ${result.replaceCount}`,
      `Original input size: ${result.originalSize}`,
      `Modified input size: ${result.modifiedSize}`,
      "",
      "Operations:",
      ...operationLines,
    ].join("\n");
  }

  return [
    "JSON Patch Summary",
    "------------------",
    `Operations: ${result.totalOperations}`,
    `Add operations: ${result.addCount}`,
    `Remove operations: ${result.removeCount}`,
    `Replace operations: ${result.replaceCount}`,
    `Original input size: ${result.originalSize}`,
    `Modified input size: ${result.modifiedSize}`,
  ].join("\n");
}

function stringifyJson(value: unknown, pretty: boolean) {
  return JSON.stringify(value, null, pretty ? 2 : 0);
}

function stringifyShort(value: unknown) {
  const text = JSON.stringify(value);

  if (!text) {
    return String(value);
  }

  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getPatchNotes(result: PatchResult): PatchNote[] {
  const notes: PatchNote[] = [];

  if (result.totalOperations === 0) {
    notes.push({
      title: "No patch needed",
      message:
        "The selected comparison options did not find any changes between the two JSON values.",
    });
  }

  if (result.replaceCount > result.addCount + result.removeCount && result.replaceCount > 10) {
    notes.push({
      title: "Many replacements",
      message:
        "A large number of replace operations may mean many values changed or arrays were reordered.",
    });
  }

  if (result.totalOperations > 0) {
    notes.push({
      title: "Review before applying",
      message:
        "Generated patches should be reviewed before applying them to production data or API requests.",
    });
  }

  return notes;
}
