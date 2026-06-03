"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
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

type UnicodeNote = {
  title: string;
  message: string;
};

const decodeExample =
  "Hello \\u092F\\u094B\\u0930\\u094D\\u092F\\u0902\\u0924\\u094D\\u0930\\u093E \\u{1F600}";

const encodeExample = "Hello Yoryantra 😀 नमस्ते";

export default function ToolClient() {
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

  const notes = useMemo(() => (result ? getUnicodeNotes(result) : []), [result]);

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

    await navigator.clipboard.writeText(output);
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
    <ToolShell
      title="Unicode Escape Sequence Converter"
      description="Convert Unicode escape sequences like \\uXXXX, \\u{1F600}, \\xXX, HTML entities, and plain text directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose a Unicode Task
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ModeButton
            active={mode === "decode"}
            title="Decode Escapes"
            description="Turn \\uXXXX, \\u{...}, \\xXX, and HTML entities into readable text."
            onClick={() => {
              setMode("decode");
              setOutputMode("text");
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />

          <ModeButton
            active={mode === "encode"}
            title="Encode Text"
            description="Turn readable text into Unicode escape sequences."
            onClick={() => {
              setMode("encode");
              setOutputMode("text");
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />

          <ModeButton
            active={mode === "inspect"}
            title="Inspect Characters"
            description="Show Unicode code points, escapes, and entities for every character."
            onClick={() => {
              setMode("inspect");
              setOutputMode("codepoints");
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {mode === "decode"
            ? "Unicode Escapes or Text"
            : mode === "encode"
            ? "Text to Encode"
            : "Text to Inspect"}
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={mode === "decode" ? decodeExample : encodeExample}
          className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste Unicode escapes, JavaScript strings, HTML entities, emoji, Indic
          text, multilingual text, or copied API output.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
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

          {mode !== "encode" && (
            <YoryantraSelect
              label="Decode Format"
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
                  label: "Mixed escapes",
                  value: "mixed",
                },
                {
                  label: "\\uXXXX",
                  value: "javascript",
                },
                {
                  label: "\\u{X}",
                  value: "braced",
                },
                {
                  label: "HTML entities",
                  value: "htmlDecimal",
                },
              ]}
            />
          )}

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
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

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Uppercase hex letters
          </label>

          {mode === "encode" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Escape ASCII characters too
            </label>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Preserve whitespace
          </label>

          {mode === "decode" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
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
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Decode HTML entities too
            </label>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Unicode escapes are common in JavaScript, JSON, logs, API responses,
          localization files, and copied text from debugging tools.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runConverter} className="yoryantra-btn">
          {mode === "decode"
            ? "Decode Unicode"
            : mode === "encode"
            ? "Encode Unicode"
            : "Inspect Characters"}
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Input Length"
            value={result.inputLength.toLocaleString()}
          />
          <SummaryCard
            label="Output Length"
            value={result.outputLength.toLocaleString()}
          />
          <SummaryCard
            label="Characters"
            value={result.characters.length.toLocaleString()}
          />
          <SummaryCard
            label="Warnings"
            value={result.warnings.length.toLocaleString()}
          />
        </div>
      )}

      {result && result.characters.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Character Details
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Unicode code points and escape formats found in the output text.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Char</th>
                  <th className="px-4 py-3 font-semibold">Code Point</th>
                  <th className="px-4 py-3 font-semibold">Decimal</th>
                  <th className="px-4 py-3 font-semibold">\\uXXXX</th>
                  <th className="px-4 py-3 font-semibold">\\u{"{X}"}</th>
                  <th className="px-4 py-3 font-semibold">HTML Decimal</th>
                  <th className="px-4 py-3 font-semibold">HTML Hex</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.characters.slice(0, 100).map((item, index) => (
                  <tr key={`${item.hex}-${index}`}>
                    <td className="px-4 py-3 text-lg text-gray-900">
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

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Unicode notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Unicode escape output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Unicode escape conversion happens directly in your browser. Your pasted
        text is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting Unicode Escape Sequences Into Readable Text
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unicode escape sequences often appear in JSON, JavaScript strings,
            API responses, logs, localization files, and copied debugging output.
            Text like \\u0928\\u092E\\u0938\\u094D\\u0924\\u0947 can be hard to
            read until it is decoded back into normal characters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Unicode Escape Sequence Converter decodes common escape formats
            and can also encode readable text into escape sequences. It is useful
            when working with multilingual text, emoji, broken display output,
            serialized JSON, and text copied from code or logs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Decoding or Encoding Unicode Escapes
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose decode, encode, or inspect mode.</li>
            <li>Paste escaped text or normal text into the input box.</li>
            <li>Choose the escape style and output format.</li>
            <li>Review the converted text and character details.</li>
            <li>Copy the result for code, debugging notes, or localization work.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Unicode Escape Converter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Decoding {"\\\\uXXXX"} text from JSON or JavaScript strings.</li>
            <li>Encoding emoji and multilingual text into Unicode escapes.</li>
            <li>Inspecting Unicode code points for copied characters.</li>
            <li>Checking HTML decimal and hex entity values.</li>
            <li>Reading localization strings that were escaped during export.</li>
            <li>Debugging API responses with escaped text or emoji.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Unicode Escape Text
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Hello \\u0928\\u092E\\u0938\\u094D\\u0924\\u0947 \\u{1F600}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode Escapes and Real Characters
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A Unicode escape is just a text representation of a character. The
            escape \\u0041 represents the letter A, while values outside the
            basic range may need surrogate pairs or braced escapes depending on
            the programming language.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use the character details table when you need to check the exact code
            point for emoji, symbols, Indic text, or characters that look similar
            but are not the same internally.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a Unicode escape sequence?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Unicode escape sequence is a text form of a character, such as
                {"\\\\u0041"} for A or {"\\\\u{1F600}"} for 😀.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode \\uXXXX strings?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It can decode {"\\\\uXXXX"}, braced Unicode escapes, {"\\\\xXX"} values,
                and optional HTML entities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this encode emoji into Unicode escapes?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Emoji can be encoded into JavaScript-style escapes, braced
                escapes, or HTML entities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do some emoji create two \\uXXXX values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Some characters are outside the basic multilingual plane and are
                represented as surrogate pairs in older JavaScript-style escapes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my text uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Unicode conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/unicode-encoder-decoder" className="yoryantra-btn-outline">
              Unicode Encoder Decoder
            </Link>

            <Link href="/tools/html-encoder-decoder" className="yoryantra-btn-outline">
              HTML Encoder Decoder
            </Link>

            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/url-query-encoder-decoder" className="yoryantra-btn-outline">
              URL Query Encoder Decoder
            </Link>

            <Link href="/tools/ascii-converter" className="yoryantra-btn-outline">
              ASCII Converter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function ModeButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border border-gray-200 bg-white p-4 text-left transition ${
        active ? "shadow-sm ring-2 ring-[var(--green)]" : "hover:border-[var(--green)]"
      }`}
    >
      <span className="block text-sm font-semibold text-gray-900">{title}</span>

      <span className="mt-1 block text-sm leading-relaxed text-gray-500">
        {description}
      </span>
    </button>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
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
    });
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

  if (converted.includes("\uFFFD")) {
    warnings.push("Replacement characters were found. The input may contain broken or incomplete Unicode data.");
  }

  if (/\\u[0-9A-Fa-f]{0,3}(?![0-9A-Fa-f])/.test(input)) {
    warnings.push("Some \\u escapes look incomplete. A standard \\u escape needs four hex digits.");
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

function decodeEscapes(
  input: string,
  options: {
    decodeHtmlEntities: boolean;
  }
) {
  let output = input;

  output = output.replace(/\\u\{([0-9A-Fa-f]+)\}/g, (_match, hex: string) => {
    const codePoint = parseInt(hex, 16);
    return safeFromCodePoint(codePoint);
  });

  output = output.replace(/\\u([0-9A-Fa-f]{4})/g, (_match, hex: string) => {
    const codeUnit = parseInt(hex, 16);
    return String.fromCharCode(codeUnit);
  });

  output = output.replace(/\\x([0-9A-Fa-f]{2})/g, (_match, hex: string) => {
    const codeUnit = parseInt(hex, 16);
    return String.fromCharCode(codeUnit);
  });

  if (options.decodeHtmlEntities) {
    output = output.replace(/&#(\d+);/g, (_match, decimal: string) => {
      const codePoint = Number(decimal);
      return safeFromCodePoint(codePoint);
    });

    output = output.replace(/&#x([0-9A-Fa-f]+);/g, (_match, hex: string) => {
      const codePoint = parseInt(hex, 16);
      return safeFromCodePoint(codePoint);
    });
  }

  return output;
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

      if (!options.escapeAscii && codePoint <= 0x7e && codePoint >= 0x20) {
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

function safeFromCodePoint(value: number) {
  try {
    if (!Number.isFinite(value) || value < 0 || value > 0x10ffff) {
      return "\uFFFD";
    }

    return String.fromCodePoint(value);
  } catch {
    return "\uFFFD";
  }
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

function getUnicodeNotes(result: ConvertResult): UnicodeNote[] {
  const notes: UnicodeNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review warnings",
      message: result.warnings.join(" "),
    });
  }

  if (result.characters.some((item) => item.codePoint > 0xffff)) {
    notes.push({
      title: "Characters outside the basic range",
      message:
        "Some characters use code points above U+FFFF. JavaScript-style \\uXXXX output may use surrogate pairs for them.",
    });
  }

  if (result.characters.some((item) => item.codePoint >= 0x0900 && item.codePoint <= 0x097f)) {
    notes.push({
      title: "Indic text found",
      message:
        "The text includes Devanagari characters. Use the character table if you need exact code points.",
    });
  }

  if (result.outputLength > 5000) {
    notes.push({
      title: "Large output",
      message:
        "The output is long. Review it before copying into source files, tickets, or documentation.",
    });
  }

  return notes;
}
