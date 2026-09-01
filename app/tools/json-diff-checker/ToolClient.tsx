"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

type DiffKind = "added" | "removed" | "changed" | "type-changed";

type DiffEntry = {
  kind: DiffKind;
  path: string;
  left?: JsonValue;
  right?: JsonValue;
};

type SourceFinding = {
  duplicateKeys: number;
  duplicateExamples: string[];
  unsafeIntegers: number;
  unsafeIntegerExamples: string[];
  nonFiniteNumbers: number;
  nonFiniteExamples: string[];
};

type ComparisonResult = {
  text: string;
  entries: DiffEntry[];
  truncated: boolean;
  incomplete: boolean;
  visitedNodes: number;
  leftFindings: SourceFinding;
  rightFindings: SourceFinding;
};

type CompareWork = {
  left: JsonValue | symbol;
  right: JsonValue | symbol;
  path: string;
};

const MISSING = Symbol("missing-json-value");
const MAX_DIFFS = 500;
const MAX_NODES = 100000;
const MAX_SAFE_INTEGER_TEXT = "9007199254740991";

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
      const leftFindings = scanJsonSource(leftInput);
      const rightFindings = scanJsonSource(rightInput);
      const comparison = compareValues(left, right);
      const text = buildDiffText(
        comparison.entries,
        comparison.truncated,
        comparison.incomplete,
        comparison.visitedNodes
      );

      setResult({
        text,
        entries: comparison.entries,
        truncated: comparison.truncated,
        incomplete: comparison.incomplete,
        visitedNodes: comparison.visitedNodes,
        leftFindings,
        rightFindings,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to compare these JSON values."
      );
      setResult(null);
      setCopied(false);
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

    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The comparison result could not be copied. Select and copy it manually."
      );
    }
  };

  const counts = countKinds(result?.entries || []);
  const sourceWarnings = result ? buildSourceWarnings(result) : [];

  return (
    <ToolShell
      title="JSON Diff Checker"
      description="Compare two JSON values structurally by path. Object member order and formatting are ignored, array order remains significant, and source-level warnings highlight duplicate keys or number tokens that JavaScript parsing can collapse."
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
        <button type="button" onClick={compareJSON} className="yoryantra-btn">
          Compare JSON
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Structural Differences
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    Paths use <code>$["key"]</code> notation so spaces,
                    punctuation, dots, and brackets inside property names remain
                    unambiguous.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyOutput}
                  className="yoryantra-btn-outline text-sm"
                >
                  {copied ? "Copied" : "Copy Result"}
                </button>
              </div>

              <pre className="mt-4 yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
                {result.text}
              </pre>
            </div>

            <div className="space-y-4">
              <StatCard
                label="Differences shown"
                value={result.entries.length.toLocaleString()}
              />
              <StatCard
                label="Added / removed"
                value={`${counts.added.toLocaleString()} / ${counts.removed.toLocaleString()}`}
              />
              <StatCard
                label="Changed values"
                value={counts.changed.toLocaleString()}
              />
              <StatCard
                label="Type changes"
                value={counts.typeChanged.toLocaleString()}
              />
            </div>
          </div>

          {sourceWarnings.length > 0 ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                Source-level comparison warnings
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-amber-800">
                {sourceWarnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}

          {result.truncated || result.incomplete ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              {result.truncated
                ? `The display stopped after ${MAX_DIFFS.toLocaleString()} differences. `
                : ""}
              {result.incomplete
                ? `The structural walk also reached the ${MAX_NODES.toLocaleString()}-node safety limit, so this result is not a complete equality decision.`
                : ""}
            </div>
          ) : null}
        </>
      ) : null}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser-local comparison
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Both JSON inputs are parsed and compared in your browser. This tool
          does not send the pasted documents to a comparison API. Site-wide
          analytics or advertising scripts, if enabled by the website, are
          separate from the diff operation itself.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Compare JSON Data, Not Pretty-Printed Lines
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON objects are unordered collections of name/value pairs, while
            arrays are ordered sequences. Reordering object members should not
            create a structural difference, but moving values inside an array
            can. This checker parses both inputs and walks their values instead
            of comparing line numbers or indentation.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Added and removed members are reported at their path. Primitive
            value changes are separated from type changes such as a string
            becoming a number. Objects, arrays, strings, numbers, booleans, and
            null are all supported as root values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Array Order Is Significant Here
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The checker compares arrays by index. If an item is inserted near
            the beginning, several later positions may appear changed even when
            the same values still exist elsewhere. That is deliberate: JSON
            defines arrays as ordered. Domain-specific comparisons such as
            treating an array as an unordered set require an application rule
            for identity and are outside this generic structural diff.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Object Names Can Disappear During Parsing
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 8259 says names within an object should be unique because
            receiver behavior is not reliably interoperable when they repeat.
            JavaScript&apos;s <code>JSON.parse()</code> exposes the resulting
            object rather than every duplicate occurrence. This page scans the
            validated source text separately and warns when duplicate names were
            present, because two documents can otherwise appear equal after
            parsing even though their original member sequences differed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Number Text Can Lose Distinctions in JavaScript
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Comparison happens after JSON numbers become JavaScript Number
            values. Different spellings such as <code>1</code> and
            <code>1.0</code> therefore compare as the same parsed number. Very
            large integers can also lose exact precision, and extreme exponents
            can become non-finite JavaScript values. Source scanning flags those
            risky tokens before you rely on the parsed-value comparison.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If lexical number identity matters, compare the original tokens or
            use a parser that preserves arbitrary-precision numbers rather than
            treating this tool as a byte-level diff.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            This Is Not JSON Patch or Merge Patch
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The output is a human-readable list of structural differences. It
            is not an RFC 6902 JSON Patch document, an RFC 7396 Merge Patch, or
            an instruction that can be safely applied automatically. Generating
            an update operation requires additional choices about arrays,
            conflict handling, and application semantics.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Large Documents Use Browser Safety Limits
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The structural walk is iterative rather than recursively descending
            the JavaScript call stack, which makes deep JSON safer to inspect.
            The page still limits displayed differences and total visited nodes
            so an unexpectedly huge comparison does not monopolize the browser.
            When either limit is reached, the result is explicitly marked
            incomplete rather than claiming the documents are equal.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Official References
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              <a
                href="https://www.rfc-editor.org/rfc/rfc8259"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                RFC 8259 — The JavaScript Object Notation (JSON) Data
                Interchange Format
              </a>
            </p>
            <p>
              <a
                href="https://tc39.es/ecma262/multipage/structured-data.html#sec-json.parse"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                ECMAScript specification — JSON.parse
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/json-diff-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function parseJson(input: string, label: string): JsonValue {
  if (input.trim().length === 0) {
    throw new Error(`${label} JSON is empty.`);
  }

  try {
    return JSON.parse(input) as JsonValue;
  } catch (caught) {
    const detail =
      caught instanceof Error ? caught.message : "Invalid JSON syntax.";
    throw new Error(`${label} JSON is invalid: ${detail}`);
  }
}

