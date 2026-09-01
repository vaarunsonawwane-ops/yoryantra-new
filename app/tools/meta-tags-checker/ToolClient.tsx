"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CheckStatus =
  | "Present"
  | "Missing"
  | "Warning"
  | "Info";

type MetaCheck = {
  label: string;
  value: string;
  status: CheckStatus;
  note: string;
};

type MetaAnalysis = {
  checks: MetaCheck[];
  headWarnings: string[];
  sourceWarnings: string[];
};

const SAMPLE_HTML = `<!doctype html>
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
  <meta property="og:image:alt" content="Documentation preview">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>Example documentation page</h1>
</body>
</html>`;

function unique(values: string[]) {
  const result: string[] = [];

  values.forEach((value) => {
    if (
      result.indexOf(value) === -1
    ) {
      result.push(value);
    }
  });

  return result;
}

function getMetaValues(
  document: Document,
  attribute: "name" | "property",
  key: string
) {
  const selector = `meta[${attribute}]`;
  const values: string[] = [];

  Array.from(
    document.querySelectorAll(selector)
  ).forEach((element) => {
    const attributeValue =
      element.getAttribute(attribute) ||
      "";

    if (
      attributeValue
        .trim()
        .toLowerCase() ===
      key.toLowerCase()
    ) {
      values.push(
        (
          element.getAttribute(
            "content"
          ) || ""
        ).trim()
      );
    }
  });

  return values;
}

function firstMetaValue(
  document: Document,
  attribute: "name" | "property",
  key: string
) {
  const values = getMetaValues(
    document,
    attribute,
    key
  );

  return values.length
    ? values[0]
    : "";
}

function httpUrlInfo(
  value: string,
  pageUrl: string
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      absolute: false,
      resolved: "",
      valid: false,
      credentials: false,
      fragment: false,
      tracking: [] as string[],
      error: "empty URL",
    };
  }

  try {
    let parsed: URL;

    if (/^https?:\/\//i.test(trimmed)) {
      parsed = new URL(trimmed);
    } else if (pageUrl) {
      parsed = new URL(trimmed, pageUrl);
    } else {
      return {
        absolute: false,
        resolved: "",
        valid: false,
        credentials: false,
        fragment: trimmed.indexOf("#") !== -1,
        tracking: [] as string[],
        error:
          "relative URL without a page URL for resolution",
      };
    }

    const validProtocol =
      parsed.protocol === "http:" ||
      parsed.protocol === "https:";
    const tracking: string[] = [];

    parsed.searchParams.forEach(
      (_, key) => {
        const lower =
          key.toLowerCase();

        if (
          lower.indexOf("utm_") ===
            0 ||
          lower === "gclid" ||
          lower === "dclid" ||
          lower === "fbclid" ||
          lower === "msclkid"
        ) {
          if (
            tracking.indexOf(key) ===
            -1
          ) {
            tracking.push(key);
          }
        }
      }
    );

    return {
      absolute:
        /^https?:\/\//i.test(
          trimmed
        ),
      resolved: validProtocol
        ? parsed.href
        : "",
      valid: validProtocol,
      credentials: Boolean(
        parsed.username ||
          parsed.password
      ),
      fragment:
        Boolean(parsed.hash),
      tracking,
      error: validProtocol
        ? ""
        : `unsupported protocol ${parsed.protocol}`,
    };
  } catch {
    return {
      absolute: false,
      resolved: "",
      valid: false,
      credentials: false,
      fragment:
        trimmed.indexOf("#") !== -1,
      tracking: [] as string[],
      error: "invalid URL",
    };
  }
}

function normalizedPageUrl(
  raw: string
) {
  const trimmed = raw.trim();

  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);

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

