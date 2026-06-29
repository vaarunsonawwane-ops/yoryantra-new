"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode =
  | "textToBase64Url"
  | "base64UrlToText"
  | "base64ToBase64Url"
  | "base64UrlToBase64"
  | "normalize"
  | "inspect";

type PaddingMode = "preserve" | "remove" | "add";
type TextEncoding = "utf8" | "latin1";
type OutputCase = "normal" | "lineWrapped";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  normalizedInput: string;
  standardBase64: string;
  base64Url: string;
  decodedText: string;
  issues: Issue[];
  inputLength: number;
  outputLength: number;
  paddingCount: number;
  isUrlSafe: boolean;
  isProbablyJwtPart: boolean;
};

const sampleInput = `{"sub":"user_123","name":"Yoryantra","admin":false}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("textToBase64Url");
  const [paddingMode, setPaddingMode] = useState<PaddingMode>("remove");
  const [textEncoding, setTextEncoding] = useState<TextEncoding>("utf8");
  const [outputCase, setOutputCase] = useState<OutputCase>("normal");
  const [trimInput, setTrimInput] = useState(true);
  const [decodeAsJson, setDecodeAsJson] = useState(true);
  const [warnInvalidChars, setWarnInvalidChars] = useState(true);
  const [warnPadding, setWarnPadding] = useState(true);
  const [warnJwtLike, setWarnJwtLike] = useState(true);
  const [warnBinaryText, setWarnBinaryText] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result, actionMode) : []), [result, actionMode]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const convert = () => {
    if (!input) {
      setError("Please enter text, Base64, or Base64URL input.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildResult({
        input,
        actionMode,
        paddingMode,
        textEncoding,
        outputCase,
        trimInput,
        decodeAsJson,
        warnInvalidChars,
        warnPadding,
        warnJwtLike,
        warnBinaryText,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to convert this Base64URL value.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setActionMode("textToBase64Url");
    setPaddingMode("remove");
    setTextEncoding("utf8");
    setOutputCase("normal");
    setTrimInput(true);
    setDecodeAsJson(true);
    setWarnInvalidChars(true);
    setWarnPadding(true);
    setWarnJwtLike(true);
    setWarnBinaryText(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("textToBase64Url");
    setPaddingMode("remove");
    setTextEncoding("utf8");
    setOutputCase("normal");
    setTrimInput(true);
    setDecodeAsJson(true);
    setWarnInvalidChars(true);
    setWarnPadding(true);
    setWarnJwtLike(true);
    setWarnBinaryText(true);
    clearResult();
  };

  return (
    <ToolShell
      title="URL Safe Base64 Converter"
      description="Convert between Base64 and URL-safe Base64. Encode text to Base64URL, decode Base64URL to text, add or remove padding, and validate web-safe tokens."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              Input
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste text, standard Base64, Base64URL, or a JWT segment.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleInput}
            spellCheck={false}
            className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                setActionMode(value as ActionMode);
                clearResult();
              }}
              options={[
                { label: "Text to Base64URL", value: "textToBase64Url" },
                { label: "Base64URL to text", value: "base64UrlToText" },
                { label: "Base64 to Base64URL", value: "base64ToBase64Url" },
                { label: "Base64URL to Base64", value: "base64UrlToBase64" },
                { label: "Normalize Base64URL", value: "normalize" },
                { label: "Inspect input", value: "inspect" },
              ]}
            />

            <YoryantraSelect
              label="Padding"
              value={paddingMode}
              onChange={(value) => {
                setPaddingMode(value as PaddingMode);
                clearResult();
              }}
              options={[
                { label: "Preserve padding", value: "preserve" },
                { label: "Remove padding", value: "remove" },
                { label: "Add padding", value: "add" },
              ]}
            />

            <YoryantraSelect
              label="Text Encoding"
              value={textEncoding}
              onChange={(value) => {
                setTextEncoding(value as TextEncoding);
                clearResult();
              }}
              options={[
                { label: "UTF-8", value: "utf8" },
                { label: "Latin-1 style", value: "latin1" },
              ]}
            />

            <YoryantraSelect
              label="Output Format"
              value={outputCase}
              onChange={(value) => {
                setOutputCase(value as OutputCase);
                clearResult();
              }}
              options={[
                { label: "Normal", value: "normal" },
                { label: "Wrap lines at 76 chars", value: "lineWrapped" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">Base64URL changes</p>
              <div className="mt-2 space-y-1 font-mono text-xs text-gray-500">
                <p>+ becomes -</p>
                <p>/ becomes _</p>
                <p>= padding is often removed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={trimInput} label="Trim input before converting" onChange={(checked) => { setTrimInput(checked); clearResult(); }} />
          <CheckboxRow checked={decodeAsJson} label="Pretty-print decoded JSON when possible" onChange={(checked) => { setDecodeAsJson(checked); clearResult(); }} />
          <CheckboxRow checked={warnInvalidChars} label="Warn about invalid Base64URL characters" onChange={(checked) => { setWarnInvalidChars(checked); clearResult(); }} />
          <CheckboxRow checked={warnPadding} label="Warn about missing or unusual padding" onChange={(checked) => { setWarnPadding(checked); clearResult(); }} />
          <CheckboxRow checked={warnJwtLike} label="Warn when input looks like JWT parts" onChange={(checked) => { setWarnJwtLike(checked); clearResult(); }} />
          <CheckboxRow checked={warnBinaryText} label="Warn when decoded output may be binary" onChange={(checked) => { setWarnBinaryText(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Base64URL conversion runs locally in your browser. Avoid pasting live secrets or production tokens unless needed.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convert} className="yoryantra-btn">
          Convert Base64URL
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
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

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Input Length" value={result.inputLength.toLocaleString()} />
          <SummaryCard label="Output Length" value={result.outputLength.toLocaleString()} />
          <SummaryCard label="Padding" value={result.paddingCount.toLocaleString()} />
          <SummaryCard label="URL Safe" value={result.isUrlSafe ? "yes" : "no"} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Base64URL Details</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoCard label="Standard Base64" value={result.standardBase64 || "-"} />
            <InfoCard label="Base64URL" value={result.base64Url || "-"} />
            <InfoCard label="Decoded Text Preview" value={result.decodedText || "-"} />
            <InfoCard label="Normalized Input" value={result.normalizedInput || "-"} />
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Base64URL findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Base64URL guidance</h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Converted Base64URL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool converts pasted text locally in your browser. It does not verify JWT signatures, validate tokens, or contact any API.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Converting Base64 to URL-Safe Base64</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Standard Base64 can contain characters such as plus, slash, and equals signs. Those characters can be awkward in URLs, filenames, tokens, and query strings. Base64URL replaces those characters with URL-safe alternatives.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This URL Safe Base64 Converter helps convert standard Base64, Base64URL, readable text, and JWT-style payload segments without sending data away from your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the URL Safe Base64 Converter</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text, standard Base64, Base64URL, or a token segment.</li>
            <li>Choose the conversion action.</li>
            <li>Choose whether padding should be preserved, removed, or added.</li>
            <li>Review URL safety, padding, and token-style warnings.</li>
            <li>Copy the converted output for debugging, APIs, JWTs, or URL-safe storage.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Base64URL Differences</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>+</strong> becomes <strong>-</strong>.</li>
            <li><strong>/</strong> becomes <strong>_</strong>.</li>
            <li><strong>=</strong> padding is often removed.</li>
            <li>Base64URL is commonly used in JWTs and web-safe token formats.</li>
            <li>Base64URL is encoding, not encryption.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Conversion</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Text: {"sub":"user_123"}
Base64: eyJzdWIiOiJ1c2VyXzEyMyJ9
Base64URL: eyJzdWIiOiJ1c2VyXzEyMyJ9`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Base64URL Is Not Token Verification</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Decoding a JWT header or payload only makes the encoded text readable. It does not prove the token is valid, trusted, current, or correctly signed.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool for encoding and decoding convenience, then use proper JWT verification, API validation, or security tooling where trust matters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What is Base64URL?">
              Base64URL is a URL-safe version of Base64 that replaces plus and slash characters and often removes equals padding.
            </Faq>

            <Faq title="Can this decode JWT payloads?">
              It can decode JWT-style Base64URL segments, but it does not verify token signatures or claims.
            </Faq>

            <Faq title="Should Base64URL include padding?">
              Many web token formats omit padding. Some systems expect padding, so this tool can add, remove, or preserve it.
            </Faq>

            <Faq title="Is Base64URL encryption?">
              No. Base64URL is reversible encoding, not encryption.
            </Faq>

            <Faq title="Is anything uploaded when I convert Base64URL?">
              No. Conversion runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/url-safe-base64-converter" />
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words font-mono text-sm text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  paddingMode: PaddingMode;
  textEncoding: TextEncoding;
  outputCase: OutputCase;
  trimInput: boolean;
  decodeAsJson: boolean;
  warnInvalidChars: boolean;
  warnPadding: boolean;
  warnJwtLike: boolean;
  warnBinaryText: boolean;
}): Result {
  const normalizedInput = options.trimInput ? options.input.trim() : options.input;
  const isProbablyJwtPart = /^[A-Za-z0-9_-]+$/.test(normalizedInput) && normalizedInput.length > 20;
  let standardBase64 = "";
  let base64Url = "";
  let decodedText = "";
  let output = "";

  if (options.actionMode === "textToBase64Url") {
    standardBase64 = encodeTextToBase64(normalizedInput, options.textEncoding);
    base64Url = applyPadding(standardToUrlSafe(standardBase64), options.paddingMode);
    output = base64Url;
  } else if (options.actionMode === "base64UrlToText") {
    base64Url = normalizedInput;
    standardBase64 = urlSafeToStandard(normalizedInput);
    decodedText = decodeBase64ToText(standardBase64, options.textEncoding);
    output = formatDecodedText(decodedText, options.decodeAsJson);
  } else if (options.actionMode === "base64ToBase64Url") {
    standardBase64 = normalizedInput;
    base64Url = applyPadding(standardToUrlSafe(normalizedInput), options.paddingMode);
    output = base64Url;
  } else if (options.actionMode === "base64UrlToBase64") {
    base64Url = normalizedInput;
    standardBase64 = applyStandardPadding(urlSafeToStandard(normalizedInput));
    output = standardBase64;
  } else if (options.actionMode === "normalize") {
    base64Url = applyPadding(standardToUrlSafe(urlSafeToStandard(normalizedInput)), options.paddingMode);
    standardBase64 = applyStandardPadding(urlSafeToStandard(base64Url));
    output = base64Url;
  } else {
    base64Url = standardToUrlSafe(urlSafeToStandard(normalizedInput));
    standardBase64 = applyStandardPadding(urlSafeToStandard(normalizedInput));
    try {
      decodedText = decodeBase64ToText(standardBase64, options.textEncoding);
    } catch {
      decodedText = "";
    }
    output = formatInspection({
      normalizedInput,
      standardBase64,
      base64Url,
      decodedText,
      paddingCount: countPadding(normalizedInput),
      isUrlSafe: isUrlSafeBase64(normalizedInput),
      isProbablyJwtPart,
    });
  }

  if (options.outputCase === "lineWrapped") {
    output = wrapLines(output, 76);
  }

  const issues = buildIssues({
    normalizedInput,
    output,
    standardBase64,
    base64Url,
    decodedText,
    isProbablyJwtPart,
    options,
  });

  return {
    output,
    normalizedInput,
    standardBase64,
    base64Url,
    decodedText,
    issues,
    inputLength: normalizedInput.length,
    outputLength: output.length,
    paddingCount: countPadding(normalizedInput),
    isUrlSafe: isUrlSafeBase64(base64Url || normalizedInput),
    isProbablyJwtPart,
  };
}

