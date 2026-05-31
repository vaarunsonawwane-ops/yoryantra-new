"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "encode" | "decode" | "auto";
type InputEncoding = "utf8" | "hex";
type OutputMode = "clean" | "spaced" | "report" | "json";
type AlphabetMode = "rfc4648" | "base32hex";
type DecodedOutput = "text" | "hex" | "bytes";

type ConversionResult = {
  input: string;
  output: string;
  modeUsed: "encode" | "decode";
  inputLength: number;
  outputLength: number;
  byteLength: number;
  alphabet: string;
  warnings: string[];
  groups: string[];
};

type Base32Note = {
  title: string;
  message: string;
};

const sampleText = "Yoryantra Base32 example";
const sampleBase32 = "LFXXK4DZN5XXE3DBMJSXIICCMFZWK===";

const alphabets = {
  rfc4648: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  base32hex: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [inputEncoding, setInputEncoding] = useState<InputEncoding>("utf8");
  const [decodedOutput, setDecodedOutput] = useState<DecodedOutput>("text");
  const [outputMode, setOutputMode] = useState<OutputMode>("clean");
  const [alphabetMode, setAlphabetMode] = useState<AlphabetMode>("rfc4648");
  const [includePadding, setIncludePadding] = useState(true);
  const [uppercaseOutput, setUppercaseOutput] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [acceptLowercase, setAcceptLowercase] = useState(true);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getBase32Notes(result) : []), [result]);

  const convertBase32 = () => {
    if (!input.trim()) {
      setError("Please enter text, hex bytes, or a Base32 string.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = runBase32Conversion(input, {
        mode,
        inputEncoding,
        decodedOutput,
        outputMode,
        alphabetMode,
        includePadding,
        uppercaseOutput,
        ignoreWhitespace,
        acceptLowercase,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to convert this Base32 value."
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
    if (mode === "decode") {
      setInput(sampleBase32);
    } else {
      setInput(sampleText);
    }

    setInputEncoding("utf8");
    setDecodedOutput("text");
    setOutputMode("clean");
    setAlphabetMode("rfc4648");
    setIncludePadding(true);
    setUppercaseOutput(true);
    setIgnoreWhitespace(true);
    setAcceptLowercase(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setMode("encode");
    setInputEncoding("utf8");
    setDecodedOutput("text");
    setOutputMode("clean");
    setAlphabetMode("rfc4648");
    setIncludePadding(true);
    setUppercaseOutput(true);
    setIgnoreWhitespace(true);
    setAcceptLowercase(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Base32 Encoder Decoder"
      description="Encode text to Base32 and decode Base32 strings directly in your browser. Supports RFC 4648 Base32, padding options, uppercase output, whitespace cleanup, and byte-safe output."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Input
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
          placeholder={mode === "decode" ? sampleBase32 : sampleText}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Encode normal text or hex bytes to Base32, or decode Base32 back to
          text, hex, or byte values.
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
            label="Alphabet"
            value={alphabetMode}
            onChange={(value) => {
              setAlphabetMode(value as AlphabetMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "RFC 4648 Base32", value: "rfc4648" },
              { label: "Base32hex", value: "base32hex" },
            ]}
          />

          <YoryantraSelect
            label="Encode Input"
            value={inputEncoding}
            onChange={(value) => {
              setInputEncoding(value as InputEncoding);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "UTF-8 text", value: "utf8" },
              { label: "Hex bytes", value: "hex" },
            ]}
          />

          <YoryantraSelect
            label="Decode Output"
            value={decodedOutput}
            onChange={(value) => {
              setDecodedOutput(value as DecodedOutput);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Text", value: "text" },
              { label: "Hex", value: "hex" },
              { label: "Byte values", value: "bytes" },
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
              { label: "Grouped output", value: "spaced" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={includePadding}
                onChange={(event) => {
                  setIncludePadding(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Include padding while encoding
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={uppercaseOutput}
                onChange={(event) => {
                  setUppercaseOutput(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Use uppercase Base32 output
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(event) => {
                  setIgnoreWhitespace(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Ignore spaces and line breaks while decoding
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={acceptLowercase}
                onChange={(event) => {
                  setAcceptLowercase(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Accept lowercase Base32 input while decoding
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Base32 is commonly used for secrets, OTP setup strings, compact tokens,
          and systems where uppercase letters and digits are easier to handle.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertBase32} className="yoryantra-btn">
          Convert Base32
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
          <SummaryCard label="Input Length" value={result.inputLength.toLocaleString()} />
          <SummaryCard label="Bytes" value={result.byteLength.toLocaleString()} />
          <SummaryCard label="Warnings" value={result.warnings.length.toLocaleString()} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Conversion Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Copy the clean output or switch to report mode for detailed length
            and alphabet information.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
            {result.output}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Base32 notes
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
          {output || "Converted Base32 output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Base32 conversion happens directly in your browser. Your input is not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding and Decoding Base32 Values
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base32 represents binary data using a small alphabet of letters and
            digits. It is less compact than Base64, but it is easier to read,
            type, and handle in systems that avoid mixed case or special
            characters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Base32 Encoder Decoder converts text or hex bytes to Base32 and
            decodes Base32 strings back to text, hex, or byte values. It supports
            RFC 4648 Base32, Base32hex, padding control, grouped output, and
            whitespace cleanup.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Base32 Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text, hex bytes, or a Base32 string.</li>
            <li>Choose encode, decode, or auto detect.</li>
            <li>Select the alphabet and output format.</li>
            <li>Adjust padding, uppercase, whitespace, or lowercase handling.</li>
            <li>Copy the converted Base32, decoded text, hex, or report output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Base32 Encoder Decoder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Decoding Base32 values found in developer tools or logs.</li>
            <li>Encoding short text or byte values into RFC 4648 Base32.</li>
            <li>Working with TOTP or OTP-style secret strings.</li>
            <li>Checking whether a Base32 value needs padding.</li>
            <li>Converting hex bytes into a Base32-safe representation.</li>
            <li>Producing uppercase grouped output that is easier to read.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Base32 Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Text:   hello
Base32: NBSWY3DP`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Base32 vs Base64
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64 is more compact, but it can include characters such as plus,
            slash, and equals depending on the variant. Base32 uses a smaller
            alphabet, usually uppercase letters and digits, which makes it easier
            to use in some manual-entry or case-insensitive workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Choose Base32 when readability, typing, or case handling matters
            more than compactness. Choose Base64 when shorter encoded output is
            more important.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Base32 encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base32 is a way to represent binary data using 32 characters,
                commonly uppercase letters A-Z and digits 2-7.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What alphabet does this tool use?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It supports standard RFC 4648 Base32 and Base32hex.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does Base32 require padding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Some Base32 strings include equals signs for padding. This tool
                can add or remove padding depending on your setting.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode TOTP-style secrets?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It can decode Base32 text used in many secret strings, but it
                does not generate or verify one-time passwords.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I convert Base32?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Base32 conversion happens directly in your browser.
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

            <Link href="/tools/hex-encoder-decoder" className="yoryantra-btn-outline">
              Hex Encoder Decoder
            </Link>

            <Link href="/tools/binary-encoder-decoder" className="yoryantra-btn-outline">
              Binary Encoder Decoder
            </Link>

            <Link href="/tools/jwt-base64url-encoder-decoder" className="yoryantra-btn-outline">
              JWT Base64URL Encoder Decoder
            </Link>

            <Link href="/tools/punycode-converter" className="yoryantra-btn-outline">
              Punycode Converter
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

function runBase32Conversion(
  input: string,
  options: {
    mode: Mode;
    inputEncoding: InputEncoding;
    decodedOutput: DecodedOutput;
    outputMode: OutputMode;
    alphabetMode: AlphabetMode;
    includePadding: boolean;
    uppercaseOutput: boolean;
    ignoreWhitespace: boolean;
    acceptLowercase: boolean;
  }
): ConversionResult {
  const alphabet = alphabets[options.alphabetMode];
  const cleanInput = input.trim();
  const modeUsed = options.mode === "auto"
    ? looksLikeBase32(cleanInput, alphabet, options.acceptLowercase)
      ? "decode"
      : "encode"
    : options.mode;

  const warnings: string[] = [];
  let rawOutput = "";
  let byteLength = 0;

  if (modeUsed === "encode") {
    const bytes = options.inputEncoding === "hex" ? hexToBytes(cleanInput) : new TextEncoder().encode(cleanInput);
    byteLength = bytes.length;
    rawOutput = encodeBase32(bytes, alphabet, options.includePadding);

    if (!options.uppercaseOutput) {
      rawOutput = rawOutput.toLowerCase();
    }
  } else {
    const prepared = prepareBase32Input(cleanInput, {
      alphabet,
      ignoreWhitespace: options.ignoreWhitespace,
      acceptLowercase: options.acceptLowercase,
    });
    const bytes = decodeBase32(prepared, alphabet);
    byteLength = bytes.length;

    if (options.decodedOutput === "hex") {
      rawOutput = bytesToHex(bytes);
    } else if (options.decodedOutput === "bytes") {
      rawOutput = Array.from(bytes).join(" ");
    } else {
      rawOutput = decodeUtf8(bytes);
    }

    if (!cleanInput.includes("=")) {
      warnings.push("Input has no padding. That can be valid, but some systems expect padded Base32.");
    }
  }

  const groups = groupOutput(rawOutput, modeUsed === "encode" ? 8 : 16);
  const formattedOutput = formatOutput(rawOutput, {
    outputMode: options.outputMode,
    input: cleanInput,
    modeUsed,
    inputLength: cleanInput.length,
    outputLength: rawOutput.length,
    byteLength,
    alphabetMode: options.alphabetMode,
    groups,
    warnings,
  });

  return {
    input: cleanInput,
    output: formattedOutput,
    modeUsed,
    inputLength: cleanInput.length,
    outputLength: rawOutput.length,
    byteLength,
    alphabet: options.alphabetMode,
    warnings,
    groups,
  };
}

function encodeBase32(bytes: Uint8Array, alphabet: string, includePadding: boolean) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  if (includePadding) {
    while (output.length % 8 !== 0) {
      output += "=";
    }
  }

  return output;
}

function decodeBase32(input: string, alphabet: string) {
  const clean = input.replace(/=+$/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = alphabet.indexOf(char);

    if (index === -1) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

function prepareBase32Input(
  input: string,
  options: {
    alphabet: string;
    ignoreWhitespace: boolean;
    acceptLowercase: boolean;
  }
) {
  let value = options.ignoreWhitespace ? input.replace(/\s+/g, "") : input;

  if (options.acceptLowercase) {
    value = value.toUpperCase();
  }

  const allowed = new RegExp(`^[${escapeRegExp(options.alphabet)}=]+$`);

  if (!allowed.test(value)) {
    throw new Error("Input contains characters outside the selected Base32 alphabet.");
  }

  return value;
}

function looksLikeBase32(input: string, alphabet: string, acceptLowercase: boolean) {
  const value = acceptLowercase ? input.replace(/\s+/g, "").toUpperCase() : input.replace(/\s+/g, "");
  const allowed = new RegExp(`^[${escapeRegExp(alphabet)}=]+$`);
  return value.length >= 8 && allowed.test(value);
}

function hexToBytes(input: string) {
  const clean = input.replace(/\s+/g, "");

  if (!/^[a-f0-9]*$/i.test(clean) || clean.length % 2 !== 0) {
    throw new Error("Hex input must contain an even number of hexadecimal characters.");
  }

  const bytes = new Uint8Array(clean.length / 2);

  for (let index = 0; index < clean.length; index += 2) {
    bytes[index / 2] = parseInt(clean.slice(index, index + 2), 16);
  }

  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function decodeUtf8(bytes: Uint8Array) {
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return Array.from(bytes).join(" ");
  }
}

function groupOutput(value: string, size: number) {
  const groups: string[] = [];

  for (let index = 0; index < value.length; index += size) {
    groups.push(value.slice(index, index + size));
  }

  return groups;
}

function formatOutput(
  rawOutput: string,
  details: {
    outputMode: OutputMode;
    input: string;
    modeUsed: "encode" | "decode";
    inputLength: number;
    outputLength: number;
    byteLength: number;
    alphabetMode: AlphabetMode;
    groups: string[];
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
        byteLength: details.byteLength,
        alphabet: details.alphabetMode,
        warnings: details.warnings,
      },
      null,
      2
    );
  }

  if (details.outputMode === "report") {
    const warnings = details.warnings.length
      ? details.warnings.map((warning) => `- ${warning}`)
      : ["- None"];

    return [
      "Base32 Conversion Report",
      "------------------------",
      `Mode: ${details.modeUsed}`,
      `Alphabet: ${details.alphabetMode}`,
      `Input length: ${details.inputLength}`,
      `Output length: ${details.outputLength}`,
      `Byte length: ${details.byteLength}`,
      "",
      "Output:",
      rawOutput,
      "",
      "Warnings:",
      ...warnings,
    ].join("\n");
  }

  if (details.outputMode === "spaced") {
    return details.groups.join(" ");
  }

  return rawOutput;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getBase32Notes(result: ConversionResult): Base32Note[] {
  const notes: Base32Note[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review warnings",
      message: result.warnings.join(" "),
    });
  }

  if (result.modeUsed === "decode") {
    notes.push({
      title: "Decoded bytes",
      message:
        "Decoded Base32 may not always be readable text. Use hex or byte output when the result looks unusual.",
    });
  }

  if (result.alphabet === "base32hex") {
    notes.push({
      title: "Base32hex alphabet",
      message:
        "Base32hex uses a different character order from standard RFC 4648 Base32.",
    });
  }

  return notes;
}