function checkTitle(
  values: string[]
): MetaCheck {
  if (!values.length) {
    return {
      label: "Title element",
      value: "Not present",
      status: "Missing",
      note:
        "No <title> element was found in the parsed HTML.",
    };
  }

  if (values.length > 1) {
    return {
      label: "Title element",
      value: values.join(" | "),
      status: "Warning",
      note: `Found ${values.length} title elements. Keep one clear document title; search engines can still generate a different title link from other page signals.`,
    };
  }

  const value = values[0];

  return {
    label: "Title element",
    value: value || "(empty)",
    status: value
      ? "Present"
      : "Warning",
    note: value
      ? `${Array.from(value).length} characters. This count is editing context only; Google does not publish a fixed title-character limit and can generate title links from multiple sources.`
      : "The title element is empty.",
  };
}

function checkDescription(
  values: string[]
): MetaCheck {
  if (!values.length) {
    return {
      label: "Meta description",
      value: "Not present",
      status: "Missing",
      note:
        "No meta description was found. Google can still build a search snippet from visible page content.",
    };
  }

  if (values.length > 1) {
    return {
      label: "Meta description",
      value: values.join(" | "),
      status: "Warning",
      note: `Found ${values.length} meta descriptions. Review which one is intended to summarize this page.`,
    };
  }

  const value = values[0];

  return {
    label: "Meta description",
    value: value || "(empty)",
    status: value
      ? "Present"
      : "Warning",
    note: value
      ? `${Array.from(value).length} characters. Google does not define a fixed meta-description character limit; snippets are query-dependent and may use page content instead.`
      : "The meta description content is empty.",
  };
}

function checkCanonical(
  values: string[],
  pageUrl: string
): MetaCheck {
  if (!values.length) {
    return {
      label: "Canonical link",
      value: "Not present",
      status: "Info",
      note:
        "No HTML rel=canonical annotation was found. Canonicalization is useful when duplicate or very similar URLs need a representative URL; its absence is not automatically an error on every page.",
    };
  }

  if (values.length > 1) {
    return {
      label: "Canonical link",
      value: values.join(" | "),
      status: "Warning",
      note:
        "Multiple canonical link annotations were found. Competing canonical hints make the intended representative URL harder to reason about.",
    };
  }

  const value = values[0];
  const info = httpUrlInfo(
    value,
    pageUrl
  );
  const issues: string[] = [];

  if (!info.valid) {
    issues.push(
      `cannot be evaluated as an HTTP(S) URL (${info.error})`
    );
  } else {
    if (!info.absolute) {
      issues.push(
        `is relative; it resolves to ${info.resolved}. Absolute canonical URLs are easier to audit and less error-prone`
      );
    }

    if (info.credentials) {
      issues.push(
        "contains embedded username/password credentials"
      );
    }

    if (info.fragment) {
      issues.push(
        "contains a URL fragment; canonical URLs normally identify the document rather than an in-page anchor"
      );
    }

    if (info.tracking.length) {
      issues.push(
        `contains common campaign parameter${
          info.tracking.length === 1
            ? ""
            : "s"
        }: ${info.tracking.join(", ")}`
      );
    }
  }

  if (
    pageUrl &&
    info.valid &&
    info.resolved
  ) {
    try {
      const current = new URL(
        pageUrl
      );
      const canonical =
        new URL(info.resolved);

      current.hash = "";
      canonical.hash = "";

      if (
        current.href ===
        canonical.href
      ) {
        return {
          label: "Canonical link",
          value,
          status:
            issues.length
              ? "Warning"
              : "Present",
          note:
            issues.length
              ? `Self-canonical detected, but review: ${issues.join(
                  "; "
                )}.`
              : "One self-referencing canonical URL is present. Canonical annotations are hints, not guarantees that Google will choose the same URL.",
        };
      }
    } catch {
      // URL validation already handled above.
    }
  }

  return {
    label: "Canonical link",
    value,
    status:
      issues.length
        ? "Warning"
        : "Present",
    note:
      issues.length
        ? `Review this canonical: ${issues.join(
            "; "
          )}.`
        : pageUrl
        ? `The canonical resolves to ${info.resolved}. It differs from the supplied page URL, which may be intentional for a duplicate or alternate URL.`
        : "One HTTP(S) canonical annotation is present. Supply the page URL if you want to compare it with the inspected page.",
  };
}

