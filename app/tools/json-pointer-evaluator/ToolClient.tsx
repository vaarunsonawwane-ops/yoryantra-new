"use client";

import { useMemo, useState } from "react";
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

    if (actionMode !== "generate" && pointerInputMode === "multiple" && pointerInput.length === 0) {
      setError("Enter one or more JSON Pointer paths. For the empty root pointer, switch to Single pointer and leave the field empty.");
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
      description="Resolve RFC 6901 pointers, URI-fragment forms, escaped tokens, arrays, and root values precisely."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Document</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste the JSON value to address. Pointer tokens are exact: /a~1b addresses the key a/b, and an empty pointer addresses the root.
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
          className="min-h-[44px] whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Evaluate Pointer
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
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
                className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div key={`${note.title}-${note.message}`} className={issueCardClass(note.severity)}>
                <p className={issueTitleClass(note.severity)}>{note.title}</p>
                <p className={issueTextClass(note.severity)}>{note.message}</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">A pointer identifies one exact location, not a search pattern</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Pointer is deliberately small. Each slash-prefixed token selects one object member or array element in sequence. <code className="rounded bg-gray-100 px-1 py-0.5">/user/name</code> addresses a nested member, while <code className="rounded bg-gray-100 px-1 py-0.5">/items/0</code> addresses the first array element. There are no wildcards, filters, recursive searches, or expressions.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The empty string is also a valid pointer: it addresses the entire JSON document. In Single pointer mode, leave the pointer field empty to test that case. A single slash <code className="rounded bg-gray-100 px-1 py-0.5">/</code> means something different—it addresses an object member whose name is the empty string.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Escaping happens inside each reference token</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              A slash inside a member name becomes <code className="rounded bg-white px-1 py-0.5">~1</code>, and a tilde becomes <code className="rounded bg-white px-1 py-0.5">~0</code>. The key <code className="rounded bg-white px-1 py-0.5">a/b</code> is therefore addressed as <code className="rounded bg-white px-1 py-0.5">/a~1b</code>. Invalid <code className="rounded bg-white px-1 py-0.5">~</code> escapes are rejected rather than guessed.
            </p>
          </div>
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">The URI-fragment form is related, but not universally implied</h2>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              RFC 6901 also defines forms such as <code className="rounded bg-amber-100 px-1 py-0.5">#/a~1b</code>. Percent-decoding is applied before pointer-token decoding. A media type still has to define JSON Pointer as its fragment syntax; ordinary <code className="rounded bg-amber-100 px-1 py-0.5">application/json</code> does not automatically make every URL fragment a JSON Pointer.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Array tokens have stricter rules than object member names</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Against an array, an index is <code className="rounded bg-gray-100 px-1 py-0.5">0</code> or a positive decimal integer without a leading zero. The token <code className="rounded bg-gray-100 px-1 py-0.5">-</code> is valid JSON Pointer syntax, but RFC 6901 defines it as the nonexistent position after the last array element, so plain evaluation cannot resolve it to a value. JSON Patch gives that token application-specific meaning for certain add operations; a pointer evaluator should not silently borrow that behavior.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Numeric-looking tokens are not intrinsically array indexes. If the current value is an object, <code className="rounded bg-gray-100 px-1 py-0.5">/0</code> simply addresses the object member named <code className="rounded bg-gray-100 px-1 py-0.5">0</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Duplicate JSON names make an exact pointer undefined</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 6901 states that evaluation fails when the referenced object member name is not unique. JavaScript's normal <code className="rounded bg-gray-100 px-1 py-0.5">JSON.parse</code> would otherwise keep only one duplicate and hide the ambiguity, so duplicate member names are stopped before evaluation. Integers outside JavaScript's safe exact range are also rejected before matched values can be silently rounded.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Primary reference:{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc6901.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 6901 — JavaScript Object Notation (JSON) Pointer
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Generated pointer lists include empty containers</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Leaf-only generation normally emits values that have no children. An empty object or empty array also has no child path, so its pointer is retained instead of disappearing from the generated list. Generation is capped to keep deeply nested or very wide pasted documents responsive; the result notes when the cap was reached.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON Pointer and JSONPath solve different jobs</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A JSON Pointer is an exact address. JSONPath is a query language family intended for selecting sets of values with richer expressions. If an API error, JSON Patch operation, OpenAPI reference, or schema-related format gives you a slash path, exact pointer semantics matter more than a flexible query syntax.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Evaluation stays in the browser, but pasted data still deserves care</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Parsing, pointer generation, and evaluation run in the current browser tab; the page code does not upload the pasted JSON to a Yoryantra server. Sensitive production payloads should still be minimized before pasting into any browser-based utility, especially on shared machines, screen recordings, or systems with browser extensions you do not control.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/json-pointer-evaluator" /></div>
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
    const pointerResults = pointers.map((pointer) => inspectPointer(pointer, undefined, false));
    const issues = buildPointerIssues(pointerResults, options, false);
    const output = formatOutput(pointerResults, issues, options, undefined, false);
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

  const dataRisk = findJsonDataRisk(options.jsonInput);
  if (dataRisk) {
    return emptyResult(`__ERROR__:${dataRisk}`, options.jsonInput.length);
  }

  if (options.actionMode === "generate") {
    const maxPointers = options.limitGeneratedPointers ? 300 : 5000;
    const generated = generatePointers(parsed, "", options.generateLeafOnly, maxPointers);
    let pointers = generated.pointers;
    if (options.sortGeneratedPointers) {
      pointers = [...pointers].sort(compareCodeUnits);
    }

    const pointerResults = pointers.map((pointer) => {
      const evaluation = evaluatePointer(parsed, pointer);
      const decoded = decodePointer(pointer);
      return {
        pointer,
        exists: evaluation.exists,
        value: evaluation.value,
        valueType: evaluation.exists ? valueType(evaluation.value) : "missing",
        decodedSegments: decoded.segments,
        message: evaluation.exists ? "Generated from the pasted JSON value" : evaluation.message,
        depth: decoded.segments.length,
      };
    });

    const issues = buildPointerIssues(pointerResults, options, generated.truncated);
    const output = formatOutput(pointerResults, issues, options, parsed, true);
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
      return inspectPointer(pointer, parsed, true);
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

  const filteredResults = options.includeMissingPointers
    ? pointerResults
    : pointerResults.filter((item) => item.exists);

  const issues = buildPointerIssues(pointerResults, options, false);
  const output = formatOutput(filteredResults, issues, options, parsed, true);

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
  if (mode === "single") return [input];

  const lines = input.split(/\r?\n/);
  if (lines.length > 1 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

function inspectPointer(pointer: string, parsed: unknown, shouldEvaluate: boolean): PointerResult {
  const decoded = decodePointer(pointer);
  const evaluation = decoded.valid && shouldEvaluate
    ? evaluatePointer(parsed, pointer)
    : { exists: false, value: null, message: shouldEvaluate ? decoded.error : "Decode-only mode" };

  let message = decoded.error;
  if (decoded.valid) {
    if (shouldEvaluate) {
      message = evaluation.exists ? "Pointer matched a value" : evaluation.message;
    } else if (decoded.segments.length === 0) {
      message = decoded.fromFragment ? "URI fragment decodes to the empty root pointer" : "Empty pointer targets the whole document";
    } else {
      message = `Decoded ${decoded.segments.length} reference token${decoded.segments.length === 1 ? "" : "s"}${decoded.fromFragment ? " from URI-fragment form" : ""}`;
    }
  }

  return {
    pointer,
    exists: evaluation.exists,
    value: evaluation.value,
    valueType: decoded.valid ? (shouldEvaluate ? (evaluation.exists ? valueType(evaluation.value) : "missing") : "not evaluated") : "invalid pointer",
    decodedSegments: decoded.segments,
    message,
    depth: decoded.segments.length,
  };
}

function evaluatePointer(root: unknown, pointer: string): { exists: boolean; value: unknown; message: string } {
  const decoded = decodePointer(pointer);
  if (!decoded.valid) {
    return { exists: false, value: null, message: decoded.error };
  }

  if (decoded.segments.length === 0) {
    return { exists: true, value: root, message: "Empty pointer targets the whole document" };
  }

  let current = root;
  for (const segment of decoded.segments) {
    if (Array.isArray(current)) {
      if (segment === "-") {
        return { exists: false, value: null, message: 'The "-" token names the nonexistent position after the last array element.' };
      }
      if (!/^(0|[1-9]\d*)$/.test(segment)) {
        return { exists: false, value: null, message: `Segment "${segment}" is not a valid array index for this array.` };
      }
      const index = Number(segment);
      if (index >= current.length) {
        return { exists: false, value: null, message: `Array index ${index} is out of range.` };
      }
      current = current[index];
      continue;
    }

    if (current && typeof current === "object") {
      const obj = current as Record<string, unknown>;
      if (!Object.prototype.hasOwnProperty.call(obj, segment)) {
        return { exists: false, value: null, message: `Object member "${segment}" was not found.` };
      }
      current = obj[segment];
      continue;
    }

    return { exists: false, value: null, message: `Cannot continue through a ${valueType(current)} value.` };
  }

  return { exists: true, value: current, message: "Pointer matched a value" };
}

function decodePointer(pointer: string): {
  valid: boolean;
  segments: string[];
  error: string;
  normalized: string;
  fromFragment: boolean;
} {
  let normalized = pointer;
  let fromFragment = false;

  if (pointer.startsWith("#")) {
    fromFragment = true;
    try {
      normalized = decodeURIComponent(pointer.slice(1));
    } catch {
      return {
        valid: false,
        segments: [],
        error: "The URI-fragment form contains malformed percent-encoding.",
        normalized: pointer,
        fromFragment,
      };
    }
  }

  if (normalized === "") {
    return { valid: true, segments: [], error: "", normalized, fromFragment };
  }

  if (!normalized.startsWith("/")) {
    return {
      valid: false,
      segments: [],
      error: fromFragment
        ? "After percent-decoding, a JSON Pointer fragment must be empty or start with /."
        : "A JSON Pointer must be empty or start with /.",
      normalized,
      fromFragment,
    };
  }

  const rawSegments = normalized.slice(1).split("/");
  const segments: string[] = [];

  for (const raw of rawSegments) {
    let decoded = "";
    for (let index = 0; index < raw.length; index += 1) {
      const char = raw[index];
      if (char !== "~") {
        decoded += char;
        continue;
      }

      const next = raw[index + 1];
      if (next === "0") {
        decoded += "~";
        index += 1;
      } else if (next === "1") {
        decoded += "/";
        index += 1;
      } else {
        return {
          valid: false,
          segments,
          error: `Invalid escape "~${next ?? ""}". JSON Pointer only defines ~0 for tilde and ~1 for slash.`,
          normalized,
          fromFragment,
        };
      }
    }
    segments.push(decoded);
  }

  return { valid: true, segments, error: "", normalized, fromFragment };
}

function generatePointers(
  value: unknown,
  currentPointer: string,
  leafOnly: boolean,
  maxPointers: number,
): { pointers: string[]; truncated: boolean } {
  const pointers: string[] = [];
  let truncated = false;

  const visit = (current: unknown, pointer: string) => {
    if (pointers.length >= maxPointers) {
      truncated = true;
      return;
    }

    const children = getPointerChildren(current);
    if (!leafOnly || children.length === 0) {
      pointers.push(pointer);
      if (pointers.length >= maxPointers && children.length > 0) {
        truncated = true;
        return;
      }
    }

    for (const child of children) {
      if (pointers.length >= maxPointers) {
        truncated = true;
        return;
      }
      visit(child.value, `${pointer}/${encodePointerSegment(child.segment)}`);
      if (truncated && pointers.length >= maxPointers) return;
    }
  };

  visit(value, currentPointer);
  return { pointers, truncated };
}

function getPointerChildren(value: unknown): Array<{ segment: string; value: unknown }> {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({ segment: String(index), value: item }));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([key, item]) => ({ segment: key, value: item }));
  }
  return [];
}

