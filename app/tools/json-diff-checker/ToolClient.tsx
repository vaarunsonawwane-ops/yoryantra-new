"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

class JsonNumberToken {
  raw: string;
  normalized: string;

  constructor(raw: string, normalized: string) {
    this.raw = raw;
    this.normalized = normalized;
  }
}

type JsonValue =
  | null
  | boolean
  | string
  | JsonNumberToken
  | JsonValue[]
  | { [key: string]: JsonValue };

type DifferenceKind = "added" | "removed" | "changed" | "type";

type Difference = {
  path: string;
  kind: DifferenceKind;
  left?: JsonValue;
  right?: JsonValue;
};

type ParseResult = {
  value: JsonValue;
  duplicatePaths: string[];
  surrogateLocations: string[];
};

const MAX_PARSE_DEPTH = 200;
const MAX_REPORTED_DIFFS = 500;

function escapePointerToken(token: string): string {
  return token.replace(/~/g, "~0").replace(/\//g, "~1");
}

function joinPointer(parent: string, token: string): string {
  return `${parent}/${escapePointerToken(token)}`;
}

function displayPointer(path: string): string {
  return path || "(root)";
}

function hasUnpairedSurrogate(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        return true;
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
}

function collectSurrogateLocations(value: JsonValue, path: string, locations: string[]) {
  if (typeof value === "string") {
    if (hasUnpairedSurrogate(value)) locations.push(`${displayPointer(path)} (string value)`);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectSurrogateLocations(item, joinPointer(path, String(index)), locations));
    return;
  }

  if (isObjectValue(value)) {
    Object.keys(value).forEach((key) => {
      const childPath = joinPointer(path, key);
      if (hasUnpairedSurrogate(key)) locations.push(`${displayPointer(childPath)} (member name)`);
      collectSurrogateLocations(value[key], childPath, locations);
    });
  }
}

function normalizeSignedInteger(value: string): string {
  const negative = value.startsWith("-");
  const unsigned = value.replace(/^[+-]/, "").replace(/^0+/, "") || "0";
  return unsigned === "0" ? "0" : `${negative ? "-" : ""}${unsigned}`;
}

function compareUnsignedIntegers(left: string, right: string): number {
  if (left.length !== right.length) return left.length > right.length ? 1 : -1;
  if (left === right) return 0;
  return left > right ? 1 : -1;
}

function addUnsignedIntegers(left: string, right: string): string {
  let leftIndex = left.length - 1;
  let rightIndex = right.length - 1;
  let carry = 0;
  let result = "";

  while (leftIndex >= 0 || rightIndex >= 0 || carry > 0) {
    const leftDigit = leftIndex >= 0 ? left.charCodeAt(leftIndex) - 48 : 0;
    const rightDigit = rightIndex >= 0 ? right.charCodeAt(rightIndex) - 48 : 0;
    const sum = leftDigit + rightDigit + carry;
    result = String(sum % 10) + result;
    carry = Math.floor(sum / 10);
    leftIndex -= 1;
    rightIndex -= 1;
  }

  return result.replace(/^0+/, "") || "0";
}

