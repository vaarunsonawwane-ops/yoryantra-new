"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [defaultSrc, setDefaultSrc] =
    useState("'self'");

  const [scriptSrc, setScriptSrc] =
    useState("'self'");

  const [styleSrc, setStyleSrc] =
    useState(
      "'self' 'unsafe-inline'"
    );

  const [imgSrc, setImgSrc] =
    useState("'self' data:");

  const [connectSrc, setConnectSrc] =
    useState("'self'");

  const [fontSrc, setFontSrc] =
    useState("'self'");

  const [frameSrc, setFrameSrc] =
    useState("");

  const generatedCSP = useMemo(() => {
    const policies = [
      `default-src ${defaultSrc}`,
      `script-src ${scriptSrc}`,
      `style-src ${styleSrc}`,
      `img-src ${imgSrc}`,
      `connect-src ${connectSrc}`,
      `font-src ${fontSrc}`,
    ];

    if (frameSrc.trim()) {
      policies.push(
        `frame-src ${frameSrc}`
      );
    }

    return policies.join("; ");
  }, [
    defaultSrc,
    scriptSrc,
    styleSrc,
    imgSrc,
    connectSrc,
    fontSrc,
    frameSrc,
  ]);

  const resetAll = () => {
    setDefaultSrc("'self'");
    setScriptSrc("'self'");
    setStyleSrc(
      "'self' 'unsafe-inline'"
    );
    setImgSrc("'self' data:");
    setConnectSrc("'self'");
    setFontSrc("'self'");
    setFrameSrc("");
  };

  return (
    <ToolShell
      title="CSP Generator"
      description="Generate Content Security Policy headers instantly with this free online CSP Generator."
    >
      {/* GRID */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            default-src
          </label>

          <input
            type="text"
            value={defaultSrc}
            onChange={(e) =>
              setDefaultSrc(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            script-src
          </label>

          <input
            type="text"
            value={scriptSrc}
            onChange={(e) =>
              setScriptSrc(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            style-src
          </label>

          <input
            type="text"
            value={styleSrc}
            onChange={(e) =>
              setStyleSrc(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            img-src
          </label>

          <input
            type="text"
            value={imgSrc}
            onChange={(e) =>
              setImgSrc(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            connect-src
          </label>

          <input
            type="text"
            value={connectSrc}
            onChange={(e) =>
              setConnectSrc(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            font-src
          </label>

          <input
            type="text"
            value={fontSrc}
            onChange={(e) =>
              setFontSrc(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* FRAME SRC */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          frame-src
        </label>

        <input
          type="text"
          value={frameSrc}
          onChange={(e) =>
            setFrameSrc(
              e.target.value
            )
          }
          placeholder="https://youtube.com"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() =>
            navigator.clipboard.writeText(
              generatedCSP
            )
          }
          className="yoryantra-btn"
        >
          Copy CSP Header
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated CSP Header
          </h3>
        </div>

        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {generatedCSP}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          CSP header generation happens locally inside your browser. Your
          security policies, allowed domains, and configuration values are not
          uploaded, stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building Content Security Policy Headers Without Guesswork
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CSP generation helps developers create secure Content Security
            Policy headers for websites, APIs, frontend applications, SaaS
            platforms, dashboards, authentication systems, and production
            deployments.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Content Security Policy is a browser security mechanism that controls
            which resources websites are allowed to load. Proper CSP rules help
            reduce security risks such as cross-site scripting attacks,
            malicious third-party scripts, injected content, and unsafe browser
            behavior.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CSP Generator creates customizable Content Security Policy
            headers directly inside your browser without requiring backend
            processing or external security tools.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CSP Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Configure your CSP directives and allowed resource sources.
            </li>

            <li>
              Customize policies for scripts, styles, images, APIs, fonts, and
              frames.
            </li>

            <li>
              Copy the generated Content Security Policy header instantly.
            </li>

            <li>
              Add the generated CSP header to your server or framework
              configuration.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CSP Directives
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>default-src:</strong>{" "}
                Default fallback policy for all resource types.
              </li>

              <li>
                <strong>script-src:</strong>{" "}
                Allowed JavaScript sources and third-party scripts.
              </li>

              <li>
                <strong>style-src:</strong>{" "}
                Allowed CSS stylesheets and inline styles.
              </li>

              <li>
                <strong>img-src:</strong>{" "}
                Allowed image sources and CDN assets.
              </li>

              <li>
                <strong>connect-src:</strong>{" "}
                Allowed API endpoints and network requests.
              </li>

              <li>
                <strong>font-src:</strong>{" "}
                Allowed web font providers and font assets.
              </li>

              <li>
                <strong>frame-src:</strong>{" "}
                Allowed embedded iframes and external frame content.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Improving frontend website security.
            </li>

            <li>
              Preventing cross-site scripting attacks.
            </li>

            <li>
              Securing production deployments.
            </li>

            <li>
              Restricting third-party resource loading.
            </li>

            <li>
              Hardening Next.js and React applications.
            </li>

            <li>
              Creating CSP headers for APIs and dashboards.
            </li>

            <li>
              Managing allowed CDN and script domains.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Content Security Policy Header
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Content-Security-Policy:
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self';`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why CSP Headers Matter
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better security:</strong>{" "}
                Reduce browser-based attack surfaces.
              </li>

              <li>
                <strong>Safer scripts:</strong>{" "}
                Restrict unauthorized JavaScript execution.
              </li>

              <li>
                <strong>Cleaner deployments:</strong>{" "}
                Control third-party integrations more safely.
              </li>

              <li>
                <strong>Modern frontend protection:</strong>{" "}
                Improve website security posture for production systems.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Content Security Policy?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Content Security Policy is a browser security feature that
                controls which resources websites are allowed to load and
                execute.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are CSP headers important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CSP headers help reduce security risks such as cross-site
                scripting attacks, malicious scripts, and unauthorized resource
                loading.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does 'self' mean in CSP?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                'self' allows resources from the same origin as the current
                website.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for Next.js and React applications?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. CSP headers are commonly used to secure Next.js, React,
                frontend dashboards, APIs, and production web applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is CSP generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. CSP header generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            CSP generation often connects with frontend security, API security,
            authentication systems, HTTP header management, DevOps workflows,
            and secure production deployments.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/cors-header-checker"
              className="yoryantra-btn-outline"
            >
              CORS Header Checker
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>

            <Link
              href="/tools/hmac-generator"
              className="yoryantra-btn-outline"
            >
              HMAC Generator
            </Link>

            <Link
              href="/tools/rsa-key-generator"
              className="yoryantra-btn-outline"
            >
              RSA Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}