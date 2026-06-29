"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "decode" | "encode" | "analyze" | "normalize";
type OutputMode = "plain" | "summary" | "json" | "markdown" | "csv" | "checklist";
type EncodingMode = "auto" | "base64" | "q";
type CharsetMode = "utf-8" | "iso-8859-1" | "windows-1252" | "us-ascii";
type HeaderKind = "subject" | "display-name" | "comment" | "generic";

type EncodedWordPart = {
  index: number;
  raw: string;
  charset: string;
  encoding: string;
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
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("auto");
  const [charsetMode, setCharsetMode] = useState<CharsetMode>("utf-8");
  const [headerKind, setHeaderKind] = useState<HeaderKind>("subject");
  const [unfoldHeaders, setUnfoldHeaders] = useState(true);
  const [joinAdjacentWords, setJoinAdjacentWords] = useState(true);
  const [preserveHeaderNames, setPreserveHeaderNames] = useState(true);
  const [warnUnsupportedCharset, setWarnUnsupportedCharset] = useState(true);
  const [warnBrokenWords, setWarnBrokenWords] = useState(true);
  const [warnLongHeaderLines, setWarnLongHeaderLines] = useState(true);
  const [wrapEncodedLines, setWrapEncodedLines] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const processHeader = () => {
    if (!input.trim()) {
      setError("Paste an email header, subject line, display name, or plain text value first.");
      setResult(null);
      setOutput("");
      return;
    }

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
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
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
      description="Decode MIME and RFC 2047 encoded words in email subjects, sender names, and other headers. Read UTF-8 Base64 or Q encoded text locally."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">Email Header or Text</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste a subject line, From display name, folded header, or plain text you want to decode or encode as a MIME encoded word.
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
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Paste raw encoded words like <span className="font-mono text-gray-700">=?UTF-8?B?...?=</span>, full email header lines, or plain text you want to encode.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
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
          <CheckboxRow checked={unfoldHeaders} label="Unfold multiline email headers" onChange={(checked) => { setUnfoldHeaders(checked); clearResult(); }} />
          <CheckboxRow checked={joinAdjacentWords} label="Join adjacent encoded words cleanly" onChange={(checked) => { setJoinAdjacentWords(checked); clearResult(); }} />
          <CheckboxRow checked={preserveHeaderNames} label="Preserve header names like Subject:" onChange={(checked) => { setPreserveHeaderNames(checked); clearResult(); }} />
          <CheckboxRow checked={wrapEncodedLines} label="Wrap encoded output for email headers" onChange={(checked) => { setWrapEncodedLines(checked); clearResult(); }} />
          <CheckboxRow checked={warnUnsupportedCharset} label="Warn about unsupported charsets" onChange={(checked) => { setWarnUnsupportedCharset(checked); clearResult(); }} />
          <CheckboxRow checked={warnBrokenWords} label="Warn about broken encoded-word patterns" onChange={(checked) => { setWarnBrokenWords(checked); clearResult(); }} />
          <CheckboxRow checked={warnLongHeaderLines} label="Warn about very long header lines" onChange={(checked) => { setWarnLongHeaderLines(checked); clearResult(); }} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Use decode mode for copied email headers, encode mode for new non-ASCII subject lines or display names, and analyze mode when you only want to inspect the structure.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={processHeader} className="yoryantra-btn">Process Header</button>
        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Encoded Words" value={result.encodedWordCount.toLocaleString()} />
          <SummaryCard label="Charsets" value={result.charsetCount.toLocaleString()} />
          <SummaryCard label="Decoded Length" value={result.decodedLength.toLocaleString()} />
          <SummaryCard label="Findings" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.parts.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Detected Encoded Words</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Charset</th>
                  <th className="px-4 py-3 font-semibold">Encoding</th>
                  <th className="px-4 py-3 font-semibold">Bytes</th>
                  <th className="px-4 py-3 font-semibold">Decoded Preview</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.parts.map((part) => (
                  <tr key={`${part.index}-${part.start}-${part.end}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{part.index + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{part.charset}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{part.encoding.toUpperCase()}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{part.byteLength}</td>
                    <td className="px-4 py-3 text-gray-700">{truncate(part.decodedText || part.encodedText, 90)}</td>
                    <td className="px-4 py-3 text-gray-700">{part.hasError ? part.errorMessage : "decoded"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Header findings</h3>
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
          <h3 className="text-sm font-semibold text-blue-900">Email header guidance</h3>
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

      {result && (
        <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Decoded Text</h3>
              <button onClick={() => navigator.clipboard.writeText(result.decodedText)} className="yoryantra-btn-outline text-sm">Copy</button>
            </div>
            <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
              {result.decodedText || "Decoded text will appear here."}
            </pre>
          </div>

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Encoded-Word Output</h3>
              <button onClick={() => navigator.clipboard.writeText(result.encodedText)} className="yoryantra-btn-outline text-sm">Copy</button>
            </div>
            <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
              {result.encodedText || "Encoded output will appear here."}
            </pre>
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "MIME encoded-word output will appear here."}
        </pre>
      </div>


      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Decode MIME and RFC 2047 Email Headers</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Email subjects, sender names, and other message headers may appear as encoded text when they contain emoji, accented letters, Hindi, Japanese, or other non-ASCII characters. RFC 2047 represents this text as MIME encoded words so it can travel safely through email systems.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This MIME decoder reads patterns such as <span className="font-mono text-gray-800">=?UTF-8?B?...?=</span> and <span className="font-mono text-gray-800">=?UTF-8?Q?...?=</span>. It converts them into readable text and shows the charset, encoding method, byte length, folding issues, and other useful details.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Decode a MIME Email Subject</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste an encoded subject, From name, folded raw header, or plain text string.</li>
            <li>Choose whether to decode, encode, analyze, or normalize the header.</li>
            <li>Keep unfolding enabled when you paste raw multiline headers from an email source.</li>
            <li>Review the detected charset, encoding method, decoded preview, and warnings.</li>
            <li>Copy plain text, encoded-word syntax, JSON, Markdown, CSV, or a review checklist.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Base64 B Encoding and Q Encoding</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            MIME encoded words normally use either <strong>B</strong> encoding or <strong>Q</strong> encoding. B encoding stores the header bytes as Base64. Q encoding is similar to quoted-printable and often keeps readable letters visible while escaping special bytes with equals signs.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            For short text with many ASCII letters, Q encoding can be easier to inspect. For emoji, non-Latin scripts, or mixed international text, Base64 is often cleaner and shorter.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">RFC 2047 Encoded-Word Format</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            An encoded word follows the structure <span className="font-mono text-gray-800">=?charset?encoding?encoded-text?=</span>. The charset identifies how the original text was stored, while the encoding value is normally <strong>B</strong> for Base64 or <strong>Q</strong> for Q encoding.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            These encoded words are commonly found in Subject, From, To, Cc, and comment fields. They are intended for email headers, not for encoding an entire email body.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Encoded Header</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`Subject: =?UTF-8?B?WW9yeWFudHJhIOKcqCBFbWFpbCBIZWFkZXIgVGVzdA==?=
From: =?UTF-8?Q?Varoun_Sonawane?= <hello@yoryantra.com>`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why Email Headers Look Broken</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw message views, logs, CRM exports, support ticket systems, SMTP traces, and webhook payloads can show the encoded header instead of the decoded value. That does not always mean the email is broken. It usually means you are seeing the transport-safe representation of the header.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Problems usually happen when the encoded-word is split incorrectly, uses the wrong charset, mixes spaces badly between adjacent encoded words, or is copied from a folded header without proper unfolding.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What is a MIME encoded-word?">
              It is an email header format used to represent non-ASCII text inside fields such as Subject, From, To, Cc, and comments.
            </Faq>
            <Faq title="Can this decode email subject lines?">
              Yes. Paste the full Subject header or only the encoded-word value, then run the decoder to get readable text.
            </Faq>
            <Faq title="Can it decode sender names in a From header?">
              Yes. You can paste a full From header containing an encoded display name and keep the email address visible in the decoded result.
            </Faq>
            <Faq title="What is RFC 2047?">
              RFC 2047 defines the encoded-word format used to place non-ASCII text inside email header fields.
            </Faq>
            <Faq title="What does =?UTF-8?B?...?= mean?">
              It means the header uses UTF-8 bytes and Base64 encoding. The encoded bytes can be decoded back into readable Unicode text.
            </Faq>
            <Faq title="What does =?UTF-8?Q?...?= mean?">
              It means the header uses UTF-8 bytes and Q encoding, where underscores often represent spaces and equals signs introduce hex byte values.
            </Faq>
            <Faq title="Is anything uploaded when I decode a header?">
              No. The decoder runs in your browser and does not send your pasted header text anywhere.
            </Faq>
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

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--light-gold)]" />
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

function Faq({ title, children }: { title: string; children: ReactNode }) {
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
  const preparedInput = options.unfoldHeaders ? unfoldHeaderLines(options.input.trim()) : options.input.trim();
  const parts = parseEncodedWords(preparedInput, options);
  const decodedText = decodeHeaderText(preparedInput, parts, options);
  const encodedText = encodeHeaderText(decodedText || preparedInput, options);
  const issues = buildIssues(preparedInput, decodedText, parts, options);
  const charsets = new Set(parts.map((part) => normalizeCharset(part.charset)));
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
    charsetCount: charsets.size,
  };
}

function unfoldHeaderLines(input: string) {
  return input.replace(/\r?\n[\t ]+/g, " ");
}

function parseEncodedWords(input: string, options: { warnUnsupportedCharset: boolean }): EncodedWordPart[] {
  const regex = /=\?([^?\s]+)\?([bBqQ])\?([^?]*)\?=/g;
  const parts: EncodedWordPart[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const charset = match[1];
    const encoding = match[2].toUpperCase();
    const encodedText = match[3];
    const decoded = decodeEncodedWord(charset, encoding, encodedText, options.warnUnsupportedCharset);

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

function decodeHeaderText(input: string, parts: EncodedWordPart[], options: { joinAdjacentWords: boolean; preserveHeaderNames: boolean }) {
  if (parts.length === 0) return input;

  let decoded = "";
  let cursor = 0;

  parts.forEach((part) => {
    decoded += input.slice(cursor, part.start);
    decoded += part.decodedText;
    cursor = part.end;
  });

  decoded += input.slice(cursor);

  if (options.joinAdjacentWords) {
    decoded = decoded.replace(/([^\S\r\n]+)(?=[^\s]*?)/g, "$1");
    decoded = decoded.replace(/([\p{L}\p{N}\p{P}\p{S}])\s+([\p{L}\p{N}\p{P}\p{S}])/gu, (match, left: string, right: string) => {
      if (/[,:;<>@()[\]{}]/.test(left) || /[,:;<>@()[\]{}]/.test(right)) return match;
      return `${left} ${right}`;
    });
    decoded = decoded.replace(/\s{2,}/g, " ");
  }

  if (!options.preserveHeaderNames) {
    decoded = decoded.replace(/^[A-Za-z0-9-]+:\s*/, "");
  }

  return decoded.trim();
}

function decodeEncodedWord(charset: string, encoding: string, encodedText: string, warnUnsupportedCharset: boolean) {
  try {
    const bytes = encoding === "B" ? decodeBase64ToBytes(encodedText) : decodeQToBytes(encodedText);
    const decoder = getTextDecoder(charset);
    if (!decoder) {
      const fallback = bytesToLatin1(bytes);
      return {
        text: fallback,
        byteLength: bytes.length,
        error: warnUnsupportedCharset ? `Unsupported charset: ${charset}. Decoded with a Latin-1 fallback.` : "",
      };
    }

    return {
      text: decoder.decode(bytes),
      byteLength: bytes.length,
      error: "",
    };
  } catch (error) {
    return {
      text: encodedText,
      byteLength: 0,
      error: error instanceof Error ? error.message : "Unable to decode encoded word.",
    };
  }
}

function decodeBase64ToBytes(value: string) {
  const normalized = value.replace(/\s/g, "");
  if (!normalized) return new Uint8Array();
  if (/[^A-Za-z0-9+/=]/.test(normalized)) {
    throw new Error("Invalid Base64 characters in encoded word.");
  }
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function decodeQToBytes(value: string) {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "_") {
      bytes.push(32);
      continue;
    }
    if (char === "=" && /^[0-9A-Fa-f]{2}$/.test(value.slice(index + 1, index + 3))) {
      bytes.push(Number.parseInt(value.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }
    bytes.push(char.charCodeAt(0));
  }
  return new Uint8Array(bytes);
}

function getTextDecoder(charset: string) {
  const normalized = normalizeCharset(charset);
  try {
    return new TextDecoder(normalized, { fatal: false });
  } catch {
    return null;
  }
}

function normalizeCharset(charset: string) {
  const clean = charset.trim().toLowerCase();
  if (["utf8", "utf-8"].includes(clean)) return "utf-8";
  if (["latin1", "latin-1", "iso8859-1", "iso-8859-1"].includes(clean)) return "iso-8859-1";
  if (["windows1252", "windows-1252", "cp1252"].includes(clean)) return "windows-1252";
  if (["ascii", "us-ascii"].includes(clean)) return "us-ascii";
  return clean;
}

function bytesToLatin1(bytes: Uint8Array) {
  return Array.from(bytes).map((byte) => String.fromCharCode(byte)).join("");
}

function encodeHeaderText(input: string, options: { encodingMode: EncodingMode; charsetMode: CharsetMode; headerKind: HeaderKind; wrapEncodedLines: boolean; preserveHeaderNames: boolean }) {
  const { headerName, body } = splitHeaderName(input, options.preserveHeaderNames);
  const cleanBody = body.trim();
  if (!cleanBody) return headerName ? `${headerName}:` : "";

  const selectedEncoding = options.encodingMode === "auto" ? chooseEncoding(cleanBody) : options.encodingMode;
  const encodedWord = selectedEncoding === "q"
    ? buildQEncodedWord(cleanBody, options.charsetMode)
    : buildBase64EncodedWord(cleanBody, options.charsetMode);
  const maybeWrapped = options.wrapEncodedLines ? wrapHeaderValue(encodedWord, headerName) : encodedWord;

  if (!headerName) return maybeWrapped;
  return `${headerName}: ${maybeWrapped}`;
}

function splitHeaderName(input: string, preserveHeaderNames: boolean) {
  if (!preserveHeaderNames) return { headerName: "", body: input };
  const match = input.match(/^([A-Za-z0-9-]+):\s*([\s\S]*)$/);
  if (!match) return { headerName: defaultHeaderName("generic"), body: input };
  return { headerName: match[1], body: match[2] };
}

function defaultHeaderName(kind: HeaderKind) {
  if (kind === "subject") return "Subject";
  if (kind === "display-name") return "From";
  if (kind === "comment") return "Comments";
  return "";
}

function chooseEncoding(text: string): "base64" | "q" {
  const nonAscii = Array.from(text).filter((char) => char.charCodeAt(0) > 127).length;
  const spaces = (text.match(/\s/g) || []).length;
  return nonAscii > Math.max(2, spaces) ? "base64" : "q";
}

function buildBase64EncodedWord(text: string, charset: CharsetMode) {
  const bytes = encodeTextBytes(text, charset);
  const binary = Array.from(bytes).map((byte) => String.fromCharCode(byte)).join("");
  return `=?${charset.toUpperCase()}?B?${btoa(binary)}?=`;
}

function buildQEncodedWord(text: string, charset: CharsetMode) {
  const bytes = encodeTextBytes(text, charset);
  const encoded = Array.from(bytes).map((byte) => {
    if (byte === 32) return "_";
    if ((byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122) || (byte >= 48 && byte <= 57)) return String.fromCharCode(byte);
    if ([33, 42, 43, 45, 47].includes(byte)) return String.fromCharCode(byte);
    return `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
  }).join("");

  return `=?${charset.toUpperCase()}?Q?${encoded}?=`;
}

function encodeTextBytes(text: string, charset: CharsetMode) {
  if (charset === "utf-8" || charset === "us-ascii") {
    return new TextEncoder().encode(text);
  }

  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    bytes[index] = code <= 255 ? code : 63;
  }
  return bytes;
}

function wrapHeaderValue(value: string, headerName: string) {
  const max = 76;
  if ((headerName ? headerName.length + 2 : 0) + value.length <= max) return value;

  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += 60) {
    chunks.push(value.slice(index, index + 60));
  }

  if (chunks.length <= 1) return value;
  return chunks.map((chunk, index) => (index === 0 ? chunk : `\n ${chunk}`)).join("");
}

