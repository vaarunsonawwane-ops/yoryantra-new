"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "decode" | "encode" | "analyze" | "normalize";
type OutputMode = "plain" | "summary" | "json" | "markdown" | "csv" | "checklist";
type EncodingMode = "auto" | "base64" | "q";
type CharsetMode = "utf-8" | "iso-8859-1" | "windows-1252" | "us-ascii";
type HeaderKind = "subject" | "display-name" | "comment" | "generic";
type EncodedWordPart = { index: number; raw: string; charset: string; encoding: string; encodedText: string; decodedText: string; start: number; end: number; byteLength: number; hasError: boolean; errorMessage: string };
type Issue = { severity: "info" | "warning" | "high"; title: string; message: string };
type Result = { output: string; decodedText: string; encodedText: string; parts: EncodedWordPart[]; issues: Issue[]; inputLength: number; decodedLength: number; encodedWordCount: number; charsetCount: number };
type Note = { title: string; message: string };

const sampleInput = `Subject: =?UTF-8?B?V29ybGQ=?=
From: =?UTF-8?Q?Varoun_Sonawane?= <hello@yoryantra.com>`;
const charsetOptions = [{ label: "UTF-8", value: "utf-8" }, { label: "ISO-8859-1", value: "iso-8859-1" }, { label: "Windows-1252", value: "windows-1252" }, { label: "US-ASCII", value: "us-ascii" }];
const encodingOptions = [{ label: "Auto choose", value: "auto" }, { label: "Base64 (B)", value: "base64" }, { label: "Q encoding", value: "q" }];

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
  const notes = useMemo(() => result ? getNotes(result) : [], [result]);

  const clearResult = () => { setResult(null); setOutput(""); setError(""); setCopied(false); };
  const processHeader = () => {
    if (!input.trim()) { setError("Paste an email header, subject line, display name, or plain text value first."); setResult(null); setOutput(""); return; }
    try {
      const next = buildResult({ input, actionMode, outputMode, encodingMode, charsetMode, headerKind, unfoldHeaders, joinAdjacentWords, preserveHeaderNames, warnUnsupportedCharset, warnBrokenWords, warnLongHeaderLines, wrapEncodedLines });
      setResult(next); setOutput(next.output); setError(""); setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process this MIME header."); setResult(null); setOutput("");
    }
  };
  const copyOutput = async () => { if (!output) return; await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
  const loadExample = () => { setInput(sampleInput); setActionMode("decode"); setOutputMode("summary"); setEncodingMode("auto"); setCharsetMode("utf-8"); setHeaderKind("subject"); setUnfoldHeaders(true); setJoinAdjacentWords(true); setPreserveHeaderNames(true); setWarnUnsupportedCharset(true); setWarnBrokenWords(true); setWarnLongHeaderLines(true); setWrapEncodedLines(true); clearResult(); };
  const resetAll = () => { setInput(""); setActionMode("decode"); setOutputMode("summary"); setEncodingMode("auto"); setCharsetMode("utf-8"); setHeaderKind("subject"); setUnfoldHeaders(true); setJoinAdjacentWords(true); setPreserveHeaderNames(true); setWarnUnsupportedCharset(true); setWarnBrokenWords(true); setWarnLongHeaderLines(true); setWrapEncodedLines(true); clearResult(); };

  return (
    <ToolShell title="MIME Encoded-Word Decoder" description="Decode, analyze, normalize, or create RFC 2047 MIME encoded-words for email subjects and display names with strict Base64/Q validation and byte-aware header diagnostics.">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">Email Header or Text</label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">Paste an encoded subject/display name, a folded header, or plain text you want to encode.</p>
        <textarea value={input} onChange={(event) => { setInput(event.target.value); clearResult(); }} placeholder={sampleInput} spellCheck={false} className="mt-4 w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]" />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <YoryantraSelect label="Action" value={actionMode} onChange={(value) => { setActionMode(value as ActionMode); clearResult(); }} options={[{ label: "Decode encoded words", value: "decode" }, { label: "Encode text as MIME word", value: "encode" }, { label: "Analyze header only", value: "analyze" }, { label: "Normalize decoded header", value: "normalize" }]} />
          <YoryantraSelect label="Output" value={outputMode} onChange={(value) => { setOutputMode(value as OutputMode); clearResult(); }} options={[{ label: "Readable summary", value: "summary" }, { label: "Plain text", value: "plain" }, { label: "JSON", value: "json" }, { label: "Markdown table", value: "markdown" }, { label: "CSV", value: "csv" }, { label: "Review checklist", value: "checklist" }]} />
          <YoryantraSelect label="Encoding for New Words" value={encodingMode} onChange={(value) => { setEncodingMode(value as EncodingMode); clearResult(); }} options={encodingOptions} />
          <YoryantraSelect label="Charset for New Words" value={charsetMode} onChange={(value) => { setCharsetMode(value as CharsetMode); clearResult(); }} options={charsetOptions} />
          <YoryantraSelect label="Header Type" value={headerKind} onChange={(value) => { setHeaderKind(value as HeaderKind); clearResult(); }} options={[{ label: "Subject header", value: "subject" }, { label: "Display name", value: "display-name" }, { label: "Comment text", value: "comment" }, { label: "Generic header text", value: "generic" }]} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2"><CheckboxRow checked={unfoldHeaders} label="Unfold multiline email headers" onChange={(v) => { setUnfoldHeaders(v); clearResult(); }} /><CheckboxRow checked={joinAdjacentWords} label="Join adjacent encoded words cleanly" onChange={(v) => { setJoinAdjacentWords(v); clearResult(); }} /><CheckboxRow checked={preserveHeaderNames} label="Preserve header names like Subject:" onChange={(v) => { setPreserveHeaderNames(v); clearResult(); }} /><CheckboxRow checked={wrapEncodedLines} label="Wrap encoded output for email headers" onChange={(v) => { setWrapEncodedLines(v); clearResult(); }} /><CheckboxRow checked={warnUnsupportedCharset} label="Warn about unsupported charsets" onChange={(v) => { setWarnUnsupportedCharset(v); clearResult(); }} /><CheckboxRow checked={warnBrokenWords} label="Warn about malformed encoded-word syntax" onChange={(v) => { setWarnBrokenWords(v); clearResult(); }} /><CheckboxRow checked={warnLongHeaderLines} label="Warn about very long header lines" onChange={(v) => { setWarnLongHeaderLines(v); clearResult(); }} /></div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3"><button onClick={processHeader} className="yoryantra-btn">Process Header</button><button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button><button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button><button onClick={resetAll} className="yoryantra-btn-outline">Reset</button></div>
      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>}

      {result && <>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Encoded Words" value={result.encodedWordCount.toLocaleString()} /><SummaryCard label="Charsets" value={result.charsetCount.toLocaleString()} /><SummaryCard label="Decoded Length" value={result.decodedLength.toLocaleString()} /><SummaryCard label="Findings" value={result.issues.length.toLocaleString()} /></div>
        {result.parts.length > 0 && <div className="mt-8 overflow-auto rounded-xl border border-gray-200"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Charset</th><th className="px-4 py-3">Encoding</th><th className="px-4 py-3">Bytes</th><th className="px-4 py-3">Decoded Preview</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{result.parts.map((part) => <tr key={`${part.index}-${part.start}`}><td className="px-4 py-3">{part.index + 1}</td><td className="px-4 py-3 font-mono text-xs">{part.charset}</td><td className="px-4 py-3">{part.encoding}</td><td className="px-4 py-3">{part.byteLength}</td><td className="px-4 py-3 break-words">{truncate(part.decodedText || part.encodedText, 100)}</td><td className="px-4 py-3">{part.hasError ? part.errorMessage : "decoded"}</td></tr>)}</tbody></table></div>}
        {result.issues.length > 0 && <div className="mt-6 space-y-3">{result.issues.map((issue, index) => <div key={`${issue.title}-${index}`} className={`rounded-xl border p-4 ${issue.severity === "high" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}><div className="font-semibold text-gray-900">{issue.title}</div><p className="mt-1 text-sm leading-relaxed text-gray-700">{issue.message}</p></div>)}</div>}
        {notes.length > 0 && <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">{notes.map((note) => <div key={note.title} className="mb-3 last:mb-0"><p className="font-semibold text-blue-900">{note.title}</p><p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p></div>)}</div>}
        <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-2"><OutputBox title="Decoded Text" text={result.decodedText} /><OutputBox title="Encoded-Word Output" text={result.encodedText} /></div>
      </>}
      <div className="mt-8"><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold text-gray-900">Output</h3></div><pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">{output || "MIME encoded-word output will appear here."}</pre></div>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">Processing happens in your browser. The email-header text you paste is not sent to a MIME-decoding server.</div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div><h2 className="text-2xl font-semibold text-gray-900">Decode MIME and RFC 2047 Email Headers Carefully</h2><p className="mt-4 text-gray-600 leading-relaxed">RFC 2047 encoded-words carry a charset, an encoding marker (B or Q), and encoded text. All three pieces matter. Decoding Base64 bytes with the wrong charset can produce believable but incorrect text, so the tool exposes the charset and any fallback warning instead of returning only a final string.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Malformed Encoded-Words Are Not Silently Repaired</h2><p className="mt-4 text-gray-600 leading-relaxed">An encoded-word cannot contain raw space or tab characters inside its delimiters. B encoding is checked as strict Base64, including padding position and length. In Q encoding, every <code>=</code> must be followed by exactly two hexadecimal digits. Invalid forms remain visible with a warning instead of being normalized into apparently valid data.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Header Length Is Measured in Octets</h2><p className="mt-4 text-gray-600 leading-relaxed">Internationalized email can use UTF-8 directly under RFC 6532, so JavaScript&apos;s <code>string.length</code> is not a safe transport-length measurement. The long-line check counts UTF-8 octets with TextEncoder and flags lines above the 998-octet hard limit used by Internet Message Format.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">The 75-Character Encoded-Word Limit</h2><p className="mt-4 text-gray-600 leading-relaxed">RFC 2047 limits each encoded-word to 75 characters including delimiters and charset. When wrapping is enabled, the encoder creates multiple complete encoded-words and folds between them instead of slicing through an encoded payload.</p></div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5"><h2 className="text-xl font-semibold text-gray-900">Official References</h2><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2"><a href="https://www.rfc-editor.org/rfc/rfc2047.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 2047 →</a><a href="https://www.rfc-editor.org/rfc/rfc5322.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 5322 →</a><a href="https://www.rfc-editor.org/rfc/rfc6532.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 6532 →</a></div></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Related Tools</h2><YoryantraRelatedTools currentHref="/tools/mime-encoded-word-decoder" /></div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) { return <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--light-gold)]" />{label}</label>; }
function SummaryCard({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 font-mono text-lg font-semibold text-gray-900">{value}</div></div>; }
function OutputBox({ title, text }: { title: string; text: string }) { return <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-gray-900">{title}</h3>{text && <button onClick={() => navigator.clipboard.writeText(text)} className="yoryantra-btn-outline text-sm">Copy</button>}</div><pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[200px] whitespace-pre-wrap break-words">{text || `${title} will appear here.`}</pre></div>; }

function buildResult(options: { input: string; actionMode: ActionMode; outputMode: OutputMode; encodingMode: EncodingMode; charsetMode: CharsetMode; headerKind: HeaderKind; unfoldHeaders: boolean; joinAdjacentWords: boolean; preserveHeaderNames: boolean; warnUnsupportedCharset: boolean; warnBrokenWords: boolean; warnLongHeaderLines: boolean; wrapEncodedLines: boolean }): Result {
  const preparedInput = options.unfoldHeaders ? unfoldHeaderLines(options.input.trim()) : options.input.trim();
  const parts = parseEncodedWords(preparedInput, options.warnUnsupportedCharset);
  const decodedText = decodeHeaderText(preparedInput, parts, options);
  const baseText = options.actionMode === "encode" ? stripOrPreserveHeaderBody(preparedInput, options.preserveHeaderNames).body : (decodedText || preparedInput);
  const encodedText = encodeHeaderText(baseText, options);
  const issues = buildIssues(options.input, preparedInput, decodedText, parts, options);
  const output = formatOutput({ input: preparedInput, actionMode: options.actionMode, outputMode: options.outputMode, decodedText, encodedText, parts, issues, headerKind: options.headerKind });
  return { output, decodedText, encodedText, parts, issues, inputLength: preparedInput.length, decodedLength: decodedText.length, encodedWordCount: parts.length, charsetCount: new Set(parts.map((part) => normalizeCharset(part.charset))).size };
}
function unfoldHeaderLines(input: string) { return input.replace(/\r?\n[\t ]+/g, " "); }
function parseEncodedWords(input: string, warnUnsupportedCharset: boolean): EncodedWordPart[] {
  const regex = /=\?([^?\s]+)\?([bBqQ])\?([^?]*)\?=/g; const parts: EncodedWordPart[] = []; let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    const charset = match[1]; const encoding = match[2].toUpperCase(); const encodedText = match[3]; const decoded = decodeEncodedWord(charset, encoding, encodedText, warnUnsupportedCharset);
    parts.push({ index: parts.length, raw: match[0], charset, encoding, encodedText, decodedText: decoded.text, start: match.index, end: match.index + match[0].length, byteLength: decoded.byteLength, hasError: Boolean(decoded.error), errorMessage: decoded.error || "" });
  }
  return parts;
}
function decodeHeaderText(input: string, parts: EncodedWordPart[], options: { joinAdjacentWords: boolean; preserveHeaderNames: boolean }) {
  if (!parts.length) return options.preserveHeaderNames ? input.trim() : input.replace(/^[A-Za-z0-9-]+:\s*/, "").trim();
  let decoded = ""; let cursor = 0;
  parts.forEach((part, index) => { const between = input.slice(cursor, part.start); const previous = index > 0 ? parts[index - 1] : null; if (!(options.joinAdjacentWords && previous && /^\s+$/.test(between))) decoded += between; decoded += part.hasError ? part.raw : part.decodedText; cursor = part.end; });
  decoded += input.slice(cursor); if (!options.preserveHeaderNames) decoded = decoded.replace(/^[A-Za-z0-9-]+:\s*/, ""); return decoded.trim();
}
function decodeEncodedWord(charset: string, encoding: string, encodedText: string, warnUnsupportedCharset: boolean) {
  try {
    if (/[\t \r\n]/.test(encodedText)) throw new Error("RFC 2047 encoded-text cannot contain raw spaces, tabs, or line breaks.");
    const bytes = encoding === "B" ? decodeBase64ToBytes(encodedText) : decodeQToBytes(encodedText);
    const decoded = decodeBytesForCharset(bytes, charset, warnUnsupportedCharset); return { text: decoded.text, byteLength: bytes.length, error: decoded.error };
  } catch (error) { return { text: encodedText, byteLength: 0, error: error instanceof Error ? error.message : "Unable to decode encoded word." }; }
}
function decodeBase64ToBytes(value: string) {
  if (!value) return new Uint8Array();
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0 || /=/.test(value.slice(0, -2))) throw new Error("Invalid RFC 2047 Base64 payload or padding.");
  let binary = ""; try { binary = atob(value); } catch { throw new Error("Invalid Base64 data in encoded word."); }
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
function decodeQToBytes(value: string) {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "_") { bytes.push(32); continue; }
    if (char === "=") { const hex = value.slice(index + 1, index + 3); if (!/^[0-9A-Fa-f]{2}$/.test(hex)) throw new Error("Invalid Q encoding: '=' must be followed by two hexadecimal digits."); bytes.push(Number.parseInt(hex, 16)); index += 2; continue; }
    const code = char.charCodeAt(0); if (code > 0x7f) throw new Error("Q encoded-text must use ASCII characters or =HH byte escapes."); bytes.push(code);
  }
  return new Uint8Array(bytes);
}
function decodeBytesForCharset(bytes: Uint8Array, charset: string, warn: boolean) {
  const normalized = normalizeCharset(charset);
  if (normalized === "iso-8859-1") return { text: Array.from(bytes).map((byte) => String.fromCharCode(byte)).join(""), error: "" };
  if (normalized === "us-ascii") { const bad = Array.from(bytes).some((byte) => byte > 0x7f); return { text: Array.from(bytes).map((byte) => byte <= 0x7f ? String.fromCharCode(byte) : "�").join(""), error: bad ? "US-ASCII payload contains bytes above 0x7F." : "" }; }
  if (normalized === "windows-1252") return decodeWindows1252(bytes);
  try { return { text: new TextDecoder(normalized, { fatal: true }).decode(bytes), error: "" }; }
  catch { try { return { text: new TextDecoder(normalized).decode(bytes), error: "Byte sequence is not valid for the declared charset." }; } catch { return { text: Array.from(bytes).map((byte) => String.fromCharCode(byte)).join(""), error: warn ? `Unsupported charset: ${charset}. Latin-1-style fallback used.` : "" }; } }
}
function normalizeCharset(charset: string) { const clean = charset.trim().toLowerCase(); if (["utf8", "utf-8"].includes(clean)) return "utf-8"; if (["latin1", "latin-1", "iso8859-1", "iso-8859-1"].includes(clean)) return "iso-8859-1"; if (["windows1252", "windows-1252", "cp1252"].includes(clean)) return "windows-1252"; if (["ascii", "us-ascii"].includes(clean)) return "us-ascii"; return clean; }
function decodeWindows1252(bytes: Uint8Array) { const table: Record<number, number> = { 0x80:0x20ac,0x82:0x201a,0x83:0x0192,0x84:0x201e,0x85:0x2026,0x86:0x2020,0x87:0x2021,0x88:0x02c6,0x89:0x2030,0x8a:0x0160,0x8b:0x2039,0x8c:0x0152,0x8e:0x017d,0x91:0x2018,0x92:0x2019,0x93:0x201c,0x94:0x201d,0x95:0x2022,0x96:0x2013,0x97:0x2014,0x98:0x02dc,0x99:0x2122,0x9a:0x0161,0x9b:0x203a,0x9c:0x0153,0x9e:0x017e,0x9f:0x0178 }; const undef = new Set([0x81,0x8d,0x8f,0x90,0x9d]); let bad = false; const text = Array.from(bytes).map((byte) => { if (undef.has(byte)) { bad = true; return "�"; } return byte in table ? String.fromCodePoint(table[byte]) : String.fromCharCode(byte); }).join(""); return { text, error: bad ? "Windows-1252 contains undefined byte values." : "" }; }

function encodeHeaderText(input: string, options: { encodingMode: EncodingMode; charsetMode: CharsetMode; headerKind: HeaderKind; wrapEncodedLines: boolean; preserveHeaderNames: boolean }) {
  const split = splitHeaderName(input, options.preserveHeaderNames, options.headerKind); const body = split.body.trim(); if (!body) return split.headerName ? `${split.headerName}:` : "";
  const encoding = options.encodingMode === "auto" ? chooseEncoding(body) : options.encodingMode;
  const words = buildEncodedWords(body, options.charsetMode, encoding);
  const encoded = options.wrapEncodedLines ? words.map((word, index) => index === 0 ? word : `\r\n ${word}`).join("") : words.join(" ");
  return split.headerName ? `${split.headerName}: ${encoded}` : encoded;
}
function stripOrPreserveHeaderBody(input: string, preserve: boolean) { return splitHeaderName(input, preserve, "generic"); }
function splitHeaderName(input: string, preserve: boolean, kind: HeaderKind) { if (!preserve) return { headerName: "", body: input }; const match = input.match(/^([A-Za-z0-9-]+):\s*([\s\S]*)$/); if (match) return { headerName: match[1], body: match[2] }; return { headerName: kind === "subject" ? "Subject" : kind === "display-name" ? "From" : kind === "comment" ? "Comments" : "", body: input }; }
function chooseEncoding(text: string): "base64" | "q" { const nonAscii = Array.from(text).filter((char) => (char.codePointAt(0) ?? 0) > 127).length; return nonAscii > Math.max(2, (text.match(/\s/g) || []).length) ? "base64" : "q"; }
function buildEncodedWords(text: string, charset: CharsetMode, encoding: "base64" | "q") {
  const label = charset.toUpperCase(); const maxPayload = Math.max(8, 75 - (`=?${label}?${encoding === "base64" ? "B" : "Q"}??=`).length)); const chars = Array.from(text); const words: string[] = []; let current = "";
  const flush = () => { if (!current) return; words.push(makeEncodedWord(current, charset, encoding)); current = ""; };
  for (const char of chars) { const candidate = current + char; if (current && encodedPayloadLength(candidate, charset, encoding) > maxPayload) flush(); current += char; if (encodedPayloadLength(current, charset, encoding) > maxPayload && current.length === char.length) throw new Error("A character cannot be represented inside the selected RFC 2047 encoded-word limit with this charset."); }
  flush(); return words;
}
function encodedPayloadLength(text: string, charset: CharsetMode, encoding: "base64" | "q") { const bytes = encodeBytes(text, charset); if (encoding === "base64") return Math.ceil(bytes.length / 3) * 4; return Array.from(bytes).reduce((sum, byte) => sum + (byte === 32 ? 1 : isQSafe(byte) ? 1 : 3), 0); }
function makeEncodedWord(text: string, charset: CharsetMode, encoding: "base64" | "q") { const bytes = encodeBytes(text, charset); const payload = encoding === "base64" ? bytesToBase64(bytes) : Array.from(bytes).map((byte) => byte === 32 ? "_" : isQSafe(byte) ? String.fromCharCode(byte) : `=${byte.toString(16).toUpperCase().padStart(2, "0")}`).join(""); return `=?${charset.toUpperCase()}?${encoding === "base64" ? "B" : "Q"}?${payload}?=`; }
function encodeBytes(text: string, charset: CharsetMode) { if (charset === "utf-8") return new TextEncoder().encode(text); const out: number[] = []; for (const char of Array.from(text)) { const cp = char.codePointAt(0) ?? 0; if (charset === "us-ascii") { if (cp > 0x7f) throw new Error("US-ASCII cannot represent every input character. Use UTF-8."); out.push(cp); } else if (charset === "iso-8859-1") { if (cp > 0xff) throw new Error("ISO-8859-1 cannot represent every input character. Use UTF-8."); out.push(cp); } else { const byte = encodeWindows1252CodePoint(cp); if (byte === null) throw new Error("Windows-1252 cannot represent every input character. Use UTF-8."); out.push(byte); } } return new Uint8Array(out); }
function encodeWindows1252CodePoint(cp: number): number | null { const reverse: Record<number, number> = {0x20ac:0x80,0x201a:0x82,0x0192:0x83,0x201e:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02c6:0x88,0x2030:0x89,0x0160:0x8a,0x2039:0x8b,0x0152:0x8c,0x017d:0x8e,0x2018:0x91,0x2019:0x92,0x201c:0x93,0x201d:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02dc:0x98,0x2122:0x99,0x0161:0x9a,0x203a:0x9b,0x0153:0x9c,0x017e:0x9e,0x0178:0x9f}; if (cp in reverse) return reverse[cp]; if (cp <= 0x7f || (cp >= 0xa0 && cp <= 0xff)) return cp; return null; }
function bytesToBase64(bytes: Uint8Array) { let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary); }
function isQSafe(byte: number) { return byte >= 33 && byte <= 126 && byte !== 61 && byte !== 63 && byte !== 95; }

function buildIssues(rawInput: string, preparedInput: string, decodedText: string, parts: EncodedWordPart[], options: { actionMode: ActionMode; charsetMode: CharsetMode; warnUnsupportedCharset: boolean; warnBrokenWords: boolean; warnLongHeaderLines: boolean }) {
  const issues: Issue[] = [];
  if (!parts.length && options.actionMode !== "encode") issues.push({ severity: "info", title: "No encoded-word found", message: "The input does not contain a complete =?charset?B/Q?text?= pattern. It may already be plain text." });
  const errored = parts.filter((part) => part.hasError); if (errored.length) issues.push({ severity: "warning", title: "Malformed or undecodable encoded-word", message: `${errored.length} encoded word${errored.length === 1 ? "" : "s"} could not be decoded strictly. Their original encoded-word text is preserved in the decoded view.` });
  if (options.warnUnsupportedCharset && parts.some((part) => /unsupported charset/i.test(part.errorMessage))) issues.push({ severity: "warning", title: "Unsupported charset fallback used", message: "The browser could not decode at least one declared charset directly. Verify the source charset before trusting the fallback text." });
  if (options.warnBrokenWords) {
    const suspicious = rawInput.match(/=\?[^\r\n]*?(?:\?=|$)/g) || [];
    const malformed = suspicious.filter((candidate) => !/^=\?[^?\s]+\?[bBqQ]\?[^?]*\?=$/.test(candidate.trim()));
    if (malformed.length) issues.push({ severity: "warning", title: "Possible broken encoded-word pattern", message: `${malformed.length} encoded-word-like fragment${malformed.length === 1 ? "" : "s"} do not match RFC 2047 encoded-word structure.` });
  }
  if (parts.some((part) => part.raw.length > 75)) issues.push({ severity: "warning", title: "Encoded-word exceeds RFC 2047 length", message: "At least one encoded-word is longer than 75 characters including charset and delimiters." });
  if (options.warnLongHeaderLines) {
    const longLines = rawInput.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => new TextEncoder().encode(line).length > 998);
    if (longLines.length) issues.push({ severity: "high", title: "Header line exceeds 998 octets", message: `${longLines.length} physical header line${longLines.length === 1 ? "" : "s"} exceed the 998-octet hard limit. The check uses UTF-8 octets rather than JavaScript UTF-16 code-unit length.` });
  }
  if (/\r?\n[^\t ]/.test(preparedInput)) issues.push({ severity: "info", title: "Multiple header lines detected", message: "Only continuation lines that begin with a space or tab are unfolded into the previous field." });
  if (decodedText.includes("�")) issues.push({ severity: "warning", title: "Replacement character found", message: "Decoded text contains U+FFFD, which usually means the charset or byte sequence needs review." });
  if (!issues.length) issues.push({ severity: "info", title: "Header processed cleanly", message: "No obvious MIME encoded-word warning was found." });
  return issues;
}
function formatOutput(params: { input: string; actionMode: ActionMode; outputMode: OutputMode; decodedText: string; encodedText: string; parts: EncodedWordPart[]; issues: Issue[]; headerKind: HeaderKind }) { const primary = params.actionMode === "encode" ? params.encodedText : params.decodedText; if (params.outputMode === "plain") return primary; if (params.outputMode === "json") return JSON.stringify({ action: params.actionMode, headerKind: params.headerKind, decodedText: params.decodedText, encodedText: params.encodedText, encodedWords: params.parts, issues: params.issues }, null, 2); if (params.outputMode === "markdown") return ["| # | Charset | Encoding | Bytes | Status |", "|---:|---|---|---:|---|", ...params.parts.map((part) => `| ${part.index + 1} | ${part.charset} | ${part.encoding} | ${part.byteLength} | ${part.hasError ? escapeMd(part.errorMessage) : "decoded"} |`), "", ...params.issues.map((issue) => `- **${issue.title}:** ${issue.message}`)].join("\n"); if (params.outputMode === "csv") return [["index","charset","encoding","bytes","decoded","status"], ...params.parts.map((part) => [String(part.index + 1),part.charset,part.encoding,String(part.byteLength),part.decodedText,part.hasError ? part.errorMessage : "decoded"])].map((row) => row.map(csvEscape).join(",")).join("\n"); if (params.outputMode === "checklist") return ["MIME Encoded-Word Review Checklist","-----------------------------------","- [ ] Confirm the declared charset matches the sender/source.","- [ ] Confirm B/Q payloads decode without strict-syntax warnings.","- [ ] Keep every encoded-word at 75 characters or fewer.","- [ ] Keep physical header lines within email transport limits.","- [ ] Check adjacent encoded-word whitespace and header folding.","",...params.issues.map((issue) => `- ${issue.title}: ${issue.message}`)].join("\n"); return [`Action: ${params.actionMode}`,`Encoded words: ${params.parts.length}`,`Decoded text: ${params.decodedText || "(none)"}`,"",`Encoded output: ${params.encodedText || "(none)"}`,"","Findings:",...params.issues.map((issue) => `- [${issue.severity.toUpperCase()}] ${issue.title}: ${issue.message}`)].join("\n"); }
function getNotes(result: Result): Note[] { const notes: Note[] = []; if (result.parts.some((part) => part.hasError)) notes.push({ title: "Keep the original header for forensic work", message: "Malformed encoded-words can be evidence of a broken sender or transport. Do not discard the raw header when debugging delivery or parsing differences." }); if (result.parts.length > 1) notes.push({ title: "Adjacent encoded words", message: "RFC 2047 display rules can ignore linear whitespace between adjacent encoded-words. The join option applies only in that specific case." }); return notes; }
function truncate(value: string, max: number) { return value.length <= max ? value : `${value.slice(0, max - 1)}…`; }
function escapeMd(value: string) { return value.replace(/\|/g, "\\|").replace(/\n/g, "<br>"); }
function csvEscape(value: string) { return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value; }
