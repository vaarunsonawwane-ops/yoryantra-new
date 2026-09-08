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
type Severity = "info" | "warning" | "high";

type Issue = {
  severity: Severity;
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
  decodedBytes: number;
  paddingCount: number;
  isUrlSafe: boolean;
  isProbablyJwtPart: boolean;
};

type ValidatedBase64 = {
  bytes: Uint8Array;
  standardPadded: string;
  standardUnpadded: string;
  urlPadded: string;
  urlUnpadded: string;
  paddingCount: number;
};

const sampleInput = `{"sub":"user_123","name":"Sneha","admin":false}`;
const MAX_INPUT_CHARS = 500_000;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("textToBase64Url");
  const [paddingMode, setPaddingMode] = useState<PaddingMode>("remove");
  const [textEncoding, setTextEncoding] = useState<TextEncoding>("utf8");
  const [outputCase, setOutputCase] = useState<OutputCase>("normal");
  const [trimEncodedInput, setTrimEncodedInput] = useState(true);
  const [decodeAsJson, setDecodeAsJson] = useState(true);
  const [warnInvalidChars, setWarnInvalidChars] = useState(true);
  const [warnPadding, setWarnPadding] = useState(true);
  const [warnJwtLike, setWarnJwtLike] = useState(true);
  const [warnBinaryText, setWarnBinaryText] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (result ? getNotes(result, actionMode) : []),
    [result, actionMode]
  );

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const convert = () => {
    if (input.length === 0) {
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
        trimEncodedInput,
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
      setError(
        err instanceof Error
          ? err.message
          : "Unable to convert this Base64URL value."
      );
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
    setTrimEncodedInput(true);
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
    setTrimEncodedInput(true);
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
      description="Convert text or Base64 bytes with RFC 4648's URL-safe alphabet and explicit padding rules."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">Input</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Text is preserved exactly. Encoded values may have outer whitespace trimmed when that option is enabled.
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
          <h3 className="text-lg font-semibold text-gray-900">Conversion settings</h3>

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
                { label: "Inspect Base64URL", value: "inspect" },
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
                { label: "Preserve input/default", value: "preserve" },
                { label: "Remove padding", value: "remove" },
                { label: "Add canonical padding", value: "add" },
              ]}
            />

            <YoryantraSelect
              label="Text encoding"
              value={textEncoding}
              onChange={(value) => {
                setTextEncoding(value as TextEncoding);
                clearResult();
              }}
              options={[
                { label: "UTF-8", value: "utf8" },
                { label: "Latin-1 bytes", value: "latin1" },
              ]}
            />

            <YoryantraSelect
              label="Output layout"
              value={outputCase}
              onChange={(value) => {
                setOutputCase(value as OutputCase);
                clearResult();
              }}
              options={[
                { label: "Compact", value: "normal" },
                { label: "Wrap at 76 characters", value: "lineWrapped" },
              ]}
            />

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Alphabet change</p>
              <div className="mt-2 space-y-1 font-mono text-xs text-gray-500">
                <p>+ becomes -</p>
                <p>/ becomes _</p>
                <p>= padding is protocol-dependent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Validation and display</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={trimEncodedInput} label="Trim outer whitespace from encoded input" onChange={(checked) => { setTrimEncodedInput(checked); clearResult(); }} />
          <CheckboxRow checked={decodeAsJson} label="Pretty-print decoded JSON when valid" onChange={(checked) => { setDecodeAsJson(checked); clearResult(); }} />
          <CheckboxRow checked={warnInvalidChars} label="Report alphabet and canonical-form problems" onChange={(checked) => { setWarnInvalidChars(checked); clearResult(); }} />
          <CheckboxRow checked={warnPadding} label="Explain padding state" onChange={(checked) => { setWarnPadding(checked); clearResult(); }} />
          <CheckboxRow checked={warnJwtLike} label="Flag token-like Base64URL segments" onChange={(checked) => { setWarnJwtLike(checked); clearResult(); }} />
          <CheckboxRow checked={warnBinaryText} label="Report non-text decoded bytes" onChange={(checked) => { setWarnBinaryText(checked); clearResult(); }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convert} className="yoryantra-btn min-h-11 whitespace-nowrap">Convert Base64URL</button>
        <button onClick={copyOutput} className="yoryantra-btn min-h-11 whitespace-nowrap" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Input characters" value={result.inputLength.toLocaleString()} />
          <SummaryCard label="Decoded bytes" value={result.decodedBytes.toLocaleString()} />
          <SummaryCard label="Padding" value={result.paddingCount.toLocaleString()} />
          <SummaryCard label="Canonical URL alphabet" value={result.isUrlSafe ? "yes" : "no"} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Byte representation</h3>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <InfoCard label="Standard Base64" value={result.standardBase64 || "-"} />
            <InfoCard label="Base64URL" value={result.base64Url || "-"} />
            <InfoCard label="Decoded text preview" value={result.decodedText || "-"} />
            <InfoCard label="Input used" value={result.normalizedInput || "-"} />
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {result.issues.map((issue, index) => (
            <IssueCard key={`${issue.title}-${index}`} issue={issue} />
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Interpretation notes</h3>
          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm">{copied ? "Copied" : "Copy"}</button>
          )}
        </div>
        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">{output || "Converted Base64URL output will appear here."}</pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Conversion runs in your browser. Yoryantra does not send the pasted value to a conversion API. Base64URL is reversible encoding, so decoded credentials or token material should still be treated as sensitive.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Base64URL changes the transport alphabet, not the bytes</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 4648 Base64URL carries the same six-bit values as standard Base64. The two alphabet positions that normally use <strong>+</strong> and <strong>/</strong> become <strong>-</strong> and <strong>_</strong>, which avoids characters that are awkward in URLs and filenames. Converting a valid Base64 value to Base64URL should therefore preserve the decoded bytes exactly.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Text mode first turns characters into bytes. UTF-8 is the normal choice for modern text. Latin-1 mode is intentionally narrower: every input character must fit in one byte from 0 to 255.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Padding depends on the surrounding protocol</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 4648 defines <strong>=</strong> padding, but specifications that already know the byte length can omit it. A Base64URL value with two data symbols needs two padding characters in canonical padded form; three data symbols need one. A data length that leaves one symbol modulo four cannot represent a valid Base64 quantum.
          </p>
          <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            Do not add or remove padding merely because a value appears inside a token. JWT/JWS profiles commonly omit padding, while another protocol may require the RFC 4648 padded form. Follow the specification that owns the field.
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Canonical pad bits prevent multiple spellings of the same bytes</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The unused bits in the last Base64 symbol must be zero. A decoder that ignores those bits can accept several different strings for the same byte sequence. Validation here decodes the bytes, re-encodes them canonically, and rejects a value whose meaningful symbols do not round-trip to the same representation.
          </p>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">Text decode</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              UTF-8 decode is strict. Invalid byte sequences are reported instead of being replaced with U+FFFD, because replacement characters can hide byte corruption.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">Binary payloads</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Signatures, encrypted blocks, random identifiers, and compressed data may be perfectly valid Base64URL without being text. Convert alphabet/padding without assuming those bytes are UTF-8.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JWT-shaped data is still untrusted data</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JOSE formats use Base64URL for compact segments, which makes headers and payloads easy to decode. Readability is not authenticity: signature or authentication-tag verification, algorithm constraints, issuer/audience checks, and time claims happen at a different layer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference for alphabet, padding, and canonical encoding</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <a href="https://www.rfc-editor.org/rfc/rfc4648.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 4648</a>{" "}
            defines standard Base64, the URL and filename safe alphabet, treatment of non-alphabet characters, padding, and zero pad-bit requirements. A format that embeds Base64URL can impose additional rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/url-safe-base64-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 max-h-48 overflow-auto break-all whitespace-pre-wrap font-mono text-sm text-gray-900">{value}</p>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const classes = issue.severity === "high"
    ? "border-red-200 bg-red-50 text-red-800"
    : issue.severity === "warning"
      ? "self-start border-amber-200 bg-amber-50 text-amber-800"
      : "border-gray-200 bg-gray-50 text-gray-600";
  const titleClass = issue.severity === "high"
    ? "text-red-900"
    : issue.severity === "warning"
      ? "text-amber-900"
      : "text-gray-900";

  return (
    <div className={`rounded-xl border p-4 ${classes}`}>
      <p className={`text-sm font-semibold ${titleClass}`}>{issue.title}</p>
      <p className="mt-1 text-sm leading-relaxed">{issue.message}</p>
    </div>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  paddingMode: PaddingMode;
  textEncoding: TextEncoding;
  outputCase: OutputCase;
  trimEncodedInput: boolean;
  decodeAsJson: boolean;
  warnInvalidChars: boolean;
  warnPadding: boolean;
  warnJwtLike: boolean;
  warnBinaryText: boolean;
}): Result {
  if (options.input.length > MAX_INPUT_CHARS) {
    throw new Error(`Input is too large for an interactive browser conversion. Keep it under ${MAX_INPUT_CHARS.toLocaleString()} characters.`);
  }

  const isTextInput = options.actionMode === "textToBase64Url";
  const normalizedInput = isTextInput || !options.trimEncodedInput
    ? options.input
    : options.input.trim();

  if (!isTextInput && normalizedInput.length === 0) {
    throw new Error("The encoded value is empty after trimming outer whitespace.");
  }

  const isProbablyJwtPart = /^[A-Za-z0-9_-]{20,}$/.test(normalizedInput);
  const issues: Issue[] = [];
  let bytes: Uint8Array = new Uint8Array();
  let standardBase64 = "";
  let base64Url = "";
  let decodedText = "";
  let output = "";
  let validationError = "";

  if (options.actionMode === "textToBase64Url") {
    bytes = textToBytes(normalizedInput, options.textEncoding);
    const canonical = encodeBytes(bytes);
    standardBase64 = canonical.standardPadded;
    base64Url = chooseUrlPadding(canonical.urlUnpadded, canonical.urlPadded, options.paddingMode, true);
    output = base64Url;
  } else if (options.actionMode === "base64ToBase64Url") {
    const validated = validateBase64(normalizedInput, "standard");
    bytes = validated.bytes;
    standardBase64 = validated.standardPadded;
    base64Url = chooseUrlPadding(validated.urlUnpadded, validated.urlPadded, options.paddingMode, validated.paddingCount > 0);
    output = base64Url;
  } else if (options.actionMode === "base64UrlToBase64") {
    const validated = validateBase64(normalizedInput, "url");
    bytes = validated.bytes;
    standardBase64 = validated.standardPadded;
    base64Url = normalizedInput;
    output = standardBase64;
  } else if (options.actionMode === "base64UrlToText") {
    const validated = validateBase64(normalizedInput, "url");
    bytes = validated.bytes;
    standardBase64 = validated.standardPadded;
    base64Url = normalizedInput;
    decodedText = bytesToText(bytes, options.textEncoding);
    output = formatDecodedText(decodedText, options.decodeAsJson);
  } else if (options.actionMode === "normalize") {
    const validated = validateBase64(normalizedInput, "url");
    bytes = validated.bytes;
    standardBase64 = validated.standardPadded;
    base64Url = chooseUrlPadding(validated.urlUnpadded, validated.urlPadded, options.paddingMode, validated.paddingCount > 0);
    output = base64Url;
  } else {
    try {
      const validated = validateBase64(normalizedInput, "url");
      bytes = validated.bytes;
      standardBase64 = validated.standardPadded;
      base64Url = validated.paddingCount > 0 ? validated.urlPadded : validated.urlUnpadded;
      try {
        decodedText = bytesToText(bytes, options.textEncoding);
      } catch {
        decodedText = "";
      }
    } catch (err) {
      validationError = err instanceof Error ? err.message : "Invalid Base64URL input.";
    }

    if (validationError) {
      issues.push({ severity: "high", title: "Base64URL validation failed", message: validationError });
    }

    output = formatInspection({
      normalizedInput,
      standardBase64,
      base64Url,
      decodedText,
      decodedBytes: bytes.length,
      paddingCount: countPadding(normalizedInput),
      isUrlSafe: !validationError,
      isProbablyJwtPart,
    });
  }

  if (!validationError && options.warnPadding && !isTextInput) {
    const padding = countPadding(normalizedInput);
    if (padding === 0 && normalizedInput.length % 4 !== 0) {
      issues.push({
        severity: "info",
        title: "Unpadded Base64URL form",
        message: "The value is valid without equals padding. Whether padding is allowed or required depends on the surrounding protocol.",
      });
    } else if (padding > 0) {
      issues.push({
        severity: "info",
        title: "Padding is present",
        message: "The equals signs are canonical for these bytes. Some Base64URL profiles intentionally omit them.",
      });
    }
  }

  if (!validationError && options.warnInvalidChars && !isTextInput) {
    issues.push({
      severity: "info",
      title: "Canonical byte round-trip passed",
      message: "Alphabet, padding shape, decoded bytes, and unused pad bits round-trip to the canonical representation.",
    });
  }

  if (options.warnJwtLike && isProbablyJwtPart) {
    issues.push({
      severity: "info",
      title: "Token-like segment",
      message: "The character pattern could occur in JOSE compact data. Decoding or alphabet conversion does not verify a signature, authentication tag, claims, or trust.",
    });
  }

  if (options.warnBinaryText && bytes.length > 0 && !decodedText && options.actionMode !== "textToBase64Url") {
    try {
      bytesToText(bytes, "utf8");
    } catch {
      issues.push({
        severity: "info",
        title: "Decoded bytes are not valid UTF-8 text",
        message: "The Base64 value can still be valid binary data. Use byte-oriented tooling instead of treating it as text.",
      });
    }
  }

  if (options.outputCase === "lineWrapped") {
    output = wrapLines(output, 76);
    issues.push({
      severity: "warning",
      title: "Line wrapping changes the copied representation",
      message: "The inserted line breaks are for display or transport contexts that explicitly allow them. They are not part of the Base64URL alphabet.",
    });
  }

  return {
    output,
    normalizedInput,
    standardBase64,
    base64Url,
    decodedText,
    issues,
    inputLength: normalizedInput.length,
    outputLength: output.length,
    decodedBytes: bytes.length,
    paddingCount: countPadding(base64Url || normalizedInput),
    isUrlSafe: !validationError && isStrictBase64Url(base64Url || normalizedInput, false),
    isProbablyJwtPart,
  };
}

