"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "encode" | "decode" | "inspect";
type BinaryLayout = "spaced" | "continuous" | "prefixed" | "lines";
type OutputMode = "converted" | "byte-table" | "json" | "csv";

type ByteRow = {
  index: number;
  value: number;
  binary: string;
  hex: string;
  decimal: string;
  ascii: string;
  role: string;
};

type Finding = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  action: ActionMode;
  bytes: Uint8Array;
  text: string;
  rows: ByteRow[];
  output: string;
  findings: Finding[];
  asciiBytes: number;
  highBytes: number;
  controlBytes: number;
  nulBytes: number;
  sourceBits: number;
  codePoints: number;
};

const SAMPLE_TEXT = "Sneha 🚀";
const SAMPLE_BINARY =
  "01010011 01101110 01100101 01101000 01100001 00100000 11110000 10011111 10011010 10000000";

function findUnpairedSurrogate(input: string) {
  for (let index = 0; index < input.length; index += 1) {
    const codeUnit = input.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next =
        index + 1 < input.length
          ? input.charCodeAt(index + 1)
          : -1;

      if (next < 0xdc00 || next > 0xdfff) {
        return index;
      }

      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return index;
    }
  }

  return -1;
}

function parseBinaryBytes(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Enter binary bytes to decode or inspect.");
  }

  if (/0b/i.test(trimmed)) {
    const tokens = trimmed
      .split(/[\s,;]+/)
      .filter(Boolean);

    if (
      tokens.some(
        (token) =>
          !/^0b[01]{8}$/i.test(token)
      )
    ) {
      throw new Error(
        "When 0b prefixes are used, every token must contain exactly eight bits, for example 0b01000001."
      );
    }

    return new Uint8Array(
      tokens.map((token) =>
        Number.parseInt(token.slice(2), 2)
      )
    );
  }

  if (/[^01\s,;]/.test(trimmed)) {
    throw new Error(
      "Binary byte input can contain only 0, 1, whitespace, commas, semicolons, or 0b-prefixed eight-bit tokens."
    );
  }

  const hasSeparators =
    /[\s,;]/.test(trimmed);
  const tokens = trimmed
    .split(/[\s,;]+/)
    .filter(Boolean);

  if (!tokens.length) {
    throw new Error("No binary bytes were found.");
  }

  if (
    hasSeparators &&
    tokens.length > 1
  ) {
    if (
      tokens.some(
        (token) =>
          !/^[01]{8}$/.test(token)
      )
    ) {
      throw new Error(
        "Separated binary input uses byte boundaries. Every separated token must therefore contain exactly eight bits; remove separators only when you intend one continuous bit string."
      );
    }

    return new Uint8Array(
      tokens.map((token) =>
        Number.parseInt(token, 2)
      )
    );
  }

  const compact = tokens.join("");

  if (compact.length % 8 !== 0) {
    throw new Error(
      `The continuous input contains ${compact.length} bits. Byte-oriented UTF-8/binary conversion needs a whole number of eight-bit bytes.`
    );
  }

  const values: number[] = [];

  for (
    let index = 0;
    index < compact.length;
    index += 8
  ) {
    values.push(
      Number.parseInt(
        compact.slice(
          index,
          index + 8
        ),
        2
      )
    );
  }

  return new Uint8Array(values);
}

function decodeUtf8Strict(bytes: Uint8Array) {
  try {
    return new TextDecoder(
      "utf-8",
      { fatal: true }
    ).decode(bytes);
  } catch {
    const hex = Array.from(
      bytes,
      (byte) =>
        byte
          .toString(16)
          .toUpperCase()
          .padStart(2, "0")
    ).join(" ");

    throw new Error(
      `These are complete bytes, but the sequence is not valid UTF-8 text. Bytes: ${hex}. Use Inspect bytes when the data may be arbitrary binary rather than text.`
    );
  }
}

