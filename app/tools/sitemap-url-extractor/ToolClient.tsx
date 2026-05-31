"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "urls" | "csv" | "json" | "markdown" | "summary";
type SortMode = "original" | "urlAsc" | "urlDesc" | "lastmodDesc" | "lastmodAsc";
type FilterMode = "all" | "pages" | "images" | "sitemaps";

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  images: string[];
  type: "url" | "sitemap";
};

type ExtractionResult = {
  entries: SitemapEntry[];
  filteredEntries: SitemapEntry[];
  output: string;
  sitemapType: "urlset" | "sitemapindex" | "mixed" | "unknown";
  urlCount: number;
  sitemapCount: number;
  imageCount: number;
  warnings: string[];
};

type SitemapNote = {
  title: string;
  message: string;
};

const sampleSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://yoryantra.com/tools/json-formatter</loc>
    <lastmod>2026-05-31</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yoryantra.com/tools/security-headers-scanner</loc>
    <lastmod>2026-05-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>https://yoryantra.com/og/security-headers-scanner.png</image:loc>
    </image:image>
  </url>
  <url>
    <loc>https://yoryantra.com/tools/meta-robots-tag-generator</loc>
    <lastmod>2026-06-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("urls");
  const [sortMode, setSortMode] = useState<SortMode>("original");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [dedupeUrls, setDedupeUrls] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [decodeEntities, setDecodeEntities] = useState(true);
  const [onlyHttps, setOnlyHttps] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getSitemapNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const extractUrls = () => {
    if (!input.trim()) {
      setError("Please paste XML sitemap content.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = extractSitemapUrls(input, {
        outputMode,
        sortMode,
        filterMode,
        dedupeUrls,
        includeMetadata,
        includeImages,
        decodeEntities,
        onlyHttps,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to extract URLs from this sitemap.");
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleSitemap);
    setOutputMode("urls");
    setSortMode("original");
    setFilterMode("all");
    setDedupeUrls(true);
    setIncludeMetadata(true);
    setIncludeImages(false);
    setDecodeEntities(true);
    setOnlyHttps(false);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("urls");
    setSortMode("original");
    setFilterMode("all");
    setDedupeUrls(true);
    setIncludeMetadata(true);
    setIncludeImages(false);
    setDecodeEntities(true);
    setOnlyHttps(false);
    clearResult();
  };

  return (
    <ToolShell
      title="Sitemap URL Extractor"
      description="Extract URLs from XML sitemaps and sitemap indexes. Parse loc, lastmod, changefreq, priority, image URLs, and export clean URL lists directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">XML Sitemap</label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleSitemap}
          className="w-full min-h-[380px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm text-gray-500">
          Paste a sitemap.xml file, sitemap index, image sitemap, or copied XML response from your browser, crawler, or Search Console workflow.
        </p>
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
              { label: "URL list", value: "urls" },
              { label: "CSV", value: "csv" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
              { label: "Summary", value: "summary" },
            ]}
          />

          <YoryantraSelect
            label="Filter"
            value={filterMode}
            onChange={(value) => {
              setFilterMode(value as FilterMode);
              clearResult();
            }}
            options={[
              { label: "All entries", value: "all" },
              { label: "Page URLs only", value: "pages" },
              { label: "Image URLs only", value: "images" },
              { label: "Sitemap URLs only", value: "sitemaps" },
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
              { label: "URL A-Z", value: "urlAsc" },
              { label: "URL Z-A", value: "urlDesc" },
              { label: "Last modified newest", value: "lastmodDesc" },
              { label: "Last modified oldest", value: "lastmodAsc" },
            ]}
          />

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">Supported sitemap data</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Extracts loc, lastmod, changefreq, priority, sitemap index entries, and optional image loc values.
            </p>
          </div>

          <CheckboxRow label="Remove duplicate URLs" checked={dedupeUrls} onChange={setDedupeUrls} clear={clearResult} />
          <CheckboxRow label="Include lastmod, changefreq, and priority in structured outputs" checked={includeMetadata} onChange={setIncludeMetadata} clear={clearResult} />
          <CheckboxRow label="Include image URLs in page URL output" checked={includeImages} onChange={setIncludeImages} clear={clearResult} />
          <CheckboxRow label="Decode XML entities" checked={decodeEntities} onChange={setDecodeEntities} clear={clearResult} />
          <CheckboxRow label="Keep HTTPS URLs only" checked={onlyHttps} onChange={setOnlyHttps} clear={clearResult} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This tool parses pasted XML only. It does not crawl linked child sitemaps automatically.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={extractUrls} className="yoryantra-btn">Extract URLs</button>
        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Page URLs" value={result.urlCount.toLocaleString()} />
          <SummaryCard label="Sitemaps" value={result.sitemapCount.toLocaleString()} />
          <SummaryCard label="Image URLs" value={result.imageCount.toLocaleString()} />
          <SummaryCard label="Warnings" value={result.warnings.length.toLocaleString()} />
        </div>
      )}

      {result && result.filteredEntries.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Extracted URLs</h3>
          <p className="mt-2 text-sm text-gray-500">Preview of URLs and sitemap metadata found in the pasted XML.</p>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">URL</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Lastmod</th>
                  <th className="px-4 py-3 font-semibold">Changefreq</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Images</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.filteredEntries.slice(0, 60).map((entry, index) => (
                  <tr key={`${entry.loc}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800"><span className="block max-w-[360px] break-words">{entry.loc}</span></td>
                    <td className="px-4 py-3 text-gray-700">{entry.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{entry.lastmod || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{entry.changefreq || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{entry.priority || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{entry.images.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.filteredEntries.length > 60 && (
            <p className="mt-3 text-sm text-gray-500">Showing the first 60 entries. Copy the output for the full extracted list.</p>
          )}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Sitemap notes</h3>
          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{note.message}</p>
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
        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "Extracted sitemap URLs will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Sitemap parsing happens directly in your browser. Your XML sitemap is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Extracting URLs From XML Sitemaps</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A sitemap can contain hundreds or thousands of URLs, along with lastmod dates, priorities, changefreq values, child sitemap links, and image entries. When checking indexing or migrations, it is often useful to pull those URLs into a clean list.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This Sitemap URL Extractor reads pasted sitemap XML and extracts the important values into a URL list, CSV, JSON, Markdown table, or summary. It works with normal urlset sitemaps, sitemap indexes, and image sitemap entries.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pulling URLs From a Sitemap</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste XML from a sitemap.xml file or sitemap index.</li>
            <li>Choose whether you want page URLs, sitemap URLs, image URLs, or all entries.</li>
            <li>Pick the output format such as URL list, CSV, JSON, or Markdown.</li>
            <li>Sort, deduplicate, or keep HTTPS URLs only if needed.</li>
            <li>Copy the extracted URLs for crawling, indexing checks, or migration work.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Sitemap URL Extractor Use Cases</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Extracting all URLs from sitemap.xml for manual review.</li>
            <li>Turning a sitemap into a crawl list for SEO checks.</li>
            <li>Checking lastmod values across important pages.</li>
            <li>Finding child sitemap URLs inside a sitemap index.</li>
            <li>Pulling image URLs from image sitemap entries.</li>
            <li>Preparing URL lists for migration, redirects, and indexing checks.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Extracted Output</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`https://example.com/
https://example.com/tools/json-formatter
https://example.com/tools/security-headers-scanner`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sitemap Extraction vs Sitemap Validation</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A sitemap validator checks whether the XML structure is valid and follows sitemap rules. A URL extractor focuses on pulling out useful values so you can inspect, sort, copy, crawl, or compare them.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Use both when needed: extract URLs for review, then validate the sitemap if you suspect formatting, namespace, or sitemap protocol issues.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <FAQ q="What does a Sitemap URL Extractor do?" a="It reads XML sitemap content and extracts URL values from loc tags, along with optional metadata like lastmod and priority." />
            <FAQ q="Can this read sitemap indexes?" a="Yes. It can extract child sitemap URLs from sitemap index files." />
            <FAQ q="Can this extract image sitemap URLs?" a="Yes. Turn on image output or choose the image URL filter to work with image sitemap loc values." />
            <FAQ q="Does this crawl sitemap URLs?" a="No. It parses the XML you paste. It does not fetch child sitemaps or crawl external URLs." />
            <FAQ q="Is my sitemap uploaded anywhere?" a="No. Sitemap extraction happens directly in your browser." />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/sitemap-generator" className="yoryantra-btn-outline">Sitemap Generator</Link>
            <Link href="/tools/sitemap-validator" className="yoryantra-btn-outline">Sitemap Validator</Link>
            <Link href="/tools/robots-txt-validator" className="yoryantra-btn-outline">Robots.txt Validator</Link>
            <Link href="/tools/meta-robots-tag-generator" className="yoryantra-btn-outline">Meta Robots Tag Generator</Link>
            <Link href="/tools/redirect-chain-checker" className="yoryantra-btn-outline">Redirect Chain Checker</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ label, checked, onChange, clear }: { label: string; checked: boolean; onChange: (value: boolean) => void; clear: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange(event.target.checked);
          clear();
        }}
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

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{q}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{a}</p>
    </div>
  );
}

