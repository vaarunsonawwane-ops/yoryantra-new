"use client";

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "decode" | "encodeText" | "encodeFile" | "analyze";
type OutputMode = "summary" | "decoded" | "dataUri" | "json" | "markdown" | "html" | "css";
type EncodingMode = "base64" | "percent";
type MimePreset =
  | "text/plain"
  | "text/html"
  | "text/css"
  | "application/json"
  | "application/javascript"
  | "image/svg+xml"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/webp"
  | "font/woff2"
  | "application/octet-stream";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type ParsedDataUri = {
  valid: boolean;
  original: string;
  mediaType: string;
  mimeType: string;
  charset: string;
  isBase64: boolean;
  parameters: Record<string, string>;
  payload: string;
  decodedText: string;
  decodedByteLength: number;
  payloadLength: number;
  headerLength: number;
  error?: string;
};

type Result = {
  action: ActionMode;
  output: string;
  parsed: ParsedDataUri | null;
  issues: Issue[];
  inputLength: number;
  outputLength: number;
  byteLength: number;
  mimeType: string;
  isBase64: boolean;
  preview: string;
};

const sampleDataUri = `data:text/plain;charset=UTF-8;base64,SGVsbG8gZnJvbSBZb3J5YW50cmEhCgpVc2UgRGF0YSBVUklzIG9ubHkgZm9yIHNtYWxsIGlubGluZSBhc3NldHMu`;
const sampleText = `Hello from Yoryantra!

This text can be converted into a Data URI for small inline examples, demos, copied snippets, or quick browser tests.`;

