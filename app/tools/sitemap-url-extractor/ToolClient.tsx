"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type FilterMode = "all" | "pages" | "sitemaps" | "images";
type OutputMode = "plain" | "csv" | "markdown" | "json" | "summary";
type SortMode = "source" | "urlAsc" | "urlDesc" | "lastmodAsc" | "lastmodDesc";

type EntryType = "url" | "sitemap" | "image";

type Entry = {
  type: EntryType;
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  images: string[];
  sourceIndex: number;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  sitemapType: "urlset" | "sitemapindex" | "unknown";
  entries: Entry[];
  outputEntries: Entry[];
  issues: Issue[];
  output: string;
  sourceBytes: number;
  namespace: string;
};

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const IMAGE_NS = "http://www.google.com/schemas/sitemap-image/1.1";
const MAX_ENTRIES = 50000;
const MAX_BYTES = 50 * 1024 * 1024;

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-09-01</lastmod>
  </url>
  <url>
    <loc>https://example.com/docs</loc>
    <lastmod>2026-08-28T10:30:00+05:30</lastmod>
    <image:image>
      <image:loc>https://example.com/images/docs-cover.jpg</image:loc>
    </image:image>
  </url>
</urlset>`;

function directChildren(parent: Element, localName: string, namespace: string) {
  const items: Element[] = [];
  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children.item(index);
    if (
      child &&
      child.localName === localName &&
      child.namespaceURI === namespace
    ) {
      items.push(child);
    }
  }
  return items;
}

function directText(parent: Element, localName: string) {
  const children = directChildren(parent, localName, SITEMAP_NS);
  if (!children.length) return "";
  return (children[0].textContent || "").trim();
}

function imageLocations(urlNode: Element) {
  const output: string[] = [];
  const imageElements = urlNode.getElementsByTagNameNS(IMAGE_NS, "image");

  for (let index = 0; index < imageElements.length; index += 1) {
    const image = imageElements.item(index);
    if (!image) continue;
    const locs = directChildren(image, "loc", IMAGE_NS);
    if (locs.length) {
      const value = (locs[0].textContent || "").trim();
      if (value) output.push(value);
    }
  }

  return output;
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function origin(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.origin
      : "";
  } catch {
    return "";
  }
}

function validCalendarDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validW3cDate(value: string) {
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    return validCalendarDate(
      Number(dateOnly[1]),
      Number(dateOnly[2]),
      Number(dateOnly[3])
    );
  }

  const dateTime = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-](\d{2}):(\d{2}))$/
  );
  if (!dateTime) return false;

  const year = Number(dateTime[1]);
  const month = Number(dateTime[2]);
  const day = Number(dateTime[3]);
  const hour = Number(dateTime[4]);
  const minute = Number(dateTime[5]);
  const second = dateTime[6] ? Number(dateTime[6]) : 0;
  if (!validCalendarDate(year, month, day)) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;

  if (dateTime[7] !== "Z") {
    const offsetHour = Number(dateTime[8]);
    const offsetMinute = Number(dateTime[9]);
    if (
      offsetHour > 14 ||
      offsetMinute > 59 ||
      (offsetHour === 14 && offsetMinute !== 0)
    ) {
      return false;
    }
  }

  return Number.isFinite(Date.parse(value));
}

function validPriority(value: string) {
  if (!/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(value)) return false;
  const parsed = Number(value);
  return parsed >= 0 && parsed <= 1;
}

function parseSitemap(xml: string) {
  const sourceBytes = new TextEncoder().encode(xml).length;
  const issues: Issue[] = [];

  const declaredEncoding = xml.match(
    /^\s*<\?xml[^>]*encoding\s*=\s*["']([^"']+)["']/i
  );
  if (
    declaredEncoding &&
    declaredEncoding[1].toLowerCase().replace(/[_-]/g, "") !== "utf8"
  ) {
    issues.push({
      severity: "warning",
      title: "XML declaration is not UTF-8",
      message:
        `The XML declaration says ${declaredEncoding[1]}. The Sitemap protocol requires UTF-8 encoding.`,
    });
  }

  if (/<!DOCTYPE/i.test(xml)) {
    throw new Error(
      "DOCTYPE declarations are not accepted here. Standard sitemap XML does not need a DTD, and rejecting it avoids unnecessary entity-processing risk."
    );
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(xml, "application/xml");
  const parserError = document.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new Error(
      `XML parsing failed: ${normalizeSpace(parserError.textContent || "invalid XML")}`
    );
  }

  const root = document.documentElement;
  if (!root) throw new Error("No XML root element found.");

  const rootName = root.localName;
  const namespace = root.namespaceURI || "";
  let sitemapType: Result["sitemapType"] = "unknown";

  if (rootName === "urlset") sitemapType = "urlset";
  if (rootName === "sitemapindex") sitemapType = "sitemapindex";

  if (sitemapType === "unknown") {
    issues.push({
      severity: "high",
      title: "Unexpected root element",
      message:
        `Root is <${rootName}>. A standard sitemap uses <urlset> or <sitemapindex>.`,
    });
  }

  if (
    sitemapType !== "unknown" &&
    namespace !== SITEMAP_NS
  ) {
    issues.push({
      severity: "high",
      title: "Sitemap namespace is missing or incorrect",
      message:
        `Root namespace is ${namespace || "(none)"}. Standard Sitemap core elements use ${SITEMAP_NS}.`,
    });
  }

  const entries: Entry[] = [];
  let primaryNodeCount = 0;
  let repeatedUrlMetadataEntries = 0;
  let repeatedIndexLastmodEntries = 0;

  if (sitemapType === "urlset") {
    const nodes = directChildren(root, "url", SITEMAP_NS);
    primaryNodeCount = nodes.length;

    nodes.forEach((node, index) => {
      const locs = directChildren(node, "loc", SITEMAP_NS);
      if (locs.length !== 1) {
        issues.push({
          severity: "high",
          title: "URL entry has invalid loc count",
          message:
            `URL entry ${index + 1} contains ${locs.length} direct Sitemap <loc> elements; exactly one is required.`,
        });
        return;
      }

      const loc = (locs[0].textContent || "").trim();
      if (!loc) {
        issues.push({
          severity: "high",
          title: "Empty URL loc",
          message: `URL entry ${index + 1} has an empty <loc>.`,
        });
        return;
      }

      if (
        ["lastmod", "changefreq", "priority"].some(
          (name) => directChildren(node, name, SITEMAP_NS).length > 1
        )
      ) {
        repeatedUrlMetadataEntries += 1;
      }

      entries.push({
        type: "url",
        loc,
        lastmod: directText(node, "lastmod"),
        changefreq: directText(node, "changefreq"),
        priority: directText(node, "priority"),
        images: imageLocations(node),
        sourceIndex: index,
      });
    });
  }

  if (sitemapType === "sitemapindex") {
    const nodes = directChildren(root, "sitemap", SITEMAP_NS);
    primaryNodeCount = nodes.length;

    nodes.forEach((node, index) => {
      const locs = directChildren(node, "loc", SITEMAP_NS);
      if (locs.length !== 1) {
        issues.push({
          severity: "high",
          title: "Sitemap index entry has invalid loc count",
          message:
            `Child sitemap entry ${index + 1} contains ${locs.length} direct Sitemap <loc> elements; exactly one is required.`,
        });
        return;
      }

      const loc = (locs[0].textContent || "").trim();
      if (!loc) {
        issues.push({
          severity: "high",
          title: "Empty child sitemap loc",
          message: `Child sitemap entry ${index + 1} has an empty <loc>.`,
        });
        return;
      }

      if (directChildren(node, "lastmod", SITEMAP_NS).length > 1) {
        repeatedIndexLastmodEntries += 1;
      }

      entries.push({
        type: "sitemap",
        loc,
        lastmod: directText(node, "lastmod"),
        changefreq: "",
        priority: "",
        images: [],
        sourceIndex: index,
      });
    });
  }

  if (!entries.length) {
    throw new Error(
      "No valid direct Sitemap <url>/<sitemap> entries with <loc> values were extracted."
    );
  }

  if (repeatedUrlMetadataEntries) {
    issues.push({
      severity: "warning",
      title: "Repeated optional fields inside URL entries",
      message:
        `${repeatedUrlMetadataEntries} URL entr${
          repeatedUrlMetadataEntries === 1 ? "y contains" : "ies contain"
        } more than one lastmod, changefreq or priority element. Keep at most one value for each core field.`,
    });
  }

  if (repeatedIndexLastmodEntries) {
    issues.push({
      severity: "warning",
      title: "Repeated lastmod inside sitemap-index entries",
      message:
        `${repeatedIndexLastmodEntries} child sitemap entr${
          repeatedIndexLastmodEntries === 1 ? "y contains" : "ies contain"
        } more than one lastmod element.`,
    });
  }

  if (primaryNodeCount > MAX_ENTRIES) {
    issues.push({
      severity: "high",
      title: "Entry count exceeds Sitemap limit",
      message:
        `${primaryNodeCount.toLocaleString()} direct ${
          sitemapType === "sitemapindex" ? "sitemap" : "URL"
        } entries were found. A sitemap or sitemap index is limited to 50,000 entries.`,
    });
  }

  if (sourceBytes > MAX_BYTES) {
    issues.push({
      severity: "high",
      title: "Uncompressed XML exceeds 50 MB",
      message:
        `The pasted XML is ${sourceBytes.toLocaleString()} UTF-8 bytes. Standard sitemap files are limited to 50 MB uncompressed.`,
    });
  }

  const invalidUrls = entries.filter((entry) => !isHttpUrl(entry.loc));
  if (invalidUrls.length) {
    issues.push({
      severity: "high",
      title: "Non-absolute or non-HTTP(S) loc values",
      message:
        `${invalidUrls.length} primary loc value${
          invalidUrls.length === 1 ? " is" : "s are"
        } not an absolute HTTP(S) URL.`,
    });
  }

  let invalidImageUrls = 0;
  let longImageUrls = 0;
  entries.forEach((entry) => {
    entry.images.forEach((imageUrl) => {
      if (!isHttpUrl(imageUrl)) invalidImageUrls += 1;
      if (imageUrl.length >= 2048) longImageUrls += 1;
    });
  });

  if (invalidImageUrls) {
    issues.push({
      severity: "warning",
      title: "Image extension contains invalid URLs",
      message:
        `${invalidImageUrls} image loc value${
          invalidImageUrls === 1 ? " is" : "s are"
        } not an absolute HTTP(S) URL.`,
    });
  }

  if (longImageUrls) {
    issues.push({
      severity: "warning",
      title: "Very long image URLs",
      message:
        `${longImageUrls} image loc value${
          longImageUrls === 1 ? " is" : "s are"
        } 2,048 characters or longer.`,
    });
  }

  const longUrls = entries.filter((entry) => entry.loc.length >= 2048);
  if (longUrls.length) {
    issues.push({
      severity: "warning",
      title: "Very long loc values",
      message:
        `${longUrls.length} loc value${
          longUrls.length === 1 ? " is" : "s are"
        } 2,048 characters or longer. Sitemap loc values must be under 2,048 characters.`,
    });
  }

  const origins = Array.from(
    new Set(entries.map((entry) => origin(entry.loc)).filter(Boolean))
  );
  if (origins.length > 1) {
    issues.push({
      severity: "warning",
      title: "Primary loc values span multiple origins",
      message:
        `Entries span ${origins.length} origins. Normal sitemap scope is one site/host context; cross-site sitemap usage has specific ownership/submission rules.`,
    });
  }

  const invalidDates = entries.filter(
    (entry) => entry.lastmod && !validW3cDate(entry.lastmod)
  );
  if (invalidDates.length) {
    issues.push({
      severity: "warning",
      title: "Invalid lastmod values",
      message:
        `${invalidDates.length} lastmod value${
          invalidDates.length === 1 ? " does" : "s do"
        } not match the supported W3C date/datetime profile.`,
    });
  }

  const futureDates = entries.filter((entry) => {
    if (!entry.lastmod || !validW3cDate(entry.lastmod)) return false;
    return Date.parse(entry.lastmod) > Date.now() + 24 * 60 * 60 * 1000;
  });
  if (futureDates.length) {
    issues.push({
      severity: "warning",
      title: "Future lastmod values",
      message:
        `${futureDates.length} valid lastmod value${
          futureDates.length === 1 ? " is" : "s are"
        } more than 24 hours in the future. lastmod should describe actual modification time.`,
    });
  }

  if (sitemapType === "urlset") {
    const invalidPriority = entries.filter(
      (entry) => entry.priority && !validPriority(entry.priority)
    );
    if (invalidPriority.length) {
      issues.push({
        severity: "warning",
        title: "Invalid priority values",
        message:
          `${invalidPriority.length} priority value${
            invalidPriority.length === 1 ? " is" : "s are"
          } outside the 0.0–1.0 sitemap range.`,
      });
    }

    const validFreq = [
      "always",
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "yearly",
      "never",
    ];
    const invalidFreq = entries.filter(
      (entry) =>
        entry.changefreq &&
        validFreq.indexOf(entry.changefreq) === -1
    );
    if (invalidFreq.length) {
      issues.push({
        severity: "warning",
        title: "Invalid changefreq values",
        message:
          `${invalidFreq.length} changefreq value${
            invalidFreq.length === 1 ? " is" : "s are"
          } outside the sitemap vocabulary.`,
      });
    }

    if (
      entries.some(
        (entry) => entry.changefreq || entry.priority
      )
    ) {
      issues.push({
        severity: "info",
        title: "Google ignores changefreq and priority",
        message:
          "Those fields remain part of the Sitemap protocol and are preserved in exports, but Google documents that it ignores them.",
      });
    }
  }

  const duplicates: Record<string, number> = Object.create(null);
  entries.forEach((entry) => {
    duplicates[entry.loc] = (duplicates[entry.loc] || 0) + 1;
  });
  const duplicateCount = Object.keys(duplicates).filter(
    (key) => duplicates[key] > 1
  ).length;
  if (duplicateCount) {
    issues.push({
      severity: "warning",
      title: "Duplicate primary loc values",
      message:
        `${duplicateCount} URL value${
          duplicateCount === 1 ? " is" : "s are"
        } duplicated in the same sitemap document.`,
    });
  }

  return {
    sitemapType,
    entries,
    issues,
    sourceBytes,
    namespace,
  };
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function imageEntries(entries: Entry[]) {
  const output: Entry[] = [];
  entries.forEach((entry) => {
    entry.images.forEach((loc, index) => {
      output.push({
        type: "image",
        loc,
        lastmod: "",
        changefreq: "",
        priority: "",
        images: [],
        sourceIndex: entry.sourceIndex * 1000 + index,
      });
    });
  });
  return output;
}

function entriesWithImages(entries: Entry[]) {
  const output: Entry[] = [];
  entries.forEach((entry) => {
    output.push(entry);
    entry.images.forEach((loc, index) => {
      output.push({
        type: "image",
        loc,
        lastmod: "",
        changefreq: "",
        priority: "",
        images: [],
        sourceIndex: entry.sourceIndex * 1000 + index,
      });
    });
  });
  return output;
}

function dedupe(entries: Entry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
}

function safeTime(value: string, fallback: number) {
  if (!value || !validW3cDate(value)) return fallback;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sortEntries(entries: Entry[], mode: SortMode) {
  const next = entries.slice();

  if (mode === "urlAsc") {
    next.sort((a, b) => a.loc.localeCompare(b.loc));
  } else if (mode === "urlDesc") {
    next.sort((a, b) => b.loc.localeCompare(a.loc));
  } else if (mode === "lastmodAsc") {
    next.sort(
      (a, b) =>
        safeTime(a.lastmod, Number.MAX_SAFE_INTEGER) -
        safeTime(b.lastmod, Number.MAX_SAFE_INTEGER)
    );
  } else if (mode === "lastmodDesc") {
    next.sort(
      (a, b) => safeTime(b.lastmod, 0) - safeTime(a.lastmod, 0)
    );
  }

  return next;
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatOutput(entries: Entry[], mode: OutputMode, includeMetadata: boolean) {
  if (mode === "json") {
    return JSON.stringify(
      includeMetadata
        ? entries
        : entries.map((entry) => ({ url: entry.loc, type: entry.type })),
      null,
      2
    );
  }

  if (mode === "csv") {
    const rows = [
      includeMetadata
        ? ["url", "type", "lastmod", "changefreq", "priority", "image_count"]
        : ["url", "type"],
    ];

    entries.forEach((entry) => {
      rows.push(
        includeMetadata
          ? [
              entry.loc,
              entry.type,
              entry.lastmod,
              entry.changefreq,
              entry.priority,
              String(entry.images.length),
            ]
          : [entry.loc, entry.type]
      );
    });

    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }

  if (mode === "markdown") {
    if (!includeMetadata) {
      return [
        "| URL | Type |",
        "| --- | --- |",
        ...entries.map(
          (entry) => `| ${entry.loc.replace(/\|/g, "\\|")} | ${entry.type} |`
        ),
      ].join("\n");
    }

    return [
      "| URL | Type | Lastmod | Changefreq | Priority | Images |",
      "| --- | --- | --- | --- | --- | ---: |",
      ...entries.map(
        (entry) =>
          `| ${entry.loc.replace(/\|/g, "\\|")} | ${entry.type} | ${
            entry.lastmod || "-"
          } | ${entry.changefreq || "-"} | ${entry.priority || "-"} | ${
            entry.images.length
          } |`
      ),
    ].join("\n");
  }

  if (mode === "summary") {
    const dates = entries
      .map((entry) => entry.lastmod)
      .filter((value) => value && validW3cDate(value))
      .sort((a, b) => Date.parse(a) - Date.parse(b));

    return [
      "Sitemap extraction summary",
      `Output rows: ${entries.length}`,
      `Page URLs: ${entries.filter((entry) => entry.type === "url").length}`,
      `Child sitemaps: ${
        entries.filter((entry) => entry.type === "sitemap").length
      }`,
      `Image URLs: ${entries.filter((entry) => entry.type === "image").length}`,
      `Rows with valid lastmod: ${dates.length}`,
      `Oldest lastmod: ${dates.length ? dates[0] : "(none)"}`,
      `Newest lastmod: ${dates.length ? dates[dates.length - 1] : "(none)"}`,
      "",
      "First URLs:",
      ...entries.slice(0, 10).map((entry) => `- [${entry.type}] ${entry.loc}`),
    ].join("\n");
  }

  return entries
    .map((entry) =>
      includeMetadata
        ? [
            entry.loc,
            `type=${entry.type}`,
            entry.lastmod ? `lastmod=${entry.lastmod}` : "",
            entry.changefreq ? `changefreq=${entry.changefreq}` : "",
            entry.priority ? `priority=${entry.priority}` : "",
          ]
            .filter(Boolean)
            .join(" | ")
        : entry.loc
    )
    .join("\n");
}

function buildResult(options: {
  xml: string;
  filterMode: FilterMode;
  outputMode: OutputMode;
  sortMode: SortMode;
  includeImages: boolean;
  includeMetadata: boolean;
  dedupeUrls: boolean;
  onlyHttps: boolean;
}): Result {
  const parsed = parseSitemap(options.xml);
  const images = imageEntries(parsed.entries);
  let selected: Entry[] = [];

  if (options.filterMode === "pages") {
    selected = parsed.entries.filter((entry) => entry.type === "url");
  } else if (options.filterMode === "sitemaps") {
    selected = parsed.entries.filter((entry) => entry.type === "sitemap");
  } else if (options.filterMode === "images") {
    selected = images;
  } else {
    selected = options.includeImages
      ? entriesWithImages(parsed.entries)
      : parsed.entries.slice();
  }

  if (options.onlyHttps) {
    selected = selected.filter((entry) => {
      try {
        return new URL(entry.loc).protocol === "https:";
      } catch {
        return false;
      }
    });
  }

  if (options.dedupeUrls) selected = dedupe(selected);
  selected = sortEntries(selected, options.sortMode);

  return {
    sitemapType: parsed.sitemapType,
    entries: parsed.entries,
    outputEntries: selected,
    issues: parsed.issues,
    output: formatOutput(
      selected,
      options.outputMode,
      options.includeMetadata
    ),
    sourceBytes: parsed.sourceBytes,
    namespace: parsed.namespace,
  };
}

export default function ToolClient() {
  const [xml, setXml] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [outputMode, setOutputMode] = useState<OutputMode>("plain");
  const [sortMode, setSortMode] = useState<SortMode>("source");
  const [includeImages, setIncludeImages] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [dedupeUrls, setDedupeUrls] = useState(false);
  const [onlyHttps, setOnlyHttps] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const highCount = useMemo(
    () =>
      result
        ? result.issues.filter((issue) => issue.severity === "high").length
        : 0,
    [result]
  );

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    if (!xml.trim()) {
      setError("Paste sitemap XML to extract.");
      setResult(null);
      return;
    }

    try {
      setResult(
        buildResult({
          xml,
          filterMode,
          outputMode,
          sortMode,
          includeImages,
          includeMetadata,
          dedupeUrls,
          onlyHttps,
        })
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to parse this sitemap XML."
      );
    }
  };

  const loadExample = () => {
    setXml(SAMPLE);
    setFilterMode("all");
    setOutputMode("plain");
    setSortMode("source");
    setIncludeImages(true);
    setIncludeMetadata(true);
    setDedupeUrls(false);
    setOnlyHttps(false);
    clear();
  };

  const reset = () => {
    setXml("");
    setFilterMode("all");
    setOutputMode("plain");
    setSortMode("source");
    setIncludeImages(false);
    setIncludeMetadata(true);
    setDedupeUrls(false);
    setOnlyHttps(false);
    clear();
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The extracted output could not be copied.");
    }
  };

  return (
    <ToolShell
      title="Sitemap URL Extractor"
      description="Read sitemap XML as urlset or sitemapindex data, keep core URLs separate from image-extension URLs, and review namespaces, dates, duplicates and file limits before exporting the rows you need."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Sitemap XML
        </label>
        <textarea
          value={xml}
          onChange={(event: { target: { value: string } }) => {
            setXml(event.target.value);
            clear();
          }}
          placeholder={SAMPLE}
          spellCheck={false}
          className="mt-3 min-h-[420px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <YoryantraSelect
          label="Extract"
          value={filterMode}
          onChange={(value: string) => {
            setFilterMode(value as FilterMode);
            clear();
          }}
          options={[
            { label: "All primary entries", value: "all" },
            { label: "Page URLs", value: "pages" },
            { label: "Child sitemap URLs", value: "sitemaps" },
            { label: "Image URLs", value: "images" },
          ]}
        />
        <YoryantraSelect
          label="Output"
          value={outputMode}
          onChange={(value: string) => {
            setOutputMode(value as OutputMode);
            clear();
          }}
          options={[
            { label: "Plain text", value: "plain" },
            { label: "CSV", value: "csv" },
            { label: "Markdown", value: "markdown" },
            { label: "JSON", value: "json" },
            { label: "Summary", value: "summary" },
          ]}
        />
        <YoryantraSelect
          label="Sort"
          value={sortMode}
          onChange={(value: string) => {
            setSortMode(value as SortMode);
            clear();
          }}
          options={[
            { label: "Source order", value: "source" },
            { label: "URL A → Z", value: "urlAsc" },
            { label: "URL Z → A", value: "urlDesc" },
            { label: "Lastmod oldest first", value: "lastmodAsc" },
            { label: "Lastmod newest first", value: "lastmodDesc" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Toggle
          checked={includeImages}
          onChange={(value) => {
            setIncludeImages(value);
            clear();
          }}
          title="Include image extension URLs"
          text="Only affects All mode; Image mode always outputs images."
        />
        <Toggle
          checked={includeMetadata}
          onChange={(value) => {
            setIncludeMetadata(value);
            clear();
          }}
          title="Include metadata in exports"
          text="Keep lastmod/changefreq/priority/image counts where relevant."
        />
        <Toggle
          checked={dedupeUrls}
          onChange={(value) => {
            setDedupeUrls(value);
            clear();
          }}
          title="Dedupe output URLs"
          text="Preserves the first occurrence while counts/findings still inspect source XML."
        />
        <Toggle
          checked={onlyHttps}
          onChange={(value) => {
            setOnlyHttps(value);
            clear();
          }}
          title="Output HTTPS only"
          text="A convenience filter, not a sitemap validity rule."
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          Extract Sitemap URLs
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Type" value={result.sitemapType} />
            <Stat label="Primary entries" value={String(result.entries.length)} />
            <Stat
              label="Output rows"
              value={String(result.outputEntries.length)}
            />
            <Stat label="High findings" value={String(highCount)} />
            <Stat label="Pasted UTF-8 bytes" value={result.sourceBytes.toLocaleString()} />
          </div>

          {result.issues.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-gray-900">Sitemap review</h3>
              <div className="mt-4 space-y-3">
                {result.issues.map((issue, index) => (
                  <div
                    key={`${issue.title}-${index}`}
                    className="rounded-xl border border-amber-200 bg-white/60 p-4 text-sm leading-relaxed text-gray-700"
                  >
                    <strong>
                      {issue.severity.toUpperCase()} · {issue.title}
                    </strong>
                    <p className="mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Extracted output
              </h3>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>
            <pre className="yoryantra-output mt-4 min-h-[340px] max-h-[720px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {result.output}
            </pre>
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        XML parsing happens on the pasted document in the browser. Child
        sitemaps are not fetched, URLs are not submitted, and HTTP status,
        canonical signals, robots rules, indexability and Google indexing are
        not checked. Site-wide analytics or advertising scripts, if enabled,
        are separate from the XML parsing itself.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-semibold text-gray-900">
          A Sitemap URL Is the Direct Core &lt;loc&gt;, Not Every Element Named loc
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Sitemap XML can contain extension namespaces for images, video, news
          and other metadata. Those extensions can also contain elements named{" "}
          <code>loc</code>. A simple “find every loc tag” search can mix
          image URLs into the primary page list. This parser reads direct core
          Sitemap children in the standard namespace, while image-extension URLs
          are kept in a separate set.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          urlset and sitemapindex Answer Different Questions
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          A <code>urlset</code> lists content URLs. A{" "}
          <code>sitemapindex</code> lists sitemap files that must be fetched
          separately to discover the pages inside them. A child sitemap URL is
          therefore kept distinct from a content-page URL.
        </p>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            lastmod Should Describe Real Modification Time
          </h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            A syntactically valid date is not automatically useful. lastmod
            should reflect meaningful modification of the URL or child sitemap,
            not the time your sitemap generator ran. Search engines can ignore
            unreliable dates.
          </p>
        </div>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          50,000 Entries and 50 MB Are Per Sitemap File
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          The Sitemap protocol caps an uncompressed sitemap or sitemap index at
          50,000 entries and 50 MB. Larger sites normally split URLs across
          multiple files and reference them from a sitemap index.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          Pasted XML Cannot Prove the Original File Encoding or Location Scope
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          By the time XML is pasted into a textarea, the browser already has
          Unicode text. The byte count shown above is the UTF-8 size of that
          pasted text, not a forensic measurement of the original file bytes.
          The XML declaration can be checked for an encoding claim, but the
          original transfer encoding cannot be recovered from pasted text alone.
        </p>
        <p className="mt-4 leading-relaxed text-gray-600">
          Sitemap placement also affects URL scope. Without the sitemap file&apos;s
          own URL, a pasted document can reveal mixed hosts or protocols, but it
          cannot prove whether every entry falls under the allowed path or a
          verified cross-site submission arrangement.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          Extracted Does Not Mean Indexable
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          A URL can be perfectly valid sitemap XML while redirecting, returning
          404, canonicalizing elsewhere, carrying noindex, being blocked from
          crawling or simply not being selected for indexing. Extraction is a
          data-inspection step, not an indexing verdict.
        </p>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Google Ignores changefreq and priority
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            They remain part of the Sitemap protocol and are preserved in
            exports, but Google documents that it ignores those values.
            Do not spend maintenance effort tuning them as if they controlled
            crawl frequency or ranking priority.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="Sitemaps.org protocol"
            href="https://www.sitemaps.org/protocol.html"
            text="Primary protocol reference for urlset/sitemapindex structure, loc, lastmod, limits and escaping requirements."
          />
          <ReferenceCard
            title="Google: Build and submit a sitemap"
            href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap"
            text="Google-specific sitemap guidance, including accepted formats and how Google treats optional fields."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Follow the URLs Beyond the XML
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/sitemap-url-extractor" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  text: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: { target: { checked: boolean } }) =>
          onChange(event.target.checked)
        }
        className="mt-1"
      />
      <span>
        <strong className="text-gray-900">{title}</strong>
        <span className="mt-1 block text-gray-500">{text}</span>
      </span>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function ReferenceCard({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--green)] underline underline-offset-4"
      >
        {title}
      </a>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}