function extractSitemapUrls(input: string, options: {
  outputMode: OutputMode;
  sortMode: SortMode;
  filterMode: FilterMode;
  dedupeUrls: boolean;
  includeMetadata: boolean;
  includeImages: boolean;
  decodeEntities: boolean;
  onlyHttps: boolean;
}): ExtractionResult {
  const parser = new DOMParser();
  const xml = parser.parseFromString(input, "application/xml");
  const parserError = xml.querySelector("parsererror");

  if (parserError) {
    throw new Error("The sitemap XML could not be parsed. Please check the XML formatting.");
  }

  const urlNodes = Array.from(xml.getElementsByTagName("url"));
  const sitemapNodes = Array.from(xml.getElementsByTagName("sitemap"));
  let entries: SitemapEntry[] = [];

  urlNodes.forEach((node) => {
    const loc = readChildText(node, "loc", options.decodeEntities);
    if (!loc) return;
    entries.push({
      loc,
      lastmod: readChildText(node, "lastmod", options.decodeEntities),
      changefreq: readChildText(node, "changefreq", options.decodeEntities),
      priority: readChildText(node, "priority", options.decodeEntities),
      images: readImageLocations(node, options.decodeEntities),
      type: "url",
    });
  });

  sitemapNodes.forEach((node) => {
    const loc = readChildText(node, "loc", options.decodeEntities);
    if (!loc) return;
    entries.push({
      loc,
      lastmod: readChildText(node, "lastmod", options.decodeEntities),
      changefreq: "",
      priority: "",
      images: [],
      type: "sitemap",
    });
  });

  if (options.onlyHttps) entries = entries.filter((entry) => entry.loc.startsWith("https://"));
  if (entries.length === 0) throw new Error("No sitemap URLs were found.");

  const warnings: string[] = [];
  if (options.dedupeUrls) {
    const seen = new Set<string>();
    const before = entries.length;
    entries = entries.filter((entry) => {
      if (seen.has(entry.loc)) return false;
      seen.add(entry.loc);
      return true;
    });
    if (before !== entries.length) warnings.push(`${before - entries.length} duplicate URL${before - entries.length === 1 ? "" : "s"} removed.`);
  }

  const sitemapType = getSitemapType(urlNodes.length, sitemapNodes.length);
  const imageCount = entries.reduce((count, entry) => count + entry.images.length, 0);
  const sortedEntries = sortEntries(entries, options.sortMode);
  const filteredEntries = filterEntries(sortedEntries, options.filterMode, options.includeImages);

  if (sitemapType === "mixed") warnings.push("Both url and sitemap entries were found in the same XML.");
  if (imageCount > 0 && !options.includeImages && options.filterMode !== "images") warnings.push("Image URLs were found. Turn on image output if you need them in the extracted list.");

  return {
    entries: sortedEntries,
    filteredEntries,
    output: formatOutput(filteredEntries, { outputMode: options.outputMode, includeMetadata: options.includeMetadata }),
    sitemapType,
    urlCount: entries.filter((entry) => entry.type === "url").length,
    sitemapCount: entries.filter((entry) => entry.type === "sitemap").length,
    imageCount,
    warnings,
  };
}

