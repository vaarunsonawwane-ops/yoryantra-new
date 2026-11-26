"use client";

import { useEffect, useState } from "react";
import OutputStatistics from "./OutputStatistics";
import type { PanelProps } from "../workflow-types";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "decode" | "encode" | "inspect";
type EscapeStyle = "javascript" | "braced" | "mixed" | "htmlDecimal" | "htmlHex";
type OutputMode = "text" | "lines" | "json" | "codepoints";
type UnicodeCharInfo = {
  char: string;
  codePoint: number;
  hex: string;
  decimal: string;
  javascriptEscape: string;
  bracedEscape: string;
  htmlDecimal: string;
  htmlHex: string;
  nameHint: string;
};

type ConvertResult = {
  mode: Mode;
  inputLength: number;
  outputLength: number;
  output: string;
  characters: UnicodeCharInfo[];
  warnings: string[];
};

const decodeExample =
  "Sneha \\u092F\\u094B\\u0930\\u094D\\u092F\\u0902\\u0924\\u094D\\u0930\\u093E \\u{1F600}";

const encodeExample = "Sneha 😀 नमस्ते";

export default function EscapePanel({ incoming, onSend }: PanelProps) {
  const [mode, setMode] = useState<Mode>("decode");
  const [input, setInput] = useState("");
  const [escapeStyle, setEscapeStyle] = useState<EscapeStyle>("javascript");
  const [outputMode, setOutputMode] = useState<OutputMode>("text");
  const [uppercaseHex, setUppercaseHex] = useState(true);
  const [escapeAscii, setEscapeAscii] = useState(false);
  const [preserveWhitespace, setPreserveWhitespace] = useState(true);
  const [decodeHtmlEntities, setDecodeHtmlEntities] = useState(true);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!incoming) return;
    setInput(incoming.value); setResult(null); setOutput(""); setError(""); setCopied(false);
  }, [incoming]);

  const runConverter = () => {
    if (!input) {
      setError("Please enter text or Unicode escape sequences.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = convertUnicodeEscapes(input, {
        mode,
        escapeStyle,
        outputMode,
        uppercaseHex,
        escapeAscii,
        preserveWhitespace,
        decodeHtmlEntities,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to convert this Unicode text."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    try { await navigator.clipboard.writeText(output); } catch { setError("The output could not be copied. Select and copy it manually."); return; }
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadDecodeExample = () => {
    setMode("decode");
    setInput(decodeExample);
    setEscapeStyle("javascript");
    setOutputMode("text");
    setUppercaseHex(true);
    setEscapeAscii(false);
    setPreserveWhitespace(true);
    setDecodeHtmlEntities(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const loadEncodeExample = () => {
    setMode("encode");
    setInput(encodeExample);
    setEscapeStyle("javascript");
    setOutputMode("text");
    setUppercaseHex(true);
    setEscapeAscii(false);
    setPreserveWhitespace(true);
    setDecodeHtmlEntities(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setMode("decode");
    setInput("");
    setEscapeStyle("javascript");
    setOutputMode("text");
    setUppercaseHex(true);
    setEscapeAscii(false);
    setPreserveWhitespace(true);
    setDecodeHtmlEntities(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <>
      <div className="max-w-80">
        <YoryantraSelect label="Action" value={mode} onChange={value => { const next = value as Mode; setMode(next); if (next === "encode" && escapeStyle === "mixed") setEscapeStyle("javascript"); setOutputMode(next === "inspect" ? "codepoints" : "text"); setResult(null); setOutput(""); setError(""); setCopied(false); }} options={[{value:"decode",label:"Decode escapes"},{value:"encode",label:"Encode text"},{value:"inspect",label:"Inspect characters"}]} />
      </div>
      <div className="mt-6 min-w-0">
        <label htmlFor="unicode-escape-input" className="block mb-2 text-sm font-semibold text-gray-900">
          {mode === "decode"
            ? "Unicode Escapes or Text"
            : mode === "encode"
            ? "Text to Encode"
            : "Text to Inspect"}
        </label>

        <textarea
          id="unicode-escape-input" spellCheck={false}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={mode === "decode" ? decodeExample : encodeExample}
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)] placeholder:text-gray-400 text-gray-900"
        />

        <p className="mt-2 text-sm text-gray-500">
          {mode === "decode" ? "Paste Unicode or hexadecimal escapes, numeric HTML references or mixed text." : "Enter text, including emoji and multilingual characters."}
        </p>
      </div>

      <div className="mt-6 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 sm:grid-cols-2 max-w-2xl">
          {mode === "encode" && (
            <YoryantraSelect
              label="Escape Style"
              value={escapeStyle}
              onChange={(value) => {
                setEscapeStyle(value as EscapeStyle);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              options={[
                {
                  label: "\\uXXXX",
                  value: "javascript",
                },
                {
                  label: "\\u{X}",
                  value: "braced",
                },
                {
                  label: "HTML decimal",
                  value: "htmlDecimal",
                },
                {
                  label: "HTML hex",
                  value: "htmlHex",
                },
              ]}
            />
          )}

          {mode === "decode" && <p className="text-sm leading-relaxed text-gray-600 sm:col-span-2">Decodes mixed Unicode and hexadecimal escapes. Enable numeric HTML references to decode decimal and hexadecimal references too.</p>}

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              const nextMode = value as OutputMode;
              setOutputMode(nextMode);
              if (result) {
                const next = convertUnicodeEscapes(input, {mode, escapeStyle, outputMode: nextMode, uppercaseHex, escapeAscii, preserveWhitespace, decodeHtmlEntities});
                setResult(next); setOutput(next.output);
              }
              setError(""); setCopied(false);
            }}
            options={[
              {
                label: "Text",
                value: "text",
              },
              {
                label: "Lines",
                value: "lines",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Code points",
                value: "codepoints",
              },
            ]}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
            <input
              type="checkbox"
              checked={uppercaseHex}
              onChange={(event) => {
                setUppercaseHex(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />

            Uppercase hex letters
          </label>

          {mode === "encode" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={escapeAscii}
                onChange={(event) => {
                  setEscapeAscii(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 shrink-0 accent-[var(--light-gold)]"
              />

              Escape ASCII characters too
            </label>
          )}

          {mode === "encode" && (
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
            <input
              type="checkbox"
              checked={preserveWhitespace}
              onChange={(event) => {
                setPreserveWhitespace(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />

            Preserve whitespace
          </label>
          )}

          {mode === "decode" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={decodeHtmlEntities}
                onChange={(event) => {
                  setDecodeHtmlEntities(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 shrink-0 accent-[var(--light-gold)]"
              />

              Decode numeric HTML references too
            </label>
          )}
        </div>

      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runConverter} className="yoryantra-btn">
          {mode === "decode"
            ? "Decode Unicode"
            : mode === "encode"
            ? "Encode Unicode"
            : "Inspect Characters"}
        </button>

        <button onClick={loadDecodeExample} className="yoryantra-btn-outline">
          Load Decode Example
        </button>

        <button onClick={loadEncodeExample} className="yoryantra-btn-outline">
          Load Encode Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-6 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && result.warnings.length > 0 && (
        <div role="status" className="mt-5 text-sm leading-relaxed">
          <h3 className="font-semibold text-gray-900">Review notes</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800">
            {result.warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-lg font-semibold text-gray-900">
            Output
          </h3>

          <button disabled={!output}
              onClick={copyOutput}
              className="yoryantra-btn-outline shrink-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? "Copied" : "Copy Output"}
            </button>
        </div>

        {result && (
          <OutputStatistics
            idPrefix="unicode-escape-stats"
            title="Conversion statistics"
            items={[
              ["Input UTF-16 units", result.inputLength.toLocaleString()],
              [outputMode === "text" ? "Output UTF-16 units" : "Report UTF-16 units", result.outputLength.toLocaleString()],
              [mode === "decode" ? "Decoded code points" : "Input code points", result.characters.length.toLocaleString()],
              ["Warnings", result.warnings.length.toLocaleString()],
            ]}
          />
        )}
        <pre className={`mt-4 max-h-[520px] overflow-auto yoryantra-output min-h-[240px] whitespace-pre-wrap break-words font-mono text-sm leading-6 ${result ? "text-gray-900" : "text-gray-400"}`}>
          {result ? (output || "(empty string)") : <span className="text-gray-400">{error ? "No output generated. Correct the input and try again." : "Converted Unicode text or inspection output will appear here."}</span>}
        </pre>
      </div>

      {result && <div className="mt-4"><button type="button" className="yoryantra-btn-outline" onClick={() => onSend("unicode", convertUnicodeEscapes(input, {mode, escapeStyle, outputMode: "text", uppercaseHex, escapeAscii, preserveWhitespace, decodeHtmlEntities}).output)}>Send to Unicode encode / decode</button><p className="mt-2 text-sm text-gray-600">Transfers converted text, not the inspection report. Replaces the receiving input without converting it.</p></div>}

      {result && result.characters.length > 0 && (
        <div className="mt-8 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === "decode" ? "Decoded character details" : "Input character details"}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {mode === "decode" ? "Code points and escape forms in the decoded text." : "Code points and escape forms in the original input."}
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Character</th>
                  <th className="px-4 py-3 font-semibold">Code point</th>
                  <th className="px-4 py-3 font-semibold">Decimal</th>
                  <th className="px-4 py-3 font-semibold">{"\\uXXXX"}</th>
                  <th className="px-4 py-3 font-semibold">{"\\u{X}"}</th>
                  <th className="px-4 py-3 font-semibold">HTML decimal</th>
                  <th className="px-4 py-3 font-semibold">HTML hex</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.characters.slice(0, 100).map((item, index) => (
                  <tr key={`${item.hex}-${index}`}>
                    <td className="px-4 py-3 text-gray-900">
                      {item.char === "\n" ? "\\n" : item.char === "\t" ? "\\t" : item.char === " " ? "space" : item.char}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      U+{item.hex}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.decimal}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.javascriptEscape}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.bracedEscape}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.htmlDecimal}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.htmlHex}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.characters.length > 100 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 100 characters in the table. Copy JSON output to
              inspect the full list.
            </p>
          )}
        </div>
      )}


      <section className="mt-12  space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Decode Unicode Escape Sequences
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unicode escape sequences often appear in JSON, JavaScript strings,
            API responses, logs, localization files, and copied debugging output.
            Text like <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900 break-all">{"\\u0928\\u092E\\u0938\\u094D\\u0924\\u0947"}</code> can be hard to
            read until it is decoded back into normal characters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JavaScript&apos;s four-digit <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">{"\\uXXXX"}</code> form represents one UTF-16 code unit, not necessarily one complete Unicode character. Characters above U+FFFF need a surrogate pair in that form, while <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">{"\\u{...}"}</code> can represent the code point directly.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode Escape Formats
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">{"\\u0041"}</code> represents A. A hexadecimal escape such as <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-900">{"\\x41"}</code> also represents A. It identifies a code unit, not a UTF-8 byte sequence.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This decoder reads mixed Unicode escapes and optional numeric HTML references. It replaces escapes for invalid scalar values, including lone surrogates, with U+FFFD and reports them. HTML numeric references follow HTML decoding rules, including legacy control-code mappings. Named HTML entities and other JavaScript string escapes are outside this operation.
          </p>

          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            JavaScript syntax reference: <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#string_literals" target="_blank" rel="noreferrer">MDN lexical grammar — string escapes</a>.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example: Unicode Escapes
          </h2>

          <div className="mt-4 text-sm text-gray-900 overflow-auto rounded-xl bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap break-words">
{`Hello \\u0928\\u092E\\u0938\\u094D\\u0924\\u0947 \\u{1F600}`}
            </pre>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/unicode-encoder-decoder" presentation="links" /></div>
        </div>
      </section>
    </>
  );
}

function convertUnicodeEscapes(
  input: string,
  options: {
    mode: Mode;
    escapeStyle: EscapeStyle;
    outputMode: OutputMode;
    uppercaseHex: boolean;
    escapeAscii: boolean;
    preserveWhitespace: boolean;
    decodeHtmlEntities: boolean;
  }
): ConvertResult {
  let converted = input;
  const warnings: string[] = [];

  if (options.mode === "decode") {
    converted = decodeEscapes(input, {
      decodeHtmlEntities: options.decodeHtmlEntities,
    }, warnings);
  }

  if (options.mode === "encode") {
    converted = encodeEscapes(input, {
      escapeStyle: options.escapeStyle,
      uppercaseHex: options.uppercaseHex,
      escapeAscii: options.escapeAscii,
      preserveWhitespace: options.preserveWhitespace,
    });
  }

  if (options.mode === "inspect") {
    converted = input;
  }

  const characters = inspectCharacters(options.mode === "encode" ? input : converted, options.uppercaseHex);

  if (options.mode === "decode") {
    if (/\\u(?![0-9A-Fa-f]{4}|\{[0-9A-Fa-f]+\})/.test(input)) {
      warnings.push("Malformed Unicode escape. Use four hexadecimal digits or a valid braced escape.");
    }
    if (/\\x(?![0-9A-Fa-f]{2})/.test(input)) {
      warnings.push("Malformed hexadecimal escape. Use two hexadecimal digits after \\x.");
    }
    if (options.decodeHtmlEntities && /&#(?![0-9]|[xX][0-9A-Fa-f])/.test(input)) {
      warnings.push("Malformed numeric HTML reference. Use decimal or hexadecimal digits.");
    }
  }
  if (options.mode !== "decode" && Array.from(input).some(char => { const cp = char.codePointAt(0)!; return cp >= 0xd800 && cp <= 0xdfff; })) {
    warnings.push("The input contains isolated UTF-16 surrogate units, which are not Unicode scalar values.");
  }
  if (options.mode === "encode" && (options.escapeStyle === "htmlDecimal" || options.escapeStyle === "htmlHex")) {
    if (Array.from(input).some(char => { const cp = char.codePointAt(0)!; return cp === 0 || cp in HTML_CONTROL_REPLACEMENTS || (cp >= 0xd800 && cp <= 0xdfff); })) {
      warnings.push("HTML decoding replaces or remaps some numeric references in this input. Use the Unicode encode / decode operation with inspection mode if you need to preserve original code units.");
    }
  }

  const output = formatUnicodeOutput({
    mode: options.mode,
    converted,
    characters,
    outputMode: options.outputMode,
    warnings,
  });

  return {
    mode: options.mode,
    inputLength: input.length,
    outputLength: output.length,
    output,
    characters,
    warnings,
  };
}

// HTML numeric character reference end-state replacements (Windows-1252).
const HTML_CONTROL_REPLACEMENTS: Record<number, number> = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e,
  0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6,
  0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152,
  0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c,
  0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a,
  0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
};

function decodeEscapes(input: string, options: { decodeHtmlEntities: boolean }, warnings: string[]) {
  const report = (message: string) => { if (!warnings.includes(message)) warnings.push(message); };
  const scalar = (value: number) => {
    if (!Number.isFinite(value) || value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) {
      report("Invalid Unicode scalar value or isolated surrogate replaced with U+FFFD.");
    }
    return scalarFromCodePoint(value);
  };
  // Consume original tokens once; decoded text is never interpreted again.
  const tokens = /\\u\{([0-9A-Fa-f]+)\}|\\u([dD][89aAbB][0-9A-Fa-f]{2})\\u([dD][c-fC-F][0-9A-Fa-f]{2})|\\u([0-9A-Fa-f]{4})|\\x([0-9A-Fa-f]{2})|&#(\d+);?|&#[xX]([0-9A-Fa-f]+);?/g;
  return input.replace(tokens, (match, braced: string | undefined, high: string | undefined, low: string | undefined, unit: string | undefined, byte: string | undefined, decimal: string | undefined, htmlHex: string | undefined) => {
    if (braced !== undefined) return scalar(parseInt(braced, 16));
    if (high !== undefined && low !== undefined) return String.fromCharCode(parseInt(high, 16), parseInt(low, 16));
    if (unit !== undefined) return scalar(parseInt(unit, 16));
    if (byte !== undefined) return String.fromCharCode(parseInt(byte, 16));
    if (!options.decodeHtmlEntities) return match;
    const value = decimal !== undefined ? Number(decimal) : parseInt(htmlHex!, 16);
    if (!match.endsWith(";")) report("A numeric HTML reference is missing its terminating semicolon.");
    if (value === 0 || !Number.isFinite(value) || value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) {
      report("Invalid numeric HTML reference replaced with U+FFFD.");
      return "\uFFFD";
    }
    if (value in HTML_CONTROL_REPLACEMENTS) {
      report("A legacy HTML control reference was mapped using HTML numeric reference rules.");
      return String.fromCodePoint(HTML_CONTROL_REPLACEMENTS[value]);
    }
    if (value === 0x0d || (value < 0x20 && ![9, 10, 12].includes(value)) || (value >= 0x7f && value <= 0x9f) || (value >= 0xfdd0 && value <= 0xfdef) || (value & 0xffff) >= 0xfffe) {
      report("A numeric HTML reference denotes a control or noncharacter; HTML retains the code point but reports a parse error.");
    }
    return String.fromCodePoint(value);
  });
}

function encodeEscapes(
  input: string,
  options: {
    escapeStyle: EscapeStyle;
    uppercaseHex: boolean;
    escapeAscii: boolean;
    preserveWhitespace: boolean;
  }
) {
  return Array.from(input)
    .map((char) => {
      const codePoint = char.codePointAt(0) || 0;

      if (options.preserveWhitespace && /\s/.test(char)) {
        return char;
      }

      if (!options.escapeAscii && codePoint <= 0x7e && codePoint >= 0x20 && !/\s/.test(char)) {
        return char;
      }

      if (options.escapeStyle === "braced") {
        return `\\u{${formatHex(codePoint, options.uppercaseHex)}}`;
      }

      if (options.escapeStyle === "htmlDecimal") {
        return `&#${codePoint};`;
      }

      if (options.escapeStyle === "htmlHex") {
        return `&#x${formatHex(codePoint, options.uppercaseHex)};`;
      }

      return toJavaScriptEscape(codePoint, options.uppercaseHex);
    })
    .join("");
}

function inspectCharacters(input: string, uppercaseHex: boolean): UnicodeCharInfo[] {
  return Array.from(input).map((char) => {
    const codePoint = char.codePointAt(0) || 0;
    const hex = formatHex(codePoint, uppercaseHex).padStart(codePoint <= 0xffff ? 4 : 0, "0");

    return {
      char,
      codePoint,
      hex,
      decimal: String(codePoint),
      javascriptEscape: toJavaScriptEscape(codePoint, uppercaseHex),
      bracedEscape: `\\u{${formatHex(codePoint, uppercaseHex)}}`,
      htmlDecimal: `&#${codePoint};`,
      htmlHex: `&#x${formatHex(codePoint, uppercaseHex)};`,
      nameHint: getNameHint(codePoint),
    };
  });
}

function toJavaScriptEscape(codePoint: number, uppercaseHex: boolean) {
  if (codePoint <= 0xffff) {
    return `\\u${formatHex(codePoint, uppercaseHex).padStart(4, "0")}`;
  }

  const adjusted = codePoint - 0x10000;
  const high = 0xd800 + (adjusted >> 10);
  const low = 0xdc00 + (adjusted & 0x3ff);

  return `\\u${formatHex(high, uppercaseHex).padStart(4, "0")}\\u${formatHex(
    low,
    uppercaseHex
  ).padStart(4, "0")}`;
}

function formatHex(value: number, uppercase: boolean) {
  const hex = value.toString(16);
  return uppercase ? hex.toUpperCase() : hex.toLowerCase();
}

function scalarFromCodePoint(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) {
    return "\uFFFD";
  }

  return String.fromCodePoint(value);
}

function formatUnicodeOutput({
  mode,
  converted,
  characters,
  outputMode,
  warnings,
}: {
  mode: Mode;
  converted: string;
  characters: UnicodeCharInfo[];
  outputMode: OutputMode;
  warnings: string[];
}) {
  if (outputMode === "json") {
    return JSON.stringify(
      {
        mode,
        output: converted,
        characters,
        warnings,
      },
      null,
      2
    );
  }

  if (outputMode === "lines") {
    return characters
      .map(
        (item) =>
          `${item.char === "\n" ? "\\n" : item.char === "\t" ? "\\t" : item.char} = U+${item.hex} = ${item.javascriptEscape}`
      )
      .join("\n");
  }

  if (outputMode === "codepoints") {
    return characters
      .map((item) => `U+${item.hex} (${item.decimal}) ${item.char}`)
      .join("\n");
  }

  return converted;
}

function getNameHint(codePoint: number) {
  if (codePoint >= 0x1f300 && codePoint <= 0x1faff) {
    return "emoji or pictographic symbol";
  }

  if (codePoint >= 0x0900 && codePoint <= 0x097f) {
    return "Devanagari";
  }

  if (codePoint >= 0x0000 && codePoint <= 0x007f) {
    return "ASCII";
  }

  return "Unicode character";
}

