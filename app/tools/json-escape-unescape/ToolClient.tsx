"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type JsonStringMode = "literal" | "contents";
type Operation = "escape" | "unescape";

type Result = {
  output: string;
  operation: Operation;
  inputCharacters: number;
  outputCharacters: number;
  inputEscapes: number;
  outputEscapes: number;
  warnings: string[];
};

const literalExample = `"Line 1\\nLine 2: \\"quoted\\" and \\\\path"`;
const contentsExample = `Line 1\\nLine 2: \\"quoted\\" and \\\\path`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<JsonStringMode>("literal");
  const [escapeNonAscii, setEscapeNonAscii] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const liveStats = useMemo(
    () => ({
      characters: Array.from(input).length,
      escapes: countEscapeSequences(input),
    }),
    [input]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const runEscape = () => {
    try {
      const output = encodeJsonString(input, mode, escapeNonAscii);
      const warnings = buildSurrogateWarnings(input, "input");

      setResult({
        output,
        operation: "escape",
        inputCharacters: Array.from(input).length,
        outputCharacters: Array.from(output).length,
        inputEscapes: countEscapeSequences(input),
        outputEscapes: countEscapeSequences(output),
        warnings,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setCopied(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to encode this text as a JSON string."
      );
    }
  };

  const runUnescape = () => {
    if (input.length === 0 && mode === "literal") {
      setResult(null);
      setCopied(false);
      setError("Enter a quoted JSON string literal to decode.");
      return;
    }

    try {
      const output = decodeJsonString(input, mode);
      const warnings = buildSurrogateWarnings(output, "decoded output");

      setResult({
        output,
        operation: "unescape",
        inputCharacters: Array.from(input).length,
        outputCharacters: Array.from(output).length,
        inputEscapes: countEscapeSequences(input),
        outputEscapes: countEscapeSequences(output),
        warnings,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Invalid JSON string syntax.";

      setResult(null);
      setCopied(false);
      setError(`Unable to unescape this JSON string. ${message}`);
    }
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The output could not be copied. Select and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(mode === "literal" ? literalExample : contentsExample);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setMode("literal");
    setEscapeNonAscii(false);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON Escape Unescape"
      description="Escape raw text as JSON string syntax or decode a quoted JSON string literal or escaped string contents. The tool stays focused on JSON strings so objects, arrays, numbers, booleans, and null are not accidentally treated as text escapes."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input / output style"
            value={mode}
            onChange={(value) => {
              setMode(value as JsonStringMode);
              clearResult();
            }}
            options={[
              {
                label: "JSON string literal (with outer quotes)",
                value: "literal",
              },
              {
                label: "Escaped contents only (no outer quotes)",
                value: "contents",
              },
            ]}
          />

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={escapeNonAscii}
              onChange={(event) => {
                setEscapeNonAscii(event.target.checked);
                clearResult();
              }}
              className="h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
            />
            <span>
              Escape non-ASCII characters as <code>\uXXXX</code> when encoding
            </span>
          </label>
        </div>

        <div className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                {mode === "literal"
                  ? "Raw text to escape, or a quoted JSON string to unescape"
                  : "Raw text to escape, or escaped string contents to unescape"}
              </label>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                Escape treats the box as raw text. Unescape applies strict JSON
                string parsing to the selected form.
              </p>
            </div>

            <p className="text-xs text-gray-500">
              {liveStats.characters.toLocaleString()} characters ·{" "}
              {liveStats.escapes.toLocaleString()} recognized escapes
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={mode === "literal" ? literalExample : contentsExample}
            spellCheck={false}
            className="mt-4 w-full min-h-[300px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={runEscape} className="yoryantra-btn">
          Escape JSON String
        </button>

        <button
          type="button"
          onClick={runUnescape}
          className="yoryantra-btn-outline"
        >
          Unescape JSON String
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
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Operation"
              value={result.operation === "escape" ? "Escape" : "Unescape"}
            />
            <StatCard
              label="Input chars"
              value={result.inputCharacters.toLocaleString()}
            />
            <StatCard
              label="Output chars"
              value={result.outputCharacters.toLocaleString()}
            />
            <StatCard
              label="Output escapes"
              value={result.outputEscapes.toLocaleString()}
            />
          </div>

          {result.warnings.length > 0 ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                Unicode interoperability note
              </h3>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-amber-800">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Result</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {result.operation === "escape"
                    ? "The result is JSON string syntax for the selected quoted or contents-only form."
                    : "The result is the decoded string value, displayed as plain text rather than reparsed as JSON."}
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

            <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {result.output}
            </pre>
          </div>
        </>
      ) : (
        <div className="mt-8 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Escaped or unescaped JSON string output will appear here.
        </div>
      )}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser-local conversion
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          The escape and unescape operation runs in your browser. This tool
          does not send the pasted string to an encoding or decoding API.
          Site-wide analytics or advertising scripts, if enabled by the
          website, are separate from this conversion operation.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            JSON String Escaping Is One Layer of Serialization
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A JSON string is a sequence of characters represented between
            double quotes. The quotation mark, reverse solidus (backslash), and
            control characters U+0000 through U+001F need JSON escape syntax
            when serialized. A complete JSON object or array is a different
            data structure, so this tool deliberately refuses to decode an
            object, array, number, boolean, or null as if it were a string.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use quoted-literal mode for values such as{" "}
            <code>{'"hello\\nworld"'}</code>. Use contents-only mode when a log,
            environment value, source-code fragment, or database field contains
            only <code>hello\\nworld</code> without the outer JSON quotation
            marks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Escapes Defined by JSON
          </h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <p>
              JSON defines short escapes for <code>\&quot;</code>,{" "}
              <code>\\</code>, <code>\/</code>, <code>\b</code>,{" "}
              <code>\f</code>, <code>\n</code>, <code>\r</code>, and{" "}
              <code>\t</code>, plus <code>\u</code> followed by four
              hexadecimal digits. Escaping the solidus <code>/</code> is
              allowed but not required, so this encoder normally leaves it
              unchanged.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Non-ASCII Characters Do Not Normally Need Escaping
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON exchanged between systems is expected to use UTF-8, so normal
            Unicode characters can usually remain readable in the serialized
            string. The non-ASCII option is useful for systems or source files
            that specifically require <code>\uXXXX</code> notation. Characters
            outside the Basic Multilingual Plane are represented by two UTF-16
            surrogate escapes when that option is enabled.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Unpaired UTF-16 Surrogates Are an Interoperability Trap
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The JSON grammar can contain an escape such as{" "}
            <code>\uDEAD</code> even though that value is not a Unicode scalar
            value by itself. RFC 8259 warns that software behavior for such
            strings can be unpredictable. This tool keeps lone surrogate code
            units escaped when generating JSON and reports them after encoding
            or decoding so they are not mistaken for ordinary Unicode text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Double-Escaping Is Sometimes Correct—and Often a Bug
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Escaping an already escaped string adds another layer of
            backslashes. That is correct when one JSON string is deliberately
            embedded inside another JSON string, but wrong when the receiver
            expects only one serialization layer. Count the boundaries in your
            workflow: JavaScript source, JSON document, HTTP body, log line,
            database field, and shell command can each introduce a different
            quoting layer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JSON Escaping Is Not JavaScript or HTML Escaping
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON string syntax is designed for JSON. It does not automatically
            make text safe for an HTML, JavaScript, CSS, shell, SQL, or URL
            context. Apply the encoding rules for the destination that will
            actually parse the value instead of stacking unrelated escaping
            methods.
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
          <YoryantraRelatedTools currentHref="/tools/json-escape-unescape" />
        </div>
      </section>
    </ToolShell>
  );
}

function encodeJsonString(
  value: string,
  mode: JsonStringMode,
  escapeNonAscii: boolean
) {
  const contents = escapeJsonStringContents(value, escapeNonAscii);
  return mode === "literal" ? `"${contents}"` : contents;
}

function escapeJsonStringContents(value: string, escapeNonAscii: boolean) {
  let output = "";

  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit === 0x22) {
      output += '\\"';
      continue;
    }

    if (codeUnit === 0x5c) {
      output += "\\\\";
      continue;
    }

    if (codeUnit === 0x08) {
      output += "\\b";
      continue;
    }

    if (codeUnit === 0x0c) {
      output += "\\f";
      continue;
    }

    if (codeUnit === 0x0a) {
      output += "\\n";
      continue;
    }

    if (codeUnit === 0x0d) {
      output += "\\r";
      continue;
    }

    if (codeUnit === 0x09) {
      output += "\\t";
      continue;
    }

    if (codeUnit <= 0x1f) {
      output += toUnicodeEscape(codeUnit);
      continue;
    }

    const isHigh = codeUnit >= 0xd800 && codeUnit <= 0xdbff;
    const isLow = codeUnit >= 0xdc00 && codeUnit <= 0xdfff;

    if (isHigh) {
      const next =
        index + 1 < value.length ? value.charCodeAt(index + 1) : -1;
      const hasPair = next >= 0xdc00 && next <= 0xdfff;

      if (hasPair) {
        if (escapeNonAscii) {
          output += `${toUnicodeEscape(codeUnit)}${toUnicodeEscape(next)}`;
        } else {
          output += value[index] + value[index + 1];
        }
        index += 1;
        continue;
      }

      output += toUnicodeEscape(codeUnit);
      continue;
    }

    if (isLow) {
      output += toUnicodeEscape(codeUnit);
      continue;
    }

    if (escapeNonAscii && codeUnit > 0x7f) {
      output += toUnicodeEscape(codeUnit);
      continue;
    }

    output += value[index];
  }

  return output;
}

