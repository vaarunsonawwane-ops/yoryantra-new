"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "encode" | "decode" | "auto";
type OutputMode = "clean" | "report" | "json" | "hex";
type NewlineMode = "preserve" | "crlf" | "lf";
type CharsetMode = "utf8" | "latin1";

type ConversionResult = {
  input: string;
  rawOutput: string;
  output: string;
  modeUsed: "encode" | "decode";
  inputLength: number;
  outputLength: number;
  lineCount: number;
  escapeCount: number;
  softBreakCount: number;
  warnings: string[];
};

type QPNote = {
  title: string;
  message: string;
};

const samplePlainText = `Hello from Yoryantra!

This line contains symbols: =, ₹, café, and emoji 😀.
Quoted-Printable is often used in email bodies where long lines need safe wrapping.`;

const sampleQuotedPrintable = `Hello from Yoryantra!

This line contains symbols: =3D, =E2=82=B9, caf=C3=A9, and emoji =F0=9F=98=
=80.
Quoted-Printable is often used in email bodies where long lines need safe wr=
apping.`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [outputMode, setOutputMode] = useState<OutputMode>("clean");
  const [newlineMode, setNewlineMode] = useState<NewlineMode>("preserve");
  const [charsetMode, setCharsetMode] = useState<CharsetMode>("utf8");
  const [wrapLines, setWrapLines] = useState(true);
  const [maxLineLength, setMaxLineLength] = useState("76");
  const [encodeTrailingWhitespace, setEncodeTrailingWhitespace] = useState(true);
  const [encodeNonAscii, setEncodeNonAscii] = useState(true);
  const [strictDecode, setStrictDecode] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getQuotedPrintableNotes(result) : []), [result]);

  const convertQuotedPrintable = () => {
    if (!input) {
      setError("Please enter text or Quoted-Printable content.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = runQuotedPrintableConversion(input, {
        mode,
        outputMode,
        newlineMode,
        charsetMode,
        wrapLines,
        maxLineLength,
        encodeTrailingWhitespace,
        encodeNonAscii,
        strictDecode,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to convert this Quoted-Printable content."
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

  const loadExample = () => {
    setInput(mode === "decode" ? sampleQuotedPrintable : samplePlainText);
    setOutputMode("clean");
    setNewlineMode("preserve");
    setCharsetMode("utf8");
    setWrapLines(true);
    setMaxLineLength("76");
    setEncodeTrailingWhitespace(true);
    setEncodeNonAscii(true);
    setStrictDecode(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setMode("encode");
    setOutputMode("clean");
    setNewlineMode("preserve");
    setCharsetMode("utf8");
    setWrapLines(true);
    setMaxLineLength("76");
    setEncodeTrailingWhitespace(true);
    setEncodeNonAscii(true);
    setStrictDecode(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Quoted Printable Encoder Decoder"
      description="Encode and decode Quoted-Printable text for email and MIME debugging. Handle soft line breaks, UTF-8 text, equals escapes, line wrapping, spaces, tabs, and clean report output."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Input Text
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
          placeholder={mode === "decode" ? sampleQuotedPrintable : samplePlainText}
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste email body text, MIME content, or Quoted-Printable text with
          equals escapes such as =C3=A9 and soft line breaks ending with =.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Mode"
            value={mode}
            onChange={(value) => {
              setMode(value as Mode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Encode", value: "encode" },
              { label: "Decode", value: "decode" },
              { label: "Auto detect", value: "auto" },
            ]}
          />

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
              { label: "Clean output", value: "clean" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Hex bytes", value: "hex" },
            ]}
          />

          <YoryantraSelect
            label="Newlines"
            value={newlineMode}
            onChange={(value) => {
              setNewlineMode(value as NewlineMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Preserve", value: "preserve" },
              { label: "Use CRLF", value: "crlf" },
              { label: "Use LF", value: "lf" },
            ]}
          />

          <YoryantraSelect
            label="Charset"
            value={charsetMode}
            onChange={(value) => {
              setCharsetMode(value as CharsetMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "UTF-8", value: "utf8" },
              { label: "Latin-1 style bytes", value: "latin1" },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Line Length
            </label>

            <input
              value={maxLineLength}
              onChange={(event) => {
                setMaxLineLength(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="76"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div className="md:col-span-2 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={wrapLines}
                onChange={(event) => {
                  setWrapLines(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Wrap encoded lines with soft breaks
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={encodeTrailingWhitespace}
                onChange={(event) => {
                  setEncodeTrailingWhitespace(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Encode trailing spaces and tabs
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={encodeNonAscii}
                onChange={(event) => {
                  setEncodeNonAscii(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Encode non-ASCII bytes
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={strictDecode}
                onChange={(event) => {
                  setStrictDecode(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Strict decode invalid equals escapes
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Quoted-Printable is common in email and MIME content because it keeps
          most readable text visible while safely escaping special bytes.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertQuotedPrintable} className="yoryantra-btn">
          Convert Quoted-Printable
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
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
          <SummaryCard label="Mode" value={result.modeUsed} />
          <SummaryCard label="Escapes" value={result.escapeCount.toLocaleString()} />
          <SummaryCard label="Soft Breaks" value={result.softBreakCount.toLocaleString()} />
          <SummaryCard label="Lines" value={result.lineCount.toLocaleString()} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Conversion Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Copy clean output or switch to report mode for MIME line and escape
            details.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
            {result.output}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Quoted-Printable notes
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
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Converted Quoted-Printable output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Quoted-Printable conversion happens directly in your browser. Your email
        content or text is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding and Decoding Quoted-Printable Email Text
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Quoted-Printable is a MIME transfer encoding often used in email
            bodies. It keeps normal readable text mostly unchanged while encoding
            special bytes as equals escapes, such as =C3=A9 for part of a UTF-8
            character.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Quoted Printable Encoder Decoder helps you inspect encoded email
            content, decode MIME text, encode text for email-safe transport, and
            understand soft line breaks that end with an equals sign.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Quoted-Printable Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste normal text or Quoted-Printable encoded content.</li>
            <li>Choose encode, decode, or auto detect.</li>
            <li>Select newline handling and charset mode.</li>
            <li>Adjust line wrapping, trailing whitespace, and strict decode options.</li>
            <li>Copy the clean output, report, JSON, or hex bytes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Quoted-Printable Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Decoding MIME email bodies copied from raw email source.</li>
            <li>Checking why symbols or accented characters appear as equals escapes.</li>
            <li>Inspecting soft line breaks in long email lines.</li>
            <li>Encoding UTF-8 text for email-safe content transfer.</li>
            <li>Debugging email templates, transactional emails, and CRM exports.</li>
            <li>Converting Quoted-Printable output into readable text or hex bytes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Quoted-Printable Text
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Plain: café = price
Quoted-Printable: caf=C3=A9 =3D price`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Soft Line Breaks in Quoted-Printable
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Quoted-Printable content can wrap long lines using a soft line break.
            A line ending with = means the next line continues the same logical
            line. When decoding, those soft breaks are removed.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This is useful in email because MIME content often has line-length
            limits. The visible line breaks in the raw message may not be actual
            line breaks in the decoded text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Quoted-Printable encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It is a MIME encoding that keeps most readable text visible while
                escaping special bytes with equals signs and hexadecimal values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does =C3=A9 mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It is the UTF-8 byte sequence for é written as Quoted-Printable
                equals escapes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do some lines end with equals signs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                That is usually a soft line break. It means the line continues on
                the next line after decoding.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Quoted-Printable the same as Base64?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Base64 encodes all bytes into a compact alphabet. Quoted-Printable
                keeps many readable characters as-is and escapes only needed bytes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I convert text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/html-encoder-decoder" className="yoryantra-btn-outline">
              HTML Encoder Decoder
            </Link>

            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/unicode-escape-sequence-converter" className="yoryantra-btn-outline">
              Unicode Escape Sequence Converter
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

function runQuotedPrintableConversion(
  input: string,
  options: {
    mode: Mode;
    outputMode: OutputMode;
    newlineMode: NewlineMode;
    charsetMode: CharsetMode;
    wrapLines: boolean;
    maxLineLength: string;
    encodeTrailingWhitespace: boolean;
    encodeNonAscii: boolean;
    strictDecode: boolean;
  }
): ConversionResult {
  const modeUsed = options.mode === "auto" ? detectMode(input) : options.mode;
  const warnings: string[] = [];
  const normalizedInput = normalizeNewlines(input, options.newlineMode);
  let rawOutput = "";

  if (modeUsed === "encode") {
    const lineLength = Number(options.maxLineLength);

    if (!Number.isFinite(lineLength) || lineLength < 20 || lineLength > 998) {
      throw new Error("Max line length should be between 20 and 998.");
    }

    rawOutput = encodeQuotedPrintable(normalizedInput, {
      charsetMode: options.charsetMode,
      wrapLines: options.wrapLines,
      maxLineLength: Math.floor(lineLength),
      encodeTrailingWhitespace: options.encodeTrailingWhitespace,
      encodeNonAscii: options.encodeNonAscii,
    });
  } else {
    rawOutput = decodeQuotedPrintable(normalizedInput, {
      charsetMode: options.charsetMode,
      strictDecode: options.strictDecode,
      warnings,
    });
  }

  const escapeCount = countMatches(rawOutput, /=[A-Fa-f0-9]{2}/g);
  const softBreakCount = countMatches(modeUsed === "decode" ? normalizedInput : rawOutput, /=\r?\n/g);
  const lineCount = rawOutput.split(/\r?\n/).length;
  const output = formatOutput(rawOutput, {
    input: normalizedInput,
    outputMode: options.outputMode,
    modeUsed,
    inputLength: normalizedInput.length,
    outputLength: rawOutput.length,
    lineCount,
    escapeCount,
    softBreakCount,
    warnings,
  });

  return {
    input: normalizedInput,
    rawOutput,
    output,
    modeUsed,
    inputLength: normalizedInput.length,
    outputLength: rawOutput.length,
    lineCount,
    escapeCount,
    softBreakCount,
    warnings,
  };
}

function detectMode(input: string): "encode" | "decode" {
  const escapeCount = countMatches(input, /=[A-Fa-f0-9]{2}/g);
  const softBreakCount = countMatches(input, /=\r?\n/g);

  return escapeCount + softBreakCount > 1 ? "decode" : "encode";
}

function encodeQuotedPrintable(
  input: string,
  options: {
    charsetMode: CharsetMode;
    wrapLines: boolean;
    maxLineLength: number;
    encodeTrailingWhitespace: boolean;
    encodeNonAscii: boolean;
  }
) {
  const lines = input.split(/\r?\n/);

  return lines
    .map((line) => {
      const bytes = encodeToBytes(line, options.charsetMode);
      let encoded = "";

      bytes.forEach((byte, index) => {
        const isLast = index === bytes.length - 1;
        const isSpace = byte === 32;
        const isTab = byte === 9;
        const isTrailingWhitespace = isLast && (isSpace || isTab);
        const shouldEncode =
          byte === 61 ||
          byte < 32 ||
          byte > 126 && options.encodeNonAscii ||
          options.encodeTrailingWhitespace && isTrailingWhitespace;

        if ((isSpace || isTab) && !shouldEncode) {
          encoded += String.fromCharCode(byte);
        } else if (shouldEncode) {
          encoded += `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
        } else {
          encoded += String.fromCharCode(byte);
        }
      });

      return options.wrapLines ? wrapQuotedPrintableLine(encoded, options.maxLineLength) : encoded;
    })
    .join("\r\n");
}

function decodeQuotedPrintable(
  input: string,
  options: {
    charsetMode: CharsetMode;
    strictDecode: boolean;
    warnings: string[];
  }
) {
  const withoutSoftBreaks = input.replace(/=\r?\n/g, "");
  const bytes: number[] = [];

  for (let index = 0; index < withoutSoftBreaks.length; index += 1) {
    const char = withoutSoftBreaks[index];

    if (char === "=") {
      const hex = withoutSoftBreaks.slice(index + 1, index + 3);

      if (/^[A-Fa-f0-9]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16));
        index += 2;
      } else if (options.strictDecode) {
        throw new Error(`Invalid Quoted-Printable escape near =${hex}`);
      } else {
        options.warnings.push(`Invalid equals escape kept as text near =${hex}`);
        bytes.push(char.charCodeAt(0));
      }
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }

  return decodeBytes(new Uint8Array(bytes), options.charsetMode);
}

function encodeToBytes(input: string, charsetMode: CharsetMode) {
  if (charsetMode === "latin1") {
    return Uint8Array.from(Array.from(input).map((char) => (char.codePointAt(0) || 0) & 255));
  }

  return new TextEncoder().encode(input);
}

function decodeBytes(bytes: Uint8Array, charsetMode: CharsetMode) {
  if (charsetMode === "latin1") {
    return Array.from(bytes).map((byte) => String.fromCharCode(byte)).join("");
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function wrapQuotedPrintableLine(line: string, maxLineLength: number) {
  if (line.length <= maxLineLength) {
    return line;
  }

  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > maxLineLength) {
    let take = maxLineLength - 1;

    if (remaining[take - 1] === "=") {
      take -= 1;
    }

    if (remaining[take - 2] === "=") {
      take -= 2;
    }

    chunks.push(`${remaining.slice(0, take)}=`);
    remaining = remaining.slice(take);
  }

  chunks.push(remaining);

  return chunks.join("\r\n");
}

function normalizeNewlines(input: string, mode: NewlineMode) {
  if (mode === "preserve") {
    return input;
  }

  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return mode === "crlf" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

function formatOutput(
  rawOutput: string,
  details: {
    input: string;
    outputMode: OutputMode;
    modeUsed: "encode" | "decode";
    inputLength: number;
    outputLength: number;
    lineCount: number;
    escapeCount: number;
    softBreakCount: number;
    warnings: string[];
  }
) {
  if (details.outputMode === "json") {
    return JSON.stringify(
      {
        input: details.input,
        output: rawOutput,
        mode: details.modeUsed,
        inputLength: details.inputLength,
        outputLength: details.outputLength,
        lineCount: details.lineCount,
        escapeCount: details.escapeCount,
        softBreakCount: details.softBreakCount,
        warnings: details.warnings,
      },
      null,
      2
    );
  }

  if (details.outputMode === "hex") {
    return Array.from(new TextEncoder().encode(rawOutput))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  if (details.outputMode === "report") {
    const warnings = details.warnings.length
      ? details.warnings.map((warning) => `- ${warning}`)
      : ["- None"];

    return [
      "Quoted-Printable Conversion Report",
      "----------------------------------",
      `Mode: ${details.modeUsed}`,
      `Input length: ${details.inputLength}`,
      `Output length: ${details.outputLength}`,
      `Output lines: ${details.lineCount}`,
      `Equals escapes in output: ${details.escapeCount}`,
      `Soft breaks: ${details.softBreakCount}`,
      "",
      "Output:",
      rawOutput,
      "",
      "Warnings:",
      ...warnings,
    ].join("\n");
  }

  return rawOutput;
}

function countMatches(value: string, pattern: RegExp) {
  return (value.match(pattern) || []).length;
}

function getQuotedPrintableNotes(result: ConversionResult): QPNote[] {
  const notes: QPNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review warnings",
      message: result.warnings.join(" "),
    });
  }

  if (result.softBreakCount > 0) {
    notes.push({
      title: "Soft line breaks found",
      message:
        "Lines ending with equals signs are soft breaks. They continue onto the next line when decoded.",
    });
  }

  if (result.modeUsed === "decode") {
    notes.push({
      title: "Decoded MIME text",
      message:
        "If the output still looks unusual, check whether the original email used a different charset.",
    });
  }

  return notes;
}
