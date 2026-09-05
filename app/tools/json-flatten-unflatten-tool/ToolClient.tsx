"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "flatten" | "unflatten";
type PathToken =
  | { type: "property"; value: string }
  | { type: "index"; value: number };

const MAX_NODES = 25000;
const MAX_DEPTH = 120;

const nestedExample = `{
  "user": {
    "name": "Sneha",
    "profile.name": "editor",
    "skills": ["JSON", "APIs"]
  },
  "settings": {
    "notifications": {}
  }
}`;

const flatExample = `{
  "$.user.name": "Sneha",
  "$.user.profile\\\\.name": "editor",
  "$.user.skills[0]": "JSON",
  "$.user.skills[1]": "APIs",
  "$.settings.notifications": {}
}`;

export default function ToolClient() {
  const [mode, setMode] = useState<Mode>("flatten");
  const [input, setInput] = useState(nestedExample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const processJson = () => {
    if (!input.trim()) {
      setError("Enter JSON before processing it.");
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const parsed: unknown = JSON.parse(input);
      const result =
        mode === "flatten"
          ? flattenJson(parsed)
          : unflattenJson(assertFlatObject(parsed));

      setOutput(JSON.stringify(result, null, 2));
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process this JSON.");
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
      setError("Copy failed. Select the output and copy it manually.");
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(mode === "flatten" ? nestedExample : flatExample);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  const switchMode = (value: string) => {
    const nextMode = value as Mode;
    setMode(nextMode);
    setInput(nextMode === "flatten" ? nestedExample : flatExample);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON Flatten / Unflatten Tool"
      description="Flatten JSON into escaped dot/bracket paths, then rebuild the original nested structure."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            JSON Input
          </label>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            spellCheck={false}
            placeholder={mode === "flatten" ? nestedExample : flatExample}
            className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {mode === "flatten"
              ? "Objects become escaped property paths and arrays keep explicit [index] segments."
              : "Paste the flattened object produced by this page, including the leading $ root marker."}
          </p>
        </div>

        <div className="self-start">
          <YoryantraSelect
            label="Mode"
            value={mode}
            onChange={switchMode}
            options={[
              { label: "Flatten JSON", value: "flatten" },
              { label: "Unflatten JSON", value: "unflatten" },
            ]}
          />

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
            <p className="font-medium text-gray-900">Path convention</p>
            <p className="mt-2">
              Object keys use dots, array positions use brackets, and special
              characters inside keys are escaped with a backslash.
            </p>
            <code className="mt-3 block overflow-x-auto rounded-lg bg-white p-3 text-xs text-gray-700">
              $.users[0].profile\.name
            </code>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processJson}
          className="yoryantra-btn min-h-10 whitespace-nowrap"
        >
          {mode === "flatten" ? "Flatten JSON" : "Unflatten JSON"}
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
        >
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
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Processed JSON will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing and transformation run in your browser. The page does not send
        the JSON you paste to a processing API.
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        <strong>Path-format caution:</strong> escaped dot/bracket paths are a
        local convention, not a JSON standard. When another system requires a
        standard pointer syntax, use{" "}
        <a
          href="https://www.rfc-editor.org/rfc/rfc6901"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-2"
        >
          JSON Pointer (RFC 6901)
        </a>
        .
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A flat path is only useful if it can describe the original shape
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Flattened JSON often ends up in spreadsheets, environment-style
            maps, log pipelines, comparison scripts, or migration code. The
            difficult part is not turning nested objects into strings; it is
            keeping enough structure to rebuild them later without guessing.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Array positions therefore use <code>[0]</code>, while a numeric
            object key stays a property such as <code>.0</code>. Dots,
            brackets, and backslashes that belong to a real key are escaped.
            That distinction prevents a key named <code>profile.name</code>
            from being mistaken for two nested properties.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Empty objects, root arrays, and awkward key names are preserved
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">Empty containers</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                An empty object or array is written as a value at its own path
                instead of disappearing during recursion. A completely empty
                root uses the path <code>$</code>.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900">Root arrays</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                A top-level array starts with paths such as <code>$[0]</code>
                and <code>$[1]</code>, so unflattening can restore an array
                rather than inventing object keys named “0” and “1”.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Structural conflicts stop instead of silently overwriting data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Hand-edited flat maps can contradict themselves. For example,
            <code> $.user</code> cannot be a string while
            <code> $.user.name</code> also exists, and an object path cannot
            suddenly continue as an array index. Those cases return an error
            instead of replacing an earlier value.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Arrays must also rebuild without missing indexes. A map containing
            only <code>$[2]</code> would otherwise create sparse JavaScript
            array slots that stringify as nulls, which would not represent the
            supplied flat data faithfully.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Dot paths and JSON Pointer solve related problems differently
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON itself defines objects, arrays, strings, numbers, booleans,
            and null, but it does not define “dot notation” for addressing a
            nested value. <a
              href="https://www.rfc-editor.org/rfc/rfc8259"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-800 underline underline-offset-2"
            >RFC 8259</a> is the JSON data-format standard; <a
              href="https://www.rfc-editor.org/rfc/rfc6901"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-800 underline underline-offset-2"
            >RFC 6901</a> separately defines JSON Pointer for identifying a
            value within a JSON document.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Keep that boundary in mind when flattened paths become an API
            contract. A local convention is fine when both sides agree on it;
            a public protocol should name and document the exact path syntax it
            accepts.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Limits worth knowing before flattening very large payloads
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Input must be valid JSON; JavaScript comments and trailing commas are rejected.</li>
            <li>Processing stops beyond {MAX_NODES.toLocaleString()} visited values or {MAX_DEPTH} nested levels to keep the page responsive.</li>
            <li>Duplicate member names are already resolved by the browser&apos;s JSON parser before flattening; interoperable JSON should use unique object names.</li>
            <li>Flattened output is intended for reversible structure work, not as a canonical JSON serialization or signing format.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-flatten-unflatten-tool" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function flattenJson(value: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  const state = { nodes: 0 };

  const visit = (current: unknown, path: string, depth: number) => {
    state.nodes += 1;
    if (state.nodes > MAX_NODES) {
      throw new Error(`This JSON exceeds the ${MAX_NODES.toLocaleString()}-value processing limit.`);
    }
    if (depth > MAX_DEPTH) {
      throw new Error(`This JSON exceeds the ${MAX_DEPTH}-level nesting limit.`);
    }

    if (Array.isArray(current)) {
      if (current.length === 0) {
        result[path] = [];
        return;
      }
      current.forEach((item, index) => visit(item, `${path}[${index}]`, depth + 1));
      return;
    }

    if (isPlainObject(current)) {
      const entries = Object.entries(current);
      if (entries.length === 0) {
        result[path] = {};
        return;
      }
      entries.forEach(([key, item]) => {
        visit(item, `${path}.${escapePathSegment(key)}`, depth + 1);
      });
      return;
    }

    result[path] = current;
  };

  visit(value, "$", 0);
  return result;
}

function unflattenJson(flatObject: Record<string, unknown>): unknown {
  const entries = Object.entries(flatObject);
  if (entries.length > MAX_NODES) {
    throw new Error(`This flattened map exceeds the ${MAX_NODES.toLocaleString()}-path processing limit.`);
  }
  if (entries.length === 0) {
    throw new Error("No flattened paths were found. A flattened map needs at least one $ path.");
  }

  if (entries.some(([path]) => path === "$")) {
    if (entries.length !== 1) {
      throw new Error("The root path $ cannot be combined with child paths.");
    }
    return entries[0][1];
  }

  let root: unknown;
  let rootSet = false;

  entries.forEach(([path, value]) => {
    const tokens = parsePath(path);
    if (tokens.length === 0) {
      throw new Error(`Invalid flattened path: ${path}`);
    }

    if (!rootSet) {
      root = tokens[0].type === "index" ? [] : createObject();
      rootSet = true;
    }

    const firstNeedsArray = tokens[0].type === "index";
    if (firstNeedsArray !== Array.isArray(root)) {
      throw new Error(`Path ${path} conflicts with the root container type.`);
    }

    setPathValue(root, tokens, value, path);
  });

  assertNoSparseArrays(root, "$", 0);
  return root;
}

function setPathValue(root: unknown, tokens: PathToken[], value: unknown, sourcePath: string) {
  let current: unknown = root;

  tokens.forEach((token, index) => {
    const isLast = index === tokens.length - 1;
    const nextToken = tokens[index + 1];

    if (token.type === "index") {
      if (!Array.isArray(current)) {
        throw new Error(`Path ${sourcePath} uses an array index inside an object path.`);
      }

      if (isLast) {
        if (Object.prototype.hasOwnProperty.call(current, token.value)) {
          throw new Error(`Path ${sourcePath} conflicts with a value that was already assigned.`);
        }
        current[token.value] = value;
        return;
      }

      const expectedArray = nextToken.type === "index";
      const existing = current[token.value];
      if (existing === undefined) {
        current[token.value] = expectedArray ? [] : createObject();
      } else if (Array.isArray(existing) !== expectedArray || !isContainer(existing)) {
        throw new Error(`Path ${sourcePath} conflicts with an earlier container shape.`);
      }
      current = current[token.value];
      return;
    }

    if (!isPlainObject(current)) {
      throw new Error(`Path ${sourcePath} uses an object key inside an array path.`);
    }

    if (isLast) {
      if (Object.prototype.hasOwnProperty.call(current, token.value)) {
        throw new Error(`Path ${sourcePath} conflicts with a value that was already assigned.`);
      }
      defineSafeProperty(current, token.value, value);
      return;
    }

    const expectedArray = nextToken.type === "index";
    const existing = current[token.value];
    if (existing === undefined) {
      defineSafeProperty(current, token.value, expectedArray ? [] : createObject());
    } else if (Array.isArray(existing) !== expectedArray || !isContainer(existing)) {
      throw new Error(`Path ${sourcePath} conflicts with an earlier container shape.`);
    }
    current = current[token.value];
  });
}

function parsePath(path: string): PathToken[] {
  if (!path.startsWith("$")) {
    throw new Error(`Path ${path} must start with $.`);
  }

  const tokens: PathToken[] = [];
  let index = 1;

  while (index < path.length) {
    const marker = path[index];

    if (marker === ".") {
      index += 1;
      let value = "";
      let escaping = false;

      while (index < path.length) {
        const char = path[index];
        if (escaping) {
          value += char;
          escaping = false;
          index += 1;
          continue;
        }
        if (char === "\\") {
          escaping = true;
          index += 1;
          continue;
        }
        if (char === "." || char === "[") break;
        if (char === "]") {
          throw new Error(`Unescaped ] in path ${path}. Escape bracket characters inside object keys.`);
        }
        value += char;
        index += 1;
      }

      if (escaping) {
        throw new Error(`Path ${path} ends with an incomplete escape.`);
      }
      tokens.push({ type: "property", value });
      continue;
    }

    if (marker === "[") {
      const close = path.indexOf("]", index + 1);
      if (close === -1) {
        throw new Error(`Path ${path} has an unclosed array index.`);
      }
      const rawIndex = path.slice(index + 1, close);
      if (!/^(0|[1-9]\d*)$/.test(rawIndex)) {
        throw new Error(`Path ${path} contains an invalid array index.`);
      }
      const numericIndex = Number(rawIndex);
      if (!Number.isSafeInteger(numericIndex) || numericIndex >= MAX_NODES) {
        throw new Error(`Path ${path} contains an array index outside the supported 0–${MAX_NODES - 1} range.`);
      }
      tokens.push({ type: "index", value: numericIndex });
      index = close + 1;
      continue;
    }

    throw new Error(`Unexpected character in path ${path} at position ${index + 1}.`);
  }

  return tokens;
}

function escapePathSegment(segment: string) {
  return segment.replace(/[\\.\[\]]/g, (character) => `\\${character}`);
}

function assertFlatObject(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new Error("Unflatten mode expects a JSON object whose property names are flattened paths.");
  }
  return value;
}

function assertNoSparseArrays(value: unknown, path: string, depth: number) {
  if (depth > MAX_DEPTH) {
    throw new Error(`The rebuilt JSON exceeds the ${MAX_DEPTH}-level nesting limit.`);
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) {
        throw new Error(`Array path ${path} is missing index ${index}; sparse arrays are not valid round-trip output.`);
      }
      assertNoSparseArrays(value[index], `${path}[${index}]`, depth + 1);
    }
    return;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      assertNoSparseArrays(item, `${path}.${escapePathSegment(key)}`, depth + 1);
    });
  }
}

function createObject(): Record<string, unknown> {
  return Object.create(null) as Record<string, unknown>;
}

function defineSafeProperty(target: Record<string, unknown>, key: string, value: unknown) {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

function isContainer(value: unknown) {
  return Array.isArray(value) || isPlainObject(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
