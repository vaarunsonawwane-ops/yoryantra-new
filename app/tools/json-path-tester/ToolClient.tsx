"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type PathResult = {
  path: string;
  value: unknown;
};

type Segment = {
  kind: "child" | "descendant";
  selectors: Selector[];
};

type Selector =
  | { kind: "name"; name: string }
  | { kind: "wildcard" }
  | { kind: "index"; index: number }
  | { kind: "slice"; start?: number; end?: number; step: number }
  | { kind: "filter"; expression: string };

const sampleJson = `{
  "store": {
    "book": [
      { "title": "Book A", "price": 8.95, "inStock": true },
      { "title": "Book B", "price": 12.5, "inStock": false },
      { "title": "Book C", "price": 7.25, "inStock": true }
    ],
    "bicycle": { "price": 19.95 }
  }
}`;

export default function ToolClient() {
  const [jsonInput, setJsonInput] = useState(sampleJson);
  const [pathInput, setPathInput] = useState("$.store.book[?@.price < 10].title");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const testPath = () => {
    if (!jsonInput.trim()) {
      setError("Paste JSON data to query.");
      setOutput("");
      return;
    }

    if (!pathInput.trim()) {
      setError("Enter a JSONPath expression.");
      setOutput("");
      return;
    }

    try {
      const data = JSON.parse(jsonInput) as unknown;
      const results = evaluateJsonPath(data, pathInput.trim());
      setOutput(formatPathResults(pathInput.trim(), results));
      setError("");
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Unable to evaluate this JSONPath.");
    }
  };

  const resetAll = () => {
    setJsonInput(sampleJson);
    setPathInput("$.store.book[?@.price < 10].title");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JSONPath Tester"
      description="Test common RFC 9535 JSONPath selectors against JSON data, including child names, wildcards, indices, slices, descendants, unions, and basic filters."
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          JSON data
        </label>
        <textarea
          value={jsonInput}
          onChange={(event: { target: { value: string } }) => setJsonInput(event.target.value)}
          rows={14}
          placeholder={sampleJson}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-gray-700">
          JSONPath
        </label>
        <input
          value={pathInput}
          onChange={(event: { target: { value: string } }) => setPathInput(event.target.value)}
          placeholder="$.store.book[*].title"
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Examples: <span className="font-mono">$['store']['book'][0]</span>,{" "}
          <span className="font-mono">$.store.book[-1]</span>,{" "}
          <span className="font-mono">$.store.book[0:2]</span>,{" "}
          <span className="font-mono">$..price</span>,{" "}
          <span className="font-mono">$.store.book[?@.price &lt; 10]</span>.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={testPath} className="yoryantra-btn">
          Test JSONPath
        </button>
        <button
          onClick={() => {
            setJsonInput(sampleJson);
            setPathInput("$.store.book[?@.price < 10].title");
            setOutput("");
            setError("");
          }}
          className="yoryantra-btn-outline"
        >
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

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            JSONPath results
          </h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output mt-3 min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Matched values and normalized result paths will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            JSONPath now has an IETF standard
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9535 defines JSONPath selectors such as name selectors, array
            indices, wildcards, slices, filters, and descendant segments. This
            tool follows that model for the common selectors implemented here
            instead of treating an arbitrary dot-path syntax as JSONPath.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Supported in this browser implementation
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Root $, dot-name shorthand, bracketed quoted names, and selector unions.</li>
            <li>Array indices including negative indices, wildcards, and start:end:step slices.</li>
            <li>Descendant names and descendant wildcards.</li>
            <li>Basic filter existence tests and primitive comparisons using @ relative paths.</li>
          </ul>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC function extensions and the complete filter-expression grammar
            are not implemented. Unsupported syntax is rejected rather than
            guessed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Selector behavior is based on{" "}
            <a href="https://www.rfc-editor.org/rfc/rfc9535.html" target="_blank" rel="noreferrer" className="font-medium underline">
              RFC 9535: JSONPath
            </a>
            . JSON and paths stay in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-path-tester" />
        </div>
      </section>
    </ToolShell>
  );
}

function evaluateJsonPath(data: unknown, expression: string): PathResult[] {
  const segments = parseJsonPath(expression);
  let current: PathResult[] = [{ path: "$", value: data }];

  segments.forEach((segment) => {
    const next: PathResult[] = [];

    if (segment.kind === "child") {
      current.forEach((node) => {
        segment.selectors.forEach((selector) => {
          next.push(...applySelector(node, selector));
        });
      });
    } else {
      current.forEach((node) => {
        const visited: PathResult[] = [];
        visitNodeAndDescendants(node, visited);
        visited.forEach((candidate) => {
          segment.selectors.forEach((selector) => {
            next.push(...applySelector(candidate, selector));
          });
        });
      });
    }

    current = next;
  });

  return current;
}

