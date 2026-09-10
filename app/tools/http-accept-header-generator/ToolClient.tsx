"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Preset =
  | "jsonApi"
  | "browserHtml"
  | "xmlApi"
  | "fileDownload"
  | "graphql"
  | "formPost"
  | "custom";

type OutputMode = "headers" | "curl" | "fetch" | "axios" | "json" | "markdown";
type Charset = "utf-8" | "none" | "iso-8859-1";
type EncodingMode = "modern" | "identity" | "none" | "custom";

type HeaderRow = {
  name: string;
  value: string;
  enabled: boolean;
  note: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  headers: HeaderRow[];
  output: string;
  issues: Issue[];
  enabledCount: number;
  contentNegotiationMode: string;
};

const presetValues: Record<Preset, {
  accept: string;
  contentType: string;
  language: string;
  encoding: string;
}> = {
  jsonApi: {
    accept: "application/json",
    contentType: "application/json",
    language: "en-US,en;q=0.9",
    encoding: "gzip, br",
  },
  browserHtml: {
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    contentType: "",
    language: "en-US,en;q=0.9",
    encoding: "gzip, deflate, br",
  },
  xmlApi: {
    accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
    contentType: "application/xml",
    language: "en-US,en;q=0.9",
    encoding: "gzip, br",
  },
  fileDownload: {
    accept: "application/octet-stream,*/*;q=0.8",
    contentType: "",
    language: "en-US,en;q=0.9",
    encoding: "gzip, br",
  },
  graphql: {
    accept: "application/graphql-response+json, application/json;q=0.9",
    contentType: "application/json",
    language: "en-US,en;q=0.9",
    encoding: "gzip, br",
  },
  formPost: {
    accept: "application/json,text/plain,*/*",
    contentType: "application/x-www-form-urlencoded",
    language: "en-US,en;q=0.9",
    encoding: "gzip, br",
  },
  custom: {
    accept: "application/json",
    contentType: "application/json",
    language: "en-US,en;q=0.9",
    encoding: "gzip, br",
  },
};