const mimeOptions: Array<{ label: string; value: MimePreset }> = [
  { label: "Text - text/plain", value: "text/plain" },
  { label: "HTML - text/html", value: "text/html" },
  { label: "CSS - text/css", value: "text/css" },
  { label: "JSON - application/json", value: "application/json" },
  { label: "JavaScript - application/javascript", value: "application/javascript" },
  { label: "SVG - image/svg+xml", value: "image/svg+xml" },
  { label: "PNG image - image/png", value: "image/png" },
  { label: "JPEG image - image/jpeg", value: "image/jpeg" },
  { label: "GIF image - image/gif", value: "image/gif" },
  { label: "WebP image - image/webp", value: "image/webp" },
  { label: "WOFF2 font - font/woff2", value: "font/woff2" },
  { label: "Binary - application/octet-stream", value: "application/octet-stream" },
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("decode");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("base64");
  const [mimeType, setMimeType] = useState<MimePreset>("text/plain");
  const [customMimeType, setCustomMimeType] = useState("");
  const [charset, setCharset] = useState("UTF-8");
  const [includeCharset, setIncludeCharset] = useState(true);
  const [trimText, setTrimText] = useState(false);
  const [wrapOutput, setWrapOutput] = useState(false);
  const [warnLargePayload, setWarnLargePayload] = useState(true);
  const [warnMissingMime, setWarnMissingMime] = useState(true);
  const [warnNonBase64Binary, setWarnNonBase64Binary] = useState(true);
  const [fileName, setFileName] = useState("");
  const [fileMimeType, setFileMimeType] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const effectiveMimeType = (customMimeType.trim() || mimeType).trim();
  const notes = useMemo(() => (result ? buildNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const runTool = () => {
    if (!input.trim()) {
      setError(actionMode === "encodeFile" ? "Choose a small file or paste file content first." : "Paste a Data URI or text value first.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      actionMode,
      outputMode,
      encodingMode,
      mimeType: effectiveMimeType,
      charset,
      includeCharset,
      trimText,
      wrapOutput,
      warnLargePayload,
      warnMissingMime,
      warnNonBase64Binary,
      fileName,
      fileMimeType,
      fileSize,
    });

    if (next.issues.some((issue) => issue.severity === "high") && !next.output) {
      setError(next.issues.find((issue) => issue.severity === "high")?.message || "Unable to process this Data URI.");
      setResult(next);
      setOutput("");
      return;
    }

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleDataUri);
    setActionMode("decode");
    setOutputMode("summary");
    setEncodingMode("base64");
    setMimeType("text/plain");
    setCustomMimeType("");
    setCharset("UTF-8");
    setIncludeCharset(true);
    setTrimText(false);
    setWrapOutput(false);
    setWarnLargePayload(true);
    setWarnMissingMime(true);
    setWarnNonBase64Binary(true);
    setFileName("");
    setFileMimeType("");
    setFileSize(0);
    clearResult();
  };

  const loadTextExample = () => {
    setInput(sampleText);
    setActionMode("encodeText");
    setOutputMode("dataUri");
    setEncodingMode("base64");
    setMimeType("text/plain");
    setCustomMimeType("");
    setCharset("UTF-8");
    setIncludeCharset(true);
    setTrimText(false);
    setWrapOutput(false);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("decode");
    setOutputMode("summary");
    setEncodingMode("base64");
    setMimeType("text/plain");
    setCustomMimeType("");
    setCharset("UTF-8");
    setIncludeCharset(true);
    setTrimText(false);
    setWrapOutput(false);
    setWarnLargePayload(true);
    setWarnMissingMime(true);
    setWarnNonBase64Binary(true);
    setFileName("");
    setFileMimeType("");
    setFileSize(0);
    clearResult();
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setActionMode("encodeFile");
    setOutputMode("dataUri");
    setEncodingMode("base64");
    setFileName(file.name);
    setFileMimeType(file.type || "application/octet-stream");
    setFileSize(file.size);
    setCustomMimeType(file.type || "application/octet-stream");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setInput(dataUrl);
      clearResult();
    } catch {
      setError("Unable to read this file in the browser.");
    }
  };

  return (
    <ToolShell
      title="Data URI Encoder Decoder"
      description="Encode text or small files into Data URIs, decode existing data URLs, inspect MIME types, Base64 payloads, charset values, and copied inline assets locally in your browser."
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Data URI, Text, or Small File</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a data: URL to decode, paste text to encode, or choose a small local file to turn into a Data URI.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setFileName("");
              setFileMimeType("");
              setFileSize(0);
              clearResult();
            }}
            placeholder={sampleDataUri}
            spellCheck={false}
            className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-gray-500">
              Data URIs usually start with <code className="rounded bg-gray-100 px-1 py-0.5">data:</code> and contain a MIME type, optional charset, and encoded payload.
            </p>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-[var(--green)] hover:text-[var(--green)]">
              Choose file
              <input type="file" className="hidden" onChange={handleFile} />
            </label>
          </div>

          {fileName ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Loaded <strong>{fileName}</strong> ({formatBytes(fileSize)}, {fileMimeType || "unknown MIME type"}). Large Data URIs can be hard to read, copy, or keep inside HTML/CSS safely.
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">Options</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                setActionMode(value as ActionMode);
                clearResult();
              }}
              options={[
                { label: "Decode Data URI", value: "decode" },
                { label: "Encode pasted text", value: "encodeText" },
                { label: "Encode loaded file", value: "encodeFile" },
                { label: "Analyze only", value: "analyze" },
              ]}
            />

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Readable summary", value: "summary" },
                { label: "Decoded text / payload", value: "decoded" },
                { label: "Data URI", value: "dataUri" },
                { label: "JSON", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "HTML snippet", value: "html" },
                { label: "CSS snippet", value: "css" },
              ]}
            />

            <YoryantraSelect
              label="Encoding"
              value={encodingMode}
              onChange={(value) => {
                setEncodingMode(value as EncodingMode);
                clearResult();
              }}
              options={[
                { label: "Base64", value: "base64" },
                { label: "Percent encoded", value: "percent" },
              ]}
            />

            <YoryantraSelect
              label="MIME Type"
              value={mimeType}
              onChange={(value) => {
                setMimeType(value as MimePreset);
                setCustomMimeType("");
                clearResult();
              }}
              options={mimeOptions}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InputField
              label="Custom MIME Type"
              value={customMimeType}
              onChange={(value) => {
                setCustomMimeType(value);
                clearResult();
              }}
              placeholder="image/svg+xml"
            />

            <InputField
              label="Charset"
              value={charset}
              onChange={(value) => {
                setCharset(value);
                clearResult();
              }}
              placeholder="UTF-8"
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <CheckboxRow
              checked={includeCharset}
              onChange={(checked) => {
                setIncludeCharset(checked);
                clearResult();
              }}
              label="Include charset for text Data URIs"
            />
            <CheckboxRow
              checked={trimText}
              onChange={(checked) => {
                setTrimText(checked);
                clearResult();
              }}
              label="Trim pasted text before encoding"
            />
            <CheckboxRow
              checked={wrapOutput}
              onChange={(checked) => {
                setWrapOutput(checked);
                clearResult();
              }}
              label="Wrap long Data URI output"
            />
            <CheckboxRow
              checked={warnLargePayload}
              onChange={(checked) => {
                setWarnLargePayload(checked);
                clearResult();
              }}
              label="Warn about large inline payloads"
            />
            <CheckboxRow
              checked={warnMissingMime}
              onChange={(checked) => {
                setWarnMissingMime(checked);
                clearResult();
              }}
              label="Warn when MIME type is missing"
            />
            <CheckboxRow
              checked={warnNonBase64Binary}
              onChange={(checked) => {
                setWarnNonBase64Binary(checked);
                clearResult();
              }}
              label="Warn when binary-looking data is not Base64"
            />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            Use Base64 for images, fonts, and binary files. Percent encoding is often easier to read for small text, SVG, JSON, or HTML snippets.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runTool}
            className="rounded-xl bg-[var(--green)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Process Data URI
          </button>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!output}
            className="rounded-xl border border-[var(--green)] px-5 py-2.5 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            {copied ? "Copied" : "Copy Output"}
          </button>
          <button
            type="button"
            onClick={loadExample}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[var(--green)] hover:text-[var(--green)]"
          >
            Load Data URI Example
          </button>
          <button
            type="button"
            onClick={loadTextExample}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[var(--green)] hover:text-[var(--green)]"
          >
            Load Text Example
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-red-300 hover:text-red-600"
          >
            Reset
          </button>
        </div>

        {error ? <Alert tone="danger" title="Could not process input" message={error} /> : null}

        {result ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                  <p className="mt-1 text-sm text-gray-500">Copy the decoded value, generated Data URI, or inspection report.</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {formatBytes(result.outputLength)} output
                </span>
              </div>

              <pre className="max-h-[520px] overflow-auto rounded-xl border border-gray-200 bg-gray-950 p-4 text-sm leading-6 text-gray-50">
                <code>{output || "No output yet."}</code>
              </pre>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-gray-900">Data URI Details</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Metric label="MIME Type" value={result.mimeType || "Not set"} />
                  <Metric label="Encoding" value={result.isBase64 ? "Base64" : "Percent/plain"} />
                  <Metric label="Decoded Size" value={formatBytes(result.byteLength)} />
                  <Metric label="Input Length" value={`${result.inputLength.toLocaleString()} chars`} />
                </div>
              </div>

              {notes.length ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
                  <div className="mt-4 space-y-3">
                    {notes.map((issue, index) => (
                      <IssueCard key={`${issue.title}-${index}`} issue={issue} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <ContentSections />
      </div>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  outputMode: OutputMode;
  encodingMode: EncodingMode;
  mimeType: string;
  charset: string;
  includeCharset: boolean;
  trimText: boolean;
  wrapOutput: boolean;
  warnLargePayload: boolean;
  warnMissingMime: boolean;
  warnNonBase64Binary: boolean;
  fileName: string;
  fileMimeType: string;
  fileSize: number;
}): Result {
  const issues: Issue[] = [];
  const rawInput = options.trimText ? options.input.trim() : options.input;
  let parsed: ParsedDataUri | null = null;
  let dataUri = "";
  let decoded = "";
  let mimeType = options.mimeType || "text/plain";
  let isBase64 = options.encodingMode === "base64";
  let byteLength = byteSize(rawInput);

  if (options.actionMode === "decode" || options.actionMode === "analyze") {
    parsed = parseDataUri(rawInput);
    if (!parsed.valid) {
      issues.push({
        severity: "high",
        title: "Invalid Data URI",
        message: parsed.error || "The pasted value does not look like a valid data: URL.",
      });
    } else {
      decoded = parsed.decodedText;
      mimeType = parsed.mimeType || "text/plain";
      isBase64 = parsed.isBase64;
      byteLength = parsed.decodedByteLength;
      dataUri = rawInput.trim();
      addDataUriWarnings(parsed, issues, options);
    }
  }

  if (options.actionMode === "encodeText") {
    dataUri = encodeTextToDataUri(rawInput, options.mimeType, options.charset, options.includeCharset, options.encodingMode);
    parsed = parseDataUri(dataUri);
    decoded = rawInput;
    mimeType = options.mimeType;
    isBase64 = options.encodingMode === "base64";
    byteLength = byteSize(rawInput);
    addGeneratedWarnings(dataUri, byteLength, issues, options);
  }

  if (options.actionMode === "encodeFile") {
    const fileDataUri = rawInput.trim();
    const fileParsed = parseDataUri(fileDataUri);

    if (!fileParsed.valid) {
      dataUri = encodeTextToDataUri(rawInput, options.fileMimeType || options.mimeType, options.charset, false, "base64");
      parsed = parseDataUri(dataUri);
      decoded = rawInput;
      mimeType = options.fileMimeType || options.mimeType;
      isBase64 = true;
      byteLength = options.fileSize || byteSize(rawInput);
      issues.push({
        severity: "info",
        title: "Encoded pasted file content as text",
        message: "The input was not a file Data URL, so the pasted content was treated as text and encoded into a Data URI.",
      });
    } else {
      dataUri = normalizeDataUriForFile(fileDataUri, options.fileMimeType || fileParsed.mimeType || options.mimeType);
      parsed = parseDataUri(dataUri);
      decoded = parsed.decodedText;
      mimeType = parsed.mimeType;
      isBase64 = parsed.isBase64;
      byteLength = options.fileSize || parsed.decodedByteLength;
      addDataUriWarnings(parsed, issues, options);
    }

    addGeneratedWarnings(dataUri, byteLength, issues, options);
  }

  const finalParsed = parsed;
  const output = formatOutput({
    mode: options.outputMode,
    action: options.actionMode,
    dataUri,
    decoded,
    parsed: finalParsed,
    issues,
    mimeType,
    isBase64,
    byteLength,
    wrapOutput: options.wrapOutput,
    fileName: options.fileName,
  });

  return {
    action: options.actionMode,
    output,
    parsed: finalParsed,
    issues,
    inputLength: options.input.length,
    outputLength: output.length,
    byteLength,
    mimeType,
    isBase64,
    preview: decoded.slice(0, 240),
  };
}

function parseDataUri(value: string): ParsedDataUri {
  const original = value.trim();
  if (!original.toLowerCase().startsWith("data:")) {
    return emptyParsed(original, "The value must start with data: to be decoded as a Data URI.");
  }

  const commaIndex = original.indexOf(",");
  if (commaIndex === -1) {
    return emptyParsed(original, "A Data URI needs a comma between the metadata section and the payload.");
  }

  const header = original.slice(5, commaIndex);
  const payload = original.slice(commaIndex + 1);
  const parts = header.split(";").filter(Boolean);
  const firstPart = parts[0] || "";
  const hasMime = firstPart.includes("/");
  const mimeType = hasMime ? firstPart.toLowerCase() : "text/plain";
  const parameters: Record<string, string> = {};
  let charset = "";
  let isBase64 = false;

  for (const part of hasMime ? parts.slice(1) : parts) {
    if (part.toLowerCase() === "base64") {
      isBase64 = true;
      continue;
    }

    const eqIndex = part.indexOf("=");
    if (eqIndex > -1) {
      const key = part.slice(0, eqIndex).trim().toLowerCase();
      const valuePart = part.slice(eqIndex + 1).trim();
      parameters[key] = valuePart;
      if (key === "charset") charset = valuePart;
    }
  }

  try {
    const decodedText = isBase64 ? decodeBase64Payload(payload) : decodePercentPayload(payload);
    return {
      valid: true,
      original,
      mediaType: header,
      mimeType,
      charset,
      isBase64,
      parameters,
      payload,
      decodedText,
      decodedByteLength: isBase64 ? estimateBase64Bytes(payload) : byteSize(decodedText),
      payloadLength: payload.length,
      headerLength: header.length + 6,
    };
  } catch (error) {
    return emptyParsed(original, error instanceof Error ? error.message : "The payload could not be decoded.");
  }
}

function emptyParsed(original: string, error: string): ParsedDataUri {
  return {
    valid: false,
    original,
    mediaType: "",
    mimeType: "",
    charset: "",
    isBase64: false,
    parameters: {},
    payload: "",
    decodedText: "",
    decodedByteLength: 0,
    payloadLength: 0,
    headerLength: 0,
    error,
  };
}

function encodeTextToDataUri(text: string, mimeType: string, charset: string, includeCharset: boolean, encoding: EncodingMode) {
  const cleanMime = mimeType.trim() || "text/plain";
  const cleanCharset = charset.trim() || "UTF-8";
  const charsetPart = includeCharset && cleanMime.startsWith("text/") ? `;charset=${cleanCharset}` : includeCharset && isTextLikeMime(cleanMime) ? `;charset=${cleanCharset}` : "";

  if (encoding === "base64") {
    return `data:${cleanMime}${charsetPart};base64,${encodeBase64Unicode(text)}`;
  }

  return `data:${cleanMime}${charsetPart},${encodeURIComponent(text).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")}`;
}

function normalizeDataUriForFile(dataUri: string, fallbackMimeType: string) {
  const parsed = parseDataUri(dataUri);
  if (!parsed.valid) return dataUri;
  if (parsed.mimeType && parsed.mimeType !== "text/plain") return dataUri;
  if (!fallbackMimeType || fallbackMimeType === parsed.mimeType) return dataUri;
  const base64Part = parsed.isBase64 ? ";base64" : "";
  return `data:${fallbackMimeType}${base64Part},${parsed.payload}`;
}

function decodeBase64Payload(payload: string) {
  const cleaned = payload.replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error("The Base64 payload contains characters that are not valid in standard Base64.");
  }

  const binary = window.atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return binary;
  }
}

function decodePercentPayload(payload: string) {
  try {
    return decodeURIComponent(payload.replace(/\+/g, "%2B"));
  } catch {
    throw new Error("The percent-encoded payload contains malformed escape sequences.");
  }
}

function encodeBase64Unicode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function estimateBase64Bytes(payload: string) {
  const cleaned = payload.replace(/\s+/g, "");
  if (!cleaned) return 0;
  const padding = cleaned.endsWith("==") ? 2 : cleaned.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((cleaned.length * 3) / 4) - padding);
}