function buildIssues(input: string, decodedText: string, parts: EncodedWordPart[], options: {
  warnUnsupportedCharset: boolean;
  warnBrokenWords: boolean;
  warnLongHeaderLines: boolean;
}) {
  const issues: Issue[] = [];
  const lines = input.split(/\r?\n/);

  if (parts.length === 0) {
    issues.push({
      severity: "info",
      title: "No encoded-word found",
      message: "The input does not contain a complete =?charset?B/Q?text?= pattern. It may already be plain text.",
    });
  }

  const errored = parts.filter((part) => part.hasError);
  if (errored.length > 0) {
    issues.push({
      severity: "warning",
      title: "Some encoded words could not be decoded cleanly",
      message: `${errored.length} encoded word${errored.length === 1 ? "" : "s"} produced a decoding warning or fallback.`,
    });
  }

  if (options.warnUnsupportedCharset && parts.some((part) => /unsupported charset/i.test(part.errorMessage))) {
    issues.push({
      severity: "warning",
      title: "Unsupported charset fallback used",
      message: "Your browser may not support every legacy email charset. Check the decoded text before using it in production data.",
    });
  }

  if (options.warnBrokenWords) {
    const suspiciousCount = (input.match(/=\?[^?\s]*\?/g) || []).length - parts.length;
    if (suspiciousCount > 0) {
      issues.push({
        severity: "warning",
        title: "Possible broken encoded-word pattern",
        message: "The input contains something that looks like the start of an encoded word but does not match the full MIME pattern.",
      });
    }
  }

  if (options.warnLongHeaderLines && lines.some((line) => line.length > 998)) {
    issues.push({
      severity: "high",
      title: "Header line is very long",
      message: "Email systems commonly expect header lines to stay under transport limits. Consider folding long headers.",
    });
  }

  if (/\r?\n[^\t ]/.test(input)) {
    issues.push({
      severity: "info",
      title: "Multiple header lines detected",
      message: "Only continuation lines that begin with a space or tab are unfolded into the previous header.",
    });
  }

  if (decodedText.includes("�")) {
    issues.push({
      severity: "warning",
      title: "Replacement character found",
      message: "The decoded text contains �, which can mean the charset or byte sequence does not match the original header.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Header decoded cleanly",
      message: "No obvious MIME encoded-word warning was found.",
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
  const { input, actionMode, outputMode, decodedText, encodedText, parts, issues, headerKind } = params;
  const primary = selectPrimary(actionMode, decodedText, encodedText, parts, input);

  if (outputMode === "plain") return actionMode === "encode" ? encodedText : decodedText;
  if (outputMode === "json") return JSON.stringify({ action: actionMode, headerKind, input, decodedText, encodedText, encodedWords: parts, issues }, null, 2);

  if (outputMode === "markdown") {
    return [
      "| # | Charset | Encoding | Bytes | Decoded Preview | Status |",
      "| --- | --- | --- | ---: | --- | --- |",
      ...(parts.length
        ? parts.map((part) => `| ${part.index + 1} | ${part.charset} | ${part.encoding} | ${part.byteLength} | ${escapeMarkdown(truncate(part.decodedText, 80))} | ${part.hasError ? escapeMarkdown(part.errorMessage) : "decoded"} |`)
        : ["| - | - | - | 0 | No encoded-word found | plain text |"]),
      "",
      "## Decoded Text",
      decodedText || "-",
      "",
      "## Findings",
      ...issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (outputMode === "csv") {
    const rows = [
      ["index", "charset", "encoding", "byte_length", "decoded_text", "status"],
      ...(parts.length
        ? parts.map((part) => [String(part.index + 1), part.charset, part.encoding, String(part.byteLength), part.decodedText, part.hasError ? part.errorMessage : "decoded"])
        : [["", "", "", "0", decodedText, "plain text"]]),
    ];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "checklist") {
    return [
      "MIME Encoded-Word Review Checklist",
      "-----------------------------------",
      "- [ ] Confirm the decoded subject or display name reads correctly.",
      "- [ ] Confirm the charset matches the source system when known.",
      "- [ ] Check adjacent encoded words for missing or extra spaces.",
      "- [ ] Check folded raw headers after unfolding continuation lines.",
      "- [ ] Avoid using raw encoded text as visible UI copy unless intentionally debugging.",
      "- [ ] Keep full email validation separate from header decoding.",
      "",
      "Findings:",
      ...issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  return primary;
}

function selectPrimary(actionMode: ActionMode, decodedText: string, encodedText: string, parts: EncodedWordPart[], input: string) {
  if (actionMode === "encode") return encodedText;
  if (actionMode === "normalize") return decodedText.replace(/\s+/g, " ").trim();
  if (actionMode === "analyze") {
    return [
      "MIME Encoded-Word Analysis",
      "---------------------------",
      `Input length: ${input.length}`,
      `Encoded words: ${parts.length}`,
      `Charsets: ${Array.from(new Set(parts.map((part) => part.charset))).join(", ") || "none"}`,
      `Encodings: ${Array.from(new Set(parts.map((part) => part.encoding))).join(", ") || "none"}`,
      "",
      "Decoded text:",
      decodedText || "-",
    ].join("\n");
  }

  return [
    "MIME Encoded-Word Summary",
    "-------------------------",
    `Encoded words detected: ${parts.length}`,
    `Decoded length: ${decodedText.length}`,
    `Charsets: ${Array.from(new Set(parts.map((part) => part.charset))).join(", ") || "none"}`,
    "",
    "Decoded text:",
    decodedText || "-",
    "",
    "Encoded-word output:",
    encodedText || "-",
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function truncate(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}…`;
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.parts.some((part) => part.hasError)) {
    notes.push({
      title: "Check fallback output carefully",
      message: "A decoding fallback can produce readable-looking text that is still not the original header value.",
    });
  }

  if (result.encodedWordCount > 1) {
    notes.push({
      title: "Adjacent encoded words can affect spacing",
      message: "Email clients often join adjacent encoded words in a specific way. Review spaces around names, punctuation, and emoji.",
    });
  }

  notes.push({
    title: "Header decoding is not mailbox validation",
    message: "This tool helps inspect header text. It does not verify sender identity, SPF, DKIM, DMARC, or message authenticity.",
  });

  return notes;
}
