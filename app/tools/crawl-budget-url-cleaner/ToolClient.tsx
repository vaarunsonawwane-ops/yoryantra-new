"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "cleanList" | "removedList" | "report" | "json" | "csv" | "markdown";
type SortMode = "original" | "alphabetical" | "hostPath" | "length";
type CaseMode = "lowercaseHost" | "lowercasePath";

type UrlRow = {
  original: string;
  cleaned: string;
  status: "kept" | "duplicate" | "removed" | "changed" | "invalid";
  reasons: string[];
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  rows: UrlRow[];
  kept: UrlRow[];
  removed: UrlRow[];
  issues: Issue[];
  output: string;
  totalInput: number;
  keptCount: number;
  changedCount: number;
  duplicateCount: number;
  removedCount: number;
  invalidCount: number;
};

const sampleUrls = `https://example.com/tools/title-tag-length-checker?utm_source=newsletter&utm_medium=email
https://example.com/tools/title-tag-length-checker/
https://example.com/tools/title-tag-length-checker#pricing
https://example.com/search?q=tools&page=1
https://example.com/products?sort=price&color=blue
https://example.com/login
https://example.com/cart
https://EXAMPLE.com/Tools/SEO-Slug-Analyzer?fbclid=abc123
not-a-valid-url`;

const defaultTrackingParams = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "igshid",
  "dclid",
  "_gl",
];

