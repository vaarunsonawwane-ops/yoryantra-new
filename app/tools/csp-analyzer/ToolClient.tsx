"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CSPDirective = {
  name: string;
  values: string[];
  position: number;
};

type CSPIssue = {
  level: "Warning" | "Note";
  message: string;
};

type ParsedPolicy = {
  directives: CSPDirective[];
  delivery: "enforce" | "report-only" | "value-only";
};

const sampleCSP = `Content-Security-Policy: default-src 'self';
script-src 'self' https://cdn.example.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://api.example.com;
frame-ancestors 'none';
base-uri 'self';
object-src 'none';`;

const knownDirectives = new Set([
  "base-uri",
  "block-all-mixed-content",
  "child-src",
  "connect-src",
  "default-src",
  "font-src",
  "form-action",
  "frame-ancestors",
  "frame-src",
  "img-src",
  "manifest-src",
  "media-src",
  "object-src",
  "report-to",
  "report-uri",
  "require-trusted-types-for",
  "sandbox",
  "script-src",
  "script-src-attr",
  "script-src-elem",
  "style-src",
  "style-src-attr",
  "style-src-elem",
  "trusted-types",
  "upgrade-insecure-requests",
  "webrtc",
  "worker-src",
]);

const deprecatedDirectives = new Set([
  "block-all-mixed-content",
  "plugin-types",
  "referrer",
  "report-uri",
  "require-sri-for",
]);

const sourceListDirectives = new Set([
  "base-uri",
  "child-src",
  "connect-src",
  "default-src",
  "font-src",
  "form-action",
  "frame-ancestors",
  "frame-src",
  "img-src",
  "manifest-src",
  "media-src",
  "object-src",
  "script-src",
  "script-src-attr",
  "script-src-elem",
  "style-src",
  "style-src-attr",
  "style-src-elem",
  "worker-src",
]);

const scriptLikeDirectives = new Set([
  "default-src",
  "script-src",
  "script-src-attr",
  "script-src-elem",
]);

const styleLikeDirectives = new Set([
  "default-src",
  "style-src",
  "style-src-attr",
  "style-src-elem",
]);

const valuelessDirectives = new Set([
  "block-all-mixed-content",
  "upgrade-insecure-requests",
]);

