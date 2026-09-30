"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "html" | "headers" | "combined";
type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type CheckingStyle = "balanced" | "strict" | "relaxed";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type ExtractedSignal = {
  name: string;
  value: string;
  source: "html" | "headers" | "derived";
  severity: "good" | "info" | "warning" | "high";
};

type ScopedDirective = {
  crawler: string;
  directive: string;
};

type Result = {
  status: "no-obvious-blocker" | "blocked" | "needs-review";
  issues: Issue[];
  signals: ExtractedSignal[];
  output: string;
  robotsDirectives: string[];
  xRobotsDirectives: string[];
  canonicalUrls: string[];
  canonicalUrl: string;
  metaRefresh: string;
  title: string;
  description: string;
  statusCode: number | null;
  contentType: string;
  blockingCount: number;
  warningCount: number;
};

const sampleInput = `HTTP/2 200
content-type: text/html; charset=utf-8
x-robots-tag: index, follow

<!doctype html>
<html>
<head>
  <title>Example SEO Tool Page</title>
  <meta name="description" content="A useful page that should be indexed by search engines." />
  <meta name="robots" content="index, follow, max-snippet:-1" />
  <link rel="canonical" href="https://example.com/tools/indexability-checker" />
</head>
<body>
  <h1>Indexability Checker</h1>
  <p>This page is meant to be indexed.</p>
</body>
</html>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("combined");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [checkingStyle, setCheckingStyle] = useState<CheckingStyle>("balanced");
  const [warnMissingCanonical, setWarnMissingCanonical] = useState(true);
  const [warnCanonicalMismatch, setWarnCanonicalMismatch] = useState(true);
  const [warnMetaRefresh, setWarnMetaRefresh] = useState(true);
  const [warnNofollow, setWarnNofollow] = useState(true);
  const [warnThinSignals, setWarnThinSignals] = useState(true);
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

  const checkIndexability = () => {
    if (!input.trim()) {
      setError("Please paste HTML, HTTP headers, or a combined page source export.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = analyzeIndexability({
        input,
        pageUrl,
        inputMode,
        outputMode,
        checkingStyle,
        warnMissingCanonical,
        warnCanonicalMismatch,
        warnMetaRefresh,
        warnNofollow,
        warnThinSignals,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to check indexability.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the output and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(sampleInput);
    setPageUrl("https://example.com/tools/indexability-checker");
    setInputMode("combined");
    setOutputMode("summary");
    setCheckingStyle("balanced");
    setWarnMissingCanonical(true);
    setWarnCanonicalMismatch(true);
    setWarnMetaRefresh(true);
    setWarnNofollow(true);
    setWarnThinSignals(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setPageUrl("");
    setInputMode("combined");
    setOutputMode("summary");
    setCheckingStyle("balanced");
    setWarnMissingCanonical(true);
    setWarnCanonicalMismatch(true);
    setWarnMetaRefresh(true);
    setWarnNofollow(true);
    setWarnThinSignals(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Indexability Checker"
      description="Read pasted HTML and response headers for signals that can block or redirect indexing."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTML and Headers
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleInput}
          className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste source HTML, response headers, or both. No network request is made to the page URL.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Page URL
        </label>

        <input
          value={pageUrl}
          onChange={(event) => {
            setPageUrl(event.target.value);
            clearResult();
          }}
          placeholder="https://example.com/page"
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Optional. Used to compare the page URL with the canonical URL.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              clearResult();
            }}
            options={[
              { label: "HTML + headers", value: "combined" },
              { label: "HTML only", value: "html" },
              { label: "Headers only", value: "headers" },
            ]}
          />

          <YoryantraSelect
            label="Review Depth"
            value={checkingStyle}
            onChange={(value) => {
              setCheckingStyle(value as CheckingStyle);
              clearResult();
            }}
            options={[
              { label: "Balanced signals", value: "balanced" },
              { label: "Expanded signals", value: "strict" },
              { label: "Blocking signals only", value: "relaxed" },
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
            <CheckboxRow checked={warnMissingCanonical} label="Note when canonical link is missing" onChange={(checked) => { setWarnMissingCanonical(checked); clearResult(); }} />
            <CheckboxRow checked={warnCanonicalMismatch} label="Flag canonical that points away from the page URL" onChange={(checked) => { setWarnCanonicalMismatch(checked); clearResult(); }} />
            <CheckboxRow checked={warnMetaRefresh} label="Flag meta refresh redirects" onChange={(checked) => { setWarnMetaRefresh(checked); clearResult(); }} />
            <CheckboxRow checked={warnNofollow} label="Flag nofollow directives" onChange={(checked) => { setWarnNofollow(checked); clearResult(); }} />
            <CheckboxRow checked={warnThinSignals} label="Note missing title or description (not indexing blockers)" onChange={(checked) => { setWarnThinSignals(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Review depth only changes optional observations. The blocking summary combines generic robots rules with rules scoped to <code>Googlebot</code>; crawler-specific rules for Googlebot News, Bingbot, or other bots stay scoped instead of becoming global blockers.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkIndexability} className="yoryantra-btn whitespace-nowrap">
          Check Indexability
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
          <SummaryCard label="Status" value={result.status} />
          <SummaryCard label="HTTP" value={result.statusCode ? String(result.statusCode) : "not supplied"} />
          <SummaryCard label="Blocking signals" value={result.blockingCount.toLocaleString()} />
          <SummaryCard label="Cautions" value={result.warningCount.toLocaleString()} />
        </div>
      )}

      {result && result.signals.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Indexability Signals</h3>

          <p className="mt-2 text-sm text-gray-500">
            Signals found in pasted HTML, headers, and derived checks.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Signal</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.signals.map((signal, index) => (
                  <tr key={`${signal.name}-${index}`}>
                    <td className="px-4 py-3 font-semibold text-gray-800">{signal.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[420px] break-words">{signal.value || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{signal.source}</td>
                    <td className="px-4 py-3 text-gray-700">{signal.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">Signals that deserve attention</h3>
          <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
            {result.issues.map((issue, index) => (
              <IssueCard key={`${issue.title}-${index}`} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <div key={note.title} className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">{note.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{note.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Indexability output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        “No obvious blocker” only describes the pasted signals. Robots.txt access, redirects before this response, rendered JavaScript, canonical selection, soft 404 detection, and search-engine quality decisions still sit outside this check.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Indexable is a conclusion, not a single tag</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A robots meta tag is only one part of the picture. Search engines also see the HTTP response, response headers, redirects, canonical hints, crawl permissions, rendered content, and the page itself. That is why the result above deliberately says <strong>no obvious blocker</strong> rather than promising that a URL will be indexed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Signals that can stop the current response from being indexed</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li><code>noindex</code> in a robots meta tag or applicable <code>X-Robots-Tag</code> response header.</li>
            <li>A redirect response, where the current URL is forwarding elsewhere instead of serving indexable content.</li>
            <li>Persistent <code>4xx</code>, <code>5xx</code>, or <code>429</code> responses, which prevent normal indexing of the returned content.</li>
            <li>Conflicting robots directives where a restrictive rule such as <code>noindex</code> is also present.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Signals that matter without being hard blockers</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A canonical URL pointing elsewhere is important because it asks search engines to consolidate duplicate signals around another URL, but Google describes canonicalization as a hint rather than a rule. Likewise, <code>nofollow</code> controls link following rather than page indexing, and a missing meta description does not make a page non-indexable.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Missing titles and descriptions are still worth noticing during a page review, so the expanded mode can surface them without treating them as indexing blocks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Robots.txt can hide the very noindex rule you wanted Google to read</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Robots meta rules and <code>X-Robots-Tag</code> rules are discovered when a crawler fetches the URL. If robots.txt prevents that crawl, the crawler may never see the page-level <code>noindex</code>. A pasted-source check cannot resolve that conflict because robots.txt is a separate resource.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">HTTP status belongs in the same review</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            When response headers are included, the parser reads a conventional HTTP status line and <code>Content-Type</code>. A successful <code>2xx</code> response can move content into later indexing systems, but success alone never guarantees indexing. Redirects and error responses change the interpretation before page-level SEO tags are considered.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pasted source may differ from the rendered page</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript can alter canonicals, robots tags, content, and navigation after the original HTML arrives. The parser reads exactly what you paste. For a JavaScript-heavy page, compare server HTML with the rendered DOM and Search Console&apos;s URL Inspection output before diagnosing an indexing problem.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What happens to the HTML and headers you paste</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Parsing happens in the browser and does not intentionally transmit the pasted HTML, headers, or optional page URL to Yoryantra for analysis. The page URL field is used only as a comparison value; entering it does not fetch the page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Primary documentation for the rules above</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google documents these behaviors in its{' '}
            <a href="https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">robots meta and X-Robots-Tag specification</a>,{' '}
            <a href="https://developers.google.com/crawling/docs/troubleshooting/http-status-codes" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">HTTP status guidance</a>, and{' '}
            <a href="https://developers.google.com/search/docs/crawling-indexing/canonicalization" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">canonicalization documentation</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/robots-txt-tester" className="yoryantra-btn-outline whitespace-nowrap">Robots.txt Tester</Link>
            <Link href="/tools/meta-robots-tag-generator" className="yoryantra-btn-outline whitespace-nowrap">Meta Robots Tag Generator</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline whitespace-nowrap">Canonical URL Checker</Link>
            <Link href="/tools/redirect-checker" className="yoryantra-btn-outline whitespace-nowrap">Redirect Checker</Link>
            <Link href="/tools/http-headers-checker" className="yoryantra-btn-outline whitespace-nowrap">HTTP Headers Checker</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const styles = issue.severity === "high"
    ? "border-red-200 bg-red-50 text-red-900"
    : issue.severity === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-gray-200 bg-gray-50 text-gray-900";

  return (
    <div className={`self-start rounded-xl border p-4 ${styles}`}>
      <p className="text-sm font-semibold">{issue.title}</p>
      <p className="mt-1 text-sm leading-relaxed opacity-90">{issue.message}</p>
    </div>
  );
}

function analyzeIndexability(options: {
  input: string;
  pageUrl: string;
  inputMode: InputMode;
  outputMode: OutputMode;
  checkingStyle: CheckingStyle;
  warnMissingCanonical: boolean;
  warnCanonicalMismatch: boolean;
  warnMetaRefresh: boolean;
  warnNofollow: boolean;
  warnThinSignals: boolean;
}): Result {
  if (options.pageUrl.trim()) {
    const parsedPageUrl = parseHttpUrl(options.pageUrl.trim());
    if (!parsedPageUrl) throw new Error("Page URL must be an absolute HTTP or HTTPS URL.");
  }

  const separated = separateSource(options.input, options.inputMode);
  const html = separated.html;
  const headers = separated.headers;

  const robotsRecords = extractRobotsDirectives(html);
  const xRobotsRecords = extractXRobotsDirectives(headers);
  const robotsDirectives = robotsRecords.map(formatScopedDirective);
  const xRobotsDirectives = xRobotsRecords.map(formatScopedDirective);

  const htmlCanonicals = extractHtmlCanonicals(html);
  const headerCanonicals = extractHeaderCanonicals(headers);
  const canonicalUrls = unique([...htmlCanonicals, ...headerCanonicals]);
  const canonicalUrl = canonicalUrls[0] || "";

  const metaRefresh = extractMetaRefresh(html);
  const title = extractTitle(html);
  const description = extractDescription(html);
  const statusCode = extractStatusCode(headers);
  const contentType = extractHeaderValue(headers, "content-type");
  const signals: ExtractedSignal[] = [];
  const issues: Issue[] = [];

  const effectiveDirectives = [
    ...effectiveForGooglebot(robotsRecords),
    ...effectiveForGooglebot(xRobotsRecords),
  ];
  const effectiveTokens = effectiveDirectives.map(normalizeDirectiveToken);
  const hasNoindex = effectiveTokens.includes("noindex") || effectiveTokens.includes("none");
  const hasIndex = effectiveTokens.includes("index") || effectiveTokens.includes("all");
  const hasNofollow = effectiveTokens.includes("nofollow") || effectiveTokens.includes("none");

  addSignal(signals, "HTTP status", statusCode ? String(statusCode) : "not supplied", "headers", statusSeverity(statusCode));
  addSignal(signals, "Content-Type", contentType || "not supplied", "headers", "info");
  addSignal(
    signals,
    "Robots meta",
    robotsDirectives.join(", ") || "not found",
    "html",
    directiveRecordSeverity(robotsRecords)
  );
  addSignal(
    signals,
    "X-Robots-Tag",
    xRobotsDirectives.join(", ") || "not found",
    "headers",
    directiveRecordSeverity(xRobotsRecords)
  );
  addSignal(
    signals,
    "HTML canonical",
    htmlCanonicals.join(" | ") || "not found",
    "html",
    htmlCanonicals.length > 1 ? "warning" : htmlCanonicals.length ? "good" : "info"
  );
  addSignal(
    signals,
    "HTTP Link canonical",
    headerCanonicals.join(" | ") || "not found",
    "headers",
    headerCanonicals.length > 1 ? "warning" : headerCanonicals.length ? "good" : "info"
  );
  addSignal(signals, "Meta refresh", metaRefresh || "not found", "html", metaRefresh ? "warning" : "good");
  addSignal(signals, "Title", title || "not found", "html", title ? "good" : "info");
  addSignal(signals, "Description", description || "not found", "html", description ? "good" : "info");

  if (statusCode !== null) {
    if ([301, 302, 303, 307, 308].includes(statusCode)) {
      issues.push({
        severity: "high",
        title: "Redirect response supplied",
        message: `HTTP ${statusCode} redirects the current URL instead of serving the final document at this response.`,
      });
    } else if (statusCode === 304) {
      issues.push({
        severity: "warning",
        title: "304 response needs cached context",
        message:
          "HTTP 304 Not Modified is a conditional cache-validation response, not a redirect. It does not contain a fresh representation by itself, so review it together with the cached 200 response.",
      });
    } else if (statusCode >= 300 && statusCode < 400) {
      issues.push({
        severity: "warning",
        title: "Other 3xx response supplied",
        message:
          `HTTP ${statusCode} is not treated here as an automatic redirect. Check the status semantics and any Location header before deciding how crawlers process this URL.`,
      });
    } else if (statusCode === 429 || statusCode >= 500) {
      issues.push({
        severity: "high",
        title: "Server or rate-limit response",
        message: `HTTP ${statusCode} prevents normal processing of the returned page and can reduce crawling while the error persists.`,
      });
    } else if (statusCode >= 400) {
      issues.push({
        severity: "high",
        title: "Client-error response",
        message: `HTTP ${statusCode} is not a normal success response for content intended to remain indexed.`,
      });
    }
  }

  if (hasNoindex) {
    issues.push({
      severity: "high",
      title: "Noindex applies to Googlebot",
      message:
        "A generic robots rule or a Googlebot-scoped noindex rule (including none) tells Googlebot not to keep this page in Google Search once it can crawl the rule.",
    });
  }

  if (hasNoindex && hasIndex) {
    issues.push({
      severity: "warning",
      title: "Conflicting Googlebot index directives",
      message:
        "Permissive and restrictive indexing tokens that apply to Googlebot are both present. Google uses the more restrictive valid rule, so noindex wins.",
    });
  }

  if (options.warnNofollow && hasNofollow) {
    issues.push({
      severity: "warning",
      title: "Nofollow applies to Googlebot",
      message:
        "A generic or Googlebot-scoped nofollow rule affects how Googlebot treats links on the page; it does not by itself make the page non-indexable.",
    });
  }

  const otherCrawlerScopes = unique(
    [...robotsRecords, ...xRobotsRecords]
      .map((record) => record.crawler)
      .filter((crawler) => crawler !== "robots" && crawler !== "googlebot")
  );

  if (otherCrawlerScopes.length) {
    issues.push({
      severity: "info",
      title: "Other crawler-specific directives are scoped",
      message:
        `Directives for ${otherCrawlerScopes.join(
          ", "
        )} are shown in the extracted signals but are not promoted to Googlebot blocking status. Crawler-specific rules should be evaluated in their own scope.`,
    });
  }

  if (canonicalUrls.length > 1) {
    issues.push({
      severity: "warning",
      title: "Conflicting canonical targets found",
      message:
        "The pasted HTML and/or HTTP Link headers expose more than one canonical target. Resolve the conflict so the preferred URL signal is unambiguous.",
    });
  }

  if (
    options.warnMissingCanonical &&
    !canonicalUrl &&
    options.inputMode !== "headers" &&
    options.checkingStyle !== "relaxed"
  ) {
    issues.push({
      severity: "info",
      title: "No canonical annotation in the pasted data",
      message:
        "A canonical annotation is not required for indexability, but it can help communicate a preferred URL when duplicate variants exist.",
    });
  }

  if (canonicalUrl && !isAbsoluteHttpUrl(canonicalUrl)) {
    issues.push({
      severity: "info",
      title: "Canonical is not an absolute HTTP(S) URL",
      message:
        "Relative canonical references can resolve against the page URL, but Google recommends absolute canonical URLs to reduce ambiguity.",
    });
  }

  if (
    options.warnCanonicalMismatch &&
    options.pageUrl &&
    canonicalUrl &&
    !sameUrlForComparison(options.pageUrl, canonicalUrl)
  ) {
    issues.push({
      severity: "warning",
      title: "Canonical points away from the page URL",
      message:
        "That can be intentional for duplicate content, but it asks search engines to prefer another URL rather than this one.",
    });
  }

  if (options.warnMetaRefresh && metaRefresh) {
    issues.push({
      severity: "warning",
      title: "Meta refresh is present",
      message:
        "A meta refresh can move users and crawlers to another URL. Check the delay and destination, and prefer an HTTP redirect when a real redirect is intended.",
    });
  }

  if (
    options.warnThinSignals &&
    options.inputMode !== "headers" &&
    options.checkingStyle === "strict"
  ) {
    if (!title) {
      issues.push({
        severity: "info",
        title: "Title is missing",
        message:
          "A missing title is a page-quality and search-presentation issue, not an indexing prohibition.",
      });
    }
    if (!description) {
      issues.push({
        severity: "info",
        title: "Meta description is missing",
        message:
          "A missing meta description does not prevent indexing; search engines may generate snippet text from the page.",
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "No blocking signal found in the pasted data",
      message:
        "The supplied HTML and headers do not show a common Googlebot page-level indexing prohibition or a blocking HTTP response.",
    });
  }

  const blockingCount = issues.filter((issue) => issue.severity === "high").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const status: Result["status"] =
    blockingCount > 0
      ? "blocked"
      : warningCount > 0
      ? "needs-review"
      : "no-obvious-blocker";

  const base = {
    status,
    issues,
    signals,
    robotsDirectives,
    xRobotsDirectives,
    canonicalUrls,
    canonicalUrl,
    metaRefresh,
    title,
    description,
    statusCode,
    contentType,
    blockingCount,
    warningCount,
  };
  const output = formatOutput(base, options.outputMode);
  return { ...base, output };
}

function separateSource(input: string, mode: InputMode) {
  if (mode === "html") return { html: input, headers: "" };
  if (mode === "headers") return { html: "", headers: input };

  const htmlStart = input.search(
    /<(?:!doctype\s+html\b|html\b|head\b|body\b|title\b|meta\b|link\b|script\b|style\b|main\b|section\b|article\b|div\b|p\b|h[1-6]\b)/i
  );

  if (htmlStart === -1) {
    return { html: "", headers: input };
  }

  return {
    headers: input.slice(0, htmlStart),
    html: input.slice(htmlStart),
  };
}

function addSignal(signals: ExtractedSignal[], name: string, value: string, source: ExtractedSignal["source"], severity: ExtractedSignal["severity"]) {
  signals.push({ name, value, source, severity });
}

function parseDocument(html: string) {
  if (!html.trim() || typeof DOMParser === "undefined") return null;
  return new DOMParser().parseFromString(html, "text/html");
}

function extractRobotsDirectives(html: string): ScopedDirective[] {
  const doc = parseDocument(html);
  if (!doc) return [];

  const accepted = new Set(["robots", "googlebot", "googlebot-news", "bingbot"]);
  const directives: ScopedDirective[] = [];

  Array.from(doc.querySelectorAll("meta[name]")).forEach((meta) => {
    const crawler = (meta.getAttribute("name") || "").trim().toLowerCase();
    if (!accepted.has(crawler)) return;

    splitDirectives(meta.getAttribute("content") || "").forEach((directive) => {
      directives.push({ crawler, directive });
    });
  });

  return uniqueScopedDirectives(directives);
}

const xRobotsColonDirectives = new Set([
  "max-snippet",
  "max-image-preview",
  "max-video-preview",
  "unavailable_after",
]);

function extractXRobotsDirectives(headers: string): ScopedDirective[] {
  const directives: ScopedDirective[] = [];

  headers.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*x-robots-tag\s*:\s*(.+)$/i);
    if (!match) return;

    let crawler = "robots";
    let value = match[1].trim();
    const scoped = value.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);

    if (
      scoped &&
      !xRobotsColonDirectives.has(scoped[1].toLowerCase())
    ) {
      crawler = scoped[1].toLowerCase();
      value = scoped[2];
    }

    splitDirectives(value).forEach((directive) => {
      directives.push({ crawler, directive });
    });
  });

  return uniqueScopedDirectives(directives);
}

function splitDirectives(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function formatScopedDirective(value: ScopedDirective) {
  return value.crawler === "robots"
    ? value.directive
    : `${value.crawler}: ${value.directive}`;
}

function effectiveForGooglebot(values: ScopedDirective[]) {
  return values
    .filter((value) => value.crawler === "robots" || value.crawler === "googlebot")
    .map((value) => value.directive);
}

function uniqueScopedDirectives(values: ScopedDirective[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = `${value.crawler}\u0000${value.directive.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeDirectiveToken(value: string) {
  return value.toLowerCase().split(":")[0].trim();
}

function directiveSeverity(values: string[]): ExtractedSignal["severity"] {
  const tokens = values.map(normalizeDirectiveToken);
  if (tokens.includes("noindex") || tokens.includes("none")) return "high";
  if (tokens.includes("nofollow")) return "warning";
  return values.length ? "info" : "good";
}

function directiveRecordSeverity(values: ScopedDirective[]): ExtractedSignal["severity"] {
  const effective = effectiveForGooglebot(values);
  const severity = directiveSeverity(effective);
  if (severity !== "good") return severity;
  return values.length ? "info" : "good";
}

function extractHtmlCanonicals(html: string) {
  const doc = parseDocument(html);
  if (!doc) return [];
  const values = Array.from(doc.querySelectorAll("link[rel][href]"))
    .filter((link) => (link.getAttribute("rel") || "").toLowerCase().split(/\s+/).includes("canonical"))
    .map((link) => (link.getAttribute("href") || "").trim())
    .filter(Boolean);
  return unique(values);
}

function splitHttpLinkValues(input: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  let quote = "";
  let angleDepth = 0;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input.charAt(index);

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

    if ((char === '"' || char === "'") && angleDepth === 0) {
      if (quoted && char === quote) {
        quoted = false;
        quote = "";
      } else if (!quoted) {
        quoted = true;
        quote = char;
      }
      current += char;
      continue;
    }

    if (!quoted && char === "<") angleDepth += 1;
    if (!quoted && char === ">" && angleDepth > 0) angleDepth -= 1;

    if (!quoted && angleDepth === 0 && char === ",") {
      if (current.trim()) values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) values.push(current.trim());
  return values;
}

function extractHeaderCanonicals(headers: string) {
  const unfolded = headers.replace(/\r?\n[ \t]+/g, " ");
  const values: string[] = [];

  unfolded.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*link\s*:\s*(.+)$/i);
    if (!match) return;

    splitHttpLinkValues(match[1]).forEach((linkValue) => {
      const target = linkValue.match(/^\s*<([^>]*)>/);
      if (!target) return;

      const relMatch = linkValue.match(
        /;\s*rel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^;,\s]+))/i
      );
      const relValue = relMatch?.[1] || relMatch?.[2] || relMatch?.[3] || "";
      const rels = relValue.toLowerCase().split(/\s+/).filter(Boolean);

      if (rels.includes("canonical") && target[1].trim()) {
        values.push(target[1].trim());
      }
    });
  });

  return unique(values);
}