const defaultWastePatterns = [
  "/login",
  "/cart",
  "/checkout",
  "/account",
  "/search",
  "/wp-admin",
  "/admin",
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [customRemoveParams, setCustomRemoveParams] = useState("");
  const [customWastePatterns, setCustomWastePatterns] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("cleanList");
  const [sortMode, setSortMode] = useState<SortMode>("original");
  const [caseMode, setCaseMode] = useState<CaseMode>("lowercaseHost");
  const [removeTrackingParams, setRemoveTrackingParams] = useState(true);
  const [removeFragments, setRemoveFragments] = useState(true);
  const [removeEmptyParams, setRemoveEmptyParams] = useState(false);
  const [normalizeTrailingSlash, setNormalizeTrailingSlash] = useState(false);
  const [deduplicateUrls, setDeduplicateUrls] = useState(true);
  const [flagCrawlWaste, setFlagCrawlWaste] = useState(true);
  const [removeCrawlWaste, setRemoveCrawlWaste] = useState(false);
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

  const cleanUrls = () => {
    if (!input.trim()) {
      setError("Please paste at least one URL.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = analyzeUrls({
        input,
        customRemoveParams,
        customWastePatterns,
        outputMode,
        sortMode,
        caseMode,
        removeTrackingParams,
        removeFragments,
        removeEmptyParams,
        normalizeTrailingSlash,
        deduplicateUrls,
        flagCrawlWaste,
        removeCrawlWaste,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to clean this URL list.");
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
    setInput(sampleUrls);
    setCustomRemoveParams("sessionid\nphpsessid");
    setCustomWastePatterns("/filter\n?sort=");
    setOutputMode("cleanList");
    setSortMode("original");
    setCaseMode("lowercaseHost");
    setRemoveTrackingParams(true);
    setRemoveFragments(true);
    setRemoveEmptyParams(false);
    setNormalizeTrailingSlash(false);
    setDeduplicateUrls(true);
    setFlagCrawlWaste(true);
    setRemoveCrawlWaste(false);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setCustomRemoveParams("");
    setCustomWastePatterns("");
    setOutputMode("cleanList");
    setSortMode("original");
    setCaseMode("lowercaseHost");
    setRemoveTrackingParams(true);
    setRemoveFragments(true);
    setRemoveEmptyParams(false);
    setNormalizeTrailingSlash(false);
    setDeduplicateUrls(true);
    setFlagCrawlWaste(true);
    setRemoveCrawlWaste(false);
    clearResult();
  };

  return (
    <ToolShell
      title="Crawl Budget URL Cleaner"
      description="Normalize crawl-export URLs without confusing tracking noise with real page variants."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          URL List
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleUrls}
          className="w-full min-h-[380px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste one URL per line from a crawl export, sitemap export, log sample, Search Console export, or manual audit list.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Extra Parameters to Remove
          </label>

          <textarea
            value={customRemoveParams}
            onChange={(event) => {
              setCustomRemoveParams(event.target.value);
              clearResult();
            }}
            placeholder={"sessionid\nphpsessid\nreplytocom"}
            className="w-full min-h-[150px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Optional. Enter one query parameter name per line.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Extra Review Patterns
          </label>

          <textarea
            value={customWastePatterns}
            onChange={(event) => {
              setCustomWastePatterns(event.target.value);
              clearResult();
            }}
            placeholder={"/filter\n?sort=\n/internal"}
            className="w-full min-h-[150px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Optional. Enter path prefixes, query fragments, or other substrings that deserve manual review.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Clean URL list", value: "cleanList" },
              { label: "Removed URL list", value: "removedList" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "CSV", value: "csv" },
              { label: "Markdown table", value: "markdown" },
            ]}
          />

          <YoryantraSelect
            label="Sort"
            value={sortMode}
            onChange={(value) => {
              setSortMode(value as SortMode);
              clearResult();
            }}
            options={[
              { label: "Original order", value: "original" },
              { label: "Alphabetical", value: "alphabetical" },
              { label: "Host and path", value: "hostPath" },
              { label: "Shortest first", value: "length" },
            ]}
          />

          <YoryantraSelect
            label="Path Case"
            value={caseMode}
            onChange={(value) => {
              setCaseMode(value as CaseMode);
              clearResult();
            }}
            options={[
              { label: "Preserve path case", value: "lowercaseHost" },
              { label: "Lowercase path (only when safe)", value: "lowercasePath" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={removeTrackingParams} label="Remove common tracking parameters" onChange={(checked) => { setRemoveTrackingParams(checked); clearResult(); }} />
            <CheckboxRow checked={removeFragments} label="Remove URL fragments after #" onChange={(checked) => { setRemoveFragments(checked); clearResult(); }} />
            <CheckboxRow checked={removeEmptyParams} label="Remove empty query parameters" onChange={(checked) => { setRemoveEmptyParams(checked); clearResult(); }} />
            <CheckboxRow checked={normalizeTrailingSlash} label="Remove trailing slash from non-root paths" onChange={(checked) => { setNormalizeTrailingSlash(checked); clearResult(); }} />
            <CheckboxRow checked={deduplicateUrls} label="Remove duplicate cleaned URLs" onChange={(checked) => { setDeduplicateUrls(checked); clearResult(); }} />
            <CheckboxRow checked={flagCrawlWaste} label="Flag common low-priority or duplicate-prone patterns" onChange={(checked) => { setFlagCrawlWaste(checked); clearResult(); }} />
            <CheckboxRow checked={removeCrawlWaste} label="Exclude flagged review patterns from clean output" onChange={(checked) => { setRemoveCrawlWaste(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Hostnames are normalized by the browser URL parser. Path case and trailing slashes can be meaningful on some servers, so those changes stay conservative by default.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={cleanUrls} className="yoryantra-btn whitespace-nowrap">
          Clean URL List
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
          <SummaryCard label="Input URLs" value={result.totalInput.toLocaleString()} />
          <SummaryCard label="Kept" value={result.keptCount.toLocaleString()} />
          <SummaryCard label="Changed" value={result.changedCount.toLocaleString()} />
          <SummaryCard label="Removed" value={result.removedCount.toLocaleString()} />
        </div>
      )}

      {result && result.rows.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">URL Cleanup Review</h3>

          <p className="mt-2 text-sm text-gray-500">
            Original URLs, cleaned URLs, cleanup status, and reasons.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Original</th>
                  <th className="px-4 py-3 font-semibold">Cleaned</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Reasons</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.rows.slice(0, 150).map((row, index) => (
                  <tr key={`${row.original}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[300px] break-words">{row.original}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[300px] break-words">{row.cleaned || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.status}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="block max-w-[260px] break-words">{row.reasons.join(", ") || "-"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.rows.length > 150 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing first 150 rows. Copy JSON or CSV output for the full result.
            </p>
          )}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">What changed in this list</h3>
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
          {output || "Cleaned URL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        Treat excluded URLs as an audit queue, not a deletion list. A parameter, path case, or trailing slash can change the resource your server returns.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A cleaner export is not automatically a crawl-budget fix</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Crawl exports and log samples often contain campaign parameters, fragment variants, repeated URLs, and paths that deserve a closer look. Removing that noise can make an audit much easier to reason about, but the cleanup itself does not change how a crawler behaves on the live site.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google describes crawl-budget work as an advanced concern mainly for very large, rapidly changing sites or sites with a large number of discovered-but-not-indexed URLs. Smaller sites usually gain more from keeping sitemaps, internal links, redirects, canonicals, and server responses consistent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the switches actually change</h2>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cleanup</th>
                  <th className="px-4 py-3 font-semibold">Why it is usually reviewed</th>
                  <th className="px-4 py-3 font-semibold">Where to be careful</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                <tr><td className="px-4 py-3 font-medium text-gray-800">Tracking parameters</td><td className="px-4 py-3">Campaign identifiers can create many list variants of the same landing page.</td><td className="px-4 py-3">Only known names are removed automatically; custom parameters may affect content.</td></tr>
                <tr><td className="px-4 py-3 font-medium text-gray-800">Fragments</td><td className="px-4 py-3">The fragment is not sent in an HTTP request for the resource.</td><td className="px-4 py-3">Client-side applications can still attach meaning to fragments.</td></tr>
                <tr><td className="px-4 py-3 font-medium text-gray-800">Trailing slash</td><td className="px-4 py-3">Slash variants often appear as duplicate-looking URLs.</td><td className="px-4 py-3">Servers can treat <code>/page</code> and <code>/page/</code> differently, so removal is off by default.</td></tr>
                <tr><td className="px-4 py-3 font-medium text-gray-800">Path case</td><td className="px-4 py-3">Mixed-case paths can create inconsistent URL sets.</td><td className="px-4 py-3">Paths are case-sensitive in URL handling and may resolve to different resources.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where normalization can destroy meaning</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Query parameters are not inherently disposable. Filters, pagination, locale switches, product variants, signed URLs, and application state may all live in the query string. The built-in removal list is deliberately limited to familiar campaign identifiers, and custom names should be added only when you know they do not select different content.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The same caution applies to lowercasing paths and removing trailing slashes. Google notes that URLs are case-sensitive, and the browser URL parser may also normalize serialization details while parsing an absolute URL. Compare suspicious groups against the live server before changing routing rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A safer sequence after a crawl export</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Normalize the export conservatively and keep the original URL beside every cleaned value.</li>
            <li>Group duplicates and review-pattern matches instead of deleting them immediately.</li>
            <li>Check live status codes, redirects, canonical targets, robots rules, and internal links for representative URLs.</li>
            <li>Fix the source of unnecessary variants—templates, faceted navigation, campaign links, or routing—rather than only cleaning reports.</li>
            <li>Re-crawl or inspect server logs to confirm the live URL space actually became simpler.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fragments, parameters, and duplicate-looking URLs are different cases</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A fragment such as <code>#pricing</code> is a client-side identifier and is not part of the HTTP request target sent for the page. A query parameter such as <code>?color=blue</code>, however, is sent to the server and may select different content. Two strings that look similar in a spreadsheet therefore should not be assumed to be equivalent resources.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Faceted navigation deserves special attention because combinations of filters and sort parameters can generate very large URL spaces. Cleaning an export can expose that pattern, while the real fix belongs in crawlable linking, URL design, canonicalization, robots controls, or server behavior as appropriate for the site.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the cleaner never checks on the live site</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The cleanup logic runs in the browser and does not intentionally send the pasted URL list to Yoryantra for processing. It does not request the URLs, read robots.txt, inspect page content, or verify whether two normalized URLs really return the same resource.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References behind the cautions above</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google&apos;s current guidance is useful here: read its{' '}
            <a href="https://developers.google.com/crawling/docs/crawl-budget" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">crawl budget documentation</a>,{' '}
            <a href="https://developers.google.com/search/docs/crawling-indexing/url-structure" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">URL structure recommendations</a>, and{' '}
            <a href="https://developers.google.com/crawling/docs/faceted-navigation" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">faceted navigation guidance</a>. They explain why URL cleanup is most useful when it leads back to a specific crawl or routing problem on the live site.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/sitemap-url-extractor" className="yoryantra-btn-outline whitespace-nowrap">Sitemap URL Extractor</Link>
            <Link href="/tools/url-query-params-parser" className="yoryantra-btn-outline whitespace-nowrap">URL Query Params Parser</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline whitespace-nowrap">Canonical URL Checker</Link>
            <Link href="/tools/indexability-checker" className="yoryantra-btn-outline whitespace-nowrap">Indexability Checker</Link>
            <Link href="/tools/robots-txt-tester" className="yoryantra-btn-outline whitespace-nowrap">Robots.txt Tester</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
      />
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

function analyzeUrls(options: {
  input: string;
  customRemoveParams: string;
  customWastePatterns: string;
  outputMode: OutputMode;
  sortMode: SortMode;
  caseMode: CaseMode;
  removeTrackingParams: boolean;
  removeFragments: boolean;
  removeEmptyParams: boolean;
  normalizeTrailingSlash: boolean;
  deduplicateUrls: boolean;
  flagCrawlWaste: boolean;
  removeCrawlWaste: boolean;
}): Result {
  const removeParams = new Set([
    ...(options.removeTrackingParams ? defaultTrackingParams : []),
    ...lines(options.customRemoveParams),
  ].map((item) => item.toLowerCase()));
  const reviewPatterns = [
    ...(options.flagCrawlWaste ? defaultWastePatterns : []),
    ...lines(options.customWastePatterns),
  ];
  const seen = new Set<string>();
  const rows = lines(options.input).map((line) => cleanOneUrl(line, {
    removeParams,
    reviewPatterns,
    seen,
    caseMode: options.caseMode,
    removeFragments: options.removeFragments,
    removeEmptyParams: options.removeEmptyParams,
    normalizeTrailingSlash: options.normalizeTrailingSlash,
    deduplicateUrls: options.deduplicateUrls,
    removeCrawlWaste: options.removeCrawlWaste,
  }));
  const sortedRows = sortRows(rows, options.sortMode);
  const kept = sortedRows.filter((row) => row.status === "kept" || row.status === "changed");
  const removed = sortedRows.filter((row) => row.status === "removed" || row.status === "duplicate" || row.status === "invalid");
  const issues = buildIssues(sortedRows);
  const base = {
    rows: sortedRows,
    kept,
    removed,
    issues,
    totalInput: sortedRows.length,
    keptCount: kept.length,
    changedCount: sortedRows.filter((row) => row.status === "changed").length,
    duplicateCount: sortedRows.filter((row) => row.status === "duplicate").length,
    removedCount: sortedRows.filter((row) => row.status === "removed").length,
    invalidCount: sortedRows.filter((row) => row.status === "invalid").length,
  };
  const output = formatOutput(base, options.outputMode);

  return { ...base, output };
}

function cleanOneUrl(
  original: string,
  options: {
    removeParams: Set<string>;
    reviewPatterns: string[];
    seen: Set<string>;
    caseMode: CaseMode;
    removeFragments: boolean;
    removeEmptyParams: boolean;
    normalizeTrailingSlash: boolean;
    deduplicateUrls: boolean;
    removeCrawlWaste: boolean;
  }
): UrlRow {
  const reasons: string[] = [];

  try {
    const url = new URL(original);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { original, cleaned: "", status: "invalid", reasons: ["only HTTP(S) URLs are supported"] };
    }

    if (options.caseMode === "lowercasePath") {
      const lowerPath = url.pathname.toLowerCase();
      if (url.pathname !== lowerPath) reasons.push("lowercased path");
      url.pathname = lowerPath;
    }

    if (options.removeFragments && url.hash) {
      url.hash = "";
      reasons.push("removed fragment");
    }

    const nextParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (options.removeParams.has(key.toLowerCase())) {
        reasons.push(`removed parameter: ${key}`);
        return;
      }

      if (options.removeEmptyParams && value === "") {
        reasons.push(`removed empty parameter: ${key}`);
        return;
      }

      nextParams.append(key, value);
    });
    const nextQuery = nextParams.toString();
    url.search = nextQuery ? `?${nextQuery}` : "";

    if (options.normalizeTrailingSlash && url.pathname !== "/" && /\/$/.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/+$/, "") || "/";
      reasons.push("removed trailing slash");
    }

    const matchedPattern = options.reviewPatterns.find((pattern) => matchesReviewPattern(url, pattern));
    if (matchedPattern) {
      reasons.push(`review pattern: ${matchedPattern}`);
    }

    const cleaned = url.toString();

    if (matchedPattern && options.removeCrawlWaste) {
      return { original, cleaned, status: "removed", reasons };
    }

    if (options.deduplicateUrls && options.seen.has(cleaned)) {
      return { original, cleaned, status: "duplicate", reasons: [...reasons, "duplicate cleaned URL"] };
    }

    options.seen.add(cleaned);

    if (cleaned !== original && reasons.length === 0) {
      reasons.push("normalized by the URL parser");
    }

    return { original, cleaned, status: reasons.length ? "changed" : "kept", reasons };
  } catch {
    return { original, cleaned: "", status: "invalid", reasons: ["invalid absolute URL"] };
  }
}

function matchesReviewPattern(url: URL, pattern: string) {
  const normalized = pattern.trim().toLowerCase();
  if (!normalized) return false;

  if (normalized.startsWith("?")) {
    return url.search.toLowerCase().includes(normalized);
  }

  if (normalized.startsWith("/")) {
    const path = url.pathname.toLowerCase();
    const base = normalized.replace(/\/+$/, "") || "/";
    return path === base || path.startsWith(`${base}/`);
  }

  return url.toString().toLowerCase().includes(normalized);
}

function sortRows(rows: UrlRow[], sortMode: SortMode) {
  const copy = [...rows];
  if (sortMode === "alphabetical") return copy.sort((a, b) => a.cleaned.localeCompare(b.cleaned));
  if (sortMode === "length") return copy.sort((a, b) => a.cleaned.length - b.cleaned.length);
  if (sortMode === "hostPath") return copy.sort((a, b) => hostPathKey(a.cleaned).localeCompare(hostPathKey(b.cleaned)));
  return copy;
}

function hostPathKey(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}${url.search}`;
  } catch {
    return value;
  }
}

function buildIssues(rows: UrlRow[]) {
  const issues: Issue[] = [];
  const duplicates = rows.filter((row) => row.status === "duplicate").length;
  const invalid = rows.filter((row) => row.status === "invalid").length;
  const changed = rows.filter((row) => row.status === "changed").length;
  const excluded = rows.filter((row) => row.status === "removed").length;
  const reviewMatches = rows.filter((row) => row.reasons.some((reason) => reason.startsWith("review pattern:"))).length;

  if (invalid > 0) {
    issues.push({ severity: "high", title: "Unusable input lines", message: `${invalid} line${invalid === 1 ? "" : "s"} could not be treated as absolute HTTP(S) URLs.` });
  }
  if (duplicates > 0) {
    issues.push({ severity: "warning", title: "Duplicate normalized URLs", message: `${duplicates} URL${duplicates === 1 ? "" : "s"} collapsed onto a cleaned value already seen earlier in the list.` });
  }
  if (excluded > 0) {
    issues.push({ severity: "warning", title: "Review-pattern URLs excluded", message: `${excluded} URL${excluded === 1 ? "" : "s"} matched a review pattern and were left out because exclusion is enabled.` });
  } else if (reviewMatches > 0) {
    issues.push({ severity: "info", title: "Paths worth a closer look", message: `${reviewMatches} URL${reviewMatches === 1 ? "" : "s"} matched a built-in or custom review pattern but remain in the clean output.` });
  }
  if (changed > 0) {
    issues.push({ severity: "info", title: "Normalization changed URL strings", message: `${changed} URL${changed === 1 ? "" : "s"} changed after selected cleanup rules or browser URL serialization.` });
  }
  if (issues.length === 0) {
    issues.push({ severity: "info", title: "No selected cleanup rule changed the list", message: "The parsed HTTP(S) URLs remained distinct under the current settings." });
  }
  return issues;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode) {
  if (mode === "json") return JSON.stringify(result, null, 2);

  if (mode === "csv") {
    const rows = [["original", "cleaned", "status", "reasons"], ...result.rows.map((row) => [row.original, row.cleaned, row.status, row.reasons.join("; ")])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Original | Cleaned | Status | Reasons |",
      "| --- | --- | --- | --- |",
      ...result.rows.map((row) => `| ${escapeMarkdown(row.original)} | ${escapeMarkdown(row.cleaned || "-")} | ${row.status} | ${escapeMarkdown(row.reasons.join(", ") || "-")} |`),
    ].join("\n");
  }

  if (mode === "removedList") return result.removed.map((row) => row.original).join("\n");

  if (mode === "report") {
    return [
      "Crawl URL Cleanup Report",
      "------------------------",
      `Input URLs: ${result.totalInput}`,
      `Clean output URLs: ${result.keptCount}`,
      `Changed URLs: ${result.changedCount}`,
      `Duplicate URLs: ${result.duplicateCount}`,
      `Review-pattern exclusions: ${result.removedCount}`,
      `Invalid lines: ${result.invalidCount}`,
      "",
      "Findings:",
      ...result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
      "",
      "Clean URLs:",
      ...result.kept.map((row) => row.cleaned),
    ].join("\n");
  }

  return result.kept.map((row) => row.cleaned).join("\n");
}

function lines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.duplicateCount > 0) {
    notes.push({ title: "Trace the source of duplicate variants", message: "Look at internal links, faceted navigation, campaign links, redirects, and canonical signals for a representative sample." });
  }
  if (result.removedCount > 0) {
    notes.push({ title: "Verify exclusions against the live site", message: "A review-pattern match is only a string match. Confirm status, content, links, and business purpose before blocking, redirecting, or removing anything." });
  }
  if (result.keptCount > 0) {
    notes.push({ title: "Keep original and normalized values together", message: "The side-by-side table is safer than a clean list alone because it preserves exactly what was changed and why." });
  }
  return notes;
}
