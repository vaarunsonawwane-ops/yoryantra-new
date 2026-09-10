"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type ResourceType = "html" | "api" | "staticAsset" | "image" | "download" | "unknown";
type CheckingStyle = "balanced" | "strict" | "relaxed";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type HeaderMap = {
  statusCode: number | null;
  date: string;
  cacheControl: string;
  etag: string;
  expires: string;
  lastModified: string;
  vary: string;
  age: string;
  pragma: string;
  cacheStatus: string;
  cdnCacheControl: string;
  cdnCacheStatus: string;
  cfCacheStatus: string;
  xCache: string;
  surrogateControl: string;
  contentType: string;
};

type DirectiveMap = {
  maxAge: number | null;
  sMaxage: number | null;
  staleWhileRevalidate: number | null;
  staleIfError: number | null;
  public: boolean;
  private: boolean;
  noStore: boolean;
  noCache: boolean;
  mustRevalidate: boolean;
  immutable: boolean;
  duplicateDirectives: string[];
  invalidDeltaSeconds: string[];
};

type Result = {
  headers: HeaderMap;
  directives: DirectiveMap;
  issues: Issue[];
  output: string;
  storagePolicy: string;
  browserTtl: string;
  sharedTtl: string;
  freshnessSource: string;
  revalidation: string;
};

