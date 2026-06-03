"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type PolicyMode = "enforce" | "report-only";
type PresetMode = "strict" | "balanced" | "compat";
type OutputFormat = "header" | "meta" | "nginx" | "apache" | "json";

type DirectiveConfig = {
  key: string;
  label: string;
  description: string;
  values: string[];
  custom: string;
  enabled: boolean;
};

type CSPWarning = {
  title: string;
  message: string;
};

const directiveTemplates: DirectiveConfig[] = [
  {
    key: "default-src",
    label: "default-src",
    description:
      "Fallback source list for fetch directives when a specific directive is not present.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "script-src",
    label: "script-src",
    description:
      "Controls JavaScript sources. Keep this strict because scripts are the most sensitive CSP surface.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "style-src",
    label: "style-src",
    description:
      "Controls CSS sources. Some frameworks may need hashes, nonces, or carefully reviewed inline styles.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "img-src",
    label: "img-src",
    description:
      "Controls images, favicons, SVGs, and image data loaded by the page.",
    values: ["'self'", "data:"],
    custom: "",
    enabled: true,
  },
  {
    key: "font-src",
    label: "font-src",
    description:
      "Controls web fonts loaded by CSS and font files served from trusted origins.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "connect-src",
    label: "connect-src",
    description:
      "Controls fetch, XHR, WebSocket, EventSource, and other connection endpoints.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "media-src",
    label: "media-src",
    description:
      "Controls audio and video sources used by media elements.",
    values: ["'self'"],
    custom: "",
    enabled: false,
  },
  {
    key: "object-src",
    label: "object-src",
    description:
      "Controls plugins such as object, embed, and applet. Most modern sites should set this to 'none'.",
    values: ["'none'"],
    custom: "",
    enabled: true,
  },
  {
    key: "frame-src",
    label: "frame-src",
    description:
      "Controls what your page can embed inside frames and iframes.",
    values: ["'self'"],
    custom: "",
    enabled: false,
  },
  {
    key: "frame-ancestors",
    label: "frame-ancestors",
    description:
      "Controls which sites can embed your page. This helps reduce clickjacking risk.",
    values: ["'none'"],
    custom: "",
    enabled: true,
  },
  {
    key: "base-uri",
    label: "base-uri",
    description:
      "Restricts URLs that can be used inside a base element.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "form-action",
    label: "form-action",
    description:
      "Controls where forms can be submitted.",
    values: ["'self'"],
    custom: "",
    enabled: true,
  },
  {
    key: "manifest-src",
    label: "manifest-src",
    description:
      "Controls web app manifest loading.",
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
      "Legacy fallback for workers and frames in older browser behavior.",
    values: ["'self'"],
    custom: "",
    enabled: false,
  },
];

const quickSources = [
  "'self'",
  "'none'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "data:",
  "blob:",
  "https:",
  "http:",
];

const analyticsSources = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://analytics.google.com",
  "https://www.clarity.ms",
];

const cdnSources = [
  "https://cdn.jsdelivr.net",
  "https://unpkg.com",
  "https://cdnjs.cloudflare.com",
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];

