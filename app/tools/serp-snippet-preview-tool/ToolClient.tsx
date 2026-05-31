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

const sampleTitle = "JSON Formatter Online | Format and Validate JSON | Yoryantra";
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

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
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
      description="Preview how page titles, meta descriptions, URLs, site names, and search snippets may appear in Google-style results. Check title length, description length, truncation, and SEO snippet issues."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Snippet Details
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Page Title
              </label>

              <input
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
              <label className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>

              <textarea
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
              <label className="block text-sm font-medium text-gray-700">
                Page URL
              </label>

              <input
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
              <label className="block text-sm font-medium text-gray-700">
                Site Name
              </label>

              <input
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
                <label className="block text-sm font-medium text-gray-700">
                  Target Keyword
                </label>

                <input
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
                <label className="block text-sm font-medium text-gray-700">
                  Snippet Date
                </label>

                <input
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
                  Rating preview
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1">
                  Extra links may appear
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              Quick length guide
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
              { label: "Rich-style preview", value: "rich" },
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
        <button onClick={previewSnippet} className="yoryantra-btn">
          Analyze Snippet
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
          <SummaryCard label="Score" value={`${result.score}/100`} />
          <SummaryCard label="Title" value={`${result.titleLength} chars`} />
          <SummaryCard label="Description" value={`${result.descriptionLength} chars`} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Snippet findings
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {issue.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {issue.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            SERP preview notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
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
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "SERP snippet analysis output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        SERP preview generation happens directly in your browser. Your title,
        description, and URL are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Previewing Search Result Snippets Before Publishing
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A page title and meta description are often the first things users
            see in search results. If the title is unclear, too long, too short,
            or the description does not explain the page well, fewer people may
            click even when the page ranks.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This SERP Snippet Preview Tool shows a Google-style search result
            preview and checks common SEO snippet issues such as title length,
            description length, missing keyword hints, weak URL display, and
            possible truncation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking a SERP Snippet
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the page title, meta description, URL, and site name.</li>
            <li>Choose desktop or mobile preview.</li>
            <li>Add a target keyword if you want keyword placement hints.</li>
            <li>Analyze the snippet and review length or clarity warnings.</li>
            <li>Copy the summary, report, JSON, or HTML tags.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common SERP Preview Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Previewing a title and description before publishing a page.</li>
            <li>Checking whether a title may be too long for search results.</li>
            <li>Improving meta descriptions for better click clarity.</li>
            <li>Comparing desktop and mobile snippet display.</li>
            <li>Reviewing SEO metadata during content updates.</li>
            <li>Generating clean title and description HTML tags.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Search Snippet
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Title: JSON Formatter Online | Format and Validate JSON | Yoryantra
Description: Format, validate, beautify, and inspect JSON directly in your browser.
URL: https://yoryantra.com/tools/json-formatter`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Google May Rewrite Snippets
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A preview is not a guarantee. Search engines may rewrite titles,
            choose different description text, add dates, show breadcrumbs, or
            display different snippets based on the search query.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use this tool to write better metadata and catch obvious issues. The
            final search result can still vary depending on Google, device,
            location, query, and page content.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a SERP snippet preview?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It is a preview of how a page title, URL, and meta description
                may appear in search engine results.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is a good title length?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                There is no fixed rule, but many SEO workflows keep titles around
                35 to 60 characters so they stay clear and less likely to be cut.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is a good meta description length?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Many descriptions are written around 90 to 160 characters, but
                clarity matters more than hitting an exact number.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does Google always use my meta description?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Google can choose a different snippet from the page if it
                thinks another section better matches the query.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I preview a snippet?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The preview is generated directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/meta-tag-generator" className="yoryantra-btn-outline">
              Meta Tag Generator
            </Link>

            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline">
              Meta Tags Checker
            </Link>

            <Link href="/tools/open-graph-preview-checker" className="yoryantra-btn-outline">
              Open Graph Preview Checker
            </Link>

            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline">
              Canonical URL Checker
            </Link>

            <Link href="/tools/structured-data-validator" className="yoryantra-btn-outline">
              Structured Data Validator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
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
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
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
      message: "A search result needs a clear page title.",
    });
  }

  if (titleStatus === "short") {
    issues.push({
      severity: "info",
      title: "Title may be short",
      message: "A short title can work, but it may miss useful context.",
    });
  }

  if (titleStatus === "long") {
    issues.push({
      severity: "warning",
      title: "Title may be truncated",
      message: "Long titles may be cut or rewritten in search results.",
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
      message: "A short description may not explain enough value to search users.",
    });
  }

  if (descriptionStatus === "long") {
    issues.push({
      severity: "warning",
      title: "Description may be truncated",
      message: "Long descriptions may be shortened in search results.",
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
      message: "Including the site or brand name can make the result easier to recognize.",
    });
  }

  if (url && !/^https:\/\//i.test(url)) {
    issues.push({
      severity: "warning",
      title: "URL is not HTTPS",
      message: "Search snippets usually look more trustworthy with HTTPS URLs.",
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
    } else {
      score -= 5;
    }
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
      `Score: ${result.score}/100`,
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
    `Score: ${result.score}/100`,
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

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
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
    return "font-semibold text-red-700";
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
