"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type IssueLevel =
  | "Error"
  | "Warning"
  | "Note";

type SitemapIssue = {
  level: IssueLevel;
  entry: string;
  message: string;
};

type UrlEntry = {
  index: number;
  loc: string;
  normalizedLoc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

type IndexEntry = {
  index: number;
  loc: string;
  normalizedLoc: string;
  lastmod: string;
};

type SitemapReport = {
  valid: boolean;
  rootType:
    | "urlset"
    | "sitemapindex"
    | "unknown";
  namespace: string;
  urls: UrlEntry[];
  sitemaps: IndexEntry[];
  issues: SitemapIssue[];
  sourceBytes: number;
  sourceLines: number;
  duplicateCount: number;
  extensionNamespaces: string[];
  deployedUrl: string;
  xmlEncoding: string;
  hasDoctype: boolean;
};

const SITEMAP_NS =
  "http://www.sitemaps.org/schemas/sitemap/0.9";

const SAMPLE_URLSET = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-08-31</lastmod>
  </url>
  <url>
    <loc>https://example.com/guides/canonical-urls</loc>
    <lastmod>2026-08-20</lastmod>
  </url>
</urlset>`;

const SAMPLE_INDEX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemaps/pages.xml</loc>
    <lastmod>2026-08-31</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemaps/tools.xml</loc>
    <lastmod>2026-08-31</lastmod>
  </sitemap>
</sitemapindex>`;

const VALID_CHANGEFREQ = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

function directChildren(
  element: Element
) {
  return Array.from(
    element.children
  );
}

function sitemapChildren(
  element: Element,
  localName: string
) {
  return directChildren(
    element
  ).filter(
    (child) =>
      child.namespaceURI ===
        SITEMAP_NS &&
      child.localName ===
        localName
  );
}

function textOf(
  element: Element
) {
  return (
    element.textContent || ""
  ).trim();
}

function singleChildText(
  parent: Element,
  localName: string,
  entryLabel: string,
  required: boolean,
  issues: SitemapIssue[]
) {
  const matches =
    sitemapChildren(
      parent,
      localName
    );

  if (
    required &&
    !matches.length
  ) {
    issues.push({
      level: "Error",
      entry: entryLabel,
      message:
        `Missing required <${localName}> element.`,
    });

    return "";
  }

  if (
    matches.length > 1
  ) {
    issues.push({
      level: "Error",
      entry: entryLabel,
      message:
        `Found ${matches.length} <${localName}> elements. The Sitemap protocol allows at most one ${localName} in this entry.`,
    });
  }

  return matches.length
    ? textOf(matches[0])
    : "";
}

function parseXmlEncoding(
  source: string
) {
  const match =
    source.match(
      /^\uFEFF?<\?xml\s+([^?]+)\?>/i
    );

  if (!match) {
    return "";
  }

  const encoding =
    match[1].match(
      /(?:^|\s)encoding\s*=\s*(?:"([^"]*)"|'([^']*)')/i
    );

  return encoding
    ? encoding[1] ||
        encoding[2] ||
        ""
    : "";
}

function findParserError(
  document: Document
) {
  const elements =
    Array.from(
      document.getElementsByTagNameNS(
        "*",
        "parsererror"
      )
    );

  for (
    let index = 0;
    index < elements.length;
    index += 1
  ) {
    const namespace =
      (
        elements[
          index
        ].namespaceURI ||
        ""
      ).toLowerCase();

    if (
      namespace.indexOf(
        "parsererror"
      ) !== -1 ||
      namespace.indexOf(
        "mozilla.org/newlayout/xml"
      ) !== -1
    ) {
      return elements[
        index
      ];
    }
  }

  const root =
    document.documentElement;

  if (
    root &&
    root.localName ===
      "parsererror"
  ) {
    return root;
  }

  return null;
}

function cleanParserError(
  value: string
) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
}

function validCalendarDate(
  year: number,
  month: number,
  day: number
) {
  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return (
    date.getUTCFullYear() ===
      year &&
    date.getUTCMonth() ===
      month - 1 &&
    date.getUTCDate() ===
      day
  );
}

function parseLastmod(
  value: string
) {
  const dateOnly =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (dateOnly) {
    const year =
      Number(dateOnly[1]);
    const month =
      Number(dateOnly[2]);
    const day =
      Number(dateOnly[3]);

    if (
      !validCalendarDate(
        year,
        month,
        day
      )
    ) {
      return null;
    }

    return new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );
  }

  const dateTime =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/
    );

  if (!dateTime) {
    return null;
  }

  const year =
    Number(dateTime[1]);
  const month =
    Number(dateTime[2]);
  const day =
    Number(dateTime[3]);
  const hour =
    Number(dateTime[4]);
  const minute =
    Number(dateTime[5]);
  const second =
    dateTime[6]
      ? Number(
          dateTime[6]
        )
      : 0;

  const zone =
    dateTime[7];

  if (
    zone !== "Z"
  ) {
    const zoneHour =
      Number(
        zone.slice(1, 3)
      );
    const zoneMinute =
      Number(
        zone.slice(4, 6)
      );

    if (
      zoneHour > 23 ||
      zoneMinute > 59
    ) {
      return null;
    }
  }

  if (
    !validCalendarDate(
      year,
      month,
      day
    ) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }

  const normalizedForDate =
    dateTime[6]
      ? value
      : value.replace(
          dateTime[7],
          `:00${dateTime[7]}`
        );
  const parsed =
    new Date(
      normalizedForDate
    );

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;
}