function extractMetaRefresh(html: string) {
  const doc = parseDocument(html);
  if (!doc) return "";
  const meta = Array.from(doc.querySelectorAll("meta[http-equiv]"))
    .find((node) => (node.getAttribute("http-equiv") || "").trim().toLowerCase() === "refresh");
  return meta ? (meta.getAttribute("content") || "").trim() : "";
}

function extractTitle(html: string) {
  const doc = parseDocument(html);
  return doc?.title.trim() || "";
}

function extractDescription(html: string) {
  const doc = parseDocument(html);
  if (!doc) return "";
  const meta = Array.from(doc.querySelectorAll("meta[name]"))
    .find((node) => (node.getAttribute("name") || "").trim().toLowerCase() === "description");
  return meta ? (meta.getAttribute("content") || "").trim() : "";
}

function extractStatusCode(headers: string) {
  const firstLine = headers.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
  const httpMatch = firstLine.match(/^HTTP\/\S+\s+(\d{3})\b/i);
  if (httpMatch) return Number(httpMatch[1]);
  const pseudo = headers.match(/^\s*:status\s*:\s*(\d{3})\b/im);
  if (pseudo) return Number(pseudo[1]);
  const statusHeader = headers.match(/^\s*status\s*:\s*(\d{3})\b/im);
  return statusHeader ? Number(statusHeader[1]) : null;
}