function checkRobots(
  values: string[],
  label: string
): MetaCheck {
  if (!values.length) {
    return {
      label,
      value: "Not present",
      status: "Info",
      note:
        "No directive was found for this crawler scope.",
    };
  }

  const combined = values
    .join(", ")
    .toLowerCase();
  const tokens = combined
    .split(/[,\s]+/)
    .filter(Boolean);
  const restrictive =
    tokens.some((token) =>
      [
        "noindex",
        "nofollow",
        "none",
        "nosnippet",
        "noimageindex",
        "notranslate",
      ].includes(token)
    );
  const contradiction =
    (tokens.indexOf("index") !==
      -1 &&
      tokens.indexOf("noindex") !==
        -1) ||
    (tokens.indexOf("follow") !==
      -1 &&
      tokens.indexOf("nofollow") !==
        -1);

  if (values.length > 1) {
    return {
      label,
      value: values.join(" | "),
      status: "Warning",
      note:
        contradiction
          ? "Multiple declarations include contradictory indexing or link-following directives. Review the combined crawler behavior rather than assuming one tag wins cleanly."
          : "Multiple declarations were found for this crawler scope. Search engines can combine applicable robots directives, so review the effective result.",
    };
  }

  return {
    label,
    value: values[0],
    status:
      contradiction ||
      restrictive
        ? "Warning"
        : "Present",
    note: contradiction
      ? "The directive contains contradictory index/noindex or follow/nofollow tokens."
      : restrictive
      ? "A restrictive robots directive is present. Confirm that the intended search/snippet behavior matches this page."
      : "Robots metadata is present. Explicit index/follow normally restates default behavior.",
  };
}

function checkSocialField(
  label: string,
  values: string[]
): MetaCheck {
  if (!values.length) {
    return {
      label,
      value: "Not present",
      status: "Info",
      note:
        "This social metadata field was not found. Whether it is needed depends on the preview platforms you support.",
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
    value:
      values[0] || "(empty)",
    status: values[0]
      ? "Present"
      : "Warning",
    note: values[0]
      ? "One value is present."
      : "The metadata declaration exists but its content is empty.",
  };
}

function findDuplicateMetaKeys(
  document: Document
) {
  const counts =
    Object.create(null) as Record<
      string,
      number
    >;

  Array.from(
    document.querySelectorAll("meta")
  ).forEach((element) => {
    const name =
      (
        element.getAttribute(
          "name"
        ) || ""
      )
        .trim()
        .toLowerCase();
    const property =
      (
        element.getAttribute(
          "property"
        ) || ""
      )
        .trim()
        .toLowerCase();

    const key = name
      ? `name:${name}`
      : property
      ? `property:${property}`
      : "";

    if (key) {
      counts[key] =
        (counts[key] || 0) + 1;
    }
  });

  return Object.keys(counts).filter(
    (key) => counts[key] > 1
  );
}

function elementsOutsideHead(
  document: Document
) {
  const labels: string[] = [];

  Array.from(
    document.querySelectorAll(
      "title, meta, link[rel]"
    )
  ).forEach((element) => {
    if (
      !document.head.contains(
        element
      )
    ) {
      if (
        element.tagName.toLowerCase() ===
        "title"
      ) {
        labels.push("<title>");
        return;
      }

      if (
        element.tagName.toLowerCase() ===
        "meta"
      ) {
        const name =
          element.getAttribute(
            "name"
          );
        const property =
          element.getAttribute(
            "property"
          );
        const charset =
          element.getAttribute(
            "charset"
          );

        labels.push(
          charset
            ? "meta charset"
            : name
            ? `meta name="${name}"`
            : property
            ? `meta property="${property}"`
            : "<meta>"
        );

        return;
      }

      if (
        element.tagName.toLowerCase() ===
        "link"
      ) {
        labels.push(
          `link rel="${
            element.getAttribute(
              "rel"
            ) || ""
          }"`
        );
      }
    }
  });

  return unique(labels);
}

function charsetSourceCheck(
  source: string
) {
  const match = source.match(
    /<meta\b[^>]*\bcharset\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+)[^>]*>/i
  );

  if (!match) {
    return {
      found: false,
      within1024: false,
      value: "",
    };
  }

  const index =
    typeof match.index === "number"
      ? match.index
      : 0;
  const end =
    index + match[0].length;
  const bytes = new TextEncoder().encode(
    source.slice(0, end)
  ).length;
  const valueMatch =
    match[0].match(
      /\bcharset\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i
    );
  const value = valueMatch
    ? (
        valueMatch[1] ||
        valueMatch[2] ||
        valueMatch[3] ||
        ""
      ).trim()
    : "";

  return {
    found: true,
    within1024: bytes <= 1024,
    value,
  };
}