function normalizeHttpUrl(
  value: string,
  label: string,
  issues: SitemapIssue[]
) {
  if (!value) {
    return "";
  }

  if (
    /[^\x00-\x7F]/.test(
      value
    )
  ) {
    issues.push({
      level: "Warning",
      entry: label,
      message:
        "<loc> contains raw non-ASCII characters. The Sitemap protocol guidance expects URLs to be appropriately URL-escaped/encoded before XML entity escaping.",
    });
  }

  if (
    /\s/.test(value)
  ) {
    issues.push({
      level: "Error",
      entry: label,
      message:
        "<loc> contains raw whitespace. URLs in a sitemap should be URL-escaped before XML escaping.",
    });
  }

  if (
    value.length >= 2048
  ) {
    issues.push({
      level: "Error",
      entry: label,
      message:
        `<loc> contains ${value.length.toLocaleString()} characters. The Sitemap protocol requires the loc value to be less than 2,048 characters.`,
    });
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    issues.push({
      level: "Error",
      entry: label,
      message:
        "<loc> is not a valid absolute URL.",
    });
    return "";
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    issues.push({
      level: "Error",
      entry: label,
      message:
        "<loc> must use HTTP or HTTPS.",
    });
  }

  if (
    url.username ||
    url.password
  ) {
    issues.push({
      level: "Error",
      entry: label,
      message:
        "<loc> contains embedded URL credentials.",
    });
  }

  if (
    url.href.length >=
    2048
  ) {
    issues.push({
      level: "Error",
      entry: label,
      message:
        `Serialized <loc> is ${url.href.length.toLocaleString()} characters. The Sitemap protocol requires the loc value to be less than 2,048 characters.`,
    });
  }

  if (url.hash) {
    issues.push({
      level:
        "Warning",
      entry: label,
      message:
        `URL contains fragment ${url.hash}. Sitemap entries should identify fetchable page resources rather than in-document fragment states.`,
    });
    url.hash = "";
  }

  return url.href;
}

function parentDirectoryPath(
  pathname: string
) {
  const slash =
    pathname.lastIndexOf(
      "/"
    );

  return slash === -1
    ? "/"
    : pathname.slice(
        0,
        slash + 1
      );
}

function withinDefaultUrlsetScope(
  deployed: URL,
  target: URL
) {
  return (
    deployed.protocol ===
      target.protocol &&
    deployed.host ===
      target.host &&
    target.pathname.indexOf(
      parentDirectoryPath(
        deployed.pathname
      )
    ) === 0
  );
}

function sameSiteForIndex(
  deployed: URL,
  target: URL
) {
  return (
    deployed.protocol ===
      target.protocol &&
    deployed.host ===
      target.host
  );
}

function validateLastmod(
  value: string,
  label: string,
  issues: SitemapIssue[]
) {
  if (!value) {
    return;
  }

  const parsed =
    parseLastmod(value);

  if (!parsed) {
    issues.push({
      level: "Error",
      entry: label,
      message:
        `<lastmod> "${value}" is not a supported W3C-style date. Use YYYY-MM-DD or a complete date-time with timezone.`,
    });
    return;
  }

  if (
    parsed.getTime() >
    Date.now() +
      24 * 60 * 60 * 1000
  ) {
    issues.push({
      level: "Warning",
      entry: label,
      message:
        `<lastmod> "${value}" is more than 24 hours in the future according to this browser's clock. Confirm the source timestamp and timezone.`,
    });
  }
}

