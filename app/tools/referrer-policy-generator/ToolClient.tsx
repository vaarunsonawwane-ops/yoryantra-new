"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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

type Preset = "browserDefault" | "noReferrer" | "sameOrigin" | "originOnly" | "custom";
type OutputMode = "header" | "nginx" | "apache" | "html" | "json" | "markdown";
type Scenario = "general" | "publicSite" | "app" | "marketing" | "sensitive";
type Severity = "info" | "warning";

type PolicyInfo = {
  value: PolicyValue;
  summary: string;
};

type Finding = {
  severity: Severity;
  title: string;
  message: string;
};

type BehaviorExample = {
  scenario: string;
  sent: string;
};

type Result = {
  policy: PolicyValue;
  output: string;
  headerValue: string;
  findings: Finding[];
  examples: BehaviorExample[];
};

const policies: PolicyInfo[] = [
  {
    value: "no-referrer",
    summary: "No Referer header is sent.",
  },
  {
    value: "no-referrer-when-downgrade",
    summary: "Full referrer can be sent except from HTTPS to a less secure destination.",
  },
  {
    value: "origin",
    summary: "Only the source origin is sent, including on HTTPS-to-HTTP requests.",
  },
  {
    value: "origin-when-cross-origin",
    summary: "Full same-origin referrer; origin only for cross-origin requests, including downgrades.",
  },
  {
    value: "same-origin",
    summary: "Referrer data stays on same-origin requests and is omitted cross-origin.",
  },
  {
    value: "strict-origin",
    summary: "Only the origin is sent when the destination is not less secure.",
  },
  {
    value: "strict-origin-when-cross-origin",
    summary: "Full same-origin referrer, origin cross-origin at the same security level, nothing on HTTPS-to-HTTP downgrade.",
  },
  {
    value: "unsafe-url",
    summary: "Full referrer is sent for same-origin, cross-origin, and downgrade requests.",
  },
];

const presetPolicies: Record<Preset, PolicyValue> = {
  browserDefault: "strict-origin-when-cross-origin",
  noReferrer: "no-referrer",
  sameOrigin: "same-origin",
  originOnly: "strict-origin",
  custom: "strict-origin-when-cross-origin",
};

