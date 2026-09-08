"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "decode" | "encode" | "convert";
type DecodeInputType = "auto" | "jwtPart" | "fullJwt";
type EncodeInputType = "json" | "text";
type ConvertMode = "base64ToBase64url" | "base64urlToBase64" | "addPadding" | "removePadding";
type OutputMode = "clean" | "json" | "explain";

type DecodedPart = {
  label: string;
  base64url: string;
  decodedText: string;
  parsedJson: unknown | null;
  validJson: boolean;
  length: number;
  padded: string;
};

type JWTAnalysis = {
  parts: DecodedPart[];
  partCount: number;
  compactType: "single" | "jws" | "jwe";
  hasSignature: boolean;
  warnings: string[];
};

type ToolNote = {
  title: string;
  message: string;
};

const sampleJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IllvcnlhbnRyYSBVc2VyIiwiaWF0IjoxNzE3MDc1MjAwfQ.signature-placeholder";

const sampleJson = `{
  "sub": "1234567890",
  "name": "Yoryantra User",
  "iat": 1717075200
}`;

export default function ToolClient() {
  const [mode, setMode] = useState<Mode>("decode");
  const [decodeInputType, setDecodeInputType] = useState<DecodeInputType>("auto");
  const [encodeInputType, setEncodeInputType] = useState<EncodeInputType>("json");
  const [convertMode, setConvertMode] = useState<ConvertMode>("base64ToBase64url");
  const [input, setInput] = useState("");
  const [prettyJson, setPrettyJson] = useState(true);
  const [includePadding, setIncludePadding] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>("clean");
  const [analysis, setAnalysis] = useState<JWTAnalysis | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => getNotes({ mode, analysis, output }),
    [mode, analysis, output]
  );

  const runTool = () => {
    if (!input.trim()) {
      setError("Please paste a JWT part, full JWT, JSON, text, Base64, or Base64URL value.");
      setAnalysis(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      if (mode === "decode") {
        const nextAnalysis = decodeJwtBase64Url(input, {
          decodeInputType,
          prettyJson,
        });
        const nextOutput = formatDecodeOutput(nextAnalysis, {
          outputMode,
          prettyJson,
        });

        setAnalysis(nextAnalysis);
        setOutput(nextOutput);
      }

      if (mode === "encode") {
        const encoded = encodeToBase64Url(input, {
          encodeInputType,
          includePadding,
          prettyJson,
        });
        const nextAnalysis: JWTAnalysis = {
          parts: [],
          partCount: 0,
          compactType: "single",
          hasSignature: false,
          warnings: [],
        };

        setAnalysis(nextAnalysis);
        setOutput(formatEncodeOutput(encoded, input, { outputMode }));
      }

      if (mode === "convert") {
        const converted = convertValue(input, {
          convertMode,
        });
        const nextAnalysis: JWTAnalysis = {
          parts: [],
          partCount: 0,
          compactType: "single",
          hasSignature: false,
          warnings: [],
        };

        setAnalysis(nextAnalysis);
        setOutput(formatConvertOutput(converted, { convertMode, outputMode }));
      }

      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process this Base64URL value."
      );
      setAnalysis(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setMode("decode");
    setDecodeInputType("auto");
    setEncodeInputType("json");
    setConvertMode("base64ToBase64url");
    setInput(sampleJwt);
    setPrettyJson(true);
    setIncludePadding(false);
    setOutputMode("clean");
    setAnalysis(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const loadJsonExample = () => {
    setMode("encode");
    setEncodeInputType("json");
    setInput(sampleJson);
    setPrettyJson(true);
    setIncludePadding(false);
    setOutputMode("clean");
    setAnalysis(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setMode("decode");
    setDecodeInputType("auto");
    setEncodeInputType("json");
    setConvertMode("base64ToBase64url");
    setInput("");
    setPrettyJson(true);
    setIncludePadding(false);
    setOutputMode("clean");
    setAnalysis(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="JWT Base64URL Encoder Decoder"
      description="Decode JWT compact parts or encode UTF-8 data with RFC 4648 Base64URL rules."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose a Base64URL Task
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ModeButton
            active={mode === "decode"}
            title="Decode JWT Part"
            description="Decode a JWT header, payload, or full token into readable JSON/text."
            onClick={() => {
              setMode("decode");
              setInput("");
              setAnalysis(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />

          <ModeButton
            active={mode === "encode"}
            title="Encode to Base64URL"
            description="Turn JSON or plain text into JWT-safe Base64URL text."
            onClick={() => {
              setMode("encode");
              setInput("");
              setAnalysis(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />

          <ModeButton
            active={mode === "convert"}
            title="Convert Base64"
            description="Convert between normal Base64 and URL-safe Base64URL."
            onClick={() => {
              setMode("convert");
              setInput("");
              setAnalysis(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {mode === "decode"
            ? "JWT, JWT Part, or Base64URL Input"
            : mode === "encode"
            ? "JSON or Text Input"
            : "Base64 or Base64URL Input"}
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setAnalysis(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={
            mode === "decode"
              ? sampleJwt
              : mode === "encode"
              ? sampleJson
              : "SGVsbG8rV29ybGQ/"
          }
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          {mode === "decode"
            ? "Paste a JWT header, payload, signature-safe Base64URL value, or a full JWT separated by dots."
            : mode === "encode"
            ? "Paste JSON or plain text to encode into JWT-safe Base64URL."
            : "Paste normal Base64 or Base64URL text to convert between formats."}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          {mode === "decode" && (
            <YoryantraSelect
              label="Decode Input"
              value={decodeInputType}
              onChange={(value) => {
                setDecodeInputType(value as DecodeInputType);
                setAnalysis(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              options={[
                {
                  label: "Auto detect",
                  value: "auto",
                },
                {
                  label: "JWT part",
                  value: "jwtPart",
                },
                {
                  label: "Full JWT",
                  value: "fullJwt",
                },
              ]}
            />
          )}

          {mode === "encode" && (
            <YoryantraSelect
              label="Encode Input"
              value={encodeInputType}
              onChange={(value) => {
                setEncodeInputType(value as EncodeInputType);
                setAnalysis(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              options={[
                {
                  label: "JSON",
                  value: "json",
                },
                {
                  label: "Plain text",
                  value: "text",
                },
              ]}
            />
          )}

          {mode === "convert" && (
            <YoryantraSelect
              label="Convert"
              value={convertMode}
              onChange={(value) => {
                setConvertMode(value as ConvertMode);
                setAnalysis(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              options={[
                {
                  label: "Base64 to Base64URL",
                  value: "base64ToBase64url",
                },
                {
                  label: "Base64URL to Base64",
                  value: "base64urlToBase64",
                },
                {
                  label: "Add padding",
                  value: "addPadding",
                },
                {
                  label: "Remove padding",
                  value: "removePadding",
                },
              ]}
            />
          )}

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Clean output",
                value: "clean",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Explain",
                value: "explain",
              },
            ]}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
            <input
              type="checkbox"
              checked={prettyJson}
              onChange={(event) => {
                setPrettyJson(event.target.checked);
                setAnalysis(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Pretty JSON
          </label>

          {mode === "encode" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={includePadding}
                onChange={(event) => {
                  setIncludePadding(event.target.checked);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Include padding
            </label>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Pretty JSON formats decoded or encoded JSON with indentation.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runTool} className="yoryantra-btn">
          {mode === "decode"
            ? "Decode Base64URL"
            : mode === "encode"
            ? "Encode Base64URL"
            : "Convert"}
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load JWT Example
        </button>

        <button onClick={loadJsonExample} className="yoryantra-btn-outline">
          Load JSON Example
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

      {analysis && mode === "decode" && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Parts"
            value={analysis.partCount.toLocaleString()}
          />
          <SummaryCard
            label="Compact Shape"
            value={analysis.compactType === "jwe" ? "JWE (5-part)" : analysis.compactType === "jws" ? "JWS (3-part)" : "Single part"}
          />
          <SummaryCard
            label={analysis.compactType === "jwe" ? "Auth Tag" : "Signature"}
            value={analysis.compactType === "jwe" ? (analysis.parts[4]?.base64url ? "Present" : "Empty") : analysis.hasSignature ? "Present" : "Missing"}
          />
          <SummaryCard
            label="Warnings"
            value={analysis.warnings.length.toLocaleString()}
          />
        </div>
      )}

      {analysis && mode === "decode" && analysis.parts.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Decoded Parts
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            JWT-safe Base64URL parts decoded into text or JSON.
          </p>

          <div className="mt-4 space-y-4">
            {analysis.parts.map((part) => (
              <div
                key={part.label}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {part.label}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {part.validJson ? "JSON" : "Text"}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {part.length.toLocaleString()} chars
                  </span>
                </div>

                <pre className="mt-4 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-white p-4 text-sm font-mono text-gray-800">
                  {part.validJson && part.parsedJson !== null
                    ? JSON.stringify(part.parsedJson, null, prettyJson ? 2 : 0)
                    : part.decodedText}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Base64URL notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "JWT Base64URL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Encoding and decoding happen in this browser tab. Yoryantra does not send the pasted token, JSON, or text to its server. Avoid copying production credentials into screenshots, tickets, or shared devices after decoding them.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Base64URL is encoding, not JWT verification</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">JWT compact parts are Base64URL-encoded bytes separated by dots. Decoding those bytes can reveal a protected header or payload, but it does not prove who created the token, whether the signature is valid, whether the token is expired, or whether an application should trust any claim inside it.</p>
          <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">Treat decoded claims as untrusted data until signature or authenticated-encryption verification succeeds under the protocol that issued the token.</div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Three compact parts and five compact parts mean different things</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">A compact JWS normally has three segments: protected header, payload, and signature. Compact JWE has five: protected header, encrypted key, initialization vector, ciphertext, and authentication tag. The binary signature, ciphertext, IV, and tag are not assumed to be UTF-8 text; binary segments are reported as byte data instead of being silently replaced with Unicode replacement characters.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Padding and the URL-safe alphabet</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">RFC 4648 Base64URL replaces <code>+</code> with <code>-</code> and <code>/</code> with <code>_</code>. JOSE compact serialization normally omits trailing <code>=</code> padding. Missing padding can be reconstructed from the segment length, but a length with remainder one modulo four is impossible and is rejected.</p>
          <p className="mt-3 text-gray-600 leading-relaxed">References: <a className="text-[var(--gold)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc4648#section-5" target="_blank" rel="noreferrer">RFC 4648 §5</a>, <a className="text-[var(--gold)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc7515" target="_blank" rel="noreferrer">RFC 7515 (JWS)</a>, and <a className="text-[var(--gold)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc7516" target="_blank" rel="noreferrer">RFC 7516 (JWE)</a>.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON text versus arbitrary payload bytes</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">JWT headers are JSON. Many JWT payloads are JSON too, but JOSE can carry other payload conventions, including detached content in profiles that define it. A non-JSON payload therefore is not automatically corrupt. The decoder keeps that distinction visible instead of calling every non-JSON compact segment invalid.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Safer handling of real credentials</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Local browser processing avoids sending the token to Yoryantra, but the decoded text may still expose account identifiers, scopes, internal hostnames, or other sensitive claims on your screen and clipboard. Prefer test tokens when demonstrating behavior or sharing screenshots.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/jwt-base64url-encoder-decoder" /></div>
        </div>
      </section>
    </ToolShell>
  );
}

function ModeButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border border-gray-200 bg-white p-4 text-left transition ${
        active ? "shadow-sm ring-2 ring-[var(--green)]" : "hover:border-[var(--green)]"
      }`}
    >
      <span className="block text-sm font-semibold text-gray-900">{title}</span>

      <span className="mt-1 block text-sm leading-relaxed text-gray-500">
        {description}
      </span>
    </button>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function decodeJwtBase64Url(
  input: string,
  options: {
    decodeInputType: DecodeInputType;
    prettyJson: boolean;
  }
): JWTAnalysis {
  const trimmed = input.trim();
  const rawParts =
    options.decodeInputType === "fullJwt" ||
    (options.decodeInputType === "auto" && trimmed.includes("."))
      ? trimmed.split(".")
      : [trimmed];

  if (rawParts.length !== 1 && rawParts.length !== 3 && rawParts.length !== 5) {
    throw new Error("Compact JWT/JWS input should normally contain 3 parts; compact JWE contains 5. Decode a single part explicitly for other input.");
  }

  const labels = rawParts.length === 5
    ? ["Protected Header", "Encrypted Key", "Initialization Vector", "Ciphertext", "Authentication Tag"]
    : rawParts.length === 3
      ? ["Header", "Payload", "Signature"]
      : ["JWT Part"];

  const decodedParts = rawParts.map((part, index) =>
    decodePart(part, labels[index] || "JWT Part", options.prettyJson, rawParts.length, index)
  );
  const warnings: string[] = [];

  if (rawParts.length === 3) {
    if (!decodedParts[0].validJson) warnings.push("The JWS/JWT header is not valid JSON text.");
    if (rawParts[1] && !decodedParts[1].validJson) warnings.push("The JWT payload is not valid JSON text. Detached or non-JSON payload profiles need protocol-specific handling.");
    if (!rawParts[2]) warnings.push("The signature segment is empty. That can occur for unsecured JWS profiles, but trust still depends on the surrounding protocol and algorithm rules.");
  }

  if (rawParts.length === 5 && !decodedParts[0].validJson) {
    warnings.push("The JWE protected header is not valid JSON text.");
  }

  if (rawParts.some((part) => /=/.test(part))) {
    warnings.push("Compact JOSE Base64URL segments normally omit '=' padding.");
  }

  return {
    parts: decodedParts,
    partCount: rawParts.length,
    compactType: rawParts.length === 5 ? "jwe" : rawParts.length === 3 ? "jws" : "single",
    hasSignature: rawParts.length === 3 && rawParts[2].length > 0,
    warnings,
  };
}

function decodePart(
  part: string,
  label: string,
  prettyJson: boolean,
  partCount: number,
  index: number
): DecodedPart {
  const cleaned = part.trim();
  const mayBeEmptyBinary = (partCount === 3 && index === 2) || (partCount === 5 && index > 0);

  if (!cleaned && !mayBeEmptyBinary) {
    throw new Error(`${label} is empty.`);
  }

  validateBase64Url(cleaned, label, mayBeEmptyBinary);
  const standard = cleaned.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/g, "");
  const padded = addBase64Padding(standard);
  const bytes = decodeBase64Bytes(padded);
  const decoded = decodeUtf8Bytes(bytes);
  let parsedJson: unknown | null = null;
  let validJson = false;

  if (decoded !== null) {
    try {
      parsedJson = JSON.parse(decoded);
      validJson = true;
    } catch {
      parsedJson = null;
    }
  }

  const decodedText = validJson && parsedJson !== null
    ? JSON.stringify(parsedJson, null, prettyJson ? 2 : 0)
    : decoded !== null
      ? decoded
      : `[binary data: ${bytes.length} byte${bytes.length === 1 ? "" : "s"}]`;

  return {
    label,
    base64url: cleaned,
    decodedText,
    parsedJson,
    validJson,
    length: cleaned.length,
    padded,
  };
}

function validateBase64Url(value: string, label: string, allowEmpty = false): void {
  if (!value && allowEmpty) return;
  if (!value) throw new Error(`${label} is empty.`);
  if (!/^[A-Za-z0-9_-]*={0,2}$/.test(value) || /=/.test(value.slice(0, -2))) {
    throw new Error(`${label} contains invalid Base64URL characters or padding.`);
  }
  const unpadded = value.replace(/=+$/g, "");
  if (unpadded.length % 4 === 1) {
    throw new Error(`${label} has an impossible Base64URL length.`);
  }
}

function encodeToBase64Url(
  input: string,
  options: {
    encodeInputType: EncodeInputType;
    includePadding: boolean;
    prettyJson: boolean;
  }
): string {
  let source = input;

  if (options.encodeInputType === "json") {
    try {
      const parsed = JSON.parse(input);
      source = JSON.stringify(parsed, null, options.prettyJson ? 2 : 0);
    } catch {
      throw new Error("JSON input is not valid.");
    }
  }

  const encoded = encodeUtf8Base64(source).replace(/\+/g, "-").replace(/\//g, "_");
  return options.includePadding ? encoded : encoded.replace(/=+$/g, "");
}

function convertValue(input: string, options: { convertMode: ConvertMode }): string {
  const cleaned = input.trim().replace(/\s+/g, "");
  if (!cleaned) throw new Error("Input is empty.");

  if (options.convertMode === "base64ToBase64url") {
    validateStandardBase64(cleaned);
    return cleaned.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  if (options.convertMode === "base64urlToBase64") {
    validateBase64Url(cleaned, "Base64URL input");
    return addBase64Padding(cleaned.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/g, ""));
  }

  if (options.convertMode === "addPadding") {
    if (/[-_]/.test(cleaned)) validateBase64Url(cleaned, "Base64URL input"); else validateStandardBase64(cleaned, true);
    return addBase64Padding(cleaned.replace(/=+$/g, ""));
  }

  if (/[-_]/.test(cleaned)) validateBase64Url(cleaned, "Base64URL input"); else validateStandardBase64(cleaned, true);
  return cleaned.replace(/=+$/g, "");
}

function validateStandardBase64(value: string, allowUnpadded = false): void {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || /=/.test(value.slice(0, -2))) {
    throw new Error("Input contains invalid Base64 characters or padding.");
  }
  const unpadded = value.replace(/=+$/g, "");
  if (unpadded.length % 4 === 1) throw new Error("Input has an impossible Base64 length.");
  if (!allowUnpadded && value.length % 4 !== 0) throw new Error("Standard Base64 input is missing padding.");
}

function formatDecodeOutput(
  analysis: JWTAnalysis,
  options: {
    outputMode: OutputMode;
    prettyJson: boolean;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(analysis, null, 2);
  }

  if (options.outputMode === "explain") {
    return [
      "JWT Base64URL Decode",
      "--------------------",
      `Parts found: ${analysis.partCount}`,
      `Compact shape: ${analysis.compactType === "jwe" ? "JWE (5-part)" : analysis.compactType === "jws" ? "JWS (3-part)" : "single Base64URL part"}`,
      `Signature present: ${analysis.hasSignature ? "yes" : "no"}`,
      "",
      ...analysis.parts.map((part) =>
        [
          `${part.label}:`,
          `Base64URL length: ${part.length}`,
          `Valid JSON: ${part.validJson ? "yes" : "no"}`,
          `Decoded:`,
          part.validJson && part.parsedJson !== null
            ? JSON.stringify(part.parsedJson, null, options.prettyJson ? 2 : 0)
            : part.decodedText,
        ].join("\n")
      ),
      "",
      "Warnings:",
      ...(analysis.warnings.length === 0 ? ["(none)"] : analysis.warnings.map((warning) => `- ${warning}`)),
    ].join("\n\n");
  }

  return analysis.parts
    .map((part) =>
      part.validJson && part.parsedJson !== null
        ? JSON.stringify(part.parsedJson, null, options.prettyJson ? 2 : 0)
        : part.decodedText
    )
    .join("\n\n---\n\n");
}

function formatEncodeOutput(encoded: string, input: string, options: { outputMode: OutputMode }) {
  if (options.outputMode === "json") {
    return JSON.stringify(
      {
        inputLength: input.length,
        outputLength: encoded.length,
        base64url: encoded,
        padded: addBase64Padding(encoded),
      },
      null,
      2
    );
  }

  if (options.outputMode === "explain") {
    return [
      "Base64URL Encode",
      "----------------",
      `Input length: ${input.length}`,
      `Output length: ${encoded.length}`,
      `Output uses URL-safe characters: ${/^[A-Za-z0-9_-]+={0,2}$/.test(encoded) ? "yes" : "no"}`,
      "",
      encoded,
    ].join("\n");
  }

  return encoded;
}

function formatConvertOutput(
  converted: string,
  options: {
    convertMode: ConvertMode;
    outputMode: OutputMode;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(
      {
        mode: options.convertMode,
        output: converted,
        length: converted.length,
      },
      null,
      2
    );
  }

  if (options.outputMode === "explain") {
    return [
      "Base64 Conversion",
      "-----------------",
      `Mode: ${options.convertMode}`,
      `Output length: ${converted.length}`,
      "",
      converted,
    ].join("\n");
  }

  return converted;
}

function getPartLabel(index: number, partCount: number) {
  if (partCount >= 2) {
    if (index === 0) {
      return "Header";
    }

    if (index === 1) {
      return "Payload";
    }

    if (index === 2) {
      return "Signature";
    }
  }

  return "JWT Part";
}

function addBase64Padding(value: string) {
  const remainder = value.length % 4;

  if (remainder === 0) {
    return value;
  }

  return value + "=".repeat(4 - remainder);
}

function encodeUtf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function decodeUtf8Base64(value: string) {
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("Unable to decode Base64URL input.");
  }
}


function decodeBase64Bytes(value: string): Uint8Array {
  try {
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    throw new Error("Unable to decode the Base64URL bytes.");
  }
}

function decodeUtf8Bytes(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function getNotes({
  mode,
  analysis,
  output,
}: {
  mode: Mode;
  analysis: JWTAnalysis | null;
  output: string;
}): ToolNote[] {
  const notes: ToolNote[] = [];

  if (mode === "decode" && analysis?.warnings.length) {
    notes.push({
      title: "JWT warnings found",
      message:
        "The decoded value has one or more warnings. Check the details before using the result.",
    });
  }

  if (mode === "decode" && analysis?.hasSignature) {
    notes.push({
      title: "Signature is not verified",
      message:
        "Decoding compact parts does not verify a JWT signature or establish token trust.",
    });
  }

  if (mode === "encode") {
    notes.push({
      title: "Encoding is not signing",
      message:
        "Encoding JSON into Base64URL does not create a trusted JWT. Signing needs a secret or private key.",
    });
  }

  if (output.length > 5000) {
    notes.push({
      title: "Large output",
      message:
        "The output is large. Review it before copying into docs, tickets, or code.",
    });
  }

  return notes;
}
