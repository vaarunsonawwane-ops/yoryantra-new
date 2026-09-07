"use client";

import { useRef, useState } from "react";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type DNSRecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SOA" | "CAA";

type ResolverStatus = "Found" | "No answer" | "Error";

type ResolverAnswer = {
  name: string;
  type: number;
  data: string;
  ttl?: number;
  matchesRequestedType: boolean;
};

type ResolverResult = {
  resolver: string;
  status: ResolverStatus;
  responseCode?: number;
  answers: ResolverAnswer[];
  message: string;
};

type DNSJsonAnswer = {
  name?: string;
  type?: number;
  TTL?: number;
  data?: string;
};

type DNSJsonResponse = {
  Status?: number;
  Answer?: DNSJsonAnswer[];
};

const recordTypes: DNSRecordType[] = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "CAA"];

const typeMap: Record<DNSRecordType, number> = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  MX: 15,
  TXT: 16,
  AAAA: 28,
  CAA: 257,
};

const resolvers = [
  { name: "Google Public DNS", url: "https://dns.google/resolve" },
  { name: "Cloudflare 1.1.1.1", url: "https://cloudflare-dns.com/dns-query" },
];

const REQUEST_TIMEOUT_MS = 12000;

export default function ToolClient() {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState<DNSRecordType>("A");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  async function checkDNS() {
    let normalizedDomain: string;

    try {
      normalizedDomain = normalizeDnsName(domain);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enter a valid DNS name.");
      setOutput("");
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    setIsChecking(true);
    setError("");
    setOutput("Checking selected public resolver APIs...");
    setCopied(false);

    try {
      const results = await Promise.all(
        resolvers.map((resolver) =>
          queryResolver(
            resolver.name,
            resolver.url,
            normalizedDomain,
            recordType,
            controller.signal
          )
        )
      );

      if (requestRef.current !== controller) {
        return;
      }

      setOutput(formatReport(normalizedDomain, recordType, results));
      setError("");
    } catch {
      if (requestRef.current !== controller) {
        return;
      }

      setError("Unable to complete the resolver comparison.");
      setOutput("");
    } finally {
      window.clearTimeout(timeoutId);

      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsChecking(false);
      }
    }
  }

  function loadExample() {
    requestRef.current?.abort();
    requestRef.current = null;
    setDomain("yoryantra.com");
    setRecordType("A");
    setOutput("");
    setError("");
    setIsChecking(false);
    setCopied(false);
  }

  async function copyOutput() {
    if (!output || isChecking) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the report and copy it manually.");
    }
  }

  function resetAll() {
    requestRef.current?.abort();
    requestRef.current = null;
    setDomain("");
    setRecordType("A");
    setOutput("");
    setError("");
    setIsChecking(false);
    setCopied(false);
  }

  return (
    <ToolShell
      title="DNS Propagation Checker"
      description="Compare DNS answers and TTLs from Google and Cloudflare public resolver APIs."
    >
      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">DNS name</label>
          <input
            value={domain}
            onChange={(event) => {
              setDomain(event.target.value);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder="example.com or _dmarc.example.com"
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Plain hostnames, underscored DNS labels, Unicode domains, and pasted http/https URLs are normalized before lookup.
          </p>
        </div>

        <YoryantraSelect
          label="Record type"
          value={recordType}
          onChange={(value) => {
            setRecordType(value as DNSRecordType);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          options={recordTypes.map((type) => ({ label: type, value: type }))}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={checkDNS}
          disabled={isChecking}
          className="yoryantra-btn min-h-[44px] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChecking ? "Checking..." : "Check DNS"}
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Resolver comparison</h2>
          {output && !isChecking && (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "DNS answers from the selected public resolvers will appear here."}
        </pre>
      </div>

      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <h2 className="font-semibold text-amber-950">Two resolvers are a comparison, not a world map</h2>
          <p className="mt-1">
            Different answers can reflect cache age, geo-aware DNS, load balancing, resolver policy, or an active change. Matching answers from Google and Cloudflare do not prove that every ISP cache has the same value.
          </p>
        </div>

        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <h2 className="font-semibold text-gray-900">Where the query goes</h2>
          <p className="mt-1">
            The DNS name is sent directly from your browser to Google Public DNS and Cloudflare's resolver endpoints. Yoryantra does not proxy the lookup, but those third-party resolver providers receive the request and apply their own logging and privacy policies.
          </p>
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            DNS "propagation" is usually several caches aging at different times
          </h2>
          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              After an A, AAAA, MX, TXT, CNAME, NS, SOA, or CAA change, recursive resolvers may continue serving cached data until that cache entry is refreshed. There is no single global propagation clock and no single resolver that can certify what every network sees.
            </p>
            <p>
              A returned TTL is the TTL visible in that resolver response at query time. It is useful evidence, but it is not a countdown for every cache on the Internet and it does not reveal caches that were populated at different moments.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            "No answer" and NXDOMAIN are different failures to diagnose
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
            <DnsConceptCard
              title="Found"
              text="The resolver returned at least one record of the requested type. CNAMEs or other answer records are shown separately when present."
            />
            <DnsConceptCard
              title="NOERROR with no matching type"
              text="The name can exist while the requested record type is absent. That is different from saying the DNS name itself does not exist."
            />
            <DnsConceptCard
              title="NXDOMAIN"
              text="DNS response code 3 means the queried name does not exist according to that resolver's current resolution result."
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The browser-friendly JSON APIs are not the RFC 8484 wire format
          </h2>
          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              RFC 8484 standardizes DNS-over-HTTPS using DNS messages over HTTPS. Google also exposes a web-friendly JSON endpoint at <span className="font-mono text-sm">dns.google/resolve</span>, and Cloudflare documents a compatible JSON representation for its endpoint. Cloudflare explicitly notes that the JSON format itself has no formal RFC.
            </p>
            <p>
              These lookups use those JSON APIs because browsers can query and display record data without building binary DNS packets. For a protocol implementation or a critical interoperability path, use the RFC 8484 wire format rather than assuming every JSON provider behaves identically.{" "}
              <a
                href="https://www.rfc-editor.org/rfc/rfc8484.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-2"
              >
                RFC 8484
              </a>
              {" · "}
              <a
                href="https://developers.google.com/speed/public-dns/docs/doh/json"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-2"
              >
                Google JSON API
              </a>
              {" · "}
              <a
                href="https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-2"
              >
                Cloudflare JSON API
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Record values mean different things depending on the RR type
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
{`A      IPv4 address
AAAA   IPv6 address
CNAME  Alias target
MX     Preference and mail exchanger
TXT    One or more DNS character strings
NS     Authoritative nameserver
SOA    Zone authority and timing fields
CAA    Certificate-authority authorization policy`}
            </pre>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Provider JSON formatting is kept visible rather than aggressively rewritten, especially for TXT, MX, SOA, and CAA values where spacing and quoting can carry presentation meaning.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/dns-propagation-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function DnsConceptCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}

/* PURE HELPERS START */
async function queryResolver(
  resolverName: string,
  resolverUrl: string,
  domain: string,
  recordType: DNSRecordType,
  signal: AbortSignal
): Promise<ResolverResult> {
  const url = new URL(resolverUrl);
  url.searchParams.set("name", domain);
  url.searchParams.set("type", recordType);

  try {
    const response = await fetch(url.toString(), {
      headers: { accept: "application/dns-json" },
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      return {
        resolver: resolverName,
        status: "Error",
        answers: [],
        message: `Resolver returned HTTP ${response.status}.`,
      };
    }

    const data = (await response.json()) as DNSJsonResponse;
    const responseCode = typeof data.Status === "number" ? data.Status : undefined;
    const answers = normalizeAnswers(data.Answer, recordType);
    const matchedCount = answers.filter((answer) => answer.matchesRequestedType).length;

    if (responseCode !== undefined && responseCode !== 0) {
      return {
        resolver: resolverName,
        status: "No answer",
        responseCode,
        answers,
        message: getDnsStatusMessage(responseCode, false, answers.length > 0),
      };
    }

    if (matchedCount === 0) {
      return {
        resolver: resolverName,
        status: "No answer",
        responseCode,
        answers,
        message: getDnsStatusMessage(responseCode, false, answers.length > 0),
      };
    }

    return {
      resolver: resolverName,
      status: "Found",
      responseCode,
      answers,
      message: `${matchedCount} matching ${recordType} record${matchedCount === 1 ? "" : "s"} returned.`,
    };
  } catch (err) {
    if (isAbortError(err)) {
      return {
        resolver: resolverName,
        status: "Error",
        answers: [],
        message: `Lookup exceeded the ${Math.round(REQUEST_TIMEOUT_MS / 1000)}-second request window or was cancelled.`,
      };
    }

    return {
      resolver: resolverName,
      status: "Error",
      answers: [],
      message: "Lookup failed. The resolver may be unavailable or blocked by the browser or network.",
    };
  }
}

function normalizeAnswers(source: DNSJsonAnswer[] | undefined, recordType: DNSRecordType) {
  if (!Array.isArray(source)) {
    return [] as ResolverAnswer[];
  }

  const expectedType = typeMap[recordType];
  const answers: ResolverAnswer[] = [];

  source.forEach((answer) => {
    if (
      typeof answer.type !== "number" ||
      typeof answer.data !== "string" ||
      typeof answer.name !== "string"
    ) {
      return;
    }

    answers.push({
      name: answer.name,
      type: answer.type,
      data: answer.data.trim(),
      ttl: typeof answer.TTL === "number" && answer.TTL >= 0 ? answer.TTL : undefined,
      matchesRequestedType: answer.type === expectedType,
    });
  });

  return answers;
}

function formatReport(domain: string, recordType: DNSRecordType, results: ResolverResult[]) {
  let found = 0;
  let noAnswer = 0;
  let errors = 0;
  const uniqueMatchingAnswers: string[] = [];

  results.forEach((result) => {
    if (result.status === "Found") {
      found += 1;
    } else if (result.status === "No answer") {
      noAnswer += 1;
    } else {
      errors += 1;
    }

    result.answers.forEach((answer) => {
      if (answer.matchesRequestedType && uniqueMatchingAnswers.indexOf(answer.data) === -1) {
        uniqueMatchingAnswers.push(answer.data);
      }
    });
  });

  uniqueMatchingAnswers.sort();

  const lines = [
    "DNS resolver comparison completed.",
    "",
    `Name: ${domain}`,
    `Requested type: ${recordType}`,
    `Resolvers checked: ${results.length}`,
    `Found: ${found}`,
    `No matching answer: ${noAnswer}`,
    `Errors: ${errors}`,
    "",
    `Unique matching ${recordType} data:`,
  ];

  if (uniqueMatchingAnswers.length) {
    uniqueMatchingAnswers.forEach((answer) => lines.push(`- ${answer}`));
  } else {
    lines.push("No matching record data returned.");
  }

  lines.push("", "Resolver results:", "");

  results.forEach((result) => {
    lines.push(result.resolver);
    lines.push(`Status: ${result.status}`);

    if (typeof result.responseCode === "number") {
      lines.push(`DNS response: ${responseCodeLabel(result.responseCode)} (${result.responseCode})`);
    }

    lines.push(`Message: ${result.message}`);

    const matching = result.answers.filter((answer) => answer.matchesRequestedType);
    const related = result.answers.filter((answer) => !answer.matchesRequestedType);

    if (matching.length) {
      lines.push(`Matching ${recordType} answers:`);
      matching.forEach((answer) => lines.push(` - ${formatResolverAnswer(answer)}`));
    }

    if (related.length) {
      lines.push("Other answer-section records:");
      related.forEach((answer) => lines.push(` - ${formatResolverAnswer(answer)}`));
    }

    lines.push("");
  });

  if (uniqueMatchingAnswers.length > 1) {
    lines.push(
      "Interpretation: the selected resolvers returned different matching data. Cache state is one possibility, but geo-aware DNS, load balancing, and resolver policy can also produce legitimate differences."
    );
  } else if (found === results.length && uniqueMatchingAnswers.length === 1) {
    lines.push(
      "Interpretation: both selected resolvers returned the same matching data at this moment. This does not prove that every recursive cache worldwide matches them."
    );
  } else if (found > 0) {
    lines.push(
      "Interpretation: at least one resolver returned the requested record while another did not or could not be queried. Review each resolver's DNS response code and message."
    );
  }

  return lines.join("\n").trim();
}

function normalizeDnsName(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Enter a DNS name to check.");
  }

  let hostname: string;

  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
    const parsed = new URL(hasScheme ? trimmed : `https://${trimmed}`);
    hostname = parsed.hostname;
  } catch {
    throw new Error("Enter a DNS name or a URL containing a valid hostname.");
  }

  hostname = hostname.replace(/\.$/, "").toLowerCase();

  if (!isValidDnsName(hostname)) {
    throw new Error("The normalized DNS name has an invalid label or exceeds DNS length limits.");
  }

  return hostname;
}

function isValidDnsName(value: string) {
  if (!value || value.length > 253) {
    return false;
  }

  const labels = value.split(".");

  return labels.every((label) => {
    if (!label || label.length > 63) {
      return false;
    }

    if (label.charAt(0) === "_") {
      return /^_[a-z0-9_-]+$/i.test(label);
    }

    return !label.startsWith("-") && !label.endsWith("-") && /^[a-z0-9-]+$/i.test(label);
  });
}

function formatResolverAnswer(answer: ResolverAnswer) {
  const typeName = dnsTypeName(answer.type);
  const ttl = typeof answer.ttl === "number" ? `; TTL ${answer.ttl}s` : "";
  return `${typeName} ${answer.data}${ttl}`;
}

function dnsTypeName(type: number) {
  const entries: Array<[DNSRecordType, number]> = [
    ["A", 1],
    ["NS", 2],
    ["CNAME", 5],
    ["SOA", 6],
    ["MX", 15],
    ["TXT", 16],
    ["AAAA", 28],
    ["CAA", 257],
  ];

  for (let index = 0; index < entries.length; index += 1) {
    if (entries[index][1] === type) {
      return entries[index][0];
    }
  }

  return `TYPE${type}`;
}

function getDnsStatusMessage(status: number | undefined, matched: boolean, hasOtherAnswers: boolean) {
  if (matched) {
    return "Matching record returned.";
  }

  if (status === 0) {
    return hasOtherAnswers
      ? "NOERROR: answer data was returned, but none matched the requested record type."
      : "NOERROR: the resolver returned no matching record in the Answer section.";
  }

  const messages: Record<number, string> = {
    1: "FORMERR: the DNS query could not be interpreted.",
    2: "SERVFAIL: the resolver could not complete resolution.",
    3: "NXDOMAIN: the queried DNS name does not exist according to this resolver.",
    4: "NOTIMP: the requested DNS operation is not implemented.",
    5: "REFUSED: the resolver refused the query.",
  };

  if (typeof status === "number" && messages[status]) {
    return messages[status];
  }

  return "No matching DNS answer was returned.";
}

function responseCodeLabel(status: number) {
  const labels: Record<number, string> = {
    0: "NOERROR",
    1: "FORMERR",
    2: "SERVFAIL",
    3: "NXDOMAIN",
    4: "NOTIMP",
    5: "REFUSED",
  };

  return labels[status] || "RCODE";
}

function isAbortError(err: unknown) {
  return (
    typeof DOMException !== "undefined" &&
    err instanceof DOMException &&
    err.name === "AbortError"
  );
}
/* PURE HELPERS END */
