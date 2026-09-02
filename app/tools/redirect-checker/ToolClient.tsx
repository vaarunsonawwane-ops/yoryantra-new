"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type RequestMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

type MethodState =
  | RequestMethod
  | "POST-or-GET";

type HeaderEntry = {
  name: string;
  lowerName: string;
  value: string;
  line: number;
};

type ParsedResponse = {
  protocol: string;
  status: number;
  reason: string;
  headers: HeaderEntry[];
  rawIndex: number;
};

type Hop = ParsedResponse & {
  sourceUrl: string;
  location: string;
  hasLocation: boolean;
  destinationUrl: string;
  isRedirect: boolean;
  requestMethod: MethodState;
  nextMethod: MethodState;
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
  redirectCount: number;
};

const REDIRECT_STATUSES = [300, 301, 302, 303, 307, 308];

const SAMPLE_HEADERS = `HTTP/2 301
location: /docs/
cache-control: public, max-age=3600

HTTP/2 302
location: https://www.example.com/docs/start
cache-control: no-cache

HTTP/2 200
content-type: text/html; charset=utf-8`;

function isRedirectStatus(status: number) {
  return REDIRECT_STATUSES.indexOf(status) !== -1;
}

function isToken(value: string) {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(value);
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Enter the starting URL.");
  }

  const withScheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;

  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error("Enter a valid HTTP or HTTPS starting URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Starting URL must use HTTP or HTTPS.");
  }

  if (!parsed.hostname) {
    throw new Error("Starting URL needs a hostname.");
  }

  if (parsed.username || parsed.password) {
    throw new Error(
      "Do not place credentials in the starting URL. Use deliberate authentication headers/options when collecting the real response."
    );
  }

  return parsed.href;
}