function subtractUnsignedIntegers(left: string, right: string): string {
  let leftIndex = left.length - 1;
  let rightIndex = right.length - 1;
  let borrow = 0;
  let result = "";

  while (leftIndex >= 0) {
    let digit = left.charCodeAt(leftIndex) - 48 - borrow;
    const rightDigit = rightIndex >= 0 ? right.charCodeAt(rightIndex) - 48 : 0;
    if (digit < rightDigit) {
      digit += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result = String(digit - rightDigit) + result;
    leftIndex -= 1;
    rightIndex -= 1;
  }

  return result.replace(/^0+/, "") || "0";
}

function addSignedIntegers(leftValue: string, rightValue: string): string {
  const left = normalizeSignedInteger(leftValue);
  const right = normalizeSignedInteger(rightValue);
  const leftNegative = left.startsWith("-");
  const rightNegative = right.startsWith("-");
  const leftDigits = left.replace(/^-/, "");
  const rightDigits = right.replace(/^-/, "");

  if (leftNegative === rightNegative) {
    const sum = addUnsignedIntegers(leftDigits, rightDigits);
    return sum === "0" ? "0" : `${leftNegative ? "-" : ""}${sum}`;
  }

  const comparison = compareUnsignedIntegers(leftDigits, rightDigits);
  if (comparison === 0) return "0";

  if (comparison > 0) {
    const difference = subtractUnsignedIntegers(leftDigits, rightDigits);
    return `${leftNegative ? "-" : ""}${difference}`;
  }

  const difference = subtractUnsignedIntegers(rightDigits, leftDigits);
  return `${rightNegative ? "-" : ""}${difference}`;
}

function normalizeJsonNumber(raw: string): string {
  const match = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(raw);
  if (!match) return raw;

  const negative = match[1] === "-";
  const integerPart = match[2];
  const fractionPart = match[3] || "";
  let digits = integerPart + fractionPart;
  let exponent10 = addSignedIntegers(match[4] || "0", String(-fractionPart.length));

  digits = digits.replace(/^0+/, "");
  if (digits.length === 0) return "0";

  let trailingZeros = 0;
  while (digits.endsWith("0")) {
    digits = digits.slice(0, -1);
    trailingZeros += 1;
  }

  if (trailingZeros > 0) {
    exponent10 = addSignedIntegers(exponent10, String(trailingZeros));
  }

  return `${negative ? "-" : ""}${digits}e${exponent10}`;
}

class JsonParser {
  private text: string;
  private index = 0;
  private duplicatePaths: string[] = [];

  constructor(text: string) {
    this.text = text;
  }

  parse(): ParseResult {
    this.skipWhitespace();
    if (this.index >= this.text.length) {
      throw this.error("JSON input is empty");
    }

    const value = this.parseValue("", 0);
    this.skipWhitespace();

    if (this.index !== this.text.length) {
      throw this.error("Unexpected content after the JSON value");
    }

    const surrogateLocations: string[] = [];
    collectSurrogateLocations(value, "", surrogateLocations);
    return { value, duplicatePaths: this.duplicatePaths, surrogateLocations };
  }

  private parseValue(path: string, depth: number): JsonValue {
    if (depth > MAX_PARSE_DEPTH) {
      throw this.error(`Nesting is deeper than the ${MAX_PARSE_DEPTH}-level browser safety limit`);
    }

    this.skipWhitespace();
    const character = this.text[this.index];

    if (character === "{") return this.parseObject(path, depth + 1);
    if (character === "[") return this.parseArray(path, depth + 1);
    if (character === '"') return this.parseString();
    if (character === "t") return this.parseKeyword("true", true);
    if (character === "f") return this.parseKeyword("false", false);
    if (character === "n") return this.parseKeyword("null", null);
    if (character === "-" || (character >= "0" && character <= "9")) return this.parseNumber();

    throw this.error("Expected a JSON value");
  }

  private parseObject(path: string, depth: number): { [key: string]: JsonValue } {
    this.index += 1;
    this.skipWhitespace();

    const object = Object.create(null) as { [key: string]: JsonValue };
    const seen = new Set<string>();

    if (this.text[this.index] === "}") {
      this.index += 1;
      return object;
    }

    while (this.index < this.text.length) {
      this.skipWhitespace();
      if (this.text[this.index] !== '"') {
        throw this.error("Expected a quoted object member name");
      }

      const key = this.parseString();
      const childPath = joinPointer(path, key);
      this.skipWhitespace();

      if (this.text[this.index] !== ":") {
        throw this.error("Expected ':' after the object member name");
      }
      this.index += 1;

      const value = this.parseValue(childPath, depth);
      if (seen.has(key)) this.duplicatePaths.push(childPath);
      seen.add(key);
      object[key] = value;

      this.skipWhitespace();
      const separator = this.text[this.index];
      if (separator === "}") {
        this.index += 1;
        return object;
      }
      if (separator !== ",") {
        throw this.error("Expected ',' or '}' in the object");
      }
      this.index += 1;
    }

    throw this.error("Unterminated JSON object");
  }

  private parseArray(path: string, depth: number): JsonValue[] {
    this.index += 1;
    this.skipWhitespace();
    const array: JsonValue[] = [];

    if (this.text[this.index] === "]") {
      this.index += 1;
      return array;
    }

    while (this.index < this.text.length) {
      const childPath = joinPointer(path, String(array.length));
      array.push(this.parseValue(childPath, depth));
      this.skipWhitespace();

      const separator = this.text[this.index];
      if (separator === "]") {
        this.index += 1;
        return array;
      }
      if (separator !== ",") {
        throw this.error("Expected ',' or ']' in the array");
      }
      this.index += 1;
    }

    throw this.error("Unterminated JSON array");
  }

  private parseString(): string {
    const start = this.index;
    this.index += 1;
    let escaped = false;

    while (this.index < this.text.length) {
      const character = this.text[this.index];

      if (!escaped && character === '"') {
        this.index += 1;
        const literal = this.text.slice(start, this.index);
        try {
          return JSON.parse(literal) as string;
        } catch {
          throw this.error("Invalid JSON string escape or control character", start);
        }
      }

      if (!escaped && character === "\\") {
        escaped = true;
      } else {
        escaped = false;
      }

      this.index += 1;
    }

    throw this.error("Unterminated JSON string", start);
  }

  private parseNumber(): JsonNumberToken {
    const remaining = this.text.slice(this.index);
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(remaining);
    if (!match) throw this.error("Invalid JSON number");

    const raw = match[0];
    this.index += raw.length;

    const next = this.text[this.index];
    if (next && !/[\s,\]}]/.test(next)) {
      throw this.error("Invalid character after JSON number");
    }

    return new JsonNumberToken(raw, normalizeJsonNumber(raw));
  }

  private parseKeyword<T extends boolean | null>(keyword: string, value: T): T {
    if (this.text.slice(this.index, this.index + keyword.length) !== keyword) {
      throw this.error(`Expected '${keyword}'`);
    }
    this.index += keyword.length;
    return value;
  }

  private skipWhitespace() {
    while (this.index < this.text.length && /[\t\n\r ]/.test(this.text[this.index])) {
      this.index += 1;
    }
  }

  private error(message: string, position = this.index): Error {
    const before = this.text.slice(0, position);
    const line = before.split("\n").length;
    const lastNewline = before.lastIndexOf("\n");
    const column = position - lastNewline;
    return new Error(`${message} at line ${line}, column ${column}.`);
  }
}

