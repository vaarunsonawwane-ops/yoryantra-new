"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ExtractedPath = {
  key: string | null;
  path: string;
  types: string[];
  depth: number;
  source: "property" | "array-item";
};

type OutputMode = "detailed" | "paths" | "unique";

const MAX_VISITS = 25000;
const MAX_DEPTH = 120;

const sampleJson = `{
  "user": {
    "id": 101,
    "name": "Sneha",
    "profile.name": "editor",
    "skills": ["JSON", "APIs", "Debugging"]
  },
  "teams": [
    { "id": 1, "name": "Platform" },
    { "id": 2, "name": "Search" }
  ],
  "settings": {
    "notifications": {}
  }
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleJson);
  const [includeArrayIndexes, setIncludeArrayIndexes] = useState(false);
  const [includeLeafOnly, setIncludeLeafOnly] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>("detailed");
  const [output, setOutput] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const extractKeys = () => {
    if (!input.trim()) {
      setError("Enter JSON before extracting its structure.");
      clearResult();
      return;
    }

    try {
      const parsed: unknown = JSON.parse(input);
      if (!isContainer(parsed)) {
        throw new Error("Key extraction needs a JSON object or array. A primitive root has no member names.");
      }

      const extracted = collectPaths(parsed, {
        includeArrayIndexes,
        includeLeafOnly,
      });

      if (extracted.length === 0) {
        throw new Error(
          includeLeafOnly
            ? "No terminal fields were found in this JSON structure."
            : "No object keys or array-item paths were found."
        );
      }

      setOutput(formatOutput(extracted, outputMode));
      setSummary(buildSummary(extracted));
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to inspect this JSON input.");
      clearResult();
    }
  };

  const clearResult = () => {
    setOutput("");
    setSummary("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the extracted text and copy it manually.");
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(sampleJson);
    setIncludeArrayIndexes(false);
    setIncludeLeafOnly(false);
    setOutputMode("detailed");
    clearResult();
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setIncludeArrayIndexes(false);
    setIncludeLeafOnly(false);
    setOutputMode("detailed");
    clearResult();
    setError("");
  };

  return (
    <ToolShell
      title="JSON Key Extractor"
      description="List JSON member names, escaped paths, value types, and array-aware structure."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          JSON Input
        </label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
            setError("");
          }}
          spellCheck={false}
          placeholder={sampleJson}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Arrays are shown with <code>[]</code> placeholders by default, so repeated item shapes collapse into one readable path.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">What to include</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeArrayIndexes}
              onChange={(event) => {
                setIncludeArrayIndexes(event.target.checked);
                clearResult();
                setError("");
              }}
              className="mt-1 shrink-0 h-4 w-4 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Show exact array indexes</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Write <code>users[0].name</code> instead of the shape-style <code>users[].name</code>.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeLeafOnly}
              onChange={(event) => {
                setIncludeLeafOnly(event.target.checked);
                clearResult();
                setError("");
              }}
              className="mt-1 shrink-0 h-4 w-4 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Terminal fields only</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Skip non-empty parent containers; empty objects and arrays still count as terminal values.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-gray-700">Output view</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Detailed", value: "detailed" },
              { label: "Paths Only", value: "paths" },
              { label: "Unique Key Names", value: "unique" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setOutputMode(option.value as OutputMode);
                  clearResult();
                  setError("");
                }}
                className={`${
                  outputMode === option.value ? "yoryantra-btn" : "yoryantra-btn-outline"
                } min-h-10 whitespace-nowrap`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={extractKeys} className="yoryantra-btn min-h-10 whitespace-nowrap">
          Extract Structure
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline min-h-10 whitespace-nowrap">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline min-h-10 whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          {summary}
        </div>
      )}

      <div className="mt-8 min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Extracted Structure</h3>
          {output && (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[290px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "JSON paths and key details will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Structure extraction runs in your browser. The page does not send the JSON you paste to a processing API.
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        <strong>Path-format caution:</strong> <code>users[].name</code> and escaped dot paths are readable conventions, not JSON Pointer or JSONPath. For a standardized pointer syntax, see{" "}
        <a href="https://www.rfc-editor.org/rfc/rfc6901" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
          RFC 6901
        </a>.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A field list should describe shape without pretending arrays are objects
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            API payloads often repeat the same object shape inside arrays. Writing <code>users.name</code> hides that boundary, while printing every index creates hundreds of near-identical paths. The default <code>users[].name</code> form keeps the array visible and collapses repeated item structure.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Turn on exact indexes when position matters during debugging. Then the same data becomes <code>users[0].name</code>, <code>users[1].name</code>, and so on.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Keys containing dots or brackets need escaping
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A real JSON member may be named <code>profile.name</code>. Without escaping, that looks identical to a nested <code>profile</code> object containing <code>name</code>. Property-name dots, brackets, and backslashes are therefore escaped in the displayed path.
          </p>
          <div className="mt-4 self-start rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <code>{`{"profile.name":"editor"}`}</code>
            <span className="mx-2 text-gray-400">→</span>
            <code>$.profile\.name</code>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            “Unique key names” answers a different question from “paths”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A member called <code>id</code> may appear under users, orders, and teams. The unique-key view lists <code>id</code> once; the path view keeps each location. Detailed output adds the observed value type and depth, including union-like type summaries when an index-free array path holds mixed value types.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Empty objects and arrays remain visible as terminal fields. That matters in schema reconnaissance because an empty container is still a real value, not the same thing as a missing member.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JSON defines the data model; pointer syntaxes are separate layers
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <a href="https://www.rfc-editor.org/rfc/rfc8259" target="_blank" rel="noreferrer" className="font-medium text-gray-800 underline underline-offset-2">RFC 8259</a> defines JSON objects, arrays, member names, values, and interoperability rules. It does not define dot notation. <a href="https://www.rfc-editor.org/rfc/rfc6901" target="_blank" rel="noreferrer" className="font-medium text-gray-800 underline underline-offset-2">RFC 6901</a> defines JSON Pointer when a standards-based address for a specific JSON value is required.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Boundaries to keep in mind with generated field inventories
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Observed types describe the pasted sample, not every value an API may return later.</li>
            <li>Duplicate object member names are resolved by the browser&apos;s JSON parser before extraction; interoperable JSON should use unique names.</li>
            <li>Index-free array paths intentionally merge repeated shapes and may show more than one observed type for the same path.</li>
            <li>Traversal stops beyond {MAX_VISITS.toLocaleString()} visited values or {MAX_DEPTH} nested levels so an unusually large payload cannot lock the page indefinitely.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-key-extractor" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function collectPaths(
  value: unknown,
  options: { includeArrayIndexes: boolean; includeLeafOnly: boolean }
): ExtractedPath[] {
  const rows = new Map<string, ExtractedPath>();
  const state = { visits: 0 };

  const addRow = (
    key: string | null,
    path: string,
    type: string,
    depth: number,
    source: "property" | "array-item"
  ) => {
    const identity = `${source}\u0000${key === null ? "" : key}\u0000${path}`;
    const existing = rows.get(identity);
    if (existing) {
      if (!existing.types.includes(type)) existing.types.push(type);
      return;
    }
    rows.set(identity, { key, path, types: [type], depth, source });
  };

  const countValue = () => {
    state.visits += 1;
    if (state.visits > MAX_VISITS) {
      throw new Error(`This JSON exceeds the ${MAX_VISITS.toLocaleString()}-value extraction limit.`);
    }
  };

  const visit = (current: unknown, path: string, depth: number) => {
    if (depth > MAX_DEPTH) {
      throw new Error(`This JSON exceeds the ${MAX_DEPTH}-level nesting limit.`);
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        countValue();
        const itemPath = options.includeArrayIndexes ? `${path}[${index}]` : `${path}[]`;
        const type = getValueType(item);
        const terminal = !isContainer(item) || isEmptyContainer(item);

        if (terminal || !options.includeLeafOnly) {
          addRow(null, itemPath, type, depth + 1, "array-item");
        }
        if (isContainer(item) && !isEmptyContainer(item)) {
          visit(item, itemPath, depth + 1);
        }
      });
      return;
    }

    if (isPlainObject(current)) {
      Object.entries(current).forEach(([key, item]) => {
        countValue();
        const nextPath = `${path}.${escapePathSegment(key)}`;
        const type = getValueType(item);
        const terminal = !isContainer(item) || isEmptyContainer(item);

        if (terminal || !options.includeLeafOnly) {
          addRow(key, nextPath, type, depth + 1, "property");
        }
        if (isContainer(item) && !isEmptyContainer(item)) {
          visit(item, nextPath, depth + 1);
        }
      });
    }
  };

  countValue();
  visit(value, "$", 0);
  return Array.from(rows.values()).map((row) => ({
    ...row,
    types: row.types.slice().sort(compareText),
  }));
}

function formatOutput(rows: ExtractedPath[], mode: OutputMode) {
  if (mode === "paths") {
    return Array.from(new Set(rows.map((row) => row.path))).sort(compareText).join("\n");
  }

  if (mode === "unique") {
    return Array.from(
      new Set(rows.filter((row) => row.key !== null).map((row) => row.key as string))
    )
      .sort(compareText)
      .join("\n");
  }

  return rows
    .slice()
    .sort((a, b) => compareText(a.path, b.path))
    .map((row) => {
      const lines = [
        row.path,
        `  source: ${row.source === "property" ? "object member" : "array item"}`,
        `  type: ${row.types.join(" | ")}`,
        `  depth: ${row.depth}`,
      ];
      if (row.key !== null) lines.splice(1, 0, `  key: ${row.key}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

function buildSummary(rows: ExtractedPath[]) {
  const distinctPaths = new Set(rows.map((row) => row.path)).size;
  const uniqueKeys = new Set(
    rows.filter((row) => row.key !== null).map((row) => row.key as string)
  ).size;
  const maxDepth = rows.reduce((max, row) => Math.max(max, row.depth), 0);
  return `${distinctPaths} distinct path${distinctPaths === 1 ? "" : "s"}, ${uniqueKeys} unique object key name${uniqueKeys === 1 ? "" : "s"}, maximum observed depth ${maxDepth}.`;
}

function escapePathSegment(segment: string) {
  return segment.replace(/[\\.\[\]]/g, (character) => `\\${character}`);
}

function getValueType(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function isEmptyContainer(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}

function isContainer(value: unknown): value is unknown[] | Record<string, unknown> {
  return Array.isArray(value) || isPlainObject(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function compareText(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
