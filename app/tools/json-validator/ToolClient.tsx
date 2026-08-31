"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type DuplicateKey = {
  key: string;
  line: number;
  column: number;
};

type NumberFinding = {
  token: string;
  line: number;
  column: number;
  kind: "unsafe-integer" | "non-finite";
};

type JsonStats = {
  objects: number;
  arrays: number;
  properties: number;
  primitiveValues: number;
  maxDepth: number;
};

type ValidationResult = {
  formatted: string;
  rootType: string;
  characters: number;
  bytes: number;
  hadBom: boolean;
  duplicates: DuplicateKey[];
  numberFindings: NumberFinding[];
  stats: JsonStats;
};

type ErrorDetails = {
  message: string;
  line?: number;
  column?: number;
  excerpt?: string;
  caretOffset?: number;
};

const exampleJson = `{
  "name": "Yoryantra",
  "active": true,
  "tools": ["JSON Validator", "JSON Formatter"],
  "meta": {
    "version": 2,
    "browserOnly": true
  }
}`;

const MAX_SAFE_INTEGER_TEXT = "9007199254740991";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(
    () => (result ? buildWarnings(result) : []),
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const validateJson = () => {
    if (input.length === 0) {
      setError({ message: "Paste JSON to validate." });
      setResult(null);
      setCopied(false);
      return;
    }

    const hadBom = input.charCodeAt(0) === 0xfeff;
    const source = hadBom ? input.slice(1) : input;

    if (source.length === 0 || isOnlyJsonWhitespace(source)) {
      setError({ message: "JSON cannot be empty or contain only JSON whitespace." });
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const parsed = JSON.parse(source) as unknown;
      const scan = scanValidJson(source);
      const stats = collectStats(parsed);

      setResult({
        formatted: formatJsonSource(source),
        rootType: describeRootType(parsed),
        characters: source.length,
        bytes: new TextEncoder().encode(source).length,
        hadBom,
        duplicates: scan.duplicates,
        numberFindings: scan.numberFindings,
        stats,
      });
      setError(null);
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setCopied(false);
      setError(getJsonErrorDetails(caught, source));
    }
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError({
        message:
          "The formatted JSON could not be copied. Select and copy it manually.",
      });
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(exampleJson);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Validator"
      description="Validate JSON syntax, locate parser errors, detect duplicate object names and risky number values, and format valid JSON without rewriting its original string or number tokens."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              JSON Input
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Objects, arrays, strings, numbers, booleans, and null are all
              valid top-level JSON values.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {input.length.toLocaleString()} characters
          </p>
        </div>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={exampleJson}
          spellCheck={false}
          className="mt-4 w-full min-h-[360px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={validateJson}
            className="yoryantra-btn"
          >
            Validate JSON
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
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="text-sm font-semibold text-red-900">Invalid JSON</h3>
          <p className="mt-2 break-words font-mono text-sm leading-relaxed text-red-800">
            {error.message}
          </p>

          {error.line !== undefined && error.column !== undefined ? (
            <p className="mt-3 text-sm text-red-800">
              Approximate parser location: line {error.line}, column{" "}
              {error.column}.
            </p>
          ) : null}

          {error.excerpt ? (
            <pre className="mt-4 overflow-auto rounded-xl border border-red-200 bg-white p-4 font-mono text-sm leading-6 text-gray-800">
              {error.excerpt}
              {"\n"}
              {" ".repeat(error.caretOffset || 0)}^
            </pre>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <h3 className="text-sm font-semibold text-green-900">
              Valid JSON syntax
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-green-800">
              The browser JSON parser accepted the document. Review the
              warnings below as interoperability or data-model concerns rather
              than syntax failures.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Root value" value={result.rootType} />
            <StatCard
              label="UTF-8 size"
              value={`${result.bytes.toLocaleString()} bytes`}
            />
            <StatCard
              label="Max depth"
              value={result.stats.maxDepth.toLocaleString()}
            />
            <StatCard
              label="Duplicate keys"
              value={result.duplicates.length.toLocaleString()}
            />
          </div>

          {warnings.length > 0 ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                Review these details
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-amber-800">
                {warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}

          {result.duplicates.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Duplicate object names
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                RFC 8259 says object names should be unique because receiver
                behavior is not reliably interoperable when names repeat. The
                locations below point to the repeated occurrence, not the
                first occurrence.
              </p>

              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="pr-6 pb-2 font-medium">Name</th>
                      <th className="pr-6 pb-2 font-medium">Line</th>
                      <th className="pb-2 font-medium">Column</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {result.duplicates.slice(0, 50).map((item, index) => (
                      <tr
                        key={`${item.key}-${item.line}-${item.column}-${index}`}
                        className="border-t border-gray-100"
                      >
                        <td className="py-2 pr-6 font-mono">
                          {JSON.stringify(item.key)}
                        </td>
                        <td className="py-2 pr-6">{item.line}</td>
                        <td className="py-2">{item.column}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.duplicates.length > 50 ? (
                <p className="mt-3 text-xs text-gray-500">
                  Showing the first 50 duplicate occurrences.
                </p>
              ) : null}
            </div>
          ) : null}

          {result.numberFindings.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Number interoperability findings
              </h3>
              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="pr-6 pb-2 font-medium">Token</th>
                      <th className="pr-6 pb-2 font-medium">Finding</th>
                      <th className="pb-2 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {result.numberFindings.slice(0, 50).map((item, index) => (
                      <tr
                        key={`${item.token}-${item.line}-${item.column}-${index}`}
                        className="border-t border-gray-100"
                      >
                        <td className="max-w-[280px] break-all py-2 pr-6 font-mono">
                          {item.token}
                        </td>
                        <td className="py-2 pr-6">
                          {item.kind === "unsafe-integer"
                            ? "Outside JavaScript safe-integer range"
                            : "Becomes non-finite as a JavaScript Number"}
                        </td>
                        <td className="py-2">
                          {item.line}:{item.column}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Formatted JSON
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Formatting is performed from the validated source text.
                  Number spellings, string escapes, key order, and duplicate
                  names are not silently rewritten through JavaScript values.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline text-sm"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 yoryantra-output min-h-[320px] overflow-auto whitespace-pre text-sm">
              {result.formatted}
            </pre>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Objects"
              value={result.stats.objects.toLocaleString()}
            />
            <StatCard
              label="Arrays"
              value={result.stats.arrays.toLocaleString()}
            />
            <StatCard
              label="Properties"
              value={result.stats.properties.toLocaleString()}
            />
            <StatCard
              label="Primitive values"
              value={result.stats.primitiveValues.toLocaleString()}
            />
          </div>
        </>
      ) : null}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser-local processing
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          This tool does not send your pasted JSON to a validation API. Parsing,
          duplicate-name inspection, formatting, and diagnostics run in your
          browser. Site-wide analytics or advertising scripts, if enabled by
          the website, are separate from this validation operation.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What This JSON Validator Actually Checks
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The validator checks JSON grammar using the browser&apos;s native
            JSON parser: quoted strings, permitted escapes, JSON number syntax,
            commas, colons, brackets, braces, and the lowercase literals true,
            false, and null. A JSON text can contain any serialized JSON value
            at its root, not only an object or array.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            After parsing succeeds, a second source scanner reports duplicate
            object names and number tokens that can lose exact identity when
            represented as ordinary JavaScript numbers. These are review
            findings, not extra JSON grammar invented by the tool.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Names Can Be Valid Syntax but Poor Interoperability
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 8259 says names within an object should be unique. Parsers have
            historically differed when the same name appears more than once:
            some keep the last value, some report an error, and some expose all
            pairs. That is why this page flags repeated names even when
            <code> JSON.parse()</code> accepts the text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Large JSON Integers Need Special Care
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON itself does not impose JavaScript&apos;s safe-integer limit.
            An integer token can therefore be valid JSON while being too large
            for an ordinary JavaScript Number to represent exactly. This tool
            compares integer digit strings directly against 9,007,199,254,740,991,
            so the warning does not depend on a post-ES2017 integer primitive and
            remains compatible with the project&apos;s ES2017 target.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If exact large integer identity matters, keep the source token as a
            string or use a parser designed for arbitrary-precision numeric
            handling. The formatted output on this page preserves the original
            numeric spelling rather than serializing the parsed Number again.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JSON Is Not a JavaScript Object Literal
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON requires double-quoted object names and strings. Comments,
            trailing commas, single-quoted strings, undefined, NaN, Infinity,
            hexadecimal numeric literals, and unquoted object names are not
            part of the JSON grammar. Text that works inside JavaScript source
            can therefore still be invalid JSON.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            BOM Handling and Parser Error Locations
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 8259 says JSON generators must not add a byte order mark to
            network-transmitted JSON, while parsers may ignore one for
            interoperability. This validator tolerates one leading U+FEFF and
            reports it as a warning.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Syntax error wording and exact positions come from the browser
            engine. Yoryantra extracts line and column information when the
            engine exposes a usable position, but it does not pretend every
            browser will produce identical diagnostics.
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
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-validator" />
        </div>
      </section>
    </ToolShell>
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

function getJsonErrorDetails(caught: unknown, source: string): ErrorDetails {
  const message =
    caught instanceof Error ? caught.message : "The JSON could not be parsed.";

  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = Math.min(
      source.length,
      Math.max(0, Number(positionMatch[1]))
    );
    const location = lineColumnFromIndex(source, position);
    const excerpt = buildExcerpt(source, position);

    return {
      message,
      line: location.line,
      column: location.column,
      excerpt: excerpt.text,
      caretOffset: excerpt.caretOffset,
    };
  }

  const lineColumnMatch = message.match(
    /line\s+(\d+)(?:\s+column\s+|\s*[:,]\s*column\s+)(\d+)/i
  );

  if (lineColumnMatch) {
    const line = Number(lineColumnMatch[1]);
    const column = Number(lineColumnMatch[2]);
    const position = indexFromLineColumn(source, line, column);
    const excerpt = buildExcerpt(source, position);

    return {
      message,
      line,
      column,
      excerpt: excerpt.text,
      caretOffset: excerpt.caretOffset,
    };
  }

  return { message };
}

function lineColumnFromIndex(source: string, index: number) {
  let line = 1;
  let column = 1;

  for (let i = 0; i < index && i < source.length; i += 1) {
    if (source[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function indexFromLineColumn(source: string, line: number, column: number) {
  let currentLine = 1;
  let currentColumn = 1;

  for (let index = 0; index < source.length; index += 1) {
    if (currentLine === line && currentColumn === column) return index;

    if (source[index] === "\n") {
      currentLine += 1;
      currentColumn = 1;
    } else {
      currentColumn += 1;
    }
  }

  return source.length;
}

function buildExcerpt(source: string, index: number) {
  const lineStart = source.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
  const nextBreak = source.indexOf("\n", index);
  const lineEnd = nextBreak === -1 ? source.length : nextBreak;
  const fullLine = source.slice(lineStart, lineEnd);

  const maxLength = 180;
  const rawOffset = Math.max(0, index - lineStart);
  const windowStart = Math.max(
    0,
    Math.min(rawOffset - 70, Math.max(0, fullLine.length - maxLength))
  );
  const visible = fullLine.slice(windowStart, windowStart + maxLength);
  const prefix = windowStart > 0 ? "…" : "";
  const suffix =
    windowStart + maxLength < fullLine.length ? "…" : "";

  return {
    text: `${prefix}${visible}${suffix}`,
    caretOffset: prefix.length + Math.max(0, rawOffset - windowStart),
  };
}

function formatJsonSource(source: string) {
  let output = "";
  let indent = 0;
  let inString = false;
  let escaped = false;

  const newline = () => `\n${"  ".repeat(indent)}`;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (inString) {
      output += character;

      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      output += character;
      continue;
    }

    if (isJsonWhitespace(character)) continue;

    if (character === "{" || character === "[") {
      output += character;
      indent += 1;

      if (
        nextNonWhitespace(source, index + 1) !==
        (character === "{" ? "}" : "]")
      ) {
        output += newline();
      }

      continue;
    }

    if (character === "}" || character === "]") {
      indent = Math.max(0, indent - 1);

      if (
        previousNonWhitespace(source, index - 1) !==
        (character === "}" ? "{" : "[")
      ) {
        output += newline();
      }

      output += character;
      continue;
    }

    if (character === ",") {
      output += `,${newline()}`;
      continue;
    }

    if (character === ":") {
      output += ": ";
      continue;
    }

    output += character;
  }

  return output;
}

function nextNonWhitespace(source: string, start: number) {
  for (let index = start; index < source.length; index += 1) {
    if (!isJsonWhitespace(source[index])) return source[index];
  }
  return "";
}

function previousNonWhitespace(source: string, start: number) {
  for (let index = start; index >= 0; index -= 1) {
    if (!isJsonWhitespace(source[index])) return source[index];
  }
  return "";
}

function isJsonWhitespace(character: string) {
  return (
    character === " " ||
    character === "\t" ||
    character === "\n" ||
    character === "\r"
  );
}

function isOnlyJsonWhitespace(source: string) {
  for (let index = 0; index < source.length; index += 1) {
    if (!isJsonWhitespace(source[index])) return false;
  }
  return true;
}

function scanValidJson(source: string) {
  let index = 0;
  const duplicates: DuplicateKey[] = [];
  const numberFindings: NumberFinding[] = [];

  const skipWhitespace = () => {
    while (index < source.length && isJsonWhitespace(source[index])) {
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

    const raw = source.slice(start, index);
    return { value: JSON.parse(raw) as string, start };
  };

  const parseNumber = () => {
    const start = index;

    while (
      index < source.length &&
      !isJsonWhitespace(source[index]) &&
      source[index] !== "," &&
      source[index] !== "]" &&
      source[index] !== "}"
    ) {
      index += 1;
    }

    const token = source.slice(start, index);
    const location = lineColumnFromIndex(source, start);

    if (/^-?(?:0|[1-9]\d*)$/.test(token) && isOutsideSafeInteger(token)) {
      numberFindings.push({
        token,
        ...location,
        kind: "unsafe-integer",
      });
    }

    if (!Number.isFinite(Number(token))) {
      numberFindings.push({
        token,
        ...location,
        kind: "non-finite",
      });
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

    if (character === "t") {
      index += 4;
      return;
    }

    if (character === "f") {
      index += 5;
      return;
    }

    if (character === "n") {
      index += 4;
      return;
    }

    parseNumber();
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
      const key = parseString();

      if (seen.has(key.value)) {
        duplicates.push({
          key: key.value,
          ...lineColumnFromIndex(source, key.start),
        });
      }

      seen.add(key.value);
      skipWhitespace();
      index += 1; // colon
      parseValue();
      skipWhitespace();

      if (source[index] === "}") {
        index += 1;
        return;
      }

      index += 1; // comma
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

      index += 1; // comma
    }
  };

  parseValue();
  return { duplicates, numberFindings };
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

function collectStats(value: unknown): JsonStats {
  const stats: JsonStats = {
    objects: 0,
    arrays: 0,
    properties: 0,
    primitiveValues: 0,
    maxDepth: 0,
  };

  const visit = (current: unknown, depth: number) => {
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (Array.isArray(current)) {
      stats.arrays += 1;
      current.forEach((item) => visit(item, depth + 1));
      return;
    }

    if (current !== null && typeof current === "object") {
      stats.objects += 1;
      const entries = Object.entries(current as Record<string, unknown>);
      stats.properties += entries.length;
      entries.forEach(([, item]) => visit(item, depth + 1));
      return;
    }

    stats.primitiveValues += 1;
  };

  visit(value, 0);
  return stats;
}

function describeRootType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function buildWarnings(result: ValidationResult) {
  const warnings: string[] = [];

  if (result.hadBom) {
    warnings.push(
      "A leading U+FEFF byte order mark was ignored for parsing. RFC 8259 says JSON generators must not add a BOM to network-transmitted JSON."
    );
  }

  if (result.duplicates.length > 0) {
    warnings.push(
      `${result.duplicates.length.toLocaleString()} duplicate object name occurrence${
        result.duplicates.length === 1 ? " was" : "s were"
      } found. Different JSON consumers may not agree on repeated names.`
    );
  }

  const unsafeIntegers = result.numberFindings.filter(
    (item) => item.kind === "unsafe-integer"
  );
  const nonFinite = result.numberFindings.filter(
    (item) => item.kind === "non-finite"
  );

  if (unsafeIntegers.length > 0) {
    warnings.push(
      `${unsafeIntegers.length.toLocaleString()} integer token${
        unsafeIntegers.length === 1 ? " is" : "s are"
      } outside JavaScript's exact safe-integer range. Preserve the token as text or use an arbitrary-precision parser when exact integer identity matters.`
    );
  }

  if (nonFinite.length > 0) {
    warnings.push(
      `${nonFinite.length.toLocaleString()} number token${
        nonFinite.length === 1 ? " becomes" : "s become"
      } non-finite when converted to a JavaScript Number. The source token is still preserved in the formatted output.`
    );
  }

  return warnings;
}
