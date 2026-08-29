"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Severity = "info" | "warning" | "high";

type Finding = {
  severity: Severity;
  title: string;
  message: string;
};

type CanonicalResult = {
  pageUrl: string;
  canonicalInput: string;
  canonicalUrl: string;
  canonicalSource: "url" | "html" | "http-header";
  relationship: "self" | "alternate" | "cross-origin";
  sameOrigin: boolean;
  findings: Finding[];
  report: string;
  linkTag: string;
};

const samplePage = "https://example.com/products/red-shirt?utm_source=newsletter&utm_campaign=spring";
const sampleCanonical = '<link rel="canonical" href="https://example.com/products/red-shirt">';

export default function ToolClient() {
  const [pageUrl, setPageUrl] = useState("");
  const [canonicalInput, setCanonicalInput] = useState("");
  const [result, setResult] = useState<CanonicalResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const runCheck = () => {
    if (!pageUrl.trim()) {
      setError("Please enter the page URL you are checking.");
      setResult(null);
      return;
    }

    if (!canonicalInput.trim()) {
      setError("Please enter the canonical URL, canonical link tag, or Link header.");
      setResult(null);
      return;
    }

    try {
      const next = analyzeCanonical(pageUrl, canonicalInput);
      setResult(next);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze these canonical URLs.");
      setResult(null);
    }
  };

  const copyReport = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.report);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setPageUrl(samplePage);
    setCanonicalInput(sampleCanonical);
    clearResult();
  };

  const resetAll = () => {
    setPageUrl("");
    setCanonicalInput("");
    clearResult();
  };

  return (
    <ToolShell
      title="Canonical URL Checker"
      description="Compare a page URL with its canonical target and inspect the differences that matter: self-reference, protocol, host, path, query parameters, fragments, relative canonicals, and common tracking parameters."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">Page URL</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Enter the URL of the page where the canonical is declared.
          </p>
          <input
            type="url"
            value={pageUrl}
            onChange={(event) => {
              setPageUrl(event.target.value);
              clearResult();
            }}
            placeholder="https://example.com/products/red-shirt?utm_source=email"
            className="mt-3 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">Canonical URL or Tag</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste an absolute or relative URL, a rel=canonical link tag, or a Link response header.
          </p>
          <textarea
            value={canonicalInput}
            onChange={(event) => {
              setCanonicalInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleCanonical}
            spellCheck={false}
            className="mt-3 w-full min-h-[116px] rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={runCheck} className="yoryantra-btn">
          Check Canonical
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Relationship" value={relationshipLabel(result.relationship)} />
            <SummaryCard label="Same Origin" value={result.sameOrigin ? "Yes" : "No"} />
            <SummaryCard label="Canonical Source" value={sourceLabel(result.canonicalSource)} />
            <SummaryCard label="Findings" value={String(result.findings.length)} />
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resolved Canonical</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Relative canonical values are resolved against the page URL before comparison.
                </p>
              </div>
              <button type="button" onClick={copyReport} className="yoryantra-btn-outline text-sm">
                {copied ? "Copied" : "Copy Report"}
              </button>
            </div>

            <dl className="mt-5 grid gap-4 text-sm lg:grid-cols-2">
              <Detail label="Page" value={result.pageUrl} />
              <Detail label="Canonical" value={result.canonicalUrl} />
            </dl>

            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Canonical link element</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-sm font-mono text-gray-800">
                {result.linkTag}
              </pre>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">Canonical Findings</h3>
            <div className="mt-4 space-y-3">
              {result.findings.map((finding, index) => (
                <div
                  key={`${finding.title}-${index}`}
                  className={`rounded-xl border p-4 ${findingClass(finding.severity)}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide">{finding.severity}</span>
                    <h4 className="font-semibold">{finding.title}</h4>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{finding.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Plain-Text Report</h3>
              <button type="button" onClick={copyReport} className="yoryantra-btn-outline text-sm">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {result.report}
            </pre>
          </div>
        </>
      )}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This checker compares the values you enter in your browser. It does not fetch the page, inspect its live HTML, or determine which canonical Google has selected.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What a Canonical Comparison Can Tell You</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A canonical check is more useful than a simple equality test. Two URLs may differ only because of tracking parameters, a trailing slash, HTTP versus HTTPS, a www host, a fragment, or a genuinely different page path. Those differences have different meanings when you are debugging duplicate URLs.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool resolves the canonical value, shows whether it is self-referencing or points elsewhere, and calls out structural differences that deserve review. It does not decide whether two pages contain equivalent content; that still needs a real page audit.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Canonical URLs Are Signals, Not Commands</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A rel=canonical annotation tells search engines which URL you prefer for duplicate or very similar content. Google treats canonicalization signals as signals rather than an absolute directive and may select a different representative URL when other evidence disagrees.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Canonical annotations work best when they agree with redirects, internal links, sitemap URLs, HTTPS usage, and the actual similarity of the pages involved.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Differences Worth Investigating</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>A canonical that points from an HTTPS page back to HTTP.</li>
            <li>A canonical URL containing a fragment such as #section.</li>
            <li>Relative canonical values that could resolve differently on another host.</li>
            <li>Tracking parameters that remain on the canonical target.</li>
            <li>Unexpected www, subdomain, port, path, or query-string changes.</li>
            <li>Cross-domain canonicals where the target is not genuinely equivalent content.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What This Tool Does Not Check</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            It does not make a network request, so it cannot confirm the HTTP status of the canonical target, discover multiple canonical elements in the live page, compare rendered content, or show the Google-selected canonical. For a live indexing problem, combine this comparison with page source or rendered HTML inspection and Search Console URL Inspection.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google recommends self-referential canonicals, prefers absolute canonical URLs over relative forms, and generally does not support URL fragments as canonical targets. The rel=canonical relation itself is defined by RFC 6596.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="yoryantra-btn-outline" href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls" target="_blank" rel="noreferrer">Google canonicalization guidance</a>
            <a className="yoryantra-btn-outline" href="https://www.rfc-editor.org/rfc/rfc6596" target="_blank" rel="noreferrer">RFC 6596</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/canonical-url-checker" />
        </div>
      </section>
    </ToolShell>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-2 break-words font-mono text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function findingClass(severity: Severity) {
  if (severity === "high") return "border-red-200 bg-red-50 text-red-800";
  if (severity === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-blue-200 bg-blue-50 text-blue-800";
}

function relationshipLabel(value: CanonicalResult["relationship"]) {
  if (value === "self") return "Self";
  if (value === "cross-origin") return "Cross-origin";
  return "Alternate URL";
}

function sourceLabel(value: CanonicalResult["canonicalSource"]) {
  if (value === "html") return "HTML tag";
  if (value === "http-header") return "Link header";
  return "URL";
}

function analyzeCanonical(pageInput: string, canonicalInput: string): CanonicalResult {
  const page = parseWebUrl(pageInput.trim(), "Page URL");
  const extracted = extractCanonical(canonicalInput.trim());
  const findings: Finding[] = [...extracted.findings];
  const rawCanonical = extracted.value.trim();

  if (!rawCanonical) {
    throw new Error("No canonical URL could be found in the canonical input.");
  }

  const isRelative = !/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(rawCanonical);
  let canonical: URL;

  try {
    canonical = isRelative ? new URL(rawCanonical, page.href) : new URL(rawCanonical);
  } catch {
    throw new Error("The canonical value is not a valid URL or relative URL reference.");
  }

  if (!/^https?:$/.test(canonical.protocol)) {
    throw new Error("The canonical target must use HTTP or HTTPS for this web-page check.");
  }

  if (isRelative) {
    findings.push({
      severity: "warning",
      title: "Relative canonical URL",
      message: `The canonical resolves to ${canonical.href}. Google supports relative canonicals but recommends absolute URLs because they are less error-prone.`,
    });
  }

  if (canonical.hash) {
    findings.push({
      severity: "high",
      title: "Canonical contains a URL fragment",
      message: `The canonical includes ${canonical.hash}. Google generally does not support fragments as canonical targets; use the page URL without the fragment.`,
    });
  }

  if (canonical.username || canonical.password) {
    findings.push({
      severity: "high",
      title: "Credentials appear in the canonical URL",
      message: "User-info in a public canonical URL is unusual and can expose sensitive data. Review the generated canonical target.",
    });
  }

  const pageComparable = withoutHash(page);
  const canonicalComparable = withoutHash(canonical);
  const sameUrl = pageComparable === canonicalComparable;
  const sameOrigin = page.origin === canonical.origin;
  const relationship: CanonicalResult["relationship"] = sameUrl ? "self" : sameOrigin ? "alternate" : "cross-origin";

  if (sameUrl) {
    findings.push({
      severity: "info",
      title: "Self-referencing canonical",
      message: "After normal URL parsing and ignoring the fragment, the canonical points back to this page URL.",
    });
  } else {
    compareUrlParts(page, canonical, findings);
  }

  if (page.protocol === "https:" && canonical.protocol === "http:") {
    findings.push({
      severity: "high",
      title: "HTTPS page canonicalizes to HTTP",
      message: "This sends a conflicting security/canonicalization signal. Google generally prefers HTTPS when equivalent versions are available.",
    });
  } else if (page.protocol === "http:" && canonical.protocol === "https:") {
    findings.push({
      severity: "info",
      title: "HTTP page canonicalizes to HTTPS",
      message: "Canonicalizing an HTTP duplicate to its HTTPS equivalent is a common consolidation pattern; redirects should normally agree with it.",
    });
  }

  if (!sameOrigin) {
    findings.push({
      severity: "warning",
      title: "Cross-origin canonical",
      message: "Cross-domain canonicals can be intentional, but the target should represent duplicate or very similar content. This checker cannot verify content equivalence.",
    });
  }

  const pageTracking = trackingParams(page);
  const canonicalTracking = trackingParams(canonical);

  if (canonicalTracking.length > 0) {
    findings.push({
      severity: "warning",
      title: "Tracking parameters remain on the canonical",
      message: `The canonical contains ${canonicalTracking.join(", ")}. Campaign/session parameters are usually poor canonical identifiers unless they genuinely change the preferred resource.`,
    });
  }

  if (pageTracking.length > 0 && canonicalTracking.length === 0 && stripTracking(page) === canonicalComparable) {
    findings.push({
      severity: "info",
      title: "Canonical removes tracking parameters",
      message: `The page URL contains ${pageTracking.join(", ")}, and the canonical points to the same URL after those common tracking parameters are removed.`,
    });
  }

  if (findings.length === 0) {
    findings.push({
      severity: "info",
      title: "No obvious structural issue found",
      message: "The two values parsed cleanly. Confirm that the canonical target contains duplicate or very similar content and that other canonicalization signals agree.",
    });
  }

  const linkTag = `<link rel="canonical" href="${escapeHtmlAttribute(withoutHashUrl(canonical).href)}">`;
  const report = buildReport(page, canonical, extracted.source, relationship, findings, linkTag);

  return {
    pageUrl: page.href,
    canonicalInput: canonicalInput.trim(),
    canonicalUrl: canonical.href,
    canonicalSource: extracted.source,
    relationship,
    sameOrigin,
    findings,
    report,
    linkTag,
  };
}

function parseWebUrl(value: string, label: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a complete absolute URL, including http:// or https://.`);
  }

  if (!/^https?:$/.test(url.protocol)) {
    throw new Error(`${label} must use HTTP or HTTPS.`);
  }

  return url;
}

function extractCanonical(input: string): {
  value: string;
  source: CanonicalResult["canonicalSource"];
  findings: Finding[];
} {
  const findings: Finding[] = [];
  const htmlValues = extractHtmlCanonicals(input);

  if (htmlValues.length > 0) {
    if (htmlValues.length > 1) {
      findings.push({
        severity: "high",
        title: "Multiple canonical link elements pasted",
        message: `${htmlValues.length} rel=canonical link elements were found. Multiple canonical declarations can create conflicting signals; this report uses the first value for comparison.`,
      });
    }
    return { value: htmlValues[0], source: "html", findings };
  }

  const headerValues = extractHeaderCanonicals(input);
  if (headerValues.length > 0) {
    if (headerValues.length > 1) {
      findings.push({
        severity: "high",
        title: "Multiple canonical Link header values pasted",
        message: `${headerValues.length} canonical targets were found in the Link header text. This report uses the first target for comparison.`,
      });
    }
    return { value: headerValues[0], source: "http-header", findings };
  }

  return { value: input, source: "url", findings };
}

function extractHtmlCanonicals(input: string) {
  const tags = input.match(/<link\b[^>]*>/gi) || [];
  const values: string[] = [];

  tags.forEach((tag) => {
    const rel = getHtmlAttribute(tag, "rel");
    if (!rel || !rel.split(/\s+/).some((token) => token.toLowerCase() === "canonical")) return;
    const href = getHtmlAttribute(tag, "href");
    if (href) values.push(decodeBasicHtmlEntities(href.trim()));
  });

  return values;
}

function getHtmlAttribute(tag: string, name: string) {
  const quoted = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  if (quoted) return quoted[2];
  const unquoted = tag.match(new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i"));
  return unquoted?.[1] || "";
}

function extractHeaderCanonicals(input: string) {
  const values: string[] = [];
  const pattern = /<([^>]+)>\s*;[^\r\n,]*\brel\s*=\s*(?:"canonical"|'canonical'|canonical)(?=\s*(?:;|,|$))/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input))) values.push(match[1].trim());
  return values;
}

function decodeBasicHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function compareUrlParts(page: URL, canonical: URL, findings: Finding[]) {
  if (page.hostname !== canonical.hostname) {
    if (removeWww(page.hostname) === removeWww(canonical.hostname)) {
      findings.push({
        severity: "info",
        title: "www host variant differs",
        message: `The page uses ${page.hostname} while the canonical uses ${canonical.hostname}. Make sure redirects, internal links, and sitemap URLs consistently use the preferred host.`,
      });
    } else {
      findings.push({
        severity: "warning",
        title: "Hostname differs",
        message: `The page host is ${page.hostname}; the canonical host is ${canonical.hostname}. Verify that this host change is intentional.`,
      });
    }
  }

  if (page.port !== canonical.port) {
    findings.push({
      severity: "warning",
      title: "Port differs",
      message: `The page and canonical use different ports (${page.port || "default"} vs ${canonical.port || "default"}).`,
    });
  }

  if (page.pathname !== canonical.pathname) {
    if (trimTrailingSlash(page.pathname) === trimTrailingSlash(canonical.pathname)) {
      findings.push({
        severity: "info",
        title: "Trailing slash differs",
        message: "The path differs only by its trailing slash. Treat slash variants consistently across redirects, internal links, and canonicals.",
      });
    } else {
      findings.push({
        severity: "info",
        title: "Canonical points to a different path",
        message: `Page path: ${page.pathname}; canonical path: ${canonical.pathname}. This can be correct when the page is a duplicate of the canonical target.`,
      });
    }
  }

  if (page.search !== canonical.search) {
    findings.push({
      severity: "info",
      title: "Query string differs",
      message: `The page query is ${page.search || "(none)"}; the canonical query is ${canonical.search || "(none)"}. Check whether parameters change content or only create alternate URL variants.`,
    });
  }
}

function withoutHash(url: URL) {
  const next = new URL(url.href);
  next.hash = "";
  return next.href;
}

function withoutHashUrl(url: URL) {
  const next = new URL(url.href);
  next.hash = "";
  return next;
}

function removeWww(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function trimTrailingSlash(pathname: string) {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function trackingParams(url: URL) {
  const names = Array.from(url.searchParams.keys());
  return Array.from(new Set(names.filter(isTrackingParam)));
}

function isTrackingParam(name: string) {
  const lower = name.toLowerCase();
  return lower.startsWith("utm_") || [
    "gclid",
    "dclid",
    "fbclid",
    "msclkid",
    "mc_cid",
    "mc_eid",
    "igshid",
  ].includes(lower);
}

function stripTracking(url: URL) {
  const next = new URL(url.href);
  Array.from(next.searchParams.keys()).forEach((name) => {
    if (isTrackingParam(name)) next.searchParams.delete(name);
  });
  next.hash = "";
  return next.href;
}

function buildReport(
  page: URL,
  canonical: URL,
  source: CanonicalResult["canonicalSource"],
  relationship: CanonicalResult["relationship"],
  findings: Finding[],
  linkTag: string,
) {
  return [
    "Canonical URL Review",
    "--------------------",
    `Page URL: ${page.href}`,
    `Canonical URL: ${canonical.href}`,
    `Canonical source: ${sourceLabel(source)}`,
    `Relationship: ${relationshipLabel(relationship)}`,
    `Same origin: ${page.origin === canonical.origin ? "yes" : "no"}`,
    "",
    "Suggested canonical element:",
    linkTag,
    "",
    "Findings:",
    ...findings.map((finding) => `- [${finding.severity}] ${finding.title}: ${finding.message}`),
    "",
    "Scope:",
    "- This is a structural URL comparison only.",
    "- It does not fetch the page or determine the search-engine-selected canonical.",
  ].join("\n");
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
