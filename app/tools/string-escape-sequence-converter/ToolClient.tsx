"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "decode" | "encode" | "inspect" | "normalize";
type EscapeStyle = "javascript" | "json" | "unicode" | "hex" | "c";
type OutputMode = "text" | "json" | "markdown" | "csv" | "checklist";
type NewlineMode = "preserve" | "lf" | "crlf";

type CharacterRow = {
  index: number;
  char: string;
  display: string;
  codePoint: number;
  unicode: string;
  hex: string;
  category: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  convertedText: string;
  rows: CharacterRow[];
  issues: Issue[];
  inputLength: number;
  outputLength: number;
  escapeCount: number;
  lineCount: number;
};

const sampleInput = String.raw`Hello\nYoryantra\nUnicode: \u0935\u0930\u0941\u0923\nEmoji: \u{1F680}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("decode");
  const [escapeStyle, setEscapeStyle] = useState<EscapeStyle>("javascript");
  const [outputMode, setOutputMode] = useState<OutputMode>("text");
  const [newlineMode, setNewlineMode] = useState<NewlineMode>("preserve");
  const [trimInput, setTrimInput] = useState(false);
  const [unwrapQuotes, setUnwrapQuotes] = useState(true);
  const [escapeNonAscii, setEscapeNonAscii] = useState(false);
  const [escapeQuotes, setEscapeQuotes] = useState(true);
  const [escapeSlashes, setEscapeSlashes] = useState(false);
  const [uppercaseHex, setUppercaseHex] = useState(true);
  const [warnInvalidEscapes, setWarnInvalidEscapes] = useState(true);
  const [warnControlCharacters, setWarnControlCharacters] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const processString = () => {
    if (!input.length || (trimInput && !input.trim())) {
      setError("Please paste escaped text or plain text to convert.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      actionMode,
      escapeStyle,
      outputMode,
      newlineMode,
      trimInput,
      unwrapQuotes,
      escapeNonAscii,
      escapeQuotes,
      escapeSlashes,
      uppercaseHex,
      warnInvalidEscapes,
      warnControlCharacters,
    });

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setActionMode("decode");
    setEscapeStyle("javascript");
    setOutputMode("text");
    setNewlineMode("preserve");
    setTrimInput(false);
    setUnwrapQuotes(true);
    setEscapeNonAscii(false);
    setEscapeQuotes(true);
    setEscapeSlashes(false);
    setUppercaseHex(true);
    setWarnInvalidEscapes(true);
    setWarnControlCharacters(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("decode");
    setEscapeStyle("javascript");
    setOutputMode("text");
    setNewlineMode("preserve");
    setTrimInput(false);
    setUnwrapQuotes(true);
    setEscapeNonAscii(false);
    setEscapeQuotes(true);
    setEscapeSlashes(false);
    setUppercaseHex(true);
    setWarnInvalidEscapes(true);
    setWarnControlCharacters(true);
    clearResult();
  };

  return (
    <ToolShell
      title="String Escape Sequence Converter"
      description="Decode and encode escaped strings for JavaScript, JSON, Unicode, hex, and C-style text. Inspect characters, clean copied values, and format results without sending text anywhere."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Escaped String or Plain Text</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a copied string with escape sequences, Unicode escapes, hex escapes, JSON text, or normal text you want to encode.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleInput}
            spellCheck={false}
            className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                setActionMode(value as ActionMode);
                clearResult();
              }}
              options={[
                { label: "Decode escape sequences", value: "decode" },
                { label: "Encode plain text", value: "encode" },
                { label: "Inspect characters", value: "inspect" },
                { label: "Normalize escaped text", value: "normalize" },
              ]}
            />

            <YoryantraSelect
              label="Escape Style"
              value={escapeStyle}
              onChange={(value) => {
                setEscapeStyle(value as EscapeStyle);
                clearResult();
              }}
              options={[
                { label: "JavaScript / TypeScript", value: "javascript" },
                { label: "JSON string", value: "json" },
                { label: "Unicode escapes", value: "unicode" },
                { label: "Hex escapes", value: "hex" },
                { label: "C-style string", value: "c" },
              ]}
            />

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Converted text", value: "text" },
                { label: "JSON report", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Line Breaks"
              value={newlineMode}
              onChange={(value) => {
                setNewlineMode(value as NewlineMode);
                clearResult();
              }}
              options={[
                { label: "Preserve input style", value: "preserve" },
                { label: "Normalize to LF", value: "lf" },
                { label: "Normalize to CRLF", value: "crlf" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimInput} onChange={setTrimInput} label="Trim outer whitespace" />
          <Toggle checked={unwrapQuotes} onChange={setUnwrapQuotes} label="Unwrap matching quotes while decoding" />
          <Toggle checked={escapeNonAscii} onChange={setEscapeNonAscii} label="Escape non-ASCII characters" />
          <Toggle checked={escapeQuotes} onChange={setEscapeQuotes} label="Escape quotes" />
          <Toggle checked={escapeSlashes} onChange={setEscapeSlashes} label="Escape forward slashes" />
          <Toggle checked={uppercaseHex} onChange={setUppercaseHex} label="Use uppercase hex digits" />
          <Toggle checked={warnInvalidEscapes} onChange={setWarnInvalidEscapes} label="Warn about invalid escapes" />
          <Toggle checked={warnControlCharacters} onChange={setWarnControlCharacters} label="Warn about control characters" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These checks keep escaped text readable while still warning about invalid sequences, hidden control characters, and formatting changes.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={processString}
            className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Convert String
          </button>
          <button
            type="button"
            onClick={loadExample}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Load Example
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      </div>

      {result ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">Converted text or formatted inspection result.</p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Input Length" value={String(result.inputLength)} />
            <StatCard label="Output Length" value={String(result.outputLength)} />
            <StatCard label="Escapes Found" value={String(result.escapeCount)} />
            <StatCard label="Lines" value={String(result.lineCount)} />
          </div>
        </div>
      ) : null}

      {result && notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {notes.map((issue) => (
              <div key={`${issue.title}-${issue.message}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result && result.rows.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Character Inspection</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Character</th>
                  <th className="px-4 py-3 font-semibold">Unicode</th>
                  <th className="px-4 py-3 font-semibold">Hex</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.rows.slice(0, 80).map((row) => (
                  <tr key={`${row.index}-${row.unicode}`}>
                    <td className="px-4 py-3 text-gray-500">{row.index}</td>
                    <td className="px-4 py-3 font-mono text-gray-900">{row.display}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{row.unicode}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{row.hex}</td>
                    <td className="px-4 py-3 text-gray-600">{row.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rows.length > 80 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 80 characters to keep the table readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Converting Escaped Strings Without Guesswork</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Escaped strings appear everywhere: JSON payloads, JavaScript code, copied API responses, log files, error messages, CSV exports, command output, and configuration snippets. A value that should read like normal text can arrive as <code className="rounded bg-gray-100 px-1 py-0.5">Hello\nWorld</code>, <code className="rounded bg-gray-100 px-1 py-0.5">\u0935\u0930</code>, or <code className="rounded bg-gray-100 px-1 py-0.5">\x48\x69</code>.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This converter helps you turn those sequences back into readable text, or encode plain text into a safer escaped form, without needing to open a console or create a temporary script.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This Escape Sequence Converter Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Reading copied JSON values with escaped newlines, tabs, quotes, Unicode characters, and backslashes.</p>
            <p className="mt-2">Checking JavaScript strings before using them in examples, tests, or documentation.</p>
            <p className="mt-2">Inspecting what <code className="rounded bg-white px-1 py-0.5">\uXXXX</code> and <code className="rounded bg-white px-1 py-0.5">\u{'{'}...{'}'}</code> sequences represent without opening a script.</p>
            <p className="mt-2">Preparing safe output for JavaScript, JSON, Unicode, hex, or C-style escaped strings.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the String Escape Sequence Converter</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste escaped text, copied JSON string content, Unicode escapes, hex escapes, or normal text into the input box.</li>
            <li>Choose whether you want to decode, encode, inspect, or normalize the string.</li>
            <li>Select the escape style that matches your source or target format.</li>
            <li>Pick an output format such as converted text, JSON report, Markdown, CSV, or checklist.</li>
            <li>Review the output, character table, and warnings before copying the result.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Escape Sequence Examples</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <div>
              <div className="font-medium text-gray-900">JavaScript newline</div>
              <div className="mt-1 font-mono">Input: Hello\nWorld</div>
              <div className="mt-1 font-mono">Decoded: Hello World</div>
            </div>
            <div className="mt-4">
              <div className="font-medium text-gray-900">Unicode escape</div>
              <div className="mt-1 font-mono">Input: \u0935\u0930\u0941\u0923</div>
              <div className="mt-1 font-mono">Decoded: वरुण</div>
            </div>
            <div className="mt-4">
              <div className="font-medium text-gray-900">Hex bytes</div>
              <div className="mt-1 font-mono">Input: \x48\x69</div>
              <div className="mt-1 font-mono">Decoded: Hi</div>
            </div>
            <div className="mt-4">
              <div className="font-medium text-gray-900">Tab character</div>
              <div className="mt-1 font-mono">Input: Name\tValue</div>
              <div className="mt-1 font-mono">Decoded: Name    Value</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does string escaping mean?">
              String escaping converts special characters into escape sequences so the value can safely appear inside code, JSON, logs, config files, or copied text.
            </Faq>
            <Faq title="What does unescaping do?">
              Unescaping converts escaped string sequences back into readable text.
            </Faq>
            <Faq title="Why do backslashes appear in escaped strings?">
              Backslashes are used to represent characters such as quotes, newlines, tabs, Unicode values, and other special characters.
            </Faq>
            <Faq title="Is this useful for API debugging?">
              Yes. It helps when copied API responses, JSON payloads, webhook bodies, logs, or debug output contain escaped values that are hard to read directly.
            </Faq>
            <Faq title="Is anything uploaded while converting escaped strings?">
              No. The conversion runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            String escaping often connects with API debugging, structured data workflows, backend development, payload validation, and copied developer output.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-validator" className="yoryantra-btn-outline">JSON Validator</Link>
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">JSON Formatter</Link>
            <Link href="/tools/json-schema-validator" className="yoryantra-btn-outline">JSON Schema Validator</Link>
            <Link href="/tools/json-diff-checker" className="yoryantra-btn-outline">JSON Diff Checker</Link>
            <Link href="/tools/url-safe-base64-converter" className="yoryantra-btn-outline">Base64URL Encoder Decoder</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  escapeStyle: EscapeStyle;
  outputMode: OutputMode;
  newlineMode: NewlineMode;
  trimInput: boolean;
  unwrapQuotes: boolean;
  escapeNonAscii: boolean;
  escapeQuotes: boolean;
  escapeSlashes: boolean;
  uppercaseHex: boolean;
  warnInvalidEscapes: boolean;
  warnControlCharacters: boolean;
}): Result {
  const prepared = prepareInput(options.input, options.trimInput, options.unwrapQuotes && options.actionMode === "decode");
  const issues: Issue[] = [];
  const escapeCount = countEscapeSequences(prepared);

  let convertedText = prepared;
  if (options.actionMode === "decode") {
    const decoded = decodeEscapes(prepared, options.warnInvalidEscapes);
    convertedText = decoded.text;
    issues.push(...decoded.issues);
  } else if (options.actionMode === "encode") {
    convertedText = encodeEscapes(prepared, options.escapeStyle, {
      escapeNonAscii: options.escapeNonAscii,
      escapeQuotes: options.escapeQuotes,
      escapeSlashes: options.escapeSlashes,
      uppercaseHex: options.uppercaseHex,
    });
  } else if (options.actionMode === "normalize") {
    const decoded = decodeEscapes(prepared, options.warnInvalidEscapes);
    const normalizedDecoded = applyNewlineMode(decoded.text, options.newlineMode);
    convertedText = encodeEscapes(normalizedDecoded, options.escapeStyle, {
      escapeNonAscii: options.escapeNonAscii,
      escapeQuotes: options.escapeQuotes,
      escapeSlashes: options.escapeSlashes,
      uppercaseHex: options.uppercaseHex,
    });
    issues.push(...decoded.issues);
  }

  convertedText = applyNewlineMode(convertedText, options.newlineMode);
  const rows = inspectCharacters(convertedText);

  if (options.warnControlCharacters) {
    const controlCount = rows.filter((row) => row.category === "Control").length;
    if (controlCount > 0) {
      issues.push({
        severity: "warning",
        title: "Control characters found",
        message: `${controlCount} control character${controlCount === 1 ? "" : "s"} appear in the converted text. Review them before copying into config files or code.`,
      });
    }
  }

  if (options.actionMode === "encode" && options.escapeStyle === "json") {
    try {
      JSON.parse(`"${convertedText}"`);
    } catch {
      issues.push({
        severity: "high",
        title: "JSON string needs review",
        message: "The encoded value could not be parsed as a JSON string. Check quotes, backslashes, or control characters.",
      });
    }
  }

  const resultBase = {
    convertedText,
    rows,
    issues,
    inputLength: options.input.length,
    outputLength: convertedText.length,
    escapeCount,
    lineCount: convertedText.length ? convertedText.split(/\r\n|\r|\n/).length : 0,
  };

  const output = formatOutput(resultBase, options.outputMode, options.actionMode, options.escapeStyle);

  return {
    ...resultBase,
    output,
  };
}

function prepareInput(input: string, trimInput: boolean, unwrapQuotes: boolean) {
  let value = trimInput ? input.trim() : input;
  if (unwrapQuotes && value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === "`" && last === "`")) {
      value = value.slice(1, -1);
    }
  }
  return value;
}

