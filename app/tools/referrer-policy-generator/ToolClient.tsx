"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type PolicyValue =
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";

type Preset = "balanced" | "privacy" | "analytics" | "legacy" | "custom";
type OutputMode = "header" | "nginx" | "apache" | "html" | "json" | "markdown";
type Scenario = "general" | "publicSite" | "app" | "marketing" | "sensitive";

type PolicyInfo = {
  value: PolicyValue;
  label: string;
  privacy: "high" | "medium" | "low";
  compatibility: "high" | "medium";
  summary: string;
};

type Finding = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  policy: PolicyValue;
  output: string;
  headerValue: string;
  findings: Finding[];
  examples: string[];
  privacyScore: number;
  compatibilityScore: number;
};

const policies: PolicyInfo[] = [
  {
    value: "no-referrer",
    label: "no-referrer",
    privacy: "high",
    compatibility: "medium",
    summary: "Never sends the Referer header.",
  },
  {
    value: "no-referrer-when-downgrade",
    label: "no-referrer-when-downgrade",
    privacy: "low",
    compatibility: "high",
    summary: "Sends full URL except when moving from HTTPS to HTTP.",
  },
  {
    value: "origin",
    label: "origin",
    privacy: "medium",
    compatibility: "high",
    summary: "Sends only the origin, not the full path.",
  },
  {
    value: "origin-when-cross-origin",
    label: "origin-when-cross-origin",
    privacy: "medium",
    compatibility: "high",
    summary: "Sends full URL on same-origin requests and origin only cross-origin.",
  },
  {
    value: "same-origin",
    label: "same-origin",
    privacy: "high",
    compatibility: "medium",
    summary: "Sends referrer only for same-origin requests.",
  },
  {
    value: "strict-origin",
    label: "strict-origin",
    privacy: "medium",
    compatibility: "high",
    summary: "Sends only origin and avoids HTTPS-to-HTTP downgrades.",
  },
  {
    value: "strict-origin-when-cross-origin",
    label: "strict-origin-when-cross-origin",
    privacy: "medium",
    compatibility: "high",
    summary: "A practical modern default: full same-origin URL, origin cross-origin, no downgrade referrer.",
  },
  {
    value: "unsafe-url",
    label: "unsafe-url",
    privacy: "low",
    compatibility: "high",
    summary: "Sends full URL to all requests. Usually not recommended.",
  },
];

const presetPolicies: Record<Preset, PolicyValue> = {
  balanced: "strict-origin-when-cross-origin",
  privacy: "no-referrer",
  analytics: "origin-when-cross-origin",
  legacy: "no-referrer-when-downgrade",
  custom: "strict-origin-when-cross-origin",
};

