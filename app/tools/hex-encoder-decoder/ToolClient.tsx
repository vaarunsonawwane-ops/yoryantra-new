"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Operation = "encode" | "decode";

type HexResult = {
  operation: Operation;
  byteCount: number;
  textCodePoints: number;
};

type ParsedHex =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; error: string };

function bytesToSpacedHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(" ");
}

function parseHexBytes(raw: string): ParsedHex {
  const input = raw.trim();

  if (!input) {
    return { ok: false, error: "Enter hexadecimal bytes to decode." };
  }

  let compact = "";

  if (/^(?:\\x[0-9a-fA-F]{2}(?:\s*)?)+$/.test(input)) {
    compact = input.replace(/\\x/gi, "").replace(/\s+/g, "");
  } else if (/^(?:0x[0-9a-fA-F]{2}(?:[\s:-]+|$))+$/.test(input)) {
    compact = input.replace(/0x/gi, "").replace(/[\s:-]+/g, "");
  } else if (/^0x[0-9a-fA-F]+$/i.test(input)) {
    compact = input.slice(2);
  } else {
    if (/[^0-9a-fA-F\s:-]/.test(input)) {
      return {
        ok: false,
        error:
          "Hex input may contain 0-9, A-F, spaces, colons, or hyphens. 0xHH and \\xHH byte notation are also accepted.",
      };
    }

    compact = input.replace(/[\s:-]+/g, "");
  }

  if (!compact) {
    return { ok: false, error: "Enter at least one hexadecimal byte." };
  }

  if (compact.length % 2 !== 0) {
    return {
      ok: false,
      error: "Hex input needs two hexadecimal digits per byte; the current value has an odd digit count.",
    };
  }

  const values = compact.match(/.{2}/g);
  if (!values) {
    return { ok: false, error: "No complete hexadecimal bytes were found." };
  }

  return {
    ok: true,
    bytes: new Uint8Array(values.map((value) => Number.parseInt(value, 16))),
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<HexResult | null>(null);

  const clearResult = () => {
    setOutput("");
    setError("");
    setCopied(false);
    setResult(null);
  };

  const encodeHex = () => {
    if (input.length === 0) {
      setError("Enter text to encode as UTF-8 bytes.");
      setOutput("");
      setResult(null);
      return;
    }

    const bytes = new TextEncoder().encode(input);
    const encoded = bytesToSpacedHex(bytes);

    setOutput(encoded);
    setError("");
    setCopied(false);
    setResult({
      operation: "encode",
      byteCount: bytes.length,
      textCodePoints: Array.from(input).length,
    });
  };

  const decodeHex = () => {
    const parsed = parseHexBytes(input);

    if (!parsed.ok) {
      setError(parsed.error);
      setOutput("");
      setResult(null);
      return;
    }

    try {
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(parsed.bytes);
      setOutput(decoded);
      setError("");
      setCopied(false);
      setResult({
        operation: "decode",
        byteCount: parsed.bytes.length,
        textCodePoints: Array.from(decoded).length,
      });
    } catch {
      setError(
        "The hexadecimal bytes are valid, but they are not a valid UTF-8 text sequence. Hex can represent arbitrary binary data; this decoder intentionally returns text only for valid UTF-8.",
      );
      setOutput("");
      setResult(null);
    }
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError("Clipboard access was blocked. Select and copy the output manually.");
    }
  };

  const loadExample = () => {
    setInput("59 6f 72 79 61 6e 74 72 61 20 e2 9c 93");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  return (
    <ToolShell
      title="Hex Encoder Decoder"
      description="Encode UTF-8 text as hexadecimal bytes and decode valid UTF-8 hex without silent replacement."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Text or Hexadecimal Bytes
        </label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          rows={7}
          placeholder="Example: 59 6f 72 79 61 6e 74 72 61 20 e2 9c 93"
          className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Decode accepts compact hex, spaced bytes, colon or hyphen separators, a single 0x prefix,
          repeated 0xHH bytes, and \\xHH byte notation.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={decodeHex}
          className="yoryantra-btn min-h-[44px] whitespace-nowrap"
        >
          Decode Hex
        </button>
        <button
          type="button"
          onClick={encodeHex}
          className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap"
        >
          Encode to Hex
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Output</h3>
            <p className="mt-1 text-sm text-gray-500">
              {result
                ? `${result.byteCount.toLocaleString()} byte${result.byteCount === 1 ? "" : "s"} · ${result.operation === "encode" ? "UTF-8 → hex" : "hex → UTF-8"}`
                : "Encoded hex or decoded UTF-8 text will appear below."}
            </p>
          </div>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!result}
            className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy Output"}
          </button>
        </div>

        <pre className="mt-4 min-h-[180px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
          {result ? output || "(empty UTF-8 string)" : "Encoded or decoded output will appear here."}
        </pre>

        {result ? (
          <p className="mt-3 text-xs leading-5 text-gray-500">
            Text side: {result.textCodePoints.toLocaleString()} Unicode code point{result.textCodePoints === 1 ? "" : "s"}.
            Byte count can differ from code-point count, and user-perceived characters can contain multiple code points.
          </p>
        ) : null}
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Hex is a notation for bytes; readable text still needs an encoding
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            One hexadecimal digit represents four bits, so two hex digits describe one byte from
            00 through ff. That byte does not inherently mean a letter. The meaning appears only
            when software interprets the byte sequence using an encoding. Encoding and decoding here both use UTF-8: text is first encoded to UTF-8 bytes, and decoded hex must form a valid
            UTF-8 byte sequence before it is shown as text.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That distinction matters when you inspect network payloads, log dumps, file signatures,
            database blobs, or debugger memory. Hex can faithfully represent arbitrary bytes, while
            only some byte sequences are text. A PNG header, compressed buffer, encrypted payload,
            or random binary value should not be expected to decode into meaningful UTF-8.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Watch the bytes grow beyond ASCII
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            ASCII characters occupy one byte in UTF-8, while other code points use multi-byte
            sequences. Reading the groups as bytes makes the difference visible:
          </p>
          <pre className="mt-5 overflow-x-auto rounded-xl bg-gray-950 p-5 text-sm leading-7 text-gray-100">{`A      U+0041   → 41
é      U+00E9   → c3 a9
✓      U+2713   → e2 9c 93
😀     U+1F600  → f0 9f 98 80`}</pre>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            The spaces in encoded output are presentation separators only. Removing them leaves the
            same byte sequence: <code className="rounded bg-gray-100 px-1.5 py-0.5">c3a9</code> and
            <code className="ml-1 rounded bg-gray-100 px-1.5 py-0.5">c3 a9</code> describe the same two bytes.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Valid hex and valid UTF-8 are two separate checks
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            <code className="rounded bg-white px-1.5 py-0.5">ff</code> is perfectly valid hexadecimal,
            but a lone ff byte is not valid UTF-8 text. A replacement-mode decoder could silently
            show U+FFFD instead, hiding the fact that the original bytes did not decode cleanly.
            Decoding uses the browser&apos;s UTF-8 <code className="rounded bg-white px-1.5 py-0.5">TextDecoder</code>
            in fatal mode so malformed UTF-8 becomes an explicit error rather than altered output.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Encoding behavior: {" "}
            <a
              href="https://encoding.spec.whatwg.org/#interface-textdecoder"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              WHATWG Encoding Standard — TextDecoder
            </a>
            .
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Two strings can look identical and still produce different hex
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Unicode allows some visible text to be represented by more than one sequence of code
            points. For example, composed <strong>é</strong> (U+00E9) becomes
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">c3 a9</code> in UTF-8, while
            <strong>e</strong> followed by COMBINING ACUTE ACCENT (U+0065 U+0301) becomes
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">65 cc 81</code>. They can render the
            same, but byte comparisons, signatures, hashes, cache keys, and protocol fields can see
            different data.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            The encoder does not normalize your text before converting it. When a system requires a
            normalization form, apply that rule explicitly and consistently. See {" "}
            <a
              href="https://www.unicode.org/reports/tr15/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Unicode Standard Annex #15 — Normalization Forms
            </a>
            .
          </p>
        </div>

        <div className="mt-10 self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Hex is not encryption or redaction</h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            Hex only changes how bytes are written. Anyone can reverse it without a key. Converting
            an API token, password, session value, or private payload to hex does not protect the
            underlying data, and decoding an unfamiliar dump may reveal sensitive text. Treat the
            output with the same confidentiality as the original bytes.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/hex-encoder-decoder" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
