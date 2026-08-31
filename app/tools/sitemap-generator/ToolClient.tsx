"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type SitemapEntry = {
  url: string;
  lastmod: string;
};

type SitemapResult = {
  xml: string;
  entries: SitemapEntry[];
  warnings: string[];
  byteLength: number;
};

const sampleInput = `https://example.com/ | 2026-08-31
https://example.com/about
https://example.com/contact | 2026-08-20`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleInput);
  const [output, setOutput] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [entryCount, setEntryCount] = useState(0);
  const [byteLength, setByteLength] = useState(0);

  const sizeLabel = useMemo(
    () => (byteLength ? `${byteLength.toLocaleString()} UTF-8 bytes` : "—"),
    [byteLength]
  );

  const generate = () => {
    try {
      const result = buildSitemap(input);
      setOutput(result.xml);
      setWarnings(result.warnings);
      setEntryCount(result.entries.length);
      setByteLength(result.byteLength);
      setError("");
    } catch (err) {
      setOutput("");
      setWarnings([]);
      setEntryCount(0);
      setByteLength(0);
      setError(err instanceof Error ? err.message : "Unable to generate sitemap.");
    }
  };

  const resetAll = () => {
    setInput(sampleInput);
    setOutput("");
    setWarnings([]);
    setEntryCount(0);
    setByteLength(0);
    setError("");
  };

  return (
    <ToolShell
      title="XML Sitemap Generator"
      description="Generate a sitemap.xml file from absolute URLs, safely escape XML, validate optional lastmod values, and review sitemap protocol limits."
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sitemap entries
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => setInput(event.target.value)}
          rows={12}
          placeholder={sampleInput}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          One absolute HTTP or HTTPS URL per line. Optionally add a last-modified
          value after a vertical bar: <span className="font-mono">URL | YYYY-MM-DD</span>.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generate} className="yoryantra-btn">
          Generate sitemap.xml
        </button>
        <button onClick={() => setInput(sampleInput)} className="yoryantra-btn-outline">
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

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <p className="font-semibold">Review these notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Unique URLs</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{entryCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Generated XML size</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{sizeLabel}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated sitemap.xml
          </h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output mt-3 min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Generated sitemap XML will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generate XML without silently breaking URLs
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Sitemap URLs are XML text, so characters such as ampersands must be
            escaped in the generated document. This tool validates each URL
            before writing it and escapes the XML representation while keeping
            the actual URL meaning intact.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Exact duplicate entries are removed. If the input spans multiple
            hosts, the tool warns because the sitemap protocol expects a single
            host per sitemap.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sitemap limits and lastmod
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>A sitemap file can contain at most 50,000 URLs.</li>
            <li>The uncompressed file can be at most 50 MB.</li>
            <li>Use lastmod only when you have a meaningful modification date; it is optional.</li>
            <li>Fragments are removed because sitemap entries should identify fetchable page URLs rather than in-page anchors.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Output follows the{" "}
            <a
              href="https://www.sitemaps.org/protocol.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline"
            >
              Sitemap protocol
            </a>
            . Processing is local; the tool does not crawl or submit the URLs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/sitemap-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildSitemap(source: string): SitemapResult {
  const rawLines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!rawLines.length) {
    throw new Error("Enter at least one URL.");
  }

  if (rawLines.length > 50000) {
    throw new Error("A sitemap file cannot contain more than 50,000 URL entries.");
  }

  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();
  const warnings: string[] = [];
  const hosts = new Set<string>();

  rawLines.forEach((line, index) => {
    const [rawUrl, ...lastmodParts] = line.split("|");
    const originalUrl = rawUrl.trim();
    const lastmod = lastmodParts.join("|").trim();

    let parsed: URL;
    try {
      parsed = new URL(originalUrl);
    } catch {
      throw new Error(`Line ${index + 1}: "${originalUrl}" is not a valid absolute URL.`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`Line ${index + 1}: sitemap URLs must use HTTP or HTTPS.`);
    }

    if (parsed.username || parsed.password) {
      throw new Error(`Line ${index + 1}: sitemap URLs should not contain embedded credentials.`);
    }

    if (parsed.hash) {
      warnings.push(`Line ${index + 1}: URL fragment "${parsed.hash}" was removed.`);
      parsed.hash = "";
    }

    if (lastmod && !isValidLastmod(lastmod)) {
      throw new Error(
        `Line ${index + 1}: "${lastmod}" is not a supported lastmod date. Use YYYY-MM-DD or an ISO 8601 date-time.`
      );
    }

    const normalized = parsed.href;
    hosts.add(parsed.host.toLowerCase());

    if (seen.has(normalized)) {
      warnings.push(`Line ${index + 1}: duplicate URL was omitted.`);
      return;
    }

    seen.add(normalized);
    entries.push({ url: normalized, lastmod });
  });

  if (hosts.size > 1) {
    warnings.push(
      "This input contains multiple hosts. The Sitemap protocol expects URLs in a sitemap to belong to a single host."
    );
  }

  const body = entries
    .map((entry) => {
      const lines = [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
      ];
      if (entry.lastmod) {
        lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }
      lines.push("  </url>");
      return lines.join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>",
  ].join("\n");

  const byteLength = new TextEncoder().encode(xml).length;
  if (byteLength > 50 * 1024 * 1024) {
    throw new Error("The generated uncompressed sitemap exceeds the 50 MB protocol limit.");
  }

  return {
    xml,
    entries,
    warnings: Array.from(new Set(warnings)),
    byteLength,
  };
}

function isValidLastmod(value: string) {
  const datePart = value.slice(0, 10);
  if (!isValidDatePart(datePart)) return false;

  if (value.length === 10) return true;

  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value
    )
  ) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function isValidDatePart(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
