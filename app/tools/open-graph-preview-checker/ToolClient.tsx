"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type SocialIssue = {
  level: "Warning" | "Note";
  message: string;
};

type MetaItem = {
  key: string;
  value: string;
  source: "property" | "name";
  order: number;
};

type ImageCandidate = {
  url: string;
  alt: string;
  width: string;
  height: string;
  type: string;
};

type SocialData = {
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  ogLocale: string;
  ogImages: ImageCandidate[];
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;
  htmlTitle: string;
  metaDescription: string;
  canonical: string;
};

type SocialReport = {
  data: SocialData;
  issues: SocialIssue[];
  duplicateTags: Array<{
    key: string;
    values: string[];
  }>;
};

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <title>Example URL Debugging Guide</title>
  <meta name="description" content="A practical guide to redirects, canonicals, and query parameters.">
  <link rel="canonical" href="https://example.com/guides/url-debugging">

  <meta property="og:title" content="Example URL Debugging Guide">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://example.com/guides/url-debugging">
  <meta property="og:image" content="https://example.com/images/url-guide.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Browser address bar with URL components highlighted">
  <meta property="og:description" content="A practical guide to redirects, canonicals, and query parameters.">
  <meta property="og:site_name" content="Example Site">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Example URL Debugging Guide">
  <meta name="twitter:description" content="A practical guide to redirects, canonicals, and query parameters.">
  <meta name="twitter:image" content="https://example.com/images/url-guide.jpg">
