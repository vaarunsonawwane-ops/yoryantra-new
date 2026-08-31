"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type IndentMode = "2" | "4" | "tab";

type JsonResult = {
  output: string;
  rootType: string;
  inputBytes: number;
  outputBytes: number;
  duplicateKeys: string[];
  unsafeIntegers: string[];
};

const sampleJson = `{"user":{"id":9007199254740993,"name":"Yoryantra"},"tags":["api","debug"],"active":true}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [indentMode, setIndentMode] = useState<IndentMode>("2");
  const [result, setResult] = useState<JsonResult | null>(null);
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
      const indent = indentMode === "tab" ? "\t" : " ".repeat(Number(indentMode));
      const output = prettyPrintJson(input, indent);
      const diagnostics = inspectJsonSource(input);

      setResult({
        output,
        rootType: detectRootType(parsed),
        inputBytes: getUtf8Bytes(input),
        outputBytes: getUtf8Bytes(output),
        duplicateKeys: diagnostics.duplicateKeys,
        unsafeIntegers: diagnostics.unsafeIntegers,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(formatJsonError(caught, input));
    }
  };

  const copyOutput = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
  };

  const resetAll = () => {
    setInput("");
    setIndentMode("2");
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Formatter"
      description="Pretty print valid JSON without reserializing the parsed value, so number spellings, key order, and duplicate-key text remain visible for inspection."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">JSON Input</label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder='{"name":"Yoryantra","active":true}'
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 max-w-xs">
        <YoryantraSelect
          label="Indentation"
          value={indentMode}
          onChange={(value) => {
            setIndentMode(value as IndentMode);
            clearResult();
          }}
          options={[
            { label: "2 spaces", value: "2" },
            { label: "4 spaces", value: "4" },
            { label: "Tab", value: "tab" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={formatJSON} className="yoryantra-btn">Format JSON</button>
        <button
          type="button"
          onClick={() => {
            setInput(sampleJson);
            clearResult();
          }}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 whitespace-pre-wrap">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Formatted JSON</h3>
              <p className="mt-1 text-sm text-gray-500">
                Root: {result.rootType} · Input {result.inputBytes.toLocaleString()} bytes · Output {result.outputBytes.toLocaleString()} bytes
              </p>
            </div>
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="yoryantra-output mt-3 min-h-[220px] overflow-auto whitespace-pre text-sm font-mono">
            {result.output}
          </pre>

          {result.duplicateKeys.length || result.unsafeIntegers.length ? (
            <div className="mt-5 space-y-3">
              {result.duplicateKeys.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>Duplicate member name{result.duplicateKeys.length === 1 ? "" : "s"}:</strong>{" "}
                  {result.duplicateKeys.slice(0, 8).join(", ")}
                  {result.duplicateKeys.length > 8 ? " …" : ""}. JSON.parse keeps only the last value for a duplicate name, so the formatter preserves the source tokens instead of rebuilding from the parsed object.
                </div>
              ) : null}

              {result.unsafeIntegers.length ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <strong>JavaScript integer precision warning:</strong>{" "}
                  {result.unsafeIntegers.slice(0, 6).join(", ")}
                  {result.unsafeIntegers.length > 6 ? " …" : ""}. These integer literals exceed JavaScript&apos;s safe-integer range. Their original text is preserved in the formatted output.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Formatting JSON without changing its token text</h2>
          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              This formatter first checks the input with the browser&apos;s JSON parser, then inserts indentation around the original JSON tokens. That matters when you are inspecting large integer literals, duplicate member names, escape spelling, or source key order.
            </p>
            <p>
              JSON objects are semantically unordered, so key order should not be used as application logic. The formatter keeps the source order only because it is useful while debugging and reviewing payloads.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Formatter vs validator</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Formatting answers a presentation question: is this valid JSON, and how can it be indented for reading? It does not validate business rules or a JSON Schema. For deeper syntax diagnostics, duplicate-key review, and JSON-specific edge cases, use the dedicated JSON Validator.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <strong>Local processing:</strong> the JSON is parsed and formatted in your browser. The tool does not send the pasted payload to an API.
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            JSON syntax and interoperability rules are defined by{" "}
            <a className="underline" href="https://www.rfc-editor.org/rfc/rfc8259" target="_blank" rel="noreferrer">RFC 8259</a>.
          </p>
        </div>

        <YoryantraRelatedTools currentHref="/tools/json-formatter" />
      </section>
    </ToolShell>
  );
}

function prettyPrintJson(source: string, indent: string) {
  let output = "";
  let depth = 0;
  let inString = false;
  let escaped = false;

  const nextSignificant = (start: number) => {
    for (let index = start; index < source.length; index += 1) {
      if (!/\s/.test(source[index])) return source[index];
    }
    return "";
  };

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

    if (/\s/.test(char)) continue;

    if (char === "{" || char === "[") {
      output += char;
      const closing = char === "{" ? "}" : "]";
      if (nextSignificant(index + 1) !== closing) {
        depth += 1;
        output += "\n" + indent.repeat(depth);
      }
      continue;
    }

    if (char === "}" || char === "]") {
      const previous = output.trimEnd().slice(-1);
      const opening = char === "}" ? "{" : "[";
      if (previous !== opening) {
        depth = Math.max(depth - 1, 0);
        output = output.trimEnd() + "\n" + indent.repeat(depth);
      }
      output += char;
      continue;
    }

    if (char === ",") {
      output += ",\n" + indent.repeat(depth);
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

function inspectJsonSource(source: string) {
  const duplicateKeys: string[] = [];
  const unsafeIntegers: string[] = [];
  const stack: Array<{ type: "object" | "array"; keys?: Set<string> }> = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({ type: "object", keys: new Set<string>() });
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
      while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;

      const current = stack[stack.length - 1];
      if (source[cursor] === ":" && current?.type === "object" && current.keys) {
        try {
          const key = JSON.parse(raw) as string;
          if (current.keys.has(key)) {
            duplicateKeys.push(key);
          } else {
            current.keys.add(key);
          }
        } catch {
          // JSON.parse(input) already validates string syntax.
        }
      }

      index = end + 1;
      continue;
    }

    if (char === "-" || /[0-9]/.test(char)) {
      const match = source.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (match) {
        const token = match[0];
        if (/^-?\d+$/.test(token)) {
          try {
            const numeric = BigInt(token);
            const absolute = numeric < BigInt(0) ? -numeric : numeric;
            if (absolute > BigInt(Number.MAX_SAFE_INTEGER)) unsafeIntegers.push(token);
          } catch {
            // Ignore; JSON.parse already validated the token.
          }
        }
        index += token.length;
        continue;
      }
    }

    index += 1;
  }

  return { duplicateKeys, unsafeIntegers };
}

function findJsonStringEnd(source: string, start: number) {
  let escaped = false;
  for (let index = start + 1; index < source.length; index += 1) {
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

function formatJsonError(caught: unknown, source: string) {
  const message = caught instanceof Error ? caught.message : "Invalid JSON input.";
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) return `Invalid JSON. ${message}`;

  const position = Number(positionMatch[1]);
  const before = source.slice(0, position);
  const line = before.split(/\r?\n/).length;
  const lastBreak = Math.max(before.lastIndexOf("\n"), before.lastIndexOf("\r"));
  const column = position - lastBreak;
  const lines = source.split(/\r?\n/);
  const excerpt = lines[line - 1] ?? "";
  const caret = " ".repeat(Math.max(column - 1, 0)) + "^";

  return `Invalid JSON near line ${line}, column ${column}.\n${excerpt}\n${caret}\n${message}`;
}

function detectRootType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function getUtf8Bytes(value: string) {
  return new TextEncoder().encode(value).length;
}
