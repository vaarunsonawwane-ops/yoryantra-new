"use client";

import { useMemo, useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type HeaderResult = {
  name: string;
  label: string;
  value: string | null;
  status: "visible" | "not-visible";
  relevance: "Common" | "Situational";
  purpose: string;
  suggestion: string;
};

const securityHeaderRules = [
  {
    name: "content-security-policy",
    label: "Content-Security-Policy",
    relevance: "Common" as const,
    purpose:
      "Restricts where supported page resources can load from and can reduce the impact of some injection attacks when the policy is designed correctly.",
    suggestion:
      "Build a policy around the resources your site actually uses. Test with Content-Security-Policy-Report-Only before enforcing major changes.",
  },
  {
    name: "strict-transport-security",
    label: "Strict-Transport-Security",
    relevance: "Common" as const,
    purpose:
      "Tells supporting browsers to use HTTPS for future requests to the host after a valid HTTPS response has been received.",
    suggestion:
      "Enable HSTS only after HTTPS works reliably for the intended hostnames. Review max-age, includeSubDomains, and preload separately.",
  },
  {
    name: "x-frame-options",
    label: "X-Frame-Options",
    relevance: "Common" as const,
    purpose:
      "Limits whether a page can be embedded in a frame, which can help reduce clickjacking exposure.",
    suggestion:
      "Use DENY or SAMEORIGIN where suitable, and review the CSP frame-ancestors directive for modern framing control.",
  },
  {
    name: "x-content-type-options",
    label: "X-Content-Type-Options",
    relevance: "Common" as const,
    purpose:
      "The nosniff value tells browsers not to reinterpret certain responses as a different MIME type.",
    suggestion:
      "Use X-Content-Type-Options: nosniff where it matches your response handling, and send correct Content-Type values.",
  },
  {
    name: "referrer-policy",
    label: "Referrer-Policy",
    relevance: "Common" as const,
    purpose:
      "Controls how much referrer information the browser sends with supported navigations and requests.",
    suggestion:
      "Choose a policy that matches your privacy, analytics, and application requirements rather than copying a value blindly.",
  },
  {
    name: "permissions-policy",
    label: "Permissions-Policy",
    relevance: "Situational" as const,
    purpose:
      "Controls access to selected browser features such as camera, microphone, geolocation, and fullscreen.",
    suggestion:
      "Restrict features the site does not need, but test embedded content and required browser APIs before deployment.",
  },
  {
    name: "cross-origin-opener-policy",
    label: "Cross-Origin-Opener-Policy",
    relevance: "Situational" as const,
    purpose:
      "Controls browsing-context isolation and is often considered when an application needs cross-origin isolation.",
    suggestion:
      "Use only when the application needs the related isolation behaviour. Test popups, authentication flows, and third-party integrations.",
  },
  {
    name: "cross-origin-embedder-policy",
    label: "Cross-Origin-Embedder-Policy",
    relevance: "Situational" as const,
    purpose:
      "Requires compatible cross-origin resource loading rules when stronger document isolation is needed.",
    suggestion:
      "Test carefully because COEP can block third-party resources that do not send compatible headers.",
  },
  {
    name: "cross-origin-resource-policy",
    label: "Cross-Origin-Resource-Policy",
    relevance: "Situational" as const,
    purpose:
      "Lets a resource state which origins may load it in supported cross-origin contexts.",
    suggestion:
      "Choose same-origin, same-site, or cross-origin according to how the resource is intended to be used.",
  },
];

export default function ToolClient() {
  const [url, setUrl] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [results, setResults] = useState<HeaderResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const activeController = useRef<AbortController | null>(null);

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error("Please enter a website URL.");
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

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs are supported.");
    }

    return parsed.toString();
  };

  const scanHeaders = async () => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;

    setLoading(true);
    setError("");
    setStatusCode("");
    setFinalUrl("");
    setResults([]);

    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      const targetUrl = normalizeUrl(url);
      const response = await fetch(targetUrl, {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      const scannedResults: HeaderResult[] = securityHeaderRules.map((rule) => {
        const value = response.headers.get(rule.name);

        return {
          ...rule,
          value,
          status: value ? "visible" as const : "not-visible" as const,
        };
      });

      setStatusCode(
        `${response.status}${response.statusText ? ` ${response.statusText}` : ""}`
      );
      setFinalUrl(response.url || targetUrl);
      setResults(scannedResults);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (activeController.current === controller) {
          setError("The browser request timed out after 12 seconds.");
        }
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to inspect this URL from the browser."
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

  const resetAll = () => {
    activeController.current?.abort();
    activeController.current = null;
    setUrl("");
    setStatusCode("");
    setFinalUrl("");
    setResults([]);
    setError("");
    setLoading(false);
  };

  const summary = useMemo(() => {
    const visible = results.filter((result) => result.status === "visible").length;

    return {
      visible,
      notVisible: results.length - visible,
      total: results.length,
    };
  }, [results]);

  const copyResults = async () => {
    if (!results.length) {
      return;
    }

    const output = [
      statusCode ? `Status: ${statusCode}` : "",
      finalUrl ? `Final URL: ${finalUrl}` : "",
      "",
      "Important: Not visible does not prove that a header is missing. CORS and Access-Control-Expose-Headers can hide response headers from browser JavaScript.",
      "",
      ...results.map((result) =>
        [
          `${result.label}: ${result.status === "visible" ? "Visible" : "Not visible to this browser request"}`,
          result.value ? `Value: ${result.value}` : "",
          `Relevance: ${result.relevance}`,
          `Purpose: ${result.purpose}`,
          `Review: ${result.suggestion}`,
        ]
          .filter(Boolean)
          .join("\n")
      ),
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(output);
    } catch {
      setError("The results could not be copied. Copy them manually from the page.");
    }
  };

  const hasResults = results.length > 0;

  return (
    <ToolShell
      title="Security Headers Scanner"
      description="Review security-related response headers that the browser is allowed to expose for a URL. CORS rules can limit or hide results."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Website URL
        </label>

        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={scanHeaders} disabled={loading} className="yoryantra-btn">
          {loading ? "Scanning..." : "Scan Security Headers"}
        </button>

        <button
          onClick={copyResults}
          disabled={!hasResults}
          className="yoryantra-btn-outline"
        >
          Copy Results
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Security Header Results
        </h3>

        {hasResults ? (
          <div className="yoryantra-output">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard label="Visible" value={`${summary.visible} / ${summary.total}`} />
                <SummaryCard label="Not visible" value={String(summary.notVisible)} />
                <SummaryCard label="Final status" value={statusCode || "Not available"} />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Final URL
                </p>
                <p className="mt-2 break-words text-sm text-gray-700">
                  {finalUrl || "Not available"}
                </p>
              </div>

              <div className="grid gap-4">
                {results.map((result) => (
                  <div key={result.name} className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{result.label}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          {result.purpose}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={
                          result.status === "visible"
                            ? "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                            : "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                        }>
                          {result.status === "visible" ? "Visible" : "Not visible"}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {result.relevance}
                        </span>
                      </div>
                    </div>

                    {result.value && (
                      <pre className="mt-4 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
                        {result.value}
                      </pre>
                    )}

                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      <strong className="text-gray-900">Review:</strong>{" "}
                      {result.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
            Browser-visible security header results will appear here after scanning a URL.
          </pre>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser Visibility Limitation
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          A browser cannot reliably inspect every response header on another origin.
          CORS and Access-Control-Expose-Headers decide which headers JavaScript can
          read. Therefore, “Not visible” does not prove that a header is missing.
          Use a server-side scanner or your browser network panel for a complete check.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reviewing Security-Related Response Headers
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Security-related HTTP headers tell supporting browsers how to handle
            framing, transport, content loading, referrer data, browser features,
            and selected cross-origin behaviour. Their usefulness depends on the
            page, application, and exact header value.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This scanner performs a browser request and reports only the headers
            exposed to JavaScript. It is useful for a quick first look, but it is
            not proof that a hidden header is absent or that a visible policy is correct.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use This Scanner</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter an HTTP or HTTPS URL.</li>
            <li>Run the browser-based scan.</li>
            <li>Review visible values and the final response URL.</li>
            <li>Treat “Not visible” as an inconclusive result, not as “Missing.”</li>
            <li>Confirm the complete response with server-side tools or browser developer tools.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the Results Can and Cannot Confirm</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>A visible value confirms that this browser request could read that header.</li>
            <li>A hidden value may still exist on the response.</li>
            <li>Header presence does not prove that the value is secure or suitable.</li>
            <li>Some headers are situational and should not be added to every site.</li>
            <li>This scan does not test application logic, authentication, dependencies, or infrastructure.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq
              question="Why does a header show as not visible?"
              answer="The browser may hide it because the target response does not expose that header through CORS. Not visible is different from missing."
            />
            <Faq
              question="Does every website need every listed header?"
              answer="No. CSP, HSTS, framing controls, permissions rules, and cross-origin isolation headers have different purposes and deployment requirements."
            />
            <Faq
              question="Does finding a CSP header mean the policy is safe?"
              answer="No. A CSP can be present but too broad, broken, or unsuitable for the page. Review the directives and test the application."
            />
            <Faq
              question="Is this a complete website security audit?"
              answer="No. It is a limited browser-visible header review. A security audit also covers application behaviour, access control, dependencies, infrastructure, monitoring, and testing."
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/security-headers-scanner" />
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{question}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{answer}</p>
    </div>
  );
}