function validateUrlEntry(
  element: Element,
  index: number,
  deployed:
    | URL
    | null,
  issues: SitemapIssue[]
): UrlEntry {
  const label =
    `URL entry ${index}`;
  const loc =
    singleChildText(
      element,
      "loc",
      label,
      true,
      issues
    );
  const lastmod =
    singleChildText(
      element,
      "lastmod",
      label,
      false,
      issues
    );
  const changefreq =
    singleChildText(
      element,
      "changefreq",
      label,
      false,
      issues
    );
  const priority =
    singleChildText(
      element,
      "priority",
      label,
      false,
      issues
    );
  const normalizedLoc =
    normalizeHttpUrl(
      loc,
      label,
      issues
    );

  validateLastmod(
    lastmod,
    label,
    issues
  );

  if (changefreq) {
    const lower =
      changefreq.toLowerCase();

    if (
      VALID_CHANGEFREQ.indexOf(
        lower
      ) === -1
    ) {
      issues.push({
        level: "Error",
        entry: label,
        message:
          `<changefreq> "${changefreq}" is not one of the Sitemap protocol values: ${VALID_CHANGEFREQ.join(
            ", "
          )}.`,
      });
    } else if (
      lower !== changefreq
    ) {
      issues.push({
        level:
          "Error",
        entry: label,
        message:
          `<changefreq> uses "${changefreq}". The protocol enumeration is case-sensitive and lowercase; serialize it as "${lower}".`,
      });
    }
  }

  if (priority) {
    const lexical =
      /^\+?(?:\d+(?:\.\d*)?|\.\d+)$/.test(
        priority
      );
    const numeric =
      Number(priority);

    if (
      !lexical ||
      !Number.isFinite(
        numeric
      ) ||
      numeric < 0 ||
      numeric > 1
    ) {
      issues.push({
        level: "Error",
        entry: label,
        message:
          `<priority> "${priority}" must be a decimal value from 0.0 through 1.0.`,
      });
    }
  }

  directChildren(
    element
  ).forEach(
    (child) => {
      if (
        child.namespaceURI ===
          SITEMAP_NS &&
        [
          "loc",
          "lastmod",
          "changefreq",
          "priority",
        ].indexOf(
          child.localName
        ) === -1
      ) {
        issues.push({
          level: "Error",
          entry: label,
          message:
            `Unexpected Sitemap-protocol element <${child.localName}> inside <url>.`,
        });
      }
    }
  );

  if (
    deployed &&
    normalizedLoc
  ) {
    const target =
      new URL(
        normalizedLoc
      );

    if (
      !withinDefaultUrlsetScope(
        deployed,
        target
      )
    ) {
      issues.push({
        level:
          "Warning",
        entry: label,
        message:
          `${normalizedLoc} is outside the Sitemap protocol's default scope for ${deployed.href}. Search-engine-specific submission or verified cross-site workflows can alter default assumptions, but this should be deliberate.`,
      });
    }
  }

  return {
    index,
    loc,
    normalizedLoc,
    lastmod,
    changefreq,
    priority,
  };
}

function validateIndexEntry(
  element: Element,
  index: number,
  deployed:
    | URL
    | null,
  issues: SitemapIssue[]
): IndexEntry {
  const label =
    `Sitemap index entry ${index}`;
  const loc =
    singleChildText(
      element,
      "loc",
      label,
      true,
      issues
    );
  const lastmod =
    singleChildText(
      element,
      "lastmod",
      label,
      false,
      issues
    );
  const normalizedLoc =
    normalizeHttpUrl(
      loc,
      label,
      issues
    );

  validateLastmod(
    lastmod,
    label,
    issues
  );

  directChildren(
    element
  ).forEach(
    (child) => {
      if (
        child.namespaceURI ===
          SITEMAP_NS &&
        [
          "loc",
          "lastmod",
        ].indexOf(
          child.localName
        ) === -1
      ) {
        issues.push({
          level: "Error",
          entry: label,
          message:
            `Unexpected Sitemap-protocol element <${child.localName}> inside <sitemap>.`,
        });
      }
    }
  );

  if (
    deployed &&
    normalizedLoc
  ) {
    const target =
      new URL(
        normalizedLoc
      );

    if (
      !sameSiteForIndex(
        deployed,
        target
      )
    ) {
      issues.push({
        level:
          "Warning",
        entry: label,
        message:
          `${normalizedLoc} is not on the same protocol/host as the sitemap index ${deployed.href}. The base Sitemap protocol expects index members on the same site; search-engine-specific verified cross-site workflows need separate confirmation.`,
      });
    }

    if (
      deployed.href ===
      normalizedLoc
    ) {
      issues.push({
        level:
          "Warning",
        entry: label,
        message:
          "The sitemap index lists its own deployed URL. An index should reference sitemap files rather than recursively list itself.",
      });
    }
  }

  return {
    index,
    loc,
    normalizedLoc,
    lastmod,
  };
}

function collectExtensionNamespaces(
  document: Document
) {
  const namespaces: string[] =
    [];

  Array.from(
    document.getElementsByTagName(
      "*"
    )
  ).forEach(
    (element) => {
      const namespace =
        element.namespaceURI ||
        "";

      if (
        namespace &&
        namespace !==
          SITEMAP_NS &&
        namespaces.indexOf(
          namespace
        ) === -1
      ) {
        namespaces.push(
          namespace
        );
      }
    }
  );

  return namespaces.sort();
}

