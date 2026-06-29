"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "evaluate" | "inspect" | "generate" | "decode";
type OutputMode = "value" | "json" | "markdown" | "csv" | "checklist";
type MissingMode = "error" | "null" | "empty";
type PointerInputMode = "single" | "multiple";

type PointerResult = {
  pointer: string;
  exists: boolean;
  value: unknown;
  valueType: string;
  decodedSegments: string[];
  message: string;
  depth: number;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  pointerResults: PointerResult[];
  issues: Issue[];
  inputLength: number;
  pointerCount: number;
  matchCount: number;
  outputLength: number;
  jsonShape: string;
};

const sampleJson = `{
  "user": {
    "name": "Varoun",
    "roles": ["creator", "developer"],
    "profile": {
      "city": "Pune",
      "site": "Yoryantra"
    }
  },
  "tools": [
    {
      "title": "JSON Formatter",
      "category": "JSON & Data"
    },
    {
      "title": "JSON Pointer Evaluator",
      "category": "JSON & Data"
    }
  ],
  "a/b": "slash key",
  "tilde~key": "tilde key"
}`;

const samplePointers = `/user/name
/user/roles/0
/tools/1/title
/a~1b
/tilde~0key`;

export default function ToolClient() {
  const [jsonInput, setJsonInput] = useState("");
  const [pointerInput, setPointerInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("evaluate");
  const [outputMode, setOutputMode] = useState<OutputMode>("value");
  const [missingMode, setMissingMode] = useState<MissingMode>("error");
  const [pointerInputMode, setPointerInputMode] = useState<PointerInputMode>("multiple");
  const [prettyPrintValues, setPrettyPrintValues] = useState(true);
  const [includePointerSegments, setIncludePointerSegments] = useState(true);
  const [includeMissingPointers, setIncludeMissingPointers] = useState(true);
  const [sortGeneratedPointers, setSortGeneratedPointers] = useState(false);
  const [generateLeafOnly, setGenerateLeafOnly] = useState(true);
  const [limitGeneratedPointers, setLimitGeneratedPointers] = useState(true);
  const [warnInvalidEscapes, setWarnInvalidEscapes] = useState(true);
  const [warnArrayIndexes, setWarnArrayIndexes] = useState(true);
  const [warnEmptyPointer, setWarnEmptyPointer] = useState(true);
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

  const processPointer = () => {
    if (!jsonInput.trim() && actionMode !== "decode") {
      setError("Please paste JSON to evaluate JSON Pointer paths against.");
      setResult(null);
      setOutput("");
      return;
    }

    if (!pointerInput.trim() && actionMode !== "generate") {
      setError("Please enter one or more JSON Pointer paths.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      jsonInput,
      pointerInput,
      actionMode,
      outputMode,
      missingMode,
      pointerInputMode,
      prettyPrintValues,
      includePointerSegments,
      includeMissingPointers,
      sortGeneratedPointers,
      generateLeafOnly,
      limitGeneratedPointers,
      warnInvalidEscapes,
      warnArrayIndexes,
      warnEmptyPointer,
    });

    if (next.output.startsWith("__ERROR__:")) {
      setError(next.output.replace("__ERROR__:", ""));
      setResult(next);
      setOutput("");
      setCopied(false);
      return;
    }

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setJsonInput(sampleJson);
    setPointerInput(samplePointers);
    setActionMode("evaluate");
    setOutputMode("value");
    setMissingMode("error");
    setPointerInputMode("multiple");
    setPrettyPrintValues(true);
    setIncludePointerSegments(true);
    setIncludeMissingPointers(true);
    setSortGeneratedPointers(false);
    setGenerateLeafOnly(true);
    setLimitGeneratedPointers(true);
    setWarnInvalidEscapes(true);
    setWarnArrayIndexes(true);
    setWarnEmptyPointer(true);
    clearResult();
  };

  const resetAll = () => {
    setJsonInput("");
    setPointerInput("");
    setActionMode("evaluate");
    setOutputMode("value");
    setMissingMode("error");
    setPointerInputMode("multiple");
    setPrettyPrintValues(true);
    setIncludePointerSegments(true);
    setIncludeMissingPointers(true);
    setSortGeneratedPointers(false);
    setGenerateLeafOnly(true);
    setLimitGeneratedPointers(true);
    setWarnInvalidEscapes(true);
    setWarnArrayIndexes(true);
    setWarnEmptyPointer(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Pointer Evaluator"
      description="Evaluate RFC 6901 JSON Pointer paths against pasted JSON, inspect matched values, decode pointer segments, and generate pointer reports locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Document</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste the JSON object or array you want to inspect. Use JSON Pointer paths like /user/name, /items/0/title, or /a~1b.
            </p>
          </div>

          <textarea
            value={jsonInput}
            onChange={(event) => {
              setJsonInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleJson}
            spellCheck={false}
            className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Pointer Path</label>
            <textarea
              value={pointerInput}
              onChange={(event) => {
                setPointerInput(event.target.value);
                clearResult();
              }}
              placeholder={samplePointers}
              spellCheck={false}
              className="mt-2 w-full min-h-[130px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Pointer Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                setActionMode(value as ActionMode);
                clearResult();
              }}
              options={[
                { label: "Evaluate pointer values", value: "evaluate" },
                { label: "Inspect pointer paths", value: "inspect" },
                { label: "Generate pointers from JSON", value: "generate" },
                { label: "Decode pointer segments", value: "decode" },
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
                { label: "Matched value output", value: "value" },
                { label: "JSON report", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Pointer Input"
              value={pointerInputMode}
              onChange={(value) => {
                setPointerInputMode(value as PointerInputMode);
                clearResult();
              }}
              options={[
                { label: "Single pointer", value: "single" },
                { label: "Multiple pointers, one per line", value: "multiple" },
              ]}
            />

            <YoryantraSelect
              label="Missing Paths"
              value={missingMode}
              onChange={(value) => {
                setMissingMode(value as MissingMode);
                clearResult();
              }}
              options={[
                { label: "Show as error", value: "error" },
                { label: "Show as null", value: "null" },
                { label: "Show as empty", value: "empty" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={prettyPrintValues} onChange={setPrettyPrintValues} label="Pretty print matched JSON values" />
          <Toggle checked={includePointerSegments} onChange={setIncludePointerSegments} label="Include decoded pointer segments" />
          <Toggle checked={includeMissingPointers} onChange={setIncludeMissingPointers} label="Include missing pointers in reports" />
          <Toggle checked={sortGeneratedPointers} onChange={setSortGeneratedPointers} label="Sort generated pointers alphabetically" />
          <Toggle checked={generateLeafOnly} onChange={setGenerateLeafOnly} label="Generate leaf-value pointers only" />
          <Toggle checked={limitGeneratedPointers} onChange={setLimitGeneratedPointers} label="Limit generated pointers to first 300" />
          <Toggle checked={warnInvalidEscapes} onChange={setWarnInvalidEscapes} label="Warn about invalid pointer escapes" />
          <Toggle checked={warnArrayIndexes} onChange={setWarnArrayIndexes} label="Warn about array index segments" />
          <Toggle checked={warnEmptyPointer} onChange={setWarnEmptyPointer} label="Warn when pointer targets whole document" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options help debug pointer syntax, array indexes, escaped slash keys, escaped tilde keys, and generated pointer lists.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processPointer}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Evaluate Pointer
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">Matched value, pointer inspection, generated paths, or report output.</p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Pointers" value={String(result.pointerCount)} />
            <StatCard label="Matches" value={String(result.matchCount)} />
            <StatCard label="JSON shape" value={result.jsonShape} />
            <StatCard label="Output size" value={`${result.outputLength.toLocaleString()} chars`} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result?.pointerResults.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Pointer Results</h3>
          <p className="mt-1 text-sm text-gray-500">Showing pointer match status, value type, depth, and decoded segments.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pointer</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Depth</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.pointerResults.slice(0, 100).map((row, index) => (
                  <tr key={`${row.pointer}-${index}`}>
                    <td className="px-4 py-3 font-mono">{row.pointer || "(root)"}</td>
                    <td className="px-4 py-3">{row.exists ? "Matched" : "Missing"}</td>
                    <td className="px-4 py-3 font-mono">{row.valueType}</td>
                    <td className="px-4 py-3">{row.depth}</td>
                    <td className="px-4 py-3">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.pointerResults.length > 100 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 100 pointer results to keep the table readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Testing JSON Pointer Paths Without Guesswork</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Pointer is a compact path format for selecting values inside a JSON document. It appears in JSON Patch, OpenAPI references, schema tooling, API errors, and config systems. A pointer such as <code className="rounded bg-gray-100 px-1 py-0.5">/user/name</code> walks through object keys, while <code className="rounded bg-gray-100 px-1 py-0.5">/items/0/title</code> selects an array item.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This evaluator lets you paste JSON, test one or more pointers, decode escaped segments, inspect missing paths, and generate pointer lists from a document.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This JSON Pointer Evaluator Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Checking JSON Patch paths before using add, remove, replace, move, copy, or test operations.</p>
            <p className="mt-2">Debugging OpenAPI, schema, or API error references that point to nested JSON values.</p>
            <p className="mt-2">Testing escaped pointer segments for keys that contain slashes or tildes.</p>
            <p className="mt-2">Generating pointer paths from a pasted JSON document for documentation or troubleshooting.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the JSON Pointer Evaluator</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the JSON document you want to inspect.</li>
            <li>Enter one JSON Pointer path or multiple paths, one per line.</li>
            <li>Choose whether to evaluate values, inspect pointer syntax, generate pointers, or decode pointer segments.</li>
            <li>Review matched values, missing paths, decoded segments, and warnings.</li>
            <li>Copy the value output, JSON report, Markdown table, CSV, or checklist.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example JSON Pointer Paths</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`/user/name
/user/roles/0
/tools/1/title
/a~1b       selects key named a/b
/tilde~0key selects key named tilde~key`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON Pointer Is Different From JSONPath</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Pointer uses a simple slash-separated path format defined by RFC 6901. JSONPath is a query-like syntax with filters, wildcards, and expressions. Use JSON Pointer when a tool expects exact paths such as <code className="rounded bg-gray-100 px-1 py-0.5">/user/name</code>, especially in JSON Patch, schema references, and API error locations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What is a JSON Pointer?">
              A JSON Pointer is a slash-separated path that identifies a value inside a JSON document, such as /user/name or /items/0/title.
            </Faq>
            <Faq title="How do I reference a key that contains a slash?">
              Use ~1 for a slash. For example, the key a/b is written as /a~1b in JSON Pointer syntax.
            </Faq>
            <Faq title="How do I reference a key that contains a tilde?">
              Use ~0 for a tilde. For example, the key tilde~key is written as /tilde~0key.
            </Faq>
            <Faq title="Can this test JSON Patch paths?">
              Yes. JSON Patch operations use JSON Pointer paths, so this tool can help check whether a patch path points to the expected value.
            </Faq>
            <Faq title="Is anything uploaded while evaluating JSON Pointers?">
              No. The evaluation runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-pointer-evaluator" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  jsonInput: string;
  pointerInput: string;
  actionMode: ActionMode;
  outputMode: OutputMode;
  missingMode: MissingMode;
  pointerInputMode: PointerInputMode;
  prettyPrintValues: boolean;
  includePointerSegments: boolean;
  includeMissingPointers: boolean;
  sortGeneratedPointers: boolean;
  generateLeafOnly: boolean;
  limitGeneratedPointers: boolean;
  warnInvalidEscapes: boolean;
  warnArrayIndexes: boolean;
  warnEmptyPointer: boolean;
}): Result {
  if (options.actionMode === "decode") {
    const pointers = getPointers(options.pointerInput, options.pointerInputMode);
    const pointerResults = pointers.map((pointer) => inspectPointer(pointer, null));
    const issues = buildPointerIssues(pointerResults, options);
    const output = formatOutput(pointerResults, issues, options, null);
    return {
      output,
      pointerResults,
      issues,
      inputLength: options.pointerInput.length,
      pointerCount: pointerResults.length,
      matchCount: 0,
      outputLength: output.length,
      jsonShape: "not required",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(options.jsonInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON input.";
    return emptyResult(`__ERROR__:The JSON input is not valid: ${message}`, options.jsonInput.length);
  }

  if (options.actionMode === "generate") {
    let pointers = generatePointers(parsed, "", options.generateLeafOnly);
    if (options.sortGeneratedPointers) {
      pointers = [...pointers].sort((a, b) => a.localeCompare(b));
    }
    if (options.limitGeneratedPointers) {
      pointers = pointers.slice(0, 300);
    }

    const pointerResults = pointers.map((pointer) => {
      const evaluation = evaluatePointer(parsed, pointer);
      return {
        pointer,
        exists: evaluation.exists,
        value: evaluation.value,
        valueType: valueType(evaluation.value),
        decodedSegments: decodePointer(pointer).segments,
        message: evaluation.exists ? "Generated from JSON document" : "Generated pointer did not resolve",
        depth: pointer ? pointer.split("/").length - 1 : 0,
      };
    });

    const issues = buildPointerIssues(pointerResults, options);
    const output = formatOutput(pointerResults, issues, options, parsed);
    return {
      output,
      pointerResults,
      issues,
      inputLength: options.jsonInput.length,
      pointerCount: pointerResults.length,
      matchCount: pointerResults.filter((item) => item.exists).length,
      outputLength: output.length,
      jsonShape: jsonShape(parsed),
    };
  }

  const pointers = getPointers(options.pointerInput, options.pointerInputMode);
  const pointerResults = pointers.map((pointer) => {
    if (options.actionMode === "inspect") {
      return inspectPointer(pointer, parsed);
    }

    const decoded = decodePointer(pointer);
    if (!decoded.valid) {
      return {
        pointer,
        exists: false,
        value: null,
        valueType: "invalid pointer",
        decodedSegments: decoded.segments,
        message: decoded.error,
        depth: decoded.segments.length,
      };
    }

    const evaluation = evaluatePointer(parsed, pointer);
    return {
      pointer,
      exists: evaluation.exists,
      value: evaluation.value,
      valueType: evaluation.exists ? valueType(evaluation.value) : "missing",
      decodedSegments: decoded.segments,
      message: evaluation.exists ? "Pointer matched a value" : evaluation.message,
      depth: decoded.segments.length,
    };
  });

  const filteredResults = options.includeMissingPointers ? pointerResults : pointerResults.filter((item) => item.exists);
  const issues = buildPointerIssues(pointerResults, options);
  const output = formatOutput(filteredResults, issues, options, parsed);

  return {
    output,
    pointerResults,
    issues,
    inputLength: options.jsonInput.length,
    pointerCount: pointerResults.length,
    matchCount: pointerResults.filter((item) => item.exists).length,
    outputLength: output.length,
    jsonShape: jsonShape(parsed),
  };
}

function emptyResult(output: string, inputLength: number): Result {
  return {
    output,
    pointerResults: [],
    issues: [],
    inputLength,
    pointerCount: 0,
    matchCount: 0,
    outputLength: 0,
    jsonShape: "invalid JSON",
  };
}

function getPointers(input: string, mode: PointerInputMode) {
  if (mode === "single") return [input.trim()];
  return input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function inspectPointer(pointer: string, parsed: unknown): PointerResult {
  const decoded = decodePointer(pointer);
  const evaluation = parsed === null ? { exists: false, value: null, message: "No JSON document used for decode-only mode" } : evaluatePointer(parsed, pointer);

  return {
    pointer,
    exists: evaluation.exists,
    value: evaluation.value,
    valueType: decoded.valid ? (evaluation.exists ? valueType(evaluation.value) : "not evaluated") : "invalid pointer",
    decodedSegments: decoded.segments,
    message: decoded.valid ? decoded.segments.length ? `Decoded ${decoded.segments.length} segment${decoded.segments.length === 1 ? "" : "s"}` : "Empty pointer targets the whole document" : decoded.error,
    depth: decoded.segments.length,
  };
}

function evaluatePointer(root: unknown, pointer: string): { exists: boolean; value: unknown; message: string } {
  const decoded = decodePointer(pointer);
  if (!decoded.valid) {
    return { exists: false, value: null, message: decoded.error };
  }

  if (pointer === "") {
    return { exists: true, value: root, message: "Empty pointer targets the whole document" };
  }

  let current = root;
  for (const segment of decoded.segments) {
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\d*)$/.test(segment)) {
        return { exists: false, value: null, message: `Segment "${segment}" is not a valid array index.` };
      }
      const index = Number(segment);
      if (index < 0 || index >= current.length) {
        return { exists: false, value: null, message: `Array index ${index} is out of range.` };
      }
      current = current[index];
      continue;
    }

    if (current && typeof current === "object") {
      const obj = current as Record<string, unknown>;
      if (!Object.prototype.hasOwnProperty.call(obj, segment)) {
        return { exists: false, value: null, message: `Object key "${segment}" was not found.` };
      }
      current = obj[segment];
      continue;
    }

    return { exists: false, value: null, message: `Cannot continue through ${valueType(current)} value.` };
  }

  return { exists: true, value: current, message: "Pointer matched a value" };
}

function decodePointer(pointer: string): { valid: boolean; segments: string[]; error: string } {
  if (pointer === "") {
    return { valid: true, segments: [], error: "" };
  }

  if (!pointer.startsWith("/")) {
    return { valid: false, segments: [], error: "A JSON Pointer must be empty or start with /." };
  }

  const rawSegments = pointer.slice(1).split("/");
  const segments: string[] = [];

  for (const raw of rawSegments) {
    let decoded = "";
    for (let index = 0; index < raw.length; index += 1) {
      const char = raw[index];
      if (char === "~") {
        const next = raw[index + 1];
        if (next === "0") {
          decoded += "~";
          index += 1;
        } else if (next === "1") {
          decoded += "/";
          index += 1;
        } else {
          return { valid: false, segments, error: `Invalid escape "~${next ?? ""}". Use ~0 for tilde and ~1 for slash.` };
        }
      } else {
        decoded += char;
      }
    }
    segments.push(decoded);
  }

  return { valid: true, segments, error: "" };
}

function generatePointers(value: unknown, currentPointer: string, leafOnly: boolean): string[] {
  const pointers: string[] = [];

  if (!leafOnly || !isContainer(value)) {
    pointers.push(currentPointer);
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      pointers.push(...generatePointers(item, `${currentPointer}/${index}`, leafOnly));
    });
  } else if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      pointers.push(...generatePointers(item, `${currentPointer}/${encodePointerSegment(key)}`, leafOnly));
    });
  }

  return pointers;
}

function encodePointerSegment(segment: string) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

function isContainer(value: unknown) {
  return Boolean(value && typeof value === "object");
}

function buildPointerIssues(results: PointerResult[], options: {
  warnInvalidEscapes: boolean;
  warnArrayIndexes: boolean;
  warnEmptyPointer: boolean;
}): Issue[] {
  const issues: Issue[] = [];
  const missing = results.filter((result) => !result.exists && result.valueType !== "not evaluated");
  const invalid = results.filter((result) => result.valueType === "invalid pointer");

  if (invalid.length && options.warnInvalidEscapes) {
    issues.push({
      severity: "high",
      title: "Invalid pointer syntax",
      message: `${invalid.length} pointer${invalid.length === 1 ? "" : "s"} have invalid JSON Pointer syntax or escape sequences.`,
    });
  }

  if (missing.length) {
    issues.push({
      severity: "warning",
      title: "Missing pointer targets",
      message: `${missing.length} pointer${missing.length === 1 ? "" : "s"} did not match a value in the JSON document.`,
    });
  }

  if (options.warnArrayIndexes && results.some((result) => result.decodedSegments.some((segment) => /^(0|[1-9]\d*)$/.test(segment)))) {
    issues.push({
      severity: "info",
      title: "Array index segments",
      message: "Some pointer segments look like array indexes. Make sure they are used against arrays, not object keys with numeric names.",
    });
  }

  if (options.warnEmptyPointer && results.some((result) => result.pointer === "")) {
    issues.push({
      severity: "info",
      title: "Empty pointer",
      message: "An empty JSON Pointer targets the entire JSON document.",
    });
  }

  return issues;
}

function formatOutput(results: PointerResult[], issues: Issue[], options: {
  outputMode: OutputMode;
  missingMode: MissingMode;
  prettyPrintValues: boolean;
  includePointerSegments: boolean;
}, parsed: unknown) {
  if (options.outputMode === "value") {
    if (results.length === 1) {
      const item = results[0];
      if (!item.exists) return formatMissing(item, options.missingMode);
      return formatValue(item.value, options.prettyPrintValues);
    }

    return results.map((item) => {
      const value = item.exists ? formatValue(item.value, options.prettyPrintValues) : formatMissing(item, options.missingMode);
      return `${item.pointer || "(root)"}:\n${value}`;
    }).join("\n\n");
  }

  if (options.outputMode === "json") {
    return JSON.stringify({
      jsonShape: parsed === null ? "not included" : jsonShape(parsed),
      results: results.map((item) => ({
        pointer: item.pointer,
        exists: item.exists,
        valueType: item.valueType,
        value: item.exists ? item.value : null,
        decodedSegments: options.includePointerSegments ? item.decodedSegments : undefined,
        message: item.message,
      })),
      issues,
    }, null, 2);
  }

  if (options.outputMode === "markdown") {
    const lines = [
      "| Pointer | Exists | Type | Depth | Message |",
      "|---|---|---|---:|---|",
      ...results.map((item) => `| ${escapeMarkdown(item.pointer || "(root)")} | ${item.exists ? "yes" : "no"} | ${escapeMarkdown(item.valueType)} | ${item.depth} | ${escapeMarkdown(item.message)} |`),
    ];

    if (options.includePointerSegments) {
      lines.push("", "Decoded segments:", ...results.map((item) => `- ${item.pointer || "(root)"}: ${item.decodedSegments.map((segment) => `\`${segment}\``).join(", ") || "(root)"}`));
    }

    return lines.join("\n");
  }

  if (options.outputMode === "csv") {
    const rows = [["pointer", "exists", "type", "depth", "message"]];
    results.forEach((item) => {
      rows.push([item.pointer, item.exists ? "true" : "false", item.valueType, String(item.depth), item.message]);
    });
    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }

  const lines = [
    "# JSON Pointer Checklist",
    "",
    `- [${results.length ? "x" : " "}] Checked ${results.length} pointer${results.length === 1 ? "" : "s"}.`,
    `- [${results.every((item) => item.exists || item.valueType === "not evaluated") ? "x" : " "}] All evaluated pointers matched values.`,
    `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] No high-severity pointer syntax issues found.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => {
      lines.push(`- ${issue.title}: ${issue.message}`);
    });
  }

  return lines.join("\n");
}

function formatMissing(item: PointerResult, mode: MissingMode) {
  if (mode === "null") return "null";
  if (mode === "empty") return "";
  return `Missing: ${item.message}`;
}

function formatValue(value: unknown, pretty: boolean) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, pretty ? 2 : 0);
}

function valueType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function jsonShape(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") return "object";
  return valueType(value);
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.pointerCount > 100) {
    notes.push({
      severity: "info",
      title: "Many pointers",
      message: "This output contains many pointer results. Use JSON or CSV output if you need to review them in another tool.",
    });
  }

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated output is large. Copying or pasting into some editors may take a moment.",
    });
  }

  return notes;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
      />
      <span>{label}</span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
