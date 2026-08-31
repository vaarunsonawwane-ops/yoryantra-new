"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Severity = "info" | "warning" | "high";
type Finding = { severity: Severity; title: string; message: string };
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

  const clearResult = () => { setResult(null); setError(""); setCopied(false); };

  const runCheck = () => {
    if (!pageUrl.trim()) { setError("Please enter the page URL you are checking."); setResult(null); return; }
    if (!canonicalInput.trim()) { setError("Please enter the canonical URL, canonical link tag, or Link header."); setResult(null); return; }
    try {
      setResult(analyzeCanonical(pageUrl, canonicalInput));
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

  const loadExample = () => { setPageUrl(samplePage); setCanonicalInput(sampleCanonical); clearResult(); };
  const resetAll = () => { setPageUrl(""); setCanonicalInput(""); clearResult(); };

  return (
    <ToolShell
      title="Canonical URL Checker"
      description="Compare a page URL with a pasted canonical URL, rel=canonical link element, or HTTP Link header and inspect structural differences without fetching the live page."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">Page URL</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">Enter the URL of the page where the canonical is declared.</p>
          <input type="url" value={pageUrl} onChange={(event) => { setPageUrl(event.target.value); clearResult(); }} placeholder="https://example.com/products/red-shirt?utm_source=email" className="mt-3 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">Canonical URL, Tag, or Link Header</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">Paste an absolute or relative URL, a rel=canonical link tag, or one or more HTTP Link header-values.</p>
          <textarea value={canonicalInput} onChange={(event) => { setCanonicalInput(event.target.value); clearResult(); }} rows={5} placeholder={sampleCanonical} className="mt-3 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runCheck} className="yoryantra-btn">Check Canonical</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
        {result && <button onClick={copyReport} className="yoryantra-btn-outline">{copied ? "Copied" : "Copy Report"}</button>}
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {result && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <SummaryCard label="Source" value={sourceLabel(result.canonicalSource)} />
            <SummaryCard label="Relationship" value={result.relationship} />
            <SummaryCard label="Same Origin" value={result.sameOrigin ? "Yes" : "No"} />
          </div>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">Resolved Canonical</h3>
            <p className="mt-3 break-words font-mono text-sm text-gray-800">{result.canonicalUrl}</p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-800">{result.linkTag}</div>
          </div>
          <div className="mt-6 space-y-3">
            {result.findings.map((finding, index) => (
              <div key={`${finding.title}-${index}`} className={`rounded-xl border p-4 ${finding.severity === "high" ? "border-red-200 bg-red-50" : finding.severity === "warning" ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-gray-50"}`}>
                <div className="font-semibold text-gray-900">{finding.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{finding.message}</p>
              </div>
            ))}
          </div>
          <pre className="mt-8 yoryantra-output min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">{result.report}</pre>
        </>
      )}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool analyzes only the URL, HTML tag, or HTTP Link header text you paste. It does not fetch the page, discover Google&apos;s selected canonical, or verify live redirects and indexing signals.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking a Declared Canonical Before Publishing</h2>
          <p className="mt-4 leading-relaxed text-gray-600">A canonical declaration is a hint about the preferred representative URL for duplicate or very similar content. This checker compares the page URL and declared target, highlights host, protocol, path, query, and fragment differences, and helps catch accidental tracking parameters or cross-origin targets.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">HTTP Link Headers Need Real List Parsing</h2>
          <p className="mt-4 leading-relaxed text-gray-600">A Link header can contain multiple link-values separated by commas, while quoted parameters can themselves contain commas. The parser here splits only at commas that are outside angle brackets and quoted strings. That avoids treating a valid parameter such as <code>title=&quot;a,b&quot;</code> as a new link-value.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Declared Canonical Is Not the Same as Selected Canonical</h2>
          <p className="mt-4 leading-relaxed text-gray-600">Search engines can consider redirects, internal links, sitemap URLs, duplicate content, and other signals alongside rel=canonical. A structurally clean declaration can therefore still be ignored. Use Google Search Console or equivalent live indexing tools when you need the search engine&apos;s selected canonical.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Official References</h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <a href="https://www.rfc-editor.org/rfc/rfc8288.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 8288 Web Linking →</a>
            <a href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">Google canonical guidance →</a>
          </div>
        </div>
        <div><h2 className="text-xl font-semibold text-gray-900">Related Tools</h2><YoryantraRelatedTools currentHref="/tools/canonical-url-checker" /></div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 break-words font-mono text-sm font-semibold text-gray-900">{value}</div></div>;
}
function sourceLabel(source: CanonicalResult["canonicalSource"]) { if (source === "http-header") return "HTTP Link header"; if (source === "html") return "HTML link tag"; return "URL"; }

function analyzeCanonical(pageInput: string, canonicalInput: string): CanonicalResult {
  const page = parseWebUrl(pageInput.trim(), "Page URL");
  const extracted = extractCanonical(canonicalInput.trim());
  let canonical: URL;
  try { canonical = new URL(extracted.value, page); } catch { throw new Error("The canonical target could not be resolved as a URL."); }
  if (!/^https?:$/.test(canonical.protocol)) throw new Error("Canonical target must use HTTP or HTTPS.");

  const findings: Finding[] = [...extracted.findings];
  const sameOrigin = page.origin === canonical.origin;
  const pageComparable = withoutHashUrl(page);
  const canonicalComparable = withoutHashUrl(canonical);
  const relationship: CanonicalResult["relationship"] = pageComparable.href === canonicalComparable.href ? "self" : sameOrigin ? "alternate" : "cross-origin";

  if (canonical.hash) findings.push({ severity: "warning", title: "Fragment is present on the canonical", message: "Fragments are not normally useful canonical identifiers. The generated link tag removes the fragment for review." });
  if (page.protocol !== canonical.protocol) findings.push({ severity: "warning", title: "Protocol differs", message: `Page uses ${page.protocol.replace(":", "")}; canonical uses ${canonical.protocol.replace(":", "")}. Confirm HTTPS redirects and internal links agree with the preferred URL.` });
  compareUrlParts(page, canonical, findings);

  const pageTracking = trackingParams(page);
  const canonicalTracking = trackingParams(canonical);
  if (canonicalTracking.length) findings.push({ severity: "warning", title: "Tracking parameters remain on the canonical", message: `The canonical contains ${canonicalTracking.join(", ")}. Campaign or session parameters are usually poor canonical identifiers unless they genuinely change the preferred resource.` });
  if (pageTracking.length && !canonicalTracking.length && stripTracking(page).href === stripTracking(canonical).href) findings.push({ severity: "info", title: "Canonical removes tracking parameters", message: `The page URL contains ${pageTracking.join(", ")}, while the canonical points to the equivalent URL without those common tracking parameters.` });
  if (!findings.length) findings.push({ severity: "info", title: "No obvious structural issue found", message: "The two values parsed cleanly. Confirm that the canonical target contains duplicate or very similar content and that other canonicalization signals agree." });

  const linkTag = `<link rel="canonical" href="${escapeHtmlAttribute(withoutHashUrl(canonical).href)}">`;
  const report = buildReport(page, canonical, extracted.source, relationship, findings, linkTag);
  return { pageUrl: page.href, canonicalInput: canonicalInput.trim(), canonicalUrl: canonical.href, canonicalSource: extracted.source, relationship, sameOrigin, findings, report, linkTag };
}

function parseWebUrl(value: string, label: string) {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error(`${label} must be a complete absolute URL, including http:// or https://.`); }
  if (!/^https?:$/.test(url.protocol)) throw new Error(`${label} must use HTTP or HTTPS.`);
  return url;
}

function extractCanonical(input: string): { value: string; source: CanonicalResult["canonicalSource"]; findings: Finding[] } {
  const findings: Finding[] = [];
  const htmlValues = extractHtmlCanonicals(input);
  if (htmlValues.length) {
    if (htmlValues.length > 1) findings.push({ severity: "high", title: "Multiple canonical link elements pasted", message: `${htmlValues.length} rel=canonical link elements were found. This report uses the first value for comparison.` });
    return { value: htmlValues[0], source: "html", findings };
  }
  const headerValues = extractHeaderCanonicals(input);
  if (headerValues.length) {
    if (headerValues.length > 1) findings.push({ severity: "high", title: "Multiple canonical Link header values pasted", message: `${headerValues.length} canonical targets were found. This report uses the first target for comparison.` });
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
  const value = input.replace(/^\s*Link\s*:\s*/i, "").trim();
  const links = splitOutsideDelimiters(value, ",");
  const canonicals: string[] = [];
  links.forEach((linkValue) => {
    const match = linkValue.match(/^\s*<([^>]*)>([\s\S]*)$/);
    if (!match) return;
    const target = match[1].trim();
    const params = splitOutsideDelimiters(match[2], ";").map((part) => part.trim()).filter(Boolean);
    const rels: string[] = [];
    params.forEach((param) => {
      const equals = param.indexOf("=");
      if (equals <= 0) return;
      const name = param.slice(0, equals).trim().toLowerCase();
      if (name !== "rel") return;
      rels.push(...unquoteHttpParameter(param.slice(equals + 1).trim()).split(/\s+/).filter(Boolean));
    });
    if (rels.some((rel) => rel.toLowerCase() === "canonical")) canonicals.push(target);
  });
  return canonicals;
}

function splitOutsideDelimiters(input: string, delimiter: "," | ";") {
  const parts: string[] = [];
  let start = 0;
  let inQuote = false;
  let inAngle = false;
  let escaped = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (inQuote && escaped) { escaped = false; continue; }
    if (inQuote && char === "\\") { escaped = true; continue; }
    if (char === '"') { inQuote = !inQuote; continue; }
    if (!inQuote && char === "<") { inAngle = true; continue; }
    if (!inQuote && char === ">") { inAngle = false; continue; }
    if (!inQuote && !inAngle && char === delimiter) { parts.push(input.slice(start, index)); start = index + 1; }
  }
  parts.push(input.slice(start));
  return parts;
}

function unquoteHttpParameter(value: string) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1).replace(/\\(.)/g, "$1");
  return value;
}
function decodeBasicHtmlEntities(value: string) { return value.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">"); }
function compareUrlParts(page: URL, canonical: URL, findings: Finding[]) {
  if (page.hostname !== canonical.hostname) findings.push({ severity: page.hostname.replace(/^www\./, "") === canonical.hostname.replace(/^www\./, "") ? "info" : "warning", title: "Hostname differs", message: `Page host is ${page.hostname}; canonical host is ${canonical.hostname}. Confirm the host change is intentional and consistent with redirects, internal links, and sitemaps.` });
  if (page.port !== canonical.port) findings.push({ severity: "warning", title: "Port differs", message: `Page and canonical use different ports (${page.port || "default"} vs ${canonical.port || "default"}).` });
  if (page.pathname !== canonical.pathname) findings.push({ severity: "info", title: "Path differs", message: `Page path is ${page.pathname}; canonical path is ${canonical.pathname}. Verify both URLs represent duplicate or substantially similar content.` });
  if (page.search !== canonical.search) findings.push({ severity: "info", title: "Query string differs", message: "The page URL and canonical URL have different query strings. This is common for tracking or filter parameters, but the preferred URL should be intentional." });
}
function trackingParams(url: URL) { const names: string[] = []; url.searchParams.forEach((_value, key) => { if (/^(utm_|gclid$|fbclid$|msclkid$|yclid$|session(id)?$)/i.test(key)) names.push(key); }); return Array.from(new Set(names)); }
function stripTracking(url: URL) { const copy = new URL(url.href); Array.from(copy.searchParams.keys()).forEach((key) => { if (/^(utm_|gclid$|fbclid$|msclkid$|yclid$|session(id)?$)/i.test(key)) copy.searchParams.delete(key); }); copy.hash = ""; return copy; }
function withoutHashUrl(url: URL) { const copy = new URL(url.href); copy.hash = ""; return copy; }
function escapeHtmlAttribute(value: string) { return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function buildReport(page: URL, canonical: URL, source: CanonicalResult["canonicalSource"], relationship: CanonicalResult["relationship"], findings: Finding[], linkTag: string) {
  return [
    "Canonical URL Review",
    "--------------------",
    `Page URL: ${page.href}`,
    `Canonical: ${canonical.href}`,
    `Source: ${sourceLabel(source)}`,
    `Relationship: ${relationship}`,
    "",
    "Findings:",
    ...findings.map((finding) => `- [${finding.severity.toUpperCase()}] ${finding.title}: ${finding.message}`),
    "",
    "Suggested tag:",
    linkTag,
  ].join("\n");
}
