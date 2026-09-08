"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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
      description="Convert text and byte-oriented octal without hiding invalid groups, ASCII limits, or UTF-8 decoding failures."
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
                { label: "Separated or escaped groups", value: "mixed" },
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
          <Toggle checked={includeByteTable} onChange={setIncludeByteTable} label="Show byte table" />
          <Toggle checked={warnInvalidOctal} onChange={setWarnInvalidOctal} label="Warn about invalid octal values" />
          <Toggle checked={warnNonAscii} onChange={setWarnNonAscii} label="Warn about non-ASCII characters" />
          <Toggle checked={warnControlCharacters} onChange={setWarnControlCharacters} label="Warn about control characters" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Formatting changes only the representation. Decoding still validates every supplied group instead of silently dropping malformed tokens.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processInput}
          className="min-h-11 whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Convert Octal
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="min-h-11 whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Text Example
        </button>
        <button
          type="button"
          onClick={loadDecodeExample}
          className="min-h-11 whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Octal Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="min-h-11 whitespace-nowrap rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
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
                className="min-h-11 whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div
                key={`${note.title}-${note.message}`}
                className={`self-start rounded-xl border p-4 ${
                  note.severity === "high"
                    ? "border-red-200 bg-red-50"
                    : note.severity === "warning"
                      ? "border-amber-200 bg-amber-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <p className={`text-sm font-semibold ${note.severity === "high" ? "text-red-900" : note.severity === "warning" ? "text-amber-900" : "text-gray-900"}`}>{note.title}</p>
                <p className={`mt-1 text-sm leading-6 ${note.severity === "high" ? "text-red-700" : note.severity === "warning" ? "text-amber-800" : "text-gray-600"}`}>{note.message}</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">Octal here represents bytes, not characters</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            One byte ranges from decimal 0 to 255, which is octal 000 to 377. ASCII uses only 0 to 127. UTF-8 can use several bytes for one visible character, so a character such as é or an emoji produces multiple octal groups rather than one “Unicode octal value.”
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The byte table therefore describes encoded bytes. Values above 127 are not displayed as if each byte were a standalone Unicode character.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Decoding without guessing past bad input</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
              <p className="font-semibold text-gray-900">Separated or escaped values</p>
              <p className="mt-2">Inputs such as <code>131 157 162</code>, <code>131,157,162</code>, and <code>\131\157\162</code> have explicit group boundaries that can be validated independently.</p>
            </div>
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <p className="font-semibold">Unseparated octal is inherently ambiguous</p>
              <p className="mt-2">A stream such as <code>10112</code> could be split in more than one way. Three-digit mode accepts complete three-digit byte groups instead of silently choosing a convenient parse.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">ASCII and UTF-8 answer different questions</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            ASCII mode accepts only byte values 0–127. UTF-8 mode accepts the full byte range but requires the complete byte sequence to be valid UTF-8 before it is presented as readable text. Invalid UTF-8 is reported rather than replaced with the Unicode replacement character.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Escaped octal depends on the language reading it</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A backslash followed by octal digits is familiar from C-family and Unix tooling, but exact escape grammar varies by language and command. Treat the escaped form here as a byte representation, then check the parser that will consume it. Unix permission values such as 755 are a separate use of base eight and are not byte strings.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
          <p className="font-semibold text-gray-900">Browser boundary</p>
          <p className="mt-2">Conversion happens in the browser and no network request is needed by the conversion logic. This page does not interpret chmod permissions or execute octal escapes in a programming language.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference point</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            UTF-8 is defined by <a href="https://www.rfc-editor.org/rfc/rfc3629" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 3629</a>. The important boundary here is simple: octal represents byte values; UTF-8 defines how sequences of those bytes represent Unicode text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/octal-encoder-decoder" />
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

  if (options.actionMode !== "encode" && validUnits.length) {
    const decoded = decodeBytes(validUnits.map((unit) => unit.decimal), options.textEncoding);
    if (!decoded.ok) issues.push({ severity: "high", title: decoded.title, message: decoded.message });
  }

  if (options.actionMode === "encode" && options.separatorMode === "none" && !options.padToThreeDigits && validUnits.length > 1) {
    issues.push({ severity: "warning", title: "Unseparated output is ambiguous", message: "Variable-width octal values without separators cannot always be split back into the original bytes. Pad to three digits or keep a separator for round trips." });
  }

  const output = formatOutput(validUnits, units, issues, options);
  return {
    output,
    units,
    issues,
    inputLength: options.input.length,
    unitCount: units.length,
    invalidCount: units.filter((unit) => !unit.valid).length,
    outputLength: output.length,
    detectedShape: options.actionMode === "encode" ? `${options.textEncoding.toUpperCase()} text` : describeDecodeShape(source, options.decodeMode),
  };
}

function encodeText(input: string, options: {
  textEncoding: TextEncoding;
  padToThreeDigits: boolean;
  prefixEscapedOctal: boolean;
  uppercaseHex: boolean;
  showControlNames: boolean;
}): OctalUnit[] {
  if (options.textEncoding === "utf8") {
    const bytes = Array.from(new TextEncoder().encode(input));
    return bytes.map((byte, index) => ({
      index,
      input: String(byte),
      octal: formatOctal(byte, options),
      decimal: byte,
      hex: formatHex(byte, options.uppercaseHex),
      character: displayByte(byte, options.showControlNames),
      valid: true,
      message: "UTF-8 byte",
    }));
  }

  return Array.from(input).map((character, index) => {
    const codePoint = character.codePointAt(0) ?? 0;
    const valid = codePoint <= 0x7f;
    return {
      index,
      input: character,
      octal: valid ? formatOctal(codePoint, options) : "",
      decimal: codePoint,
      hex: valid ? formatHex(codePoint, options.uppercaseHex) : `U+${codePoint.toString(16).toUpperCase()}`,
      character,
      valid,
      message: valid ? "ASCII byte" : "Outside ASCII range",
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
}): OctalUnit[] {
  const groups = extractOctalGroups(input, options.decodeMode);
  return groups.map((group, index) => {
    const clean = group.replace(/^\\/, "");
    const syntaxValid = options.decodeMode === "threeDigit" ? /^[0-7]{3}$/.test(clean) : /^[0-7]{1,3}$/.test(clean);
    const decimal = syntaxValid ? Number.parseInt(clean, 8) : Number.NaN;
    const valid = syntaxValid && decimal <= 0xff;
    return {
      index,
      input: group,
      octal: valid ? formatOctal(decimal, options) : group,
      decimal: valid ? decimal : 0,
      hex: valid ? formatHex(decimal, options.uppercaseHex) : "",
      character: valid ? displayByte(decimal, options.showControlNames) : "",
      valid,
      message: valid ? "Byte" : syntaxValid ? "Outside byte range" : "Invalid octal group",
    };
  });
}

function extractOctalGroups(input: string, mode: DecodeMode): string[] {
  const source = input.trim();
  if (!source) return [];

  if (mode === "escaped") {
    const tokens: string[] = source.match(/\\[^\\\s,]+/g) ?? [];
    const residue = source.replace(/\\[^\\\s,]+/g, "").replace(/[\s,]+/g, "");
    if (residue) tokens.push(residue);
    return tokens.length ? tokens : [source];
  }

  if (mode === "threeDigit") {
    if (/[\s,]/.test(source)) return source.split(/[\s,]+/).filter(Boolean);
    const groups: string[] = [];
    for (let index = 0; index < source.length; index += 3) groups.push(source.slice(index, index + 3));
    return groups;
  }

  if (mode === "mixed") {
    if (/\\/.test(source)) return extractOctalGroups(source, "escaped");
    return source.split(/[\s,]+/).filter(Boolean);
  }

  if (/\\/.test(source)) return extractOctalGroups(source, "escaped");
  if (/[\s,]/.test(source)) return source.split(/[\s,]+/).filter(Boolean);
  if (/^[0-7]+$/.test(source) && source.length % 3 === 0) return extractOctalGroups(source, "threeDigit");
  return [source];
}

function describeDecodeShape(input: string, mode: DecodeMode) {
  if (mode === "escaped" || (mode === "auto" && /\\/.test(input))) return "escaped octal";
  if (mode === "threeDigit") return "three-digit groups";
  if (/[\s,]/.test(input)) return "separated octal";
  return "single / ambiguous group";
}

function formatOutput(validUnits: OctalUnit[], allUnits: OctalUnit[], issues: Issue[], options: {
  actionMode: ActionMode;
  outputMode: OutputMode;
  separatorMode: SeparatorMode;
  prefixEscapedOctal: boolean;
  padToThreeDigits: boolean;
  textEncoding: TextEncoding;
}) {
  if (options.outputMode === "converted") {
    if (options.actionMode === "encode") {
      if (allUnits.some((unit) => !unit.valid)) return "[input contains characters outside the selected text encoding]";
      return joinOctal(validUnits.map((unit) => unit.octal), options.separatorMode);
    }
    const decoded = decodeBytes(validUnits.map((unit) => unit.decimal), options.textEncoding);
    return decoded.ok ? decoded.text : `[${decoded.title}]`;
  }
  if (options.outputMode === "spaced") return validUnits.map((unit) => unit.octal.replace(/^\\/, "")).join(" ");
  if (options.outputMode === "escaped") return validUnits.map((unit) => `\\${unit.octal.replace(/^\\/, "")}`).join("");
  if (options.outputMode === "json") return JSON.stringify({ action: options.actionMode, textEncoding: options.textEncoding, units: allUnits, issues }, null, 2);
  if (options.outputMode === "markdown") {
    const lines = ["| Index | Octal | Decimal | Hex | Byte view | Status |", "|---:|---|---:|---|---|---|", ...allUnits.map((unit) => `| ${unit.index} | ${escapeMarkdown(unit.octal)} | ${unit.valid ? unit.decimal : "-"} | ${unit.hex || "-"} | ${escapeMarkdown(unit.character || "-")} | ${unit.message} |`)];
    if (issues.length) { lines.push("", "Notes:"); issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`)); }
    return lines.join("\n");
  }
  if (options.outputMode === "csv") {
    const rows = [["index", "input", "octal", "decimal", "hex", "byte_view", "valid", "message"]];
    allUnits.forEach((unit) => rows.push([String(unit.index), unit.input, unit.octal, unit.valid ? String(unit.decimal) : "", unit.hex, unit.character, unit.valid ? "true" : "false", unit.message]));
    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }
  const lines = ["# Octal Byte Review", "", `- [${allUnits.length ? "x" : " "}] Parsed ${allUnits.length} supplied group${allUnits.length === 1 ? "" : "s"}.`, `- [${allUnits.every((unit) => unit.valid) ? "x" : " "}] Every supplied group is a valid byte-sized octal value.`, `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] Selected text encoding can represent the result without a high-severity conflict.`];
  if (issues.length) { lines.push("", "Notes:"); issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`)); }
  return lines.join("\n");
}

function buildIssues(units: OctalUnit[], options: {
  actionMode: ActionMode;
  textEncoding: TextEncoding;
  warnInvalidOctal: boolean;
  warnNonAscii: boolean;
  warnControlCharacters: boolean;
}): Issue[] {
  const issues: Issue[] = [];
  const invalid = units.filter((unit) => !unit.valid);
  const nonAsciiBytes = units.filter((unit) => unit.valid && unit.decimal > 0x7f);
  const control = units.filter((unit) => unit.valid && (unit.decimal < 0x20 || unit.decimal === 0x7f));
  if (options.warnInvalidOctal && invalid.length) {
    issues.push({
      severity: "high",
      title: options.actionMode === "encode" && options.textEncoding === "ascii" ? "Input is not ASCII" : "Invalid octal groups",
      message: options.actionMode === "encode"
        ? `${invalid.length} character${invalid.length === 1 ? " is" : "s are"} outside the 7-bit ASCII range. Switch to UTF-8 to encode modern Unicode text.`
        : `${invalid.length} supplied group${invalid.length === 1 ? "" : "s"} could not be parsed as octal byte values. Malformed tokens are reported rather than skipped.`,
    });
  }
  if (options.warnNonAscii && nonAsciiBytes.length) {
    issues.push({ severity: options.textEncoding === "ascii" ? "high" : "info", title: options.textEncoding === "ascii" ? "Bytes outside ASCII" : "Bytes above ASCII range", message: `${nonAsciiBytes.length} byte${nonAsciiBytes.length === 1 ? " is" : "s are"} above 127. ${options.textEncoding === "ascii" ? "ASCII cannot represent them." : "They can be valid parts of a UTF-8 sequence."}` });
  }
  if (options.warnControlCharacters && control.length) issues.push({ severity: "warning", title: "Control bytes present", message: `${control.length} byte${control.length === 1 ? "" : "s"} represent control values rather than ordinary visible text.` });
  return issues;
}

function decodeBytes(bytes: number[], encoding: TextEncoding): { ok: true; text: string } | { ok: false; title: string; message: string } {
  if (encoding === "ascii") {
    if (bytes.some((byte) => byte > 0x7f)) return { ok: false, title: "Not valid ASCII", message: "At least one decoded byte is above 127, so the selected ASCII interpretation cannot represent the byte sequence." };
    return { ok: true, text: bytes.map((byte) => String.fromCharCode(byte)).join("") };
  }
  try { return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes)) }; }
  catch { return { ok: false, title: "Invalid UTF-8 byte sequence", message: "The octal bytes do not form valid UTF-8. The page will not silently replace invalid bytes with U+FFFD." }; }
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

function displayByte(byte: number, showControlNames: boolean) {
  const names: Record<number, string> = { 0: "NUL", 9: "TAB", 10: "LF", 13: "CR", 27: "ESC", 32: "space", 127: "DEL" };
  if (showControlNames && names[byte]) return names[byte];
  if (byte < 0x20 || byte === 0x7f) return showControlNames ? "control" : "";
  if (byte <= 0x7e) return String.fromCharCode(byte);
  return "UTF-8 byte";
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

