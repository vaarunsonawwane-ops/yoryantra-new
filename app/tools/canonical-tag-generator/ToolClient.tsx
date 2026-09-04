"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type IssueLevel =
  | "Warning"
  | "Note";

type CanonicalIssue = {
  level: IssueLevel;
  message: string;
};

type OutputMode =
  | "html"
  | "http"
  | "nextjs"
  | "json";

type NormalizedUrl = {
  href: string;
  hadFragment: boolean;
  fragment: string;
  parameters: string[];
};

type CanonicalResult = {
  canonical: string;
  currentPage: string;
  output: string;
  issues: CanonicalIssue[];
  relationship: string[];
  mode: OutputMode;
};

const SAMPLE_CANONICAL =
  "https://example.com/guides/canonical-urls";

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_source_platform",
  "utm_creative_format",
  "utm_marketing_tactic",
  "gclid",
  "dclid",
  "fbclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
];

const SESSION_LIKE_PARAMS = [
  "sessionid",
  "session_id",
  "sid",
  "phpsessid",
  "jsessionid",
];

function htmlAttributeEscape(
  value: string
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");
}

function normalizeUrl(
  raw: string,
  label: string
): NormalizedUrl {
  const trimmed =
    raw.trim();

  if (!trimmed) {
    throw new Error(
      `${label} is empty.`
    );
  }

  if (
    /[\u0000-\u001F\u007F]/.test(
      trimmed
    )
  ) {
    throw new Error(
      `${label} contains a control character.`
    );
  }

  let url: URL;

  try {
    url = new URL(
      trimmed
    );
  } catch {
    throw new Error(
      `${label} must be an absolute URL.`
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      `${label} must use HTTP or HTTPS.`
    );
  }

  if (
    url.username ||
    url.password
  ) {
    throw new Error(
      `${label} must not contain embedded username/password credentials.`
    );
  }

  const hadFragment =
    Boolean(url.hash);
  const fragment =
    url.hash;
  url.hash = "";

  const parameters: string[] =
    [];

  url.searchParams.forEach(
    (_value, key) => {
      if (
        parameters.indexOf(
          key
        ) === -1
      ) {
        parameters.push(key);
      }
    }
  );

  return {
    href: url.href,
    hadFragment,
    fragment,
    parameters,
  };
}

function lowerParameters(
  parameters: string[]
) {
  return parameters.map(
    (parameter) =>
      parameter.toLowerCase()
  );
}

function matchedParameters(
  parameters: string[],
  candidates: string[]
) {
  const lower =
    lowerParameters(
      parameters
    );

  return candidates.filter(
    (candidate) =>
      lower.indexOf(
        candidate
      ) !== -1
  );
}

function compareUrls(
  currentPage: string,
  canonical: string
) {
  const relationship: string[] =
    [];

  if (!currentPage) {
    relationship.push(
      "Current page URL was not supplied, so self-reference, host/protocol differences and parameter cleanup cannot be compared."
    );
    return relationship;
  }

  const current =
    new URL(currentPage);
  const target =
    new URL(canonical);

  if (
    current.href ===
    target.href
  ) {
    relationship.push(
      "Self-referencing canonical: current page and canonical URL are identical after fragment removal."
    );
    return relationship;
  }

  if (
    current.origin !==
    target.origin
  ) {
    relationship.push(
      `Cross-origin canonical: page origin ${current.origin} points to ${target.origin}. Cross-domain canonicalization can be intentional, but verify ownership/content equivalence and the target page's availability.`
    );
  } else {
    relationship.push(
      "Canonical stays on the same origin as the supplied page."
    );
  }

  if (
    current.protocol !==
    target.protocol
  ) {
    relationship.push(
      `Protocol changes from ${current.protocol.replace(
        ":",
        ""
      )} to ${target.protocol.replace(
        ":",
        ""
      )}.`
    );
  }

  if (
    current.hostname !==
    target.hostname
  ) {
    relationship.push(
      `Hostname changes from ${current.hostname} to ${target.hostname}.`
    );
  }

  if (
    current.port !==
    target.port
  ) {
    relationship.push(
      `Port changes from ${current.port || "default"} to ${target.port || "default"}.`
    );
  }

  if (
    current.pathname !==
    target.pathname
  ) {
    relationship.push(
      `Path changes from ${current.pathname} to ${target.pathname}.`
    );
  }

  if (
    current.search !==
    target.search
  ) {
    relationship.push(
      `Query string changes from ${current.search || "(none)"} to ${target.search || "(none)"}.`
    );
  }

  return relationship;
}

