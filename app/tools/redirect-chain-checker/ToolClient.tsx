"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type HttpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

type ResponseBlock = {
  status: number;
  reason: string;
  headers: Record<string, string[]>;
};

type RedirectHop = {
  requestUrl: string;
  requestMethod: HttpMethod;
  status: number;
  reason: string;
  location: string;
  nextUrl: string;
  nextMethod: HttpMethod;
};

type RedirectAnalysis = {
  hops: RedirectHop[];
  finalStatus: number | null;
  finalReason: string;
  finalUrl: string;
  finalMethod: HttpMethod;
  diagnostics: string[];
  info: string[];
  blocksUsed: number;
};

const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

const SAMPLE_TRACE = `HTTP/1.1 301 Moved Permanently
location: /docs

HTTP/2 302 Found
location: https://www.example.com/docs/

HTTP/2 200 OK
content-type: text/html; charset=utf-8`;

function isRedirectStatus(status: number) {
  return REDIRECT_STATUSES.indexOf(status) !== -1;
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  try {
    const parsed = new URL(
      /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`
    );

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return "";
    }

    if (parsed.username || parsed.password) {
      return "";
    }

    return parsed.href;
  } catch {
    return "";
  }
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function createCurlCommand(
  url: string,
  method: HttpMethod
) {
  if (!url) return "";

  if (method === "GET") {
    return `curl -sS -D - -o /dev/null -L --max-redirs 20 --proto '=http,https' --proto-redir '=http,https' ${shellQuote(
      url
    )}`;
  }

  if (method === "HEAD") {
    return `curl -sS -I -L --max-redirs 20 --proto '=http,https' --proto-redir '=http,https' ${shellQuote(
      url
    )}`;
  }

  return "";
}

function parseHttpResponseBlocks(
  trace: string
) {
  const lines = trace
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const blocks: ResponseBlock[] = [];
  let current: ResponseBlock | null =
    null;
  let lastHeaderName = "";

  for (const rawLine of lines) {
    const statusMatch = rawLine.match(
      /^HTTP\/(?:\d(?:\.\d)?|2|3)\s+(\d{3})(?:\s+(.*))?$/i
    );

    if (statusMatch) {
      if (current) {
        blocks.push(current);
      }

      current = {
        status: Number(statusMatch[1]),
        reason:
          (statusMatch[2] || "").trim(),
        headers:
          Object.create(null) as Record<
            string,
            string[]
          >,
      };
      lastHeaderName = "";
      continue;
    }

    if (!current) {
      continue;
    }

    if (!rawLine.trim()) {
      lastHeaderName = "";
      continue;
    }

    if (
      /^[ \t]/.test(rawLine) &&
      lastHeaderName
    ) {
      const values =
        current.headers[lastHeaderName];

      if (values && values.length) {
        values[values.length - 1] +=
          ` ${rawLine.trim()}`;
      }

      continue;
    }

    const colon = rawLine.indexOf(":");

    if (colon <= 0) {
      continue;
    }

    const name = rawLine
      .slice(0, colon)
      .trim()
      .toLowerCase();
    const value = rawLine
      .slice(colon + 1)
      .trim();

    if (!name) continue;

    if (!current.headers[name]) {
      current.headers[name] = [];
    }

    current.headers[name].push(value);
    lastHeaderName = name;
  }

  if (current) {
    blocks.push(current);
  }

  return blocks;
}

function headerValues(
  block: ResponseBlock,
  name: string
) {
  return block.headers[
    name.toLowerCase()
  ] || [];
}

function canonicalLoopKey(value: string) {
  try {
    const parsed = new URL(value);

    parsed.hash = "";

    if (
      (parsed.protocol === "http:" &&
        parsed.port === "80") ||
      (parsed.protocol === "https:" &&
        parsed.port === "443")
    ) {
      parsed.port = "";
    }

    parsed.hostname =
      parsed.hostname.toLowerCase();

    return parsed.href;
  } catch {
    return value;
  }
}

function methodAfterRedirect(
  method: HttpMethod,
  status: number
) {
  if (status === 303) {
    return method === "HEAD"
      ? "HEAD"
      : "GET";
  }

  if (
    (status === 301 || status === 302) &&
    method === "POST"
  ) {
    return "GET";
  }

  return method;
}

function methodDiagnostic(
  method: HttpMethod,
  status: number,
  nextMethod: HttpMethod
) {
  if (
    status === 307 ||
    status === 308
  ) {
    return `${status} preserves the request method (${method}) when automatically followed.`;
  }

  if (status === 303) {
    return method === "HEAD"
      ? "303 keeps HEAD as HEAD in this interpretation."
      : `303 changes the follow-up request from ${method} to GET.`;
  }

  if (
    (status === 301 || status === 302) &&
    method === "POST" &&
    nextMethod === "GET"
  ) {
    return `${status} is interpreted with the common historical POST → GET behavior. Clients can differ for non-GET methods, so confirm the real client when method preservation matters.`;
  }

  if (
    status === 301 ||
    status === 302
  ) {
    return `${status} does not force a method change for this ${method} trace interpretation. Client behavior around 301/302 is historically less strict than 307/308.`;
  }

  return "";
}

function analyzeRedirectTrace(
  startUrl: string,
  trace: string,
  initialMethod: HttpMethod
): RedirectAnalysis {
  const blocks =
    parseHttpResponseBlocks(trace);

  if (!blocks.length) {
    throw new Error(
      "No HTTP response status lines were found. Paste response headers containing lines such as HTTP/2 301 or HTTP/1.1 200 OK."
    );
  }

  let currentUrl = startUrl;
  let currentMethod = initialMethod;
  let finalStatus: number | null =
    null;
  let finalReason = "";
  let finalUrl = currentUrl;
  let finalMethod = currentMethod;
  const hops: RedirectHop[] = [];
  const diagnostics: string[] = [];
  const info: string[] = [];
  const seen = new Set<string>([
    canonicalLoopKey(startUrl),
  ]);
  let blocksUsed = 0;

  for (const block of blocks) {
    if (
      (block.status === 200 &&
        /connection established/i.test(
          block.reason
        )) ||
      (block.status >= 100 &&
        block.status < 200)
    ) {
      continue;
    }

    blocksUsed += 1;

    if (
      isRedirectStatus(block.status)
    ) {
      const locations = headerValues(
        block,
        "location"
      );
      const location =
        locations.length
          ? locations[0]
          : "";
      let nextUrl = "";

      if (!location) {
        diagnostics.push(
          `HTTP ${block.status} at ${currentUrl} is treated as a redirect status, but the pasted response block has no Location header.`
        );
      } else {
        if (locations.length > 1) {
          diagnostics.push(
            `HTTP ${block.status} at ${currentUrl} contains ${locations.length} Location field lines. Redirect processing expects one target; this analyzer follows the first value shown.`
          );
        }

        try {
          const resolved = new URL(
            location,
            currentUrl
          );

          if (
            resolved.protocol !== "http:" &&
            resolved.protocol !== "https:"
          ) {
            diagnostics.push(
              `The Location value resolves to ${resolved.protocol}, outside this HTTP/HTTPS redirect-chain checker.`
            );
          } else if (
            resolved.username ||
            resolved.password
          ) {
            diagnostics.push(
              "The redirect target contains URL credentials. Do not treat credentials embedded in a redirect URL as safe."
            );
          } else {
            nextUrl = resolved.href;
          }
        } catch {
          diagnostics.push(
            `The Location value "${location}" could not be resolved against ${currentUrl}.`
          );
        }
      }

      const nextMethod =
        methodAfterRedirect(
          currentMethod,
          block.status
        );

      hops.push({
        requestUrl: currentUrl,
        requestMethod: currentMethod,
        status: block.status,
        reason: block.reason,
        location,
        nextUrl,
        nextMethod,
      });

      const methodNote =
        methodDiagnostic(
          currentMethod,
          block.status,
          nextMethod
        );

      if (methodNote) {
        info.push(
          `Hop ${hops.length}: ${methodNote}`
        );
      }

      if (nextUrl) {
        try {
          const from = new URL(
            currentUrl
          );
          const to = new URL(nextUrl);

          if (
            from.protocol === "https:" &&
            to.protocol === "http:"
          ) {
            diagnostics.push(
              `HTTPS downgrade: ${currentUrl} redirects to the non-HTTPS URL ${nextUrl}.`
            );
          }

          if (
            from.origin !== to.origin
          ) {
            info.push(
              `Hop ${hops.length} changes origin from ${from.origin} to ${to.origin}.`
            );
          }

          if (
            from.hostname !==
            to.hostname
          ) {
            info.push(
              `Hop ${hops.length} changes hostname from ${from.hostname} to ${to.hostname}.`
            );
          }
        } catch {
          // Resolution already produced any necessary diagnostic.
        }

        const key =
          canonicalLoopKey(nextUrl);

        if (seen.has(key)) {
          diagnostics.push(
            `Redirect loop detected: ${nextUrl} resolves to a URL that already appeared in this chain. URL fragments are ignored for loop detection because fragments are not sent in HTTP requests.`
          );
        }

        seen.add(key);
        currentUrl = nextUrl;
        currentMethod = nextMethod;
        finalUrl = nextUrl;
        finalMethod = nextMethod;
      }

      if (!nextUrl) {
        finalStatus = block.status;
        finalReason = block.reason;
        finalUrl = currentUrl;
        finalMethod = currentMethod;
        break;
      }

      continue;
    }

    finalStatus = block.status;
    finalReason = block.reason;
    finalUrl = currentUrl;
    finalMethod = currentMethod;

    if (
      block.status >= 300 &&
      block.status < 400
    ) {
      info.push(
        `The trace ended on HTTP ${block.status}, which is a 3xx response but is not one of the automatic Location-based redirect statuses analyzed here (301, 302, 303, 307, 308).`
      );
    }

    break;
  }

  if (
    hops.length >= 3
  ) {
    diagnostics.push(
      `This trace contains ${hops.length} redirect hops. Every hop can add request latency; link directly to the final stable URL when the intermediate redirects are not serving a necessary migration, authentication, or routing purpose.`
    );
  } else if (
    hops.length === 2
  ) {
    info.push(
      "The chain contains two redirect hops. That may be intentional, but a direct one-hop destination is usually simpler when both intermediates are avoidable."
    );
  }

  if (
    hops.length &&
    finalStatus === null
  ) {
    diagnostics.push(
      "The pasted trace ends before a final non-redirect response is visible. The reported final URL is only the last redirect target, not proof of the final HTTP response."
    );
  }

  if (!hops.length) {
    info.push(
      "No 301, 302, 303, 307, or 308 redirect response was found in the usable trace blocks."
    );
  }

  if (
    blocksUsed > 0 &&
    blocksUsed <
      blocks.filter(
        (block) =>
          !(
            (block.status === 200 &&
              /connection established/i.test(
                block.reason
              )) ||
            (block.status >= 100 &&
              block.status < 200)
          )
      ).length
  ) {
    info.push(
      "Only the response blocks needed to reach the first final response were used; later pasted blocks were ignored."
    );
  }

  return {
    hops,
    finalStatus,
    finalReason,
    finalUrl,
    finalMethod,
    diagnostics,
    info,
    blocksUsed,
  };
}

function formatRedirectReport(
  analysis: RedirectAnalysis
) {
  const lines = [
    `Redirect hops: ${analysis.hops.length}`,
    `Final URL: ${analysis.finalUrl}`,
    `Final method: ${analysis.finalMethod}`,
    `Final status: ${
      analysis.finalStatus === null
        ? "not visible"
        : `${analysis.finalStatus}${
            analysis.finalReason
              ? ` ${analysis.finalReason}`
              : ""
          }`
    }`,
    "",
  ];

  if (analysis.hops.length) {
    lines.push("Chain:");

    analysis.hops.forEach(
      (hop, index) => {
        lines.push(
          `${index + 1}. ${hop.requestMethod} ${hop.requestUrl}`,
          `   HTTP ${hop.status}${
            hop.reason
              ? ` ${hop.reason}`
              : ""
          }`,
          `   Location: ${
            hop.location ||
            "(missing)"
          }`,
          `   Next: ${
            hop.nextUrl ||
            "(unresolved)"
          }`,
          `   Follow-up method: ${hop.nextMethod}`
        );
      }
    );

    lines.push("");
  }

  if (analysis.diagnostics.length) {
    lines.push(
      "Warnings / problems:",
      ...analysis.diagnostics.map(
        (item) => `- ${item}`
      ),
      ""
    );
  }

  if (analysis.info.length) {
    lines.push(
      "Interpretation notes:",
      ...analysis.info.map(
        (item) => `- ${item}`
      )
    );
  }

  return lines
    .join("\n")
    .replace(/\s+$/, "");
}

export default function ToolClient() {
  const [startUrl, setStartUrl] =
    useState(
      "https://example.com"
    );
  const [initialMethod, setInitialMethod] =
    useState<HttpMethod>("GET");
  const [trace, setTrace] =
    useState("");
  const [analysis, setAnalysis] =
    useState<RedirectAnalysis | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const normalizedStart =
    useMemo(
      () =>
        normalizeHttpUrl(startUrl),
      [startUrl]
    );

  const curlCommand = useMemo(
    () =>
      createCurlCommand(
        normalizedStart,
        initialMethod
      ),
    [normalizedStart, initialMethod]
  );

  const analyze = () => {
    if (!normalizedStart) {
      setError(
        "Enter an absolute HTTP or HTTPS starting URL without embedded username/password credentials."
      );
      setAnalysis(null);
      return;
    }

    if (!trace.trim()) {
      setError(
        "Paste the consecutive HTTP response-header trace produced by curl or another HTTP client."
      );
      setAnalysis(null);
      return;
    }

    try {
      setAnalysis(
        analyzeRedirectTrace(
          normalizedStart,
          trace,
          initialMethod
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setAnalysis(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to analyze this redirect trace."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setStartUrl(
      "https://example.com"
    );
    setInitialMethod("GET");
    setTrace(SAMPLE_TRACE);
    setAnalysis(null);
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setStartUrl("");
    setInitialMethod("GET");
    setTrace("");
    setAnalysis(null);
    setError("");
    setCopied(false);
  };

  const copyReport = async () => {
    if (!analysis) return;

    try {
      await navigator.clipboard.writeText(
        formatRedirectReport(
          analysis
        )
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The redirect report could not be copied. Select and copy it manually."
      );
    }
  };

  const copyCurl = async () => {
    if (!curlCommand) return;

    try {
      await navigator.clipboard.writeText(
        curlCommand
      );
    } catch {
      setError(
        "The curl command could not be copied."
      );
    }
  };

  return (
    <ToolShell
      title="Redirect Chain Checker"
      description="Turn a captured HTTP response-header trace into a hop-by-hop redirect path, including relative Location resolution, request-method behavior, loops, origin changes, protocol downgrades, and incomplete-chain warnings."
    >
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Starting URL
          </label>
          <input
            type="url"
            value={startUrl}
            onChange={(event: {
              target: { value: string };
            }) => {
              setStartUrl(
                event.target.value
              );
              setAnalysis(null);
              setError("");
              setCopied(false);
            }}
            placeholder="https://example.com/old-page"
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div>
          <YoryantraSelect
            label="Initial request method"
            value={initialMethod}
            onChange={(value: string) => {
              setInitialMethod(
                value as HttpMethod
              );
              setAnalysis(null);
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "GET",
                value: "GET",
              },
              {
                label: "HEAD",
                value: "HEAD",
              },
              {
                label: "POST",
                value: "POST",
              },
              {
                label: "PUT",
                value: "PUT",
              },
              {
                label: "PATCH",
                value: "PATCH",
              },
              {
                label: "DELETE",
                value: "DELETE",
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Consecutive HTTP response headers
        </label>
        <textarea
          value={trace}
          onChange={(event: {
            target: { value: string };
          }) => {
            setTrace(event.target.value);
            setAnalysis(null);
            setError("");
            setCopied(false);
          }}
          placeholder={SAMPLE_TRACE}
          spellCheck={false}
          className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste the actual response-header blocks in order. This tool does not
          fetch the destination from your browser, so CORS cannot hide a hop
          from the analyzer after you have captured the headers.
        </p>
      </div>

      {curlCommand ? (
        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                Capture a {initialMethod} redirect trace with curl
              </div>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-gray-700">
                {curlCommand}
              </pre>
            </div>
            <button
              type="button"
              onClick={copyCurl}
              className="yoryantra-btn-outline whitespace-nowrap"
            >
              Copy curl
            </button>
          </div>
        </div>
      ) : normalizedStart ? (
        <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
          No replay command is generated for {initialMethod}. Replaying an
          unsafe method can create or modify server state. Capture the trace
          from the real client/request you are debugging, then paste only its
          response headers here.
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={analyze}
          className="yoryantra-btn"
        >
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
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {analysis ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ResultCard
              label="Redirect hops"
              value={String(
                analysis.hops.length
              )}
            />
            <ResultCard
              label="Final status"
              value={
                analysis.finalStatus ===
                null
                  ? "Not visible"
                  : `${analysis.finalStatus}${
                      analysis.finalReason
                        ? ` ${analysis.finalReason}`
                        : ""
                    }`
              }
            />
            <ResultCard
              label="Final method"
              value={
                analysis.finalMethod
              }
            />
            <ResultCard
              label="Response blocks used"
              value={String(
                analysis.blocksUsed
              )}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Redirect Path
                </h3>
                <p className="mt-1 break-all text-sm text-gray-500">
                  Final URL:{" "}
                  {analysis.finalUrl}
                </p>
              </div>

              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline text-sm"
              >
                {copied
                  ? "Copied"
                  : "Copy report"}
              </button>
            </div>

            {analysis.hops.length ? (
              <div className="mt-5 space-y-4">
                {analysis.hops.map(
                  (hop, index) => (
                    <div
                      key={`${hop.requestUrl}-${hop.status}-${index}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                          Hop {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {hop.requestMethod} ·
                          HTTP {hop.status}
                          {hop.reason
                            ? ` ${hop.reason}`
                            : ""}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
                        <p className="break-all">
                          <strong>
                            Request:
                          </strong>{" "}
                          {hop.requestUrl}
                        </p>
                        <p className="break-all">
                          <strong>
                            Location:
                          </strong>{" "}
                          {hop.location ||
                            "(missing)"}
                        </p>
                        <p className="break-all">
                          <strong>
                            Resolved target:
                          </strong>{" "}
                          {hop.nextUrl ||
                            "(unresolved)"}
                        </p>
                        <p>
                          <strong>
                            Follow-up method:
                          </strong>{" "}
                          {hop.nextMethod}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-gray-600">
                No automatic redirect hop was found in the usable response
                trace.
              </p>
            )}
          </div>

          {analysis.diagnostics.length ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
              <strong>
                Problems / review points:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {analysis.diagnostics.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          {analysis.info.length ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong>
                Interpretation:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {analysis.info.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[230px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Redirect hops, method changes, loop warnings, and final response details will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The analyzer works on the URL and response headers you paste; it does
        not request the target website. This avoids pretending that browser
        Fetch/CORS rules can expose every cross-origin redirect response.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this analysis.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The Redirect Chain Is the Behavior—Not Just the Final URL
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A browser may eventually land on the correct page while hiding
            several avoidable requests along the way. An old HTTP URL might
            redirect to HTTPS, then to <code>www</code>, then add a trailing
            slash, then finally reach the page. The destination looks correct,
            but every intermediate response is still part of the request path.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This checker reconstructs that path from the actual response
            headers. Relative <code>Location: /docs</code> values are resolved
            against the URL that produced them, so you can see the effective
            target rather than guessing what the header means.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Three-Hop Canonicalization Chain Usually Means Several Rules Are Solving the Same Problem
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`http://example.com/page
  301 → https://example.com/page
  301 → https://www.example.com/page
  301 → https://www.example.com/page/
  200`}</pre>
          <p className="mt-4 leading-relaxed text-gray-600">
            That can happen when the CDN enforces HTTPS, the application
            enforces the preferred hostname, and a framework independently
            normalizes trailing slashes. None of the individual rules is
            necessarily wrong, but combining the decisions into one redirect
            reduces round trips and makes internal links easier to reason about.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            301, 302, 303, 307, and 308 Do Not Mean the Same Thing to a POST Request
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            For ordinary GET navigation, developers often focus on whether a
            redirect is permanent or temporary. With forms and APIs, the request
            method matters too. HTTP 307 and 308 explicitly preserve the
            request method when automatically followed. HTTP 303 is designed to
            direct the client to retrieve another resource, normally with GET.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP 301 and 302 have historical user-agent behavior that can change
            POST to GET. That is why the tool asks for the initial method: the
            same status chain can have different consequences for an API call
            than for a normal page visit.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            HTTPS → HTTP Is More Than an Extra Hop
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            A secure URL that redirects to plain HTTP downgrades the next
            request&apos;s transport security. Modern browsers, HSTS policy,
            mixed-content rules, and product-specific behavior can alter what
            happens next, but the redirect itself deserves investigation.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            The reverse path—HTTP to HTTPS—is common during migration, but
            internal links and canonical URLs should normally point directly at
            the HTTPS destination once it is established.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Redirect Loop Is About Requests, So Fragments Do Not Rescue It
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            URL fragments such as <code>#pricing</code> are processed by the
            client and are not sent as part of the HTTP request target. If a
            chain appears to alternate only by fragment while returning to the
            same request URL, that is not a meaningful server-side escape from
            a loop.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Loop detection here therefore ignores fragments while preserving
            meaningful differences such as path and query parameters.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Why the Browser Does Not Directly “Check the URL” for You
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser Fetch can automatically follow redirects, and cross-origin
            response access is constrained by CORS and redirect behavior. If a
            tool simply calls <code>fetch()</code> and reports the final URL,
            intermediate headers may be unavailable even though the redirect
            happened.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A command-line HTTP client can expose each response block without
            requiring the destination site to grant this page cross-origin
            access. That is why this checker accepts a captured trace instead of
            claiming a browser-only request can always reveal the complete
            chain.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Do Not Replay Unsafe Methods Just to Inspect Redirects
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            GET and HEAD are designed around retrieval semantics, so the page
            can safely offer a generic curl capture command for those methods.
            POST, PUT, PATCH, and DELETE requests can create or modify server
            state. Replaying them against a production endpoint merely to
            collect headers can trigger real actions.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            For an API or form redirect, capture the response trace from the
            actual request you are already debugging and paste the headers here.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Trace That Ends on 301 Is Not Proof of the Final Destination
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A redirect response can point at a target that itself redirects,
            fails TLS, returns 404, requires authentication, or never responds.
            If the pasted trace ends on a redirect block, this tool reports the
            last target as an unresolved endpoint rather than pretending the
            final response was successful.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          Redirect status and method semantics come from{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc9110.html"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            RFC 9110
          </a>
          . The specification also recommends that clients detect cyclical
          redirects and describes how a client updates the target URI and
          request metadata when automatically following a redirect.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/redirect-chain-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function ResultCard({
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
      <div className="mt-2 break-words text-sm font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