const keywordWithoutQuotes = new Set([
  "none",
  "self",
  "unsafe-eval",
  "unsafe-hashes",
  "unsafe-inline",
  "strict-dynamic",
  "report-sample",
  "wasm-unsafe-eval",
  "trusted-types-eval",
  "unsafe-allow-redirects",
  "unsafe-webtransport-hashes",
]);

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const analyzeCSP = () => {
    if (!input.trim()) {
      setError("Paste a Content-Security-Policy value or one CSP response header.");
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const parsed = parseCSP(input);
      const issues = analyzeDirectives(parsed);
      setOutput(formatReport(parsed, issues));
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to parse this Content Security Policy."
      );
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The analysis could not be copied. Select and copy it manually.");
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(sampleCSP);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="CSP Analyzer"
      description="Parse one CSP policy and surface fallback behavior, ignored duplicates, risky sources, and delivery-specific limits."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          CSP header or policy value
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleCSP}
          className="w-full min-h-[270px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste one enforced or report-only header, or only the policy value.
          Multiple CSP headers should be checked separately because browsers
          enforce each policy independently.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeCSP} className="yoryantra-btn whitespace-nowrap">
          Analyze CSP
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Policy text report</h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Parsed directives and static findings will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        A syntactically tidy CSP can still break a page or leave an application
        exposed. Test the real site, inspect browser violations, and treat
        report-only results as observation rather than enforcement.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What policy text can tell you before a browser runs it
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            CSP is parsed as semicolon-separated directives. When the same
            directive appears more than once in one policy, the first instance
            wins and later duplicates are ignored. That makes duplicated rules
            especially easy to misread during configuration reviews.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            An empty source-list directive is also meaningful. For example,
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">script-src</code>
            with no value behaves like an empty source list and blocks matching
            loads; it is not the same thing as a missing directive.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Fallbacks are where otherwise reasonable policies get misread
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">default-src</code>
            is a fallback for fetch directives, but not for
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">frame-ancestors</code>,
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">base-uri</code>,
            or
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">form-action</code>.
            Script and style directives also have their own more specific
            fallback chains. The report calls out missing controls without
            pretending every site needs the same policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Three combinations deserve more than a quick glance
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-600 leading-relaxed">
            <li>
              <strong className="text-gray-900">&apos;none&apos; plus another source:</strong>{" "}
              &apos;none&apos; has no effect once another source expression is present.
            </li>
            <li>
              <strong className="text-gray-900">Nonce or hash plus &apos;unsafe-inline&apos;:</strong>{" "}
              supporting browsers ignore &apos;unsafe-inline&apos; for the relevant
              script or style source list once a valid nonce or hash is present.
            </li>
            <li>
              <strong className="text-gray-900">&apos;strict-dynamic&apos;:</strong>{" "}
              it only becomes meaningful with a nonce or hash, and supporting
              browsers then ignore several host-style allowlist expressions for
              script loading.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Delivery method changes what a policy can do
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Report-only CSP is delivered through the
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">
              Content-Security-Policy-Report-Only
            </code>
            response header. It cannot be delivered through a CSP meta element.
            The
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">frame-ancestors</code>,
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">report-to</code>,
            and
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">report-uri</code>
            directives are also not supported in meta-delivered policies.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Static checks stop before application behavior starts
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This page does not load your application, discover required
            third-party origins, validate nonce generation, test Trusted Types,
            or prove that a policy mitigates a particular injection path. A
            browser console, violation reporting, integration tests, and an
            application-aware security review still matter.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Parsing happens in this browser. The policy text entered here is not
            sent to a Yoryantra server by the analyzer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Keep the specification beside the report
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The normative parsing and fallback rules are defined in{" "}
            <a
              href="https://www.w3.org/TR/CSP3/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Content Security Policy Level 3
            </a>
            . For browser-oriented examples and current compatibility notes, the{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              MDN CSP guide
            </a>{" "}
            is a useful companion.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/csp-analyzer" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function extractPolicySource(source: string): {
  value: string;
  delivery: ParsedPolicy["delivery"];
} {
  const normalized = source.replace(/\r\n?/g, "\n").trim();
  const lines = normalized.split("\n");
  const headerIndexes = lines
    .map((line, index) =>
      /^content-security-policy(?:-report-only)?:/i.test(line.trim())
        ? index
        : -1
    )
    .filter((index) => index !== -1);

  if (headerIndexes.length > 1) {
    throw new Error(
      "Multiple CSP header fields were found. Analyze one policy at a time because each policy is enforced independently."
    );
  }

  if (headerIndexes.length === 1) {
    const headerIndex = headerIndexes[0];
    const match = lines[headerIndex]
      .trim()
      .match(/^(content-security-policy(?:-report-only)?):\s*(.*)$/i);

    if (!match) {
      throw new Error("The CSP header could not be read.");
    }

    const policyLines = [match[2].trim()];

    for (let index = headerIndex + 1; index < lines.length; index += 1) {
      const line = lines[index].trim();

      if (!line) {
        continue;
      }

      if (/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+:\s/.test(line)) {
        break;
      }

      policyLines.push(line);
    }

    return {
      value: policyLines.join(" ").trim(),
      delivery: /report-only/i.test(match[1]) ? "report-only" : "enforce",
    };
  }

  return {
    value: normalized.replace(/\n/g, " ").trim(),
    delivery: "value-only",
  };
}
function parseCSP(source: string): ParsedPolicy {
  const extracted = extractPolicySource(source);

  if (!extracted.value) {
    throw new Error("The CSP policy value is empty.");
  }

  const parts = extracted.value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    throw new Error("No CSP directives were found.");
  }

  const directives = parts.map((part, index) => {
    const [rawName, ...values] = part.split(/\s+/);
    const name = rawName.toLowerCase();

    if (!/^[a-z0-9-]+$/.test(name)) {
      throw new Error(`Directive ${index + 1} has an invalid name: ${rawName}`);
    }

    return {
      name,
      values,
      position: index + 1,
    };
  });

  return {
    directives,
    delivery: extracted.delivery,
  };
}

