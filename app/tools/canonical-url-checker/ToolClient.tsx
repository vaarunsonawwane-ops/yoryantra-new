"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Severity = "info" | "warning" | "high";
type CanonicalSource = "url" | "html" | "http-header";

type Finding = {
  severity: Severity;
  title: string;
  message: string;
};

type Extraction = {
  values: string[];
  source: CanonicalSource;
  findings: Finding[];
};

type Result = {
  pageUrl: string;
  canonicalUrl: string;
  canonicalSource: CanonicalSource;
  relationship: "self" | "same-origin-alternate" | "cross-origin";
  sameOrigin: boolean;
  findings: Finding[];
  linkTag: string;
  httpLink: string;
  report: string;
};

const SAMPLE_PAGE =
  "https://example.com/products/red-shirt?utm_source=newsletter&utm_campaign=spring";
const SAMPLE_CANONICAL =
  '<link rel="canonical" href="https://example.com/products/red-shirt">';

function parseHttpUrl(value: string, label: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`${label} must be a complete absolute URL.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${label} must use HTTP or HTTPS.`);
  }
  if (!url.hostname) {
    throw new Error(`${label} needs a hostname.`);
  }
  if (url.username || url.password) {
    throw new Error(`${label} should not contain embedded credentials.`);
  }
  return url;
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlAttribute(tag: string, name: string) {
  const quoted = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i")
  );
  if (quoted) return quoted[2];
  const unquoted = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i")
  );
  return unquoted ? unquoted[1] : "";
}

type HtmlCanonicalEntry = {
  href: string;
  tag: string;
  index: number;
};

function extractHtmlCanonicals(input: string) {
  const values: HtmlCanonicalEntry[] = [];
  const regex = /<link\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const tag = match[0];
    const rel = htmlAttribute(tag, "rel");
    if (
      !rel ||
      !rel
        .split(/\s+/)
        .some((token) => token.toLowerCase() === "canonical")
    ) {
      continue;
    }

    values.push({
      href: decodeEntities(htmlAttribute(tag, "href").trim()),
      tag,
      index: match.index,
    });
  }

  return values;
}

function looksLikeHtmlDocument(input: string) {
  return /<(?:html|head|body)\b/i.test(input);
}

function isInsideHead(input: string, index: number) {
  const before = input.slice(0, index);
  let lastOpen = -1;
  let lastClose = -1;
  let match: RegExpExecArray | null;
  const open = /<head\b[^>]*>/gi;
  const close = /<\/head\s*>/gi;

  while ((match = open.exec(before)) !== null) {
    lastOpen = match.index;
  }
  while ((match = close.exec(before)) !== null) {
    lastClose = match.index;
  }

  return lastOpen !== -1 && lastOpen > lastClose;
}

function splitLinkValues(input: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  let quote = "";
  let angleDepth = 0;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input.charAt(index);

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (quoted && char === "\\") {
      current += char;
      escaped = true;
      continue;
    }

    if ((char === '"' || char === "'") && angleDepth === 0) {
      if (quoted && char === quote) {
        quoted = false;
        quote = "";
      } else if (!quoted) {
        quoted = true;
        quote = char;
      }
      current += char;
      continue;
    }

    if (!quoted && char === "<") angleDepth += 1;
    if (!quoted && char === ">" && angleDepth > 0) angleDepth -= 1;

    if (!quoted && angleDepth === 0 && char === ",") {
      if (current.trim()) values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) values.push(current.trim());
  return values;
}

function relParameters(linkValue: string) {
  const values: string[] = [];
  const regex = /;\s*rel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^;,\s]+))/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(linkValue)) !== null) {
    values.push(match[1] || match[2] || match[3] || "");
  }

  return values;
}

function relTokens(linkValue: string) {
  const first = relParameters(linkValue)[0] || "";
  return first
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.toLowerCase());
}

type HeaderCanonicalEntry = {
  href: string;
  raw: string;
  repeatedRel: boolean;
  hasAnchor: boolean;
};

function extractHeaderCanonicals(input: string) {
  const unfolded = input.replace(/\r?\n[ \t]+/g, " ");
  const withoutName = unfolded.replace(/^\s*Link\s*:\s*/i, "");
  const linkValues = splitLinkValues(withoutName);
  const values: HeaderCanonicalEntry[] = [];

  linkValues.forEach((part) => {
    const target = part.match(/^\s*<([^>]*)>/);
    if (!target) return;
    const rels = relParameters(part);
    if (relTokens(part).indexOf("canonical") !== -1) {
      values.push({
        href: target[1].trim(),
        raw: part,
        repeatedRel: rels.length > 1,
        hasAnchor: /;\s*anchor\s*=/i.test(part),
      });
    }
  });

  return values;
}