function parseJsonPath(expression: string): Segment[] {
  if (!expression.startsWith("$")) {
    throw new Error("A JSONPath expression must start with the root identifier $.");
  }

  if (expression === "$") return [];

  const segments: Segment[] = [];
  let index = 1;

  while (index < expression.length) {
    while (index < expression.length && /\s/.test(expression[index])) index += 1;
    if (index >= expression.length) break;

    if (expression.startsWith("..", index)) {
      index += 2;
      const parsed = parseSegmentSelectors(expression, index, true);
      segments.push({ kind: "descendant", selectors: parsed.selectors });
      index = parsed.nextIndex;
      continue;
    }

    if (expression[index] === ".") {
      index += 1;
      const parsed = parseShorthandSelector(expression, index);
      segments.push({ kind: "child", selectors: [parsed.selector] });
      index = parsed.nextIndex;
      continue;
    }

    if (expression[index] === "[") {
      const parsed = readBracket(expression, index);
      segments.push({
        kind: "child",
        selectors: parseSelectorList(parsed.content),
      });
      index = parsed.nextIndex;
      continue;
    }

    throw new Error(`Unsupported JSONPath syntax near "${expression.slice(index, index + 12)}".`);
  }

  return segments;
}

function parseSegmentSelectors(
  expression: string,
  index: number,
  descendant: boolean
) {
  if (expression[index] === "[") {
    const parsed = readBracket(expression, index);
    return {
      selectors: parseSelectorList(parsed.content),
      nextIndex: parsed.nextIndex,
    };
  }

  const parsed = parseShorthandSelector(expression, index);
  if (
    descendant &&
    parsed.selector.kind !== "name" &&
    parsed.selector.kind !== "wildcard"
  ) {
    throw new Error("Descendant shorthand supports a member name or wildcard.");
  }

  return { selectors: [parsed.selector], nextIndex: parsed.nextIndex };
}

function parseShorthandSelector(expression: string, index: number) {
  if (expression[index] === "*") {
    return {
      selector: { kind: "wildcard" } as Selector,
      nextIndex: index + 1,
    };
  }

  let name = "";
  let cursor = index;

  while (cursor < expression.length && isShorthandNameChar(expression[cursor], name.length === 0)) {
    name += expression[cursor];
    cursor += 1;
  }

  if (!name) {
    throw new Error("Expected a JSONPath member name or wildcard.");
  }

  return {
    selector: { kind: "name", name } as Selector,
    nextIndex: cursor,
  };
}

function readBracket(expression: string, start: number) {
  let quote = "";
  let escaped = false;

  for (let index = start + 1; index < expression.length; index += 1) {
    const char = expression[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\" && quote) {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) quote = "";
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (char === "]") {
      return {
        content: expression.slice(start + 1, index).trim(),
        nextIndex: index + 1,
      };
    }
  }

  throw new Error("Missing closing ] in JSONPath expression.");
}

function parseSelectorList(content: string): Selector[] {
  if (!content) {
    throw new Error("JSONPath bracket selection cannot be empty.");
  }

  if (content.trim().startsWith("?")) {
    return [{ kind: "filter", expression: content.trim().slice(1).trim() }];
  }

  return splitTopLevel(content, ",").map((item) => parseSelector(item.trim()));
}

function parseSelector(value: string): Selector {
  if (value === "*") return { kind: "wildcard" };

  if (value.startsWith("'") && value.endsWith("'")) {
    return { kind: "name", name: decodeSingleQuoted(value) };
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      const decoded = JSON.parse(value) as unknown;
      if (typeof decoded !== "string") throw new Error();
      return { kind: "name", name: decoded };
    } catch {
      throw new Error(`Invalid double-quoted JSONPath name selector ${value}.`);
    }
  }

  if (value.startsWith('"') || value.endsWith('"')) {
    throw new Error("Unclosed double-quoted JSONPath name selector.");
  }

  if (/^-?(?:0|[1-9]\d*)$/.test(value)) {
    const number = Number(value);
    if (!Number.isSafeInteger(number)) {
      throw new Error(`Array index ${value} is outside the safe integer range.`);
    }
    return { kind: "index", index: number };
  }

  if (value.includes(":")) {
    const parts = value.split(":");
    if (parts.length < 2 || parts.length > 3) {
      throw new Error(`Invalid array slice "${value}".`);
    }

    const readPart = (part: string) => {
      if (!part) return undefined;
      if (!/^-?(?:0|[1-9]\d*)$/.test(part)) {
        throw new Error(`Invalid slice number "${part}".`);
      }
      const number = Number(part);
      if (!Number.isSafeInteger(number)) {
        throw new Error(`Slice value ${part} is outside the safe integer range.`);
      }
      return number;
    };

    const start = readPart(parts[0]);
    const end = readPart(parts[1]);
    const step = parts.length === 3 ? readPart(parts[2]) : 1;
    return { kind: "slice", start, end, step: step ?? 1 };
  }

  throw new Error(`Unsupported selector "${value}". Use quoted names, indices, wildcards, slices, or filters.`);
}

