"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputBase = "decimal" | "hex" | "binary" | "octal";
type OutputMode = "compact" | "table" | "json" | "csv";
type ActionMode = "encode" | "decode";

type ParsedValue = {
  value: number;
  token: string;
  notation: string;
};

type AsciiRow = {
  index: number;
  value: number;
  decimal: string;
  hex: string;
  binary: string;
  octal: string;
  character: string;
  display: string;
  name: string;
  category: string;
};

type Result = {
  action: ActionMode;
  text: string;
  values: ParsedValue[];
  rows: AsciiRow[];
  output: string;
  controlCount: number;
  printableCount: number;
  formats: string[];
};

const SAMPLE_TEXT = "Sneha & Yoryantra";
const SAMPLE_VALUES = "83 0x6E 01100101 0o150 97 32 38 32 89 111 114 121 97 110 116 114 97";

const CONTROL_NAMES = [
  "NUL — Null",
  "SOH — Start of Heading",
  "STX — Start of Text",
  "ETX — End of Text",
  "EOT — End of Transmission",
  "ENQ — Enquiry",
  "ACK — Acknowledge",
  "BEL — Bell",
  "BS — Backspace",
  "HT — Horizontal Tab",
  "LF — Line Feed",
  "VT — Vertical Tab",
  "FF — Form Feed",
  "CR — Carriage Return",
  "SO — Shift Out",
  "SI — Shift In",
  "DLE — Data Link Escape",
  "DC1 — Device Control 1",
  "DC2 — Device Control 2",
  "DC3 — Device Control 3",
  "DC4 — Device Control 4",
  "NAK — Negative Acknowledge",
  "SYN — Synchronous Idle",
  "ETB — End of Transmission Block",
  "CAN — Cancel",
  "EM — End of Medium",
  "SUB — Substitute",
  "ESC — Escape",
  "FS — File Separator",
  "GS — Group Separator",
  "RS — Record Separator",
  "US — Unit Separator",
];

function controlName(value: number) {
  if (value >= 0 && value <= 31) return CONTROL_NAMES[value];
  if (value === 32) return "SPACE";
  if (value === 127) return "DEL — Delete";
  return "";
}

function categoryFor(value: number) {
  if (value < 32 || value === 127) return "Control";
  if (value === 32) return "Whitespace";
  if (value >= 48 && value <= 57) return "Digit";
  if (value >= 65 && value <= 90) return "Uppercase letter";
  if (value >= 97 && value <= 122) return "Lowercase letter";
  return "Punctuation / symbol";
}

function visibleAscii(value: number) {
  if (value === 9) return "\\t";
  if (value === 10) return "\\n";
  if (value === 11) return "\\v";
  if (value === 12) return "\\f";
  if (value === 13) return "\\r";
  if (value === 32) return "␠";
  if (value < 32 || value === 127) return controlName(value).split(" — ")[0];
  return String.fromCharCode(value);
}

function buildRow(value: number, index: number): AsciiRow {
  return {
    index,
    value,
    decimal: String(value),
    hex: `0x${value.toString(16).toUpperCase().padStart(2, "0")}`,
    binary: value.toString(2).padStart(8, "0"),
    octal: `0o${value.toString(8).padStart(3, "0")}`,
    character: String.fromCharCode(value),
    display: visibleAscii(value),
    name: controlName(value),
    category: categoryFor(value),
  };
}