export default function ToolClient() {
  const [preset, setPreset] = useState<Preset>("browserDefault");
  const [policy, setPolicy] = useState<PolicyValue>("strict-origin-when-cross-origin");
  const [scenario, setScenario] = useState<Scenario>("general");
  const [outputMode, setOutputMode] = useState<OutputMode>("header");
  const [includeMetaTag, setIncludeMetaTag] = useState(false);
  const [includeExplanation, setIncludeExplanation] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedInfo = useMemo(
    () => policies.find((item) => item.value === policy) || policies[6],
    [policy]
  );

  const warnings = useMemo(
    () => result?.findings.filter((item) => item.severity === "warning") || [],
    [result]
  );
  const infoItems = useMemo(
    () => result?.findings.filter((item) => item.severity === "info") || [],
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generatePolicy = () => {
    const next = buildResult({
      policy,
      scenario,
      outputMode,
      includeMetaTag,
      includeExplanation,
    });

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The generated policy could not be copied. Select and copy it manually.");
    }
  };

  const loadExample = () => {
    setPreset("browserDefault");
    setPolicy("strict-origin-when-cross-origin");
    setScenario("publicSite");
    setOutputMode("header");
    setIncludeMetaTag(false);
    setIncludeExplanation(true);
    clearResult();
  };

  const resetAll = () => {
    setPreset("browserDefault");
    setPolicy("strict-origin-when-cross-origin");
    setScenario("general");
    setOutputMode("header");
    setIncludeMetaTag(false);
    setIncludeExplanation(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Referrer Policy Generator"
      description="Build one Referrer-Policy value and preview same-origin, cross-origin, and downgrade behavior."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose how much referrer information may leave a page
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Starting point"
            value={preset}
            onChange={(value: string) => {
              const nextPreset = value as Preset;
              setPreset(nextPreset);

              if (nextPreset !== "custom") {
                setPolicy(presetPolicies[nextPreset]);
              }

              clearResult();
            }}
            options={[
              { label: "Current browser default", value: "browserDefault" },
              { label: "Send no referrer", value: "noReferrer" },
              { label: "Same-origin only", value: "sameOrigin" },
              { label: "Origin only, with downgrade protection", value: "originOnly" },
              { label: "Choose manually", value: "custom" },
            ]}
          />

          <YoryantraSelect
            label="Policy value"
            value={policy}
            onChange={(value: string) => {
              setPolicy(value as PolicyValue);
              setPreset("custom");
              clearResult();
            }}
            options={policies.map((item) => ({
              label: item.value,
              value: item.value,
            }))}
          />

          <YoryantraSelect
            label="Page context"
            value={scenario}
            onChange={(value: string) => {
              setScenario(value as Scenario);
              clearResult();
            }}
            options={[
              { label: "General website", value: "general" },
              { label: "Public content site", value: "publicSite" },
              { label: "Signed-in web app", value: "app" },
              { label: "Marketing / attribution site", value: "marketing" },
              { label: "Sensitive account or recovery pages", value: "sensitive" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value: string) => {
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

          <div className="space-y-3 md:col-span-2">
            <CheckboxRow
              checked={includeMetaTag}
              label="Include the equivalent meta element in text/config output"
              onChange={(checked) => {
                setIncludeMetaTag(checked);
                clearResult();
              }}
            />

            <CheckboxRow
              checked={includeExplanation}
              label="Include behavior notes with copied output"
              onChange={(checked) => {
                setIncludeExplanation(checked);
                clearResult();
              }}
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">
            {policy}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {selectedInfo.summary}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generatePolicy} className="yoryantra-btn whitespace-nowrap">
          Generate Policy
        </button>

        <button
          onClick={copyOutput}
          className="yoryantra-btn-outline whitespace-nowrap"
          disabled={!output}
        >
          {copied ? "Copied" : "Copy Output"}
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

      {result && (
        <div className="mt-8 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Policy" value={result.policy} />
          <SummaryCard label="Same-origin" value={result.examples[0]?.sent || "—"} />
          <SummaryCard label="Cross-origin HTTPS" value={result.examples[1]?.sent || "—"} />
          <SummaryCard label="HTTPS → HTTP" value={result.examples[2]?.sent || "—"} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            What the browser would send from the example page
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Source page: <span className="font-mono">https://example.com/account/settings?tab=billing</span>. Fragments and credentials are not included in a Referer header.
          </p>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Request</th>
                  <th className="px-4 py-3 font-semibold">Referer value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.examples.map((example) => (
                  <tr key={example.scenario}>
                    <td className="px-4 py-3 text-gray-700">{example.scenario}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="break-all">{example.sent}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <FindingCard tone="amber" title="Before you deploy this policy" items={warnings} />
      )}

      {infoItems.length > 0 && (
        <FindingCard tone="neutral" title="Behavior to keep in mind" items={infoItems} />
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

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
          {output || "Generated Referrer-Policy output will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Referrer changes can alter attribution, third-party dashboards, fraud signals, and login handoffs. Test the actual navigation and resource requests that matter before a site-wide rollout.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A referrer policy changes what leaves the current URL
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            Browsers can send a <span className="font-mono">Referer</span> request header when a page follows a link or loads another resource. Referrer-Policy decides whether that value contains the full source URL, only its origin, or nothing at all.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            Paths and query strings can reveal more context than intended—for example an account section, search term, campaign parameter, or internal route. The policy is therefore a privacy boundary as well as a deployment setting.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The current browser default already has downgrade protection
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            <span className="font-mono">strict-origin-when-cross-origin</span> is the current default when no valid policy is supplied. It keeps a full referrer on same-origin requests, sends only the origin to same-security cross-origin destinations, and sends nothing when an HTTPS page requests an HTTP destination.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            The older <span className="font-mono">no-referrer-when-downgrade</span> value prevents downgrade leakage but can still send a full path and query string to an HTTPS third party. That difference matters when old configuration is copied forward.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            “Origin only” and “same-origin only” solve different problems
          </h2>

          <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">strict-origin</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Cross-origin destinations can still learn the source origin, but not the path or query. HTTPS-to-HTTP gets no referrer.
              </p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">same-origin</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Same-origin requests receive the full referrer. Cross-origin destinations receive no referrer at all.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Header, meta element, and per-element policy can coexist
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            The response header is a clean site or route-level control. An HTML <span className="font-mono">&lt;meta name="referrer"&gt;</span> element can set a document policy when response headers are not available, while elements such as links, scripts, images, and iframes can use a <span className="font-mono">referrerpolicy</span> attribute for a more specific request.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            A link using <span className="font-mono">rel="noreferrer"</span> is another request-specific override. When debugging an unexpected Referer value, check all of those layers instead of assuming the response header is the only source.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The policy cannot remove sensitive data that has already leaked elsewhere
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            Referrer-Policy does not sanitize URLs, fix third-party scripts, or protect query parameters copied into logs, analytics payloads, browser history, or application code. Avoid putting secrets in URLs even when a strict referrer policy is present.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Standards and browser behavior
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            The Referrer Policy specification defines the policy values and how Fetch derives a referrer. MDN documents the current default and the request behavior of each value. Test in the browsers and embedded contexts your application actually supports.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            References:{" "}
            <a
              href="https://www.w3.org/TR/referrer-policy/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              W3C Referrer Policy
            </a>
            {" "}and{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              MDN Referrer-Policy
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/referrer-policy-generator" />
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
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium leading-relaxed text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
      />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-gray-900 [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  );
}

function FindingCard({
  tone,
  title,
  items,
}: {
  tone: "amber" | "neutral";
  title: string;
  items: Finding[];
}) {
  const amber = tone === "amber";

  return (
    <div
      className={`mt-6 self-start rounded-xl border p-4 ${
        amber
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      <h3 className={`text-sm font-semibold ${amber ? "text-amber-900" : "text-gray-900"}`}>
        {title}
      </h3>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`}>
            <p className={`text-sm font-semibold ${amber ? "text-amber-900" : "text-gray-900"}`}>
              {item.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildResult(options: {
  policy: PolicyValue;
  scenario: Scenario;
  outputMode: OutputMode;
  includeMetaTag: boolean;
  includeExplanation: boolean;
}): Result {
  const headerValue = `Referrer-Policy: ${options.policy}`;
  const examples = buildExamples(options.policy);
  const findings = buildFindings(options.policy, options.scenario);
  const base = {
    policy: options.policy,
    headerValue,
    findings,
    examples,
  };

  return {
    ...base,
    output: formatOutput(base, options),
  };
}

function buildExamples(policy: PolicyValue): BehaviorExample[] {
  const full = "https://example.com/account/settings?tab=billing";
  const origin = "https://example.com/";
  const none = "(no Referer header)";

  const map: Record<PolicyValue, [string, string, string]> = {
    "no-referrer": [none, none, none],
    "no-referrer-when-downgrade": [full, full, none],
    origin: [origin, origin, origin],
    "origin-when-cross-origin": [full, origin, origin],
    "same-origin": [full, none, none],
    "strict-origin": [origin, origin, none],
    "strict-origin-when-cross-origin": [full, origin, none],
    "unsafe-url": [full, full, full],
  };

  const values = map[policy];

  return [
    { scenario: "Same-origin HTTPS request", sent: values[0] },
    { scenario: "Cross-origin HTTPS request", sent: values[1] },
    { scenario: "HTTPS page → HTTP destination", sent: values[2] },
  ];
}

function buildFindings(policy: PolicyValue, scenario: Scenario): Finding[] {
  const findings: Finding[] = [];

  if (policy === "unsafe-url") {
    findings.push({
      severity: "warning",
      title: "Full URL details can leave the origin",
      message: "unsafe-url can send paths and query strings cross-origin and even from HTTPS to HTTP. Use it only when that disclosure is intentional.",
    });
  }

  if (policy === "no-referrer-when-downgrade") {
    findings.push({
      severity: "warning",
      title: "Legacy behavior exposes more cross-origin detail",
      message: "An HTTPS third party can receive the full source path and query string. strict-origin-when-cross-origin is the current browser default.",
    });
  }

  if (policy === "origin-when-cross-origin") {
    findings.push({
      severity: "warning",
      title: "Origin can cross an HTTPS-to-HTTP downgrade",
      message: "The path is withheld cross-origin, but the source origin may still be sent to an insecure HTTP destination.",
    });
  }

  if (policy === "origin") {
    findings.push({
      severity: "warning",
      title: "Origin is sent on downgrade requests",
      message: "Only scheme, host, and port are disclosed, but that origin can still be sent from HTTPS to HTTP.",
    });
  }

  if (scenario === "sensitive" && policy !== "no-referrer" && policy !== "same-origin") {
    findings.push({
      severity: "warning",
      title: "Sensitive pages may deserve a narrower boundary",
      message: "Account recovery, billing, and similarly sensitive routes often benefit from no-referrer or same-origin after compatibility testing.",
    });
  }

  if (scenario === "marketing" && (policy === "no-referrer" || policy === "same-origin")) {
    findings.push({
      severity: "info",
      title: "Cross-origin attribution may lose referrer context",
      message: "Analytics and partner destinations may receive less or no referrer information under this policy.",
    });
  }

  if (policy === "strict-origin-when-cross-origin") {
    findings.push({
      severity: "info",
      title: "This matches the current browser default",
      message: "Setting it explicitly can still make the intended policy easier to audit in server configuration.",
    });
  }

  if (findings.length === 0) {
    findings.push({
      severity: "info",
      title: "No special caution for the selected combination",
      message: "The behavior table is still the important part; confirm it matches the navigation and third-party requests your site depends on.",
    });
  }

  return findings;
}

function formatOutput(
  result: Omit<Result, "output">,
  options: {
    outputMode: OutputMode;
    includeMetaTag: boolean;
    includeExplanation: boolean;
  }
) {
  const meta = `<meta name="referrer" content="${result.policy}" />`;
  const notes = explanationText(result);

  if (options.outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (options.outputMode === "nginx") {
    return joinOptional([
      `add_header Referrer-Policy "${result.policy}" always;`,
      options.includeMetaTag
        ? commentBlock(["Equivalent document-level meta element:", meta], "#")
        : "",
      options.includeExplanation ? commentBlock(notes.split("\n"), "#") : "",
    ]);
  }

  if (options.outputMode === "apache") {
    return joinOptional([
      `Header always set Referrer-Policy "${result.policy}"`,
      options.includeMetaTag
        ? commentBlock(["Equivalent document-level meta element:", meta], "#")
        : "",
      options.includeExplanation ? commentBlock(notes.split("\n"), "#") : "",
    ]);
  }

  if (options.outputMode === "html") {
    return joinOptional([
      meta,
      options.includeExplanation ? `<!--\n${notes}\n-->` : "",
    ]);
  }

  if (options.outputMode === "markdown") {
    return [
      "# Referrer policy",
      "",
      `Policy: \`${result.policy}\``,
      `Header: \`${result.headerValue}\``,
      "",
      "## Example behavior",
      ...result.examples.map((item) => `- ${item.scenario}: \`${item.sent}\``),
      "",
      "## Notes",
      ...result.findings.map((item) => `- **${item.title}:** ${item.message}`),
    ].join("\n");
  }

  return joinOptional([
    result.headerValue,
    options.includeMetaTag ? meta : "",
    options.includeExplanation ? notes : "",
  ]);
}

function explanationText(result: Omit<Result, "output">) {
  return [
    "Example behavior:",
    ...result.examples.map((item) => `- ${item.scenario}: ${item.sent}`),
    "",
    "Notes:",
    ...result.findings.map((item) => `- ${item.title}: ${item.message}`),
  ].join("\n");
}

function commentBlock(lines: string[], prefix: "#") {
  return lines.map((line) => (line ? `${prefix} ${line}` : prefix)).join("\n");
}

function joinOptional(parts: string[]) {
  return parts.filter(Boolean).join("\n");
}