function parseDeployedSitemapUrl(
  raw: string
) {
  if (!raw.trim()) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(
      raw.trim()
    );
  } catch {
    throw new Error(
      "Deployed sitemap URL must be an absolute HTTP or HTTPS URL."
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "Deployed sitemap URL must use HTTP or HTTPS."
    );
  }

  if (
    url.username ||
    url.password
  ) {
    throw new Error(
      "Deployed sitemap URL must not contain embedded credentials."
    );
  }

  url.hash = "";

  return url;
}

function detectDuplicates(
  entries: Array<{
    normalizedLoc: string;
    index: number;
  }>,
  kind: string,
  issues: SitemapIssue[]
) {
  const firstSeen =
    Object.create(
      null
    ) as Record<
      string,
      number
    >;
  let duplicates = 0;

  entries.forEach(
    (entry) => {
      if (
        !entry.normalizedLoc
      ) {
        return;
      }

      if (
        firstSeen[
          entry.normalizedLoc
        ]
      ) {
        duplicates += 1;
        issues.push({
          level:
            "Warning",
          entry:
            `${kind} entry ${entry.index}`,
          message:
            `Duplicate normalized <loc> ${entry.normalizedLoc}; first seen at ${kind.toLowerCase()} entry ${firstSeen[
              entry
                .normalizedLoc
            ]}.`,
        });
      } else {
        firstSeen[
          entry.normalizedLoc
        ] = entry.index;
      }
    }
  );

  return duplicates;
}

