"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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
    if (input.length === 0) {
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
      description="Encode bytes with RFC 4648 Base32 or decode padded and unpadded values safely."
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
        <button onClick={convertBase32} className="yoryantra-btn min-h-11 whitespace-nowrap">
          Convert Base32
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
            Copy the clean output or switch to report mode for detailed length
            and alphabet information.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
            {result.output}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
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
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Converted Base32 output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Conversion runs in your browser. Yoryantra does not send the value to a
        conversion API. Base32 is not encryption, so treat decoded secrets as
        sensitive data.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Base32 is a byte encoding, not a text format
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 4648 Base32 turns every five input bits into one character from
            A-Z and 2-7. That makes arbitrary bytes easier to copy through systems
            that prefer letters and digits, at the cost of producing more
            characters than Base64.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Text input is encoded as UTF-8 bytes first. Hex input represents the
            bytes directly. On decode, choose hex or byte output when the payload
            is binary; text output deliberately rejects byte sequences that are
            not valid UTF-8 instead of hiding corruption behind replacement
            characters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Padding has a shape, not just a trailing equals sign
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Standard Base32 works in eight-character output quanta. Depending on
            the final byte count, a padded value can end with six, four, three,
            one, or zero equals signs. A decoder should not accept arbitrary
            padding or impossible data lengths because different malformed
            strings could otherwise appear to represent the same bytes.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unpadded Base32 is used by some surrounding protocols. When padding
            is omitted here, the decoder still checks that the remaining symbol
            count is possible and that unused pad bits are zero. RFC 4648 requires
            padding by default unless the specification using Base32 says
            otherwise.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 items-start">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">RFC 4648 Base32</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Uses A-Z followed by 2-7. Uppercase is the canonical alphabet shown
              in RFC 4648; lowercase acceptance here is an explicit compatibility
              option and is reported as a normalization.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">Base32hex</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Uses 0-9 followed by A-V. It carries the same five-bit values but
              in a different symbol order, so decoding with the wrong alphabet
              produces the wrong bytes or a validation error.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            TOTP secrets need a different kind of caution
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Authenticator setup secrets are often displayed as unpadded Base32,
            but Base32 itself provides no confidentiality or integrity. Decoding
            a TOTP secret reveals the original secret bytes; it does not verify a
            one-time password and it does not tell you whether the secret is safe
            to disclose.
          </p>

          <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            Avoid pasting production authentication seeds unless you genuinely
            need to inspect them. Browser-local processing reduces network
            exposure, but clipboard history, screen capture, extensions, and the
            device itself can still expose a secret.
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where decoding is intentionally strict
          </h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Characters outside the selected alphabet are rejected.</li>
            <li>Padding may appear only at the end and must use a valid count.</li>
            <li>Impossible unpadded lengths such as one, three, or six symbols modulo eight are rejected.</li>
            <li>Non-zero unused pad bits are rejected to preserve canonical byte interpretation.</li>
            <li>Whitespace and lowercase letters are accepted only when their compatibility options are enabled.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A small byte-level example
          </h2>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`UTF-8 text: hello
Hex bytes:  68656c6c6f
Base32:     NBSWY3DP`}</pre>
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The encoded value is a representation of the five bytes, not a hash
            or encryption result. Decoding NBSWY3DP returns those same bytes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reference behind the alphabet and padding rules
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            <a
              href="https://www.rfc-editor.org/rfc/rfc4648.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 4648
            </a>{" "}
            defines Base32, Base32hex, padding, treatment of non-alphabet
            characters, and canonical pad-bit requirements. Protocol-specific
            formats may add stricter or different rules on top of it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/base32-encoder-decoder" />
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
  if (input.length > 1_000_000) {
    throw new Error("Input is too large for an interactive browser conversion. Keep it under 1,000,000 characters.");
  }

  const alphabet = alphabets[options.alphabetMode];
  const warnings: string[] = [];
  const probe = input.replace(/\s+/g, "");
  const modeUsed = options.mode === "auto"
    ? looksLikeBase32(probe, alphabet, options.acceptLowercase)
      ? "decode"
      : "encode"
    : options.mode;

  if (options.mode === "auto") {
    warnings.push(
      `Auto detect chose ${modeUsed}. Base32-looking plain text can be ambiguous, so choose the mode explicitly when the distinction matters.`
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

    byteLength = bytes.length;
    rawOutput = encodeBase32(bytes, alphabet, options.includePadding);

    if (!options.includePadding && rawOutput.length % 8 !== 0) {
      warnings.push(
        "Padding was omitted. That is valid only when the surrounding format permits unpadded Base32."
      );
    }

    if (!options.uppercaseOutput) {
      rawOutput = rawOutput.toLowerCase();
      warnings.push(
        "Lowercase output is a compatibility form; RFC 4648 publishes the Base32 alphabets in uppercase."
      );
    }
  } else {
    const prepared = prepareBase32Input(input, {
      alphabet,
      ignoreWhitespace: options.ignoreWhitespace,
      acceptLowercase: options.acceptLowercase,
    });
    warnings.push(...prepared.warnings);

    const bytes = decodeBase32(prepared.value, alphabet);
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
    output: formattedOutput,
    modeUsed,
    inputLength: input.length,
    outputLength: rawOutput.length,
    byteLength,
    alphabet: options.alphabetMode,
    warnings,
    groups,
  };
}

