"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "decode" | "encode" | "analyze" | "normalize";
type OutputMode =
  | "plain"
  | "summary"
  | "json"
  | "markdown"
  | "csv"
  | "checklist";
type EncodingMode = "auto" | "base64" | "q";
type CharsetMode =
  | "utf-8"
  | "iso-8859-1"
  | "windows-1252"
  | "us-ascii";
type HeaderKind = "subject" | "display-name" | "comment" | "generic";

type EncodedWordPart = {
  index: number;
  raw: string;
  charset: string;
  encoding: "B" | "Q";
  encodedText: string;
  decodedText: string;
  start: number;
  end: number;
  byteLength: number;
  hasError: boolean;
  errorMessage: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  decodedText: string;
  encodedText: string;
  parts: EncodedWordPart[];
  issues: Issue[];
  inputLength: number;
  decodedLength: number;
  encodedWordCount: number;
  charsetCount: number;
};

type Note = {
  title: string;
  message: string;
};

const sampleInput = `Subject: =?UTF-8?B?V29ybGQ=?=
From: =?UTF-8?Q?Varoun_Sonawane?= <hello@yoryantra.com>`;

const charsetOptions = [
  { label: "UTF-8", value: "utf-8" },
  { label: "ISO-8859-1", value: "iso-8859-1" },
  { label: "Windows-1252", value: "windows-1252" },
  { label: "US-ASCII", value: "us-ascii" },
];

