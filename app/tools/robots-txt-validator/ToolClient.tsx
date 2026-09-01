"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type IssueLevel =
  | "Error"
  | "Warning"
  | "Note";

type RobotsIssue = {
  line: number;
  level: IssueLevel;
  message: string;
};

type RobotsRule = {
  line: number;
  directive:
    | "Allow"
    | "Disallow";
  value: string;
};

type ExtraRecord = {
  line: number;
  directive: string;
  value: string;
};

type RobotsGroup = {
  index: number;
  userAgents: Array<{
    line: number;
    value: string;
  }>;
  rules: RobotsRule[];
  extras: ExtraRecord[];
};

type RobotsReport = {
  groups: RobotsGroup[];
  sitemaps: Array<{
    line: number;
    value: string;
  }>;
  globalExtras: ExtraRecord[];
  issues: RobotsIssue[];
  totalLines: number;
  sourceBytes: number;
  mergedAgents: Array<{
    agent: string;
    groups: number[];
    ruleCount: number;
  }>;
  serviceUrl: string;
};

const SAMPLE_ROBOTS = `User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /private/public-guide

User-agent: ExampleBot
Disallow: /experimental/

Sitemap: https://example.com/sitemap.xml`;

function stripComment(
  line: string
) {
  const hash =
    line.indexOf("#");

  return hash === -1
    ? line
    : line.slice(0, hash);
}

function hasMalformedPercent(
  value: string
) {
  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    if (
      value.charAt(index) ===
      "%"
    ) {
      const pair =
        value.slice(
          index + 1,
          index + 3
        );

      if (
        !/^[0-9A-Fa-f]{2}$/.test(
          pair
        )
      ) {
        return true;
      }

      index += 2;
    }
  }

  return false;
}

function productTokenValid(
  value: string
) {
  return (
    value === "*" ||
    /^[A-Za-z_-]+$/.test(
      value
    )
  );
}

function validateServiceUrl(
  raw: string
) {
  if (!raw.trim()) {
    return "";
  }

  let url: URL;

  try {
    url = new URL(
      raw.trim()
    );
  } catch {
    throw new Error(
      "Deployed robots.txt URL must be an absolute HTTP or HTTPS URL."
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "Deployed robots.txt URL must use HTTP or HTTPS."
    );
  }

  if (
    url.username ||
    url.password
  ) {
    throw new Error(
      "Deployed robots.txt URL must not contain embedded credentials."
    );
  }

  return url.href;
}

function validateSitemapRecord(
  value: string,
  line: number,
  serviceUrl: string,
  issues: RobotsIssue[]
) {
  if (!value) {
    issues.push({
      line,
      level: "Warning",
      message:
        "Sitemap record is empty.",
    });
    return;
  }

  let sitemap: URL;

  try {
    sitemap =
      new URL(value);
  } catch {
    issues.push({
      line,
      level: "Warning",
      message:
        "Sitemap should identify an absolute URL understood by the target crawler.",
    });
    return;
  }

  if (
    sitemap.protocol !==
      "http:" &&
    sitemap.protocol !==
      "https:"
  ) {
    issues.push({
      line,
      level: "Warning",
      message:
        "Sitemap URL does not use HTTP or HTTPS.",
    });
  }

  if (
    sitemap.username ||
    sitemap.password
  ) {
    issues.push({
      line,
      level: "Warning",
      message:
        "Sitemap URL contains embedded credentials.",
    });
  }

  if (sitemap.hash) {
    issues.push({
      line,
      level: "Warning",
      message:
        "Sitemap URL contains a fragment. A sitemap record should identify the sitemap resource, not an in-document anchor.",
    });
  }

  if (serviceUrl) {
    try {
      const service =
        new URL(serviceUrl);

      if (
        service.origin !==
        sitemap.origin
      ) {
        issues.push({
          line,
          level: "Note",
          message:
            `Sitemap is on ${sitemap.origin}, while this robots.txt is scoped to ${service.origin}. Cross-site sitemap submission can be supported by search engines with ownership/verification arrangements; confirm that deployment deliberately.`,
        });
      }
    } catch {
      // Service URL was already validated.
    }
  }
}