function applySelector(node: PathResult, selector: Selector): PathResult[] {
  if (selector.kind === "name") {
    if (!isRecord(node.value) || !(selector.name in node.value)) return [];
    return [
      {
        path: appendResultName(node.path, selector.name),
        value: node.value[selector.name],
      },
    ];
  }

  if (selector.kind === "wildcard") {
    if (Array.isArray(node.value)) {
      return node.value.map((value, index) => ({
        path: `${node.path}[${index}]`,
        value,
      }));
    }

    if (isRecord(node.value)) {
      return Object.entries(node.value).map(([name, value]) => ({
        path: appendResultName(node.path, name),
        value,
      }));
    }

    return [];
  }

  if (selector.kind === "index") {
    if (!Array.isArray(node.value)) return [];
    const index = selector.index < 0 ? node.value.length + selector.index : selector.index;
    if (index < 0 || index >= node.value.length) return [];
    return [{ path: `${node.path}[${index}]`, value: node.value[index] }];
  }

  if (selector.kind === "slice") {
    if (!Array.isArray(node.value)) return [];
    const arrayValue = node.value;
    return sliceIndexes(arrayValue.length, selector)
      .map((index) => ({ path: `${node.path}[${index}]`, value: arrayValue[index] }));
  }

  const children = childNodes(node);
  return children.filter((child) => evaluateBasicFilter(child.value, selector.expression));
}

function childNodes(node: PathResult): PathResult[] {
  if (Array.isArray(node.value)) {
    return node.value.map((value, index) => ({
      path: `${node.path}[${index}]`,
      value,
    }));
  }

  if (isRecord(node.value)) {
    return Object.entries(node.value).map(([name, value]) => ({
      path: appendResultName(node.path, name),
      value,
    }));
  }

  return [];
}

function visitNodeAndDescendants(node: PathResult, output: PathResult[]) {
  output.push(node);
  childNodes(node).forEach((child) => visitNodeAndDescendants(child, output));
}

function sliceIndexes(
  length: number,
  selector: Extract<Selector, { kind: "slice" }>
) {
  const step = selector.step;
  const indexes: number[] = [];

  if (step === 0) return indexes;

  if (step > 0) {
    const start = normalizePositiveBound(selector.start, length, 0);
    const end = normalizePositiveBound(selector.end, length, length);
    for (let index = start; index < end; index += step) indexes.push(index);
    return indexes;
  }

  const start = normalizeNegativeBound(selector.start, length, length - 1, false);
  const end = normalizeNegativeBound(selector.end, length, -1, true);
  for (let index = start; index > end; index += step) indexes.push(index);
  return indexes;
}

function normalizePositiveBound(value: number | undefined, length: number, fallback: number) {
  if (value === undefined) return fallback;
  const normalized = value < 0 ? length + value : value;
  return Math.min(Math.max(normalized, 0), length);
}

function normalizeNegativeBound(
  value: number | undefined,
  length: number,
  fallback: number,
  isEnd: boolean
) {
  if (value === undefined) return fallback;
  let normalized = value < 0 ? length + value : value;
  if (isEnd) normalized = Math.min(Math.max(normalized, -1), length - 1);
  else normalized = Math.min(Math.max(normalized, -1), length - 1);
  return normalized;
}

function evaluateBasicFilter(current: unknown, expression: string) {
  if (!expression) throw new Error("Filter selector is missing an expression.");

  const comparison = findComparison(expression);
  if (!comparison) {
    const values = readRelativeQuery(current, expression.trim());
    return values.length > 0;
  }

  const leftValues = readRelativeQuery(current, comparison.left.trim());
  const right = parseFilterLiteral(comparison.right.trim());

  return leftValues.some((left) =>
    comparePrimitive(left, right, comparison.operator)
  );
}