function analyzeCanonical(
  canonicalInfo: NormalizedUrl,
  currentInfo:
    | NormalizedUrl
    | null
) {
  const issues: CanonicalIssue[] =
    [];
  const canonical =
    new URL(
      canonicalInfo.href
    );

  if (
    canonical.protocol ===
    "http:"
  ) {
    issues.push({
      level: "Warning",
      message:
        "Canonical uses HTTP. If the preferred live page is available on HTTPS, align the canonical with the secure preferred URL and other canonicalization signals.",
    });
  }

  if (
    canonicalInfo.hadFragment
  ) {
    issues.push({
      level: "Note",
      message:
        `Fragment ${canonicalInfo.fragment} was removed from the canonical URL. URL fragments are not part of the canonical page resource Google documents for rel=canonical.`,
    });
  }

  if (
    canonicalInfo.parameters
      .length
  ) {
    issues.push({
      level: "Note",
      message:
        `Canonical contains query parameter${
          canonicalInfo
            .parameters.length ===
          1
            ? ""
            : "s"
        }: ${canonicalInfo.parameters.join(
          ", "
        )}. Query-bearing canonical URLs can be legitimate when the parameterized URL is truly the preferred page; do not strip functional parameters automatically.`,
    });
  }

  const trackers =
    matchedParameters(
      canonicalInfo.parameters,
      TRACKING_PARAMS
    );

  if (trackers.length) {
    issues.push({
      level: "Warning",
      message:
        `Canonical contains common campaign/click tracking parameter${
          trackers.length === 1
            ? ""
            : "s"
        }: ${trackers.join(
          ", "
        )}. Tracking variants usually should not become the preferred canonical URL.`,
    });
  }

  const sessionLike =
    matchedParameters(
      canonicalInfo.parameters,
      SESSION_LIKE_PARAMS
    );

  if (
    sessionLike.length
  ) {
    issues.push({
      level: "Warning",
      message:
        `Canonical contains session-like parameter${
          sessionLike.length ===
          1
            ? ""
            : "s"
        }: ${sessionLike.join(
          ", "
        )}. Session-specific URLs are usually poor canonical identities.`,
    });
  }

  if (currentInfo) {
    if (
      currentInfo.hadFragment
    ) {
      issues.push({
        level: "Note",
        message:
          "The supplied current-page URL contained a fragment; it was removed before comparing page and canonical identity.",
      });
    }

    const current =
      new URL(
        currentInfo.href
      );

    if (
      current.protocol ===
        "https:" &&
      canonical.protocol ===
        "http:"
    ) {
      issues.push({
        level: "Warning",
        message:
          "The current page is HTTPS but the canonical points to HTTP. That sends conflicting transport-preference signals unless the HTTP URL is genuinely the preferred accessible version.",
      });
    }

    const currentTrackers =
      matchedParameters(
        currentInfo.parameters,
        TRACKING_PARAMS
      );

    if (
      currentTrackers.length &&
      !trackers.length
    ) {
      issues.push({
        level: "Note",
        message:
          `The current page contains common tracking parameter${
            currentTrackers.length ===
            1
              ? ""
              : "s"
          } (${currentTrackers.join(
            ", "
          )}) while the canonical does not. That is a common intentional canonicalization pattern.`,
      });
    }
  }

  issues.push({
    level: "Note",
    message:
      "Local URL inspection cannot verify whether the canonical target returns 200, redirects, is indexable, carries noindex, is blocked from crawling, declares its own conflicting canonical, or contains substantially equivalent content.",
  });

  return issues;
}

