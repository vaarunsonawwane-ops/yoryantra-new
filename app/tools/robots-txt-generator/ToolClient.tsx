"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type RuleGroup = {
  id: number;
  userAgents: string;
  allow: string;
  disallow: string;
};

type BuildResult = {
  output: string;
  warnings: string[];
  notes: string[];
  groupCount: number;
  ruleCount: number;
};

const INITIAL_GROUPS: RuleGroup[] = [
  {
    id: 1,
    userAgents: "*",
    allow: "/",
    disallow: "/admin/\n/private/",
  },
];

function uniqueLines(value: string) {
  const result: string[] = [];

  value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (result.indexOf(line) === -1) {
        result.push(line);
      }
    });

  return result;
}

function hasMalformedPercent(value: string) {
  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    if (value.charAt(index) === "%") {
      const pair = value.slice(
        index + 1,
        index + 3
      );

      if (!/^[0-9A-Fa-f]{2}$/.test(pair)) {
        return true;
      }

      index += 2;
    }
  }

  return false;
}

function validatePathPattern(
  value: string,
  groupIndex: number,
  directive: "Allow" | "Disallow"
) {
  if (value.charAt(0) !== "/") {
    throw new Error(
      `Rule Group ${groupIndex}: ${directive} pattern "${value}" must begin with /.`
    );
  }

  if (/[\u0000-\u001F\u007F]/.test(value)) {
    throw new Error(
      `Rule Group ${groupIndex}: ${directive} pattern "${value}" contains a control character.`
    );
  }

  if (/[ \t]/.test(value)) {
    throw new Error(
      `Rule Group ${groupIndex}: ${directive} pattern "${value}" contains raw whitespace. Percent-encode a literal space or reserved octet when appropriate.`
    );
  }

  if (value.indexOf("#") !== -1) {
    throw new Error(
      `Rule Group ${groupIndex}: ${directive} pattern "${value}" contains #. In robots.txt, # begins a comment; use %23 when a literal # octet is part of the pattern.`
    );
  }

  if (hasMalformedPercent(value)) {
    throw new Error(
      `Rule Group ${groupIndex}: ${directive} pattern "${value}" contains a malformed percent escape.`
    );
  }
}