function byteSize(value: string) {
  return new TextEncoder().encode(value).length;
}

function isTextLikeMime(mimeType: string) {
  return mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("xml") || mimeType.includes("javascript") || mimeType.includes("svg");
}

function isBinaryMime(mimeType: string) {
  return mimeType.startsWith("image/") || mimeType.startsWith("font/") || mimeType.includes("octet-stream") || mimeType.includes("pdf") || mimeType.includes("zip");
}

function addDataUriWarnings(parsed: ParsedDataUri, issues: Issue[], options: { warnLargePayload: boolean; warnMissingMime: boolean; warnNonBase64Binary: boolean }) {
  if (!parsed.valid) return;

  if (options.warnMissingMime && (!parsed.mediaType || !parsed.mediaType.includes("/"))) {
    issues.push({
      severity: "warning",
      title: "MIME type is missing",
      message: "This Data URI relies on the default text/plain media type. Add a clear MIME type when you embed assets in HTML or CSS.",
    });
  }

  if (options.warnNonBase64Binary && isBinaryMime(parsed.mimeType) && !parsed.isBase64) {
    issues.push({
      severity: "warning",
      title: "Binary asset is not Base64",
      message: "Images, fonts, and binary files are usually safer as Base64 Data URIs instead of percent-encoded payloads.",
    });
  }

  if (options.warnLargePayload && parsed.decodedByteLength > 4096) {
    issues.push({
      severity: parsed.decodedByteLength > 32768 ? "high" : "warning",
      title: "Large inline payload",
      message: "This Data URI is fairly large. Large inline assets can make HTML/CSS harder to cache, review, and maintain.",
    });
  }

  if (parsed.payload.includes("%") && parsed.isBase64) {
    issues.push({
      severity: "info",
      title: "Base64 payload contains percent signs",
      message: "A Base64 Data URI normally does not need percent escapes inside the payload. Check whether the value was copied through another encoder.",
    });
  }

  if (!parsed.charset && isTextLikeMime(parsed.mimeType)) {
    issues.push({
      severity: "info",
      title: "No charset parameter found",
      message: "Text-like Data URIs are often clearer with charset=UTF-8, especially when they contain non-ASCII characters.",
    });
  }
}

