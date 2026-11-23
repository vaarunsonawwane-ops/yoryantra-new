"use client";

import type { WorkflowPanelProps } from "../workflow-types";
import YoryantraSelect from "@/app/components/YoryantraSelect";

import { useEffect, useMemo, useState } from "react";
import { stringify } from "yaml";

type Options = {
  indent: number;
  lineWidth: number;
  forceQuotes: boolean;
  sortKeys: boolean;
};

type Result = {
  output: string;
  error: string;
  warnings: string[];
  notes: string[];
};

const DEFAULT_OPTIONS: Options = {
  indent: 2,
  lineWidth: -1,
  forceQuotes: false,
  sortKeys: false,
};

const MAX_INPUT_CHARACTERS = 2_000_000;
const MAX_JSON_NESTING = 512;

function jsonNestingDepth(source: string) {
  let depth = 0;
  let maximum = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      depth += 1;
      maximum = Math.max(maximum, depth);
    } else if (char === "}" || char === "]") {
      depth = Math.max(0, depth - 1);
    }
  }

  return maximum;
}

function hasUnpairedSurrogate(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return true;
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function containsUnpairedSurrogate(value: unknown) {
  const stack: unknown[] = [value];
  let visited = 0;

  while (stack.length) {
    const current = stack.pop();
    visited += 1;

    if (visited > 100_000) {
      return "The parsed JSON contains more than 100,000 values. Conversion was stopped to keep browser-side processing bounded.";
    }

    if (typeof current === "string") {
      if (hasUnpairedSurrogate(current)) {
        return "The JSON contains an unpaired UTF-16 surrogate in a string value. That sequence does not represent a portable Unicode scalar value for YAML output.";
      }
      continue;
    }

    if (!current || typeof current !== "object") {
      continue;
    }

    if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        stack.push(current[index]);
      }
      continue;
    }

    const object = current as Record<string, unknown>;
    const keys = Object.keys(object);

    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];

      if (hasUnpairedSurrogate(key)) {
        return "The JSON contains an unpaired UTF-16 surrogate in an object name. That sequence does not represent a portable Unicode scalar value for YAML output.";
      }

      stack.push(object[key]);
    }
  }

  return "";
}

function scanJsonNumberTokens(source: string) {
  const tokens: string[] = [];
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const match = source
        .slice(index)
        .match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);

      if (match) {
        tokens.push(match[0]);
        index += match[0].length - 1;
      }
    }
  }

  return tokens;
}

function integerOutsideSafeRange(token: string) {
  if (!/^-?(?:0|[1-9]\d*)$/.test(token)) {
    return false;
  }

  const digits =
    token.replace(/^-/, "").replace(/^0+/, "") || "0";
  const max = "9007199254740991";

  if (digits.length !== max.length) {
    return digits.length > max.length;
  }

  return digits > max;
}

function significantDigitCount(token: string) {
  const mantissa = token.split(/[eE]/)[0];
  const digits = mantissa.replace(/[-.]/g, "").replace(/^0+/, "");

  return digits.length;
}

function findDuplicateKeys(source: string) {
  let index = 0;
  const duplicates: string[] = [];

  const skipWhitespace = () => {
    while (
      index < source.length &&
      /[\x20\x09\x0a\x0d]/.test(source[index])
    ) {
      index += 1;
    }
  };

  const parseString = () => {
    const start = index;
    index += 1;
    let escaped = false;

    while (index < source.length) {
      const character = source[index];
      index += 1;

      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        break;
      }
    }

    return JSON.parse(source.slice(start, index)) as string;
  };

  const skipPrimitive = () => {
    while (
      index < source.length &&
      !/[\x20\x09\x0a\x0d,\]}]/.test(source[index])
    ) {
      index += 1;
    }
  };

  const parseValue = (): void => {
    skipWhitespace();
    const character = source[index];

    if (character === "{") {
      parseObject();
      return;
    }

    if (character === "[") {
      parseArray();
      return;
    }

    if (character === '"') {
      parseString();
      return;
    }

    skipPrimitive();
  };

  const parseObject = (): void => {
    index += 1;
    skipWhitespace();

    const seen = new Set<string>();

    if (source[index] === "}") {
      index += 1;
      return;
    }

    while (index < source.length) {
      skipWhitespace();

      if (source[index] !== '"') {
        return;
      }

      const key = parseString();

      if (seen.has(key)) {
        duplicates.push(key);
      }

      seen.add(key);
      skipWhitespace();

      if (source[index] !== ":") {
        return;
      }

      index += 1;
      parseValue();
      skipWhitespace();

      if (source[index] === "}") {
        index += 1;
        return;
      }

      if (source[index] !== ",") {
        return;
      }

      index += 1;
    }
  };

  const parseArray = (): void => {
    index += 1;
    skipWhitespace();

    if (source[index] === "]") {
      index += 1;
      return;
    }

    while (index < source.length) {
      parseValue();
      skipWhitespace();

      if (source[index] === "]") {
        index += 1;
        return;
      }

      if (source[index] !== ",") {
        return;
      }

      index += 1;
    }
  };

  parseValue();

  return duplicates;
}