function decodeEscapes(input: string, warnInvalidEscapes: boolean): { text: string; issues: Issue[] } {
  const issues: Issue[] = [];
  let output = "";

  for (let index = 0; index < input.length; index += 1) {
    const current = input[index];
    if (current !== "\\") {
      output += current;
      continue;
    }

    const next = input[index + 1];
    if (next === undefined) {
      output += current;
      if (warnInvalidEscapes) {
        issues.push({ severity: "warning", title: "Trailing backslash", message: "The input ends with a single backslash, so it was kept as-is." });
      }
      continue;
    }

    const simple: Record<string, string> = {
      n: "\n",
      r: "\r",
      t: "\t",
      b: "\b",
      f: "\f",
      v: "\v",
      "0": "\0",
      "\\": "\\",
      "\"": "\"",
      "'": "'",
      "`": "`",
      "/": "/",
    };

    if (Object.prototype.hasOwnProperty.call(simple, next)) {
      output += simple[next];
      index += 1;
      continue;
    }

    if (next === "x") {
      const hex = input.slice(index + 2, index + 4);
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        output += String.fromCharCode(Number.parseInt(hex, 16));
        index += 3;
      } else {
        output += `\\${next}`;
        if (warnInvalidEscapes) {
          issues.push({ severity: "warning", title: "Invalid hex escape", message: `\\x at position ${index} does not have two valid hex digits.` });
        }
        index += 1;
      }
      continue;
    }

    if (next === "u") {
      if (input[index + 2] === "{") {
        const closeIndex = input.indexOf("}", index + 3);
        const body = closeIndex > -1 ? input.slice(index + 3, closeIndex) : "";
        if (/^[0-9a-fA-F]{1,6}$/.test(body)) {
          const codePoint = Number.parseInt(body, 16);
          if (codePoint <= 0x10ffff) {
            output += String.fromCodePoint(codePoint);
            index = closeIndex;
          } else {
            output += `\\u{${body}}`;
            if (warnInvalidEscapes) {
              issues.push({ severity: "warning", title: "Unicode code point too large", message: `\\u{${body}} is above U+10FFFF.` });
            }
            index = closeIndex;
          }
        } else {
          output += "\\u";
          if (warnInvalidEscapes) {
            issues.push({ severity: "warning", title: "Invalid braced Unicode escape", message: `A braced Unicode escape near position ${index} is incomplete or invalid.` });
          }
          index += 1;
        }
      } else {
        const hex = input.slice(index + 2, index + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          output += String.fromCharCode(Number.parseInt(hex, 16));
          index += 5;
        } else {
          output += "\\u";
          if (warnInvalidEscapes) {
            issues.push({ severity: "warning", title: "Invalid Unicode escape", message: `\\u at position ${index} does not have four valid hex digits.` });
          }
          index += 1;
        }
      }
      continue;
    }

    output += `\\${next}`;
    if (warnInvalidEscapes) {
      issues.push({ severity: "info", title: "Unknown escape kept", message: `\\${next} at position ${index} was kept unchanged.` });
    }
    index += 1;
  }

  return { text: output, issues };
}