function addGeneratedWarnings(dataUri: string, byteLength: number, issues: Issue[], options: { warnLargePayload: boolean }) {
  if (options.warnLargePayload && byteLength > 4096) {
    issues.push({
      severity: byteLength > 32768 ? "high" : "warning",
      title: "Generated Data URI is large",
      message: "Small inline assets are fine, but large Data URIs can hurt readability and caching. Consider linking the asset normally.",
    });
  }

  if (dataUri.length > 2000) {
    issues.push({
      severity: "info",
      title: "Long URL-like value",
      message: "Some tools, editors, or older systems may handle very long inline URL values poorly. Test before using it in production markup.",
    });
  }
}

function formatOutput(options: {
  mode: OutputMode;
  action: ActionMode;
  dataUri: string;
  decoded: string;
  parsed: ParsedDataUri | null;
  issues: Issue[];
  mimeType: string;
  isBase64: boolean;
  byteLength: number;
  wrapOutput: boolean;
  fileName: string;
}) {
  const dataUri = options.wrapOutput && options.dataUri ? wrapLongLine(options.dataUri, 96) : options.dataUri;
  const parsed = options.parsed;
  const decoded = options.decoded || parsed?.decodedText || "";

  if (options.mode === "decoded") {
    if (options.action === "analyze") return "Analyze mode does not change the payload. Switch Output to Summary, JSON, or Markdown for inspection.";
    return decoded || parsed?.payload || dataUri;
  }

  if (options.mode === "dataUri") {
    return dataUri || parsed?.original || "";
  }

  if (options.mode === "json") {
    return JSON.stringify(
      {
        action: options.action,
        mimeType: options.mimeType,
        encoding: options.isBase64 ? "base64" : "percent/plain",
        byteLength: options.byteLength,
        dataUriLength: (options.dataUri || parsed?.original || "").length,
        fileName: options.fileName || null,
        parsed: parsed
          ? {
              valid: parsed.valid,
              mediaType: parsed.mediaType,
              mimeType: parsed.mimeType,
              charset: parsed.charset || null,
              isBase64: parsed.isBase64,
              parameters: parsed.parameters,
              payloadLength: parsed.payloadLength,
              decodedByteLength: parsed.decodedByteLength,
              error: parsed.error || null,
            }
          : null,
        issues: options.issues,
        output: options.action === "analyze" ? undefined : dataUri || decoded,
      },
      null,
      2,
    );
  }

  if (options.mode === "markdown") {
    const rows = [
      ["Action", labelAction(options.action)],
      ["MIME type", options.mimeType || parsed?.mimeType || "Not set"],
      ["Encoding", options.isBase64 ? "Base64" : "Percent/plain"],
      ["Decoded size", formatBytes(options.byteLength)],
      ["Data URI length", `${(options.dataUri || parsed?.original || "").length.toLocaleString()} characters`],
      ["Issue count", `${options.issues.length}`],
    ];

    return [`| Field | Value |`, `|---|---|`, ...rows.map(([key, value]) => `| ${escapeMarkdown(key)} | ${escapeMarkdown(value)} |`)].join("\n");
  }

  if (options.mode === "html") {
    const source = options.dataUri || parsed?.original || "";
    if (!source) return "No Data URI available for an HTML snippet.";
    if ((options.mimeType || parsed?.mimeType || "").startsWith("image/")) {
      return `<img src="${source}" alt="Inline image" />`;
    }
    return `<a href="${source}">Open inline data</a>`;
  }

  if (options.mode === "css") {
    const source = options.dataUri || parsed?.original || "";
    if (!source) return "No Data URI available for a CSS snippet.";
    return `.inline-asset {\n  background-image: url("${source}");\n}`;
  }

  return buildSummary({
    action: options.action,
    dataUri: options.dataUri || parsed?.original || "",
    decoded,
    parsed,
    issues: options.issues,
    mimeType: options.mimeType,
    isBase64: options.isBase64,
    byteLength: options.byteLength,
    fileName: options.fileName,
  });
}