function compareValues(left: JsonValue, right: JsonValue) {
  const entries: DiffEntry[] = [];
  const stack: CompareWork[] = [{ left, right, path: "$" }];
  let visitedNodes = 0;
  let truncated = false;
  let incomplete = false;

  while (stack.length > 0) {
    if (entries.length >= MAX_DIFFS) {
      truncated = true;
      break;
    }

    if (visitedNodes >= MAX_NODES) {
      incomplete = true;
      break;
    }

    const current = stack.pop() as CompareWork;
    visitedNodes += 1;

    if (current.left === MISSING) {
      entries.push({
        kind: "added",
        path: current.path,
        right: current.right as JsonValue,
      });
      continue;
    }

    if (current.right === MISSING) {
      entries.push({
        kind: "removed",
        path: current.path,
        left: current.left as JsonValue,
      });
      continue;
    }

    const leftValue = current.left as JsonValue;
    const rightValue = current.right as JsonValue;
    const leftType = jsonType(leftValue);
    const rightType = jsonType(rightValue);

    if (leftType !== rightType) {
      entries.push({
        kind: "type-changed",
        path: current.path,
        left: leftValue,
        right: rightValue,
      });
      continue;
    }

    if (leftType === "array") {
      const leftArray = leftValue as JsonValue[];
      const rightArray = rightValue as JsonValue[];
      const maxLength = Math.max(leftArray.length, rightArray.length);
      const remainingBudget = Math.max(0, MAX_NODES - visitedNodes);
      const inspectLength = Math.min(maxLength, remainingBudget);

      if (inspectLength < maxLength) {
        incomplete = true;
      }

      for (let index = inspectLength - 1; index >= 0; index -= 1) {
        const nextPath = `${current.path}[${index}]`;

        if (index >= leftArray.length) {
          stack.push({
            left: MISSING,
            right: rightArray[index],
            path: nextPath,
          });
        } else if (index >= rightArray.length) {
          stack.push({
            left: leftArray[index],
            right: MISSING,
            path: nextPath,
          });
        } else {
          stack.push({
            left: leftArray[index],
            right: rightArray[index],
            path: nextPath,
          });
        }
      }

      continue;
    }

    if (leftType === "object") {
      const leftObject = leftValue as { [key: string]: JsonValue };
      const rightObject = rightValue as { [key: string]: JsonValue };
      const keys = Array.from(
        new Set([...Object.keys(leftObject), ...Object.keys(rightObject)])
      ).sort();
      const remainingBudget = Math.max(0, MAX_NODES - visitedNodes);
      const inspectLength = Math.min(keys.length, remainingBudget);

      if (inspectLength < keys.length) {
        incomplete = true;
      }

      for (let index = inspectLength - 1; index >= 0; index -= 1) {
        const key = keys[index];
        const nextPath = `${current.path}[${JSON.stringify(key)}]`;
        const inLeft = Object.prototype.hasOwnProperty.call(leftObject, key);
        const inRight = Object.prototype.hasOwnProperty.call(rightObject, key);

        stack.push({
          left: inLeft ? leftObject[key] : MISSING,
          right: inRight ? rightObject[key] : MISSING,
          path: nextPath,
        });
      }

      continue;
    }

    if (leftValue !== rightValue) {
      entries.push({
        kind: "changed",
        path: current.path,
        left: leftValue,
        right: rightValue,
      });
    }
  }

  return {
    entries,
    truncated,
    incomplete,
    visitedNodes,
  };
}

