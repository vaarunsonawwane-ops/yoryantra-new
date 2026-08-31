"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type RuleType = "allow" | "disallow";

type Rule = {
  type: RuleType;
  pattern: string;
  line: number;
  groupIndex: number;
};

type Group = {
  agents: string[];
  rules: Rule[];
  index: number;
};

type ParseIssue = {
  severity: "info" | "warning";
  line?: number;
  message: string;
};

type MatchedRule = Rule & {
  normalizedPattern: string;
  specificity: number;
};

type TestResult = {
  allowed: boolean;
  testedTarget: string;
  userAgent: string;
  matchedAgent: string;
  matchedRule: MatchedRule | null;
  matchingRules: MatchedRule[];
  groups: Group[];
  sitemaps: string[];
  issues: ParseIssue[];
  output: string;
};

const sampleRobots = `User-agent: *
Disallow: /private/
Disallow: /*.pdf$
Allow: /private/public-guide.pdf

User-agent: Googlebot
Disallow: /search
Allow: /search/about`;

export default function ToolClient() {
  const [robotsInput, setRobotsInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [userAgent, setUserAgent] = useState("Googlebot");
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const testRobots = () => {
    try {
      if (!robotsInput.trim()) {
        setError("Paste robots.txt content to test.");
        setResult(null);
        return;
      }
      if (!urlInput.trim()) {
        setError("Enter a URL or path to test.");
        setResult(null);
        return;
      }
      if (!userAgent.trim()) {
        setError("Enter a crawler product token or user-agent string.");
        setResult(null);
        return;
      }

      const parsed = parseRobots(robotsInput);
      const next = evaluateRobots(parsed, urlInput, userAgent);
      setResult(next);
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to test these robots.txt rules.");
      setResult(null);
    }
  };

  const loadExample = () => {
    setRobotsInput(sampleRobots);
    setUrlInput("https://example.com/private/public-guide.pdf?download=1");
    setUserAgent("Googlebot");
    clearResult();
  };

  const resetAll = () => {
    setRobotsInput("");
    setUrlInput("");
    setUserAgent("Googlebot");
    clearResult();
  };

  const copyOutput = async () => {
    if (!result?.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <ToolShell
      title="Robots.txt Tester"
      description="Test a URL against robots.txt Allow and Disallow rules, see which crawler group applies, and inspect the longest matching rule. Everything is evaluated locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">Robots.txt Content</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste the file exactly as served. Comments, repeated user-agent groups, <code className="rounded bg-gray-100 px-1 py-0.5">*</code>, and <code className="rounded bg-gray-100 px-1 py-0.5">$</code> are handled.
          </p>
          <textarea
            value={robotsInput}
            onChange={(event) => {
              setRobotsInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleRobots}
            spellCheck={false}
            className="mt-4 min-h-[420px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900">URL or Path to Test</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Full URLs are accepted. Path and query are used for matching; fragments are not sent in HTTP requests and are ignored.
            </p>
            <input
              type="text"
              value={urlInput}
              onChange={(event) => {
                setUrlInput(event.target.value);
                clearResult();
              }}
              placeholder="https://example.com/private/page?view=1"
              spellCheck={false}
              className="mt-3 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-900">Crawler / User Agent</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              A crawler token such as <code className="rounded bg-gray-100 px-1 py-0.5">Googlebot</code> is simplest. A full HTTP User-Agent string also works when it contains the crawler token.
            </p>
            <input
              type="text"
              value={userAgent}
              onChange={(event) => {
                setUserAgent(event.target.value);
                clearResult();
              }}
              placeholder="Googlebot"
              spellCheck={false}
              className="mt-3 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            Robots.txt controls crawling, not authentication. A disallowed URL can still be known or indexed from other signals, and robots.txt is publicly readable. Do not use it to protect private content.
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={testRobots} className="yoryantra-btn">Test Rules</button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {result ? (
        <>
          <div className={`mt-8 rounded-2xl border p-6 ${result.allowed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">Crawler Decision</div>
                <div className={`mt-2 text-3xl font-semibold ${result.allowed ? "text-green-800" : "text-red-800"}`}>
                  {result.allowed ? "Allowed" : "Disallowed"}
                </div>
                <div className="mt-3 break-all text-sm leading-relaxed text-gray-700">{result.testedTarget}</div>
              </div>
              <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy Result"}</button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Matched User-Agent" value={result.matchedAgent || "None"} />
            <StatCard label="Applicable Rules" value={String(result.matchingRules.length)} />
            <StatCard label="Groups Parsed" value={String(result.groups.length)} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">Rule That Decided the Result</h3>
            {result.matchedRule ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${result.matchedRule.type === "allow" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {result.matchedRule.type.toUpperCase()}
                  </span>
                  <code className="break-all text-sm text-gray-900">{result.matchedRule.pattern}</code>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Line {result.matchedRule.line}. Specificity: {result.matchedRule.specificity} path-pattern octets. Longer matching patterns take precedence; equally specific Allow and Disallow rules prefer Allow.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                No Allow or Disallow rule matched this target. The default is to allow crawling for the selected crawler group.
              </p>
            )}

            {result.matchingRules.length > 1 ? (
              <div className="mt-5 overflow-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Rule</th>
                      <th className="px-4 py-3 font-semibold">Pattern</th>
                      <th className="px-4 py-3 font-semibold">Specificity</th>
                      <th className="px-4 py-3 font-semibold">Line</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {result.matchingRules.map((rule, index) => (
                      <tr key={`${rule.line}-${rule.pattern}-${index}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{rule.type}</td>
                        <td className="px-4 py-3 font-mono text-gray-700">{rule.pattern}</td>
                        <td className="px-4 py-3 text-gray-600">{rule.specificity}</td>
                        <td className="px-4 py-3 text-gray-600">{rule.line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {result.issues.length || result.sitemaps.length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">File Notes</h3>
              <div className="mt-4 space-y-3">
                {result.issues.map((issue, index) => (
                  <div key={`${issue.line ?? 0}-${index}`} className={`rounded-xl border p-4 text-sm leading-relaxed ${issue.severity === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-gray-200 bg-gray-50 text-gray-700"}`}>
                    {issue.line ? <span className="font-semibold">Line {issue.line}: </span> : null}{issue.message}
                  </div>
                ))}
                {result.sitemaps.length ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">Sitemap records found</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {result.sitemaps.map((sitemap) => <li key={sitemap} className="break-all">{sitemap}</li>)}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Robots.txt Matching Is More Than “First Rule Wins”</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Robots.txt is organized into user-agent groups. For a crawler, the relevant groups are selected first; their rules are then evaluated against the URL path. When more than one Allow or Disallow rule matches, the most specific path wins. If an Allow and Disallow rule are equally specific, Allow wins.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That detail matters. A broad <code className="rounded bg-gray-100 px-1 py-0.5">Disallow: /private/</code> can be overridden by a longer <code className="rounded bg-gray-100 px-1 py-0.5">Allow: /private/public-page</code>, but a shorter Allow should not cancel a more specific Disallow.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you enter a full URL, this browser tool uses its path and query for rule matching. It cannot verify that the pasted robots.txt was actually served from that URL&apos;s scheme, host, and port, nor can it reproduce crawler caching or HTTP-status handling. For a live Google-specific check, compare the result with the robots.txt report in Search Console.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Patterns, Queries, Wildcards, and Case</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Rule paths are case-sensitive even though the <code className="rounded bg-gray-100 px-1 py-0.5">user-agent</code> field is matched case-insensitively.</li>
            <li><code className="rounded bg-gray-100 px-1 py-0.5">*</code> matches zero or more characters and <code className="rounded bg-gray-100 px-1 py-0.5">$</code> anchors a pattern to the end of the URL.</li>
            <li>The query string can affect a match. For example, an end-anchored file rule may stop matching when extra query characters follow the filename.</li>
            <li>An empty <code className="rounded bg-gray-100 px-1 py-0.5">Disallow:</code> or <code className="rounded bg-gray-100 px-1 py-0.5">Allow:</code> rule has no blocking effect.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-amber-900">Robots.txt Does Not Mean “Do Not Index”</h2>
          <p className="mt-3 leading-relaxed text-amber-800">
            A disallowed URL cannot normally be crawled by a compliant crawler, but the URL itself can still be discovered from links or other signals. Use page-level indexing controls where you need indexing behavior, and use authentication or access control for private content.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Reference Used by This Tester</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            The core grouping, longest-match, Allow/Disallow, wildcard, comment, and encoding behavior comes from RFC 9309, the Robots Exclusion Protocol. The crawler-token selection here also follows Google&apos;s documented most-specific user-agent behavior, which is especially useful for SEO testing.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <a href="https://www.rfc-editor.org/rfc/rfc9309.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 9309 →</a>
            <a href="https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">Google robots.txt interpretation →</a>
            <a href="https://developers.google.com/crawling/docs/robots-txt/create-robots-txt" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">Google robots.txt testing guidance →</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/robots-txt-tester" />
        </div>
      </section>
    </ToolShell>
  );
}

function parseRobots(input: string) {
  const groups: Group[] = [];
  const issues: ParseIssue[] = [];
  const sitemaps: string[] = [];
  const inputBytes = new TextEncoder().encode(input).length;
  if (inputBytes > 500 * 1024) {
    issues.push({
      severity: "warning",
      message: `This pasted file is ${inputBytes.toLocaleString()} UTF-8 bytes. RFC 9309 requires crawlers to support at least 500 KiB, while Google documents a 500 KiB parsing limit; rules beyond a crawler's limit may be ignored.`,
    });
  }
  let agents: string[] = [];
  let rules: Rule[] = [];
  let groupIndex = 0;
  let rulePhaseStarted = false;

  const pushGroup = () => {
    if (!agents.length) return;
    groups.push({ agents: [...agents], rules: [...rules], index: groupIndex });
    groupIndex += 1;
    agents = [];
    rules = [];
    rulePhaseStarted = false;
  };

  const lines = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const withoutComment = rawLine.split("#", 1)[0].trim();
    if (!withoutComment) return;

    const separator = withoutComment.indexOf(":");
    if (separator <= 0) {
      issues.push({ severity: "warning", line: lineNumber, message: "This line has no directive separator ':' and was ignored." });
      return;
    }

    const name = withoutComment.slice(0, separator).trim().toLowerCase();
    const value = withoutComment.slice(separator + 1).trim();

    if (name === "user-agent") {
      if (!value) {
        issues.push({ severity: "warning", line: lineNumber, message: "Empty user-agent value was ignored." });
        return;
      }
      if (value !== "*" && !/^[A-Za-z_-]+$/.test(value)) {
        issues.push({ severity: "warning", line: lineNumber, message: `User-agent '${value}' is not an RFC 9309 product token. Strict product tokens contain only letters, underscore, or hyphen; crawler-specific parsers may be more lenient.` });
      }
      if (rulePhaseStarted) pushGroup();
      agents.push(value);
      return;
    }

    if (name === "allow" || name === "disallow") {
      if (!agents.length) {
        issues.push({ severity: "warning", line: lineNumber, message: `${name} appears before any user-agent group and is ignored by standards-compliant crawlers.` });
        return;
      }
      rulePhaseStarted = true;
      if (!value) return;
      rules.push({ type: name, pattern: value, line: lineNumber, groupIndex });
      return;
    }

    if (name === "sitemap") {
      if (value) sitemaps.push(value);
      return;
    }

    issues.push({ severity: "info", line: lineNumber, message: `Directive '${name}' is not part of RFC 9309 Allow/Disallow matching and was ignored by this test.` });
  });

  pushGroup();
  return { groups, issues, sitemaps };
}

function evaluateRobots(parsed: ReturnType<typeof parseRobots>, targetInput: string, userAgentInput: string): TestResult {
  const testedTarget = normalizeTarget(targetInput);
  const userAgent = userAgentInput.trim();
  const uaLower = userAgent.toLowerCase();

  const specificTokens = new Set<string>();
  parsed.groups.forEach((group) => {
    group.agents.forEach((agent) => {
      const token = agent.trim().toLowerCase();
      if (token && token !== "*" && uaLower.includes(token)) specificTokens.add(token);
    });
  });

  let matchedAgent = "";
  let applicableGroups: Group[] = [];

  if (specificTokens.size) {
    matchedAgent = [...specificTokens].sort((a, b) => b.length - a.length)[0];
    applicableGroups = parsed.groups.filter((group) => group.agents.some((agent) => agent.trim().toLowerCase() === matchedAgent));
  } else {
    matchedAgent = "*";
    applicableGroups = parsed.groups.filter((group) => group.agents.some((agent) => agent.trim() === "*"));
    if (!applicableGroups.length) matchedAgent = "";
  }

  const matchingRules: MatchedRule[] = [];
  applicableGroups.forEach((group) => {
    group.rules.forEach((rule) => {
      const match = matchRule(rule.pattern, testedTarget);
      if (match.matches) matchingRules.push({ ...rule, normalizedPattern: match.normalizedPattern, specificity: match.specificity });
    });
  });

  matchingRules.sort((a, b) => {
    if (b.specificity !== a.specificity) return b.specificity - a.specificity;
    if (a.type !== b.type) return a.type === "allow" ? -1 : 1;
    return a.line - b.line;
  });

  const robotsTxtPath = testedTarget.split("?", 1)[0] === "/robots.txt";
  const matchedRule = robotsTxtPath ? null : matchingRules[0] ?? null;
  const allowed = robotsTxtPath || !matchedRule || matchedRule.type === "allow";

  const issues = [...parsed.issues];
  if (!parsed.groups.length) issues.push({ severity: "info", message: "No user-agent groups were found, so no crawl restrictions apply." });
  if (!matchedAgent && parsed.groups.length) issues.push({ severity: "info", message: "No matching crawler group and no wildcard group were found. The URL is therefore allowed by default." });
  if (robotsTxtPath) issues.push({ severity: "info", message: "/robots.txt is implicitly allowed by RFC 9309." });

  const output = buildOutput({ allowed, testedTarget, userAgent, matchedAgent, matchedRule, matchingRules, groups: parsed.groups, sitemaps: parsed.sitemaps, issues });
  return { allowed, testedTarget, userAgent, matchedAgent, matchedRule, matchingRules, groups: parsed.groups, sitemaps: parsed.sitemaps, issues, output };
}

function normalizeTarget(value: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Enter a URL or path to test.");

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    const parsed = new URL(trimmed);
    return normalizeRobotsOctets(`${parsed.pathname}${parsed.search}` || "/");
  }

  const withoutFragment = trimmed.split("#", 1)[0];
  const withSlash = withoutFragment.startsWith("/") ? withoutFragment : `/${withoutFragment}`;
  return normalizeRobotsOctets(withSlash);
}

function normalizeRobotsOctets(value: string) {
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "%" && /^[0-9a-fA-F]{2}$/.test(value.slice(index + 1, index + 3))) {
      const hex = value.slice(index + 1, index + 3).toUpperCase();
      const code = Number.parseInt(hex, 16);
      const decoded = String.fromCharCode(code);
      if (/^[A-Za-z0-9._~-]$/.test(decoded)) output += decoded;
      else output += `%${hex}`;
      index += 2;
      continue;
    }
    const codePoint = value.codePointAt(index) ?? 0;
    if (codePoint > 0x7f) {
      output += encodeURIComponent(String.fromCodePoint(codePoint)).toUpperCase();
      if (codePoint > 0xffff) index += 1;
    } else {
      output += char;
    }
  }
  return output;
}

function matchRule(pattern: string, target: string) {
  const normalizedPattern = normalizeRulePattern(pattern);
  const anchoredEnd = normalizedPattern.endsWith("$");
  const body = anchoredEnd ? normalizedPattern.slice(0, -1) : normalizedPattern;
  let regexSource = "^";
  for (const char of body) {
    regexSource += char === "*" ? ".*" : escapeRegex(char);
  }
  if (anchoredEnd) regexSource += "$";
  const matches = new RegExp(regexSource).test(target);
  const specificity = new TextEncoder().encode(normalizedPattern).length;
  return { matches, specificity, normalizedPattern };
}

function normalizeRulePattern(pattern: string) {
  let output = "";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === "*" || (char === "$" && index === pattern.length - 1)) {
      output += char;
      continue;
    }
    if (char === "%" && /^[0-9a-fA-F]{2}$/.test(pattern.slice(index + 1, index + 3))) {
      const hex = pattern.slice(index + 1, index + 3).toUpperCase();
      const code = Number.parseInt(hex, 16);
      const decoded = String.fromCharCode(code);
      if (/^[A-Za-z0-9._~-]$/.test(decoded)) output += decoded;
      else output += `%${hex}`;
      index += 2;
      continue;
    }
    const codePoint = pattern.codePointAt(index) ?? 0;
    if (codePoint > 0x7f) {
      output += encodeURIComponent(String.fromCodePoint(codePoint)).toUpperCase();
      if (codePoint > 0xffff) index += 1;
    } else {
      output += char;
    }
  }
  return output;
}

function escapeRegex(char: string) {
  return /[\\^$.*+?()[\]{}|]/.test(char) ? `\\${char}` : char;
}

function buildOutput(result: Omit<TestResult, "output">) {
  const lines = [
    `Decision: ${result.allowed ? "Allowed" : "Disallowed"}`,
    `Crawler: ${result.userAgent}`,
    `Matched user-agent: ${result.matchedAgent || "none"}`,
    `Target: ${result.testedTarget}`,
  ];
  if (result.matchedRule) {
    lines.push(`Winning rule: ${result.matchedRule.type}: ${result.matchedRule.pattern}`);
    lines.push(`Rule line: ${result.matchedRule.line}`);
    lines.push(`Specificity: ${result.matchedRule.specificity}`);
  } else {
    lines.push("Winning rule: none (allowed by default)");
  }
  if (result.issues.length) {
    lines.push("", "Notes:");
    result.issues.forEach((issue) => lines.push(`- ${issue.line ? `Line ${issue.line}: ` : ""}${issue.message}`));
  }
  return lines.join("\n");
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