function buildSummary(options: {
  action: ActionMode;
  dataUri: string;
  decoded: string;
  parsed: ParsedDataUri | null;
  issues: Issue[];
  mimeType: string;
  isBase64: boolean;
  byteLength: number;
  fileName: string;
}) {
  const lines = [
    "Data URI report",
    "===============",
    "",
    `Action: ${labelAction(options.action)}`,
    `MIME type: ${options.mimeType || options.parsed?.mimeType || "Not set"}`,
    `Encoding: ${options.isBase64 ? "Base64" : "Percent/plain"}`,
    `Decoded size: ${formatBytes(options.byteLength)}`,
    `Data URI length: ${(options.dataUri || "").length.toLocaleString()} characters`,
  ];

  if (options.fileName) lines.push(`File name: ${options.fileName}`);
  if (options.parsed?.charset) lines.push(`Charset: ${options.parsed.charset}`);

  if (options.parsed?.valid) {
    lines.push(`Payload length: ${options.parsed.payloadLength.toLocaleString()} characters`);
    lines.push(`Parameters: ${Object.keys(options.parsed.parameters).length ? Object.entries(options.parsed.parameters).map(([key, value]) => `${key}=${value}`).join(", ") : "None"}`);
  }

  if (options.issues.length) {
    lines.push("", "Review notes:");
    options.issues.forEach((issue) => {
      lines.push(`- ${issue.title}: ${issue.message}`);
    });
  } else {
    lines.push("", "Review notes: No major issues found.");
  }

  if (options.decoded) {
    lines.push("", "Decoded preview:", truncateMiddle(options.decoded, 600));
  }

  if (options.dataUri && options.action !== "analyze") {
    lines.push("", "Data URI:", truncateMiddle(options.dataUri, 900));
  }

  return lines.join("\n");
}

