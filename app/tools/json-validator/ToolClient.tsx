"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type IndentSize = "2" | "4";

type ValidationResult = {
  rootType: string;
  charCount: number;
  lineCount: number;
  duplicateKeys: string[];
  unsafeIntegers: string[];
  loneSurrogates: number;
};

type JsonErrorDetail = {
  kind: "validation" | "action";
  message: string;
  line: number | null;
  column: number | null;
  context: string;
  pointer: string;
};

const exampleJson = `{
  "name": "Sneha",
  "active": true,
  "tags": ["api", "debugging"],
  "limits": {
    "maxItems": 25,
    "nullable": null
  }
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [indentSize, setIndentSize] = useState<IndentSize>("2");
  const [output, setOutput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<JsonErrorDetail | null>(null);
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(() => {
    if (!result) return [];

    const next: string[] = [];

    if (result.duplicateKeys.length > 0) {
      const examples = result.duplicateKeys.slice(0, 4).join(", ");
      const more = result.duplicateKeys.length > 4 ? ` and ${result.duplicateKeys.length - 4} more` : "";
      next.push(
        `Duplicate object member names were found at ${examples}${more}. The JSON grammar permits parsers to accept them, but RFC 8259 recommends unique names because different software may keep different values.`
      );
    }

    if (result.unsafeIntegers.length > 0) {
      const examples = result.unsafeIntegers.slice(0, 4).join(", ");
      const more = result.unsafeIntegers.length > 4 ? ` and ${result.unsafeIntegers.length - 4} more` : "";
      next.push(
        `Integer token${result.unsafeIntegers.length === 1 ? "" : "s"} outside JavaScript's safe-integer range: ${examples}${more}. The JSON text is valid, but parsing into a JavaScript number can lose integer precision.`
      );
    }

    if (result.loneSurrogates > 0) {
      next.push(
        `${result.loneSurrogates} unpaired UTF-16 surrogate occurrence${
          result.loneSurrogates === 1 ? "" : "s"
        } ${result.loneSurrogates === 1 ? "was" : "were"} found inside JSON string data. RFC 8259 notes that such strings can be accepted by the grammar but behave unpredictably across software.`
      );
    }

    return next;
  }, [result]);

  const clearValidation = () => {
    setOutput("");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const validateJson = () => {
    if (!input.trim()) {
      setError({
        kind: "validation",
        message: "Please paste JSON to validate.",
        line: null,
        column: null,
        context: "",
        pointer: "",
      });
      setOutput("");
      setResult(null);
      setCopied(false);
      return;
    }

    if (input.charCodeAt(0) === 0xfeff) {
      setError({
        kind: "validation",
        message:
          "A leading byte-order mark (BOM) was detected. JSON generators must not add a BOM; remove it before validating for browser JSON.parse compatibility.",
        line: 1,
        column: 1,
        context: input.split(/\r?\n/, 1)[0] || "",
        pointer: "^",
      });
      setOutput("");
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const parsed = JSON.parse(input) as unknown;
      const cleanSource = input.trim();
      const duplicateKeys = findDuplicateObjectKeys(cleanSource);
      const unsafeIntegers = findUnsafeIntegerTokens(cleanSource);
      const loneSurrogates = countLoneSurrogatesInJsonStrings(cleanSource);

      setOutput(formatJsonText(cleanSource, Number(indentSize)));
      setResult({
        rootType: describeRootType(parsed),
        charCount: cleanSource.length,
        lineCount: cleanSource.split(/\r\n|\r|\n/).length,
        duplicateKeys,
        unsafeIntegers,
        loneSurrogates,
      });
      setError(null);
      setCopied(false);
    } catch (err) {
      const nextError = buildJsonErrorDetail(
        input,
        err instanceof Error ? err.message : "Invalid JSON."
      );
      setError(nextError);
      setOutput("");
      setResult(null);
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError(null);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError({
        kind: "action",
        message: "The formatted JSON could not be copied. Select it and copy it manually.",
        line: null,
        column: null,
        context: "",
        pointer: "",
      });
    }
  };

  const loadExample = () => {
    setInput(exampleJson);
    clearValidation();
  };

  const resetAll = () => {
    setInput("");
    setIndentSize("2");
    clearValidation();
  };

  return (
    <ToolShell
      title="JSON Validator"
      description="Validate JSON syntax, locate parsing errors, pretty-print valid JSON, and review interoperability warnings for duplicate keys and large integer values."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">JSON Input</label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Paste a complete JSON text. Objects, arrays, strings, numbers, booleans, and null can all be valid top-level JSON values.
        </p>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearValidation();
          }}
          placeholder="Paste JSON here..."
          spellCheck={false}
          className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono leading-6 outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Output Settings</h3>
        <div className="mt-4 max-w-sm">
          <YoryantraSelect
            label="Indentation"
            value={indentSize}
            onChange={(value) => {
              setIndentSize(value as IndentSize);
              clearValidation();
            }}
            options={[
              { label: "2 spaces", value: "2" },
              { label: "4 spaces", value: "4" },
            ]}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Formatting is applied to the already-validated source text without re-serializing parsed values, so duplicate keys and original number spellings remain visible in the output.
        </p>
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

      {error ? (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-semibold">
            {error.kind === "validation" ? "JSON is not valid for this parser" : "Action could not be completed"}
          </div>
          <p className="mt-2 leading-relaxed break-words">{error.message}</p>
          {error.line !== null && error.column !== null ? (
            <p className="mt-2 text-red-700">
              Approximate location: line {error.line}, column {error.column}
            </p>
          ) : null}
          {error.context ? (
            <pre className="mt-3 overflow-auto rounded-lg border border-red-200 bg-white/70 p-3 font-mono text-xs leading-5 text-red-900 whitespace-pre">
              {error.context}
              {"\n"}
              {error.pointer}
            </pre>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <strong>Valid JSON syntax.</strong> The text was accepted by the browser&apos;s JSON parser.
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Top-level value" value={result.rootType} />
            <SummaryCard label="Characters" value={result.charCount.toLocaleString()} />
            <SummaryCard label="Lines" value={result.lineCount.toLocaleString()} />
            <SummaryCard label="Warnings" value={warnings.length.toLocaleString()} />
          </div>
        </>
      ) : null}

      {warnings.length > 0 ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Interoperability warnings</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Formatted JSON</h3>
            <p className="mt-1 text-sm text-gray-500">
              Appears only after syntax validation succeeds.
            </p>
          </div>
          {output ? (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy Output"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Validated and formatted JSON will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          The JSON stays in the browser tab during validation
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Parsing, formatting, and the extra warning checks run in client-side JavaScript; the pasted JSON is not sent to an application server by these actions. Secrets still deserve care because browser extensions, managed-device software, screenshots, and clipboard history are separate exposure paths.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Syntax is only the first question</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The first check is whether the input can be parsed by the browser&apos;s built-in <code className="font-mono text-sm">JSON.parse()</code>. That catches grammar errors such as missing commas, trailing commas, single-quoted strings, unescaped control characters, malformed escape sequences, invalid number forms, and unbalanced braces or brackets.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Syntax validation answers one narrow question: “is this JSON text grammatically parseable?” It does not prove that the data has the fields your API requires, that IDs exist, that URLs are reachable, or that values satisfy a business rule. Those are schema or application-level checks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON Is Not a JavaScript Object Literal</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ExampleCard title="Valid JSON">
              {`{
  "name": "Yoryantra",
  "active": true,
  "count": 3
}`}
            </ExampleCard>
            <ExampleCard title="JavaScript-like, but invalid JSON">
              {`{
  name: 'Yoryantra',
  active: true,
  count: 3,
}`}
            </ExampleCard>
          </div>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON requires double quotes around object member names and string values, does not allow trailing commas or comments, and has no values such as <code className="font-mono text-sm">undefined</code>, <code className="font-mono text-sm">NaN</code>, or <code className="font-mono text-sm">Infinity</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Top-Level Scalars Are Valid JSON</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A complete JSON text does not have to start with an object or array. Values such as <code className="font-mono text-sm">"hello"</code>, <code className="font-mono text-sm">42</code>, <code className="font-mono text-sm">true</code>, and <code className="font-mono text-sm">null</code> are valid JSON texts under RFC 8259. An API may still impose its own rule that the payload must be an object or array.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Duplicate Object Names: Validity vs Interoperability</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 8259 says names within an object should be unique. Parsers commonly accept duplicate names anyway, but their behavior is not reliably interoperable: one implementation may keep the last value, another may expose every pair, and another may reject the document. Duplicate names therefore remain visible in formatted output and are reported as an interoperability warning rather than being silently collapsed.
          </p>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`{
  "role": "viewer",
  "role": "admin"
}`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Large Integers and JavaScript Number Precision</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON itself does not define JavaScript&apos;s numeric precision limit. In JavaScript, however, integers outside the safe range from <code className="font-mono text-sm">-(2^53 - 1)</code> to <code className="font-mono text-sm">2^53 - 1</code> may lose precision when converted to a <code className="font-mono text-sm">number</code>. This page flags integer tokens outside that range. The formatter works from the validated source text instead of <code className="font-mono text-sm">JSON.stringify(JSON.parse(...))</code>, so it does not silently rewrite a large integer token merely to pretty-print it.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            If an identifier must remain exact across JavaScript systems, a decimal string is often safer than relying on an arbitrarily large JSON number. The correct representation still depends on the contract used by both producer and consumer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How Error Locations Should Be Read</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Parse error wording is produced by the browser engine and can differ between browsers. When the engine reports a character position or line and column, a nearby line is shown with a caret. Treat that location as a debugging hint: the actual mistake can sit just before the reported character, such as a missing comma on the previous property.
          </p>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li><strong>Unexpected property name:</strong> check the comma before that property.</li>
              <li><strong>Unexpected closing brace/bracket:</strong> check for a trailing comma or missing value.</li>
              <li><strong>Bad escaped character:</strong> JSON strings allow a limited escape set; a Windows path often needs doubled backslashes.</li>
              <li><strong>Unexpected end:</strong> look for an unclosed string, array, object, or an incomplete value at the end of the text.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Syntax Validation vs JSON Schema Validation</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A document can be perfectly valid JSON and still be invalid for your application. For example, <code className="font-mono text-sm">{"{\"age\": -5}"}</code> is valid JSON syntax, but a schema could require age to be a non-negative integer. Use syntax validation first when the parser itself is failing; use JSON Schema validation when you need to enforce shape, required properties, formats, ranges, or other contract rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">BOMs, Unicode, and Portable JSON</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 8259 requires JSON exchanged between systems outside a closed ecosystem to use UTF-8 and says generators must not add a byte-order mark (BOM). Parsers are permitted to ignore a BOM for interoperability, so different software can behave differently. A leading BOM is reported explicitly instead of being silently removed.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON strings can contain Unicode characters directly or through <code className="font-mono text-sm">\uXXXX</code> escapes. A paired surrogate escape can represent a character outside the Basic Multilingual Plane, while an unpaired surrogate can still fit the JSON grammar and yet behave unpredictably across software. Those lone surrogate cases are reported separately from syntax errors.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The grammar and the browser parser are two different references
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Interchange rules such as UTF-8, duplicate-name interoperability, number guidance, BOM handling, and Unicode edge cases come from{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 8259
            </a>
            .{" "}
            <a
              href="https://ecma-international.org/publications-and-standards/standards/ecma-404/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              ECMA-404
            </a>
            {" "}defines the JSON syntax itself. The actual parse result and error wording in this page come from the JavaScript engine&apos;s{" "}
            <a
              href="https://tc39.es/ecma262/#sec-json.parse"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              JSON.parse semantics in ECMAScript
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            After syntax, check the data contract
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-validator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ExampleCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <pre className="mt-3 whitespace-pre-wrap break-words">{children}</pre>
    </div>
  );
}

function describeRootType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function formatJsonText(source: string, indentSize: number) {
  let output = "";
  let depth = 0;
  let inString = false;
  let escaped = false;
  const indent = (level: number) => " ".repeat(level * indentSize);

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

    if (character === "{" || character === "[") {
      output += character;
      depth += 1;

      const next = nextNonWhitespace(source, index + 1);
      if ((character === "{" && next !== "}") || (character === "[" && next !== "]")) {
        output += `\n${indent(depth)}`;
      }
      continue;
    }

    if (character === "}" || character === "]") {
      depth = Math.max(0, depth - 1);
      const previous = previousNonWhitespace(source, index - 1);
      if ((character === "}" && previous !== "{") || (character === "]" && previous !== "[")) {
        output = output.replace(/[ \t]+$/g, "");
        if (!output.endsWith("\n")) output += "\n";
        output += indent(depth);
      }
      output += character;
      continue;
    }

    if (character === ",") {
      output += `,\n${indent(depth)}`;
      continue;
    }

    if (character === ":") {
      output += ": ";
      continue;
    }

    if (/\s/.test(character)) {
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

function buildJsonErrorDetail(source: string, message: string): JsonErrorDetail {
  const lines = source.split(/\r\n|\r|\n/);
  let line: number | null = null;
  let column: number | null = null;

  const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColumnMatch) {
    line = Number(lineColumnMatch[1]);
    column = Number(lineColumnMatch[2]);
  } else {
    const positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch) {
      const position = Math.min(Number(positionMatch[1]), source.length);
      const location = positionToLineColumn(source, position);
      line = location.line;
      column = location.column;
    } else if (/unexpected end/i.test(message)) {
      line = Math.max(1, lines.length);
      column = (lines[lines.length - 1] || "").length + 1;
    }
  }

  const context = line !== null ? lines[Math.max(0, line - 1)] || "" : "";
  const safeColumn = column !== null ? Math.max(1, column) : null;
  const pointer = safeColumn !== null ? `${" ".repeat(Math.min(safeColumn - 1, 200))}^` : "";

  return {
    kind: "validation",
    message,
    line,
    column: safeColumn,
    context,
    pointer,
  };
}

function positionToLineColumn(source: string, position: number) {
  let line = 1;
  let column = 1;

  for (let index = 0; index < position; index += 1) {
    if (source[index] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function findDuplicateObjectKeys(source: string) {
  let index = 0;
  const duplicates: string[] = [];

  const skipWhitespace = () => {
    while (index < source.length && /\s/.test(source[index])) index += 1;
  };

  const readStringToken = () => {
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

    const token = source.slice(start, index);
    try {
      return JSON.parse(token) as string;
    } catch {
      return token;
    }
  };

  const skipPrimitive = () => {
    while (index < source.length && !/[\s,\]}]/.test(source[index])) index += 1;
  };

  const parseValue = (path: string) => {
    skipWhitespace();
    const character = source[index];

    if (character === "{") {
      parseObject(path);
      return;
    }

    if (character === "[") {
      parseArray(path);
      return;
    }

    if (character === '"') {
      readStringToken();
      return;
    }

    skipPrimitive();
  };

  const parseObject = (path: string) => {
    index += 1;
    skipWhitespace();
    const keys = new Set<string>();

    if (source[index] === "}") {
      index += 1;
      return;
    }

    while (index < source.length) {
      skipWhitespace();
      const key = readStringToken();
      const keyPath = `${path}[${JSON.stringify(key)}]`;

      if (keys.has(key)) duplicates.push(keyPath);
      keys.add(key);

      skipWhitespace();
      if (source[index] === ":") index += 1;
      parseValue(keyPath);
      skipWhitespace();

      if (source[index] === ",") {
        index += 1;
        continue;
      }

      if (source[index] === "}") index += 1;
      return;
    }
  };

  const parseArray = (path: string) => {
    index += 1;
    skipWhitespace();
    let itemIndex = 0;

    if (source[index] === "]") {
      index += 1;
      return;
    }

    while (index < source.length) {
      parseValue(`${path}[${itemIndex}]`);
      itemIndex += 1;
      skipWhitespace();

      if (source[index] === ",") {
        index += 1;
        continue;
      }

      if (source[index] === "]") index += 1;
      return;
    }
  };

  parseValue("$");
  return duplicates;
}

function findUnsafeIntegerTokens(source: string) {
  const unsafe: string[] = [];
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (inString) {
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
      continue;
    }

    if (character === "-" || /[0-9]/.test(character)) {
      const match = source
        .slice(index)
        .match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);

      if (!match) continue;
      const token = match[0];
      index += token.length - 1;

      if (!/[.eE]/.test(token) && isOutsideSafeIntegerRange(token)) {
        unsafe.push(token);
      }
    }
  }

  return unsafe;
}

function countLoneSurrogatesInJsonStrings(source: string) {
  let count = 0;
  let inString = false;

  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    const character = source[index];

    if (!inString) {
      if (character === '"') inString = true;
      continue;
    }

    if (character === '"') {
      inString = false;
      continue;
    }

    if (character === "\\") {
      const escapeType = source[index + 1];

      if (escapeType === "u" && /^[0-9A-Fa-f]{4}$/.test(source.slice(index + 2, index + 6))) {
        const value = Number.parseInt(source.slice(index + 2, index + 6), 16);

        if (value >= 0xd800 && value <= 0xdbff) {
          const nextEscape = source.slice(index + 6, index + 12);
          const lowMatch = nextEscape.match(/^\\u([0-9A-Fa-f]{4})$/);
          const low = lowMatch ? Number.parseInt(lowMatch[1], 16) : -1;

          if (low >= 0xdc00 && low <= 0xdfff) {
            index += 11;
            continue;
          }

          count += 1;
        } else if (value >= 0xdc00 && value <= 0xdfff) {
          count += 1;
        }

        index += 5;
        continue;
      }

      index += 1;
      continue;
    }

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = source.charCodeAt(index + 1);

      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        count += 1;
      }
      continue;
    }

    if (code >= 0xdc00 && code <= 0xdfff) {
      count += 1;
    }
  }

  return count;
}

function isOutsideSafeIntegerRange(token: string) {
  const absolute = token.startsWith("-") ? token.slice(1) : token;
  const normalized = absolute.replace(/^0+(?=\d)/, "");
  const maxSafe = "9007199254740991";

  if (normalized.length !== maxSafe.length) return normalized.length > maxSafe.length;
  return normalized > maxSafe;
}