function encodeBase32(bytes: Uint8Array, alphabet: string, includePadding: boolean): string {
  let bits = 0;
  let buffer = 0;
  let output = "";

  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      output += alphabet[(buffer >>> bits) & 31];
    }

    if (bits === 0) {
      buffer = 0;
    } else {
      buffer &= (1 << bits) - 1;
    }
  }

  if (bits > 0) {
    output += alphabet[(buffer << (5 - bits)) & 31];
  }

  if (includePadding) {
    while (output.length % 8 !== 0) {
      output += "=";
    }
  }

  return output;
}

function decodeBase32(input: string, alphabet: string): Uint8Array {
  const clean = input.replace(/=+$/g, "");
  let bits = 0;
  let buffer = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = alphabet.indexOf(char);

    if (index === -1) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }

    buffer = (buffer << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 255);

      if (bits === 0) {
        buffer = 0;
      } else {
        buffer &= (1 << bits) - 1;
      }
    }
  }

  if (bits > 0 && buffer !== 0) {
    throw new Error(
      "The final Base32 symbol contains non-zero pad bits, so the value is not a canonical encoding of these bytes."
    );
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
): { value: string; warnings: string[] } {
  const warnings: string[] = [];
  let value = input;

  if (options.ignoreWhitespace) {
    const stripped = value.replace(/\s+/g, "");
    if (stripped !== value) {
      warnings.push("Whitespace was ignored while decoding; RFC 4648 does not generally treat it as part of the Base32 alphabet.");
    }
    value = stripped;
  } else if (/\s/.test(value)) {
    throw new Error("Whitespace is not part of the selected Base32 alphabet. Enable whitespace cleanup to ignore it deliberately.");
  }

  if (!value) {
    throw new Error("Enter a Base32 value to decode.");
  }

  if (/[a-z]/.test(value)) {
    if (!options.acceptLowercase) {
      throw new Error("Lowercase letters are present. Enable lowercase compatibility or provide uppercase Base32.");
    }
    warnings.push("Lowercase Base32 letters were normalized to uppercase before decoding.");
    value = value.toUpperCase();
  }

  const firstPadding = value.indexOf("=");
  const data = firstPadding === -1 ? value : value.slice(0, firstPadding);
  const padding = firstPadding === -1 ? "" : value.slice(firstPadding);

  if (padding && !/^=+$/.test(padding)) {
    throw new Error("Base32 padding may appear only as a run of equals signs at the end.");
  }

  const allowedData = new RegExp(`^[${escapeRegExp(options.alphabet)}]+$`);
  if (!allowedData.test(data)) {
    throw new Error("Input contains characters outside the selected Base32 alphabet.");
  }

  const remainder = data.length % 8;
  const expectedPadding: Record<number, number> = { 0: 0, 2: 6, 4: 4, 5: 3, 7: 1 };

  if (expectedPadding[remainder] === undefined) {
    throw new Error(
      "The Base32 symbol count is impossible for whole input bytes. Valid unpadded lengths end in 0, 2, 4, 5, or 7 symbols modulo 8."
    );
  }

  if (padding) {
    if (value.length % 8 !== 0 || padding.length !== expectedPadding[remainder]) {
      throw new Error(
        `Invalid Base32 padding. This data length requires ${expectedPadding[remainder]} trailing equals sign${expectedPadding[remainder] === 1 ? "" : "s"}.`
      );
    }
  } else if (expectedPadding[remainder] > 0) {
    warnings.push(
      "The value is unpadded. Some protocols allow that form, while generic RFC 4648 Base32 uses padding unless another specification says otherwise."
    );
  }

  return { value: data + padding, warnings };
}

function looksLikeBase32(input: string, alphabet: string, acceptLowercase: boolean): boolean {
  if (input.length < 8) {
    return false;
  }

  let value = acceptLowercase ? input.toUpperCase() : input;
  const firstPadding = value.indexOf("=");
  const data = firstPadding === -1 ? value : value.slice(0, firstPadding);
  const padding = firstPadding === -1 ? "" : value.slice(firstPadding);
  const allowed = new RegExp(`^[${escapeRegExp(alphabet)}]+$`);
  const validRemainders = [0, 2, 4, 5, 7];

  return Boolean(
    data &&
    allowed.test(data) &&
    (!padding || /^=+$/.test(padding)) &&
    validRemainders.includes(data.length % 8)
  );
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
      title: "Compatibility notes",
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
