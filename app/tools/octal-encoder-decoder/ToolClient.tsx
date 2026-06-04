"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "encode" | "decode" | "inspect";
type OutputMode = "converted" | "spaced" | "escaped" | "json" | "markdown" | "csv" | "checklist";
type TextEncoding = "utf8" | "ascii";
type SeparatorMode = "space" | "comma" | "none" | "newline";
type DecodeMode = "auto" | "threeDigit" | "escaped" | "mixed";

type OctalUnit = {
  index: number;
  input: string;
  octal: string;
  decimal: number;
  hex: string;
  character: string;
  valid: boolean;
  message: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  units: OctalUnit[];
  issues: Issue[];
  inputLength: number;
  unitCount: number;
  invalidCount: number;
  outputLength: number;
  detectedShape: string;
};

const sampleText = "Yoryantra";
const sampleOctal = "131 157 162 171 141 156 164 162 141";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("encode");
  const [outputMode, setOutputMode] = useState<OutputMode>("converted");
  const [textEncoding, setTextEncoding] = useState<TextEncoding>("utf8");
  const [separatorMode, setSeparatorMode] = useState<SeparatorMode>("space");
  const [decodeMode, setDecodeMode] = useState<DecodeMode>("auto");
  const [padToThreeDigits, setPadToThreeDigits] = useState(true);
  const [prefixEscapedOctal, setPrefixEscapedOctal] = useState(false);
  const [trimInput, setTrimInput] = useState(true);
  const [ignoreInvalidGroups, setIgnoreInvalidGroups] = useState(false);
  const [showControlNames, setShowControlNames] = useState(true);
  const [uppercaseHex, setUppercaseHex] = useState(true);
  const [includeByteTable, setIncludeByteTable] = useState(true);
  const [warnInvalidOctal, setWarnInvalidOctal] = useState(true);
  const [warnNonAscii, setWarnNonAscii] = useState(true);
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

  const processInput = () => {
    if (!input.trim()) {
      setError("Please paste text or octal values to convert.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      actionMode,
      outputMode,
      textEncoding,
      separatorMode,
      decodeMode,
      padToThreeDigits,
      prefixEscapedOctal,
      trimInput,
      ignoreInvalidGroups,
      showControlNames,
      uppercaseHex,
      includeByteTable,
      warnInvalidOctal,
      warnNonAscii,
      warnControlCharacters,
    });

    if (next.invalidCount > 0 && actionMode !== "encode" && !ignoreInvalidGroups) {
      setError(`${next.invalidCount} octal group${next.invalidCount === 1 ? "" : "s"} could not be decoded. Enable “Ignore invalid octal groups” to skip them.`);
      setResult(next);
      setOutput(next.output);
      setCopied(false);
      return;
    }

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
    setInput(actionMode === "decode" ? sampleOctal : sampleText);
    setActionMode("encode");
    setOutputMode("converted");
    setTextEncoding("utf8");
    setSeparatorMode("space");
    setDecodeMode("auto");
    setPadToThreeDigits(true);
    setPrefixEscapedOctal(false);
    setTrimInput(true);
    setIgnoreInvalidGroups(false);
    setShowControlNames(true);
    setUppercaseHex(true);
    setIncludeByteTable(true);
    setWarnInvalidOctal(true);
    setWarnNonAscii(true);
    setWarnControlCharacters(true);
    clearResult();
  };

  const loadDecodeExample = () => {
    setInput(sampleOctal);
    setActionMode("decode");
    setOutputMode("converted");
    setDecodeMode("auto");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("encode");
    setOutputMode("converted");
    setTextEncoding("utf8");
    setSeparatorMode("space");
    setDecodeMode("auto");
    setPadToThreeDigits(true);
    setPrefixEscapedOctal(false);
    setTrimInput(true);
    setIgnoreInvalidGroups(false);
    setShowControlNames(true);
    setUppercaseHex(true);
    setIncludeByteTable(true);
    setWarnInvalidOctal(true);
    setWarnNonAscii(true);
    setWarnControlCharacters(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Octal Encoder Decoder"
      description="Convert text into octal byte values, decode octal back into readable text, and inspect decimal, hexadecimal, and character values locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Text or Octal Values</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste normal text to encode, or octal values such as 131 157 162 171 to decode back into readable text.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleText}
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
                { label: "Encode text to octal", value: "encode" },
                { label: "Decode octal to text", value: "decode" },
                { label: "Inspect octal / byte values", value: "inspect" },
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
                { label: "Converted output", value: "converted" },
                { label: "Spaced octal", value: "spaced" },
                { label: "Escaped octal", value: "escaped" },
                { label: "JSON report", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Text Encoding"
              value={textEncoding}
              onChange={(value) => {
                setTextEncoding(value as TextEncoding);
                clearResult();
              }}
              options={[
                { label: "UTF-8 bytes", value: "utf8" },
                { label: "ASCII only", value: "ascii" },
              ]}
            />

            <YoryantraSelect
              label="Separator"
              value={separatorMode}
              onChange={(value) => {
                setSeparatorMode(value as SeparatorMode);
                clearResult();
              }}
              options={[
                { label: "Spaces", value: "space" },
                { label: "Commas", value: "comma" },
                { label: "No separator", value: "none" },
                { label: "One value per line", value: "newline" },
              ]}
            />

            <YoryantraSelect
              label="Decode Format"
              value={decodeMode}
              onChange={(value) => {
                setDecodeMode(value as DecodeMode);
                clearResult();
              }}
              options={[
                { label: "Auto detect", value: "auto" },
                { label: "Three-digit groups", value: "threeDigit" },
                { label: "Escaped octal like \\131", value: "escaped" },
                { label: "Mixed text and octal", value: "mixed" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={padToThreeDigits} onChange={setPadToThreeDigits} label="Pad octal values to three digits" />
          <Toggle checked={prefixEscapedOctal} onChange={setPrefixEscapedOctal} label="Prefix encoded values with backslash" />
          <Toggle checked={trimInput} onChange={setTrimInput} label="Trim outer whitespace" />
          <Toggle checked={ignoreInvalidGroups} onChange={setIgnoreInvalidGroups} label="Ignore invalid octal groups while decoding" />
          <Toggle checked={showControlNames} onChange={setShowControlNames} label="Show control character names" />
          <Toggle checked={uppercaseHex} onChange={setUppercaseHex} label="Use uppercase hex values" />
          <Toggle checked={includeByteTable} onChange={setIncludeByteTable} label="Include byte table in reports" />
          <Toggle checked={warnInvalidOctal} onChange={setWarnInvalidOctal} label="Warn about invalid octal values" />
          <Toggle checked={warnNonAscii} onChange={setWarnNonAscii} label="Warn about non-ASCII characters" />
          <Toggle checked={warnControlCharacters} onChange={setWarnControlCharacters} label="Warn about control characters" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options help format octal output, decode copied octal strings safely, and inspect bytes without uploading your text.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processInput}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Convert Octal
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Text Example
        </button>
        <button
          type="button"
          onClick={loadDecodeExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Octal Example
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

      {result ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">Converted text, octal values, escaped octal, or inspection report.</p>
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
            <StatCard label="Units" value={String(result.unitCount)} />
            <StatCard label="Invalid groups" value={String(result.invalidCount)} />
            <StatCard label="Detected shape" value={result.detectedShape} />
            <StatCard label="Output size" value={`${result.outputLength.toLocaleString()} chars`} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result?.units.length && includeByteTable ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Byte / Character Preview</h3>
          <p className="mt-1 text-sm text-gray-500">Review octal, decimal, hex, and character values for the first 120 units.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Index</th>
                  <th className="px-4 py-3 font-semibold">Octal</th>
                  <th className="px-4 py-3 font-semibold">Decimal</th>
                  <th className="px-4 py-3 font-semibold">Hex</th>
                  <th className="px-4 py-3 font-semibold">Character</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.units.slice(0, 120).map((unit) => (
                  <tr key={`${unit.index}-${unit.octal}-${unit.input}`}>
                    <td className="px-4 py-3">{unit.index}</td>
                    <td className="px-4 py-3 font-mono">{unit.octal}</td>
                    <td className="px-4 py-3">{unit.decimal}</td>
                    <td className="px-4 py-3 font-mono">{unit.hex}</td>
                    <td className="px-4 py-3 font-mono">{unit.character}</td>
                    <td className="px-4 py-3">{unit.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.units.length > 120 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 120 units to keep the preview readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Converting Text and Bytes Into Octal</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Octal is a base-8 number format that sometimes appears in old Unix examples, byte dumps, escape sequences, file permission explanations, and low-level debugging notes. Text can be represented as octal byte values, and copied octal values can be decoded back into readable text.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This converter helps encode text into octal, decode octal groups back into text, and inspect the byte values behind each character. It is useful when comparing ASCII, UTF-8 bytes, escaped octal, decimal values, and hexadecimal values side by side.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This Octal Converter Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Decoding copied octal byte sequences from logs, documentation, scripts, or older systems.</p>
            <p className="mt-2">Encoding short text into octal values for examples, tests, or byte-level explanations.</p>
            <p className="mt-2">Inspecting how text maps to octal, decimal, hexadecimal, and visible character values.</p>
            <p className="mt-2">Checking escaped octal strings such as \131\157\162 before using them in examples or scripts.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the Octal Encoder Decoder</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text, spaced octal values, or escaped octal sequences into the input box.</li>
            <li>Choose whether to encode, decode, or inspect the values.</li>
            <li>Select UTF-8 or ASCII handling, separator style, and output format.</li>
            <li>Use the options to pad octal values, show escaped output, or skip invalid groups.</li>
            <li>Review the converted output, byte table, and warnings before copying.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Octal Conversion</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`Text:
Yoryantra

Octal:
131 157 162 171 141 156 164 162 141

Escaped octal:
\\131\\157\\162\\171\\141\\156\\164\\162\\141`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Octal Bytes Are Not the Same as File Permissions</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Octal is also used in Unix-style permissions such as 755 or 644, but this tool focuses on text and byte conversion. It can help explain byte values, escaped strings, and encoded text, but it is not a chmod permission calculator.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does this octal encoder decoder do?">
              It converts text into octal byte values and decodes octal values back into readable text.
            </Faq>
            <Faq title="Can it decode escaped octal strings?">
              Yes. It can read escaped octal values such as \131\157\162 and decode them into text.
            </Faq>
            <Faq title="Should I use UTF-8 or ASCII mode?">
              Use UTF-8 for normal modern text. Use ASCII mode when you specifically want one-byte ASCII-only behavior and warnings for non-ASCII characters.
            </Faq>
            <Faq title="Why are some octal groups invalid?">
              Octal values can only use digits 0 through 7. Values outside the byte range or groups containing 8 or 9 are invalid for byte decoding.
            </Faq>
            <Faq title="Is anything uploaded while converting octal values?">
              No. The conversion runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Octal conversion often connects with byte inspection, binary conversion, hex conversion, ASCII lookup, and Unicode escape debugging.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/binary-encoder-decoder" className="yoryantra-btn-outline">Binary Encoder Decoder</Link>
            <Link href="/tools/hex-encoder-decoder" className="yoryantra-btn-outline">Hex Encoder Decoder</Link>
            <Link href="/tools/ascii-converter" className="yoryantra-btn-outline">ASCII Converter</Link>
            <Link href="/tools/unicode-escape-sequence-converter" className="yoryantra-btn-outline">Unicode Escape Sequence Converter</Link>
            <Link href="/tools/string-escape-sequence-converter" className="yoryantra-btn-outline">String Escape Sequence Converter</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  outputMode: OutputMode;
  textEncoding: TextEncoding;
  separatorMode: SeparatorMode;
  decodeMode: DecodeMode;
  padToThreeDigits: boolean;
  prefixEscapedOctal: boolean;
  trimInput: boolean;
  ignoreInvalidGroups: boolean;
  showControlNames: boolean;
  uppercaseHex: boolean;
  includeByteTable: boolean;
  warnInvalidOctal: boolean;
  warnNonAscii: boolean;
  warnControlCharacters: boolean;
}): Result {
  const source = options.trimInput ? options.input.trim() : options.input;
  const units = options.actionMode === "encode" ? encodeText(source, options) : decodeOctal(source, options);
  const validUnits = units.filter((unit) => unit.valid);
  const issues = buildIssues(units, options);
  const output = formatOutput(validUnits, units, issues, options);

  return {
    output,
    units,
    issues,
    inputLength: options.input.length,
    unitCount: units.length,
    invalidCount: units.filter((unit) => !unit.valid).length,
    outputLength: output.length,
    detectedShape: options.actionMode === "encode" ? "text input" : "octal input",
  };
}

function encodeText(input: string, options: {
  textEncoding: TextEncoding;
  padToThreeDigits: boolean;
  prefixEscapedOctal: boolean;
  uppercaseHex: boolean;
  showControlNames: boolean;
}) {
  const bytes = options.textEncoding === "utf8" ? Array.from(new TextEncoder().encode(input)) : Array.from(input).map((char) => char.charCodeAt(0));
  return bytes.map((byte, index) => {
    const octal = formatOctal(byte, options);
    return {
      index,
      input: String.fromCharCode(byte),
      octal,
      decimal: byte,
      hex: formatHex(byte, options.uppercaseHex),
      character: displayCharacter(byte, options.showControlNames),
      valid: byte >= 0 && byte <= 255,
      message: byte >= 0 && byte <= 255 ? "Encoded" : "Outside byte range",
    };
  });
}

function decodeOctal(input: string, options: {
  decodeMode: DecodeMode;
  padToThreeDigits: boolean;
  prefixEscapedOctal: boolean;
  ignoreInvalidGroups: boolean;
  uppercaseHex: boolean;
  showControlNames: boolean;
}) {
  const groups = extractOctalGroups(input, options.decodeMode);
  return groups.map((group, index) => {
    const clean = group.replace(/^\\/, "");
    const valid = /^[0-7]{1,3}$/.test(clean);
    const decimal = valid ? parseInt(clean, 8) : NaN;
    const inByteRange = valid && decimal >= 0 && decimal <= 255;
    const ok = valid && inByteRange;
    return {
      index,
      input: group,
      octal: valid ? formatOctal(decimal, options) : group,
      decimal: ok ? decimal : 0,
      hex: ok ? formatHex(decimal, options.uppercaseHex) : "",
      character: ok ? displayCharacter(decimal, options.showControlNames) : "",
      valid: ok,
      message: ok ? "Decoded" : valid ? "Outside byte range" : "Invalid octal",
    };
  });
}

function extractOctalGroups(input: string, mode: DecodeMode) {
  if (mode === "escaped") {
    return input.match(/\\[0-7]{1,3}/g) ?? [];
  }

  if (mode === "threeDigit") {
    const clean = input.replace(/[^0-7]/g, "");
    return clean.match(/[0-7]{1,3}/g) ?? [];
  }

  if (mode === "mixed") {
    return input.match(/\\[0-7]{1,3}|[0-7]{1,3}/g) ?? [];
  }

  const escaped = input.match(/\\[0-7]{1,3}/g);
  if (escaped?.length) return escaped;

  if (/^[0-7\s,]+$/.test(input)) {
    const split = input.split(/[\s,]+/).filter(Boolean);
    if (split.length > 1) return split;
  }

  return input.match(/[0-7]{1,3}/g) ?? [];
}

function formatOutput(validUnits: OctalUnit[], allUnits: OctalUnit[], issues: Issue[], options: {
  actionMode: ActionMode;
  outputMode: OutputMode;
  separatorMode: SeparatorMode;
  prefixEscapedOctal: boolean;
  padToThreeDigits: boolean;
}) {
  if (options.outputMode === "converted") {
    if (options.actionMode === "encode") return joinOctal(validUnits.map((unit) => unit.octal), options.separatorMode);
    return bytesToText(validUnits.map((unit) => unit.decimal));
  }

  if (options.outputMode === "spaced") {
    return validUnits.map((unit) => unit.octal.replace(/^\\/, "")).join(" ");
  }

  if (options.outputMode === "escaped") {
    return validUnits.map((unit) => `\\${unit.octal.replace(/^\\/, "")}`).join("");
  }

  if (options.outputMode === "json") {
    return JSON.stringify({
      action: options.actionMode,
      units: allUnits,
      issues,
    }, null, 2);
  }

  if (options.outputMode === "markdown") {
    const lines = [
      "| Index | Octal | Decimal | Hex | Character | Status |",
      "|---:|---|---:|---|---|---|",
      ...allUnits.map((unit) => `| ${unit.index} | ${escapeMarkdown(unit.octal)} | ${unit.decimal} | ${unit.hex} | ${escapeMarkdown(unit.character)} | ${unit.message} |`),
    ];

    if (issues.length) {
      lines.push("", "Notes:");
      issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
    }

    return lines.join("\n");
  }

  if (options.outputMode === "csv") {
    const rows = [["index", "octal", "decimal", "hex", "character", "valid", "message"]];
    allUnits.forEach((unit) => {
      rows.push([String(unit.index), unit.octal, String(unit.decimal), unit.hex, unit.character, unit.valid ? "true" : "false", unit.message]);
    });
    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }

  const lines = [
    "# Octal Conversion Checklist",
    "",
    `- [${allUnits.length ? "x" : " "}] Parsed ${allUnits.length} unit${allUnits.length === 1 ? "" : "s"}.`,
    `- [${allUnits.every((unit) => unit.valid) ? "x" : " "}] All octal groups are valid byte values.`,
    `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] No high-severity conversion issues found.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function buildIssues(units: OctalUnit[], options: {
  actionMode: ActionMode;
  textEncoding: TextEncoding;
  warnInvalidOctal: boolean;
  warnNonAscii: boolean;
  warnControlCharacters: boolean;
}) {
  const issues: Issue[] = [];
  const invalid = units.filter((unit) => !unit.valid);
  const nonAscii = units.filter((unit) => unit.decimal > 127);
  const control = units.filter((unit) => unit.valid && unit.decimal < 32);

  if (options.warnInvalidOctal && invalid.length) {
    issues.push({
      severity: "high",
      title: "Invalid octal groups",
      message: `${invalid.length} group${invalid.length === 1 ? "" : "s"} could not be parsed as valid byte-sized octal values.`,
    });
  }

  if (options.warnNonAscii && nonAscii.length) {
    issues.push({
      severity: "info",
      title: "Non-ASCII bytes",
      message: `${nonAscii.length} byte${nonAscii.length === 1 ? "" : "s"} are above ASCII range. Use UTF-8 mode for modern text.`,
    });
  }

  if (options.warnControlCharacters && control.length) {
    issues.push({
      severity: "warning",
      title: "Control characters",
      message: `${control.length} decoded byte${control.length === 1 ? "" : "s"} represent control characters rather than visible text.`,
    });
  }

  if (options.actionMode === "encode" && options.textEncoding === "ascii" && nonAscii.length) {
    issues.push({
      severity: "warning",
      title: "ASCII mode with non-ASCII input",
      message: "Some characters are outside the ASCII range and may not encode as expected in ASCII-only workflows.",
    });
  }

  return issues;
}

function bytesToText(bytes: number[]) {
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
  } catch {
    return bytes.map((byte) => String.fromCharCode(byte)).join("");
  }
}

function joinOctal(values: string[], separator: SeparatorMode) {
  if (separator === "comma") return values.join(", ");
  if (separator === "none") return values.join("");
  if (separator === "newline") return values.join("\n");
  return values.join(" ");
}

function formatOctal(byte: number, options: { padToThreeDigits: boolean; prefixEscapedOctal: boolean }) {
  const value = byte.toString(8);
  const padded = options.padToThreeDigits ? value.padStart(3, "0") : value;
  return options.prefixEscapedOctal ? `\\${padded}` : padded;
}

function formatHex(byte: number, uppercase: boolean) {
  const value = byte.toString(16).padStart(2, "0");
  return uppercase ? `0x${value.toUpperCase()}` : `0x${value}`;
}

function displayCharacter(byte: number, showControlNames: boolean) {
  const names: Record<number, string> = {
    0: "NUL",
    9: "TAB",
    10: "LF",
    13: "CR",
    27: "ESC",
    32: "space",
  };

  if (showControlNames && names[byte]) return names[byte];
  if (byte < 32 || byte === 127) return showControlNames ? "control" : "";
  return String.fromCharCode(byte);
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.unitCount > 1000) {
    notes.push({
      severity: "info",
      title: "Large octal conversion",
      message: "This input produced many units. Browser conversion is fine for moderate text, but large files are better handled with a local script.",
    });
  }

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated output is large. Copying or pasting it into some editors may take a moment.",
    });
  }

  return notes;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700">
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
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
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
