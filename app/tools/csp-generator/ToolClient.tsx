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
    useState("'self' 'unsafe-inline'");
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
      policies.push(`frame-src ${frameSrc}`);
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
    setStyleSrc("'self' 'unsafe-inline'");
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
              setDefaultSrc(e.target.value)
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
              setScriptSrc(e.target.value)
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
              setStyleSrc(e.target.value)
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
              setImgSrc(e.target.value)
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
              setConnectSrc(e.target.value)
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
              setFontSrc(e.target.value)
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
            setFrameSrc(e.target.value)
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

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This CSP Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CSP Generator helps you generate
            Content Security Policy headers instantly
            for websites, APIs, applications, and
            production deployments.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Content Security Policy helps improve web
            security by controlling which resources
            browsers are allowed to load.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CSP Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Configure CSP directives.</li>
            <li>Customize resource policies.</li>
            <li>Copy the generated CSP header.</li>
            <li>Use it in server or framework configuration.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Improving website security.</li>
            <li>Preventing XSS attacks.</li>
            <li>Securing production deployments.</li>
            <li>Controlling third-party resources.</li>
            <li>Hardening frontend applications.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CSP Directives
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>default-src:</strong>
                Fallback policy
              </li>

              <li>
                <strong>script-src:</strong>
                Allowed JavaScript sources
              </li>

              <li>
                <strong>style-src:</strong>
                Allowed CSS sources
              </li>

              <li>
                <strong>img-src:</strong>
                Allowed image sources
              </li>

              <li>
                <strong>connect-src:</strong>
                Allowed API connections
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
                Content Security Policy is a browser
                security feature that controls which
                resources websites are allowed to
                load.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is CSP important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CSP helps reduce security risks such
                as cross-site scripting (XSS) attacks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does 'self' mean in CSP?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                'self' allows resources from the same
                origin as the current website.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this generated on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. CSP header generation happens
                directly in your browser.
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
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
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