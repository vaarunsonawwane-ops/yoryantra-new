"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type CspMode =
  | "balanced"
  | "strict"
  | "report-first";

type CoopMode =
  | ""
  | "same-origin"
  | "same-origin-allow-popups"
  | "unsafe-none";

type CorpMode =
  | ""
  | "same-origin"
  | "same-site"
  | "cross-origin";

type HeaderOptions = {
  hsts: boolean;
  hstsMaxAge: string;
  includeSubDomains: boolean;
  preload: boolean;
  contentTypeOptions: boolean;
  frameOptions: "" | "DENY" | "SAMEORIGIN";
  referrerPolicy: string;
  permissionsPolicy: boolean;
  csp: boolean;
  cspMode: CspMode;
  coop: CoopMode;
  corp: CorpMode;
};

type HeaderLine = {
  name: string;
  value: string;
};

type BuildResult = {
  headers: HeaderLine[];
  output: string;
  warnings: string[];
  notes: string[];
};

const DEFAULT_OPTIONS: HeaderOptions = {
  hsts: true,
  hstsMaxAge: "31536000",
  includeSubDomains: true,
  preload: false,
  contentTypeOptions: true,
  frameOptions: "DENY",
  referrerPolicy:
    "strict-origin-when-cross-origin",
  permissionsPolicy: true,
  csp: true,
  cspMode: "balanced",
  coop: "",
  corp: "",
};

function positiveInteger(
  value: string,
  label: string
) {
  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) {
    throw new Error(
      `${label} must contain only whole-number seconds.`
    );
  }

  const parsed = Number(trimmed);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 0
  ) {
    throw new Error(
      `${label} must be a non-negative safe integer.`
    );
  }

  return parsed;
}

