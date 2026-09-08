"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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
  const [newlineMode, setNewlineMode] = useState<NewlineMode>("crlf");
  const [charsetMode, setCharsetMode] = useState<CharsetMode>("utf8");
  const [wrapLines, setWrapLines] = useState(true);
  const [maxLineLength, setMaxLineLength] = useState("76");
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
    setNewlineMode("crlf");
    setCharsetMode("utf8");
    setWrapLines(true);
    setMaxLineLength("76");
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
    setNewlineMode("crlf");
    setCharsetMode("utf8");
    setWrapLines(true);
    setMaxLineLength("76");
    setStrictDecode(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Quoted Printable Encoder Decoder"
      description="Encode MIME text with RFC 2045 wrapping or decode quoted-printable bytes and soft breaks."
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
              { label: "MIME CRLF (recommended)", value: "crlf" },
              { label: "Preserve input line endings", value: "preserve" },
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
              { label: "ISO-8859-1 byte mapping", value: "latin1" },
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
          Encoding always escapes trailing spaces/tabs and bytes outside the
          RFC 2045 printable range. Wrapping at 76 characters keeps generated
          MIME body lines conformant.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertQuotedPrintable} className="yoryantra-btn min-h-11 whitespace-nowrap">
          Convert Quoted-Printable
        </button>

        <button onClick={copyOutput} className="yoryantra-btn min-h-11 whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
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
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
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
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Converted Quoted-Printable output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Conversion runs in your browser. Yoryantra does not send pasted message
        text to a conversion API. Email bodies can still contain credentials,
        reset links, addresses, or other private information, so handle them
        according to the sensitivity of the message.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Quoted-Printable is a MIME transfer encoding for bytes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Quoted-Printable keeps many printable ASCII bytes readable and
            writes other bytes as an equals sign followed by two hexadecimal
            digits. A UTF-8 character can therefore occupy several escapes: é
            becomes the UTF-8 bytes C3 A9 and is represented as
            <code className="mx-1 font-mono">=C3=A9</code>.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The transfer encoding does not identify the character set by itself.
            MIME normally carries charset information in a Content-Type header.
            Choose UTF-8 only when those decoded bytes are expected to be UTF-8;
            invalid UTF-8 is reported instead of silently replaced. The
            ISO-8859-1 option maps each byte directly to the corresponding
            U+0000-U+00FF character and does not emulate Windows-1252.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The 76-character line limit includes the soft-break equals sign
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 2045 limits encoded Quoted-Printable lines to 76 characters,
            excluding the terminating CRLF. A trailing equals sign marks a soft
            break, meaning the next physical line continues the same logical
            line. The encoder wraps without splitting an <code className="font-mono">=XX</code>
            escape and counts that final equals sign inside the limit.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Disabling wrapping is kept for debugging existing systems, but the
            result is flagged when any line exceeds the MIME limit. CRLF is the
            canonical MIME line ending; LF or preserved local newlines are
            available for inspection and are reported as non-canonical when
            encoding.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 items-start">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">Trailing spaces and tabs</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Space or tab at the end of an encoded line must be escaped because
              mail transports may add or remove trailing whitespace. The encoder
              always writes those bytes as =20 or =09.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">Transport padding on decode</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              RFC 2045 tells decoders to discard trailing space or tab found on
              an encoded physical line. Lenient decode follows that rule and
              reports when such transport padding was removed.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Strict decode is for syntax checking; lenient decode is for damaged mail
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Strict mode rejects malformed equals escapes, non-ASCII literal
            characters, non-CRLF soft breaks, and physical lines longer than 76
            characters. Lenient mode keeps recoverable malformed text where
            possible and reports what was accepted, which is useful when
            examining mail that has already passed through gateways or copy/paste.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Auto detect is only a convenience heuristic. Plain text containing a
            sequence such as <code className="font-mono">=3D</code> can look like
            encoded content, so select Decode explicitly when validating a raw
            MIME part.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Body Quoted-Printable is not MIME header Q-encoding
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The scope here is the Content-Transfer-Encoding form defined for
            MIME bodies. Encoded-word headers such as
            <code className="mx-1 font-mono">=?UTF-8?Q?...?=</code> use related
            but different rules from RFC 2047, including underscore handling.
            Do not feed an entire encoded-word header here and assume it has been
            validated as a mail header.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            RFC 2045 is the wire-format reference
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            <a
              href="https://www.rfc-editor.org/rfc/rfc2045.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 2045 section 6.7
            </a>{" "}
            defines Quoted-Printable, including legal literal octets, trailing
            whitespace treatment, soft line breaks, and the 76-character line
            limit. Mail software may apply additional MIME header and charset
            rules outside this body's transfer encoding.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/quoted-printable-encoder-decoder" />
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
    strictDecode: boolean;
  }
): ConversionResult {
  if (input.length > 1_000_000) {
    throw new Error("Input is too large for an interactive browser conversion. Keep it under 1,000,000 characters.");
  }

  const modeUsed = options.mode === "auto" ? detectMode(input) : options.mode;
  const warnings: string[] = [];
  let rawOutput = "";
  let outputBytes: Uint8Array = new Uint8Array();
  let normalizedInput = input;

  if (options.mode === "auto") {
    warnings.push(
      `Auto detect chose ${modeUsed}. Sequences such as =3D can occur in ordinary text, so select the mode explicitly when validating MIME.`
    );
  }

  if (modeUsed === "encode") {
    const lineLength = Number(options.maxLineLength);

    if (!Number.isInteger(lineLength) || lineLength < 20 || lineLength > 76) {
      throw new Error("Max line length must be a whole number between 20 and 76 for RFC 2045 Quoted-Printable.");
    }

    normalizedInput = normalizeNewlines(input, options.newlineMode);

    if (options.newlineMode !== "crlf" && /\r|\n/.test(normalizedInput)) {
      warnings.push("Encoded hard line breaks are not canonical MIME CRLF because a local newline mode was selected.");
    }

    rawOutput = encodeQuotedPrintable(normalizedInput, {
      charsetMode: options.charsetMode,
      wrapLines: options.wrapLines,
      maxLineLength: lineLength,
    });

    if (!options.wrapLines) {
      const longest = longestPhysicalLine(rawOutput);
      if (longest > 76) {
        warnings.push(`Wrapping is disabled and the longest encoded line is ${longest} characters; RFC 2045 limits Quoted-Printable lines to 76.`);
      }
    }

    outputBytes = new TextEncoder().encode(rawOutput);
  } else {
    const decoded = decodeQuotedPrintable(input, {
      charsetMode: options.charsetMode,
      newlineMode: options.newlineMode,
      strictDecode: options.strictDecode,
      warnings,
    });
    rawOutput = decoded.text;
    outputBytes = decoded.bytes;
  }

  const escapeSource = modeUsed === "decode" ? input : rawOutput;
  const softBreakSource = modeUsed === "decode" ? input : rawOutput;
  const escapeCount = countMatches(escapeSource, /=[A-Fa-f0-9]{2}/g);
  const softBreakCount = countMatches(softBreakSource, /=\r\n|=\n|=\r/g);
  const lineCount = rawOutput.split(/\r\n|\r|\n/).length;
  const output = formatOutput(rawOutput, outputBytes, {
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
  const softBreakCount = countMatches(input, /=\r\n|=\n|=\r/g);
  return escapeCount + softBreakCount > 0 ? "decode" : "encode";
}

type PhysicalLine = { text: string; newline: "\r\n" | "\n" | "\r" | "" };

function splitPhysicalLines(input: string): PhysicalLine[] {
  const lines: PhysicalLine[] = [];
  let start = 0;

  for (let index = 0; index < input.length; index += 1) {
    if (input[index] === "\r") {
      const newline = input[index + 1] === "\n" ? "\r\n" : "\r";
      lines.push({ text: input.slice(start, index), newline });
      if (newline === "\r\n") {
        index += 1;
      }
      start = index + 1;
    } else if (input[index] === "\n") {
      lines.push({ text: input.slice(start, index), newline: "\n" });
      start = index + 1;
    }
  }

  lines.push({ text: input.slice(start), newline: "" });
  return lines;
}

function encodeQuotedPrintable(
  input: string,
  options: {
    charsetMode: CharsetMode;
    wrapLines: boolean;
    maxLineLength: number;
  }
): string {
  const lines = splitPhysicalLines(input);
  let output = "";

  lines.forEach((line) => {
    const bytes = encodeToBytes(line.text, options.charsetMode);
    let encoded = "";

    bytes.forEach((byte, index) => {
      const isLast = index === bytes.length - 1;
      const isSpace = byte === 32;
      const isTab = byte === 9;
      const isTrailingWhitespace = isLast && (isSpace || isTab);
      const isSafePrintable = (byte >= 33 && byte <= 60) || (byte >= 62 && byte <= 126);
      const canStayLiteral = isSafePrintable || ((isSpace || isTab) && !isTrailingWhitespace);

      if (canStayLiteral) {
        encoded += String.fromCharCode(byte);
      } else {
        encoded += `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
      }
    });

    output += options.wrapLines
      ? wrapQuotedPrintableLine(encoded, options.maxLineLength)
      : encoded;
    output += line.newline;
  });

  return output;
}

function decodeQuotedPrintable(
  input: string,
  options: {
    charsetMode: CharsetMode;
    newlineMode: NewlineMode;
    strictDecode: boolean;
    warnings: string[];
  }
): { text: string; bytes: Uint8Array } {
  const lines = splitPhysicalLines(input);
  const bytes: number[] = [];
  let transportPaddingLines = 0;
  let nonCanonicalSoftBreaks = 0;
  let longLines = 0;

  lines.forEach((line) => {
    if (line.text.length > 76) {
      longLines += 1;
      if (options.strictDecode) {
        throw new Error(`Encoded line is ${line.text.length} characters long; RFC 2045 limits Quoted-Printable physical lines to 76.`);
      }
    }

    let text = line.text;
    const softBreak = text.endsWith("=") && line.newline !== "";
    if (softBreak) {
      if (line.newline !== "\r\n") {
        if (options.strictDecode) {
          throw new Error("A Quoted-Printable soft break must end with CRLF in strict RFC 2045 mode.");
        }
        nonCanonicalSoftBreaks += 1;
      }
      text = text.slice(0, -1);
    }

    const trimmed = text.replace(/[ \t]+$/g, "");
    if (trimmed !== text) {
      transportPaddingLines += 1;
      text = trimmed;
    }

    appendDecodedQuotedPrintableBytes(text, bytes, options);

    if (!softBreak && line.newline) {
      const newline = chooseOutputNewline(line.newline, options.newlineMode);
      for (let index = 0; index < newline.length; index += 1) {
        bytes.push(newline.charCodeAt(index));
      }
    }
  });

  if (transportPaddingLines > 0) {
    options.warnings.push(`Trailing transport whitespace was removed from ${transportPaddingLines} encoded line${transportPaddingLines === 1 ? "" : "s"}, as RFC 2045 requires decoders to do.`);
  }
  if (nonCanonicalSoftBreaks > 0) {
    options.warnings.push(`${nonCanonicalSoftBreaks} soft break${nonCanonicalSoftBreaks === 1 ? "" : "s"} used LF or CR instead of canonical CRLF and were accepted leniently.`);
  }
  if (longLines > 0) {
    options.warnings.push(`${longLines} encoded line${longLines === 1 ? "" : "s"} exceeded the RFC 2045 76-character limit and were decoded leniently.`);
  }

  const outputBytes = new Uint8Array(bytes);
  return { text: decodeBytes(outputBytes, options.charsetMode), bytes: outputBytes };
}

function appendDecodedQuotedPrintableBytes(
  text: string,
  bytes: number[],
  options: {
    charsetMode: CharsetMode;
    strictDecode: boolean;
    warnings: string[];
  }
): void {
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === "=") {
      const hex = text.slice(index + 1, index + 3);
      if (/^[A-Fa-f0-9]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16));
        index += 2;
        continue;
      }

      if (options.strictDecode) {
        throw new Error(`Invalid Quoted-Printable escape near =${hex}`);
      }

      options.warnings.push(`Invalid equals escape was kept as literal text near =${hex}.`);
      bytes.push(61);
      continue;
    }

    const code = char.charCodeAt(0);
    const legalLiteral = code === 9 || code === 32 || (code >= 33 && code <= 60) || (code >= 62 && code <= 126);

    if (code <= 127) {
      if (!legalLiteral) {
        if (options.strictDecode) {
          throw new Error(`Illegal literal byte 0x${code.toString(16).toUpperCase().padStart(2, "0")} in Quoted-Printable input.`);
        }
        options.warnings.push(`A control character was accepted literally during lenient decode.`);
      }
      bytes.push(code);
      continue;
    }

    if (options.strictDecode) {
      throw new Error("Non-ASCII characters must be represented as =XX bytes in strict Quoted-Printable input.");
    }

    options.warnings.push("A non-ASCII literal character was accepted during lenient decode; canonical Quoted-Printable should escape those bytes.");
    const rawBytes = encodeToBytes(char, options.charsetMode);
    rawBytes.forEach((byte) => bytes.push(byte));
  }
}

function encodeToBytes(input: string, charsetMode: CharsetMode): Uint8Array {
  if (charsetMode === "latin1") {
    const bytes: number[] = [];
    for (const char of Array.from(input)) {
      const codePoint = char.codePointAt(0) || 0;
      if (codePoint > 255) {
        throw new Error(`Character U+${codePoint.toString(16).toUpperCase()} cannot be represented by the ISO-8859-1 byte mapping. Choose UTF-8.`);
      }
      bytes.push(codePoint);
    }
    return new Uint8Array(bytes);
  }

  return new TextEncoder().encode(input);
}

function decodeBytes(bytes: Uint8Array, charsetMode: CharsetMode): string {
  if (charsetMode === "latin1") {
    return Array.from(bytes).map((byte) => String.fromCharCode(byte)).join("");
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Decoded bytes are not valid UTF-8. Choose ISO-8859-1 byte mapping or inspect the Hex bytes if the MIME part declares another charset.");
  }
}

function wrapQuotedPrintableLine(line: string, maxLineLength: number): string {
  if (line.length <= maxLineLength) {
    return line;
  }

  const tokens: string[] = [];
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === "=" && /^[A-F0-9]{2}$/.test(line.slice(index + 1, index + 3))) {
      tokens.push(line.slice(index, index + 3));
      index += 2;
    } else {
      tokens.push(line[index]);
    }
  }

  const chunks: string[] = [];
  const softCapacity = maxLineLength - 1;
  let offset = 0;

  while (offset < tokens.length) {
    let length = 0;
    let end = offset;

    while (end < tokens.length && length + tokens[end].length <= softCapacity) {
      length += tokens[end].length;
      end += 1;
    }

    if (end === tokens.length) {
      chunks.push(tokens.slice(offset).join(""));
      break;
    }

    if (end === offset) {
      throw new Error("The selected line length is too small for a Quoted-Printable escape.");
    }

    while (end > offset && (tokens[end - 1] === " " || tokens[end - 1] === "\t")) {
      if (length + 2 <= softCapacity) {
        const chunkTokens = tokens.slice(offset, end);
        chunkTokens[chunkTokens.length - 1] = tokens[end - 1] === " " ? "=20" : "=09";
        chunks.push(`${chunkTokens.join("")}=`);
        offset = end;
        break;
      }
      end -= 1;
      length -= 1;
    }

    if (offset === end) {
      continue;
    }

    chunks.push(`${tokens.slice(offset, end).join("")}=`);
    offset = end;
  }

  return chunks.join("\r\n");
}

function chooseOutputNewline(source: "\r\n" | "\n" | "\r", mode: NewlineMode): string {
  if (mode === "crlf") {
    return "\r\n";
  }
  if (mode === "lf") {
    return "\n";
  }
  return source;
}

function normalizeNewlines(input: string, mode: NewlineMode): string {
  if (mode === "preserve") {
    return input;
  }

  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return mode === "crlf" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

function longestPhysicalLine(input: string): number {
  return splitPhysicalLines(input).reduce((longest, line) => Math.max(longest, line.text.length), 0);
}

function formatOutput(
  rawOutput: string,
  outputBytes: Uint8Array,
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
): string {
  if (details.outputMode === "json") {
    return JSON.stringify(
      {
        input: details.input,
        output: rawOutput,
        mode: details.modeUsed,
        inputLength: details.inputLength,
        outputLength: details.outputLength,
        byteLength: outputBytes.length,
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
    return Array.from(outputBytes)
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
      `Output byte length: ${outputBytes.length}`,
      `Output lines: ${details.lineCount}`,
      `Quoted escapes: ${details.escapeCount}`,
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
      title: "Decode and compatibility notes",
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
