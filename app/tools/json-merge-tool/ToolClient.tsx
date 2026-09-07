"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type MergeMode = "deep" | "shallow" | "leftOnly" | "rightOnly";
type ConflictMode = "rightWins" | "leftWins" | "keepBoth" | "reportOnly";
type ArrayMode = "replace" | "concat" | "uniqueConcat" | "mergeByIndex";
type OutputMode = "merged" | "summary" | "report" | "json" | "markdown";

type MergeConflict = {
  path: string;
  leftValue: unknown;
  rightValue: unknown;
  resolution: string;
};

type MergeIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type MergeResult = {
  merged: unknown;
  conflicts: MergeConflict[];
  issues: MergeIssue[];
  output: string;
  leftSize: number;
  rightSize: number;
  mergedSize: number;
  conflictCount: number;
  addedKeys: number;
  overwrittenKeys: number;
  arrayMerges: number;
};

const MAX_INPUT_CHARS = 1_500_000;
const MAX_JSON_DEPTH = 100;

const sampleLeft = `{
  "name": "Yoryantra",
  "settings": {
    "theme": "light",
    "features": ["json", "csv"]
  },
  "limits": { "maxTools": 150 }
}`;

const sampleRight = `{
  "settings": {
    "theme": "dark",
    "features": ["seo", "devops"],
    "layout": "clean"
  },
  "limits": { "maxTools": 250 },
  "published": true
}`;