function validateRule(
  directive:
    | "Allow"
    | "Disallow",
  value: string,
  line: number,
  issues: RobotsIssue[]
) {
  if (!value) {
    issues.push({
      line,
      level: "Note",
      message:
        `${directive} has an empty pattern. Empty rules do not create a path restriction.`,
    });
    return;
  }

  if (
    value.charAt(0) !== "/"
  ) {
    issues.push({
      line,
      level: "Error",
      message:
        `${directive} path pattern "${value}" must begin with /.`,
    });
  }

  if (
    /[\u0000-\u001F\u007F]/.test(
      value
    )
  ) {
    issues.push({
      line,
      level: "Error",
      message:
        `${directive} pattern contains a control character.`,
    });
  }

  if (
    hasMalformedPercent(
      value
    )
  ) {
    issues.push({
      line,
      level: "Warning",
      message:
        `${directive} pattern contains a % that is not followed by two hexadecimal digits. Percent-encoding normalization is part of robots matching, so malformed escapes are risky.`,
    });
  }

  if (
    /[ \t]/.test(value)
  ) {
    issues.push({
      line,
      level: "Warning",
      message:
        `${directive} pattern contains raw whitespace. Review whether the intended request-path octet should be percent-encoded.`,
    });
  }
}

function analyzeGroupInteractions(
  groups: RobotsGroup[],
  issues: RobotsIssue[]
) {
  groups.forEach(
    (group) => {
      const allowValues =
        group.rules
          .filter(
            (rule) =>
              rule.directive ===
              "Allow"
          )
          .map(
            (rule) =>
              rule.value
          );
      const disallowValues =
        group.rules
          .filter(
            (rule) =>
              rule.directive ===
              "Disallow"
          )
          .map(
            (rule) =>
              rule.value
          );

      allowValues.forEach(
        (value) => {
          if (
            value &&
            disallowValues.indexOf(
              value
            ) !== -1
          ) {
            const rule =
              group.rules.find(
                (candidate) =>
                  candidate.directive ===
                    "Allow" &&
                  candidate.value ===
                    value
              );

            issues.push({
              line:
                rule
                  ? rule.line
                  : 0,
              level:
                "Warning",
              message:
                `Group ${group.index} contains equal Allow and Disallow patterns "${value}". Under RFC 9309, an equally specific Allow match wins.`,
            });
          }
        }
      );

      const broadBlock =
        group.rules.find(
          (rule) =>
            rule.directive ===
              "Disallow" &&
            rule.value === "/"
        );

      if (broadBlock) {
        const equalAllow =
          group.rules.find(
            (rule) =>
              rule.directive ===
                "Allow" &&
              rule.value === "/"
          );
        const exceptions =
          group.rules.filter(
            (rule) =>
              rule.directive ===
                "Allow" &&
              rule.value &&
              rule.value !==
                "/"
          );

        issues.push({
          line:
            broadBlock.line,
          level:
            "Warning",
          message:
            equalAllow
              ? "Disallow: / is paired with equal Allow: /. Equal specificity resolves to Allow under RFC 9309, so this pair does not express a block-all policy."
              : exceptions.length
              ? `Disallow: / broadly blocks crawling for this group, but ${exceptions.length} more-specific Allow exception${
                  exceptions.length ===
                  1
                    ? ""
                    : "s"
                } may reopen selected paths.`
              : "Disallow: / broadly blocks crawling for this group unless another merged matching group contributes a more-specific Allow rule.",
        });
      }
    }
  );
}

function buildMergedAgentView(
  groups: RobotsGroup[]
) {
  const map =
    Object.create(
      null
    ) as Record<
      string,
      {
        label: string;
        groups: number[];
        ruleCount: number;
      }
    >;

  groups.forEach(
    (group) => {
      group.userAgents.forEach(
        (entry) => {
          const key =
            entry.value.toLowerCase();

          if (!map[key]) {
            map[key] = {
              label:
                entry.value,
              groups: [],
              ruleCount: 0,
            };
          }

          if (
            map[
              key
            ].groups.indexOf(
              group.index
            ) === -1
          ) {
            map[
              key
            ].groups.push(
              group.index
            );
            map[
              key
            ].ruleCount +=
              group.rules.length;
          }
        }
      );
    }
  );

  return Object.keys(map)
    .sort()
    .map((key) => ({
      agent:
        map[key].label,
      groups:
        map[key].groups,
      ruleCount:
        map[key].ruleCount,
    }));
}

