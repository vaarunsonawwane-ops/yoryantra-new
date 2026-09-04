"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type DecodeMode = "strict" | "relaxed";
type DecodeView = "utf8" | "hex";

type DecodeResult = {
  canonicalBase64: string;
  text: string | null;
  hex: string;
  byteCount: number;
  canonical: boolean;
  normalizedInput: string;
  notes: string[];
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (
    let offset = 0;
    offset < bytes.length;
    offset += chunkSize
  ) {
    const chunk = bytes.subarray(
      offset,
      Math.min(offset + chunkSize, bytes.length)
    );

    binary += String.fromCharCode.apply(
      null,
      Array.from(chunk)
    );
  }

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) =>
    value.toString(16).padStart(2, "0")
  ).join(" ");
}

function decodeUtf8(bytes: Uint8Array) {
  try {
    return new TextDecoder("utf-8", {
      fatal: true,
    }).decode(bytes);
  } catch {
    return null;
  }
}

function base64ErrorHint(input: string) {
  const trimmed = input.trim();

  if (/^data:[^,]*;base64,/i.test(trimmed)) {
    return "This looks like a data URL. Remove the data:...;base64, prefix and decode only the Base64 payload.";
  }

  if (/[-_]/.test(trimmed)) {
    return "The input contains - or _, which suggests the Base64URL alphabet. Standard Base64 uses + and /. Use Yoryantra's Base64URL tool for URL-safe data.";
  }

  return "";
}

function decodeBase64Input(
  input: string,
  mode: DecodeMode
): DecodeResult {
  const hint = base64ErrorHint(input);

  if (hint) {
    throw new Error(hint);
  }

  const asciiWhitespace = /[\t\n\f\r ]/g;
  const hasWhitespace = asciiWhitespace.test(input);

  asciiWhitespace.lastIndex = 0;

  if (mode === "strict" && hasWhitespace) {
    throw new Error(
      "Strict mode does not accept whitespace inside Base64. Switch to relaxed mode if the value was wrapped across lines or copied with spaces."
    );
  }

  const compact =
    mode === "relaxed"
      ? input.replace(asciiWhitespace, "")
      : input;

  if (!compact) {
    throw new Error(
      "Base64 input is empty after normalization."
    );
  }

  if (/[^A-Za-z0-9+/=]/.test(compact)) {
    throw new Error(
      "Input contains characters outside the standard Base64 alphabet."
    );
  }

  if (/=[^=]/.test(compact) || /={3,}$/.test(compact)) {
    throw new Error(
      "Padding = may appear only at the end, with at most two padding characters."
    );
  }

  let normalized = compact;

  if (mode === "strict") {
    if (compact.length % 4 !== 0) {
      throw new Error(
        "Strict standard Base64 length must be a multiple of 4, including required padding."
      );
    }
  } else {
    const remainder = compact.length % 4;

    if (remainder === 1) {
      throw new Error(
        "This Base64 length cannot be repaired by adding standard padding."
      );
    }

    if (remainder) {
      normalized += "=".repeat(4 - remainder);
    }
  }

  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      normalized
    )
  ) {
    throw new Error(
      "Invalid Base64 grouping or padding."
    );
  }

  const bytes = base64ToBytes(normalized);
  const canonicalBase64 = bytesToBase64(bytes);
  const canonical = canonicalBase64 === compact;
  const notes: string[] = [];

  if (mode === "strict" && !canonical) {
    throw new Error(
      "The text decodes, but its pad bits are not in canonical RFC 4648 form."
    );
  }

  if (mode === "relaxed" && /\s/.test(input)) {
    notes.push(
      "ASCII whitespace was removed before decoding."
    );
  }

  if (
    mode === "relaxed" &&
    normalized !== compact
  ) {
    notes.push(
      "Missing trailing = padding was restored before decoding."
    );
  }

  if (!canonical) {
    notes.push(
      `Canonical standard Base64 spelling: ${canonicalBase64}`
    );
  }

  const text = decodeUtf8(bytes);

  if (text === null) {
    notes.push(
      "The decoded bytes are not valid UTF-8 text. Use the hex view when the payload is binary or uses another character encoding."
    );
  }

  return {
    canonicalBase64,
    text,
    hex: bytesToHex(bytes),
    byteCount: bytes.length,
    canonical,
    normalizedInput: normalized,
    notes,
  };
}