function analyzeMetaTags(
  source: string,
  rawPageUrl: string
): MetaAnalysis {
  if (
    typeof window ===
    "undefined"
  ) {
    throw new Error(
      "This tool must run in a browser."
    );
  }

  const pageUrl =
    rawPageUrl.trim()
      ? normalizedPageUrl(
          rawPageUrl
        )
      : "";

  if (
    rawPageUrl.trim() &&
    !pageUrl
  ) {
    throw new Error(
      "Page URL must be an absolute HTTP or HTTPS URL without embedded credentials."
    );
  }

  const parser = new DOMParser();
  const document =
    parser.parseFromString(
      source,
      "text/html"
    );
  const checks: MetaCheck[] = [];
  const headWarnings: string[] = [];
  const sourceWarnings: string[] = [];

  const titles = Array.from(
    document.querySelectorAll("title")
  ).map((element) =>
    (
      element.textContent || ""
    ).trim()
  );

  checks.push(
    checkTitle(titles)
  );

  const descriptions =
    getMetaValues(
      document,
      "name",
      "description"
    );

  checks.push(
    checkDescription(descriptions)
  );

  const canonicalLinks =
    Array.from(
      document.querySelectorAll(
        "link"
      )
    )
      .filter((element) =>
        (
          element.getAttribute(
            "rel"
          ) || ""
        )
          .toLowerCase()
          .split(/\s+/)
          .includes("canonical")
      )
      .map((element) =>
        (
          element.getAttribute(
            "href"
          ) || ""
        ).trim()
      )
      .filter(Boolean);

  checks.push(
    checkCanonical(
      canonicalLinks,
      pageUrl
    )
  );

  checks.push(
    checkRobots(
      getMetaValues(
        document,
        "name",
        "robots"
      ),
      "Robots meta"
    )
  );

  const googlebot =
    getMetaValues(
      document,
      "name",
      "googlebot"
    );

  if (googlebot.length) {
    checks.push(
      checkRobots(
        googlebot,
        "Googlebot meta"
      )
    );
  }

  const keywords =
    getMetaValues(
      document,
      "name",
      "keywords"
    );

  if (keywords.length) {
    checks.push({
      label: "Meta keywords",
      value: keywords.join(" | "),
      status: "Warning",
      note:
        "Google Search does not use the meta keywords tag for indexing or ranking. Keep it only if another system genuinely requires it.",
    });
  }

  const charsetInfo =
    charsetSourceCheck(source);

  checks.push({
    label: "Character encoding",
    value: charsetInfo.found
      ? charsetInfo.value ||
        "(empty charset)"
      : "No <meta charset> found",
    status:
      charsetInfo.found &&
      charsetInfo.value.toLowerCase() ===
        "utf-8" &&
      charsetInfo.within1024
        ? "Present"
        : charsetInfo.found
        ? "Warning"
        : "Info",
    note: !charsetInfo.found
      ? "No short-form meta charset declaration was found. The HTTP Content-Type header can also supply the document encoding, which pasted HTML alone cannot inspect."
      : charsetInfo.value.toLowerCase() !==
        "utf-8"
      ? "HTML's current authoring rules require a meta charset declaration to identify UTF-8."
      : charsetInfo.within1024
      ? "The UTF-8 meta charset declaration is serialized within the first 1024 bytes of the pasted source."
      : "The meta charset declaration begins too late in the source to satisfy the HTML authoring requirement that the complete declaration be within the first 1024 bytes.",
  });

  const viewport =
    firstMetaValue(
      document,
      "name",
      "viewport"
    );

  checks.push({
    label: "Viewport",
    value:
      viewport || "Not present",
    status: viewport
      ? "Present"
      : "Info",
    note: viewport
      ? "A viewport declaration is present for browser layout behavior."
      : "No viewport meta tag was found. This is a mobile-layout concern, not a standalone SEO scoring rule.",
  });

  const lang =
    (
      document.documentElement.getAttribute(
        "lang"
      ) || ""
    ).trim();

  checks.push({
    label: "HTML lang",
    value:
      lang || "Not present",
    status: lang
      ? "Present"
      : "Info",
    note: lang
      ? "The document language annotation is present. It helps browsers and accessibility tools; Google determines page language primarily from visible content."
      : "No HTML lang attribute was found. That does not by itself determine Google indexing language, but it is useful for browsers and accessibility.",
  });

  const h1Count =
    document.querySelectorAll(
      "h1"
    ).length;

  checks.push({
    label: "H1 headings",
    value: String(h1Count),
    status: "Info",
    note:
      "Heading count is context only. This checker does not enforce a fictional rule that every page must contain exactly one H1.",
  });

  const ogFields = [
    "og:title",
    "og:description",
    "og:url",
    "og:type",
    "og:image",
    "og:image:alt",
  ];

  ogFields.forEach((field) => {
    checks.push(
      checkSocialField(
        `Open Graph ${field.slice(
          3
        )}`,
        getMetaValues(
          document,
          "property",
          field
        )
      )
    );
  });

  const twitterFields = [
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:image:alt",
  ];

  twitterFields.forEach(
    (field) => {
      checks.push(
        checkSocialField(
          `X/Twitter ${field.slice(
            8
          )}`,
          unique([
            ...getMetaValues(
              document,
              "name",
              field
            ),
            ...getMetaValues(
              document,
              "property",
              field
            ),
          ])
        )
      );
    }
  );

  const ogUrl =
    firstMetaValue(
      document,
      "property",
      "og:url"
    );

  if (ogUrl) {
    const info =
      httpUrlInfo(
        ogUrl,
        pageUrl
      );

    if (!info.valid) {
      sourceWarnings.push(
        `og:url cannot be resolved as HTTP(S): ${info.error}.`
      );
    } else {
      if (
        !info.absolute
      ) {
        sourceWarnings.push(
          `og:url is relative and resolves to ${info.resolved}. Social metadata is easier to audit with an absolute URL.`
        );
      }

      if (
        info.tracking.length
      ) {
        sourceWarnings.push(
          `og:url contains campaign parameter${
            info.tracking.length ===
            1
              ? ""
              : "s"
          }: ${info.tracking.join(
            ", "
          )}.`
        );
      }
    }
  }

  const ogImage =
    firstMetaValue(
      document,
      "property",
      "og:image"
    );

  if (ogImage) {
    const info =
      httpUrlInfo(
        ogImage,
        pageUrl
      );

    if (!info.valid) {
      sourceWarnings.push(
        `og:image cannot be resolved as HTTP(S): ${info.error}.`
      );
    } else if (
      !info.absolute
    ) {
      sourceWarnings.push(
        `og:image is relative and resolves to ${info.resolved}. Absolute social-image URLs are more portable across crawlers.`
      );
    }
  }

  const twitterImage =
    firstMetaValue(
      document,
      "name",
      "twitter:image"
    ) ||
    firstMetaValue(
      document,
      "property",
      "twitter:image"
    );

  if (twitterImage) {
    const info =
      httpUrlInfo(
        twitterImage,
        pageUrl
      );

    if (
      !info.valid
    ) {
      sourceWarnings.push(
        `twitter:image cannot be resolved as HTTP(S): ${info.error}.`
      );
    }
  }

  const duplicateMetaKeys =
    findDuplicateMetaKeys(
      document
    );

  if (
    duplicateMetaKeys.length
  ) {
    checks.push({
      label:
        "Duplicate metadata declarations",
      value:
        duplicateMetaKeys.join(
          ", "
        ),
      status: "Warning",
      note:
        "Multiple declarations for the same metadata key can make framework output and crawler behavior harder to reason about. Review whether each duplicate is intentional.",
    });
  }

  const outside =
    elementsOutsideHead(
      document
    );

  if (outside.length) {
    headWarnings.push(
      `Metadata-related element${
        outside.length === 1
          ? ""
          : "s"
      } parsed outside <head>: ${outside.join(
        ", "
      )}. Placement can affect whether metadata is processed as intended.`
    );
  }

  if (
    pageUrl &&
    canonicalLinks.length === 1
  ) {
    const canonical =
      httpUrlInfo(
        canonicalLinks[0],
        pageUrl
      );

    if (
      canonical.valid &&
      canonical.resolved
    ) {
      const current =
        new URL(pageUrl);
      const target =
        new URL(
          canonical.resolved
        );

      current.hash = "";
      target.hash = "";

      if (
        current.protocol ===
          "https:" &&
        target.protocol ===
          "http:"
      ) {
        sourceWarnings.push(
          "The supplied HTTPS page URL points canonically to HTTP. Review whether this is an accidental protocol downgrade."
        );
      }
    }
  }

  return {
    checks,
    headWarnings,
    sourceWarnings,
  };
}