</head>
</html>`;

function normalizePageUrl(raw: string) {
  const value = raw.trim();

  if (!value) return "";

  try {
    const parsed = new URL(value);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return "";
    }

    if (parsed.username || parsed.password) {
      return "";
    }

    parsed.hash = "";

    return parsed.href;
  } catch {
    return "";
  }
}

function resolveHttpUrl(
  raw: string,
  pageUrl: string
) {
  const value = raw.trim();

  if (!value) {
    return {
      valid: false,
      absolute: false,
      resolved: "",
      credentials: false,
      protocol: "",
    };
  }

  try {
    let parsed: URL;
    const absolute =
      /^https?:\/\//i.test(value);

    if (absolute) {
      parsed = new URL(value);
    } else if (pageUrl) {
      parsed = new URL(value, pageUrl);
    } else {
      return {
        valid: false,
        absolute: false,
        resolved: "",
        credentials: false,
        protocol: "",
      };
    }

    const valid =
      parsed.protocol === "http:" ||
      parsed.protocol === "https:";

    return {
      valid,
      absolute,
      resolved: valid ? parsed.href : "",
      credentials: Boolean(
        parsed.username || parsed.password
      ),
      protocol: parsed.protocol,
    };
  } catch {
    return {
      valid: false,
      absolute: false,
      resolved: "",
      credentials: false,
      protocol: "",
    };
  }
}

function collectMeta(document: Document) {
  const items: MetaItem[] = [];
  let order = 0;

  Array.from(
    document.getElementsByTagName("meta")
  ).forEach((element) => {
    const property = (
      element.getAttribute("property") || ""
    )
      .trim()
      .toLowerCase();
    const name = (
      element.getAttribute("name") || ""
    )
      .trim()
      .toLowerCase();
    const content = (
      element.getAttribute("content") || ""
    ).trim();

    if (property) {
      items.push({
        key: `property:${property}`,
        value: content,
        source: "property",
        order,
      });
      order += 1;
    } else if (name) {
      items.push({
        key: `name:${name}`,
        value: content,
        source: "name",
        order,
      });
      order += 1;
    }
  });

  return items;
}

function valuesFor(
  items: MetaItem[],
  keys: string[]
) {
  return items
    .filter(
      (item) =>
        keys.indexOf(item.key) !== -1
    )
    .sort(
      (a, b) => a.order - b.order
    )
    .map((item) => item.value);
}

function firstValue(
  items: MetaItem[],
  keys: string[]
) {
  const values = valuesFor(items, keys);
  return values.length ? values[0] : "";
}

function collectDuplicates(items: MetaItem[]) {
  const grouped =
    Object.create(null) as Record<
      string,
      string[]
    >;

  items.forEach((item) => {
    if (!grouped[item.key]) {
      grouped[item.key] = [];
    }

    grouped[item.key].push(item.value);
  });

  return Object.keys(grouped)
    .filter(
      (key) =>
        grouped[key].length > 1
    )
    .map((key) => ({
      key,
      values: grouped[key],
    }));
}

function collectOgImages(items: MetaItem[]) {
  const images: ImageCandidate[] = [];
  let current: ImageCandidate | null =
    null;

  items
    .filter(
      (item) =>
        item.key.indexOf(
          "property:og:image"
        ) === 0
    )
    .sort(
      (a, b) => a.order - b.order
    )
    .forEach((item) => {
      const property =
        item.key.slice(
          "property:".length
        );

      if (property === "og:image") {
        current = {
          url: item.value,
          alt: "",
          width: "",
          height: "",
          type: "",
        };
        images.push(current);
        return;
      }

      if (property === "og:image:url") {
        if (!current) {
          current = {
            url: item.value,
            alt: "",
            width: "",
            height: "",
            type: "",
          };
          images.push(current);
        } else {
          current.url = item.value;
        }
        return;
      }

      if (!current) {
        return;
      }

      if (
        property ===
        "og:image:alt"
      ) {
        current.alt = item.value;
      } else if (
        property ===
        "og:image:width"
      ) {
        current.width =
          item.value;
      } else if (
        property ===
        "og:image:height"
      ) {
        current.height =
          item.value;
      } else if (
        property ===
        "og:image:type"
      ) {
        current.type =
          item.value;
      }
    });

  return images;
}

function getCanonical(document: Document) {
  const links = Array.from(
    document.getElementsByTagName("link")
  ).filter((element) =>
    (
      element.getAttribute("rel") || ""
    )
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .indexOf("canonical") !== -1
  );

  return links.length
    ? (
        links[0].getAttribute("href") ||
        ""
      ).trim()
    : "";
}

function getHtmlTitle(document: Document) {
  const titles =
    document.getElementsByTagName(
      "title"
    );

  return titles.length
    ? (
        titles[0].textContent || ""
      ).trim()
    : "";
}

function normalizedComparableUrl(
  raw: string,
  pageUrl: string
) {
  const resolved =
    resolveHttpUrl(raw, pageUrl);

  if (!resolved.valid) return "";

  try {
    const parsed = new URL(
      resolved.resolved
    );
    parsed.hash = "";

    if (
      (parsed.protocol === "http:" &&
        parsed.port === "80") ||
      (parsed.protocol === "https:" &&
        parsed.port === "443")
    ) {
      parsed.port = "";
    }

    parsed.hostname =
      parsed.hostname.toLowerCase();

    return parsed.href;
  } catch {
    return "";
  }
}

function inspectSocialMetadata(
  source: string,
  rawPageUrl: string
): SocialReport {
  if (
    typeof window === "undefined"
  ) {
    throw new Error(
      "HTML metadata inspection must run in the browser."
    );
  }

  const pageUrl =
    rawPageUrl.trim()
      ? normalizePageUrl(rawPageUrl)
      : "";

  if (
    rawPageUrl.trim() &&
    !pageUrl
  ) {
    throw new Error(
      "Page URL must be an absolute HTTP or HTTPS URL without embedded credentials."
    );
  }

  const document =
    new DOMParser().parseFromString(
      source,
      "text/html"
    );
  const items = collectMeta(document);
  const duplicateTags =
    collectDuplicates(items);
  const ogImages =
    collectOgImages(items);

  const data: SocialData = {
    ogTitle: firstValue(items, [
      "property:og:title",
    ]),
    ogDescription: firstValue(
      items,
      ["property:og:description"]
    ),
    ogUrl: firstValue(items, [
      "property:og:url",
    ]),
    ogType: firstValue(items, [
      "property:og:type",
    ]),
    ogSiteName: firstValue(
      items,
      ["property:og:site_name"]
    ),
    ogLocale: firstValue(items, [
      "property:og:locale",
    ]),
    ogImages,
    twitterCard: firstValue(
      items,
      [
        "name:twitter:card",
        "property:twitter:card",
      ]
    ),
    twitterTitle: firstValue(
      items,
      [
        "name:twitter:title",
        "property:twitter:title",
      ]
    ),
    twitterDescription:
      firstValue(items, [
        "name:twitter:description",
        "property:twitter:description",
      ]),
    twitterImage: firstValue(
      items,
      [
        "name:twitter:image",
        "property:twitter:image",
      ]
    ),
    twitterImageAlt: firstValue(
      items,
      [
        "name:twitter:image:alt",
        "property:twitter:image:alt",
      ]
    ),
    htmlTitle:
      getHtmlTitle(document),
    metaDescription:
      firstValue(items, [
        "name:description",
      ]),
    canonical:
      getCanonical(document),
  };

  const issues: SocialIssue[] = [];
  const core: Array<
    [string, string]
  > = [
    [data.ogTitle, "og:title"],
    [data.ogType, "og:type"],
    [
      firstValue(items, ["property:og:image"]),
      "og:image",
    ],
    [data.ogUrl, "og:url"],
  ];

  core.forEach(
    ([value, label]) => {
      if (!value) {
        issues.push({
          level: "Warning",
          message: `Missing core Open Graph property ${label}. HTML/X fallbacks shown in the preview do not make the Open Graph set complete.`,
        });
      }
    }
  );

  const urlFields: Array<
    [string, string]
  > = [
    [data.ogUrl, "og:url"],
    [
      data.ogImages.length
        ? data.ogImages[0].url
        : "",
      "first og:image",
    ],
    [
      data.twitterImage,
      "twitter:image",
    ],
  ];

  urlFields.forEach(
    ([value, label]) => {
      if (!value) return;

      const info =
        resolveHttpUrl(
          value,
          pageUrl
        );

      if (!info.valid) {
        issues.push({
          level: "Warning",
          message: `${label} cannot be resolved as an HTTP(S) URL${
            pageUrl
              ? "."
              : "; supply the page URL if the value is intentionally relative."
          }`,
        });
      } else {
        if (!info.absolute) {
          issues.push({
            level: "Note",
            message: `${label} is relative and resolves to ${info.resolved}. Absolute social URLs are easier for crawlers and humans to audit.`,
          });
        }

        if (info.credentials) {
          issues.push({
            level: "Warning",
            message: `${label} contains embedded URL credentials.`,
          });
        }

        if (
          info.protocol === "http:" &&
          pageUrl &&
          pageUrl.indexOf(
            "https://"
          ) === 0
        ) {
          issues.push({
            level: "Warning",
            message: `${label} resolves to HTTP while the supplied page URL uses HTTPS.`,
          });
        }
      }
    }
  );

  if (
    data.ogImages.length &&
    !data.ogImages[0].alt
  ) {
    issues.push({
      level: "Note",
      message:
        "The first og:image has no associated og:image:alt. Open Graph says an image should include alt text describing what is in the image.",
    });
  }

  if (
    data.ogImages.length > 1
  ) {
    issues.push({
      level: "Note",
      message: `The page declares ${data.ogImages.length} Open Graph image candidates. Open Graph gives preference to the first root tag during conflicts, and structured image properties attach according to source order.`,
    });
  }

  if (
    data.ogLocale &&
    !/^[A-Za-z]{2,3}_[A-Za-z]{2}$/.test(
      data.ogLocale
    )
  ) {
    issues.push({
      level: "Note",
      message: `og:locale "${data.ogLocale}" does not use the usual language_TERRITORY form.`,
    });
  }

  if (
    data.twitterCard &&
    [
      "summary",
      "summary_large_image",
      "app",
      "player",
    ].indexOf(
      data.twitterCard
    ) === -1
  ) {
    issues.push({
      level: "Note",
      message: `twitter:card "${data.twitterCard}" is not one of the familiar summary, summary_large_image, app, or player values. Confirm the target platform's current card support.`,
    });
  }

  if (
    data.canonical &&
    data.ogUrl
  ) {
    const canonical =
      normalizedComparableUrl(
        data.canonical,
        pageUrl
      );
    const ogUrl =
      normalizedComparableUrl(
        data.ogUrl,
        pageUrl
      );

    if (
      canonical &&
      ogUrl &&
      canonical !== ogUrl
    ) {
      issues.push({
        level: "Note",
        message:
          "rel=canonical and og:url resolve to different URLs. That can be intentional, but review whether search identity and social-object identity are supposed to differ.",
      });
    }
  }

  duplicateTags.forEach(
    (duplicate) => {
      const distinct: string[] =
        [];

      duplicate.values.forEach(
        (value) => {
          if (
            distinct.indexOf(
              value
            ) === -1
          ) {
            distinct.push(value);
          }
        }
      );

      const isOgImageProperty =
        duplicate.key.indexOf(
          "property:og:image"
        ) === 0;

      if (isOgImageProperty) {
        return;
      }

      issues.push({
        level:
          distinct.length > 1
            ? "Warning"
            : "Note",
        message:
          distinct.length > 1
            ? `${duplicate.key} appears more than once with different values. Source order can affect which value a consumer prefers.`
            : `${duplicate.key} is duplicated with the same value.`,
      });
    }
  );

  if (
    data.twitterTitle &&
    data.ogTitle &&
    data.twitterTitle !==
      data.ogTitle
  ) {
    issues.push({
      level: "Note",
      message:
        "twitter:title and og:title differ. This may be deliberate platform-specific copy; verify both titles still describe the same page.",
    });
  }

  return {
    data,
    issues,
    duplicateTags,
  };
}

