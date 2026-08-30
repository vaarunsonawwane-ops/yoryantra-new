"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type JsonStringMode = "literal" | "contents";

const escapeNonAsciiInJson = (value: string) => {
  let output = "";

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;

    if (codePoint <= 0x7f) {
      output += character;
      continue;
    }

    if (codePoint <= 0xffff) {
      output += `\\u${codePoint.toString(16).padStart(4, "0")}`;
      continue;
    }

    const adjusted = codePoint - 0x10000;
    const high = 0xd800 + (adjusted >> 10);
    const low = 0xdc00 + (adjusted & 0x3ff);
    output += `\\u${high.toString(16).padStart(4, "0")}\\u${low
      .toString(16)
      .padStart(4, "0")}`;
  }

  return output;
};

const encodeJsonString = (
  value: string,
  mode: JsonStringMode,
  escapeNonAscii: boolean
) => {
  let literal = JSON.stringify(value);

  if (escapeNonAscii) {
    literal = escapeNonAsciiInJson(literal);
  }

  return mode === "literal" ? literal : literal.slice(1, -1);
};

const decodeJsonString = (value: string, mode: JsonStringMode) => {
  const source = mode === "literal" ? value : `"${value}"`;
  const parsed = JSON.parse(source);

  if (typeof parsed !== "string") {
    throw new Error(
      "The input is valid JSON, but it is not a JSON string. Use a JSON formatter or validator for objects, arrays, numbers, booleans, and null."
    );
  }

  return parsed;
};

const countEscapeSequences = (value: string) =>
  (value.match(/\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/g) ?? []).length;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<JsonStringMode>("literal");
  const [escapeNonAscii, setEscapeNonAscii] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const escapeJSON = () => {
    try {
      setOutput(encodeJsonString(input, mode, escapeNonAscii));
      setError("");
      setHasResult(true);
    } catch {
      setError("Unable to encode this text as a JSON string.");
      setOutput("");
      setHasResult(false);
    }
  };

  const unescapeJSON = () => {
    try {
      setOutput(decodeJsonString(input, mode));
      setError("");
      setHasResult(true);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Invalid JSON string syntax.";
      setError(`Unable to unescape this JSON string. ${message}`);
      setOutput("");
      setHasResult(false);
    }
  };

  const loadExample = () => {
    if (mode === "literal") {
      setInput('"Line 1\\nLine 2: \\"quoted\\" and \\\\path"');
    } else {
      setInput('Line 1\\nLine 2: \\"quoted\\" and \\\\path');
    }
    setOutput("");
    setError("");
    setHasResult(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setHasResult(false);
  };

  const stats = useMemo(
    () => ({
      inputCharacters: Array.from(input).length,
      outputCharacters: Array.from(output).length,
      inputEscapes: countEscapeSequences(input),
      outputEscapes: countEscapeSequences(output),
    }),
    [input, output]
  );

  return (
    <ToolShell
      title="JSON Escape Unescape"
      description="Escape raw text as JSON string syntax or decode JSON string literals and escaped contents without confusing complete JSON documents with string values."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Input style
          </label>
          <select
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as JsonStringMode);
              setOutput("");
              setError("");
              setHasResult(false);
            }}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          >
            <option value="literal">JSON string literal (with outer quotes)</option>
            <option value="contents">Escaped contents only (no outer quotes)</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={escapeNonAscii}
              onChange={(event) => setEscapeNonAscii(event.target.checked)}
              className="h-4 w-4"
            />
            Escape non-ASCII characters as <code>\\uXXXX</code> when encoding
          </label>
        </div>
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {mode === "literal" ? "Text or JSON string literal" : "Text or escaped string contents"}
        </label>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            mode === "literal"
              ? 'Example for unescape: "Line 1\\nLine 2"'
              : "Example for unescape: Line 1\\nLine 2"
          }
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={escapeJSON} className="yoryantra-btn">
          Escape JSON String
        </button>
        <button onClick={unescapeJSON} className="yoryantra-btn-outline">
          Unescape JSON String
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 overflow-auto">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Result</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasResult
                ? `${stats.outputCharacters} output character${stats.outputCharacters === 1 ? "" : "s"} · ${stats.outputEscapes} JSON escape${stats.outputEscapes === 1 ? "" : "s"}`
                : `${stats.inputCharacters} input character${stats.inputCharacters === 1 ? "" : "s"} · ${stats.inputEscapes} recognized escape${stats.inputEscapes === 1 ? "" : "s"}`}
            </p>
          </div>

          {hasResult && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output mt-4 min-h-[180px] text-sm break-words whitespace-pre-wrap overflow-auto">
          {hasResult ? output : "Escaped or unescaped JSON string output will appear here."}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Privacy Note</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          The conversion runs in this browser. This page does not send your input to an API or backend service.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            JSON string escaping is not the same as serializing JSON
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A JSON string is text inside double quotes. Quotes, backslashes, and control characters such as newlines and tabs need JSON escape syntax when they appear inside that string. A complete JSON object or array is a different thing, so this tool deliberately refuses to “unescape” an object, array, number, boolean, or null as though it were a string.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Use the quoted-literal mode when you are working with values such as <code>{'"hello\\nworld"'}</code>. Use contents-only mode when a log, environment value, or other source contains just <code>hello\\nworld</code> without the surrounding JSON quotes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Escapes this tool follows
          </h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <p>
              JSON defines short escapes for <code>\\"</code>, <code>\\\\</code>, <code>\\/</code>, <code>\\b</code>, <code>\\f</code>, <code>\\n</code>, <code>\\r</code>, and <code>\\t</code>, plus four-hex-digit Unicode escapes such as <code>\\u00e9</code>. Characters outside the Basic Multilingual Plane use a UTF-16 surrogate pair when represented with <code>\\uXXXX</code> escapes.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A common double-escaping mistake
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            If a string is already JSON-escaped, escaping it again adds another layer of backslashes. That can be correct when one JSON string is intentionally embedded inside another, but it is wrong when the receiver expects only one encoded layer. Check which layer your API, log line, database field, or configuration value actually contains before escaping twice.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-escape-unescape" />
        </div>
      </section>
    </ToolShell>
  );
}