function jsonType(value: JsonValue) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value === "object" ? "object" : typeof value;
}

function buildDiffText(
  entries: DiffEntry[],
  truncated: boolean,
  incomplete: boolean,
  visitedNodes: number
) {
  if (entries.length === 0) {
    if (incomplete) {
      return `No differences were found in the inspected portion.\n\nComparison stopped after ${visitedNodes.toLocaleString()} visited nodes, so equality is not proven.`;
    }

    return "No structural differences found.\n\nWhitespace and object-member order are ignored. Array order remains significant.";
  }

  const blocks = entries.map((entry, index) => {
    const heading = `${index + 1}. ${entry.kind.toUpperCase()} ${entry.path}`;

    if (entry.kind === "added") {
      return `${heading}\n   Right: ${formatPreview(entry.right)}`;
    }

    if (entry.kind === "removed") {
      return `${heading}\n   Left:  ${formatPreview(entry.left)}`;
    }

    return `${heading}\n   Left:  ${formatPreview(
      entry.left
    )}\n   Right: ${formatPreview(entry.right)}`;
  });

  if (truncated) {
    blocks.push(
      `Comparison stopped after ${MAX_DIFFS.toLocaleString()} displayed differences.`
    );
  }

  if (incomplete) {
    blocks.push(
      `The structural walk reached its ${MAX_NODES.toLocaleString()}-node safety limit; the comparison is incomplete.`
    );
  }

  return blocks.join("\n\n");
}

function formatPreview(value: JsonValue | undefined) {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return String(value);
  }

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

function scanJsonSource(source: string): SourceFinding {
  const finding: SourceFinding = {
    duplicateKeys: 0,
    duplicateExamples: [],
    unsafeIntegers: 0,
    unsafeIntegerExamples: [],
    nonFiniteNumbers: 0,
    nonFiniteExamples: [],
  };

  const stack: Array<
    | { type: "object"; keys: Set<string> }
    | { type: "array" }
  > = [];

  let index = 0;

  while (index < source.length) {
    const character = source[index];

    if (isJsonWhitespace(character) || character === "," || character === ":") {
      index += 1;
      continue;
    }

    if (character === "{") {
      stack.push({ type: "object", keys: new Set<string>() });
      index += 1;
      continue;
    }

    if (character === "[") {
      stack.push({ type: "array" });
      index += 1;
      continue;
    }

    if (character === "}" || character === "]") {
      stack.pop();
      index += 1;
      continue;
    }

    if (character === '"') {
      const token = readJsonStringToken(source, index);
      const next = nextNonWhitespaceIndex(source, token.end);

      if (source[next] === ":") {
        const context = stack[stack.length - 1];

        if (context && context.type === "object") {
          const key = JSON.parse(token.raw) as string;

          if (context.keys.has(key)) {
            finding.duplicateKeys += 1;
            addExample(finding.duplicateExamples, JSON.stringify(key));
          }

          context.keys.add(key);
        }
      }

      index = token.end;
      continue;
    }

    if (character === "-" || /[0-9]/.test(character)) {
      const end = readJsonNumberEnd(source, index);
      const token = source.slice(index, end);

      if (/^-?(?:0|[1-9]\d*)$/.test(token) && isOutsideSafeInteger(token)) {
        finding.unsafeIntegers += 1;
        addExample(finding.unsafeIntegerExamples, token);
      }

      if (!Number.isFinite(Number(token))) {
        finding.nonFiniteNumbers += 1;
        addExample(finding.nonFiniteExamples, token);
      }

      index = end;
      continue;
    }

    if (source.startsWith("true", index)) {
      index += 4;
      continue;
    }

    if (source.startsWith("false", index)) {
      index += 5;
      continue;
    }

    if (source.startsWith("null", index)) {
      index += 4;
      continue;
    }

    index += 1;
  }

  return finding;
}

