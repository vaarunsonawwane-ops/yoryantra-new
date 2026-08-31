"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type DecodeMode = "strict" | "relaxed";
type DecodeView = "utf8" | "hex";

type DecodeResult = {
  base64: string;
  text: string | null;
  hex: string;
  byteCount: number;
  canonical: boolean;
  normalizedInput: string;
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [decodeMode, setDecodeMode] = useState<DecodeMode>("strict");
  const [decodeView, setDecodeView] = useState<DecodeView>("utf8");
  const [details, setDetails] = useState<DecodeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setOutput("");
    setError("");
    setDetails(null);
    setCopied(false);
  };

  const encodeText = () => {
    if (!input.length) {
      setError("Enter text before encoding.");
      setOutput("");
      setDetails(null);
      return;
    }

    const bytes = new TextEncoder().encode(input);
    const encoded = bytesToBase64(bytes);
    setOutput(encoded);
    setDetails({
      base64: encoded,
      text: input,
      hex: bytesToHex(bytes),
      byteCount: bytes.length,
      canonical: true,
      normalizedInput: encoded,
    });
    setError("");
    setCopied(false);
  };

  const decodeBase64 = () => {
    if (!input.trim()) {
      setError("Enter Base64 before decoding.");
      setOutput("");
      setDetails(null);
      return;
    }

    try {
      const decoded = decodeBase64Input(input, decodeMode);
      const text = decodeUtf8(decoded.bytes);
      const nextOutput = decodeView === "hex"
        ? bytesToHex(decoded.bytes)
        : text ?? "[Decoded bytes are not valid UTF-8. Switch output to Hex bytes.]";

      setOutput(nextOutput);
      setDetails({
        base64: decoded.canonicalBase64,
        text,
        hex: bytesToHex(decoded.bytes),
        byteCount: decoded.bytes.length,
        canonical: decoded.canonical,
        normalizedInput: decoded.normalizedInput,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setOutput("");
      setDetails(null);
      setError(caught instanceof Error ? caught.message : "Invalid Base64 input.");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
  };

  const resetAll = () => {
    setInput("");
    setDecodeMode("strict");
    setDecodeView("utf8");
    clearResult();
  };

  return (
    <ToolShell
      title="Base64 Encoder Decoder"
      description="Encode UTF-8 text as RFC 4648 Base64, or decode Base64 into UTF-8 text or hexadecimal bytes with strict and relaxed validation modes."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Input</label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder="Enter Unicode text to encode, or Base64 to decode..."
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <YoryantraSelect
          label="Decode validation"
          value={decodeMode}
          onChange={(value) => {
            setDecodeMode(value as DecodeMode);
            clearResult();
          }}
          options={[
            { label: "Strict RFC 4648", value: "strict" },
            { label: "Relaxed: whitespace / missing padding", value: "relaxed" },
          ]}
        />
        <YoryantraSelect
          label="Decoded output"
          value={decodeView}
          onChange={(value) => {
            setDecodeView(value as DecodeView);
            clearResult();
          }}
          options={[
            { label: "UTF-8 text", value: "utf8" },
            { label: "Hex bytes", value: "hex" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={encodeText} className="yoryantra-btn">Encode UTF-8</button>
        <button type="button" onClick={decodeBase64} className="yoryantra-btn-outline">Decode Base64</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      ) : null}

      {output ? (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Output</h3>
              {details ? (
                <p className="mt-1 text-sm text-gray-500">
                  {details.byteCount.toLocaleString()} decoded byte{details.byteCount === 1 ? "" : "s"}
                  {details.text === null ? " · not valid UTF-8" : " · valid UTF-8"}
                </p>
              ) : null}
            </div>
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>
          </div>
          <pre className="yoryantra-output mt-3 min-h-[180px] overflow-auto whitespace-pre-wrap break-all text-sm font-mono">{output}</pre>

          {details && !details.canonical ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              The input decoded successfully in relaxed mode, but it was not the canonical padded Base64 spelling. Canonical form: <code>{details.base64}</code>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">UTF-8 text is converted to bytes first</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Browser <code>btoa()</code> works on byte-like Latin-1 strings, which can fail on normal Unicode text such as Marathi, Hindi, emoji, or many accented characters. This tool uses UTF-8 bytes before Base64 encoding, so Unicode text is handled predictably.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Strict and relaxed decoding</h2>
          <div className="mt-3 space-y-3 text-gray-600 leading-relaxed">
            <p>
              Strict mode expects the standard Base64 alphabet, correct end padding, and no unrelated characters. Relaxed mode is useful for copied data that contains ASCII whitespace or omits trailing padding; it normalizes that input before decoding.
            </p>
            <p>
              Base64 represents arbitrary bytes. Those bytes are not guaranteed to be UTF-8 text, so the hex view is available when a decoded file fragment or binary value cannot be displayed as text.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <strong>Not encryption:</strong> Base64 is a reversible encoding for bytes. It does not provide confidentiality, hashing, signing, or authentication.
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            The standard Base64 alphabet, padding rules, and canonical form are defined by <a className="underline" href="https://www.rfc-editor.org/rfc/rfc4648" target="_blank" rel="noreferrer">RFC 4648</a>. Base64URL uses a different alphabet and should be handled with the dedicated Base64URL tool.
          </p>
        </div>

        <YoryantraRelatedTools currentHref="/tools/base64-encoder-decoder" />
      </section>
    </ToolShell>
  );
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    binary += String.fromCharCode(...Array.from(chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function decodeBase64Input(input: string, mode: DecodeMode) {
  const asciiWhitespace = /[\t\n\f\r ]/g;
  const compact = mode === "relaxed" ? input.replace(asciiWhitespace, "") : input;

  if (!compact) throw new Error("Base64 input is empty after normalization.");
  if (/[^A-Za-z0-9+/=]/.test(compact)) throw new Error("Input contains characters outside the standard Base64 alphabet.");
  if (/=[^=]/.test(compact) || /={3,}$/.test(compact)) throw new Error("Padding '=' may appear only at the end, with at most two padding characters.");

  let normalized = compact;
  if (mode === "strict") {
    if (compact.length % 4 !== 0) throw new Error("Strict Base64 length must be a multiple of 4, including required padding.");
  } else {
    const remainder = compact.length % 4;
    if (remainder === 1) throw new Error("This Base64 length cannot be repaired by adding padding.");
    if (remainder) normalized += "=".repeat(4 - remainder);
  }

  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
    throw new Error("Invalid Base64 grouping or padding.");
  }

  const bytes = base64ToBytes(normalized);
  const canonicalBase64 = bytesToBase64(bytes);
  const canonical = canonicalBase64 === compact;
  if (mode === "strict" && !canonical) throw new Error("Base64 decodes, but its non-zero pad bits are not in canonical RFC 4648 form.");

  return { bytes, canonicalBase64, canonical, normalizedInput: normalized };
}

function decodeUtf8(bytes: Uint8Array) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(" ");
}
