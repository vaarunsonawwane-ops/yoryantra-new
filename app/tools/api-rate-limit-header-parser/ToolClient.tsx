"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type HeaderStyle = "auto" | "ietfDraft" | "legacySplit" | "xRateLimit" | "github" | "mixed";
type ResetMode = "auto" | "seconds" | "unix" | "iso";
type CheckingStyle = "balanced" | "strict" | "relaxed";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type ParsedHeaders = {
  statusCode: number | null;
  rateLimit: string;
  rateLimitPolicy: string;
  legacyRateLimitLimit: string;
  legacyRateLimitRemaining: string;
  legacyRateLimitReset: string;
  retryAfter: string;
  xRateLimitLimit: string;
  xRateLimitRemaining: string;
  xRateLimitReset: string;
  xRateLimitUsed: string;
  xRateLimitResource: string;
};

type RateLimitResult = {
  headers: ParsedHeaders;
  issues: Issue[];
  output: string;
  detectedStyle: string;
  policyName: string;
  limit: number | null;
  remaining: number | null;
  used: number | null;
  usagePercent: number | null;
  effectiveWindowSeconds: number | null;
  resetTime: string;
  retryAfterTime: string;
  waitSeconds: number | null;
  status: "healthy" | "watch" | "limited" | "unknown";
};