function isJsonNumber(value: JsonValue): value is JsonNumberToken {
  return value instanceof JsonNumberToken;
}

function valueType(value: JsonValue): string {
  if (value === null) return "null";
  if (isJsonNumber(value)) return "number";
  if (Array.isArray(value)) return "array";
  return typeof value === "object" ? "object" : typeof value;
}

function isObjectValue(value: JsonValue): value is { [key: string]: JsonValue } {
  return value !== null && !Array.isArray(value) && !isJsonNumber(value) && typeof value === "object";
}

function serializeJson(value: JsonValue, depth = 0): string {
  if (value === null) return "null";
  if (isJsonNumber(value)) return value.raw;
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";

  if (depth > 8) return Array.isArray(value) ? "[…]" : "{…}";

  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeJson(item, depth + 1)).join(", ")}]`;
  }

  return `{${Object.keys(value)
    .map((key) => `${JSON.stringify(key)}: ${serializeJson(value[key], depth + 1)}`)
    .join(", ")}}`;
}

function summarizeValue(value: JsonValue | undefined): string {
  if (typeof value === "undefined") return "—";
  const serialized = serializeJson(value);
  return serialized.length > 420 ? `${serialized.slice(0, 417)}…` : serialized;
}

function reportDifference(
  difference: Difference,
  differences: Difference[],
  state: { truncated: boolean }
): boolean {
  if (differences.length >= MAX_REPORTED_DIFFS) {
    state.truncated = true;
    return false;
  }

  differences.push(difference);
  if (differences.length >= MAX_REPORTED_DIFFS) {
    state.truncated = true;
  }
  return true;
}

function compareValues(
  left: JsonValue,
  right: JsonValue,
  path: string,
  differences: Difference[],
  state: { truncated: boolean }
) {
  if (state.truncated) return;

  const leftType = valueType(left);
  const rightType = valueType(right);

  if (leftType !== rightType) {
    reportDifference({ path, kind: "type", left, right }, differences, state);
    return;
  }

  if (isJsonNumber(left) && isJsonNumber(right)) {
    if (left.normalized !== right.normalized) {
      reportDifference({ path, kind: "changed", left, right }, differences, state);
    }
    return;
  }

  if (left === null || typeof left === "string" || typeof left === "boolean") {
    if (left !== right) reportDifference({ path, kind: "changed", left, right }, differences, state);
    return;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLength = Math.max(left.length, right.length);
    for (let index = 0; index < maxLength; index += 1) {
      const childPath = joinPointer(path, String(index));
      if (index >= left.length) {
        reportDifference({ path: childPath, kind: "added", right: right[index] }, differences, state);
      } else if (index >= right.length) {
        reportDifference({ path: childPath, kind: "removed", left: left[index] }, differences, state);
      } else {
        compareValues(left[index], right[index], childPath, differences, state);
      }
      if (state.truncated) return;
    }
    return;
  }

  if (isObjectValue(left) && isObjectValue(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    const rightKeySet = new Set(rightKeys);
    const leftKeySet = new Set(leftKeys);

    for (const key of leftKeys) {
      const childPath = joinPointer(path, key);
      if (!rightKeySet.has(key)) {
        reportDifference({ path: childPath, kind: "removed", left: left[key] }, differences, state);
      } else {
        compareValues(left[key], right[key], childPath, differences, state);
      }
      if (state.truncated) return;
    }

    for (const key of rightKeys) {
      if (!leftKeySet.has(key)) {
        reportDifference({ path: joinPointer(path, key), kind: "added", right: right[key] }, differences, state);
      }
      if (state.truncated) return;
    }
  }
}

function differenceLabel(kind: DifferenceKind): string {
  switch (kind) {
    case "added":
      return "Added";
    case "removed":
      return "Removed";
    case "type":
      return "Type changed";
    default:
      return "Changed";
  }
}

function buildCopyText(differences: Difference[], truncated: boolean): string {
  if (differences.length === 0) return "No structural differences found.";

  const lines = differences.map((difference, index) => {
    return [
      `${index + 1}. ${differenceLabel(difference.kind)} at ${displayPointer(difference.path)}`,
      `LEFT: ${summarizeValue(difference.left)}`,
      `RIGHT: ${summarizeValue(difference.right)}`,
    ].join("\n");
  });

  if (truncated) lines.push(`Comparison stopped after ${MAX_REPORTED_DIFFS} reported differences; additional changes may exist.`);
  return lines.join("\n\n");
}

export default function ToolClient() {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [compared, setCompared] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setDifferences([]);
    setCompared(false);
    setTruncated(false);
    setError("");
    setWarnings([]);
    setCopied(false);
  };

  const compareJSON = () => {
    let left: ParseResult;
    let right: ParseResult;

    try {
      left = new JsonParser(leftInput).parse();
    } catch (parseError) {
      setError(`Left JSON: ${parseError instanceof Error ? parseError.message : "Invalid JSON."}`);
      setDifferences([]);
      setCompared(false);
      setWarnings([]);
      return;
    }

    try {
      right = new JsonParser(rightInput).parse();
    } catch (parseError) {
      setError(`Right JSON: ${parseError instanceof Error ? parseError.message : "Invalid JSON."}`);
      setDifferences([]);
      setCompared(false);
      setWarnings([]);
      return;
    }

    const nextWarnings: string[] = [];
    if (left.duplicatePaths.length > 0) {
      nextWarnings.push(`Left JSON contains repeated member names at ${left.duplicatePaths.slice(0, 5).map(displayPointer).join(", ")}${left.duplicatePaths.length > 5 ? "…" : ""}. The last value for each repeated name is used for comparison.`);
    }
    if (right.duplicatePaths.length > 0) {
      nextWarnings.push(`Right JSON contains repeated member names at ${right.duplicatePaths.slice(0, 5).map(displayPointer).join(", ")}${right.duplicatePaths.length > 5 ? "…" : ""}. The last value for each repeated name is used for comparison.`);
    }
    if (left.surrogateLocations.length > 0) {
      nextWarnings.push(`Left JSON contains unpaired UTF-16 surrogate data at ${left.surrogateLocations.slice(0, 5).join(", ")}${left.surrogateLocations.length > 5 ? "…" : ""}. RFC 8259 permits such escape sequences in the grammar but warns that their behavior is unpredictable across implementations.`);
    }
    if (right.surrogateLocations.length > 0) {
      nextWarnings.push(`Right JSON contains unpaired UTF-16 surrogate data at ${right.surrogateLocations.slice(0, 5).join(", ")}${right.surrogateLocations.length > 5 ? "…" : ""}. RFC 8259 permits such escape sequences in the grammar but warns that their behavior is unpredictable across implementations.`);
    }

    const nextDifferences: Difference[] = [];
    const state = { truncated: false };
    compareValues(left.value, right.value, "", nextDifferences, state);

    setDifferences(nextDifferences);
    setTruncated(state.truncated);
    setWarnings(nextWarnings);
    setCompared(true);
    setError("");
    setCopied(false);
  };

  const copyResult = async () => {
    if (!compared) return;
    try {
      await navigator.clipboard.writeText(buildCopyText(differences, truncated));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("The browser could not copy the comparison. Select the result and copy it manually.");
    }
  };

  const resetAll = () => {
    setLeftInput("");
    setRightInput("");
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Diff Checker"
      description="Compare JSON structurally by path: ignore object member order and formatting whitespace, preserve array order, and report added, removed, changed, or type-changed values."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="json-left" className="mb-2 block text-sm font-medium text-gray-700">Left JSON</label>
          <textarea
            id="json-left"
            value={leftInput}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setLeftInput(event.target.value);
              clearResult();
            }}
            placeholder={'{"user":{"id":1,"active":true}}'}
            className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-gray-500">{leftInput.length.toLocaleString()} characters</p>
        </div>

        <div>
          <label htmlFor="json-right" className="mb-2 block text-sm font-medium text-gray-700">Right JSON</label>
          <textarea
            id="json-right"
            value={rightInput}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setRightInput(event.target.value);
              clearResult();
            }}
            placeholder={'{"user":{"id":2,"active":true}}'}
            className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-gray-500">{rightInput.length.toLocaleString()} characters</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={compareJSON} className="yoryantra-btn">Compare JSON</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
          <h2 className="font-semibold text-gray-900">Comparison needs a closer look</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
            {warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Comparison result</h2>
            {compared && (
              <p className="mt-1 text-sm text-gray-500">
                {differences.length === 0 ? "No structural differences found." : `${differences.length} difference${differences.length === 1 ? "" : "s"}${truncated ? " shown (limit reached)" : ""}.`}
              </p>
            )}
          </div>
          {compared && (
            <button type="button" onClick={copyResult} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy result"}
            </button>
          )}
        </div>

        {!compared ? (
          <div className="yoryantra-output min-h-[220px] text-sm text-gray-500">Structural differences will appear here...</div>
        ) : differences.length === 0 ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-sm leading-relaxed text-green-800">
            The parsed JSON values are structurally equal under the comparison rules described below.
          </div>
        ) : (
          <div className="space-y-3">
            {differences.map((difference, index) => (
              <div key={`${difference.path}-${difference.kind}-${index}`} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{differenceLabel(difference.kind)}</span>
                  <code className="break-all text-sm font-semibold text-gray-900">{displayPointer(difference.path)}</code>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="min-w-0 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Left</p>
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-sm text-gray-800">{summarizeValue(difference.left)}</pre>
                  </div>
                  <div className="min-w-0 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Right</p>
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-sm text-gray-800">{summarizeValue(difference.right)}</pre>
                  </div>
                </div>
              </div>
            ))}
            {truncated && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-700">
                Comparison stopped after {MAX_REPORTED_DIFFS} reported differences to keep the browser responsive. Additional changes may exist; narrow the documents or compare a smaller subtree when every difference matters.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-gray-900">The comparison stays local, but meaning still comes from the application</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Both JSON documents are parsed and compared in the browser without being sent to a comparison API. Structural equality does not prove that two responses have the same permissions, timestamps, side effects, schema validity, or business meaning.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Compare the JSON values, not their indentation</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A text diff notices spaces, line breaks, and reordered object members. A structural comparison first parses both documents and then follows the values. That means <code>{`{"a":1,"b":2}`}</code> and a pretty-printed object with <code>b</code> written before <code>a</code> compare as equal.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Arrays are different because position is part of their structure. Swapping two array items changes the values at those indexes. Paths are written as <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc6901" target="_blank" rel="noreferrer">JSON Pointers from RFC 6901</a>: <code>/users/0/name</code> identifies the <code>name</code> member in the first array item, while <code>~1</code> represents a slash inside a member name and <code>~0</code> represents a tilde.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Object order is ignored</h2>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`{"name":"Sneha","age":30}`}</pre>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`{"age":30,"name":"Sneha"}`}</pre>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">The same member names point to the same values, so source order does not create a difference.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Array order is preserved</h2>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`{"roles":["editor","viewer"]}`}</pre>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`{"roles":["viewer","editor"]}`}</pre>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Both <code>/roles/0</code> and <code>/roles/1</code> change because the indexes are significant.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Read each difference as a statement about one path</h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900"><tr><th className="px-4 py-3">Result</th><th className="px-4 py-3">Meaning</th></tr></thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                <tr><td className="px-4 py-3 font-medium text-gray-900">Added</td><td className="px-4 py-3">The path exists only in the right document.</td></tr>
                <tr><td className="px-4 py-3 font-medium text-gray-900">Removed</td><td className="px-4 py-3">The path exists only in the left document.</td></tr>
                <tr><td className="px-4 py-3 font-medium text-gray-900">Changed</td><td className="px-4 py-3">Both sides have the same JSON type at that path but different values.</td></tr>
                <tr><td className="px-4 py-3 font-medium text-gray-900">Type changed</td><td className="px-4 py-3">The path moved between JSON types, such as number <code>1</code> and string <code>&quot;1&quot;</code>.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Large numbers need more care than JavaScript Number provides</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON number syntax is not limited to JavaScript&apos;s exact integer range. Converting every numeric token to IEEE-754 binary64 before comparing can make distinct large integers look equal. The parser keeps the original number token and normalizes its decimal value without passing it through JavaScript <code>Number</code>, so <code>9007199254740992</code> and <code>9007199254740993</code> remain distinct.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Spellings such as <code>1</code>, <code>1.0</code>, and <code>1e0</code> compare as the same numeric value. <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc8259" target="_blank" rel="noreferrer">RFC 8259</a> defines the JSON number grammar and also explains the interoperability limits that appear when implementations restrict numeric range or precision.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Repeated object names make the result ambiguous</h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            JSON syntax can contain the same member name more than once, but RFC 8259 says names <em>should</em> be unique because receiving software does not agree on what duplicates mean. Some implementations keep the last value, some report an error, and others expose every occurrence.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Repeated names are reported before comparison and the last occurrence is used for the structural tree. Treat that as a diagnostic convention, not as proof that another parser will make the same choice. A JSON Pointer aimed at a duplicated name is also not well-defined by RFC 6901.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Small differences that often explain API failures</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Missing is different from null</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600"><code>{`{"middleName":null}`}</code> explicitly contains a member. <code>{`{}`}</code> does not. Many APIs assign different meaning to those cases.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">JSON types are not coerced</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600"><code>0</code>, <code>false</code>, <code>null</code>, and <code>&quot;0&quot;</code> remain different. JavaScript truthiness is not applied.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Unicode normalization is not automatic</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">Two strings that look identical can contain different Unicode code-point sequences. String values are compared exactly after JSON escape decoding, without NFC/NFD normalization.</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Unpaired surrogates deserve a warning</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">JSON&apos;s grammar can represent escapes such as <code>\uDEAD</code>, but RFC 8259 warns that lone UTF-16 surrogates can produce unpredictable behavior across software. Locations are reported without silently rewriting the string.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What a structural diff cannot tell you</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Equal structure does not mean equal application behavior. Authorization, timestamps, omitted defaults, schema rules, side effects, and external state can matter even when two JSON documents match. Arrays are compared by index rather than by an <code>id</code> field, and objects are not treated as ordered records.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser work is intentionally bounded: nesting deeper than {MAX_PARSE_DEPTH} levels is rejected, and comparison stops after {MAX_REPORTED_DIFFS} reported differences. Those limits prevent an accidental giant payload from turning the page into an unresponsive diff viewer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When the next question is validity rather than difference</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Syntax validation answers whether JSON can be parsed; JSON Schema answers whether a parsed value follows a contract. A diff answers neither of those questions—it only describes how two parsed values differ.
          </p>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-diff-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