function formatAsciiValue(value: number, base: OutputBase) {
  if (base === "hex") {
    return `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
  }

  if (base === "binary") {
    return value.toString(2).padStart(8, "0");
  }

  if (base === "octal") {
    return `0o${value.toString(8).padStart(3, "0")}`;
  }

  return String(value);
}

function parseAsciiToken(token: string): ParsedValue {
  let value = 0;
  let notation = "";

  if (/^0x[0-9a-f]{1,2}$/i.test(token)) {
    value = Number.parseInt(token.slice(2), 16);
    notation = "hex";
  } else if (/^\\x[0-9a-f]{1,2}$/i.test(token)) {
    value = Number.parseInt(token.slice(2), 16);
    notation = "hex escape";
  } else if (/^0b[01]{1,8}$/i.test(token)) {
    value = Number.parseInt(token.slice(2), 2);
    notation = "binary";
  } else if (/^[01]{8}$/.test(token)) {
    value = Number.parseInt(token, 2);
    notation = "8-bit binary";
  } else if (/^0o[0-7]{1,3}$/i.test(token)) {
    value = Number.parseInt(token.slice(2), 8);
    notation = "octal";
  } else if (/^U\+[0-9A-F]{2,4}$/i.test(token)) {
    value = Number.parseInt(token.slice(2), 16);
    notation = "Unicode code point";
  } else if (/^\d{1,3}$/.test(token)) {
    value = Number.parseInt(token, 10);
    notation = "decimal";
  } else {
    throw new Error(
      `Could not parse ${JSON.stringify(
        token
      )}. Accepted forms include 65, 0x41, \\x41, 01000001, 0b01000001, 0o101 and U+0041.`
    );
  }

  if (!Number.isInteger(value) || value < 0 || value > 127) {
    throw new Error(
      `${JSON.stringify(
        token
      )} resolves to ${value}, outside standard ASCII's 0–127 range.`
    );
  }

  return {
    value,
    token,
    notation,
  };
}

function parseValueList(input: string) {
  const tokens = input
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);

  if (!tokens.length) {
    throw new Error("Enter one or more ASCII values.");
  }

  return tokens.map(parseAsciiToken);
}

