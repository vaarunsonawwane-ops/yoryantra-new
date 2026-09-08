"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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
    if (input.length === 0) {
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
      description="Encode bytes with Bitcoin or Flickr Base58 alphabets while preserving leading-zero semantics."
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
        <button onClick={convertBase58} className="yoryantra-btn min-h-11 whitespace-nowrap">
          Convert Base58
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
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
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
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Converted Base58 output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Conversion runs in your browser. Yoryantra does not send the value to a
        conversion API. Raw Base58 is an encoding only; it does not add a
        checksum, encryption, or authenticity.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Base58 turns bytes into a human-oriented alphabet
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Bitcoin-style Base58 represents a byte sequence as a large
            base-256 number and repeatedly converts it into 58 symbols. The
            familiar Bitcoin alphabet omits 0, O, I, and lowercase l so strings
            are less likely to be misread when copied by hand.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base58 is not one universal standard. The Flickr alphabet contains
            the same set of symbols in a different order, so a value encoded
            with one alphabet can decode to different bytes under another. Keep
            the alphabet with the data format that produced the value.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Leading zero bytes are part of the byte sequence
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            In the Bitcoin convention, each leading zero byte is represented by
            the alphabet's zero symbol, <code className="font-mono">1</code>.
            That rule prevents a big-integer conversion from silently discarding
            bytes at the front of the payload. The preserve option keeps this
            byte-oriented convention; disabling it intentionally treats the
            value more like an integer and can make round trips lossy.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`Hex bytes:  000001
Bitcoin Base58 with leading zeros preserved: 112`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Raw Base58 is not Base58Check
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Bitcoin addresses and WIF private keys commonly use Base58Check,
            which adds version bytes and a checksum around a payload before the
            Base58 step. Only raw Base58 conversion is performed here. A string
            can decode successfully here and still have an invalid Base58Check
            checksum or the wrong version for a particular Bitcoin format.
          </p>

          <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            A WIF string can contain a spend-capable private key. Do not paste
            real private keys or recovery material merely to see their decoded
            bytes. Local browser processing does not make secret handling
            automatically safe.
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Text view is only appropriate for UTF-8 payloads
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base58 represents bytes, not characters. When decoded bytes form
            valid UTF-8, Text output renders them normally. If they do not, the
            conversion stops and asks you to switch to Hex or Byte values so the
            payload is not silently changed by Unicode replacement characters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Auto detect is necessarily heuristic because many ordinary words use
            only Base58 characters. Select Encode or Decode explicitly for
            production data. Grouped output is for reading; spaces are not part
            of a Base58 alphabet and are removed only when the whitespace option
            is enabled during decoding.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reference implementations and conventions
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            There is no RFC that defines a single generic Base58 alphabet. The
            <a
              href="https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp"
              target="_blank"
              rel="noreferrer"
              className="mx-1 font-medium text-[var(--green)] underline underline-offset-4"
            >
              Bitcoin Core Base58 implementation
            </a>
            is the primary reference for the Bitcoin alphabet, while the
            <a
              href="https://en.bitcoin.it/wiki/Base58Check_encoding"
              target="_blank"
              rel="noreferrer"
              className="mx-1 font-medium text-[var(--green)] underline underline-offset-4"
            >
              Base58Check description
            </a>
            documents the leading-zero and checksum convention used by Bitcoin
            formats. No Base58Check checksum is calculated or verified here.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/base58-encoder-decoder" />
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
  if (input.length > 10_000) {
    throw new Error("Base58 conversion is intentionally limited to 10,000 input characters to keep the browser responsive.");
  }

  const alphabet = alphabets[options.alphabetMode];
  const probe = input.replace(/\s+/g, "");
  const warnings: string[] = [];
  const modeUsed = options.mode === "auto"
    ? looksLikeBase58(probe, alphabet)
      ? "decode"
      : "encode"
    : options.mode;

  if (options.mode === "auto") {
    warnings.push(
      `Auto detect chose ${modeUsed}. Ordinary text can consist entirely of Base58 symbols, so select the mode explicitly when a wrong guess would matter.`
    );
  }

  let rawOutput = "";
  let byteLength = 0;

  if (modeUsed === "encode") {
    const bytes = options.inputEncoding === "hex"
      ? hexToBytes(input)
      : new TextEncoder().encode(input);

    if (bytes.length === 0) {
      throw new Error("The selected input does not contain any bytes to encode.");
    }
    if (bytes.length > 5_000) {
      throw new Error("Base58 encoding is limited to 5,000 input bytes because base conversion becomes expensive for large payloads.");
    }

    byteLength = bytes.length;

    if (!options.preserveLeadingZeros && bytes[0] === 0) {
      warnings.push("Leading zero bytes are being collapsed under integer-style conversion, so a byte-for-byte round trip is not guaranteed.");
    }

    rawOutput = encodeBase58(bytes, alphabet, options.preserveLeadingZeros);
  } else {
    let preparedInput = input;

    if (options.ignoreWhitespace) {
      const stripped = preparedInput.replace(/\s+/g, "");
      if (stripped !== preparedInput) {
        warnings.push("Whitespace was removed before decoding; spaces and line breaks are not Base58 symbols.");
      }
      preparedInput = stripped;
    } else if (/\s/.test(preparedInput)) {
      throw new Error("Whitespace is not part of the selected Base58 alphabet. Enable whitespace cleanup to remove it deliberately.");
    }

    if (!preparedInput) {
      throw new Error("Enter a Base58 value to decode.");
    }
    if (preparedInput.length > 7_000) {
      throw new Error("Base58 decoding is limited to 7,000 symbols to keep the browser responsive.");
    }

    if (options.warnAmbiguousCharacters && /[0OIl]/.test(preparedInput)) {
      throw new Error("The selected Base58 alphabet excludes 0, O, I, and lowercase l.");
    }

    if (!options.preserveLeadingZeros && preparedInput.startsWith(alphabet[0])) {
      warnings.push("Leading zero symbols are being collapsed under integer-style conversion, so original leading zero-byte count will be lost.");
    }

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
    input,
    modeUsed,
    inputLength: input.length,
    outputLength: rawOutput.length,
    byteLength,
    alphabetMode: options.alphabetMode,
    groups,
    warnings,
  });

  return {
    input,
    rawOutput,
    output: formattedOutput,
    modeUsed,
    alphabetMode: options.alphabetMode,
    inputLength: input.length,
    outputLength: rawOutput.length,
    byteLength,
    groups,
    warnings,
  };
}