function textToBytes(value: string, encoding: TextEncoding): Uint8Array {
  if (encoding === "utf8") {
    return new TextEncoder().encode(value);
  }

  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code > 0xFF) {
      throw new Error(`Latin-1 byte mode cannot represent U+${code.toString(16).toUpperCase().padStart(4, "0")} at character ${index}. Choose UTF-8 for this text.`);
    }
    bytes[index] = code;
  }
  return bytes;
}

function bytesToText(bytes: Uint8Array, encoding: TextEncoding): string {
  if (encoding === "latin1") {
    let output = "";
    for (let index = 0; index < bytes.length; index += 1) {
      output += String.fromCharCode(bytes[index]);
    }
    return output;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Decoded bytes are not valid UTF-8. Choose Latin-1 bytes only when that one-byte interpretation is intentional, or keep the payload as binary Base64URL.");
  }
}

function validateBase64(value: string, variant: "standard" | "url"): ValidatedBase64 {
  const equalsIndex = value.indexOf("=");
  const data = equalsIndex === -1 ? value : value.slice(0, equalsIndex);
  const padding = equalsIndex === -1 ? "" : value.slice(equalsIndex);
  const alphabet = variant === "url" ? /^[A-Za-z0-9_-]*$/ : /^[A-Za-z0-9+/]*$/;

  if (!alphabet.test(data)) {
    throw new Error(variant === "url"
      ? "Base64URL data may contain only A-Z, a-z, 0-9, hyphen, underscore, and optional trailing equals padding."
      : "Standard Base64 data may contain only A-Z, a-z, 0-9, plus, slash, and optional trailing equals padding.");
  }

  if (padding && !/^={1,2}$/.test(padding)) {
    throw new Error("Padding may contain at most two equals signs and may appear only at the end.");
  }

  const remainder = data.length % 4;
  if (remainder === 1) {
    throw new Error("A Base64 data length that leaves one symbol modulo four cannot represent a complete byte sequence.");
  }

  const expectedPadding = remainder === 2 ? 2 : remainder === 3 ? 1 : 0;
  if (padding.length > 0 && padding.length !== expectedPadding) {
    throw new Error(`Padding does not match the final Base64 quantum. This data requires ${expectedPadding} trailing equals sign${expectedPadding === 1 ? "" : "s"}.`);
  }

  if (padding.length > 0 && value.length % 4 !== 0) {
    throw new Error("A padded Base64 value must have a total length divisible by four.");
  }

  const standardData = variant === "url"
    ? data.replace(/-/g, "+").replace(/_/g, "/")
    : data;
  const padded = standardData + "=".repeat(expectedPadding);
  let binary = "";

  try {
    binary = atob(padded);
  } catch {
    throw new Error("The Base64 value could not be decoded into bytes.");
  }

  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const canonical = encodeBytes(bytes);
  const expectedData = variant === "url" ? canonical.urlUnpadded : canonical.standardUnpadded;
  if (data !== expectedData) {
    throw new Error("The final Base64 symbol contains non-zero unused pad bits or otherwise has a non-canonical byte representation.");
  }

  return {
    ...canonical,
    bytes,
    paddingCount: padding.length,
  };
}

