"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "cleanList" | "removedList" | "report" | "json" | "csv" | "markdown";
type SortMode = "original" | "alphabetical" | "hostPath" | "length";
type CaseMode = "keep" | "lowercaseHost" | "lowercasePath";

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
  "ref",
  "ref_src",
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
  const [removeEmptyParams, setRemoveEmptyParams] = useState(true);
  const [normalizeTrailingSlash, setNormalizeTrailingSlash] = useState(true);
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
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
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
    setRemoveEmptyParams(true);
    setNormalizeTrailingSlash(true);
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
    setRemoveEmptyParams(true);
    setNormalizeTrailingSlash(true);
    setDeduplicateUrls(true);
    setFlagCrawlWaste(true);
    setRemoveCrawlWaste(false);
    clearResult();
  };

  return (
    <ToolShell
      title="Crawl Budget URL Cleaner"
      description="Clean URL lists for technical SEO. Remove tracking parameters, fragments, duplicate variants, trailing slash differences, empty parameters, and crawl-waste URL patterns."
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
            Extra Crawl-Waste Patterns
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
            Optional. Enter URL fragments or path patterns to flag.
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
            label="Case"
            value={caseMode}
            onChange={(value) => {
              setCaseMode(value as CaseMode);
              clearResult();
            }}
            options={[
              { label: "Lowercase host only", value: "lowercaseHost" },
              { label: "Lowercase host and path", value: "lowercasePath" },
              { label: "Keep original case", value: "keep" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={removeTrackingParams} label="Remove common tracking parameters" onChange={(checked) => { setRemoveTrackingParams(checked); clearResult(); }} />
            <CheckboxRow checked={removeFragments} label="Remove URL fragments after #" onChange={(checked) => { setRemoveFragments(checked); clearResult(); }} />
            <CheckboxRow checked={removeEmptyParams} label="Remove empty query parameters" onChange={(checked) => { setRemoveEmptyParams(checked); clearResult(); }} />
            <CheckboxRow checked={normalizeTrailingSlash} label="Normalize trailing slash variants" onChange={(checked) => { setNormalizeTrailingSlash(checked); clearResult(); }} />
            <CheckboxRow checked={deduplicateUrls} label="Remove duplicate cleaned URLs" onChange={(checked) => { setDeduplicateUrls(checked); clearResult(); }} />
            <CheckboxRow checked={flagCrawlWaste} label="Flag common crawl-waste patterns" onChange={(checked) => { setFlagCrawlWaste(checked); clearResult(); }} />
            <CheckboxRow checked={removeCrawlWaste} label="Remove flagged crawl-waste URLs from clean output" onChange={(checked) => { setRemoveCrawlWaste(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Use this for URL list cleanup before crawl audits, sitemap reviews, log file checks, and Search Console analysis.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={cleanUrls} className="yoryantra-btn">
          Clean URL List
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
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Cleanup findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Crawl cleanup guidance</h3>

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
          {output || "Cleaned URL output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool cleans pasted URL lists only. Always review removed URLs before changing robots rules, canonicals, redirects, or sitemap entries.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Cleaning URL Lists for Crawl Budget Reviews</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Large sites often collect messy URL variants from crawls, logs, sitemaps, analytics, and Search Console exports. Tracking parameters, fragments, duplicate slashes, session IDs, filters, and repeated variants can make SEO audits harder to read.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Crawl Budget URL Cleaner normalizes URL lists so you can focus on useful indexable URLs and spot patterns that may waste crawl attention.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Crawl Budget URL Cleaner</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste one URL per line from a crawl, sitemap, log, or Search Console export.</li>
            <li>Add custom parameters or URL patterns if your site uses them.</li>
            <li>Choose how URLs should be normalized, deduplicated, and sorted.</li>
            <li>Review changed, duplicate, removed, and invalid URLs.</li>
            <li>Copy the cleaned list, removed list, report, JSON, CSV, or Markdown output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Crawl-Waste URL Patterns</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>URLs with campaign parameters such as utm_source or fbclid.</li>
            <li>Session IDs and empty query parameters.</li>
            <li>Fragment-only variants that point to the same page content.</li>
            <li>Search, cart, login, account, and checkout pages in crawl exports.</li>
            <li>Trailing slash and case variants that create duplicate-looking URLs.</li>
            <li>Sorting, filtering, and faceted navigation parameters.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Cleanup</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Before:
https://example.com/page?utm_source=email#section

After:
https://example.com/page`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Clean Lists Are for Review, Not Blind Deletion</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A cleaned URL list is useful for analysis, but it should not be treated as an automatic delete list. Some URLs that look noisy may still be important for users, paid campaigns, tracking, or internal workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use the output to identify patterns, then decide whether to fix links, update canonicals, adjust sitemap entries, change robots rules, or leave URLs alone.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a Crawl Budget URL Cleaner do?">
              It normalizes and deduplicates URL lists so technical SEO audits are easier to review.
            </Faq>

            <Faq title="Does this tool crawl my website?">
              No. It only cleans the URLs you paste into the tool.
            </Faq>

            <Faq title="Should I remove every URL flagged as crawl waste?">
              No. Review the context first. Some flagged URLs may still be important for users or business workflows.
            </Faq>

            <Faq title="Can this clean sitemap exports?">
              Yes. Paste sitemap URLs or extracted sitemap output, then remove duplicates, fragments, tracking parameters, and noisy variants.
            </Faq>

            <Faq title="Is anything uploaded when I clean URLs?">
              No. The cleanup runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/sitemap-url-extractor" className="yoryantra-btn-outline">Sitemap URL Extractor</Link>
            <Link href="/tools/url-query-params-parser" className="yoryantra-btn-outline">URL Query Params Parser</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline">Canonical URL Checker</Link>
            <Link href="/tools/indexability-checker" className="yoryantra-btn-outline">Indexability Checker</Link>
            <Link href="/tools/robots-txt-tester" className="yoryantra-btn-outline">Robots.txt Tester</Link>
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
  const wastePatterns = [
    ...(options.flagCrawlWaste ? defaultWastePatterns : []),
    ...lines(options.customWastePatterns),
  ];
  const seen = new Set<string>();
  const rows = lines(options.input).map((line) => cleanOneUrl(line, {
    removeParams,
    wastePatterns,
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

  return {
    ...base,
    output,
  };
}

function cleanOneUrl(
  original: string,
  options: {
    removeParams: Set<string>;
    wastePatterns: string[];
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

    if (options.caseMode === "lowercaseHost" || options.caseMode === "lowercasePath") {
      const lowerHost = url.hostname.toLowerCase();
      if (url.hostname !== lowerHost) {
        reasons.push("lowercased host");
      }
      url.hostname = lowerHost;
    }

    if (options.caseMode === "lowercasePath") {
      const lowerPath = url.pathname.toLowerCase();
      if (url.pathname !== lowerPath) {
        reasons.push("lowercased path");
      }
      url.pathname = lowerPath;
    }

    if (options.removeFragments && url.hash) {
      url.hash = "";
      reasons.push("removed fragment");
    }

    Array.from(url.searchParams.keys()).forEach((key) => {
      const value = url.searchParams.get(key);

      if (options.removeParams.has(key.toLowerCase())) {
        url.searchParams.delete(key);
        reasons.push(`removed parameter: ${key}`);
      } else if (options.removeEmptyParams && (value === "" || value === null)) {
        url.searchParams.delete(key);
        reasons.push(`removed empty parameter: ${key}`);
      }
    });

    let cleaned = url.toString();

    if (options.normalizeTrailingSlash && cleaned.endsWith("/") && url.pathname !== "/") {
      cleaned = cleaned.slice(0, -1);
      reasons.push("normalized trailing slash");
    }

    const waste = options.wastePatterns.find((pattern) => pattern && cleaned.toLowerCase().includes(pattern.toLowerCase()));

    if (waste) {
      reasons.push(`crawl-waste pattern: ${waste}`);

      if (options.removeCrawlWaste) {
        return {
          original,
          cleaned,
          status: "removed",
          reasons,
        };
      }
    }

    if (options.deduplicateUrls && options.seen.has(cleaned)) {
      return {
        original,
        cleaned,
        status: "duplicate",
        reasons: [...reasons, "duplicate cleaned URL"],
      };
    }

    options.seen.add(cleaned);

    return {
      original,
      cleaned,
      status: reasons.length ? "changed" : "kept",
      reasons,
    };
  } catch {
    return {
      original,
      cleaned: "",
      status: "invalid",
      reasons: ["invalid URL"],
    };
  }
}

function sortRows(rows: UrlRow[], sortMode: SortMode) {
  const copy = [...rows];

  if (sortMode === "alphabetical") {
    return copy.sort((a, b) => a.cleaned.localeCompare(b.cleaned));
  }

  if (sortMode === "length") {
    return copy.sort((a, b) => a.cleaned.length - b.cleaned.length);
  }

  if (sortMode === "hostPath") {
    return copy.sort((a, b) => {
      const aKey = hostPathKey(a.cleaned);
      const bKey = hostPathKey(b.cleaned);
      return aKey.localeCompare(bKey);
    });
  }

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
  const waste = rows.filter((row) => row.reasons.some((reason) => reason.startsWith("crawl-waste pattern"))).length;

  if (duplicates > 0) {
    issues.push({
      severity: "warning",
      title: "Duplicate URL variants found",
      message: `${duplicates} URL${duplicates === 1 ? "" : "s"} collapsed into existing cleaned URLs.`,
    });
  }

  if (invalid > 0) {
    issues.push({
      severity: "warning",
      title: "Invalid URLs found",
      message: `${invalid} line${invalid === 1 ? "" : "s"} could not be parsed as valid absolute URLs.`,
    });
  }

  if (changed > 0) {
    issues.push({
      severity: "info",
      title: "URLs normalized",
      message: `${changed} URL${changed === 1 ? "" : "s"} changed after cleanup rules were applied.`,
    });
  }

  if (waste > 0) {
    issues.push({
      severity: "info",
      title: "Crawl-waste patterns flagged",
      message: `${waste} URL${waste === 1 ? "" : "s"} matched common or custom crawl-waste patterns.`,
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "URL list already looks clean",
      message: "No common duplicates, invalid URLs, tracking parameters, or crawl-waste patterns were found.",
    });
  }

  return issues;
}

function formatOutput(result: Omit<Result, "output">, mode: OutputMode) {
  if (mode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (mode === "csv") {
    const rows = [
      ["original", "cleaned", "status", "reasons"],
      ...result.rows.map((row) => [row.original, row.cleaned, row.status, row.reasons.join("; ")]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Original | Cleaned | Status | Reasons |",
      "| --- | --- | --- | --- |",
      ...result.rows.map((row) =>
        `| ${escapeMarkdown(row.original)} | ${escapeMarkdown(row.cleaned || "-")} | ${row.status} | ${escapeMarkdown(row.reasons.join(", ") || "-")} |`
      ),
    ].join("\n");
  }

  if (mode === "removedList") {
    return result.removed.map((row) => row.original).join("\n");
  }

  if (mode === "report") {
    return [
      "Crawl Budget URL Cleanup Report",
      "-------------------------------",
      `Input URLs: ${result.totalInput}`,
      `Kept URLs: ${result.keptCount}`,
      `Changed URLs: ${result.changedCount}`,
      `Duplicate URLs: ${result.duplicateCount}`,
      `Removed URLs: ${result.removedCount}`,
      `Invalid URLs: ${result.invalidCount}`,
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
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.duplicateCount > 0) {
    notes.push({
      title: "Review duplicate patterns",
      message: "Duplicates often point to tracking parameters, trailing slash variants, fragments, or inconsistent internal links.",
    });
  }

  if (result.removedCount > 0) {
    notes.push({
      title: "Check removed URLs before acting",
      message: "Do not block or redirect removed URLs blindly. Review whether they matter for users, analytics, or business flows.",
    });
  }

  if (result.keptCount > 0) {
    notes.push({
      title: "Use clean lists for audits",
      message: "Cleaned URL lists are useful for sitemap review, crawl exports, internal link cleanup, and log analysis.",
    });
  }

  return notes;
}