function encodeBase58(bytes: Uint8Array, alphabet: string, preserveLeadingZeros: boolean): string {
  if (bytes.length === 0) {
    return "";
  }

  let zeroCount = 0;
  while (zeroCount < bytes.length && bytes[zeroCount] === 0) {
    zeroCount += 1;
  }

  const digits: number[] = [];

  for (let index = zeroCount; index < bytes.length; index += 1) {
    let carry = bytes[index];

    for (let digitIndex = 0; digitIndex < digits.length; digitIndex += 1) {
      carry += digits[digitIndex] * 256;
      digits[digitIndex] = carry % 58;
      carry = Math.floor(carry / 58);
    }

    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  let output = preserveLeadingZeros ? alphabet[0].repeat(zeroCount) : "";

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    output += alphabet[digits[index]];
  }

  if (!output && bytes.length > 0) {
    return alphabet[0];
  }

  return output;
}

function decodeBase58(input: string, alphabet: string, preserveLeadingZeros: boolean): Uint8Array {
  if (!input) {
    return new Uint8Array();
  }

  let zeroCount = 0;
  while (zeroCount < input.length && input[zeroCount] === alphabet[0]) {
    zeroCount += 1;
  }

  const bytes: number[] = [];
  const startIndex = preserveLeadingZeros ? zeroCount : 0;

  for (let index = startIndex; index < input.length; index += 1) {
    const value = alphabet.indexOf(input[index]);

    if (value === -1) {
      throw new Error(`Invalid Base58 character: ${input[index]}`);
    }

    let carry = value;

    for (let byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) {
      carry += bytes[byteIndex] * 58;
      bytes[byteIndex] = carry & 255;
      carry = Math.floor(carry / 256);
    }

    while (carry > 0) {
      bytes.push(carry & 255);
      carry = Math.floor(carry / 256);
    }
  }

  const decoded: number[] = [];
  if (preserveLeadingZeros) {
    for (let index = 0; index < zeroCount; index += 1) {
      decoded.push(0);
    }
  }

  for (let index = bytes.length - 1; index >= 0; index -= 1) {
    decoded.push(bytes[index]);
  }

  if (!preserveLeadingZeros && decoded.length === 0 && input.length > 0) {
    decoded.push(0);
  }

  return new Uint8Array(decoded);
}

function looksLikeBase58(input: string, alphabet: string): boolean {
  if (input.length < 6) {
    return false;
  }

  return Array.from(input).every((char) => alphabet.includes(char));
}

function hexToBytes(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, "");

  if (!clean) {
    throw new Error("Enter at least one byte of hexadecimal input.");
  }

  if (!/^[a-f0-9]+$/i.test(clean) || clean.length % 2 !== 0) {
    throw new Error("Hex input must contain an even number of hexadecimal characters.");
  }

  const bytes = new Uint8Array(clean.length / 2);

  for (let index = 0; index < clean.length; index += 2) {
    bytes[index / 2] = parseInt(clean.slice(index, index + 2), 16);
  }

  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function decodeUtf8(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(
      "The decoded bytes are not valid UTF-8 text. Choose Hex or Byte values to inspect the bytes without changing them."
    );
  }
}

function groupOutput(value: string, size: number): string[] {
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
      title: "Compatibility notes",
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