function byteRole(value: number) {
  if (value <= 0x7f) {
    return "ASCII / single-byte UTF-8";
  }

  if (value >= 0x80 && value <= 0xbf) {
    return "UTF-8 continuation byte";
  }

  if (value >= 0xc2 && value <= 0xdf) {
    return "Possible 2-byte UTF-8 lead";
  }

  if (value >= 0xe0 && value <= 0xef) {
    return "Possible 3-byte UTF-8 lead";
  }

  if (value >= 0xf0 && value <= 0xf4) {
    return "Possible 4-byte UTF-8 lead";
  }

  if (value === 0xc0 || value === 0xc1) {
    return "Invalid UTF-8 lead (overlong range)";
  }

  return "Invalid UTF-8 lead byte";
}

function asciiDisplay(value: number) {
  if (value === 0) return "NUL";
  if (value === 9) return "\\t";
  if (value === 10) return "\\n";
  if (value === 13) return "\\r";
  if (value === 32) return "SPACE";
  if (value >= 33 && value <= 126) {
    return String.fromCharCode(value);
  }
  if (value === 127) return "DEL";
  if (value < 32) return "CTRL";
  return "—";
}

function rowsFor(bytes: Uint8Array) {
  return Array.from(bytes).map(
    (value, index): ByteRow => ({
      index,
      value,
      binary: value
        .toString(2)
        .padStart(8, "0"),
      hex: `0x${value
        .toString(16)
        .toUpperCase()
        .padStart(2, "0")}`,
      decimal: String(value),
      ascii: asciiDisplay(value),
      role: byteRole(value),
    })
  );
}