function extractHeaderValue(headers: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = headers.match(new RegExp(`^\\s*${escaped}\\s*:\\s*(.+)$`, "im"));
  return match ? match[1].trim() : "";
}

function statusSeverity(statusCode: number | null): ExtractedSignal["severity"] {
  if (statusCode === null) return "info";
  if (statusCode >= 300) return statusCode < 400 ? "warning" : "high";
  return "good";
}

function parseHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function isAbsoluteHttpUrl(value: string) {
  return Boolean(parseHttpUrl(value));
}

function sameUrlForComparison(pageUrl: string, canonicalUrl: string) {
  try {
    const page = new URL(pageUrl);
    const canonical = new URL(canonicalUrl, page);
    page.hash = "";
    canonical.hash = "";
    return normalizeComparableUrl(page) === normalizeComparableUrl(canonical);
  } catch {
    return pageUrl.trim() === canonicalUrl.trim();
  }
}

function normalizeComparableUrl(url: URL) {
  const copy = new URL(url.toString());
  copy.hash = "";
  if (copy.pathname !== "/") copy.pathname = copy.pathname.replace(/\/+$/, "");
  return copy.toString();
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode) {
  if (mode === "json") return JSON.stringify(result, null, 2);
  if (mode === "csv") {
    const rows = [["signal", "value", "source", "severity"], ...result.signals.map((signal) => [signal.name, signal.value, signal.source, signal.severity])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }
  if (mode === "markdown") {
    return ["| Signal | Value | Source | Severity |", "| --- | --- | --- | --- |", ...result.signals.map((signal) => `| ${escapeMarkdown(signal.name)} | ${escapeMarkdown(signal.value)} | ${signal.source} | ${signal.severity} |`)].join("\n");
  }
  if (mode === "report") {
    return [
      "Indexability Signal Report",
      "--------------------------",
      `Status: ${result.status}`,
      `HTTP status: ${result.statusCode ?? "not supplied"}`,
      `Blocking signals: ${result.blockingCount}`,
      `Cautions: ${result.warningCount}`,
      "",
      "Signals:",
      ...result.signals.map((signal) => `- ${signal.name}: ${signal.value} (${signal.source})`),
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }
  return [
    "Indexability Signal Summary",
    "---------------------------",
    `Status: ${result.status}`,
    `HTTP status: ${result.statusCode ?? "not supplied"}`,
    `Content-Type: ${result.contentType || "not supplied"}`,
    `Blocking signals: ${result.blockingCount}`,
    `Cautions: ${result.warningCount}`,
    `Robots meta: ${result.robotsDirectives.join(", ") || "not found"}`,
    `X-Robots-Tag: ${result.xRobotsDirectives.join(", ") || "not found"}`,
    `Canonical: ${result.canonicalUrls.join(" | ") || "not found"}`,
    `Meta refresh: ${result.metaRefresh || "not found"}`,
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

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];
  if (result.blockingCount > 0) notes.push({ title: "Start with the blocking response or directive", message: "A canonical or snippet improvement cannot compensate for a noindex rule, redirect response, or persistent HTTP error." });
  if (result.canonicalUrl) notes.push({ title: "Compare canonical with the rest of the site signals", message: "Sitemaps, internal links, redirects, and canonical annotations are strongest when they consistently identify the same preferred URL." });
  if (result.status === "no-obvious-blocker") notes.push({ title: "Move from source inspection to live verification", message: "Check robots.txt, rendered HTML, redirects, and Search Console before concluding that an indexing problem is solved." });
  return notes;
}
