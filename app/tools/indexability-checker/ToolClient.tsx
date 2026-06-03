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

type Result = {
  indexable: boolean;
  score: number;
  status: "indexable" | "blocked" | "needs-review";
  issues: Issue[];
  signals: ExtractedSignal[];
  output: string;
  robotsDirectives: string[];
  xRobotsDirectives: string[];
  canonicalUrl: string;
  metaRefresh: string;
  title: string;
  description: string;
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
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
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
      description="Check whether a page looks indexable from pasted HTML and headers. Detect noindex, nofollow, robots meta tags, X-Robots-Tag, canonical conflicts, meta refresh, and indexing blockers."
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
          Paste page source, HTTP response headers, or both. The checker runs locally in your browser.
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
            <CheckboxRow checked={warnMissingCanonical} label="Warn when canonical tag is missing" onChange={(checked) => { setWarnMissingCanonical(checked); clearResult(); }} />
            <CheckboxRow checked={warnCanonicalMismatch} label="Warn when canonical differs from page URL" onChange={(checked) => { setWarnCanonicalMismatch(checked); clearResult(); }} />
            <CheckboxRow checked={warnMetaRefresh} label="Warn about meta refresh redirects" onChange={(checked) => { setWarnMetaRefresh(checked); clearResult(); }} />
            <CheckboxRow checked={warnNofollow} label="Warn about nofollow directives" onChange={(checked) => { setWarnNofollow(checked); clearResult(); }} />
            <CheckboxRow checked={warnThinSignals} label="Warn about missing title or description" onChange={(checked) => { setWarnThinSignals(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This tool checks pasted source and headers. It does not crawl live URLs or verify robots.txt access.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkIndexability} className="yoryantra-btn">
          Check Indexability
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
          <SummaryCard label="Status" value={result.status} />
          <SummaryCard label="Score" value={`${result.score}/100`} />
          <SummaryCard label="Robots Rules" value={String(result.robotsDirectives.length + result.xRobotsDirectives.length)} />
          <SummaryCard label="Findings" value={String(result.issues.length)} />
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
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Indexability findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Indexing guidance</h3>

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
          {output || "Indexability check output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This checker uses pasted HTML and headers only. A real search engine may also consider robots.txt, redirects, duplicate content, quality signals, internal links, and canonical selection.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking Whether a Page Looks Indexable</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A page can be crawlable but still not indexable if it contains noindex directives, conflicting canonical tags, X-Robots-Tag headers, soft redirect signals, or other indexing blockers.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Indexability Checker helps you inspect pasted page source and response headers before publishing, debugging Search Console coverage issues, or reviewing technical SEO changes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Indexability Checker</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste HTML source, HTTP response headers, or both.</li>
            <li>Optionally enter the page URL to compare it with the canonical tag.</li>
            <li>Choose the checking style and output format.</li>
            <li>Review noindex, nofollow, canonical, meta refresh, title, description, and X-Robots-Tag signals.</li>
            <li>Copy the summary, report, JSON, Markdown, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Indexability Blockers</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>noindex</strong> in a robots meta tag or X-Robots-Tag header.</li>
            <li>Canonical tags pointing to a different URL unexpectedly.</li>
            <li>Meta refresh redirects that behave like soft redirects.</li>
            <li>Missing or weak title and description signals.</li>
            <li>Nofollow directives that change how links are handled.</li>
            <li>Conflicting robots directives between HTML and HTTP headers.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Indexable Signals</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://example.com/page" />`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Indexability Is Not the Same as Ranking</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            An indexable page is only eligible to appear in search results. Ranking still depends on content quality, search intent, internal links, external signals, page experience, and search engine evaluation.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool to remove technical blockers first, then review content quality and internal linking separately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does an Indexability Checker do?">
              It checks pasted HTML and headers for signals that may allow, block, or complicate search engine indexing.
            </Faq>

            <Faq title="Does this crawl a live URL?">
              No. It analyzes the HTML and headers you paste into the tool.
            </Faq>

            <Faq title="What is the difference between crawlable and indexable?">
              Crawlable means a search engine can access the page. Indexable means the page is allowed and suitable to be stored in the search index.
            </Faq>

            <Faq title="Can a page with a canonical tag still be indexed?">
              Yes, but if the canonical points elsewhere, search engines may choose the canonical target instead of the current URL.
            </Faq>

            <Faq title="Is anything uploaded when I check indexability?">
              No. The check runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/robots-txt-tester" className="yoryantra-btn-outline">Robots.txt Tester</Link>
            <Link href="/tools/meta-robots-tag-generator" className="yoryantra-btn-outline">Meta Robots Tag Generator</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline">Canonical URL Checker</Link>
            <Link href="/tools/redirect-chain-checker" className="yoryantra-btn-outline">Redirect Chain Checker</Link>
            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline">Meta Tags Checker</Link>
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
  const html = options.inputMode === "headers" ? "" : options.input;
  const headers = options.inputMode === "html" ? "" : options.input;
  const robotsDirectives = extractRobotsDirectives(html);
  const xRobotsDirectives = extractXRobotsDirectives(headers);
  const canonicalUrl = extractCanonical(html);
  const metaRefresh = extractMetaRefresh(html);
  const title = extractTitle(html);
  const description = extractDescription(html);
  const signals: ExtractedSignal[] = [];
  const issues: Issue[] = [];

  addSignal(signals, "Robots meta", robotsDirectives.join(", ") || "not found", "html", robotsDirectives.length ? "info" : "good");
  addSignal(signals, "X-Robots-Tag", xRobotsDirectives.join(", ") || "not found", "headers", xRobotsDirectives.length ? "info" : "good");
  addSignal(signals, "Canonical", canonicalUrl || "not found", "html", canonicalUrl ? "good" : "info");
  addSignal(signals, "Meta refresh", metaRefresh || "not found", "html", metaRefresh ? "warning" : "good");
  addSignal(signals, "Title", title || "not found", "html", title ? "good" : "warning");
  addSignal(signals, "Description", description || "not found", "html", description ? "good" : "info");

  const allDirectives = [...robotsDirectives, ...xRobotsDirectives].map((item) => item.toLowerCase());

  if (allDirectives.includes("noindex") || allDirectives.some((item) => item.startsWith("none"))) {
    issues.push({
      severity: "high",
      title: "Noindex directive found",
      message: "The page contains noindex or none, which can prevent indexing.",
    });
  }

  if (options.warnNofollow && (allDirectives.includes("nofollow") || allDirectives.some((item) => item.startsWith("none")))) {
    issues.push({
      severity: "warning",
      title: "Nofollow directive found",
      message: "The page contains nofollow or none. This can affect how links on the page are followed.",
    });
  }

  if (options.warnMissingCanonical && !canonicalUrl && options.inputMode !== "headers") {
    issues.push({
      severity: options.checkingStyle === "strict" ? "warning" : "info",
      title: "Canonical tag missing",
      message: "No canonical tag was found in the pasted HTML.",
    });
  }

  if (options.warnCanonicalMismatch && options.pageUrl && canonicalUrl && normalizeUrl(options.pageUrl) !== normalizeUrl(canonicalUrl)) {
    issues.push({
      severity: "info",
      title: "Canonical differs from page URL",
      message: "The canonical points to a different URL. This can be intentional, but it should match your preferred indexable URL.",
    });
  }

  if (options.warnMetaRefresh && metaRefresh) {
    issues.push({
      severity: "warning",
      title: "Meta refresh found",
      message: "Meta refresh can behave like a soft redirect and may complicate indexing signals.",
    });
  }

  if (options.warnThinSignals && !title && options.inputMode !== "headers") {
    issues.push({
      severity: "warning",
      title: "Title missing",
      message: "No title tag was found. A missing title weakens page quality and search snippet signals.",
    });
  }

  if (options.warnThinSignals && !description && options.inputMode !== "headers") {
    issues.push({
      severity: "info",
      title: "Meta description missing",
      message: "No meta description was found. This does not block indexing, but it can affect snippet quality.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "No obvious indexing blocker found",
      message: "The pasted source does not contain common noindex, canonical, or meta refresh blockers.",
    });
  }

  const score = calculateScore(issues);
  const status: Result["status"] = issues.some((issue) => issue.severity === "high")
    ? "blocked"
    : issues.some((issue) => issue.severity === "warning")
      ? "needs-review"
      : "indexable";
  const indexable = status !== "blocked";
  const base = {
    indexable,
    score,
    status,
    issues,
    signals,
    robotsDirectives,
    xRobotsDirectives,
    canonicalUrl,
    metaRefresh,
    title,
    description,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function addSignal(signals: ExtractedSignal[], name: string, value: string, source: ExtractedSignal["source"], severity: ExtractedSignal["severity"]) {
  signals.push({ name, value, source, severity });
}

function extractRobotsDirectives(html: string) {
  const directives: string[] = [];
  const matches = html.matchAll(/<meta\b[^>]*(?:name|property)=["'](?:robots|googlebot|bingbot)["'][^>]*>/gi);

  Array.from(matches).forEach((match) => {
    const content = readAttribute(match[0], "content");
    directives.push(...splitDirectives(content));
  });

  return unique(directives);
}

function extractXRobotsDirectives(headers: string) {
  const directives: string[] = [];
  const lines = headers.split(/\r?\n/);

  lines.forEach((line) => {
    const match = line.match(/^\s*x-robots-tag\s*:\s*(.+)$/i);
    if (match) {
      directives.push(...splitDirectives(match[1]));
    }
  });

  return unique(directives);
}

function splitDirectives(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractCanonical(html: string) {
  const match = html.match(/<link\b[^>]*rel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/i);
  return match ? readAttribute(match[0], "href") : "";
}

function extractMetaRefresh(html: string) {
  const match = html.match(/<meta\b[^>]*http-equiv=["']refresh["'][^>]*>/i);
  return match ? readAttribute(match[0], "content") : "";
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeBasicEntities(match[1].trim()) : "";
}

function extractDescription(html: string) {
  const match = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i);
  return match ? readAttribute(match[0], "content") : "";
}

function readAttribute(tag: string, attribute: string) {
  const match = tag.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decodeBasicEntities(match[1].trim()) : "";
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.hostname = url.hostname.replace(/^www\./i, "");
    let text = url.toString();
    text = text.replace(/\/$/, "");
    return text;
  } catch {
    return value.trim().replace(/\/$/, "");
  }
}

function calculateScore(issues: Issue[]) {
  let score = 100;

  issues.forEach((issue) => {
    if (issue.severity === "high") score -= 45;
    else if (issue.severity === "warning") score -= 15;
    else if (issue.title !== "No obvious indexing blocker found") score -= 5;
  });

  return Math.max(0, score);
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "csv") {
    const rows = [
      ["signal", "value", "source", "severity"],
      ...result.signals.map((signal) => [signal.name, signal.value, signal.source, signal.severity]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Signal | Value | Source | Severity |",
      "| --- | --- | --- | --- |",
      ...result.signals.map((signal) =>
        `| ${escapeMarkdown(signal.name)} | ${escapeMarkdown(signal.value)} | ${signal.source} | ${signal.severity} |`
      ),
    ].join("\n");
  }

  if (mode === "report") {
    return [
      "Indexability Report",
      "-------------------",
      `Status: ${result.status}`,
      `Indexable: ${result.indexable ? "yes" : "no"}`,
      `Score: ${result.score}/100`,
      "",
      "Signals:",
      ...result.signals.map((signal) => `- ${signal.name}: ${signal.value} (${signal.source})`),
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  return [
    "Indexability Summary",
    "--------------------",
    `Status: ${result.status}`,
    `Indexable: ${result.indexable ? "yes" : "no"}`,
    `Score: ${result.score}/100`,
    `Robots meta: ${result.robotsDirectives.join(", ") || "not found"}`,
    `X-Robots-Tag: ${result.xRobotsDirectives.join(", ") || "not found"}`,
    `Canonical: ${result.canonicalUrl || "not found"}`,
    `Meta refresh: ${result.metaRefresh || "not found"}`,
    `Title: ${result.title || "not found"}`,
    `Description: ${result.description || "not found"}`,
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

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.status === "blocked") {
    notes.push({
      title: "Fix blocking directives first",
      message: "Remove noindex or conflicting X-Robots-Tag rules before expecting the page to appear in search results.",
    });
  }

  if (result.canonicalUrl) {
    notes.push({
      title: "Confirm canonical alignment",
      message: "Make sure canonical tags, sitemap URLs, redirects, and internal links point to the same preferred version.",
    });
  }

  if (result.status === "indexable") {
    notes.push({
      title: "No obvious blocker found",
      message: "The pasted source looks technically indexable, but search engines still evaluate quality, duplication, links, and crawl access.",
    });
  }

  return notes;
}