function analyzeSitemap(
  source: string,
  rawDeployedUrl: string
): SitemapReport {
  if (
    typeof window ===
    "undefined"
  ) {
    throw new Error(
      "Sitemap XML parsing must run in the browser."
    );
  }

  const deployed =
    parseDeployedSitemapUrl(
      rawDeployedUrl
    );
  const issues: SitemapIssue[] =
    [];
  const sourceBytes =
    new TextEncoder().encode(
      source
    ).length;
  const sourceLines =
    source
      .replace(
        /\r\n?/g,
        "\n"
      )
      .split("\n").length;
  const xmlEncoding =
    parseXmlEncoding(
      source
    );
  const hasDoctype =
    /<!DOCTYPE\b/i.test(
      source.replace(
        /<!--[\s\S]*?-->/g,
        ""
      )
    );

  if (
    sourceBytes >
    52428800
  ) {
    issues.push({
      level: "Error",
      entry: "File",
      message:
        `The pasted source is ${sourceBytes.toLocaleString()} UTF-8 bytes. A sitemap file must not exceed 50 MB (52,428,800 bytes) uncompressed.`,
    });
  }

  if (
    xmlEncoding &&
    xmlEncoding.toUpperCase() !==
      "UTF-8"
  ) {
    issues.push({
      level: "Error",
      entry:
        "XML declaration",
      message:
        `The declaration says encoding="${xmlEncoding}". The Sitemap protocol requires UTF-8 encoding.`,
    });
  }

  if (!xmlEncoding) {
    issues.push({
      level: "Note",
      entry:
        "XML declaration",
      message:
        "No XML encoding declaration was found. XML declarations are not required for every XML document, but the deployed sitemap bytes still need to be UTF-8 encoded.",
    });
  }

  if (hasDoctype) {
    issues.push({
      level:
        "Warning",
      entry: "Document",
      message:
        "DOCTYPE is present. The Sitemap protocol does not require a DTD, and this browser validator does not fetch or trust external DTD resources.",
    });
  }

  const document =
    new DOMParser().parseFromString(
      source,
      "application/xml"
    );
  const parserError =
    findParserError(
      document
    );

  if (parserError) {
    issues.push({
      level: "Error",
      entry: "XML",
      message:
        cleanParserError(
          parserError.textContent ||
            "Malformed XML."
        ),
    });

    return {
      valid: false,
      rootType: "unknown",
      namespace: "",
      urls: [],
      sitemaps: [],
      issues,
      sourceBytes,
      sourceLines,
      duplicateCount: 0,
      extensionNamespaces:
        [],
      deployedUrl:
        deployed
          ? deployed.href
          : "",
      xmlEncoding,
      hasDoctype,
    };
  }

  const root =
    document.documentElement;

  if (!root) {
    issues.push({
      level: "Error",
      entry: "XML",
      message:
        "No document element was found.",
    });

    return {
      valid: false,
      rootType: "unknown",
      namespace: "",
      urls: [],
      sitemaps: [],
      issues,
      sourceBytes,
      sourceLines,
      duplicateCount: 0,
      extensionNamespaces:
        [],
      deployedUrl:
        deployed
          ? deployed.href
          : "",
      xmlEncoding,
      hasDoctype,
    };
  }

  const namespace =
    root.namespaceURI ||
    "";
  let rootType:
    | "urlset"
    | "sitemapindex"
    | "unknown" =
    "unknown";

  if (
    root.localName ===
      "urlset"
  ) {
    rootType = "urlset";
  } else if (
    root.localName ===
      "sitemapindex"
  ) {
    rootType =
      "sitemapindex";
  } else {
    issues.push({
      level: "Error",
      entry: "Root",
      message:
        `Root element <${root.tagName}> is not <urlset> or <sitemapindex>.`,
    });
  }

  if (
    namespace !==
    SITEMAP_NS
  ) {
    issues.push({
      level: "Error",
      entry: "Root",
      message:
        `Root namespace is "${namespace || "(none)"}". Standard sitemap elements must use ${SITEMAP_NS}.`,
    });
  }

  const extensionNamespaces =
    collectExtensionNamespaces(
      document
    );

  if (
    extensionNamespaces.length
  ) {
    issues.push({
      level: "Note",
      entry:
        "Extensions",
      message:
        `Detected ${extensionNamespaces.length} non-Sitemap namespace${
          extensionNamespaces.length ===
          1
            ? ""
            : "s"
        }. Extension markup can be valid (for example image/video/news/hreflang), but this generic validator does not certify each extension schema.`,
    });
  }

  const urls: UrlEntry[] =
    [];
  const sitemaps: IndexEntry[] =
    [];

  if (
    rootType === "urlset" &&
    namespace ===
      SITEMAP_NS
  ) {
    const entries =
      sitemapChildren(
        root,
        "url"
      );

    entries.forEach(
      (element, index) =>
        urls.push(
          validateUrlEntry(
            element,
            index + 1,
            deployed,
            issues
          )
        )
    );

    directChildren(root).forEach(
      (child) => {
        if (
          child.namespaceURI ===
            SITEMAP_NS &&
          child.localName !==
            "url"
        ) {
          issues.push({
            level: "Error",
            entry: "Root",
            message:
              `Unexpected Sitemap-protocol child <${child.localName}> inside <urlset>.`,
          });
        }
      }
    );

    if (!entries.length) {
      issues.push({
        level:
          "Warning",
        entry: "Root",
        message:
          "<urlset> contains no direct <url> entries.",
      });
    }

    if (
      entries.length >
      50000
    ) {
      issues.push({
        level: "Error",
        entry: "File",
        message:
          `This urlset contains ${entries.length.toLocaleString()} URL entries. One sitemap file is limited to 50,000 URLs.`,
      });
    }

    if (
      urls.some(
        (entry) =>
          Boolean(
            entry.changefreq ||
              entry.priority
          )
      )
    ) {
      issues.push({
        level: "Note",
        entry:
          "Search behavior",
        message:
          "changefreq and priority are Sitemap protocol fields, but Google states that it ignores both. Keep them only for consumers/workflows that actually use them.",
      });
    }

    if (
      urls.some(
        (entry) =>
          Boolean(
            entry.lastmod
          )
      )
    ) {
      issues.push({
        level: "Note",
        entry: "lastmod",
        message:
          "URL lastmod should reflect the last significant modification of that page, not the time the sitemap was regenerated.",
      });
    }
  }

  if (
    rootType ===
      "sitemapindex" &&
    namespace ===
      SITEMAP_NS
  ) {
    const entries =
      sitemapChildren(
        root,
        "sitemap"
      );

    entries.forEach(
      (element, index) =>
        sitemaps.push(
          validateIndexEntry(
            element,
            index + 1,
            deployed,
            issues
          )
        )
    );

    directChildren(root).forEach(
      (child) => {
        if (
          child.namespaceURI ===
            SITEMAP_NS &&
          child.localName !==
            "sitemap"
        ) {
          issues.push({
            level: "Error",
            entry: "Root",
            message:
              `Unexpected Sitemap-protocol child <${child.localName}> inside <sitemapindex>.`,
          });
        }
      }
    );

    if (!entries.length) {
      issues.push({
        level:
          "Warning",
        entry: "Root",
        message:
          "<sitemapindex> contains no direct <sitemap> entries.",
      });
    }

    if (
      entries.length >
      50000
    ) {
      issues.push({
        level: "Error",
        entry: "File",
        message:
          `This sitemap index contains ${entries.length.toLocaleString()} sitemap entries. One sitemap index is limited to 50,000 sitemap references.`,
      });
    }

    if (
      sitemaps.some(
        (entry) =>
          Boolean(
            entry.lastmod
          )
      )
    ) {
      issues.push({
        level: "Note",
        entry: "lastmod",
        message:
          "In a sitemap index, lastmod describes the referenced sitemap file's modification time, not the modification time of every page inside that child sitemap.",
      });
    }
  }

  const duplicateCount =
    rootType === "urlset"
      ? detectDuplicates(
          urls,
          "URL",
          issues
        )
      : rootType ===
        "sitemapindex"
      ? detectDuplicates(
          sitemaps,
          "Sitemap",
          issues
        )
      : 0;

  issues.push({
    level: "Note",
    entry:
      "Validation boundary",
    message:
      "A protocol-valid sitemap does not prove listed URLs return 200, are canonical, are allowed to be indexed, are unblocked by robots.txt, contain substantive content, or have been accepted by a search engine.",
  });

  const valid =
    !issues.some(
      (item) =>
        item.level ===
        "Error"
    );

  return {
    valid,
    rootType,
    namespace,
    urls,
    sitemaps,
    issues,
    sourceBytes,
    sourceLines,
    duplicateCount,
    extensionNamespaces,
    deployedUrl:
      deployed
        ? deployed.href
        : "",
    xmlEncoding,
    hasDoctype,
  };
}