function formatReport(
  analysis: MetaAnalysis
) {
  const lines: string[] = [];

  analysis.checks.forEach(
    (check) => {
      lines.push(
        `${check.status.toUpperCase()} — ${check.label}`,
        `Value: ${check.value}`,
        check.note,
        ""
      );
    }
  );

  if (
    analysis.headWarnings.length
  ) {
    lines.push(
      "HEAD PLACEMENT",
      ...analysis.headWarnings.map(
        (item) => `- ${item}`
      ),
      ""
    );
  }

  if (
    analysis.sourceWarnings.length
  ) {
    lines.push(
      "URL / SOURCE REVIEW",
      ...analysis.sourceWarnings.map(
        (item) => `- ${item}`
      )
    );
  }

  return lines
    .join("\n")
    .replace(/\s+$/, "");
}

export default function ToolClient() {
  const [pageUrl, setPageUrl] =
    useState("");
  const [input, setInput] =
    useState("");
  const [analysis, setAnalysis] =
    useState<MetaAnalysis | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const checkMetaTags = () => {
    if (!input.trim()) {
      setError(
        "Paste HTML source code to inspect."
      );
      setAnalysis(null);
      return;
    }

    try {
      setAnalysis(
        analyzeMetaTags(
          input,
          pageUrl
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setAnalysis(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to inspect this HTML."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setPageUrl(
      "https://example.com/docs"
    );
    setInput(SAMPLE_HTML);
    setAnalysis(null);
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setPageUrl("");
    setInput("");
    setAnalysis(null);
    setError("");
    setCopied(false);
  };

  const copyReport = async () => {
    if (!analysis) return;

    try {
      await navigator.clipboard.writeText(
        formatReport(analysis)
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The metadata report could not be copied. Select and copy it manually."
      );
    }
  };

  const statusOrder: CheckStatus[] =
    [
      "Warning",
      "Missing",
      "Present",
      "Info",
    ];

  return (
    <ToolShell
      title="Meta Tags Checker"
      description="Inspect pasted HTML as a metadata implementation, not an SEO score: title, description, canonical, robots, charset, viewport, language, Open Graph, X cards, duplicates, URL context, and head placement."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Page URL{" "}
          <span className="font-normal text-gray-500">
            (optional, but useful)
          </span>
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Add the URL the HTML belongs to if you want relative canonical/social
          URLs resolved and the canonical compared with the inspected page.
          Nothing is fetched.
        </p>
        <input
          type="url"
          value={pageUrl}
          onChange={(event: {
            target: { value: string };
          }) => {
            setPageUrl(
              event.target.value
            );
            setAnalysis(null);
            setError("");
            setCopied(false);
          }}
          placeholder="https://example.com/docs"
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          HTML source
        </label>
        <textarea
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            setAnalysis(null);
            setError("");
            setCopied(false);
          }}
          placeholder={SAMPLE_HTML}
          spellCheck={false}
          className="w-full min-h-[380px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste the HTML source you want to inspect. The browser parses this
          text locally; this checker does not request the live page, HTTP
          headers, robots.txt, sitemap, JavaScript-rendered network responses,
          or the social image.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={checkMetaTags}
          className="yoryantra-btn"
        >
          Check Meta Tags
        </button>

        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>

        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {analysis ? (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Metadata Report
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Missing social fields are informational; missing document/search
                metadata is evaluated separately.
              </p>
            </div>

            <button
              type="button"
              onClick={copyReport}
              className="yoryantra-btn-outline text-sm"
            >
              {copied
                ? "Copied"
                : "Copy report"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statusOrder.map(
              (status) => (
                <div
                  key={status}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {status}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-gray-900">
                    {
                      analysis.checks.filter(
                        (check) =>
                          check.status ===
                          status
                      ).length
                    }
                  </div>
                </div>
              )
            )}
          </div>

          {analysis.headWarnings.length ||
          analysis.sourceWarnings.length ? (
            <div className="mt-5 space-y-3">
              {analysis.headWarnings
                .length ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
                  <strong>
                    Head placement:
                  </strong>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {analysis.headWarnings.map(
                      (
                        warning,
                        index
                      ) => (
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

              {analysis.sourceWarnings
                .length ? (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
                  <strong>
                    URL / source review:
                  </strong>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {analysis.sourceWarnings.map(
                      (
                        warning,
                        index
                      ) => (
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
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {analysis.checks.map(
              (check, index) => (
                <div
                  key={`${check.label}-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {check.label}
                    </h4>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {check.status}
                    </span>
                  </div>

                  <p className="mt-3 break-words text-sm text-gray-700">
                    <strong>
                      Value:
                    </strong>{" "}
                    {check.value || "—"}
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {check.note}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Search, canonical, robots, charset, social, duplicate, and placement findings will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Inspection happens on the HTML and optional page URL supplied in your
        browser. No remote page or preview crawler is contacted. Site-wide
        analytics or advertising scripts, if enabled, are separate from this
        metadata inspection.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Meta Tags Checker Is Most Useful When It Explains Conflicting Signals
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A page can have a perfectly reasonable title and description while
            also carrying two canonical tags, a noindex directive, an Open
            Graph URL with campaign parameters, or metadata injected outside
            the document head. A simple checklist that says “title present,
            description present” can miss the part that actually changes how
            the page is interpreted.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool reports individual fields, then adds relationship and
            placement checks where they change the meaning. It does not turn the
            result into a percentage score because metadata quality is not a
            point system.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            The Supplied Page URL Turns a Relative Canonical From a String Into a Relationship
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Page being inspected:
https://example.com/docs/page

HTML:
<link rel="canonical" href="/docs/page">

Resolved canonical:
https://example.com/docs/page`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            Without the page URL, a relative value can only be described as
            relative. With the page URL, the checker can resolve it, determine
            whether it is self-referencing, and notice problems such as an HTTPS
            page canonically pointing to HTTP.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Absolute canonical URLs remain easier to audit and less vulnerable
            to base-URL mistakes, which is why Google recommends them as a
            practical implementation choice.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Canonical and noindex Are Not Two Ways to Say “Do Not Show This URL”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A canonical is a hint about which URL should represent duplicate or
            very similar content. <code>noindex</code> is an indexing directive
            telling a supporting crawler not to show that page in search
            results. They solve different problems.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google can choose a different canonical from the one you specify,
            while a page carrying a usable noindex directive is asking not to be
            indexed. Review combinations deliberately instead of treating both
            as generic “SEO tags.”
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Campaign Parameters Usually Describe the Visit, Not the Canonical Document
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            URLs containing <code>utm_source</code>, <code>gclid</code>,{" "}
            <code>fbclid</code>, or similar identifiers are often tracking
            variants of a stable content URL. If one of those variants appears
            in <code>rel=canonical</code>, review whether the page is
            accidentally declaring the campaign-specific URL as its
            representative.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The checker warns rather than deleting parameters automatically.
            Some applications genuinely use query parameters to identify
            distinct content, so canonicalization needs site context.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Title and Description Lengths Are Display Constraints, Not Fixed Ranking Rules
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Search engines can rewrite title links and build snippets from page
            content. Google does not publish a fixed title character limit or a
            fixed meta-description character limit that guarantees how many
            characters appear in every result.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Character counts are still useful editorial context: a title can be
            obviously bloated or a description can be empty. The important
            distinction is not to convert those counts into invented pass/fail
            SEO rules.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Character Encoding Is One Metadata Field Where Physical Source Position Matters
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Current HTML authoring rules require a meta-based character
            encoding declaration to identify UTF-8, and the complete declaration
            must be serialized within the first 1024 bytes of the document.
            That is why this checker inspects the source position rather than
            only asking DOMParser whether a charset element exists.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The HTTP <code>Content-Type</code> header can also determine the
            encoding. Because this page analyzes pasted HTML and makes no HTTP
            request, it cannot tell you whether the real server sends a
            conflicting or authoritative transport-level declaration.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Open Graph and X Metadata Can Be Correct While the Preview Is Still Wrong
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A valid <code>og:image</code> string does not prove that the image
            exists, returns the expected content type, is reachable by the
            social crawler, fits the platform&apos;s image requirements, or has
            refreshed in that platform&apos;s preview cache.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This checker deliberately stops at markup inspection. Use the real
            platform&apos;s preview/debugging workflow when you need to verify a
            fetched card rather than the HTML declaration.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Metadata Outside &lt;head&gt; Is Worth Investigating Even If DOMParser Can Still See It
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser HTML parsing can recover from malformed markup, which means
            a DOM query may still find metadata even when the source is placed
            somewhere unexpected. Search and social metadata is intended to be
            document metadata, so framework or CMS output that pushes it into
            the body deserves a source-level fix.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Inspect the deployed HTML when duplicate layouts, nested head
            managers, hydration, or CMS plugins may be generating tags in more
            than one place.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Why Meta Keywords Are Only Reported When They Exist
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google Search does not use the meta keywords tag for web ranking.
            Adding a “keywords” field to every metadata checklist makes an SEO
            tool look comprehensive while teaching an obsolete workflow.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If a pasted page already contains the tag, Yoryantra reports it so
            you can decide whether some non-Google system still depends on it.
            Its absence is not a problem that needs fixing.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          Google Search Central&apos;s{" "}
          <a
            href="https://developers.google.com/search/docs/appearance/title-link"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            title-link guidance
          </a>
          ,{" "}
          <a
            href="https://developers.google.com/search/docs/appearance/snippet"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            snippet guidance
          </a>
          , and{" "}
          <a
            href="https://developers.google.com/search/docs/crawling-indexing/canonicalization"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            canonicalization documentation
          </a>{" "}
          are useful here because they directly constrain what this checker
          should and should not call an error. The HTML encoding-position rule
          comes from the current WHATWG HTML Standard.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/meta-tags-checker" />
        </div>
      </section>
    </ToolShell>
  );
}
