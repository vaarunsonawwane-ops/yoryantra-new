"use client";

import { useMemo, useState } from "react";
import * as yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

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

  const duplicates = findDuplicateKeys(source);

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
    const output = yaml
      .dump(parsed, {
        indent: options.indent,
        lineWidth: options.lineWidth,
        noRefs: true,
        forceQuotes: options.forceQuotes,
        sortKeys: options.sortKeys,
      })
      .replace(/\s+$/, "");

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

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [options, setOptions] =
    useState<Options>(DEFAULT_OPTIONS);
  const [result, setResult] =
    useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

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
  };

  const reset = () => {
    setInput("");
    setOptions(DEFAULT_OPTIONS);
    setResult(null);
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!result || !result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ToolShell
      title="JSON to YAML Converter"
      description="Convert valid JSON values to readable YAML while keeping formatting choices, duplicate object names, and JavaScript number-precision limits visible."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
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
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            setResult(null);
            setCopied(false);
          }}
          placeholder='{"person":"Sneha","enabled":true,"ports":[80,443]}'
          spellCheck={false}
          className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Indentation
          </label>
          <select
            value={options.indent}
            onChange={(event: { target: { value: string } }) =>
              setOptions((current) => ({
                ...current,
                indent: Number(event.target.value),
              }))
            }
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Line width
          </label>
          <select
            value={options.lineWidth}
            onChange={(event: { target: { value: string } }) =>
              setOptions((current) => ({
                ...current,
                lineWidth: Number(event.target.value),
              }))
            }
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
          >
            <option value={-1}>No wrapping</option>
            <option value={80}>80 characters</option>
            <option value={120}>120 characters</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={options.forceQuotes}
            onChange={(event: { target: { checked: boolean } }) =>
              setOptions((current) => ({
                ...current,
                forceQuotes: event.target.checked,
              }))
            }
            className="h-4 w-4 accent-[#d9a928]"
          />
          Quote all strings
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={options.sortKeys}
            onChange={(event: { target: { checked: boolean } }) =>
              setOptions((current) => ({
                ...current,
                sortKeys: event.target.checked,
              }))
            }
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
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
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

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Conversion runs on the pasted text in your browser. The tool does not
        send the JSON to a conversion API. Site-wide analytics or advertising
        scripts, if enabled, are separate from this conversion operation.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting the Data Is Easy; Preserving Its Meaning Is the Real Job
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON has a deliberately small data model: objects, arrays, strings,
            numbers, booleans, and null. YAML can represent all of those values,
            so ordinary JSON usually converts cleanly. The converter parses the
            JSON first and then serializes that value as YAML.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That distinction matters. Indentation, quotes, line wrapping, and
            YAML scalar style are presentation choices created during output.
            They were not present in the parsed JSON data and do not change an
            object into a different object.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            The Same JSON Value Can Have Several Reasonable YAML Presentations
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`JSON
{"name":"Sneha","roles":["editor","reviewer"],"active":true}

YAML
name: Sneha
roles:
  - editor
  - reviewer
active: true`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            A different serializer could quote <code>"Sneha"</code>, use a flow
            sequence such as <code>[editor, reviewer]</code>, or choose another
            indentation width while representing the same values. Do not use
            formatting differences alone to decide whether two YAML files carry
            different data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Large Numbers Are the Most Important Browser-Side Conversion Trap
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript parses JSON numbers into IEEE-754 Number values. Exact
            integer precision is guaranteed only through{" "}
            <code>9,007,199,254,740,991</code> in magnitude. A larger integer
            might be an order ID, database identifier, timestamp, or financial
            quantity that looks intact in the source but is rounded during
            <code>JSON.parse()</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool scans integer tokens before conversion and warns when they
            exceed the safe-integer range. It also warns about unusually
            high-precision decimal/exponent tokens. If a number overflows the
            finite JavaScript range entirely, conversion stops instead of
            silently emitting YAML infinity.
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Duplicate JSON Object Names Are Already Lossy Before YAML Exists
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            JSON texts in the wild sometimes contain the same object name more
            than once. JavaScript's JSON parser keeps the later value, so by the
            time a normal object reaches the YAML serializer the earlier value
            is gone. The converter scans for duplicates and reports them rather
            than making the resulting YAML look lossless.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If duplicate names matter, fix the source or use a representation
            designed to preserve repeated entries, such as an array of
            name/value objects.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Some Strings Need Quotes Even When “Quote All Strings” Is Off
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            YAML plain scalars have syntax and type-resolution rules. A string
            that resembles a boolean, number, null value, indicator, or other
            special-looking scalar can need quotes so that loading the YAML
            produces the original string rather than a different type. The
            serializer handles necessary quoting automatically.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The “Quote all strings” option is therefore a readability or policy
            choice, not a safety switch. It can make string intent visually
            obvious in generated configuration, but it also makes large YAML
            files noisier.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sorting Keys Can Help Diffs—and Hurt Human Structure
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON object member order is often used informally by humans even
            when an application's data semantics do not depend on it. Sorting
            keys can produce stable generated output and easier machine diffs,
            but it can also separate related configuration fields that were
            intentionally grouped together.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Leave sorting off when the source order communicates meaning to
            maintainers. Turn it on when deterministic alphabetical output is
            more useful than preserving that presentation order.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JSON Cannot Contain YAML-Only Features You May Expect to See
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Comments, anchors, aliases, custom tags, YAML directives, block
            scalar styles, and document separators have no representation in
            ordinary JSON data. A JSON-to-YAML converter cannot invent those
            application-specific features reliably.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If the destination is a Kubernetes, Docker Compose, CI, or
            application configuration file, conversion gives you the data
            structure—not proof that the resulting keys satisfy that product's
            schema. Validate the generated YAML with the target system before
            deployment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Standards Behind the Conversion Boundary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The references are useful on this converter because the core
            question is exactly where the JSON and YAML data models overlap.
            RFC 8259 defines JSON's portable data interchange format, while
            YAML 1.2 was designed so JSON fits within the YAML model.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 8259 — JSON
            </a>
            <a
              href="https://yaml.org/spec/1.2.2/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              YAML 1.2.2 specification
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/json-to-yaml-converter" />
        </div>
      </section>
    </ToolShell>
  );
}