function parseSitemapUrl(value: string) {
  try {
    const parsed = new URL(value);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return null;
    }

    if (parsed.username || parsed.password) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function buildRobotsTxt(
  groups: RuleGroup[],
  sitemapSource: string,
  siteOrigin: string
): BuildResult {
  if (!groups.length) {
    throw new Error(
      "Add at least one user-agent group."
    );
  }

  const warnings: string[] = [];
  const notes: string[] = [];
  const chunks: string[] = [];
  const seenAgents =
    Object.create(null) as Record<
      string,
      number[]
    >;
  let ruleCount = 0;

  groups.forEach(
    (group, zeroIndex) => {
      const groupIndex =
        zeroIndex + 1;
      const userAgents =
        uniqueLines(
          group.userAgents
        );
      const allow =
        uniqueLines(group.allow);
      const disallow =
        uniqueLines(
          group.disallow
        );

      if (!userAgents.length) {
        throw new Error(
          `Rule Group ${groupIndex} needs at least one User-agent product token.`
        );
      }

      userAgents.forEach(
        (agent) => {
          if (
            agent !== "*" &&
            !/^[A-Za-z_-]+$/.test(
              agent
            )
          ) {
            throw new Error(
              `Rule Group ${groupIndex}: "${agent}" is not an RFC 9309 product token. Use letters, underscore, hyphen, or * for the wildcard group.`
            );
          }

          const key =
            agent.toLowerCase();

          if (!seenAgents[key]) {
            seenAgents[key] = [];
          }

          seenAgents[key].push(
            groupIndex
          );
        }
      );

      allow.forEach((pattern) =>
        validatePathPattern(
          pattern,
          groupIndex,
          "Allow"
        )
      );
      disallow.forEach((pattern) =>
        validatePathPattern(
          pattern,
          groupIndex,
          "Disallow"
        )
      );

      if (
        !allow.length &&
        !disallow.length
      ) {
        warnings.push(
          `Rule Group ${groupIndex} has no Allow or Disallow rules. Matching crawlers are implicitly allowed.`
        );
      }

      if (
        allow.indexOf("/") !== -1 &&
        disallow.indexOf("/") !== -1
      ) {
        warnings.push(
          `Rule Group ${groupIndex} contains both Allow: / and Disallow: /. Equally specific Allow takes precedence under RFC 9309, so this is probably not the block-all rule you intended.`
        );
      }

      allow.forEach((pattern) => {
        if (
          disallow.indexOf(
            pattern
          ) !== -1
        ) {
          warnings.push(
            `Rule Group ${groupIndex} contains equivalent Allow and Disallow patterns "${pattern}". RFC 9309 gives the Allow rule precedence when specificity is equal.`
          );
        }
      });

      ruleCount +=
        allow.length +
        disallow.length;

      const lines = [
        ...userAgents.map(
          (agent) =>
            `User-agent: ${agent}`
        ),
        ...allow.map(
          (pattern) =>
            `Allow: ${pattern}`
        ),
        ...disallow.map(
          (pattern) =>
            `Disallow: ${pattern}`
        ),
      ];

      chunks.push(
        lines.join("\n")
      );
    }
  );

  Object.keys(seenAgents).forEach(
    (agent) => {
      if (
        seenAgents[agent].length >
        1
      ) {
        warnings.push(
          `User-agent "${agent}" appears in Rule Groups ${seenAgents[
            agent
          ].join(
            ", "
          )}. RFC 9309 combines rules from multiple groups matching the same product token; later groups do not override earlier ones.`
        );
      }
    }
  );

  const rawSitemapUrls =
    uniqueLines(
      sitemapSource
    );
  const sitemapUrls: string[] = [];
  let expectedOrigin = "";

  if (siteOrigin.trim()) {
    try {
      const parsedOrigin =
        new URL(
          siteOrigin.trim()
        );

      if (
        parsedOrigin.protocol !==
          "http:" &&
        parsedOrigin.protocol !==
          "https:"
      ) {
        throw new Error();
      }

      if (
        parsedOrigin.username ||
        parsedOrigin.password
      ) {
        throw new Error();
      }

      expectedOrigin =
        parsedOrigin.origin;

      if (
        parsedOrigin.pathname !==
          "/" ||
        parsedOrigin.search ||
        parsedOrigin.hash
      ) {
        notes.push(
          `Site origin was normalized to ${expectedOrigin}. robots.txt for this service belongs at ${expectedOrigin}/robots.txt.`
        );
      }
    } catch {
      throw new Error(
        "Site origin must be an absolute HTTP or HTTPS origin such as https://example.com."
      );
    }
  }

  rawSitemapUrls.forEach(
    (value) => {
      const parsed =
        parseSitemapUrl(value);

      if (!parsed) {
        throw new Error(
          `Sitemap URL "${value}" must be an absolute HTTP or HTTPS URL without embedded credentials.`
        );
      }

      if (parsed.hash) {
        warnings.push(
          `Sitemap URL "${value}" contained a fragment. The fragment was removed because Sitemap identifies the sitemap resource itself.`
        );
        parsed.hash = "";
      }

      const normalized =
        parsed.href;

      if (
        sitemapUrls.indexOf(
          normalized
        ) === -1
      ) {
        sitemapUrls.push(
          normalized
        );
      } else {
        warnings.push(
          `Duplicate Sitemap URL "${normalized}" was omitted.`
        );
      }

      if (
        expectedOrigin &&
        parsed.origin !==
          expectedOrigin
      ) {
        notes.push(
          `Sitemap URL ${normalized} is on a different origin from ${expectedOrigin}. Cross-site sitemap arrangements can be valid for search engines when ownership/verification requirements are satisfied, so confirm the deployment rather than assuming this is an error.`
        );
      }
    }
  );

  const output = [
    chunks.join("\n\n"),
    sitemapUrls.length
      ? sitemapUrls
          .map(
            (url) =>
              `Sitemap: ${url}`
          )
          .join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  notes.push(
    "The generator intentionally omits non-standard directives such as Crawl-delay. Some crawlers support extra fields, but RFC 9309 standardizes User-agent, Allow, and Disallow; other records are crawler-specific extensions."
  );

  notes.push(
    "robots.txt controls crawler access requests. It is not authentication, authorization, or a reliable way to keep a URL out of search results when the URL can be discovered elsewhere."
  );

  return {
    output,
    warnings,
    notes,
    groupCount: groups.length,
    ruleCount,
  };
}

export default function ToolClient() {
  const [groups, setGroups] =
    useState<RuleGroup[]>(
      INITIAL_GROUPS
    );
  const [sitemaps, setSitemaps] =
    useState(
      "https://example.com/sitemap.xml"
    );
  const [siteOrigin, setSiteOrigin] =
    useState(
      "https://example.com"
    );
  const [result, setResult] =
    useState<BuildResult | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [nextId, setNextId] =
    useState(2);
  const [copied, setCopied] =
    useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const updateGroup = (
    id: number,
    field:
      | "userAgents"
      | "allow"
      | "disallow",
    value: string
  ) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === id
          ? {
              ...group,
              [field]: value,
            }
          : group
      )
    );
    clearResult();
  };

  const addGroup = () => {
    setGroups((current) => [
      ...current,
      {
        id: nextId,
        userAgents: "",
        allow: "",
        disallow: "",
      },
    ]);
    setNextId(
      (value) => value + 1
    );
    clearResult();
  };

  const removeGroup = (
    id: number
  ) => {
    setGroups((current) =>
      current.filter(
        (group) =>
          group.id !== id
      )
    );
    clearResult();
  };

  const generate = () => {
    try {
      setResult(
        buildRobotsTxt(
          groups,
          sitemaps,
          siteOrigin
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to build robots.txt."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setGroups([
      {
        id: 1,
        userAgents: "*",
        allow:
          "/private/public-guide",
        disallow:
          "/admin/\n/private/",
      },
      {
        id: 2,
        userAgents:
          "ExampleBot",
        allow: "",
        disallow:
          "/experimental/",
      },
    ]);
    setSiteOrigin(
      "https://example.com"
    );
    setSitemaps(
      "https://example.com/sitemap.xml"
    );
    setNextId(3);
    clearResult();
  };

  const resetAll = () => {
    setGroups(
      INITIAL_GROUPS
    );
    setSitemaps(
      "https://example.com/sitemap.xml"
    );
    setSiteOrigin(
      "https://example.com"
    );
    setNextId(2);
    clearResult();
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.output
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The generated robots.txt could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Robots.txt Generator"
      description="Build RFC 9309-style crawler groups deliberately: validate product tokens and path patterns, expose duplicate-group merging, keep Sitemap records separate, and avoid presenting robots.txt as privacy or indexing control."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Site origin{" "}
          <span className="font-normal text-gray-500">
            (optional)
          </span>
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Used only to show the expected top-level robots.txt location and
          review sitemap origins. Nothing is fetched.
        </p>
        <input
          value={siteOrigin}
          onChange={(event: {
            target: { value: string };
          }) => {
            setSiteOrigin(
              event.target.value
            );
            clearResult();
          }}
          placeholder="https://example.com"
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-7 space-y-7">
        {groups.map(
          (group, index) => (
            <section
              key={group.id}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Rule Group{" "}
                    {index + 1}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Matching groups for the same product token are combined by
                    RFC 9309 crawlers; they are not override blocks.
                  </p>
                </div>

                {groups.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      removeGroup(
                        group.id
                      )
                    }
                    className="yoryantra-btn-outline whitespace-nowrap"
                  >
                    Remove Group
                  </button>
                ) : null}
              </div>

              <label className="mt-5 block text-sm font-medium text-gray-700">
                User-agent product tokens
              </label>
              <textarea
                value={
                  group.userAgents
                }
                onChange={(event: {
                  target: {
                    value: string;
                  };
                }) =>
                  updateGroup(
                    group.id,
                    "userAgents",
                    event.target.value
                  )
                }
                rows={3}
                placeholder={"*\nExampleBot"}
                spellCheck={false}
                className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                One token per line. RFC 9309 product tokens use letters,
                underscore or hyphen; <code>*</code> is the fallback wildcard.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Allow patterns
                  </label>
                  <textarea
                    value={
                      group.allow
                    }
                    onChange={(event: {
                      target: {
                        value: string;
                      };
                    }) =>
                      updateGroup(
                        group.id,
                        "allow",
                        event.target.value
                      )
                    }
                    rows={6}
                    placeholder={"/\n/private/public-guide"}
                    spellCheck={false}
                    className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Disallow patterns
                  </label>
                  <textarea
                    value={
                      group.disallow
                    }
                    onChange={(event: {
                      target: {
                        value: string;
                      };
                    }) =>
                      updateGroup(
                        group.id,
                        "disallow",
                        event.target.value
                      )
                    }
                    rows={6}
                    placeholder={"/admin/\n/private/"}
                    spellCheck={false}
                    className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                  />
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                One path pattern per line. Patterns begin with{" "}
                <code>/</code>. RFC 9309 supports <code>*</code> and terminal{" "}
                <code>$</code>; a literal <code>#</code> must be percent-encoded
                because <code>#</code> starts a comment.
              </p>
            </section>
          )
        )}
      </div>

      <button
        type="button"
        onClick={addGroup}
        className="yoryantra-btn-outline mt-5"
      >
        Add Rule Group
      </button>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Sitemap URLs{" "}
          <span className="font-normal text-gray-500">
            (optional)
          </span>
        </label>
        <textarea
          value={sitemaps}
          onChange={(event: {
            target: { value: string };
          }) => {
            setSitemaps(
              event.target.value
            );
            clearResult();
          }}
          rows={4}
          placeholder="https://example.com/sitemap.xml"
          spellCheck={false}
          className="mt-3 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          One absolute HTTP(S) sitemap URL per line. Sitemap is a commonly
          supported additional robots.txt record, not an Allow/Disallow rule.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generate}
          className="yoryantra-btn"
        >
          Generate robots.txt
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

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat
              label="Rule groups"
              value={String(
                result.groupCount
              )}
            />
            <Stat
              label="Allow / Disallow rules"
              value={String(
                result.ruleCount
              )}
            />
          </div>

          {result.warnings.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Review before publishing:
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
                  Generated robots.txt
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Publish as lowercase <code>/robots.txt</code> at the top level
                  of the service it controls.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[280px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output}
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
        <pre className="yoryantra-output mt-8 min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Generated crawler groups and review notes will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Generation is local to your browser. The tool does not request your
        existing robots.txt or test how Googlebot, Bingbot, or another crawler
        currently interprets a deployed file. Site-wide analytics or
        advertising scripts, if enabled, are separate from generation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            robots.txt Answers “May This Crawler Fetch This Path?”—Not “Is This Page Private?”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A robots.txt file is public and its rules are voluntary instructions
            for compliant crawlers. Anyone can request the file and see the
            paths you listed. A blocked URL can also be discovered through links
            or other sources even when a crawler does not fetch its contents.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Protect private content with authentication and authorization. Use
            crawler directives for crawl behavior, not as a substitute for
            access control.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Two Groups for the Same Bot Are Combined, Not Applied Top-to-Bottom Like CSS
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`User-agent: ExampleBot
Disallow: /private/

User-agent: ExampleBot
Allow: /private/public/`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9309 requires matching groups for the same product token to be
            combined before their rules are evaluated. The second block does
            not erase the first. This is why the generator warns when one
            product token is spread across several groups.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The Most Specific Matching Path Wins; Equal Allow Beats Equal Disallow
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            With <code>Disallow: /private/</code> and{" "}
            <code>Allow: /private/public/</code>, a compliant crawler can fetch
            the more-specific public path while the broader private subtree
            stays disallowed. Specificity is based on the length of the matched
            path pattern in octets after the protocol&apos;s URI normalization
            rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If an Allow and Disallow rule are equally specific, RFC 9309 says
            the Allow rule should be used. That makes{" "}
            <code>Allow: /</code> plus <code>Disallow: /</code> a poor way to
            express “block everything.”
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            # Is a Comment Marker, So a Literal Hash Must Not Be Pasted Raw Into a Rule
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            In robots.txt, <code>#</code> starts a comment. A line intended as{" "}
            <code>Disallow: /file#part</code> would not mean what it visually
            appears to mean. When a literal hash octet belongs in the URI
            pattern, use its percent-encoded form where appropriate.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Fragments in normal web URLs are not sent to the server in HTTP
            requests, so they are usually not something robots.txt can control
            as separate resources anyway.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            * and $ Are Matching Operators, Not Ordinary Path Characters
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9309 defines <code>*</code> as matching zero or more characters
            and <code>$</code> as marking the end of a match pattern. If the
            actual resource path contains a literal asterisk or dollar sign,
            percent-encode that octet rather than expecting it to be matched
            literally.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Sitemap Line Helps Discovery; It Does Not Change the Crawl Rules Above It
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Sitemap records are widely supported additional robots.txt records.
            RFC 9309 explicitly allows crawlers to interpret other records and
            says those records must not interfere with parsing standard groups
            and rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Listing a sitemap therefore does not “allow” URLs that a matching
            Disallow rule blocks. Discovery and crawler access are separate
            concerns.
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
          is the central reference for this generator because it standardizes
          group matching, product tokens, Allow/Disallow path rules,
          specificity, special characters, UTF-8, caching behavior, and the
          required top-level <code>/robots.txt</code> location.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/robots-txt-generator" />
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
