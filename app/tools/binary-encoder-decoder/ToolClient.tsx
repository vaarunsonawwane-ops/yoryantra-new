"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type BinaryLayout = "spaced" | "continuous" | "prefixed";

type Diagnostics = {
  mode: "encode" | "decode";
  bytes: number;
  asciiBytes: number;
  nonAsciiBytes: number;
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [layout, setLayout] = useState<BinaryLayout>("spaced");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [copied, setCopied] = useState(false);

  const layoutLabel = useMemo(() => {
    if (layout === "continuous") return "continuous bits";
    if (layout === "prefixed") return "0b-prefixed bytes";
    return "space-separated bytes";
  }, [layout]);

  const clearResult = () => {
    setOutput("");
    setError("");
    setDiagnostics(null);
    setCopied(false);
  };

  const encodeBinary = () => {
    if (input.length === 0) {
      setError("Please enter text to encode.");
      setOutput("");
      setDiagnostics(null);
      return;
    }

    try {
      const invalidSurrogate = findUnpairedSurrogate(input);
      if (invalidSurrogate !== -1) {
        throw new Error(
          `Input contains an unpaired UTF-16 surrogate at code-unit position ${invalidSurrogate + 1}. Repair the text before UTF-8 encoding so it is not silently replaced with U+FFFD.`,
        );
      }

      const bytes = new TextEncoder().encode(input);
      const groups = Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0"));

      setOutput(formatBinaryGroups(groups, layout));
      setDiagnostics(buildDiagnostics("encode", bytes));
      setError("");
      setCopied(false);
    } catch {
      setError("Unable to encode this text as UTF-8 binary bytes.");
      setOutput("");
      setDiagnostics(null);
    }
  };

  const decodeBinary = () => {
    if (!input.trim()) {
      setError("Please enter binary bytes to decode.");
      setOutput("");
      setDiagnostics(null);
      return;
    }

    try {
      const bytes = parseBinaryBytes(input);
      const decoder = new TextDecoder("utf-8", { fatal: true });
      const decoded = decoder.decode(bytes);

      setOutput(decoded);
      setDiagnostics(buildDiagnostics("decode", bytes));
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to decode this binary input.");
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

  const loadExample = () => {
    setInput("01011001 01101111 01110010 01111001 01100001 01101110 01110100 01110010 01100001");
    setLayout("spaced");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setLayout("spaced");
    clearResult();
  };

  return (
    <ToolShell
      title="Binary Encoder Decoder"
      description="Convert UTF-8 text to 8-bit binary bytes, or decode grouped and continuous binary bytes back into text with strict UTF-8 validation."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text or Binary Bytes
        </label>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          rows={7}
          placeholder="Example: 01011001 01101111 01110010 01111001"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Decoding accepts 8-bit groups separated by spaces, commas, or line breaks; 0b-prefixed 8-bit bytes; and one continuous bit string whose length is a multiple of 8. Separators are treated as byte boundaries.
        </p>
      </div>

      <div className="mt-6 max-w-md">
        <YoryantraSelect
          label="Encoded binary layout"
          value={layout}
          onChange={(value: string) => {
            setLayout(value as BinaryLayout);
            clearResult();
          }}
          options={[
            { label: "Space-separated bytes", value: "spaced" },
            { label: "Continuous bits", value: "continuous" },
            { label: "0b-prefixed bytes", value: "prefixed" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={decodeBinary} className="yoryantra-btn">
          Decode Binary
        </button>
        <button onClick={encodeBinary} className="yoryantra-btn-outline">
          Encode Text
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
          <SummaryCard label="Mode" value={diagnostics.mode === "encode" ? "Text → UTF-8 bytes" : "UTF-8 bytes → Text"} />
          <SummaryCard label="Bytes" value={String(diagnostics.bytes)} />
          <SummaryCard label="Bytes ≥ 128" value={String(diagnostics.nonAsciiBytes)} />
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Converted Output</h3>
          {diagnostics?.mode === "encode" && (
            <span className="text-xs text-gray-500">Layout: {layoutLabel}</span>
          )}
        </div>

        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Binary conversion output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Encoding and decoding happen in your browser. This tool does not send your text or byte sequence to a server.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">The Binary Output Represents UTF-8 Bytes</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A binary string such as 01000001 is just one byte written with 0s and 1s. For ASCII text, one character often maps to one byte. For modern Unicode text, UTF-8 may use two, three, or four bytes for a single character.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That is why an emoji produces several 8-bit groups rather than one oversized “binary character.” The encoder first turns the text into UTF-8 bytes, then prints each byte in binary.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Grouped and Continuous Input</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <p><strong>Grouped:</strong> 01001000 01101001 → Hi</p>
            <p><strong>Continuous:</strong> 0100100001101001 → Hi</p>
            <p><strong>Prefixed:</strong> 0b01001000 0b01101001 → Hi</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Valid Bytes Are Not Always Valid UTF-8 Text</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A sequence can be perfectly valid as raw bytes and still be invalid UTF-8. For example, FF is a byte value but cannot start a valid UTF-8 character. This decoder uses strict UTF-8 validation instead of silently replacing bad input with the replacement character �.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you are inspecting arbitrary binary data such as compressed files, images, encrypted data, or protocol frames, use a hex or byte-oriented tool instead of assuming the bytes are text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The browser TextEncoder API accepts Unicode scalar-value text. A lone UTF-16 surrogate is not a valid Unicode scalar value, so this tool reports it instead of allowing the browser conversion step to silently substitute U+FFFD before encoding.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Whitespace Is Data When Encoding Text</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Spaces, tabs, and line breaks all have UTF-8 byte values, so the encoder preserves them. A text input containing only spaces is still meaningful data and is encoded rather than treated as empty.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">UTF-8 Reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The browser TextEncoder and TextDecoder behavior used here follows the Encoding Standard, including fatal decoding when a byte sequence is not valid UTF-8.
          </p>
          <a
            href="https://encoding.spec.whatwg.org/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--green)] underline underline-offset-4"
          >
            WHATWG Encoding Standard
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/binary-encoder-decoder" />
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

function formatBinaryGroups(groups: string[], layout: BinaryLayout) {
  if (layout === "continuous") return groups.join("");
  if (layout === "prefixed") return groups.map((group) => `0b${group}`).join(" ");
  return groups.join(" ");
}

function parseBinaryBytes(input: string) {
  const trimmed = input.trim();

  if (/0b/i.test(trimmed)) {
    const tokens = trimmed.split(/[\s,]+/).filter(Boolean);

    if (tokens.some((token) => !/^0b[01]{8}$/i.test(token))) {
      throw new Error("When 0b prefixes are used, each byte must look like 0b01000001 and contain exactly 8 bits.");
    }

    return validateUtf8Bytes(new Uint8Array(tokens.map((token) => Number.parseInt(token.slice(2), 2))));
  }

  if (/[^01\s,]/.test(trimmed)) {
    throw new Error("Binary input can contain only 0, 1, whitespace, commas, or 0b-prefixed 8-bit bytes.");
  }

  const hasSeparators = /[\s,]/.test(trimmed);
  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);

  if (tokens.length === 0) {
    throw new Error("Please enter binary bytes to decode.");
  }

  if (hasSeparators && tokens.length > 1) {
    if (tokens.some((token) => !/^[01]{8}$/.test(token))) {
      throw new Error("When spaces, commas, or line breaks separate values, each binary byte must contain exactly 8 bits. Remove the separators to use one continuous bit string.");
    }
    return validateUtf8Bytes(new Uint8Array(tokens.map((token) => Number.parseInt(token, 2))));
  }

  const compact = tokens.join("");
  if (compact.length % 8 !== 0) {
    throw new Error(`The continuous binary input contains ${compact.length} bits. UTF-8 decoding requires complete 8-bit bytes.`);
  }

  const values: number[] = [];
  for (let index = 0; index < compact.length; index += 8) {
    values.push(Number.parseInt(compact.slice(index, index + 8), 2));
  }

  return validateUtf8Bytes(new Uint8Array(values));
}

function validateUtf8Bytes(bytes: Uint8Array) {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    const hex = Array.from(bytes, (byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join(" ");
    throw new Error(`These are complete bytes, but they are not valid UTF-8 text. Byte sequence: ${hex}.`);
  }
  return bytes;
}

function findUnpairedSurrogate(input: string) {
  for (let index = 0; index < input.length; index += 1) {
    const codeUnit = input.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = index + 1 < input.length ? input.charCodeAt(index + 1) : -1;
      if (next < 0xdc00 || next > 0xdfff) return index;
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return index;
    }
  }
  return -1;
}

function buildDiagnostics(mode: Diagnostics["mode"], bytes: Uint8Array): Diagnostics {
  const asciiBytes = Array.from(bytes).filter((byte) => byte < 128).length;
  return {
    mode,
    bytes: bytes.length,
    asciiBytes,
    nonAsciiBytes: bytes.length - asciiBytes,
  };
}
