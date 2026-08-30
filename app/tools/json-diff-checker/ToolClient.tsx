"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type DiffKind = "added" | "removed" | "changed" | "type-changed";

type DiffEntry = {
  kind: DiffKind;
  path: string;
  left?: JsonValue;
  right?: JsonValue;
};

type ComparisonResult = {
  text: string;
  entries: DiffEntry[];
  truncated: boolean;
};

const MAX_DIFFS = 500;
const leftExample = `{
  "user": { "name": "Asha", "active": true },
  "roles": ["editor", "reviewer"],
  "version": 1
}`;
const rightExample = `{
  "version": 2,
  "roles": ["editor", "admin"],
  "user": { "active": true, "name": "Asha", "timezone": "Asia/Kolkata" }
}`;

export default function ToolClient() {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const compareJSON = () => {
    try {
      const left = parseJson(leftInput, "Left");
      const right = parseJson(rightInput, "Right");
      const entries: DiffEntry[] = [];
      const state = { truncated: false };

      collectDiffs(left, right, "$", entries, state);

      const text = buildDiffText(entries, state.truncated);
      setResult({ text, entries, truncated: state.truncated });
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to compare these JSON values.");
      setResult(null);
    }
  };

  const loadExample = () => {
    setLeftInput(leftExample);
    setRightInput(rightExample);
    clearResult();
  };

  const resetAll = () => {
    setLeftInput("");
    setRightInput("");
    clearResult();
  };

  const copyOutput = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const counts = countKinds(result?.entries || []);

  return (
    <ToolShell
      title="JSON Diff Checker"
      description="Compare JSON structurally by path. Object key order and whitespace are ignored, while array order remains significant. See added, removed, changed, and type-changed values without relying on line positions."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <JsonEditor
          label="Left JSON"
          value={leftInput}
          placeholder="Paste the first JSON value here..."
          onChange={(value) => {
            setLeftInput(value);
            clearResult();
          }}
        />
        <JsonEditor
          label="Right JSON"
          value={rightInput}
          placeholder="Paste the second JSON value here..."
          onChange={(value) => {
            setRightInput(value);
            clearResult();
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={compareJSON} className="yoryantra-btn">Compare JSON</button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Structural Differences</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Paths use a JavaScript-like <code>$["key"]</code> notation so keys containing spaces or punctuation remain unambiguous.
                </p>
              </div>
              <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
                {copied ? "Copied" : "Copy Result"}
              </button>
            </div>

            <pre className="mt-4 yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {result.text}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Differences shown" value={result.entries.length.toLocaleString()} />
            <StatCard label="Added / removed" value={`${counts.added.toLocaleString()} / ${counts.removed.toLocaleString()}`} />
            <StatCard label="Changed values" value={counts.changed.toLocaleString()} />
            <StatCard label="Type changes" value={counts.typeChanged.toLocaleString()} />
          </div>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Compare JSON Data, Not Pretty-Printed Line Numbers</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON objects are unordered collections of name/value pairs, while arrays are ordered sequences. That means changing the order of object keys should not create a data difference, but moving values inside an array can. This checker parses both inputs and compares their structure recursively instead of comparing formatted lines.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Differences are reported at the smallest useful path: a missing property is added or removed, a primitive value is changed, and a switch such as string-to-number is reported as a type change. Root primitives and arrays are supported as well as objects.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the Comparison Intentionally Ignores</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Whitespace and indentation do not matter after JSON parsing.</li>
            <li>Object member order does not matter; RFC 8259 defines an object as unordered.</li>
            <li>Different numeric spellings that parse to the same JavaScript number, such as <code>1</code> and <code>1.0</code>, compare as the same value.</li>
            <li>Very large numbers are subject to JavaScript number precision limits after parsing; use the JSON Validator when numeric-token fidelity matters.</li>
            <li>Array order does matter, so reordering an array can produce several index-level differences.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Important JSON Parser Limitation</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 8259 says object member names should be unique, but JSON parsers differ when duplicates exist. This browser tool uses <code>JSON.parse</code>, which exposes the final parsed object rather than every duplicate member occurrence. Use the JSON Validator when you need duplicate-key diagnostics before comparing two documents.
          </p>
          {result?.truncated ? (
            <p className="mt-4 text-sm leading-relaxed text-amber-700">
              This comparison reached the display limit of {MAX_DIFFS.toLocaleString()} differences. The result is intentionally truncated to keep the page responsive.
            </p>
          ) : null}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-diff-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function parseJson(input: string, label: string): JsonValue {
  if (input.trim().length === 0) throw new Error(`${label} JSON is empty.`);
  try {
    return JSON.parse(input) as JsonValue;
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Invalid JSON.";
    throw new Error(`${label} JSON is invalid: ${detail}`);
  }
}

function collectDiffs(
  left: JsonValue,
  right: JsonValue,
  path: string,
  entries: DiffEntry[],
  state: { truncated: boolean }
) {
  if (entries.length >= MAX_DIFFS) {
    state.truncated = true;
    return;
  }

  const leftType = jsonType(left);
  const rightType = jsonType(right);

  if (leftType !== rightType) {
    entries.push({ kind: "type-changed", path, left, right });
    return;
  }

  if (leftType === "array") {
    const leftArray = left as JsonValue[];
    const rightArray = right as JsonValue[];
    const maxLength = Math.max(leftArray.length, rightArray.length);

    for (let index = 0; index < maxLength; index += 1) {
      if (entries.length >= MAX_DIFFS) {
        state.truncated = true;
        return;
      }
      const nextPath = `${path}[${index}]`;
      if (index >= leftArray.length) entries.push({ kind: "added", path: nextPath, right: rightArray[index] });
      else if (index >= rightArray.length) entries.push({ kind: "removed", path: nextPath, left: leftArray[index] });
      else collectDiffs(leftArray[index], rightArray[index], nextPath, entries, state);
    }
    return;
  }

  if (leftType === "object") {
    const leftObject = left as { [key: string]: JsonValue };
    const rightObject = right as { [key: string]: JsonValue };
    const keys = Array.from(new Set([...Object.keys(leftObject), ...Object.keys(rightObject)])).sort();

    for (const key of keys) {
      if (entries.length >= MAX_DIFFS) {
        state.truncated = true;
        return;
      }
      const nextPath = `${path}[${JSON.stringify(key)}]`;
      const inLeft = Object.prototype.hasOwnProperty.call(leftObject, key);
      const inRight = Object.prototype.hasOwnProperty.call(rightObject, key);
      if (!inLeft) entries.push({ kind: "added", path: nextPath, right: rightObject[key] });
      else if (!inRight) entries.push({ kind: "removed", path: nextPath, left: leftObject[key] });
      else collectDiffs(leftObject[key], rightObject[key], nextPath, entries, state);
    }
    return;
  }

  if (left !== right) entries.push({ kind: "changed", path, left, right });
}

function jsonType(value: JsonValue) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value === "object" ? "object" : typeof value;
}

function buildDiffText(entries: DiffEntry[], truncated: boolean) {
  if (entries.length === 0) {
    return "No structural differences found.\n\nWhitespace and object-member order are ignored. Array order remains significant.";
  }

  const blocks = entries.map((entry, index) => {
    const heading = `${index + 1}. ${entry.kind.toUpperCase()} ${entry.path}`;
    if (entry.kind === "added") return `${heading}\n   Right: ${formatPreview(entry.right)}`;
    if (entry.kind === "removed") return `${heading}\n   Left:  ${formatPreview(entry.left)}`;
    return `${heading}\n   Left:  ${formatPreview(entry.left)}\n   Right: ${formatPreview(entry.right)}`;
  });

  if (truncated) blocks.push(`Comparison stopped after ${MAX_DIFFS.toLocaleString()} differences to keep the browser responsive.`);
  return blocks.join("\n\n");
}

function formatPreview(value: JsonValue | undefined) {
  const rendered = JSON.stringify(value);
  if (rendered === undefined) return "undefined";
  return rendered.length > 280 ? `${rendered.slice(0, 277)}...` : rendered;
}

function countKinds(entries: DiffEntry[]) {
  return entries.reduce(
    (counts, entry) => {
      if (entry.kind === "added") counts.added += 1;
      else if (entry.kind === "removed") counts.removed += 1;
      else if (entry.kind === "type-changed") counts.typeChanged += 1;
      else counts.changed += 1;
      return counts;
    },
    { added: 0, removed: 0, changed: 0, typeChanged: 0 }
  );
}

function JsonEditor({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <label className="block mb-2 text-sm font-semibold text-gray-900">{label}</label>
      <textarea
        value={value}
        onChange={(event: { target: { value: string } }) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
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
