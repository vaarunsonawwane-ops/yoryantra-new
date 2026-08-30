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

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(() => (result ? buildWarnings(result) : []), [result]);

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

    if (!source.trim()) {
      setError({ message: "JSON cannot be empty or contain only whitespace." });
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
      setError({ message: "The formatted JSON could not be copied. Select and copy it manually." });
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
      description="Validate JSON syntax, locate parser errors, detect duplicate object keys and risky number values, and format valid JSON without rewriting its original string or number tokens."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-900">JSON Input</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Objects, arrays, strings, numbers, booleans, and null are all valid top-level JSON values.
            </p>
          </div>
          <p className="text-xs text-gray-500">{input.length.toLocaleString()} characters</p>
        </div>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={exampleJson}
          spellCheck={false}
          className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={validateJson} className="yoryantra-btn">
          Validate JSON
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? <JsonErrorPanel details={error} /> : null}

      {result ? (
        <>
          <div className="mt-7 rounded-xl border border-green-200 bg-green-50 p-4">
            <h3 className="text-sm font-semibold text-green-900">Valid JSON syntax</h3>
            <p className="mt-2 text-sm leading-relaxed text-green-800">
              The input parsed successfully as a {result.rootType} value. Syntax validity does not mean the data matches an API contract or JSON Schema.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Root value" value={result.rootType} />
            <StatCard label="UTF-8 size" value={`${result.bytes.toLocaleString()} bytes`} />
            <StatCard label="Max depth" value={result.stats.maxDepth.toLocaleString()} />
            <StatCard label="Duplicate keys" value={result.duplicates.length.toLocaleString()} />
          </div>

          {warnings.length > 0 ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Review these details</h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-amber-800">
                {warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}

          {result.duplicates.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">Duplicate object keys</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                JSON syntax can still parse when an object repeats a name, but RFC 8259 says object names should be unique because receiver behavior is not reliably interoperable.
              </p>
              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="pr-6 pb-2 font-medium">Key</th>
                      <th className="pr-6 pb-2 font-medium">Line</th>
                      <th className="pb-2 font-medium">Column</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {result.duplicates.slice(0, 50).map((item, index) => (
                      <tr key={`${item.key}-${item.line}-${item.column}-${index}`} className="border-t border-gray-100">
                        <td className="py-2 pr-6 font-mono">{JSON.stringify(item.key)}</td>
                        <td className="py-2 pr-6">{item.line}</td>
                        <td className="py-2">{item.column}</td>
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
                <h3 className="text-lg font-semibold text-gray-900">Formatted JSON</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Formatting is done from the validated source text, so number spellings, string escapes, key order, and duplicate keys are not silently rewritten through JavaScript values.
                </p>
              </div>
              <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 yoryantra-output min-h-[320px] overflow-auto whitespace-pre text-sm">
              {result.formatted}
            </pre>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Objects" value={result.stats.objects.toLocaleString()} />
            <StatCard label="Arrays" value={result.stats.arrays.toLocaleString()} />
            <StatCard label="Properties" value={result.stats.properties.toLocaleString()} />
            <StatCard label="Primitive values" value={result.stats.primitiveValues.toLocaleString()} />
          </div>
        </>
      ) : null}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Browser-local processing</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          This page does not send your JSON to a validation API. Parsing, duplicate-key inspection, formatting, and diagnostics run in your browser.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What This JSON Validator Actually Checks</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The validator checks JSON grammar: quoted strings, escapes, numbers, commas, colons, brackets, braces, and the lowercase literals true, false, and null. A valid JSON document may have an object or array at the root, but it may also be a single string, number, boolean, or null value.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            When parsing succeeds, the formatter works from the original token stream instead of serializing the JavaScript result again. That matters when you are inspecting large integer spellings, exponent notation, escaped strings, or repeated object names.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Duplicate Keys Are a Data-Interoperability Warning</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 8259 says names inside a JSON object should be unique. Some parsers keep the last repeated value, some report duplicates, and other implementations behave differently. This tool therefore reports repeated names even when the browser parser accepts the document.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Numbers Need a JavaScript Reality Check</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON itself does not define JavaScript&apos;s safe-integer boundary. When an integer token is outside the exact IEEE-754 safe integer range, this validator leaves the original token untouched and warns you that converting it to a JavaScript Number can lose integer precision. Extremely large exponents that become non-finite in the browser are also flagged.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Syntax Validation Is Not Schema Validation</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A document can be perfectly valid JSON and still be wrong for your application. Required properties, allowed values, formats, numeric ranges, and object shapes belong to JSON Schema or application-level validation. Use this page when the first question is simply: “Can a conforming JSON parser read this text?”
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">About a Leading BOM</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON generators must not add a byte order mark to network JSON, although RFC 8259 allows parsers to ignore one for interoperability. If a pasted document begins with U+FEFF, this tool ignores it for parsing and reports the condition so you can remove it at the source.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-validator" />
        </div>
      </section>
    </ToolShell>
  );
}

function JsonErrorPanel({ details }: { details: ErrorDetails }) {
  return (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
      <h3 className="font-semibold">Invalid JSON syntax</h3>
      <p className="mt-2 leading-relaxed">{details.message}</p>
      {details.line && details.column ? (
        <p className="mt-2 font-medium">Line {details.line}, column {details.column}</p>
      ) : null}
      {details.excerpt !== undefined && details.caretOffset !== undefined ? (
        <pre className="mt-3 overflow-auto rounded-lg border border-red-100 bg-white/70 p-3 font-mono text-xs leading-5 text-red-900">{`${details.excerpt}\n${" ".repeat(details.caretOffset)}^`}</pre>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function getJsonErrorDetails(caught: unknown, source: string): ErrorDetails {
  const rawMessage = caught instanceof Error ? caught.message : "The input is not valid JSON.";
  const positionMatch = rawMessage.match(/position\s+(\d+)/i);
  const lineColumnMatch = rawMessage.match(/line\s+(\d+)\s+column\s+(\d+)/i);

  let line: number | undefined;
  let column: number | undefined;
  let index: number | undefined;

  if (positionMatch) {
    index = Math.min(Number(positionMatch[1]), source.length);
    const location = lineColumnFromIndex(source, index);
    line = location.line;
    column = location.column;
  } else if (lineColumnMatch) {
    line = Number(lineColumnMatch[1]);
    column = Number(lineColumnMatch[2]);
    index = indexFromLineColumn(source, line, column);
  }

  if (index === undefined || line === undefined || column === undefined) {
    return { message: rawMessage };
  }

  const lineStart = source.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
  const nextBreak = source.indexOf("\n", index);
  const lineEnd = nextBreak === -1 ? source.length : nextBreak;
  const fullLine = source.slice(lineStart, lineEnd).replace(/\r$/, "");
  const maxExcerpt = 140;
  const rawOffset = Math.max(0, index - lineStart);
  let excerpt = fullLine;
  let caretOffset = rawOffset;

  if (fullLine.length > maxExcerpt) {
    const start = Math.max(0, rawOffset - 60);
    const end = Math.min(fullLine.length, start + maxExcerpt);
    excerpt = `${start > 0 ? "…" : ""}${fullLine.slice(start, end)}${end < fullLine.length ? "…" : ""}`;
    caretOffset = rawOffset - start + (start > 0 ? 1 : 0);
  }

  return { message: rawMessage, line, column, excerpt, caretOffset };
}

function lineColumnFromIndex(source: string, index: number) {
  const before = source.slice(0, index);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.replace(/\r$/, "").length || 0) + 1,
  };
}

function indexFromLineColumn(source: string, line: number, column: number) {
  const lines = source.split("\n");
  let index = 0;
  for (let i = 0; i < Math.max(0, line - 1) && i < lines.length; i += 1) {
    index += lines[i].length + 1;
  }
  return Math.min(source.length, index + Math.max(0, column - 1));
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

    if (/\s/.test(character)) continue;

    if (character === "{" || character === "[") {
      output += character;
      indent += 1;
      if (nextNonWhitespace(source, index + 1) !== (character === "{" ? "}" : "]")) {
        output += newline();
      }
      continue;
    }

    if (character === "}" || character === "]") {
      indent = Math.max(0, indent - 1);
      if (previousNonWhitespace(source, index - 1) !== (character === "}" ? "{" : "[")) {
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
    if (!/\s/.test(source[index])) return source[index];
  }
  return "";
}

function previousNonWhitespace(source: string, start: number) {
  for (let index = start; index >= 0; index -= 1) {
    if (!/\s/.test(source[index])) return source[index];
  }
  return "";
}

function scanValidJson(source: string) {
  let index = 0;
  const duplicates: DuplicateKey[] = [];
  const numberFindings: NumberFinding[] = [];

  const skipWhitespace = () => {
    while (index < source.length && /[\x20\x09\x0a\x0d]/.test(source[index])) index += 1;
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
    while (index < source.length && !/[\x20\x09\x0a\x0d,\]}]/.test(source[index])) index += 1;
    const token = source.slice(start, index);
    const location = lineColumnFromIndex(source, start);

    if (/^-?(?:0|[1-9]\d*)$/.test(token)) {
      try {
        const numeric = BigInt(token);
        const absolute = numeric < BigInt(0) ? -numeric : numeric;
        if (absolute > BigInt(Number.MAX_SAFE_INTEGER)) {
          numberFindings.push({ token, ...location, kind: "unsafe-integer" });
        }
      } catch {
        // JSON.parse already validated the number token.
      }
    }

    if (!Number.isFinite(Number(token))) {
      numberFindings.push({ token, ...location, kind: "non-finite" });
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
        duplicates.push({ key: key.value, ...lineColumnFromIndex(source, key.start) });
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

function collectStats(value: unknown): JsonStats {
  const stats: JsonStats = { objects: 0, arrays: 0, properties: 0, primitiveValues: 0, maxDepth: 0 };

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
    warnings.push("A leading U+FEFF byte order mark was ignored for parsing. JSON generators should not emit a BOM.");
  }

  if (result.duplicates.length > 0) {
    warnings.push(`${result.duplicates.length.toLocaleString()} duplicate object key occurrence${result.duplicates.length === 1 ? " was" : "s were"} found. Different JSON consumers may not agree on repeated names.`);
  }

  const unsafeIntegers = result.numberFindings.filter((item) => item.kind === "unsafe-integer");
  const nonFinite = result.numberFindings.filter((item) => item.kind === "non-finite");

  if (unsafeIntegers.length > 0) {
    warnings.push(`${unsafeIntegers.length.toLocaleString()} integer token${unsafeIntegers.length === 1 ? " is" : "s are"} outside JavaScript's exact safe-integer range. Keep them as strings or use a big-integer-aware parser if exact integer identity matters.`);
  }

  if (nonFinite.length > 0) {
    warnings.push(`${nonFinite.length.toLocaleString()} number token${nonFinite.length === 1 ? " becomes" : "s become"} non-finite when converted to a JavaScript Number. The original JSON token is preserved in the formatted output.`);
  }

  return warnings;
}
