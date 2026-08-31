"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type BodyFormatMode = "auto" | "json" | "text";
type OutputMode = "formatted" | "summary" | "headers";
type ParsedHeader = { name: string; value: string };
type ParsedCookie = { name: string; value: string; attributes: ParsedHeader[] };
type ParsedResponse = {
  protocol: string;
  statusCode: number;
  statusText: string;
  statusCategory: string;
  headers: ParsedHeader[];
  cookies: ParsedCookie[];
  body: string;
  formattedBody: string;
  bodyType: string;
  contentType: string;
  cacheControl: string;
  location: string;
  server: string;
  bodyBytes: number;
  parseWarnings: string[];
};
type ResponseNote = { title: string; message: string };

type BodyParse = { formatted: string; type: "none" | "text" | "json" | "invalid-json"; warning: string };

const sampleResponse = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
X-Request-ID: req_12345

{
  "success": true,
  "message": "Response formatted with Yoryantra",
  "items": [1, 2, 3]
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsedResponse, setParsedResponse] = useState<ParsedResponse | null>(null);
  const [error, setError] = useState("");
  const [bodyFormatMode, setBodyFormatMode] = useState<BodyFormatMode>("auto");
  const [outputMode, setOutputMode] = useState<OutputMode>("formatted");
  const [hideCookieValues, setHideCookieValues] = useState(true);
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => parsedResponse ? getResponseNotes(parsedResponse) : [], [parsedResponse]);
  const clear = () => { setOutput(""); setParsedResponse(null); setError(""); setCopied(false); };

  const formatResponse = () => {
    if (!input.trim()) { setError("Please paste a raw HTTP response."); setOutput(""); setParsedResponse(null); return; }
    try {
      const parsed = parseHttpResponse(input, { bodyFormatMode });
      setParsedResponse(parsed);
      setOutput(formatParsedResponse(parsed, { outputMode, hideCookieValues }));
      setError(""); setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to format this HTTP response.");
      setOutput(""); setParsedResponse(null);
    }
  };

  const copyOutput = async () => { if (!output) return; await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
  const loadExample = () => { setInput(sampleResponse); setBodyFormatMode("auto"); setOutputMode("formatted"); setHideCookieValues(true); clear(); };
  const resetAll = () => { setInput(""); setBodyFormatMode("auto"); setOutputMode("formatted"); setHideCookieValues(true); clear(); };

  return (
    <ToolShell title="HTTP Response Formatter" description="Format raw HTTP response captures, clean valid JSON bodies, inspect status lines, headers, cookies, cache headers, redirects, and malformed JSON-like bodies directly in your browser.">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">Raw HTTP Response</label>
        <textarea value={input} onChange={(event) => { setInput(event.target.value); clear(); }} placeholder={sampleResponse} className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]" />
        <p className="mt-2 text-sm text-gray-500">Paste a raw textual response from logs, DevTools, proxy tools, API clients, gateway traces, or debugging notes.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Formatting Options</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect label="Body Formatting" value={bodyFormatMode} onChange={(value) => { setBodyFormatMode(value as BodyFormatMode); clear(); }} options={[{ label: "Auto", value: "auto" }, { label: "JSON", value: "json" }, { label: "Text", value: "text" }]} />
          <YoryantraSelect label="Output" value={outputMode} onChange={(value) => { setOutputMode(value as OutputMode); clear(); }} options={[{ label: "Formatted Response", value: "formatted" }, { label: "Summary", value: "summary" }, { label: "Headers Only", value: "headers" }]} />
        </div>
        <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4"><input type="checkbox" checked={hideCookieValues} onChange={(event) => { setHideCookieValues(event.target.checked); setOutput(""); setCopied(false); }} className="mt-1 h-4 w-4 accent-[var(--light-gold)]" /><span><span className="block text-sm font-medium text-gray-900">Hide cookie values</span><span className="mt-1 block text-sm leading-relaxed text-gray-500">Hide Set-Cookie values in copied output so it is safer to share.</span></span></label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3"><button onClick={formatResponse} className="yoryantra-btn">Format HTTP Response</button><button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button><button onClick={resetAll} className="yoryantra-btn-outline">Reset</button></div>
      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>}

      {parsedResponse && <>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Status" value={`${parsedResponse.statusCode} ${parsedResponse.statusText}`} /><SummaryCard label="Protocol" value={parsedResponse.protocol} /><SummaryCard label="Headers" value={parsedResponse.headers.length.toLocaleString()} /><SummaryCard label="Body Size" value={`${parsedResponse.bodyBytes.toLocaleString()} bytes`} /></div>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5"><h3 className="text-lg font-semibold text-gray-900">Response Details</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><DetailCard label="Status Category" value={parsedResponse.statusCategory} /><DetailCard label="Body Type" value={parsedResponse.bodyType} /><DetailCard label="Content Type" value={parsedResponse.contentType || "(not provided)"} /><DetailCard label="Location" value={parsedResponse.location || "(not provided)"} /><DetailCard label="Cache-Control" value={parsedResponse.cacheControl || "(not provided)"} /><DetailCard label="Server" value={parsedResponse.server || "(not provided)"} /></div></div>
        {parsedResponse.headers.length > 0 && <ParsedTable rows={parsedResponse.headers.map((header) => [header.name, hideCookieValues && header.name.toLowerCase() === "set-cookie" ? "[hidden]" : header.value])} />}
        {parsedResponse.body && <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5"><h3 className="text-lg font-semibold text-gray-900">Body Preview</h3><p className="mt-2 text-sm text-gray-500">Body type detected as <strong>{parsedResponse.bodyType}</strong>.</p><pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[240px] whitespace-pre-wrap break-words">{parsedResponse.formattedBody || parsedResponse.body}</pre></div>}
        {notes.length > 0 && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"><h3 className="font-semibold text-amber-900">Response notes</h3><div className="mt-3 space-y-3">{notes.map((note) => <div key={note.title}><p className="text-sm font-semibold text-amber-900">{note.title}</p><p className="mt-1 text-sm leading-relaxed text-amber-800">{note.message}</p></div>)}</div></div>}
      </>}

      <div className="mt-8"><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold text-gray-900">Formatted Output</h3>{output && <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>}</div><pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">{output || "Formatted HTTP response output will appear here."}</pre></div>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">HTTP response formatting happens directly in your browser. The response text you paste is not submitted to a formatting API.</div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div><h2 className="text-2xl font-semibold text-gray-900">Formatting Raw HTTP Responses for Easier Debugging</h2><p className="mt-4 text-gray-600 leading-relaxed">Raw captures expose status, headers, cookies, cache behavior, redirect locations, content type, and body data. Separating those pieces helps you compare what an upstream service actually returned with what an application expected.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Malformed JSON-Like Bodies Stay Marked as Invalid</h2><p className="mt-4 text-gray-600 leading-relaxed">A response can advertise <code>application/json</code> or begin with <code>{`{`}</code>/<code>[</code> and still contain invalid JSON. Auto mode now distinguishes valid JSON from an invalid JSON-like body instead of labeling failed parsing as JSON. Choosing the explicit JSON mode turns invalid JSON into a blocking error.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Blank-Line Boundaries in Pasted Captures</h2><p className="mt-4 text-gray-600 leading-relaxed">HTTP/1.x uses an empty line between the header section and message body. Diagnostic tools sometimes insert spaces or tabs on that separator line, so this formatter accepts a whitespace-only separator when reading pasted text. It remains a review tool rather than an authority for parser-sensitive security analysis.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Body Size Is the Size of the Pasted UTF-8 Text</h2><p className="mt-4 text-gray-600 leading-relaxed">The Body Size card counts UTF-8 bytes in the pasted body. It is not a reconstructed wire length: transfer coding, compression, framing, and log transformations can change what you copied compared with the original HTTP message.</p></div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5"><h2 className="text-xl font-semibold text-gray-900">HTTP References</h2><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2"><a href="https://www.rfc-editor.org/rfc/rfc9110.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 9110 HTTP Semantics →</a><a href="https://www.rfc-editor.org/rfc/rfc9112.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 9112 HTTP/1.1 →</a></div></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Related Tools</h2><YoryantraRelatedTools currentHref="/tools/http-response-formatter" /></div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div></div>; }
function DetailCard({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 break-words font-mono text-sm text-gray-900">{value}</div></div>; }
function ParsedTable({ rows }: { rows: string[][] }) { return <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5"><h3 className="text-lg font-semibold text-gray-900">Headers</h3><div className="mt-4 overflow-auto rounded-xl border border-gray-200"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Header</th><th className="px-4 py-3">Value</th></tr></thead><tbody className="divide-y divide-gray-100">{rows.map((row, index) => <tr key={index}><td className="px-4 py-3 font-mono text-xs">{row[0]}</td><td className="px-4 py-3 font-mono text-xs break-words">{row[1]}</td></tr>)}</tbody></table></div></div>; }

function parseHttpResponse(input: string, options: { bodyFormatMode: BodyFormatMode }): ParsedResponse {
  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const boundary = /\n[\t ]*\n/.exec(normalized);
  const headPart = boundary ? normalized.slice(0, boundary.index) : normalized;
  const body = boundary ? normalized.slice(boundary.index + boundary[0].length) : "";
  const headLines = headPart.split("\n").filter((line) => line.trim() !== "");
  if (!headLines.length) throw new Error("Response is missing a status line.");
  const statusMatch = headLines[0].trim().match(/^(HTTP\/(?:1\.0|1\.1|2|3))\s+(\d{3})(?:\s+(.*))?$/);
  if (!statusMatch) throw new Error("Status line should look like HTTP/1.1 200 OK or a human-readable HTTP/2 200 capture.");
  const statusCode = Number(statusMatch[2]);
  const parsedHeaders = parseHeaders(headLines.slice(1));
  const contentType = getHeaderValue(parsedHeaders.headers, "content-type");
  const bodyParse = parseBody(body, contentType, options.bodyFormatMode);
  const warnings = [...parsedHeaders.warnings];
  if (!boundary && normalized.includes("\n") && headLines.length > 1) warnings.push("No blank header/body separator was found. The entire capture was treated as a status line plus headers.");
  if (bodyParse.warning) warnings.push(bodyParse.warning);
  return {
    protocol: statusMatch[1], statusCode, statusText: statusMatch[3] || "", statusCategory: getStatusCategory(statusCode), headers: parsedHeaders.headers, cookies: parseSetCookieHeaders(parsedHeaders.headers), body,
    formattedBody: bodyParse.formatted, bodyType: bodyParse.type === "invalid-json" ? "invalid JSON" : bodyParse.type,
    contentType, cacheControl: getHeaderValue(parsedHeaders.headers, "cache-control"), location: getHeaderValue(parsedHeaders.headers, "location"), server: getHeaderValue(parsedHeaders.headers, "server"), bodyBytes: new TextEncoder().encode(body).length, parseWarnings: warnings,
  };
}
function parseHeaders(lines: string[]) {
  const headers: ParsedHeader[] = []; const warnings: string[] = []; let current: ParsedHeader | null = null;
  lines.forEach((line, index) => {
    if (/^[ \t]/.test(line) && current) { current.value = `${current.value} ${line.trim()}`; warnings.push(`Header line ${index + 2} uses obsolete line folding and was unfolded for display.`); return; }
    const colon = line.indexOf(":"); if (colon === -1) throw new Error(`Header line ${index + 2} is missing a colon.`);
    const rawName = line.slice(0, colon); const name = rawName.trim(); const value = line.slice(colon + 1).trim();
    if (!name) throw new Error(`Header line ${index + 2} has an empty name.`);
    if (/\s$/.test(rawName)) warnings.push(`Header line ${index + 2} has whitespace before the colon.`);
    if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name)) warnings.push(`Header line ${index + 2} contains characters that are not valid in an HTTP field name.`);
    current = { name, value }; headers.push(current);
  });
  return { headers, warnings };
}
function parseSetCookieHeaders(headers: ParsedHeader[]): ParsedCookie[] { return headers.filter((header) => header.name.toLowerCase() === "set-cookie").map((header) => parseSetCookie(header.value)); }
function parseSetCookie(value: string): ParsedCookie { const parts = value.split(";").map((part) => part.trim()); const [first, ...attrs] = parts; const eq = first.indexOf("="); return { name: eq === -1 ? first : first.slice(0, eq).trim(), value: eq === -1 ? "" : first.slice(eq + 1).trim(), attributes: attrs.map((attr) => { const pos = attr.indexOf("="); return pos === -1 ? { name: attr, value: "" } : { name: attr.slice(0, pos).trim(), value: attr.slice(pos + 1).trim() }; }) }; }
function parseBody(body: string, contentType: string, mode: BodyFormatMode): BodyParse {
  if (!body) return { formatted: "", type: "none", warning: "" };
  if (mode === "text") return { formatted: body, type: "text", warning: "" };
  const trimmed = body.trim();
  const jsonLike = mode === "json" || contentType.toLowerCase().includes("json") || trimmed.startsWith("{") || trimmed.startsWith("[");
  if (!jsonLike) return { formatted: body, type: "text", warning: "" };
  try { return { formatted: JSON.stringify(JSON.parse(trimmed), null, 2), type: "json", warning: "" }; }
  catch { if (mode === "json") throw new Error("Response body is not valid JSON."); return { formatted: body, type: "invalid-json", warning: "The body looked like JSON or was declared as JSON, but JSON.parse failed. It was left unchanged and marked invalid JSON." }; }
}
function getHeaderValue(headers: ParsedHeader[], name: string) { return headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value || ""; }
function getStatusCategory(code: number) { if (code >= 100 && code < 200) return "Informational"; if (code < 300) return "Successful"; if (code < 400) return "Redirection"; if (code < 500) return "Client Error"; if (code < 600) return "Server Error"; return "Non-standard"; }
function formatParsedResponse(response: ParsedResponse, options: { outputMode: OutputMode; hideCookieValues: boolean }) {
  if (options.outputMode === "headers") return [`${response.protocol} ${response.statusCode} ${response.statusText}`, ...response.headers.map((header) => `${header.name}: ${options.hideCookieValues && header.name.toLowerCase() === "set-cookie" ? "[hidden]" : header.value}`)].join("\n");
  if (options.outputMode === "summary") return [`Status: ${response.statusCode} ${response.statusText}`, `Protocol: ${response.protocol}`, `Status category: ${response.statusCategory}`, `Headers: ${response.headers.length}`, `Cookies: ${response.cookies.length}`, `Body type: ${response.bodyType}`, `Body size: ${response.bodyBytes.toLocaleString()} UTF-8 bytes`, response.contentType ? `Content-Type: ${response.contentType}` : "", response.location ? `Location: ${response.location}` : "", ...response.parseWarnings.map((warning) => `Warning: ${warning}`)].filter(Boolean).join("\n");
  const head = [`${response.protocol} ${response.statusCode} ${response.statusText}`, ...response.headers.map((header) => `${header.name}: ${options.hideCookieValues && header.name.toLowerCase() === "set-cookie" ? "[hidden]" : header.value}`)];
  return response.body ? [...head, "", response.formattedBody].join("\n") : head.join("\n");
}
function getResponseNotes(response: ParsedResponse): ResponseNote[] { const notes = response.parseWarnings.map((message, index) => ({ title: `Parser note ${index + 1}`, message })); if (response.location && response.statusCode >= 300 && response.statusCode < 400) notes.push({ title: "Redirect response", message: `Location points to ${response.location}. This formatter does not follow the redirect.` }); if (response.cookies.length) notes.push({ title: "Cookie values are sensitive", message: "Set-Cookie values are hidden by default in copied output. Review them before sharing a response capture." }); return notes; }