function buildNotes(result: Result) {
  if (result.issues.length) return result.issues;
  return [
    {
      severity: "info" as const,
      title: "No major issues found",
      message: "The Data URI structure looks usable for quick inline asset or payload inspection.",
    },
  ];
}

function labelAction(action: ActionMode) {
  const labels: Record<ActionMode, string> = {
    decode: "Decode Data URI",
    encodeText: "Encode pasted text",
    encodeFile: "Encode loaded file",
    analyze: "Analyze only",
  };
  return labels[action];
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function wrapLongLine(value: string, size: number) {
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks.join("\n");
}

function truncateMiddle(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const side = Math.floor((maxLength - 20) / 2);
  return `${value.slice(0, side)}\n... truncated ...\n${value.slice(-side)}`;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </label>
  );
}

function CheckboxRow({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 accent-[var(--gold)]"
      />
      <span>{label}</span>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const tone = issue.severity === "high" ? "border-red-200 bg-red-50 text-red-900" : issue.severity === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-100 bg-blue-50 text-blue-900";

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <p className="text-sm font-semibold">{issue.title}</p>
      <p className="mt-1 text-sm leading-relaxed opacity-90">{issue.message}</p>
    </div>
  );
}

function Alert({ tone, title, message }: { tone: "danger" | "info"; title: string; message: string }) {
  const classes = tone === "danger" ? "border-red-200 bg-red-50 text-red-900" : "border-blue-100 bg-blue-50 text-blue-900";
  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed">{message}</p>
    </div>
  );
}