function readJsonStringToken(source: string, start: number) {
  let index = start + 1;
  let escaped = false;

  while (index < source.length) {
    const character = source[index];
    index += 1;

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (character === '"') break;
  }

  return {
    raw: source.slice(start, index),
    end: index,
  };
}

function readJsonNumberEnd(source: string, start: number) {
  let index = start;

  while (
    index < source.length &&
    !isJsonWhitespace(source[index]) &&
    source[index] !== "," &&
    source[index] !== "]" &&
    source[index] !== "}"
  ) {
    index += 1;
  }

  return index;
}

function nextNonWhitespaceIndex(source: string, start: number) {
  let index = start;

  while (index < source.length && isJsonWhitespace(source[index])) {
    index += 1;
  }

  return index;
}

function isJsonWhitespace(character: string) {
  return (
    character === " " ||
    character === "\t" ||
    character === "\n" ||
    character === "\r"
  );
}

function isOutsideSafeInteger(token: string) {
  let digits = token[0] === "-" ? token.slice(1) : token;

  while (digits.length > 1 && digits[0] === "0") {
    digits = digits.slice(1);
  }

  if (digits.length !== MAX_SAFE_INTEGER_TEXT.length) {
    return digits.length > MAX_SAFE_INTEGER_TEXT.length;
  }

  return digits > MAX_SAFE_INTEGER_TEXT;
}

function addExample(list: string[], value: string) {
  if (list.length < 5 && !list.includes(value)) {
    list.push(value);
  }
}

function buildSourceWarnings(result: ComparisonResult) {
  const warnings: string[] = [];
  const left = result.leftFindings;
  const right = result.rightFindings;

  if (left.duplicateKeys > 0 || right.duplicateKeys > 0) {
    warnings.push(
      `Duplicate object-name occurrences were found before parsing — Left: ${left.duplicateKeys.toLocaleString()}, Right: ${right.duplicateKeys.toLocaleString()}. JSON.parse keeps the resulting object state rather than exposing every duplicate occurrence, so the structural diff may hide source-level differences. Examples: ${formatExamples(
        [...left.duplicateExamples, ...right.duplicateExamples]
      )}.`
    );
  }

  if (left.unsafeIntegers > 0 || right.unsafeIntegers > 0) {
    warnings.push(
      `Integer tokens outside JavaScript's exact safe-integer range were found — Left: ${left.unsafeIntegers.toLocaleString()}, Right: ${right.unsafeIntegers.toLocaleString()}. Distinct source integers can collapse to the same Number value. Examples: ${formatExamples(
        [...left.unsafeIntegerExamples, ...right.unsafeIntegerExamples]
      )}.`
    );
  }

  if (left.nonFiniteNumbers > 0 || right.nonFiniteNumbers > 0) {
    warnings.push(
      `Valid JSON number tokens that become non-finite JavaScript Numbers were found — Left: ${left.nonFiniteNumbers.toLocaleString()}, Right: ${right.nonFiniteNumbers.toLocaleString()}. Examples: ${formatExamples(
        [...left.nonFiniteExamples, ...right.nonFiniteExamples]
      )}.`
    );
  }

  return warnings;
}

function formatExamples(values: string[]) {
  const unique = Array.from(new Set(values)).slice(0, 5);
  return unique.length > 0 ? unique.join(", ") : "none shown";
}

function JsonEditor({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <label className="mb-2 block text-sm font-semibold text-gray-900">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event: { target: { value: string } }) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        spellCheck={false}
        className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
