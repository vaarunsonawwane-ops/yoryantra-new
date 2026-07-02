"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

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

  const [objectSrc, setObjectSrc] =
    useState("'none'");

  const [baseUri, setBaseUri] =
    useState("'self'");

  const [frameAncestors, setFrameAncestors] =
    useState("'none'");

  const [formAction, setFormAction] =
    useState("'self'");

  const { generatedCSP, warnings } = useMemo(() => {
    const normalizeSources = (value: string) =>
      value
        .replace(/[;\r\n]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");

    const directiveEntries = [
      ["default-src", defaultSrc],
      ["script-src", scriptSrc],
      ["style-src", styleSrc],
      ["img-src", imgSrc],
      ["connect-src", connectSrc],
      ["font-src", fontSrc],
      ["frame-src", frameSrc],
      ["object-src", objectSrc],
      ["base-uri", baseUri],
      ["frame-ancestors", frameAncestors],
      ["form-action", formAction],
    ] as const;

    const policies = directiveEntries
      .map(([name, value]) => [name, normalizeSources(value)] as const)
      .filter(([, value]) => Boolean(value))
      .map(([name, value]) => `${name} ${value}`);

    const policyValue = policies.length
      ? `${policies.join("; ")};`
      : "";

    const warningItems: string[] = [];
    const normalizedScript = normalizeSources(scriptSrc);
    const normalizedStyle = normalizeSources(styleSrc);

    if (!normalizeSources(defaultSrc)) {
      warningItems.push(
        "default-src is empty. Add a fallback policy unless every resource type is covered separately."
      );
    }

    if (normalizedScript.includes("'unsafe-inline'")) {
      warningItems.push(
        "script-src contains 'unsafe-inline'. Prefer nonces or hashes for inline scripts."
      );
    }

    if (normalizedScript.includes("'unsafe-eval'")) {
      warningItems.push(
        "script-src contains 'unsafe-eval', which weakens protection against injected code."
      );
    }

    if (normalizedStyle.includes("'unsafe-inline'")) {
      warningItems.push(
        "style-src contains 'unsafe-inline'. Confirm that inline styles are required."
      );
    }

    if (
      directiveEntries.some(([, value]) =>
        normalizeSources(value).split(" ").includes("*")
      )
    ) {
      warningItems.push(
        "A wildcard source allows resources from any matching origin. Narrow it where possible."
      );
    }

    if (!normalizeSources(objectSrc)) {
      warningItems.push(
        "object-src is empty. Setting object-src 'none' is a common hardening step when plugins are not needed."
      );
    }

    if (!normalizeSources(baseUri)) {
      warningItems.push(
        "base-uri is empty. Restricting it can reduce abuse of injected base elements."
      );
    }

    if (!normalizeSources(frameAncestors)) {
      warningItems.push(
        "frame-ancestors is empty. Add it when you need to control which sites may embed the page."
      );
    }

    return {
      generatedCSP: policyValue
        ? `Content-Security-Policy: ${policyValue}`
        : "",
      warnings: warningItems,
    };
  }, [
    defaultSrc,
    scriptSrc,
    styleSrc,
    imgSrc,
    connectSrc,
    fontSrc,
    frameSrc,
    objectSrc,
    baseUri,
    frameAncestors,
    formAction,
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
    setObjectSrc("'none'");
    setBaseUri("'self'");
    setFrameAncestors("'none'");
    setFormAction("'self'");
  };

  return (
    <ToolShell
      title="CSP Generator"
      description="Build a Content-Security-Policy header with common directives, cleaned source values, and warnings for risky settings."
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

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            object-src
          </label>
          <input
            type="text"
            value={objectSrc}
            onChange={(e) => setObjectSrc(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            base-uri
          </label>
          <input
            type="text"
            value={baseUri}
            onChange={(e) => setBaseUri(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            frame-ancestors
          </label>
          <input
            type="text"
            value={frameAncestors}
            onChange={(e) => setFrameAncestors(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            form-action
          </label>
          <input
            type="text"
            value={formAction}
            onChange={(e) => setFormAction(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(generatedCSP)}
          disabled={!generatedCSP}
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

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold text-yellow-900">
            Review Before Deployment
          </h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-yellow-800">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          CSP generation happens locally inside your browser. The generated
          policy is a starting point, not proof of a secure deployment. Test it
          with Content-Security-Policy-Report-Only first where practical, inspect
          violations, and confirm every required resource still works.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building Content Security Policy Headers Without Guesswork
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A Content Security Policy tells supporting browsers which resource
            locations may be used by a page. A carefully tested policy can reduce
            the impact of some injection attacks and unwanted resource loading.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CSP is defense in depth. It does not replace output encoding, safe
            DOM handling, dependency updates, authentication controls, or other
            application security work. An overly broad or untested policy can
            provide little protection or break legitimate features.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This generator covers common fetch directives and several document
            directives. It normalizes extra whitespace and highlights a few risky
            values, but it cannot understand every resource or runtime behaviour
            in your application.
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
              Review any warnings and copy the generated header.
            </li>

            <li>
              Test with Report-Only where practical before enforcing it in
              production.
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
                Allowed sources for frames loaded by the page. This differs from
                frame-ancestors, which controls who may embed your page.
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
              Building and testing a browser resource-loading policy.
            </li>

            <li>
              Reducing the impact of some script-injection attacks.
            </li>

            <li>
              Reviewing a policy before production enforcement.
            </li>

            <li>
              Restricting third-party resource loading.
            </li>

            <li>
              Restricting resource sources in Next.js and React applications.
            </li>

            <li>
              Creating CSP headers for web applications and dashboards.
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
{`Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';`}
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
                <strong>Resource control:</strong>{" "}
                Limit where supported browsers may load content from.
              </li>

              <li>
                <strong>Script restrictions:</strong>{" "}
                Limit approved script sources and inline execution patterns.
              </li>

              <li>
                <strong>Third-party review:</strong>{" "}
                Make external script, style, image, and frame sources explicit.
              </li>

              <li>
                <strong>Report-Only testing:</strong>{" "}
                Find policy violations before switching to enforcement.
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
                A well-designed CSP can reduce the impact of some cross-site
                scripting and resource-injection attacks. It is an additional
                browser control, not a complete security solution.
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
                Yes. CSP headers are commonly used with Next.js, React, frontend
                dashboards, and other browser-delivered web applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I use Report-Only first?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                For an existing site, Report-Only can help reveal blocked
                resources before enforcement. Review reports carefully because
                report collection and browser coverage vary.
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

          <YoryantraRelatedTools currentHref="/tools/csp-generator" />
        </div>
      </section>
    </ToolShell>
  );
}