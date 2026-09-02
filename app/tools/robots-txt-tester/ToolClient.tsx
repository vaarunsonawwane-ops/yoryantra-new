"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type AgentMode = "product-token" | "full-user-agent";
type RuleType = "allow" | "disallow";

type Rule = {
  type: RuleType;
  pattern: string;
  line: number;
  groupIndex: number;
};

type Group = {
  agents: string[];
  matchTokens: string[];
  rules: Rule[];
  extras: Array<{
    directive: string;
    value: string;
    line: number;
  }>;
  index: number;
};

type ParseIssue = {
  severity: "info" | "warning";
  line: number;
  message: string;
};

type MatchedRule = Rule & {
  normalizedPattern: string;
  specificity: number;
};

type ParsedRobots = {
  groups: Group[];
  issues: ParseIssue[];
  sitemaps: string[];
  bytes: number;
  parsedBytes: number;
  truncated: boolean;
};

type TestResult = {
  allowed: boolean;
  testedTarget: string;
  userAgentInput: string;
  agentMode: AgentMode;
  matchedAgent: string;
  matchedGroups: number[];
  matchedRule: MatchedRule | null;
  matchingRules: MatchedRule[];
  groups: Group[];
  sitemaps: string[];
  issues: ParseIssue[];
  output: string;
};

const SAMPLE = `User-agent: *
Disallow: /private/
Disallow: /*.pdf$
Allow: /private/public-guide.pdf

User-agent: Googlebot
Disallow: /search
Allow: /search/about

Sitemap: https://example.com/sitemap.xml`;

function hasControl(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (
      code < 0x20 &&
      code !== 0x09
    ) {
      return true;
    }

    if (code === 0x7f) {
      return true;
    }
  }

  return false;
}

function strictProductToken(value: string) {
  return value === "*" || /^[A-Za-z_-]+$/.test(value);
}

function googleLikeToken(value: string) {
  if (value === "*") {
    return "*";
  }

  const match = value.match(/^[A-Za-z_-]+/);
  return match ? match[0] : "";
}

function hasMalformedPercentEscape(value: string) {
  return /%(?![0-9A-Fa-f]{2})/.test(value);
}

function hasLoneSurrogate(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);

      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        return true;
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }

  return false;
}

function truncateUtf8(input: string, maxBytes: number) {
  const encoded = new TextEncoder().encode(input);

  if (encoded.length <= maxBytes) {
    return {
      text: input,
      totalBytes: encoded.length,
      parsedBytes: encoded.length,
      truncated: false,
    };
  }

  let end = maxBytes;
  const fatalDecoder = new TextDecoder("utf-8", { fatal: true });
  let decoded = "";

  while (end > 0) {
    try {
      decoded = fatalDecoder.decode(encoded.slice(0, end));
      break;
    } catch {
      end -= 1;
    }
  }

  return {
    text: decoded,
    totalBytes: encoded.length,
    parsedBytes: end,
    truncated: true,
  };
}

function stripComment(rawLine: string) {
  const hash = rawLine.indexOf("#");

  return hash === -1
    ? rawLine
    : rawLine.slice(0, hash);
}