export default function ToolClient() {
  const [leftJson, setLeftJson] = useState("");
  const [rightJson, setRightJson] = useState("");
  const [mergeMode, setMergeMode] = useState<MergeMode>("deep");
  const [conflictMode, setConflictMode] = useState<ConflictMode>("rightWins");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("replace");
  const [outputMode, setOutputMode] = useState<OutputMode>("merged");
  const [prettyOutput, setPrettyOutput] = useState(true);
  const [sortKeys, setSortKeys] = useState(false);
  const [includeConflictReport, setIncludeConflictReport] = useState(true);
  const [ignoreNullValues, setIgnoreNullValues] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getMergeNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const mergeJson = () => {
    if (!leftJson.trim() || !rightJson.trim()) {
      setError("Enter both JSON values before merging.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildMergeResult(leftJson, rightJson, {
        mergeMode,
        conflictMode,
        arrayMode,
        outputMode,
        prettyOutput,
        sortKeys,
        includeConflictReport,
        ignoreNullValues,
      });
      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The merge could not be completed.");
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setLeftJson(sampleLeft);
    setRightJson(sampleRight);
    setMergeMode("deep");
    setConflictMode("rightWins");
    setArrayMode("replace");
    setOutputMode("merged");
    setPrettyOutput(true);
    setSortKeys(false);
    setIncludeConflictReport(true);
    setIgnoreNullValues(false);
    clearResult();
  };

  const resetAll = () => {
    setLeftJson("");
    setRightJson("");
    setMergeMode("deep");
    setConflictMode("rightWins");
    setArrayMode("replace");
    setOutputMode("merged");
    setPrettyOutput(true);
    setSortKeys(false);
    setIncludeConflictReport(true);
    setIgnoreNullValues(false);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Merge Tool"
      description="Combine two JSON values with explicit rules for collisions, arrays, and nulls."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <JsonInputCard
          label="Left JSON — base"
          value={leftJson}
          onChange={(value) => {
            setLeftJson(value);
            clearResult();
          }}
          placeholder={sampleLeft}
          hint="Values from this side remain unless the selected merge policy replaces or combines them."
        />
        <JsonInputCard
          label="Right JSON — incoming"
          value={rightJson}
          onChange={(value) => {
            setRightJson(value);
            clearResult();
          }}
          placeholder={sampleRight}
          hint="This side supplies added keys and the competing value when a path exists on both sides."
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Choose what a collision means</h3>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Object merge"
            value={mergeMode}
            onChange={(value) => {
              setMergeMode(value as MergeMode);
              clearResult();
            }}
            options={[
              { label: "Deep merge nested objects", value: "deep" },
              { label: "Shallow top-level merge", value: "shallow" },
              { label: "Return left value only", value: "leftOnly" },
              { label: "Return right value only", value: "rightOnly" },
            ]}
          />
          <YoryantraSelect
            label="Non-array conflicts"
            value={conflictMode}
            onChange={(value) => {
              setConflictMode(value as ConflictMode);
              clearResult();
            }}
            options={[
              { label: "Use right value", value: "rightWins" },
              { label: "Keep left value", value: "leftWins" },
              { label: "Keep both in an array", value: "keepBoth" },
              { label: "Report and keep left", value: "reportOnly" },
            ]}
          />
          <YoryantraSelect
            label="When both values are arrays"
            value={arrayMode}
            onChange={(value) => {
              setArrayMode(value as ArrayMode);
              clearResult();
            }}
            options={[
              { label: "Use right array", value: "replace" },
              { label: "Append right array", value: "concat" },
              { label: "Append unique values", value: "uniqueConcat" },
              { label: "Merge corresponding indexes", value: "mergeByIndex" },
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
              { label: "Merged JSON", value: "merged" },
              { label: "Short summary", value: "summary" },
              { label: "Detailed merge report", value: "report" },
              { label: "Full JSON result", value: "json" },
              { label: "Conflict table in Markdown", value: "markdown" },
            ]}
          />
        </div>

        <div className="mt-5 grid items-start gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={prettyOutput} onChange={setPrettyOutput} label="Indent generated JSON" />
          <Toggle checked={sortKeys} onChange={setSortKeys} label="Sort object keys in generated output" />
          <Toggle checked={includeConflictReport} onChange={setIncludeConflictReport} label="Include path details in the report" />
          <Toggle checked={ignoreNullValues} onChange={setIgnoreNullValues} label="Ignore right-side null values" />
        </div>
      </div>

      {ignoreNullValues ? (
        <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Ignoring right-side nulls is a custom merge rule. It is not JSON Merge Patch behavior, where null has removal semantics for object members.
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={mergeJson} className="yoryantra-btn min-h-[44px] whitespace-nowrap">Merge JSON</button>
        <button type="button" onClick={copyOutput} disabled={!output} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50">
          {copied ? "Copied" : "Copy Output"}
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">Reset</button>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-7 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Conflicting paths" value={result.conflictCount.toLocaleString()} />
          <SummaryCard label="Added keys" value={result.addedKeys.toLocaleString()} />
          <SummaryCard label="Right overwrites" value={result.overwrittenKeys.toLocaleString()} />
          <SummaryCard label="Array merges" value={result.arrayMerges.toLocaleString()} />
        </div>
      ) : null}

      {result?.conflicts.length && includeConflictReport ? (
        <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Paths that competed</h3>
          <p className="mt-1 text-sm text-gray-500">Paths use JSON Pointer escaping; “(root)” means the top-level value itself.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Path</th>
                  <th className="px-4 py-3 font-semibold">Left</th>
                  <th className="px-4 py-3 font-semibold">Right</th>
                  <th className="px-4 py-3 font-semibold">Applied rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.conflicts.slice(0, 100).map((conflict, index) => (
                  <tr key={`${conflict.path}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{displayPath(conflict.path)}</td>
                    <td className="max-w-[260px] break-words px-4 py-3 font-mono text-xs">{stringifyShort(conflict.leftValue)}</td>
                    <td className="max-w-[260px] break-words px-4 py-3 font-mono text-xs">{stringifyShort(conflict.rightValue)}</td>
                    <td className="px-4 py-3">{conflict.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.conflicts.length > 100 ? (
            <p className="mt-3 text-sm text-gray-500">The table stops at 100 rows; detailed text or JSON output can carry the full conflict list.</p>
          ) : null}
        </div>
      ) : null}

      {result?.issues.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Merge consequences</h3>
          <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
            {result.issues.map((issue) => <IssueCard key={`${issue.title}-${issue.message}`} issue={issue} />)}
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Before using the result</h3>
          <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
            {notes.map((note) => (
              <div key={note.title} className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Output</h3>
            <p className="mt-1 text-sm text-gray-500">The selected merge result or report is shown as text, not executed content.</p>
          </div>
          <button type="button" onClick={copyOutput} disabled={!output} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm disabled:cursor-not-allowed disabled:opacity-50">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="mt-4 min-h-[300px] max-h-[560px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-gray-950 p-4 font-mono text-sm leading-6 text-gray-100">
          {output || "Choose the merge rules and run the merge to see the result."}
        </pre>
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Both inputs stay in the browser while this page is open. No server-side merge request is needed; still treat sensitive configuration, credentials, and production exports with the same care you would use in any browser tab.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">There is no single universal “deep merge” rule</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON defines objects, arrays, and primitive values, but it does not define a general-purpose operation for combining two arbitrary JSON documents. Libraries differ on whether nested objects recurse, whether arrays replace or append, what null means, and which side wins when types differ. The settings above make those choices visible instead of hiding them behind one unexplained merge button.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Deep and shallow merges answer different questions</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A shallow merge only examines members at the current object level. If both sides contain a nested object under the same key, that nested object is treated as one competing value. A deep merge descends into nested objects and only resolves a conflict when it reaches values that cannot be recursively combined under the selected rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Arrays are handled by their own policy even during a shallow merge. That distinction matters because an array is ordered data, not an object with mergeable member names. “Merge by index” assumes corresponding positions describe corresponding things; it is inappropriate for arrays whose order can change independently.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">This is deliberately not JSON Merge Patch</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7396 defines JSON Merge Patch for describing changes to a target document, especially in HTTP PATCH workflows. Its rules are specific: an object patch recurses into object members, a null patch member removes that member, and a non-object patch replaces the target value. The configurable deep, shallow, array, and keep-both behaviors here are broader comparison-and-combination rules, so the output should not be labelled <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">application/merge-patch+json</code>.{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc7396.html" target="_blank" rel="noreferrer">RFC 7396</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Conflict paths are JSON Pointers, not property expressions</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Report paths escape <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">~</code> as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">~0</code> and <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">/</code> as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">~1</code>, following JSON Pointer syntax. The root pointer is the empty string, displayed here as “(root)” so it is not confused with <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">/</code>, which actually addresses a member whose name is empty.{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc6901.html" target="_blank" rel="noreferrer">RFC 6901</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON that parses can still be unsafe to rewrite</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Duplicate object names and precision-sensitive numbers are checked before either input is merged. Without that check, JavaScript parsing can collapse duplicate names or round a large numeric token before the merge logic ever sees it. The merge also writes object properties with data-property semantics so names such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">__proto__</code> remain ordinary JSON keys rather than altering an intermediate object&apos;s prototype.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 8259 recommends unique object member names and describes number-range interoperability limits. If exact decimal digits are identifiers or monetary values that must not be rounded, use strings or a decimal-aware pipeline instead of a generic JavaScript-number merge.{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc8259.html" target="_blank" rel="noreferrer">RFC 8259</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Know what the counters do and do not prove</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Added-key and overwrite counts describe decisions made by this merge implementation; they are not a semantic validation of your configuration or API contract. A technically clean merge can still be wrong for the application if two arrays should have been keyed by an ID, if null has domain meaning, or if one side belongs to a different schema version.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser limits</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Each input is capped at {MAX_INPUT_CHARS.toLocaleString()} characters and {MAX_JSON_DEPTH} nested JSON levels. The limits are there to keep recursive merging and report generation responsive. Large repository configuration sets are better merged in code where tests, schemas, and version control can verify the result.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-merge-tool" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildMergeResult(leftText: string, rightText: string, options: {
  mergeMode: MergeMode;
  conflictMode: ConflictMode;
  arrayMode: ArrayMode;
  outputMode: OutputMode;
  prettyOutput: boolean;
  sortKeys: boolean;
  includeConflictReport: boolean;
  ignoreNullValues: boolean;
}): MergeResult {
  if (leftText.length > MAX_INPUT_CHARS || rightText.length > MAX_INPUT_CHARS) {
    throw new Error(`Each JSON input must be ${MAX_INPUT_CHARS.toLocaleString()} characters or smaller.`);
  }

  const left = parseJsonInput(leftText, "left");
  const right = parseJsonInput(rightText, "right");
  const conflicts: MergeConflict[] = [];
  const counters = { addedKeys: 0, overwrittenKeys: 0, arrayMerges: 0 };

  let merged: unknown;
  if (options.mergeMode === "leftOnly") merged = left;
  else if (options.mergeMode === "rightOnly") merged = right;
  else if (options.mergeMode === "shallow") merged = shallowMerge(left, right, options, conflicts, counters);
  else merged = deepMerge(left, right, "", options, conflicts, counters);

  if (options.sortKeys) merged = sortObjectKeys(merged);

  const issues = getMergeIssues(conflicts, counters, options);
  const mergedString = stringifyJson(merged, options.prettyOutput);
  const base = {
    merged,
    conflicts,
    issues,
    leftSize: leftText.length,
    rightSize: rightText.length,
    mergedSize: mergedString.length,
    conflictCount: conflicts.length,
    addedKeys: counters.addedKeys,
    overwrittenKeys: counters.overwrittenKeys,
    arrayMerges: counters.arrayMerges,
  };
  return { ...base, output: formatOutput(base, options) };
}

function parseJsonInput(text: string, label: string) {
  assertLosslessJsonText(text, `${label[0].toUpperCase()}${label.slice(1)} JSON`);
  return JSON.parse(text) as unknown;
}

function shallowMerge(left: unknown, right: unknown, options: {
  conflictMode: ConflictMode;
  arrayMode: ArrayMode;
  ignoreNullValues: boolean;
}, conflicts: MergeConflict[], counters: Counters): unknown {
  if (options.ignoreNullValues && right === null) return left;
  if (Array.isArray(left) && Array.isArray(right)) return mergeArrays(left, right, "", options, conflicts, counters);

  if (!isPlainObject(left) || !isPlainObject(right)) {
    if (!valuesEqual(left, right)) addConflict(conflicts, counters, "", left, right, getConflictResolution(options.conflictMode), options.conflictMode === "rightWins");
    return valuesEqual(left, right) ? left : resolveConflict(left, right, options.conflictMode);
  }

  const result = copySafeObject(left as Record<string, unknown>);
  const rightObject = right as Record<string, unknown>;
  Object.keys(rightObject).forEach((key) => {
    const incoming = rightObject[key];
    if (options.ignoreNullValues && incoming === null) return;
    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      counters.addedKeys += 1;
      setOwn(result, key, incoming);
      return;
    }

    const existing = result[key];
    if (Array.isArray(existing) && Array.isArray(incoming)) {
      setOwn(result, key, mergeArrays(existing, incoming, joinPointer("", key), options, conflicts, counters));
      return;
    }
    if (!valuesEqual(existing, incoming)) {
      addConflict(conflicts, counters, joinPointer("", key), existing, incoming, getConflictResolution(options.conflictMode), options.conflictMode === "rightWins");
      setOwn(result, key, resolveConflict(existing, incoming, options.conflictMode));
    }
  });
  return result;
}

type Counters = { addedKeys: number; overwrittenKeys: number; arrayMerges: number };

function deepMerge(left: unknown, right: unknown, path: string, options: {
  conflictMode: ConflictMode;
  arrayMode: ArrayMode;
  ignoreNullValues: boolean;
}, conflicts: MergeConflict[], counters: Counters): unknown {
  if (options.ignoreNullValues && right === null) return left;
  if (Array.isArray(left) && Array.isArray(right)) return mergeArrays(left, right, path, options, conflicts, counters);

  if (isPlainObject(left) && isPlainObject(right)) {
    const result = copySafeObject(left as Record<string, unknown>);
    const rightObject = right as Record<string, unknown>;
    Object.keys(rightObject).forEach((key) => {
      const incoming = rightObject[key];
      if (options.ignoreNullValues && incoming === null) return;
      const childPath = joinPointer(path, key);
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        setOwn(result, key, deepMerge(result[key], incoming, childPath, options, conflicts, counters));
      } else {
        counters.addedKeys += 1;
        setOwn(result, key, incoming);
      }
    });
    return result;
  }

  if (!valuesEqual(left, right)) {
    addConflict(conflicts, counters, path, left, right, getConflictResolution(options.conflictMode), options.conflictMode === "rightWins");
    return resolveConflict(left, right, options.conflictMode);
  }
  return left;
}

function mergeArrays(left: unknown[], right: unknown[], path: string, options: {
  conflictMode: ConflictMode;
  arrayMode: ArrayMode;
  ignoreNullValues: boolean;
}, conflicts: MergeConflict[], counters: Counters) {
  counters.arrayMerges += 1;

  if (options.arrayMode === "concat") return [...left, ...right];
  if (options.arrayMode === "uniqueConcat") {
    const seen = new Set<string>();
    const merged: unknown[] = [];
    [...left, ...right].forEach((item) => {
      const key = stableStringify(item);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    });
    return merged;
  }
  if (options.arrayMode === "mergeByIndex") {
    const merged: unknown[] = [];
    const max = Math.max(left.length, right.length);
    for (let index = 0; index < max; index += 1) {
      if (index >= left.length) {
        counters.addedKeys += 1;
        merged[index] = right[index];
      } else if (index >= right.length) {
        merged[index] = left[index];
      } else {
        merged[index] = deepMerge(left[index], right[index], `${path}/${index}`, options, conflicts, counters);
      }
    }
    return merged;
  }

  if (!valuesEqual(left, right)) {
    addConflict(conflicts, counters, path, left, right, "right array used by array policy", true);
  }
  return right;
}

function addConflict(conflicts: MergeConflict[], counters: Counters, path: string, leftValue: unknown, rightValue: unknown, resolution: string, overwritten: boolean) {
  conflicts.push({ path, leftValue, rightValue, resolution });
  if (overwritten) counters.overwrittenKeys += 1;
}

function resolveConflict(left: unknown, right: unknown, mode: ConflictMode) {
  if (mode === "leftWins" || mode === "reportOnly") return left;
  if (mode === "keepBoth") return [left, right];
  return right;
}

function getConflictResolution(mode: ConflictMode) {
  if (mode === "leftWins") return "left value kept";
  if (mode === "keepBoth") return "both values wrapped in an array";
  if (mode === "reportOnly") return "reported; left value kept";
  return "right value used";
}

function getMergeIssues(conflicts: MergeConflict[], counters: Counters, options: {
  mergeMode: MergeMode;
  conflictMode: ConflictMode;
  arrayMode: ArrayMode;
  ignoreNullValues: boolean;
}): MergeIssue[] {
  const issues: MergeIssue[] = [];
  if (conflicts.length) {
    issues.push({ severity: "info", title: "Competing values were resolved", message: `${conflicts.length} path${conflicts.length === 1 ? "" : "s"} had different values on both sides.` });
  }
  if (options.conflictMode === "reportOnly" && conflicts.length) {
    issues.push({ severity: "warning", title: "Incoming conflicts were not applied", message: "Report-only mode keeps the left value wherever the non-array conflict policy is reached." });
  }
  if (options.ignoreNullValues && (options.mergeMode === "deep" || options.mergeMode === "shallow")) {
    issues.push({ severity: "warning", title: "Right-side nulls were ignored", message: "Null values on the incoming side were treated as no-op values, which is a custom rule rather than JSON Merge Patch semantics." });
  }
  if (options.arrayMode === "replace" && counters.arrayMerges) {
    issues.push({ severity: "info", title: "Right arrays replaced left arrays", message: "Whenever both competing values were arrays, the selected array policy used the complete right-side array." });
  }
  if (options.arrayMode === "mergeByIndex" && counters.arrayMerges) {
    issues.push({ severity: "warning", title: "Array positions were treated as identities", message: "Index merging assumes item 0 corresponds to item 0, item 1 to item 1, and so on. Reordered lists can merge unrelated records." });
  }
  if (conflicts.length > 100) {
    issues.push({ severity: "warning", title: "Large conflict set", message: "More than 100 paths competed. A schema-aware or application-specific merge deserves closer review." });
  }
  return issues;
}

function valuesEqual(left: unknown, right: unknown) {
  return stableStringify(left) === stableStringify(right);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isPlainObject(value)) {
    const source = value as Record<string, unknown>;
    const parts: string[] = [];
    Object.keys(source).sort(compareUtf16).forEach((key) => parts.push(`${JSON.stringify(key)}:${stableStringify(source[key])}`));
    return `{${parts.join(",")}}`;
  }
  return JSON.stringify(value);
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (isPlainObject(value)) {
    const source = value as Record<string, unknown>;
    const target = createSafeObject();
    Object.keys(source).sort(compareUtf16).forEach((key) => setOwn(target, key, sortObjectKeys(source[key])));
    return target;
  }
  return value;
}

function joinPointer(parent: string, key: string) {
  const escaped = key.replace(/~/g, "~0").replace(/\//g, "~1");
  return `${parent}/${escaped}`;
}

function displayPath(path: string) {
  return path === "" ? "(root)" : path;
}

function formatOutput(result: Omit<MergeResult, "output">, options: {
  outputMode: OutputMode;
  prettyOutput: boolean;
  includeConflictReport: boolean;
}) {
  if (options.outputMode === "merged") return stringifyJson(result.merged, options.prettyOutput);
  if (options.outputMode === "json") return stringifyJson(result, options.prettyOutput);
  if (options.outputMode === "markdown") {
    const rows = result.conflicts.length
      ? result.conflicts.map((conflict) => `| ${escapeMarkdown(displayPath(conflict.path))} | ${escapeMarkdown(stringifyShort(conflict.leftValue))} | ${escapeMarkdown(stringifyShort(conflict.rightValue))} | ${escapeMarkdown(conflict.resolution)} |`)
      : ["| - | - | - | No competing values |"];
    return ["| Path | Left | Right | Applied rule |", "| --- | --- | --- | --- |", ...rows].join("\n");
  }
  if (options.outputMode === "report") {
    const conflictLines = result.conflicts.length && options.includeConflictReport
      ? result.conflicts.map((conflict, index) => `${index + 1}. ${displayPath(conflict.path)}\n   left: ${stringifyShort(conflict.leftValue)}\n   right: ${stringifyShort(conflict.rightValue)}\n   rule: ${conflict.resolution}`)
      : ["Path detail omitted or no conflicts found."];
    return [
      "JSON Merge Report",
      "-----------------",
      `Conflicting paths: ${result.conflictCount}`,
      `Added keys: ${result.addedKeys}`,
      `Right overwrites: ${result.overwrittenKeys}`,
      `Array merges: ${result.arrayMerges}`,
      "",
      ...conflictLines,
      "",
      "Merged JSON:",
      stringifyJson(result.merged, options.prettyOutput),
    ].join("\n");
  }
  return [
    "JSON Merge Summary",
    "------------------",
    `Conflicting paths: ${result.conflictCount}`,
    `Added keys: ${result.addedKeys}`,
    `Right overwrites: ${result.overwrittenKeys}`,
    `Array merges: ${result.arrayMerges}`,
    `Left input characters: ${result.leftSize}`,
    `Right input characters: ${result.rightSize}`,
    `Merged JSON characters: ${result.mergedSize}`,
  ].join("\n");
}

function stringifyJson(value: unknown, pretty: boolean) {
  return JSON.stringify(value, null, pretty ? 2 : 0);
}

function stringifyShort(value: unknown) {
  const text = JSON.stringify(value);
  if (typeof text !== "string") return String(value);
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function getMergeNotes(result: MergeResult) {
  const notes: Array<{ title: string; message: string }> = [];
  if (result.conflictCount) notes.push({ title: "Read the paths, not only the count", message: "A single overwritten credential or endpoint can matter more than dozens of harmless presentation settings." });
  if (result.arrayMerges) notes.push({ title: "Array rules carry domain assumptions", message: "Replacement, concatenation, de-duplication, and index merging all mean different things for ordered data." });
  if (!result.conflictCount) notes.push({ title: "No competing values under these rules", message: "That does not validate the merged document against an application schema or configuration contract." });
  return notes;
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
    if (/\s/.test(char)) { index += 1; continue; }
    if (char === "{") {
      stack.push({ type: "object", keys: new Set<string>() });
      if (stack.length > MAX_JSON_DEPTH) throw new Error(`${label} is nested more than ${MAX_JSON_DEPTH} levels.`);
      index += 1; continue;
    }
    if (char === "[") {
      stack.push({ type: "array" });
      if (stack.length > MAX_JSON_DEPTH) throw new Error(`${label} is nested more than ${MAX_JSON_DEPTH} levels.`);
      index += 1; continue;
    }
    if (char === "}" || char === "]") { stack.pop(); index += 1; continue; }
    if (char === '"') {
      const end = findJsonStringEnd(text, index);
      const token = text.slice(index, end + 1);
      let next = end + 1;
      while (next < text.length && /\s/.test(text[next])) next += 1;
      const frame = stack[stack.length - 1];
      if (frame?.type === "object" && text[next] === ":") {
        const key = JSON.parse(token) as string;
        if (frame.keys?.has(key)) throw new Error(`${label} contains duplicate member ${JSON.stringify(key)}, which JavaScript parsing would collapse.`);
        frame.keys?.add(key);
      }
      index = end + 1; continue;
    }
    if (char === "-" || /\d/.test(char)) {
      const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (match) {
        const token = match[0];
        const numericValue = Number(token);
        if (!isSafeNumberToken(token, numericValue)) throw new Error(`${label} contains JSON number ${token}, which cannot be rewritten safely with JavaScript number semantics.`);
        index += token.length; continue;
      }
    }
    index += 1;
  }
}

function findJsonStringEnd(text: string, start: number) {
  let escaped = false;
  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) { escaped = false; continue; }
    if (char === "\\") { escaped = true; continue; }
    if (char === '"') return index;
  }
  return text.length - 1;
}

function isSafeNumberToken(token: string, numericValue: number) {
  if (!Number.isFinite(numericValue) || Object.is(numericValue, -0)) return false;
  if (/^-?(?:0|[1-9]\d*)$/.test(token)) return Number.isSafeInteger(numericValue);
  const significantDigits = token.replace(/^[+-]/, "").split(/[eE]/)[0].replace(".", "").replace(/^0+/, "").length;
  if (significantDigits > 15) return false;
  if (numericValue === 0 && /[1-9]/.test(token)) return false;
  return true;
}

function isPlainObject(value: unknown) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createSafeObject() {
  return Object.create(null) as Record<string, unknown>;
}

function copySafeObject(source: Record<string, unknown>) {
  const target = createSafeObject();
  Object.keys(source).forEach((key) => setOwn(target, key, source[key]));
  return target;
}

function setOwn(target: Record<string, unknown>, key: string, value: unknown) {
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });
}

function compareUtf16(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function JsonInputCard({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="mt-3 min-h-[390px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{hint}</p>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#d9a928]" />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function IssueCard({ issue }: { issue: MergeIssue }) {
  const className = issue.severity === "high"
    ? "self-start rounded-xl border border-red-200 bg-red-50 p-4"
    : issue.severity === "warning"
      ? "self-start rounded-xl border border-amber-200 bg-amber-50 p-4"
      : "self-start rounded-xl border border-gray-200 bg-gray-50 p-4";
  const titleClass = issue.severity === "high" ? "text-red-800" : issue.severity === "warning" ? "text-amber-900" : "text-gray-900";
  const bodyClass = issue.severity === "high" ? "text-red-700" : issue.severity === "warning" ? "text-amber-800" : "text-gray-600";
  return (
    <div className={className}>
      <p className={`text-sm font-semibold ${titleClass}`}>{issue.title}</p>
      <p className={`mt-1 text-sm leading-6 ${bodyClass}`}>{issue.message}</p>
    </div>
  );
}
