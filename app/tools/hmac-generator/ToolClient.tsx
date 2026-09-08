"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type KeyEncoding = "utf8" | "hex" | "base64";
type OutputEncoding = "hex" | "base64" | "base64url";

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

function decodeHex(value: string): Uint8Array {
  const normalized = value.trim();
  if (!normalized.length) {
    throw new Error("Enter a non-empty hexadecimal key.");
  }
  if (!/^[0-9a-fA-F]+$/.test(normalized)) {
    throw new Error("Hexadecimal keys may contain only 0-9 and A-F.");
  }
  if (normalized.length % 2 !== 0) {
    throw new Error("A hexadecimal key needs an even number of characters.");
  }

  const bytes: Uint8Array = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < normalized.length; index += 2) {
    bytes[index / 2] = parseInt(normalized.slice(index, index + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const CHUNK = 0x8000;
  for (let start = 0; start < bytes.length; start += CHUNK) {
    const slice = bytes.subarray(start, Math.min(start + CHUNK, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(binary);
}

function decodeBase64(value: string): Uint8Array {
  const compact = value.replace(/[\t\n\r ]+/g, "");
  if (!compact.length) {
    throw new Error("Enter a non-empty Base64 key.");
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) {
    throw new Error("The key contains characters outside the standard Base64 alphabet.");
  }
  if (/=/.test(compact.slice(0, -2))) {
    throw new Error("Base64 padding may appear only at the end.");
  }

  const paddingMatch = /=+$/.exec(compact);
  const suppliedPadding = paddingMatch ? paddingMatch[0].length : 0;
  const unpadded = compact.replace(/=+$/, "");
  if (unpadded.length % 4 === 1) {
    throw new Error("The Base64 key has an impossible encoded length.");
  }

  const requiredPadding = (4 - (unpadded.length % 4)) % 4;
  if (suppliedPadding > 0 && (compact.length % 4 !== 0 || suppliedPadding !== requiredPadding)) {
    throw new Error("The Base64 key has malformed explicit padding.");
  }

  const padded = unpadded + "=".repeat(requiredPadding);
  let binary = "";
  try {
    binary = atob(padded);
  } catch {
    throw new Error("The Base64 key could not be decoded.");
  }

  const bytes: Uint8Array = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const canonical = bytesToBase64(bytes).replace(/=+$/, "");
  if (canonical !== unpadded) {
    throw new Error("The Base64 key uses non-canonical padding bits.");
  }

  return bytes;
}

function parseKey(value: string, encoding: KeyEncoding): Uint8Array {
  if (encoding === "hex") return decodeHex(value);
  if (encoding === "base64") return decodeBase64(value);
  if (!value.length) throw new Error("Enter a non-empty UTF-8 secret key.");
  return new TextEncoder().encode(value);
}

function formatMac(bytes: Uint8Array, encoding: OutputEncoding): string {
  if (encoding === "base64") return bytesToBase64(bytes);
  if (encoding === "base64url") {
    return bytesToBase64(bytes)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function ToolClient() {
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [keyEncoding, setKeyEncoding] = useState<KeyEncoding>("utf8");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [outputEncoding, setOutputEncoding] = useState<OutputEncoding>("hex");
  const [output, setOutput] = useState("");
  const [messageBytes, setMessageBytes] = useState<number | null>(null);
  const [keyBytes, setKeyBytes] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateHMAC = async () => {
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const messageData: Uint8Array = new TextEncoder().encode(message);
      const keyData: Uint8Array = parseKey(secret, keyEncoding);

      const key = await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(keyData),
        { name: "HMAC", hash: algorithm },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        toArrayBuffer(messageData)
      );

      const macBytes: Uint8Array = new Uint8Array(signature);
      setOutput(formatMac(macBytes, outputEncoding));
      setMessageBytes(messageData.byteLength);
      setKeyBytes(keyData.byteLength);
    } catch (caught) {
      const messageText = caught instanceof Error
        ? caught.message
        : "Unable to generate the HMAC value.";
      setError(messageText);
      setOutput("");
      setMessageBytes(null);
      setKeyBytes(null);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the HMAC value and copy it manually.");
    }
  };

  const resetAll = () => {
    setMessage("");
    setSecret("");
    setKeyEncoding("utf8");
    setAlgorithm("SHA-256");
    setOutputEncoding("hex");
    setOutput("");
    setMessageBytes(null);
    setKeyBytes(null);
    setError("");
    setLoading(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="HMAC Generator"
      description="Compute HMAC values from exact UTF-8 messages, selectable key encodings, and SHA-2 algorithms."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Message or Payload
        </label>
        <textarea
          spellCheck={false}
          className="h-40 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder="Enter the exact message bytes as UTF-8 text..."
          value={message}
          onChange={(event: { target: { value: string } }) =>
            setMessage(event.target.value)
          }
        />
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Whitespace, line endings, punctuation, and JSON property order are not
          normalized. The entered text is encoded as UTF-8 exactly as shown.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Secret Key
          </label>
          <input
            type="password"
            value={secret}
            autoComplete="off"
            spellCheck={false}
            onChange={(event: { target: { value: string } }) =>
              setSecret(event.target.value)
            }
            placeholder={
              keyEncoding === "utf8"
                ? "Enter UTF-8 secret text..."
                : keyEncoding === "hex"
                  ? "Enter hexadecimal key bytes..."
                  : "Enter standard Base64 key bytes..."
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="min-w-0">
          <YoryantraSelect
            label="Key Encoding"
            value={keyEncoding}
            onChange={(value: string) => setKeyEncoding(value as KeyEncoding)}
            options={[
              { label: "UTF-8 text", value: "utf8" },
              { label: "Hex bytes", value: "hex" },
              { label: "Base64 bytes", value: "base64" },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <YoryantraSelect
            label="HMAC Algorithm"
            value={algorithm}
            onChange={setAlgorithm}
            options={[
              { label: "SHA-256", value: "SHA-256" },
              { label: "SHA-384", value: "SHA-384" },
              { label: "SHA-512", value: "SHA-512" },
            ]}
          />
        </div>

        <div className="min-w-0">
          <YoryantraSelect
            label="Output Encoding"
            value={outputEncoding}
            onChange={(value: string) => setOutputEncoding(value as OutputEncoding)}
            options={[
              { label: "Lowercase hex", value: "hex" },
              { label: "Base64", value: "base64" },
              { label: "Base64URL (no padding)", value: "base64url" },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateHMAC}
          disabled={loading}
          className="yoryantra-btn min-h-11 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Computing..." : "Compute HMAC"}
        </button>
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-11 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">HMAC Value</h3>
          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[160px] overflow-auto whitespace-pre-wrap break-all text-sm">
          {output || "Computed HMAC will appear here."}
        </pre>

        {output && messageBytes !== null && keyBytes !== null && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              Message bytes: <strong className="text-gray-900">{messageBytes}</strong>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              Key bytes: <strong className="text-gray-900">{keyBytes}</strong>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              Output: <strong className="text-gray-900">{outputEncoding}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Browser-local computation</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          HMAC is computed with the Web Crypto API in your browser. The message,
          key, and result are not sent to Yoryantra. Local extensions, clipboard
          software, device monitoring, and malware remain outside that guarantee.
        </p>
      </div>

      <div className="mt-5 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">
          Matching an API requires the exact signing recipe
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-900">
          Many services call an HMAC a “signature,” but HMAC is a shared-key
          message authentication code, not a public-key digital signature. A
          mismatch can come from different message bytes, canonicalization,
          timestamp prefixes, key decoding, algorithm choice, or output encoding.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            HMAC authenticates bytes, not what the text looks like
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HMAC combines a secret key with a hash function so someone holding
            the same key can recompute the MAC for the same message. A changed
            byte produces a different result. HMAC does not encrypt the message,
            and it does not prove which individual person created it when more
            than one system knows the shared key.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That byte-level view explains many failed webhook tests. A trailing
            newline, CRLF instead of LF, a reordered JSON object, or a decoded
            key treated as literal Base64 text all change the input to HMAC.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Key encoding is part of the protocol
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">UTF-8 text</h3>
              <p className="mt-2 leading-relaxed">
                Characters are encoded to UTF-8 bytes. Spaces and Unicode are
                meaningful parts of the key.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Hex bytes</h3>
              <p className="mt-2 leading-relaxed">
                Every two hex digits become one byte. Odd-length or non-hex input
                is rejected instead of guessed.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">Base64 bytes</h3>
              <p className="mt-2 leading-relaxed">
                Standard Base64 is decoded first. Whitespace is ignored, while
                impossible lengths and non-canonical pad bits are rejected.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Hex, Base64 and Base64URL are only representations
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Changing the output encoding does not change the underlying HMAC
            bytes. Hex uses two characters per byte. Base64 is denser and may
            contain <code>+</code>, <code>/</code>, and padding. Base64URL swaps
            those two alphabet characters and this page removes trailing
            padding, which is common in token-oriented formats.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading RFC 2104 in a modern SHA-2 workflow
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 2104 defines HMAC as a generic construction around an iterated
            hash function. It also discusses key length: very short keys reduce
            security strength, while keys longer than the hash block size are
            first hashed by the HMAC construction. In an API integration, the
            service&apos;s documented key format still takes precedence over any
            generic rule of thumb.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            References:{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc2104.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              RFC 2104
            </a>
            {" · "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-900 underline underline-offset-4"
            >
              Web Crypto HMAC signing
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A reliable mismatch checklist
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Compare the exact raw message body before parsing or reformatting it.</li>
            <li>Confirm whether the service signs a prefix, timestamp, path, method, or body combination.</li>
            <li>Decode the secret using the format the service specifies.</li>
            <li>Use the required SHA-2 variant.</li>
            <li>Encode the result exactly as the receiver expects before comparing.</li>
            <li>For verification code, compare MACs with the platform&apos;s constant-time facility where available.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/hmac-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