function buildCsp(
  mode: CspMode
) {
  if (mode === "strict") {
    return [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; ") + ";";
  }

  if (mode === "report-first") {
    return [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; ") + ";";
  }

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join("; ") + ";";
}

function buildSecurityHeaders(
  options: HeaderOptions
): BuildResult {
  const warnings: string[] = [];
  const notes: string[] = [];
  const headers: HeaderLine[] = [];

  if (options.hsts) {
    const maxAge = positiveInteger(
      options.hstsMaxAge,
      "HSTS max-age"
    );
    const parts = [
      `max-age=${maxAge}`,
    ];

    if (
      options.includeSubDomains
    ) {
      parts.push(
        "includeSubDomains"
      );
    }

    if (options.preload) {
      parts.push("preload");

      if (
        maxAge < 31536000
      ) {
        warnings.push(
          "HSTS preload is selected with max-age below 31,536,000 seconds. Major preload-list requirements expect at least one year."
        );
      }

      if (
        !options.includeSubDomains
      ) {
        warnings.push(
          "HSTS preload is selected without includeSubDomains. Major preload-list requirements expect includeSubDomains."
        );
      }

      notes.push(
        "The preload token alone does not place a domain on a browser preload list. Preloading is a separate submission and long-term HTTPS commitment."
      );
    }

    if (maxAge === 0) {
      warnings.push(
        "HSTS max-age=0 tells supporting browsers to remove the host's cached HSTS policy rather than strengthen it."
      );
    } else if (
      maxAge < 86400
    ) {
      notes.push(
        "The HSTS lifetime is less than one day. Short lifetimes can be useful during staged rollout, but they provide only brief persistence."
      );
    }

    headers.push({
      name:
        "Strict-Transport-Security",
      value: parts.join("; "),
    });

    notes.push(
      "Strict-Transport-Security is meaningful only when delivered over HTTPS. Browsers ignore HSTS received over plain HTTP."
    );
  }

  if (
    options.contentTypeOptions
  ) {
    headers.push({
      name:
        "X-Content-Type-Options",
      value: "nosniff",
    });
  }

  if (options.frameOptions) {
    headers.push({
      name: "X-Frame-Options",
      value:
        options.frameOptions,
    });
  }

  if (
    options.referrerPolicy
  ) {
    headers.push({
      name: "Referrer-Policy",
      value:
        options.referrerPolicy,
    });
  }

  if (
    options.permissionsPolicy
  ) {
    headers.push({
      name:
        "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=()",
    });

    notes.push(
      "Permissions-Policy feature support evolves by browser. Keep only directives relevant to the capabilities your site actually uses."
    );
  }

  if (options.csp) {
    const cspValue =
      buildCsp(
        options.cspMode
      );
    const headerName =
      options.cspMode ===
      "report-first"
        ? "Content-Security-Policy-Report-Only"
        : "Content-Security-Policy";

    headers.push({
      name: headerName,
      value: cspValue,
    });

    if (
      options.cspMode ===
      "report-first"
    ) {
      warnings.push(
        "The Report-Only starter is non-enforcing and does not include a reporting endpoint. Add an appropriate Reporting-Endpoints/report-to (and compatibility reporting where needed) if you expect violation reports to be delivered."
      );
    }

    if (
      options.cspMode ===
        "balanced" ||
      options.cspMode ===
        "report-first"
    ) {
      warnings.push(
        "The selected CSP starter contains style-src 'unsafe-inline' for compatibility. Replace it with hashes, nonces, or external styles when your application can support a stricter policy."
      );
    }

    if (
      options.cspMode ===
      "strict"
    ) {
      warnings.push(
        "The strict CSP starter blocks inline scripts and inline styles and restricts network/resource origins to the listed sources. It can break real applications until required origins, hashes, or nonces are added."
      );
    }

    if (
      options.frameOptions
    ) {
      notes.push(
        "The generated CSP includes frame-ancestors 'none'. In modern CSP-aware browsers, an enforced frame-ancestors directive takes precedence over X-Frame-Options; keeping X-Frame-Options can still help older clients."
      );
    }
  } else if (
    !options.frameOptions
  ) {
    notes.push(
      "No framing control is selected. If the page must not be embedded, configure CSP frame-ancestors and/or X-Frame-Options deliberately."
    );
  }

  if (options.coop) {
    headers.push({
      name:
        "Cross-Origin-Opener-Policy",
      value: options.coop,
    });

    if (
      options.coop ===
      "same-origin"
    ) {
      warnings.push(
        "Cross-Origin-Opener-Policy: same-origin can break opener relationships and workflows that rely on cross-origin popups, including some authentication/payment flows."
      );
    }
  }

  if (options.corp) {
    headers.push({
      name:
        "Cross-Origin-Resource-Policy",
      value: options.corp,
    });

    if (
      options.corp ===
        "same-origin"
    ) {
      warnings.push(
        "Cross-Origin-Resource-Policy: same-origin can block other origins from loading this resource in no-cors contexts. Use it only when the resource really is origin-private."
      );
    }
  }

  if (!headers.length) {
    warnings.push(
      "No headers are selected. The output will be empty."
    );
  }

  notes.push(
    "Security headers complement application security; they do not repair vulnerable authorization, unsafe server-side code, leaked secrets, or insecure dependencies."
  );

  const output = headers
    .map(
      (header) =>
        `${header.name}: ${header.value}`
    )
    .join("\n");

  return {
    headers,
    output,
    warnings,
    notes,
  };
}

export default function ToolClient() {
  const [options, setOptions] =
    useState<HeaderOptions>(
      DEFAULT_OPTIONS
    );
  const [result, setResult] =
    useState<BuildResult | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const updateOption = <
    K extends keyof HeaderOptions
  >(
    key: K,
    value: HeaderOptions[K]
  ) => {
    setOptions((current) => ({
      ...current,
      [key]: value,
    }));
    setResult(null);
    setError("");
    setCopied(false);
  };

  const generateHeaders = () => {
    try {
      setResult(
        buildSecurityHeaders(
          options
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate these security headers."
      );
      setCopied(false);
    }
  };

  const resetAll = () => {
    setOptions(
      DEFAULT_OPTIONS
    );
    setResult(null);
    setError("");
    setCopied(false);
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
        "The generated header block could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Security Header Generator"
      description="Build a deliberate browser-security header starter and review the commitments and breakage risks behind HSTS, CSP, framing, MIME handling, referrer policy, feature permissions, and cross-origin isolation controls."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Core browser-security policies
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ToggleCard
            checked={options.hsts}
            onChange={(checked) =>
              updateOption(
                "hsts",
                checked
              )
            }
            title="Strict-Transport-Security"
            text="Persist an HTTPS-only policy in supporting browsers after a secure response is received."
          />

          <ToggleCard
            checked={
              options.contentTypeOptions
            }
            onChange={(checked) =>
              updateOption(
                "contentTypeOptions",
                checked
              )
            }
            title="X-Content-Type-Options"
            text="Send nosniff so browsers rely more strictly on declared MIME types in protected destinations."
          />

          <ToggleCard
            checked={
              options.permissionsPolicy
            }
            onChange={(checked) =>
              updateOption(
                "permissionsPolicy",
                checked
              )
            }
            title="Permissions-Policy"
            text="Disable camera, microphone, geolocation, and payment features by default in this starter."
          />

          <ToggleCard
            checked={options.csp}
            onChange={(checked) =>
              updateOption(
                "csp",
                checked
              )
            }
            title="Content-Security-Policy"
            text="Restrict script, style, image, font, connection, object, form, base, and framing behavior."
          />
        </div>
      </div>

      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="font-semibold text-gray-900">
            HSTS rollout
          </h3>

          <label className="mt-4 block text-sm font-medium text-gray-700">
            max-age in seconds
          </label>
          <input
            value={
              options.hstsMaxAge
            }
            onChange={(event: {
              target: {
                value: string;
              };
            }) =>
              updateOption(
                "hstsMaxAge",
                event.target.value
              )
            }
            disabled={
              !options.hsts
            }
            spellCheck={false}
            className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)] disabled:bg-gray-100"
          />

          <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-gray-700">
            <input
              type="checkbox"
              checked={
                options.includeSubDomains
              }
              onChange={(event: {
                target: {
                  checked: boolean;
                };
              }) =>
                updateOption(
                  "includeSubDomains",
                  event.target.checked
                )
              }
              disabled={
                !options.hsts
              }
              className="mt-1"
            />
            <span>
              <strong>
                includeSubDomains
              </strong>{" "}
              extends the HSTS policy to subdomains. Confirm every covered
              subdomain can stay on HTTPS.
            </span>
          </label>

          <label className="mt-3 flex items-start gap-3 text-sm leading-relaxed text-gray-700">
            <input
              type="checkbox"
              checked={
                options.preload
              }
              onChange={(event: {
                target: {
                  checked: boolean;
                };
              }) =>
                updateOption(
                  "preload",
                  event.target.checked
                )
              }
              disabled={
                !options.hsts
              }
              className="mt-1"
            />
            <span>
              <strong>
                preload token
              </strong>{" "}
              expresses preload intent; it does not submit the site to any
              browser preload list.
            </span>
          </label>
        </div>

        <div className="space-y-5">
          <YoryantraSelect
            label="X-Frame-Options"
            value={
              options.frameOptions
            }
            onChange={(value: string) =>
              updateOption(
                "frameOptions",
                value as
                  | ""
                  | "DENY"
                  | "SAMEORIGIN"
              )
            }
            options={[
              {
                label: "DENY",
                value: "DENY",
              },
              {
                label:
                  "SAMEORIGIN",
                value:
                  "SAMEORIGIN",
              },
              {
                label:
                  "Do not include",
                value: "",
              },
            ]}
          />

          <YoryantraSelect
            label="Referrer-Policy"
            value={
              options.referrerPolicy
            }
            onChange={(value: string) =>
              updateOption(
                "referrerPolicy",
                value
              )
            }
            options={[
              {
                label:
                  "strict-origin-when-cross-origin",
                value:
                  "strict-origin-when-cross-origin",
              },
              {
                label:
                  "no-referrer",
                value:
                  "no-referrer",
              },
              {
                label:
                  "same-origin",
                value:
                  "same-origin",
              },
              {
                label:
                  "strict-origin",
                value:
                  "strict-origin",
              },
              {
                label:
                  "origin",
                value: "origin",
              },
              {
                label:
                  "Do not include",
                value: "",
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-7 grid gap-6 md:grid-cols-3">
        <YoryantraSelect
          label="CSP starter"
          value={options.cspMode}
          onChange={(value: string) =>
            updateOption(
              "cspMode",
              value as CspMode
            )
          }
          options={[
            {
              label:
                "Balanced compatibility",
              value:
                "balanced",
            },
            {
              label:
                "Strict self-only",
              value: "strict",
            },
            {
              label:
                "Report-Only non-enforcing starter",
              value:
                "report-first",
            },
          ]}
        />

        <YoryantraSelect
          label="Cross-Origin-Opener-Policy"
          value={options.coop}
          onChange={(value: string) =>
            updateOption(
              "coop",
              value as CoopMode
            )
          }
          options={[
            {
              label:
                "Do not include",
              value: "",
            },
            {
              label:
                "same-origin",
              value:
                "same-origin",
            },
            {
              label:
                "same-origin-allow-popups",
              value:
                "same-origin-allow-popups",
            },
            {
              label:
                "unsafe-none",
              value:
                "unsafe-none",
            },
          ]}
        />

        <YoryantraSelect
          label="Cross-Origin-Resource-Policy"
          value={options.corp}
          onChange={(value: string) =>
            updateOption(
              "corp",
              value as CorpMode
            )
          }
          options={[
            {
              label:
                "Do not include",
              value: "",
            },
            {
              label:
                "same-origin",
              value:
                "same-origin",
            },
            {
              label:
                "same-site",
              value:
                "same-site",
            },
            {
              label:
                "cross-origin",
              value:
                "cross-origin",
            },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={
            generateHeaders
          }
          className="yoryantra-btn"
        >
          Generate Headers
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
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="Headers"
              value={String(
                result.headers.length
              )}
            />
            <Stat
              label="Warnings"
              value={String(
                result.warnings
                  .length
              )}
            />
            <Stat
              label="Review notes"
              value={String(
                result.notes.length
              )}
            />
          </div>

          {result.warnings.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Review before deployment:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {result.warnings.map(
                  (
                    warning,
                    index
                  ) => (
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
                  Generated HTTP response headers
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Copy the field lines into the response-header configuration
                  format used by your server, CDN, reverse proxy, or platform.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  copyOutput
                }
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[300px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {result.output ||
                "No headers selected."}
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
        <pre className="yoryantra-output mt-8 min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Generated security headers and deployment warnings will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Header generation runs on your selected options in the browser. The
        tool does not scan your live website, fetch existing headers, or test
        whether your application still works under the generated policies.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this generation operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Security Headers Are Browser Instructions, Not a Security Score
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A response header can change what the browser is willing to load,
            expose, frame, send, or remember. That can remove useful attack
            surface, but the header does not know whether your authorization
            checks are correct, your dependencies are patched, your sessions
            are protected, or your backend trusts unsafe input.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This generator therefore produces policy starters and explains the
            commitments behind them. It does not award a fake “A+” because six
            familiar header names are present.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            HSTS Is Easy to Add and Potentially Expensive to Undo
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Once a browser receives a valid HSTS policy over HTTPS, future
            navigation to that host is upgraded to HTTPS for the policy
            lifetime. With <code>includeSubDomains</code>, covered subdomains
            inherit the HTTPS-only rule. That is useful only when every
            affected host can remain reachable securely.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A preload commitment is stronger because participating browsers can
            know the rule before the user&apos;s first visit. The{" "}
            <code>preload</code> token is not defined by RFC 6797 itself and
            does not submit a domain anywhere. Browser preload lists have their
            own operational requirements and removal delays.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            CSP Usually Fails in Production Because the Real Dependency Graph Was Never Mapped
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A modern page can load JavaScript, CSS, fonts, images, workers,
            frames, API connections, analytics, maps, payment scripts, video
            embeds and dynamically generated resources from several origins.
            A CSP that mentions only <code>'self'</code> can therefore be
            syntactically valid and operationally destructive.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Start from the resources the page genuinely needs. Use Report-Only
            during rollout when appropriate, inspect violations, reduce broad
            source expressions, and move inline executable content toward
            nonces or hashes. Do not “fix” every violation by adding{" "}
            <code>*</code> or <code>'unsafe-inline'</code>; that can erase the
            protection you were trying to deploy.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            frame-ancestors and X-Frame-Options Overlap, but They Are Not the Same Mechanism
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            CSP&apos;s <code>frame-ancestors</code> controls which ancestors may
            embed the response in frames or related embedding contexts.{" "}
            <code>X-Frame-Options: DENY</code> and{" "}
            <code>SAMEORIGIN</code> are older framing controls.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            CSP Level 3 specifies that an enforced{" "}
            <code>frame-ancestors</code> directive takes precedence over
            X-Frame-Options in conforming user agents. Keeping both can still
            be a compatibility decision, but they should express the same
            intent rather than contradict each other.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            nosniff Helps Only When Content-Type Is Correct
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>X-Content-Type-Options: nosniff</code> tells browsers not to
            reinterpret certain response bodies as another MIME type. That is
            useful when the server already sends accurate Content-Type values.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If your server labels JavaScript, styles, fonts, images, downloads,
            or API data incorrectly, nosniff can expose the mistake by causing
            the browser to reject the resource. Fix the MIME type rather than
            removing the security header to hide the problem.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Referrer-Policy Is a Data-Minimization Decision
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Referrer information can help analytics and debugging, but full
            URLs can also reveal path or query information to another origin.
            <code>strict-origin-when-cross-origin</code> keeps more detail on
            same-origin navigation and generally sends only the origin on
            secure cross-origin requests, with stricter behavior on downgrade.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>no-referrer</code> is more private but removes useful
            attribution entirely. Choose based on what the site needs rather
            than treating one directive as universally “most secure.”
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Permissions-Policy Can Break Features That Work Perfectly in Development
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A policy such as <code>camera=()</code> disables that capability
            for the document and relevant descendants. That is excellent for a
            site that never uses a camera and incorrect for a QR scanner,
            identity-verification flow, video meeting or document-upload
            feature that needs it.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Start from the features the page genuinely uses. Feature names and
            browser support also evolve, so verify the current behavior of each
            directive you deploy rather than maintaining a giant copied policy
            forever.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            COOP and CORP Solve Cross-Origin Isolation Problems That Ordinary “Security Header Lists” Often Ignore
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cross-Origin-Opener-Policy can isolate a top-level browsing context
            from cross-origin opener relationships. Cross-Origin-Resource-Policy
            lets a resource state which origins may load it in certain
            no-CORS contexts. They can be important for isolation and resource
            protection, but they can also disrupt federated login, payment
            popups, shared resources, image/CDN use, or integration windows.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            They are opt-in here for that reason. A generator should not
            silently add isolation headers to every website simply because the
            names appear on a checklist.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          The most useful references for this generator are the{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc6797"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            HSTS specification (RFC 6797)
          </a>
          , the current{" "}
          <a
            href="https://www.w3.org/TR/CSP/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            Content Security Policy specification
          </a>
          , and MDN&apos;s individual HTTP-header references when checking
          current browser support and deployment details.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/security-header-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function ToggleCard({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
  title: string;
  text: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: {
          target: {
            checked: boolean;
          };
        }) =>
          onChange(
            event.target.checked
          )
        }
        className="mt-1"
      />
      <span>
        <span className="font-semibold text-gray-900">
          {title}
        </span>
        <span className="mt-1 block leading-relaxed text-gray-500">
          {text}
        </span>
      </span>
    </label>
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
