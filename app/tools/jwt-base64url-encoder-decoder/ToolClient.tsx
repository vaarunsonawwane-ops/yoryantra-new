"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
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
  looksLikeJwt: boolean;
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
          looksLikeJwt: false,
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
          looksLikeJwt: false,
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
      description="Encode and decode JWT Base64URL strings, convert JWT header and payload JSON, add or remove padding, and compare Base64 with Base64URL directly in your browser."
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
            label="Looks Like JWT"
            value={analysis.looksLikeJwt ? "Yes" : "No"}
          />
          <SummaryCard
            label="Signature"
            value={analysis.hasSignature ? "Present" : "Missing"}
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
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
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

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JWT Base64URL encoding and decoding happens directly in your browser.
        Your token parts and pasted text are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding and Decoding JWT Base64URL Parts
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JWT header and payload parts use Base64URL encoding. It looks similar
            to normal Base64, but it replaces characters that can be awkward in
            URLs and usually removes padding. That is why JWT parts often contain
            hyphens and underscores instead of plus and slash.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JWT Base64URL Encoder Decoder helps you decode JWT parts into
            readable JSON, encode JSON into JWT-safe Base64URL, and convert
            between normal Base64 and Base64URL formats.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Working With JWT Header and Payload Text
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose whether to decode, encode, or convert Base64 formats.</li>
            <li>Paste a full JWT, JWT part, JSON, text, Base64, or Base64URL value.</li>
            <li>Select clean output, JSON, or explanation output.</li>
            <li>Review decoded parts, warnings, and formatting notes.</li>
            <li>Copy the result for debugging, documentation, or local testing.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JWT Base64URL Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Decoding a JWT payload without verifying the signature.</li>
            <li>Encoding a sample JWT header or payload for testing.</li>
            <li>Converting Base64 strings into URL-safe Base64URL text.</li>
            <li>Adding or removing Base64URL padding.</li>
            <li>Checking whether a JWT part contains valid JSON.</li>
            <li>Preparing safe examples for API documentation or debugging notes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JWT Payload
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`{
  "sub": "1234567890",
  "name": "Yoryantra User",
  "iat": 1717075200
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            This Does Not Verify JWT Signatures
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64URL decoding only turns JWT parts into readable text. It does
            not prove that the token is valid, trusted, unexpired, or signed with
            the correct key.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool for reading and formatting JWT parts. For real
            authentication or authorization decisions, your application must
            verify the JWT signature and claims on the server.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Base64URL in JWT?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL is a URL-safe version of Base64 used by JWT header and
                payload parts. It uses - and _ instead of + and /.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode a full JWT?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Paste a full JWT and the tool will decode the header and
                payload parts when possible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this verify the JWT signature?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only encodes and decodes Base64URL text. It does
                not verify signatures or token trust.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I paste real tokens here?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Avoid pasting real production tokens into any online tool. Use
                safe test tokens or remove sensitive values before sharing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JWT uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Encoding and decoding happens directly in your browser, and
                your input is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/base64-image-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Image Encoder Decoder
            </Link>

            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
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
  const parts =
    options.decodeInputType === "fullJwt" ||
    (options.decodeInputType === "auto" && trimmed.split(".").length >= 2)
      ? trimmed.split(".")
      : [trimmed];

  const decodedParts = parts.slice(0, 3).map((part, index) =>
    decodePart(part, getPartLabel(index, parts.length), options.prettyJson)
  );

  const warnings: string[] = [];

  if (parts.length > 3) {
    warnings.push("The input has more than three dot-separated parts. A normal JWT usually has three parts.");
  }

  if (parts.length === 2) {
    warnings.push("The input has two parts. A signed JWT usually has header, payload, and signature.");
  }

  if (decodedParts.some((part) => !part.validJson) && parts.length >= 2) {
    warnings.push("One or more decoded JWT parts are not valid JSON.");
  }

  if (parts[2] && parts[2].includes("=")) {
    warnings.push("JWT signature part contains padding. JWT Base64URL usually omits padding.");
  }

  return {
    parts: decodedParts,
    partCount: parts.length,
    looksLikeJwt: parts.length >= 2 && parts.length <= 3,
    hasSignature: Boolean(parts[2]),
    warnings,
  };
}

function decodePart(part: string, label: string, prettyJson: boolean): DecodedPart {
  const cleaned = part.trim();

  if (!cleaned) {
    throw new Error(`${label} is empty.`);
  }

  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(cleaned)) {
    throw new Error(`${label} contains characters that are not valid Base64URL.`);
  }

  const padded = addBase64Padding(cleaned.replace(/-/g, "+").replace(/_/g, "/"));
  const decodedText = decodeUtf8Base64(padded);
  let parsedJson: unknown | null = null;
  let validJson = false;

  try {
    parsedJson = JSON.parse(decodedText);
    validJson = true;
  } catch {
    parsedJson = null;
  }

  return {
    label,
    base64url: cleaned,
    decodedText:
      validJson && parsedJson !== null
        ? JSON.stringify(parsedJson, null, prettyJson ? 2 : 0)
        : decodedText,
    parsedJson,
    validJson,
    length: cleaned.length,
    padded,
  };
}

function encodeToBase64Url(
  input: string,
  options: {
    encodeInputType: EncodeInputType;
    includePadding: boolean;
    prettyJson: boolean;
  }
) {
  let source = input;

  if (options.encodeInputType === "json") {
    try {
      const parsed = JSON.parse(input);
      source = JSON.stringify(parsed, null, options.prettyJson ? 2 : 0);
    } catch {
      throw new Error("JSON input is not valid.");
    }
  }

  const encoded = encodeUtf8Base64(source)
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return options.includePadding ? encoded : encoded.replace(/=+$/g, "");
}

function convertValue(
  input: string,
  options: {
    convertMode: ConvertMode;
  }
) {
  const cleaned = input.trim().replace(/\s+/g, "");

  if (!cleaned) {
    throw new Error("Input is empty.");
  }

  if (options.convertMode === "base64ToBase64url") {
    return cleaned.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  if (options.convertMode === "base64urlToBase64") {
    return addBase64Padding(cleaned.replace(/-/g, "+").replace(/_/g, "/"));
  }

  if (options.convertMode === "addPadding") {
    return addBase64Padding(cleaned);
  }

  return cleaned.replace(/=+$/g, "");
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
      `Looks like JWT: ${analysis.looksLikeJwt ? "yes" : "no"}`,
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
        "This tool decodes JWT parts but does not verify the JWT signature.",
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