const encodingOptions = [
  { label: "Auto choose", value: "auto" },
  { label: "Base64 (B)", value: "base64" },
  { label: "Q encoding", value: "q" },
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("decode");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [encodingMode, setEncodingMode] =
    useState<EncodingMode>("auto");
  const [charsetMode, setCharsetMode] =
    useState<CharsetMode>("utf-8");
  const [headerKind, setHeaderKind] =
    useState<HeaderKind>("subject");

  const [unfoldHeaders, setUnfoldHeaders] = useState(true);
  const [joinAdjacentWords, setJoinAdjacentWords] = useState(true);
  const [preserveHeaderNames, setPreserveHeaderNames] = useState(true);
  const [warnUnsupportedCharset, setWarnUnsupportedCharset] =
    useState(true);
  const [warnBrokenWords, setWarnBrokenWords] = useState(true);
  const [warnLongHeaderLines, setWarnLongHeaderLines] = useState(true);
  const [wrapEncodedLines, setWrapEncodedLines] = useState(true);

  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (result ? getNotes(result) : []),
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const processHeader = () => {
    if (!input.trim()) {
      setError(
        "Paste an email header, subject line, display name, or plain text value first."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const next = buildResult({
        input,
        actionMode,
        outputMode,
        encodingMode,
        charsetMode,
        headerKind,
        unfoldHeaders,
        joinAdjacentWords,
        preserveHeaderNames,
        warnUnsupportedCharset,
        warnBrokenWords,
        warnLongHeaderLines,
        wrapEncodedLines,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to process this MIME header."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError(
        "The output could not be copied. Select and copy it manually."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(sampleInput);
    setActionMode("decode");
    setOutputMode("summary");
    setEncodingMode("auto");
    setCharsetMode("utf-8");
    setHeaderKind("subject");
    setUnfoldHeaders(true);
    setJoinAdjacentWords(true);
    setPreserveHeaderNames(true);
    setWarnUnsupportedCharset(true);
    setWarnBrokenWords(true);
    setWarnLongHeaderLines(true);
    setWrapEncodedLines(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("decode");
    setOutputMode("summary");
    setEncodingMode("auto");
    setCharsetMode("utf-8");
    setHeaderKind("subject");
    setUnfoldHeaders(true);
    setJoinAdjacentWords(true);
    setPreserveHeaderNames(true);
    setWarnUnsupportedCharset(true);
    setWarnBrokenWords(true);
    setWarnLongHeaderLines(true);
    setWrapEncodedLines(true);
    clearResult();
  };

  return (
    <ToolShell
      title="MIME Encoded-Word Decoder"
      description="Decode, analyze, normalize, or create RFC 2047 MIME encoded-words for email subjects and display names with strict Base64/Q validation, charset handling, and byte-aware header diagnostics."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Email Header or Text
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Paste an encoded subject or display name, a folded header, or
          plain text you want to encode.
        </p>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleInput}
          spellCheck={false}
          className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <YoryantraSelect
            label="Action"
            value={actionMode}
            onChange={(value) => {
              setActionMode(value as ActionMode);
              clearResult();
            }}
            options={[
              { label: "Decode encoded words", value: "decode" },
              { label: "Encode text as MIME word", value: "encode" },
              { label: "Analyze header only", value: "analyze" },
              { label: "Normalize decoded header", value: "normalize" },
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
              { label: "Plain text", value: "plain" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
              { label: "CSV", value: "csv" },
              { label: "Review checklist", value: "checklist" },
            ]}
          />

          <YoryantraSelect
            label="Encoding for New Words"
            value={encodingMode}
            onChange={(value) => {
              setEncodingMode(value as EncodingMode);
              clearResult();
            }}
            options={encodingOptions}
          />

          <YoryantraSelect
            label="Charset for New Words"
            value={charsetMode}
            onChange={(value) => {
              setCharsetMode(value as CharsetMode);
              clearResult();
            }}
            options={charsetOptions}
          />

          <YoryantraSelect
            label="Header Type"
            value={headerKind}
            onChange={(value) => {
              setHeaderKind(value as HeaderKind);
              clearResult();
            }}
            options={[
              { label: "Subject header", value: "subject" },
              { label: "Display name", value: "display-name" },
              { label: "Comment text", value: "comment" },
              { label: "Generic header text", value: "generic" },
            ]}
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <CheckboxRow
            checked={unfoldHeaders}
            label="Unfold multiline email headers"
            onChange={(value) => {
              setUnfoldHeaders(value);
              clearResult();
            }}
          />
          <CheckboxRow
            checked={joinAdjacentWords}
            label="Join adjacent encoded words cleanly"
            onChange={(value) => {
              setJoinAdjacentWords(value);
              clearResult();
            }}
          />
          <CheckboxRow
            checked={preserveHeaderNames}
            label="Preserve header names like Subject:"
            onChange={(value) => {
              setPreserveHeaderNames(value);
              clearResult();
            }}
          />
          <CheckboxRow
            checked={wrapEncodedLines}
            label="Wrap encoded output for email headers"
            onChange={(value) => {
              setWrapEncodedLines(value);
              clearResult();
            }}
          />
          <CheckboxRow
            checked={warnUnsupportedCharset}
            label="Warn about unsupported charsets"
            onChange={(value) => {
              setWarnUnsupportedCharset(value);
              clearResult();
            }}
          />
          <CheckboxRow
            checked={warnBrokenWords}
            label="Warn about malformed encoded-word syntax"
            onChange={(value) => {
              setWarnBrokenWords(value);
              clearResult();
            }}
          />
          <CheckboxRow
            checked={warnLongHeaderLines}
            label="Warn about very long header lines"
            onChange={(value) => {
              setWarnLongHeaderLines(value);
              clearResult();
            }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processHeader}
          className="yoryantra-btn"
        >
          Process Header
        </button>

        <button
          type="button"
          onClick={copyOutput}
          className="yoryantra-btn"
          disabled={!output}
        >
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
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

      {result ? (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Encoded Words"
              value={result.encodedWordCount.toLocaleString()}
            />
            <SummaryCard
              label="Charsets"
              value={result.charsetCount.toLocaleString()}
            />
            <SummaryCard
              label="Decoded Length"
              value={result.decodedLength.toLocaleString()}
            />
            <SummaryCard
              label="Findings"
              value={result.issues.length.toLocaleString()}
            />
          </div>

          {result.parts.length > 0 ? (
            <div className="mt-8 overflow-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Charset</th>
                    <th className="px-4 py-3">Encoding</th>
                    <th className="px-4 py-3">Bytes</th>
                    <th className="px-4 py-3">Decoded Preview</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.parts.map((part) => (
                    <tr key={`${part.index}-${part.start}`}>
                      <td className="px-4 py-3">{part.index + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {part.charset}
                      </td>
                      <td className="px-4 py-3">{part.encoding}</td>
                      <td className="px-4 py-3">{part.byteLength}</td>
                      <td className="px-4 py-3 break-words">
                        {truncate(
                          part.decodedText || part.encodedText,
                          100
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {part.hasError ? part.errorMessage : "decoded"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {result.issues.length > 0 ? (
            <div className="mt-6 space-y-3">
              {result.issues.map((issue, index) => (
                <div
                  key={`${issue.title}-${index}`}
                  className={`rounded-xl border p-4 ${
                    issue.severity === "high"
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="font-semibold text-gray-900">
                    {issue.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">
                    {issue.message}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {notes.length > 0 ? (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
              {notes.map((note) => (
                <div key={note.title} className="mb-3 last:mb-0">
                  <p className="font-semibold text-blue-900">
                    {note.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-blue-800">
                    {note.message}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-2">
            <OutputBox
              title="Decoded Text"
              text={result.decodedText}
            />
            <OutputBox
              title="Encoded-Word Output"
              text={result.encodedText}
            />
          </div>
        </>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
        </div>
        <pre className="yoryantra-output min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "MIME encoded-word output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Processing happens in your browser. This tool does not send the
        email-header text you paste to a MIME-decoding service. Site-wide
        analytics or advertising scripts, if enabled, are separate from the
        MIME processing operation itself.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Decode MIME and RFC 2047 Email Headers Carefully
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 2047 encoded-words carry a charset, an encoding marker
            (B or Q), and encoded text. All three pieces matter. Decoding
            Base64 bytes with the wrong charset can produce believable but
            incorrect text, so the tool exposes the charset and any
            decoding warning instead of returning only a final string.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Malformed Encoded-Words Are Not Silently Repaired
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            An encoded-word cannot contain raw space or tab characters
            inside its encoded-text. B encoding is checked as canonical
            Base64, including padding position and unused pad bits. In Q
            encoding, every equals sign must be followed by two hexadecimal
            digits. Invalid forms remain visible with a warning instead of
            being normalized into apparently valid data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Header Length Is Measured in Octets
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Internationalized email can use UTF-8 directly under RFC 6532,
            so JavaScript&apos;s <code>string.length</code> is not a safe
            transport-length measurement. The long-line check counts UTF-8
            octets with <code>TextEncoder</code> and flags physical lines
            above the 998-octet limit from Internet Message Format.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The 75-Character Encoded-Word Limit
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 2047 limits each encoded-word to 75 characters including
            delimiters and charset. When wrapping is enabled, the encoder
            creates multiple complete encoded-words and folds between them
            instead of slicing through an encoded payload.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Q Encoding Depends on Header Context
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 2047 permits a broader set of printable Q-encoded
            characters in unstructured text than in a phrase such as a
            display name. The encoder here uses a conservative printable
            subset and escapes punctuation that is restricted or ambiguous
            across those contexts. Spaces become underscores.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            MIME Encoded-Words Are for Header Text, Not Message Bodies
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Encoded-words are a header mechanism. They are not a general
            MIME body-transfer encoder and should not be used as a substitute
            for Content-Transfer-Encoding rules on message bodies or
            attachments. Modern UTF-8 email under RFC 6532 can also permit
            UTF-8 directly in supported header fields, so RFC 2047 encoding
            is not always required by every modern mail path.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Official References
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <a
              href="https://www.rfc-editor.org/rfc/rfc2047.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] hover:underline"
            >
              RFC 2047 →
            </a>
            <a
              href="https://www.rfc-editor.org/rfc/rfc5322.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] hover:underline"
            >
              RFC 5322 →
            </a>
            <a
              href="https://www.rfc-editor.org/rfc/rfc6532.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] hover:underline"
            >
              RFC 6532 →
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/mime-encoded-word-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
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

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function OutputBox({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const copy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // The main output still remains selectable if clipboard access fails.
    }
  };

  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {text ? (
          <button
            type="button"
            onClick={copy}
            className="yoryantra-btn-outline text-sm"
          >
            Copy
          </button>
        ) : null}
      </div>

      <pre className="mt-4 yoryantra-output min-h-[200px] overflow-auto whitespace-pre-wrap break-words text-sm">
        {text || `${title} will appear here.`}
      </pre>
    </div>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  outputMode: OutputMode;
  encodingMode: EncodingMode;
  charsetMode: CharsetMode;
  headerKind: HeaderKind;
  unfoldHeaders: boolean;
  joinAdjacentWords: boolean;
  preserveHeaderNames: boolean;
  warnUnsupportedCharset: boolean;
  warnBrokenWords: boolean;
  warnLongHeaderLines: boolean;
  wrapEncodedLines: boolean;
}): Result {
  const rawTrimmed = options.input.trim();
  const preparedInput = options.unfoldHeaders
    ? unfoldHeaderLines(rawTrimmed)
    : rawTrimmed;

  const parts = parseEncodedWords(
    preparedInput,
    options.warnUnsupportedCharset
  );

  const decodedText = decodeHeaderText(
    preparedInput,
    parts,
    options
  );

  const splitForEncoding = splitHeaderName(
    preparedInput,
    options.preserveHeaderNames,
    options.headerKind
  );

  const encodeSource =
    options.actionMode === "encode"
      ? splitForEncoding.body
      : stripHeaderName(decodedText || preparedInput);

  const encodedText = encodeHeaderText(encodeSource, {
    encodingMode: options.encodingMode,
    charsetMode: options.charsetMode,
    headerKind: options.headerKind,
    wrapEncodedLines: options.wrapEncodedLines,
    preserveHeaderNames: options.preserveHeaderNames,
    originalHeaderName: splitForEncoding.headerName,
  });

  const issues = buildIssues(
    options.input,
    preparedInput,
    decodedText,
    parts,
    options
  );

  const output = formatOutput({
    input: preparedInput,
    actionMode: options.actionMode,
    outputMode: options.outputMode,
    decodedText,
    encodedText,
    parts,
    issues,
    headerKind: options.headerKind,
  });

  return {
    output,
    decodedText,
    encodedText,
    parts,
    issues,
    inputLength: preparedInput.length,
    decodedLength: decodedText.length,
    encodedWordCount: parts.length,
    charsetCount: new Set(
      parts.map((part) => normalizeCharset(part.charset))
    ).size,
  };
}

function unfoldHeaderLines(input: string) {
  return input.replace(/\r?\n[\t ]+/g, " ");
}

function parseEncodedWords(
  input: string,
  warnUnsupportedCharset: boolean
): EncodedWordPart[] {
  const regex = /=\?([^?\s]+)\?([bBqQ])\?([^?]*)\?=/g;
  const parts: EncodedWordPart[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const charset = match[1];
    const encoding = match[2].toUpperCase() as "B" | "Q";
    const encodedText = match[3];

    const decoded = decodeEncodedWord(
      charset,
      encoding,
      encodedText,
      warnUnsupportedCharset
    );

    parts.push({
      index: parts.length,
      raw: match[0],
      charset,
      encoding,
      encodedText,
      decodedText: decoded.text,
      start: match.index,
      end: match.index + match[0].length,
      byteLength: decoded.byteLength,
      hasError: Boolean(decoded.error),
      errorMessage: decoded.error || "",
    });
  }

  return parts;
}

function decodeHeaderText(
  input: string,
  parts: EncodedWordPart[],
  options: {
    joinAdjacentWords: boolean;
    preserveHeaderNames: boolean;
  }
) {
  if (!parts.length) {
    return options.preserveHeaderNames
      ? input.trim()
      : stripHeaderName(input).trim();
  }

  let decoded = "";
  let cursor = 0;

  parts.forEach((part, index) => {
    const between = input.slice(cursor, part.start);
    const previous = index > 0 ? parts[index - 1] : null;

    const ignoreInterWordWhitespace =
      options.joinAdjacentWords &&
      previous !== null &&
      /^[\t \r\n]+$/.test(between);

    if (!ignoreInterWordWhitespace) {
      decoded += between;
    }

    decoded += part.hasError ? part.raw : part.decodedText;
    cursor = part.end;
  });

  decoded += input.slice(cursor);

  if (!options.preserveHeaderNames) {
    decoded = stripHeaderName(decoded);
  }

  return decoded.trim();
}

function decodeEncodedWord(
  charset: string,
  encoding: "B" | "Q",
  encodedText: string,
  warnUnsupportedCharset: boolean
) {
  try {
    if (/[\t \r\n]/.test(encodedText)) {
      throw new Error(
        "RFC 2047 encoded-text cannot contain raw spaces, tabs, or line breaks."
      );
    }

    const bytes =
      encoding === "B"
        ? decodeBase64ToBytes(encodedText)
        : decodeQToBytes(encodedText);

    const decoded = decodeBytesForCharset(
      bytes,
      charset,
      warnUnsupportedCharset
    );

    return {
      text: decoded.text,
      byteLength: bytes.length,
      error: decoded.error,
    };
  } catch (caught) {
    return {
      text: encodedText,
      byteLength: 0,
      error:
        caught instanceof Error
          ? caught.message
          : "Unable to decode encoded word.",
    };
  }
}

function decodeBase64ToBytes(value: string) {
  if (!value) {
    throw new Error("RFC 2047 B encoded-text cannot be empty.");
  }

  if (
    !/^[A-Za-z0-9+/]*={0,2}$/.test(value) ||
    value.length % 4 !== 0
  ) {
    throw new Error(
      "Invalid RFC 2047 Base64 alphabet, padding, or length."
    );
  }

  const firstPadding = value.indexOf("=");

  if (
    firstPadding !== -1 &&
    firstPadding < value.length - 2
  ) {
    throw new Error(
      "Invalid RFC 2047 Base64 padding position."
    );
  }

  let binary = "";

  try {
    binary = atob(value);
  } catch {
    throw new Error("Invalid Base64 data in encoded word.");
  }

  const bytes = Uint8Array.from(
    binary,
    (character) => character.charCodeAt(0)
  );

  if (bytesToBase64(bytes) !== value) {
    throw new Error(
      "Base64 payload is not in canonical padded form or has invalid pad bits."
    );
  }

  return bytes;
}

function decodeQToBytes(value: string) {
  if (!value) {
    throw new Error("RFC 2047 Q encoded-text cannot be empty.");
  }

  const bytes: number[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === "_") {
      bytes.push(32);
      continue;
    }

    if (character === "=") {
      const hex = value.slice(index + 1, index + 3);

      if (!/^[0-9A-Fa-f]{2}$/.test(hex)) {
        throw new Error(
          "Invalid Q encoding: '=' must be followed by two hexadecimal digits."
        );
      }

      bytes.push(Number.parseInt(hex, 16));
      index += 2;
      continue;
    }

    const code = character.charCodeAt(0);

    if (code < 33 || code > 126 || character === "?") {
      throw new Error(
        "Q encoded-text contains a character that must be represented as an =HH byte escape."
      );
    }

    bytes.push(code);
  }

  return new Uint8Array(bytes);
}

function decodeBytesForCharset(
  bytes: Uint8Array,
  charset: string,
  warn: boolean
) {
  const normalized = normalizeCharset(charset);

  if (normalized === "iso-8859-1") {
    return {
      text: Array.from(bytes)
        .map((byte) => String.fromCharCode(byte))
        .join(""),
      error: "",
    };
  }

  if (normalized === "us-ascii") {
    const hasNonAscii = Array.from(bytes).some(
      (byte) => byte > 0x7f
    );

    return {
      text: Array.from(bytes)
        .map((byte) =>
          byte <= 0x7f ? String.fromCharCode(byte) : "�"
        )
        .join(""),
      error: hasNonAscii
        ? "US-ASCII payload contains bytes above 0x7F."
        : "",
    };
  }

  if (normalized === "windows-1252") {
    return decodeWindows1252(bytes);
  }

  if (normalized === "utf-8") {
    try {
      return {
        text: new TextDecoder("utf-8", {
          fatal: true,
        }).decode(bytes),
        error: "",
      };
    } catch {
      return {
        text: new TextDecoder("utf-8").decode(bytes),
        error:
          "Byte sequence is not valid UTF-8 for the declared charset.",
      };
    }
  }

  try {
    return {
      text: new TextDecoder(normalized, {
        fatal: true,
      }).decode(bytes),
      error: "",
    };
  } catch {
    try {
      return {
        text: new TextDecoder(normalized).decode(bytes),
        error:
          "Byte sequence is not valid for the declared charset.",
      };
    } catch {
      return {
        text: Array.from(bytes)
          .map((byte) => String.fromCharCode(byte))
          .join(""),
        error: warn
          ? `Unsupported charset: ${charset}. Latin-1-style fallback used.`
          : "",
      };
    }
  }
}

function normalizeCharset(charset: string) {
  const clean = charset.trim().toLowerCase();

  if (clean === "utf8" || clean === "utf-8") {
    return "utf-8";
  }

  if (
    clean === "latin1" ||
    clean === "latin-1" ||
    clean === "iso8859-1" ||
    clean === "iso-8859-1"
  ) {
    return "iso-8859-1";
  }

  if (
    clean === "windows1252" ||
    clean === "windows-1252" ||
    clean === "cp1252"
  ) {
    return "windows-1252";
  }

  if (clean === "ascii" || clean === "us-ascii") {
    return "us-ascii";
  }

  return clean;
}

function decodeWindows1252(bytes: Uint8Array) {
  const table: Record<number, number> = {
    0x80: 0x20ac,
    0x82: 0x201a,
    0x83: 0x0192,
    0x84: 0x201e,
    0x85: 0x2026,
    0x86: 0x2020,
    0x87: 0x2021,
    0x88: 0x02c6,
    0x89: 0x2030,
    0x8a: 0x0160,
    0x8b: 0x2039,
    0x8c: 0x0152,
    0x8e: 0x017d,
    0x91: 0x2018,
    0x92: 0x2019,
    0x93: 0x201c,
    0x94: 0x201d,
    0x95: 0x2022,
    0x96: 0x2013,
    0x97: 0x2014,
    0x98: 0x02dc,
    0x99: 0x2122,
    0x9a: 0x0161,
    0x9b: 0x203a,
    0x9c: 0x0153,
    0x9e: 0x017e,
    0x9f: 0x0178,
  };

  const undefinedBytes = new Set([
    0x81,
    0x8d,
    0x8f,
    0x90,
    0x9d,
  ]);

  let hasUndefinedByte = false;

  const text = Array.from(bytes)
    .map((byte) => {
      if (undefinedBytes.has(byte)) {
        hasUndefinedByte = true;
        return "�";
      }

      return Object.prototype.hasOwnProperty.call(table, byte)
        ? String.fromCodePoint(table[byte])
        : String.fromCharCode(byte);
    })
    .join("");

  return {
    text,
    error: hasUndefinedByte
      ? "Windows-1252 payload contains undefined byte values."
      : "",
  };
}

function encodeHeaderText(
  input: string,
  options: {
    encodingMode: EncodingMode;
    charsetMode: CharsetMode;
    headerKind: HeaderKind;
    wrapEncodedLines: boolean;
    preserveHeaderNames: boolean;
    originalHeaderName: string;
  }
) {
  const body = input.trim();

  if (!body) {
    if (!options.preserveHeaderNames) return "";

    const headerName =
      options.originalHeaderName ||
      defaultHeaderName(options.headerKind);

    return headerName ? `${headerName}:` : "";
  }

  const encoding =
    options.encodingMode === "auto"
      ? chooseEncoding(body)
      : options.encodingMode;

  const words = buildEncodedWords(
    body,
    options.charsetMode,
    encoding,
    options.headerKind
  );

  const encoded = options.wrapEncodedLines
    ? words
        .map((word, index) =>
          index === 0 ? word : `\r\n ${word}`
        )
        .join("")
    : words.join(" ");

  if (!options.preserveHeaderNames) {
    return encoded;
  }

  const headerName =
    options.originalHeaderName ||
    defaultHeaderName(options.headerKind);

  return headerName ? `${headerName}: ${encoded}` : encoded;
}

function defaultHeaderName(kind: HeaderKind) {
  if (kind === "subject") return "Subject";
  if (kind === "display-name") return "From";
  if (kind === "comment") return "Comments";
  return "";
}

function splitHeaderName(
  input: string,
  preserve: boolean,
  kind: HeaderKind
) {
  const match = input.match(
    /^([A-Za-z0-9][A-Za-z0-9-]*):[ \t]*([\s\S]*)$/
  );

  if (match) {
    return {
      headerName: preserve ? match[1] : "",
      body: match[2],
    };
  }

  return {
    headerName: preserve ? defaultHeaderName(kind) : "",
    body: input,
  };
}

function stripHeaderName(input: string) {
  return input.replace(
    /^[A-Za-z0-9][A-Za-z0-9-]*:[ \t]*/,
    ""
  );
}

function chooseEncoding(
  text: string
): "base64" | "q" {
  const utf8 = new TextEncoder().encode(text);
  const qLength = qPayloadLength(utf8, "generic");
  const bLength = Math.ceil(utf8.length / 3) * 4;

  return bLength < qLength ? "base64" : "q";
}

function buildEncodedWords(
  text: string,
  charset: CharsetMode,
  encoding: "base64" | "q",
  headerKind: HeaderKind
) {
  const label = charset.toUpperCase();

  // =? + charset + ? + B/Q + ? + payload + ?=
  const wrapperLength = label.length + 7;
  const maxPayload = 75 - wrapperLength;

  if (maxPayload < 4) {
    throw new Error(
      "The selected charset label leaves no usable payload space inside the RFC 2047 75-character encoded-word limit."
    );
  }

  const characters = Array.from(text);
  const words: string[] = [];
  let current = "";

  const flush = () => {
    if (!current) return;

    words.push(
      makeEncodedWord(
        current,
        charset,
        encoding,
        headerKind
      )
    );
    current = "";
  };

  for (const character of characters) {
    const candidate = current + character;

    if (
      current &&
      encodedPayloadLength(
        candidate,
        charset,
        encoding,
        headerKind
      ) > maxPayload
    ) {
      flush();
    }

    current += character;

    if (
      encodedPayloadLength(
        current,
        charset,
        encoding,
        headerKind
      ) > maxPayload
    ) {
      throw new Error(
        "A single character cannot fit inside the selected RFC 2047 encoded-word limit with this charset and encoding."
      );
    }
  }

  flush();
  return words;
}

function encodedPayloadLength(
  text: string,
  charset: CharsetMode,
  encoding: "base64" | "q",
  headerKind: HeaderKind
) {
  const bytes = encodeBytes(text, charset);

  if (encoding === "base64") {
    return Math.ceil(bytes.length / 3) * 4;
  }

  return qPayloadLength(bytes, headerKind);
}

function qPayloadLength(
  bytes: Uint8Array,
  headerKind: HeaderKind
) {
  return Array.from(bytes).reduce((sum, byte) => {
    if (byte === 32) return sum + 1;
    return sum + (isQSafe(byte, headerKind) ? 1 : 3);
  }, 0);
}

function makeEncodedWord(
  text: string,
  charset: CharsetMode,
  encoding: "base64" | "q",
  headerKind: HeaderKind
) {
  const bytes = encodeBytes(text, charset);

  const payload =
    encoding === "base64"
      ? bytesToBase64(bytes)
      : Array.from(bytes)
          .map((byte) => {
            if (byte === 32) return "_";

            if (isQSafe(byte, headerKind)) {
              return String.fromCharCode(byte);
            }

            return `=${byte
              .toString(16)
              .toUpperCase()
              .padStart(2, "0")}`;
          })
          .join("");

  return `=?${charset.toUpperCase()}?${
    encoding === "base64" ? "B" : "Q"
  }?${payload}?=`;
}

function encodeBytes(
  text: string,
  charset: CharsetMode
) {
  if (charset === "utf-8") {
    return new TextEncoder().encode(text);
  }

  const output: number[] = [];

  for (const character of Array.from(text)) {
    const codePoint = character.codePointAt(0) || 0;

    if (charset === "us-ascii") {
      if (codePoint > 0x7f) {
        throw new Error(
          "US-ASCII cannot represent every input character. Use UTF-8."
        );
      }

      output.push(codePoint);
      continue;
    }

    if (charset === "iso-8859-1") {
      if (codePoint > 0xff) {
        throw new Error(
          "ISO-8859-1 cannot represent every input character. Use UTF-8."
        );
      }

      output.push(codePoint);
      continue;
    }

    const byte = encodeWindows1252CodePoint(codePoint);

    if (byte === null) {
      throw new Error(
        "Windows-1252 cannot represent every input character. Use UTF-8."
      );
    }

    output.push(byte);
  }

  return new Uint8Array(output);
}

function encodeWindows1252CodePoint(
  codePoint: number
): number | null {
  const reverse: Record<number, number> = {
    0x20ac: 0x80,
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02dc: 0x98,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9c,
    0x017e: 0x9e,
    0x0178: 0x9f,
  };

  if (
    Object.prototype.hasOwnProperty.call(
      reverse,
      codePoint
    )
  ) {
    return reverse[codePoint];
  }

  if (
    codePoint <= 0x7f ||
    (codePoint >= 0xa0 && codePoint <= 0xff)
  ) {
    return codePoint;
  }

  return null;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function isQSafe(
  byte: number,
  headerKind: HeaderKind
) {
  if (byte < 33 || byte > 126) return false;

  const character = String.fromCharCode(byte);

  if (
    character === "=" ||
    character === "?" ||
    character === "_"
  ) {
    return false;
  }

  if (headerKind === "display-name") {
    return /^[A-Za-z0-9!*+\-/]$/.test(character);
  }

  return /^[A-Za-z0-9!*+\-/]$/.test(character);
}

function buildIssues(
  rawInput: string,
  preparedInput: string,
  decodedText: string,
  parts: EncodedWordPart[],
  options: {
    actionMode: ActionMode;
    charsetMode: CharsetMode;
    warnUnsupportedCharset: boolean;
    warnBrokenWords: boolean;
    warnLongHeaderLines: boolean;
  }
) {
  const issues: Issue[] = [];

  if (
    !parts.length &&
    options.actionMode !== "encode"
  ) {
    issues.push({
      severity: "info",
      title: "No encoded-word found",
      message:
        "The input does not contain a complete =?charset?B/Q?text?= pattern. It may already be plain text.",
    });
  }

  const errored = parts.filter(
    (part) => part.hasError
  );

  if (errored.length) {
    issues.push({
      severity: "warning",
      title: "Malformed or undecodable encoded-word",
      message: `${errored.length} encoded word${
        errored.length === 1 ? "" : "s"
      } could not be decoded strictly. Original encoded-word text is preserved in the decoded view.`,
    });
  }

  if (
    options.warnUnsupportedCharset &&
    parts.some((part) =>
      /unsupported charset/i.test(part.errorMessage)
    )
  ) {
    issues.push({
      severity: "warning",
      title: "Unsupported charset fallback used",
      message:
        "The browser could not decode at least one declared charset directly. Verify the source charset before trusting fallback text.",
    });
  }

  if (options.warnBrokenWords) {
    const suspicious =
      rawInput.match(/=\?[^\r\n]*(?:\?=|$)/g) || [];

    const malformed = suspicious.filter(
      (candidate) =>
        !/^=\?[^?\s]+\?[bBqQ]\?[^?\s]*\?=$/.test(
          candidate.trim()
        )
    );

    if (malformed.length) {
      issues.push({
        severity: "warning",
        title: "Possible broken encoded-word pattern",
        message: `${malformed.length} encoded-word-like fragment${
          malformed.length === 1 ? "" : "s"
        } do not match the basic RFC 2047 encoded-word structure.`,
      });
    }
  }

  if (
    parts.some((part) => part.raw.length > 75)
  ) {
    issues.push({
      severity: "warning",
      title: "Encoded-word exceeds RFC 2047 length",
      message:
        "At least one encoded-word is longer than 75 characters including charset and delimiters.",
    });
  }

  if (options.warnLongHeaderLines) {
    const physicalLines = rawInput
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");

    const longLines = physicalLines.filter(
      (line) =>
        new TextEncoder().encode(line).length > 998
    );

    if (longLines.length) {
      issues.push({
        severity: "high",
        title: "Header line exceeds 998 octets",
        message: `${longLines.length} physical header line${
          longLines.length === 1 ? "" : "s"
        } exceed the 998-octet limit. The check uses UTF-8 octets instead of JavaScript UTF-16 code-unit length.`,
      });
    }
  }

  if (/\r?\n[^\t ]/.test(preparedInput)) {
    issues.push({
      severity: "info",
      title: "Multiple header lines detected",
      message:
        "Only continuation lines beginning with a space or tab are unfolded into the previous field.",
    });
  }

  if (decodedText.includes("�")) {
    issues.push({
      severity: "warning",
      title: "Replacement character found",
      message:
        "Decoded text contains U+FFFD, which usually means the charset or byte sequence needs review.",
    });
  }

  if (!issues.length) {
    issues.push({
      severity: "info",
      title: "Header processed cleanly",
      message:
        "No obvious MIME encoded-word warning was found.",
    });
  }

  return issues;
}

function formatOutput(params: {
  input: string;
  actionMode: ActionMode;
  outputMode: OutputMode;
  decodedText: string;
  encodedText: string;
  parts: EncodedWordPart[];
  issues: Issue[];
  headerKind: HeaderKind;
}) {
  const primary =
    params.actionMode === "encode"
      ? params.encodedText
      : params.decodedText;

  if (params.outputMode === "plain") {
    return primary;
  }

  if (params.outputMode === "json") {
    return JSON.stringify(
      {
        action: params.actionMode,
        headerKind: params.headerKind,
        decodedText: params.decodedText,
        encodedText: params.encodedText,
        encodedWords: params.parts,
        issues: params.issues,
      },
      null,
      2
    );
  }

  if (params.outputMode === "markdown") {
    return [
      "| # | Charset | Encoding | Bytes | Status |",
      "|---:|---|---|---:|---|",
      ...params.parts.map(
        (part) =>
          `| ${part.index + 1} | ${escapeMd(
            part.charset
          )} | ${part.encoding} | ${part.byteLength} | ${
            part.hasError
              ? escapeMd(part.errorMessage)
              : "decoded"
          } |`
      ),
      "",
      ...params.issues.map(
        (issue) =>
          `- **${escapeMd(issue.title)}:** ${escapeMd(
            issue.message
          )}`
      ),
    ].join("\n");
  }

  if (params.outputMode === "csv") {
    const rows = [
      [
        "index",
        "charset",
        "encoding",
        "bytes",
        "decoded",
        "status",
      ],
      ...params.parts.map((part) => [
        String(part.index + 1),
        part.charset,
        part.encoding,
        String(part.byteLength),
        part.decodedText,
        part.hasError
          ? part.errorMessage
          : "decoded",
      ]),
    ];

    return rows
      .map((row) =>
        row.map(csvEscape).join(",")
      )
      .join("\n");
  }

  if (params.outputMode === "checklist") {
    return [
      "MIME Encoded-Word Review Checklist",
      "-----------------------------------",
      "- [ ] Confirm the declared charset matches the sender/source.",
      "- [ ] Confirm B/Q payloads decode without strict-syntax warnings.",
      "- [ ] Keep every encoded-word at 75 characters or fewer.",
      "- [ ] Keep physical header lines within email transport limits.",
      "- [ ] Check adjacent encoded-word whitespace and header folding.",
      "",
      ...params.issues.map(
        (issue) =>
          `- ${issue.title}: ${issue.message}`
      ),
    ].join("\n");
  }

  return [
    `Action: ${params.actionMode}`,
    `Encoded words: ${params.parts.length}`,
    `Decoded text: ${
      params.decodedText || "(none)"
    }`,
    "",
    `Encoded output: ${
      params.encodedText || "(none)"
    }`,
    "",
    "Findings:",
    ...params.issues.map(
      (issue) =>
        `- [${issue.severity.toUpperCase()}] ${
          issue.title
        }: ${issue.message}`
    ),
  ].join("\n");
}

function getNotes(result: Result): Note[] {
  const notes: Note[] = [];

  if (
    result.parts.some((part) => part.hasError)
  ) {
    notes.push({
      title: "Keep the original header for forensic work",
      message:
        "Malformed encoded-words can be evidence of a broken sender or transport. Do not discard the raw header when debugging delivery or parsing differences.",
    });
  }

  if (result.parts.length > 1) {
    notes.push({
      title: "Adjacent encoded words",
      message:
        "RFC 2047 display rules can ignore linear whitespace between adjacent encoded-words. The join option applies only in that specific case.",
    });
  }

  return notes;
}

function truncate(
  value: string,
  max: number
) {
  return value.length <= max
    ? value
    : `${value.slice(0, max - 1)}…`;
}

function escapeMd(value: string) {
  return value
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");
}

function csvEscape(value: string) {
  return /[",\n\r]/.test(value)
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}