function assertAsciiText(input: string) {
  const characters = Array.from(input);

  for (let index = 0; index < characters.length; index += 1) {
    const point = characters[index].codePointAt(0);
    const value = typeof point === "number" ? point : 0;

    if (value > 127) {
      throw new Error(
        `${JSON.stringify(
          characters[index]
        )} at character ${index + 1} is U+${value
          .toString(16)
          .toUpperCase()
          .padStart(value <= 0xffff ? 4 : 6, "0")}. Standard ASCII ends at 127 (U+007F); use a Unicode/UTF-8 tool for this text.`
      );
    }
  }

  return characters.map((character) => character.charCodeAt(0));
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatOutput(
  result: Omit<Result, "output">,
  outputMode: OutputMode,
  outputBase: OutputBase
) {
  if (outputMode === "json") {
    return JSON.stringify(
      {
        action: result.action,
        text: result.text,
        values: result.rows.map((row) => ({
          decimal: row.value,
          hex: row.hex,
          binary: row.binary,
          octal: row.octal,
          display: row.display,
          name: row.name || null,
          category: row.category,
        })),
      },
      null,
      2
    );
  }

  if (outputMode === "csv") {
    return [
      ["index", "decimal", "hex", "binary", "octal", "display", "name", "category"]
        .map(csvCell)
        .join(","),
      ...result.rows.map((row) =>
        [
          String(row.index),
          row.decimal,
          row.hex,
          row.binary,
          row.octal,
          row.display,
          row.name,
          row.category,
        ]
          .map(csvCell)
          .join(",")
      ),
    ].join("\n");
  }

  if (outputMode === "table") {
    const header =
      "DEC  HEX   BINARY     OCTAL  CHAR  NAME / CATEGORY";
    const separator =
      "---- ----- ---------- ------ ----- -------------------------------";
    const lines = result.rows.map((row) => {
      const label = row.name || row.category;
      return `${row.decimal.padStart(3, " ")}  ${row.hex.padEnd(
        5,
        " "
      )} ${row.binary} ${row.octal.padEnd(6, " ")} ${row.display.padEnd(
        5,
        " "
      )} ${label}`;
    });

    return [header, separator, ...lines].join("\n");
  }

  if (result.action === "encode") {
    return result.rows
      .map((row) => formatAsciiValue(row.value, outputBase))
      .join(" ");
  }

  return result.text;
}

function encodeAscii(
  input: string,
  outputBase: OutputBase,
  outputMode: OutputMode
): Result {
  if (input.length === 0) {
    throw new Error("Enter text to encode.");
  }

  const values = assertAsciiText(input);
  const parsed = values.map((value) => ({
    value,
    token: String.fromCharCode(value),
    notation: "text",
  }));
  const rows = values.map(buildRow);
  const base: Omit<Result, "output"> = {
    action: "encode",
    text: input,
    values: parsed,
    rows,
    controlCount: values.filter((value) => value < 32 || value === 127).length,
    printableCount: values.filter((value) => value >= 32 && value <= 126).length,
    formats: [outputBase],
  };

  return {
    ...base,
    output: formatOutput(base, outputMode, outputBase),
  };
}

function decodeAscii(
  input: string,
  outputBase: OutputBase,
  outputMode: OutputMode
): Result {
  const values = parseValueList(input);
  const rows = values.map((item, index) => buildRow(item.value, index));
  const text = values
    .map((item) => String.fromCharCode(item.value))
    .join("");
  const formats = Array.from(
    new Set(values.map((item) => item.notation))
  );
  const base: Omit<Result, "output"> = {
    action: "decode",
    text,
    values,
    rows,
    controlCount: rows.filter((row) => row.category === "Control").length,
    printableCount: rows.filter(
      (row) => row.value >= 32 && row.value <= 126
    ).length,
    formats,
  };

  return {
    ...base,
    output: formatOutput(base, outputMode, outputBase),
  };
}

function buildAsciiReference() {
  const rows: AsciiRow[] = [];

  for (let value = 0; value <= 127; value += 1) {
    rows.push(buildRow(value, value));
  }

  return rows;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] =
    useState<ActionMode>("decode");
  const [outputBase, setOutputBase] =
    useState<OutputBase>("decimal");
  const [outputMode, setOutputMode] =
    useState<OutputMode>("compact");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const reference = useMemo(
    () => buildAsciiReference(),
    []
  );

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    try {
      const next =
        actionMode === "encode"
          ? encodeAscii(input, outputBase, outputMode)
          : decodeAscii(input, outputBase, outputMode);

      setResult(next);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to convert this ASCII input."
      );
    }
  };

  const loadExample = () => {
    setActionMode("decode");
    setInput(SAMPLE_VALUES);
    setOutputBase("decimal");
    setOutputMode("compact");
    clear();
  };

  const loadTextExample = () => {
    setActionMode("encode");
    setInput(SAMPLE_TEXT);
    setOutputBase("hex");
    setOutputMode("compact");
    clear();
  };

  const reset = () => {
    setInput("");
    setActionMode("decode");
    setOutputBase("decimal");
    setOutputMode("compact");
    setShowReference(false);
    clear();
  };

  const copy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The output could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="ASCII Converter"
      description="Work with real 7-bit ASCII—not a vague 0–255 “extended ASCII” table. Encode ASCII text, decode mixed numeric notation, inspect control codes and open the complete 0–127 reference when you need the exact value."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <YoryantraSelect
          label="Operation"
          value={actionMode}
          onChange={(value: string) => {
            setActionMode(value as ActionMode);
            clear();
          }}
          options={[
            { label: "ASCII values → text", value: "decode" },
            { label: "Text → ASCII values", value: "encode" },
          ]}
        />

        <YoryantraSelect
          label="Numeric format for encoded text"
          value={outputBase}
          onChange={(value: string) => {
            setOutputBase(value as OutputBase);
            clear();
          }}
          options={[
            { label: "Decimal", value: "decimal" },
            { label: "Hexadecimal", value: "hex" },
            { label: "8-bit binary", value: "binary" },
            { label: "Octal", value: "octal" },
          ]}
        />

        <YoryantraSelect
          label="Output view"
          value={outputMode}
          onChange={(value: string) => {
            setOutputMode(value as OutputMode);
            clear();
          }}
          options={[
            { label: "Converted value/text", value: "compact" },
            { label: "ASCII inspection table", value: "table" },
            { label: "JSON", value: "json" },
            { label: "CSV", value: "csv" },
          ]}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          {actionMode === "encode"
            ? "ASCII text"
            : "ASCII values"}
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clear();
          }}
          rows={8}
          placeholder={
            actionMode === "encode"
              ? SAMPLE_TEXT
              : SAMPLE_VALUES
          }
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        {actionMode === "decode" ? (
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            You can mix decimal (<code>65</code>), hex (
            <code>0x41</code> or <code>\x41</code>), 8-bit
            binary (<code>01000001</code>), prefixed binary (
            <code>0b01000001</code>), octal (<code>0o101</code>)
            and ASCII-range code points (<code>U+0041</code>).
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Encoding is intentionally strict: the first character above U+007F
            stops the conversion rather than being called “ASCII.”
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          {actionMode === "encode" ? "Encode ASCII" : "Decode ASCII"}
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Mixed-Value Example
        </button>
        <button
          type="button"
          onClick={loadTextExample}
          className="yoryantra-btn-outline"
        >
          Text Example
        </button>
        <button
          type="button"
          onClick={() => setShowReference(!showReference)}
          className="yoryantra-btn-outline"
        >
          {showReference ? "Hide Code Table" : "Show 0–127 Table"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Values" value={String(result.rows.length)} />
            <Stat
              label="Printable"
              value={String(result.printableCount)}
            />
            <Stat
              label="Controls"
              value={String(result.controlCount)}
            />
            <Stat
              label="Input notations"
              value={
                result.formats.length
                  ? result.formats.join(", ")
                  : "text"
              }
            />
          </div>

          {result.controlCount ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              The conversion contains {result.controlCount} ASCII control
              value{result.controlCount === 1 ? "" : "s"}. A decoded NUL,
              tab, carriage return, line feed or ESC can be invisible or alter
              copied text. Use the inspection table to see the exact code.
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Conversion output
              </h3>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>
            <pre className="yoryantra-output mt-4 min-h-[260px] max-h-[620px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output}
            </pre>
          </div>

          {outputMode !== "table" ? (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Character</th>
                    <th className="px-4 py-3 font-semibold">Dec</th>
                    <th className="px-4 py-3 font-semibold">Hex</th>
                    <th className="px-4 py-3 font-semibold">Binary</th>
                    <th className="px-4 py-3 font-semibold">Octal</th>
                    <th className="px-4 py-3 font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {result.rows.slice(0, 128).map((row) => (
                    <tr key={`${row.index}-${row.value}`}>
                      <td className="px-4 py-3 font-mono">{row.display}</td>
                      <td className="px-4 py-3 font-mono">{row.decimal}</td>
                      <td className="px-4 py-3 font-mono">{row.hex}</td>
                      <td className="px-4 py-3 font-mono">{row.binary}</td>
                      <td className="px-4 py-3 font-mono">{row.octal}</td>
                      <td className="px-4 py-3">
                        {row.name || row.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {showReference ? (
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Complete standard ASCII table
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              All 128 codes are shown. Values 0–31 and 127 are control
              characters; 32–126 are the printable repertoire.
            </p>
          </div>
          <div className="max-h-[620px] overflow-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3">Dec</th>
                  <th className="px-4 py-3">Hex</th>
                  <th className="px-4 py-3">Binary</th>
                  <th className="px-4 py-3">Octal</th>
                  <th className="px-4 py-3">Display</th>
                  <th className="px-4 py-3">Name / category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reference.map((row) => (
                  <tr key={row.value}>
                    <td className="px-4 py-2 font-mono">{row.decimal}</td>
                    <td className="px-4 py-2 font-mono">{row.hex}</td>
                    <td className="px-4 py-2 font-mono">{row.binary}</td>
                    <td className="px-4 py-2 font-mono">{row.octal}</td>
                    <td className="px-4 py-2 font-mono">{row.display}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {row.name || row.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The conversion uses only the text you paste in your browser. It does
        not send the ASCII data to a conversion API. Site-wide analytics or
        advertising scripts, if enabled, are separate from this operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            “Extended ASCII” Is Not One Character Set
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Standard ASCII has exactly 128 values: 0 through 127. The phrase
            “extended ASCII” is often used for many incompatible 8-bit
            encodings—Windows-1252, ISO-8859 families, DOS code pages and
            others. The byte 0x80 therefore has no single universal
            “extended-ASCII character.”
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            This tool refuses values above 127 on purpose. If you have bytes
            128–255, first identify the actual encoding rather than guessing
            from the number.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why 65, 0x41 and 01000001 All Mean A
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Decimal, hexadecimal, octal and binary are only different ways to
            write the same integer. ASCII assigns the integer 65 to uppercase
            A. Nothing changes about the character when that number is written
            as hexadecimal 0x41, binary 01000001 or octal 0o101.
          </p>
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 font-mono text-sm leading-7 text-gray-700">
            A&nbsp;&nbsp;&nbsp;&nbsp;65&nbsp;&nbsp;&nbsp;&nbsp;0x41&nbsp;&nbsp;&nbsp;&nbsp;01000001&nbsp;&nbsp;&nbsp;&nbsp;0o101
            <br />
            LF&nbsp;&nbsp;&nbsp;10&nbsp;&nbsp;&nbsp;&nbsp;0x0A&nbsp;&nbsp;&nbsp;&nbsp;00001010&nbsp;&nbsp;&nbsp;&nbsp;0o012
            <br />
            SPACE 32&nbsp;&nbsp;&nbsp;&nbsp;0x20&nbsp;&nbsp;&nbsp;&nbsp;00100000&nbsp;&nbsp;&nbsp;&nbsp;0o040
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Control Codes Explain “Blank” or Broken-Looking Output
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            ASCII was designed for communication systems, not only visible
            text. It includes NUL, BEL, backspace, horizontal tab, line feed,
            carriage return, escape and several historical device-control
            codes. Decoding 10 should create a line feed—not the visible
            characters “10.”
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This is why the tool keeps a named control-code view beside the
            converted text. Copying invisible controls into terminals, CSV,
            logs or source code can change behavior even when the output box
            appears empty.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Newline Problems Often Come Down to CR and LF
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            ASCII assigns CR to 13 and LF to 10. Unix-style text normally uses
            LF as its line ending, while CRLF is common in Internet protocols
            and Windows text. Seeing <code>13 10</code> in a byte dump is
            therefore different from seeing only <code>10</code>.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            When debugging protocol headers or copied files, inspect the
            individual codes rather than assuming every visual line break uses
            the same bytes.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            ASCII Is Embedded Inside Unicode and UTF-8
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unicode preserves the ASCII assignments U+0000 through U+007F, and
            UTF-8 encodes those code points as the same one-byte values. That
            is why plain English ASCII text also looks identical in a UTF-8
            byte dump.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The similarity ends above 127. A Devanagari letter or emoji is not
            “large ASCII”; it is a Unicode character whose UTF-8 encoding uses
            multiple bytes.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            When This Tool Is the Wrong Tool
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <UseCard
              title="Unicode code points"
              text="Use a Unicode/escape tool for U+0905, U+1F680 and other non-ASCII characters."
            />
            <UseCard
              title="UTF-8 bytes"
              text="Use the Binary Encoder Decoder when you need the actual bytes of modern multilingual text."
            />
            <UseCard
              title="Unknown 8-bit data"
              text="Identify the encoding first when values 128–255 come from a legacy file or protocol."
            />
          </div>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <a
            href="https://www.rfc-editor.org/rfc/rfc20"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[var(--green)] underline underline-offset-4"
          >
            RFC 20
          </a>{" "}
          documents the 7-bit US-ASCII format for network interchange,
          including the control-character abbreviations used in the reference
          table.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/ascii-converter" />
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function UseCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}