function quotePosix(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function buildCurlCommand(url: string, method: RequestMethod) {
  const quoted = quotePosix(url);
  const common =
    "-sS -D - -o /dev/null --max-redirs 10 --proto-redir =http,https";

  if (method === "GET") {
    return `curl ${common} -L ${quoted}`;
  }

  if (method === "HEAD") {
    return `curl ${common} --head -L ${quoted}`;
  }

  return `curl -sS -D - -o /dev/null -X ${method} ${quoted}`;
}

function parseResponseChain(input: string) {
  const normalized = input.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const responses: ParsedResponse[] = [];
  const findings: Finding[] = [];
  let current: ParsedResponse | null = null;
  let previousHeader: HeaderEntry | null = null;

  const pushCurrent = () => {
    if (current) {
      if (
        current.status === 200 &&
        /connection established/i.test(current.reason)
      ) {
        findings.push({
          severity: "info",
          title: "Proxy CONNECT response skipped",
          message:
            `A ${current.protocol} 200 Connection Established block at source line ${current.rawIndex} looks like proxy tunnel setup rather than an origin redirect hop.`,
        });
      } else {
        responses.push(current);
      }
    }

    current = null;
    previousHeader = null;
  };

  lines.forEach((line, index) => {
    const statusMatch = line.match(
      /^HTTP\/(1\.0|1\.1|2(?:\.0)?|3(?:\.0)?)\s+(\d{3})(?:\s+(.*))?$/i
    );

    if (statusMatch) {
      pushCurrent();
      current = {
        protocol: `HTTP/${statusMatch[1]}`,
        status: Number(statusMatch[2]),
        reason: statusMatch[3] ? statusMatch[3].trim() : "",
        headers: [],
        rawIndex: index + 1,
      };
      return;
    }

    if (!current || !line.trim()) {
      previousHeader = null;
      return;
    }

    if (/^[ \t]/.test(line)) {
      if (previousHeader) {
        previousHeader.value += ` ${line.trim()}`;
        findings.push({
          severity: "warning",
          title: "Obsolete folded response field",
          message:
            `A continuation line after source line ${previousHeader.line} was unfolded. Modern HTTP senders must not generate obs-fold.`,
        });
      } else {
        findings.push({
          severity: "warning",
          title: "Orphaned folded line",
          message:
            `Source line ${index + 1} starts with whitespace but is not attached to a recognized header field.`,
        });
      }
      return;
    }

    const separator = line.indexOf(":");

    if (separator <= 0) {
      findings.push({
        severity: "info",
        title: "Non-header line ignored",
        message:
          `Source line ${index + 1} appeared inside a response block but was not a header field.`,
      });
      previousHeader = null;
      return;
    }

    const rawName = line.slice(0, separator);
    const name = rawName.trim();

    if (rawName !== name || !isToken(name)) {
      findings.push({
        severity: "warning",
        title: "Malformed response header name",
        message:
          `Source line ${index + 1} has an invalid HTTP field-name/colon boundary and was ignored.`,
      });
      previousHeader = null;
      return;
    }

    const entry: HeaderEntry = {
      name,
      lowerName: name.toLowerCase(),
      value: line
        .slice(separator + 1)
        .replace(/^[ \t]+|[ \t]+$/g, ""),
      line: index + 1,
    };

    current.headers.push(entry);
    previousHeader = entry;
  });

  pushCurrent();

  if (!responses.length) {
    throw new Error(
      "No HTTP response status lines were found. Paste blocks beginning with lines such as HTTP/1.1 301, HTTP/2 302, or HTTP/3 200."
    );
  }

  return {
    responses,
    findings,
  };
}

function headerValues(response: ParsedResponse, name: string) {
  const lower = name.toLowerCase();

  return response.headers
    .filter((header) => header.lowerName === lower)
    .map((header) => header.value);
}

function stripFragment(value: string) {
  const parsed = new URL(value);
  parsed.hash = "";
  return parsed.href;
}

function originKey(value: string) {
  return new URL(value).origin;
}

function methodAfterRedirect(
  status: number,
  method: MethodState
): MethodState {
  if (status === 303) {
    return method === "HEAD"
      ? "HEAD"
      : "GET";
  }

  if (
    status === 307 ||
    status === 308
  ) {
    return method;
  }

  if (
    (status === 301 ||
      status === 302) &&
    (method === "POST" ||
      method ===
        "POST-or-GET")
  ) {
    return "POST-or-GET";
  }

  return method;
}

function methodFinding(
  status: number,
  method: MethodState
) {
  if (status === 300) {
    return `The incoming method is ${method}. A 300 can point to a preferred choice with Location, but it does not authorize the historical POST-to-GET rewrite used by 301/302. Clients are not required to auto-follow a 300 choice.`;
  }

  if (status === 303) {
    return `The incoming method state is ${method}. A 303 directs the next retrieval to GET, except a HEAD request remains HEAD.`;
  }

  if (
    status === 307 ||
    status === 308
  ) {
    return `The incoming method state is ${method}. HTTP ${status} preserves whichever method the client is currently using, including request content where applicable.`;
  }

  if (
    (status === 301 ||
      status === 302) &&
    (method === "POST" ||
      method ===
        "POST-or-GET")
  ) {
    return `The incoming method state is ${method}. For historical compatibility, a user agent may rewrite POST to GET when following HTTP ${status}; later-hop method analysis therefore remains uncertain until you inspect the real client trace.`;
  }

  return `The incoming method is ${method}. RFC 9110's historical rewrite allowance for HTTP ${status} is specifically POST to GET; other methods are not given that rewrite allowance. Unsafe requests still deserve verification with the real client trace.`;
}

function resolveLocation(location: string, currentUrl: string) {
  let parsed: URL;

  try {
    parsed = new URL(location, currentUrl);
  } catch {
    return {
      url: "",
      error: "Location cannot be resolved as a URI reference.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      url: "",
      error:
        `Location resolves to ${parsed.protocol}. Only HTTP and HTTPS redirect destinations are analyzed.`,
    };
  }

  if (parsed.username || parsed.password) {
    return {
      url: "",
      error:
        "Location contains embedded URL credentials. Avoid credential-bearing redirect destinations.",
    };
  }

  return {
    url: parsed.href,
    error: "",
  };
}

function analyzeRedirects(
  startUrl: string,
  requestMethod: RequestMethod,
  parsed: ReturnType<typeof parseResponseChain>
): AnalysisResult {
  const findings = parsed.findings.slice();
  const hops: Hop[] = [];
  let currentUrl = startUrl;
  let currentMethod:
    MethodState =
    requestMethod;
  const seenUrls = new Set<string>();
  seenUrls.add(stripFragment(startUrl));

  parsed.responses.forEach((response, index) => {
    const isRedirect = isRedirectStatus(response.status);
    const locations =
      headerValues(
        response,
        "location"
      );
    const hasLocation =
      locations.length > 0;
    const location =
      hasLocation
        ? locations[0]
        : "";
    let destinationUrl = "";

    if (locations.length > 1) {
      findings.push({
        severity: "high",
        title: "Multiple Location fields",
        message:
          `Response ${index + 1} contains ${locations.length} Location field lines. A redirect should present one unambiguous destination.`,
      });
    }

    if (
      isRedirect &&
      !hasLocation
    ) {
      findings.push({
        severity: response.status === 300 ? "info" : "high",
        title:
          response.status === 300
            ? "HTTP 300 has no preferred Location"
            : `HTTP ${response.status} redirect has no Location`,
        message:
          response.status === 300
            ? `Response ${index + 1} can legitimately describe multiple choices without naming one preferred Location. No automatic destination can be reconstructed from the supplied headers.`
            : `Response ${index + 1} uses a redirect status but supplies no Location URI reference.`,
      });
    }

    if (
      !isRedirect &&
      hasLocation
    ) {
      findings.push({
        severity: "info",
        title: "Location appears on a non-redirect status",
        message:
          `Response ${index + 1} is HTTP ${response.status}. Location can have semantics outside automatic redirection in some statuses, so the field is reported without inventing another hop.`,
      });
    }

    if (
      isRedirect &&
      hasLocation
    ) {
      const resolved = resolveLocation(location, currentUrl);
      destinationUrl = resolved.url;

      if (resolved.error) {
        findings.push({
          severity: "high",
          title: "Location needs review",
          message: `Hop ${index + 1}: ${resolved.error}`,
        });
      }
    }

    const nextMethod = isRedirect
      ? methodAfterRedirect(response.status, currentMethod)
      : currentMethod;

    hops.push({
      protocol: response.protocol,
      status: response.status,
      reason: response.reason,
      headers: response.headers,
      rawIndex: response.rawIndex,
      sourceUrl: currentUrl,
      location,
      hasLocation,
      destinationUrl,
      isRedirect,
      requestMethod: currentMethod,
      nextMethod,
    });

    if (isRedirect) {
      findings.push({
        severity:
          currentMethod === "GET" || currentMethod === "HEAD"
            ? "info"
            : "warning",
        title: `Method semantics at HTTP ${response.status}`,
        message: methodFinding(response.status, currentMethod),
      });
    }

    if (destinationUrl) {
      const destination = new URL(destinationUrl);
      const current = new URL(currentUrl);

      if (
        current.protocol === "https:" &&
        destination.protocol === "http:"
      ) {
        findings.push({
          severity: "high",
          title: "HTTPS-to-HTTP downgrade",
          message:
            `Hop ${index + 1} moves from HTTPS to HTTP. Confirm this is intentional; it weakens transport protection for the next request.`,
        });
      }

      if (originKey(currentUrl) !== originKey(destinationUrl)) {
        findings.push({
          severity: "info",
          title: "Redirect changes origin",
          message:
            `Hop ${index + 1} changes origin from ${originKey(
              currentUrl
            )} to ${originKey(destinationUrl)}. Authentication, cookies, CORS and cache behavior may differ across origins.`,
        });
      }

      if (location.charAt(0) === "#") {
        findings.push({
          severity: "warning",
          title: "Fragment-only redirect",
          message:
            `Hop ${index + 1} points only to a fragment of the same URL. Fragments are client-side identifiers and are not sent in HTTP requests; this can behave like a self-redirect.`,
        });
      }

      const loopKey = stripFragment(destinationUrl);

      if (seenUrls.has(loopKey)) {
        findings.push({
          severity: "high",
          title: "Redirect loop or self-redirect",
          message:
            `Hop ${index + 1} resolves to a URL already seen in the chain: ${destinationUrl}`,
        });
      }

      seenUrls.add(loopKey);
      currentUrl = destinationUrl;

      currentMethod =
        nextMethod;
    }

    if (
      response.status >=
        100 &&
      response.status <
        200
    ) {
      findings.push({
        severity: "info",
        title:
          "Interim response",
        message:
          `Response ${index + 1} is HTTP ${response.status}. Informational 1xx responses can legitimately precede the final response to the same request and do not advance the redirect URL.`,
      });
    } else if (
      !isRedirect &&
      index <
        parsed.responses.length -
          1
    ) {
      findings.push({
        severity:
          "warning",
        title:
          "Responses continue after a non-redirect",
        message:
          `Response ${index + 1} is HTTP ${response.status}, but more response blocks follow. The pasted output may include another request, authentication/proxy exchange, or unrelated trace.`,
      });
    }
  });

  const redirectCount = hops.filter((hop) => hop.isRedirect).length;

  if (redirectCount >= 3) {
    findings.push({
      severity: "warning",
      title: "Long redirect chain",
      message:
        `${redirectCount} redirect responses are present. When you control the mapping, sending old URLs directly to the intended final URL usually reduces latency and maintenance risk.`,
    });
  } else if (redirectCount === 2) {
    findings.push({
      severity: "info",
      title: "Two redirect hops",
      message:
        "Two hops can be legitimate, but migrations and canonicalization rules are simpler when an old URL can reach its final destination directly.",
    });
  }

  if (hops.length) {
    const last = hops[hops.length - 1];

    if (last.isRedirect && last.status !== 300) {
      findings.push({
        severity: "warning",
        title: "Pasted chain ends on a redirect",
        message:
          `The final supplied response is HTTP ${last.status}. Another Location hop may be missing from the pasted trace.`,
      });
    } else if (last.status === 300 && last.hasLocation) {
      findings.push({
        severity: "info",
        title: "Pasted chain ends on HTTP 300",
        message:
          "HTTP 300 can name a preferred choice with Location, but a client is not required to follow it automatically. The supplied trace can therefore end here without proving that another request is missing.",
      });
    }
  }

  const curlCommand = buildCurlCommand(startUrl, requestMethod);
  const summary = buildSummary(
    startUrl,
    requestMethod,
    hops,
    findings,
    currentUrl
  );

  return {
    hops,
    findings,
    finalUrl: currentUrl,
    curlCommand,
    summary,
    redirectCount,
  };
}

function buildSummary(
  startUrl: string,
  method: RequestMethod,
  hops: Hop[],
  findings: Finding[],
  finalUrl: string
) {
  const lines = [
    "Redirect chain review",
    `Start URL: ${startUrl}`,
    `Original method: ${method}`,
    `Responses parsed: ${hops.length}`,
    `Redirect responses: ${hops.filter((hop) => hop.isRedirect).length}`,
    `Final URL from supplied data: ${finalUrl}`,
    "",
  ];

  hops.forEach((hop, index) => {
    lines.push(
      `Hop ${index + 1}: HTTP ${hop.status}${
        hop.reason ? ` ${hop.reason}` : ""
      }`,
      `  Request URL: ${hop.sourceUrl}`,
      `  Incoming method: ${hop.requestMethod}`
    );

    if (hop.hasLocation) {
      lines.push(
        `  Location: ${
          hop.location ||
          "(empty URI reference)"
        }`
      );
    }

    if (hop.destinationUrl) {
      lines.push(`  Resolved destination: ${hop.destinationUrl}`);
      lines.push(`  Next-method note: ${hop.nextMethod}`);
    }
  });

  lines.push("", "Findings:");

  if (!findings.length) {
    lines.push("- No obvious redirect-chain issue found in the supplied headers.");
  } else {
    findings.forEach((finding) => {
      lines.push(
        `- [${finding.severity.toUpperCase()}] ${finding.title}: ${finding.message}`
      );
    });
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [startUrl, setStartUrl] = useState("");
  const [requestMethod, setRequestMethod] =
    useState<RequestMethod>("GET");
  const [rawHeaders, setRawHeaders] = useState("");
  const [result, setResult] =
    useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const curlCommand = useMemo(() => {
    if (!startUrl.trim()) {
      return "";
    }

    try {
      return buildCurlCommand(
        normalizeHttpUrl(startUrl),
        requestMethod
      );
    } catch {
      return "";
    }
  }, [startUrl, requestMethod]);

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const analyze = () => {
    try {
      const normalizedStart = normalizeHttpUrl(startUrl);

      if (!rawHeaders.trim()) {
        setResult({
          hops: [],
          findings: [
            {
              severity: "info",
              title: "URL syntax checked; no redirect fetched",
              message:
                "No network request is made from the pasted analysis. Collect the real headers with cURL, DevTools or another HTTP client and paste them here.",
            },
          ],
          finalUrl: normalizedStart,
          curlCommand: buildCurlCommand(
            normalizedStart,
            requestMethod
          ),
          summary:
            `Redirect chain review\nStart URL: ${normalizedStart}\nOriginal method: ${requestMethod}\nResponses parsed: 0\n\nNo live request was made.`,
          redirectCount: 0,
        });
        setError("");
        setCopied(false);
        return;
      }

      const parsed = parseResponseChain(rawHeaders);
      setResult(
        analyzeRedirects(
          normalizedStart,
          requestMethod,
          parsed
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to analyze this redirect data."
      );
    }
  };

  const loadExample = () => {
    setStartUrl("https://example.com/old-page");
    setRequestMethod("GET");
    setRawHeaders(SAMPLE_HEADERS);
    clear();
  };

  const reset = () => {
    setStartUrl("");
    setRequestMethod("GET");
    setRawHeaders("");
    clear();
  };

  const copySummary = async () => {
    if (!result || !result.summary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError(
        "The redirect analysis could not be copied. Select and copy it manually."
      );
    }
  };

  const highCount = result
    ? result.findings.filter(
        (finding) => finding.severity === "high"
      ).length
    : 0;

  return (
    <ToolShell
      title="Redirect Checker"
      description="Paste HTTP response headers to trace Location hops, resolve relative redirects, compare request-method behavior, and spot loops, protocol downgrades, ambiguous destinations or an incomplete chain."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            Starting URL
          </label>
          <input
            value={startUrl}
            onChange={(event: { target: { value: string } }) => {
              setStartUrl(event.target.value);
              clear();
            }}
            placeholder="https://example.com/old-page"
            spellCheck={false}
            className="mt-3 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <div className="mt-5">
            <YoryantraSelect
              label="Original request method"
              value={requestMethod}
              onChange={(value: string) => {
                setRequestMethod(value as RequestMethod);
                clear();
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
            <h3 className="text-sm font-semibold text-gray-900">
              Collect response headers
            </h3>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 font-mono text-xs leading-6 text-gray-700">
              {curlCommand ||
                "Enter a valid HTTP or HTTPS URL to generate a cURL command."}
            </pre>
            <p className="mt-3 text-xs leading-relaxed text-gray-600">
              GET/HEAD commands follow redirects and print every response
              header block. For POST/PUT/PATCH/DELETE the generated command
              intentionally captures only the first response: automatically
              following a method-sensitive request without its real body,
              authentication and headers can produce misleading behavior.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            HTTP response headers / chain
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste one or more response header blocks. HTTP/1.0, HTTP/1.1,
            readable HTTP/2 and HTTP/3 status lines are accepted.
          </p>
          <textarea
            value={rawHeaders}
            onChange={(event: { target: { value: string } }) => {
              setRawHeaders(event.target.value);
              clear();
            }}
            placeholder={SAMPLE_HEADERS}
            spellCheck={false}
            className="mt-4 min-h-[430px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={analyze} className="yoryantra-btn">
          Analyze Redirect Chain
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={reset}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Responses" value={String(result.hops.length)} />
            <Stat
              label="Redirect hops"
              value={String(result.redirectCount)}
            />
            <Stat
              label="High findings"
              value={String(highCount)}
            />
            <Stat
              label="All findings"
              value={String(result.findings.length)}
            />
          </div>

          {result.hops.length ? (
            <div className="mt-6 space-y-4">
              {result.hops.map((hop, index) => (
                <div
                  key={`${hop.rawIndex}-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      Response {index + 1}
                    </span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      HTTP {hop.status}
                    </span>
                    {hop.reason ? (
                      <span className="text-sm text-gray-600">
                        {hop.reason}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Info
                      label="Request URL"
                      value={hop.sourceUrl}
                    />
                    <Info
                      label="Incoming method"
                      value={hop.requestMethod}
                    />
                    {hop.hasLocation ? (
                      <Info
                        label="Location"
                        value={
                          hop.location ||
                          "(empty URI reference)"
                        }
                      />
                    ) : null}
                    {hop.destinationUrl ? (
                      <Info
                        label="Resolved destination"
                        value={hop.destinationUrl}
                      />
                    ) : null}
                    {hop.isRedirect ? (
                      <Info
                        label="Next method"
                        value={hop.nextMethod}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Final URL from supplied data
                </h3>
                <p className="mt-1 break-all text-sm text-gray-600">
                  {result.finalUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={copySummary}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy Analysis"}
              </button>
            </div>
          </div>

          {result.findings.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-gray-900">
                Redirect review
              </h3>
              <div className="mt-4 space-y-3">
                {result.findings.map((finding, index) => (
                  <div
                    key={`${finding.title}-${index}`}
                    className="rounded-xl border border-amber-200 bg-white/60 p-4 text-sm leading-relaxed text-gray-700"
                  >
                    <strong>
                      {finding.severity.toUpperCase()} · {finding.title}
                    </strong>
                    <p className="mt-1">{finding.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Redirect hops, resolved destinations, method behavior, loops and
          deployment findings will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The URL and pasted response headers are analyzed in the browser. No URL
        is fetched, no redirect is followed, and no credentials are sent to the
        destination. Site-wide analytics or advertising scripts, if enabled,
        are separate from the header analysis.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Redirect Check Needs Response Evidence, Not a Guess From the URL
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nothing about <code>https://example.com/old</code> proves whether
            the server returns 200, 301, 404, a JavaScript redirect or a
            login challenge. The useful evidence is the actual HTTP response
            status plus its Location field.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Pasted response headers keep those two questions separate: what the
            server actually returned, and how that response changes the next
            request. Relative Location values can then be resolved one hop at a
            time without claiming that the live server was contacted.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            301/302 and 307/308 Solve Different Method Problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            For historical compatibility, clients may turn a POST into GET when
            following 301 or 302. HTTP 307 and 308 exist specifically so an
            automatic redirect does not change the request method. A 303
            intentionally points to a separate retrieval, normally GET.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            That distinction can be invisible on a normal page navigation and
            critical on login, checkout, webhook or API endpoints. HTTP 300 is
            different again: a Location value can identify a preferred choice,
            but a client is not required to automatically follow that choice.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Relative Location Values Are Valid
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Location is a URI reference; a redirect can say{" "}
            <code>Location: /docs/</code> rather than repeating the complete
            origin. The destination must be resolved against the request URL of
            that hop, not always against the original URL.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Resolution therefore has to advance one URL at a time. A second
            relative Location is resolved from the first redirect destination,
            not from the URL where the chain originally started.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            HTTPS → HTTP Is More Than an SEO Cleanliness Issue
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Downgrading a redirect destination from HTTPS to HTTP changes the
            transport security of the next request. Depending on HSTS, browser
            state and infrastructure, the user may be upgraded again or may
            briefly enter an insecure path.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            During migrations, prefer a direct HTTPS destination when the target
            supports it rather than relying on a later redirect to repair the
            scheme.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Loops Are Compared Without URL Fragments
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The fragment after <code>#</code> is not sent as part of an HTTP
            request. Therefore <code>/page#one</code> and{" "}
            <code>/page#two</code> still request the same HTTP resource. Treating
            those as different network hops could hide a self-redirect loop.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Cross-Origin Redirect Can Change Authentication and Cookie Behavior
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Redirecting from one origin to another can change which cookies are
            sent, whether Authorization is retained by a client, how CORS
            applies and which caches/CDNs participate. A cross-origin hop is not
            automatically wrong, but it deserves visibility in API and login
            flows.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Migration Chains Should Usually Collapse Toward the Final URL
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Old HTTP → old HTTPS → new HTTPS → canonical new URL can accumulate
            over years of migrations. Browsers may still reach the page, but
            every avoidable hop adds latency and another place where cache,
            method or hostname rules can diverge.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When you control the redirect map, update old sources to point
            directly to the intended canonical destination while preserving any
            necessary method semantics.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          Redirect status and Location semantics come from{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc9110.html#name-redirection-3xx"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            RFC 9110 HTTP redirection
          </a>
          . Use the real HTTP client/server path for deployment verification,
          because HTML meta refresh, JavaScript navigation and service-worker
          routing are different mechanisms.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Keep Tracing the Redirect
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/redirect-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
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
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Info({
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
      <div className="mt-2 break-all font-mono text-xs leading-relaxed text-gray-800">
        {value}
      </div>
    </div>
  );
}