function parseRobots(
  input: string,
  maxBytes?: number
): ParsedRobots {
  const groups: Group[] = [];
  const issues: ParseIssue[] = [];
  const sitemaps: string[] = [];
  const limited =
    typeof maxBytes === "number"
      ? truncateUtf8(input, maxBytes)
      : {
          text: input,
          totalBytes: new TextEncoder().encode(input).length,
          parsedBytes: new TextEncoder().encode(input).length,
          truncated: false,
        };
  const bytes = limited.totalBytes;

  if (limited.truncated) {
    issues.push({
      severity: "warning",
      line: 0,
      message:
        `Google-style mode parses only the first 500 KiB (${limited.parsedBytes.toLocaleString()} UTF-8 bytes) here because Google's documented robots.txt limit ignores content after that point. The pasted file is ${bytes.toLocaleString()} bytes.`,
    });
  } else if (bytes > 512000) {
    issues.push({
      severity: "warning",
      line: 0,
      message:
        `The pasted robots.txt is ${bytes.toLocaleString()} UTF-8 bytes. RFC 9309 requires support for at least 500 KiB but permits crawler-specific parsing limits, so a generic product-token result can differ from a crawler that stops earlier.`,
    });
  }

  const normalized = limited.text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  let agents: string[] = [];
  let matchTokens: string[] = [];
  let rules: Rule[] = [];
  let extras: Group["extras"] = [];
  let groupIndex = 0;
  let rulePhaseStarted = false;

  const pushGroup = () => {
    if (!agents.length) {
      return;
    }

    groups.push({
      agents: agents.slice(),
      matchTokens: matchTokens.slice(),
      rules: rules.slice(),
      extras: extras.slice(),
      index: groupIndex,
    });
    groupIndex += 1;
    agents = [];
    matchTokens = [];
    rules = [];
    extras = [];
    rulePhaseStarted = false;
  };

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;

    if (hasControl(rawLine)) {
      issues.push({
        severity: "warning",
        line: lineNumber,
        message:
          "This line contains a control character outside normal horizontal whitespace and may not be a valid UTF-8 robots.txt record.",
      });
    }

    if (hasLoneSurrogate(rawLine)) {
      issues.push({
        severity: "warning",
        line: lineNumber,
        message:
          "This line contains an unpaired UTF-16 surrogate. It cannot be represented as a Unicode scalar value in valid UTF-8; matching uses U+FFFD replacement bytes for that invalid browser string sequence.",
      });
    }

    const withoutComment = stripComment(rawLine).trim();

    if (!withoutComment) {
      return;
    }

    const separator = withoutComment.indexOf(":");

    if (separator <= 0) {
      issues.push({
        severity: "warning",
        line: lineNumber,
        message:
          "This non-empty line has no directive ':' separator and was ignored.",
      });
      return;
    }

    const name = withoutComment
      .slice(0, separator)
      .trim()
      .toLowerCase();
    const value = withoutComment
      .slice(separator + 1)
      .trim();

    if (name === "user-agent") {
      if (!value) {
        issues.push({
          severity: "warning",
          line: lineNumber,
          message: "Empty User-agent value was ignored.",
        });
        return;
      }

      if (rulePhaseStarted) {
        pushGroup();
      }

      agents.push(value);

      if (!strictProductToken(value)) {
        const googleToken = googleLikeToken(value);

        issues.push({
          severity: "warning",
          line: lineNumber,
          message:
            googleToken
              ? `User-agent "${value}" is not an RFC 9309 product-token. Strict REP matching will not use it; Google's parser can treat the leading token "${googleToken}" as the crawler token.`
              : `User-agent "${value}" has no usable RFC 9309 product-token and was retained only for diagnostics.`,
        });
        matchTokens.push("");
      } else {
        matchTokens.push(value);
      }

      return;
    }

    if (name === "allow" || name === "disallow") {
      if (!agents.length) {
        issues.push({
          severity: "warning",
          line: lineNumber,
          message:
            `${name} appears before a User-agent group and is ignored by standards-compliant crawlers.`,
        });
        return;
      }

      rulePhaseStarted = true;

      if (!value) {
        return;
      }

      if (value.charAt(0) !== "/" && value.charAt(0) !== "*") {
        issues.push({
          severity: "warning",
          line: lineNumber,
          message:
            `${name} pattern "${value}" begins with neither "/" nor "*", so it was ignored. Current Google guidance recommends a leading "/"; RFC 9309's own wildcard example uses a leading "*".`,
        });
        return;
      }

      if (value.charAt(0) === "*") {
        issues.push({
          severity: "info",
          line: lineNumber,
          message:
            `Pattern "${value}" starts with "*". RFC 9309's ABNF says a path-pattern begins with "/", but Section 5.1 uses "*.gif$"; reported erratum 7995 proposes allowing "*" in that position. The pattern is matched for interoperability, while "/*..." remains the clearer spelling for Google-oriented files.`,
        });
      }

      if (hasMalformedPercentEscape(value)) {
        issues.push({
          severity: "warning",
          line: lineNumber,
          message:
            `${name} pattern "${value}" contains a percent sign that is not followed by two hexadecimal digits. It remains visible for comparison, but URI percent-encoding is malformed and crawler behavior can differ.`,
        });
      }

      if (
        hasControl(value) ||
        /[ \t]/.test(value)
      ) {
        issues.push({
          severity: "warning",
          line: lineNumber,
          message:
            `${name} contains raw whitespace/control characters inside its path pattern and was ignored. Encode a literal space in a URI path rather than placing a raw space in the REP pattern.`,
        });
        return;
      }

      rules.push({
        type: name,
        pattern: value,
        line: lineNumber,
        groupIndex,
      });
      return;
    }

    if (name === "sitemap") {
      if (value) {
        sitemaps.push(value);

        try {
          const sitemapUrl = new URL(value);

          if (
            sitemapUrl.protocol !== "http:" &&
            sitemapUrl.protocol !== "https:"
          ) {
            issues.push({
              severity: "warning",
              line: lineNumber,
              message:
                `Sitemap value "${value}" is absolute but does not use HTTP or HTTPS. Google documents Sitemap records as fully qualified URLs.`,
            });
          }
        } catch {
          issues.push({
            severity: "warning",
            line: lineNumber,
            message:
              `Sitemap value "${value}" is not a fully qualified URL. Google expects an absolute Sitemap URL including the protocol and host.`,
          });
        }
      }

      if (agents.length) {
        extras.push({
          directive: name,
          value,
          line: lineNumber,
        });
      }
      return;
    }

    if (agents.length) {
      extras.push({
        directive: name,
        value,
        line: lineNumber,
      });
    }

    issues.push({
      severity: "info",
      line: lineNumber,
      message:
        `Directive "${name}" is outside RFC 9309 Allow/Disallow matching and does not terminate the current group.`,
    });
  });

  pushGroup();

  if (!groups.length) {
    issues.push({
      severity: "info",
      line: 0,
      message:
        "No usable User-agent group was found. In REP terms no crawl rules apply.",
    });
  }

  return {
    groups,
    issues,
    sitemaps,
    bytes,
    parsedBytes: limited.parsedBytes,
    truncated: limited.truncated,
  };
}