const sampleHeaders = `HTTP/2 429
content-type: application/problem+json
ratelimit-policy: "core";q=5000;w=3600
ratelimit: "core";r=0;t=120
retry-after: 120`;

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
      description="Interpret current and provider-specific rate-limit headers without guessing ambiguous reset semantics."
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
              { label: "IETF draft RateLimit", value: "ietfDraft" },
              { label: "Legacy RateLimit-* fields", value: "legacySplit" },
              { label: "X-RateLimit fields", value: "xRateLimit" },
              { label: "GitHub-style X-RateLimit", value: "github" },
              { label: "Mixed fields", value: "mixed" },
            ]}
          />

          <YoryantraSelect
            label="Legacy Reset Format"
            value={resetMode}
            onChange={(value) => {
              setResetMode(value as ResetMode);
              clearResult();
            }}
            options={[
              { label: "Auto-detect", value: "auto" },
              { label: "Seconds from now", value: "seconds" },
              { label: "Unix timestamp", value: "unix" },
              { label: "HTTP / ISO date-time", value: "iso" },
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
          The reset-format choice applies only to legacy or provider-specific reset values. Current draft RateLimit t values are seconds.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseHeaders} className="yoryantra-btn whitespace-nowrap">Parse Rate Limit Headers</button>
        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
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
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {result.issues.map((issue, index) => (
            <IssueCard key={`${issue.title}-${index}`} issue={issue} />
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Retry and quota notes</h3>
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
          {output && <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Parsed API rate limit output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Rate limit header formats vary across APIs and gateways. Always check the provider documentation for exact semantics before building retry logic.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Rate-limit headers are not one universal format</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            APIs expose quota information in several incompatible ways. The current IETF HTTPAPI work is centered on
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">RateLimit</code> and
            <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-sm">RateLimit-Policy</code> structured fields,
            while many deployed APIs still use older RateLimit-* or X-RateLimit conventions.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That difference matters most for time values. In the current draft, the <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">t</code>
            parameter is an effective window in seconds. X-RateLimit-Reset has no single cross-provider meaning, so the parser
            will not silently guess a provider-specific reset format when it is ambiguous.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the parser derives</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Current draft fields can expose a policy identifier, allocated quota, available quota, and effective window.
            Older split fields can expose limit and remaining values directly. Retry-After is handled separately because it
            can be either delay-seconds or an HTTP date and takes precedence over quota-window hints when a server asks the client to wait.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Provider-specific reset values need an explicit choice</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Some X-RateLimit APIs use Unix seconds, others use a delay, and some publish a date-time. Auto mode recognizes
            GitHub-style epoch resets when the resource field identifies that convention; otherwise an ambiguous numeric reset
            stays unresolved until you choose its format.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A remaining value is a hint, not a promise</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A positive remaining quota does not guarantee that the next request will succeed. Servers can apply several limits,
            change capacity dynamically, or throttle for reasons not represented by these fields. Treat the numbers as input to
            conservative scheduling rather than permission to consume the quota as fast as possible.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sensitive response metadata</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Parsing happens in the browser, but pasted header dumps can still contain request identifiers, account-specific quota
            names, cookies, authorization data, or internal gateway metadata. Remove unrelated secrets before sharing copied output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards and live specification status</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Retry-After semantics come from{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after" target="_blank" rel="noreferrer">RFC 9110</a>,
            and HTTP 429 is defined by{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.rfc-editor.org/rfc/rfc6585.html#section-4" target="_blank" rel="noreferrer">RFC 6585</a>.
            The newer RateLimit / RateLimit-Policy design is still an active IETF Internet-Draft, not a published RFC, so its syntax can change before standardization.{" "}
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/" target="_blank" rel="noreferrer">Follow the current HTTPAPI draft</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Questions that affect retry code</h2>
          <div className="mt-5 space-y-6">
            <Faq title="Why is my X-RateLimit-Reset value not converted automatically?">
              Because that field is provider-specific. A numeric value can mean epoch seconds or a delay, so guessing can produce a dangerously wrong retry time.
            </Faq>
            <Faq title="Should Retry-After override a RateLimit window?">
              When both are present, follow Retry-After for the requested wait. Quota fields can still help shape the request rate after that delay.
            </Faq>
            <Faq title="Does a parsed quota prove how the server will throttle me?">
              No. The server remains authoritative, and multiple or dynamic quota policies can affect later requests.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/api-rate-limit-header-parser" /></div>
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
  const detectedStyle = detectStyle(headers);
  const selectedStyle = options.headerStyle === "auto" || options.headerStyle === "mixed"
    ? preferredStyle(headers)
    : options.headerStyle;

  const serviceItems = parseStructuredRateLimitList(headers.rateLimit);
  const policyItems = parseStructuredRateLimitList(headers.rateLimitPolicy);
  const currentRateLimitInvalid = Boolean(
    headers.rateLimit && (serviceItems.length === 0 || serviceItems.some((item) => structuredIntegerParam(item, "r") === null)),
  );
  const currentPolicyInvalid = Boolean(
    headers.rateLimitPolicy && (policyItems.length === 0 || policyItems.some((item) => structuredIntegerParam(item, "q") === null)),
  );
  const service = currentRateLimitInvalid ? null : serviceItems[0] || null;
  const validPolicies = currentPolicyInvalid ? [] : policyItems;
  const matchingPolicy = service
    ? validPolicies.find((item) => item.id === service.id) || null
    : validPolicies[0] || null;

  let policyName = "";
  let limit: number | null = null;
  let remaining: number | null = null;
  let used: number | null = null;
  let effectiveWindowSeconds: number | null = null;
  let resetDate: Date | null = null;
  let resetAmbiguous = false;

  if (selectedStyle === "ietfDraft") {
    policyName = service?.id || matchingPolicy?.id || "";
    limit = structuredIntegerParam(matchingPolicy, "q");
    remaining = structuredIntegerParam(service, "r");
    effectiveWindowSeconds = structuredIntegerParam(service, "t");
    if (effectiveWindowSeconds !== null) {
      resetDate = new Date(Date.now() + effectiveWindowSeconds * 1000);
    }
  } else if (selectedStyle === "legacySplit") {
    limit = strictNonNegativeInteger(headers.legacyRateLimitLimit);
    remaining = strictNonNegativeInteger(headers.legacyRateLimitRemaining);
    const reset = parseLegacyReset(headers.legacyRateLimitReset, options.resetMode, "legacySplit");
    resetDate = reset.date;
    effectiveWindowSeconds = reset.delaySeconds;
    resetAmbiguous = reset.ambiguous;
  } else {
    limit = strictNonNegativeInteger(headers.xRateLimitLimit);
    remaining = strictNonNegativeInteger(headers.xRateLimitRemaining);
    used = strictNonNegativeInteger(headers.xRateLimitUsed);
    const styleForReset = selectedStyle === "github" ? "github" : "xRateLimit";
    const reset = parseLegacyReset(headers.xRateLimitReset, options.resetMode, styleForReset);
    resetDate = reset.date;
    effectiveWindowSeconds = reset.delaySeconds;
    resetAmbiguous = reset.ambiguous;
  }

  if (used === null && limit !== null && remaining !== null && remaining <= limit) {
    used = limit - remaining;
  }

  const retry = parseRetryAfter(headers.retryAfter);
  const usagePercent = calculateUsagePercent(limit, remaining, used);
  const waitSeconds = retry.date
    ? Math.max(0, Math.ceil((retry.date.getTime() - Date.now()) / 1000))
    : null;

  const issues = buildIssues({
    headers,
    limit,
    remaining,
    usagePercent,
    effectiveWindowSeconds,
    retryAfterDate: retry.date,
    retryAfterInvalid: retry.invalid,
    resetDate,
    resetAmbiguous,
    detectedStyle,
    selectedStyle,
    currentRateLimitInvalid,
    currentPolicyInvalid,
    serviceItemCount: serviceItems.length,
    policyMatchMissing: Boolean(service && validPolicies.length > 0 && !matchingPolicy),
    options,
  });

  const status = getStatus(headers.statusCode, remaining, usagePercent, waitSeconds);
  const base = {
    headers,
    issues,
    detectedStyle,
    policyName,
    limit,
    remaining,
    used,
    usagePercent,
    effectiveWindowSeconds,
    resetTime: formatDateValue(resetDate, options.showLocalTime),
    retryAfterTime: formatDateValue(retry.date, options.showLocalTime),
    waitSeconds,
    status,
  };
  const output = formatOutput(base, options.outputMode);

  return { ...base, output };
}

type StructuredItem = {
  id: string;
  params: Record<string, number | string>;
};

function structuredIntegerParam(item: StructuredItem | null, name: string): number | null {
  const value = item?.params[name];
  return typeof value === "number" ? value : null;
}

function parseHeaderText(input: string): ParsedHeaders {
  const headers: ParsedHeaders = {
    statusCode: null,
    rateLimit: "",
    rateLimitPolicy: "",
    legacyRateLimitLimit: "",
    legacyRateLimitRemaining: "",
    legacyRateLimitReset: "",
    retryAfter: "",
    xRateLimitLimit: "",
    xRateLimitRemaining: "",
    xRateLimitReset: "",
    xRateLimitUsed: "",
    xRateLimitResource: "",
  };

  input.split(/\r?\n/).forEach((line) => {
    const statusMatch = line.match(/^\s*HTTP\/\S+\s+(\d{3})(?:\s|$)/i);
    if (statusMatch) {
      headers.statusCode = Number(statusMatch[1]);
      return;
    }

    const match = line.match(/^\s*([^:\s][^:]*)\s*:\s*(.*)$/);
    if (!match) return;

    const name = match[1].trim().toLowerCase();
    const value = match[2].trim();

    if (name === "ratelimit") headers.rateLimit = combineListField(headers.rateLimit, value);
    else if (name === "ratelimit-policy") headers.rateLimitPolicy = combineListField(headers.rateLimitPolicy, value);
    else if (name === "ratelimit-limit") headers.legacyRateLimitLimit = value;
    else if (name === "ratelimit-remaining") headers.legacyRateLimitRemaining = value;
    else if (name === "ratelimit-reset") headers.legacyRateLimitReset = value;
    else if (name === "retry-after") headers.retryAfter = value;
    else if (name === "x-ratelimit-limit") headers.xRateLimitLimit = value;
    else if (name === "x-ratelimit-remaining") headers.xRateLimitRemaining = value;
    else if (name === "x-ratelimit-reset") headers.xRateLimitReset = value;
    else if (name === "x-ratelimit-used") headers.xRateLimitUsed = value;
    else if (name === "x-ratelimit-resource") headers.xRateLimitResource = value;
  });

  return headers;
}

function combineListField(existing: string, next: string) {
  return existing && next ? `${existing}, ${next}` : existing || next;
}

function detectStyle(headers: ParsedHeaders): string {
  const families: string[] = [];
  if (headers.rateLimit) families.push("IETF draft RateLimit");
  if (headers.legacyRateLimitLimit || headers.legacyRateLimitRemaining || headers.legacyRateLimitReset) {
    families.push("legacy RateLimit-*");
  }
  if (headers.xRateLimitLimit || headers.xRateLimitRemaining || headers.xRateLimitReset || headers.xRateLimitUsed) {
    families.push(headers.xRateLimitResource ? "GitHub-style X-RateLimit" : "X-RateLimit");
  }

  if (families.length > 1) return `mixed (${families.join(" + ")})`;
  return families[0] || (headers.retryAfter ? "Retry-After only" : "unknown");
}

function preferredStyle(headers: ParsedHeaders): Exclude<HeaderStyle, "auto" | "mixed"> {
  if (headers.rateLimit) return "ietfDraft";
  if (headers.legacyRateLimitLimit || headers.legacyRateLimitRemaining || headers.legacyRateLimitReset) return "legacySplit";
  if (headers.xRateLimitResource) return "github";
  return "xRateLimit";
}

function splitOutsideQuotes(value: string, delimiter: "," | ";") {
  const parts: string[] = [];
  let current = "";
  let quoted = false;
  let escaped = false;

  for (const char of value) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (quoted && char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      current += char;
      continue;
    }
    if (!quoted && char === delimiter) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  if (quoted) return [];
  parts.push(current.trim());
  return parts.filter(Boolean);
}

function unquoteStructuredString(value: string) {
  if (!/^"(?:[^"\\]|\\.)*"$/.test(value)) return null;
  return value.slice(1, -1).replace(/\\(["\\])/g, "$1");
}

function parseStructuredRateLimitList(value: string): StructuredItem[] {
  if (!value.trim()) return [];
  const members = splitOutsideQuotes(value, ",");
  if (members.length === 0) return [];

  const parsed: StructuredItem[] = [];

  for (const member of members) {
    const segments = splitOutsideQuotes(member, ";");
    if (segments.length === 0) return [];
    const id = unquoteStructuredString(segments[0]);
    if (id === null) return [];

    const params: Record<string, number | string> = {};
    let valid = true;

    for (const rawParam of segments.slice(1)) {
      const eq = rawParam.indexOf("=");
      if (eq <= 0) {
        valid = false;
        break;
      }
      const name = rawParam.slice(0, eq).trim().toLowerCase();
      const rawValue = rawParam.slice(eq + 1).trim();
      if (!/^[a-z*][a-z0-9_.*-]*$/.test(name)) {
        valid = false;
        break;
      }

      if (/^-?\d+$/.test(rawValue)) {
        const numeric = Number(rawValue);
        if (!Number.isSafeInteger(numeric)) {
          valid = false;
          break;
        }
        params[name] = numeric;
      } else {
        const quotedValue = unquoteStructuredString(rawValue);
        if (quotedValue !== null) params[name] = quotedValue;
        else if (/^[A-Za-z*][A-Za-z0-9_.*:/-]*$/.test(rawValue)) params[name] = rawValue;
        else if (/^:[A-Za-z0-9+/=]*:$/.test(rawValue)) params[name] = rawValue;
        else {
          valid = false;
          break;
        }
      }
    }

    if (!valid) return [];

    for (const key of ["q", "r", "t", "w"]) {
      const numeric = params[key];
      if (numeric !== undefined && (typeof numeric !== "number" || numeric < 0)) return [];
    }
    if (typeof params.w === "number" && params.w === 0) return [];

    parsed.push({ id, params });
  }

  return parsed;
}

function strictNonNegativeInteger(value: string) {
  const trimmed = value.trim().split(",")[0]?.trim() || "";
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseLegacyReset(
  value: string,
  mode: ResetMode,
  source: "legacySplit" | "xRateLimit" | "github",
): { date: Date | null; delaySeconds: number | null; ambiguous: boolean } {
  const trimmed = value.trim();
  if (!trimmed) return { date: null, delaySeconds: null, ambiguous: false };

  const numeric = strictNonNegativeInteger(trimmed);
  if (mode === "seconds") {
    return numeric === null
      ? { date: null, delaySeconds: null, ambiguous: false }
      : { date: new Date(Date.now() + numeric * 1000), delaySeconds: numeric, ambiguous: false };
  }
  if (mode === "unix") {
    return numeric === null
      ? { date: null, delaySeconds: null, ambiguous: false }
      : { date: safeDate(numeric * 1000), delaySeconds: null, ambiguous: false };
  }
  if (mode === "iso") {
    const date = parseHttpOrIsoDate(trimmed);
    return { date, delaySeconds: null, ambiguous: false };
  }

  if (source === "legacySplit" && numeric !== null) {
    return { date: new Date(Date.now() + numeric * 1000), delaySeconds: numeric, ambiguous: false };
  }
  if (source === "github" && numeric !== null) {
    return { date: safeDate(numeric * 1000), delaySeconds: null, ambiguous: false };
  }

  return { date: null, delaySeconds: null, ambiguous: Boolean(trimmed) };
}

function safeDate(milliseconds: number) {
  const date = new Date(milliseconds);
  return Number.isFinite(date.getTime()) ? date : null;
}

function parseHttpOrIsoDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function parseRetryAfter(value: string): { date: Date | null; invalid: boolean } {
  const trimmed = value.trim();
  if (!trimmed) return { date: null, invalid: false };

  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);
    if (!Number.isSafeInteger(seconds)) return { date: null, invalid: true };
    return { date: new Date(Date.now() + seconds * 1000), invalid: false };
  }

  const day = "(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)";
  const weekday = "(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)";
  const month = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)";
  const imfFixdate = new RegExp(`^${day}, \\d{2} ${month} \\d{4} \\d{2}:\\d{2}:\\d{2} GMT$`);
  const rfc850Date = new RegExp(`^${weekday}, \\d{2}-${month}-\\d{2} \\d{2}:\\d{2}:\\d{2} GMT$`);
  const asctimeDate = new RegExp(`^${day} ${month} [ \\d]\\d \\d{2}:\\d{2}:\\d{2} \\d{4}$`);
  if (!imfFixdate.test(trimmed) && !rfc850Date.test(trimmed) && !asctimeDate.test(trimmed)) {
    return { date: null, invalid: true };
  }

  const milliseconds = Date.parse(trimmed);
  const date = Number.isFinite(milliseconds) ? new Date(milliseconds) : null;
  return { date, invalid: !date };
}

function calculateUsagePercent(limit: number | null, remaining: number | null, used: number | null) {
  if (limit === null || limit <= 0) return null;
  if (remaining !== null && remaining <= limit) {
    return Math.max(0, Math.min(100, Math.round(((limit - remaining) / limit) * 100)));
  }
  if (used !== null && used <= limit) {
    return Math.max(0, Math.min(100, Math.round((used / limit) * 100)));
  }
  return null;
}

function buildIssues(params: {
  headers: ParsedHeaders;
  limit: number | null;
  remaining: number | null;
  usagePercent: number | null;
  effectiveWindowSeconds: number | null;
  retryAfterDate: Date | null;
  retryAfterInvalid: boolean;
  resetDate: Date | null;
  resetAmbiguous: boolean;
  detectedStyle: string;
  selectedStyle: Exclude<HeaderStyle, "auto" | "mixed">;
  currentRateLimitInvalid: boolean;
  currentPolicyInvalid: boolean;
  serviceItemCount: number;
  policyMatchMissing: boolean;
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
      title: "HTTP 429 indicates throttling",
      message: "The server returned Too Many Requests. Retry timing still depends on Retry-After and the provider's quota policy.",
    });
  }

  if (params.currentRateLimitInvalid) {
    issues.push({
      severity: "warning",
      title: "RateLimit field could not be parsed",
      message: "The current IETF draft uses Structured Field list syntax such as \"default\";r=50;t=30.",
    });
  }
  if (params.currentPolicyInvalid) {
    issues.push({
      severity: "warning",
      title: "RateLimit-Policy field could not be parsed",
      message: "The current draft expects a quoted policy identifier and a non-negative q parameter, with optional w and other parameters.",
    });
  }

  if (!params.currentRateLimitInvalid && params.serviceItemCount > 1) {
    issues.push({
      severity: "info",
      title: "Several service limits are advertised",
      message: "The summary follows the first RateLimit service item. List order is not a priority ranking, so inspect every advertised policy before scheduling requests.",
    });
  }

  if (params.policyMatchMissing) {
    issues.push({
      severity: "info",
      title: "No matching RateLimit-Policy item",
      message: "The current service item has no policy with the same identifier, so the parser does not borrow a quota value from an unrelated policy.",
    });
  }

  if (params.options.warnLowRemaining && params.limit !== null && params.remaining !== null && params.limit > 0) {
    const remainingPercent = (params.remaining / params.limit) * 100;
    if (remainingPercent <= 5) {
      issues.push({
        severity: "warning",
        title: params.remaining === 0 ? "No advertised quota remains" : "Very little advertised quota remains",
        message: "The derived remaining quota is at or below 5% of the matched limit. Slow request scheduling before relying on another call.",
      });
    } else if (remainingPercent <= 15 && params.options.checkingStyle !== "relaxed") {
      issues.push({
        severity: "warning",
        title: "Advertised quota is getting low",
        message: "The remaining value is below 15% of the matched limit. This threshold is a local diagnostic heuristic, not a protocol rule.",
      });
    }
  }

  if (params.options.warnRetryAfter && params.retryAfterDate) {
    issues.push({
      severity: "warning",
      title: "Retry-After asks the client to wait",
      message: "Respect Retry-After before retrying. If a RateLimit effective window is also present, Retry-After is the stronger wait signal.",
    });
  }
  if (params.retryAfterInvalid) {
    issues.push({
      severity: "warning",
      title: "Retry-After is malformed",
      message: "Retry-After must be non-negative delay-seconds or an HTTP date.",
    });
  }

  if (params.resetAmbiguous) {
    issues.push({
      severity: "warning",
      title: "Provider reset value is ambiguous",
      message: "The X-RateLimit reset field has no universal time format. Choose seconds, Unix timestamp, or date-time instead of relying on a guess.",
    });
  }

  if (params.options.warnMissingReset && !params.resetDate && params.effectiveWindowSeconds === null && (params.limit !== null || params.remaining !== null) && !params.resetAmbiguous) {
    issues.push({
      severity: "info",
      title: "No reset or effective-window time is available",
      message: "Quota values were found, but the selected header family does not provide a usable timing value.",
    });
  }

  if (params.options.warnMixedHeaders && params.detectedStyle.startsWith("mixed")) {
    issues.push({
      severity: "info",
      title: "Several rate-limit conventions are present",
      message: "The parser prefers the current RateLimit field in auto mode. Confirm the authoritative family in the API provider's documentation.",
    });
  }

  if (params.headers.rateLimit) {
    issues.push({
      severity: "info",
      title: "RateLimit syntax is still an Internet-Draft",
      message: "The newer RateLimit and RateLimit-Policy field design is active IETF work in progress, not a published RFC.",
    });
  }

  if (params.remaining !== null && params.remaining > 0) {
    issues.push({
      severity: "info",
      title: "Remaining quota does not guarantee another success",
      message: "Servers can apply other limits or change capacity between requests, so a positive value is only a scheduling signal.",
    });
  }

  if (params.limit === null && params.remaining === null && !params.headers.retryAfter) {
    issues.push({
      severity: "warning",
      title: "No recognizable quota values found",
      message: "No current RateLimit, legacy RateLimit-*, X-RateLimit, or Retry-After value could be interpreted.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "Header values parsed",
      message: "No immediate throttling signal was derived from the selected header family.",
    });
  }

  return issues;
}

function getStatus(
  statusCode: number | null,
  remaining: number | null,
  usagePercent: number | null,
  waitSeconds: number | null,
): RateLimitResult["status"] {
  if (statusCode === 429 || remaining === 0) return "limited";
  if (waitSeconds !== null && waitSeconds > 0) return "watch";
  if (usagePercent !== null && usagePercent >= 85) return "watch";
  if (remaining !== null || usagePercent !== null) return "healthy";
  return "unknown";
}

function formatDateValue(date: Date | null, local: boolean) {
  if (!date) return "not resolved";
  return local ? date.toLocaleString() : date.toISOString();
}

function formatNullable(value: number | null) {
  return value === null ? "unknown" : value.toLocaleString();
}

function resultRows(result: Omit<RateLimitResult, "output">) {
  return [
    { name: "Detected fields", value: result.detectedStyle },
    { name: "HTTP status", value: result.headers.statusCode === null ? "not found" : String(result.headers.statusCode) },
    { name: "Policy", value: result.policyName || "not resolved" },
    { name: "Limit / quota", value: formatNullable(result.limit) },
    { name: "Remaining", value: formatNullable(result.remaining) },
    { name: "Used", value: formatNullable(result.used) },
    { name: "Usage percent", value: result.usagePercent === null ? "unknown" : `${result.usagePercent}%` },
    { name: "Effective window", value: result.effectiveWindowSeconds === null ? "not resolved" : `${result.effectiveWindowSeconds} seconds` },
    { name: "Window / reset time", value: result.resetTime },
    { name: "Retry-After time", value: result.retryAfterTime },
    { name: "Wait seconds", value: result.waitSeconds === null ? "unknown" : String(result.waitSeconds) },
    { name: "RateLimit", value: result.headers.rateLimit },
    { name: "RateLimit-Policy", value: result.headers.rateLimitPolicy },
    { name: "RateLimit-Limit (legacy)", value: result.headers.legacyRateLimitLimit },
    { name: "RateLimit-Remaining (legacy)", value: result.headers.legacyRateLimitRemaining },
    { name: "RateLimit-Reset (legacy)", value: result.headers.legacyRateLimitReset },
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
      ["findings", result.issues.map((issue) => `${issue.severity}: ${issue.title}`).join("; ")],
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

  const lines = [
    mode === "report" ? "API Rate Limit Header Report" : "API Rate Limit Header Summary",
    mode === "report" ? "----------------------------" : "-----------------------------",
    `Status: ${result.status}`,
    `Detected fields: ${result.detectedStyle}`,
    `Policy: ${result.policyName || "not resolved"}`,
    `Limit / quota: ${formatNullable(result.limit)}`,
    `Remaining: ${formatNullable(result.remaining)}`,
    `Used: ${formatNullable(result.used)}`,
    `Usage: ${result.usagePercent === null ? "unknown" : `${result.usagePercent}%`}`,
    `Effective window: ${result.effectiveWindowSeconds === null ? "not resolved" : `${result.effectiveWindowSeconds} seconds`}`,
    `Window / reset time: ${result.resetTime}`,
    `Retry-After: ${result.retryAfterTime}`,
    `Wait seconds: ${result.waitSeconds === null ? "unknown" : result.waitSeconds}`,
    "",
    "Findings:",
    ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
  ];

  if (mode === "report") {
    lines.push("", "Raw recognized fields:", ...resultRows(result).slice(11).map((row) => `- ${row.name}: ${row.value || "not found"}`));
  }

  return lines.join("\n");
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
      title: "Back off instead of retrying in a tight loop",
      message: "Respect Retry-After when present, then use jitter and bounded backoff so many clients do not resume at the same instant.",
    });
  } else if (result.status === "watch") {
    notes.push({
      title: "Shape requests before the quota reaches zero",
      message: "Queue or spread work when the advertised quota is low instead of waiting for a hard throttle response.",
    });
  }

  notes.push({
    title: "Provider documentation stays authoritative",
    message: "Legacy and X-RateLimit field names have provider-specific meanings. Confirm units, reset semantics, and quota scope before coding retry behavior.",
  });

  return notes;
}