function formatSitemapReport(
  report: SitemapReport
) {
  const errors =
    report.issues.filter(
      (item) =>
        item.level ===
        "Error"
    ).length;
  const warnings =
    report.issues.filter(
      (item) =>
        item.level ===
        "Warning"
    ).length;
  const notes =
    report.issues.filter(
      (item) =>
        item.level ===
        "Note"
    ).length;
  const entries =
    report.rootType ===
    "urlset"
      ? report.urls
      : report.sitemaps;
  const lines = [
    "Sitemap validation",
    `Status: ${
      report.valid
        ? "No protocol/XML error found"
        : "Needs correction"
    }`,
    `Root: ${report.rootType}`,
    `Namespace: ${report.namespace || "(none)"}`,
    `Entries: ${entries.length}`,
    `Duplicate normalized locs: ${report.duplicateCount}`,
    `UTF-8 size of pasted source: ${report.sourceBytes.toLocaleString()} bytes`,
    `Source lines: ${report.sourceLines}`,
    `Declared XML encoding: ${report.xmlEncoding || "(not declared)"}`,
    `Errors: ${errors}`,
    `Warnings: ${warnings}`,
    `Notes: ${notes}`,
  ];

  if (
    report.deployedUrl
  ) {
    lines.push(
      `Deployment URL reviewed: ${report.deployedUrl}`
    );
  }

  lines.push(
    "",
    "Entry sample:"
  );

  entries
    .slice(0, 30)
    .forEach(
      (entry) => {
        lines.push(
          `${entry.index}. ${entry.loc || "(missing loc)"}`
        );

        if (
          entry.lastmod
        ) {
          lines.push(
            `   lastmod: ${entry.lastmod}`
          );
        }

        if (
          report.rootType ===
          "urlset"
        ) {
          const urlEntry =
            entry as UrlEntry;

          if (
            urlEntry.changefreq
          ) {
            lines.push(
              `   changefreq: ${urlEntry.changefreq}`
            );
          }

          if (
            urlEntry.priority
          ) {
            lines.push(
              `   priority: ${urlEntry.priority}`
            );
          }
        }
      }
    );

  if (
    entries.length > 30
  ) {
    lines.push(
      `... ${entries.length - 30} more entries not shown in this text sample.`
    );
  }

  if (
    report.extensionNamespaces
      .length
  ) {
    lines.push(
      "",
      "Extension namespaces:",
      ...report.extensionNamespaces.map(
        (namespace) =>
          `- ${namespace}`
      )
    );
  }

  lines.push(
    "",
    "Review:"
  );

  report.issues.forEach(
    (item, index) =>
      lines.push(
        `${index + 1}. ${item.level} · ${item.entry}: ${item.message}`
      )
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [
    deployedUrl,
    setDeployedUrl,
  ] =
    useState(
      "https://example.com/sitemap.xml"
    );
  const [input, setInput] =
    useState(
      SAMPLE_URLSET
    );
  const [report, setReport] =
    useState<SitemapReport | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const clearResult = () => {
    setReport(null);
    setError("");
    setCopied(false);
  };

  const validate = () => {
    if (!input.trim()) {
      setError(
        "Paste sitemap XML to validate."
      );
      setReport(null);
      return;
    }

    try {
      setReport(
        analyzeSitemap(
          input,
          deployedUrl
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to validate this sitemap."
      );
      setCopied(false);
    }
  };

  const loadUrlset = () => {
    setDeployedUrl(
      "https://example.com/sitemap.xml"
    );
    setInput(
      SAMPLE_URLSET
    );
    clearResult();
  };

  const loadIndex = () => {
    setDeployedUrl(
      "https://example.com/sitemap-index.xml"
    );
    setInput(
      SAMPLE_INDEX
    );
    clearResult();
  };

  const resetAll = () => {
    setDeployedUrl("");
    setInput("");
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatSitemapReport(
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
        "The sitemap report could not be copied. Select and copy it manually."
      );
    }
  };

  const errors =
    report
      ? report.issues.filter(
          (item) =>
            item.level ===
            "Error"
        ).length
      : 0;
  const warnings =
    report
      ? report.issues.filter(
          (item) =>
            item.level ===
            "Warning"
        ).length
      : 0;
  const entryCount =
    report
      ? report.rootType ===
        "urlset"
        ? report.urls.length
        : report.sitemaps
            .length
      : 0;

  return (
    <ToolShell
      title="Sitemap Validator"
      description="Validate sitemap XML structure, URLs, lastmod values, duplicates, namespace, deployment scope, entry limits, and size."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="sitemap-deployed-url" className="block text-sm font-semibold text-gray-900">
          Deployed sitemap URL{" "}
          <span className="font-normal text-gray-500">
            (optional)
          </span>
        </label>
        <input
          id="sitemap-deployed-url"
          value={deployedUrl}
          onChange={(event: {
            target: {
              value: string;
            };
          }) => {
            setDeployedUrl(
              event.target.value
            );
            clearResult();
          }}
          placeholder="https://example.com/sitemap.xml"
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Used to review the Sitemap protocol&apos;s default URL scope and
          sitemap-index location relationships. Nothing is fetched.
        </p>
      </div>

      <div className="mt-6">
        <label htmlFor="sitemap-xml" className="block text-sm font-semibold text-gray-900">
          Sitemap XML
        </label>
        <textarea
          id="sitemap-xml"
          value={input}
          onChange={(event: {
            target: {
              value: string;
            };
          }) => {
            setInput(
              event.target.value
            );
            clearResult();
          }}
          rows={20}
          placeholder={
            SAMPLE_URLSET
          }
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validate}
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Validate Sitemap
        </button>
        <button
          type="button"
          onClick={loadUrlset}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load URL Set
        </button>
        <button
          type="button"
          onClick={loadIndex}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Sitemap Index
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

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat
              label="Status"
              value={
                report.valid
                  ? "Accepted"
                  : "Invalid"
              }
            />
            <Stat
              label="Root"
              value={
                report.rootType
              }
            />
            <Stat
              label="Entries"
              value={String(
                entryCount
              )}
            />
            <Stat
              label="Errors"
              value={String(
                errors
              )}
            />
            <Stat
              label="Warnings"
              value={String(
                warnings
              )}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Info
              label="Namespace"
              value={
                report.namespace ||
                "(none)"
              }
            />
            <Info
              label="UTF-8 size"
              value={`${report.sourceBytes.toLocaleString()} bytes`}
            />
            <Info
              label="Duplicate locs"
              value={String(
                report.duplicateCount
              )}
            />
          </div>

          {report.issues.some((item) => item.level === "Error") ? (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm leading-relaxed">
              <strong>Errors:</strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.issues.filter((item) => item.level === "Error").map((item, index) => (
                  <li key={`${item.entry}-${item.message}-${index}`}>
                    <strong>{item.entry}:</strong>{" "}{item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {report.issues.some((item) => item.level === "Warning") ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-900 p-4 text-sm leading-relaxed">
              <strong>Warnings:</strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.issues.filter((item) => item.level === "Warning").map((item, index) => (
                  <li key={`${item.entry}-${item.message}-${index}`}>
                    <strong>{item.entry}:</strong>{" "}{item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {report.issues.some((item) => item.level === "Note") ? (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 p-4 text-sm leading-relaxed">
              <strong>Review notes:</strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.issues.filter((item) => item.level === "Note").map((item, index) => (
                  <li key={`${item.entry}-${item.message}-${index}`}>
                    <strong>{item.entry}:</strong>{" "}{item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Entry sample
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Showing up to the first 30 direct protocol entries from the
                  parsed root.
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

            <div className="mt-5 space-y-3">
              {(report.rootType ===
              "urlset"
                ? report.urls
                : report.sitemaps
              )
                .slice(0, 30)
                .map(
                  (entry) => (
                    <div
                      key={
                        entry.index
                      }
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Entry{" "}
                        {entry.index}
                      </div>
                      <code className="mt-2 block break-all text-sm text-gray-800">
                        {entry.loc ||
                          "(missing loc)"}
                      </code>
                      {entry.lastmod ? (
                        <div className="mt-2 text-xs text-gray-600">
                          lastmod:{" "}
                          {entry.lastmod}
                        </div>
                      ) : null}
                    </div>
                  )
                )}
            </div>
          </div>

          {report.extensionNamespaces
            .length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Extension namespaces detected
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                {report.extensionNamespaces.map(
                  (namespace) => (
                    <li
                      key={
                        namespace
                      }
                      className="break-all"
                    >
                      {namespace}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          XML/parser status, sitemap namespace, entries, lastmod, duplicate URLs,
          deployment scope and protocol-limit findings will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Sitemap parsing runs on the pasted XML in your browser. Listed URLs are not
        crawled, child sitemaps are not fetched, and canonicals, noindex,
        robots.txt, uploads, or search-engine submission are not verified here.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from validation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Well-Formed XML Is Only the First Gate for a Sitemap
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            An XML parser can happily build a document whose root is{" "}
            <code>&lt;products&gt;</code>, whose sitemap tags have no namespace,
            or whose <code>loc</code> values use relative URLs. That makes it XML,
            not a valid Sitemap protocol document.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Validation covers the XML layer and then the Sitemap layer:
            correct root type, protocol namespace, direct entry elements,
            required loc values, optional field shapes, duplicates, file limits
            and deployment scope.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            The Namespace URI Is Part of the Meaning
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`Correct protocol namespace:
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

Not equivalent:
<urlset>`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            The two roots have the same visible local name but not the same XML
            expanded name. Core protocol entries are recognized by namespace as well
            as local tag name, and only direct children in the Sitemap namespace are treated as
            core entries.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Where the Sitemap Is Published Defines Its Default Scope
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Under the base protocol, a sitemap belongs to one site and its
            location can restrict which URL paths it can list. A sitemap at{" "}
            <code>https://example.com/catalog/sitemap.xml</code> naturally
            describes URLs under <code>/catalog/</code>; moving it to the site
            root broadens that default path scope.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Search engines can support verified cross-site sitemap workflows,
            so an out-of-scope URL is reported as something to review rather
            than silently removed. The optional deployment URL makes this check
            possible without fetching the file.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            lastmod Is Valuable Only When It Is Trustworthy
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            For a URL entry, <code>lastmod</code> means the last significant
            modification of that page. It is not the time the sitemap generator
            ran. Google says it can use lastmod when the values are consistently
            and verifiably accurate.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            In a sitemap index, the same element has a different object: it
            describes the referenced sitemap file&apos;s modification time. Do not
            copy a page-publish date into every child-sitemap lastmod just to
            populate the field.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            changefreq and priority Are Protocol Fields, but Google Ignores Them
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The Sitemap protocol defines valid <code>changefreq</code> values and
            a <code>priority</code> range from 0.0 through 1.0, so their syntax is
            still checked when present.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google Search documentation states that Google ignores both values.
            That makes them poor fields to spend engineering time updating if
            Google discovery is the only consumer. Accurate URLs and trustworthy
            lastmod values usually matter more.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            50,000 Entries and 50 MB Are File Limits, Not Site Limits
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            One sitemap file is limited to 50,000 URLs and 50 MB uncompressed.
            A sitemap index can organize many sitemap files, and its own entry
            count is also limited. Large sites do not need to choose between
            “one gigantic invalid sitemap” and “no sitemap.”
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Compression reduces transfer size but does not increase the
            uncompressed protocol limit. The pasted source is measured after
            UTF-8 encoding.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate loc Values Waste Capacity and Can Hide Generator Bugs
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A duplicate URL does not make the same page “more submitted.” It
            consumes an entry and often indicates that pagination, route
            normalization, slash handling, source feeds or CMS joins are
            producing the same canonical URL more than once.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The validator normalizes parseable loc URLs enough to remove
            fragments and compare their serialized URL form, then reports
            repeated locations with the first entry number.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Sitemap Indexes Organize Sitemap Files, Not Page URLs
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A <code>&lt;sitemapindex&gt;</code> contains{" "}
            <code>&lt;sitemap&gt;</code> entries whose loc values point to child
            sitemap files. A page URL belongs inside a child urlset instead.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This sounds obvious until a generator accidentally feeds page URLs
            into both formats using the same template. Namespace-aware
            root/entry validation prevents that file from passing just because
            every loc is an absolute URL.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Image, Video, News and Hreflang Markup Are Sitemap Extensions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Real sitemaps can contain additional namespaced elements for
            specialized search features and alternate-language relationships.
            Those extensions should not be mistaken for unknown core sitemap
            tags simply because their local names are unfamiliar.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Non-core namespace URIs are listed while detailed validation stays with
            the relevant extension documentation rather than imitating every search
            vertical incompletely.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Valid Sitemap Does Not Make a URL Indexable
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A listed URL can redirect, return 404, be blocked from crawl, carry
            noindex, canonicalize elsewhere, require authentication, or contain
            low-value/duplicate content. Sitemap submission is a discovery and
            canonicalization signal, not an indexing command.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            After protocol validation, use Search Console and targeted URL
            inspection when the actual question is whether Google discovered,
            selected and indexed a particular page.
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
          defines the XML namespace, required/optional elements, URL escaping,
          scope and file limits. Google&apos;s{" "}
          <a
            href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            sitemap guidance
          </a>{" "}
          covers current Search-specific behavior such as accurate
          lastmod usage and ignoring changefreq/priority.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/sitemap-validator" />
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
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-all text-sm leading-relaxed text-gray-800">
        {value}
      </div>
    </div>
  );
}