function hostName(
  value: string,
  pageUrl: string
) {
  const info =
    resolveHttpUrl(
      value,
      pageUrl
    );

  if (!info.valid) return "";

  try {
    return new URL(
      info.resolved
    ).hostname;
  } catch {
    return "";
  }
}

function formatSocialReport(
  report: SocialReport
) {
  const data = report.data;
  const warnings =
    report.issues.filter(
      (item) =>
        item.level === "Warning"
    ).length;
  const notes =
    report.issues.filter(
      (item) =>
        item.level === "Note"
    ).length;
  const lines = [
    "Social metadata inspection",
    `Warnings: ${warnings}`,
    `Notes: ${notes}`,
    `Open Graph images: ${data.ogImages.length}`,
    "",
    "Open Graph",
    `og:title: ${
      data.ogTitle || "Not found"
    }`,
    `og:type: ${
      data.ogType || "Not found"
    }`,
    `og:url: ${
      data.ogUrl || "Not found"
    }`,
    `og:description: ${
      data.ogDescription ||
      "Not found"
    }`,
    `og:site_name: ${
      data.ogSiteName ||
      "Not found"
    }`,
    `og:locale: ${
      data.ogLocale || "Not found"
    }`,
  ];

  data.ogImages.forEach(
    (image, index) => {
      lines.push(
        `og:image ${index + 1}: ${image.url || "empty"}`,
        `  alt: ${image.alt || "Not found"}`,
        `  width: ${image.width || "Not found"}`,
        `  height: ${image.height || "Not found"}`,
        `  type: ${image.type || "Not found"}`
      );
    }
  );

  lines.push(
    "",
    "X / Twitter",
    `twitter:card: ${
      data.twitterCard ||
      "Not found"
    }`,
    `twitter:title: ${
      data.twitterTitle ||
      "Not found"
    }`,
    `twitter:description: ${
      data.twitterDescription ||
      "Not found"
    }`,
    `twitter:image: ${
      data.twitterImage ||
      "Not found"
    }`,
    "",
    "HTML context",
    `title: ${
      data.htmlTitle ||
      "Not found"
    }`,
    `meta description: ${
      data.metaDescription ||
      "Not found"
    }`,
    `canonical: ${
      data.canonical ||
      "Not found"
    }`,
    "",
    "Issues"
  );

  if (!report.issues.length) {
    lines.push(
      "No common structural issue found by this local inspection."
    );
  } else {
    report.issues.forEach(
      (item, index) => {
        lines.push(
          `${index + 1}. ${item.level}: ${item.message}`
        );
      }
    );
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [pageUrl, setPageUrl] =
    useState("");
  const [input, setInput] =
    useState(SAMPLE_HTML);
  const [report, setReport] =
    useState<SocialReport | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const inspect = () => {
    if (!input.trim()) {
      setError(
        "Paste HTML containing social metadata."
      );
      setReport(null);
      return;
    }

    try {
      setReport(
        inspectSocialMetadata(
          input,
          pageUrl
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
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
      "https://example.com/guides/url-debugging"
    );
    setInput(SAMPLE_HTML);
    setReport(null);
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setPageUrl("");
    setInput("");
    setReport(null);
    setError("");
    setCopied(false);
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatSocialReport(
          report
        )
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

  const data = report
    ? report.data
    : null;
  const previewTitle = data
    ? data.ogTitle ||
      data.twitterTitle ||
      data.htmlTitle
    : "";
  const previewDescription = data
    ? data.ogDescription ||
      data.twitterDescription ||
      data.metaDescription
    : "";
  const previewImage =
    data && data.ogImages.length
      ? data.ogImages[0].url
      : data
      ? data.twitterImage
      : "";
  const warningIssues = report
    ? report.issues.filter((item) => item.level === "Warning")
    : [];
  const noteIssues = report
    ? report.issues.filter((item) => item.level === "Note")
    : [];

  return (
    <ToolShell
      title="Open Graph Preview Checker"
      description="Inspect declared social metadata, preserve Open Graph arrays and fallbacks, and build only an approximate preview."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="social-page-url" className="block text-sm font-semibold text-gray-900">
          Page URL{" "}
          <span className="font-normal text-gray-500">
            (optional)
          </span>
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Add the real page URL to resolve relative social/canonical URLs. No
          request is made.
        </p>
        <input
          id="social-page-url"
          type="url"
          value={pageUrl}
          onChange={(event: {
            target: { value: string };
          }) => {
            setPageUrl(
              event.target.value
            );
            setReport(null);
            setError("");
            setCopied(false);
          }}
          placeholder="https://example.com/page"
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6">
        <label htmlFor="social-html-source" className="block text-sm font-semibold text-gray-900">
          HTML source
        </label>
        <textarea
          id="social-html-source"
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            setReport(null);
            setError("");
            setCopied(false);
          }}
          rows={17}
          placeholder={SAMPLE_HTML}
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Only the supplied HTML is parsed. No page, image, redirect, HTTP
          header, or social platform&apos;s cached preview is fetched.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={inspect}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Inspect Social Metadata
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

      {report && data ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="Warnings"
              value={String(
                report.issues.filter(
                  (item) =>
                    item.level ===
                    "Warning"
                ).length
              )}
            />
            <Stat
              label="Review notes"
              value={String(
                report.issues.filter(
                  (item) =>
                    item.level ===
                    "Note"
                ).length
              )}
            />
            <Stat
              label="OG images"
              value={String(
                data.ogImages.length
              )}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900">
              Approximate content card
            </h3>
            <div className="mt-3 max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex min-h-[155px] items-center justify-center bg-gray-100 p-5 text-center text-sm text-gray-500">
                {previewImage ? (
                  <span className="break-all">
                    Declared image:{" "}
                    {previewImage}
                  </span>
                ) : (
                  "No social image found"
                )}
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {data.ogSiteName ||
                    hostName(
                      data.ogUrl,
                      normalizePageUrl(
                        pageUrl
                      )
                    ) ||
                    "Approximate preview"}
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {previewTitle ||
                    "No usable title found"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {previewDescription ||
                    "No usable description found"}
                </p>
              </div>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500">
              This card deliberately shows content selection, not Facebook, X,
              LinkedIn, Slack, Discord, or another platform&apos;s exact layout.
            </p>
          </div>

          {warningIssues.length ? (
            <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>Warnings to review:</strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {warningIssues.map((item, index) => (
                  <li key={`${item.message}-${index}`}>{item.message}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-green-800">
              No common structural warning was found in the pasted social
              metadata. Live crawler access and platform rendering still need
              separate verification.
            </div>
          )}

          {noteIssues.length ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">Review notes:</strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {noteIssues.map((item, index) => (
                  <li key={`${item.message}-${index}`}>{item.message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Metadata report
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Declared Open Graph values are kept distinct from X metadata
                  and ordinary HTML fallbacks.
                </p>
              </div>

              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[330px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {formatSocialReport(
                report
              )}
            </pre>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Open Graph properties, image groups, X card fields, fallbacks, and conflicts will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Inspection runs entirely on the pasted HTML and optional page URL. No
        social crawler or remote asset is contacted. Site-wide analytics or
        advertising scripts, if enabled, are separate from this inspection.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Fallback Can Make the Preview Look Fine While the Open Graph Markup Is Still Incomplete
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A normal HTML title and meta description can supply text for this
            approximate card. Some real services also use fallbacks. But
            seeing a readable title in a preview should not be confused with
            actually declaring the four Open Graph core properties.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The report therefore evaluates <code>og:title</code>,{" "}
            <code>og:type</code>, <code>og:image</code>, and{" "}
            <code>og:url</code> separately even when the card has something
            reasonable to display.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Repeated og:image Is an Array, Not Automatically a Duplicate Error
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Open Graph explicitly allows multiple values by repeating the same
            root tag, and gives preference to the first tag when values
            conflict. That makes two <code>og:image</code> tags different from
            accidentally emitting two contradictory <code>og:title</code>
            values.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Repeated image roots remain distinct candidates, with width, height,
            type, and alt properties attached to the image that precedes
            them in source order.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Structured Properties Can Quietly Attach to the Wrong Image
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-4 text-sm leading-7 text-gray-800">{`<meta property="og:image" content="first.jpg">
<meta property="og:image:width" content="1200">

<meta property="og:image" content="second.jpg">
<meta property="og:image:alt" content="Second image">`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            In this example, the width belongs to the first image and the alt
            text belongs to the second. Moving every structured property to the
            bottom changes that relationship even if every individual tag still
            looks valid.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Pasted HTML Cannot Prove Whether the Image URL Actually Works
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A syntactically valid <code>og:image</code> can still return 404,
            redirect through an inaccessible host, block a social crawler,
            serve an unexpected content type, or be cached under an older
            version. None of those facts exists in pasted HTML.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Inspect the declarations here, then use the target platform&apos;s live
            debugging or card refresh workflow to verify what its crawler can
            actually fetch.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            canonical and og:url Can Differ, but the Difference Should Be Deliberate
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Search canonicalization and Open Graph identity are separate
            mechanisms. A canonical link tells search systems which duplicate
            URL you prefer as representative; <code>og:url</code> identifies
            the graph object for social metadata.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            On an ordinary article or product page they often point to the same
            stable URL. A mismatch is therefore worth reviewing, not because the
            standards require equality, but because accidental campaign,
            hostname, protocol, or slash differences are common.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            X-Specific Copy Is Not Necessarily a Conflict
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A page can deliberately use a shorter <code>twitter:title</code> or
            different social description while preserving the same underlying
            page identity. The report shows the difference as a note rather
            than forcing Open Graph and X values to be identical.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          The{" "}
          <a
            href="https://ogp.me/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            Open Graph protocol
          </a>{" "}
          defines the four core properties, repeated-value ordering, and the
          attachment of structured image properties to root image tags.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/open-graph-preview-checker" />
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
      <div className="mt-2 text-xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
