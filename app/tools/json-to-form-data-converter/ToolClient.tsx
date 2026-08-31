"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "pairs" | "formdata-js" | "urlencoded" | "curl" | "multipart" | "json" | "markdown" | "checklist";
type KeyStyle = "dot" | "bracket" | "repeat" | "indexed";
type ArrayMode = "repeat" | "brackets" | "indexed" | "json";
type ValueMode = "string" | "json" | "preserve";
type NullMode = "empty" | "null" | "omit";
type FieldRow = {
  key: string;
  value: string;
  sourceType: string;
  depth: number;
  isArrayValue: boolean;
  sourcePath: string;
};
type Issue = { severity: "info" | "warning" | "high"; title: string; message: string };
type Result = { output: string; fields: FieldRow[]; issues: Issue[]; inputLength: number; fieldCount: number; outputLength: number; detectedShape: string };

const sampleInput = `{
  "user": {
    "name": "Asha",
    "email": "asha@example.com"
  },
  "tags": ["developer", "api"],
  "active": true,
  "notes": null
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("formdata-js");
  const [keyStyle, setKeyStyle] = useState<KeyStyle>("bracket");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("repeat");
  const [valueMode, setValueMode] = useState<ValueMode>("string");
  const [nullMode, setNullMode] = useState<NullMode>("empty");
  const [trimStringValues, setTrimStringValues] = useState(false);
  const [includeEmptyStrings, setIncludeEmptyStrings] = useState(true);
  const [sortFields, setSortFields] = useState(false);
  const [encodeKeys, setEncodeKeys] = useState(true);
  const [encodeValues, setEncodeValues] = useState(true);
  const [includeCurlUrl, setIncludeCurlUrl] = useState(true);
  const [curlUrl, setCurlUrl] = useState("https://api.example.com/submit");
  const [warnNestedObjects, setWarnNestedObjects] = useState(true);
  const [warnArrays, setWarnArrays] = useState(true);
  const [warnFileLikeValues, setWarnFileLikeValues] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const collisionCount = useMemo(() => result ? countGeneratedKeyCollisions(result.fields) : 0, [result]);
  const clearResult = () => { setResult(null); setError(""); setCopied(false); };

  const convert = () => {
    if (!input.trim()) { setError("Please paste a JSON object to convert."); setResult(null); return; }
    const next = buildResult({ input, outputMode, keyStyle, arrayMode, valueMode, nullMode, trimStringValues, includeEmptyStrings, sortFields, encodeKeys, encodeValues, includeCurlUrl, curlUrl, warnNestedObjects, warnArrays, warnFileLikeValues });
    if (next.output.startsWith("__ERROR__:")) { setError(next.output.slice(10)); setResult(null); return; }
    setResult(next); setError(""); setCopied(false);
  };

  const copyOutput = async () => { if (!result?.output) return; await navigator.clipboard.writeText(result.output); setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
  const loadExample = () => { setInput(sampleInput); clearResult(); };
  const resetAll = () => { setInput(""); setOutputMode("formdata-js"); setKeyStyle("bracket"); setArrayMode("repeat"); setValueMode("string"); setNullMode("empty"); setTrimStringValues(false); setIncludeEmptyStrings(true); setSortFields(false); setEncodeKeys(true); setEncodeValues(true); setIncludeCurlUrl(true); setCurlUrl("https://api.example.com/submit"); clearResult(); };

  return (
    <ToolShell title="JSON to FormData Converter" description="Convert a JSON object into FormData append calls, field pairs, URL-encoded bodies, multipart previews, or cURL form parameters while exposing nested-key and repeated-key collisions before you send the request.">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">JSON Object</label>
        <textarea value={input} onChange={(event) => { setInput(event.target.value); clearResult(); }} rows={14} placeholder={sampleInput} className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <YoryantraSelect label="Output" value={outputMode} onChange={(value) => { setOutputMode(value as OutputMode); clearResult(); }} options={[
          { label: "JavaScript FormData", value: "formdata-js" }, { label: "Field pairs", value: "pairs" }, { label: "URL encoded", value: "urlencoded" }, { label: "cURL form", value: "curl" }, { label: "Multipart preview", value: "multipart" }, { label: "JSON report", value: "json" }, { label: "Markdown report", value: "markdown" }, { label: "Checklist", value: "checklist" },
        ]} />
        <YoryantraSelect label="Nested Key Style" value={keyStyle} onChange={(value) => { setKeyStyle(value as KeyStyle); clearResult(); }} options={[
          { label: "Bracket: user[name]", value: "bracket" }, { label: "Dot: user.name", value: "dot" }, { label: "Plain leaf key", value: "repeat" }, { label: "Indexed brackets", value: "indexed" },
        ]} />
        <YoryantraSelect label="Array Handling" value={arrayMode} onChange={(value) => { setArrayMode(value as ArrayMode); clearResult(); }} options={[
          { label: "Repeat key", value: "repeat" }, { label: "Append []", value: "brackets" }, { label: "Index items", value: "indexed" }, { label: "Keep array as JSON", value: "json" },
        ]} />
        <YoryantraSelect label="Null Values" value={nullMode} onChange={(value) => { setNullMode(value as NullMode); clearResult(); }} options={[
          { label: "Empty string", value: "empty" }, { label: "Literal null", value: "null" }, { label: "Omit field", value: "omit" },
        ]} />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Options</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Check label="Trim string values" checked={trimStringValues} onChange={(v) => { setTrimStringValues(v); clearResult(); }} />
          <Check label="Keep empty strings" checked={includeEmptyStrings} onChange={(v) => { setIncludeEmptyStrings(v); clearResult(); }} />
          <Check label="Sort generated fields" checked={sortFields} onChange={(v) => { setSortFields(v); clearResult(); }} />
          <Check label="URL-encode keys" checked={encodeKeys} onChange={(v) => { setEncodeKeys(v); clearResult(); }} />
          <Check label="URL-encode values" checked={encodeValues} onChange={(v) => { setEncodeValues(v); clearResult(); }} />
          <Check label="Include URL in cURL" checked={includeCurlUrl} onChange={(v) => { setIncludeCurlUrl(v); clearResult(); }} />
          <Check label="Warn about nested objects" checked={warnNestedObjects} onChange={(v) => { setWarnNestedObjects(v); clearResult(); }} />
          <Check label="Warn about arrays" checked={warnArrays} onChange={(v) => { setWarnArrays(v); clearResult(); }} />
          <Check label="Warn about file-like strings" checked={warnFileLikeValues} onChange={(v) => { setWarnFileLikeValues(v); clearResult(); }} />
        </div>
        {outputMode === "curl" && includeCurlUrl && <div className="mt-4"><label className="mb-2 block text-sm font-medium text-gray-700">cURL URL</label><input value={curlUrl} onChange={(event) => { setCurlUrl(event.target.value); clearResult(); }} className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono" /></div>}
      </div>

      <div className="mt-5 flex flex-wrap gap-3"><button onClick={convert} className="yoryantra-btn">Convert JSON</button><button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button><button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>{result && <button onClick={copyOutput} className="yoryantra-btn-outline">{copied ? "Copied" : "Copy Output"}</button>}</div>
      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {result && <>
        <div className="mt-8 grid gap-4 md:grid-cols-3"><SummaryCard label="Fields" value={result.fieldCount.toLocaleString()} /><SummaryCard label="Generated key collisions" value={collisionCount.toLocaleString()} /><SummaryCard label="Output characters" value={result.outputLength.toLocaleString()} /></div>
        {result.issues.length > 0 && <div className="mt-6 space-y-3">{result.issues.map((issue, index) => <div key={`${issue.title}-${index}`} className={`rounded-xl border p-4 ${issue.severity === "high" ? "border-red-200 bg-red-50" : issue.severity === "warning" ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50"}`}><div className="font-semibold text-gray-900">{issue.title}</div><p className="mt-1 text-sm leading-relaxed text-gray-700">{issue.message}</p></div>)}</div>}
        <div className="mt-8 overflow-auto rounded-xl border border-gray-200"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Generated Key</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Source Path</th><th className="px-4 py-3">Type</th></tr></thead><tbody className="divide-y divide-gray-100">{result.fields.slice(0, 100).map((field, index) => <tr key={`${field.sourcePath}-${index}`}><td className="px-4 py-3 font-mono text-xs">{field.key}</td><td className="px-4 py-3 font-mono text-xs break-words">{field.value}</td><td className="px-4 py-3 font-mono text-xs">{field.sourcePath}</td><td className="px-4 py-3">{field.sourceType}</td></tr>)}</tbody></table></div>
        <pre className="mt-8 yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">{result.output}</pre>
      </>}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">Conversion happens locally in your browser. The tool creates text previews and code; it does not submit your generated form to the destination URL.</div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div><h2 className="text-2xl font-semibold text-gray-900">JSON Objects and Form Fields Do Not Share One Universal Nested-Key Standard</h2><p className="mt-4 leading-relaxed text-gray-600">FormData is a list of string/file entries keyed by field names. JSON can contain nested objects, arrays, booleans, numbers, and null. Frameworks therefore use conventions such as <code>user[name]</code>, <code>user.name</code>, repeated keys, or indexed keys. Pick the convention your server actually parses.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Why Plain Leaf Keys Can Collide</h2><p className="mt-4 leading-relaxed text-gray-600">Flattening <code>billing.email</code> and <code>shipping.email</code> to the plain key <code>email</code> loses path information. Repeated keys can be intentional for arrays, but they can also be an accidental collision. This version tracks each source path and warns whenever one generated key represents multiple distinct JSON paths instead of silently pretending the mapping is one-to-one.</p></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Files Cannot Be Reconstructed from a JSON Filename</h2><p className="mt-4 leading-relaxed text-gray-600">A string such as <code>"avatar.png"</code> is still only text. Real multipart file uploads need a Blob/File plus filename and content type. The cURL output uses <code>--form-string</code> so values beginning with <code>@</code> are not accidentally interpreted as local file paths.</p></div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5"><h2 className="text-xl font-semibold text-gray-900">Official References</h2><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2"><a href="https://developer.mozilla.org/en-US/docs/Web/API/FormData" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">MDN FormData →</a><a href="https://www.rfc-editor.org/rfc/rfc7578.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 7578 multipart/form-data →</a><a href="https://url.spec.whatwg.org/#application/x-www-form-urlencoded" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">WHATWG form URL encoding →</a></div></div>
        <div><h2 className="text-xl font-semibold text-gray-900">Related Tools</h2><YoryantraRelatedTools currentHref="/tools/json-to-form-data-converter" /></div>
      </section>
    </ToolShell>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--light-gold)]" />{label}</label>; }