function extractCanonical(input: string): Extraction {
  const findings: Finding[] = [];
  const html = extractHtmlCanonicals(input);
  if (html.length) {
    const usable = html.filter((entry) => entry.href);
    const missingHref = html.length - usable.length;

    if (missingHref) {
      findings.push({
        severity: "high",
        title: "Canonical link has no href",
        message:
          `${missingHref} rel=canonical link element${
            missingHref === 1 ? " has" : "s have"
          } no readable href value.`,
      });
    }

    const unique = Array.from(new Set(usable.map((entry) => entry.href)));
    if (usable.length > 1) {
      findings.push({
        severity: unique.length > 1 ? "high" : "warning",
        title:
          unique.length > 1
            ? "Conflicting canonical link elements"
            : "Repeated canonical link element",
        message:
          unique.length > 1
            ? `${usable.length} canonical link elements point to ${unique.length} different targets. Keep one clear canonical preference for the page.`
            : `${usable.length} canonical link elements repeat the same target. The duplication is unnecessary and makes templates harder to audit.`,
      });
    }

    const documentLike = looksLikeHtmlDocument(input);
    html.forEach((entry) => {
      const alternateAttributes = ["hreflang", "lang", "media", "type"].filter(
        (name) => Boolean(htmlAttribute(entry.tag, name))
      );

      if (alternateAttributes.length) {
        findings.push({
          severity: "high",
          title: "Canonical link carries alternate-version attributes",
          message:
            `Google does not use rel=canonical annotations with ${alternateAttributes.join(
              ", "
            )} for canonicalization. Keep alternate-language/device metadata on separate link annotations.`,
        });
      }

      if (documentLike && !isInsideHead(input, entry.index)) {
        findings.push({
          severity: "high",
          title: "Canonical link is outside the HTML head",
          message:
            "Google accepts the rel=canonical link element only in the HTML head. Move the declaration into a valid head section.",
        });
      }
    });

    return {
      values: usable.map((entry) => entry.href),
      source: "html",
      findings,
    };
  }

  const header = extractHeaderCanonicals(input);
  if (header.length) {
    const unique = Array.from(new Set(header.map((entry) => entry.href)));
    if (header.length > 1) {
      findings.push({
        severity: unique.length > 1 ? "high" : "warning",
        title:
          unique.length > 1
            ? "Conflicting canonical Link relations"
            : "Repeated canonical Link relation",
        message:
          unique.length > 1
            ? `${header.length} canonical Link relations point to ${unique.length} different targets. Keep one unambiguous canonical relation for the response.`
            : `${header.length} canonical Link relations repeat the same target. One declaration is easier to maintain and audit.`,
      });
    }

    if (header.some((entry) => entry.repeatedRel)) {
      findings.push({
        severity: "warning",
        title: "A Link value repeats the rel parameter",
        message:
          "RFC 8288 says rel must not appear more than once in one link-value and parsers ignore occurrences after the first. The canonical check follows that first-rel rule.",
      });
    }

    if (header.some((entry) => entry.hasAnchor)) {
      findings.push({
        severity: "warning",
        title: "Link relation changes its context with anchor",
        message:
          "An anchor parameter changes the link context under RFC 8288. That is not the ordinary page-level canonical pattern, so verify the original response before treating it as the page canonical.",
      });
    }

    return {
      values: header.map((entry) => entry.href),
      source: "http-header",
      findings,
    };
  }

  return {
    values: [input.trim()],
    source: "url",
    findings,
  };
}

