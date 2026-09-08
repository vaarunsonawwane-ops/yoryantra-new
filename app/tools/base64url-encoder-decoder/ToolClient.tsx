"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ResultDetails = {
  hasResult: boolean;
  label: string;
  output: string;
  notes: string[];
  warnings: string[];
};

type DecodeOptions = {
  allowWhitespace: boolean;
  allowStandardBase64Alphabet: boolean;
  allowPadding: boolean;
};

type DecodedBase64Url = {
  bytes: Uint8Array;
  canonicalUnpadded: string;
  hadPadding: boolean;
  hadWhitespace: boolean;
  alphabet: "base64url" | "base64" | "shared";
};

const EMPTY_RESULT: ResultDetails = {
  hasResult: false,
  label: "Result",
  output: "",
  notes: [],
  warnings: [],
};

function bytesToBinary(bytes: Uint8Array) {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return binary;
}

function binaryToBytes(binary: string) {
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeBytesAsBase64Url(bytes: Uint8Array) {
  const base64 = btoa(bytesToBinary(bytes));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function encodeTextAsBase64Url(value: string) {
  return encodeBytesAsBase64Url(new TextEncoder().encode(value));
}

function decodeBase64Url(
  value: string,
  options: DecodeOptions = {
    allowWhitespace: true,
    allowStandardBase64Alphabet: true,
    allowPadding: true,
  },
): DecodedBase64Url {
  const trimmed = value.trim();
  const hadWhitespace = /\s/.test(trimmed);

  if (hadWhitespace && !options.allowWhitespace) {
    throw new Error("Whitespace is not allowed inside a JWT Base64URL segment.");
  }

  const compactValue = options.allowWhitespace
    ? trimmed.replace(/\s+/g, "")
    : trimmed;

  const hasUrlAlphabet = /[-_]/.test(compactValue);
  const hasStandardAlphabet = /[+/]/.test(compactValue);

  if (hasUrlAlphabet && hasStandardAlphabet) {
    throw new Error(
      "The value mixes Base64URL (- and _) with standard Base64 (+ and /). Use one alphabet consistently.",
    );
  }

  if (hasStandardAlphabet && !options.allowStandardBase64Alphabet) {
    throw new Error(
      "JWT segments use Base64URL, so + and / are not valid in this segment.",
    );
  }

  if (/[^A-Za-z0-9_\-+/=]/.test(compactValue)) {
    throw new Error(
      "The value contains a character outside the Base64URL or Base64 alphabet.",
    );
  }

  const paddingMatch = compactValue.match(/=+$/);
  const paddingCount = paddingMatch ? paddingMatch[0].length : 0;

  if (paddingCount > 2) {
    throw new Error("Base64 padding can contain at most two trailing = characters.");
  }

  if (paddingCount > 0 && !options.allowPadding) {
    throw new Error("JWT Base64URL segments must omit trailing = padding.");
  }

  const core = paddingCount > 0
    ? compactValue.slice(0, compactValue.length - paddingCount)
    : compactValue;

  if (core.includes("=")) {
    throw new Error("Base64 padding is only valid at the end of the value.");
  }

  const remainder = core.length % 4;

  if (remainder === 1) {
    throw new Error(
      "The Base64URL length is impossible for an encoded byte sequence. Check for a missing or extra character.",
    );
  }

  const expectedPadding = (4 - remainder) % 4;

  if (paddingCount > 0 && paddingCount !== expectedPadding) {
    throw new Error(
      `The trailing padding does not match the encoded length. Expected ${expectedPadding || 0} = character${expectedPadding === 1 ? "" : "s"}.`,
    );
  }

  const normalizedCore = core.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = normalizedCore + "=".repeat(expectedPadding);

  let bytes: Uint8Array;

  try {
    bytes = binaryToBytes(atob(paddedBase64));
  } catch {
    throw new Error("The value could not be decoded as Base64URL data.");
  }

  const canonicalUnpadded = encodeBytesAsBase64Url(bytes);
  const comparableCore = core.replace(/\+/g, "-").replace(/\//g, "_");

  if (comparableCore !== canonicalUnpadded) {
    throw new Error(
      "The value decodes, but its unused Base64 pad bits are not canonical. Re-encode the original bytes instead of accepting an ambiguous spelling.",
    );
  }

  return {
    bytes,
    canonicalUnpadded,
    hadPadding: paddingCount > 0,
    hadWhitespace,
    alphabet: hasStandardAlphabet
      ? "base64"
      : hasUrlAlphabet
        ? "base64url"
        : "shared",
  };
}

function decodeUtf8(bytes: Uint8Array) {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function containsNonTextControls(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if ((code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) || code === 0x7f) {
      return true;
    }
  }

  return false;
}

function bytesToHexLines(bytes: Uint8Array) {
  if (bytes.length === 0) {
    return "";
  }

  const pairs = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  const lines: string[] = [];

  for (let index = 0; index < pairs.length; index += 16) {
    lines.push(pairs.slice(index, index + 16).join(" "));
  }

  return lines.join("\n");
}

function parseJwtInput(value: string) {
  const compactValue = value.trim().replace(/^Bearer\s+/i, "");
  const parts = compactValue.split(".");

  if (parts.length === 5) {
    throw new Error(
      "This looks like compact JWE with five segments. Its payload is encrypted, so there is no plaintext JWT payload segment to Base64URL-decode directly.",
    );
  }

  if (parts.length !== 3) {
    throw new Error(
      "Paste a compact three-part JWS/JWT when using Decode JWT Payload.",
    );
  }

  if (!parts[0]) {
    throw new Error("The JWT header segment is empty.");
  }

  if (!parts[1]) {
    throw new Error(
      "The middle segment is empty. Detached-payload JWS forms are not a normal inline JWT payload.",
    );
  }

  return parts;
}

function decodeJwtPayloadText(value: string) {
  const parts = parseJwtInput(value);
  const strictJwtOptions: DecodeOptions = {
    allowWhitespace: false,
    allowStandardBase64Alphabet: false,
    allowPadding: false,
  };

  const headerBytes = decodeBase64Url(parts[0], strictJwtOptions).bytes;
  let headerText = "";

  try {
    headerText = decodeUtf8(headerBytes);
  } catch {
    throw new Error("The JWT header is not valid UTF-8 JSON text.");
  }

  let header: Record<string, unknown>;

  try {
    const parsedHeader: unknown = JSON.parse(headerText);

    if (!parsedHeader || typeof parsedHeader !== "object" || Array.isArray(parsedHeader)) {
      throw new Error("header-shape");
    }

    header = parsedHeader as Record<string, unknown>;
  } catch {
    throw new Error("The JWT header segment does not decode to a JSON object.");
  }

  if (header.b64 === false) {
    throw new Error(
      "The JOSE header sets b64=false, so the payload is intentionally not Base64URL encoded. Decode JWT Payload does not reinterpret that unencoded-payload JWS form.",
    );
  }

  const payloadBytes = decodeBase64Url(parts[1], strictJwtOptions).bytes;
  let payloadText = "";

  try {
    payloadText = decodeUtf8(payloadBytes);
  } catch {
    throw new Error(
      "The payload bytes are not valid UTF-8. A JWT Claims Set is JSON text, although a general JWS payload can contain arbitrary bytes.",
    );
  }

  const warnings = [
    "Reading the header and payload does not verify the signature, issuer, audience, expiry, or any other trust decision.",
  ];
  const notes = [`Payload bytes: ${payloadBytes.length}.`];

  if (typeof header.alg === "string") {
    notes.push(`JOSE alg header: ${header.alg}. This is decoded text, not an algorithm-verification result.`);

    if (header.alg === "none") {
      warnings.push(
        "The header says alg=none, which means the compact object carries no signature or MAC integrity protection.",
      );
    }
  } else {
    warnings.push("The JOSE header does not contain a string alg value.");
  }

  let output = payloadText;

  try {
    const parsedPayload: unknown = JSON.parse(payloadText);
    output = JSON.stringify(parsedPayload, null, 2);

    if (!parsedPayload || typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
      warnings.push(
        "The payload is valid JSON but not a JSON object, so it is not shaped like a normal JWT Claims Set.",
      );
    } else {
      notes.push("The payload is valid JSON and has the object shape used for a JWT Claims Set.");
    }
  } catch {
    warnings.push(
      "The payload is UTF-8 text but not valid JSON. Treat it as a general JWS payload rather than a normal JWT Claims Set.",
    );
  }

  return { output, notes, warnings };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ResultDetails>(EMPTY_RESULT);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearFeedback = () => {
    setResult(EMPTY_RESULT);
    setError("");
    setCopied(false);
  };

  const setCleanResult = (nextResult: ResultDetails) => {
    setResult(nextResult);
    setError("");
    setCopied(false);
  };

  const encodeValue = () => {
    try {
      const bytes = new TextEncoder().encode(input);
      const output = encodeTextAsBase64Url(input);

      setCleanResult({
        hasResult: true,
        label: "Base64URL output",
        output,
        notes: [
          `UTF-8 input: ${bytes.length} byte${bytes.length === 1 ? "" : "s"}.`,
          "Output uses the RFC 4648 URL-safe alphabet and intentionally omits trailing = padding.",
        ],
        warnings: [
          "Base64URL changes representation; it does not encrypt or hide the underlying bytes.",
        ],
      });
    } catch {
      setError("The text could not be encoded as UTF-8 Base64URL.");
      setResult(EMPTY_RESULT);
      setCopied(false);
    }
  };

  const decodeValue = () => {
    try {
      const decoded = decodeBase64Url(input);
      const notes = [
        `Decoded bytes: ${decoded.bytes.length}.`,
        decoded.hadPadding
          ? "Trailing Base64 padding was present and checked before decoding."
          : "No trailing padding was present; the required padding length was inferred only for decoding.",
      ];
      const warnings: string[] = [];
      let label = "Decoded UTF-8 text";
      let output = "";

      if (decoded.hadWhitespace) {
        warnings.push(
          "Whitespace was ignored for this general decode. Canonical Base64URL values normally do not contain embedded whitespace.",
        );
      }

      if (decoded.alphabet === "base64") {
        warnings.push(
          "The input used + or /, so it was standard Base64 rather than Base64URL. It was accepted for compatibility and checked against the same decoded bytes.",
        );
      }

      try {
        const text = decodeUtf8(decoded.bytes);

        if (containsNonTextControls(text)) {
          label = "Decoded bytes — hexadecimal";
          output = bytesToHexLines(decoded.bytes);
          notes.push(
            "The bytes form valid UTF-8 but include control characters, so hexadecimal is shown to keep invisible bytes visible.",
          );
        } else {
          output = text;
        }
      } catch {
        label = "Decoded bytes — hexadecimal";
        output = bytesToHexLines(decoded.bytes);
        notes.push(
          "The byte sequence is not valid UTF-8 text, so hexadecimal is shown instead of replacing invalid bytes with placeholder characters.",
        );
      }

      setCleanResult({
        hasResult: true,
        label,
        output,
        notes,
        warnings,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Invalid Base64URL input.");
      setResult(EMPTY_RESULT);
      setCopied(false);
    }
  };

  const decodeJwtPayload = () => {
    try {
      const decoded = decodeJwtPayloadText(input);

      setCleanResult({
        hasResult: true,
        label: "Decoded JWT payload",
        output: decoded.output,
        notes: decoded.notes,
        warnings: decoded.warnings,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The JWT payload could not be decoded.",
      );
      setResult(EMPTY_RESULT);
      setCopied(false);
    }
  };

  const copyResult = async () => {
    if (!result.hasResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the result and copy it manually.");
      setCopied(false);
    }
  };

  const resetAll = () => {
    setInput("");
    clearFeedback();
  };

  return (
    <ToolShell
      title="Base64URL Encoder Decoder"
      description="Encode UTF-8 text as Base64URL or decode Base64URL and JWT payload bytes."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Text, Base64URL value, or compact JWT
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearFeedback();
          }}
          placeholder="Paste text, a Base64URL value, or a compact three-part JWT..."
          className="min-h-[220px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={encodeValue} className="yoryantra-btn min-h-11 whitespace-nowrap">
          Encode Base64URL
        </button>

        <button onClick={decodeValue} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
          Decode Base64URL
        </button>

        <button onClick={decodeJwtPayload} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
          Decode JWT Payload
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{result.label}</h3>

          {result.hasResult && (
            <button
              onClick={copyResult}
              className="yoryantra-btn-outline min-h-11 self-start whitespace-nowrap text-sm sm:self-auto"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[180px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {result.hasResult
            ? result.output || <span className="text-gray-500">(empty string)</span>
            : "Encoded or decoded output will appear here."}
        </div>
      </div>

      {(result.notes.length > 0 || result.warnings.length > 0) && (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2">
          {result.notes.length > 0 && (
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">What was decoded</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">Keep in mind</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-amber-800">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">Tokens can contain live credentials</h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          Encoding and decoding happen in the current browser tab. The page does
          not need to send the pasted value to a decoder endpoint, but browser
          extensions, clipboard history, screenshots, and anyone with device
          access remain outside that boundary. Avoid exposing live bearer tokens
          or reusable secrets when a redacted sample is enough.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Base64URL changes the alphabet, not the bytes underneath
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            UTF-8 text is first turned into bytes. Base64 then represents those
            bytes with printable characters. Base64URL keeps the same 6-bit
            grouping but replaces <code>+</code> with <code>-</code> and
            <code>/</code> with <code>_</code>, which avoids two characters that
            are awkward in URLs and filenames.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nothing about that transformation adds secrecy. If a value contains
            a password, API credential, or personal data before encoding, the
            same information is recoverable after decoding.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why JWT segments normally have no = at the end
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 4648 defines padding for Base64 and explains when another
            specification may omit it. JWS makes that choice explicitly:
            Base64URL-encoded header and payload segments omit trailing
            <code>=</code> characters and do not contain line breaks or extra
            whitespace. That is why the JWT button is stricter than the general
            decoder.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            References:{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc4648.html#section-5"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              RFC 4648 §5
            </a>
            {" · "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc7515.html#section-2"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              RFC 7515 base64url definition
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A decoder should not quietly accept every almost-valid spelling
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Padding</h3>
              <p className="mt-2 leading-relaxed">
                Padded and unpadded general input are accepted when the padding
                count matches the encoded length. JWT segments reject padding.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Alphabet</h3>
              <p className="mt-2 leading-relaxed">
                Standard Base64 using <code>+</code> or <code>/</code> can be
                decoded for compatibility, but it is called out instead of being
                mislabeled as Base64URL.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Canonical pad bits</h3>
              <p className="mt-2 leading-relaxed">
                The decoded bytes are re-encoded and compared with the input so
                non-zero unused pad bits do not create multiple spellings for the
                same byte sequence.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A readable JWT payload is still untrusted input
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The middle segment of a normal compact JWS/JWT can usually be read
            without a key. That says nothing about who created it. Signature or
            MAC verification, an allowed algorithm, issuer and audience checks,
            time claims, and application-specific rules still decide whether the
            token is acceptable.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Five-part compact JWE is different because its content is encrypted.
            JWS can also use the <code>b64=false</code> extension for an unencoded
            payload. Both cases are identified rather than pretending the middle
            bytes are a normal Base64URL JWT Claims Set.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Text decoding has a byte boundary too
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Base64URL can represent any bytes, not only text. General decoding
            therefore shows hexadecimal when the byte sequence is not valid
            UTF-8, or when it contains control bytes that would be invisible in a
            text box. JWT payload decoding is stricter because a JWT Claims Set
            is JSON text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Two strings that look similar can still encode differently. Unicode
            normalization, CRLF versus LF, a trailing space, or an unseen newline
            changes the UTF-8 bytes and therefore changes the Base64URL result.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/base64url-encoder-decoder" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
