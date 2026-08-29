"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type OutputBase = "decimal" | "hex" | "binary";

type Diagnostics = {
  mode: "encode" | "decode";
  values: number;
  controlCharacters: number;
  inputFormats: string[];
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputBase, setOutputBase] = useState<OutputBase>("decimal");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [copied, setCopied] = useState(false);

  const outputLabel = useMemo(() => {
    if (outputBase === "hex") return "Hexadecimal";
    if (outputBase === "binary") return "Binary";
    return "Decimal";
  }, [outputBase]);

  const clearResult = () => {
    setOutput("");
    setError("");
    setDiagnostics(null);
    setCopied(false);
  };

  const encodeAscii = () => {
    if (input.length === 0) {
      setError("Please enter text to convert.");
      setOutput("");
      setDiagnostics(null);
      return;
    }

    const characters = Array.from(input);
    const nonAscii = characters.find((character) => (character.codePointAt(0) ?? 0) > 127);

    if (nonAscii) {
      const codePoint = nonAscii.codePointAt(0) ?? 0;
      setError(
        `Standard ASCII only covers values 0–127. Found ${JSON.stringify(nonAscii)} (${formatCodePoint(codePoint)}). Use a Unicode or UTF-8 tool for this character.`,
      );
      setOutput("");
      setDiagnostics(null);
      return;
    }

    const values = characters.map((character) => character.codePointAt(0) ?? 0);
    setOutput(values.map((value) => formatAsciiValue(value, outputBase)).join(" "));
    setDiagnostics({
      mode: "encode",
      values: values.length,
      controlCharacters: values.filter(isControlCode).length,
      inputFormats: [outputLabel],
    });
    setError("");
    setCopied(false);
  };

  const decodeAscii = () => {
    const trimmed = input.trim();

    if (!trimmed) {
      setError("Please enter ASCII values to decode.");
      setOutput("");
      setDiagnostics(null);
      return;
    }

    const tokens = trimmed.split(/[\s,]+/).filter(Boolean);

    if (tokens.length === 0) {
      setError("Please enter ASCII values to decode.");
      setOutput("");
      setDiagnostics(null);
      return;
    }

    try {
      const parsed = tokens.map(parseAsciiToken);
      const values = parsed.map((item) => item.value);
      const decoded = values.map((value) => String.fromCharCode(value)).join("");

      setOutput(decoded);
      setDiagnostics({
        mode: "decode",
        values: values.length,
        controlCharacters: values.filter(isControlCode).length,
        inputFormats: Array.from(new Set(parsed.map((item) => item.format))),
      });
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to decode these ASCII values.");
      setOutput("");
      setDiagnostics(null);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const resetAll = () => {
    setInput("");
    setOutputBase("decimal");
    clearResult();
  };

  const loadExample = () => {
    setInput("89 111 114 121 97 110 116 114 97");
    setOutputBase("decimal");
    clearResult();
  };

  return (
    <ToolShell
      title="ASCII Converter"
      description="Convert text to standard ASCII values from 0 to 127, or decode decimal, hexadecimal, and binary ASCII values back into text."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text or ASCII Values
        </label>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          rows={7}
          placeholder="Example: 89 111 114 121 97 110 116 114 97"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Decode decimal values such as 65, hexadecimal values such as 0x41 or \\x41, and 8-bit binary values such as 01000001 or 0b01000001.
        </p>
      </div>

      <div className="mt-6 max-w-md">
        <YoryantraSelect
          label="Encode text as"
          value={outputBase}
          onChange={(value: string) => {
            setOutputBase(value as OutputBase);
            clearResult();
          }}
          options={[
            { label: "Decimal", value: "decimal" },
            { label: "Hexadecimal", value: "hex" },
            { label: "8-bit binary", value: "binary" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={decodeAscii} className="yoryantra-btn">
          Decode ASCII
        </button>
        <button onClick={encodeAscii} className="yoryantra-btn-outline">
          Encode to ASCII
        </button>
        <button onClick={copyOutput} disabled={!output} className="yoryantra-btn-outline">
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

      {diagnostics && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Mode" value={diagnostics.mode === "encode" ? "Text → ASCII" : "ASCII → Text"} />
          <SummaryCard label="Values" value={String(diagnostics.values)} />
          <SummaryCard label="Control values" value={String(diagnostics.controlCharacters)} />
        </div>
      )}

      {diagnostics?.mode === "decode" && diagnostics.controlCharacters > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          The decoded result contains {diagnostics.controlCharacters} ASCII control value{diagnostics.controlCharacters === 1 ? "" : "s"}. Tabs, line breaks, NUL, ESC, or DEL may be invisible or affect layout when copied.
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {diagnostics?.mode === "decode" && diagnostics.inputFormats.length > 0 && (
            <span className="text-xs text-gray-500">Parsed: {diagnostics.inputFormats.join(", ")}</span>
          )}
        </div>

        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "ASCII conversion output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Conversion runs in your browser. Your input is not sent anywhere by this tool.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">ASCII Stops at 127</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Standard ASCII is a 7-bit character set with values from 0 through 127. That covers English letters, digits, punctuation, whitespace, and control characters. It does not include accented letters, Devanagari, emoji, or most other modern text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This distinction matters when debugging. A JavaScript character code above 127 is not an “extended ASCII” value with one universal meaning. Different legacy encodings reuse the 128–255 range differently, while modern applications usually use Unicode and UTF-8.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Decimal, Hex, and Binary Are the Same ASCII Value</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <p><strong>A</strong> = 65 decimal = 0x41 hexadecimal = 01000001 binary</p>
            <p><strong>LF</strong> = 10 decimal = 0x0A hexadecimal = 00001010 binary</p>
            <p><strong>SPACE</strong> = 32 decimal = 0x20 hexadecimal = 00100000 binary</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Control Characters Can Look Like Missing Output</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            ASCII includes non-printing values such as NUL (0), TAB (9), LF (10), CR (13), ESC (27), and DEL (127). If you decode those values, the output may contain a tab, line break, or an invisible character rather than a visible symbol. The control-value count above helps explain that result.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When to Use a Different Tool</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-gray-600">
            <li>Use a Unicode escape converter when you are working with code points such as U+1F642.</li>
            <li>Use a UTF-8 byte tool when text contains non-ASCII characters and you need the actual encoded bytes.</li>
            <li>Use a hex or binary byte converter when the data is arbitrary bytes rather than ASCII text.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            For the standard 7-bit ASCII code used for network interchange, see RFC 20.
          </p>
          <a
            href="https://www.rfc-editor.org/rfc/rfc20"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--green)] underline underline-offset-4"
          >
            RFC 20: ASCII format for network interchange
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/ascii-converter" />
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function formatAsciiValue(value: number, base: OutputBase) {
  if (base === "hex") return `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
  if (base === "binary") return value.toString(2).padStart(8, "0");
  return String(value);
}

function parseAsciiToken(token: string): { value: number; format: string } {
  let value: number;
  let format: string;

  if (/^0x[0-9a-f]{1,2}$/i.test(token)) {
    value = Number.parseInt(token.slice(2), 16);
    format = "hex";
  } else if (/^\\x[0-9a-f]{1,2}$/i.test(token)) {
    value = Number.parseInt(token.slice(2), 16);
    format = "hex escape";
  } else if (/^0b[01]{1,8}$/i.test(token)) {
    value = Number.parseInt(token.slice(2), 2);
    format = "binary";
  } else if (/^[01]{8}$/.test(token)) {
    value = Number.parseInt(token, 2);
    format = "8-bit binary";
  } else if (/^\d{1,3}$/.test(token)) {
    value = Number.parseInt(token, 10);
    format = "decimal";
  } else {
    throw new Error(`Could not parse ${JSON.stringify(token)} as decimal ASCII, 0x/\\x hex, or 8-bit binary.`);
  }

  if (!Number.isInteger(value) || value < 0 || value > 127) {
    throw new Error(`${JSON.stringify(token)} resolves to ${value}, outside the standard ASCII range 0–127.`);
  }

  return { value, format };
}

function isControlCode(value: number) {
  return value < 32 || value === 127;
}

function formatCodePoint(value: number) {
  return `U+${value.toString(16).toUpperCase().padStart(value <= 0xffff ? 4 : 6, "0")}`;
}