function analyzeRobotsTxt(
  source: string,
  rawServiceUrl: string
): RobotsReport {
  const serviceUrl =
    validateServiceUrl(
      rawServiceUrl
    );
  const sourceBytes =
    new TextEncoder().encode(
      source
    ).length;
  const lines =
    source
      .replace(
        /\r\n?/g,
        "\n"
      )
      .split("\n");
  const groups: RobotsGroup[] =
    [];
  const sitemaps: Array<{
    line: number;
    value: string;
  }> = [];
  const globalExtras: ExtraRecord[] =
    [];
  const issues: RobotsIssue[] =
    [];

  if (
    sourceBytes >
    512000
  ) {
    issues.push({
      line: 0,
      level: "Warning",
      message:
        `The pasted robots.txt is ${sourceBytes.toLocaleString()} UTF-8 bytes. RFC 9309 requires crawlers to support at least 500 KiB, but permits parsing limits, so very large files risk truncation or inconsistent handling beyond that baseline.`,
    });
  }

  let currentGroup:
    | RobotsGroup
    | null = null;

  if (serviceUrl) {
    const service =
      new URL(serviceUrl);

    if (
      service.pathname !==
      "/robots.txt"
    ) {
      issues.push({
        line: 0,
        level: "Warning",
        message:
          `The supplied deployment URL uses path "${service.pathname}". RFC 9309 defines the robots file at the lowercase top-level path /robots.txt for that service.`,
      });
    }

    if (service.search) {
      issues.push({
        line: 0,
        level: "Note",
        message:
          "The supplied robots URL contains a query string. Crawler discovery targets the /robots.txt path itself, so publish the file at the standard path without depending on a query.",
      });
    }

    if (service.hash) {
      issues.push({
        line: 0,
        level: "Note",
        message:
          "The supplied robots URL contains a fragment. URL fragments are not part of the HTTP request target used to retrieve robots.txt.",
      });
    }
  }

  lines.forEach(
    (rawLine, index) => {
      const lineNumber =
        index + 1;

      if (
        rawLine.indexOf(
          "#"
        ) !== -1
      ) {
        const beforeHash =
          rawLine
            .slice(
              0,
              rawLine.indexOf(
                "#"
              )
            )
            .trim();

        if (
          /^(allow|disallow)\s*:/i.test(
            beforeHash
          )
        ) {
          issues.push({
            line:
              lineNumber,
            level: "Note",
            message:
              "A # comment marker occurs on an Allow/Disallow line. If a literal hash octet was intended in a request-path pattern, it must not be written as a raw # here; fragments are not sent in HTTP requests anyway.",
          });
        }
      }

      const clean =
        stripComment(
          rawLine
        ).trim();

      if (!clean) {
        return;
      }

      const colon =
        clean.indexOf(":");

      if (colon <= 0) {
        issues.push({
          line:
            lineNumber,
          level: "Error",
          message:
            'Record must use "name: value" syntax.',
        });
        return;
      }

      const directive =
        clean
          .slice(0, colon)
          .trim();
      const lower =
        directive.toLowerCase();
      const value =
        clean
          .slice(colon + 1)
          .trim();

      if (
        lower ===
        "user-agent"
      ) {
        if (!value) {
          issues.push({
            line:
              lineNumber,
            level: "Error",
            message:
              "User-agent product token is missing.",
          });
          return;
        }

        if (
          !productTokenValid(
            value
          )
        ) {
          issues.push({
            line:
              lineNumber,
            level: "Error",
            message:
              `User-agent "${value}" is not an RFC 9309 product token. Use letters, underscore, hyphen, or * for the wildcard group.`,
          });
        }

        if (
          !currentGroup ||
          currentGroup.rules
            .length > 0
        ) {
          currentGroup = {
            index:
              groups.length +
              1,
            userAgents: [],
            rules: [],
            extras: [],
          };
          groups.push(
            currentGroup
          );
        }

        currentGroup.userAgents.push(
          {
            line:
              lineNumber,
            value,
          }
        );
        return;
      }

      if (
        lower === "allow" ||
        lower === "disallow"
      ) {
        if (
          !currentGroup ||
          !currentGroup
            .userAgents.length
        ) {
          issues.push({
            line:
              lineNumber,
            level: "Error",
            message:
              `${directive} appears before a User-agent group. It has no RFC 9309 group to belong to.`,
          });
          return;
        }

        const canonical =
          lower === "allow"
            ? "Allow"
            : "Disallow";

        validateRule(
          canonical,
          value,
          lineNumber,
          issues
        );

        currentGroup.rules.push(
          {
            line:
              lineNumber,
            directive:
              canonical,
            value,
          }
        );
        return;
      }

      if (
        lower === "sitemap"
      ) {
        sitemaps.push({
          line:
            lineNumber,
          value,
        });

        validateSitemapRecord(
          value,
          lineNumber,
          serviceUrl,
          issues
        );
        return;
      }

      const extra = {
        line: lineNumber,
        directive,
        value,
      };

      if (
        currentGroup &&
        currentGroup
          .userAgents.length
      ) {
        currentGroup.extras.push(
          extra
        );
      } else {
        globalExtras.push(
          extra
        );
      }

      if (
        lower ===
        "crawl-delay"
      ) {
        issues.push({
          line:
            lineNumber,
          level: "Note",
          message:
            "Crawl-delay is not standardized by RFC 9309. Some crawlers support it and others, including Googlebot, do not use it as a robots.txt directive.",
        });
      } else {
        issues.push({
          line:
            lineNumber,
          level: "Note",
          message:
            `${directive} is not one of RFC 9309's standardized User-agent, Allow, or Disallow records. Crawlers may interpret additional records, but they must not interfere with parsing standard groups.`,
        });
      }
    }
  );

  if (!groups.length) {
    issues.push({
      line: 0,
      level: "Error",
      message:
        "No User-agent group was found.",
    });
  }

  groups.forEach(
    (group) => {
      if (
        !group.rules.length
      ) {
        issues.push({
          line:
            group.userAgents
              .length
              ? group.userAgents[
                  0
                ].line
              : 0,
          level: "Note",
          message:
            `Group ${group.index} has no Allow or Disallow rules. Under the standard matching model, that group contributes no path restriction.`,
        });
      }

      const seenAgents: string[] =
        [];
      group.userAgents.forEach(
        (entry) => {
          const key =
            entry.value.toLowerCase();

          if (
            seenAgents.indexOf(
              key
            ) !== -1
          ) {
            issues.push({
              line:
                entry.line,
              level:
                "Note",
              message:
                `User-agent "${entry.value}" is repeated inside group ${group.index}.`,
            });
          } else {
            seenAgents.push(
              key
            );
          }
        }
      );
    }
  );

  analyzeGroupInteractions(
    groups,
    issues
  );

  const mergedAgents =
    buildMergedAgentView(
      groups
    );

  mergedAgents.forEach(
    (entry) => {
      if (
        entry.groups.length >
        1
      ) {
        issues.push({
          line: 0,
          level: "Warning",
          message:
            `User-agent "${entry.agent}" appears in groups ${entry.groups.join(
              ", "
            )}. RFC 9309 combines the rules from all groups matching the same product token; a later group does not override an earlier one.`,
        });

        const mergedRules: RobotsRule[] =
          [];

        entry.groups.forEach(
          (groupIndex) => {
            const group =
              groups[
                groupIndex - 1
              ];

            if (group) {
              group.rules.forEach(
                (rule) =>
                  mergedRules.push(
                    rule
                  )
              );
            }
          }
        );

        const allows =
          mergedRules.filter(
            (rule) =>
              rule.directive ===
              "Allow"
          );
        const disallows =
          mergedRules.filter(
            (rule) =>
              rule.directive ===
              "Disallow"
          );

        allows.forEach(
          (allow) => {
            if (
              allow.value &&
              disallows.some(
                (disallow) =>
                  disallow.value ===
                  allow.value
              )
            ) {
              issues.push({
                line:
                  allow.line,
                level:
                  "Warning",
                message:
                  `After merging groups for "${entry.agent}", pattern "${allow.value}" exists as both Allow and Disallow. Equal specificity resolves to Allow under RFC 9309.`,
              });
            }
          }
        );
      }
    }
  );

  if (
    sitemaps.length > 1
  ) {
    const normalized: string[] =
      [];

    sitemaps.forEach(
      (entry) => {
        if (
          normalized.indexOf(
            entry.value
          ) !== -1
        ) {
          issues.push({
            line:
              entry.line,
            level: "Note",
            message:
              `Duplicate Sitemap record "${entry.value}" was found.`,
          });
        } else {
          normalized.push(
            entry.value
          );
        }
      }
    );
  }

  return {
    groups,
    sitemaps,
    globalExtras,
    issues,
    totalLines:
      lines.length,
    sourceBytes,
    mergedAgents,
    serviceUrl,
  };
}