function ContentSections() {
  return (
    <div className="space-y-10 pt-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900">Converting Data URIs Without Guessing the Payload</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-gray-600">
          <p>
            A Data URI, also called a data URL, lets a small asset or text payload live directly inside a URL value. You may see it in an image source, a CSS background, a copied SVG, a small font test, or a quick HTML demo. The format is useful, but it can be hard to inspect by eye because the real content is usually Base64 or percent encoded.
          </p>
          <p>
            This Data URI Encoder Decoder helps you decode existing <code className="rounded bg-gray-100 px-1 py-0.5">data:</code> URLs, generate new Data URIs from pasted text, and check the MIME type, charset, payload size, and encoding style before using the value in markup or CSS.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900">How to Use the Data URI Tool</h2>
          <ol className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
            <li><strong>1.</strong> Paste a Data URI, paste text, or choose a small local file.</li>
            <li><strong>2.</strong> Choose whether you want to decode, encode text, encode a loaded file, or only analyze the value.</li>
            <li><strong>3.</strong> Select the output format. Summary is easiest for review, while Data URI, JSON, HTML, and CSS are better for copying.</li>
            <li><strong>4.</strong> Check the review notes for missing MIME types, large payload warnings, charset notes, or binary encoding issues.</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900">Common Use Cases</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
            <li>Decode a copied image, SVG, or text Data URI to see what is inside.</li>
            <li>Create a quick Data URI for small examples, snippets, test pages, or demos.</li>
            <li>Check whether an inline asset is Base64 or percent encoded.</li>
            <li>Inspect MIME type and charset values before placing a Data URI in HTML or CSS.</li>
            <li>Convert small SVG, JSON, HTML, or text snippets into inline data URLs.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Data URI Examples</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ExampleCard
            title="Plain text Data URI"
            code="data:text/plain;charset=UTF-8,Hello%20Yoryantra"
            text="Useful for tiny readable text examples where percent encoding is easier to inspect than Base64."
          />
          <ExampleCard
            title="Base64 text Data URI"
            code="data:text/plain;charset=UTF-8;base64,SGVsbG8gWW9yeWFudHJh"
            text="Useful when the payload contains line breaks, symbols, or characters that are easier to preserve as bytes."
          />
          <ExampleCard
            title="SVG Data URI"
            code="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E..."
            text="Often used for tiny icons or CSS backgrounds, but it should stay small and readable."
          />
          <ExampleCard
            title="Image Data URI"
            code="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
            text="Common for copied screenshots or tiny icons. Larger images are usually better as normal files."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">When Data URIs Are Helpful and When They Are Not</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-gray-600">
          <p>
            Data URIs are helpful for small inline values: tiny SVG icons, test fixtures, copied demo payloads, and quick examples where a separate file would be inconvenient. They are less helpful for large images, fonts, or documents because the encoded value can become long, hard to review, and harder to cache separately.
          </p>
          <p>
            A good rule is to keep Data URIs small and intentional. If the output feels too long to review or copy safely, it is probably better to keep the asset as a normal file and reference it by URL.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">FAQs</h2>
        <div className="mt-5 space-y-5">
          <FaqItem
            question="Is anything uploaded when I use this tool?"
            answer="No. The tool runs in your browser. Pasted text and selected files are processed locally for encoding, decoding, and inspection."
          />
          <FaqItem
            question="Should I use Base64 or percent encoding for a Data URI?"
            answer="Use Base64 for images, fonts, and binary files. Percent encoding can be easier to read for small text, SVG, HTML, CSS, or JSON payloads."
          />
          <FaqItem
            question="Can I decode image Data URIs with this tool?"
            answer="Yes. The tool can inspect image Data URIs, show the MIME type, estimate decoded size, and expose the decoded payload. Binary image bytes may not look readable as text, which is normal."
          />
          <FaqItem
            question="Why does the tool warn about large Data URIs?"
            answer="Large inline payloads make HTML and CSS harder to read and may reduce caching benefits. Data URIs are usually best for small assets and quick examples."
          />
          <FaqItem
            question="Does a missing MIME type break every Data URI?"
            answer="Not always. Data URIs can fall back to text/plain, but explicit MIME types are clearer and safer when the value is used in HTML, CSS, or documentation."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Related Encoding Tools</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <RelatedTool href="/tools/base64-encoder-decoder" title="Base64 Encoder Decoder" text="Encode or decode Base64 text before building inline payloads." />
          <RelatedTool href="/tools/url-encoder-decoder" title="URL Encoder Decoder" text="Encode reserved URL characters and inspect copied URL values." />
          <RelatedTool href="/tools/percent-encoding-analyzer" title="Percent Encoding Analyzer" text="Inspect percent escapes, decoded URL values, and malformed sequences." />
          <RelatedTool href="/tools/url-safe-base64-converter" title="URL Safe Base64 Converter" text="Convert standard Base64 to URL-safe Base64 and back." />
          <RelatedTool href="/tools/unicode-escape-sequence-converter" title="Unicode Escape Sequence Converter" text="Convert Unicode escape sequences into readable text." />
          <RelatedTool href="/tools/mime-encoded-word-decoder" title="MIME Encoded-Word Decoder" text="Decode encoded email header words and subject lines." />
        </div>
      </section>
    </div>
  );
}

function ExampleCard({ title, code, text }: { title: string; code: string; text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <pre className="mt-3 overflow-auto rounded-lg bg-white p-3 text-xs leading-5 text-gray-700">
        <code>{code}</code>
      </pre>
      <p className="mt-3 text-sm leading-6 text-gray-600">{text}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h3 className="font-semibold text-gray-900">{question}</h3>
      <p className="mt-2 text-sm leading-7 text-gray-600">{answer}</p>
    </div>
  );
}

function RelatedTool({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-[var(--green)] hover:bg-white">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
    </Link>
  );
}
