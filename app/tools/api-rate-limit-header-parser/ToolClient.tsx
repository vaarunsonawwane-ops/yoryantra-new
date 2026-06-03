"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type HeaderStyle = "auto" | "standard" | "xRateLimit" | "github" | "mixed";
type ResetMode = "auto" | "seconds" | "unix" | "iso";
type CheckingStyle = "balanced" | "strict" | "relaxed";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type ParsedHeaders = {
  statusCode: number | null;
  rateLimitLimit: string;
  rateLimitRemaining: string;
  rateLimitReset: string;
  rateLimitPolicy: string;
  retryAfter: string;
  xRateLimitLimit: string;
  xRateLimitRemaining: string;
  xRateLimitReset: string;
  xRateLimitUsed: string;
  xRateLimitResource: string;
  githubRateLimitReset: string;
};

type RateLimitResult = {
  headers: ParsedHeaders;
  issues: Issue[];
  output: string;
  detectedStyle: string;
  limit: number | null;
  remaining: number | null;
  used: number | null;
  usagePercent: number | null;
  resetTime: string;
  retryAfterTime: string;
  waitSeconds: number | null;
  status: "healthy" | "watch" | "limited" | "unknown";
};

const sampleHeaders = `HTTP/2 200
content-type: application/json
ratelimit-limit: 5000
ratelimit-remaining: 124
ratelimit-reset: 1717336200
ratelimit-policy: 5000;w=3600
retry-after: 120
x-ratelimit-limit: 5000
x-ratelimit-remaining: 124
x-ratelimit-used: 4876
x-ratelimit-reset: 1717336200
x-ratelimit-resource: core`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>("auto");
  const [resetMode, setResetMode] = useState<ResetMode>("auto");
  const [checkingStyle, setCheckingStyle] = useState<CheckingStyle>("balanced");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [warnLowRemaining, setWarnLowRemaining] = useState(true);
  const [warnRetryAfter, setWarnRetryAfter] = useState(true);
  const [warnMissingReset, setWarnMissingReset] = useState(true);
  const [warnMixedHeaders, setWarnMixedHeaders] = useState(true);
  const [showLocalTime, setShowLocalTime] = useState(true);
  const [result, setResult] = useState<RateLimitResult | null>(null);
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

  const parseHeaders = () => {
    if (!input.trim()) {
      setError("Please paste API response headers.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = analyzeRateLimitHeaders({
        input,
        headerStyle,
        resetMode,
        checkingStyle,
        outputMode,
        warnLowRemaining,
        warnRetryAfter,
        warnMissingReset,
        warnMixedHeaders,
        showLocalTime,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse these rate limit headers.");
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
    setHeaderStyle("auto");
    setResetMode("auto");
    setCheckingStyle("balanced");
    setOutputMode("summary");
    setWarnLowRemaining(true);
    setWarnRetryAfter(true);
    setWarnMissingReset(true);
    setWarnMixedHeaders(true);
    setShowLocalTime(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setHeaderStyle("auto");
    setResetMode("auto");
    setCheckingStyle("balanced");
    setOutputMode("summary");
    setWarnLowRemaining(true);
    setWarnRetryAfter(true);
    setWarnMissingReset(true);
    setWarnMixedHeaders(true);
    setShowLocalTime(true);
    clearResult();
  };

  return (
    <ToolShell
      title="API Rate Limit Header Parser"
      description="Parse API rate limit headers from pasted HTTP responses. Understand RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, X-RateLimit headers, Retry-After, reset time, quota usage, and retry guidance."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">API Response Headers</label>
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
          Paste headers from curl, browser DevTools, Postman, an API client, or gateway logs. The parser runs locally in your browser.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Header Style"
            value={headerStyle}
            onChange={(value) => {
              setHeaderStyle(value as HeaderStyle);
              clearResult();
            }}
            options={[
              { label: "Auto-detect", value: "auto" },
              { label: "Standard RateLimit headers", value: "standard" },
              { label: "X-RateLimit headers", value: "xRateLimit" },
              { label: "GitHub-style headers", value: "github" },
              { label: "Mixed headers", value: "mixed" },
            ]}
          />

          <YoryantraSelect
            label="Reset Format"
            value={resetMode}
            onChange={(value) => {
              setResetMode(value as ResetMode);
              clearResult();
            }}
            options={[
              { label: "Auto-detect", value: "auto" },
              { label: "Seconds from now", value: "seconds" },
              { label: "Unix timestamp", value: "unix" },
              { label: "ISO date/time", value: "iso" },
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
            <CheckboxRow checked={warnLowRemaining} label="Warn when remaining quota is low" onChange={(checked) => { setWarnLowRemaining(checked); clearResult(); }} />
            <CheckboxRow checked={warnRetryAfter} label="Warn when Retry-After indicates throttling" onChange={(checked) => { setWarnRetryAfter(checked); clearResult(); }} />
            <CheckboxRow checked={warnMissingReset} label="Warn when reset time is missing" onChange={(checked) => { setWarnMissingReset(checked); clearResult(); }} />
            <CheckboxRow checked={warnMixedHeaders} label="Warn about mixed or conflicting rate limit headers" onChange={(checked) => { setWarnMixedHeaders(checked); clearResult(); }} />
            <CheckboxRow checked={showLocalTime} label="Show reset time in local time" onChange={(checked) => { setShowLocalTime(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Use this to understand API throttling, retry timing, quota usage, gateway limits, and rate limit reset windows.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseHeaders} className="yoryantra-btn">Parse Rate Limit Headers</button>
        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Status" value={result.status} />
          <SummaryCard label="Limit" value={formatNullable(result.limit)} />
          <SummaryCard label="Remaining" value={formatNullable(result.remaining)} />
          <SummaryCard label="Usage" value={result.usagePercent === null ? "unknown" : `${result.usagePercent}%`} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Parsed Rate Limit Headers</h3>
          <p className="mt-2 text-sm text-gray-500">Header values and derived rate limit details from the pasted response.</p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Field</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resultRows(result).map((row) => (
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
          <h3 className="text-sm font-semibold text-amber-900">Rate limit findings</h3>
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
          <h3 className="text-sm font-semibold text-blue-900">API retry guidance</h3>
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
          {output && <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Parsed API rate limit output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Rate limit header formats vary across APIs and gateways. Always check the provider documentation for exact semantics before building retry logic.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Understanding API Rate Limit Headers</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            APIs often return rate limit headers so clients know how many requests are allowed, how much quota remains, when the window resets, and when to retry after throttling.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This API Rate Limit Header Parser converts pasted response headers into a readable summary with limit, remaining quota, usage percentage, reset time, Retry-After behavior, and practical warnings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the API Rate Limit Header Parser</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Copy response headers from curl, DevTools, Postman, or API logs.</li>
            <li>Paste the headers into the parser.</li>
            <li>Choose the header style and reset time format if auto-detect is not enough.</li>
            <li>Review quota usage, reset time, retry timing, and warnings.</li>
            <li>Copy the summary, report, JSON, Markdown, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Rate Limit Headers</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>RateLimit-Limit</strong> shows the request limit for the current window.</li>
            <li><strong>RateLimit-Remaining</strong> shows how many requests are left.</li>
            <li><strong>RateLimit-Reset</strong> shows when the quota resets.</li>
            <li><strong>Retry-After</strong> tells clients how long to wait before retrying.</li>
            <li><strong>X-RateLimit-Limit</strong>, <strong>X-RateLimit-Remaining</strong>, and <strong>X-RateLimit-Reset</strong> are common legacy or provider-specific versions.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Rate Limit Headers</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`RateLimit-Limit: 5000
RateLimit-Remaining: 124
RateLimit-Reset: 1717336200
Retry-After: 120`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Retry Logic Should Be Conservative</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            When remaining quota is low or Retry-After is present, clients should slow down instead of retrying aggressively. Backoff, jitter, queueing, and respecting provider reset windows help prevent repeated throttling.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            For user-facing apps, graceful error messages and background retry queues are usually better than making users wait on repeated failed requests.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does an API Rate Limit Header Parser do?">
              It reads pasted API response headers and explains quota limits, remaining requests, reset time, retry timing, and throttling signals.
            </Faq>
            <Faq title="Does this tool call my API?">
              No. It only analyzes the headers you paste into the browser.
            </Faq>
            <Faq title="What does Retry-After mean?">
              Retry-After tells the client how long to wait before trying again. It can be seconds or an HTTP date depending on the API.
            </Faq>
            <Faq title="Why do some APIs use X-RateLimit headers?">
              X-RateLimit headers are older or provider-specific conventions. Many APIs still use them alongside or instead of standard RateLimit headers.
            </Faq>
            <Faq title="Is anything uploaded when I parse headers?">
              No. The parsing runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">HTTP Headers Parser</Link>
            <Link href="/tools/api-request-header-builder" className="yoryantra-btn-outline">API Request Header Builder</Link>
            <Link href="/tools/http-response-formatter" className="yoryantra-btn-outline">HTTP Response Formatter</Link>
            <Link href="/tools/http-cache-header-analyzer" className="yoryantra-btn-outline">HTTP Cache Header Analyzer</Link>
            <Link href="/tools/curl-command-parser" className="yoryantra-btn-outline">cURL Command Parser</Link>
          </div>
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

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function analyzeRateLimitHeaders(options: {
  input: string;
  headerStyle: HeaderStyle;
  resetMode: ResetMode;
  checkingStyle: CheckingStyle;
  outputMode: OutputMode;
  warnLowRemaining: boolean;
  warnRetryAfter: boolean;
  warnMissingReset: boolean;
  warnMixedHeaders: boolean;
  showLocalTime: boolean;
}): RateLimitResult {
  const headers = parseHeaderText(options.input);
  const detectedStyle = detectStyle(headers, options.headerStyle);
  const limit = firstNumber(headers.rateLimitLimit, headers.xRateLimitLimit);
  const remaining = firstNumber(headers.rateLimitRemaining, headers.xRateLimitRemaining);
  const used = firstNumber(headers.xRateLimitUsed);
  const resetRaw = firstValue(headers.rateLimitReset, headers.xRateLimitReset, headers.githubRateLimitReset);
  const resetDate = parseResetValue(resetRaw, options.resetMode);
  const retryAfterDate = parseRetryAfter(headers.retryAfter);
  const usagePercent = calculateUsagePercent(limit, remaining, used);
  const waitSeconds = retryAfterDate ? Math.max(0, Math.ceil((retryAfterDate.getTime() - Date.now()) / 1000)) : null;
  const issues = buildIssues({
    headers,
    limit,
    remaining,
    used,
    usagePercent,
    resetDate,
    retryAfterDate,
    detectedStyle,
    options,
  });
  const status = getStatus(headers.statusCode, remaining, usagePercent, waitSeconds);
  const base = {
    headers,
    issues,
    detectedStyle,
    limit,
    remaining,
    used,
    usagePercent,
    resetTime: formatDateValue(resetDate, options.showLocalTime),
    retryAfterTime: formatDateValue(retryAfterDate, options.showLocalTime),
    waitSeconds,
    status,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function parseHeaderText(input: string): ParsedHeaders {
  const headers: ParsedHeaders = {
    statusCode: null,
    rateLimitLimit: "",
    rateLimitRemaining: "",
    rateLimitReset: "",
    rateLimitPolicy: "",
    retryAfter: "",
    xRateLimitLimit: "",
    xRateLimitRemaining: "",
    xRateLimitReset: "",
    xRateLimitUsed: "",
    xRateLimitResource: "",
    githubRateLimitReset: "",
  };

  input.split(/\r?\n/).forEach((line) => {
    const statusMatch = line.match(/^HTTP\/\S+\s+(\d{3})/i);
    if (statusMatch) {
      headers.statusCode = Number(statusMatch[1]);
      return;
    }

    const match = line.match(/^\s*([^:]+)\s*:\s*(.+)\s*$/);
    if (!match) return;

    const name = match[1].trim().toLowerCase();
    const value = match[2].trim();

    if (name === "ratelimit-limit") headers.rateLimitLimit = value;
    else if (name === "ratelimit-remaining") headers.rateLimitRemaining = value;
    else if (name === "ratelimit-reset") headers.rateLimitReset = value;
    else if (name === "ratelimit-policy") headers.rateLimitPolicy = value;
    else if (name === "retry-after") headers.retryAfter = value;
    else if (name === "x-ratelimit-limit") headers.xRateLimitLimit = value;
    else if (name === "x-ratelimit-remaining") headers.xRateLimitRemaining = value;
    else if (name === "x-ratelimit-reset") headers.xRateLimitReset = value;
    else if (name === "x-ratelimit-used") headers.xRateLimitUsed = value;
    else if (name === "x-ratelimit-resource") headers.xRateLimitResource = value;
    else if (name === "x-github-ratelimit-reset") headers.githubRateLimitReset = value;
  });

  return headers;
}

function detectStyle(headers: ParsedHeaders, selected: HeaderStyle) {
  if (selected !== "auto") return selected;
  const hasStandard = Boolean(headers.rateLimitLimit || headers.rateLimitRemaining || headers.rateLimitReset || headers.rateLimitPolicy);
  const hasX = Boolean(headers.xRateLimitLimit || headers.xRateLimitRemaining || headers.xRateLimitReset || headers.xRateLimitUsed);
  const hasGithub = Boolean(headers.xRateLimitResource || headers.githubRateLimitReset);

  if ((hasStandard && hasX) || (hasGithub && hasStandard)) return "mixed";
  if (hasGithub) return "github";
  if (hasStandard) return "standard";
  if (hasX) return "xRateLimit";
  return "unknown";
}

function firstValue(...values: string[]) {
  return values.find((value) => value.trim()) || "";
}

function firstNumber(...values: string[]) {
  for (const value of values) {
    const parsed = Number(value.trim().split(",")[0]);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function parseResetValue(value: string, mode: ResetMode) {
  if (!value.trim()) return null;
  const trimmed = value.trim();
  const numberValue = Number(trimmed);

  if (mode === "iso") {
    const date = new Date(trimmed);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  if (mode === "seconds" && Number.isFinite(numberValue)) return new Date(Date.now() + numberValue * 1000);
  if (mode === "unix" && Number.isFinite(numberValue)) return new Date(numberValue * 1000);

  if (mode === "auto") {
    const isoDate = new Date(trimmed);
    if (!/^\d+$/.test(trimmed) && Number.isFinite(isoDate.getTime())) return isoDate;
    if (Number.isFinite(numberValue)) {
      if (numberValue > 1000000000) return new Date(numberValue * 1000);
      return new Date(Date.now() + numberValue * 1000);
    }
  }

  return null;
}

function parseRetryAfter(value: string) {
  if (!value.trim()) return null;
  const seconds = Number(value.trim());

  if (Number.isFinite(seconds)) return new Date(Date.now() + seconds * 1000);

  const date = new Date(value.trim());
  return Number.isFinite(date.getTime()) ? date : null;
}

function calculateUsagePercent(limit: number | null, remaining: number | null, used: number | null) {
  if (limit === null || limit <= 0) return null;
  if (remaining !== null) return Math.max(0, Math.min(100, Math.round(((limit - remaining) / limit) * 100)));
  if (used !== null) return Math.max(0, Math.min(100, Math.round((used / limit) * 100)));
  return null;
}

function buildIssues(params: {
  headers: ParsedHeaders;
  limit: number | null;
  remaining: number | null;
  used: number | null;
  usagePercent: number | null;
  resetDate: Date | null;
  retryAfterDate: Date | null;
  detectedStyle: string;
  options: {
    checkingStyle: CheckingStyle;
    warnLowRemaining: boolean;
    warnRetryAfter: boolean;
    warnMissingReset: boolean;
    warnMixedHeaders: boolean;
  };
}) {
  const issues: Issue[] = [];

  if (params.headers.statusCode === 429) {
    issues.push({
      severity: "high",
      title: "HTTP 429 rate limited",
      message: "The response status indicates the client has been rate limited.",
    });
  }

  if (params.options.warnLowRemaining && params.limit !== null && params.remaining !== null) {
    const remainingPercent = params.limit > 0 ? (params.remaining / params.limit) * 100 : 0;

    if (remainingPercent <= 5) {
      issues.push({
        severity: "high",
        title: "Very low remaining quota",
        message: "Less than or equal to 5% of the quota remains in this window.",
      });
    } else if (remainingPercent <= 15) {
      issues.push({
        severity: params.options.checkingStyle === "relaxed" ? "info" : "warning",
        title: "Low remaining quota",
        message: "The API quota is getting low for the current window.",
      });
    }
  }

  if (params.options.warnRetryAfter && params.retryAfterDate) {
    issues.push({
      severity: params.headers.statusCode === 429 ? "high" : "warning",
      title: "Retry-After present",
      message: "The server is asking the client to wait before retrying. Respect this value in retry logic.",
    });
  }

  if (params.options.warnMissingReset && !params.resetDate && (params.limit !== null || params.remaining !== null)) {
    issues.push({
      severity: "info",
      title: "Reset time missing or unclear",
      message: "A limit or remaining value was found, but reset timing could not be parsed.",
    });
  }

  if (params.options.warnMixedHeaders && params.detectedStyle === "mixed") {
    issues.push({
      severity: "info",
      title: "Mixed rate limit header styles",
      message: "Both standard and X-RateLimit-style headers appear to be present. Confirm which one your API documentation treats as authoritative.",
    });
  }

  if (params.limit === null && params.remaining === null && !params.headers.retryAfter) {
    issues.push({
      severity: "warning",
      title: "No rate limit values found",
      message: "No recognizable rate limit headers were found in the pasted response.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Rate limit headers parsed",
      message: "No urgent rate limit warning was found from the pasted headers.",
    });
  }

  return issues;
}

function getStatus(statusCode: number | null, remaining: number | null, usagePercent: number | null, waitSeconds: number | null): RateLimitResult["status"] {
  if (statusCode === 429 || (waitSeconds !== null && waitSeconds > 0 && remaining === 0)) return "limited";
  if (remaining !== null && remaining <= 0) return "limited";
  if (usagePercent !== null && usagePercent >= 85) return "watch";
  if (remaining !== null || usagePercent !== null) return "healthy";
  return "unknown";
}

function formatDateValue(date: Date | null, local: boolean) {
  if (!date) return "not found";
  return local ? date.toLocaleString() : date.toISOString();
}

function formatNullable(value: number | null) {
  return value === null ? "unknown" : value.toLocaleString();
}

function resultRows(result: Omit<RateLimitResult, "output">) {
  return [
    { name: "Detected style", value: result.detectedStyle },
    { name: "HTTP status", value: result.headers.statusCode === null ? "not found" : String(result.headers.statusCode) },
    { name: "Limit", value: formatNullable(result.limit) },
    { name: "Remaining", value: formatNullable(result.remaining) },
    { name: "Used", value: formatNullable(result.used) },
    { name: "Usage percent", value: result.usagePercent === null ? "unknown" : `${result.usagePercent}%` },
    { name: "Reset time", value: result.resetTime },
    { name: "Retry after time", value: result.retryAfterTime },
    { name: "Wait seconds", value: result.waitSeconds === null ? "unknown" : String(result.waitSeconds) },
    { name: "RateLimit-Limit", value: result.headers.rateLimitLimit },
    { name: "RateLimit-Remaining", value: result.headers.rateLimitRemaining },
    { name: "RateLimit-Reset", value: result.headers.rateLimitReset },
    { name: "RateLimit-Policy", value: result.headers.rateLimitPolicy },
    { name: "Retry-After", value: result.headers.retryAfter },
    { name: "X-RateLimit-Limit", value: result.headers.xRateLimitLimit },
    { name: "X-RateLimit-Remaining", value: result.headers.xRateLimitRemaining },
    { name: "X-RateLimit-Reset", value: result.headers.xRateLimitReset },
    { name: "X-RateLimit-Used", value: result.headers.xRateLimitUsed },
    { name: "X-RateLimit-Resource", value: result.headers.xRateLimitResource },
  ];
}

function formatOutput(result: Omit<RateLimitResult, "output">, mode: OutputMode) {
  if (mode === "json") return JSON.stringify(result, null, 2);

  if (mode === "csv") {
    const rows = [
      ["field", "value"],
      ...resultRows(result).map((row) => [row.name, row.value]),
      ["issues", result.issues.map((issue) => `${issue.severity}: ${issue.title}`).join("; ")],
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Field | Value |",
      "| --- | --- |",
      ...resultRows(result).map((row) => `| ${row.name} | ${escapeMarkdown(row.value || "-")} |`),
      "",
      "## Findings",
      ...result.issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (mode === "report") {
    return [
      "API Rate Limit Header Report",
      "----------------------------",
      `Status: ${result.status}`,
      `Detected style: ${result.detectedStyle}`,
      `Limit: ${formatNullable(result.limit)}`,
      `Remaining: ${formatNullable(result.remaining)}`,
      `Used: ${formatNullable(result.used)}`,
      `Usage: ${result.usagePercent === null ? "unknown" : `${result.usagePercent}%`}`,
      `Reset time: ${result.resetTime}`,
      `Retry after: ${result.retryAfterTime}`,
      `Wait seconds: ${result.waitSeconds === null ? "unknown" : result.waitSeconds}`,
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  return [
    "API Rate Limit Header Summary",
    "-----------------------------",
    `Status: ${result.status}`,
    `Detected style: ${result.detectedStyle}`,
    `Limit: ${formatNullable(result.limit)}`,
    `Remaining: ${formatNullable(result.remaining)}`,
    `Used: ${formatNullable(result.used)}`,
    `Usage: ${result.usagePercent === null ? "unknown" : `${result.usagePercent}%`}`,
    `Reset time: ${result.resetTime}`,
    `Retry after: ${result.retryAfterTime}`,
    `Wait seconds: ${result.waitSeconds === null ? "unknown" : result.waitSeconds}`,
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: RateLimitResult) {
  const notes: { title: string; message: string }[] = [];

  if (result.status === "limited") {
    notes.push({
      title: "Respect Retry-After and reset windows",
      message: "Avoid immediate repeated retries. Use backoff, jitter, and queueing to prevent more throttling.",
    });
  }

  if (result.status === "watch") {
    notes.push({
      title: "Slow down before hitting the limit",
      message: "Remaining quota is getting low. Reduce request frequency or spread work across the next reset window.",
    });
  }

  notes.push({
    title: "Check provider documentation",
    message: "Rate limit header names and reset semantics vary across APIs. Treat this output as a debugging aid, not a replacement for API docs.",
  });

  return notes;
}