const samplePolicy = `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;

export default function ToolClient() {
  const [directives, setDirectives] =
    useState<DirectiveConfig[]>(directiveTemplates);
  const [policyMode, setPolicyMode] = useState<PolicyMode>("enforce");
  const [presetMode, setPresetMode] = useState<PresetMode>("balanced");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("header");
  const [reportUri, setReportUri] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [upgradeInsecureRequests, setUpgradeInsecureRequests] = useState(true);
  const [blockAllMixedContent, setBlockAllMixedContent] = useState(false);
  const [copied, setCopied] = useState(false);

  const policy = useMemo(
    () =>
      buildPolicy({
        directives,
        reportUri,
        reportTo,
        upgradeInsecureRequests,
        blockAllMixedContent,
      }),
    [
      directives,
      reportUri,
      reportTo,
      upgradeInsecureRequests,
      blockAllMixedContent,
    ]
  );

  const warnings = useMemo(
    () =>
      getPolicyWarnings({
        directives,
        policyMode,
        reportUri,
        reportTo,
      }),
    [directives, policyMode, reportUri, reportTo]
  );

  const output = useMemo(
    () =>
      formatOutput({
        policy,
        policyMode,
        outputFormat,
      }),
    [policy, policyMode, outputFormat]
  );

  const enabledCount = directives.filter((directive) => directive.enabled).length;

  const applyPreset = (preset: PresetMode) => {
    setPresetMode(preset);
    setCopied(false);

    if (preset === "strict") {
      setDirectives(
        directiveTemplates.map((directive) => {
          if (directive.key === "style-src") {
            return {
              ...directive,
              values: ["'self'"],
              custom: "",
              enabled: true,
            };
          }

          if (directive.key === "img-src") {
            return {
              ...directive,
              values: ["'self'"],
              custom: "",
              enabled: true,
            };
          }

          if (directive.key === "frame-src") {
            return {
              ...directive,
              values: ["'none'"],
              custom: "",
              enabled: true,
            };
          }

          return {
            ...directive,
            values:
              directive.key === "object-src" || directive.key === "frame-ancestors"
                ? ["'none'"]
                : directive.values.length > 0
                  ? ["'self'"]
                  : [],
            custom: "",
            enabled: [
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
            ].includes(directive.key),
          };
        })
      );
      setUpgradeInsecureRequests(true);
      setBlockAllMixedContent(false);
      return;
    }

    if (preset === "compat") {
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
              values: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
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

          return {
            ...directive,
            custom: "",
            enabled: directive.enabled,
          };
        })
      );
      setUpgradeInsecureRequests(true);
      setBlockAllMixedContent(false);
      return;
    }

    setDirectives(directiveTemplates);
    setUpgradeInsecureRequests(true);
    setBlockAllMixedContent(false);
  };

  const toggleDirective = (key: string) => {
    setDirectives((current) =>
      current.map((directive) =>
        directive.key === key
          ? {
              ...directive,
              enabled: !directive.enabled,
            }
          : directive
      )
    );
    setCopied(false);
  };

  const toggleSource = (key: string, source: string) => {
    setDirectives((current) =>
      current.map((directive) => {
        if (directive.key !== key) {
          return directive;
        }

        const hasSource = directive.values.includes(source);

        return {
          ...directive,
          enabled: true,
          values: hasSource
            ? directive.values.filter((value) => value !== source)
            : [...directive.values, source],
        };
      })
    );
    setCopied(false);
  };

  const updateCustomSource = (key: string, custom: string) => {
    setDirectives((current) =>
      current.map((directive) =>
        directive.key === key
          ? {
              ...directive,
              custom,
              enabled: true,
            }
          : directive
      )
    );
    setCopied(false);
  };

  const addSourceGroup = (group: string[]) => {
    const targetKeys = ["script-src", "style-src", "img-src", "font-src", "connect-src"];

    setDirectives((current) =>
      current.map((directive) => {
        if (!targetKeys.includes(directive.key)) {
          return directive;
        }

        const nextValues = Array.from(
          new Set([...directive.values, ...group])
        );

        return {
          ...directive,
          enabled: true,
          values: nextValues,
        };
      })
    );
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setDirectives(directiveTemplates);
    setPolicyMode("enforce");
    setPresetMode("balanced");
    setOutputFormat("header");
    setReportUri("");
    setReportTo("");
    setUpgradeInsecureRequests(true);
    setBlockAllMixedContent(false);
    setCopied(false);
  };

  const resetAll = () => {
    setDirectives(
      directiveTemplates.map((directive) => ({
        ...directive,
        values: [],
        custom: "",
        enabled: false,
      }))
    );
    setPolicyMode("enforce");
    setPresetMode("balanced");
    setOutputFormat("header");
    setReportUri("");
    setReportTo("");
    setUpgradeInsecureRequests(false);
    setBlockAllMixedContent(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="CSP Policy Builder"
      description="Build Content Security Policy headers, configure CSP directives, add trusted sources, and copy production-ready security header output directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Policy Setup
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
              Choose a starting preset, then customize directives and trusted
              sources. Start with report-only mode when testing a new CSP on a
              live website.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{enabledCount}</span>{" "}
            directives enabled
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Policy Preset"
            value={presetMode}
            onChange={(value) => applyPreset(value as PresetMode)}
            options={[
              {
                label: "Balanced",
                value: "balanced",
              },
              {
                label: "Strict",
                value: "strict",
              },
              {
                label: "Compatibility",
                value: "compat",
              },
            ]}
          />

          <YoryantraSelect
            label="Policy Mode"
            value={policyMode}
            onChange={(value) => {
              setPolicyMode(value as PolicyMode);
              setCopied(false);
            }}
            options={[
              {
                label: "Enforce",
                value: "enforce",
              },
              {
                label: "Report Only",
                value: "report-only",
              },
            ]}
          />

          <YoryantraSelect
            label="Output Format"
            value={outputFormat}
            onChange={(value) => {
              setOutputFormat(value as OutputFormat);
              setCopied(false);
            }}
            options={[
              {
                label: "HTTP Header",
                value: "header",
              },
              {
                label: "Meta Tag",
                value: "meta",
              },
              {
                label: "Nginx",
                value: "nginx",
              },
              {
                label: "Apache",
                value: "apache",
              },
              {
                label: "JSON",
                value: "json",
              },
            ]}
          />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              checked={upgradeInsecureRequests}
              onChange={(event) => {
                setUpgradeInsecureRequests(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Upgrade insecure requests
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Add upgrade-insecure-requests to ask browsers to upgrade HTTP
                subresources to HTTPS.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              checked={blockAllMixedContent}
              onChange={(event) => {
                setBlockAllMixedContent(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Block all mixed content
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Add block-all-mixed-content for older mixed-content blocking
                behavior.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Trusted Source Shortcuts
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Add common trusted source groups quickly, then review each directive
          below. Avoid broad sources unless your site truly needs them.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => addSourceGroup(analyticsSources)}
            className="yoryantra-btn-outline"
          >
            Add Analytics Sources
          </button>

          <button
            onClick={() => addSourceGroup(cdnSources)}
            className="yoryantra-btn-outline"
          >
            Add CDN / Fonts Sources
          </button>

          <button onClick={loadExample} className="yoryantra-btn-outline">
            Load Balanced Policy
          </button>

          <button onClick={resetAll} className="yoryantra-btn-outline">
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {directives.map((directive) => (
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
                  className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
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
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Custom sources for {directive.label}
                  </label>

                  <input
                    value={directive.custom}
                    onChange={(event) =>
                      updateCustomSource(directive.key, event.target.value)
                    }
                    placeholder="https://example.com https://cdn.example.com"
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                  />

                  <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    Add space-separated hosts, schemes, hashes, nonces, or CSP
                    keywords for this directive.
                  </p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Reporting Options
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Reporting endpoints help test policies safely. Report-only mode is
          usually better while discovering what your site needs.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              report-uri
            </label>

            <input
              value={reportUri}
              onChange={(event) => {
                setReportUri(event.target.value);
                setCopied(false);
              }}
              placeholder="https://example.com/csp-report"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              report-to
            </label>

            <input
              value={reportTo}
              onChange={(event) => {
                setReportTo(event.target.value);
                setCopied(false);
              }}
              placeholder="default"
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Policy review warnings
          </h3>

          <div className="mt-3 space-y-3">
            {warnings.map((warning) => (
              <div key={warning.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {warning.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {warning.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated CSP Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Generated Content Security Policy output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        CSP policy generation happens directly in your browser. Your sources,
        endpoints, and policy values are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building Content Security Policy Headers Safely
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Content Security Policy is a browser security layer that helps limit
            where scripts, styles, images, fonts, frames, and network requests can
            load from. A well-planned CSP can reduce the impact of cross-site
            scripting, injection bugs, unexpected third-party resources, and
            risky page embedding.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CSP Policy Builder gives you a practical way to assemble a
            policy directive by directive. You can start with a balanced preset,
            add trusted sources, generate report-only headers for testing, and
            copy output for HTTP headers, meta tags, Nginx, Apache, or JSON
            documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating a CSP Without Guessing Every Directive
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose a strict, balanced, or compatibility preset.</li>
            <li>Enable the directives your site needs.</li>
            <li>Add trusted sources for scripts, styles, images, fonts, and connections.</li>
            <li>Use report-only mode while testing on a live website.</li>
            <li>
              Copy the generated CSP output and review browser reports before
              enforcing the final policy.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CSP Policy Builder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating a first CSP header for a new website or app.</li>
            <li>Testing stricter CSP rules in report-only mode.</li>
            <li>Documenting approved third-party script, image, and API sources.</li>
            <li>Reducing risky inline scripts and broad wildcard permissions.</li>
            <li>Preparing Nginx or Apache header snippets for deployment.</li>
            <li>Reviewing CSP directives while debugging blocked browser resources.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Content Security Policy
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{samplePolicy}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Report-Only Mode Matters
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A strict CSP can accidentally block scripts, styles, API calls,
            images, analytics, payment widgets, or embedded content if the
            policy does not include the correct sources. Report-only mode lets
            browsers send violation reports without enforcing the policy.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            For production sites, it is safer to test in report-only mode, review
            browser console messages and reporting data, then gradually enforce a
            policy once you understand which sources are required.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a CSP policy?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Content Security Policy is a browser security policy that
                tells the browser which sources are allowed for scripts, styles,
                images, fonts, connections, frames, and other page resources.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I use enforce mode or report-only mode?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Use report-only mode while testing a new or changed CSP. Use
                enforce mode once you have reviewed violations and confirmed that
                important site features are not blocked.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is unsafe-inline recommended?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It is usually better to avoid unsafe-inline when possible. Some
                older sites need it temporarily, but nonces, hashes, and moving
                inline code into separate files are safer long-term options.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use a CSP meta tag?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A meta tag can work for some CSP directives, but HTTP headers are
                generally preferred and support more complete behavior. Use the
                meta output only when a header is not available.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate every browser behavior?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. It helps build a policy, but you should test the generated
                CSP in your browser, review console messages, and check your
                production monitoring before enforcing a strict policy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my sources uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The policy is built directly in your browser, and your source
                values are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/security-headers-checker" className="yoryantra-btn-outline">
              Security Headers Checker
            </Link>

            <Link href="/tools/http-status-code-checker" className="yoryantra-btn-outline">
              HTTP Status Code Checker
            </Link>

            <Link href="/tools/dns-lookup" className="yoryantra-btn-outline">
              DNS Lookup
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildPolicy({
  directives,
  reportUri,
  reportTo,
  upgradeInsecureRequests,
  blockAllMixedContent,
}: {
  directives: DirectiveConfig[];
  reportUri: string;
  reportTo: string;
  upgradeInsecureRequests: boolean;
  blockAllMixedContent: boolean;
}) {
  const parts: string[] = [];

  directives.forEach((directive) => {
    if (!directive.enabled) {
      return;
    }

    const customValues = directive.custom
      .split(/\s+/)
      .map((value) => value.trim())
      .filter(Boolean);

    const values = Array.from(new Set([...directive.values, ...customValues]));

    if (values.length === 0) {
      return;
    }

    parts.push(`${directive.key} ${values.join(" ")}`);
  });

  if (upgradeInsecureRequests) {
    parts.push("upgrade-insecure-requests");
  }

  if (blockAllMixedContent) {
    parts.push("block-all-mixed-content");
  }

  if (reportUri.trim()) {
    parts.push(`report-uri ${reportUri.trim()}`);
  }

  if (reportTo.trim()) {
    parts.push(`report-to ${reportTo.trim()}`);
  }

  return parts.join("; ");
}

function formatOutput({
  policy,
  policyMode,
  outputFormat,
}: {
  policy: string;
  policyMode: PolicyMode;
  outputFormat: OutputFormat;
}) {
  const headerName =
    policyMode === "report-only"
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";

  if (outputFormat === "meta") {
    return `<meta http-equiv="${headerName}" content="${escapeHtml(policy)}">`;
  }

  if (outputFormat === "nginx") {
    return `add_header ${headerName} "${escapeNginx(policy)}" always;`;
  }

  if (outputFormat === "apache") {
    return `Header always set ${headerName} "${escapeApache(policy)}"`;
  }

  if (outputFormat === "json") {
    return JSON.stringify(
      {
        header: headerName,
        value: policy,
      },
      null,
      2
    );
  }

  return `${headerName}: ${policy}`;
}

function getPolicyWarnings({
  directives,
  policyMode,
  reportUri,
  reportTo,
}: {
  directives: DirectiveConfig[];
  policyMode: PolicyMode;
  reportUri: string;
  reportTo: string;
}): CSPWarning[] {
  const warnings: CSPWarning[] = [];
  const enabledDirectives = directives.filter((directive) => directive.enabled);
  const allValues = enabledDirectives.flatMap((directive) => [
    ...directive.values,
    ...directive.custom.split(/\s+/).filter(Boolean),
  ]);

  if (allValues.includes("'unsafe-inline'")) {
    warnings.push({
      title: "unsafe-inline is enabled",
      message:
        "Inline scripts or styles reduce CSP protection. Prefer nonces, hashes, or external files where possible.",
    });
  }

  if (allValues.includes("'unsafe-eval'")) {
    warnings.push({
      title: "unsafe-eval is enabled",
      message:
        "unsafe-eval allows string-to-code execution and weakens protection against injection attacks.",
    });
  }

  if (allValues.includes("*")) {
    warnings.push({
      title: "Wildcard source detected",
      message:
        "Wildcard sources are broad. Use specific trusted hosts whenever possible.",
    });
  }

  if (!enabledDirectives.some((directive) => directive.key === "object-src")) {
    warnings.push({
      title: "object-src is missing",
      message:
        "Most modern sites should set object-src 'none' to block legacy plugin content.",
    });
  }

  if (!enabledDirectives.some((directive) => directive.key === "frame-ancestors")) {
    warnings.push({
      title: "frame-ancestors is missing",
      message:
        "frame-ancestors helps control which pages can embed your site and reduces clickjacking risk.",
    });
  }

  if (policyMode === "report-only" && !reportUri.trim() && !reportTo.trim()) {
    warnings.push({
      title: "Report-only mode has no endpoint",
      message:
        "Report-only mode is more useful when report-uri or report-to is configured.",
    });
  }

  return warnings;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeNginx(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeApache(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