function SummaryCard({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 font-mono text-lg font-semibold text-gray-900">{value}</div></div>; }

function buildResult(options: { input: string; outputMode: OutputMode; keyStyle: KeyStyle; arrayMode: ArrayMode; valueMode: ValueMode; nullMode: NullMode; trimStringValues: boolean; includeEmptyStrings: boolean; sortFields: boolean; encodeKeys: boolean; encodeValues: boolean; includeCurlUrl: boolean; curlUrl: string; warnNestedObjects: boolean; warnArrays: boolean; warnFileLikeValues: boolean }): Result {
  let parsed: unknown;
  try { parsed = JSON.parse(options.input); } catch (error) { return emptyResult(`__ERROR__:The input is not valid JSON: ${error instanceof Error ? error.message : "Invalid JSON input."}`, options.input.length); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return emptyResult("__ERROR__:Please paste a JSON object. Form data fields are usually generated from object keys.", options.input.length);
  let fields = flattenToFields(parsed as Record<string, unknown>, options);
  if (!options.includeEmptyStrings) fields = fields.filter((field) => field.value !== "");
  if (options.sortFields) fields = [...fields].sort((a, b) => a.key.localeCompare(b.key));
  const issues = buildIssues(parsed, fields, options);
  let output = "";
  if (options.outputMode === "pairs") output = fields.map((field) => `${field.key}: ${field.value}`).join("\n");
  else if (options.outputMode === "formdata-js") output = ["const formData = new FormData();", ...fields.map((field) => `formData.append(${JSON.stringify(field.key)}, ${JSON.stringify(field.value)});`)].join("\n");
  else if (options.outputMode === "urlencoded") output = fields.map((field) => `${options.encodeKeys ? formEncode(field.key) : field.key}=${options.encodeValues ? formEncode(field.value) : field.value}`).join("&");
  else if (options.outputMode === "curl") output = buildCurl(fields, options.includeCurlUrl, options.curlUrl);
  else if (options.outputMode === "multipart") output = buildMultipart(fields);
  else if (options.outputMode === "json") output = JSON.stringify({ fieldCount: fields.length, fields, issues }, null, 2);
  else if (options.outputMode === "markdown") output = ["| Key | Value | Source Path | Type |", "|---|---|---|---|", ...fields.map((field) => `| ${escapeMd(field.key)} | ${escapeMd(field.value)} | ${escapeMd(field.sourcePath)} | ${field.sourceType} |`), "", ...issues.map((issue) => `- **${issue.title}:** ${issue.message}`)].join("\n");
  else output = ["JSON → Form Review Checklist", "--------------------------", "- [ ] Confirm the server's nested-key convention.", "- [ ] Review generated-key collision warnings.", "- [ ] Confirm array handling and repeated-key semantics.", "- [ ] Confirm null and empty-string behavior.", "- [ ] Attach real File/Blob values separately for uploads.", "", ...issues.map((issue) => `- ${issue.title}: ${issue.message}`)].join("\n");
  return { output, fields, issues, inputLength: options.input.length, fieldCount: fields.length, outputLength: output.length, detectedShape: "JSON object" };
}
function emptyResult(output: string, inputLength: number): Result { return { output, fields: [], issues: [], inputLength, fieldCount: 0, outputLength: 0, detectedShape: "invalid or unsupported JSON" }; }

function flattenToFields(value: Record<string, unknown>, options: { keyStyle: KeyStyle; arrayMode: ArrayMode; valueMode: ValueMode; nullMode: NullMode; trimStringValues: boolean }): FieldRow[] {
  const fields: FieldRow[] = [];
  const push = (path: string[], valueText: string, sourceType: string, depth: number, isArrayValue: boolean) => fields.push({ key: buildKey(path, options.keyStyle), value: valueText, sourceType, depth, isArrayValue, sourcePath: toSourcePath(path) });
  const walk = (current: unknown, path: string[], depth: number, fromArray: boolean) => {
    if (current === null) { if (options.nullMode !== "omit") push(path, options.nullMode === "null" ? "null" : "", "null", depth, fromArray); return; }
    if (Array.isArray(current)) {
      if (options.arrayMode === "json") { push(path, JSON.stringify(current), "array", depth, true); return; }
      current.forEach((item, index) => {
        let nextPath = path;
        if (options.arrayMode === "brackets") nextPath = [...path, ""];
        else if (options.arrayMode === "indexed") nextPath = [...path, String(index)];
        else nextPath = [...path, `#${index}`];
        walk(item, nextPath, depth + 1, true);
      });
      return;
    }
    if (typeof current === "object") { Object.entries(current as Record<string, unknown>).forEach(([key, item]) => walk(item, [...path, key], depth + 1, fromArray)); return; }
    push(path, formatValue(current, options.valueMode, options.trimStringValues), typeof current, depth, fromArray);
  };
  Object.entries(value).forEach(([key, item]) => walk(item, [key], 0, false));
  return fields;
}
function buildKey(path: string[], keyStyle: KeyStyle) {
  const logical = path.map((part) => part.startsWith("#") ? part.slice(1) : part);
  if (keyStyle === "dot") return logical.filter((part) => part !== "").join(".");
  if (keyStyle === "bracket") { const [first, ...rest] = logical; return `${first}${rest.map((part) => `[${part}]`).join("")}`; }
  if (keyStyle === "indexed") { const [first, ...rest] = logical; return `${first}${rest.map((part) => `[${part || ""}]`).join("")}`; }
  for (let index = logical.length - 1; index >= 0; index -= 1) if (logical[index] && !/^\d+$/.test(logical[index])) return logical[index];
  return logical[0] || "";
}
function toSourcePath(path: string[]) { return "$" + path.map((part) => part.startsWith("#") ? `[${part.slice(1)}]` : /^[A-Za-z_$][\w$]*$/.test(part) ? `.${part}` : `[${JSON.stringify(part)}]`).join(""); }
function formatValue(value: unknown, mode: ValueMode, trim: boolean) { if (typeof value === "string") return trim ? value.trim() : value; if (mode === "json") return JSON.stringify(value); return String(value); }
function countGeneratedKeyCollisions(fields: FieldRow[]) { const map = new Map<string, Set<string>>(); fields.forEach((field) => { if (!map.has(field.key)) map.set(field.key, new Set()); map.get(field.key)!.add(field.sourcePath); }); return Array.from(map.values()).filter((paths) => paths.size > 1).length; }
function buildIssues(parsed: unknown, fields: FieldRow[], options: { keyStyle: KeyStyle; warnNestedObjects: boolean; warnArrays: boolean; warnFileLikeValues: boolean }) {
  const issues: Issue[] = [];
  const collisions = new Map<string, Set<string>>();
  fields.forEach((field) => { if (!collisions.has(field.key)) collisions.set(field.key, new Set()); collisions.get(field.key)!.add(field.sourcePath); });
  const collided = Array.from(collisions.entries()).filter(([, paths]) => paths.size > 1);
  if (collided.length) issues.push({ severity: options.keyStyle === "repeat" ? "high" : "warning", title: "Generated form-key collision", message: `${collided.length} generated key${collided.length === 1 ? "" : "s"} map to multiple JSON source paths (${collided.slice(0, 3).map(([key, paths]) => `${key}: ${Array.from(paths).join(" / ")}`).join("; ")}${collided.length > 3 ? "; …" : ""}). Repeated keys may be intentional for arrays, but verify how the backend parses them.` });
  if (options.warnNestedObjects && hasNestedObject(parsed)) issues.push({ severity: "info", title: "Nested object flattened", message: "Nested JSON has been converted using the selected key convention. There is no universal FormData standard for nested object names." });
  if (options.warnArrays && hasArray(parsed)) issues.push({ severity: "info", title: "Array handling is a convention", message: "Confirm that your backend expects repeated, bracketed, indexed, or JSON-string array fields." });
  if (options.warnFileLikeValues && fields.some((field) => /(^@|\.(png|jpe?g|pdf|zip|csv|docx?|xlsx?)$)/i.test(field.value.trim()))) issues.push({ severity: "warning", title: "File-like text detected", message: "A filename or @path string is still text. Attach a real File/Blob in browser FormData or use the intended file form syntax in your HTTP client." });
  if (!issues.length) issues.push({ severity: "info", title: "Conversion ready for review", message: "No obvious mapping warning was found. Confirm the generated key convention against the receiving server before production use." });
  return issues;
}
function hasNestedObject(value: unknown, depth = 0): boolean { if (!value || typeof value !== "object") return false; if (depth > 0 && !Array.isArray(value)) return true; return Object.values(value as Record<string, unknown>).some((item) => hasNestedObject(item, depth + 1)); }
function hasArray(value: unknown): boolean { if (Array.isArray(value)) return true; if (!value || typeof value !== "object") return false; return Object.values(value as Record<string, unknown>).some(hasArray); }
function formEncode(value: string) { return encodeURIComponent(value).replace(/%20/g, "+").replace(/[!'()~*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`); }
function shellQuote(value: string) { return `'${value.replace(/'/g, `'"'"'`)}'`; }
function buildCurl(fields: FieldRow[], includeUrl: boolean, url: string) { const parts = ["curl -X POST"]; if (includeUrl) parts.push(shellQuote(url || "https://api.example.com/submit")); fields.forEach((field) => parts.push(`  --form-string ${shellQuote(`${field.key}=${field.value}`)}`)); return parts.join(" \\\n"); }
function buildMultipart(fields: FieldRow[]) { const boundary = "----YoryantraFormBoundary"; return [`Content-Type: multipart/form-data; boundary=${boundary}`, "", ...fields.flatMap((field) => [`--${boundary}`, `Content-Disposition: form-data; name="${field.key.replace(/"/g, '\\"')}"`, "", field.value]), `--${boundary}--`].join("\n"); }
function escapeMd(value: string) { return value.replace(/\|/g, "\\|").replace(/\n/g, "<br>"); }