function withoutHash(url: URL) {
  const next = new URL(url.href);
  next.hash = "";
  return next.href;
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isTrackingParam(name: string) {
  const lower = name.toLowerCase();
  if (lower.indexOf("utm_") === 0) return true;
  return (
    [
      "gclid",
      "dclid",
      "fbclid",
      "msclkid",
      "mc_cid",
      "mc_eid",
      "igshid",
      "_ga",
    ].indexOf(lower) !== -1
  );
}

function trackingParams(url: URL) {
  const values: string[] = [];
  url.searchParams.forEach((_value, name) => {
    if (isTrackingParam(name) && values.indexOf(name) === -1) {
      values.push(name);
    }
  });
  return values;
}

function stripTracking(url: URL) {
  const next = new URL(url.href);
  const remove: string[] = [];
  next.searchParams.forEach((_value, name) => {
    if (isTrackingParam(name)) remove.push(name);
  });
  remove.forEach((name) => next.searchParams.delete(name));
  next.hash = "";
  return next.href;
}

function normalizeSlash(path: string) {
  if (path === "/") return "/";
  return path.replace(/\/+$/, "");
}

function compareParts(page: URL, canonical: URL, findings: Finding[]) {
  if (page.protocol !== canonical.protocol) {
    findings.push({
      severity:
        page.protocol === "https:" && canonical.protocol === "http:"
          ? "high"
          : "info",
      title: "Protocol differs",
      message:
        `Page uses ${page.protocol.replace(":", "")}; canonical uses ${canonical.protocol.replace(
          ":",
          ""
        )}. Redirects, internal links and sitemap URLs should normally reinforce the preferred scheme.`,
    });
  }

  if (page.hostname !== canonical.hostname) {
    const pageNoWww = page.hostname.toLowerCase().replace(/^www\./, "");
    const canonicalNoWww = canonical.hostname
      .toLowerCase()
      .replace(/^www\./, "");
    findings.push({
      severity: pageNoWww === canonicalNoWww ? "info" : "warning",
      title:
        pageNoWww === canonicalNoWww
          ? "www host variant differs"
          : "Hostname differs",
      message:
        `Page host is ${page.hostname}; canonical host is ${canonical.hostname}. Confirm that the target is intentional and equivalent.`,
    });
  }

  if (page.port !== canonical.port) {
    findings.push({
      severity: "warning",
      title: "Port differs",
      message:
        `Page port is ${page.port || "default"}; canonical port is ${
          canonical.port || "default"
        }.`,
    });
  }

  if (page.pathname !== canonical.pathname) {
    findings.push({
      severity:
        normalizeSlash(page.pathname) === normalizeSlash(canonical.pathname)
          ? "info"
          : "warning",
      title:
        normalizeSlash(page.pathname) === normalizeSlash(canonical.pathname)
          ? "Trailing-slash variant"
          : "Canonical points to a different path",
      message:
        `Page path is ${page.pathname}; canonical path is ${canonical.pathname}. A different path can be correct only when the target is the preferred equivalent resource.`,
    });
  }

  if (page.search !== canonical.search) {
    findings.push({
      severity: "info",
      title: "Query string differs",
      message:
        `Page query is ${page.search || "(none)"}; canonical query is ${
          canonical.search || "(none)"
        }. Check whether the parameters change the actual content or only create URL variants.`,
    });
  }
}

function analyzeCanonical(pageInput: string, canonicalInput: string): Result {
  const page = parseHttpUrl(pageInput, "Page URL");
  const extracted = extractCanonical(canonicalInput);
  const raw = extracted.values[0] || "";
  if (!raw) {
    throw new Error(
      extracted.source === "html"
        ? 'A rel="canonical" link element was found, but no href target could be read.'
        : "No canonical URL could be extracted."
    );
  }

  const relative = !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(raw);
  let canonical: URL;
  try {
    canonical = relative ? new URL(raw, page.href) : new URL(raw);
  } catch {
    throw new Error("Canonical target is not a valid URL reference.");
  }

  if (canonical.protocol !== "http:" && canonical.protocol !== "https:") {
    throw new Error("Canonical target must resolve to HTTP or HTTPS.");
  }

  const findings = extracted.findings.slice();

  if (relative) {
    findings.push({
      severity: "warning",
      title: "Relative canonical declaration",
      message:
        `The value resolves to ${canonical.href}. Relative canonicals can work, but absolute URLs reduce base-URL and deployment mistakes.`,
    });
  }

  if (canonical.hash) {
    findings.push({
      severity: "high",
      title: "Canonical contains a fragment",
      message:
        `The declaration contains ${canonical.hash}. Canonical targets should identify the preferred document URL, not a client-side fragment.`,
    });
  }

  if (canonical.username || canonical.password) {
    findings.push({
      severity: "high",
      title: "Credentials in canonical URL",
      message:
        "A public canonical URL should not expose username/password URL credentials.",
    });
  }

  const comparablePage = withoutHash(page);
  const comparableCanonical = withoutHash(canonical);
  const same = comparablePage === comparableCanonical;
  const sameOrigin = page.origin === canonical.origin;
  const relationship: Result["relationship"] = same
    ? "self"
    : sameOrigin
    ? "same-origin-alternate"
    : "cross-origin";

  if (same) {
    findings.push({
      severity: "info",
      title: "Self-referencing canonical",
      message:
        "After normal URL parsing and ignoring the fragment, the canonical points back to this page.",
    });
  } else {
    compareParts(page, canonical, findings);
  }

  if (!sameOrigin) {
    findings.push({
      severity: "warning",
      title: "Cross-origin canonical",
      message:
        "Cross-domain canonicalization can be legitimate, but URL comparison alone cannot verify that the two pages are duplicate or sufficiently similar.",
    });
  }

  const pageTracking = trackingParams(page);
  const canonicalTracking = trackingParams(canonical);

  if (canonicalTracking.length) {
    findings.push({
      severity: "warning",
      title: "Tracking parameters remain in canonical",
      message:
        `Canonical contains ${canonicalTracking.join(
          ", "
        )}. Tracking/session-style parameters are usually poor preferred identifiers unless they genuinely define distinct canonical content.`,
    });
  }

  if (
    pageTracking.length &&
    !canonicalTracking.length &&
    stripTracking(page) === comparableCanonical
  ) {
    findings.push({
      severity: "info",
      title: "Canonical removes tracking parameters",
      message:
        `The page URL contains ${pageTracking.join(
          ", "
        )}, while the canonical is the same URL after those common tracking parameters are removed.`,
    });
  }

  if (!findings.length) {
    findings.push({
      severity: "info",
      title: "No obvious structural conflict",
      message:
        "The declaration parsed cleanly. Structural correctness still does not prove the target is the right canonical for the content.",
    });
  }

  const canonicalNoHash = new URL(canonical.href);
  canonicalNoHash.hash = "";
  const canonicalHref = canonicalNoHash.href;
  const linkTag = `<link rel="canonical" href="${escapeHtmlAttribute(
    canonicalHref
  )}">`;
  const httpLink = `<${canonicalHref}>; rel="canonical"`;

  const report = [
    "Canonical URL review",
    `Page: ${page.href}`,
    `Canonical: ${canonical.href}`,
    `Source: ${extracted.source}`,
    `Relationship: ${relationship}`,
    `Same origin: ${sameOrigin ? "yes" : "no"}`,
    "",
    "HTML:",
    linkTag,
    "",
    "HTTP Link relation:",
    `Link: ${httpLink}`,
    "",
    "Findings:",
    ...findings.map(
      (finding) =>
        `- ${finding.severity.toUpperCase()} — ${finding.title}: ${
          finding.message
        }`
    ),
    "",
    "Boundary: no page was fetched. This does not discover live duplicate tags, HTTP status, rendered HTML, redirect behavior, content equivalence or a search engine's selected canonical.",
  ].join("\n");

  return {
    pageUrl: page.href,
    canonicalUrl: canonical.href,
    canonicalSource: extracted.source,
    relationship,
    sameOrigin,
    findings,
    linkTag,
    httpLink,
    report,
  };
}

function sourceLabel(value: CanonicalSource) {
  if (value === "html") return "HTML link";
  if (value === "http-header") return "HTTP Link";
  return "URL";
}

export default function ToolClient() {
  const [pageUrl, setPageUrl] = useState("");
  const [canonicalInput, setCanonicalInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const highCount = useMemo(
    () =>
      result
        ? result.findings.filter((item) => item.severity === "high").length
        : 0,
    [result]
  );

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    if (!pageUrl.trim() || !canonicalInput.trim()) {
      setError("Enter both the page URL and canonical declaration.");
      setResult(null);
      return;
    }

    try {
      setResult(analyzeCanonical(pageUrl, canonicalInput));
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to analyze this canonical declaration."
      );
    }
  };

  const loadExample = () => {
    setPageUrl(SAMPLE_PAGE);
    setCanonicalInput(SAMPLE_CANONICAL);
    clear();
  };

  const reset = () => {
    setPageUrl("");
    setCanonicalInput("");
    clear();
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The report could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="Canonical URL Checker"
      description="Compare a page URL with a canonical declaration from a URL, HTML link element or HTTP Link header, then inspect how the scheme, host, path, query and fragment differ."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Field
          label="Page URL"
          value={pageUrl}
          onChange={(value) => {
            setPageUrl(value);
            clear();
          }}
          placeholder={SAMPLE_PAGE}
          multiline={false}
        />
        <Field
          label="Canonical URL, HTML link or HTTP Link header"
          value={canonicalInput}
          onChange={(value) => {
            setCanonicalInput(value);
            clear();
          }}
          placeholder={SAMPLE_CANONICAL}
          multiline
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          Check Canonical
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Relationship" value={result.relationship} />
            <Stat label="Same origin" value={result.sameOrigin ? "Yes" : "No"} />
            <Stat label="Source" value={sourceLabel(result.canonicalSource)} />
            <Stat label="High findings" value={String(highCount)} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Resolved canonical
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Info label="Page" value={result.pageUrl} />
              <Info label="Canonical" value={result.canonicalUrl} />
            </div>
            <pre className="yoryantra-output mt-4 whitespace-pre-wrap break-words text-sm">
              {result.linkTag}
              {"\n"}
              Link: {result.httpLink}
            </pre>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-gray-900">Canonical findings</h3>
            <div className="mt-4 space-y-3">
              {result.findings.map((finding, index) => (
                <div
                  key={`${finding.title}-${index}`}
                  className="rounded-xl border border-amber-200 bg-white/60 p-4 text-sm leading-relaxed text-gray-700"
                >
                  <strong>
                    {finding.severity.toUpperCase()} · {finding.title}
                  </strong>
                  <p className="mt-1">{finding.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Copyable review
              </h3>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Report"}
              </button>
            </div>
            <pre className="yoryantra-output mt-4 min-h-[280px] whitespace-pre-wrap break-words text-sm">
              {result.report}
            </pre>
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The comparison runs on the values pasted into the browser. No page is
        fetched, no redirect is followed, and no rendered DOM or search-engine
        selected canonical is inspected. Site-wide analytics or advertising
        scripts, if enabled, are separate from the comparison itself.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-semibold text-gray-900">
          Canonicalization Is About Consolidating Equivalent URLs
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          A canonical annotation is useful when several URLs represent the same
          or substantially similar content: tracking variants, printer views,
          filtered paths, protocol/host variants or duplicated product URLs. It
          is not a substitute for deciding which page should actually exist.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          Canonical Signals Work Better When the Rest of the Site Agrees
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Search engines can consider redirects, sitemap inclusion, internal
          links, HTTPS and other signals alongside rel=canonical. A page that
          canonicals to URL A while internal links and redirects consistently
          favor URL B creates avoidable ambiguity.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          HTTP Link Canonicals Need a Real Link-Header Parser
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          A Link header can contain several comma-separated link-values, and
          quoted parameter values can themselves contain commas. Splitting the
          header on every comma can therefore invent fake links. The parser
          separates link-values only outside URI angle brackets and quoted
          parameter text, then reads the first <code>rel</code> parameter as
          RFC 8288 requires.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          The HTML Canonical Belongs in the Head
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Google accepts the canonical <code>link</code> element from the HTML
          <code>head</code>. It also ignores canonical annotations that carry
          <code>hreflang</code>, <code>lang</code>, <code>media</code> or
          <code>type</code>, because those attributes describe alternate versions.
          Keep language or device alternatives on their own link annotations.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          A Canonical Is a Preference, Not a Command
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Google can choose a different canonical when content similarity and
          other signals disagree with the declaration. Redirects, internal links,
          sitemap URLs and HTTPS choices are easier to reason about when they all
          reinforce the same preferred URL.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          Fragments and Tracking Parameters Deserve Different Treatment
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          A fragment identifies a client-side part/state of a document and is
          not the normal canonical document identifier. Tracking parameters are
          different: they are valid URL query parameters, but often should not
          remain in a preferred URL if they only describe attribution rather
          than content.
        </p>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Structurally Valid Canonical Can Still Be Wrong
          </h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            URL syntax cannot tell whether two pages actually contain duplicate
            or very similar content. A category page can point cleanly at a
            product URL and still be the wrong consolidation choice. Compare the
            content and intent before merging signals across paths or domains.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <ReferenceCard
            title="Google: Canonical URLs"
            href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
            text="Current guidance on canonical signals, absolute URLs, HTML-head placement, alternate-version attributes, redirects and sitemap consistency."
          />
          <ReferenceCard
            title="RFC 6596 — Canonical Link Relation"
            href="https://www.rfc-editor.org/rfc/rfc6596.html"
            text="Defines canonical as the preferred IRI for duplicative or superset content and explains important misuse cases."
          />
          <ReferenceCard
            title="RFC 8288 — Web Linking"
            href="https://www.rfc-editor.org/rfc/rfc8288.html"
            text="Defines the HTTP Link header serialization, rel parameter handling and link-context rules."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Keep the URL Signals Consistent
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/canonical-url-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event: { target: { value: string } }) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          spellCheck={false}
          className="mt-3 min-h-[160px] w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--green)]"
        />
      ) : (
        <input
          value={value}
          onChange={(event: { target: { value: string } }) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--green)]"
        />
      )}
    </div>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-all font-mono text-xs text-gray-800">{value}</div>
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
