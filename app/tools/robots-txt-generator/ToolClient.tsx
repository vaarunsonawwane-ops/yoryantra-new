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
};

const initialGroups: RuleGroup[] = [
  {
    id: 1,
    userAgents: "*",
    allow: "/",
    disallow: "/admin\n/private",
  },
];

export default function ToolClient() {
  const [groups, setGroups] = useState<RuleGroup[]>(initialGroups);
  const [sitemaps, setSitemaps] = useState("https://example.com/sitemap.xml");
  const [output, setOutput] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [nextId, setNextId] = useState(2);

  const updateGroup = (
    id: number,
    field: "userAgents" | "allow" | "disallow",
    value: string
  ) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === id ? { ...group, [field]: value } : group
      )
    );
  };

  const addGroup = () => {
    setGroups((current) => [
      ...current,
      { id: nextId, userAgents: "", allow: "", disallow: "" },
    ]);
    setNextId((value) => value + 1);
  };

  const removeGroup = (id: number) => {
    setGroups((current) => current.filter((group) => group.id !== id));
  };

  const generate = () => {
    try {
      const result = buildRobotsTxt(groups, sitemaps);
      setOutput(result.output);
      setWarnings(result.warnings);
      setError("");
    } catch (err) {
      setOutput("");
      setWarnings([]);
      setError(err instanceof Error ? err.message : "Unable to build robots.txt.");
    }
  };

  const resetAll = () => {
    setGroups(initialGroups);
    setSitemaps("https://example.com/sitemap.xml");
    setOutput("");
    setWarnings([]);
    setError("");
    setNextId(2);
  };

  return (
    <ToolShell
      title="Robots.txt Generator"
      description="Build robots.txt groups with user-agent, Allow, Disallow, and Sitemap records while checking common Robots Exclusion Protocol mistakes."
    >
      <div className="space-y-8">
        {groups.map((group, index) => (
          <section
            key={group.id}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Rule Group {index + 1}
              </h2>
              {groups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="yoryantra-btn-outline text-sm"
                >
                  Remove Group
                </button>
              )}
            </div>

            <label className="mt-5 block text-sm font-medium text-gray-700">
              User agents
            </label>
            <textarea
              value={group.userAgents}
              onChange={(event: { target: { value: string } }) =>
                updateGroup(group.id, "userAgents", event.target.value)
              }
              rows={3}
              placeholder={"*\nGooglebot"}
              className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
            <p className="mt-2 text-sm text-gray-500">
              One product token per line. Use * for all crawlers.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Allow paths
                </label>
                <textarea
                  value={group.allow}
                  onChange={(event: { target: { value: string } }) =>
                    updateGroup(group.id, "allow", event.target.value)
                  }
                  rows={5}
                  placeholder={"/\n/private/public-file.html"}
                  className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Disallow paths
                </label>
                <textarea
                  value={group.disallow}
                  onChange={(event: { target: { value: string } }) =>
                    updateGroup(group.id, "disallow", event.target.value)
                  }
                  rows={5}
                  placeholder={"/admin\n/private"}
                  className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={addGroup}
        className="yoryantra-btn-outline mt-5"
      >
        Add Rule Group
      </button>

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700">
          Sitemap URLs
        </label>
        <textarea
          value={sitemaps}
          onChange={(event: { target: { value: string } }) => setSitemaps(event.target.value)}
          rows={3}
          placeholder="https://example.com/sitemap.xml"
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm text-gray-500">
          Optional. Add one absolute HTTP or HTTPS sitemap URL per line.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generate} className="yoryantra-btn">
          Generate robots.txt
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

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <p className="font-semibold">Review these notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated robots.txt
          </h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output mt-3 min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Generated robots.txt will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Build crawler groups without treating robots.txt as security
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A robots.txt file contains one or more user-agent groups followed by
            Allow and Disallow rules. RFC 9309 says crawlers use the most
            specific matching path, and an equally specific Allow rule takes
            precedence over Disallow. Multiple groups that match the same
            crawler can be combined by the crawler.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Robots rules are public crawl instructions, not authentication or
            access control. Do not list a sensitive path and assume the file
            makes that path private.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Details worth checking before publishing
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>User-agent product tokens use letters, underscores, or hyphens; * matches all crawlers.</li>
            <li>Allow and Disallow patterns normally begin with / and may use * and $ matching characters.</li>
            <li>Sitemap records are commonly understood by search engines but are outside the core Allow/Disallow grammar.</li>
            <li>Publish the file at the top-level /robots.txt location for the host it controls.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reference
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generator follows the group and rule model in{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc9309"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline"
            >
              RFC 9309, Robots Exclusion Protocol
            </a>
            . The generation happens locally in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/robots-txt-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildRobotsTxt(groups: RuleGroup[], sitemapSource: string): BuildResult {
  if (!groups.length) {
    throw new Error("Add at least one user-agent group.");
  }

  const warnings: string[] = [];
  const chunks: string[] = [];

  groups.forEach((group, index) => {
    const userAgents = uniqueLines(group.userAgents);
    const allow = uniqueLines(group.allow);
    const disallow = uniqueLines(group.disallow);

    if (!userAgents.length) {
      throw new Error(`Rule Group ${index + 1} needs at least one user agent.`);
    }

    userAgents.forEach((agent) => {
      if (agent !== "*" && !/^[A-Za-z_-]+$/.test(agent)) {
        throw new Error(
          `Rule Group ${index + 1}: "${agent}" is not a valid RFC 9309 product token.`
        );
      }
    });

    [...allow, ...disallow].forEach((path) => {
      if (!path.startsWith("/")) {
        warnings.push(
          `Rule Group ${index + 1}: "${path}" does not begin with /. Review whether this is the path pattern you intended.`
        );
      }
      if (path.includes("#")) {
        warnings.push(
          `Rule Group ${index + 1}: "#" starts a robots.txt comment; encode a literal # if it belongs in the path.`
        );
      }
    });

    if (!allow.length && !disallow.length) {
      warnings.push(
        `Rule Group ${index + 1} has no rules, which implicitly allows crawling for matching user agents.`
      );
    }

    const lines = [
      ...userAgents.map((agent) => `User-agent: ${agent}`),
      ...allow.map((path) => `Allow: ${path}`),
      ...disallow.map((path) => `Disallow: ${path}`),
    ];
    chunks.push(lines.join("\n"));
  });

  const sitemapUrls = uniqueLines(sitemapSource);
  sitemapUrls.forEach((value) => {
    const url = parseHttpUrl(value);
    if (!url) {
      throw new Error(`Sitemap URL "${value}" must be an absolute HTTP or HTTPS URL.`);
    }
  });

  const output = [
    chunks.join("\n\n"),
    sitemapUrls.length
      ? sitemapUrls.map((url) => `Sitemap: ${url}`).join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return { output, warnings: Array.from(new Set(warnings)) };
}

function uniqueLines(value: string) {
  return Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    )
  );
}

function parseHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
