"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "encode" | "decode" | "auto";
type InputEncoding = "utf8" | "hex";
type DecodedOutput = "text" | "hex" | "bytes";
type OutputMode = "clean" | "grouped" | "report" | "json";
type AlphabetMode = "bitcoin" | "flickr";

type ConversionResult = {
  input: string;
  rawOutput: string;
  output: string;
  modeUsed: "encode" | "decode";
  alphabetMode: AlphabetMode;
  inputLength: number;
  outputLength: number;
  byteLength: number;
  groups: string[];
  warnings: string[];
};

type Base58Note = {
  title: string;
  message: string;
};

const sampleText = "Yoryantra Base58 example";
const sampleBase58 = "5QmQh5XFQstTJG49LkYqKvyNhtCJj";

const alphabets: Record<AlphabetMode, string> = {
  bitcoin: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  flickr: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [inputEncoding, setInputEncoding] = useState<InputEncoding>("utf8");
  const [decodedOutput, setDecodedOutput] = useState<DecodedOutput>("text");
  const [outputMode, setOutputMode] = useState<OutputMode>("clean");
  const [alphabetMode, setAlphabetMode] = useState<AlphabetMode>("bitcoin");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [preserveLeadingZeros, setPreserveLeadingZeros] = useState(true);
  const [warnAmbiguousCharacters, setWarnAmbiguousCharacters] = useState(true);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getBase58Notes(result) : []), [result]);

  const convertBase58 = () => {
    if (!input.trim()) {
      setError("Please enter text, hex bytes, or a Base58 string.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = runBase58Conversion(input, {
        mode,
        inputEncoding,
        decodedOutput,
        outputMode,
        alphabetMode,
        ignoreWhitespace,
        preserveLeadingZeros,
        warnAmbiguousCharacters,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to convert this Base58 value."
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
    setInput(mode === "decode" ? sampleBase58 : sampleText);
    setInputEncoding("utf8");
    setDecodedOutput("text");
    setOutputMode("clean");
    setAlphabetMode("bitcoin");
    setIgnoreWhitespace(true);
    setPreserveLeadingZeros(true);
    setWarnAmbiguousCharacters(true);
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
    setAlphabetMode("bitcoin");
    setIgnoreWhitespace(true);
    setPreserveLeadingZeros(true);
    setWarnAmbiguousCharacters(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Base58 Encoder Decoder"
      description="Encode text or hex bytes to Base58 and decode Base58 strings directly in your browser. Supports Bitcoin Base58, Flickr Base58, byte-safe output, grouped output, and clean developer reports."
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
          placeholder={mode === "decode" ? sampleBase58 : sampleText}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Encode normal text or hex bytes to Base58, or decode Base58 back to
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
              { label: "Bitcoin Base58", value: "bitcoin" },
              { label: "Flickr Base58", value: "flickr" },
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
              { label: "Grouped output", value: "grouped" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
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
                checked={preserveLeadingZeros}
                onChange={(event) => {
                  setPreserveLeadingZeros(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Preserve leading zero bytes
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnAmbiguousCharacters}
                onChange={(event) => {
                  setWarnAmbiguousCharacters(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about characters not used in Base58
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Base58 avoids visually confusing characters like 0, O, I, and l, making
          encoded values easier to copy, read, and type than many Base64 strings.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertBase58} className="yoryantra-btn">
          Convert Base58
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
            Copy the clean output or switch to report mode for byte length,
            alphabet, and warning details.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
            {result.output}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Base58 notes
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
          {output || "Converted Base58 output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Base58 conversion happens directly in your browser. Your input is not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding and Decoding Base58 Values
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base58 is an encoding format designed to avoid visually confusing
            characters. It removes characters like zero, capital O, capital I,
            and lowercase l from the alphabet, making encoded strings easier to
            read and type.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Base58 Encoder Decoder converts text or hex bytes into Base58
            and decodes Base58 back into text, hex, or byte values. It supports
            Bitcoin-style Base58 and Flickr-style Base58 for common developer
            workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Base58 Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text, hex bytes, or a Base58 string.</li>
            <li>Choose encode, decode, or auto detect.</li>
            <li>Select Bitcoin Base58 or Flickr Base58 alphabet.</li>
            <li>Choose text, hex, byte, clean, grouped, report, or JSON output.</li>
            <li>Copy the converted value for debugging, tokens, or data work.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Base58 Encoder Decoder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Decoding Base58 values from logs, identifiers, or examples.</li>
            <li>Encoding hex bytes into a compact readable string.</li>
            <li>Working with Bitcoin-style Base58 strings.</li>
            <li>Checking whether a pasted string uses invalid Base58 characters.</li>
            <li>Creating copy-friendly identifiers without confusing characters.</li>
            <li>Converting decoded bytes into text, hex, or byte value output.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Base58 Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Text:   hello
Base58: Cn8eVZg`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Base58 vs Base64
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64 is more compact and widely used for binary data, but it can
            include symbols or characters that are awkward in manual copying.
            Base58 is slightly longer but easier for humans to read, type, and
            compare.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use Base58 when readability and reduced character confusion matter.
            Use Base64 when compact output and broad protocol support matter more.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Base58 encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base58 is an encoding format that represents bytes with 58
                readable characters while avoiding easily confused characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What characters are removed from Base58?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Common Base58 alphabets avoid 0, O, I, and l because they can be
                hard to tell apart.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Base58 the same as Base58Check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Base58Check adds version and checksum behavior on top of
                Base58. This tool performs raw Base58 encoding and decoding.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode Bitcoin-style Base58?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It supports the Bitcoin Base58 alphabet, but it does not verify
                Base58Check checksums.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I convert Base58?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Base58 conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/base32-encoder-decoder" className="yoryantra-btn-outline">
              Base32 Encoder Decoder
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/hex-encoder-decoder" className="yoryantra-btn-outline">
              Hex Encoder Decoder
            </Link>

            <Link href="/tools/binary-encoder-decoder" className="yoryantra-btn-outline">
              Binary Encoder Decoder
            </Link>

            <Link href="/tools/random-token-generator" className="yoryantra-btn-outline">
              Random Token Generator
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

function runBase58Conversion(
  input: string,
  options: {
    mode: Mode;
    inputEncoding: InputEncoding;
    decodedOutput: DecodedOutput;
    outputMode: OutputMode;
    alphabetMode: AlphabetMode;
    ignoreWhitespace: boolean;
    preserveLeadingZeros: boolean;
    warnAmbiguousCharacters: boolean;
  }
): ConversionResult {
  const alphabet = alphabets[options.alphabetMode];
  const cleanInput = input.trim();
  const preparedInput = options.ignoreWhitespace ? cleanInput.replace(/\s+/g, "") : cleanInput;
  const warnings: string[] = [];

  if (options.warnAmbiguousCharacters && /[0OIl]/.test(preparedInput)) {
    warnings.push("Input contains characters commonly excluded from Base58: 0, O, I, or l.");
  }

  const modeUsed = options.mode === "auto"
    ? looksLikeBase58(preparedInput, alphabet)
      ? "decode"
      : "encode"
    : options.mode;

  let rawOutput = "";
  let byteLength = 0;

  if (modeUsed === "encode") {
    const bytes = options.inputEncoding === "hex" ? hexToBytes(cleanInput) : new TextEncoder().encode(cleanInput);
    byteLength = bytes.length;
    rawOutput = encodeBase58(bytes, alphabet, options.preserveLeadingZeros);
  } else {
    const bytes = decodeBase58(preparedInput, alphabet, options.preserveLeadingZeros);
    byteLength = bytes.length;

    if (options.decodedOutput === "hex") {
      rawOutput = bytesToHex(bytes);
    } else if (options.decodedOutput === "bytes") {
      rawOutput = Array.from(bytes).join(" ");
    } else {
      rawOutput = decodeUtf8(bytes);
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
    rawOutput,
    output: formattedOutput,
    modeUsed,
    alphabetMode: options.alphabetMode,
    inputLength: cleanInput.length,
    outputLength: rawOutput.length,
    byteLength,
    groups,
    warnings,
  };
}

function encodeBase58(bytes: Uint8Array, alphabet: string, preserveLeadingZeros: boolean) {
  if (bytes.length === 0) {
    return "";
  }

  let value = BigInt(0);

  for (const byte of bytes) {
    value = (value << BigInt(8)) + BigInt(byte);
  }

  let output = "";

  while (value > BigInt(0)) {
    const remainder = Number(value % 5BigInt(8));
    value = value / 5BigInt(8);
    output = alphabet[remainder] + output;
  }

  if (preserveLeadingZeros) {
    for (const byte of bytes) {
      if (byte === 0) {
        output = alphabet[0] + output;
      } else {
        break;
      }
    }
  }

  return output || alphabet[0];
}

function decodeBase58(input: string, alphabet: string, preserveLeadingZeros: boolean) {
  if (!input) {
    return new Uint8Array();
  }

  let value = BigInt(0);

  for (const char of input) {
    const index = alphabet.indexOf(char);

    if (index === -1) {
      throw new Error(`Invalid Base58 character: ${char}`);
    }

    value = value * 5BigInt(8) + BigInt(index);
  }

  const bytes: number[] = [];

  while (value > BigInt(0)) {
    bytes.unshift(Number(value & BigInt(255)));
    value >>= BigInt(8);
  }

  if (preserveLeadingZeros) {
    for (const char of input) {
      if (char === alphabet[0]) {
        bytes.unshift(0);
      } else {
        break;
      }
    }
  }

  return new Uint8Array(bytes);
}

function looksLikeBase58(input: string, alphabet: string) {
  if (input.length < 4) {
    return false;
  }

  return Array.from(input).every((char) => alphabet.includes(char));
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
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
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
      "Base58 Conversion Report",
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

  if (details.outputMode === "grouped") {
    return details.groups.join(" ");
  }

  return rawOutput;
}

function getBase58Notes(result: ConversionResult): Base58Note[] {
  const notes: Base58Note[] = [];

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
        "Decoded Base58 may not always be readable text. Use hex or byte output when the result looks unusual.",
    });
  }

  if (result.alphabetMode === "flickr") {
    notes.push({
      title: "Flickr alphabet",
      message:
        "Flickr Base58 uses a different character order than Bitcoin Base58. Use the same alphabet as the system you are debugging.",
    });
  }

  return notes;
}