function encodePointerSegment(segment: string) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

function compareCodeUnits(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function buildPointerIssues(results: PointerResult[], options: {
  warnInvalidEscapes: boolean;
  warnArrayIndexes: boolean;
  warnEmptyPointer: boolean;
}, generatedTruncated: boolean): Issue[] {
  const issues: Issue[] = [];
  const invalid = results.filter((result) => result.valueType === "invalid pointer");
  const missing = results.filter((result) => !result.exists && result.valueType === "missing");

  if (invalid.length && options.warnInvalidEscapes) {
    issues.push({
      severity: "high",
      title: "Pointer syntax cannot be evaluated",
      message: `${invalid.length} pointer${invalid.length === 1 ? "" : "s"} contain invalid JSON Pointer syntax, tilde escaping, or URI-fragment encoding.`,
    });
  }

  if (missing.length) {
    issues.push({
      severity: "warning",
      title: "Some pointers do not resolve",
      message: `${missing.length} evaluated pointer${missing.length === 1 ? "" : "s"} did not identify a concrete value in the pasted JSON.`,
    });
  }

  if (options.warnArrayIndexes && results.some((result) => result.decodedSegments.some((segment) => /^(0|[1-9]\d*)$/.test(segment)))) {
    issues.push({
      severity: "info",
      title: "Numeric tokens depend on the current container",
      message: "A numeric token is an array index only while traversing an array; against an object it remains an ordinary member name.",
    });
  }

  if (options.warnEmptyPointer && results.some((result) => {
    const decoded = decodePointer(result.pointer);
    return decoded.valid && decoded.segments.length === 0;
  })) {
    issues.push({
      severity: "info",
      title: "Root value selected",
      message: "The empty JSON Pointer, or # in URI-fragment form, identifies the entire JSON document.",
    });
  }

  if (generatedTruncated) {
    issues.push({
      severity: "warning",
      title: "Generated pointer list was capped",
      message: "The document contains more addressable paths than the current generation limit. Narrow the JSON or disable the 300-pointer cap for a larger local pass.",
    });
  }

  return issues;
}

function formatOutput(results: PointerResult[], issues: Issue[], options: {
  outputMode: OutputMode;
  missingMode: MissingMode;
  prettyPrintValues: boolean;
  includePointerSegments: boolean;
}, parsed: unknown, hasDocument: boolean) {
  if (options.outputMode === "value") {
    if (!hasDocument) {
      return results.map((item) => {
        if (item.valueType === "invalid pointer") return `${item.pointer || "(root)"}: Invalid — ${item.message}`;
        const tokens = item.decodedSegments.length ? item.decodedSegments.map((segment) => JSON.stringify(segment)).join(", ") : "(root)";
        return `${item.pointer || "(root)"}: ${tokens}`;
      }).join("\n");
    }

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
      jsonShape: hasDocument ? jsonShape(parsed) : "not included",
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
      lines.push(
        "",
        "Decoded tokens:",
        ...results.map((item) => `- ${escapeMarkdown(item.pointer || "(root)")}: ${item.decodedSegments.length ? item.decodedSegments.map((segment) => escapeMarkdown(JSON.stringify(segment))).join(", ") : "(root)"}`),
      );
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
    "# JSON Pointer check",
    "",
    `- [${results.length ? "x" : " "}] Processed ${results.length} pointer${results.length === 1 ? "" : "s"}.`,
    `- [${results.every((item) => item.exists || item.valueType === "not evaluated") ? "x" : " "}] Every evaluated pointer resolved to a concrete value.`,
    `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] Pointer syntax passed the high-severity checks.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
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

  if (result.pointerCount > 1000) {
    notes.push({
      severity: "info",
      title: "Large pointer result set",
      message: "JSON or CSV output is easier to review than a long on-page table when the document exposes many paths.",
    });
  }

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large generated report",
      message: "The output is large enough that copying it into another editor may take noticeable browser memory.",
    });
  }

  return notes;
}

function findJsonDataRisk(text: string): string | null {
  let index = 0;

  const skipWhitespace = () => {
    while (index < text.length && /\s/.test(text[index])) index += 1;
  };

  const parseString = (): string => {
    const start = index;
    index += 1;
    while (index < text.length) {
      const char = text[index];
      if (char === "\\") {
        index += 2;
        continue;
      }
      if (char === '"') {
        index += 1;
        return JSON.parse(text.slice(start, index)) as string;
      }
      index += 1;
    }
    throw new Error("syntax");
  };

  const parseNumber = () => {
    const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error("syntax");
    const token = match[0];
    index += token.length;
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new Error("A JSON number is outside JavaScript's finite numeric range, so its matched value would not survive browser parsing faithfully.");
    }
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new Error(`JSON integer ${token} cannot be represented exactly by JavaScript. Represent it as a string before evaluating exact values.`);
    }
    if (Object.is(value, -0)) {
      throw new Error("JSON number -0 can be serialized back as 0. Represent it as a string if the sign distinction matters.");
    }
  };

  const parseValue = (depth: number): void => {
    if (depth > 200) throw new Error("JSON nesting is deeper than 200 levels, which is unsafe for this browser-side pointer walk.");
    skipWhitespace();
    const char = text[index];

    if (char === "{") {
      index += 1;
      skipWhitespace();
      const names = new Set<string>();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      while (index < text.length) {
        skipWhitespace();
        if (text[index] !== '"') throw new Error("syntax");
        const name = parseString();
        if (names.has(name)) {
          throw new Error(`Duplicate object member "${name}" makes RFC 6901 evaluation undefined for that member. Remove or rename the duplicate first.`);
        }
        names.add(name);
        skipWhitespace();
        if (text[index] !== ":") throw new Error("syntax");
        index += 1;
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "}") {
          index += 1;
          return;
        }
        if (text[index] !== ",") throw new Error("syntax");
        index += 1;
      }
      throw new Error("syntax");
    }

    if (char === "[") {
      index += 1;
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      while (index < text.length) {
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "]") {
          index += 1;
          return;
        }
        if (text[index] !== ",") throw new Error("syntax");
        index += 1;
      }
      throw new Error("syntax");
    }

    if (char === '"') {
      parseString();
      return;
    }

    if (char === "-" || (char >= "0" && char <= "9")) {
      parseNumber();
      return;
    }

    if (text.slice(index, index + 4) === "true" || text.slice(index, index + 4) === "null") {
      index += 4;
      return;
    }
    if (text.slice(index, index + 5) === "false") {
      index += 5;
      return;
    }
    throw new Error("syntax");
  };

  try {
    parseValue(0);
    return null;
  } catch (error) {
    if (error instanceof Error && error.message !== "syntax") return error.message;
    return null;
  }
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function issueCardClass(severity: Issue["severity"]) {
  if (severity === "high") return "self-start rounded-xl border border-red-200 bg-red-50 p-4";
  if (severity === "warning") return "self-start rounded-xl border border-amber-200 bg-amber-50 p-4";
  return "self-start rounded-xl border border-gray-200 bg-gray-50 p-4";
}

function issueTitleClass(severity: Issue["severity"]) {
  if (severity === "high") return "text-sm font-semibold text-red-900";
  if (severity === "warning") return "text-sm font-semibold text-amber-900";
  return "text-sm font-semibold text-gray-900";
}

function issueTextClass(severity: Issue["severity"]) {
  if (severity === "high") return "mt-1 text-sm leading-6 text-red-800";
  if (severity === "warning") return "mt-1 text-sm leading-6 text-amber-800";
  return "mt-1 text-sm leading-6 text-gray-600";
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#d9a928]"
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

