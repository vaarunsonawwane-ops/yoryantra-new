"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type PolicyMode = "enforce" | "report-only";
type PresetMode = "baseline" | "tight" | "legacy";
type OutputFormat = "header" | "meta" | "nginx" | "apache" | "json";

type DirectiveConfig = {
  key: string;
  label: string;
  description: string;
  values: string[];
  custom: string;
  enabled: boolean;
};

type CSPFinding = {
  title: string;
  message: string;
};

type SourceGroup = Record<string, string[]>;

const directiveTemplates: DirectiveConfig[] = [
  {
    key: "default-src",
    label: "default-src",
    description:
      "Fallback for fetch directives that do not have a more specific source list.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "script-src",
    label: "script-src",
    description:
      "Controls JavaScript sources and acts as a fallback for script-src-elem and script-src-attr.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "style-src",
    label: "style-src",
    description:
      "Controls stylesheet and style sources, including fallback behavior for style-specific directives.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "img-src",
    label: "img-src",
    description: "Controls image, favicon, and other image-fetch sources.",
    values: ["'self'", "data:"],
    custom: "",
    enabled: true,
  },
  {
    key: "font-src",
    label: "font-src",
    description: "Controls font files requested by the page.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "connect-src",
    label: "connect-src",
    description:
      "Controls fetch, XHR, WebSocket, EventSource, sendBeacon, and related connection targets.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "media-src",
    label: "media-src",
    description: "Controls audio and video resource sources.",
    values: ["'self'"],
    custom: "",
    enabled: false,
  },
  {
    key: "object-src",
    label: "object-src",
    description:
      "Controls object and embed resources. Many modern sites explicitly block these with 'none'.",
    values: ["'none'"],
    custom: "",
    enabled: true,
  },
  {
    key: "frame-src",
    label: "frame-src",
    description: "Controls which frame and iframe resources this page may load.",
    values: ["'self'"],
    custom: "",
    enabled: false,
  },
  {
    key: "frame-ancestors",
    label: "frame-ancestors",
    description:
      "Controls which parent origins may embed this page. It does not fall back to default-src.",
    values: ["'none'"],
    custom: "",
    enabled: true,
  },
  {
    key: "base-uri",
    label: "base-uri",
    description:
      "Restricts URLs allowed in the document's base element. It does not fall back to default-src.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "form-action",
    label: "form-action",
    description:
      "Restricts form submission targets. It does not fall back to default-src.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "manifest-src",
    label: "manifest-src",
    description: "Controls web app manifest sources.",
    values: ["'self'"],
    custom: "",
    enabled: false,
  },
  {
    key: "worker-src",
    label: "worker-src",
    description:
      "Controls Worker, SharedWorker, and Service Worker script sources.",
    values: ["'self'"],
    custom: "",
    enabled: false,
  },
  {
    key: "child-src",
    label: "child-src",
    description:
      "Fallback for frame-src and worker-src when those more specific directives are absent.",
    values: ["'self'"],
    custom: "",
    enabled: false,
  },
];

const sourceGroups: Record<"analytics" | "cdnFonts", SourceGroup> = {
  analytics: {
    "script-src": ["https://www.googletagmanager.com"],
    "img-src": [
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
    ],
    "connect-src": [
      "https://www.google-analytics.com",
      "https://analytics.google.com",
      "https://www.clarity.ms",
    ],
  },
  cdnFonts: {
    "script-src": [
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://cdnjs.cloudflare.com",
    ],
    "style-src": [
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://cdnjs.cloudflare.com",
      "https://fonts.googleapis.com",
    ],
    "font-src": ["https://fonts.gstatic.com"],
  },
};

const samplePolicy =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests";

const metaUnsupportedDirectives = new Set([
  "frame-ancestors",
  "report-to",
  "report-uri",
  "sandbox",
]);