function buildCanonicalOutput(
  canonical: string,
  mode: OutputMode,
  issues: CanonicalIssue[],
  relationship: string[],
  currentPage: string
) {
  if (mode === "html") {
    return `<link rel="canonical" href="${htmlAttributeEscape(
      canonical
    )}">`;
  }

  if (mode === "http") {
    return `Link: <${canonical}>; rel="canonical"`;
  }

  if (
    mode === "nextjs"
  ) {
    return [
      "export const metadata = {",
      "  alternates: {",
      `    canonical: ${JSON.stringify(
        canonical
      )},`,
      "  },",
      "};",
    ].join("\n");
  }

  return JSON.stringify(
    {
      canonical,
      currentPage:
        currentPage ||
        null,
      relationship,
      issues,
    },
    null,
    2
  );
}

function generateCanonical(
  rawCanonical: string,
  rawCurrentPage: string,
  mode: OutputMode
): CanonicalResult {
  const canonicalInfo =
    normalizeUrl(
      rawCanonical,
      "Canonical URL"
    );
  const currentInfo =
    rawCurrentPage.trim()
      ? normalizeUrl(
          rawCurrentPage,
          "Current page URL"
        )
      : null;
  const relationship =
    compareUrls(
      currentInfo
        ? currentInfo.href
        : "",
      canonicalInfo.href
    );
  const issues =
    analyzeCanonical(
      canonicalInfo,
      currentInfo
    );

  return {
    canonical:
      canonicalInfo.href,
    currentPage:
      currentInfo
        ? currentInfo.href
        : "",
    output:
      buildCanonicalOutput(
        canonicalInfo.href,
        mode,
        issues,
        relationship,
        currentInfo
          ? currentInfo.href
          : ""
      ),
    issues,
    relationship,
    mode,
  };
}

function formatCanonicalReport(
  result: CanonicalResult
) {
  const lines = [
    "Canonical tag review",
    `Canonical: ${result.canonical}`,
    `Current page: ${result.currentPage || "Not supplied"}`,
    `Output mode: ${result.mode}`,
    "",
    "Relationship:",
    ...result.relationship.map(
      (item) =>
        `- ${item}`
    ),
    "",
    "Review:",
    ...result.issues.map(
      (item) =>
        `- ${item.level}: ${item.message}`
    ),
    "",
    "Generated output:",
    result.output,
  ];

  return lines.join("\n");
}