function encodeEscapes(
  input: string,
  style: EscapeStyle,
  options: { escapeNonAscii: boolean; escapeQuotes: boolean; escapeSlashes: boolean; uppercaseHex: boolean },
) {
  let output = "";
  for (const char of input) {
    const codePoint = char.codePointAt(0) ?? 0;
    const hex = formatHex(codePoint, options.uppercaseHex);

    if (char === "\n") output += "\\n";
    else if (char === "\r") output += "\\r";
    else if (char === "\t") output += "\\t";
    else if (char === "\b") output += "\\b";
    else if (char === "\f") output += "\\f";
    else if (char === "\v" && style !== "json") output += "\\v";
    else if (char === "\"") output += options.escapeQuotes || style === "json" ? "\\\"" : char;
    else if (char === "'") output += options.escapeQuotes && style !== "json" ? "\\'" : char;
    else if (char === "\\") output += "\\\\";
    else if (char === "/") output += options.escapeSlashes ? "\\/" : char;
    else if (style === "unicode" && codePoint > 0x7e) output += unicodeEscape(codePoint, options.uppercaseHex);
    else if (style === "hex" && codePoint <= 0xff && (options.escapeNonAscii || codePoint < 0x20 || codePoint > 0x7e)) output += `\\x${hex.padStart(2, "0")}`;
    else if (style === "c" && (codePoint < 0x20 || codePoint > 0x7e || (options.escapeNonAscii && codePoint > 0x7e))) output += codePoint <= 0xffff ? `\\u${hex.padStart(4, "0")}` : `\\U${hex.padStart(8, "0")}`;
    else if (options.escapeNonAscii && codePoint > 0x7e) output += unicodeEscape(codePoint, options.uppercaseHex);
    else if (codePoint < 0x20) output += unicodeEscape(codePoint, options.uppercaseHex);
    else output += char;
  }
  return output;
}

