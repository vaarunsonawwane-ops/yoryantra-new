"use client";

import { useState } from "react";
import Link from "next/link";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import ToolShell from "@/app/components/ToolShell";

type HeaderOptions = {
  hsts: boolean;
  hstsMaxAge: string;
  includeSubDomains: boolean;
  preload: boolean;
  frameOptions: string;
  contentTypeOptions: boolean;
  referrerPolicy: string;
  permissionsPolicy: boolean;
  csp: boolean;
  cspMode: "basic" | "strict";
};

const defaultOptions: HeaderOptions = {
  hsts: true,
  hstsMaxAge: "31536000",
  includeSubDomains: true,
  preload: false,
  frameOptions: "DENY",
  contentTypeOptions: true,
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: true,
  csp: true,
  cspMode: "basic",
};

export default function ToolClient() {
  const [options, setOptions] = useState<HeaderOptions>(defaultOptions);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generateHeaders = () => {
    if (options.hsts && !/^\d+$/.test(options.hstsMaxAge.trim())) {
      setError("HSTS max-age should be a number in seconds.");
      setOutput("");
      return;
    }

    const headers = buildSecurityHeaders(options);

    setOutput(formatHeaders(headers));
    setError("");
  };

  const resetAll = () => {
    setOptions(defaultOptions);
    setOutput("");
    setError("");
  };

  const updateOption = <K extends keyof HeaderOptions>(
    key: K,
    value: HeaderOptions[K]
  ) => {
    setOptions((current) => ({
      ...current,
      [key]: value,
    }));
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Security Header Generator"
      description="Generate HTTP security headers, review recommended values, and prepare header snippets for websites and web apps."
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Header Options
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={options.hsts}
                onChange={(event) => updateOption("hsts", event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-gray-900">
                  Strict-Transport-Security
                </span>
                <span className="mt-1 block text-gray-500">
                  Tell browsers to use HTTPS for future requests.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={options.contentTypeOptions}
                onChange={(event) =>
                  updateOption("contentTypeOptions", event.target.checked)
                }
                className="mt-1"
              />
              <span>
                <span className="font-medium text-gray-900">
                  X-Content-Type-Options
                </span>
                <span className="mt-1 block text-gray-500">
                  Reduce MIME type sniffing with nosniff.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={options.permissionsPolicy}
                onChange={(event) =>
                  updateOption("permissionsPolicy", event.target.checked)
                }
                className="mt-1"
              />
              <span>
                <span className="font-medium text-gray-900">
                  Permissions-Policy
                </span>
                <span className="mt-1 block text-gray-500">
                  Restrict powerful browser features by default.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={options.csp}
                onChange={(event) => updateOption("csp", event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-gray-900">
                  Content-Security-Policy
                </span>
                <span className="mt-1 block text-gray-500">
                  Add a starter CSP for common source restrictions.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              HSTS max-age
            </label>

            <input
              value={options.hstsMaxAge}
              onChange={(event) => updateOption("hstsMaxAge", event.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
            />

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeSubDomains}
                  onChange={(event) =>
                    updateOption("includeSubDomains", event.target.checked)
                  }
                />
                includeSubDomains
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.preload}
                  onChange={(event) =>
                    updateOption("preload", event.target.checked)
                  }
                />
                preload
              </label>
            </div>
          </div>

          <div>
            <YoryantraSelect
              label="X-Frame-Options"
              value={options.frameOptions}
              onChange={(value) => updateOption("frameOptions", value)}
              options={[
                { label: "DENY", value: "DENY" },
                { label: "SAMEORIGIN", value: "SAMEORIGIN" },
                { label: "Do not include", value: "" },
              ]}
            />
          </div>

          <div>
            <YoryantraSelect
              label="Referrer-Policy"
              value={options.referrerPolicy}
              onChange={(value) => updateOption("referrerPolicy", value)}
              options={[
                {
                  label: "strict-origin-when-cross-origin",
                  value: "strict-origin-when-cross-origin",
                },
                { label: "no-referrer", value: "no-referrer" },
                { label: "same-origin", value: "same-origin" },
                { label: "strict-origin", value: "strict-origin" },
                { label: "Do not include", value: "" },
              ]}
            />
          </div>

          <div>
            <YoryantraSelect
              label="CSP mode"
              value={options.cspMode}
              onChange={(value) =>
                updateOption("cspMode", value as "basic" | "strict")
              }
              options={[
                { label: "Basic website starter", value: "basic" },
                { label: "Stricter starter", value: "strict" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateHeaders} className="yoryantra-btn">
          Generate Headers
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

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Security Headers
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Generated HTTP security headers will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Test security headers carefully before production. Some policies can
        block scripts, styles, frames, images, fonts, or third-party services.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating HTTP Security Headers for Safer Websites
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP security headers help browsers handle pages more safely. They
            can reduce MIME sniffing, unwanted framing, weak referrer sharing,
            risky permissions, and some script or resource loading problems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Security Header Generator helps you prepare common HTTP
            security headers such as Strict-Transport-Security,
            X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
            Permissions-Policy, and Content-Security-Policy directly in your
            browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preparing Header Values Before Server Configuration
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Select the security headers you want to generate.</li>
            <li>Adjust HSTS, referrer, frame, and CSP options.</li>
            <li>
              Click <strong>Generate Headers</strong>.
            </li>
            <li>Copy the output and test it with your server or hosting setup.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Security Header Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Preparing starter security headers for a website.</li>
            <li>Creating HTTPS-only HSTS header values.</li>
            <li>Reducing MIME sniffing with X-Content-Type-Options.</li>
            <li>Controlling framing with X-Frame-Options or frame-ancestors.</li>
            <li>Generating a basic CSP before using a stricter policy.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Security Header Output
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a security header generator do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A security header generator prepares common HTTP security
                headers that can be added to a server, CDN, reverse proxy, or
                hosting platform configuration.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can security headers break a website?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Strict CSP, permissions, or framing rules can block real
                scripts, styles, images, embeds, or API calls. Always test
                headers before using them in production.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I use HSTS preload immediately?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HSTS preload should be used carefully. Make sure HTTPS works
                correctly across the domain and subdomains before enabling
                preload.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Header generation happens directly in your browser. Your
                settings and generated headers are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/security-headers-scanner"
              className="yoryantra-btn-outline"
            >
              Security Headers Scanner
            </Link>

            <Link
              href="/tools/csp-analyzer"
              className="yoryantra-btn-outline"
            >
              CSP Analyzer
            </Link>

            <Link
              href="/tools/csp-generator"
              className="yoryantra-btn-outline"
            >
              CSP Generator
            </Link>

            <Link
              href="/tools/http-headers-checker"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildSecurityHeaders(options: HeaderOptions) {
  const headers: Array<{ name: string; value: string }> = [];

  if (options.hsts) {
    const parts = [`max-age=${options.hstsMaxAge.trim()}`];

    if (options.includeSubDomains) {
      parts.push("includeSubDomains");
    }

    if (options.preload) {
      parts.push("preload");
    }

    headers.push({
      name: "Strict-Transport-Security",
      value: parts.join("; "),
    });
  }

  if (options.contentTypeOptions) {
    headers.push({
      name: "X-Content-Type-Options",
      value: "nosniff",
    });
  }

  if (options.frameOptions) {
    headers.push({
      name: "X-Frame-Options",
      value: options.frameOptions,
    });
  }

  if (options.referrerPolicy) {
    headers.push({
      name: "Referrer-Policy",
      value: options.referrerPolicy,
    });
  }

  if (options.permissionsPolicy) {
    headers.push({
      name: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    });
  }

  if (options.csp) {
    headers.push({
      name: "Content-Security-Policy",
      value:
        options.cspMode === "strict"
          ? "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
          : "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
    });
  }

  return headers;
}

function formatHeaders(headers: Array<{ name: string; value: string }>) {
  if (!headers.length) {
    return "No security headers selected.";
  }

  return headers.map((header) => `${header.name}: ${header.value}`).join("\n");
}