function readChildText(node: Element, tagName: string, decodeEntities: boolean) {
  const child = Array.from(node.children).find((item) => item.localName.toLowerCase() === tagName.toLowerCase());
  const value = child?.textContent?.trim() || "";
  return decodeEntities ? decodeXmlEntities(value) : value;
}

function readImageLocations(node: Element, decodeEntities: boolean) {
  return Array.from(node.getElementsByTagName("*"))
    .filter((child) => child.localName.toLowerCase() === "loc" && child.parentElement?.localName.toLowerCase() === "image")
    .map((child) => child.textContent?.trim() || "")
    .filter(Boolean)
    .map((value) => (decodeEntities ? decodeXmlEntities(value) : value));
}

function decodeXmlEntities(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function getSitemapType(urlCount: number, sitemapCount: number): ExtractionResult["sitemapType"] {
  if (urlCount > 0 && sitemapCount > 0) return "mixed";
  if (urlCount > 0) return "urlset";
  if (sitemapCount > 0) return "sitemapindex";
  return "unknown";
}

function sortEntries(entries: SitemapEntry[], sortMode: SortMode) {
  const next = [...entries];
  if (sortMode === "urlAsc") next.sort((a, b) => a.loc.localeCompare(b.loc));
  if (sortMode === "urlDesc") next.sort((a, b) => b.loc.localeCompare(a.loc));
  if (sortMode === "lastmodDesc") next.sort((a, b) => Date.parse(b.lastmod || "0") - Date.parse(a.lastmod || "0"));
  if (sortMode === "lastmodAsc") next.sort((a, b) => Date.parse(a.lastmod || "0") - Date.parse(b.lastmod || "0"));
  return next;
}

function filterEntries(entries: SitemapEntry[], filterMode: FilterMode, includeImages: boolean) {
  if (filterMode === "sitemaps") return entries.filter((entry) => entry.type === "sitemap");
  if (filterMode === "pages") return entries.filter((entry) => entry.type === "url");
  if (filterMode === "images") return imageEntries(entries);
  return includeImages ? [...entries, ...imageEntries(entries)] : entries;
}

function imageEntries(entries: SitemapEntry[]) {
  return entries.flatMap((entry) => entry.images.map((imageUrl) => ({
    loc: imageUrl,
    lastmod: entry.lastmod,
    changefreq: "",
    priority: "",
    images: [],
    type: "url" as const,
  })));
}

function formatOutput(entries: SitemapEntry[], options: { outputMode: OutputMode; includeMetadata: boolean }) {
  if (options.outputMode === "json") return JSON.stringify(entries, null, 2);
  if (options.outputMode === "csv") {
    const rows = [["url", "type", "lastmod", "changefreq", "priority", "image_count"], ...entries.map((entry) => [entry.loc, entry.type, entry.lastmod, entry.changefreq, entry.priority, String(entry.images.length)])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }
  if (options.outputMode === "markdown") {
    return [
      "| URL | Type | Lastmod | Changefreq | Priority | Images |",
      "| --- | --- | --- | --- | --- | --- |",
      ...entries.map((entry) => `| ${escapeMarkdown(entry.loc)} | ${entry.type} | ${entry.lastmod || "-"} | ${entry.changefreq || "-"} | ${entry.priority || "-"} | ${entry.images.length} |`),
    ].join("\n");
  }
  if (options.outputMode === "summary") {
    const lastmodValues = entries.map((entry) => entry.lastmod).filter(Boolean);
    return [
      "Sitemap URL Extraction Summary",
      "------------------------------",
      `Entries shown: ${entries.length}`,
      `Entries with lastmod: ${lastmodValues.length}`,
      `Newest lastmod: ${getSortedDate(lastmodValues, "newest") || "(not found)"}`,
      `Oldest lastmod: ${getSortedDate(lastmodValues, "oldest") || "(not found)"}`,
      "",
      "First URLs:",
      ...entries.slice(0, 10).map((entry) => `- ${entry.loc}`),
    ].join("\n");
  }
  if (options.includeMetadata) {
    return entries.map((entry) => [entry.loc, entry.lastmod && `lastmod=${entry.lastmod}`, entry.changefreq && `changefreq=${entry.changefreq}`, entry.priority && `priority=${entry.priority}`].filter(Boolean).join(" | ")).join("\n");
  }
  return entries.map((entry) => entry.loc).join("\n");
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getSortedDate(values: string[], mode: "newest" | "oldest") {
  return values.slice().sort((a, b) => mode === "newest" ? Date.parse(b) - Date.parse(a) : Date.parse(a) - Date.parse(b))[0] || "";
}

function getSitemapNotes(result: ExtractionResult): SitemapNote[] {
  const notes: SitemapNote[] = [];
  if (result.warnings.length > 0) notes.push({ title: "Review warnings", message: result.warnings.join(" ") });
  if (result.sitemapType === "sitemapindex") notes.push({ title: "Sitemap index found", message: "This XML contains child sitemap URLs. This tool extracts them but does not fetch the child sitemaps automatically." });
  if (result.imageCount > 0) notes.push({ title: "Image sitemap data found", message: "Image URLs were found inside the sitemap. Use image filtering if you need a clean image URL list." });
  if (result.filteredEntries.length > 1000) notes.push({ title: "Large sitemap", message: "This sitemap has many entries. Copying or sorting very large lists may take a moment in the browser." });
  return notes;
}