const sampleHeaders = `HTTP/2 200
date: Tue, 02 Jun 2026 08:30:00 GMT
content-type: text/html; charset=utf-8
cache-control: public, max-age=3600, stale-while-revalidate=86400
etag: "a1b2c3d4"
last-modified: Tue, 02 Jun 2026 08:20:00 GMT
vary: Accept-Encoding
age: 120
cache-status: "ExampleCDN"; hit; ttl=3480`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("html");
  const [checkingStyle, setCheckingStyle] = useState<CheckingStyle>("balanced");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [warnNoStore, setWarnNoStore] = useState(true);
  const [warnMissingValidators, setWarnMissingValidators] = useState(true);
  const [warnLongHtmlCache, setWarnLongHtmlCache] = useState(true);
  const [warnVaryStar, setWarnVaryStar] = useState(true);
  const [warnOldExpires, setWarnOldExpires] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result, resourceType) : []), [result, resourceType]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const analyzeHeaders = () => {
    if (!input.trim()) {
      setError("Please paste HTTP response headers.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = analyzeCacheHeaders({
        input,
        resourceType,
        checkingStyle,
        outputMode,
        warnNoStore,
        warnMissingValidators,
        warnLongHtmlCache,
        warnVaryStar,
        warnOldExpires,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze these cache headers.");
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
    setInput(sampleHeaders);
    setResourceType("html");
    setCheckingStyle("balanced");
    setOutputMode("summary");
    setWarnNoStore(true);
    setWarnMissingValidators(true);
    setWarnLongHtmlCache(true);
    setWarnVaryStar(true);
    setWarnOldExpires(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setResourceType("html");
    setCheckingStyle("balanced");
    setOutputMode("summary");
    setWarnNoStore(true);
    setWarnMissingValidators(true);
    setWarnLongHtmlCache(true);
    setWarnVaryStar(true);
    setWarnOldExpires(true);
    clearResult();
  };

  return (
    <ToolShell
      title="HTTP Cache Header Analyzer"
      description="Interpret HTTP freshness, storage, revalidation, Vary, Age, validators, and cache-status signals from response headers."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTTP Response Headers
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleHeaders}
          className="w-full min-h-[380px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste response headers from DevTools, curl, an API response, CDN logs, or a server header dump. The analyzer runs locally in your browser.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Resource Type"
            value={resourceType}
            onChange={(value) => {
              setResourceType(value as ResourceType);
              clearResult();
            }}
            options={[
              { label: "HTML page", value: "html" },
              { label: "API response", value: "api" },
              { label: "Static asset", value: "staticAsset" },
              { label: "Image", value: "image" },
              { label: "Download file", value: "download" },
              { label: "Unknown", value: "unknown" },
            ]}
          />

          <YoryantraSelect
            label="Checking Style"
            value={checkingStyle}
            onChange={(value) => {
              setCheckingStyle(value as CheckingStyle);
              clearResult();
            }}
            options={[
              { label: "Balanced", value: "balanced" },
              { label: "Strict", value: "strict" },
              { label: "Relaxed", value: "relaxed" },
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
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
              { label: "CSV", value: "csv" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={warnNoStore} label="Warn when no-store prevents caching" onChange={(checked) => { setWarnNoStore(checked); clearResult(); }} />
            <CheckboxRow checked={warnMissingValidators} label="Warn when ETag and Last-Modified are missing" onChange={(checked) => { setWarnMissingValidators(checked); clearResult(); }} />
            <CheckboxRow checked={warnLongHtmlCache} label="Warn about long HTML or API cache times" onChange={(checked) => { setWarnLongHtmlCache(checked); clearResult(); }} />
            <CheckboxRow checked={warnVaryStar} label="Warn about Vary: * and broad Vary values" onChange={(checked) => { setWarnVaryStar(checked); clearResult(); }} />
            <CheckboxRow checked={warnOldExpires} label="Warn when Expires conflicts with Cache-Control" onChange={(checked) => { setWarnOldExpires(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Use this to debug browser caching, CDN behavior, stale content, revalidation, and inconsistent cache headers.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeHeaders} className="yoryantra-btn whitespace-nowrap">
          Analyze Cache Headers
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
          <SummaryCard label="Storage" value={result.storagePolicy} />
          <SummaryCard label="Browser freshness" value={result.browserTtl} />
          <SummaryCard label="Shared freshness" value={result.sharedTtl} />
          <SummaryCard label="Revalidation" value={result.revalidation} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Cache Header Review</h3>

          <p className="mt-2 text-sm text-gray-500">
            Key cache-related headers found in the pasted response.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Header</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {headerRows(result.headers).map((row) => (
                  <tr key={row.name}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[620px] break-words">{row.value || "-"}</span>
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
          <h3 className="text-sm font-semibold text-gray-900">Cache interpretation notes</h3>
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
          {output || "HTTP cache analysis output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Header analysis cannot prove whether a particular request will be stored or reused. Method, status code, request Authorization,
        cache configuration, cookies, service workers, and CDN rules can change the result.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Storage and freshness are separate cache decisions</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Cache-Control: no-store forbids storage. no-cache is different: a response can be stored, but it must be successfully
            validated before reuse. private limits storage to private caches, while shared caches such as CDNs follow their own additional rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Freshness precedence matters</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            For a private cache, max-age takes precedence over Expires. For a shared cache, s-maxage takes precedence over max-age,
            which in turn takes precedence over Expires. An Expires value is most meaningful when a valid Date header is available to establish its lifetime.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Duplicate freshness directives are not harmless</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Repeating max-age or s-maxage makes the freshness lifetime unreliable. The analyzer keeps duplicate Cache-Control field
            lines visible, flags the repeated directive, and does not present the duplicated freshness value as a reliable lifetime.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Validators do not create freshness</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            ETag and Last-Modified support conditional requests and revalidation. They do not by themselves say how long a response is fresh.
            Age tells how long a response has been resident since generation or validation; it is not a TTL.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cache-Status and CDN headers need context</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Cache-Status has a standardized syntax, while CF-Cache-Status, X-Cache, CDN-Cache-Status, and Surrogate-Control are implementation-specific.
            A MISS or BYPASS is not automatically an error; it has to be interpreted against the resource and the CDN configuration.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards behind the analysis</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Core HTTP caching rules come from{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc9111.html" target="_blank" rel="noreferrer">RFC 9111</a>.
            Cache-Status is defined by{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc9211.html" target="_blank" rel="noreferrer">RFC 9211</a>,
            stale-while-revalidate and stale-if-error by{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc5861.html" target="_blank" rel="noreferrer">RFC 5861</a>,
            and immutable by{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc8246.html" target="_blank" rel="noreferrer">RFC 8246</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/http-cache-header-analyzer" /></div>
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

function analyzeCacheHeaders(options: {
  input: string;
  resourceType: ResourceType;
  checkingStyle: CheckingStyle;
  outputMode: OutputMode;
  warnNoStore: boolean;
  warnMissingValidators: boolean;
  warnLongHtmlCache: boolean;
  warnVaryStar: boolean;
  warnOldExpires: boolean;
}): Result {
  const headers = parseHeaders(options.input);
  const directives = parseCacheControl(headers.cacheControl);
  const expiration = expiresLifetimeSeconds(headers);
  const maxAgeUnreliable = directives.duplicateDirectives.includes("max-age") || directives.invalidDeltaSeconds.includes("max-age");
  const sMaxageUnreliable = directives.duplicateDirectives.includes("s-maxage") || directives.invalidDeltaSeconds.includes("s-maxage");

  const browserFreshness = maxAgeUnreliable ? null : directives.maxAge ?? expiration.seconds;
  const browserSource = maxAgeUnreliable
    ? "unreliable max-age; duplicate or invalid value present"
    : directives.maxAge !== null ? "max-age" : expiration.source;

  const sharedFreshness = sMaxageUnreliable
    ? null
    : directives.sMaxage !== null
      ? directives.sMaxage
      : maxAgeUnreliable
        ? null
        : directives.maxAge ?? expiration.seconds;
  const sharedSource = sMaxageUnreliable
    ? "unreliable s-maxage; duplicate or invalid value present"
    : directives.sMaxage !== null
      ? "s-maxage"
      : maxAgeUnreliable
        ? "unreliable max-age; duplicate or invalid value present"
        : directives.maxAge !== null ? "max-age" : expiration.source;

  const browserTtl = describeFreshness(browserFreshness, browserSource);
  const sharedTtl = describeFreshness(sharedFreshness, sharedSource);
  const freshnessSource = directives.sMaxage !== null || sMaxageUnreliable
    ? `${sharedSource} for shared caches; ${browserSource} for private caches`
    : browserSource;
  const storagePolicy = describeStoragePolicy(directives);
  const revalidation = describeRevalidation(headers, directives);
  const issues = buildIssues(headers, directives, options, expiration);

  const base = {
    headers,
    directives,
    issues,
    storagePolicy,
    browserTtl,
    sharedTtl,
    freshnessSource,
    revalidation,
  };
  const output = formatOutput(base, options.outputMode);
  return { ...base, output };
}

function parseHeaders(input: string): HeaderMap {
  const headers: HeaderMap = {
    statusCode: null,
    date: "",
    cacheControl: "",
    etag: "",
    expires: "",
    lastModified: "",
    vary: "",
    age: "",
    pragma: "",
    cacheStatus: "",
    cdnCacheControl: "",
    cdnCacheStatus: "",
    cfCacheStatus: "",
    xCache: "",
    surrogateControl: "",
    contentType: "",
  };

  input.split(/\r?\n/).forEach((line) => {
    const status = line.match(/^\s*HTTP\/\S+\s+(\d{3})(?:\s|$)/i);
    if (status) {
      headers.statusCode = Number(status[1]);
      return;
    }

    const match = line.match(/^\s*([^:\s][^:]*)\s*:\s*(.*)$/);
    if (!match) return;
    const name = match[1].trim().toLowerCase();
    const value = match[2].trim();

    if (name === "date") headers.date = value;
    else if (name === "cache-control") headers.cacheControl = combineHeader(headers.cacheControl, value);
    else if (name === "etag") headers.etag = value;
    else if (name === "expires") headers.expires = value;
    else if (name === "last-modified") headers.lastModified = value;
    else if (name === "vary") headers.vary = combineHeader(headers.vary, value);
    else if (name === "age") headers.age = value;
    else if (name === "pragma") headers.pragma = value;
    else if (name === "cache-status") headers.cacheStatus = combineHeader(headers.cacheStatus, value);
    else if (name === "cdn-cache-control") headers.cdnCacheControl = combineHeader(headers.cdnCacheControl, value);
    else if (name === "cdn-cache-status") headers.cdnCacheStatus = value;
    else if (name === "cf-cache-status") headers.cfCacheStatus = value;
    else if (name === "x-cache") headers.xCache = value;
    else if (name === "surrogate-control") headers.surrogateControl = value;
    else if (name === "content-type") headers.contentType = value;
  });

  return headers;
}

function combineHeader(existing: string, next: string) {
  return existing && next ? `${existing}, ${next}` : existing || next;
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
  parts.push(current.trim());
  return parts.filter(Boolean);
}

function parseDeltaSeconds(rawValue: string | undefined) {
  if (rawValue === undefined) return null;
  const value = rawValue.trim().replace(/^"|"$/g, "");
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseCacheControl(value: string): DirectiveMap {
  const directives: DirectiveMap = {
    maxAge: null,
    sMaxage: null,
    staleWhileRevalidate: null,
    staleIfError: null,
    public: false,
    private: false,
    noStore: false,
    noCache: false,
    mustRevalidate: false,
    immutable: false,
    duplicateDirectives: [],
    invalidDeltaSeconds: [],
  };

  const seen: Record<string, number> = {};
  for (const part of splitCommaAware(value)) {
    const eq = part.indexOf("=");
    const rawKey = (eq >= 0 ? part.slice(0, eq) : part).trim();
    const rawValue = eq >= 0 ? part.slice(eq + 1).trim() : undefined;
    const key = rawKey.toLowerCase();
    seen[key] = (seen[key] || 0) + 1;
    if (seen[key] === 2) directives.duplicateDirectives.push(key);

    if (["max-age", "s-maxage", "stale-while-revalidate", "stale-if-error"].includes(key)) {
      const numeric = parseDeltaSeconds(rawValue);
      if (numeric === null) {
        directives.invalidDeltaSeconds.push(key);
        continue;
      }
      if (key === "max-age") directives.maxAge = numeric;
      else if (key === "s-maxage") directives.sMaxage = numeric;
      else if (key === "stale-while-revalidate") directives.staleWhileRevalidate = numeric;
      else directives.staleIfError = numeric;
      continue;
    }

    if (key === "public") directives.public = true;
    else if (key === "private") directives.private = true;
    else if (key === "no-store") directives.noStore = true;
    else if (key === "no-cache") directives.noCache = true;
    else if (key === "must-revalidate") directives.mustRevalidate = true;
    else if (key === "immutable") directives.immutable = true;
  }

  return directives;
}

function expiresLifetimeSeconds(headers: HeaderMap): { seconds: number | null; source: string } {
  if (!headers.expires) return { seconds: null, source: "no explicit freshness lifetime" };
  const expires = Date.parse(headers.expires);
  if (!Number.isFinite(expires)) return { seconds: null, source: "invalid Expires" };
  if (!headers.date) return { seconds: null, source: "Expires present; Date needed for exact lifetime" };
  const date = Date.parse(headers.date);
  if (!Number.isFinite(date)) return { seconds: null, source: "invalid Date" };
  return { seconds: Math.max(0, Math.floor((expires - date) / 1000)), source: "Expires relative to Date" };
}

function buildIssues(
  headers: HeaderMap,
  directives: DirectiveMap,
  options: {
    resourceType: ResourceType;
    checkingStyle: CheckingStyle;
    warnNoStore: boolean;
    warnMissingValidators: boolean;
    warnLongHtmlCache: boolean;
    warnVaryStar: boolean;
    warnOldExpires: boolean;
  },
  expiration: { seconds: number | null; source: string },
) {
  const issues: Issue[] = [];

  if (!headers.cacheControl && !headers.expires) {
    issues.push({
      severity: "info",
      title: "No explicit freshness lifetime",
      message: "The response may still be cacheable under HTTP rules, including heuristic freshness. Header-only analysis cannot infer every cache decision.",
    });
  }

  if (directives.duplicateDirectives.length > 0) {
    issues.push({
      severity: "warning",
      title: "Duplicate Cache-Control directives",
      message: `Repeated ${directives.duplicateDirectives.join(", ")} directives can make freshness handling invalid or implementation-dependent. Remove the duplicate values.`,
    });
  }

  if (directives.invalidDeltaSeconds.length > 0) {
    issues.push({
      severity: "warning",
      title: "Invalid delta-seconds value",
      message: `${directives.invalidDeltaSeconds.join(", ")} must use non-negative integer seconds.`,
    });
  }

  if (options.warnNoStore && directives.noStore && ["staticAsset", "image", "download"].includes(options.resourceType)) {
    issues.push({
      severity: "warning",
      title: "no-store blocks storage",
      message: "That can be intentional for sensitive content, but it also prevents reuse of this static-looking resource by compliant caches.",
    });
  }

  if (directives.noCache) {
    issues.push({
      severity: "info",
      title: "no-cache still allows storage",
      message: "A stored response must be successfully validated before reuse; no-cache does not mean the same thing as no-store.",
    });
  }

  if (directives.private) {
    issues.push({
      severity: "info",
      title: "private restricts shared-cache storage",
      message: "Private caches can still store the response unless another directive prevents storage.",
    });
  }

  if (options.warnMissingValidators && !headers.etag && !headers.lastModified && !directives.noStore) {
    issues.push({
      severity: "info",
      title: "No ETag or Last-Modified validator",
      message: "Fresh responses can still be cached, but conditional revalidation has no validator from these two common mechanisms.",
    });
  }

  if (options.warnLongHtmlCache && ["html", "api"].includes(options.resourceType) && directives.maxAge !== null && directives.maxAge > 3600) {
    issues.push({
      severity: options.checkingStyle === "relaxed" ? "info" : "warning",
      title: "Long private-cache freshness for HTML or API data",
      message: "The one-hour threshold is a local diagnostic heuristic, not an HTTP rule. Confirm that deployments or data changes cannot make the response unexpectedly stale.",
    });
  }

  if (options.resourceType === "staticAsset" && directives.maxAge !== null && directives.maxAge < 86400 && !directives.noStore) {
    issues.push({
      severity: "info",
      title: "Short freshness lifetime for a static asset",
      message: "Fingerprint-named immutable assets often tolerate longer caching, but the correct lifetime depends on the deployment strategy.",
    });
  }

  if (options.warnVaryStar && splitCommaAware(headers.vary).some((value) => value === "*")) {
    issues.push({
      severity: "warning",
      title: "Vary: * prevents normal reuse",
      message: "A stored response with Vary: * never matches a later request, so it cannot be reused without forwarding the request to the origin.",
    });
  }

  if (headers.vary.toLowerCase().split(",").map((v) => v.trim()).some((v) => v === "cookie" || v === "authorization")) {
    issues.push({
      severity: "info",
      title: "Vary keys can create user-specific variants",
      message: "Cookie or Authorization in Vary can sharply reduce reuse. Whether that is correct depends on how the representation varies.",
    });
  }

  if (options.warnOldExpires && headers.expires && headers.cacheControl && (directives.maxAge !== null || directives.sMaxage !== null)) {
    issues.push({
      severity: "info",
      title: "Cache-Control freshness overrides Expires",
      message: "Expires remains visible for debugging, but max-age or s-maxage takes precedence for the applicable cache.",
    });
  }

  if (headers.expires && expiration.source.startsWith("invalid")) {
    issues.push({
      severity: "warning",
      title: "Expires or Date cannot be parsed",
      message: "An HTTP-date is needed to derive an Expires freshness lifetime reliably.",
    });
  }

  if (directives.public && directives.private) {
    issues.push({
      severity: "warning",
      title: "public and private appear together",
      message: "Those directives communicate conflicting shared-cache intent. Confirm which storage policy the response is meant to express.",
    });
  }

  if (directives.immutable && (directives.maxAge === null || directives.maxAge < 86400)) {
    issues.push({
      severity: "info",
      title: "immutable has little time to matter",
      message: "immutable is most meaningful when a representation is versioned and has a substantial freshness lifetime.",
    });
  }

  if (headers.age) {
    const age = parseDeltaSeconds(headers.age);
    if (age === null) {
      issues.push({
        severity: "warning",
        title: "Age is not a valid non-negative integer",
        message: "RFC 9111 defines Age as delta-seconds. Invalid values should not be treated as trustworthy cache age.",
      });
    }
  }

  if (headers.pragma.toLowerCase().includes("no-cache")) {
    issues.push({
      severity: "info",
      title: "Pragma is legacy request compatibility, not modern response cache control",
      message: "Do not treat Pragma: no-cache in a response as a replacement for Cache-Control directives.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "No contradiction found in the pasted cache fields",
      message: "The headers still need request and cache context before storage or reuse can be predicted with certainty.",
    });
  }

  return issues;
}

function describeStoragePolicy(directives: DirectiveMap) {
  if (directives.noStore) return "do not store";
  if (directives.private) return "private caches only";
  return "not prohibited by Cache-Control";
}

function describeFreshness(value: number | null, source: string) {
  if (value === null) return source;
  if (value === 0) return `0 seconds (${source})`;
  if (value < 60) return `${value} ${value === 1 ? "second" : "seconds"} (${source})`;
  if (value < 3600) {
    const minutes = Math.round(value / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} (${source})`;
  }
  if (value < 86400) {
    const hours = Math.round(value / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} (${source})`;
  }
  const days = Math.round(value / 86400);
  return `${days} ${days === 1 ? "day" : "days"} (${source})`;
}

function describeRevalidation(headers: HeaderMap, directives: DirectiveMap) {
  if (directives.noStore) return "not applicable: storage prohibited";
  const validator = headers.etag && headers.lastModified
    ? "ETag + Last-Modified"
    : headers.etag
      ? "ETag"
      : headers.lastModified
        ? "Last-Modified"
        : "no ETag/Last-Modified";
  if (directives.noCache) return `required before reuse; ${validator}`;
  if (directives.mustRevalidate) return `required once stale; ${validator}`;
  return validator;
}

function headerRows(headers: HeaderMap) {
  return [
    { name: "HTTP status", value: headers.statusCode === null ? "" : String(headers.statusCode) },
    { name: "Date", value: headers.date },
    { name: "Cache-Control", value: headers.cacheControl },
    { name: "ETag", value: headers.etag },
    { name: "Expires", value: headers.expires },
    { name: "Last-Modified", value: headers.lastModified },
    { name: "Vary", value: headers.vary },
    { name: "Age", value: headers.age },
    { name: "Pragma", value: headers.pragma },
    { name: "Cache-Status", value: headers.cacheStatus },
    { name: "CDN-Cache-Control", value: headers.cdnCacheControl },
    { name: "CDN-Cache-Status", value: headers.cdnCacheStatus },
    { name: "CF-Cache-Status", value: headers.cfCacheStatus },
    { name: "X-Cache", value: headers.xCache },
    { name: "Surrogate-Control", value: headers.surrogateControl },
    { name: "Content-Type", value: headers.contentType },
  ];
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode) {
  if (mode === "json") return JSON.stringify(result, null, 2);

  if (mode === "csv") {
    const rows = [
      ["header", "value"],
      ...headerRows(result.headers).map((row) => [row.name, row.value]),
      ["storagePolicy", result.storagePolicy],
      ["browserFreshness", result.browserTtl],
      ["sharedFreshness", result.sharedTtl],
      ["freshnessSource", result.freshnessSource],
      ["revalidation", result.revalidation],
      ["findings", result.issues.map((issue) => `${issue.severity}: ${issue.title}`).join("; ")],
    ];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Header | Value |",
      "| --- | --- |",
      ...headerRows(result.headers).map((row) => `| ${row.name} | ${escapeMarkdown(row.value || "-")} |`),
      "",
      `Storage: **${result.storagePolicy}**`,
      `Browser freshness: **${result.browserTtl}**`,
      `Shared freshness: **${result.sharedTtl}**`,
      `Revalidation: **${result.revalidation}**`,
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  const lines = [
    mode === "report" ? "HTTP Cache Header Report" : "HTTP Cache Header Summary",
    mode === "report" ? "------------------------" : "-------------------------",
    `Storage: ${result.storagePolicy}`,
    `Browser freshness: ${result.browserTtl}`,
    `Shared freshness: ${result.sharedTtl}`,
    `Freshness source: ${result.freshnessSource}`,
    `Revalidation: ${result.revalidation}`,
    "",
    "Headers:",
    ...headerRows(result.headers).map((row) => `- ${row.name}: ${row.value || "not found"}`),
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ];
  return lines.join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result, resourceType: ResourceType) {
  const notes: { title: string; message: string }[] = [];

  if (result.headers.cacheStatus || result.headers.cfCacheStatus || result.headers.cdnCacheStatus || result.headers.xCache) {
    notes.push({
      title: "A cache status describes one request",
      message: "A HIT, MISS, BYPASS, or similar value does not by itself define the response's future cacheability or freshness.",
    });
  }

  if (resourceType === "staticAsset") {
    notes.push({
      title: "Versioned assets can usually tolerate longer freshness",
      message: "That assumes filenames or URLs change when the content changes; otherwise a long max-age can preserve stale bytes.",
    });
  }

  notes.push({
    title: "Repeat-request testing completes the picture",
    message: "Compare Age, validators, Cache-Status/CDN fields, and network behavior across repeated requests before concluding that a cache rule works.",
  });

  return notes;
}

