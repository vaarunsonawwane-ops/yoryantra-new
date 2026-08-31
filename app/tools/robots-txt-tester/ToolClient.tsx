"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Rule = { type: "allow" | "disallow"; pattern: string; line: number };
type Group = { agents: string[]; rules: Rule[]; index: number };
type ParseIssue = { severity: "info" | "warning"; message: string; line?: number };
type MatchedRule = Rule & { normalizedPattern: string; specificity: number };
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
Allow: /private/public/
Disallow: /*?session=

User-agent: Googlebot
Disallow: /staging/

Sitemap: https://example.com/sitemap.xml`;

export default function ToolClient() {
  const [robotsInput, setRobotsInput] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [userAgent, setUserAgent] = useState("Googlebot");
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    if (!robotsInput.trim()) return null;
    return parseRobots(robotsInput);
  }, [robotsInput]);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const testRobots = () => {
    if (!robotsInput.trim()) {
      setError("Please paste robots.txt content.");
      setResult(null);
      return;
    }
    if (!targetInput.trim()) {
      setError("Please enter a URL or path to test.");
      setResult(null);
      return;
    }
    if (!userAgent.trim()) {
      setError("Please enter a crawler user-agent name.");
      setResult(null);
      return;
    }

    try {
      const next = evaluateRobots(parseRobots(robotsInput), targetInput, userAgent);
      setResult(next);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to test this robots.txt file.");
      setResult(null);
    }
  };

  const loadExample = () => {
    setRobotsInput(sampleRobots);
    setTargetInput("https://example.com/private/public/help?session=abc");
    setUserAgent("Googlebot");
    clearResult();
  };

  const resetAll = () => {
    setRobotsInput("");
    setTargetInput("");
    setUserAgent("Googlebot");
    clearResult();
  };

  const copyOutput = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <ToolShell
      title="Robots.txt Tester"
      description="Test pasted robots.txt rules against a URL path and crawler token using RFC 9309 matching plus Google-style user-agent selection and wildcard behavior."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Robots.txt Content</label>
          <textarea
            value={robotsInput}
            onChange={(event) => { setRobotsInput(event.target.value); clearResult(); }}
            rows={15}
            placeholder={sampleRobots}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">URL or Path</label>
            <input
              value={targetInput}
              onChange={(event) => { setTargetInput(event.target.value); clearResult(); }}
              placeholder="/products/item?ref=nav"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Crawler User-Agent</label>
            <input
              value={userAgent}
              onChange={(event) => { setUserAgent(event.target.value); clearResult(); }}
              placeholder="Googlebot"
              className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
          {parsed && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <p><strong>{parsed.groups.length}</strong> user-agent group{parsed.groups.length === 1 ? "" : "s"} parsed.</p>
              <p className="mt-1"><strong>{parsed.sitemaps.length}</strong> Sitemap directive{parsed.sitemaps.length === 1 ? "" : "s"} found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={testRobots} className="yoryantra-btn">Test Robots.txt</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
        {result && <button onClick={copyOutput} className="yoryantra-btn-outline">{copied ? "Copied" : "Copy Report"}</button>}
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {result && (
        <>
          <div className={`mt-8 rounded-2xl border p-5 ${result.allowed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">Decision</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{result.allowed ? "Allowed" : "Disallowed"}</div>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Matched user-agent: <code>{result.matchedAgent || "none"}</code>. Winning rule: {result.matchedRule ? <code>{`${result.matchedRule.type}: ${result.matchedRule.pattern}`}</code> : "none; allowed by default"}.
            </p>
          </div>

          {result.matchingRules.length > 0 && (
            <div className="mt-8 overflow-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Rule</th><th className="px-4 py-3">Pattern</th><th className="px-4 py-3">Normalized</th><th className="px-4 py-3">Specificity</th><th className="px-4 py-3">Line</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {result.matchingRules.map((rule, index) => (
                    <tr key={`${rule.line}-${index}`}><td className="px-4 py-3">{rule.type}</td><td className="px-4 py-3 font-mono">{rule.pattern}</td><td className="px-4 py-3 font-mono">{rule.normalizedPattern}</td><td className="px-4 py-3">{rule.specificity}</td><td className="px-4 py-3">{rule.line}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.issues.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900">Notes</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-800">
                {result.issues.map((issue, index) => <li key={index}>{issue.line ? `Line ${issue.line}: ` : ""}{issue.message}</li>)}
              </ul>
            </div>
          )}

          <pre className="mt-8 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">{result.output}</pre>
        </>
      )}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tester evaluates the robots.txt text you paste. It does not fetch a live robots.txt file or verify what a crawler actually received.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Testing Crawl Rules Without Guessing at Precedence</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Robots.txt decisions depend on the crawler group that applies and the most specific matching Allow or Disallow rule. This tester keeps matching rules visible so you can see why a path was allowed or blocked instead of treating robots.txt as a simple first-match list.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Trailing Wildcards Do Not Make a Rule More Specific</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            For Google-style matching, a trailing <code>*</code> that does not precede an end anchor is redundant. For example, <code>/*</code> behaves like <code>/</code> and <code>/fish*</code> behaves like <code>/fish</code>. The tester removes that redundant trailing wildcard before calculating precedence, preventing it from incorrectly outranking an equivalent Allow rule.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Robots.txt Controls Crawling, Not Privacy</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A disallowed URL can still be discovered from links and other signals. Use page-level indexing controls for indexing behavior and authentication or access controls for private content. Never use robots.txt as a security boundary.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">References Used by This Tester</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Core grouping and rule matching are based on RFC 9309. Crawler-token selection and wildcard details are aligned with Google&apos;s documented robots.txt interpretation for practical SEO testing.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <a href="https://www.rfc-editor.org/rfc/rfc9309.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">RFC 9309 →</a>
            <a href="https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">Google robots.txt interpretation →</a>
          </div>
        </div>
        <div><h2 className="text-xl font-semibold text-gray-900">Related Tools</h2><YoryantraRelatedTools currentHref="/tools/robots-txt-tester" /></div>
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
    issues.push({ severity: "warning", message: `This pasted file is ${inputBytes.toLocaleString()} UTF-8 bytes. Very large robots.txt files can be truncated by crawlers; Google documents a 500 KiB parsing limit.` });
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
      if (!value) { issues.push({ severity: "warning", line: lineNumber, message: "Empty user-agent value was ignored." }); return; }
      if (rulePhaseStarted) pushGroup();
      agents.push(value);
      return;
    }
    if (name === "allow" || name === "disallow") {
      if (!agents.length) { issues.push({ severity: "warning", line: lineNumber, message: `${name} appears before a user-agent group and was ignored.` }); return; }
      rulePhaseStarted = true;
      if (name === "disallow" && value === "") return;
      rules.push({ type: name, pattern: value, line: lineNumber });
      return;
    }
    if (name === "sitemap") {
      if (value) sitemaps.push(value);
      return;
    }
  });
  pushGroup();
  return { groups, issues, sitemaps };
}

function evaluateRobots(parsed: ReturnType<typeof parseRobots>, targetInput: string, userAgentInput: string): TestResult {
  const testedTarget = normalizeTarget(targetInput);
  const userAgent = userAgentInput.trim();
  const uaLower = userAgent.toLowerCase();
  const specificTokens = new Set<string>();

  parsed.groups.forEach((group) => group.agents.forEach((agent) => {
    const token = agent.trim().toLowerCase();
    if (token && token !== "*" && uaLower.includes(token)) specificTokens.add(token);
  }));

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
  applicableGroups.forEach((group) => group.rules.forEach((rule) => {
    const match = matchRule(rule.pattern, testedTarget);
    if (match.matches) matchingRules.push({ ...rule, normalizedPattern: match.normalizedPattern, specificity: match.specificity });
  }));

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
  if (!matchedAgent && parsed.groups.length) issues.push({ severity: "info", message: "No matching crawler group and no wildcard group were found. The URL is allowed by default." });
  if (robotsTxtPath) issues.push({ severity: "info", message: "/robots.txt is implicitly allowed by RFC 9309." });
  const base = { allowed, testedTarget, userAgent, matchedAgent, matchedRule, matchingRules, groups: parsed.groups, sitemaps: parsed.sitemaps, issues };
  return { ...base, output: buildOutput(base) };
}

function normalizeTarget(value: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Enter a URL or path to test.");
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    const parsed = new URL(trimmed);
    return normalizeRobotsOctets(`${parsed.pathname}${parsed.search}` || "/");
  }
  const withoutFragment = trimmed.split("#", 1)[0];
  return normalizeRobotsOctets(withoutFragment.startsWith("/") ? withoutFragment : `/${withoutFragment}`);
}

function normalizeRobotsOctets(value: string) {
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "%" && /^[0-9a-fA-F]{2}$/.test(value.slice(index + 1, index + 3))) {
      const hex = value.slice(index + 1, index + 3).toUpperCase();
      const decoded = String.fromCharCode(Number.parseInt(hex, 16));
      output += /^[A-Za-z0-9._~-]$/.test(decoded) ? decoded : `%${hex}`;
      index += 2;
      continue;
    }
    const codePoint = value.codePointAt(index) ?? 0;
    if (codePoint > 0x7f) {
      output += encodeURIComponent(String.fromCodePoint(codePoint)).toUpperCase();
      if (codePoint > 0xffff) index += 1;
    } else output += char;
  }
  return output;
}

function matchRule(pattern: string, target: string) {
  const normalizedPattern = normalizeRulePattern(pattern);
  const anchoredEnd = normalizedPattern.endsWith("$");
  const body = anchoredEnd ? normalizedPattern.slice(0, -1) : normalizedPattern;
  let regexSource = "^";
  for (const char of body) regexSource += char === "*" ? ".*" : escapeRegex(char);
  if (anchoredEnd) regexSource += "$";
  return {
    matches: new RegExp(regexSource).test(target),
    specificity: new TextEncoder().encode(normalizedPattern).length,
    normalizedPattern,
  };
}

function normalizeRulePattern(pattern: string) {
  let output = normalizeRobotsOctetsPreservingMeta(pattern);
  if (!output.endsWith("$")) output = output.replace(/\*+$/, "");
  return output;
}

function normalizeRobotsOctetsPreservingMeta(value: string) {
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "*" || (char === "$" && index === value.length - 1)) { output += char; continue; }
    if (char === "%" && /^[0-9a-fA-F]{2}$/.test(value.slice(index + 1, index + 3))) {
      const hex = value.slice(index + 1, index + 3).toUpperCase();
      const decoded = String.fromCharCode(Number.parseInt(hex, 16));
      output += /^[A-Za-z0-9._~-]$/.test(decoded) ? decoded : `%${hex}`;
      index += 2;
      continue;
    }
    const codePoint = value.codePointAt(index) ?? 0;
    if (codePoint > 0x7f) {
      output += encodeURIComponent(String.fromCodePoint(codePoint)).toUpperCase();
      if (codePoint > 0xffff) index += 1;
    } else output += char;
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
  } else lines.push("Winning rule: none (allowed by default)");
  if (result.issues.length) {
    lines.push("", "Notes:");
    result.issues.forEach((issue) => lines.push(`- ${issue.line ? `Line ${issue.line}: ` : ""}${issue.message}`));
  }
  return lines.join("\n");
}
