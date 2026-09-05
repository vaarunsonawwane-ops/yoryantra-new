"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type SortDirection = "asc" | "desc";
type OutputSpacing = "two" | "four" | "compact";

const MAX_DEPTH = 120;
const MAX_VALUES = 25000;

const sampleJson = `{
  "zebra": "last",
  "user": {
    "name": "Sneha",
    "active": true,
    "id": 101,
    "profile": {
      "role": "developer",
      "country": "India"
    }
  },
  "alpha": "first",
  "steps": [
    { "name": "validate", "order": 1 },
    { "name": "publish", "order": 2 }
  ]
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [outputSpacing, setOutputSpacing] = useState<OutputSpacing>("two");
  const [copied, setCopied] = useState(false);

  const sortJsonKeys = () => {
    if (!input.trim()) {
      setError("Enter JSON before sorting its object keys.");
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      preflightJson(input);
      const parsed: unknown = JSON.parse(input);
      const spacing = getSpacingValue(outputSpacing);
      const serialized = serializeSortedJson(parsed, sortDirection, spacing);

      setOutput(serialized);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sort this JSON safely.");
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the sorted JSON and copy it manually.");
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(sampleJson);
    setOutput("");
    setError("");
    setSortDirection("asc");
    setOutputSpacing("two");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setSortDirection("asc");
    setOutputSpacing("two");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON Sort Keys Tool"
      description="Sort every JSON object key deterministically while preserving array order and value meaning."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">JSON Input</label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          spellCheck={false}
          placeholder={sampleJson}
          className="w-full min-h-[350px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Object keys are sorted recursively. Array elements stay in their original sequence, including arrays of objects.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Output order and spacing</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Key Order"
            value={sortDirection}
            onChange={(value) => {
              setSortDirection(value as SortDirection);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Ascending (UTF-16)", value: "asc" },
              { label: "Descending (UTF-16)", value: "desc" },
            ]}
          />

          <YoryantraSelect
            label="Output Spacing"
            value={outputSpacing}
            onChange={(value) => {
              setOutputSpacing(value as OutputSpacing);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "2 spaces", value: "two" },
              { label: "4 spaces", value: "four" },
              { label: "Compact", value: "compact" },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={sortJsonKeys} className="yoryantra-btn min-h-10 whitespace-nowrap">
          Sort JSON Keys
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

      <div className="mt-8 min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Sorted JSON</h3>
          {output && (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[310px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Recursively sorted JSON will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing and sorting run in your browser. The page does not send the JSON you paste to a processing API.
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        <strong>Not canonical JSON:</strong> deterministic key order is only one part of canonicalization. RFC 8785 also defines primitive serialization and other constraints, so do not use this output as a signing or hashing canonical form.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Sorting object members is presentation; array order is data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON objects are defined as unordered collections of name/value pairs, while arrays are ordered sequences. That difference is why every object can be sorted recursively without moving a single array element. A deployment step list, priority list, breadcrumb sequence, or test case array keeps its original order.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The distinction comes directly from <a href="https://www.rfc-editor.org/rfc/rfc8259" target="_blank" rel="noreferrer" className="font-medium text-gray-800 underline underline-offset-2">RFC 8259</a>. Member order can still matter to humans and diff tools, but software should not depend on JSON object ordering for data meaning.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The comparison is locale-independent and deterministic
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Human-language collation can vary by locale, browser, and accent rules. Keys here are compared by raw JavaScript UTF-16 string values instead. That gives the same ordering rule for the same input rather than asking the runtime whether, for example, an accented letter should sort beside its unaccented form.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Ascending order follows the same UTF-16 value-comparison idea used by the property-sorting step in <a href="https://www.rfc-editor.org/rfc/rfc8785" target="_blank" rel="noreferrer" className="font-medium text-gray-800 underline underline-offset-2">RFC 8785 JSON Canonicalization Scheme</a>. Descending order is provided for inspection, but it is not JCS canonicalization.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Two inputs are rejected before they can be silently changed
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">Duplicate object names</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                JSON member names should be unique for interoperable data. Browser parsers commonly keep one value when names repeat, so duplicate names are detected before parsing and sorting instead of quietly discarding an earlier member.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">Numbers that would lose their decimal value</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                JavaScript parses JSON numbers as binary64 numbers. If converting a numeric token to JavaScript and back would change its exact decimal value, sorting stops and asks you to represent that value as a string or use a lossless parser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Clean diffs are a good reason to sort; signatures are not
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Recursive key ordering can make generated fixtures, configuration snapshots, debugging captures, and review diffs easier to scan. It is also useful when two systems emit the same object members in different presentation orders.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cryptographic canonicalization is a different job. JCS fixes much more than property order, including how numbers and strings are serialized. A visually stable sort should not be substituted for a protocol&apos;s required canonical form.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Limits and serialization details
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Input must be valid JSON; comments, trailing commas, NaN, and Infinity are not valid JSON syntax.</li>
            <li>String escape spelling may normalize in output because the parsed string value is serialized again.</li>
            <li>Negative zero is rejected because JSON serialization through JavaScript would turn it into <code>0</code>.</li>
            <li>Processing stops beyond {MAX_VALUES.toLocaleString()} values or {MAX_DEPTH} nested levels to protect page responsiveness.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-sort-keys" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function serializeSortedJson(value: unknown, direction: SortDirection, spacing: number) {
  const state = { values: 0 };

  const serialize = (current: unknown, depth: number): string => {
    state.values += 1;
    if (state.values > MAX_VALUES) {
      throw new Error(`This JSON exceeds the ${MAX_VALUES.toLocaleString()}-value sorting limit.`);
    }
    if (depth > MAX_DEPTH) {
      throw new Error(`This JSON exceeds the ${MAX_DEPTH}-level nesting limit.`);
    }

    if (Array.isArray(current)) {
      const parts = current.map((item) => serialize(item, depth + 1));
      return joinSerialized(parts, "[", "]", depth, spacing);
    }

    if (isPlainObject(current)) {
      const keys = Object.keys(current).sort((a, b) => compareKeys(a, b, direction));
      const parts = keys.map((key) => {
        const keyText = JSON.stringify(key);
        const valueText = serialize(current[key], depth + 1);
        return spacing === 0 ? `${keyText}:${valueText}` : `${keyText}: ${valueText}`;
      });
      return joinSerialized(parts, "{", "}", depth, spacing);
    }

    const primitive = JSON.stringify(current);
    if (primitive === undefined) {
      throw new Error("A value could not be serialized as JSON.");
    }
    return primitive;
  };

  return serialize(value, 0);
}

function joinSerialized(parts: string[], open: string, close: string, depth: number, spacing: number) {
  if (parts.length === 0) return `${open}${close}`;
  if (spacing === 0) return `${open}${parts.join(",")}${close}`;

  const childIndent = " ".repeat((depth + 1) * spacing);
  const closingIndent = " ".repeat(depth * spacing);
  return `${open}\n${parts.map((part) => `${childIndent}${part}`).join(",\n")}\n${closingIndent}${close}`;
}

function compareKeys(a: string, b: string, direction: SortDirection) {
  if (a === b) return 0;
  const ascending = a < b ? -1 : 1;
  return direction === "asc" ? ascending : -ascending;
}

function preflightJson(text: string) {
  let index = 0;
  let values = 0;

  const skipWhitespace = () => {
    while (index < text.length && /\s/.test(text[index])) index += 1;
  };

  const parseString = (): string => {
    const start = index;
    if (text[index] !== '"') throw new Error("Expected a JSON string.");
    index += 1;
    let escaped = false;

    while (index < text.length) {
      const char = text[index];
      if (escaped) {
        escaped = false;
        index += 1;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        index += 1;
        continue;
      }
      if (char === '"') {
        index += 1;
        return JSON.parse(text.slice(start, index)) as string;
      }
      index += 1;
    }

    throw new Error("Unterminated JSON string.");
  };

  const parseNumber = () => {
    const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error("Invalid JSON number.");
    const token = match[0];
    const numeric = Number(token);

    if (!Number.isFinite(numeric)) {
      throw new Error(`Number ${token} is outside JavaScript's finite numeric range.`);
    }
    if (numeric === 0 && token.startsWith("-")) {
      throw new Error("Negative zero would be normalized to 0 during serialization, so sorting was stopped.");
    }

    const roundTrip = numeric.toString();
    if (normalizeDecimal(token) !== normalizeDecimal(roundTrip)) {
      throw new Error(`Number ${token} cannot round-trip through JavaScript without changing its decimal value.`);
    }

    index += token.length;
  };

  const parseValue = (depth: number): void => {
    values += 1;
    if (values > MAX_VALUES) {
      throw new Error(`This JSON exceeds the ${MAX_VALUES.toLocaleString()}-value sorting limit.`);
    }
    if (depth > MAX_DEPTH) {
      throw new Error(`This JSON exceeds the ${MAX_DEPTH}-level nesting limit.`);
    }
    skipWhitespace();
    const char = text[index];

    if (char === "{") {
      parseObject(depth + 1);
      return;
    }
    if (char === "[") {
      parseArray(depth + 1);
      return;
    }
    if (char === '"') {
      parseString();
      return;
    }
    if (text.startsWith("true", index)) {
      index += 4;
      return;
    }
    if (text.startsWith("false", index)) {
      index += 5;
      return;
    }
    if (text.startsWith("null", index)) {
      index += 4;
      return;
    }
    parseNumber();
  };

  const parseObject = (depth: number) => {
    index += 1;
    skipWhitespace();
    const keys = new Set<string>();
    if (text[index] === "}") {
      index += 1;
      return;
    }

    while (index < text.length) {
      skipWhitespace();
      const key = parseString();
      if (keys.has(key)) {
        throw new Error(`Duplicate object member name ${JSON.stringify(key)} was found. Sorting would discard one of its values.`);
      }
      keys.add(key);
      skipWhitespace();
      if (text[index] !== ":") throw new Error("Expected : after an object member name.");
      index += 1;
      parseValue(depth);
      skipWhitespace();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      if (text[index] !== ",") throw new Error("Expected , or } inside a JSON object.");
      index += 1;
    }

    throw new Error("Unclosed JSON object.");
  };

  const parseArray = (depth: number) => {
    index += 1;
    skipWhitespace();
    if (text[index] === "]") {
      index += 1;
      return;
    }

    while (index < text.length) {
      parseValue(depth);
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      if (text[index] !== ",") throw new Error("Expected , or ] inside a JSON array.");
      index += 1;
    }

    throw new Error("Unclosed JSON array.");
  };

  parseValue(0);
  skipWhitespace();
  if (index !== text.length) {
    throw new Error("Unexpected content appears after the JSON value.");
  }
}

function normalizeDecimal(token: string) {
  let value = token.toLowerCase();
  let sign = "";
  if (value.startsWith("-")) {
    sign = "-";
    value = value.slice(1);
  } else if (value.startsWith("+")) {
    value = value.slice(1);
  }

  const exponentParts = value.split("e");
  const mantissa = exponentParts[0];
  const exponent = exponentParts.length > 1 ? Number(exponentParts[1]) : 0;
  const dotIndex = mantissa.indexOf(".");
  const fractionalDigits = dotIndex === -1 ? 0 : mantissa.length - dotIndex - 1;
  let digits = mantissa.replace(".", "").replace(/^0+/, "");

  if (!digits) return "0e0";

  let power = exponent - fractionalDigits;
  while (digits.endsWith("0")) {
    digits = digits.slice(0, -1);
    power += 1;
  }

  return `${sign}${digits}e${power}`;
}

function getSpacingValue(outputSpacing: OutputSpacing) {
  if (outputSpacing === "four") return 4;
  if (outputSpacing === "compact") return 0;
  return 2;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
