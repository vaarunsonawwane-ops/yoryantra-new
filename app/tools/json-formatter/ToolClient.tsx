"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type IndentMode = "2" | "4" | "tab";

type JsonDiagnostics = {
  duplicateKeys: string[];
  unsafeIntegers: string[];
  nonFiniteNumbers: string[];
  highPrecisionNumbers: string[];
};

type JsonResult = {
  output: string;
  rootType: string;
  inputBytes: number;
  outputBytes: number;
  diagnostics: JsonDiagnostics;
};

const SAMPLE_JSON = `{
  "profile": {
    "name": "Sneha",
    "id": 9007199254740993,
    "message": "Spacing inside this string stays exactly as written."
  },
  "active": true,
  "roles": ["editor", "reviewer"]
}`;

function isJsonWhitespace(char: string) {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

function stripTrailingWhitespace(value: string) {
  return value.replace(/\s+$/, "");
}

function nextSignificant(source: string, start: number) {
  for (let index = start; index < source.length; index += 1) {
    if (!isJsonWhitespace(source[index])) {
      return source[index];
    }
  }

  return "";
}

function previousSignificant(value: string) {
  for (let index = value.length - 1; index >= 0; index -= 1) {
    if (!isJsonWhitespace(value[index])) {
      return value[index];
    }
  }

  return "";
}

function prettyPrintJson(source: string, indent: string) {
  let output = "";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      output += char;

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
      output += char;
      continue;
    }

    if (isJsonWhitespace(char)) {
      continue;
    }

    if (char === "{" || char === "[") {
      output += char;

      const closing = char === "{" ? "}" : "]";

      if (nextSignificant(source, index + 1) !== closing) {
        depth += 1;
        output += `\n${indent.repeat(depth)}`;
      }

      continue;
    }

    if (char === "}" || char === "]") {
      const opening = char === "}" ? "{" : "[";

      if (previousSignificant(output) !== opening) {
        depth = Math.max(depth - 1, 0);
        output =
          `${stripTrailingWhitespace(output)}\n${indent.repeat(depth)}`;
      }

      output += char;
      continue;
    }

    if (char === ",") {
      output += `,\n${indent.repeat(depth)}`;
      continue;
    }

    if (char === ":") {
      output += ": ";
      continue;
    }

    output += char;
  }

  return output;
}

function findJsonStringEnd(source: string, start: number) {
  let escaped = false;

  for (
    let index = start + 1;
    index < source.length;
    index += 1
  ) {
    const char = source[index];

    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === '"') {
      return index;
    }
  }

  return source.length - 1;
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
  const digits = mantissa
    .replace(/[-.]/g, "")
    .replace(/^0+/, "");

  return digits.length;
}

function uniqueStrings(values: string[]) {
  const result: string[] = [];

  values.forEach((value) => {
    if (result.indexOf(value) === -1) {
      result.push(value);
    }
  });

  return result;
}

function inspectJsonSource(source: string): JsonDiagnostics {
  const duplicateKeys: string[] = [];
  const unsafeIntegers: string[] = [];
  const nonFiniteNumbers: string[] = [];
  const highPrecisionNumbers: string[] = [];
  const stack: Array<{
    type: "object" | "array";
    keys?: Set<string>;
  }> = [];

  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (isJsonWhitespace(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({
        type: "object",
        keys: new Set<string>(),
      });
      index += 1;
      continue;
    }

    if (char === "[") {
      stack.push({ type: "array" });
      index += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      stack.pop();
      index += 1;
      continue;
    }

    if (char === '"') {
      const end = findJsonStringEnd(source, index);
      const raw = source.slice(index, end + 1);
      let cursor = end + 1;

      while (
        cursor < source.length &&
        isJsonWhitespace(source[cursor])
      ) {
        cursor += 1;
      }

      const current = stack[stack.length - 1];

      if (
        source[cursor] === ":" &&
        current &&
        current.type === "object" &&
        current.keys
      ) {
        try {
          const key = JSON.parse(raw) as string;

          if (current.keys.has(key)) {
            duplicateKeys.push(key);
          } else {
            current.keys.add(key);
          }
        } catch {
          // Full JSON.parse validation is performed before this scan.
        }
      }

      index = end + 1;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const match = source
        .slice(index)
        .match(
          /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
        );

      if (match) {
        const token = match[0];

        if (integerOutsideSafeRange(token)) {
          unsafeIntegers.push(token);
        }

        if (
          /[.eE]/.test(token) &&
          significantDigitCount(token) > 15
        ) {
          highPrecisionNumbers.push(token);
        }

        if (!Number.isFinite(Number(token))) {
          nonFiniteNumbers.push(token);
        }

        index += token.length;
        continue;
      }
    }

    index += 1;
  }

  return {
    duplicateKeys: uniqueStrings(duplicateKeys),
    unsafeIntegers: uniqueStrings(unsafeIntegers),
    nonFiniteNumbers: uniqueStrings(nonFiniteNumbers),
    highPrecisionNumbers: uniqueStrings(
      highPrecisionNumbers
    ),
  };
}

