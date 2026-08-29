"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "urls" | "csv" | "json" | "markdown" | "summary";
type SortMode = "original" | "urlAsc" | "urlDesc" | "lastmodDesc" | "lastmodAsc";
type FilterMode = "all" | "pages" | "images" | "sitemaps";
type EntryType = "url" | "sitemap" | "image";

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  images: string[];
  type: EntryType;
};

type ExtractionResult = {
  entries: SitemapEntry[];
  filteredEntries: SitemapEntry[];
  output: string;
  sitemapType: "urlset" | "sitemapindex" | "mixed" | "unknown";
  urlCount: number;
  sitemapCount: number;
  imageCount: number;
  byteSize: number;
  warnings: string[];
};

type SitemapNote = {
  title: string;
  message: string;
};

const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
const MAX_ENTRIES = 50_000;
const MAX_BYTES = 52_428_800;
const CHANGEFREQ_VALUES = new Set(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]);

const sampleSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-08-20</lastmod>
  </url>
  <url>
    <loc>https://example.com/guides/sitemaps</loc>
    <lastmod>2026-08-18T09:30:00+00:00</lastmod>
    <image:image>
      <image:loc>https://example.com/images/sitemap-guide.png</image:loc>
    </image:image>
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
      return;
    }

    try {
      const next = extractSitemapUrls(input, {
        outputMode,
        sortMode,
        filterMode,
        dedupeUrls,
        includeMetadata,
        includeImages,
        onlyHttps,
      });
      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to extract URLs from this sitemap.");
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
    setInput(sampleSitemap);
    setOutputMode("urls");
    setSortMode("original");
    setFilterMode("all");
    setDedupeUrls(true);
    setIncludeMetadata(true);
    setIncludeImages(false);
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
    setOnlyHttps(false);
    clearResult();
  };

  return (
    <ToolShell
      title="Sitemap URL Extractor"
      description="Extract page URLs, child sitemap URLs, image locations, and sitemap metadata from pasted XML. Sort, filter, deduplicate, export, and review common protocol problems without crawling the site."
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
          spellCheck={false}
          className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste an XML urlset or sitemapindex. The browser XML parser handles normal XML entity decoding; the tool does not decode values a second time.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Extraction Options</h3>
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
              { label: "All primary entries", value: "all" },
              { label: "Page URLs only", value: "pages" },
              { label: "Image URLs only", value: "images" },
              { label: "Child sitemap URLs only", value: "sitemaps" },
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

          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
            <Toggle label="Remove duplicate output URLs" checked={dedupeUrls} onChange={setDedupeUrls} clear={clearResult} />
            <Toggle label="Include metadata in structured output" checked={includeMetadata} onChange={setIncludeMetadata} clear={clearResult} />
            <Toggle label="Append image URLs to All output" checked={includeImages} onChange={setIncludeImages} clear={clearResult} />
            <Toggle label="Keep HTTPS URLs only" checked={onlyHttps} onChange={setOnlyHttps} clear={clearResult} />
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          The HTTPS filter also applies to extracted image URLs. This tool parses the XML you paste; it does not fetch child sitemaps automatically.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={extractUrls} className="yoryantra-btn">Extract URLs</button>
        <button type="button" onClick={copyOutput} className="yoryantra-btn" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Page URLs" value={result.urlCount.toLocaleString()} />
          <SummaryCard label="Sitemaps" value={result.sitemapCount.toLocaleString()} />
          <SummaryCard label="Images" value={result.imageCount.toLocaleString()} />
          <SummaryCard label="XML Size" value={formatBytes(result.byteSize)} />
          <SummaryCard label="Warnings" value={result.warnings.length.toLocaleString()} />
        </div>
      )}

      {result && result.filteredEntries.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Extracted Entries</h3>
          <p className="mt-2 text-sm text-gray-500">Preview of the first 60 rows after filtering, sorting, HTTPS filtering, and optional deduplication.</p>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[900px] text-left text-sm">
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
                  <tr key={`${entry.type}-${entry.loc}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800"><span className="block max-w-[380px] break-words">{entry.loc}</span></td>
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
            <p className="mt-3 text-sm text-gray-500">Showing 60 of {result.filteredEntries.length.toLocaleString()} output rows. Copy the output for the complete list.</p>
          )}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Sitemap Review</h3>
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
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>
        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "Extracted sitemap URLs will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Parsing happens in your browser. The pasted sitemap is not fetched, submitted, or uploaded by this tool.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">When Extracting a Sitemap Is More Useful Than Opening It</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            XML is fine for machines and awkward for many audit jobs. A clean URL list is easier when you need to compare a migration, feed URLs into a crawler, inspect lastmod values, find child sitemap files, or isolate image URLs.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The extractor keeps page, child-sitemap, and image entries distinct. It also reports problems that are easy to miss in a large file, such as malformed or relative loc values, overlong locations, suspicious lastmod values, invalid changefreq values, and protocol size limits.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Important Sitemap Limits</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A single sitemap is limited to 50,000 URLs and 50 MB uncompressed. A sitemap index can list up to 50,000 sitemap files and is subject to the same uncompressed size limit. The tool checks the pasted text size and entry count so an oversized file is visible before you rely on the extracted list.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">lastmod, changefreq, and priority Are Not Equivalent Signals</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The sitemap protocol defines all three fields for URL entries, but search engines do not necessarily use them the same way. Google currently ignores priority and changefreq, while it may use lastmod when that value is consistently accurate and reflects a significant page update.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That is why the extractor preserves these values for auditing but does not treat a high priority or frequent changefreq as evidence that a page will be crawled more often.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Extraction Is Not Full Sitemap Validation</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This page checks parseability and several practical protocol details, but it does not fetch the sitemap from its real URL. Without the sitemap's published location, it cannot fully evaluate directory scope, cross-site submission authorization, HTTP status, content type, gzip handling, or what Search Console reports for the file.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="yoryantra-btn-outline" href="https://www.sitemaps.org/protocol.html" target="_blank" rel="noreferrer">Sitemaps protocol</a>
            <a className="yoryantra-btn-outline" href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" target="_blank" rel="noreferrer">Google sitemap guidance</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/sitemap-url-extractor" />
        </div>
      </section>
    </ToolShell>
  );
}

function Toggle({ label, checked, onChange, clear }: { label: string; checked: boolean; onChange: (value: boolean) => void; clear: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
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

function extractSitemapUrls(input: string, options: {
  outputMode: OutputMode;
  sortMode: SortMode;
  filterMode: FilterMode;
  dedupeUrls: boolean;
  includeMetadata: boolean;
  includeImages: boolean;
  onlyHttps: boolean;
}): ExtractionResult {
  const parser = new DOMParser();
  const xml = parser.parseFromString(input, "application/xml");
  const parserError = xml.querySelector("parsererror");

  if (parserError) {
    throw new Error("The sitemap XML could not be parsed. Check for unescaped ampersands, broken tags, or incomplete XML.");
  }

  const root = xml.documentElement;
  const rootName = root?.localName?.toLowerCase() || "";
  const warnings: string[] = [];
  const byteSize = new TextEncoder().encode(input).length;

  if (rootName !== "urlset" && rootName !== "sitemapindex") {
    warnings.push(`The root element is <${rootName || "unknown"}> rather than <urlset> or <sitemapindex>.`);
  }

  if ((rootName === "urlset" || rootName === "sitemapindex") && root.namespaceURI !== SITEMAP_NAMESPACE) {
    warnings.push("The standard sitemap namespace is missing or different from http://www.sitemaps.org/schemas/sitemap/0.9.");
  }

  const urlNodes = elementsByLocalName(xml, "url");
  const sitemapNodes = elementsByLocalName(xml, "sitemap");
  let entries: SitemapEntry[] = [];

  const missingUrlLoc = urlNodes.filter((node) => !readChildText(node, "loc")).length;
  const missingSitemapLoc = sitemapNodes.filter((node) => !readChildText(node, "loc")).length;
  const missingLoc = missingUrlLoc + missingSitemapLoc;
  if (missingLoc > 0) warnings.push(`${missingLoc} sitemap entr${missingLoc === 1 ? "y was" : "ies were"} skipped because a required <loc> value was missing.`);

  urlNodes.forEach((node) => {
    const loc = readChildText(node, "loc");
    if (!loc) return;
    entries.push({
      loc,
      lastmod: readChildText(node, "lastmod"),
      changefreq: readChildText(node, "changefreq"),
      priority: readChildText(node, "priority"),
      images: readImageLocations(node),
      type: "url",
    });
  });

  sitemapNodes.forEach((node) => {
    const loc = readChildText(node, "loc");
    if (!loc) return;
    entries.push({
      loc,
      lastmod: readChildText(node, "lastmod"),
      changefreq: "",
      priority: "",
      images: [],
      type: "sitemap",
    });
  });

  if (entries.length === 0) {
    throw new Error("No <url><loc> or <sitemap><loc> entries were found in the parsed XML.");
  }

  addProtocolWarnings(entries, warnings, byteSize, urlNodes.length + sitemapNodes.length);

  if (options.onlyHttps) {
    entries = entries
      .filter((entry) => isHttps(entry.loc))
      .map((entry) => ({ ...entry, images: entry.images.filter(isHttps) }));
  }

  const sitemapType = getSitemapType(urlNodes.length, sitemapNodes.length);
  if (sitemapType === "mixed") warnings.push("Both <url> and <sitemap> entries were found in the same XML. Standard sitemap files normally use one root structure.");

  const pageEntries = entries.filter((entry) => entry.type === "url");
  const sitemapEntries = entries.filter((entry) => entry.type === "sitemap");
  const images = imageEntries(pageEntries);
  let outputEntries = filterEntries(entries, images, options.filterMode, options.includeImages);

  if (options.dedupeUrls) {
    const before = outputEntries.length;
    outputEntries = dedupeEntries(outputEntries);
    const removed = before - outputEntries.length;
    if (removed > 0) warnings.push(`${removed} duplicate output URL${removed === 1 ? " was" : "s were"} removed.`);
  }

  outputEntries = sortEntries(outputEntries, options.sortMode);

  return {
    entries: sortEntries(entries, options.sortMode),
    filteredEntries: outputEntries,
    output: formatOutput(outputEntries, {
      outputMode: options.outputMode,
      includeMetadata: options.includeMetadata,
    }),
    sitemapType,
    urlCount: pageEntries.length,
    sitemapCount: sitemapEntries.length,
    imageCount: images.length,
    byteSize,
    warnings,
  };
}

function elementsByLocalName(root: Document | Element, localName: string) {
  return Array.from(root.getElementsByTagName("*")).filter((element) => element.localName.toLowerCase() === localName.toLowerCase());
}

function readChildText(node: Element, tagName: string) {
  const child = Array.from(node.children).find((item) => item.localName.toLowerCase() === tagName.toLowerCase());
  return child?.textContent?.trim() || "";
}

function readImageLocations(node: Element) {
  return Array.from(node.getElementsByTagName("*"))
    .filter((child) => child.localName.toLowerCase() === "loc" && child.parentElement?.localName.toLowerCase() === "image")
    .map((child) => child.textContent?.trim() || "")
    .filter(Boolean);
}

function addProtocolWarnings(entries: SitemapEntry[], warnings: string[], byteSize: number, primaryNodeCount = entries.length) {
  if (primaryNodeCount > MAX_ENTRIES) {
    warnings.push(`This XML contains ${primaryNodeCount.toLocaleString()} primary entries. A sitemap or sitemap index is limited to 50,000 entries.`);
  }
  if (byteSize > MAX_BYTES) {
    warnings.push(`The pasted XML is ${formatBytes(byteSize)}. Sitemap files are limited to 50 MB uncompressed.`);
  }

  const invalidUrls = entries.filter((entry) => !isAbsoluteHttpUrl(entry.loc));
  if (invalidUrls.length > 0) warnings.push(`${invalidUrls.length} loc value${invalidUrls.length === 1 ? " is" : "s are"} not an absolute HTTP(S) URL.`);

  const overlong = entries.filter((entry) => entry.loc.length >= 2048);
  if (overlong.length > 0) warnings.push(`${overlong.length} loc value${overlong.length === 1 ? " is" : "s are"} 2,048 characters or longer; the sitemap protocol requires loc values to be under 2,048 characters.`);

  const invalidLastmod = entries.filter((entry) => entry.lastmod && !isW3cDateTime(entry.lastmod));
  if (invalidLastmod.length > 0) warnings.push(`${invalidLastmod.length} lastmod value${invalidLastmod.length === 1 ? " does" : "s do"} not look like W3C date/datetime values.`);

  const invalidChangefreq = entries.filter((entry) => entry.changefreq && !CHANGEFREQ_VALUES.has(entry.changefreq.toLowerCase()));
  if (invalidChangefreq.length > 0) warnings.push(`${invalidChangefreq.length} changefreq value${invalidChangefreq.length === 1 ? " is" : "s are"} outside the sitemap protocol value set.`);

  const invalidPriority = entries.filter((entry) => entry.priority && !isValidPriority(entry.priority));
  if (invalidPriority.length > 0) warnings.push(`${invalidPriority.length} priority value${invalidPriority.length === 1 ? " is" : "s are"} outside the protocol range 0.0 to 1.0.`);

  const imageUrls = entries.flatMap((entry) => entry.images);
  const invalidImages = imageUrls.filter((url) => !isAbsoluteHttpUrl(url));
  if (invalidImages.length > 0) warnings.push(`${invalidImages.length} image loc value${invalidImages.length === 1 ? " is" : "s are"} not an absolute HTTP(S) URL.`);
}

function isAbsoluteHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isHttps(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isW3cDateTime(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dateTime = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;
  const match = value.match(dateOnly) || value.match(dateTime);
  if (!match || !isValidCalendarDate(Number(match[1]), Number(match[2]), Number(match[3]))) return false;
  return Number.isFinite(Date.parse(value));
}

function isValidCalendarDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isValidPriority(value: string) {
  if (!/^\d(?:\.\d+)?$/.test(value)) return false;
  const number = Number(value);
  return number >= 0 && number <= 1;
}

function getSitemapType(urlCount: number, sitemapCount: number): ExtractionResult["sitemapType"] {
  if (urlCount > 0 && sitemapCount > 0) return "mixed";
  if (urlCount > 0) return "urlset";
  if (sitemapCount > 0) return "sitemapindex";
  return "unknown";
}

function imageEntries(entries: SitemapEntry[]) {
  return entries.flatMap((entry) => entry.images.map((imageUrl) => ({
    loc: imageUrl,
    lastmod: "",
    changefreq: "",
    priority: "",
    images: [],
    type: "image" as const,
  })));
}

function filterEntries(entries: SitemapEntry[], images: SitemapEntry[], filterMode: FilterMode, includeImages: boolean) {
  if (filterMode === "sitemaps") return entries.filter((entry) => entry.type === "sitemap");
  if (filterMode === "pages") return entries.filter((entry) => entry.type === "url");
  if (filterMode === "images") return images;
  return includeImages ? [...entries, ...images] : entries;
}

function dedupeEntries(entries: SitemapEntry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
}

function sortEntries(entries: SitemapEntry[], sortMode: SortMode) {
  const next = [...entries];
  if (sortMode === "urlAsc") next.sort((a, b) => a.loc.localeCompare(b.loc));
  if (sortMode === "urlDesc") next.sort((a, b) => b.loc.localeCompare(a.loc));
  if (sortMode === "lastmodDesc") next.sort((a, b) => safeTimestamp(b.lastmod) - safeTimestamp(a.lastmod));
  if (sortMode === "lastmodAsc") next.sort((a, b) => safeTimestamp(a.lastmod, Number.MAX_SAFE_INTEGER) - safeTimestamp(b.lastmod, Number.MAX_SAFE_INTEGER));
  return next;
}

function safeTimestamp(value: string, fallback = 0) {
  if (!value) return fallback;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatOutput(entries: SitemapEntry[], options: { outputMode: OutputMode; includeMetadata: boolean }) {
  if (options.outputMode === "json") {
    const value = options.includeMetadata
      ? entries
      : entries.map((entry) => ({ url: entry.loc, type: entry.type }));
    return JSON.stringify(value, null, 2);
  }

  if (options.outputMode === "csv") {
    const rows = options.includeMetadata
      ? [["url", "type", "lastmod", "changefreq", "priority", "image_count"], ...entries.map((entry) => [entry.loc, entry.type, entry.lastmod, entry.changefreq, entry.priority, String(entry.images.length)])]
      : [["url", "type"], ...entries.map((entry) => [entry.loc, entry.type])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (options.outputMode === "markdown") {
    if (!options.includeMetadata) {
      return ["| URL | Type |", "| --- | --- |", ...entries.map((entry) => `| ${escapeMarkdown(entry.loc)} | ${entry.type} |`)].join("\n");
    }
    return [
      "| URL | Type | Lastmod | Changefreq | Priority | Images |",
      "| --- | --- | --- | --- | --- | ---: |",
      ...entries.map((entry) => `| ${escapeMarkdown(entry.loc)} | ${entry.type} | ${entry.lastmod || "-"} | ${entry.changefreq || "-"} | ${entry.priority || "-"} | ${entry.images.length} |`),
    ].join("\n");
  }

  if (options.outputMode === "summary") {
    const lastmodValues = entries.map((entry) => entry.lastmod).filter((value) => value && isW3cDateTime(value));
    return [
      "Sitemap Extraction Summary",
      "--------------------------",
      `Output rows: ${entries.length}`,
      `Page rows: ${entries.filter((entry) => entry.type === "url").length}`,
      `Sitemap rows: ${entries.filter((entry) => entry.type === "sitemap").length}`,
      `Image rows: ${entries.filter((entry) => entry.type === "image").length}`,
      `Rows with valid lastmod: ${lastmodValues.length}`,
      `Newest lastmod: ${sortedDate(lastmodValues, "newest") || "(not found)"}`,
      `Oldest lastmod: ${sortedDate(lastmodValues, "oldest") || "(not found)"}`,
      "",
      "First URLs:",
      ...entries.slice(0, 10).map((entry) => `- [${entry.type}] ${entry.loc}`),
    ].join("\n");
  }

  if (options.includeMetadata) {
    return entries.map((entry) => [
      entry.loc,
      `type=${entry.type}`,
      entry.lastmod && `lastmod=${entry.lastmod}`,
      entry.changefreq && `changefreq=${entry.changefreq}`,
      entry.priority && `priority=${entry.priority}`,
    ].filter(Boolean).join(" | ")).join("\n");
  }

  return entries.map((entry) => entry.loc).join("\n");
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function sortedDate(values: string[], mode: "newest" | "oldest") {
  return values.slice().sort((a, b) => mode === "newest" ? Date.parse(b) - Date.parse(a) : Date.parse(a) - Date.parse(b))[0] || "";
}

function getSitemapNotes(result: ExtractionResult): SitemapNote[] {
  const notes: SitemapNote[] = [];
  if (result.warnings.length > 0) notes.push({ title: "Review warnings", message: result.warnings.join(" ") });
  if (result.sitemapType === "sitemapindex") notes.push({ title: "Sitemap index found", message: "The XML lists child sitemaps. Their lastmod values describe the sitemap files, not the pages inside them. This tool does not fetch those child files." });
  if (result.imageCount > 0) notes.push({ title: "Image extension data found", message: `${result.imageCount.toLocaleString()} image URL${result.imageCount === 1 ? " was" : "s were"} found. Choose Image URLs only when you need a clean image list.` });
  if (result.entries.some((entry) => entry.changefreq || entry.priority)) notes.push({ title: "Google ignores changefreq and priority", message: "These fields are part of the sitemap protocol and are preserved in the output, but Google currently says it ignores both values." });
  if (result.filteredEntries.length > 10_000) notes.push({ title: "Large browser output", message: "The sitemap is within the protocol limit, but sorting and copying tens of thousands of rows can still use noticeable browser memory." });
  return notes;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