function unicodeEscape(codePoint: number, uppercaseHex: boolean) {
  const hex = formatHex(codePoint, uppercaseHex);
  if (codePoint <= 0xffff) return `\\u${hex.padStart(4, "0")}`;
  return `\\u{${hex}}`;
}

function formatHex(value: number, uppercase: boolean) {
  const text = value.toString(16);
  return uppercase ? text.toUpperCase() : text.toLowerCase();
}

function countEscapeSequences(input: string) {
  return (input.match(/\\(?:u\{[0-9a-fA-F]{1,6}\}|u[0-9a-fA-F]{0,4}|x[0-9a-fA-F]{0,2}|[nrtbfv0\\"'`/])/g) ?? []).length;
}

function applyNewlineMode(input: string, mode: NewlineMode) {
  if (mode === "preserve") return input;
  const normalized = input.replace(/\r\n|\r|\n/g, "\n");
  return mode === "crlf" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

function inspectCharacters(input: string): CharacterRow[] {
  const rows: CharacterRow[] = [];
  let position = 0;
  for (const char of input) {
    const codePoint = char.codePointAt(0) ?? 0;
    rows.push({
      index: position,
      char,
      display: displayCharacter(char),
      codePoint,
      unicode: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
      hex: `0x${codePoint.toString(16).toUpperCase()}`,
      category: categorizeCharacter(codePoint),
    });
    position += 1;
  }
  return rows;
}

function displayCharacter(char: string) {
  if (char === "\n") return "\\n";
  if (char === "\r") return "\\r";
  if (char === "\t") return "\\t";
  if (char === " ") return "space";
  if (char === "\0") return "\\0";
  return char;
}

function categorizeCharacter(codePoint: number) {
  if (codePoint < 32 || codePoint === 127) return "Control";
  if (codePoint >= 48 && codePoint <= 57) return "Digit";
  if ((codePoint >= 65 && codePoint <= 90) || (codePoint >= 97 && codePoint <= 122)) return "Latin letter";
  if (codePoint <= 127) return "ASCII symbol";
  if (codePoint >= 0x1f300 && codePoint <= 0x1faff) return "Emoji / symbol";
  return "Unicode";
}

function formatOutput(
  result: Omit<Result, "output">,
  outputMode: OutputMode,
  actionMode: ActionMode,
  escapeStyle: EscapeStyle,
) {
  if (outputMode === "text") return result.convertedText;

  if (outputMode === "json") {
    return JSON.stringify(
      {
        action: actionMode,
        style: escapeStyle,
        inputLength: result.inputLength,
        outputLength: result.outputLength,
        escapeCount: result.escapeCount,
        lineCount: result.lineCount,
        convertedText: result.convertedText,
        issues: result.issues,
        characters: result.rows.slice(0, 200),
      },
      null,
      2,
    );
  }

  if (outputMode === "markdown") {
    const lines = [
      "| Field | Value |",
      "|---|---|",
      `| Action | ${actionMode} |`,
      `| Escape style | ${escapeStyle} |`,
      `| Input length | ${result.inputLength} |`,
      `| Output length | ${result.outputLength} |`,
      `| Escape sequences found | ${result.escapeCount} |`,
      `| Lines | ${result.lineCount} |`,
      "",
      "```text",
      result.convertedText,
      "```",
    ];
    return lines.join("\n");
  }

  if (outputMode === "csv") {
    const header = "index,character,unicode,hex,category";
    const rows = result.rows.map((row) => [row.index, row.display, row.unicode, row.hex, row.category].map(csvEscape).join(","));
    return [header, ...rows].join("\n");
  }

  const checklist = [
    "String escape review checklist",
    "",
    `- [ ] Confirm the selected action is correct: ${actionMode}`,
    `- [ ] Confirm the escape style is correct: ${escapeStyle}`,
    `- [ ] Review output length: ${result.outputLength}`,
    `- [ ] Review escape sequences found: ${result.escapeCount}`,
    `- [ ] Check warnings: ${result.issues.length}`,
    "- [ ] Copy the converted value only after checking quotes, slashes, and line breaks",
  ];
  return checklist.join("\n");
}

function csvEscape(value: string | number) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];
  if (!notes.length) {
    notes.push({
      severity: "info",
      title: "No major issues found",
      message: "The conversion completed without obvious invalid escape warnings.",
    });
  }
  if (result.outputLength > 5000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The converted string is long. Review line breaks and copy destination limits before using it elsewhere.",
    });
  }
  return notes;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
      />
      <span>{label}</span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
