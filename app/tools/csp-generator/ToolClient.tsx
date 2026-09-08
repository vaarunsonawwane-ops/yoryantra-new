"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type DirectiveName =
  | "default-src"
  | "script-src"
  | "style-src"
  | "img-src"
  | "connect-src"
  | "font-src"
  | "frame-src"
  | "worker-src"
  | "media-src"
  | "object-src"
  | "base-uri"
  | "frame-ancestors"
  | "form-action";

type DirectiveEntry = readonly [DirectiveName, string];

type PolicyWarning = {
  directive: DirectiveName | "policy";
  message: string;
};

const QUOTED_KEYWORDS = [
  "self",
  "none",
  "unsafe-inline",
  "unsafe-eval",
  "strict-dynamic",
  "unsafe-hashes",
  "report-sample",
  "wasm-unsafe-eval",
];

function normalizeSourceList(value: string) {
  return value
    .replace(/[;\r\n]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function sourceTokens(value: string) {
  const normalized = normalizeSourceList(value);
  return normalized ? normalized.split(" ") : [];
}

function hasToken(value: string, token: string) {
  return sourceTokens(value).includes(token);
}

function looksLikeFullDirectiveToken(token: string) {
  return /^(?:default|script|style|img|connect|font|frame|worker|media|object|child|manifest)-src$/i.test(
    token
  ) || /^(?:base-uri|frame-ancestors|form-action|sandbox|upgrade-insecure-requests|block-all-mixed-content|report-uri|report-to)$/i.test(token);
}

export function buildCspPolicy(entries: DirectiveEntry[]) {
  const warnings: PolicyWarning[] = [];
  const normalizedEntries = entries.map(
    ([name, value]) => [name, normalizeSourceList(value)] as const
  );

  for (const [name, originalValue] of entries) {
    const normalized = normalizeSourceList(originalValue);
    const tokens = sourceTokens(originalValue);

    if (/[;\r\n]/.test(originalValue)) {
      warnings.push({
        directive: name,
        message:
          "Semicolons or line breaks were removed. Enter source expressions in this field, not a complete CSP directive.",
      });
    }

    if (tokens.some((token) => looksLikeFullDirectiveToken(token))) {
      warnings.push({
        directive: name,
        message:
          "A directive name appears inside the source list. Each field should contain only source expressions such as 'self', https://cdn.example.com, data:, a nonce, or a hash.",
      });
    }

    const noneIndex = tokens.indexOf("'none'");
    if (noneIndex !== -1 && tokens.length > 1) {
      warnings.push({
        directive: name,
        message:
          "'none' should stand alone. When it appears beside other source expressions, the policy no longer means “allow nothing” in the way the field suggests.",
      });
    }

    for (const keyword of QUOTED_KEYWORDS) {
      if (tokens.includes(keyword)) {
        warnings.push({
          directive: name,
          message: `${keyword} is a CSP keyword and needs single quotes: '${keyword}'.`,
        });
      }
    }

    if (tokens.includes("*")) {
      warnings.push({
        directive: name,
        message:
          "The * source is broad. Narrow it to the schemes, hosts, nonces, or hashes the page really needs.",
      });
    }

    if ((name === "script-src" || name === "default-src") && tokens.includes("'unsafe-inline'")) {
      warnings.push({
        directive: name,
        message:
          "'unsafe-inline' allows inline script in this effective script policy unless a stronger nonce/hash model changes how the browser interprets it. Prefer nonces or hashes for script.",
      });
    }

    if ((name === "script-src" || name === "default-src") && tokens.includes("'unsafe-eval'")) {
      warnings.push({
        directive: name,
        message:
          "'unsafe-eval' permits string-to-code execution such as eval() in the effective script policy and weakens protection against injected code.",
      });
    }

    if (name === "style-src" && tokens.includes("'unsafe-inline'")) {
      warnings.push({
        directive: name,
        message:
          "'unsafe-inline' allows inline style. Keep it only when the page genuinely depends on inline CSS and you have tested the trade-off.",
      });
    }

    if ((name === "script-src" || name === "default-src") && tokens.includes("data:")) {
      warnings.push({
        directive: name,
        message:
          "data: in a script source list is unusually permissive and is discouraged by CSP guidance because it can make script injection easier to exploit.",
      });
    }

    if (name === "object-src" && normalized && normalized !== "'none'") {
      warnings.push({
        directive: name,
        message:
          "object-src is broader than 'none'. Keep plugin-style content enabled only when the application still needs it.",
      });
    }

    if (name === "frame-ancestors" && tokens.includes("*")) {
      warnings.push({
        directive: name,
        message:
          "frame-ancestors * allows any matching ancestor to embed the page. Use 'none', 'self', or a narrow ancestor list when clickjacking protection matters.",
      });
    }

    if (name === "frame-ancestors") {
      const invalidAncestorTokens = tokens.filter((token) =>
        /^(?:data:|blob:|'unsafe-inline'|'unsafe-eval'|'strict-dynamic')$/i.test(token)
      );
      if (invalidAncestorTokens.length > 0) {
        warnings.push({
          directive: name,
          message: `These expressions do not belong in frame-ancestors: ${invalidAncestorTokens.join(", ")}.`,
        });
      }
    }

    if (tokens.some((token) => token.startsWith("'nonce-") && !/^'nonce-[A-Za-z0-9+/_-]+={0,2}'$/.test(token))) {
      warnings.push({
        directive: name,
        message:
          "A nonce source looks malformed. Nonces are quoted source expressions such as 'nonce-randomBase64Value'.",
      });
    }

    if (tokens.some((token) => /^'sha(?:256|384|512)-/i.test(token) && !/^'sha(?:256|384|512)-[A-Za-z0-9+/_-]+={0,2}'$/i.test(token))) {
      warnings.push({
        directive: name,
        message:
          "A hash source looks malformed. CSP hash sources use quoted sha256-, sha384-, or sha512- Base64 values.",
      });
    }
  }

  const valueOf = (name: DirectiveName) =>
    normalizedEntries.find(([entryName]) => entryName === name)?.[1] || "";

  if (!valueOf("default-src")) {
    warnings.push({
      directive: "default-src",
      message:
        "default-src is empty. Without it, resource types you did not configure here may have no fallback restriction.",
    });
  }

  if (!valueOf("object-src")) {
    warnings.push({
      directive: "object-src",
      message:
        "object-src is empty. object-src 'none' is a common hardening choice when plugin content is not required.",
    });
  }

  if (!valueOf("base-uri")) {
    warnings.push({
      directive: "base-uri",
      message:
        "base-uri is empty. It does not fall back to default-src, so an explicit restriction is usually easier to reason about.",
    });
  }

  if (!valueOf("frame-ancestors")) {
    warnings.push({
      directive: "frame-ancestors",
      message:
        "frame-ancestors is empty. It does not fall back to default-src and should be set explicitly when embedding must be controlled.",
    });
  }

  if (!valueOf("form-action")) {
    warnings.push({
      directive: "form-action",
      message:
        "form-action is empty. It does not fall back to default-src; add it if form submission destinations need an explicit boundary.",
    });
  }

  const policies = normalizedEntries
    .filter(([, value]) => Boolean(value))
    .map(([name, value]) => `${name} ${value}`);

  return {
    header: policies.length
      ? `Content-Security-Policy: ${policies.join("; ")};`
      : "",
    warnings,
  };
}

export default function ToolClient() {
  const [defaultSrc, setDefaultSrc] = useState("'self'");
  const [scriptSrc, setScriptSrc] = useState("'self'");
  const [styleSrc, setStyleSrc] = useState("'self'");
  const [imgSrc, setImgSrc] = useState("'self' data:");
  const [connectSrc, setConnectSrc] = useState("'self'");
  const [fontSrc, setFontSrc] = useState("'self'");
  const [frameSrc, setFrameSrc] = useState("");
  const [workerSrc, setWorkerSrc] = useState("");
  const [mediaSrc, setMediaSrc] = useState("");
  const [objectSrc, setObjectSrc] = useState("'none'");
  const [baseUri, setBaseUri] = useState("'self'");
  const [frameAncestors, setFrameAncestors] = useState("'none'");
  const [formAction, setFormAction] = useState("'self'");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const directiveEntries = useMemo<DirectiveEntry[]>(
    () => [
      ["default-src", defaultSrc],
      ["script-src", scriptSrc],
      ["style-src", styleSrc],
      ["img-src", imgSrc],
      ["connect-src", connectSrc],
      ["font-src", fontSrc],
      ["frame-src", frameSrc],
      ["worker-src", workerSrc],
      ["media-src", mediaSrc],
      ["object-src", objectSrc],
      ["base-uri", baseUri],
      ["frame-ancestors", frameAncestors],
      ["form-action", formAction],
    ],
    [
      defaultSrc,
      scriptSrc,
      styleSrc,
      imgSrc,
      connectSrc,
      fontSrc,
      frameSrc,
      workerSrc,
      mediaSrc,
      objectSrc,
      baseUri,
      frameAncestors,
      formAction,
    ]
  );

  const { header: generatedCSP, warnings } = useMemo(
    () => buildCspPolicy(directiveEntries),
    [directiveEntries]
  );

  const clearCopyState = () => {
    setCopied(false);
    setCopyError("");
  };

  const resetAll = () => {
    setDefaultSrc("'self'");
    setScriptSrc("'self'");
    setStyleSrc("'self'");
    setImgSrc("'self' data:");
    setConnectSrc("'self'");
    setFontSrc("'self'");
    setFrameSrc("");
    setWorkerSrc("");
    setMediaSrc("");
    setObjectSrc("'none'");
    setBaseUri("'self'");
    setFrameAncestors("'none'");
    setFormAction("'self'");
    clearCopyState();
  };

  const copyHeader = async () => {
    if (!generatedCSP) return;

    try {
      await navigator.clipboard.writeText(generatedCSP);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setCopyError(
        "The CSP header could not be copied. Select the generated header and copy it manually."
      );
    }
  };

  const fields: Array<{
    name: DirectiveName;
    value: string;
    setter: (value: string) => void;
    placeholder?: string;
    note?: string;
  }> = [
    {
      name: "default-src",
      value: defaultSrc,
      setter: setDefaultSrc,
      note: "Fallback for fetch directives you do not set explicitly.",
    },
    {
      name: "script-src",
      value: scriptSrc,
      setter: setScriptSrc,
      note: "Scripts, modules, inline-script permissions, nonces and hashes.",
    },
    {
      name: "style-src",
      value: styleSrc,
      setter: setStyleSrc,
      note: "Stylesheets and inline-style permissions.",
    },
    {
      name: "img-src",
      value: imgSrc,
      setter: setImgSrc,
      note: "Images, favicons and data/blob sources when needed.",
    },
    {
      name: "connect-src",
      value: connectSrc,
      setter: setConnectSrc,
      note: "fetch(), XHR, WebSocket and related connections.",
    },
    {
      name: "font-src",
      value: fontSrc,
      setter: setFontSrc,
      note: "Web-font sources.",
    },
    {
      name: "frame-src",
      value: frameSrc,
      setter: setFrameSrc,
      placeholder: "https://www.youtube.com",
      note: "Frames the page is allowed to load.",
    },
    {
      name: "worker-src",
      value: workerSrc,
      setter: setWorkerSrc,
      placeholder: "'self' blob:",
      note: "Dedicated, shared and service worker script origins.",
    },
    {
      name: "media-src",
      value: mediaSrc,
      setter: setMediaSrc,
      placeholder: "'self' https://media.example.com",
      note: "Audio and video sources.",
    },
    {
      name: "object-src",
      value: objectSrc,
      setter: setObjectSrc,
      note: "Plugin-style object/embed content; 'none' is a common baseline.",
    },
    {
      name: "base-uri",
      value: baseUri,
      setter: setBaseUri,
      note: "Where a document base URL may point; no default-src fallback.",
    },
    {
      name: "frame-ancestors",
      value: frameAncestors,
      setter: setFrameAncestors,
      note: "Who may embed this page; different from frame-src.",
    },
    {
      name: "form-action",
      value: formAction,
      setter: setFormAction,
      note: "Where forms may submit; no default-src fallback.",
    },
  ];

  return (
    <ToolShell
      title="CSP Generator"
      description="Build a CSP header from source lists and catch risky combinations before browser enforcement."
    >
      <div className="grid items-start gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className="self-start">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {field.name}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                field.setter(event.target.value);
                clearCopyState();
              }}
              placeholder={field.placeholder}
              spellCheck={false}
              className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{field.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={copyHeader}
          disabled={!generatedCSP}
          className="yoryantra-btn whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
        >
          {copied ? "Copied" : "Copy CSP Header"}
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
          Reset
        </button>
      </div>

      {copyError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {copyError}
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Generated CSP Header</h3>
        <div className="yoryantra-output min-h-[180px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {generatedCSP || "Add at least one directive to generate a Content-Security-Policy header."}
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Read these before enforcing the policy</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-800">
            {warnings.map((warning, index) => (
              <li key={`${warning.directive}-${index}`}>
                <strong>{warning.directive}:</strong> {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Policy generation stays in your browser. No CSP source list is sent to a server by this page for generation.
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Start narrow, then open only what the page really needs
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Content Security Policy gives the browser a resource-loading boundary. A strict starting point makes unexpected dependencies visible; widening one directive at a time is easier to reason about than beginning with broad wildcards and trying to tighten them later.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generated header is not a security verdict. CSP is defense in depth beside output encoding, safe DOM APIs, dependency hygiene and application authorization. It can reduce the impact of some injection bugs, but it cannot repair unsafe application code by itself.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A source list is not a place to paste another directive
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Each field accepts only the value that comes after a directive name. For example, enter <code>'self' https://cdn.example.com</code> in <code>script-src</code>, not <code>script-src 'self';</code>. Semicolons and line breaks are stripped to prevent one field from spilling into another, and the warning list calls out directive names that appear inside a source field.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Three directives that are often confused
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">frame-src</strong>
              <p className="mt-2">Controls frames that your page loads.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">frame-ancestors</strong>
              <p className="mt-2">Controls which parent pages may embed your page. It does not fall back to default-src and is ignored when CSP is delivered only through a meta element.</p>
            </div>
            <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong className="text-gray-900">form-action</strong>
              <p className="mt-2">Limits form submission targets. It also does not inherit a missing value from default-src.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nonces and hashes change the inline-script story
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A nonce or hash can authorize specific inline script without opening every inline script through <code>'unsafe-inline'</code>. A nonce must be unpredictable and newly generated for each response; a static nonce copied into a permanent policy defeats the point. Hash sources must match the exact bytes of the inline script or style the browser sees.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you use <code>'strict-dynamic'</code>, browser behavior around host allowlists and trusted script loading becomes more subtle. Treat that as an application design choice, not just another token to add to a list.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Report-Only catches breakage before enforcement
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            On an existing application, first sending the same policy as <code>Content-Security-Policy-Report-Only</code> can reveal blocked scripts, styles, frames and connections without immediately breaking the page. Reports can be noisy and browser coverage varies, so combine them with DevTools and real application testing before switching to enforcement.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What this builder deliberately leaves out
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            CSP Level 3 includes more directives than fit a focused source-list builder, including script-src-elem, script-src-attr, style-src-elem, style-src-attr, manifest-src, child-src, sandbox, reporting directives and source-less directives such as upgrade-insecure-requests. When one of those matters, add it deliberately in your server configuration rather than assuming default-src covers it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Read the specification when browser behavior is surprising
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The W3C Content Security Policy Level 3 specification defines directive fallback, source matching, inline checks and frame-ancestor behavior. MDN's CSP guide is a more approachable companion for deployment examples and nonce/hash patterns.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://www.w3.org/TR/CSP3/" target="_blank" rel="noreferrer">W3C — Content Security Policy Level 3</a>
            <span className="mx-2 text-gray-300">·</span>
            <a className="font-medium text-[var(--green)] underline-offset-4 hover:underline" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP" target="_blank" rel="noreferrer">MDN — Content Security Policy guide</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/csp-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