export default function ToolClient() {
  const [preset, setPreset] = useState<Preset>("jsonApi");
  const [accept, setAccept] = useState("");
  const [contentType, setContentType] = useState("");
  const [language, setLanguage] = useState("");
  const [encoding, setEncoding] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [charset, setCharset] = useState<Charset>("none");
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("modern");
  const [outputMode, setOutputMode] = useState<OutputMode>("headers");
  const [includeAccept, setIncludeAccept] = useState(true);
  const [includeContentType, setIncludeContentType] = useState(true);
  const [includeLanguage, setIncludeLanguage] = useState(true);
  const [includeEncoding, setIncludeEncoding] = useState(true);
  const [warnWildcard, setWarnWildcard] = useState(true);
  const [warnContentTypeOnGet, setWarnContentTypeOnGet] = useState(true);
  const [requestMethod, setRequestMethod] = useState("GET");
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

  const applyPreset = (nextPreset: Preset) => {
    const values = presetValues[nextPreset];
    setPreset(nextPreset);
    if (nextPreset !== "custom") {
      setAccept(values.accept);
      setContentType(values.contentType);
      setLanguage(values.language);
      setEncoding(values.encoding);
      setEncodingMode(values.encoding ? "modern" : "none");
    }
    clearResult();
  };

  const generateHeaders = () => {
    const fallbackValues = presetValues[preset];

    if (!accept.trim() && includeAccept && !fallbackValues.accept.trim()) {
      setError("Please enter an Accept header value or turn off the Accept header.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = buildHeaders({
        accept: accept.trim() || fallbackValues.accept,
        contentType: contentType.trim() || fallbackValues.contentType,
        language: language.trim() || fallbackValues.language,
        encoding: encoding.trim() || fallbackValues.encoding,
        endpoint,
        charset,
        outputMode,
        includeAccept,
        includeContentType,
        includeLanguage,
        includeEncoding,
        warnWildcard,
        warnContentTypeOnGet,
        requestMethod,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to build these request headers.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setPreset("jsonApi");
    setAccept(presetValues.jsonApi.accept);
    setContentType(presetValues.jsonApi.contentType);
    setLanguage(presetValues.jsonApi.language);
    setEncoding(presetValues.jsonApi.encoding);
    setEndpoint("https://api.example.com/items");
    setRequestMethod("GET");
    setCharset("none");
    setEncodingMode("modern");
    setOutputMode("headers");
    setIncludeAccept(true);
    setIncludeContentType(true);
    setIncludeLanguage(true);
    setIncludeEncoding(true);
    setWarnWildcard(true);
    setWarnContentTypeOnGet(true);
    clearResult();
  };

  const resetAll = () => {
    setPreset("jsonApi");
    setAccept("");
    setContentType("");
    setLanguage("");
    setEncoding("");
    setEndpoint("");
    setRequestMethod("GET");
    setCharset("none");
    setEncodingMode("modern");
    setOutputMode("headers");
    setIncludeAccept(true);
    setIncludeContentType(true);
    setIncludeLanguage(true);
    setIncludeEncoding(true);
    setWarnWildcard(true);
    setWarnContentTypeOnGet(true);
    clearResult();
  };

  const updateEncodingMode = (value: EncodingMode) => {
    setEncodingMode(value);

    if (value === "modern") setEncoding("gzip, br");
    else if (value === "identity") setEncoding("identity");
    else if (value === "none") setEncoding("");

    clearResult();
  };

  const activePresetValues = presetValues[preset];

  return (
    <ToolShell
      title="HTTP Accept Header Generator"
      description="Build request negotiation headers with explicit media types, language ranges, encodings, and body type."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Request Profile</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Preset"
            value={preset}
            onChange={(value) => applyPreset(value as Preset)}
            options={[
              { label: "JSON API", value: "jsonApi" },
              { label: "Browser HTML request", value: "browserHtml" },
              { label: "XML API", value: "xmlApi" },
              { label: "File download", value: "fileDownload" },
              { label: "GraphQL request", value: "graphql" },
              { label: "Form POST", value: "formPost" },
              { label: "Custom", value: "custom" },
            ]}
          />

          <YoryantraSelect
            label="Request Method"
            value={requestMethod}
            onChange={(value) => {
              setRequestMethod(value);
              clearResult();
            }}
            options={[
              { label: "GET", value: "GET" },
              { label: "POST", value: "POST" },
              { label: "PUT", value: "PUT" },
              { label: "PATCH", value: "PATCH" },
              { label: "DELETE", value: "DELETE" },
              { label: "OPTIONS", value: "OPTIONS" },
            ]}
          />

          <InputField
            label="Endpoint URL"
            value={endpoint}
            onChange={(value) => {
              setEndpoint(value);
              clearResult();
            }}
            placeholder="https://api.example.com/items"
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Plain headers", value: "headers" },
              { label: "cURL command", value: "curl" },
              { label: "Fetch snippet", value: "fetch" },
              { label: "Axios snippet", value: "axios" },
              { label: "JSON object", value: "json" },
              { label: "Markdown notes", value: "markdown" },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Header Values</h3>

        <div className="mt-4 space-y-4">
          <InputField
            label="Accept"
            value={accept}
            onChange={(value) => {
              setAccept(value);
              setPreset("custom");
              clearResult();
            }}
            placeholder={activePresetValues.accept}
          />

          <InputField
            label="Content-Type"
            value={contentType}
            onChange={(value) => {
              setContentType(value);
              setPreset("custom");
              clearResult();
            }}
            placeholder={activePresetValues.contentType}
          />

          <InputField
            label="Accept-Language"
            value={language}
            onChange={(value) => {
              setLanguage(value);
              setPreset("custom");
              clearResult();
            }}
            placeholder={activePresetValues.language}
          />

          <InputField
            label="Accept-Encoding"
            value={encoding}
            onChange={(value) => {
              setEncoding(value);
              setPreset("custom");
              setEncodingMode("custom");
              clearResult();
            }}
            placeholder={activePresetValues.encoding}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Charset"
            value={charset}
            onChange={(value) => {
              setCharset(value as Charset);
              clearResult();
            }}
            options={[
              { label: "No charset parameter", value: "none" },
              { label: "UTF-8 when supported", value: "utf-8" },
              { label: "ISO-8859-1 when supported", value: "iso-8859-1" },
            ]}
          />

          <YoryantraSelect
            label="Encoding"
            value={encodingMode}
            onChange={(value) => updateEncodingMode(value as EncodingMode)}
            options={[
              { label: "Modern compression", value: "modern" },
              { label: "Identity only", value: "identity" },
              { label: "No Accept-Encoding", value: "none" },
              { label: "Custom", value: "custom" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={includeAccept} label="Include Accept header" onChange={(checked) => { setIncludeAccept(checked); clearResult(); }} />
            <CheckboxRow checked={includeContentType} label="Include Content-Type header" onChange={(checked) => { setIncludeContentType(checked); clearResult(); }} />
            <CheckboxRow checked={includeLanguage} label="Include Accept-Language header" onChange={(checked) => { setIncludeLanguage(checked); clearResult(); }} />
            <CheckboxRow checked={includeEncoding} label="Include Accept-Encoding header" onChange={(checked) => { setIncludeEncoding(checked); clearResult(); }} />
            <CheckboxRow checked={warnWildcard} label="Warn about broad wildcard Accept values" onChange={(checked) => { setWarnWildcard(checked); clearResult(); }} />
            <CheckboxRow checked={warnContentTypeOnGet} label="Warn about Content-Type on GET requests" onChange={(checked) => { setWarnContentTypeOnGet(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Content negotiation tells the server what response formats, languages, and encodings the client can accept.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateHeaders} className="yoryantra-btn whitespace-nowrap">
          Generate Headers
        </button>

        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
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
          <SummaryCard label="Headers" value={result.enabledCount.toLocaleString()} />
          <SummaryCard label="Mode" value={result.contentNegotiationMode} />
          <SummaryCard label="Preset" value={preset} />
          <SummaryCard label="Method" value={requestMethod} />
        </div>
      )}

      {result && result.headers.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Generated Header Review</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Header</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.headers.map((header) => (
                  <tr key={header.name}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">{header.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[340px] break-words">{header.value || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="block max-w-[260px] break-words">{header.note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Negotiation notes</h3>
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Generated Accept header output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Accept and Content-Type answer different questions</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Accept describes which response media types the client is willing to receive. Content-Type describes the media type of the
            representation carried in the request body. Sending both can be correct, but one does not imply the other.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quality values express preference, not percentages</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Accept, Accept-Language, and Accept-Encoding can attach q values from 0 to 1. Higher values are preferred; q=0 means
            the value is not acceptable. Basic q-value syntax is checked before output is generated.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser Fetch cannot set every request header</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Browsers control Accept-Encoding themselves. Fetch output therefore leaves that field out instead of showing JavaScript
            that a browser cannot reproduce faithfully.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Charset parameters belong to the media type definition</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A charset parameter is not universally valid for every media type. The optional charset choice is applied only to text/*
            and XML media types here. application/json does not define a charset parameter.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Header values must stay on one field line</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            CR, LF, NUL, and other unsafe control characters are rejected. cURL output uses POSIX single-quote escaping so shell
            metacharacters inside values are not silently reinterpreted.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References behind the syntax</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Content negotiation and Content-Type semantics are defined in{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5" target="_blank" rel="noreferrer">RFC 9110</a>.
            Language matching builds on{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc4647.html" target="_blank" rel="noreferrer">RFC 4647</a>,
            and browser-controlled headers are defined by the{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://fetch.spec.whatwg.org/#forbidden-request-header" target="_blank" rel="noreferrer">WHATWG Fetch Standard</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/http-accept-header-generator" /></div>
        </div>
      </section>
    </ToolShell>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
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

function IssueCard({ issue }: { issue: Issue }) {
  const classes =
    issue.severity === "high"
      ? "border-red-200 bg-red-50 text-red-800"
      : issue.severity === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-gray-200 bg-gray-50 text-gray-600";
  const heading =
    issue.severity === "high"
      ? "text-red-900"
      : issue.severity === "warning"
        ? "text-amber-900"
        : "text-gray-900";

  return (
    <div className={`self-start rounded-xl border p-4 ${classes}`}>
      <p className={`text-sm font-semibold ${heading}`}>{issue.title}</p>
      <p className="mt-1 text-sm leading-relaxed">{issue.message}</p>
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

function buildHeaders(options: {
  accept: string;
  contentType: string;
  language: string;
  encoding: string;
  endpoint: string;
  charset: Charset;
  outputMode: OutputMode;
  includeAccept: boolean;
  includeContentType: boolean;
  includeLanguage: boolean;
  includeEncoding: boolean;
  warnWildcard: boolean;
  warnContentTypeOnGet: boolean;
  requestMethod: string;
}): Result {
  const rawValues: Array<[string, string]> = [
    ["Accept", options.accept],
    ["Content-Type", options.contentType],
    ["Accept-Language", options.language],
    ["Accept-Encoding", options.encoding],
  ];
  rawValues.forEach(([name, value]) => validateFieldValue(name, value));

  if (options.includeAccept && options.accept.trim()) validateAccept(options.accept);
  if (options.includeLanguage && options.language.trim()) validateWeightedTokenList("Accept-Language", options.language, "language");
  if (options.includeEncoding && options.encoding.trim()) validateWeightedTokenList("Accept-Encoding", options.encoding, "encoding");
  if (options.includeContentType && options.contentType.trim()) validateContentType(options.contentType);

  const charsetApplied = supportsCharset(options.contentType.trim()) && options.charset !== "none";
  const contentTypeValue = charsetApplied ? applyCharset(options.contentType.trim(), options.charset) : options.contentType.trim();

  const headers: HeaderRow[] = [
    { name: "Accept", value: options.accept.trim(), enabled: options.includeAccept && Boolean(options.accept.trim()), note: "Preferred response media types." },
    { name: "Content-Type", value: contentTypeValue, enabled: options.includeContentType && Boolean(contentTypeValue), note: "Media type of the request body." },
    { name: "Accept-Language", value: options.language.trim(), enabled: options.includeLanguage && Boolean(options.language.trim()), note: "Preferred response languages." },
    { name: "Accept-Encoding", value: options.encoding.trim(), enabled: options.includeEncoding && Boolean(options.encoding.trim()), note: "Response content codings the client accepts." },
  ];

  const enabledHeaders = headers.filter((header) => header.enabled);
  const issues = buildIssues(enabledHeaders, { ...options, charsetApplied });
  const base = {
    headers: enabledHeaders,
    issues,
    enabledCount: enabledHeaders.length,
    contentNegotiationMode: detectMode(enabledHeaders),
  };
  const output = formatOutput(base, options);
  return { ...base, output };
}

function validateFieldValue(name: string, value: string) {
  if (/[\r\n\0]/.test(value) || /[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    throw new Error(`${name} contains a control character that is not safe in an HTTP field value.`);
  }
}

function splitCommaAware(value: string) {
  const parts: string[] = [];
  let current = "";
  let quoted = false;
  let escaped = false;
  for (const ch of value) {
    if (escaped) { current += ch; escaped = false; continue; }
    if (quoted && ch === "\\") { current += ch; escaped = true; continue; }
    if (ch === '"') { quoted = !quoted; current += ch; continue; }
    if (!quoted && ch === ",") { parts.push(current.trim()); current = ""; continue; }
    current += ch;
  }
  if (quoted) throw new Error("A quoted header parameter is not closed.");
  parts.push(current.trim());
  return parts.filter(Boolean);
}

function parseQValue(part: string, fieldName: string) {
  const qParams = part.match(/(?:^|;)\s*q\s*=/ig) || [];
  if (qParams.length > 1) throw new Error(`${fieldName} contains more than one q parameter in one item.`);
  if (qParams.length === 0) return;

  const match = part.match(/(?:^|;)\s*q\s*=\s*([^;\s]+)\s*(?:;|$)/i);
  if (!match || !/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(match[1])) {
    throw new Error(`${fieldName} contains an invalid q value. Use 0 to 1 with at most three decimal places.`);
  }
}

function validateAccept(value: string) {
  for (const item of splitCommaAware(value)) {
    parseQValue(item, "Accept");
    const media = item.split(";")[0].trim();
    if (!/^(?:\*\/\*|[!#$%&'*+\-.^_`|~0-9A-Za-z]+\/(?:\*|[!#$%&'*+\-.^_`|~0-9A-Za-z]+))$/.test(media)) {
      throw new Error(`Accept contains an invalid media range: ${media || "(empty)"}.`);
    }
  }
}

function validateWeightedTokenList(fieldName: string, value: string, kind: "language" | "encoding") {
  for (const item of splitCommaAware(value)) {
    parseQValue(item, fieldName);
    const token = item.split(";")[0].trim();
    const valid = kind === "language"
      ? token === "*" || /^[A-Za-z]{1,8}(?:-[A-Za-z0-9]{1,8})*$/.test(token)
      : token === "*" || /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(token);
    if (!valid) throw new Error(`${fieldName} contains an invalid ${kind === "language" ? "language range" : "content-coding"}: ${token || "(empty)"}.`);
  }
}

function validateContentType(value: string) {
  const media = value.split(";")[0].trim();
  if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+\/[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(media)) {
    throw new Error("Content-Type must start with a valid type/subtype media type.");
  }
}

function supportsCharset(contentType: string) {
  const media = contentType.split(";")[0].trim().toLowerCase();
  return media.startsWith("text/") || media === "application/xml" || media.endsWith("+xml");
}

function applyCharset(contentType: string, charset: Charset) {
  if (!contentType || charset === "none" || /;\s*charset=/i.test(contentType)) return contentType;
  return `${contentType}; charset=${charset}`;
}

function buildIssues(headers: HeaderRow[], options: {
  warnWildcard: boolean;
  warnContentTypeOnGet: boolean;
  requestMethod: string;
  accept: string;
  contentType: string;
  outputMode: OutputMode;
  includeContentType: boolean;
  includeEncoding: boolean;
  charset: Charset;
  charsetApplied: boolean;
}) {
  const issues: Issue[] = [];
  const accept = options.accept.toLowerCase();

  if (options.warnWildcard && splitCommaAware(accept).some((part) => part.split(";")[0].trim() === "*/*")) {
    issues.push({
      severity: "info",
      title: "Accept includes a broad wildcard",
      message: "*/* allows any response media type. That can be intentional, but it gives the server less specific preference information.",
    });
  }

  if (options.warnContentTypeOnGet && options.requestMethod === "GET" && options.includeContentType && options.contentType.trim()) {
    issues.push({
      severity: "info",
      title: "Content-Type is present on a GET request",
      message: "Content-Type describes a request body. Keep it only when this GET request actually carries a representation that the server expects.",
    });
  }

  if (options.charset !== "none" && options.contentType.trim() && !options.charsetApplied) {
    issues.push({
      severity: "info",
      title: "Charset was not appended",
      message: "The selected media type does not use the charset option in this generator. Media-type parameters are defined by each media type, not by HTTP globally.",
    });
  }

  if (options.outputMode === "fetch" && options.includeEncoding && headers.some((header) => header.name === "Accept-Encoding")) {
    issues.push({
      severity: "warning",
      title: "Browser Fetch controls Accept-Encoding",
      message: "Accept-Encoding is omitted from the Fetch snippet because browsers treat it as a forbidden request header and negotiate compression themselves.",
    });
  }

  if (headers.length === 0) {
    issues.push({
      severity: "warning",
      title: "No headers are enabled",
      message: "Enable at least one field before generating output.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Header syntax is ready to copy",
      message: "The enabled values passed structural checks. Server support and negotiation results still depend on the target endpoint.",
    });
  }
  return issues;
}

function detectMode(headers: HeaderRow[]) {
  const names = headers.map((header) => header.name);
  if (names.includes("Accept") && names.includes("Content-Type")) return "response preference + request body";
  if (names.includes("Accept")) return "response negotiation";
  if (names.includes("Content-Type")) return "request body metadata";
  return "custom request fields";
}

function headersToObject(headers: HeaderRow[]) {
  const object: Record<string, string> = {};
  headers.forEach((header) => { object[header.name] = header.value; });
  return object;
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function escapeJs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function formatOutput(result: Omit<Result, "output">, options: {
  outputMode: OutputMode;
  endpoint: string;
  requestMethod: string;
}) {
  const endpoint = options.endpoint.trim() || "https://api.example.com/items";
  const headerLines = result.headers.map((header) => `${header.name}: ${header.value}`);
  const browserHeaders = result.headers.filter((header) => header.name.toLowerCase() !== "accept-encoding");

  if (options.outputMode === "json") return JSON.stringify(headersToObject(result.headers), null, 2);

  if (options.outputMode === "curl") {
    const headerArgs = result.headers.map((header) => `  -H ${shellQuote(`${header.name}: ${header.value}`)}`).join(" \\\n");
    return [`curl -X ${options.requestMethod} ${shellQuote(endpoint)}`, headerArgs].filter(Boolean).join(" \\\n");
  }

  if (options.outputMode === "fetch") {
    return [
      `fetch("${escapeJs(endpoint)}", {`,
      `  method: "${options.requestMethod}",`,
      "  headers: {",
      ...browserHeaders.map((header) => `    "${header.name}": "${escapeJs(header.value)}",`),
      "  },",
      "});",
    ].join("\n");
  }

  if (options.outputMode === "axios") {
    return [
      "axios({",
      `  method: "${options.requestMethod.toLowerCase()}",`,
      `  url: "${escapeJs(endpoint)}",`,
      "  headers: {",
      ...result.headers.map((header) => `    "${header.name}": "${escapeJs(header.value)}",`),
      "  },",
      "});",
    ].join("\n");
  }

  if (options.outputMode === "markdown") {
    return [
      "| Header | Value |",
      "| --- | --- |",
      ...result.headers.map((header) => `| ${header.name} | ${escapeMarkdown(header.value)} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  return headerLines.join("\n");
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.headers.some((header) => header.name === "Content-Type")) {
    notes.push({
      title: "Content-Type belongs to the request representation",
      message: "A server can choose a different response type; request Content-Type does not constrain the response.",
    });
  }
  if (result.headers.some((header) => header.name === "Accept")) {
    notes.push({
      title: "Accept is a preference signal",
      message: "Negotiation behavior is endpoint-specific; a server that cannot provide an acceptable representation can respond with 406.",
    });
  }
  notes.push({
    title: "Presets are starting points",
    message: "Media types, language ranges, and compression support should match the real endpoint and client rather than a generic profile.",
  });
  return notes;
}

