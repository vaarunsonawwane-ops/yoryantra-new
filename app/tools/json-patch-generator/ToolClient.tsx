"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "patch" | "summary" | "report" | "json" | "markdown";
type ArrayMode = "index" | "replaceWholeArray";
type PatchOperation = {
  op: "add" | "remove" | "replace";
  path: string;
  value?: unknown;
  oldValue?: unknown;
};

type PatchIssue = {
  severity: "info" | "warning";
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
  severity: "warning" | "info";
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
  const [arrayMode, setArrayMode] = useState<ArrayMode>("index");
  const [includeOldValues, setIncludeOldValues] = useState(false);
  const [prettyOutput, setPrettyOutput] = useState(true);
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
        arrayMode,
        includeOldValues,
        prettyOutput,
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
    setArrayMode("index");
    setIncludeOldValues(false);
    setPrettyOutput(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setOriginalJson("");
    setModifiedJson("");
    setOutputMode("patch");
    setArrayMode("index");
    setIncludeOldValues(false);
    setPrettyOutput(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON Patch Generator"
      description="Derive RFC 6902 add, remove, and replace operations from two JSON documents."
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
          Patch choices
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

          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Object member order is ignored because it is not significant in JSON.
          Array changes are kept in generation order because RFC 6902 applies patch
          operations sequentially.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generatePatch} className="yoryantra-btn min-h-10 whitespace-nowrap">
          Generate JSON Patch
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

      {result && result.issues.some((issue) => issue.severity === "warning") && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Patch cautions
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues
              .filter((issue) => issue.severity === "warning")
              .map((issue, index) => (
                <div key={`${issue.title}-${index}`}>
                  <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-800">
                    {issue.message}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {result && result.issues.some((issue) => issue.severity === "info") && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="space-y-3">
            {result.issues
              .filter((issue) => issue.severity === "info")
              .map((issue, index) => (
                <div key={`${issue.title}-${index}`}>
                  <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {issue.message}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {notes.some((note) => note.severity === "warning") && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="space-y-3">
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
            Generated output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Generated JSON Patch output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Comparison and patch generation run in your browser. The JSON pasted into
        these fields is not sent to a Yoryantra server by this page.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A JSON Patch is an ordered program, not a sorted diff
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 6902 defines a patch as an array of operations that are applied
            one after another. The document produced by one operation becomes the
            input to the next, so reordering operations can change the result or
            make a previously valid array index fail.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Generation therefore keeps its original operation order. The emitted
            patch uses the standards-defined
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">add</code>,
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">remove</code>,
            and
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">replace</code>
            operations; it does not try to infer
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">move</code>,
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">copy</code>,
            or
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">test</code>.{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc6902"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 6902
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Every generated patch is applied once before it is shown
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The comparison is not accepted merely because it produced plausible
            paths. After generation, the page applies the add/remove/replace
            sequence to a clone of the original JSON and checks that the result is
            exactly the modified JSON value. A verification failure is treated as
            an error rather than returning a patch that only looks right.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Object member order is ignored during equality checks because JSON
            objects are unordered collections of members. Array order is not
            ignored: changing an array's sequence is a real value change.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Array diffs are correct without pretending to be minimal
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            “Compare by index” replaces differing positions, removes surplus
            elements from the end toward the front, and then appends new
            positions. That sequence is verified, but an insertion near the
            beginning can still produce several replacements. Choose whole-array
            replacement when a compact, predictable patch is more important than
            field-level detail.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Paths follow JSON Pointer escaping exactly
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Patch paths are JSON Pointers. A member named
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">a/b</code>
            is written as
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">/a~1b</code>,
            while
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">a~b</code>
            becomes
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">/a~0b</code>.
            The empty string is the pointer to the document root.{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc6901"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 6901
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JavaScript parsing can otherwise hide changes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Duplicate object member names can collapse to one value during
            parsing, and very large or high-precision JSON numbers can be rounded
            by JavaScript number semantics. Both inputs are checked before
            parsing, so those cases stop with an error instead of producing a
            misleading patch.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            If an identifier must preserve every digit, represent it as a JSON
            string. RFC 8259 explicitly notes interoperability concerns around
            duplicate names and numeric range or precision.{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 8259
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Old values belong in a report, not in the patch wire format
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The optional old-value detail is retained for the report and full
            analysis output. JSON Patch output itself contains only members
            needed by the selected RFC 6902 operations, so a debugging annotation
            does not quietly become part of an API payload.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-patch-generator" />
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

const MAX_JSON_PATCH_INPUT_CHARS = 1_500_000;
const MAX_JSON_PATCH_OPERATIONS = 5_000;
const MAX_JSON_DEPTH = 200;

function buildPatchResult(
  originalText: string,
  modifiedText: string,
  options: {
    outputMode: OutputMode;
    arrayMode: ArrayMode;
    includeOldValues: boolean;
    prettyOutput: boolean;
  }
): PatchResult {
  if (
    originalText.length > MAX_JSON_PATCH_INPUT_CHARS ||
    modifiedText.length > MAX_JSON_PATCH_INPUT_CHARS
  ) {
    throw new Error(
      `Each JSON input is limited to ${MAX_JSON_PATCH_INPUT_CHARS.toLocaleString()} characters for browser-side comparison.`
    );
  }

  const original = parseJsonInput(originalText, "original");
  const modified = parseJsonInput(modifiedText, "modified");
  const operations = generatePatchOperations(original, modified, "", options);

  if (operations.length > MAX_JSON_PATCH_OPERATIONS) {
    throw new Error(
      `The comparison produced more than ${MAX_JSON_PATCH_OPERATIONS.toLocaleString()} operations. Replace a larger subtree or the whole document instead of generating an oversized browser patch.`
    );
  }

  const verified = verifyGeneratedPatch(original, modified, operations);

  if (!verified) {
    throw new Error(
      "The generated operation sequence did not reproduce the modified JSON during verification."
    );
  }

  const issues = getPatchIssues(operations, options);
  const displayOperations = options.includeOldValues
    ? operations
    : operations.map(stripOldValue);

  const base = {
    operations: displayOperations,
    issues,
    addCount: operations.filter((operation) => operation.op === "add").length,
    removeCount: operations.filter((operation) => operation.op === "remove").length,
    replaceCount: operations.filter((operation) => operation.op === "replace").length,
    totalOperations: operations.length,
    originalSize: originalText.length,
    modifiedSize: modifiedText.length,
  };

  return {
    ...base,
    output: formatOutput(base, options),
  };
}

function parseJsonInput(text: string, label: string) {
  assertLosslessJsonText(text, label);

  try {
    return JSON.parse(text) as unknown;
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
    arrayMode: ArrayMode;
  }
): PatchOperation[] {
  if (jsonDeepEqual(original, modified)) {
    return [];
  }

  if (Array.isArray(original) && Array.isArray(modified)) {
    if (options.arrayMode === "replaceWholeArray") {
      return [{ op: "replace", path, value: modified, oldValue: original }];
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

  return [{ op: "replace", path, value: modified, oldValue: original }];
}

function diffObjects(
  original: Record<string, unknown>,
  modified: Record<string, unknown>,
  path: string,
  options: {
    arrayMode: ArrayMode;
  }
): PatchOperation[] {
  const operations: PatchOperation[] = [];
  const originalKeys = Object.keys(original);
  const modifiedKeys = Object.keys(modified);

  originalKeys.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(modified, key)) {
      operations.push({
        op: "remove",
        path: joinPointer(path, key),
        oldValue: original[key],
      });
    }
  });

  modifiedKeys.forEach((key) => {
    const childPath = joinPointer(path, key);

    if (!Object.prototype.hasOwnProperty.call(original, key)) {
      operations.push({
        op: "add",
        path: childPath,
        value: modified[key],
      });
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
    arrayMode: ArrayMode;
  }
): PatchOperation[] {
  const operations: PatchOperation[] = [];
  const sharedLength = Math.min(original.length, modified.length);

  for (let index = 0; index < sharedLength; index += 1) {
    operations.push(
      ...generatePatchOperations(
        original[index],
        modified[index],
        joinPointer(path, String(index)),
        options
      )
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

function stripOldValue(operation: PatchOperation): PatchOperation {
  const { oldValue: _oldValue, ...clean } = operation;
  return clean;
}

function toWirePatchOperation(operation: PatchOperation) {
  if (operation.op === "remove") {
    return {
      op: operation.op,
      path: operation.path,
    };
  }

  return {
    op: operation.op,
    path: operation.path,
    value: operation.value,
  };
}

function verifyGeneratedPatch(
  original: unknown,
  modified: unknown,
  operations: PatchOperation[]
) {
  const applied = applyGeneratedPatch(cloneJsonValue(original), operations);
  return jsonDeepEqual(applied, modified);
}

function applyGeneratedPatch(document: unknown, operations: PatchOperation[]) {
  let current = document;

  operations.forEach((operation) => {
    if (operation.path === "") {
      if (operation.op === "remove") {
        throw new Error("Generated root removal is not supported.");
      }

      current = cloneJsonValue(operation.value);
      return;
    }

    const tokens = decodePointer(operation.path);
    const finalToken = tokens[tokens.length - 1];
    const parent = getPointerParent(current, tokens.slice(0, -1), operation.path);

    if (Array.isArray(parent)) {
      const index = parseArrayIndex(finalToken, operation.op === "add" ? parent.length : parent.length - 1);

      if (operation.op === "add") {
        if (index > parent.length) {
          throw new Error(`Generated array add index is out of range at ${operation.path}.`);
        }
        parent.splice(index, 0, cloneJsonValue(operation.value));
        return;
      }

      if (index >= parent.length) {
        throw new Error(`Generated array index is out of range at ${operation.path}.`);
      }

      if (operation.op === "remove") {
        parent.splice(index, 1);
        return;
      }

      parent[index] = cloneJsonValue(operation.value);
      return;
    }

    if (!isPlainObject(parent)) {
      throw new Error(`Generated path has a non-container parent at ${operation.path}.`);
    }

    const objectParent = parent as Record<string, unknown>;
    const exists = Object.prototype.hasOwnProperty.call(objectParent, finalToken);

    if (operation.op === "remove") {
      if (!exists) {
        throw new Error(`Generated remove path does not exist at ${operation.path}.`);
      }
      delete objectParent[finalToken];
      return;
    }

    if (operation.op === "replace" && !exists) {
      throw new Error(`Generated replace path does not exist at ${operation.path}.`);
    }

    defineJsonMember(objectParent, finalToken, cloneJsonValue(operation.value));
  });

  return current;
}

function getPointerParent(current: unknown, tokens: string[], path: string) {
  let value = current;

  tokens.forEach((token) => {
    if (Array.isArray(value)) {
      const index = parseArrayIndex(token, value.length - 1);
      if (index >= value.length) {
        throw new Error(`Generated path does not exist at ${path}.`);
      }
      value = value[index];
      return;
    }

    if (!isPlainObject(value)) {
      throw new Error(`Generated path has a non-container segment at ${path}.`);
    }

    const objectValue = value as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(objectValue, token)) {
      throw new Error(`Generated path does not exist at ${path}.`);
    }
    value = objectValue[token];
  });

  return value;
}

function parseArrayIndex(token: string, maxAllowed: number) {
  if (!/^(?:0|[1-9]\d*)$/.test(token)) {
    throw new Error(`Generated array token ${JSON.stringify(token)} is not a valid index.`);
  }

  const index = Number(token);

  if (!Number.isSafeInteger(index) || index < 0 || index > maxAllowed + 1) {
    throw new Error(`Generated array index ${token} is outside the supported range.`);
  }

  return index;
}

function decodePointer(path: string) {
  if (path === "") {
    return [];
  }

  if (!path.startsWith("/")) {
    throw new Error(`Generated JSON Pointer ${JSON.stringify(path)} is invalid.`);
  }

  return path
    .slice(1)
    .split("/")
    .map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"));
}

function defineJsonMember(target: Record<string, unknown>, key: string, value: unknown) {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

function cloneJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(cloneJsonValue);
  }

  if (isPlainObject(value)) {
    const clone: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>).forEach((key) => {
      defineJsonMember(
        clone,
        key,
        cloneJsonValue((value as Record<string, unknown>)[key])
      );
    });
    return clone;
  }

  return value;
}

function jsonDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length &&
      a.every((item, index) => jsonDeepEqual(item, b[index]))
    );
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(right, key) &&
          jsonDeepEqual(left[key], right[key])
      )
    );
  }

  return false;
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function joinPointer(parent: string, key: string) {
  const escaped = key.replace(/~/g, "~0").replace(/\//g, "~1");
  return parent ? `${parent}/${escaped}` : `/${escaped}`;
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
      title: "No value change",
      message:
        "The two JSON documents represent the same JSON value. Object member ordering alone does not create a patch.",
    });
  }

  if (operations.length > 100) {
    issues.push({
      severity: "warning",
      title: "Large operation sequence",
      message:
        "More than 100 operations were generated. A coarser subtree replacement may be easier to review and safer to transport.",
    });
  }

  if (
    options.arrayMode === "index" &&
    operations.some((operation) => /\/(?:0|[1-9]\d*)(?:\/|$)/.test(operation.path))
  ) {
    issues.push({
      severity: "info",
      title: "Array positions are index-based",
      message:
        "Insertions or reordering can become several replace/add/remove operations even though the verified final value is correct.",
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
    return stringifyJson(
      result.operations.map(toWirePatchOperation),
      options.prettyOutput
    );
  }

  if (options.outputMode === "json") {
    return stringifyJson(result, options.prettyOutput);
  }

  if (options.outputMode === "markdown") {
    return [
      "| Operation | Path | Value |",
      "| --- | --- | --- |",
      ...result.operations.map(
        (operation) =>
          `| ${operation.op} | ${escapeMarkdown(operation.path || "(root)")} | ${escapeMarkdown(
            operation.op === "remove" ? "(removed)" : stringifyShort(operation.value)
          )} |`
      ),
    ].join("\n");
  }

  if (options.outputMode === "report") {
    const operationLines = result.operations.length
      ? result.operations.map((operation, index) => {
          const lines = [
            `${index + 1}. ${operation.op.toUpperCase()} ${
              operation.path || "(root)"
            }`,
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
      "Verification: generated sequence reproduced the modified JSON",
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
    "Verification: passed",
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

  if (result.totalOperations > 0) {
    notes.push({
      severity: "warning",
      title: "Applying a patch changes data",
      message:
        "Verification proves the generated sequence reaches the supplied modified JSON in this page. It cannot prove that an API endpoint, concurrent document version, authorization rule, or server-side validation will accept the same patch.",
    });
  }

  notes.push({
    severity: "info",
    title: "Only add, remove, and replace are generated",
    message:
      "Move, copy, and test are valid RFC 6902 operations, but inferring them requires intent that cannot be recovered reliably from two snapshots alone.",
  });

  return notes;
}

function assertLosslessJsonText(text: string, label: string) {
  try {
    JSON.parse(text);
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? `Invalid ${label} JSON: ${err.message}`
        : `Invalid ${label} JSON.`
    );
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
      if (stack.length > MAX_JSON_DEPTH) {
        throw new Error(
          `${capitalize(label)} JSON is nested more than ${MAX_JSON_DEPTH} levels, beyond this browser comparison limit.`
        );
      }
      index += 1;
      continue;
    }

    if (char === "[") {
      stack.push({ type: "array" });
      if (stack.length > MAX_JSON_DEPTH) {
        throw new Error(
          `${capitalize(label)} JSON is nested more than ${MAX_JSON_DEPTH} levels, beyond this browser comparison limit.`
        );
      }
      index += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      stack.pop();
      index += 1;
      continue;
    }

    if (char === '"') {
      const tokenEnd = findJsonStringEnd(text, index);
      const token = text.slice(index, tokenEnd + 1);
      let next = tokenEnd + 1;

      while (next < text.length && /\s/.test(text[next])) {
        next += 1;
      }

      const frame = stack[stack.length - 1];

      if (frame?.type === "object" && text[next] === ":") {
        const key = JSON.parse(token) as string;

        if (frame.keys?.has(key)) {
          throw new Error(
            `Duplicate member ${JSON.stringify(key)} in ${label} JSON would be collapsed during parsing.`
          );
        }

        frame.keys?.add(key);
      }

      index = tokenEnd + 1;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const numberMatch = text
        .slice(index)
        .match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);

      if (numberMatch) {
        const token = numberMatch[0];
        const numericValue = Number(token);

        if (!isSafeNumberToken(token, numericValue)) {
          throw new Error(
            `JSON number ${token} in the ${label} document cannot be preserved safely with JavaScript number semantics. Represent precision-sensitive values as strings.`
          );
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

    if (char === '"') {
      return index;
    }
  }

  return text.length - 1;
}

function isSafeNumberToken(token: string, numericValue: number) {
  if (!Number.isFinite(numericValue) || Object.is(numericValue, -0)) {
    return false;
  }

  if (/^-?(?:0|[1-9]\d*)$/.test(token)) {
    return Number.isSafeInteger(numericValue);
  }

  const significantDigits = token
    .replace(/^[+-]/, "")
    .split(/[eE]/)[0]
    .replace(".", "")
    .replace(/^0+/, "").length;

  if (significantDigits > 15) {
    return false;
  }

  if (numericValue === 0 && /[1-9]/.test(token)) {
    return false;
  }

  return true;
}

function capitalize(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}