function detectRootType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function getUtf8Bytes(value: string) {
  return new TextEncoder().encode(value).length;
}

function lineExcerpt(
  source: string,
  line: number,
  column: number
) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const excerpt = lines[line - 1] || "";
  const caret =
    " ".repeat(Math.max(column - 1, 0)) + "^";

  return `${excerpt}\n${caret}`;
}

function formatJsonError(
  caught: unknown,
  source: string
) {
  const message =
    caught instanceof Error
      ? caught.message
      : "Invalid JSON input.";

  const directLocation = message.match(
    /line\s+(\d+)\s+column\s+(\d+)/i
  );

  if (directLocation) {
    const line = Number(directLocation[1]);
    const column = Number(directLocation[2]);

    return `Invalid JSON near line ${line}, column ${column}.\n${lineExcerpt(
      source,
      line,
      column
    )}\n${message}`;
  }

  const positionMatch = message.match(
    /position\s+(\d+)/i
  );

  if (positionMatch) {
    const position = Number(positionMatch[1]);
    const before = source.slice(0, position);
    const normalizedBefore = before.replace(
      /\r\n?/g,
      "\n"
    );
    const line =
      normalizedBefore.split("\n").length;
    const lastBreak =
      normalizedBefore.lastIndexOf("\n");
    const column =
      normalizedBefore.length - lastBreak;

    return `Invalid JSON near line ${line}, column ${column}.\n${lineExcerpt(
      source,
      line,
      column
    )}\n${message}`;
  }

  return `Invalid JSON. ${message}`;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [indentMode, setIndentMode] =
    useState<IndentMode>("2");
  const [result, setResult] =
    useState<JsonResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const formatJSON = () => {
    if (!input.trim()) {
      setResult(null);
      setError("Paste JSON before formatting.");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const indent =
        indentMode === "tab"
          ? "\t"
          : " ".repeat(Number(indentMode));
      const output = prettyPrintJson(
        input,
        indent
      );

      setResult({
        output,
        rootType: detectRootType(parsed),
        inputBytes: getUtf8Bytes(input),
        outputBytes: getUtf8Bytes(output),
        diagnostics: inspectJsonSource(input),
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(formatJsonError(caught, input));
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_JSON);
    setResult(null);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.output
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The formatted JSON could not be copied. Select and copy it manually."
      );
    }
  };

  const resetAll = () => {
    setInput("");
    setIndentMode("2");
    clearResult();
  };

  const diagnostics = result
    ? result.diagnostics
    : null;

  return (
    <ToolShell
      title="JSON Formatter"
      description="Pretty-print valid JSON while preserving source tokens that JavaScript re-serialization can silently change."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label
          htmlFor="json-formatter-input"
          className="block text-sm font-semibold text-gray-900"
        >
          JSON input
        </label>
        <p
          id="json-formatter-input-help"
          className="mt-1 text-sm leading-relaxed text-gray-500"
        >
          The input is validated first. Formatting then works on the original
          JSON token text rather than serializing the parsed JavaScript value
          back to JSON.
        </p>

        <textarea
          id="json-formatter-input"
          aria-describedby="json-formatter-input-help"
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder='{"name":"Sneha","active":true,"roles":["editor","reviewer"]}'
          spellCheck={false}
          className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 max-w-xs">
        <YoryantraSelect
          label="Indentation"
          value={indentMode}
          onChange={(value: string) => {
            setIndentMode(value as IndentMode);
            clearResult();
          }}
          options={[
            {
              label: "2 spaces",
              value: "2",
            },
            {
              label: "4 spaces",
              value: "4",
            },
            {
              label: "Tab",
              value: "tab",
            },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={formatJSON}
          className="yoryantra-btn"
        >
          Format JSON
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
        <div
          role="alert"
          className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Formatted JSON
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Root: {result.rootType} · Input{" "}
                {result.inputBytes.toLocaleString()} bytes · Output{" "}
                {result.outputBytes.toLocaleString()} bytes
              </p>
            </div>

            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="yoryantra-output mt-4 min-h-[260px] overflow-auto whitespace-pre font-mono text-sm">
            {result.output}
          </pre>

          {diagnostics &&
          (diagnostics.duplicateKeys.length ||
            diagnostics.unsafeIntegers.length ||
            diagnostics.nonFiniteNumbers.length ||
            diagnostics.highPrecisionNumbers
              .length) ? (
            <div role="status" className="mt-5 space-y-3">
              {diagnostics.duplicateKeys.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>
                    Duplicate member name
                    {diagnostics.duplicateKeys.length === 1
                      ? ""
                      : "s"}
                    :
                  </strong>{" "}
                  {diagnostics.duplicateKeys
                    .slice(0, 8)
                    .join(", ")}
                  {diagnostics.duplicateKeys.length > 8
                    ? " …"
                    : ""}
                  . The duplicate source text stays visible instead
                  of rebuilding an object that would hide earlier
                  values.
                </div>
              ) : null}

              {diagnostics.unsafeIntegers.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>
                    JavaScript safe-integer warning:
                  </strong>{" "}
                  {diagnostics.unsafeIntegers
                    .slice(0, 6)
                    .join(", ")}
                  {diagnostics.unsafeIntegers.length > 6
                    ? " …"
                    : ""}
                  . The original numeric token is preserved here,
                  but JavaScript applications that parse it as
                  Number may lose exact integer precision.
                </div>
              ) : null}

              {diagnostics.highPrecisionNumbers.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>
                    High-precision decimal/exponent token:
                  </strong>{" "}
                  {diagnostics.highPrecisionNumbers
                    .slice(0, 5)
                    .join(", ")}
                  {diagnostics.highPrecisionNumbers.length > 5
                    ? " …"
                    : ""}
                  . Formatting keeps the source spelling, but a
                  JavaScript Number consumer can still round the
                  parsed value.
                </div>
              ) : null}

              {diagnostics.nonFiniteNumbers.length ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
                  <strong>
                    JavaScript magnitude warning:
                  </strong>{" "}
                  {diagnostics.nonFiniteNumbers
                    .slice(0, 5)
                    .join(", ")}
                  {diagnostics.nonFiniteNumbers.length > 5
                    ? " …"
                    : ""}
                  . These valid JSON number tokens exceed
                  JavaScript&apos;s finite Number range. The numeric source
                  text stays intact here, but JSON.parse resolves those
                  values to Infinity or -Infinity.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Formatting itself runs in the browser and makes no request containing
        the pasted JSON. Site-wide analytics or advertising scripts, browser
        extensions, and anything copied to the system clipboard sit outside
        that local processing boundary. Very large payloads are processed on
        the page and can briefly make the tab less responsive.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Pretty printing should not change the JSON you are inspecting
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A common pretty-printing shortcut is{" "}
            <code>JSON.stringify(JSON.parse(input), null, 2)</code>.
            That works for ordinary data, but it also means the
            browser has already turned every number into a JavaScript
            Number and every object into a normal JavaScript object
            before the text is recreated.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The input first passes <code>JSON.parse()</code> for syntax
            validation. Pretty printing is then applied to the original token
            text. That keeps exact number spellings, duplicate member text,
            escape spelling, and source key order visible instead of rebuilding
            the value from a JavaScript object.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Whitespace Outside a String and Whitespace Inside a String Are Completely Different
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`{"message":"Sneha  Pune","items":[1,2,3]}

becomes

{
  "message": "Sneha  Pune",
  "items": [
    1,
    2,
    3
  ]
}`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Spaces between structural tokens can be replaced with
            indentation. The two spaces inside{" "}
            <code>"Sneha&nbsp;&nbsp;Pune"</code> are string data and
            must remain untouched. Escaped characters inside strings
            are preserved for the same reason.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Large IDs Are a Good Reason Not to Re-serialize During Formatting
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON itself allows number tokens with more integer
            precision or magnitude than JavaScript&apos;s Number type can
            represent exactly. An API may send a database identifier
            such as <code>9007199254740993</code>. A JavaScript parse
            can no longer represent that exact integer as a Number,
            even though the source token is still sitting correctly in
            the response body.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Formatting the token text means the output can still show the exact
            numeric token the server sent. The warning tells you that
            application code using ordinary Number values may not see
            the same exact value.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Duplicate object names do not behave consistently across parsers
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A JSON object such as{" "}
            <code>{`{"role":"user","role":"admin"}`}</code> contains
            the same member name twice. RFC 8259 says object names
            should be unique because behavior with duplicates is
            unpredictable across implementations. Some parsers keep
            the last value, some expose all duplicates, and others
            reject them.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Keeping both tokens visible makes the problem easier to diagnose.
            The warning does not make the duplicate safe to send to every
            consumer.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Key Order Can Be Preserved for Humans Without Becoming Application Logic
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Developers often arrange object members in an intentional visual
            order—identity fields first, then configuration, then
            nested data. Preserving that source order makes code
            review and debugging easier. It should not be used to make
            business decisions, because JSON objects are modeled as
            unordered collections of name/value pairs.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Formatting Is Not JSON Schema Validation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Successful formatting means the text passed JSON syntax
            parsing. It does not prove that an API request contains the
            required fields, that an ID has the expected format, or
            that a payload satisfies a JSON Schema. Use the JSON
            Validator or JSON Schema Validator when the question is
            data correctness rather than readability.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          RFC 8259 defines the JSON grammar, permits only space, tab, line feed,
          and carriage return as insignificant whitespace, explains why duplicate
          object names hurt interoperability, and discusses numeric interoperability
          limits.{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc8259"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            Read RFC 8259
          </a>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-formatter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