function formatBinary(
  bytes: Uint8Array,
  layout: BinaryLayout
) {
  const groups = Array.from(
    bytes,
    (byte) =>
      byte
        .toString(2)
        .padStart(8, "0")
  );

  if (layout === "continuous") {
    return groups.join("");
  }

  if (layout === "prefixed") {
    return groups
      .map((group) => `0b${group}`)
      .join(" ");
  }

  if (layout === "lines") {
    return groups.join("\n");
  }

  return groups.join(" ");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function byteTable(rows: ByteRow[]) {
  const lines = [
    "IDX  BINARY     HEX   DEC  ASCII  BYTE ROLE",
    "---  --------   ----  ---  -----  -------------------------------",
  ];

  rows.forEach((row) => {
    lines.push(
      `${String(row.index).padStart(3, " ")}  ${row.binary}   ${row.hex.padEnd(
        4,
        " "
      )}  ${row.decimal.padStart(3, " ")}  ${row.ascii.padEnd(
        5,
        " "
      )}  ${row.role}`
    );
  });

  return lines.join("\n");
}

function formatOutput(
  base: Omit<Result, "output">,
  outputMode: OutputMode,
  layout: BinaryLayout
) {
  if (outputMode === "json") {
    return JSON.stringify(
      {
        action: base.action,
        text:
          base.action === "inspect"
            ? null
            : base.text,
        bytes: base.rows.map((row) => ({
          index: row.index,
          binary: row.binary,
          hex: row.hex,
          decimal: row.value,
          ascii: row.ascii,
          role: row.role,
        })),
        findings: base.findings,
      },
      null,
      2
    );
  }

  if (outputMode === "csv") {
    return [
      ["index", "binary", "hex", "decimal", "ascii", "byte_role"]
        .map(csvCell)
        .join(","),
      ...base.rows.map((row) =>
        [
          String(row.index),
          row.binary,
          row.hex,
          row.decimal,
          row.ascii,
          row.role,
        ]
          .map(csvCell)
          .join(",")
      ),
    ].join("\n");
  }

  if (outputMode === "byte-table") {
    return byteTable(base.rows);
  }

  if (base.action === "encode") {
    return formatBinary(base.bytes, layout);
  }

  if (base.action === "decode") {
    return base.text;
  }

  return byteTable(base.rows);
}

function findingsFor(
  action: ActionMode,
  bytes: Uint8Array,
  text: string
) {
  const findings: Finding[] = [];
  const nulCount = Array.from(bytes).filter(
    (byte) => byte === 0
  ).length;
  const controlCount = Array.from(bytes).filter(
    (byte) =>
      byte < 32 ||
      byte === 127
  ).length;
  const bom =
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf;

  if (nulCount) {
    findings.push({
      severity: "warning",
      title: "NUL byte present",
      message:
        `${nulCount} zero byte${
          nulCount === 1 ? " is" : "s are"
        } present. NUL can terminate strings in C-style APIs and can be invisible in copied text.`,
    });
  }

  if (controlCount) {
    findings.push({
      severity: "info",
      title: "ASCII control bytes present",
      message:
        `${controlCount} byte${
          controlCount === 1 ? " is" : "s are"
        } in the ASCII control ranges. Newline/tab may be intentional; other controls deserve inspection.`,
    });
  }

  if (bom) {
    findings.push({
      severity: "info",
      title: "UTF-8 BOM detected",
      message:
        "The byte stream begins EF BB BF (U+FEFF). A UTF-8 BOM is permitted by some consumers but is unnecessary for UTF-8 detection and can surprise parsers that expect content to start immediately.",
    });
  }

  if (
    bytes.length >= 2 &&
    Array.from(bytes).some(
      (byte, index) =>
        index > 0 &&
        bytes[index - 1] === 0x0d &&
        byte === 0x0a
    )
  ) {
    findings.push({
      severity: "info",
      title: "CRLF byte pair present",
      message:
        "The stream contains 0D 0A, the carriage-return + line-feed sequence used as a line ending in many network protocols and Windows text.",
    });
  }

  if (
    action === "encode" &&
    Array.from(text).length !== bytes.length
  ) {
    findings.push({
      severity: "info",
      title: "Some characters use multiple UTF-8 bytes",
      message:
        `${Array.from(text).length} Unicode code point${
          Array.from(text).length === 1 ? "" : "s"
        } encoded to ${bytes.length} byte${
          bytes.length === 1 ? "" : "s"
        }. This is normal for non-ASCII Unicode text.`,
    });
  }

  if (action === "inspect") {
    findings.push({
      severity: "info",
      title: "Byte inspection does not assume text",
      message:
        "The table describes each 8-bit value. A byte that looks like a UTF-8 continuation/lead byte is only a structural clue; context determines whether the full stream is valid text.",
    });
  }

  return findings;
}

function buildEncode(
  input: string,
  layout: BinaryLayout,
  outputMode: OutputMode
): Result {
  if (input.length === 0) {
    throw new Error("Enter text to encode.");
  }

  const bad = findUnpairedSurrogate(input);

  if (bad !== -1) {
    throw new Error(
      `Input contains an unpaired UTF-16 surrogate at code-unit position ${
        bad + 1
      }. Repair the string before UTF-8 encoding; TextEncoder would otherwise replace it with U+FFFD.`
    );
  }

  const bytes =
    new TextEncoder().encode(input);
  const rows = rowsFor(bytes);
  const findings =
    findingsFor("encode", bytes, input);
  const base: Omit<Result, "output"> = {
    action: "encode",
    bytes,
    text: input,
    rows,
    findings,
    asciiBytes: rows.filter(
      (row) => row.value < 128
    ).length,
    highBytes: rows.filter(
      (row) => row.value >= 128
    ).length,
    controlBytes: rows.filter(
      (row) =>
        row.value < 32 ||
        row.value === 127
    ).length,
    nulBytes: rows.filter(
      (row) => row.value === 0
    ).length,
    sourceBits: bytes.length * 8,
    codePoints: Array.from(input).length,
  };

  return {
    ...base,
    output: formatOutput(
      base,
      outputMode,
      layout
    ),
  };
}

function buildFromBinary(
  input: string,
  action: "decode" | "inspect",
  layout: BinaryLayout,
  outputMode: OutputMode
): Result {
  const bytes =
    parseBinaryBytes(input);
  let text = "";

  if (action === "decode") {
    text = decodeUtf8Strict(bytes);
  }

  const rows = rowsFor(bytes);
  const findings =
    findingsFor(action, bytes, text);
  const base: Omit<Result, "output"> = {
    action,
    bytes,
    text,
    rows,
    findings,
    asciiBytes: rows.filter(
      (row) => row.value < 128
    ).length,
    highBytes: rows.filter(
      (row) => row.value >= 128
    ).length,
    controlBytes: rows.filter(
      (row) =>
        row.value < 32 ||
        row.value === 127
    ).length,
    nulBytes: rows.filter(
      (row) => row.value === 0
    ).length,
    sourceBits: bytes.length * 8,
    codePoints:
      action === "decode"
        ? Array.from(text).length
        : 0,
  };

  return {
    ...base,
    output: formatOutput(
      base,
      outputMode,
      layout
    ),
  };
}

export default function ToolClient() {
  const [actionMode, setActionMode] =
    useState<ActionMode>("decode");
  const [input, setInput] = useState("");
  const [layout, setLayout] =
    useState<BinaryLayout>("spaced");
  const [outputMode, setOutputMode] =
    useState<OutputMode>("converted");
  const [result, setResult] =
    useState<Result | null>(null);
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const outputLabel = useMemo(() => {
    if (outputMode === "byte-table") {
      return "Byte inspection table";
    }
    if (outputMode === "json") return "JSON";
    if (outputMode === "csv") return "CSV";
    return actionMode === "encode"
      ? "Binary bytes"
      : actionMode === "decode"
      ? "Decoded UTF-8 text"
      : "Byte inspection table";
  }, [outputMode, actionMode]);

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    try {
      const next =
        actionMode === "encode"
          ? buildEncode(
              input,
              layout,
              outputMode
            )
          : buildFromBinary(
              input,
              actionMode,
              layout,
              outputMode
            );

      setResult(next);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to convert this binary data."
      );
    }
  };

  const loadBinary = () => {
    setActionMode("decode");
    setInput(SAMPLE_BINARY);
    setLayout("spaced");
    setOutputMode("converted");
    clear();
  };

  const loadText = () => {
    setActionMode("encode");
    setInput(SAMPLE_TEXT);
    setLayout("spaced");
    setOutputMode("converted");
    clear();
  };

  const reset = () => {
    setActionMode("decode");
    setInput("");
    setLayout("spaced");
    setOutputMode("converted");
    clear();
  };

  const copy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.output
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setError(
        "The output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Binary Encoder Decoder"
      description="Treat binary as bytes first and text second. Encode Unicode text to UTF-8, decode only valid UTF-8 from complete 8-bit bytes, or inspect arbitrary binary without forcing it through a text decoder."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <YoryantraSelect
          label="Operation"
          value={actionMode}
          onChange={(value: string) => {
            setActionMode(
              value as ActionMode
            );
            clear();
          }}
          options={[
            {
              label: "Binary bytes → UTF-8 text",
              value: "decode",
            },
            {
              label: "Text → UTF-8 binary bytes",
              value: "encode",
            },
            {
              label: "Inspect binary bytes only",
              value: "inspect",
            },
          ]}
        />

        <YoryantraSelect
          label="Binary layout when encoding"
          value={layout}
          onChange={(value: string) => {
            setLayout(
              value as BinaryLayout
            );
            clear();
          }}
          options={[
            {
              label: "Space-separated bytes",
              value: "spaced",
            },
            {
              label: "Continuous bits",
              value: "continuous",
            },
            {
              label: "0b-prefixed bytes",
              value: "prefixed",
            },
            {
              label: "One byte per line",
              value: "lines",
            },
          ]}
        />

        <YoryantraSelect
          label="Output"
          value={outputMode}
          onChange={(value: string) => {
            setOutputMode(
              value as OutputMode
            );
            clear();
          }}
          options={[
            {
              label: "Converted text / binary",
              value: "converted",
            },
            {
              label: "Byte inspection table",
              value: "byte-table",
            },
            {
              label: "JSON",
              value: "json",
            },
            {
              label: "CSV",
              value: "csv",
            },
          ]}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          {actionMode === "encode"
            ? "Text to encode"
            : "Binary bytes"}
        </label>
        <textarea
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            clear();
          }}
          rows={10}
          placeholder={
            actionMode === "encode"
              ? SAMPLE_TEXT
              : SAMPLE_BINARY
          }
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        {actionMode !== "encode" ? (
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Decode/inspect accepts 8-bit groups separated by spaces, commas,
            semicolons or line breaks; <code>0b01000001</code> tokens; or one
            continuous bit string whose length is a multiple of eight.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Text is encoded with the browser&apos;s UTF-8 TextEncoder after an
            explicit check for lone UTF-16 surrogates.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={run}
          className="yoryantra-btn"
        >
          {actionMode === "encode"
            ? "Encode Text"
            : actionMode === "decode"
            ? "Decode UTF-8"
            : "Inspect Bytes"}
        </button>
        <button
          type="button"
          onClick={loadBinary}
          className="yoryantra-btn-outline"
        >
          Binary Example
        </button>
        <button
          type="button"
          onClick={loadText}
          className="yoryantra-btn-outline"
        >
          Unicode Text Example
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat
              label="Bytes"
              value={String(
                result.bytes.length
              )}
            />
            <Stat
              label="Bits"
              value={String(
                result.sourceBits
              )}
            />
            <Stat
              label="ASCII bytes"
              value={String(
                result.asciiBytes
              )}
            />
            <Stat
              label="Bytes ≥ 128"
              value={String(
                result.highBytes
              )}
            />
            <Stat
              label={
                result.action ===
                "inspect"
                  ? "Control bytes"
                  : "Code points"
              }
              value={String(
                result.action ===
                  "inspect"
                  ? result.controlBytes
                  : result.codePoints
              )}
            />
          </div>

          {result.findings.length ? (
            <div className="mt-6 space-y-3">
              {result.findings.map(
                (finding, index) => (
                  <div
                    key={`${finding.title}-${index}`}
                    className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900"
                  >
                    <strong>
                      {finding.severity.toUpperCase()} ·{" "}
                      {finding.title}
                    </strong>
                    <p className="mt-1">
                      {finding.message}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {outputLabel}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Byte boundaries are never inferred from partial separated
                  groups.
                </p>
              </div>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Output"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[300px] max-h-[700px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output}
            </pre>
          </div>

          {outputMode !==
          "byte-table" ? (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3">
                      #
                    </th>
                    <th className="px-4 py-3">
                      Binary
                    </th>
                    <th className="px-4 py-3">
                      Hex
                    </th>
                    <th className="px-4 py-3">
                      Dec
                    </th>
                    <th className="px-4 py-3">
                      ASCII
                    </th>
                    <th className="px-4 py-3">
                      Byte role
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {result.rows
                    .slice(0, 256)
                    .map((row) => (
                      <tr key={row.index}>
                        <td className="px-4 py-2">
                          {row.index}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {row.binary}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {row.hex}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {row.decimal}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {row.ascii}
                        </td>
                        <td className="px-4 py-2">
                          {row.role}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Encoding, strict UTF-8 decoding and byte inspection run on the pasted
        data in your browser. The tool does not upload the text or byte
        sequence. Site-wide analytics or advertising scripts, if enabled, are
        separate from this conversion.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Binary Has No Character Encoding Until You Choose One
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>11110000 10011111 10011010 10000000</code> is four bytes.
            Under UTF-8 those bytes form 🚀. In a compressed file, encrypted
            payload or image, the same numbers would be interpreted by a
            completely different format.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That is why this page has a separate <strong>Inspect bytes</strong>
            operation. It lets you examine binary without first asserting that
            the bytes are text.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Complete Bytes Can Still Be Invalid UTF-8
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Eight bits always make a byte, but not every byte sequence makes a
            UTF-8 string. Bytes C0 and C1 cannot begin legal UTF-8 characters;
            F5–FF are also invalid as UTF-8 lead bytes; continuation bytes
            80–BF need an appropriate preceding lead byte.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Decode mode uses <code>TextDecoder("utf-8", {"{ fatal: true }"})</code>.
            Malformed input therefore produces an error instead of silently
            turning bad bytes into replacement characters and making the
            original data harder to diagnose.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            UTF-8 Keeps ASCII at One Byte and Expands the Rest
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <ExampleCard
              title="A"
              text="U+0041 → 41 hex → 01000001"
              note="1 UTF-8 byte"
            />
            <ExampleCard
              title="₹"
              text="U+20B9 → E2 82 B9"
              note="3 UTF-8 bytes"
            />
            <ExampleCard
              title="🚀"
              text="U+1F680 → F0 9F 9A 80"
              note="4 UTF-8 bytes"
            />
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            A “binary character” is therefore not a fixed eight-bit concept for
            Unicode text. The encoder converts the whole string to UTF-8 bytes
            first and only then prints every byte as eight binary digits.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Separated Bits Mean You Are Claiming Byte Boundaries
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If you paste <code>01000001 01000010</code>, the spaces say “these
            are two bytes.” A seven-bit or nine-bit token between separators
            is therefore rejected. With continuous input, the only requirement
            is that the total number of bits is divisible by eight.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            That strictness catches a common copy/paste error where one missing
            bit shifts every byte that follows.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Lone UTF-16 Surrogates Need Attention Before Encoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript strings use UTF-16 code units internally. Correct
            supplementary characters use a high/low surrogate pair, but broken
            programmatic strings can contain one half by itself. Browser
            TextEncoder converts lone surrogates to U+FFFD.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For a diagnostic converter that substitution is dangerous because
            it changes the data. This encoder detects the bad code-unit
            position first and returns that specific error instead of hiding it
            behind a generic encoding failure.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Byte Patterns Worth Recognizing During Debugging
          </h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Bytes</th>
                  <th className="px-4 py-3">Common meaning</th>
                  <th className="px-4 py-3">Why it matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 font-mono">00</td>
                  <td className="px-4 py-3">NUL</td>
                  <td className="px-4 py-3">
                    Invisible; can terminate strings in C-style APIs.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">0A</td>
                  <td className="px-4 py-3">LF</td>
                  <td className="px-4 py-3">
                    Unix-style line feed.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">0D 0A</td>
                  <td className="px-4 py-3">CRLF</td>
                  <td className="px-4 py-3">
                    Common network/Windows line ending.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">EF BB BF</td>
                  <td className="px-4 py-3">UTF-8 BOM</td>
                  <td className="px-4 py-3">
                    Can be harmless or surprise parsers expecting content at
                    byte zero.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Do Not Use a Text Decoder for Files Just Because They Are Bytes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            PNG, ZIP, gzip, encrypted ciphertext, hashes and most protocol
            frames are byte sequences but not UTF-8 strings. Forcing them
            through text decoding can fail—or worse, appear to work after
            replacement characters destroy the original values.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use Inspect mode for byte-oriented investigation. Decode mode is
            intentionally reserved for the stronger claim: “these bytes should
            be valid UTF-8 text.”
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          The browser APIs used by this tool follow the{" "}
          <a
            href="https://encoding.spec.whatwg.org/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[var(--green)] underline underline-offset-4"
          >
            WHATWG Encoding Standard
          </a>
          , including UTF-8 encoding and fatal decoding behavior.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/binary-encoder-decoder" />
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
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function ExampleCard({
  title,
  text,
  note,
}: {
  title: string;
  text: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xl font-semibold text-gray-900">{title}</div>
      <div className="mt-2 font-mono text-sm text-gray-700">{text}</div>
      <div className="mt-2 text-xs font-medium text-gray-500">{note}</div>
    </div>
  );
}