function toUnicodeEscape(codeUnit: number) {
  return `\\u${codeUnit.toString(16).toUpperCase().padStart(4, "0")}`;
}

function decodeJsonString(value: string, mode: JsonStringMode) {
  const source = mode === "literal" ? value : `"${value}"`;
  const parsed = JSON.parse(source) as unknown;

  if (typeof parsed !== "string") {
    throw new Error(
      "The input is valid JSON, but it is not a JSON string. Use a JSON validator or formatter for objects, arrays, numbers, booleans, and null."
    );
  }

  return parsed;
}

function countEscapeSequences(value: string) {
  return (value.match(/\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/g) || []).length;
}

function buildSurrogateWarnings(value: string, label: string) {
  const positions = findLoneSurrogatePositions(value);

  if (positions.length === 0) return [];

  const preview = positions
    .slice(0, 5)
    .map((position) => (position + 1).toLocaleString())
    .join(", ");

  return [
    `${positions.length.toLocaleString()} unpaired UTF-16 surrogate code unit${
      positions.length === 1 ? " was" : "s were"
    } found in the ${label}${preview ? ` at code-unit position${positions.length === 1 ? "" : "s"} ${preview}` : ""}. These values can cause interoperability problems even when represented with JSON \\uXXXX syntax.`,
  ];
}

function findLoneSurrogatePositions(value: string) {
  const positions: number[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next =
        index + 1 < value.length ? value.charCodeAt(index + 1) : -1;

      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        positions.push(index);
      }

      continue;
    }

    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      positions.push(index);
    }
  }

  return positions;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
