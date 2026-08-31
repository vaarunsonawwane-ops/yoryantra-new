"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type RedirectHop = {
  requestUrl: string;
  status: number;
  reason: string;
  location: string;
  nextUrl: string;
};

type RedirectAnalysis = {
  hops: RedirectHop[];
  finalStatus: number | null;
  finalUrl: string;
  diagnostics: string[];
};

const sampleTrace = `HTTP/1.1 301 Moved Permanently
location: /docs

HTTP/2 302 Found
location: https://www.example.com/docs/

HTTP/2 200 OK
content-type: text/html`;

export default function ToolClient() {
  const [startUrl, setStartUrl] = useState("https://example.com");
  const [trace, setTrace] = useState("");
  const [analysis, setAnalysis] = useState<RedirectAnalysis | null>(null);
  const [error, setError] = useState("");

  const curlCommand = useMemo(() => {
    const normalized = normalizeHttpUrl(startUrl);
    if (!normalized) return "";
    return `curl -sS -D - -o /dev/null -L --max-redirs 20 ${shellQuote(normalized)}`;
  }, [startUrl]);

  const analyze = () => {
    const normalized = normalizeHttpUrl(startUrl);

    if (!normalized) {
      setError("Enter an absolute HTTP or HTTPS starting URL.");
      setAnalysis(null);
      return;
    }

    if (!trace.trim()) {
      setError("Paste the response-header trace produced by curl or another HTTP client.");
      setAnalysis(null);
      return;
    }

    try {
      setAnalysis(analyzeRedirectTrace(normalized, trace));
      setError("");
    } catch (err) {
      setAnalysis(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze this redirect trace."
      );
    }
  };

  const loadExample = () => {
    setStartUrl("https://example.com");
    setTrace(sampleTrace);
    setAnalysis(null);
    setError("");
  };

  const resetAll = () => {
    setStartUrl("");
    setTrace("");
    setAnalysis(null);
    setError("");
  };

  const copyReport = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(formatRedirectReport(analysis));
  };

  return (
    <ToolShell
      title="Redirect Chain Checker"
      description="Analyze complete redirect traces from HTTP response headers, resolve relative Location values, and detect loops, protocol downgrades, and unnecessary hops."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Starting URL
        </label>
        <input
          type="url"
          value={startUrl}
          onChange={(event) => setStartUrl(event.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Redirect response headers
        </label>
        <textarea
          value={trace}
          onChange={(event) => setTrace(event.target.value)}
          placeholder={sampleTrace}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste consecutive HTTP response-header blocks. A practical way to
          collect them is the curl command shown below. The browser does not
          fetch the target itself.
        </p>
      </div>

      {curlCommand && (
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Collect a redirect trace with curl
              </p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-sm text-gray-700">
                {curlCommand}
              </pre>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(curlCommand)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy command
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyze} className="yoryantra-btn">
          Analyze Redirect Chain
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
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
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Redirect Chain Results
          </h3>
          {analysis && (
            <button onClick={copyReport} className="yoryantra-btn-outline text-sm">
              Copy Report
            </button>
          )}
        </div>

        {analysis ? (
          <div className="yoryantra-output">
            <div className="grid gap-4 md:grid-cols-3">
              <ResultCard label="Redirect hops" value={String(analysis.hops.length)} />
              <ResultCard
                label="Final status"
                value={analysis.finalStatus ? String(analysis.finalStatus) : "Unknown"}
              />
              <ResultCard label="Final URL" value={analysis.finalUrl || "Unknown"} />
            </div>

            {analysis.hops.length > 0 && (
              <div className="mt-6 space-y-4">
                {analysis.hops.map((hop, index) => (
                  <div
                    key={`${hop.requestUrl}-${index}`}
                    className="rounded-xl border border-gray-200 bg-white p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Hop {index + 1}
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-gray-900">
                      {hop.requestUrl}
                    </p>
                    <div className="mt-3 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                      <p>
                        <strong>Status:</strong> {hop.status}
                        {hop.reason ? ` ${hop.reason}` : ""}
                      </p>
                      <p className="break-words">
                        <strong>Location:</strong> {hop.location || "(missing)"}
                      </p>
                    </div>
                    {hop.nextUrl && (
                      <p className="mt-3 break-words text-sm text-gray-600">
                        <strong>Resolved target:</strong> {hop.nextUrl}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900">Diagnostics</h4>
              {analysis.diagnostics.length ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  {analysis.diagnostics.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-600">
                  No obvious redirect-chain problems were found in the pasted trace.
                </p>
              )}
            </div>
          </div>
        ) : (
          <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
            Redirect-chain analysis will appear here.
          </pre>
        )}
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why This Tool Uses a Pasted Redirect Trace
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser fetch requests can follow redirects and expose the final
            response URL, but they do not provide a dependable list of every
            intermediate redirect for arbitrary websites. Cross-origin browser
            requests are also restricted by CORS. This tool therefore analyzes
            the actual response-header chain you collect with curl or another
            HTTP client instead of inventing missing hops.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What the Chain Analysis Checks
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>301, 302, 303, 307, and 308 redirect responses.</li>
            <li>Relative Location values resolved against the current URL.</li>
            <li>Repeated URLs that indicate a redirect loop.</li>
            <li>HTTPS-to-HTTP downgrades between hops.</li>
            <li>Redirect responses that are missing a Location header.</li>
            <li>Long chains that add avoidable network round trips.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Status Codes and Request-Method Semantics
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Redirect status codes are not interchangeable. In particular, 307
            and 308 preserve the request method, while historical behavior for
            301 and 302 may rewrite POST requests to GET in user agents. A 303
            explicitly directs the client to retrieve the target using GET or
            HEAD semantics. Check the method behavior when debugging API or
            form redirects, not only the destination URL.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Standards Reference
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Redirect semantics are defined by HTTP. Browser Fetch behavior and
            cross-origin access rules can hide details that command-line HTTP
            clients can expose.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://www.rfc-editor.org/rfc/rfc9110.html"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              RFC 9110 HTTP Semantics
            </a>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Response/redirected"
              target="_blank"
              rel="noreferrer noopener"
              className="yoryantra-btn-outline"
            >
              Fetch redirect behavior
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/redirect-chain-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function analyzeRedirectTrace(startUrl: string, trace: string): RedirectAnalysis {
  const blocks = parseHttpResponseBlocks(trace);

  if (!blocks.length) {
    throw new Error(
      "No HTTP response status lines were found. Paste headers containing lines such as HTTP/2 301 or HTTP/1.1 200 OK."
    );
  }

  let currentUrl = startUrl;
  const seen = new Set<string>([canonicalLoopKey(startUrl)]);
  const hops: RedirectHop[] = [];
  const diagnostics: string[] = [];
  let finalStatus: number | null = null;
  let finalUrl = currentUrl;

  for (const block of blocks) {
    if (
      (block.status === 200 && /connection established/i.test(block.reason)) ||
      (block.status >= 100 && block.status < 200)
    ) {
      continue;
    }

    if (isRedirectStatus(block.status)) {
      const location = firstHeader(block.headers, "location");
      let nextUrl = "";

      if (!location) {
        diagnostics.push(
          `HTTP ${block.status} at ${currentUrl} is a redirect response but no Location header was present in the pasted block.`
        );
      } else {
        try {
          nextUrl = new URL(location, currentUrl).href;
        } catch {
          diagnostics.push(
            `The Location value "${location}" could not be resolved against ${currentUrl}.`
          );
        }
      }

      hops.push({
        requestUrl: currentUrl,
        status: block.status,
        reason: block.reason,
        location,
        nextUrl,
      });

      if (nextUrl) {
        try {
          const from = new URL(currentUrl);
          const to = new URL(nextUrl);
          if (from.protocol === "https:" && to.protocol === "http:") {
            diagnostics.push(
              `HTTPS downgrade: ${currentUrl} redirects to the non-HTTPS URL ${nextUrl}.`
            );
          }
        } catch {
          // URL resolution already produced a diagnostic above.
        }

        const key = canonicalLoopKey(nextUrl);
        if (seen.has(key)) {
          diagnostics.push(`Redirect loop detected: ${nextUrl} appears more than once.`);
        }
        seen.add(key);
        currentUrl = nextUrl;
        finalUrl = nextUrl;
      }

      continue;
    }

    finalStatus = block.status;
    finalUrl = currentUrl;
    break;
  }

  if (hops.length > 3) {
    diagnostics.push(
      `This trace contains ${hops.length} redirect hops. Consider linking directly to the final URL when those intermediate redirects are not required.`
    );
  }

  if (hops.length && finalStatus === null) {
    diagnostics.push(
      "The pasted trace ends on a redirect block, so the final non-redirect response is not visible."
    );
  }

  if (!hops.length) {
    diagnostics.push(
      "No redirect status codes were found. The starting URL appears to have a direct response in this trace."
    );
  }

  return { hops, finalStatus, finalUrl, diagnostics };
}

function parseHttpResponseBlocks(trace: string) {
  const lines = trace.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Array<{
    status: number;
    reason: string;
    headers: Record<string, string[]>;
  }> = [];
  let current:
    | {
        status: number;
        reason: string;
        headers: Record<string, string[]>;
      }
    | null = null;

  for (const line of lines) {
    const statusMatch = line.match(/^HTTP\/(?:\d(?:\.\d)?|2|3)\s+(\d{3})(?:\s+(.*))?$/i);

    if (statusMatch) {
      if (current) blocks.push(current);
      current = {
        status: Number(statusMatch[1]),
        reason: (statusMatch[2] || "").trim(),
        headers: {},
      };
      continue;
    }

    if (!current || !line.trim()) continue;

    if (/^[ \t]/.test(line)) {
      const names = Object.keys(current.headers);
      const lastName = names[names.length - 1];
      if (lastName && current.headers[lastName].length) {
        const values = current.headers[lastName];
        values[values.length - 1] += ` ${line.trim()}`;
      }
      continue;
    }

    const colon = line.indexOf(":");
    if (colon <= 0) continue;

    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (!current.headers[name]) current.headers[name] = [];
    current.headers[name].push(value);
  }

  if (current) blocks.push(current);
  return blocks;
}

function firstHeader(headers: Record<string, string[]>, name: string) {
  return headers[name.toLowerCase()]?.[0] || "";
}

function isRedirectStatus(status: number) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function canonicalLoopKey(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.href;
  } catch {
    return value;
  }
}

function formatRedirectReport(analysis: RedirectAnalysis) {
  const lines = [
    `Redirect hops: ${analysis.hops.length}`,
    `Final status: ${analysis.finalStatus || "Unknown"}`,
    `Final URL: ${analysis.finalUrl || "Unknown"}`,
    "",
  ];

  analysis.hops.forEach((hop, index) => {
    lines.push(`Hop ${index + 1}`);
    lines.push(`URL: ${hop.requestUrl}`);
    lines.push(`Status: ${hop.status}${hop.reason ? ` ${hop.reason}` : ""}`);
    lines.push(`Location: ${hop.location || "(missing)"}`);
    if (hop.nextUrl) lines.push(`Resolved target: ${hop.nextUrl}`);
    lines.push("");
  });

  if (analysis.diagnostics.length) {
    lines.push("Diagnostics:");
    analysis.diagnostics.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join("\n").trim();
}
