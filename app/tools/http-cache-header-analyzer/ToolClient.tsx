"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
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
  cacheControl: string;
  etag: string;
  expires: string;
  lastModified: string;
  vary: string;
  age: string;
  pragma: string;
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
};

type Result = {
  headers: HeaderMap;
  directives: DirectiveMap;
  issues: Issue[];
  output: string;
  score: number;
  grade: "excellent" | "good" | "review" | "risky";
  cacheable: boolean;
  browserTtl: string;
  sharedTtl: string;
  revalidation: string;
};

const sampleHeaders = `HTTP/2 200
content-type: text/html; charset=utf-8
cache-control: public, max-age=3600, stale-while-revalidate=86400
etag: "a1b2c3d4"
last-modified: Tue, 02 Jun 2026 08:30:00 GMT
vary: Accept-Encoding
age: 120
cf-cache-status: HIT`;

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
      description="Analyze HTTP cache headers from pasted responses. Check Cache-Control, ETag, Expires, Last-Modified, Vary, Age, CDN cache status, browser caching, and revalidation behavior."
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
        <button onClick={analyzeHeaders} className="yoryantra-btn">
          Analyze Cache Headers
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
          <SummaryCard label="Grade" value={result.grade} />
          <SummaryCard label="Score" value={`${result.score}/100`} />
          <SummaryCard label="Browser TTL" value={result.browserTtl} />
          <SummaryCard label="Shared TTL" value={result.sharedTtl} />
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
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Cache findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Cache debugging guidance</h3>

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
          {output || "HTTP cache analysis output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool analyzes pasted headers only. Real cache behavior can also depend on browser state, CDN rules, service workers, cookies, authorization headers, and server configuration.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Debugging HTTP Cache Headers Without Guesswork</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Caching issues are often hard to see from the page alone. A stale page, repeated API request, missed CDN hit, or broken revalidation flow usually comes down to the response headers.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Cache Header Analyzer reads pasted headers and explains how Cache-Control, ETag, Expires, Last-Modified, Vary, Age, and CDN cache status may affect browser and shared cache behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the HTTP Cache Header Analyzer</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Copy response headers from browser DevTools, curl, an API client, or a CDN log.</li>
            <li>Paste the headers into the analyzer.</li>
            <li>Choose the resource type, such as HTML, API, static asset, or image.</li>
            <li>Review TTL, cacheability, revalidation, CDN status, and warnings.</li>
            <li>Copy the summary, report, JSON, Markdown, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Cache Header Problems</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>no-store</strong> prevents browser and shared caching entirely.</li>
            <li>HTML pages with very long max-age can serve stale content after deploys.</li>
            <li>Missing ETag or Last-Modified can make revalidation less efficient.</li>
            <li><strong>Vary: *</strong> makes caching difficult or impossible for many caches.</li>
            <li>Conflicting Expires and Cache-Control headers can confuse debugging.</li>
            <li>CDN cache status headers may show MISS, BYPASS, EXPIRED, STALE, or HIT behavior.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Cache-Control Header</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Cache-Control: public, max-age=3600, stale-while-revalidate=86400
ETag: "a1b2c3d4"
Vary: Accept-Encoding`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Different Resources Need Different Cache Rules</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A fingerprinted JavaScript file can often be cached for a long time. An HTML document usually needs shorter caching or revalidation. API responses depend on whether they are public, personalized, authenticated, or frequently updated.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Always review caching based on the resource type and user impact instead of applying one rule to every response.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does an HTTP Cache Header Analyzer do?">
              It reads pasted response headers and explains browser cache, CDN cache, TTL, revalidation, and risky cache patterns.
            </Faq>

            <Faq title="Does this tool fetch a live URL?">
              No. It only analyzes the headers you paste into the browser.
            </Faq>

            <Faq title="What is the difference between max-age and s-maxage?">
              max-age controls browser and cache freshness, while s-maxage applies to shared caches such as CDNs and proxies.
            </Faq>

            <Faq title="Should HTML pages be cached?">
              They can be cached carefully, but long HTML cache times can cause stale content after deploys.
            </Faq>

            <Faq title="Is anything uploaded when I analyze headers?">
              No. The analysis runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">HTTP Headers Parser</Link>
            <Link href="/tools/http-response-formatter" className="yoryantra-btn-outline">HTTP Response Formatter</Link>
            <Link href="/tools/http-status-code-checker" className="yoryantra-btn-outline">HTTP Status Code Checker</Link>
            <Link href="/tools/redirect-chain-checker" className="yoryantra-btn-outline">Redirect Chain Checker</Link>
            <Link href="/tools/security-headers-scanner" className="yoryantra-btn-outline">Security Headers Scanner</Link>
          </div>
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
  const issues = buildIssues(headers, directives, options);
  const cacheable = !directives.noStore && (directives.maxAge !== null || directives.sMaxage !== null || Boolean(headers.expires));
  const browserTtl = describeTtl(directives.maxAge);
  const sharedTtl = describeTtl(directives.sMaxage ?? directives.maxAge);
  const revalidation = describeRevalidation(headers, directives);
  const score = calculateScore(issues, directives, options.checkingStyle);
  const grade = getGrade(score, issues);
  const base = {
    headers,
    directives,
    issues,
    score,
    grade,
    cacheable,
    browserTtl,
    sharedTtl,
    revalidation,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function parseHeaders(input: string): HeaderMap {
  const headers: HeaderMap = {
    cacheControl: "",
    etag: "",
    expires: "",
    lastModified: "",
    vary: "",
    age: "",
    pragma: "",
    cdnCacheStatus: "",
    cfCacheStatus: "",
    xCache: "",
    surrogateControl: "",
    contentType: "",
  };

  input.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([^:]+)\s*:\s*(.+)\s*$/);
    if (!match) return;

    const name = match[1].trim().toLowerCase();
    const value = match[2].trim();

    if (name === "cache-control") headers.cacheControl = value;
    else if (name === "etag") headers.etag = value;
    else if (name === "expires") headers.expires = value;
    else if (name === "last-modified") headers.lastModified = value;
    else if (name === "vary") headers.vary = value;
    else if (name === "age") headers.age = value;
    else if (name === "pragma") headers.pragma = value;
    else if (name === "cdn-cache-status") headers.cdnCacheStatus = value;
    else if (name === "cf-cache-status") headers.cfCacheStatus = value;
    else if (name === "x-cache") headers.xCache = value;
    else if (name === "surrogate-control") headers.surrogateControl = value;
    else if (name === "content-type") headers.contentType = value;
  });

  return headers;
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
  };

  value.split(",").map((item) => item.trim()).filter(Boolean).forEach((part) => {
    const [rawKey, rawValue] = part.split("=");
    const key = rawKey.toLowerCase();
    const numberValue = rawValue ? Number(rawValue.replace(/^"|"$/g, "")) : null;

    if (key === "max-age" && Number.isFinite(numberValue)) directives.maxAge = numberValue;
    else if (key === "s-maxage" && Number.isFinite(numberValue)) directives.sMaxage = numberValue;
    else if (key === "stale-while-revalidate" && Number.isFinite(numberValue)) directives.staleWhileRevalidate = numberValue;
    else if (key === "stale-if-error" && Number.isFinite(numberValue)) directives.staleIfError = numberValue;
    else if (key === "public") directives.public = true;
    else if (key === "private") directives.private = true;
    else if (key === "no-store") directives.noStore = true;
    else if (key === "no-cache") directives.noCache = true;
    else if (key === "must-revalidate") directives.mustRevalidate = true;
    else if (key === "immutable") directives.immutable = true;
  });

  return directives;
}

function buildIssues(headers: HeaderMap, directives: DirectiveMap, options: {
  resourceType: ResourceType;
  checkingStyle: CheckingStyle;
  warnNoStore: boolean;
  warnMissingValidators: boolean;
  warnLongHtmlCache: boolean;
  warnVaryStar: boolean;
  warnOldExpires: boolean;
}) {
  const issues: Issue[] = [];

  if (!headers.cacheControl && !headers.expires) {
    issues.push({
      severity: "warning",
      title: "No explicit freshness header",
      message: "No Cache-Control or Expires header was found. Browser and CDN behavior may depend on heuristics.",
    });
  }

  if (options.warnNoStore && directives.noStore && ["staticAsset", "image", "download"].includes(options.resourceType)) {
    issues.push({
      severity: "warning",
      title: "no-store on cacheable-looking resource",
      message: "no-store prevents caching. This may be wasteful for static assets, images, or downloads.",
    });
  }

  if (options.warnMissingValidators && !headers.etag && !headers.lastModified && !directives.noStore) {
    issues.push({
      severity: "info",
      title: "No validator header found",
      message: "ETag or Last-Modified helps clients revalidate cached responses efficiently.",
    });
  }

  if (options.warnLongHtmlCache && ["html", "api"].includes(options.resourceType)) {
    const ttl = directives.maxAge ?? directives.sMaxage;

    if (ttl !== null && ttl > 3600) {
      issues.push({
        severity: options.checkingStyle === "relaxed" ? "info" : "warning",
        title: "Long cache time for HTML or API response",
        message: "Long freshness times can serve stale HTML or API data after deployments or content changes.",
      });
    }
  }

  if (options.resourceType === "staticAsset" && directives.maxAge !== null && directives.maxAge < 86400 && !directives.noStore) {
    issues.push({
      severity: "info",
      title: "Short TTL for static asset",
      message: "Fingerprint-named static assets can often use a longer max-age with immutable.",
    });
  }

  if (options.warnVaryStar && headers.vary.trim() === "*") {
    issues.push({
      severity: "warning",
      title: "Vary star found",
      message: "Vary: * can prevent effective caching because every request may be considered unique.",
    });
  }

  if (headers.vary.toLowerCase().includes("cookie") || headers.vary.toLowerCase().includes("authorization")) {
    issues.push({
      severity: "info",
      title: "Vary includes user-specific headers",
      message: "Varying by Cookie or Authorization can reduce shared cache effectiveness and should be intentional.",
    });
  }

  if (options.warnOldExpires && headers.expires && headers.cacheControl) {
    const expiresTime = Date.parse(headers.expires);

    if (Number.isFinite(expiresTime) && expiresTime < Date.now() && !directives.noStore && !directives.noCache) {
      issues.push({
        severity: "info",
        title: "Expires is already in the past",
        message: "Cache-Control usually takes priority, but a past Expires header can make debugging harder.",
      });
    }
  }

  if (directives.public && directives.private) {
    issues.push({
      severity: "warning",
      title: "Conflicting public and private directives",
      message: "Cache-Control contains both public and private. Use one clear cache intent.",
    });
  }

  if (directives.immutable && (directives.maxAge === null || directives.maxAge < 86400)) {
    issues.push({
      severity: "info",
      title: "immutable with short or missing max-age",
      message: "immutable is most useful with long-lived fingerprinted assets.",
    });
  }

  if (headers.cfCacheStatus && /BYPASS|DYNAMIC|MISS/i.test(headers.cfCacheStatus)) {
    issues.push({
      severity: "info",
      title: "Cloudflare cache is not a HIT",
      message: `CF-Cache-Status is ${headers.cfCacheStatus}. Review CDN rules if you expected this response to be cached.`,
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "No obvious cache issue found",
      message: "The pasted cache headers look reasonable for the selected checks.",
    });
  }

  return issues;
}

function describeTtl(value: number | null) {
  if (value === null) return "not set";
  if (value === 0) return "0 seconds";
  if (value < 60) return `${value} seconds`;
  if (value < 3600) return `${Math.round(value / 60)} minutes`;
  if (value < 86400) return `${Math.round(value / 3600)} hours`;
  return `${Math.round(value / 86400)} days`;
}

function describeRevalidation(headers: HeaderMap, directives: DirectiveMap) {
  if (directives.noStore) return "disabled by no-store";
  if (directives.noCache) return "requires revalidation before reuse";
  if (headers.etag && headers.lastModified) return "ETag and Last-Modified available";
  if (headers.etag) return "ETag available";
  if (headers.lastModified) return "Last-Modified available";
  return "no validator found";
}

function calculateScore(issues: Issue[], directives: DirectiveMap, checkingStyle: CheckingStyle) {
  let score = 100;

  if (directives.maxAge !== null || directives.sMaxage !== null) score += 4;
  if (directives.staleWhileRevalidate !== null) score += 3;

  issues.forEach((issue) => {
    if (issue.severity === "high") score -= 30;
    else if (issue.severity === "warning") score -= checkingStyle === "strict" ? 16 : 12;
    else if (issue.title !== "No obvious cache issue found") score -= 4;
  });

  return Math.max(0, Math.min(100, score));
}

function getGrade(score: number, issues: Issue[]): Result["grade"] {
  if (issues.some((issue) => issue.severity === "high") || score < 50) return "risky";
  if (score < 75) return "review";
  if (score < 90) return "good";
  return "excellent";
}

function headerRows(headers: HeaderMap) {
  return [
    { name: "Cache-Control", value: headers.cacheControl },
    { name: "ETag", value: headers.etag },
    { name: "Expires", value: headers.expires },
    { name: "Last-Modified", value: headers.lastModified },
    { name: "Vary", value: headers.vary },
    { name: "Age", value: headers.age },
    { name: "Pragma", value: headers.pragma },
    { name: "CDN-Cache-Status", value: headers.cdnCacheStatus },
    { name: "CF-Cache-Status", value: headers.cfCacheStatus },
    { name: "X-Cache", value: headers.xCache },
    { name: "Surrogate-Control", value: headers.surrogateControl },
    { name: "Content-Type", value: headers.contentType },
  ];
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "csv") {
    const rows = [
      ["header", "value"],
      ...headerRows(result.headers).map((row) => [row.name, row.value]),
      ["grade", result.grade],
      ["score", String(result.score)],
      ["browserTtl", result.browserTtl],
      ["sharedTtl", result.sharedTtl],
      ["revalidation", result.revalidation],
      ["issues", result.issues.map((issue) => `${issue.severity}: ${issue.title}`).join("; ")],
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Header | Value |",
      "| --- | --- |",
      ...headerRows(result.headers).map((row) => `| ${row.name} | ${escapeMarkdown(row.value || "-")} |`),
      "",
      `Grade: **${result.grade}**`,
      `Score: **${result.score}/100**`,
      `Browser TTL: **${result.browserTtl}**`,
      `Shared TTL: **${result.sharedTtl}**`,
    ].join("\n");
  }

  if (mode === "report") {
    return [
      "HTTP Cache Header Report",
      "------------------------",
      `Grade: ${result.grade}`,
      `Score: ${result.score}/100`,
      `Cacheable: ${result.cacheable ? "yes" : "no"}`,
      `Browser TTL: ${result.browserTtl}`,
      `Shared TTL: ${result.sharedTtl}`,
      `Revalidation: ${result.revalidation}`,
      "",
      "Headers:",
      ...headerRows(result.headers).map((row) => `- ${row.name}: ${row.value || "not found"}`),
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  return [
    "HTTP Cache Header Summary",
    "-------------------------",
    `Grade: ${result.grade}`,
    `Score: ${result.score}/100`,
    `Cacheable: ${result.cacheable ? "yes" : "no"}`,
    `Browser TTL: ${result.browserTtl}`,
    `Shared TTL: ${result.sharedTtl}`,
    `Revalidation: ${result.revalidation}`,
    `Cache-Control: ${result.headers.cacheControl || "not found"}`,
    `ETag: ${result.headers.etag || "not found"}`,
    `Expires: ${result.headers.expires || "not found"}`,
    `Last-Modified: ${result.headers.lastModified || "not found"}`,
    `Vary: ${result.headers.vary || "not found"}`,
    `CDN status: ${result.headers.cfCacheStatus || result.headers.cdnCacheStatus || result.headers.xCache || "not found"}`,
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result, resourceType: ResourceType) {
  const notes: { title: string; message: string }[] = [];

  if (result.headers.cfCacheStatus || result.headers.cdnCacheStatus || result.headers.xCache) {
    notes.push({
      title: "CDN status needs context",
      message: "A MISS or BYPASS may be expected for dynamic content, but unexpected for static assets or cacheable public pages.",
    });
  }

  if (resourceType === "staticAsset") {
    notes.push({
      title: "Static assets can often cache longer",
      message: "Fingerprint-named assets usually work well with long max-age and immutable.",
    });
  }

  notes.push({
    title: "Test real behavior too",
    message: "Browser DevTools, curl, CDN dashboards, and repeat requests can confirm whether the cache headers behave as expected.",
  });

  return notes;
}