export default function ToolClient() {
  const [directives, setDirectives] =
    useState<DirectiveConfig[]>(directiveTemplates);
  const [policyMode, setPolicyMode] = useState<PolicyMode>("enforce");
  const [presetMode, setPresetMode] = useState<PresetMode>("baseline");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("header");
  const [reportUri, setReportUri] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [upgradeInsecureRequests, setUpgradeInsecureRequests] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const validationErrors = useMemo(
    () => validateBuilderInput({ directives, reportUri, reportTo }),
    [directives, reportUri, reportTo]
  );

  const policy = useMemo(
    () =>
      buildPolicy({
        directives,
        reportUri,
        reportTo,
        upgradeInsecureRequests,
        outputFormat,
      }),
    [directives, reportUri, reportTo, upgradeInsecureRequests, outputFormat]
  );

  const findings = useMemo(
    () =>
      getPolicyFindings({
        directives,
        policyMode,
        reportUri,
        reportTo,
        outputFormat,
        upgradeInsecureRequests,
      }),
    [
      directives,
      policyMode,
      reportUri,
      reportTo,
      outputFormat,
      upgradeInsecureRequests,
    ]
  );

  const output = useMemo(() => {
    if (validationErrors.length > 0 || !policy.value) {
      return "";
    }

    return formatOutput({
      policy: policy.value,
      policyMode,
      outputFormat,
      omittedDirectives: policy.omittedDirectives,
    });
  }, [policy, policyMode, outputFormat, validationErrors]);

  const enabledCount = directives.filter((directive) => directive.enabled).length;

  const applyPreset = (preset: PresetMode) => {
    setPresetMode(preset);
    setCopied(false);
    setCopyError("");

    if (preset === "tight") {
      setDirectives(
        directiveTemplates.map((directive) => {
          const enabled = [
            "default-src",
            "script-src",
            "style-src",
            "img-src",
            "font-src",
            "connect-src",
            "object-src",
            "frame-src",
            "frame-ancestors",
            "base-uri",
            "form-action",
          ].includes(directive.key);

          if (!enabled) {
            return { ...directive, enabled: false, values: [], custom: "" };
          }

          if (
            directive.key === "default-src" ||
            directive.key === "object-src" ||
            directive.key === "frame-src" ||
            directive.key === "frame-ancestors"
          ) {
            return {
              ...directive,
              enabled: true,
              values: ["'none'"],
              custom: "",
            };
          }

          return {
            ...directive,
            enabled: true,
            values: ["'self'"],
            custom: "",
          };
        })
      );
      setUpgradeInsecureRequests(true);
      return;
    }

    if (preset === "legacy") {
      setDirectives(
        directiveTemplates.map((directive) => {
          if (directive.key === "script-src") {
            return {
              ...directive,
              values: ["'self'", "'unsafe-inline'"],
              custom: "",
              enabled: true,
            };
          }

          if (directive.key === "style-src") {
            return {
              ...directive,
              values: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
              custom: "",
              enabled: true,
            };
          }

          if (directive.key === "font-src") {
            return {
              ...directive,
              values: ["'self'", "https://fonts.gstatic.com", "data:"],
              custom: "",
              enabled: true,
            };
          }

          if (directive.key === "img-src") {
            return {
              ...directive,
              values: ["'self'", "data:", "https:"],
              custom: "",
              enabled: true,
            };
          }

          if (directive.key === "connect-src") {
            return {
              ...directive,
              values: ["'self'", "https:"],
              custom: "",
              enabled: true,
            };
          }

          return { ...directive, custom: "" };
        })
      );
      setUpgradeInsecureRequests(true);
      return;
    }

    setDirectives(directiveTemplates.map(cloneDirective));
    setUpgradeInsecureRequests(true);
  };

  const toggleDirective = (key: string) => {
    setDirectives((current) =>
      current.map((directive) =>
        directive.key === key
          ? { ...directive, enabled: !directive.enabled }
          : directive
      )
    );
    setCopied(false);
    setCopyError("");
  };

  const toggleSource = (key: string, source: string) => {
    setDirectives((current) =>
      current.map((directive) => {
        if (directive.key !== key) return directive;

        const hasSource = directive.values.includes(source);
        let values = hasSource
          ? directive.values.filter((value) => value !== source)
          : [...directive.values, source];

        if (!hasSource && source === "'none'") {
          values = ["'none'"];
        } else if (!hasSource) {
          values = values.filter((value) => value !== "'none'");
        }

        return { ...directive, enabled: true, values };
      })
    );
    setCopied(false);
    setCopyError("");
  };

  const updateCustomSource = (key: string, custom: string) => {
    setDirectives((current) =>
      current.map((directive) =>
        directive.key === key
          ? { ...directive, custom, enabled: true }
          : directive
      )
    );
    setCopied(false);
    setCopyError("");
  };

  const addSourceGroup = (group: SourceGroup) => {
    setDirectives((current) =>
      current.map((directive) => {
        const additions = group[directive.key];
        if (!additions) return directive;

        const nextValues = Array.from(
          new Set([
            ...directive.values.filter((value) => value !== "'none'"),
            ...additions,
          ])
        );

        return {
          ...directive,
          enabled: true,
          values: nextValues,
        };
      })
    );
    setCopied(false);
    setCopyError("");
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setCopyError("The generated output could not be copied. Select and copy it manually.");
    }
  };

  const loadExample = () => {
    setDirectives(directiveTemplates.map(cloneDirective));
    setPolicyMode("enforce");
    setPresetMode("baseline");
    setOutputFormat("header");
    setReportUri("");
    setReportTo("");
    setUpgradeInsecureRequests(true);
    setCopied(false);
    setCopyError("");
  };

  const resetAll = () => {
    setDirectives(
      directiveTemplates.map((directive) => ({
        ...cloneDirective(directive),
        values: [],
        custom: "",
        enabled: false,
      }))
    );
    setPolicyMode("enforce");
    setPresetMode("baseline");
    setOutputFormat("header");
    setReportUri("");
    setReportTo("");
    setUpgradeInsecureRequests(false);
    setCopied(false);
    setCopyError("");
  };

  const outputOptions = [
    { label: "HTTP Header", value: "header" },
    ...(policyMode === "enforce"
      ? [{ label: "Meta Tag", value: "meta" }]
      : []),
    { label: "Nginx", value: "nginx" },
    { label: "Apache", value: "apache" },
    { label: "JSON", value: "json" },
  ];

  return (
    <ToolShell
      title="CSP Policy Builder"
      description="Assemble CSP directives and sources into enforce or report-only headers, with deployment-format output and guardrails."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Start with a policy shape, not a promise
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
              Presets are editable starting points. They cannot know which
              scripts, APIs, frames, fonts, or inline code your application
              actually needs.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{enabledCount}</span>{" "}
            directives enabled
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Starting preset"
            value={presetMode}
            onChange={(value) => applyPreset(value as PresetMode)}
            options={[
              { label: "Baseline", value: "baseline" },
              { label: "Tight allowlist", value: "tight" },
              { label: "Legacy compatibility", value: "legacy" },
            ]}
          />

          <YoryantraSelect
            label="Policy mode"
            value={policyMode}
            onChange={(value) => {
              const nextMode = value as PolicyMode;
              setPolicyMode(nextMode);
              if (nextMode === "report-only" && outputFormat === "meta") {
                setOutputFormat("header");
              }
              setCopied(false);
              setCopyError("");
            }}
            options={[
              { label: "Enforce", value: "enforce" },
              { label: "Report Only", value: "report-only" },
            ]}
          />

          <YoryantraSelect
            label="Output format"
            value={outputFormat}
            onChange={(value) => {
              setOutputFormat(value as OutputFormat);
              setCopied(false);
              setCopyError("");
            }}
            options={outputOptions}
          />
        </div>

        <label className="mt-5 flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <input
            type="checkbox"
            checked={upgradeInsecureRequests}
            onChange={(event) => {
              setUpgradeInsecureRequests(event.target.checked);
              setCopied(false);
              setCopyError("");
            }}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">
              Upgrade insecure requests
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-gray-500">
              Add upgrade-insecure-requests so supported browsers rewrite
              insecure resource URLs to HTTPS before fetching them.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Source shortcuts with narrow destinations
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          These buttons add example origins only to the directives where they
          normally belong. Real deployments can need different hosts, so compare
          the result with your own network traffic.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => addSourceGroup(sourceGroups.analytics)}
            className="yoryantra-btn-outline whitespace-nowrap"
          >
            Add Analytics Examples
          </button>
          <button
            onClick={() => addSourceGroup(sourceGroups.cdnFonts)}
            className="yoryantra-btn-outline whitespace-nowrap"
          >
            Add CDN / Fonts Examples
          </button>
          <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
            Load Baseline
          </button>
          <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {directives.map((directive) => {
          const quickSources = getQuickSources(directive.key);

          return (
            <div
              key={directive.key}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={directive.enabled}
                    onChange={() => toggleDirective(directive.key)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
                  />
                  <span>
                    <span className="block font-mono text-sm font-semibold text-gray-900">
                      {directive.label}
                    </span>
                    <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-gray-500">
                      {directive.description}
                    </span>
                  </span>
                </label>

                <span
                  className={`w-fit self-start rounded-full px-3 py-1 text-xs font-semibold ${
                    directive.enabled
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {directive.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              {directive.enabled && (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quickSources.map((source) => (
                      <button
                        key={`${directive.key}-${source}`}
                        onClick={() => toggleSource(directive.key, source)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          directive.values.includes(source)
                            ? "border-[var(--green)] bg-green-50 text-gray-900"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[var(--green)]"
                        }`}
                      >
                        {source}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Additional source expressions for {directive.label}
                    </label>
                    <input
                      value={directive.custom}
                      onChange={(event) =>
                        updateCustomSource(directive.key, event.target.value)
                      }
                      placeholder="https://api.example.com 'nonce-randomValue'"
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                    />
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      Space-separated CSP source expressions only. Raw semicolons
                      and commas are rejected so one field cannot accidentally
                      create another directive.
                    </p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Violation reporting
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          report-to names a reporting endpoint group defined separately in a
          Reporting-Endpoints response header. report-uri accepts report URLs
          but is deprecated and remains here only for compatibility.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              report-uri compatibility URL(s)
            </label>
            <input
              value={reportUri}
              onChange={(event) => {
                setReportUri(event.target.value);
                setCopied(false);
                setCopyError("");
              }}
              placeholder="/csp-report"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              report-to endpoint group
            </label>
            <input
              value={reportTo}
              onChange={(event) => {
                setReportTo(event.target.value);
                setCopied(false);
                setCopyError("");
              }}
              placeholder="csp-endpoint"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          <p className="font-semibold">Fix these values before copying output:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validationErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {findings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Things worth checking before deployment
          </h3>
          <div className="mt-3 space-y-3">
            {findings.map((finding) => (
              <div key={`${finding.title}-${finding.message}`}>
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

      {copyError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {copyError}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Generated policy</h3>
          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[270px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            (validationErrors.length
              ? "Correct the invalid values above to generate copyable output."
              : "Enable at least one directive or upgrade-insecure-requests to generate output.")}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Policy assembly happens in this browser. Source expressions and reporting
        values entered here are not sent to a Yoryantra server by the builder.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Start from the requests your page really makes
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            CSP works best when the allowlist reflects actual application
            behavior. Browser network logs, report-only violations, framework
            output, third-party widgets, and inline code all matter more than a
            generic preset. A host-based policy can still be broad even when it
            looks tidy on one line.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Host allowlists and strict CSP solve different maintenance problems
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Modern strict CSP guidance commonly relies on per-response nonces or
            stable script hashes, often together with
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm">
              &apos;strict-dynamic&apos;
            </code>.
            That model cannot be generated safely from a static hostname list
            because the nonce must be unpredictable and coordinated with the
            HTML response. Add nonce or hash expressions here only when your
            application actually supplies the matching values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Report-only is observation, not protection
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A report-only policy records violations but does not block the
            violating load. The report-to directive names a group defined by the
            separate Reporting-Endpoints header; it is not itself a report URL.
            report-uri is deprecated, but many deployments still send both while
            older browser support matters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Meta output intentionally leaves some directives behind
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A CSP meta element cannot deliver report-only mode, and browsers do
            not support frame-ancestors or CSP reporting directives from that
            element. When Meta Tag output is selected, this builder omits those
            directives instead of producing markup that looks valid but will be
            ignored.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why block-all-mixed-content is not offered here
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The directive is obsolete in current specifications. Modern mixed
            content handling already upgrades or blocks affected requests, and
            upgrade-insecure-requests remains available when a site needs CSP to
            rewrite insecure subresource URLs to HTTPS.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Generated configuration still needs application testing
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The builder checks obvious policy-construction mistakes, but it
            cannot discover every resource your application loads or determine
            whether a permitted origin can serve attacker-controlled code. Test
            in report-only mode, inspect violations, then enforce deliberately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Specification and browser guidance
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Directive syntax and fallback behavior come from{" "}
            <a
              href="https://www.w3.org/TR/CSP3/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Content Security Policy Level 3
            </a>
            . The{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              MDN CSP implementation guide
            </a>{" "}
            is useful for nonce/hash deployment, report-only testing, and browser
            behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/csp-policy-builder" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function cloneDirective(directive: DirectiveConfig): DirectiveConfig {
  return {
    ...directive,
    values: [...directive.values],
  };
}

function getQuickSources(key: string) {
  if (key === "frame-ancestors" || key === "base-uri" || key === "form-action") {
    return ["'self'", "'none'", "https:", "http:", "*"];
  }

  if (key === "script-src") {
    return [
      "'self'",
      "'none'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "'strict-dynamic'",
      "https:",
      "blob:",
      "*",
    ];
  }

  if (key === "style-src") {
    return ["'self'", "'none'", "'unsafe-inline'", "https:", "data:", "*"];
  }

  if (key === "img-src" || key === "font-src" || key === "media-src") {
    return ["'self'", "'none'", "https:", "data:", "blob:", "*"];
  }

  if (key === "worker-src") {
    return ["'self'", "'none'", "https:", "blob:", "*"];
  }

  return ["'self'", "'none'", "https:", "http:", "*"];
}

function splitCustomValues(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateBuilderInput({
  directives,
  reportUri,
  reportTo,
}: {
  directives: DirectiveConfig[];
  reportUri: string;
  reportTo: string;
}) {
  const errors: string[] = [];

  directives.forEach((directive) => {
    splitCustomValues(directive.custom).forEach((value) => {
      if (/[;,]/.test(value)) {
        errors.push(
          `${directive.key}: ${value} contains a raw semicolon or comma. Percent-encode those characters when they are genuinely part of a source URL.`
        );
      }
    });
  });

  if (/[;,]/.test(reportTo.trim())) {
    errors.push("report-to must be one endpoint group name without semicolons or commas.");
  }

  if (/\s/.test(reportTo.trim())) {
    errors.push("report-to must be one endpoint group name, not multiple space-separated values.");
  }

  if (/^https?:/i.test(reportTo.trim())) {
    errors.push("report-to expects a group name, not a URL. Put the URL in a separate Reporting-Endpoints response header.");
  }

  if (
    reportTo.trim() &&
    !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(reportTo.trim())
  ) {
    errors.push("report-to contains characters that are not valid in a reporting endpoint group token.");
  }

  if (/[;,]/.test(reportUri.trim())) {
    errors.push("report-uri cannot contain a raw semicolon or comma in this builder. Percent-encode those characters inside a URL.");
  }

  return Array.from(new Set(errors));
}

function buildPolicy({
  directives,
  reportUri,
  reportTo,
  upgradeInsecureRequests,
  outputFormat,
}: {
  directives: DirectiveConfig[];
  reportUri: string;
  reportTo: string;
  upgradeInsecureRequests: boolean;
  outputFormat: OutputFormat;
}) {
  const parts: string[] = [];
  const omittedDirectives: string[] = [];

  directives.forEach((directive) => {
    if (!directive.enabled) return;

    if (outputFormat === "meta" && metaUnsupportedDirectives.has(directive.key)) {
      omittedDirectives.push(directive.key);
      return;
    }

    const customValues = splitCustomValues(directive.custom).filter(
      (value) => !/[;,]/.test(value)
    );
    let values = Array.from(new Set([...directive.values, ...customValues]));

    if (values.includes("'none'") && values.length > 1) {
      values = values.filter((value) => value !== "'none'");
    }

    if (values.length === 0) {
      parts.push(directive.key);
    } else {
      parts.push(`${directive.key} ${values.join(" ")}`);
    }
  });

  if (upgradeInsecureRequests) {
    parts.push("upgrade-insecure-requests");
  }

  if (outputFormat !== "meta" && reportUri.trim()) {
    parts.push(`report-uri ${reportUri.trim()}`);
  } else if (outputFormat === "meta" && reportUri.trim()) {
    omittedDirectives.push("report-uri");
  }

  if (outputFormat !== "meta" && reportTo.trim()) {
    parts.push(`report-to ${reportTo.trim()}`);
  } else if (outputFormat === "meta" && reportTo.trim()) {
    omittedDirectives.push("report-to");
  }

  return {
    value: parts.join("; "),
    omittedDirectives: Array.from(new Set(omittedDirectives)),
  };
}

function formatOutput({
  policy,
  policyMode,
  outputFormat,
  omittedDirectives,
}: {
  policy: string;
  policyMode: PolicyMode;
  outputFormat: OutputFormat;
  omittedDirectives: string[];
}) {
  const headerName =
    policyMode === "report-only"
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";

  if (outputFormat === "meta") {
    return `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(
      policy
    )}">`;
  }

  if (outputFormat === "nginx") {
    return `add_header ${headerName} "${escapeQuoted(policy)}" always;`;
  }

  if (outputFormat === "apache") {
    return `Header always set ${headerName} "${escapeQuoted(policy)}"`;
  }

  if (outputFormat === "json") {
    return JSON.stringify(
      {
        header: headerName,
        value: policy,
        ...(omittedDirectives.length
          ? { omittedFromMeta: omittedDirectives }
          : {}),
      },
      null,
      2
    );
  }

  return `${headerName}: ${policy}`;
}

function getPolicyFindings({
  directives,
  policyMode,
  reportUri,
  reportTo,
  outputFormat,
  upgradeInsecureRequests,
}: {
  directives: DirectiveConfig[];
  policyMode: PolicyMode;
  reportUri: string;
  reportTo: string;
  outputFormat: OutputFormat;
  upgradeInsecureRequests: boolean;
}): CSPFinding[] {
  const findings: CSPFinding[] = [];
  const enabled = directives.filter((directive) => directive.enabled);
  const valuesByDirective = new Map(
    enabled.map((directive) => [
      directive.key,
      Array.from(
        new Set([...directive.values, ...splitCustomValues(directive.custom)])
      ),
    ])
  );

  const allValues = Array.from(valuesByDirective.values()).reduce<string[]>(
    (collected, values) => collected.concat(values),
    []
  );

  if (allValues.includes("'unsafe-inline'")) {
    findings.push({
      title: "Inline code is broadly allowed",
      message:
        "'unsafe-inline' weakens script or style restrictions unless a nonce/hash changes how supporting browsers interpret that source list.",
    });
  }

  if (allValues.includes("'unsafe-eval'")) {
    findings.push({
      title: "String-to-code evaluation is allowed",
      message:
        "'unsafe-eval' enables APIs such as eval() that tighter script policies intentionally block.",
    });
  }

  if (allValues.includes("*")) {
    findings.push({
      title: "A wildcard source is present",
      message:
        "A wildcard can authorize a much broader set of network origins than a narrow host allowlist.",
    });
  }

  if (
    allValues.some((value) => value === "http:" || /^http:\/\//i.test(value))
  ) {
    findings.push({
      title: "HTTP sources are explicitly allowed",
      message:
        "Review whether insecure source URLs are really needed on an HTTPS application.",
    });
  }

  if (!valuesByDirective.has("object-src")) {
    findings.push({
      title: "object-src is not explicit",
      message:
        "Many modern pages choose object-src 'none' instead of leaving object/embed behavior to a fallback.",
    });
  }

  if (!valuesByDirective.has("frame-ancestors")) {
    findings.push({
      title: "frame-ancestors is not explicit",
      message:
        "default-src does not control who may frame the page, so framing needs its own decision.",
    });
  }

  if (policyMode === "report-only" && !reportUri.trim() && !reportTo.trim()) {
    findings.push({
      title: "Report-only has no reporting endpoint",
      message:
        "Console violations can still appear, but no CSP reporting endpoint is configured in the policy.",
    });
  }

  if (reportUri.trim()) {
    findings.push({
      title: "report-uri is a compatibility directive",
      message:
        "report-uri is deprecated. Keep it only when older browser coverage matters, usually alongside report-to.",
    });
  }

  if (reportTo.trim()) {
    findings.push({
      title: "report-to needs a separate endpoint mapping",
      message:
        `The group "${reportTo.trim()}" must be mapped to a URL by a Reporting-Endpoints response header.`,
    });
  }

  if (outputFormat === "meta") {
    const omitted = [
      ...enabled
        .filter((directive) => metaUnsupportedDirectives.has(directive.key))
        .map((directive) => directive.key),
      ...(reportUri.trim() ? ["report-uri"] : []),
      ...(reportTo.trim() ? ["report-to"] : []),
    ];

    if (omitted.length > 0) {
      findings.push({
        title: "Meta output omits unsupported directives",
        message: `${Array.from(new Set(omitted)).join(
          ", "
        )} cannot be delivered through a CSP meta element and are left out of that output.`,
      });
    }
  }

  if (upgradeInsecureRequests) {
    findings.push({
      title: "HTTP resource URLs will be rewritten",
      message:
        "upgrade-insecure-requests upgrades insecure subresource URLs to HTTPS. A resource that has no HTTPS endpoint can then fail to load.",
    });
  }

  return findings;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeQuoted(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