function encodeTextToBase64(value: string, encoding: TextEncoding) {
  if (encoding === "latin1") {
    return btoa(value);
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function decodeBase64ToText(value: string, encoding: TextEncoding) {
  const padded = applyStandardPadding(value);
  const binary = atob(padded);

  if (encoding === "latin1") {
    return binary;
  }

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function standardToUrlSafe(value: string) {
  return value.replace(/\+/g, "-").replace(/\//g, "_");
}

function urlSafeToStandard(value: string) {
  return value.replace(/-/g, "+").replace(/_/g, "/");
}

function applyPadding(value: string, mode: PaddingMode) {
  if (mode === "remove") return value.replace(/=+$/g, "");
  if (mode === "add") return applyUrlSafePadding(value);
  return value;
}

function applyUrlSafePadding(value: string) {
  const clean = value.replace(/=+$/g, "");
  const remainder = clean.length % 4;
  if (remainder === 0) return clean;
  return clean + "=".repeat(4 - remainder);
}

function applyStandardPadding(value: string) {
  const clean = value.replace(/=+$/g, "");
  const remainder = clean.length % 4;
  if (remainder === 0) return clean;
  return clean + "=".repeat(4 - remainder);
}

function formatDecodedText(value: string, prettyJson: boolean) {
  if (!prettyJson) return value;

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function buildIssues(params: {
  normalizedInput: string;
  output: string;
  standardBase64: string;
  base64Url: string;
  decodedText: string;
  isProbablyJwtPart: boolean;
  options: {
    actionMode: ActionMode;
    warnInvalidChars: boolean;
    warnPadding: boolean;
    warnJwtLike: boolean;
    warnBinaryText: boolean;
  };
}) {
  const issues: Issue[] = [];

  if (params.options.warnInvalidChars && ["base64UrlToText", "base64UrlToBase64", "normalize", "inspect"].includes(params.options.actionMode)) {
    if (/[^A-Za-z0-9_\-=]/.test(params.normalizedInput)) {
      issues.push({
        severity: "warning",
        title: "Invalid Base64URL characters",
        message: "Base64URL should normally contain letters, numbers, hyphen, underscore, and optional equals padding.",
      });
    }
  }

  if (params.options.warnPadding && params.normalizedInput.length % 4 === 1 && ["base64UrlToText", "base64UrlToBase64", "normalize"].includes(params.options.actionMode)) {
    issues.push({
      severity: "warning",
      title: "Unusual Base64 length",
      message: "The input length leaves a remainder of 1 when divided by 4, which often indicates a malformed Base64 value.",
    });
  }

  if (params.options.warnJwtLike && params.isProbablyJwtPart) {
    issues.push({
      severity: "info",
      title: "Input looks like a token segment",
      message: "This may be a JWT-style Base64URL segment. Decoding it does not verify signatures, claims, or trust.",
    });
  }

  if (params.options.warnBinaryText && params.decodedText && /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(params.decodedText)) {
    issues.push({
      severity: "info",
      title: "Decoded output may contain binary data",
      message: "The decoded text contains control characters. It may not be safe to display as plain text.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Base64URL conversion ready",
      message: "No obvious Base64URL warning was found.",
    });
  }

  return issues;
}

function isUrlSafeBase64(value: string) {
  return /^[A-Za-z0-9_\-=]*$/.test(value) && !value.includes("+") && !value.includes("/");
}

function countPadding(value: string) {
  const match = value.match(/=+$/);
  return match ? match[0].length : 0;
}

function wrapLines(value: string, width: number) {
  return value.replace(new RegExp(`(.{1,${width}})`, "g"), "$1\n").trim();
}

function formatInspection(data: {
  normalizedInput: string;
  standardBase64: string;
  base64Url: string;
  decodedText: string;
  paddingCount: number;
  isUrlSafe: boolean;
  isProbablyJwtPart: boolean;
}) {
  return [
    "Base64URL Inspection",
    "--------------------",
    `Input length: ${data.normalizedInput.length}`,
    `Padding characters: ${data.paddingCount}`,
    `URL safe: ${data.isUrlSafe ? "yes" : "no"}`,
    `Looks like token segment: ${data.isProbablyJwtPart ? "yes" : "no"}`,
    "",
    `Standard Base64: ${data.standardBase64 || "-"}`,
    `Base64URL: ${data.base64Url || "-"}`,
    "",
    "Decoded preview:",
    data.decodedText || "-",
  ].join("\n");
}

function getNotes(result: Result, actionMode: ActionMode) {
  const notes: { title: string; message: string }[] = [];

  if (result.isProbablyJwtPart) {
    notes.push({
      title: "Decoding is not verification",
      message: "JWT-style Base64URL data can be decoded without proving that the token is trusted or signed correctly.",
    });
  }

  if (actionMode === "base64UrlToText") {
    notes.push({
      title: "Decoded output may be structured data",
      message: "Many Base64URL payloads contain JSON. Pretty-printing helps when the decoded value is valid JSON.",
    });
  }

  notes.push({
    title: "Base64URL is reversible",
    message: "Do not treat Base64URL as encryption. Anyone with the value can decode it.",
  });

  return notes;
}