function hasNonceOrHash(values: string[]) {
  return values.some(
    (value) =>
      /^'nonce-[A-Za-z0-9+/_-]+={0,2}'$/.test(value) ||
      /^'sha(?:256|384|512)-[A-Za-z0-9+/_-]+={0,2}'$/.test(value)
  );
}

function analyzeDirectives(parsed: ParsedPolicy) {
  const { directives, delivery } = parsed;
  const issues: CSPIssue[] = [];
  const firstDirective = new Map<string, CSPDirective>();

  directives.forEach((directive) => {
    if (firstDirective.has(directive.name)) {
      issues.push({
        level: "Warning",
        message: `${directive.name} appears again at directive ${directive.position}. Browsers ignore later duplicates in the same policy.`,
      });
      return;
    }

    firstDirective.set(directive.name, directive);
  });

  directives.forEach((directive) => {
    const { name, values } = directive;

    if (!knownDirectives.has(name) && !deprecatedDirectives.has(name)) {
      issues.push({
        level: "Note",
        message: `${name} is not in the CSP Level 3 directive set used by this analyzer. Check whether it is experimental, obsolete, or a typo.`,
      });
    }

    if (
      name === "webrtc" &&
      (values.length !== 1 ||
        (values[0] !== "'allow'" && values[0] !== "'block'"))
    ) {
      issues.push({
        level: "Warning",
        message: "webrtc expects exactly one value: 'allow' or 'block'.",
      });
    }

    if (deprecatedDirectives.has(name)) {
      issues.push({
        level: "Note",
        message:
          name === "block-all-mixed-content"
            ? "block-all-mixed-content is obsolete in current CSP guidance; modern mixed-content handling makes it unnecessary."
            : name === "report-uri"
              ? "report-uri is deprecated. report-to is its replacement, although both are still used during compatibility transitions."
              : `${name} is obsolete or deprecated in current CSP guidance.`,
      });
    }

    if (valuelessDirectives.has(name) && values.length > 0) {
      issues.push({
        level: "Warning",
        message: `${name} is a valueless directive; its extra tokens are not part of the directive syntax.`,
      });
    }

    if (sourceListDirectives.has(name) && values.length === 0) {
      issues.push({
        level: "Note",
        message: `${name} has an empty source list, which behaves like blocking all matching sources rather than like an omitted directive.`,
      });
    }

    if (values.includes("'none'") && values.length > 1) {
      issues.push({
        level: "Warning",
        message: `${name} combines 'none' with other sources. 'none' has no effect when another source expression is present.`,
      });
    }

    values.forEach((value) => {
      if (keywordWithoutQuotes.has(value.toLowerCase())) {
        issues.push({
          level: "Warning",
          message: `${name} contains ${value} without the required single quotes for a CSP keyword.`,
        });
      }

      if (/[;,]/.test(value)) {
        issues.push({
          level: "Warning",
          message: `${name} contains a raw semicolon or comma inside the token ${value}. Those characters are not valid unescaped source-expression characters.`,
        });
      }
    });

    if (values.includes("*")) {
      issues.push({
        level: "Warning",
        message: `${name} contains the wildcard source *. Confirm that such a broad network origin match is intentional.`,
      });
    }

    if (
      values.some((value) => value === "http:" || /^http:\/\//i.test(value))
    ) {
      issues.push({
        level: "Warning",
        message: `${name} explicitly permits HTTP sources. Without an upgrading mechanism, that can reintroduce insecure resource loading on HTTPS pages.`,
      });
    }

    const duplicateValues = values.filter(
      (value, index) => values.indexOf(value) !== index
    );

    if (duplicateValues.length) {
      issues.push({
        level: "Note",
        message: `${name} repeats source values: ${Array.from(
          new Set(duplicateValues)
        ).join(", ")}.`,
      });
    }

    const nonceOrHash = hasNonceOrHash(values);

    if (
      values.includes("'unsafe-inline'") &&
      (scriptLikeDirectives.has(name) || styleLikeDirectives.has(name))
    ) {
      issues.push({
        level: nonceOrHash ? "Note" : "Warning",
        message: nonceOrHash
          ? `${name} contains a nonce or hash alongside 'unsafe-inline'. Supporting modern browsers ignore 'unsafe-inline' for that source list.`
          : `${name} permits 'unsafe-inline'. That broadens which inline code or styles can run.`,
      });
    }

    if (
      values.includes("'unsafe-eval'") &&
      scriptLikeDirectives.has(name)
    ) {
      issues.push({
        level: "Warning",
        message: `${name} permits 'unsafe-eval', allowing string-to-code evaluation APIs that a tighter script policy would block.`,
      });
    }

    if (values.includes("'strict-dynamic'") && scriptLikeDirectives.has(name)) {
      issues.push({
        level: nonceOrHash ? "Note" : "Warning",
        message: nonceOrHash
          ? `${name} uses 'strict-dynamic' with nonce/hash trust. Supporting browsers ignore host sources, schemes, 'self', and 'unsafe-inline' for script loading in that case.`
          : `${name} includes 'strict-dynamic' without a nonce or hash, so the trust chain it is designed for cannot start.`,
      });
    }
  });

  if (!firstDirective.has("default-src")) {
    issues.push({
      level: "Note",
      message:
        "default-src is absent. That can be intentional, but every fetch type without its own directive then needs to be considered separately.",
    });
  }

  if (!firstDirective.has("object-src")) {
    issues.push({
      level: "Note",
      message:
        "object-src is absent. Many sites explicitly use object-src 'none' so plugin-style embeds are not left to fallback behavior.",
    });
  }

  if (!firstDirective.has("base-uri")) {
    issues.push({
      level: "Note",
      message:
        "base-uri is absent. default-src does not cover it, so <base> URL restrictions need a separate decision.",
    });
  }

  if (!firstDirective.has("frame-ancestors")) {
    issues.push({
      level: "Note",
      message:
        "frame-ancestors is absent. default-src does not control who may frame the page.",
    });
  }

  const frameAncestors = firstDirective.get("frame-ancestors");
  if (frameAncestors?.values.includes("*")) {
    issues.push({
      level: "Warning",
      message:
        "frame-ancestors allows any matching ancestor with *. That removes most of the directive's framing restriction.",
    });
  }

  const reportTo = firstDirective.get("report-to");
  if (reportTo) {
    if (reportTo.values.length !== 1) {
      issues.push({
        level: "Warning",
        message:
          "report-to expects one reporting endpoint group name, not a list of URLs.",
      });
    } else if (/^https?:/i.test(reportTo.values[0])) {
      issues.push({
        level: "Warning",
        message:
          "report-to takes a reporting endpoint group name. The group-to-URL mapping belongs in a separate Reporting-Endpoints response header.",
      });
    }
  }

  if (
    delivery === "report-only" &&
    !firstDirective.has("report-to") &&
    !firstDirective.has("report-uri")
  ) {
    issues.push({
      level: "Warning",
      message:
        "This is a report-only header without report-to or report-uri, so it can surface console violations but has no CSP reporting endpoint configured.",
    });
  }

  return issues;
}

function formatReport(parsed: ParsedPolicy, issues: CSPIssue[]) {
  const warningCount = issues.filter((issue) => issue.level === "Warning").length;
  const noteCount = issues.filter((issue) => issue.level === "Note").length;
  const deliveryLabel =
    parsed.delivery === "enforce"
      ? "Enforced response header"
      : parsed.delivery === "report-only"
        ? "Report-only response header"
        : "Policy value only — delivery method not supplied";

  const lines = [
    "Content Security Policy text review",
    "",
    `Delivery: ${deliveryLabel}`,
    `Directive tokens: ${parsed.directives.length}`,
    `Warnings: ${warningCount}`,
    `Notes: ${noteCount}`,
    "",
    "Directives in source order:",
  ];

  parsed.directives.forEach((directive) => {
    lines.push(
      `${directive.position}. ${directive.name}${
        directive.values.length ? ` ${directive.values.join(" ")}` : ""
      }`
    );
  });

  lines.push("", "Findings:");

  if (issues.length === 0) {
    lines.push(
      "No obvious static concerns were found. This does not prove that the policy is secure or compatible with the application."
    );
  } else {
    issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
    });
  }

  return lines.join("\n");
}
