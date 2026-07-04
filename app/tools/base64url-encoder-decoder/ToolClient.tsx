"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ResultDetails = {
  output: string;
  notes: string[];
  warnings: string[];
};

function bytesToBinary(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return binary;
}

function binaryToBytes(binary: string) {
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  const base64 = btoa(bytesToBinary(bytes));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function normalizeBase64Url(value: string) {
  return value.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
}

function decodeBase64Url(value: string) {
  const compactValue = value.trim().replace(/\s+/g, "");

  if (!compactValue) {
    throw new Error("Paste a Base64URL value before decoding.");
  }

  if (/[^A-Za-z0-9_\-+/=]/.test(compactValue)) {
    throw new Error("The value contains characters that are not valid in Base64 or Base64URL text.");
  }

  const withoutPadding = compactValue.replace(/=+$/g, "");

  if (withoutPadding.length % 4 === 1) {
    throw new Error("This Base64URL value has an invalid length. Check for missing or extra characters.");
  }

  const base64 = normalizeBase64Url(withoutPadding).padEnd(
    withoutPadding.length + ((4 - (withoutPadding.length % 4)) % 4),
    "=",
  );

  const bytes = binaryToBytes(atob(base64));

  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function getJwtPayloadSegment(value: string) {
  const compactValue = value.trim().replace(/^Bearer\s+/i, "");
  const parts = compactValue.split(".");

  if (parts.length !== 3 || !parts[1]) {
    throw new Error("Paste a compact JWT with three dot-separated parts to decode its payload segment.");
  }

  return parts[1];
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ResultDetails>({
    output: "",
    notes: [],
    warnings: [],
  });
  const [error, setError] = useState("");

  const setCleanResult = (nextResult: ResultDetails) => {
    setResult(nextResult);
    setError("");
  };

  const encodeValue = () => {
    if (!input.length) {
      setError("Enter text before encoding.");
      setResult({ output: "", notes: [], warnings: [] });
      return;
    }

    try {
      const output = encodeBase64Url(input);

      setCleanResult({
        output,
        notes: [
          "Output uses the URL-safe Base64 alphabet: - and _ instead of + and /.",
          "Padding is removed, which is common for JWT-style Base64URL values.",
        ],
        warnings: [
          "Base64URL is encoding, not encryption. Anyone can decode the value if they have it.",
        ],
      });
    } catch {
      setError("Unable to encode this text as Base64URL.");
      setResult({ output: "", notes: [], warnings: [] });
    }
  };

  const decodeValue = (value = input, jwtMode = false) => {
    try {
      const output = decodeBase64Url(value);
      const warnings: string[] = [
        "Base64URL decoding does not verify a JWT signature or prove the token is trusted.",
      ];

      if (/[+/]/.test(value)) {
        warnings.push(
          "This input also contains standard Base64 characters. The tool accepted them, but pure Base64URL normally uses - and _.",
        );
      }

      setCleanResult({
        output,
        notes: [
          jwtMode
            ? "Decoded the payload segment from the pasted JWT."
            : "Decoded the pasted Base64URL value as UTF-8 text.",
          "Missing Base64 padding was restored only for decoding.",
        ],
        warnings,
      });
    } catch (decodeError) {
      setError(
        decodeError instanceof Error
          ? decodeError.message
          : "Invalid Base64URL input.",
      );
      setResult({ output: "", notes: [], warnings: [] });
    }
  };

  const decodeJwtPayload = () => {
    try {
      decodeValue(getJwtPayloadSegment(input), true);
    } catch (decodeError) {
      setError(
        decodeError instanceof Error
          ? decodeError.message
          : "Unable to decode the JWT payload segment.",
      );
      setResult({ output: "", notes: [], warnings: [] });
    }
  };

  const resetAll = () => {
    setInput("");
    setResult({ output: "", notes: [], warnings: [] });
    setError("");
  };

  return (
    <ToolShell
      title="Base64URL Encoder Decoder"
      description="Encode plain text to Base64URL, decode URL-safe Base64 values, or inspect JWT payload segments in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text, Base64URL value, or JWT
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste plain text, a Base64URL value, or a compact JWT..."
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={encodeValue} className="yoryantra-btn">
          Encode Base64URL
        </button>

        <button onClick={() => decodeValue()} className="yoryantra-btn-outline">
          Decode Base64URL
        </button>

        <button onClick={decodeJwtPayload} className="yoryantra-btn-outline">
          Decode JWT Payload
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Result</h3>

          {result.output && (
            <button
              onClick={() => navigator.clipboard.writeText(result.output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[180px] text-sm break-words whitespace-pre-wrap overflow-auto">
          {result.output || "Encoded or decoded Base64URL output will appear here..."}
        </div>
      </div>

      {(result.notes.length > 0 || result.warnings.length > 0) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {result.notes.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700 leading-relaxed">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="text-sm font-semibold text-yellow-900">Important</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-yellow-800 leading-relaxed">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Privacy Note</h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Encoding and decoding happens locally in your browser. Your JWT parts,
          API values, authentication text, and encoded strings are not uploaded
          by this tool. Still, avoid pasting live secrets into any tool unless
          you understand the risk.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding Base64URL Strings for JWTs and URLs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64URL is a URL-safe form of Base64. It is commonly used in JWTs,
            OAuth flows, API payloads, signed URLs, and other web systems where
            encoded values may appear inside headers, query strings, or tokens.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Standard Base64 can contain <code>+</code>, <code>/</code>, and
            <code>=</code>. Base64URL replaces <code>+</code> with <code>-</code>,
            replaces <code>/</code> with <code>_</code>, and often removes the
            padding at the end.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool is useful for formatting and debugging encoded text. It
            does not decrypt data, verify JWT signatures, or decide whether a
            token should be trusted.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Base64URL Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste plain text, a Base64URL value, or a compact JWT.</li>
            <li>Use <strong>Encode Base64URL</strong> for plain text.</li>
            <li>Use <strong>Decode Base64URL</strong> for a single encoded value.</li>
            <li>Use <strong>Decode JWT Payload</strong> when you pasted a full JWT.</li>
            <li>Copy the result only after checking that it is safe for your workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Use Cases</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Decoding a JWT header or payload segment during debugging.</li>
            <li>Encoding URL-safe values for API tests and documentation.</li>
            <li>Checking whether a token part uses Base64URL padding.</li>
            <li>Converting between text and JWT-style Base64URL output.</li>
            <li>Explaining why encoded token content is still readable.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Base64URL Encoding
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Plain text:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">{`Yoryantra`}</pre>

            <p className="mt-4 font-medium text-gray-900">Base64URL encoded:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">{`WW9yeWFudHJh`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Base64URL Is Not Encryption
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Encoding is reversible:</strong> Base64URL only changes
                how data is represented. It does not hide the content.
              </li>
              <li>
                <strong>JWTs need verification:</strong> Decoding a JWT lets you
                inspect claims, but it does not prove the signature is valid.
              </li>
              <li>
                <strong>Padding can vary:</strong> Some systems keep trailing
                <code>=</code> padding, while JWT-style values commonly remove it.
              </li>
              <li>
                <strong>Exact bytes matter:</strong> Different text encoding,
                whitespace, or line endings can produce different encoded output.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">What is Base64URL?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL is a URL-safe Base64 variant used by JWTs and many web
                protocols. It avoids characters that can be awkward inside URLs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How is Base64URL different from Base64?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL uses <code>-</code> and <code>_</code> instead of
                <code>+</code> and <code>/</code>. It also commonly removes
                trailing padding characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this verify a JWT token?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It can decode JWT text for inspection, but signature
                verification requires the correct key, expected algorithm, and
                validation rules.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Base64URL safe for secrets?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Not by itself. Base64URL is readable after decoding, so it should
                not be used as a replacement for encryption or proper secret
                handling.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Does this run locally?</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The encode and decode operations run inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/base64url-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}