function formatRobotsReport(
  report: RobotsReport
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
  const lines = [
    "Robots.txt validation",
    `Status: ${
      errors
        ? "Needs correction"
        : "No RFC 9309 structural error found"
    }`,
    `Groups: ${report.groups.length}`,
    `Distinct product tokens: ${report.mergedAgents.length}`,
    `Sitemap records: ${report.sitemaps.length}`,
    `Source lines: ${report.totalLines}`,
    `UTF-8 bytes: ${report.sourceBytes.toLocaleString()}`,
    `Errors: ${errors}`,
    `Warnings: ${warnings}`,
    `Notes: ${notes}`,
  ];

  if (report.serviceUrl) {
    lines.push(
      `Deployment URL reviewed: ${report.serviceUrl}`
    );
  }

  lines.push(
    "",
    "Groups:"
  );

  report.groups.forEach(
    (group) => {
      lines.push(
        `Group ${group.index}`,
        `  User-agent: ${
          group.userAgents
            .map(
              (entry) =>
                entry.value
            )
            .join(", ") ||
          "(none)"
        }`
      );

      if (
        group.rules.length
      ) {
        group.rules.forEach(
          (rule) =>
            lines.push(
              `  Line ${rule.line}: ${rule.directive}: ${rule.value}`
            )
        );
      } else {
        lines.push(
          "  No standard Allow/Disallow rules."
        );
      }

      group.extras.forEach(
        (extra) =>
          lines.push(
            `  Extra record line ${extra.line}: ${extra.directive}: ${extra.value}`
          )
      );
    }
  );

  lines.push(
    "",
    "Merged product-token view:"
  );

  report.mergedAgents.forEach(
    (entry) =>
      lines.push(
        `- ${entry.agent}: groups ${entry.groups.join(
          ", "
        )}; ${entry.ruleCount} standard rule${
          entry.ruleCount ===
          1
            ? ""
            : "s"
        }`
      )
  );

  lines.push(
    "",
    "Sitemaps:"
  );

  if (
    report.sitemaps.length
  ) {
    report.sitemaps.forEach(
      (entry) =>
        lines.push(
          `- Line ${entry.line}: ${entry.value || "(empty)"}`
        )
    );
  } else {
    lines.push(
      "None declared (not required by RFC 9309)."
    );
  }

  lines.push(
    "",
    "Review:"
  );

  report.issues.forEach(
    (item, index) =>
      lines.push(
        `${index + 1}. ${item.level}${
          item.line
            ? ` on line ${item.line}`
            : ""
        }: ${item.message}`
      )
  );

  if (!report.issues.length) {
    lines.push(
      "No additional issue from this validator."
    );
  }

  lines.push(
    "",
    "Boundary: pasted-content validation cannot verify HTTP status, redirects, content type, encoding bytes, cache behavior, live crawler fetches, or whether a search engine will index a URL."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [serviceUrl, setServiceUrl] =
    useState("");
  const [input, setInput] =
    useState(SAMPLE_ROBOTS);
  const [report, setReport] =
    useState<RobotsReport | null>(
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
        "Paste robots.txt content to validate."
      );
      setReport(null);
      return;
    }

    try {
      setReport(
        analyzeRobotsTxt(
          input,
          serviceUrl
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to validate this robots.txt content."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setServiceUrl(
      "https://example.com/robots.txt"
    );
    setInput(
      SAMPLE_ROBOTS
    );
    clearResult();
  };

  const resetAll = () => {
    setServiceUrl("");
    setInput("");
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatRobotsReport(
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
        "The robots.txt report could not be copied. Select and copy it manually."
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

  return (
    <ToolShell
      title="Robots.txt Validator"
      description="Inspect robots.txt as RFC 9309 groups and rules: validate crawler product tokens and path patterns, expose duplicate-group merging and Allow/Disallow conflicts, keep Sitemap and crawler-specific extensions separate, and review the deployment path without pretending to crawl the live site."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Deployed robots.txt URL{" "}
          <span className="font-normal text-gray-500">
            (optional)
          </span>
        </label>
        <input
          value={serviceUrl}
          onChange={(event: {
            target: {
              value: string;
            };
          }) => {
            setServiceUrl(
              event.target.value
            );
            clearResult();
          }}
          placeholder="https://example.com/robots.txt"
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          This is used only to review the required top-level{" "}
          <code>/robots.txt</code> location and compare Sitemap origins. No URL
          is fetched.
        </p>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-900">
          robots.txt content
        </label>
        <textarea
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
          rows={18}
          placeholder={
            SAMPLE_ROBOTS
          }
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validate}
          className="yoryantra-btn"
        >
          Validate Robots.txt
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
        <div className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat
              label="Groups"
              value={String(
                report.groups.length
              )}
            />
            <Stat
              label="Product tokens"
              value={String(
                report.mergedAgents
                  .length
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
            <Stat
              label="UTF-8 bytes"
              value={report.sourceBytes.toLocaleString()}
            />
          </div>

          {report.issues.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                robots.txt review:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.issues.map(
                  (item, index) => (
                    <li
                      key={`${item.message}-${item.line}-${index}`}
                    >
                      <strong>
                        {item.level}
                        {item.line
                          ? ` · line ${item.line}`
                          : ""}
                        :
                      </strong>{" "}
                      {item.message}
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
                  Parsed groups
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Blank lines do not create override semantics. Matching groups
                  for the same product token can be combined.
                </p>
              </div>

              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {report.groups.map(
                (group) => (
                  <div
                    key={
                      group.index
                    }
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      Group{" "}
                      {group.index}
                    </div>
                    <div className="mt-2 text-xs leading-relaxed text-gray-600">
                      User-agent:{" "}
                      {group.userAgents
                        .map(
                          (entry) =>
                            entry.value
                        )
                        .join(
                          ", "
                        ) ||
                        "(none)"}
                    </div>

                    <div className="mt-3 space-y-2">
                      {group.rules.length ? (
                        group.rules.map(
                          (
                            rule,
                            index
                          ) => (
                            <code
                              key={`${rule.line}-${index}`}
                              className="block break-all rounded-lg bg-white p-3 text-xs text-gray-800"
                            >
                              line{" "}
                              {rule.line}:{" "}
                              {rule.directive}:{" "}
                              {rule.value}
                            </code>
                          )
                        )
                      ) : (
                        <p className="text-xs text-gray-500">
                          No standard Allow/Disallow rules.
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Merged product-token view
            </h3>
            <div className="mt-4 space-y-3">
              {report.mergedAgents.map(
                (entry) => (
                  <div
                    key={
                      entry.agent.toLowerCase()
                    }
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
                  >
                    <strong>
                      {entry.agent}
                    </strong>{" "}
                    → group
                    {entry.groups.length ===
                    1
                      ? ""
                      : "s"}{" "}
                    {entry.groups.join(
                      ", "
                    )}
                    {" · "}
                    {entry.ruleCount} standard rule
                    {entry.ruleCount ===
                    1
                      ? ""
                      : "s"}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          RFC 9309 group structure, path-pattern findings, merged user-agent
          groups, Sitemap records and extension notes will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Validation runs on the pasted text and optional deployment URL in your
        browser. The tool does not request the live robots.txt, inspect its HTTP
        status/redirects/cache headers, or ask a crawler how it currently treats
        your site. Site-wide analytics or advertising scripts, if enabled, are
        separate from validation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            robots.txt Is Parsed as Groups and Rules, Not as “Last Line Wins”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Each standard group starts with one or more User-agent product
            tokens and contains Allow/Disallow rules. If the same crawler
            product token appears in more than one group, RFC 9309 requires the
            matching rule sets to be combined.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That means adding a second Googlebot or ExampleBot block lower in
            the file does not erase the first block. This validator builds a
            merged-token view specifically to expose that mistake.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            The Most Specific Matching Pattern Wins; Equal Allow Beats Equal Disallow
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`User-agent: *
Disallow: /private/
Allow: /private/public-guide`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            The broader Disallow does not necessarily make every descendant
            inaccessible to the crawler. A more-specific matching Allow can
            reopen a path. When an Allow and Disallow match are equally
            specific, RFC 9309 says the Allow rule should be used.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This is why <code>Allow: /</code> and{" "}
            <code>Disallow: /</code> together do not mean “block everything.”
            Their specificity ties, so Allow wins.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            * and Terminal $ Are Pattern Operators
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9309 gives <code>*</code> wildcard meaning and uses a trailing{" "}
            <code>$</code> to anchor a match to the end. Those characters are
            therefore not ordinary literal path bytes when used in their
            special positions.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Matching also involves percent-encoded URI octets. A malformed{" "}
            <code>%</code> escape can make a rule difficult to reason about, so
            this validator reports it instead of pretending the visible text
            has obvious request-path semantics.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            A Raw # Starts a Comment—It Does Not Describe a URL Fragment Rule
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            In robots.txt, <code>#</code> introduces a comment. Separately,
            browser URL fragments such as <code>#reviews</code> are not sent to
            the web server as part of the HTTP request target. So trying to
            manage an in-page fragment with{" "}
            <code>Disallow: /page#reviews</code> is wrong in two different ways.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If a literal hash octet somehow belongs in the request-path data,
            URI percent-encoding is the relevant representation—not a raw
            comment marker.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            /robots.txt Is a Service-Level Location
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9309 defines discovery at the lowercase top-level path{" "}
            <code>/robots.txt</code>. Rules apply to the service identified by
            the scheme, host and port used to retrieve that file. A robots file
            buried at <code>/seo/robots.txt</code> is not the standard file for
            the whole site.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The optional deployment URL exists because valid content published
            at the wrong location is still operationally ineffective.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Sitemap and Crawl-delay Are Not Equivalent Kinds of robots.txt Record
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9309 standardizes User-agent, Allow and Disallow group parsing
            and explicitly permits crawlers to interpret additional records
            without letting them interfere with standard parsing.{" "}
            <code>Sitemap:</code> is widely supported by search engines as a
            sitemap-discovery record.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>Crawl-delay</code> is crawler-specific rather than an RFC 9309
            standard directive. Supporting it in one bot does not make it
            portable to another. This validator reports such extensions as
            extensions, not as universal robots syntax.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            robots.txt Is Public Crawl Guidance, Not Access Control
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            The file itself is publicly retrievable and often advertises the
            paths you are trying to discourage crawlers from fetching.
            Compliant crawler behavior is not authentication. Sensitive admin,
            account, document or API data needs real authorization.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Blocking crawl also does not guarantee a URL disappears from search
            results if the URL is discovered from other sources. Crawling,
            indexing and authorization are separate controls.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Pasted Syntax Cannot Tell You What a Live Crawler Actually Retrieved
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The live file can return 404, 5xx, redirect, be cached, be served
            with unexpected bytes, or differ between CDN and origin. RFC 9309
            defines crawler behavior around successful retrieval, redirects,
            unavailable files and caching; none of those facts exist in pasted
            text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            After syntax review, test the deployed URL and use the target search
            engine&apos;s debugging tools when the question is “what did this crawler
            actually see?”
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <a
            href="https://www.rfc-editor.org/rfc/rfc9309"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            RFC 9309
          </a>{" "}
          is the central reference for product-token matching, group merging,
          Allow/Disallow rules, specificity, special characters, retrieval,
          caching and the required <code>/robots.txt</code> location. For
          search-engine-specific records and behavior, use that crawler&apos;s own
          current documentation.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/robots-txt-validator" />
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
