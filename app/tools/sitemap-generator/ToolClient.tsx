"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type SitemapEntry = {
  url: string;
  lastmod: string;
  sourceLine: number;
};

type SitemapResult = {
  xml: string;
  entries: SitemapEntry[];
  warnings: string[];
  notes: string[];
  byteLength: number;
};

const SAMPLE_INPUT = `https://example.com/ | 2026-08-31
https://example.com/about
https://example.com/guides/url-debugging | 2026-08-20`;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isValidDatePart(value: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00Z`
  );

  return (
    !Number.isNaN(
      date.getTime()
    ) &&
    date
      .toISOString()
      .slice(0, 10) === value
  );
}

function isValidLastmod(value: string) {
  if (isValidDatePart(value)) {
    return true;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value
    )
  ) {
    return false;
  }

  const datePart =
    value.slice(0, 10);

  if (
    !isValidDatePart(
      datePart
    )
  ) {
    return false;
  }

  return !Number.isNaN(
    Date.parse(value)
  );
}

function normalizeSitemapLocation(
  raw: string
) {
  const value = raw.trim();

  if (!value) return "";

  try {
    const parsed =
      new URL(value);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return "";
    }

    if (
      parsed.username ||
      parsed.password
    ) {
      return "";
    }

    parsed.hash = "";

    return parsed.href;
  } catch {
    return "";
  }
}

function parentDirectoryPath(
  pathname: string
) {
  const lastSlash =
    pathname.lastIndexOf("/");

  if (lastSlash < 0) {
    return "/";
  }

  return pathname.slice(
    0,
    lastSlash + 1
  );
}

function sameDefaultScope(
  sitemapUrl: string,
  pageUrl: string
) {
  try {
    const sitemap =
      new URL(sitemapUrl);
    const page =
      new URL(pageUrl);

    if (
      sitemap.protocol !==
        page.protocol ||
      sitemap.host !== page.host
    ) {
      return false;
    }

    const directory =
      parentDirectoryPath(
        sitemap.pathname
      );

    return page.pathname.indexOf(
      directory
    ) === 0;
  } catch {
    return false;
  }
}

function buildSitemap(
  source: string,
  rawSitemapLocation: string
): SitemapResult {
  const rawLines = source
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line, index) => ({
      text: line.trim(),
      line: index + 1,
    }))
    .filter(
      (entry) => Boolean(entry.text)
    );

  if (!rawLines.length) {
    throw new Error(
      "Enter at least one URL."
    );
  }

  if (
    rawLines.length > 50000
  ) {
    throw new Error(
      "One sitemap cannot contain more than 50,000 URL entries. Split the URLs across multiple sitemaps and use a sitemap index when needed."
    );
  }

  const sitemapLocation =
    rawSitemapLocation.trim()
      ? normalizeSitemapLocation(
          rawSitemapLocation
        )
      : "";

  if (
    rawSitemapLocation.trim() &&
    !sitemapLocation
  ) {
    throw new Error(
      "Sitemap location must be an absolute HTTP or HTTPS URL without embedded credentials."
    );
  }

  const entries: SitemapEntry[] =
    [];
  const warnings: string[] =
    [];
  const notes: string[] = [];
  const byUrl =
    Object.create(null) as Record<
      string,
      SitemapEntry
    >;
  const origins: string[] = [];

  rawLines.forEach((entry) => {
    const separator =
      entry.text.indexOf("|");
    const rawUrl =
      separator === -1
        ? entry.text
        : entry.text
            .slice(0, separator)
            .trim();
    const lastmod =
      separator === -1
        ? ""
        : entry.text
            .slice(separator + 1)
            .trim();

    if (!rawUrl) {
      throw new Error(
        `Line ${entry.line}: URL is empty.`
      );
    }

    let parsed: URL;

    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new Error(
        `Line ${entry.line}: "${rawUrl}" is not a valid absolute URL.`
      );
    }

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      throw new Error(
        `Line ${entry.line}: sitemap URLs must use HTTP or HTTPS.`
      );
    }

    if (
      parsed.username ||
      parsed.password
    ) {
      throw new Error(
        `Line ${entry.line}: sitemap URLs must not contain embedded credentials.`
      );
    }

    if (parsed.hash) {
      warnings.push(
        `Line ${entry.line}: fragment ${parsed.hash} was removed because sitemap locations identify fetchable URLs, not in-page anchors.`
      );
      parsed.hash = "";
    }

    const normalized =
      parsed.href;

    if (
      normalized.length >= 2048
    ) {
      throw new Error(
        `Line ${entry.line}: the normalized <loc> value is ${normalized.length.toLocaleString()} characters. The Sitemap protocol requires loc values to be less than 2,048 characters.`
      );
    }

    if (
      lastmod &&
      !isValidLastmod(lastmod)
    ) {
      throw new Error(
        `Line ${entry.line}: "${lastmod}" is not a supported lastmod value. Use YYYY-MM-DD or an ISO/W3C-style date-time with seconds and timezone.`
      );
    }

    if (
      origins.indexOf(
        parsed.origin
      ) === -1
    ) {
      origins.push(
        parsed.origin
      );
    }

    if (byUrl[normalized]) {
      const existing =
        byUrl[normalized];

      if (
        existing.lastmod !==
        lastmod &&
        (existing.lastmod ||
          lastmod)
      ) {
        warnings.push(
          `Line ${entry.line}: duplicate URL ${normalized} has a different lastmod from line ${existing.sourceLine}. The first entry was kept; fix the source rather than publishing conflicting modification dates.`
        );
      } else {
        warnings.push(
          `Line ${entry.line}: duplicate URL ${normalized} was omitted.`
        );
      }

      return;
    }

    const normalizedEntry = {
      url: normalized,
      lastmod,
      sourceLine: entry.line,
    };

    byUrl[normalized] =
      normalizedEntry;
    entries.push(
      normalizedEntry
    );

    if (
      sitemapLocation &&
      !sameDefaultScope(
        sitemapLocation,
        normalized
      )
    ) {
      warnings.push(
        `Line ${entry.line}: ${normalized} is outside the sitemap location's default protocol/host/path scope (${sitemapLocation}). Search engines can support verified cross-site submission, but this relationship needs deliberate deployment/ownership handling.`
      );
    }
  });

  if (
    origins.length > 1
  ) {
    warnings.push(
      `The sitemap contains ${origins.length} different origins. The base Sitemap protocol normally scopes a sitemap to one protocol/host and path; Google supports cross-site submission only in verified arrangements.`
    );
  }

  if (
    entries.some(
      (entry) => !entry.lastmod
    ) &&
    entries.some(
      (entry) => Boolean(entry.lastmod)
    )
  ) {
    notes.push(
      "Some URLs include lastmod and others do not. That is valid because lastmod is optional per URL."
    );
  }

  if (
    entries.some(
      (entry) => Boolean(entry.lastmod)
    )
  ) {
    notes.push(
      "lastmod should describe the last significant modification of the linked page. Do not stamp every URL with today's date merely because the sitemap was regenerated."
    );
  }

  notes.push(
    "changefreq and priority are intentionally omitted. The Sitemap protocol defines them, but Google states that it ignores those values."
  );

  const body = entries
    .map((entry) => {
      const lines = [
        "  <url>",
        `    <loc>${escapeXml(
          entry.url
        )}</loc>`,
      ];

      if (entry.lastmod) {
        lines.push(
          `    <lastmod>${escapeXml(
            entry.lastmod
          )}</lastmod>`
        );
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

  const byteLength =
    new TextEncoder().encode(
      xml
    ).length;

  if (
    byteLength >
    52428800
  ) {
    throw new Error(
      "The generated uncompressed XML exceeds the 50 MB (52,428,800 byte) sitemap limit."
    );
  }

  return {
    xml,
    entries,
    warnings:
      Array.from(
        new Set(warnings)
      ),
    notes,
    byteLength,
  };
}

export default function ToolClient() {
  const [sitemapLocation, setSitemapLocation] =
    useState(
      "https://example.com/sitemap.xml"
    );
  const [input, setInput] =
    useState(SAMPLE_INPUT);
  const [result, setResult] =
    useState<SitemapResult | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const sizeLabel = useMemo(
    () =>
      result
        ? `${result.byteLength.toLocaleString()} UTF-8 bytes`
        : "—",
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const generate = () => {
    try {
      setResult(
        buildSitemap(
          input,
          sitemapLocation
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate sitemap.xml."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setSitemapLocation(
      "https://example.com/sitemap.xml"
    );
    setInput(SAMPLE_INPUT);
    clearResult();
  };

  const resetAll = () => {
    setSitemapLocation("");
    setInput("");
    clearResult();
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.xml
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The generated sitemap XML could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="XML Sitemap Generator"
      description="Create sitemap.xml from deliberate URLs while validating escaping, lastmod values, duplicates, scope, count, and size."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="sitemap-location" className="block text-sm font-semibold text-gray-900">
          Sitemap location{" "}
          <span className="font-normal text-gray-500">
            (optional)
          </span>
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Add where this XML will be published to review the protocol&apos;s
          default host/path scope. Nothing is uploaded or submitted.
        </p>
        <input
          id="sitemap-location"
          value={sitemapLocation}
          onChange={(event: {
            target: { value: string };
          }) => {
            setSitemapLocation(
              event.target.value
            );
            clearResult();
          }}
          placeholder="https://example.com/sitemap.xml"
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6">
        <label htmlFor="sitemap-entries" className="block text-sm font-semibold text-gray-900">
          Sitemap entries
        </label>
        <textarea
          id="sitemap-entries"
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            clearResult();
          }}
          rows={14}
          placeholder={SAMPLE_INPUT}
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          One absolute HTTP(S) URL per line. Optionally add{" "}
          <code>| YYYY-MM-DD</code> or a date-time after the URL. Do not use{" "}
          <code>lastmod</code> unless you know when that page was significantly
          changed.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generate}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Generate sitemap.xml
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Unique URLs"
              value={String(
                result.entries.length
              )}
            />
            <Stat
              label="Generated size"
              value={sizeLabel}
            />
            <Stat
              label="Remaining URL capacity"
              value={String(
                50000 -
                  result.entries.length
              )}
            />
          </div>

          {result.warnings.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Sitemap review:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {result.warnings.map(
                  (warning, index) => (
                    <li
                      key={`${warning}-${index}`}
                    >
                      {warning}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Generated sitemap.xml
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  UTF-8 XML with escaped <code>loc</code> and optional{" "}
                  <code>lastmod</code> values.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[330px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.xml}
            </pre>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <ul className="list-disc space-y-2 pl-5">
              {result.notes.map(
                (note, index) => (
                  <li
                    key={`${note}-${index}`}
                  >
                    {note}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Generated XML, protocol-limit checks, duplicate handling, and lastmod notes will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Generation runs only on the URL list in browser memory. No URL is
        crawled, and no canonical, indexability, modification date, upload, or
        search-engine submission is inferred or performed. Site-wide analytics
        or advertising scripts, if enabled, are separate from generation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Sitemap Is Strongest When Every URL in It Is a Deliberate Publishing Decision
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A sitemap is not a dump of every address your application can
            produce. It is a discovery signal containing URLs you want search
            engines to know about—normally the canonical, indexable versions of
            real pages.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If the same content is available under tracking parameters, session
            IDs, print views, duplicate hostnames, or several slash variants,
            generating XML for all of them makes the sitemap bigger while
            weakening the message about which URL you actually prefer.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            lastmod Is the Page&apos;s Significant Modification Time, Not “Today”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The Sitemap protocol defines <code>lastmod</code> as the last
            modification date of the linked page—not the time the sitemap file
            was generated. Google says it uses lastmod when the values are
            consistently and verifiably accurate.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A substantial content edit, structured-data change, or meaningful
            link update can justify a new date. Rebuilding the same page,
            changing a copyright year, or regenerating sitemap.xml does not
            automatically mean every URL changed today.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            XML Escaping Changes the File Syntax Without Changing the URL
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Browser URL
https://example.com/search?category=books&sort=new

Inside XML
<loc>https://example.com/search?category=books&amp;sort=new</loc>`}</pre>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The ampersand has special meaning in XML, so the document must write
            it as <code>&amp;amp;</code>. A sitemap generator that simply pastes
            URLs into XML can produce malformed XML even when every URL itself
            is valid.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Where You Publish the Sitemap Can Define Its Default URL Scope
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Under the base Sitemap protocol, a sitemap at the site root can
            describe URLs across that host, while a sitemap stored under a
            deeper path is normally scoped to descendants of that path. The
            protocol also ties ordinary sitemap scope to the same protocol and
            host.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google supports verified cross-site submission arrangements, so scope
            differences are reported rather than used to delete URLs automatically.
            If you are not intentionally using cross-submission, keep each sitemap
            aligned with its site.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            50,000 URLs and 50 MB Are Per Sitemap File
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            One sitemap file can contain at most 50,000 URL entries and be no
            larger than 50 MB uncompressed. A site can have many sitemap files;
            large sites commonly organize them under one or more sitemap index
            files.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Compression reduces transfer size, not the protocol&apos;s
            uncompressed-size limit. The counter on this page measures the
            generated XML as UTF-8 bytes before compression.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Valid Sitemap Does Not Prove the URLs Are Indexable
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generated XML cannot reveal whether a listed page returns 200,
            redirects, carries noindex, is blocked by robots.txt, declares a
            different canonical, requires authentication, or is soft-404
            content. XML validity and search eligibility are separate checks.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            After publishing, use Search Console and targeted URL inspection
            when you need to understand which submitted URLs Google actually
            discovered or indexed.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          The{" "}
          <a
            href="https://www.sitemaps.org/protocol.html"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            Sitemap protocol
          </a>{" "}
          defines XML structure, loc length, lastmod meaning, scope, 50,000-URL
          and 50 MB limits. Google&apos;s{" "}
          <a
            href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            sitemap guidance
          </a>{" "}
          adds practical search guidance such as using fully qualified preferred
          URLs, accurate lastmod values, and the fact that Google ignores
          priority and changefreq.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/sitemap-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