function encodeBytes(bytes: Uint8Array): Omit<ValidatedBase64, "bytes" | "paddingCount"> {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  const standardPadded = btoa(binary);
  const standardUnpadded = standardPadded.replace(/=+$/g, "");
  const urlPadded = standardPadded.replace(/\+/g, "-").replace(/\//g, "_");
  const urlUnpadded = urlPadded.replace(/=+$/g, "");
  return { standardPadded, standardUnpadded, urlPadded, urlUnpadded };
}

function chooseUrlPadding(unpadded: string, padded: string, mode: PaddingMode, inputHadPadding: boolean): string {
  if (mode === "remove") return unpadded;
  if (mode === "add") return padded;
  return inputHadPadding ? padded : unpadded;
}

function formatDecodedText(value: string, prettyJson: boolean): string {
  if (!prettyJson) return value;
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function isStrictBase64Url(value: string, textInput: boolean): boolean {
  if (textInput) return true;
  try {
    validateBase64(value, "url");
    return true;
  } catch {
    return false;
  }
}

function countPadding(value: string): number {
  const match = value.match(/=+$/);
  return match ? match[0].length : 0;
}

function wrapLines(value: string, width: number): string {
  if (!value) return value;
  const lines: string[] = [];
  for (let index = 0; index < value.length; index += width) {
    lines.push(value.slice(index, index + width));
  }
  return lines.join("\n");
}

function formatInspection(data: {
  normalizedInput: string;
  standardBase64: string;
  base64Url: string;
  decodedText: string;
  decodedBytes: number;
  paddingCount: number;
  isUrlSafe: boolean;
  isProbablyJwtPart: boolean;
}): string {
  return [
    "Base64URL inspection",
    "--------------------",
    `Input characters: ${data.normalizedInput.length}`,
    `Decoded bytes: ${data.decodedBytes}`,
    `Padding characters: ${data.paddingCount}`,
    `Canonical Base64URL: ${data.isUrlSafe ? "yes" : "no"}`,
    `Token-like segment: ${data.isProbablyJwtPart ? "yes" : "no"}`,
    "",
    `Standard Base64: ${data.standardBase64 || "-"}`,
    `Base64URL: ${data.base64Url || "-"}`,
    "",
    "Decoded UTF-8 preview:",
    data.decodedText || "-",
  ].join("\n");
}

function getNotes(result: Result, actionMode: ActionMode): Array<{ title: string; message: string }> {
  const notes: Array<{ title: string; message: string }> = [];

  if (result.isProbablyJwtPart) {
    notes.push({
      title: "Decoding is not verification",
      message: "A readable JOSE segment can still come from a forged, expired, wrongly scoped, or otherwise untrusted token.",
    });
  }

  if (actionMode === "base64UrlToText") {
    notes.push({
      title: "Text is one interpretation of the bytes",
      message: "UTF-8 mode is deliberately strict. A valid Base64URL payload can instead contain arbitrary binary data.",
    });
  }

  notes.push({
    title: "Encoding provides no secrecy",
    message: "Base64URL changes representation only. Anyone who receives the value can recover the encoded bytes.",
  });

  return notes;
}