function estimatedBase64Length(byteCount: number) {
  return 4 * Math.ceil(byteCount / 3);
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [decodeMode, setDecodeMode] =
    useState<DecodeMode>("strict");
  const [decodeView, setDecodeView] =
    useState<DecodeView>("utf8");
  const [details, setDetails] =
    useState<DecodeResult | null>(null);
  const [encodedBytes, setEncodedBytes] =
    useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setOutput("");
    setError("");
    setDetails(null);
    setEncodedBytes(null);
    setCopied(false);
  };

  const encodeText = () => {
    if (!input.length) {
      setError("Enter text before encoding.");
      setOutput("");
      setDetails(null);
      setEncodedBytes(null);
      return;
    }

    const bytes = new TextEncoder().encode(input);
    const encoded = bytesToBase64(bytes);

    setOutput(encoded);
    setEncodedBytes(bytes.length);
    setDetails(null);
    setError("");
    setCopied(false);
  };

  const decodeBase64 = () => {
    if (!input.trim()) {
      setError("Enter Base64 before decoding.");
      setOutput("");
      setDetails(null);
      setEncodedBytes(null);
      return;
    }

    try {
      const decoded = decodeBase64Input(
        input,
        decodeMode
      );

      const nextOutput =
        decodeView === "hex"
          ? decoded.hex
          : decoded.text === null
          ? "[Decoded bytes are not valid UTF-8. Switch output to Hex bytes.]"
          : decoded.text;

      setOutput(nextOutput);
      setDetails(decoded);
      setEncodedBytes(null);
      setError("");
      setCopied(false);
    } catch (caught) {
      setOutput("");
      setDetails(null);
      setEncodedBytes(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Invalid Base64 input."
      );
    }
  };

  const loadUtf8Example = () => {
    setInput("Sneha • नमस्ते • पुणे");
    clearResult();
  };

  const loadBase64Example = () => {
    setInput(
      "U25laGEg4oCiIOCkqOCkruCkuOCljeCkpOClhyDigKIg4KSq4KWB4KSj4KWH"
    );
    setDecodeMode("strict");
    setDecodeView("utf8");
    setOutput("");
    setError("");
    setDetails(null);
    setEncodedBytes(null);
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError(
        "The output could not be copied. Select and copy it manually."
      );
      setCopied(false);
    }
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
      description="Encode UTF-8 text to standard Base64, or inspect decoded bytes as text or hex."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Input
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Enter text to encode or a standard RFC 4648 Base64 value to decode.
        </p>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder="Enter Unicode text, or paste standard Base64..."
          spellCheck={false}
          className="mt-4 w-full min-h-[260px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Decode validation
          </label>
          <select
            value={decodeMode}
            onChange={(event: { target: { value: string } }) => {
              setDecodeMode(
                event.target.value as DecodeMode
              );
              clearResult();
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm"
          >
            <option value="strict">
              Strict standard Base64
            </option>
            <option value="relaxed">
              Relaxed: whitespace / missing padding
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Decoded output
          </label>
          <select
            value={decodeView}
            onChange={(event: { target: { value: string } }) => {
              setDecodeView(
                event.target.value as DecodeView
              );
              clearResult();
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm"
          >
            <option value="utf8">UTF-8 text</option>
            <option value="hex">Hex bytes</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={encodeText}
          className="yoryantra-btn"
        >
          Encode UTF-8
        </button>
        <button
          type="button"
          onClick={decodeBase64}
          className="yoryantra-btn-outline"
        >
          Decode Base64
        </button>
        <button
          type="button"
          onClick={loadUtf8Example}
          className="yoryantra-btn-outline"
        >
          Load UTF-8 Example
        </button>
        <button
          type="button"
          onClick={loadBase64Example}
          className="yoryantra-btn-outline"
        >
          Load Base64 Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Output
            </h3>
            {details ? (
              <p className="mt-1 text-sm text-gray-500">
                {details.byteCount.toLocaleString()} decoded byte
                {details.byteCount === 1 ? "" : "s"}
                {details.text === null
                  ? " · not valid UTF-8"
                  : " · valid UTF-8"}
              </p>
            ) : encodedBytes !== null ? (
              <p className="mt-1 text-sm text-gray-500">
                {encodedBytes.toLocaleString()} UTF-8 byte
                {encodedBytes === 1 ? "" : "s"} →{" "}
                {estimatedBase64Length(
                  encodedBytes
                ).toLocaleString()} Base64 characters
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Encoded or decoded data will appear here.
              </p>
            )}
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {output ||
            "Use Encode UTF-8 or Decode Base64 to produce output."}
        </pre>

        {details && details.notes.length ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <ul className="list-disc space-y-1 pl-5">
              {details.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Encoding and decoding run in browser memory; no Base64 API request is
        made with the supplied value. Site-wide analytics or advertising scripts,
        if enabled, are separate from the conversion itself.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Base64 Is a Way to Carry Bytes Through Text-Only Places
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Base64 is useful when a system needs binary data expressed with a
            small ASCII alphabet. Three input bytes are represented as four
            Base64 characters, so the encoded form is larger than the original
            bytes. The tradeoff is that the result travels conveniently through
            formats and protocols that are designed around text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That makes Base64 common in data URLs, certificates, MIME content,
            API fields, small embedded assets, and serialized binary values. It
            does not make the underlying data secret.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode Text Must Become Bytes Before It Can Become Base64
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Base64 encodes bytes, not JavaScript characters. Text such as{" "}
            <code>Sneha • नमस्ते • पुणे</code> is first encoded as UTF-8 bytes
            and those bytes are then converted to Base64. This is why calling
            browser <code>btoa()</code> directly on arbitrary Unicode text can
            fail or produce the wrong mental model.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Decoding reverses the byte step. If those bytes are valid UTF-8,
            the UTF-8 view can display text. If they are an image fragment,
            compressed data, encrypted bytes, or another character encoding,
            the hex view is more honest than replacement characters pretending
            to be readable text.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Why = Appears at the End
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Base64 processes input in three-byte groups and writes four encoded
            characters. When the final group contains only one or two bytes,
            padding with <code>=</code> completes the standard four-character
            output quantum. Standard RFC 4648 Base64 normally includes that
            padding unless the surrounding protocol explicitly says it can be
            omitted.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Relaxed mode is intentionally narrow: it can remove ASCII whitespace
            and restore missing end padding. It does not accept arbitrary junk
            characters or silently reinterpret another Base64 alphabet.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-900">
              Base64 is not encryption
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-red-900/90">
              Anyone who has the encoded value can normally decode it. Do not
              use Base64 to protect passwords, tokens, private keys, customer
              data, or other secrets.
            </p>
          </div>

          <div className="self-start rounded-xl border border-yellow-200 bg-yellow-50 p-5">
            <h3 className="font-semibold text-yellow-900">
              Encoded secrets are still secrets
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-yellow-900/90">
              A Base64-looking API credential or session value is not safer to
              paste into logs, screenshots, tickets, or public chats simply
              because it is unreadable at a glance.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Standard Base64 and Base64URL Are Related but Not Interchangeable
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Standard Base64 uses <code>+</code> and <code>/</code>. Base64URL
            replaces those characters with <code>-</code> and <code>_</code>
            because the standard alphabet is inconvenient in URLs and
            filenames. Base64URL also commonly omits padding when the protocol
            makes the data length clear.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 4648 explicitly treats Base64URL as a distinct encoding
            alphabet. This page therefore reports URL-safe characters instead
            of quietly converting them. Use the dedicated Base64URL converter
            when the input comes from JWTs, URL tokens, or another URL-safe
            format.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Canonical Form Matters When Encoded Text Is Compared or Signed
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The unused pad bits at the end of an encoding should be zero. If
            they are not, two different Base64 strings can decode to the same
            bytes. Strict mode re-encodes the decoded bytes and rejects a
            non-canonical spelling, which is useful when encoded values are
            compared literally, cached, hashed, or used inside signed data.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 4648 is a useful reference here because it defines the standard
            alphabet, padding, treatment of non-alphabet characters, and
            canonical pad-bit requirement implemented by the strict decoder.{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc4648"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Read RFC 4648
            </a>
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A data: URL Is More Than a Base64 Payload
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A string beginning with something like{" "}
            <code>data:image/png;base64,</code> contains a media type and a data
            URL prefix before the actual Base64 characters. Passing the whole
            URL to an ordinary Base64 decoder is a format mismatch. Remove the
            prefix—or use a tool designed to parse data URLs—before decoding the
            payload.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Text Input Is Not a Substitute for Reading an Arbitrary Binary File
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Encoding starts from UTF-8 text entered in the textarea. It does not
            read a local image, archive, PDF, executable, or other file as raw
            bytes. Pasting binary-looking text is still encoding the characters
            that were pasted, not reconstructing the original file bytes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Large values also create several in-memory copies while converting
            between strings, byte arrays, Base64, and the displayed result. For
            very large payloads, a streaming library or command-line encoder is a
            better fit than a browser textarea.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/base64-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}
