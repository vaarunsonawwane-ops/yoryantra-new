"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type RequestMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";

type ParsedResponse = {
  protocol: string;
  status: number;
  reason: string;
  headers: Record<string, string[]>;
  rawIndex: number;
};

type Hop = ParsedResponse & {
  sourceUrl: string;
  location: string | null;
  destinationUrl: string | null;
  isRedirect: boolean;
};

type Finding = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type AnalysisResult = {
  hops: Hop[];
  findings: Finding[];
  finalUrl: string;
  curlCommand: string;
  summary: string;
};

const redirectStatuses = new Set([301, 302, 303, 307, 308]);

const sampleHeaders = `HTTP/2 301 Moved Permanently
location: /docs/
cache-control: public, max-age=3600

HTTP/2 302 Found
location: https://www.example.com/docs/start
cache-control: no-cache

HTTP/2 200 OK
content-type: text/html; charset=utf-8`;

export default function ToolClient() {
  const [startUrl, setStartUrl] = useState("");
  const [requestMethod, setRequestMethod] = useState<RequestMethod>("GET");
  const [rawHeaders, setRawHeaders] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const curlCommand = useMemo(() => {
    if (!startUrl.trim()) return "";
    try {
      const normalized = normalizeHttpUrl(startUrl);
      return buildCurlCommand(normalized, requestMethod);
    } catch {
      return "";
    }
  }, [startUrl, requestMethod]);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const analyze = () => {
    try {
      if (!startUrl.trim()) {
        setError("Enter the starting URL for the redirect chain.");
        setResult(null);
        return;
      }

      const normalizedStart = normalizeHttpUrl(startUrl);
      const parsed = rawHeaders.trim() ? parseResponseChain(rawHeaders) : [];
      const next = analyzeRedirects(normalizedStart, requestMethod, parsed);
      setResult(next);
      setError("");
      setCopied(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to analyze this redirect data.");
      setResult(null);
    }
  };

  const loadExample = () => {
    setStartUrl("https://example.com/old-page");
    setRequestMethod("GET");
    setRawHeaders(sampleHeaders);
    clearResult();
  };

  const resetAll = () => {
    setStartUrl("");
    setRequestMethod("GET");
    setRawHeaders("");
    clearResult();
  };

  const copySummary = async () => {
    if (!result?.summary) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <ToolShell
      title="Redirect Checker"
      description="Analyze HTTP redirect response headers, resolve Location hops, and catch redirect-chain problems locally. This page does not make a live request to the URL you enter."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">Starting URL</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Used to resolve relative <code className="rounded bg-gray-100 px-1 py-0.5">Location</code> headers and identify loops or protocol downgrades.
          </p>
          <input
            type="text"
            value={startUrl}
            onChange={(event) => {
              setStartUrl(event.target.value);
              clearResult();
            }}
            placeholder="https://example.com/old-page"
            spellCheck={false}
            className="mt-4 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-5">
            <YoryantraSelect
              label="Original request method"
              value={requestMethod}
              onChange={(value) => {
                setRequestMethod(value as RequestMethod);
                clearResult();
              }}
              options={[
                { label: "GET", value: "GET" },
                { label: "HEAD", value: "HEAD" },
                { label: "POST", value: "POST" },
                { label: "PUT", value: "PUT" },
                { label: "PATCH", value: "PATCH" },
                { label: "DELETE", value: "DELETE" },
              ]}
            />
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">Get the response chain with cURL</div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Run the command below in a terminal, then paste the response headers into the panel on the right. Using GET avoids assuming that a server handles HEAD exactly like GET.
            </p>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-xs text-gray-700">
              {curlCommand || "Enter a valid HTTP or HTTPS URL to generate the command."}
            </pre>
            {curlCommand ? (
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(curlCommand)}
                className="yoryantra-btn-outline mt-3 text-sm"
              >
                Copy cURL Command
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">HTTP Response Headers / Redirect Chain</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste one or more HTTP response blocks. Each block should start with a status line such as <code className="rounded bg-gray-100 px-1 py-0.5">HTTP/2 301</code>.
          </p>
          <textarea
            value={rawHeaders}
            onChange={(event) => {
              setRawHeaders(event.target.value);
              clearResult();
            }}
            placeholder={sampleHeaders}
            spellCheck={false}
            className="mt-4 min-h-[420px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={analyze} className="yoryantra-btn">
          Analyze Redirect Chain
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {result ? (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard label="Responses Parsed" value={String(result.hops.length)} />
            <StatCard label="Redirect Hops" value={String(result.hops.filter((hop) => hop.isRedirect).length)} />
            <StatCard label="Findings" value={String(result.findings.length)} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Redirect Path</h3>
                <p className="mt-1 text-sm text-gray-500">Relative Location values are resolved against the URL from the preceding hop.</p>
              </div>
              <button type="button" onClick={copySummary} className="yoryantra-btn-outline text-sm">
                {copied ? "Copied" : "Copy Analysis"}
              </button>
            </div>

            {result.hops.length ? (
              <div className="mt-5 space-y-4">
                {result.hops.map((hop, index) => (
                  <div key={`${hop.rawIndex}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">Hop {index + 1}</span>
                      <span className="font-mono text-sm font-semibold text-gray-900">{hop.status}</span>
                      {hop.reason ? <span className="text-sm text-gray-600">{hop.reason}</span> : null}
                    </div>
                    <div className="mt-3 break-all text-sm text-gray-700">
                      <span className="font-medium text-gray-900">Request URL:</span> {hop.sourceUrl}
                    </div>
                    {hop.location ? (
                      <div className="mt-2 break-all text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Location:</span> {hop.location}
                      </div>
                    ) : null}
                    {hop.destinationUrl ? (
                      <div className="mt-2 break-all text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Resolved destination:</span> {hop.destinationUrl}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
                No HTTP response blocks were pasted, so no live redirect claim is made. The starting URL was validated and a cURL command was generated so you can collect the real response chain.
              </div>
            )}

            <div className="mt-5 break-all rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <span className="font-medium text-gray-900">Final URL from the supplied chain:</span> {result.finalUrl}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
            <div className="mt-4 space-y-3">
              {result.findings.length ? (
                result.findings.map((finding, index) => <FindingCard key={`${finding.title}-${index}`} finding={finding} />)
              ) : (
                <FindingCard finding={{ severity: "info", title: "No obvious chain problems found", message: "The supplied response blocks did not show a loop, missing Location header, protocol downgrade, or other basic redirect-chain problem." }} />
              )}
            </div>
          </div>
        </>
      ) : null}

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What This Redirect Checker Actually Verifies</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A redirect is an HTTP response, not a property that can be proven from a URL string alone. The useful evidence is the response status plus its <code className="rounded bg-gray-100 px-1 py-0.5">Location</code> header. This checker therefore analyzes real response headers that you paste, rather than pretending that browser-only URL validation is a live redirect test.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            It resolves relative destinations, shows every supplied hop, flags missing Location headers, catches repeated URLs, warns about HTTPS-to-HTTP downgrades, and points out method-sensitive redirects when the original request is not GET or HEAD.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">301, 302, 303, 307, and 308 Are Not Interchangeable</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoBox title="301 Moved Permanently">A permanent move. For historical compatibility, a user agent may change a POST to GET when following it.</InfoBox>
            <InfoBox title="302 Found">A temporary redirect. User agents historically may rewrite a POST to GET, so it is not the safest choice when the method must be preserved.</InfoBox>
            <InfoBox title="303 See Other">Tells the client to retrieve the referenced resource with GET (or HEAD where appropriate), which is useful after a POST when the next page is a separate representation.</InfoBox>
            <InfoBox title="307 / 308">307 is temporary and 308 is permanent. Both preserve the request method instead of relying on the historical method-changing behavior of 301/302.</InfoBox>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Redirect Checks That Matter During a Migration</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Old URLs should normally reach the intended replacement directly rather than bouncing through avoidable intermediate hops.</li>
            <li>Every redirect response should provide a usable Location value that resolves to the expected destination.</li>
            <li>HTTPS pages should not unexpectedly redirect back to HTTP.</li>
            <li>Redirect maps should not send multiple old URLs into loops or back to themselves.</li>
            <li>POST, PUT, PATCH, and DELETE workflows deserve extra attention because 301/302 and 307/308 have different method semantics.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Standards Reference</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Redirect status semantics are defined in HTTP Semantics, RFC 9110. When you need to verify production behavior, capture the actual response headers from the same request method and environment that matters to your application.
          </p>
          <a
            href="https://www.rfc-editor.org/rfc/rfc9110.html#name-redirection-3xx"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex font-medium text-[var(--green)] hover:underline"
          >
            Read RFC 9110 redirection semantics →
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/redirect-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withScheme);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Use an HTTP or HTTPS URL.");
  }
  if (!parsed.hostname) throw new Error("Enter a URL with a hostname.");
  return parsed.href;
}

function buildCurlCommand(url: string, method: RequestMethod) {
  const quoted = `'${url.replace(/'/g, `'\\''`)}'`;
  const methodPart = method === "GET" ? "" : ` -X ${method}`;
  return `curl -sS -D - -o /dev/null -L --max-redirs 10${methodPart} ${quoted}`;
}

function parseResponseChain(input: string): ParsedResponse[] {
  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const responses: ParsedResponse[] = [];
  let current: ParsedResponse | null = null;
  let lastHeaderName = "";

  const pushCurrent = () => {
    if (current) responses.push(current);
    current = null;
    lastHeaderName = "";
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const statusMatch = line.match(/^HTTP\/(\S+)\s+(\d{3})(?:\s+(.*))?$/i);
    if (statusMatch) {
      pushCurrent();
      current = {
        protocol: `HTTP/${statusMatch[1]}`,
        status: Number(statusMatch[2]),
        reason: statusMatch[3]?.trim() ?? "",
        headers: {},
        rawIndex: lineIndex + 1,
      };
      continue;
    }

    if (!current) continue;
    if (!line.trim()) {
      lastHeaderName = "";
      continue;
    }

    if (/^[ \t]/.test(line) && lastHeaderName) {
      const values = current.headers[lastHeaderName];
      if (values?.length) values[values.length - 1] += ` ${line.trim()}`;
      continue;
    }

    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (!name) continue;
    (current.headers[name] ??= []).push(value);
    lastHeaderName = name;
  }

  pushCurrent();

  if (!responses.length) {
    throw new Error("No HTTP status lines were found. Paste response blocks that begin with lines such as 'HTTP/2 301' or leave the header box empty to validate only the starting URL.");
  }
  return responses;
}

function analyzeRedirects(startUrl: string, requestMethod: RequestMethod, responses: ParsedResponse[]): AnalysisResult {
  const findings: Finding[] = [];
  const hops: Hop[] = [];
  let currentUrl = startUrl;
  const seenUrls = new Set([stripFragment(startUrl)]);

  for (let index = 0; index < responses.length; index += 1) {
    const response = responses[index];
    const isRedirect = redirectStatuses.has(response.status);
    const locations = response.headers.location ?? [];
    const location = locations[0] ?? null;
    let destinationUrl: string | null = null;

    if (locations.length > 1) {
      findings.push({
        severity: "high",
        title: "Multiple Location headers",
        message: `Response ${index + 1} contains ${locations.length} Location values. Redirect behavior can become ambiguous; send one clear destination.`,
      });
    }

    if (isRedirect && !location) {
      findings.push({
        severity: "high",
        title: `Redirect ${response.status} has no Location header`,
        message: `Hop ${index + 1} uses a redirect status but does not provide a destination to follow.`,
      });
    }

    if (isRedirect && location) {
      try {
        destinationUrl = new URL(location, currentUrl).href;
      } catch {
        findings.push({
          severity: "high",
          title: "Invalid Location value",
          message: `Hop ${index + 1} has a Location header that cannot be resolved against ${currentUrl}.`,
        });
      }
    }

    hops.push({ ...response, sourceUrl: currentUrl, location, destinationUrl, isRedirect });

    if (destinationUrl) {
      if (new URL(currentUrl).protocol === "https:" && new URL(destinationUrl).protocol === "http:") {
        findings.push({
          severity: "warning",
          title: "HTTPS redirects to HTTP",
          message: `Hop ${index + 1} downgrades from HTTPS to HTTP. Confirm that this is intentional before deploying the redirect.`,
        });
      }

      const loopKey = stripFragment(destinationUrl);
      if (seenUrls.has(loopKey)) {
        findings.push({
          severity: "high",
          title: "Possible redirect loop",
          message: `Hop ${index + 1} points to a URL that already appeared in the chain: ${destinationUrl}`,
        });
      }
      seenUrls.add(loopKey);
      currentUrl = destinationUrl;
    }

    if (!isRedirect && index < responses.length - 1) {
      findings.push({
        severity: "warning",
        title: "Response appears after a non-redirect status",
        message: `Hop ${index + 1} is ${response.status}, but more HTTP response blocks follow it. Check whether the pasted output contains unrelated requests or proxy responses.`,
      });
    }
  }

  const redirectCount = hops.filter((hop) => hop.isRedirect).length;
  if (redirectCount >= 3) {
    findings.push({
      severity: "warning",
      title: "Long redirect chain",
      message: `The supplied data contains ${redirectCount} redirect hops. Where practical, point old URLs directly to their intended final destination.`,
    });
  } else if (redirectCount === 2) {
    findings.push({
      severity: "info",
      title: "Two redirect hops",
      message: "The chain works from the supplied data, but a direct old-URL-to-final-URL redirect is usually simpler to maintain when you control both hops.",
    });
  }

  if (!["GET", "HEAD"].includes(requestMethod)) {
    const methodSensitive = hops.find((hop) => hop.isRedirect && [301, 302, 303, 307, 308].includes(hop.status));
    if (methodSensitive) {
      findings.push({
        severity: "info",
        title: "Request method matters",
        message: methodSemanticsMessage(methodSensitive.status, requestMethod),
      });
    }
  }

  if (!responses.length) {
    findings.push({
      severity: "info",
      title: "URL validated; redirect not fetched",
      message: "This is a browser-local analyzer. Paste actual response headers to verify redirect statuses and Location hops instead of relying on URL syntax alone.",
    });
  }

  const finalStatus = hops.at(-1)?.status;
  if (finalStatus && redirectStatuses.has(finalStatus)) {
    findings.push({
      severity: "warning",
      title: "Chain ends on another redirect",
      message: `The last supplied response is ${finalStatus}. The pasted chain may be incomplete if another Location hop should follow.`,
    });
  }

  const curlCommand = buildCurlCommand(startUrl, requestMethod);
  const summary = buildSummary(startUrl, requestMethod, hops, findings, currentUrl);
  return { hops, findings, finalUrl: currentUrl, curlCommand, summary };
}

function stripFragment(value: string) {
  const parsed = new URL(value);
  parsed.hash = "";
  return parsed.href;
}

function methodSemanticsMessage(status: number, method: RequestMethod) {
  if (status === 303) return `The original method is ${method}. A 303 directs the client to retrieve the next resource using GET (or HEAD as appropriate).`;
  if (status === 307 || status === 308) return `The original method is ${method}. Status ${status} preserves the request method when the redirect is followed.`;
  return `The original method is ${method}. With ${status}, user agents may historically rewrite a POST to GET; use 307/308 when preserving the method is required.`;
}

function buildSummary(startUrl: string, method: RequestMethod, hops: Hop[], findings: Finding[], finalUrl: string) {
  const lines = [
    "Redirect analysis",
    `Start URL: ${startUrl}`,
    `Request method: ${method}`,
    `Responses parsed: ${hops.length}`,
    `Redirect hops: ${hops.filter((hop) => hop.isRedirect).length}`,
    `Final URL from supplied chain: ${finalUrl}`,
    "",
  ];

  hops.forEach((hop, index) => {
    lines.push(`Hop ${index + 1}: ${hop.status}${hop.reason ? ` ${hop.reason}` : ""}`);
    lines.push(`  Request: ${hop.sourceUrl}`);
    if (hop.location) lines.push(`  Location: ${hop.location}`);
    if (hop.destinationUrl) lines.push(`  Resolved: ${hop.destinationUrl}`);
  });

  lines.push("", "Findings:");
  if (!findings.length) lines.push("- No obvious chain problems found in the supplied headers.");
  findings.forEach((finding) => lines.push(`- [${finding.severity.toUpperCase()}] ${finding.title}: ${finding.message}`));
  return lines.join("\n");
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const classes = finding.severity === "high"
    ? "border-red-200 bg-red-50 text-red-800"
    : finding.severity === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-gray-200 bg-gray-50 text-gray-700";
  return (
    <div className={`rounded-xl border p-4 ${classes}`}>
      <div className="font-semibold">{finding.title}</div>
      <div className="mt-1 text-sm leading-relaxed">{finding.message}</div>
    </div>
  );
}

function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="font-semibold text-gray-900">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{children}</p>
    </div>
  );
}