function containsNonFinite(
  value: unknown,
  seen = new Set<object>()
): boolean {
  if (typeof value === "number") {
    return !Number.isFinite(value);
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  if (seen.has(value as object)) {
    return false;
  }

  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.some((item) =>
      containsNonFinite(item, seen)
    );
  }

  return Object.keys(
    value as Record<string, unknown>
  ).some((key) =>
    containsNonFinite(
      (value as Record<string, unknown>)[key],
      seen
    )
  );
}

function rootType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    return `array (${value.length} item${
      value.length === 1 ? "" : "s"
    })`;
  }

  if (typeof value === "object") {
    const count = Object.keys(
      value as Record<string, unknown>
    ).length;

    return `object (${count} key${count === 1 ? "" : "s"})`;
  }

  return typeof value;
}

function convertJsonToYaml(
  source: string,
  options: Options
): Result {
  if (!source.trim()) {
    return {
      output: "",
      error: "Enter JSON to convert.",
      warnings: [],
      notes: [],
    };
  }

  if (source.length > MAX_INPUT_CHARACTERS) {
    return {
      output: "",
      error:
        "The JSON input is larger than 2,000,000 characters. Conversion was stopped before parsing to avoid freezing the browser on unusually large pasted data.",
      warnings: [],
      notes: [],
    };
  }

  const nesting = jsonNestingDepth(source);

  if (nesting > MAX_JSON_NESTING) {
    return {
      output: "",
      error:
        `The JSON nesting depth is ${nesting}, above the browser-side limit of ${MAX_JSON_NESTING}. Deeply nested data can overflow recursive parsers and serializers even when the JSON syntax itself is valid.`,
      warnings: [],
      notes: [],
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(source);
  } catch (error) {
    return {
      output: "",
      error:
        error instanceof Error
          ? error.message
          : "Invalid JSON input.",
      warnings: [],
      notes: [],
    };
  }

  const warnings: string[] = [];
  const notes: string[] = [];
  const numberTokens = scanJsonNumberTokens(source);

  const unsafeIntegers = numberTokens.filter(
    integerOutsideSafeRange
  );

  if (unsafeIntegers.length) {
    const unique = Array.from(
      new Set(unsafeIntegers)
    );

    warnings.push(
      `Integer token${
        unique.length === 1 ? "" : "s"
      } outside JavaScript's safe-integer range detected: ${unique
        .slice(0, 5)
        .join(", ")}${
        unique.length > 5 ? " …" : ""
      }. JSON.parse uses IEEE-754 numbers, so exact integer precision may already be lost before YAML serialization.`
    );
  }

  const highPrecisionDecimals = numberTokens.filter(
    (token) =>
      !integerOutsideSafeRange(token) &&
      /[.eE]/.test(token) &&
      significantDigitCount(token) > 15
  );

  if (highPrecisionDecimals.length) {
    warnings.push(
      "At least one decimal/exponent number contains more precision than a JavaScript Number can reliably preserve. Compare important financial, scientific, or identifier-like values with the source."
    );
  }

  if (containsNonFinite(parsed)) {
    return {
      output: "",
      error:
        "A JSON number overflowed JavaScript's finite Number range while parsing. Converting that value to YAML would silently change the data to an infinity value, so conversion was stopped.",
      warnings,
      notes,
    };
  }

  const surrogateProblem = containsUnpairedSurrogate(parsed);

  if (surrogateProblem) {
    return {
      output: "",
      error: surrogateProblem,
      warnings,
      notes,
    };
  }

  let duplicates: string[] = [];

  try {
    duplicates = findDuplicateKeys(source);
  } catch {
    warnings.push(
      "Duplicate-name scanning could not finish safely for this unusually complex JSON structure. The parsed value can still be converted, but duplicate object names may have been collapsed by JSON.parse."
    );
  }

  if (duplicates.length) {
    const unique = Array.from(new Set(duplicates));

    warnings.push(
      `Duplicate JSON object name${
        unique.length === 1 ? "" : "s"
      } detected: ${unique.slice(0, 6).join(", ")}${
        unique.length > 6 ? " …" : ""
      }. JSON.parse keeps the later value, so earlier duplicate values cannot be recovered in YAML.`
    );
  }

  if (options.sortKeys) {
    notes.push(
      "Object keys will be sorted in the YAML presentation. Sorting changes key order but not the parsed JSON values."
    );
  }

  if (options.forceQuotes) {
    notes.push(
      "All string values are quoted for visual clarity. Quoting changes YAML presentation, not the underlying string values."
    );
  }

  notes.push(`Parsed JSON root: ${rootType(parsed)}.`);

  try {
    const output = stringify(parsed, {
      indent: options.indent,
      lineWidth:
        options.lineWidth === -1 ? 0 : options.lineWidth,
      sortMapEntries: options.sortKeys,
      aliasDuplicateObjects: false,
      ...(options.forceQuotes
        ? {
            defaultStringType: "QUOTE_DOUBLE" as const,
            defaultKeyType: "PLAIN" as const,
            doubleQuotedAsJSON: true,
            blockQuote: false,
          }
        : {}),
    }).replace(/\s+$/, "");

    return {
      output,
      error: "",
      warnings,
      notes,
    };
  } catch (error) {
    return {
      output: "",
      error:
        error instanceof Error
          ? error.message
          : "Unable to convert this JSON value to YAML.",
      warnings,
      notes,
    };
  }
}

export default function JsonToYamlPanel({ incoming, onSend }: WorkflowPanelProps) {
  const [input, setInput] = useState("");
  const [options, setOptions] =
    useState<Options>(DEFAULT_OPTIONS);
  const [result, setResult] =
    useState<Result | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  // A handoff changes the input only when another operation sends a result.
  // Merely switching tabs keeps each operation's input, options, and result intact.
  useEffect(() => {
    if (!incoming) return;
    setInput(incoming.value);
    setResult(null);
    setCopied(false);
    setCopyError("");
  }, [incoming]);

  const lineCount = useMemo(
    () =>
      input
        ? input.replace(/\r\n?/g, "\n").split("\n").length
        : 0,
    [input]
  );

  const convert = () => {
    setResult(convertJsonToYaml(input, options));
    setCopied(false);
    setCopyError("");
  };

  const loadExample = () => {
    const example = `{
  "person": "Sneha",
  "enabled": true,
  "ports": [80, 443],
  "metadata": {
    "environment": "production",
    "note": "value: with colon",
    "empty": null
  }
}`;

    setInput(example);
    setResult(convertJsonToYaml(example, options));
    setCopied(false);
    setCopyError("");
  };

  const reset = () => {
    setInput("");
    setOptions(DEFAULT_OPTIONS);
    setResult(null);
    setCopied(false);
    setCopyError("");
  };

  const copyOutput = async () => {
    if (!result || !result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setCopyError(
        "Clipboard access was blocked by the browser. Select the YAML output and copy it manually."
      );
    }
  };

  return (
    <>
      <div className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor="json-yaml-input" className="block text-sm font-semibold text-gray-900">
              JSON input
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Any valid JSON top-level value is accepted—not only objects.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {lineCount.toLocaleString()} line
            {lineCount === 1 ? "" : "s"}
          </p>
        </div>

        <textarea
          id="json-yaml-input"
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            setResult(null);
            setCopied(false);
            setCopyError("");
          }}
          placeholder='{"person":"Sneha","enabled":true,"ports":[80,443]}'
          spellCheck={false}
          className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-x-5 gap-y-4">
        <YoryantraSelect width="short"
          label="Indentation"
          value={String(options.indent)}
          onChange={(value: string) => {
            setOptions((current) => ({ ...current, indent: Number(value) }));
            setResult(null);
            setCopied(false);
            setCopyError("");
          }}
          options={[
            { label: "2 spaces", value: "2" },
            { label: "4 spaces", value: "4" },
          ]}
        />

        <YoryantraSelect width="medium"
          label="Line width"
          value={String(options.lineWidth)}
          onChange={(value: string) => {
            setOptions((current) => ({ ...current, lineWidth: Number(value) }));
            setResult(null);
            setCopied(false);
            setCopyError("");
          }}
          options={[
            { label: "No wrapping", value: "-1" },
            { label: "80 characters", value: "80" },
            { label: "120 characters", value: "120" },
          ]}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2">
        <label className="inline-flex min-h-10 items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={options.forceQuotes}
            onChange={(event: { target: { checked: boolean } }) => {
              setOptions((current) => ({
                ...current,
                forceQuotes: event.target.checked,
              }));
              setResult(null);
              setCopied(false);
              setCopyError("");
            }}
            className="h-4 w-4 accent-[#d9a928]"
          />
          Quote all strings
        </label>

        <label className="inline-flex min-h-10 items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={options.sortKeys}
            onChange={(event: { target: { checked: boolean } }) => {
              setOptions((current) => ({
                ...current,
                sortKeys: event.target.checked,
              }));
              setResult(null);
              setCopied(false);
              setCopyError("");
            }}
            className="h-4 w-4 accent-[#d9a928]"
          />
          Sort object keys
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={convert} className="yoryantra-btn">
          Convert to YAML
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {result && result.error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {result.error}
        </div>
      ) : null}

      {result && result.warnings.length ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-900">
          <strong>Conversion risks:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result && result.notes.length ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <ul className="list-disc space-y-1 pl-5">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              YAML output
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              The output is a new YAML serialization of the parsed JSON data, not a textual rewrite of the original JSON.
            </p>
          </div>

          {result && result.output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {result && result.output
            ? result.output
            : "Converted YAML will appear here."}
        </pre>
      </div>

      {copyError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {copyError}
        </div>
      ) : null}


      {result && result.output ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">Use this result in:</span>
          <button type="button" className="yoryantra-btn-outline text-sm" onClick={() => onSend("validate", result.output)}>Validate YAML</button>
          <button type="button" className="yoryantra-btn-outline text-sm" onClick={() => onSend("format", result.output)}>Format YAML</button>
          <button type="button" className="yoryantra-btn-outline text-sm" onClick={() => onSend("yaml-to-json", result.output)}>Convert to JSON</button>
        </div>
      ) : null}


    </>
  );
}
