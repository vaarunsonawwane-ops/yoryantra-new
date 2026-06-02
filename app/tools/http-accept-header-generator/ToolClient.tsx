"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
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
  const [charset, setCharset] = useState<Charset>("utf-8");
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
    setPreset(nextPreset);
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
    setCharset("utf-8");
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
    setCharset("utf-8");
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
      description="Generate HTTP Accept, Accept-Language, Accept-Encoding, and Content-Type headers for API requests, browser testing, JSON APIs, XML APIs, file downloads, and content negotiation debugging."
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
              { label: "UTF-8", value: "utf-8" },
              { label: "No charset", value: "none" },
              { label: "ISO-8859-1", value: "iso-8859-1" },
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
        <button onClick={generateHeaders} className="yoryantra-btn">
          Generate Headers
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
          <h3 className="text-sm font-semibold text-blue-900">Content negotiation guidance</h3>

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
          {output || "Generated Accept header output will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Building HTTP Accept Headers for API Testing</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Accept headers help clients tell servers which response formats they prefer. For APIs, this often means JSON, XML, GraphQL JSON, file downloads, language preferences, and compression support.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Accept Header Generator creates clean request headers and ready-to-copy examples for cURL, Fetch, Axios, JSON, and plain header formats.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the HTTP Accept Header Generator</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose a preset such as JSON API, browser HTML, XML API, GraphQL, or file download.</li>
            <li>Edit Accept, Content-Type, Accept-Language, or Accept-Encoding values if needed.</li>
            <li>Choose the request method and output format.</li>
            <li>Review warnings about wildcards or unnecessary headers.</li>
            <li>Copy the headers or generated request snippet.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Accept Header Examples</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>application/json</strong> for most JSON APIs.</li>
            <li><strong>text/html</strong> for browser-style HTML requests.</li>
            <li><strong>application/xml</strong> or <strong>text/xml</strong> for XML APIs.</li>
            <li><strong>application/octet-stream</strong> for binary downloads.</li>
            <li><strong>application/graphql-response+json</strong> for GraphQL responses.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Generated Headers</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Accept: application/json
Content-Type: application/json; charset=utf-8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, br`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Accept and Content-Type Are Different</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Accept describes what response formats the client can receive. Content-Type describes the format of the request body being sent. A GET request often needs Accept but may not need Content-Type because it usually has no body.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            When debugging API issues, check both headers carefully. A wrong Accept value can trigger an unexpected response format, while a wrong Content-Type can make the server reject or misread the request body.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does an HTTP Accept Header Generator do?">
              It creates request headers that tell a server which response format, language, and encoding the client prefers.
            </Faq>

            <Faq title="What is the difference between Accept and Content-Type?">
              Accept describes the response format the client wants. Content-Type describes the request body format the client is sending.
            </Faq>

            <Faq title="Should GET requests include Content-Type?">
              Usually not unless the request has a body or an API specifically requires it.
            </Faq>

            <Faq title="What does q=0.9 mean in an Accept header?">
              It is a quality value that tells the server relative preference when multiple formats or languages are acceptable.
            </Faq>

            <Faq title="Is anything uploaded when I generate headers?">
              No. The generator runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/api-request-header-builder" className="yoryantra-btn-outline">API Request Header Builder</Link>
            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">HTTP Headers Parser</Link>
            <Link href="/tools/curl-command-parser" className="yoryantra-btn-outline">cURL Command Parser</Link>
            <Link href="/tools/http-response-formatter" className="yoryantra-btn-outline">HTTP Response Formatter</Link>
            <Link href="/tools/api-rate-limit-header-parser" className="yoryantra-btn-outline">API Rate Limit Header Parser</Link>
          </div>
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
  const contentTypeValue = applyCharset(options.contentType.trim(), options.charset);
  const headers: HeaderRow[] = [
    {
      name: "Accept",
      value: options.accept.trim(),
      enabled: options.includeAccept,
      note: "Preferred response media type.",
    },
    {
      name: "Content-Type",
      value: contentTypeValue,
      enabled: options.includeContentType && Boolean(contentTypeValue),
      note: "Request body media type.",
    },
    {
      name: "Accept-Language",
      value: options.language.trim(),
      enabled: options.includeLanguage && Boolean(options.language.trim()),
      note: "Preferred response language.",
    },
    {
      name: "Accept-Encoding",
      value: options.encoding.trim(),
      enabled: options.includeEncoding && Boolean(options.encoding.trim()),
      note: "Compression formats the client can accept.",
    },
  ];
  const enabledHeaders = headers.filter((header) => header.enabled);
  const issues = buildIssues(enabledHeaders, options);
  const base = {
    headers: enabledHeaders,
    issues,
    enabledCount: enabledHeaders.length,
    contentNegotiationMode: detectMode(enabledHeaders),
  };
  const output = formatOutput(base, options);

  return {
    ...base,
    output,
  };
}

function applyCharset(contentType: string, charset: Charset) {
  if (!contentType || charset === "none") return contentType;
  if (/;\s*charset=/i.test(contentType)) return contentType;
  return `${contentType}; charset=${charset}`;
}

function buildIssues(headers: HeaderRow[], options: {
  warnWildcard: boolean;
  warnContentTypeOnGet: boolean;
  requestMethod: string;
  accept: string;
  contentType: string;
}) {
  const issues: Issue[] = [];
  const accept = options.accept.toLowerCase();
  const contentType = options.contentType.toLowerCase();

  if (options.warnWildcard && (accept === "*/*" || accept.includes("*/*;q=1"))) {
    issues.push({
      severity: "info",
      title: "Very broad Accept header",
      message: "A broad wildcard Accept value is flexible, but it can hide content negotiation mistakes during API testing.",
    });
  }

  if (options.warnContentTypeOnGet && options.requestMethod === "GET" && contentType.trim()) {
    issues.push({
      severity: "info",
      title: "Content-Type on GET request",
      message: "GET requests usually do not need Content-Type unless the API expects a request body.",
    });
  }

  if (contentType.includes("application/json") && !accept.includes("application/json") && accept.trim()) {
    issues.push({
      severity: "warning",
      title: "JSON body without JSON response preference",
      message: "Content-Type is JSON, but Accept does not clearly request JSON.",
    });
  }

  if (headers.length === 0) {
    issues.push({
      severity: "warning",
      title: "No headers enabled",
      message: "Enable at least one header to generate useful output.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Headers generated",
      message: "The selected headers look reasonable for the chosen request profile.",
    });
  }

  return issues;
}

function detectMode(headers: HeaderRow[]) {
  const names = headers.map((header) => header.name);

  if (names.includes("Accept") && names.includes("Content-Type")) return "request and response";
  if (names.includes("Accept")) return "response negotiation";
  if (names.includes("Content-Type")) return "request body only";
  return "custom";
}

function formatOutput(result: Omit<Result, "output">, options: {
  outputMode: OutputMode;
  endpoint: string;
  requestMethod: string;
}) {
  const endpoint = options.endpoint.trim() || "https://api.example.com/items";
  const headerObject = Object.fromEntries(result.headers.map((header) => [header.name, header.value]));
  const headerLines = result.headers.map((header) => `${header.name}: ${header.value}`);

  if (options.outputMode === "json") {
    return JSON.stringify(headerObject, null, 2);
  }

  if (options.outputMode === "curl") {
    const headers = result.headers.map((header) => `  -H "${header.name}: ${header.value}"`).join(" \\\n");
    return [`curl -X ${options.requestMethod} "${endpoint}"`, headers].filter(Boolean).join(" \\\n");
  }

  if (options.outputMode === "fetch") {
    return [
      `fetch("${endpoint}", {`,
      `  method: "${options.requestMethod}",`,
      "  headers: {",
      ...result.headers.map((header) => `    "${header.name}": "${escapeJs(header.value)}",`),
      "  },",
      "});",
    ].join("\n");
  }

  if (options.outputMode === "axios") {
    return [
      "axios({",
      `  method: "${options.requestMethod.toLowerCase()}",`,
      `  url: "${endpoint}",`,
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

function escapeJs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}
function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.headers.some((header) => header.name === "Content-Type")) {
    notes.push({
      title: "Content-Type describes the request body",
      message: "Use Content-Type when you send a body, such as JSON, XML, or form data.",
    });
  }

  if (result.headers.some((header) => header.name === "Accept")) {
    notes.push({
      title: "Accept describes the response you prefer",
      message: "Use Accept to request JSON, XML, HTML, files, or another response media type.",
    });
  }

  notes.push({
    title: "Server behavior can still vary",
    message: "Some APIs ignore Accept headers or require provider-specific headers. Check the API documentation when testing.",
  });

  return notes;
}