export default function ToolClient() {
  const [preset, setPreset] = useState<Preset>("balanced");
  const [policy, setPolicy] = useState<PolicyValue>("strict-origin-when-cross-origin");
  const [scenario, setScenario] = useState<Scenario>("general");
  const [outputMode, setOutputMode] = useState<OutputMode>("header");
  const [includeMetaTag, setIncludeMetaTag] = useState(false);
  const [includeExplanation, setIncludeExplanation] = useState(true);
  const [warnAboutUnsafeUrl, setWarnAboutUnsafeUrl] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedInfo = useMemo(
    () => policies.find((item) => item.value === policy) || policies[6],
    [policy]
  );

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setCopied(false);
  };

  const generatePolicy = () => {
    const next = buildResult({
      policy,
      scenario,
      outputMode,
      includeMetaTag,
      includeExplanation,
      warnAboutUnsafeUrl,
    });

    setResult(next);
    setOutput(next.output);
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setPreset("balanced");
    setPolicy("strict-origin-when-cross-origin");
    setScenario("publicSite");
    setOutputMode("header");
    setIncludeMetaTag(false);
    setIncludeExplanation(true);
    setWarnAboutUnsafeUrl(true);
    clearResult();
  };

  const resetAll = () => {
    setPreset("balanced");
    setPolicy("strict-origin-when-cross-origin");
    setScenario("general");
    setOutputMode("header");
    setIncludeMetaTag(false);
    setIncludeExplanation(true);
    setWarnAboutUnsafeUrl(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Referrer Policy Generator"
      description="Generate Referrer-Policy headers for websites. Compare strict-origin-when-cross-origin, no-referrer, same-origin, origin, and other browser referrer privacy policies."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Policy Settings
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Preset"
            value={preset}
            onChange={(value) => {
              const nextPreset = value as Preset;
              setPreset(nextPreset);

              if (nextPreset !== "custom") {
                setPolicy(presetPolicies[nextPreset]);
              }

              clearResult();
            }}
            options={[
              { label: "Balanced - modern default", value: "balanced" },
              { label: "Privacy focused", value: "privacy" },
              { label: "Analytics friendly", value: "analytics" },
              { label: "Legacy behavior", value: "legacy" },
              { label: "Custom", value: "custom" },
            ]}
          />

          <YoryantraSelect
            label="Policy"
            value={policy}
            onChange={(value) => {
              setPolicy(value as PolicyValue);
              setPreset("custom");
              clearResult();
            }}
            options={policies.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
          />

          <YoryantraSelect
            label="Site Type"
            value={scenario}
            onChange={(value) => {
              setScenario(value as Scenario);
              clearResult();
            }}
            options={[
              { label: "General website", value: "general" },
              { label: "Public content site", value: "publicSite" },
              { label: "Logged-in web app", value: "app" },
              { label: "Marketing / analytics site", value: "marketing" },
              { label: "Sensitive pages", value: "sensitive" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "HTTP header", value: "header" },
              { label: "Nginx config", value: "nginx" },
              { label: "Apache config", value: "apache" },
              { label: "HTML meta tag", value: "html" },
              { label: "JSON", value: "json" },
              { label: "Markdown notes", value: "markdown" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow
              checked={includeMetaTag}
              label="Also include HTML meta tag in text output"
              onChange={(checked) => {
                setIncludeMetaTag(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={includeExplanation}
              label="Include explanation and behavior notes"
              onChange={(checked) => {
                setIncludeExplanation(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={warnAboutUnsafeUrl}
              label="Warn about unsafe-url and weak privacy policies"
              onChange={(checked) => {
                setWarnAboutUnsafeUrl(checked);
                clearResult();
              }}
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">
            Selected policy: {selectedInfo.label}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {selectedInfo.summary}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1 text-gray-700 border border-gray-200">
              Privacy: {selectedInfo.privacy}
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-gray-700 border border-gray-200">
              Compatibility: {selectedInfo.compatibility}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generatePolicy} className="yoryantra-btn">
          Generate Referrer Policy
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Policy" value={result.policy} />
          <SummaryCard label="Privacy Score" value={`${result.privacyScore}/100`} />
          <SummaryCard label="Compatibility" value={`${result.compatibilityScore}/100`} />
          <SummaryCard label="Findings" value={result.findings.length.toLocaleString()} />
        </div>
      )}

      {result && result.examples.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Referrer Behavior Examples
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            These examples show the kind of referrer information a browser may send with this policy.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Scenario</th>
                  <th className="px-4 py-3 font-semibold">Referrer Sent</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.examples.map((example, index) => {
                  const [scenarioText, valueText] = example.split("=>");

                  return (
                    <tr key={`${example}-${index}`}>
                      <td className="px-4 py-3 text-gray-700">
                        {scenarioText.trim()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-800">
                        {valueText.trim()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.findings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Referrer policy findings
          </h3>

          <div className="mt-3 space-y-3">
            {result.findings.map((finding, index) => (
              <div key={`${finding.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {finding.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {finding.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            Deployment guidance
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Generated Referrer-Policy output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool generates configuration text only. Test your policy on staging before applying it to production pages.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Controlling Referrer Data With a Referrer-Policy Header
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The Referrer-Policy header controls how much URL information a browser sends in the Referer header when a user navigates, loads images, calls scripts, or opens third-party links.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A good policy can reduce accidental leakage of full page paths, query strings, user IDs, campaign URLs, and sensitive page context while still allowing enough referrer information for basic analytics.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Referrer Policy Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose a preset or select a Referrer-Policy value manually.</li>
            <li>Select the site type so the tool can add practical warnings.</li>
            <li>Choose HTTP header, Nginx, Apache, HTML meta, JSON, or Markdown output.</li>
            <li>Copy the generated policy and test it on staging.</li>
            <li>Check analytics, third-party integrations, and login flows before full rollout.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Referrer-Policy Choices
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>strict-origin-when-cross-origin</strong> is a practical modern default for many websites.</li>
            <li><strong>no-referrer</strong> is privacy-focused and sends no referrer information.</li>
            <li><strong>same-origin</strong> sends referrer data only within the same origin.</li>
            <li><strong>origin</strong> sends only scheme, host, and port.</li>
            <li><strong>unsafe-url</strong> sends full URLs and is usually not recommended.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Referrer-Policy Header
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Referrer-Policy: strict-origin-when-cross-origin`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Privacy and Analytics Tradeoffs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Stronger referrer privacy can reduce the detail available to analytics and third-party tools. For example, no-referrer protects the most information, but it also removes referrer data that some reporting workflows expect.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            For many public sites, strict-origin-when-cross-origin is a balanced choice because it avoids sending full cross-origin paths while still allowing origin-level referrer information.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does Referrer-Policy do?">
              It controls how much referrer information the browser sends when loading or navigating to another resource.
            </Faq>

            <Faq title="Which Referrer-Policy should I use?">
              strict-origin-when-cross-origin is a good default for many websites. Sensitive pages may prefer no-referrer or same-origin.
            </Faq>

            <Faq title="Is unsafe-url safe to use?">
              Usually no. unsafe-url can send full URLs, including paths and query strings, to other origins.
            </Faq>

            <Faq title="Can I use a meta tag instead of a header?">
              Yes, but an HTTP header is usually cleaner and applies earlier. Meta tags can be useful when header control is limited.
            </Faq>

            <Faq title="Will this break analytics?">
              It can change what referrer data analytics tools receive. Test before deploying a stricter policy everywhere.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/security-header-generator" className="yoryantra-btn-outline">
              Security Header Generator
            </Link>

            <Link href="/tools/security-headers-scanner" className="yoryantra-btn-outline">
              Security Headers Scanner
            </Link>

            <Link href="/tools/permissions-policy-header-generator" className="yoryantra-btn-outline">
              Permissions Policy Header Generator
            </Link>

            <Link href="/tools/hsts-header-generator" className="yoryantra-btn-outline">
              HSTS Header Generator
            </Link>

            <Link href="/tools/csp-policy-builder" className="yoryantra-btn-outline">
              CSP Policy Builder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-gray-600 leading-relaxed">
        {children}
      </p>
    </div>
  );
}

function buildResult(options: {
  policy: PolicyValue;
  scenario: Scenario;
  outputMode: OutputMode;
  includeMetaTag: boolean;
  includeExplanation: boolean;
  warnAboutUnsafeUrl: boolean;
}): Result {
  const info = policies.find((item) => item.value === options.policy) || policies[6];
  const headerValue = `Referrer-Policy: ${options.policy}`;
  const examples = buildExamples(options.policy);
  const findings = buildFindings(options.policy, options.scenario, options.warnAboutUnsafeUrl);
  const privacyScore = getPrivacyScore(info.privacy);
  const compatibilityScore = getCompatibilityScore(info.compatibility);
  const output = formatOutput(
    {
      policy: options.policy,
      headerValue,
      findings,
      examples,
      privacyScore,
      compatibilityScore,
    },
    options
  );

  return {
    policy: options.policy,
    output,
    headerValue,
    findings,
    examples,
    privacyScore,
    compatibilityScore,
  };
}

function buildExamples(policy: PolicyValue) {
  const full = "https://example.com/account/settings?tab=billing";
  const origin = "https://example.com/";
  const none = "(no referrer sent)";

  if (policy === "no-referrer") {
    return [
      `Same-origin page => ${none}`,
      `Cross-origin HTTPS link => ${none}`,
      `HTTPS to HTTP downgrade => ${none}`,
    ];
  }

  if (policy === "same-origin") {
    return [
      `Same-origin page => ${full}`,
      `Cross-origin HTTPS link => ${none}`,
      `HTTPS to HTTP downgrade => ${none}`,
    ];
  }

  if (policy === "origin") {
    return [
      `Same-origin page => ${origin}`,
      `Cross-origin HTTPS link => ${origin}`,
      `HTTPS to HTTP downgrade => ${origin}`,
    ];
  }

  if (policy === "strict-origin") {
    return [
      `Same-origin page => ${origin}`,
      `Cross-origin HTTPS link => ${origin}`,
      `HTTPS to HTTP downgrade => ${none}`,
    ];
  }

  if (policy === "origin-when-cross-origin") {
    return [
      `Same-origin page => ${full}`,
      `Cross-origin HTTPS link => ${origin}`,
      `HTTPS to HTTP downgrade => ${origin}`,
    ];
  }

  if (policy === "strict-origin-when-cross-origin") {
    return [
      `Same-origin page => ${full}`,
      `Cross-origin HTTPS link => ${origin}`,
      `HTTPS to HTTP downgrade => ${none}`,
    ];
  }

  if (policy === "unsafe-url") {
    return [
      `Same-origin page => ${full}`,
      `Cross-origin HTTPS link => ${full}`,
      `HTTPS to HTTP downgrade => ${full}`,
    ];
  }

  return [
    `Same-origin page => ${full}`,
    `Cross-origin HTTPS link => ${full}`,
    `HTTPS to HTTP downgrade => ${none}`,
  ];
}

function buildFindings(policy: PolicyValue, scenario: Scenario, warnAboutUnsafeUrl: boolean) {
  const findings: Finding[] = [];

  if (policy === "unsafe-url" && warnAboutUnsafeUrl) {
    findings.push({
      severity: "high",
      title: "unsafe-url can leak full URLs",
      message: "unsafe-url may send full paths and query strings to other origins. Avoid it unless you have a very specific reason.",
    });
  }

  if (policy === "no-referrer-when-downgrade") {
    findings.push({
      severity: "warning",
      title: "Weak cross-origin privacy",
      message: "This policy can still send full URL paths to HTTPS third-party destinations.",
    });
  }

  if (scenario === "sensitive" && !["no-referrer", "same-origin"].includes(policy)) {
    findings.push({
      severity: "warning",
      title: "Consider stricter policy for sensitive pages",
      message: "Sensitive pages often benefit from no-referrer or same-origin to reduce information leakage.",
    });
  }

  if (scenario === "marketing" && policy === "no-referrer") {
    findings.push({
      severity: "info",
      title: "Analytics may receive less referrer data",
      message: "no-referrer improves privacy, but analytics and attribution tools may lose referrer context.",
    });
  }

  if (policy === "strict-origin-when-cross-origin") {
    findings.push({
      severity: "info",
      title: "Balanced modern default",
      message: "This policy is a practical choice for many websites because it avoids full cross-origin URL leakage.",
    });
  }

  if (findings.length === 0) {
    findings.push({
      severity: "info",
      title: "Policy generated",
      message: "Review behavior examples and test the policy with your analytics and third-party integrations.",
    });
  }

  return findings;
}

function formatOutput(
  result: {
    policy: PolicyValue;
    headerValue: string;
    findings: Finding[];
    examples: string[];
    privacyScore: number;
    compatibilityScore: number;
  },
  options: {
    outputMode: OutputMode;
    includeMetaTag: boolean;
    includeExplanation: boolean;
  }
) {
  const meta = `<meta name="referrer" content="${result.policy}" />`;

  if (options.outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.outputMode === "nginx") {
    return joinOptional([
      `add_header Referrer-Policy "${result.policy}" always;`,
      options.includeMetaTag ? meta : "",
      options.includeExplanation ? explanationText(result) : "",
    ]);
  }

  if (options.outputMode === "apache") {
    return joinOptional([
      `Header always set Referrer-Policy "${result.policy}"`,
      options.includeMetaTag ? meta : "",
      options.includeExplanation ? explanationText(result) : "",
    ]);
  }

  if (options.outputMode === "html") {
    return joinOptional([
      meta,
      options.includeExplanation ? explanationText(result) : "",
    ]);
  }

  if (options.outputMode === "markdown") {
    return [
      "# Referrer Policy",
      "",
      `Policy: \`${result.policy}\``,
      `Header: \`${result.headerValue}\``,
      `Privacy score: ${result.privacyScore}/100`,
      `Compatibility score: ${result.compatibilityScore}/100`,
      "",
      "## Behavior examples",
      ...result.examples.map((example) => `- ${example}`),
      "",
      "## Findings",
      ...result.findings.map((finding) => `- **${finding.title}:** ${finding.message}`),
    ].join("\n");
  }

  return joinOptional([
    result.headerValue,
    options.includeMetaTag ? meta : "",
    options.includeExplanation ? explanationText(result) : "",
  ]);
}

function explanationText(result: {
  findings: Finding[];
  examples: string[];
  privacyScore: number;
  compatibilityScore: number;
}) {
  return [
    "",
    "Notes:",
    `Privacy score: ${result.privacyScore}/100`,
    `Compatibility score: ${result.compatibilityScore}/100`,
    "",
    "Behavior examples:",
    ...result.examples.map((example) => `- ${example}`),
    "",
    "Findings:",
    ...result.findings.map((finding) => `- ${finding.title}: ${finding.message}`),
  ].join("\n");
}

function joinOptional(parts: string[]) {
  return parts.filter(Boolean).join("\n");
}

function getPrivacyScore(value: PolicyInfo["privacy"]) {
  if (value === "high") return 95;
  if (value === "medium") return 75;
  return 40;
}

function getCompatibilityScore(value: PolicyInfo["compatibility"]) {
  if (value === "high") return 95;
  return 80;
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.policy === "strict-origin-when-cross-origin") {
    notes.push({
      title: "Good general-purpose choice",
      message: "This policy is commonly suitable for public websites and many apps because it balances privacy with referrer usefulness.",
    });
  }

  if (result.policy === "no-referrer") {
    notes.push({
      title: "Strongest privacy option",
      message: "No referrer data is sent, but analytics and attribution workflows may see less information.",
    });
  }

  notes.push({
    title: "Test before rollout",
    message: "Referrer changes can affect analytics, third-party dashboards, and fraud detection workflows. Test before applying broadly.",
  });

  return notes;
}
