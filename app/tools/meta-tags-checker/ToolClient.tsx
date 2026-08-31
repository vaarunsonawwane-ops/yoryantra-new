"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CheckStatus = "Present" | "Missing" | "Warning" | "Info";

type MetaCheck = {
  label: string;
  value: string;
  status: CheckStatus;
  note: string;
};

const sampleHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Example documentation page</title>
  <meta name="description" content="A concise description of this specific page.">
  <link rel="canonical" href="https://example.com/docs">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="Example documentation page">
  <meta property="og:description" content="A concise social description.">
  <meta property="og:url" content="https://example.com/docs">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://example.com/preview.jpg">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>Example documentation page</h1>
</body>
</html>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [checks, setChecks] = useState<MetaCheck[] | null>(null);
  const [error, setError] = useState("");

  const checkMetaTags = () => {
    if (!input.trim()) {
      setError("Paste HTML source code to inspect.");
      setChecks(null);
      return;
    }

    try {
      setChecks(analyzeMetaTags(input));
      setError("");
    } catch (err) {
      setChecks(null);
      setError(
        err instanceof Error ? err.message : "Unable to inspect this HTML."
      );
    }
  };

  const loadExample = () => {
    setInput(sampleHtml);
    setChecks(null);
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setChecks(null);
    setError("");
  };

  const report = checks ? formatReport(checks) : "";

  return (
    <ToolShell
      title="Meta Tags Checker"
      description="Inspect pasted HTML for title, meta description, robots, canonical, Open Graph, X/Twitter Card, charset, viewport, language, and duplicate metadata."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          HTML source
        </label>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleHtml}
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste the HTML you want to inspect. The browser parses this text
          locally; this tool does not fetch a remote page.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkMetaTags} className="yoryantra-btn">
          Check Meta Tags
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

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Metadata Report
          </h3>
          {report && (
            <button
              onClick={() => navigator.clipboard.writeText(report)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy Report
            </button>
          )}
        </div>

        {checks ? (
          <div className="yoryantra-output">
            <div className="grid gap-4 md:grid-cols-4">
              {(["Present", "Warning", "Missing", "Info"] as CheckStatus[]).map(
                (status) => (
                  <div
                    key={status}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {status}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {checks.filter((check) => check.status === status).length}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 space-y-4">
              {checks.map((check, index) => (
                <div
                  key={`${check.label}-${index}`}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{check.label}</h4>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {check.status}
                    </span>
                  </div>
                  <p className="mt-3 break-words text-sm text-gray-700">
                    <strong>Value:</strong> {check.value || "—"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {check.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
            Metadata findings will appear here.
          </pre>
        )}
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            This Is an HTML Metadata Inspector, Not a Ranking Score
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The tool reports what is present, duplicated, missing, or worth
            reviewing. It does not assign an arbitrary SEO score or treat fixed
            character counts as Google ranking rules. Google can generate title
            links from several page signals, and search snippets are primarily
            generated from page content with the meta description used when it
            is a better fit.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Canonical and Robots Signals Need Context
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A canonical link is a preference signal for duplicate or very
            similar URLs, not a guarantee that a search engine will select that
            exact URL. A robots meta value such as noindex has a very different
            effect from an omitted robots tag, while explicit index and follow
            values usually repeat default behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Meta Keywords Are Reported Only When They Exist
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            If the pasted HTML contains a meta keywords tag, this checker calls
            it out because Google Search does not use that tag for indexing or
            ranking. The tool does not recommend adding one when it is absent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Google Search References
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://developers.google.com/search/docs/appearance/title-link"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              Title links
            </a>
            <a
              href="https://developers.google.com/search/docs/appearance/snippet"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              Search snippets
            </a>
            <a
              href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              Canonical URLs
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/meta-tags-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function analyzeMetaTags(source: string) {
  if (typeof window === "undefined") {
    throw new Error("This tool must run in a browser.");
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(source, "text/html");
  const checks: MetaCheck[] = [];

  const titles = Array.from(document.querySelectorAll("title")).map((element) =>
    (element.textContent || "").trim()
  );
  checks.push(checkTitle(titles));

  const descriptions = getMetaValues(document, "name", "description");
  checks.push(checkDescription(descriptions));

  const canonicalLinks = Array.from(document.querySelectorAll("link"))
    .filter((element) =>
      (element.getAttribute("rel") || "")
        .toLowerCase()
        .split(/\s+/)
        .includes("canonical")
    )
    .map((element) => (element.getAttribute("href") || "").trim())
    .filter(Boolean);
  checks.push(checkCanonical(canonicalLinks));

  const robotsValues = getMetaValues(document, "name", "robots");
  checks.push(checkRobots(robotsValues));

  const keywords = getMetaValues(document, "name", "keywords");
  if (keywords.length) {
    checks.push({
      label: "Meta keywords",
      value: keywords.join(" | "),
      status: "Warning",
      note:
        "Google Search does not use the meta keywords tag for indexing or ranking. Keep it only if another system genuinely needs it.",
    });
  }

  const charset =
    document.querySelector("meta[charset]")?.getAttribute("charset")?.trim() || "";
  checks.push({
    label: "Character encoding",
    value: charset || "Not declared with <meta charset>",
    status: charset ? "Present" : "Info",
    note: charset
      ? "A meta charset declaration is present."
      : "No short-form meta charset declaration was found. The HTTP Content-Type header can also declare encoding.",
  });

  const viewport = firstMetaValue(document, "name", "viewport");
  checks.push({
    label: "Viewport",
    value: viewport || "Not present",
    status: viewport ? "Present" : "Info",
    note: viewport
      ? "A viewport declaration is present for browser layout behavior."
      : "No viewport meta tag was found. This is a mobile-layout concern, not a standalone SEO score.",
  });

  const lang = document.documentElement.getAttribute("lang")?.trim() || "";
  checks.push({
    label: "HTML lang",
    value: lang || "Not present",
    status: lang ? "Present" : "Info",
    note: lang
      ? "The HTML language attribute is present. It is useful to browsers and accessibility tools; Google Search determines page language from visible content rather than relying on this annotation."
      : "No HTML lang attribute was found. Google Search does not rely on it to determine page language, but it is still useful for browsers and accessibility.",
  });

  const h1Count = document.querySelectorAll("h1").length;
  checks.push({
    label: "H1 headings",
    value: String(h1Count),
    status: "Info",
    note:
      "Heading structure is reported for context. This checker does not enforce a fictional rule that every page must contain exactly one H1.",
  });

  const ogFields = ["og:title", "og:description", "og:url", "og:type", "og:image"];
  ogFields.forEach((field) => {
    const values = getMetaValues(document, "property", field);
    checks.push(checkSocialField(`Open Graph ${field.slice(3)}`, values));
  });

  const twitterFields = [
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
  ];
  twitterFields.forEach((field) => {
    const values = unique([
      ...getMetaValues(document, "name", field),
      ...getMetaValues(document, "property", field),
    ]);
    checks.push(checkSocialField(`X/Twitter ${field.slice(8)}`, values));
  });

  const duplicateMetaKeys = findDuplicateMetaKeys(document);
  if (duplicateMetaKeys.length) {
    checks.push({
      label: "Duplicate metadata declarations",
      value: duplicateMetaKeys.join(", "),
      status: "Warning",
      note:
        "Multiple declarations for the same metadata key can make generated output or crawler interpretation harder to reason about. Review whether the duplicates are intentional.",
    });
  }

  return checks;
}

function checkTitle(values: string[]): MetaCheck {
  if (!values.length) {
    return {
      label: "Title element",
      value: "Not present",
      status: "Missing",
      note: "No <title> element was found in the parsed HTML.",
    };
  }

  if (values.length > 1) {
    return {
      label: "Title element",
      value: values.join(" | "),
      status: "Warning",
      note: `Found ${values.length} title elements. Keep one clear document title. Google may still generate a different title link from other page signals.`,
    };
  }

  const value = values[0];
  return {
    label: "Title element",
    value: value || "(empty)",
    status: value ? "Present" : "Warning",
    note: value
      ? `${Array.from(value).length} characters. Google does not publish a fixed title character limit; title links are truncated as needed and can be generated from multiple page signals.`
      : "The title element is empty.",
  };
}

function checkDescription(values: string[]): MetaCheck {
  if (!values.length) {
    return {
      label: "Meta description",
      value: "Not present",
      status: "Missing",
      note:
        "No meta description was found. Google can still generate a snippet from page content.",
    };
  }

  if (values.length > 1) {
    return {
      label: "Meta description",
      value: values.join(" | "),
      status: "Warning",
      note: `Found ${values.length} meta descriptions. Review which description should represent this page.`,
    };
  }

  const value = values[0];
  return {
    label: "Meta description",
    value: value || "(empty)",
    status: value ? "Present" : "Warning",
    note: value
      ? `${Array.from(value).length} characters. Google does not define a fixed meta-description length limit; snippets are query-dependent and may use page content instead.`
      : "The meta description content is empty.",
  };
}

function checkCanonical(values: string[]): MetaCheck {
  if (!values.length) {
    return {
      label: "Canonical link",
      value: "Not present",
      status: "Info",
      note:
        "No canonical annotation was found. A canonical is useful when you want to signal a preferred URL among duplicate or very similar pages; it is not mandatory for every document.",
    };
  }

  if (values.length > 1) {
    return {
      label: "Canonical link",
      value: values.join(" | "),
      status: "Warning",
      note:
        "Multiple canonical link annotations were found. Use one consistent canonical preference.",
    };
  }

  const value = values[0];
  const absolute = /^https?:\/\//i.test(value);
  return {
    label: "Canonical link",
    value,
    status: absolute ? "Present" : "Warning",
    note: absolute
      ? "One absolute HTTP(S) canonical URL is present. Canonical annotations are signals, not guarantees."
      : "The canonical value is relative or uses a non-HTTP(S) form. Google recommends absolute URLs for rel=canonical annotations.",
  };
}

function checkRobots(values: string[]): MetaCheck {
  if (!values.length) {
    return {
      label: "Robots meta",
      value: "Not present",
      status: "Info",
      note:
        "No robots meta tag was found. For normal pages, index and link-following behavior does not require an explicit index,follow tag.",
    };
  }

  const combined = values.join(", ").toLowerCase();
  const restrictive = /\b(noindex|nofollow|none|nosnippet|noimageindex)\b/.test(
    combined
  );

  return {
    label: "Robots meta",
    value: values.join(" | "),
    status: restrictive ? "Warning" : "Present",
    note: restrictive
      ? "A restrictive robots directive is present. Confirm that it matches the intended indexing or snippet behavior."
      : "Robots metadata is present. Explicit index/follow directives usually restate default behavior.",
  };
}

function checkSocialField(label: string, values: string[]): MetaCheck {
  if (!values.length) {
    return {
      label,
      value: "Not present",
      status: "Info",
      note:
        "This social metadata field was not found. Whether it is needed depends on the sharing platforms and preview behavior you support.",
    };
  }

  if (values.length > 1) {
    return {
      label,
      value: values.join(" | "),
      status: "Warning",
      note: `Found ${values.length} declarations for this social metadata field.`,
    };
  }

  return {
    label,
    value: values[0],
    status: values[0] ? "Present" : "Warning",
    note: values[0]
      ? "Social-preview metadata is present."
      : "The metadata element exists but its content is empty.",
  };
}

function getMetaValues(
  document: Document,
  attribute: "name" | "property",
  expected: string
) {
  const lowerExpected = expected.toLowerCase();
  return Array.from(document.querySelectorAll("meta"))
    .filter(
      (element) =>
        (element.getAttribute(attribute) || "").trim().toLowerCase() ===
        lowerExpected
    )
    .map((element) => (element.getAttribute("content") || "").trim());
}

function firstMetaValue(
  document: Document,
  attribute: "name" | "property",
  expected: string
) {
  return getMetaValues(document, attribute, expected)[0] || "";
}

function findDuplicateMetaKeys(document: Document) {
  const counts = new Map<string, number>();

  Array.from(document.querySelectorAll("meta")).forEach((element) => {
    const name = (element.getAttribute("name") || "").trim().toLowerCase();
    const property = (element.getAttribute("property") || "").trim().toLowerCase();
    const key = name ? `name=${name}` : property ? `property=${property}` : "";
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .filter((entry) => entry[1] > 1)
    .map((entry) => `${entry[0]} (${entry[1]})`);
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function formatReport(checks: MetaCheck[]) {
  const lines = [
    "Meta tags inspection",
    "",
    ...(["Present", "Warning", "Missing", "Info"] as CheckStatus[]).map(
      (status) =>
        `${status}: ${checks.filter((check) => check.status === status).length}`
    ),
    "",
  ];

  checks.forEach((check, index) => {
    lines.push(
      `${index + 1}. ${check.label} — ${check.status}`,
      `   Value: ${check.value || "—"}`,
      `   Note: ${check.note}`,
      ""
    );
  });

  return lines.join("\n").trim();
}
