"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type DeviceMode = "desktop" | "mobile";
type OutputMode = "summary" | "report" | "json" | "html";
type ResultStyle = "standard" | "breadcrumb" | "rich";
type LengthStatus = "good" | "short" | "long" | "empty";

type SnippetIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type SnippetResult = {
  title: string;
  description: string;
  url: string;
  displayUrl: string;
  siteName: string;
  breadcrumb: string;
  titleLength: number;
  descriptionLength: number;
  titleStatus: LengthStatus;
  descriptionStatus: LengthStatus;
  titlePreview: string;
  descriptionPreview: string;
  issues: SnippetIssue[];
  output: string;
  score: number;
};

type SnippetNote = {
  title: string;
  message: string;
};

const sampleTitle = "JSON Formatter | Format and Validate JSON | Yoryantra";
const sampleDescription =
  "Format, validate, beautify, and inspect JSON directly in your browser with a clean, practical JSON formatter built for developers.";
const sampleUrl = "https://yoryantra.com/tools/json-formatter";
const sampleSiteName = "Yoryantra";

export default function ToolClient() {
  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [resultStyle, setResultStyle] = useState<ResultStyle>("standard");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [showDate, setShowDate] = useState(false);
  const [snippetDate, setSnippetDate] = useState("");
  const [showKeywordHints, setShowKeywordHints] = useState(true);
  const [targetKeyword, setTargetKeyword] = useState("");
  const [includeBrandCheck, setIncludeBrandCheck] = useState(true);
  const [result, setResult] = useState<SnippetResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getSnippetNotes(result) : []), [result]);

  const previewSnippet = () => {
    if (!pageTitle.trim() && !metaDescription.trim() && !pageUrl.trim()) {
      setError("Please enter at least a page title, meta description, or URL.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = buildSnippetPreview({
        pageTitle,
        metaDescription,
        pageUrl,
        siteName,
        deviceMode,
        resultStyle,
        outputMode,
        showDate,
        snippetDate,
        showKeywordHints,
        targetKeyword,
        includeBrandCheck,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to preview this search snippet."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The browser could not copy the report. Select the output and copy it manually.");
    }
  };

  const loadExample = () => {
    setPageTitle(sampleTitle);
    setMetaDescription(sampleDescription);
    setPageUrl(sampleUrl);
    setSiteName(sampleSiteName);
    setDeviceMode("desktop");
    setResultStyle("standard");
    setOutputMode("summary");
    setShowDate(false);
    setSnippetDate("");
    setShowKeywordHints(true);
    setTargetKeyword("JSON formatter");
    setIncludeBrandCheck(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setPageTitle("");
    setMetaDescription("");
    setPageUrl("");
    setSiteName("");
    setDeviceMode("desktop");
    setResultStyle("standard");
    setOutputMode("summary");
    setShowDate(false);
    setSnippetDate("");
    setShowKeywordHints(true);
    setTargetKeyword("");
    setIncludeBrandCheck(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const liveTitle = pageTitle.trim() || "Your page title will appear here";
  const liveDescription =
    metaDescription.trim() ||
    "Your meta description preview will appear here. Add a clear summary of the page so users understand why they should click.";
  const liveUrl = pageUrl.trim() || "https://example.com/page";
  const liveSite = siteName.trim() || getHostName(liveUrl) || "Example";

  return (
    <ToolShell
      title="SERP Snippet Preview Tool"
      description="Preview Google-style search snippets and check page title, meta description, URL, truncation, and SEO snippet issues."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Snippet Details
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="serp-title" className="block text-sm font-medium text-gray-700">
                Page Title
              </label>

              <input
                id="serp-title"
                value={pageTitle}
                onChange={(event) => {
                  setPageTitle(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder={sampleTitle}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <p className="mt-1 text-xs text-gray-500">
                {pageTitle.length} characters
              </p>
            </div>

            <div>
              <label htmlFor="serp-description" className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>

              <textarea
                id="serp-description"
                value={metaDescription}
                onChange={(event) => {
                  setMetaDescription(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder={sampleDescription}
                className="mt-2 w-full min-h-[130px] rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <p className="mt-1 text-xs text-gray-500">
                {metaDescription.length} characters
              </p>
            </div>

            <div>
              <label htmlFor="serp-url" className="block text-sm font-medium text-gray-700">
                Page URL
              </label>

              <input
                id="serp-url"
                value={pageUrl}
                onChange={(event) => {
                  setPageUrl(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder={sampleUrl}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            <div>
              <label htmlFor="serp-site-name" className="block text-sm font-medium text-gray-700">
                Site Name
              </label>

              <input
                id="serp-site-name"
                value={siteName}
                onChange={(event) => {
                  setSiteName(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder={sampleSiteName}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            {showKeywordHints && (
              <div>
                <label htmlFor="serp-keyword" className="block text-sm font-medium text-gray-700">
                  Target Keyword
                </label>

                <input
                  id="serp-keyword"
                  value={targetKeyword}
                  onChange={(event) => {
                    setTargetKeyword(event.target.value);
                    setResult(null);
                    setOutput("");
                    setError("");
                    setCopied(false);
                  }}
                  placeholder="JSON formatter"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />
              </div>
            )}

            {showDate && (
              <div>
                <label htmlFor="serp-date" className="block text-sm font-medium text-gray-700">
                  Snippet Date
                </label>

                <input
                  id="serp-date"
                  value={snippetDate}
                  onChange={(event) => {
                    setSnippetDate(event.target.value);
                    setResult(null);
                    setOutput("");
                    setError("");
                    setCopied(false);
                  }}
                  placeholder="Jun 1, 2026"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Live SERP Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            A Google-style preview. Real search results can change based on query,
            device, and Google rewriting.
          </p>

          <div className={`mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${deviceMode === "mobile" ? "max-w-[390px]" : "max-w-[680px]"}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                {liveSite.slice(0, 1).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm text-gray-900">
                  {liveSite}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {formatDisplayUrl(liveUrl, resultStyle)}
                </p>
              </div>
            </div>

            <h4 className="mt-3 text-xl leading-snug text-blue-700">
              {truncateText(liveTitle, deviceMode === "desktop" ? 62 : 56)}
            </h4>

            {resultStyle === "breadcrumb" && (
              <p className="mt-1 text-sm text-green-700">
                {buildBreadcrumb(liveUrl)}
              </p>
            )}

            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {showDate && (
                <span className="text-gray-500">
                  {snippetDate.trim() || "Jun 1, 2026"} —{" "}
                </span>
              )}
              {truncateText(liveDescription, deviceMode === "desktop" ? 158 : 132)}
            </p>

            {resultStyle === "rich" && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded-full bg-gray-100 px-2 py-1">
                  Illustrative enhancement
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1">
                  Eligibility not checked
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              Editorial length guide
            </p>

            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              These ranges are drafting prompts only; Google truncates to the available display width and publishes no fixed character limit.
            </p>

            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between gap-3">
                <span>Title</span>
                <span className={getLengthClass(pageTitle.length, 35, 60)}>
                  {pageTitle.length || 0} chars
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Description</span>
                <span className={getLengthClass(metaDescription.length, 90, 160)}>
                  {metaDescription.length || 0} chars
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Device Preview"
            value={deviceMode}
            onChange={(value) => {
              setDeviceMode(value as DeviceMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Desktop", value: "desktop" },
              { label: "Mobile", value: "mobile" },
            ]}
          />

          <YoryantraSelect
            label="Result Style"
            value={resultStyle}
            onChange={(value) => {
              setResultStyle(value as ResultStyle);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Standard result", value: "standard" },
              { label: "Breadcrumb result", value: "breadcrumb" },
              { label: "Illustrative enhanced result", value: "rich" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "HTML tags", value: "html" },
            ]}
          />
<label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={showDate}
              onChange={(event) => {
                setShowDate(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Show date in snippet preview
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={showKeywordHints}
              onChange={(event) => {
                setShowKeywordHints(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Check target keyword in title and description
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={includeBrandCheck}
              onChange={(event) => {
                setIncludeBrandCheck(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Check whether title includes site or brand name
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Google can rewrite titles and descriptions. This preview helps you
          write better metadata, but it cannot guarantee exact SERP display.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={previewSnippet} className="yoryantra-btn shrink-0 whitespace-nowrap">
          Analyze Snippet
        </button>

        <button onClick={copyOutput} className="yoryantra-btn shrink-0 whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline shrink-0 whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline shrink-0 whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Review score" value={`${result.score}/100`} />
          <SummaryCard label="Title" value={`${result.titleLength} chars`} />
          <SummaryCard label="Description" value={`${result.descriptionLength} chars`} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && (
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          Review score is a local editorial heuristic. It is not a Google quality score, ranking signal, or prediction of the final search result.
        </p>
      )}

      {result && result.issues.some((issue) => issue.severity === "high") && (
        <SnippetFindingGroup title="Missing metadata" issues={result.issues.filter((issue) => issue.severity === "high")} tone="error" />
      )}

      {result && result.issues.some((issue) => issue.severity === "warning") && (
        <SnippetFindingGroup title="Snippet cautions" issues={result.issues.filter((issue) => issue.severity === "warning")} tone="warning" />
      )}

      {result && result.issues.some((issue) => issue.severity === "info") && (
        <SnippetFindingGroup title="Editorial review notes" issues={result.issues.filter((issue) => issue.severity === "info")} tone="info" />
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            SERP preview notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-gray-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline shrink-0 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "SERP snippet analysis output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Preview generation runs in this page. The code does not send the title, description, URL, or keyword to a snippet-analysis API.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A search preview is a drafting aid, not a Google emulator</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google creates title links and snippets automatically from several page and link signals. The title element and meta description are important inputs, but the final result can use different text for a particular query. The preview therefore helps judge clarity and likely truncation without pretending to reproduce Google's rendering exactly.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-xl font-semibold text-amber-950">Character counts are editorial guides</h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-900">
              Google documents no fixed character limit for title elements or meta descriptions. Search results are truncated as needed, typically to fit device width. The ranges shown above are review prompts, not ranking rules or guaranteed pixel limits.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Meta descriptions can be replaced</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Google primarily builds snippets from page content and may use the meta description when it better summarizes the page for the search. One page can therefore show different descriptions for different queries.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Review the message before the measurement</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the title, description, preferred page URL, and site name.</li>
            <li>Read the preview as a searcher's first impression: what page is this, and why would it answer the query?</li>
            <li>Use the character ranges only to spot unusually sparse or verbose copy.</li>
            <li>Check that important terms appear naturally; do not force exact-match repetition into both fields.</li>
            <li>Compare the metadata with the visible heading and page content so Google's alternative title or snippet sources tell the same story.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why the displayed title can differ from the title element</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google can form a title link from the title element, the main visual title, headings, og:title, prominent text, anchor text, links pointing to the page, and WebSite structured data. Rewriting is therefore not necessarily a truncation problem. Conflicting or boilerplate signals can be the more important issue.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google's <a href="https://developers.google.com/search/docs/appearance/title-link" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">title-link guidance</a> and <a href="https://developers.google.com/search/docs/appearance/snippet" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">snippet guidance</a> are the authoritative references for these behaviors.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What this preview deliberately does not claim</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-semibold text-gray-900">Approximation shown here</h3><p className="mt-2 text-sm leading-relaxed text-gray-600">Relative title and description length, visible wording, URL shape, optional keyword presence, and a compact desktop/mobile-style layout.</p></div>
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-semibold text-amber-950">Controlled by search systems</h3><p className="mt-2 text-sm leading-relaxed text-amber-900">Exact truncation width, rewritten title text, query-specific snippets, dates, sitelinks, rich-result eligibility, favicon/site-name presentation, and other result features.</p></div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Questions that matter when a snippet looks wrong</h2>
          <div className="mt-5 space-y-6">
            <div><h3 className="font-semibold text-gray-900">Is a 61-character title automatically too long?</h3><p className="mt-2 text-gray-600 leading-relaxed">No. Google does not publish a fixed title-character limit. Concision and relevance matter more than crossing a single character threshold.</p></div>
            <div><h3 className="font-semibold text-gray-900">Will Google always show the meta description?</h3><p className="mt-2 text-gray-600 leading-relaxed">No. Google often creates query-specific snippets from page content and may use the meta description when it is a better summary.</p></div>
            <div><h3 className="font-semibold text-gray-900">Should the target keyword appear in both fields?</h3><p className="mt-2 text-gray-600 leading-relaxed">Only when it reads naturally and accurately describes the page. The keyword check is an editorial hint, not a requirement or scoring factor.</p></div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/meta-tag-generator" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Meta Tag Generator</Link>
            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Meta Tags Checker</Link>
            <Link href="/tools/open-graph-preview-checker" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Open Graph Preview Checker</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Canonical URL Checker</Link>
            <Link href="/tools/structured-data-validator" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Structured Data Validator</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SnippetFindingGroup({
  title,
  issues,
  tone,
}: {
  title: string;
  issues: SnippetIssue[];
  tone: "error" | "warning" | "info";
}) {
  const classes = tone === "error"
    ? "border-red-200 bg-red-50 text-red-800"
    : tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-gray-200 bg-gray-50 text-gray-700";
  const shownIssues = issues.slice(0, 20);
  const hiddenCount = Math.max(0, issues.length - shownIssues.length);
  return (
    <div role={tone === "error" ? "alert" : undefined} className={`mt-6 rounded-xl border p-4 ${classes}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-3">
        {shownIssues.map((issue, index) => <div key={`${issue.title}-${index}`}><p className="text-sm font-semibold">{issue.title}</p><p className="mt-1 text-sm leading-relaxed">{issue.message}</p></div>)}
      </div>
      {hiddenCount > 0 && <p className="mt-3 text-xs leading-relaxed opacity-80">{hiddenCount.toLocaleString()} more finding{hiddenCount === 1 ? "" : "s"} are included in the copied report.</p>}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function buildSnippetPreview({
  pageTitle,
  metaDescription,
  pageUrl,
  siteName,
  deviceMode,
  resultStyle,
  outputMode,
  showDate,
  snippetDate,
  showKeywordHints,
  targetKeyword,
  includeBrandCheck,
}: {
  pageTitle: string;
  metaDescription: string;
  pageUrl: string;
  siteName: string;
  deviceMode: DeviceMode;
  resultStyle: ResultStyle;
  outputMode: OutputMode;
  showDate: boolean;
  snippetDate: string;
  showKeywordHints: boolean;
  targetKeyword: string;
  includeBrandCheck: boolean;
}): SnippetResult {
  const cleanTitle = pageTitle.trim();
  const cleanDescription = metaDescription.trim();
  const cleanUrl = normalizeUrl(pageUrl.trim());
  const cleanSiteName = siteName.trim() || getHostName(cleanUrl) || "";
  const titleLength = cleanTitle.length;
  const descriptionLength = cleanDescription.length;
  const titleStatus = getTitleStatus(titleLength);
  const descriptionStatus = getDescriptionStatus(descriptionLength);
  const titleLimit = deviceMode === "desktop" ? 62 : 56;
  const descriptionLimit = deviceMode === "desktop" ? 158 : 132;
  const titlePreview = truncateText(cleanTitle || "Untitled page", titleLimit);
  const descriptionPreview = truncateText(
    cleanDescription || "No meta description entered.",
    descriptionLimit
  );
  const displayUrl = formatDisplayUrl(cleanUrl, resultStyle);
  const breadcrumb = buildBreadcrumb(cleanUrl);
  const issues = getSnippetIssues({
    title: cleanTitle,
    description: cleanDescription,
    url: cleanUrl,
    siteName: cleanSiteName,
    titleStatus,
    descriptionStatus,
    showKeywordHints,
    targetKeyword,
    includeBrandCheck,
  });
  const score = calculateScore(issues);
  const base: Omit<SnippetResult, "output"> = {
    title: cleanTitle,
    description: cleanDescription,
    url: cleanUrl,
    displayUrl,
    siteName: cleanSiteName,
    breadcrumb,
    titleLength,
    descriptionLength,
    titleStatus,
    descriptionStatus,
    titlePreview,
    descriptionPreview,
    issues,
    score,
  };
  const output = formatSnippetOutput(base, {
    outputMode,
    showDate,
    snippetDate,
  });

  return {
    ...base,
    output,
  };
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidHttpUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function getTitleStatus(length: number): LengthStatus {
  if (length === 0) {
    return "empty";
  }

  if (length < 35) {
    return "short";
  }

  if (length > 60) {
    return "long";
  }

  return "good";
}

function getDescriptionStatus(length: number): LengthStatus {
  if (length === 0) {
    return "empty";
  }

  if (length < 90) {
    return "short";
  }

  if (length > 160) {
    return "long";
  }

  return "good";
}

function getSnippetIssues({
  title,
  description,
  url,
  siteName,
  titleStatus,
  descriptionStatus,
  showKeywordHints,
  targetKeyword,
  includeBrandCheck,
}: {
  title: string;
  description: string;
  url: string;
  siteName: string;
  titleStatus: LengthStatus;
  descriptionStatus: LengthStatus;
  showKeywordHints: boolean;
  targetKeyword: string;
  includeBrandCheck: boolean;
}) {
  const issues: SnippetIssue[] = [];
  const keyword = targetKeyword.trim().toLowerCase();

  if (titleStatus === "empty") {
    issues.push({
      severity: "high",
      title: "Missing page title",
      message: "The page title is empty. Add a concise title that identifies the page before judging a search preview.",
    });
  }

  if (titleStatus === "short") {
    issues.push({
      severity: "info",
      title: "Title may be short",
      message: "The title is below the selected editorial review range. Short titles can still be correct when they describe the page clearly.",
    });
  }

  if (titleStatus === "long") {
    issues.push({
      severity: "warning",
      title: "Title may be truncated",
      message: "The title is above the selected editorial review range. Google has no fixed character limit and truncates title links as needed for the display width.",
    });
  }

  if (descriptionStatus === "empty") {
    issues.push({
      severity: "warning",
      title: "Missing meta description",
      message: "Search engines may choose page text when no meta description is provided.",
    });
  }

  if (descriptionStatus === "short") {
    issues.push({
      severity: "info",
      title: "Description may be short",
      message: "The description is below the selected editorial review range. A short description can still be complete and accurate.",
    });
  }

  if (descriptionStatus === "long") {
    issues.push({
      severity: "warning",
      title: "Description may be truncated",
      message: "The description is above the selected editorial review range. Google has no fixed meta-description character limit and truncates snippets as needed.",
    });
  }

  if (showKeywordHints && keyword) {
    if (!title.toLowerCase().includes(keyword)) {
      issues.push({
        severity: "info",
        title: "Keyword not found in title",
        message: "The target keyword was not found in the page title.",
      });
    }

    if (!description.toLowerCase().includes(keyword)) {
      issues.push({
        severity: "info",
        title: "Keyword not found in description",
        message: "The target keyword was not found in the meta description.",
      });
    }
  }

  if (includeBrandCheck && siteName && title && !title.toLowerCase().includes(siteName.toLowerCase())) {
    issues.push({
      severity: "info",
      title: "Brand or site name not in title",
      message: "The site name is not present in the title. Branding can help recognition when it reads naturally, but it is not required on every title element.",
    });
  }

  if (url && !isValidHttpUrl(url)) {
    issues.push({
      severity: "high",
      title: "Invalid page URL",
      message: "Enter a valid http:// or https:// URL if you want the preview to evaluate the displayed host and path.",
    });
  } else if (url && /^http:\/\//i.test(url)) {
    issues.push({
      severity: "info",
      title: "HTTP URL entered",
      message: "Verify that HTTP is intentional and consistent with the page you want indexed; the preview does not test redirects or canonicalization.",
    });
  }

  return issues;
}

function calculateScore(issues: SnippetIssue[]) {
  let score = 100;

  issues.forEach((issue) => {
    if (issue.severity === "high") {
      score -= 30;
    } else if (issue.severity === "warning") {
      score -= 15;
    }
    // Informational editorial notes do not reduce the heuristic score.

  });

  return Math.max(0, score);
}

function formatSnippetOutput(
  result: Omit<SnippetResult, "output">,
  options: {
    outputMode: OutputMode;
    showDate: boolean;
    snippetDate: string;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.outputMode === "html") {
    return [
      `<title>${escapeHtml(result.title)}</title>`,
      `<meta name="description" content="${escapeHtml(result.description)}">`,
    ].join("\n");
  }

  if (options.outputMode === "report") {
    const issues =
      result.issues.length === 0
        ? ["- No common snippet issues found."]
        : result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`);

    return [
      "SERP Snippet Report",
      "-------------------",
      `Review score (heuristic): ${result.score}/100`,
      `Title length: ${result.titleLength}`,
      `Description length: ${result.descriptionLength}`,
      `URL: ${result.url}`,
      `Site name: ${result.siteName || "(missing)"}`,
      `Display URL: ${result.displayUrl}`,
      options.showDate ? `Date shown: ${options.snippetDate || "(sample date)"}` : "",
      "",
      "Preview:",
      result.titlePreview,
      result.descriptionPreview,
      "",
      "Findings:",
      ...issues,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "SERP Snippet Summary",
    "--------------------",
    `Review score (heuristic): ${result.score}/100`,
    `Title: ${result.titleLength} characters (${result.titleStatus})`,
    `Description: ${result.descriptionLength} characters (${result.descriptionStatus})`,
    `Display URL: ${result.displayUrl}`,
    `Findings: ${result.issues.length}`,
  ].join("\n");
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).replace(/\s+$/, "")}…`;
}

function getHostName(url: string) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function formatDisplayUrl(url: string, style: ResultStyle) {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/$/, "");

    if (style === "breadcrumb") {
      return `${host}${path ? path.replace(/\//g, " › ") : ""}`;
    }

    return `${host}${path || ""}`;
  } catch {
    return url || "example.com/page";
  }
}

function buildBreadcrumb(url: string) {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.replace(/^www\./, "");
    const parts = parsed.pathname.split("/").filter(Boolean);

    return [host, ...parts].join(" › ");
  } catch {
    return "example.com › page";
  }
}

function getLengthClass(value: number, min: number, max: number) {
  if (value === 0) {
    return "font-semibold text-gray-500";
  }

  if (value < min) {
    return "font-semibold text-amber-700";
  }

  if (value > max) {
    return "font-semibold text-amber-700";
  }

  return "font-semibold text-green-700";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getSnippetNotes(result: SnippetResult): SnippetNote[] {
  const notes: SnippetNote[] = [];

  if (result.titleStatus === "long" || result.descriptionStatus === "long") {
    notes.push({
      title: "Possible truncation",
      message:
        "The title or description may be shortened in search results. Consider making it clearer and more focused.",
    });
  }

  if (result.issues.some((issue) => issue.severity === "high")) {
    notes.push({
      title: "Important snippet issue",
      message:
        "One or more important issues were found. Fix missing or unclear metadata before publishing.",
    });
  }

  notes.push({
    title: "Preview is approximate",
    message:
      "Search engines can rewrite titles and snippets depending on the query and page content.",
  });

  return notes;
}