function findComparison(expression: string) {
  let quote = "";
  let escaped = false;
  const operators = ["==", "!=", "<=", ">=", "<", ">"];

  for (let index = 0; index < expression.length; index += 1) {
    const char = expression[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\" && quote) {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) quote = "";
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    const operator = operators.find((candidate) =>
      expression.startsWith(candidate, index)
    );
    if (operator) {
      return {
        left: expression.slice(0, index),
        operator,
        right: expression.slice(index + operator.length),
      };
    }
  }

  return null;
}

function readRelativeQuery(current: unknown, query: string): unknown[] {
  if (query === "@") return [current];
  if (!query.startsWith("@")) {
    throw new Error("Basic filters in this tool require a relative query starting with @.");
  }

  const absolute = `$${query.slice(1)}`;
  const segments = parseJsonPath(absolute);

  if (
    segments.some((segment) =>
      segment.selectors.some(
        (selector) =>
          selector.kind === "wildcard" ||
          selector.kind === "slice" ||
          selector.kind === "filter"
      )
    )
  ) {
    throw new Error("Basic filter operands support singular member/index queries only.");
  }

  let nodes: PathResult[] = [{ path: "$", value: current }];
  segments.forEach((segment) => {
    if (segment.kind !== "child") {
      throw new Error("Basic filter operands do not support descendant segments.");
    }
    const next: PathResult[] = [];
    nodes.forEach((node) =>
      segment.selectors.forEach((selector) => next.push(...applySelector(node, selector)))
    );
    nodes = next;
  });

  return nodes.map((node) => node.value);
}

function parseFilterLiteral(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)) {
    return Number(value);
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    return JSON.parse(value) as unknown;
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return decodeSingleQuoted(value);
  }
  throw new Error(`Unsupported filter literal "${value}".`);
}

function comparePrimitive(left: unknown, right: unknown, operator: string) {
  const primitive =
    left === null ||
    typeof left === "string" ||
    typeof left === "number" ||
    typeof left === "boolean";

  if (!primitive) return false;

  if (operator === "==") return left === right;
  if (operator === "!=") return left !== right;

  if (
    (typeof left !== "number" || typeof right !== "number") &&
    (typeof left !== "string" || typeof right !== "string")
  ) {
    return false;
  }

  if (operator === "<") return left < right;
  if (operator === "<=") return left <= right;
  if (operator === ">") return left > right;
  if (operator === ">=") return left >= right;
  return false;
}

function splitTopLevel(value: string, separator: string) {
  const result: string[] = [];
  let quote = "";
  let escaped = false;
  let current = "";

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\" && quote) {
      current += char;
      escaped = true;
      continue;
    }

    if (quote) {
      current += char;
      if (char === quote) quote = "";
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }

    if (char === separator) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function decodeSingleQuoted(value: string) {
  const inner = value.slice(1, -1);
  let output = "";

  for (let index = 0; index < inner.length; index += 1) {
    const char = inner[index];
    if (char !== "\\") {
      output += char;
      continue;
    }

    index += 1;
    if (index >= inner.length) throw new Error("Invalid escape at end of name selector.");
    const escaped = inner[index];

    const simple: Record<string, string> = {
      "'": "'",
      "\\": "\\",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "\t",
      "/": "/",
    };

    if (escaped in simple) {
      output += simple[escaped];
      continue;
    }

    if (escaped === "u") {
      const hex = inner.slice(index + 1, index + 5);
      if (!/^[0-9A-Fa-f]{4}$/.test(hex)) {
        throw new Error("Invalid \\u escape in JSONPath name selector.");
      }
      output += String.fromCharCode(parseInt(hex, 16));
      index += 4;
      continue;
    }

    throw new Error(`Unsupported escape \\${escaped} in JSONPath name selector.`);
  }

  return output;
}

function isShorthandNameChar(char: string, first: boolean) {
  if (!char) return false;
  if (/[A-Za-z_]/.test(char)) return true;
  if (!first && /\d/.test(char)) return true;
  const code = char.charCodeAt(0);
  return code >= 0x80 && !(code >= 0xd800 && code <= 0xdfff);
}

function appendResultName(path: string, name: string) {
  const escaped = name.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `${path}['${escaped}']`;
}

function formatPathResults(expression: string, results: PathResult[]) {
  const lines = [
    "JSONPath test completed.",
    "",
    `Expression: ${expression}`,
    `Matches: ${results.length}`,
    "",
  ];

  if (!results.length) {
    lines.push("No nodes matched this expression.");
    return lines.join("\n");
  }

  results.forEach((result, index) => {
    lines.push(`${index + 1}. ${result.path}`);
    lines.push(JSON.stringify(result.value, null, 2));
    lines.push("");
  });

  return lines.join("\n").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
