"use client";

import { useMemo, useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type InputMode = "paste" | "browser";
type ResultStatus = "present" | "absent" | "visible" | "not-visible";

type HeaderRule = {
  name: string;
  label: string;
  relevance: "Often considered" | "Situational";
  purpose: string;
  guidance: string;
};

type HeaderResult = HeaderRule & {
  value: string | null;
  status: ResultStatus;
  assessment: string | null;
};

const securityHeaderRules: HeaderRule[] = [
  {
    name: "content-security-policy",
    label: "Content-Security-Policy",
    relevance: "Often considered",
    purpose:
      "Restricts supported resource loading and other document behavior according to the policy's directives.",
    guidance:
      "Read the directives themselves; presence alone says nothing about whether the policy is narrow, compatible, or effective.",
  },
  {
    name: "content-security-policy-report-only",
    label: "Content-Security-Policy-Report-Only",
    relevance: "Situational",
    purpose:
      "Observes CSP violations without enforcing the policy, which is useful while testing a change.",
    guidance:
      "Treat report-only as telemetry, not protection. Confirm reporting endpoints and inspect the violations that actually arrive.",
  },
  {
    name: "strict-transport-security",
    label: "Strict-Transport-Security",
    relevance: "Often considered",
    purpose:
      "Tells supporting browsers to use HTTPS for future requests after receiving the header over a valid HTTPS connection.",
    guidance:
      "Check max-age carefully before adding includeSubDomains or preload; those choices can affect more hosts than the current page.",
  },
  {
    name: "x-frame-options",
    label: "X-Frame-Options",
    relevance: "Often considered",
    purpose:
      "Provides legacy framing control with DENY or SAMEORIGIN on supporting browsers.",
    guidance:
      "For modern framing rules, compare this value with CSP frame-ancestors rather than treating the two headers as independent guarantees.",
  },
  {
    name: "x-content-type-options",
    label: "X-Content-Type-Options",
    relevance: "Often considered",
    purpose:
      "The nosniff value tells browsers not to reinterpret selected response MIME types.",
    guidance:
      "Send the correct Content-Type as well; nosniff does not repair a wrong media type.",
  },
  {
    name: "referrer-policy",
    label: "Referrer-Policy",
    relevance: "Often considered",
    purpose:
      "Controls how much referrer information supporting browsers send with navigations and requests.",
    guidance:
      "Choose the policy around privacy, analytics, and cross-origin navigation requirements rather than copying a value from another site.",
  },
  {
    name: "permissions-policy",
    label: "Permissions-Policy",
    relevance: "Situational",
    purpose:
      "Controls access to selected browser features for the document and, where applicable, embedded content.",
    guidance:
      "Feature names and allowlists should match the APIs and frames the application really uses.",
  },
  {
    name: "cross-origin-opener-policy",
    label: "Cross-Origin-Opener-Policy",
    relevance: "Situational",
    purpose:
      "Controls browsing-context isolation between the document and cross-origin windows.",
    guidance:
      "Test popup, authentication, payment, and third-party window flows before tightening COOP.",
  },
  {
    name: "cross-origin-embedder-policy",
    label: "Cross-Origin-Embedder-Policy",
    relevance: "Situational",
    purpose:
      "Controls whether cross-origin resources need compatible CORS or CORP permission before the document can embed them.",
    guidance:
      "COEP can break third-party resources that do not opt in, so test every required dependency.",
  },
  {
    name: "cross-origin-resource-policy",
    label: "Cross-Origin-Resource-Policy",
    relevance: "Situational",
    purpose:
      "Lets a resource limit which sites may include it in supported cross-origin contexts.",
    guidance:
      "Choose same-origin, same-site, or cross-origin according to how that particular resource is meant to be consumed.",
  },
];

const sampleHeaders = `HTTP/2 200
content-type: text/html; charset=utf-8
content-security-policy: default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'
strict-transport-security: max-age=31536000; includeSubDomains
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
cross-origin-opener-policy: same-origin`;

export default function ToolClient() {
  const [mode, setMode] = useState<InputMode>("paste");
  const [headerInput, setHeaderInput] = useState("");
  const [url, setUrl] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [results, setResults] = useState<HeaderResult[]>([]);
  const [resultSource, setResultSource] = useState<InputMode | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const activeController = useRef<AbortController | null>(null);

  const summary = useMemo(() => {
    const positive = results.filter(
      (result) => result.status === "present" || result.status === "visible"
    ).length;

    return {
      positive,
      other: results.length - positive,
      total: results.length,
    };
  }, [results]);

  const clearResults = () => {
    setResults([]);
    setResultSource(null);
    setStatusCode("");
    setFinalUrl("");
    setError("");
    setCopied(false);
  };

  const switchMode = (nextMode: InputMode) => {
    activeController.current?.abort();
    activeController.current = null;
    setLoading(false);
    setMode(nextMode);
    clearResults();
  };

  const inspectPastedHeaders = () => {
    if (!headerInput.trim()) {
      setError("Paste response headers copied from DevTools, curl, or another HTTP client.");
      setResults([]);
      setResultSource(null);
      return;
    }

    try {
      const parsed = parseHeaderBlock(headerInput);
      setStatusCode(parsed.statusLine);
      setFinalUrl("");
      setResults(analyzeHeaderMap(parsed.headers, "paste"));
      setResultSource("paste");
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to read the pasted response headers."
      );
      setResults([]);
      setResultSource(null);
      setCopied(false);
    }
  };

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error("Enter a website URL for the browser check.");
    }

    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    let parsed: URL;

    try {
      parsed = new URL(candidate);
    } catch {
      throw new Error("Enter a valid HTTP or HTTPS URL.");
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Only HTTP and HTTPS URLs are supported.");
    }

    return parsed.toString();
  };

  const scanFromBrowser = async () => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;

    setLoading(true);
    setError("");
    setStatusCode("");
    setFinalUrl("");
    setResults([]);
    setResultSource(null);
    setCopied(false);

    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      const targetUrl = normalizeUrl(url);
      const response = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      const headerMap = new Map<string, string[]>();
      response.headers.forEach((value, name) => {
        headerMap.set(name.toLowerCase(), [value]);
      });

      setStatusCode(
        `${response.status}${response.statusText ? ` ${response.statusText}` : ""}`
      );
      setFinalUrl(response.url || targetUrl);
      setResults(analyzeHeaderMap(headerMap, "browser"));
      setResultSource("browser");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        if (activeController.current === controller) {
          setError("The browser request timed out after 12 seconds.");
        }
      } else {
        setError(
          "The browser could not complete a readable CORS request to that URL. This can be caused by CORS, DNS, TLS, network policy, extensions, or the target itself. Paste response headers for a reliable presence check."
        );
      }
    } finally {
      window.clearTimeout(timeoutId);

      if (activeController.current === controller) {
        activeController.current = null;
        setLoading(false);
      }
    }
  };

  const loadExample = () => {
    setMode("paste");
    setHeaderInput(sampleHeaders);
    setUrl("");
    clearResults();
  };

  const resetAll = () => {
    activeController.current?.abort();
    activeController.current = null;
    setHeaderInput("");
    setUrl("");
    setStatusCode("");
    setFinalUrl("");
    setResults([]);
    setResultSource(null);
    setError("");
    setLoading(false);
    setCopied(false);
    setMode("paste");
  };

  const copyResults = async () => {
    if (!results.length || !resultSource) return;

    const sourceLine =
      resultSource === "paste"
        ? "Source: pasted response headers"
        : "Source: browser CORS request";

    const output = [
      "Security header review",
      sourceLine,
      statusCode ? `Status: ${statusCode}` : "",
      finalUrl ? `Final URL: ${finalUrl}` : "",
      resultSource === "browser"
        ? "Important: Not visible does not prove that a header is absent. Browser JavaScript can read only CORS-exposed response headers."
        : "",
      "",
      ...results.map((result) =>
        [
          `${result.label}: ${statusLabel(result.status)}`,
          result.value ? `Value: ${result.value}` : "",
          `Context: ${result.relevance}`,
          `Purpose: ${result.purpose}`,
          result.assessment ? `Value note: ${result.assessment}` : "",
          `Next check: ${result.guidance}`,
        ]
          .filter(Boolean)
          .join("\n")
      ),
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The results could not be copied. Select and copy them manually.");
    }
  };

  const hasResults = results.length > 0;
  const positiveLabel =
    resultSource === "browser" ? "Visible" : "Present in paste";
  const otherLabel =
    resultSource === "browser" ? "Not visible" : "Not present in paste";

  return (
    <ToolShell
      title="Security Headers Scanner"
      description="Inspect pasted response headers reliably, with an optional browser URL check when CORS exposes the values."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose a Header Source
        </h3>

        <div
          className="mt-4 grid gap-4 sm:grid-cols-2"
          role="group"
          aria-label="Header input method"
        >
          <HeaderSourceButton
            active={mode === "paste"}
            title="Paste Response Headers"
            description="Inspect headers copied from DevTools, curl, or another HTTP client."
            onClick={() => switchMode("paste")}
          />

          <HeaderSourceButton
            active={mode === "browser"}
            title="Browser URL Check"
            description="Try a direct browser request when CORS exposes the response headers."
            onClick={() => switchMode("browser")}
          />
        </div>
      </div>

      {mode === "paste" ? (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Response header block
          </label>
          <textarea
            value={headerInput}
            onChange={(event) => {
              setHeaderInput(event.target.value);
              clearResults();
            }}
            placeholder={sampleHeaders}
            className="w-full min-h-[270px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Copy headers from the browser Network panel, curl -I, a reverse
            proxy, or another HTTP client. This path does not make a network
            request.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Website URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              clearResults();
            }}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            This sends a real GET request directly from your browser without
            cookies or a referrer. Cross-origin responses usually expose only a
            limited header set to JavaScript.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {mode === "paste" ? (
          <button
            onClick={inspectPastedHeaders}
            className="yoryantra-btn whitespace-nowrap"
          >
            Inspect Headers
          </button>
        ) : (
          <button
            onClick={scanFromBrowser}
            disabled={loading}
            className="yoryantra-btn whitespace-nowrap"
          >
            {loading ? "Checking..." : "Try Browser Check"}
          </button>
        )}

        {mode === "paste" && (
          <button
            onClick={loadExample}
            className="yoryantra-btn-outline whitespace-nowrap"
          >
            Load Example
          </button>
        )}

        <button
          onClick={copyResults}
          disabled={!hasResults}
          className="yoryantra-btn-outline whitespace-nowrap"
        >
          {copied ? "Copied" : "Copy Results"}
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

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Header review
        </h3>

        {hasResults ? (
          <div className="yoryantra-output">
            <div className="space-y-5">
              <div className="grid items-start gap-4 md:grid-cols-3">
                <SummaryCard
                  label={positiveLabel}
                  value={`${summary.positive} / ${summary.total}`}
                />
                <SummaryCard label={otherLabel} value={String(summary.other)} />
                <SummaryCard
                  label={resultSource === "browser" ? "HTTP status" : "Status line"}
                  value={statusCode || "Not supplied"}
                />
              </div>

              {finalUrl && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Final URL
                  </p>
                  <p className="mt-2 break-words text-sm text-gray-700">
                    {finalUrl}
                  </p>
                </div>
              )}

              <div className="grid gap-4">
                {results.map((result) => (
                  <div
                    key={result.name}
                    className="rounded-xl border border-gray-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h4 className="break-words font-semibold text-gray-900">
                          {result.label}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          {result.purpose}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <span
                          className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${
                            result.status === "present" ||
                            result.status === "visible"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusLabel(result.status)}
                        </span>
                        <span className="self-start rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {result.relevance}
                        </span>
                      </div>
                    </div>

                    {result.value && (
                      <pre className="mt-4 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">
                        {result.value}
                      </pre>
                    )}

                    {result.assessment && (
                      <div className="mt-4 self-start rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800">
                        {result.assessment}
                      </div>
                    )}

                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      <strong className="text-gray-900">Next check:</strong>{" "}
                      {result.guidance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
            Header presence and value notes will appear here.
          </pre>
        )}
      </div>

      {mode === "browser" && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            A browser URL check cannot prove a header is missing
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            CORS controls whether JavaScript can read a cross-origin response,
            and Access-Control-Expose-Headers controls many non-safelisted
            response headers. “Not visible” therefore means only that this page
            could not read the header. Paste the actual response headers when
            presence or absence matters.
          </p>
        </div>
      )}

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Paste headers when you need an answer about presence
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Security headers such as CSP, HSTS, framing controls, referrer
            policy, Permissions Policy, and cross-origin isolation headers are
            ordinary HTTP response fields. If you already have the response
            block from DevTools or curl, parsing that text avoids CORS ambiguity
            and lets the page say whether a header is actually present in what
            you pasted.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The URL check has a browser-shaped blind spot
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A browser is intentionally not a general-purpose raw HTTP client.
            Cross-origin fetches can fail entirely, and successful CORS
            responses still expose only headers the Fetch rules allow script to
            read. That is why the URL mode uses “visible” instead of “present.”
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Presence is not the same as a sound value
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A CSP header can exist and still allow risky sources. HSTS can be
            present with max-age=0, which disables the policy. X-Frame-Options
            can contain an unsupported value, and nosniff only has the intended
            effect when Content-Type is correct. The value notes here catch a
            few obvious cases without pretending to replace header-specific
            testing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Not every listed header belongs on every response
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            COOP and COEP can alter window relationships and resource loading.
            CORP is about how a resource may be included by other sites.
            Permissions Policy depends on browser features the page actually
            uses. Their absence is therefore shown neutrally rather than as a
            red failure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What leaves the browser
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Pasted headers are parsed locally and are not sent to a Yoryantra
            server by this page. URL mode makes a direct GET request from your
            browser to the URL you enter with credentials omitted and no
            referrer. Avoid URL mode for endpoints where even a GET request can
            change state.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            References for the two different questions here
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The{" "}
            <a
              href="https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              OWASP HTTP Security Response Headers Cheat Sheet
            </a>{" "}
            explains why individual security headers are deployed. The{" "}
            <a
              href="https://fetch.spec.whatwg.org/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              WHATWG Fetch Standard
            </a>{" "}
            defines the CORS and response-header exposure rules that limit the
            browser URL check.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/security-headers-scanner" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function HeaderSourceButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`self-start rounded-xl border border-gray-200 bg-white p-4 text-left transition ${
        active
          ? "shadow-sm ring-2 ring-[var(--green)]"
          : "hover:border-[var(--green)]"
      }`}
    >
      <span className="block text-sm font-semibold text-gray-900">{title}</span>
      <span className="mt-1 block text-sm leading-relaxed text-gray-500">
        {description}
      </span>
    </button>
  );
}

function parseHeaderBlock(input: string) {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const unfolded: string[] = [];

  lines.forEach((line) => {
    if (/^[ \t]/.test(line) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += ` ${line.trim()}`;
    } else {
      unfolded.push(line.replace(/[ \\t]+$/, ""));
    }
  });

  let statusLine = "";
  const headers = new Map<string, string[]>();

  unfolded.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (/^HTTP\/\d(?:\.\d)?\s+\d{3}\b/i.test(trimmed)) {
      statusLine = trimmed;
      return;
    }

    const separator = trimmed.indexOf(":");
    if (separator <= 0) return;

    const name = trimmed.slice(0, separator).trim().toLowerCase();
    const value = trimmed.slice(separator + 1).trim();

    if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name)) {
      return;
    }

    const existing = headers.get(name) || [];
    existing.push(value);
    headers.set(name, existing);
  });

  if (headers.size === 0) {
    throw new Error(
      "No HTTP response headers were found. Paste lines in the form Header-Name: value."
    );
  }

  return { headers, statusLine };
}

function analyzeHeaderMap(
  headers: Map<string, string[]>,
  source: InputMode
): HeaderResult[] {
  return securityHeaderRules.map((rule) => {
    const values = headers.get(rule.name);
    const value = values?.length ? values.join("\n") : null;

    return {
      ...rule,
      value,
      status: value
        ? source === "paste"
          ? "present"
          : "visible"
        : source === "paste"
          ? "absent"
          : "not-visible",
      assessment: value ? assessHeaderValue(rule.name, value) : null,
    };
  });
}

function assessHeaderValue(name: string, value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "The header is present but its value is empty.";
  }

  if (name === "strict-transport-security") {
    const match = trimmed.match(/(?:^|;)\s*max-age\s*=\s*(\d+)/i);
    if (!match) {
      return "No valid max-age directive was found. HSTS requires max-age.";
    }
    if (match[1] === "0") {
      return "max-age=0 tells the browser to stop applying HSTS for this host.";
    }
  }

  if (name === "x-frame-options") {
    const normalized = trimmed.toUpperCase();
    if (normalized === "ALLOW-FROM" || normalized.startsWith("ALLOW-FROM ")) {
      return "ALLOW-FROM is obsolete and is not supported by modern browsers. Prefer CSP frame-ancestors for origin-specific framing rules.";
    }
    if (normalized !== "DENY" && normalized !== "SAMEORIGIN") {
      return "Modern X-Frame-Options handling expects DENY or SAMEORIGIN. Check this value and compare it with CSP frame-ancestors.";
    }
  }

  if (
    name === "x-content-type-options" &&
    trimmed.toLowerCase() !== "nosniff"
  ) {
    return "The defined X-Content-Type-Options value is nosniff; another value will not provide that behavior.";
  }

  if (
    name === "content-security-policy-report-only" &&
    !/\breport-(?:to|uri)\b/i.test(trimmed)
  ) {
    return "The report-only policy has no report-to or report-uri directive. Console violations can still appear, but no CSP reporting endpoint is named here.";
  }

  if (
    name === "content-security-policy" &&
    /(?:^|;)\s*script-src[^;]*'unsafe-eval'/i.test(trimmed)
  ) {
    return "script-src contains 'unsafe-eval', which enables string-to-code evaluation APIs that tighter CSPs block.";
  }

  return null;
}

function statusLabel(status: ResultStatus) {
  if (status === "present") return "Present";
  if (status === "absent") return "Not present";
  if (status === "visible") return "Visible";
  return "Not visible";
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