export default function ToolClient() {
  const [
    canonicalUrl,
    setCanonicalUrl,
  ] =
    useState(
      SAMPLE_CANONICAL
    );
  const [
    currentPageUrl,
    setCurrentPageUrl,
  ] =
    useState("");
  const [
    outputMode,
    setOutputMode,
  ] =
    useState<OutputMode>(
      "html"
    );
  const [result, setResult] =
    useState<CanonicalResult | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copiedTarget, setCopiedTarget] =
    useState<"output" | "report" | null>(null);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopiedTarget(null);
  };

  const generate = () => {
    try {
      setResult(
        generateCanonical(
          canonicalUrl,
          currentPageUrl,
          outputMode
        )
      );
      setError("");
      setCopiedTarget(null);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate this canonical reference."
      );
      setCopiedTarget(null);
    }
  };

  const loadExample = () => {
    setCurrentPageUrl(
      "https://example.com/guides/canonical-urls?utm_source=newsletter"
    );
    setCanonicalUrl(
      SAMPLE_CANONICAL
    );
    setOutputMode(
      "html"
    );
    clearResult();
  };

  const resetAll = () => {
    setCanonicalUrl("");
    setCurrentPageUrl("");
    setOutputMode(
      "html"
    );
    clearResult();
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.output
      );
      setCopiedTarget("output");
      window.setTimeout(
        () => setCopiedTarget(null),
        1400
      );
    } catch {
      setCopiedTarget(null);
      setError(
        "The generated canonical output could not be copied. Select and copy it manually."
      );
    }
  };

  const copyReport = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        formatCanonicalReport(
          result
        )
      );
      setCopiedTarget("report");
      window.setTimeout(
        () => setCopiedTarget(null),
        1400
      );
    } catch {
      setCopiedTarget(null);
      setError(
        "The canonical report could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Canonical Tag Generator"
      description="Generate canonical markup while reviewing fragments, campaign parameters, HTTPS, and the current-to-preferred URL relationship."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="canonical-url" className="block text-sm font-semibold text-gray-900">
            Canonical URL
          </label>
          <input
            id="canonical-url"
            value={canonicalUrl}
            onChange={(event: {
              target: {
                value: string;
              };
            }) => {
              setCanonicalUrl(
                event.target.value
              );
              clearResult();
            }}
            placeholder={
              SAMPLE_CANONICAL
            }
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Use the absolute HTTP(S) URL you actually want treated as the
            preferred representative page.
          </p>
        </div>

        <div>
          <label htmlFor="current-page-url" className="block text-sm font-semibold text-gray-900">
            Current page URL{" "}
            <span className="font-normal text-gray-500">
              (optional)
            </span>
          </label>
          <input
            id="current-page-url"
            value={
              currentPageUrl
            }
            onChange={(event: {
              target: {
                value: string;
              };
            }) => {
              setCurrentPageUrl(
                event.target.value
              );
              clearResult();
            }}
            placeholder="https://example.com/guides/canonical-urls?utm_source=newsletter"
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Supplying the page URL makes self-reference, parameter cleanup,
            host/protocol changes and cross-domain canonicalization visible.
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-xl">
        <YoryantraSelect
          label="Output format"
          value={outputMode}
          onChange={(value: string) => {
            setOutputMode(
              value as OutputMode
            );
            clearResult();
          }}
          options={[
            {
              label:
                "HTML <link> tag",
              value: "html",
            },
            {
              label:
                "HTTP Link response header",
              value: "http",
            },
            {
              label:
                "Next.js metadata",
              value:
                "nextjs",
            },
            {
              label:
                "JSON review summary",
              value: "json",
            },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generate}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Generate Canonical
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
        <div role="alert" className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Generated canonical output
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review notes are kept outside the snippet so copied markup is
                  deployable as-is.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
              >
                {copiedTarget === "output"
                  ? "Copied"
                  : "Copy Output"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[120px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output}
            </pre>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Page → canonical relationship
              </h3>
              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
              >
                {copiedTarget === "report" ? "Copied" : "Copy Full Report"}
              </button>
            </div>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
              {result.relationship.map(
                (item, index) => (
                  <li
                    key={`${item}-${index}`}
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {result.issues.some((item) => item.level === "Warning") ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>Warnings:</strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {result.issues.filter((item) => item.level === "Warning").map((item, index) => (
                  <li key={`${item.message}-${index}`}>{item.message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.issues.some((item) => item.level === "Note") ? (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong>Review notes:</strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {result.issues.filter((item) => item.level === "Note").map((item, index) => (
                  <li key={`${item.message}-${index}`}>{item.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[180px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Canonical markup plus current-page relationship and URL review notes
          will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Generation and URL comparison run in your browser. No request is made to
        the current page or canonical target. Live HTML/headers are not inspected,
        and no search engine is asked which URL it selected as canonical. Site-wide
        analytics or advertising scripts, if enabled, are separate from this
        operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Canonicalization Starts With a Preferred URL, Not With a Tag
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Generating the markup is only one part. The harder decision is whether
            several crawlable URLs are truly duplicate or near-duplicate representations
            of one page and which URL should represent that set in search.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A canonical tag should reinforce a site&apos;s real URL policy:
            internal links, redirects where appropriate, sitemap entries,
            HTTPS/hostname conventions and generated page URLs should not all
            point in different directions.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Self-Referencing Canonicals Are Normal
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A page can point to its own clean preferred URL. That does not mean
            the page is “duplicating itself.” It makes the intended identity
            explicit and gives templates a consistent rule even when the same
            content can also be reached through tracking, sorting or other URL
            variants.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The optional current-page field shows when the generated canonical
            is self-referencing rather than treating self-reference as a
            warning.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Query Parameters Are Not Automatically “Non-Canonical”
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A parameter can be meaningless campaign tracking, or it can identify
            a genuinely distinct page. A product configuration, language choice,
            article state or application route can use a query parameter as
            part of the preferred URL design.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Familiar campaign/click and session-like parameters are flagged for review
            without stripping every query string automatically.
            Canonicalization should follow content identity, not a rule that says
            “URLs with ? are bad.”
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Fragment Is Removed Before Canonical Output
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Fragments such as <code>#installation</code> usually identify a
            location or client-side state inside a document rather than a
            separate HTTP resource. Search canonical documentation tells
            publishers not to use URL fragments for rel=canonical.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The original fragment is recorded before normalization, removed from
            generated output, and reported separately so the change stays visible.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            rel=canonical Is a Signal; a Redirect Changes Navigation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A redirect sends the browser/crawler to another URL. A canonical
            link tells a search system which equivalent URL you prefer while
            leaving the current URL directly accessible.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If an old URL has permanently moved and users should no longer
            access it, a permanent redirect is usually a more direct mechanism.
            Canonical links are especially appropriate when duplicate variants still
            need to exist for users or application behavior.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            HTML and HTTP Link Canonicals Serve Different Delivery Contexts
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML pages commonly declare{" "}
            <code>&lt;link rel="canonical" href="…" &gt;</code> in the document
            head. HTTP&apos;s Link response header can express the same registered
            relation outside HTML and can cover non-HTML resources such as
            PDFs when the consuming search engine supports it.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Avoid publishing conflicting canonical targets in HTML and HTTP
            headers. More canonical declarations are not stronger when they
            disagree.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            A Perfect Tag Can Point to a Bad Target
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            URL-shape checks do not establish the target&apos;s live state.
            A canonical URL can redirect through several hops, return 404, carry
            noindex, be blocked from crawl, require authentication, or point to
            substantially different content.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Before a sitewide rollout, sample real pages and verify that their
            canonical targets are fetchable preferred pages and that the target
            does not declare a contradictory canonical back elsewhere.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Cross-Domain Canonicals Need Stronger Operational Confidence
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Search engines can support canonical references across domains, for
            example when the same article is legitimately syndicated. That does
            not make a cross-domain canonical mandatory or guaranteed to be
            selected.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Confirm that the target is truly the preferred equivalent content,
            remains stable, and is under an ownership/publishing arrangement you
            understand. A typo in another domain is much more consequential
            than a typo in a self-referencing path.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Canonical, Hreflang and Sitemap Signals Should Tell the Same Story
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Localized pages using hreflang generally need canonicalization that
            preserves the intended language/region version rather than
            collapsing every alternate to one language page. Sitemaps should
            likewise list the preferred URLs you want discovered.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When canonical tags, redirects, internal links, hreflang sets and
            sitemap URLs conflict, a search engine has to resolve your
            contradictory signals. Consistency matters more than generating
            any one tag perfectly.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          Google Search Central&apos;s{" "}
          <a
            href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            canonicalization guidance
          </a>{" "}
          covers operational HTML/HTTP rel=canonical behavior,
          redirects, sitemaps, duplicate-URL signals and implementation
          mistakes. The canonical link relation itself is registered in{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc6596"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            RFC 6596
          </a>
          . For the HTTP header syntax itself,{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc8288"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            RFC 8288
          </a>{" "}
          defines Web Linking.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/canonical-tag-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