function normalizeOctets(value: string) {
  let output = "";

  for (let index = 0; index < value.length; index += 1) {
    const char = value.charAt(index);

    if (
      char === "%" &&
      /^[0-9A-Fa-f]{2}$/.test(
        value.slice(index + 1, index + 3)
      )
    ) {
      const hex = value
        .slice(index + 1, index + 3)
        .toUpperCase();
      const byte = Number.parseInt(hex, 16);
      const decoded = String.fromCharCode(byte);

      if (/^[A-Za-z0-9._~-]$/.test(decoded)) {
        output += decoded;
      } else {
        output += `%${hex}`;
      }

      index += 2;
      continue;
    }

    const codePoint = value.codePointAt(index);

    if (
      typeof codePoint === "number" &&
      codePoint >= 0xd800 &&
      codePoint <= 0xdfff
    ) {
      output += "%EF%BF%BD";
    } else if (
      typeof codePoint === "number" &&
      codePoint > 0x7f
    ) {
      output += encodeURIComponent(
        String.fromCodePoint(codePoint)
      ).toUpperCase();

      if (codePoint > 0xffff) {
        index += 1;
      }
    } else {
      output += char;
    }
  }

  return output;
}

function normalizeTargetOctets(
  value: string
) {
  const normalized =
    normalizeOctets(value);
  let output = "";

  for (
    let index = 0;
    index <
    normalized.length;
    index += 1
  ) {
    const char =
      normalized.charAt(
        index
      );

    if (char === "*") {
      output += "%2A";
    } else if (
      char === "$"
    ) {
      output += "%24";
    } else {
      output += char;
    }
  }

  return output;
}

function normalizeTarget(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Enter a URL or path to test.");
  }

  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(trimmed)) {
    let parsed: URL;

    try {
      parsed = new URL(trimmed);
    } catch {
      throw new Error("Enter a valid URL or URL path.");
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(
        "Full URL testing is limited to HTTP and HTTPS resources."
      );
    }

    return normalizeTargetOctets(
      `${parsed.pathname}${parsed.search}` || "/"
    );
  }

  const hash = trimmed.indexOf("#");
  const withoutFragment =
    hash === -1 ? trimmed : trimmed.slice(0, hash);
  const withSlash =
    withoutFragment.charAt(0) === "/"
      ? withoutFragment
      : `/${withoutFragment}`;

  return normalizeTargetOctets(
    withSlash
  );
}

function canonicalPattern(pattern: string) {
  let normalized = normalizeOctets(pattern);

  if (
    normalized.charAt(normalized.length - 1) !== "$"
  ) {
    while (
      normalized.length > 1 &&
      normalized.charAt(normalized.length - 1) === "*"
    ) {
      normalized = normalized.slice(0, -1);
    }
  }

  return normalized;
}

function patternSpecificity(pattern: string) {
  let octets = 0;

  for (let index = 0; index < pattern.length; index += 1) {
    if (
      pattern.charAt(index) === "%" &&
      /^[0-9A-F]{2}$/.test(
        pattern.slice(index + 1, index + 3)
      )
    ) {
      octets += 1;
      index += 2;
    } else {
      octets += 1;
    }
  }

  return octets;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchRule(pattern: string, target: string) {
  const normalizedPattern = canonicalPattern(pattern);
  const anchoredEnd =
    normalizedPattern.charAt(normalizedPattern.length - 1) === "$";
  const body = anchoredEnd
    ? normalizedPattern.slice(0, -1)
    : normalizedPattern;
  let regexSource = "^";

  for (let index = 0; index < body.length; index += 1) {
    const char = body.charAt(index);
    regexSource += char === "*" ? ".*" : escapeRegex(char);
  }

  if (anchoredEnd) {
    regexSource += "$";
  }

  const matches = new RegExp(regexSource).test(target);

  return {
    matches,
    normalizedPattern,
    specificity: patternSpecificity(normalizedPattern),
  };
}

function strictRelevantGroups(
  groups: Group[],
  productToken: string
) {
  const token = productToken.trim().toLowerCase();

  if (!strictProductToken(productToken.trim()) || productToken.trim() === "*") {
    if (productToken.trim() !== "*") {
      return {
        agent: "",
        groups: [] as Group[],
      };
    }
  }

  const exact = groups.filter((group) =>
    group.matchTokens.some(
      (agent) =>
        agent &&
        agent !== "*" &&
        agent.toLowerCase() === token
    )
  );

  if (exact.length) {
    return {
      agent: productToken.trim(),
      groups: exact,
    };
  }

  const wildcard = groups.filter((group) =>
    group.matchTokens.some((agent) => agent === "*")
  );

  return {
    agent: wildcard.length ? "*" : "",
    groups: wildcard,
  };
}

function googleRelevantGroups(
  groups: Group[],
  userAgent: string
) {
  const ua = userAgent.trim().toLowerCase();
  const candidates: string[] = [];

  groups.forEach((group) => {
    group.agents.forEach((agent) => {
      const token = googleLikeToken(agent).toLowerCase();

      if (
        token &&
        token !== "*" &&
        ua.indexOf(token) !== -1 &&
        candidates.indexOf(token) === -1
      ) {
        candidates.push(token);
      }
    });
  });

  if (candidates.length) {
    candidates.sort((left, right) => right.length - left.length);
    const selected = candidates[0];

    return {
      agent: selected,
      groups: groups.filter((group) =>
        group.agents.some(
          (agent) =>
            googleLikeToken(agent).toLowerCase() === selected
        )
      ),
    };
  }

  const wildcard = groups.filter((group) =>
    group.agents.some((agent) => agent.trim() === "*")
  );

  return {
    agent: wildcard.length ? "*" : "",
    groups: wildcard,
  };
}

function evaluateRobots(
  parsed: ParsedRobots,
  targetInput: string,
  userAgentInput: string,
  agentMode: AgentMode
): TestResult {
  const testedTarget = normalizeTarget(targetInput);
  const userAgent = userAgentInput.trim();

  if (!userAgent) {
    throw new Error(
      agentMode === "product-token"
        ? "Enter the crawler product token, such as Googlebot."
        : "Enter the crawler's HTTP User-Agent identification string."
    );
  }

  const relevant =
    agentMode === "product-token"
      ? strictRelevantGroups(parsed.groups, userAgent)
      : googleRelevantGroups(parsed.groups, userAgent);

  const matchingRules: MatchedRule[] = [];

  relevant.groups.forEach((group) => {
    group.rules.forEach((rule) => {
      const match = matchRule(rule.pattern, testedTarget);

      if (match.matches) {
        matchingRules.push({
          type: rule.type,
          pattern: rule.pattern,
          line: rule.line,
          groupIndex: rule.groupIndex,
          normalizedPattern: match.normalizedPattern,
          specificity: match.specificity,
        });
      }
    });
  });

  matchingRules.sort((left, right) => {
    if (right.specificity !== left.specificity) {
      return right.specificity - left.specificity;
    }

    if (left.type !== right.type) {
      return left.type === "allow" ? -1 : 1;
    }

    return left.line - right.line;
  });

  const isRobotsFile =
    testedTarget ===
    "/robots.txt";
  const matchedRule =
    isRobotsFile || !matchingRules.length
      ? null
      : matchingRules[0];
  const allowed =
    isRobotsFile ||
    !matchedRule ||
    matchedRule.type === "allow";
  const issues = parsed.issues.slice();

  if (hasMalformedPercentEscape(targetInput)) {
    issues.push({
      severity: "warning",
      line: 0,
      message:
        "The tested URL/path contains a percent sign that is not followed by two hexadecimal digits. The text was kept visible, but a malformed URI escape can be normalized or rejected differently by real clients and crawlers.",
    });
  }

  if (hasLoneSurrogate(targetInput)) {
    issues.push({
      severity: "warning",
      line: 0,
      message:
        "The tested URL/path contains an unpaired UTF-16 surrogate. Valid URLs are serialized as Unicode scalar values/UTF-8 bytes, so matching uses U+FFFD replacement bytes for that invalid browser string sequence.",
    });
  }

  if (
    agentMode === "product-token" &&
    !strictProductToken(userAgent)
  ) {
    issues.push({
      severity: "warning",
      line: 0,
      message:
        `"${userAgent}" is not an RFC 9309 product token. Strict mode therefore cannot select a specific group; use the crawler's product token or switch to full User-Agent mode.`,
    });
  }

  if (!relevant.groups.length && parsed.groups.length) {
    issues.push({
      severity: "info",
      line: 0,
      message:
        "No specific matching group and no wildcard group were selected, so no crawl rules apply and the target is allowed by default.",
    });
  }

  if (relevant.groups.length > 1 && relevant.agent !== "*") {
    issues.push({
      severity: "info",
      line: 0,
      message:
        `${relevant.groups.length} groups match "${relevant.agent}". Their Allow/Disallow rules are combined before selecting the most specific matching rule.`,
    });
  }

  if (isRobotsFile) {
    issues.push({
      severity: "info",
      line: 0,
      message:
        "/robots.txt itself is implicitly allowed by RFC 9309 regardless of matching rules.",
    });
  }

  if (matchingRules.length > 1) {
    const best = matchingRules[0];
    const tied = matchingRules.filter(
      (rule) => rule.specificity === best.specificity
    );

    if (
      tied.some((rule) => rule.type === "allow") &&
      tied.some((rule) => rule.type === "disallow")
    ) {
      issues.push({
        severity: "info",
        line: best.line,
        message:
          `The best matching specificity is tied between Allow and Disallow. Allow wins the tie (the least restrictive equivalent rule).`,
      });
    }
  }

  const output = buildOutput({
    allowed,
    testedTarget,
    userAgentInput: userAgent,
    agentMode,
    matchedAgent: relevant.agent,
    matchedGroups: relevant.groups.map((group) => group.index + 1),
    matchedRule,
    matchingRules,
    groups: parsed.groups,
    sitemaps: parsed.sitemaps,
    issues,
    output: "",
  });

  return {
    allowed,
    testedTarget,
    userAgentInput: userAgent,
    agentMode,
    matchedAgent: relevant.agent,
    matchedGroups: relevant.groups.map((group) => group.index + 1),
    matchedRule,
    matchingRules,
    groups: parsed.groups,
    sitemaps: parsed.sitemaps,
    issues,
    output,
  };
}

function buildOutput(result: TestResult) {
  const lines = [
    "robots.txt crawl test",
    `Result: ${result.allowed ? "ALLOWED" : "DISALLOWED"}`,
    `Target: ${result.testedTarget}`,
    `Agent input mode: ${result.agentMode}`,
    `Agent input: ${result.userAgentInput}`,
    `Selected product token: ${result.matchedAgent || "(none)"}`,
    `Selected groups: ${
      result.matchedGroups.length
        ? result.matchedGroups.join(", ")
        : "(none)"
    }`,
    "",
  ];

  if (result.matchedRule) {
    lines.push(
      "Winning rule:",
      `${result.matchedRule.type}: ${result.matchedRule.pattern}`,
      `Source line: ${result.matchedRule.line}`,
      `Specificity: ${result.matchedRule.specificity} normalized pattern octets`,
      ""
    );
  } else {
    lines.push(
      "Winning rule: none",
      "Default: allowed unless /robots.txt implicit allowance applies",
      ""
    );
  }

  if (result.matchingRules.length) {
    lines.push("Matching rules:");

    result.matchingRules.forEach((rule) => {
      lines.push(
        `- ${rule.type}: ${rule.pattern} · line ${rule.line} · specificity ${rule.specificity}`
      );
    });

    lines.push("");
  }

  if (result.sitemaps.length) {
    lines.push(
      "Sitemap records:",
      ...result.sitemaps.map((value) => `- ${value}`),
      ""
    );
  }

  if (result.issues.length) {
    lines.push("Review:");

    result.issues.forEach((issue) => {
      lines.push(
        `- ${issue.severity.toUpperCase()}${
          issue.line ? ` line ${issue.line}` : ""
        }: ${issue.message}`
      );
    });
  }

  return lines.join("\n").trim();
}

export default function ToolClient() {
  const [robotsInput, setRobotsInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [userAgent, setUserAgent] = useState("Googlebot");
  const [agentMode, setAgentMode] =
    useState<AgentMode>("product-token");
  const [result, setResult] =
    useState<TestResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const parsedPreview = useMemo(() => {
    if (!robotsInput.trim()) {
      return null;
    }

    try {
      return parseRobots(robotsInput);
    } catch {
      return null;
    }
  }, [robotsInput]);

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const test = () => {
    if (!robotsInput.trim()) {
      setError("Paste robots.txt content to test.");
      setResult(null);
      return;
    }

    try {
      const parsed = parseRobots(
        robotsInput,
        agentMode === "full-user-agent" ? 512000 : undefined
      );
      setResult(
        evaluateRobots(
          parsed,
          urlInput,
          userAgent,
          agentMode
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to test these robots.txt rules."
      );
    }
  };

  const loadExample = () => {
    setRobotsInput(SAMPLE);
    setUrlInput(
      "https://example.com/private/public-guide.pdf?download=1"
    );
    setUserAgent("Googlebot");
    setAgentMode("product-token");
    clear();
  };

  const reset = () => {
    setRobotsInput("");
    setUrlInput("");
    setUserAgent("Googlebot");
    setAgentMode("product-token");
    clear();
  };

  const copy = async () => {
    if (!result || !result.output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError(
        "The robots.txt test report could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Robots.txt Tester"
      description="Compare a URL path with robots.txt Allow/Disallow rules using RFC 9309 group selection, percent-encoding rules and longest-match precedence, with a separate Google-style full User-Agent mode."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            robots.txt content
          </label>
          <textarea
            value={robotsInput}
            onChange={(event: { target: { value: string } }) => {
              setRobotsInput(event.target.value);
              clear();
            }}
            placeholder={SAMPLE}
            spellCheck={false}
            className="mt-3 min-h-[440px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          {parsedPreview ? (
            <p className="mt-2 text-xs text-gray-500">
              {parsedPreview.groups.length} group
              {parsedPreview.groups.length === 1 ? "" : "s"} ·{" "}
              {parsedPreview.bytes.toLocaleString()} UTF-8 bytes ·{" "}
              {parsedPreview.sitemaps.length} Sitemap record
              {parsedPreview.sitemaps.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
          <YoryantraSelect
            label="Crawler input interpretation"
            value={agentMode}
            onChange={(value: string) => {
              setAgentMode(value as AgentMode);
              clear();
            }}
            options={[
              {
                label: "RFC product token (exact)",
                value: "product-token",
              },
              {
                label: "Full User-Agent (Google-style selection)",
                value: "full-user-agent",
              },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {agentMode === "product-token"
                ? "Crawler product token"
                : "HTTP User-Agent string"}
            </label>
            <input
              value={userAgent}
              onChange={(event: { target: { value: string } }) => {
                setUserAgent(event.target.value);
                clear();
              }}
              placeholder={
                agentMode === "product-token"
                  ? "Googlebot"
                  : "Mozilla/5.0 (compatible; Googlebot/2.1; ...)"
              }
              spellCheck={false}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL or path to test
            </label>
            <input
              value={urlInput}
              onChange={(event: { target: { value: string } }) => {
                setUrlInput(event.target.value);
                clear();
              }}
              placeholder="/private/report.pdf?download=1"
              spellCheck={false}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Matching uses path + query. URL fragments are ignored because
              they are not sent in HTTP requests.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={test} className="yoryantra-btn">
          Test Crawl Access
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
          onClick={reset}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div
            className={`rounded-2xl border p-6 ${
              result.allowed
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Crawl result
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {result.allowed ? "Allowed" : "Disallowed"}
            </div>
            <p className="mt-2 break-all text-sm text-gray-700">
              {result.testedTarget}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Selected token"
              value={result.matchedAgent || "(none)"}
            />
            <Stat
              label="Groups merged"
              value={String(result.matchedGroups.length)}
            />
            <Stat
              label="Rules matched"
              value={String(result.matchingRules.length)}
            />
            <Stat
              label="Winning specificity"
              value={
                result.matchedRule
                  ? String(result.matchedRule.specificity)
                  : "—"
              }
            />
          </div>

          {result.matchedRule ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Winning rule
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Info
                  label="Directive"
                  value={result.matchedRule.type}
                />
                <Info
                  label="Pattern"
                  value={result.matchedRule.pattern}
                />
                <Info
                  label="Source line"
                  value={String(result.matchedRule.line)}
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                Normalized pattern:{" "}
                <code>{result.matchedRule.normalizedPattern}</code>. Specificity
                is measured in normalized pattern octets; percent-encoded octets
                count as one octet, and a useless trailing wildcard is
                canonicalized away.
              </p>
            </div>
          ) : null}

          {result.matchingRules.length ? (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Rule</th>
                    <th className="px-4 py-3 font-semibold">Line</th>
                    <th className="px-4 py-3 font-semibold">Specificity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {result.matchingRules.map((rule, index) => (
                    <tr key={`${rule.line}-${rule.type}-${index}`}>
                      <td className="px-4 py-3 font-mono text-xs">
                        {rule.type}: {rule.pattern}
                      </td>
                      <td className="px-4 py-3">{rule.line}</td>
                      <td className="px-4 py-3">{rule.specificity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {result.issues.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-gray-900">
                robots.txt review
              </h3>
              <div className="mt-4 space-y-3">
                {result.issues.map((issue, index) => (
                  <div
                    key={`${issue.line}-${issue.message}-${index}`}
                    className="rounded-xl border border-amber-200 bg-white/60 p-4 text-sm leading-relaxed text-gray-700"
                  >
                    <strong>
                      {issue.severity.toUpperCase()}
                      {issue.line ? ` · line ${issue.line}` : ""}
                    </strong>
                    <p className="mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={copy}
              className="yoryantra-btn-outline whitespace-nowrap"
            >
              {copied ? "Copied" : "Copy Test Report"}
            </button>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Selected crawler group, matching Allow/Disallow rules, winning
          specificity and crawl decision will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The pasted robots.txt text and URL/path are evaluated in the browser.
        No live robots.txt request is made and no crawler identity is sent to a
        website. Site-wide analytics or advertising scripts, if enabled, are
        separate from the rule evaluation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The First Question Is “Which Group Applies?”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9309 describes crawlers using a product token such as{" "}
            <code>ExampleBot</code>. Matching that token is case-insensitive,
            and repeated groups with the same matching token are combined. A{" "}
            <code>User-agent: *</code> group is only the fallback when no
            specific group matches.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google also documents how it selects the most specific product token
            from its crawler&apos;s complete HTTP User-Agent identification
            string. The two input modes make that distinction explicit instead
            of silently treating a full UA string as a product token.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Multiple Matching Groups Are Merged; the Wildcard Group Is Not Added on Top
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Two separate <code>User-agent: Googlebot</code> groups contribute
            rules to the same effective group. But once that specific group
            exists, <code>User-agent: *</code> is not combined with it.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            This matters when a global Disallow appears stricter than the
            crawler-specific group. Merging the wildcard rules on top of a
            specific group can falsely block a URL that the crawler would
            actually allow.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Longest Matching Rule Wins—and Equivalent Allow Is Preferred
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A crawler evaluates all matching Allow and Disallow patterns in the
            selected group, then uses the most specific match. RFC 9309 defines
            specificity in octets. If equivalent Allow and Disallow rules tie,
            Allow should win.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Percent-encoded bytes therefore cannot be compared reliably by
            simply counting JavaScript characters. Unreserved escapes are
            canonicalized before matching, while a remaining <code>%HH</code>
            triplet represents one encoded byte in the normalized path.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            * and $ Are Pattern Operators, Not Regular Expressions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Robots path syntax has only a small wildcard vocabulary:{" "}
            <code>*</code> matches zero or more characters and a final{" "}
            <code>$</code> anchors the end. Google documents trailing{" "}
            <code>*</code> as redundant, so <code>/fish*</code> behaves like{" "}
            <code>/fish</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Characters such as <code>.</code>, <code>+</code>, parentheses and
            square brackets are literal URL characters here, not regex syntax.
            RFC 9309 contains a small inconsistency here: its ABNF starts a
            path-pattern with <code>/</code>, while its own example uses{" "}
            <code>*.gif$</code>.{" "}
            <a
              href="https://www.rfc-editor.org/errata/eid7995"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Reported erratum 7995
            </a>{" "}
            proposes allowing a leading <code>*</code>. That spelling is
            accepted for interoperability, but <code>/*.gif$</code> is clearer
            for Google-oriented files.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Query Strings Can Change Which Rule Wins
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Robots matching uses the path representation that can include the
            query component. An end-anchored rule such as{" "}
            <code>/*.pdf$</code> matches a URL ending in <code>.pdf</code>, but
            not necessarily the same path followed by{" "}
            <code>?download=1</code>.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            robots.txt Is Public Crawl Guidance, Not Access Control
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Disallow tells compliant crawlers not to fetch a path. It does not
            stop a person, browser or non-compliant bot from requesting it, and
            publishing a sensitive pathname in robots.txt can make that pathname
            easier to discover.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Use authentication/authorization for private content. Use page or
            response indexing controls when the actual problem is indexing
            rather than crawling.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Pasted Text Cannot Tell You How /robots.txt Was Served
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9309 expects the file at lowercase top-level{" "}
            <code>/robots.txt</code>, served as UTF-8 text. Fetch status also
            matters: unavailable 4xx behavior differs from unreachable 5xx/network
            behavior, redirects can be followed, and crawlers can cache the
            result.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Pasted content also cannot prove the deployment path, HTTP status,
            Content-Type, cache state or the original raw byte encoding before
            the browser produced Unicode text. Google documents a 500 KiB
            parsing limit; Google-style mode applies that limit to the UTF-8
            bytes of the pasted text, while generic RFC product-token mode keeps
            the full text and warns that another crawler may stop earlier.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="RFC 9309 — Robots Exclusion Protocol"
            href="https://www.rfc-editor.org/rfc/rfc9309.html"
            text="Defines product tokens, group merging, longest-match behavior, encoding rules, /robots.txt access and the 500 KiB minimum parsing-support limit."
          />
          <ReferenceCard
            title="Google robots.txt interpretation"
            href="https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec"
            text="Documents Google's crawler-token selection, wildcard examples, trailing wildcard behavior and rule precedence."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Check the Rest of the Crawl Setup
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/robots-txt-tester" />
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
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-all font-mono text-xs leading-relaxed text-gray-800">
        {value}
      </div>
    </div>
  );
}

function ReferenceCard({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--green)] underline underline-offset-4"
      >
        {title}
      </a>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}
