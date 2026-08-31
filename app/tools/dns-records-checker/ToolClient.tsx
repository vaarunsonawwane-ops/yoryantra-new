"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type DnsAnswer = {
  name: string;
  type: number;
  TTL: number;
  data: string;
};

type DnsJsonResponse = {
  Status?: number;
  TC?: boolean;
  RD?: boolean;
  RA?: boolean;
  AD?: boolean;
  CD?: boolean;
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
  Comment?: string;
};

type DnsResult = {
  recordType: string;
  status: number | null;
  statusLabel: string;
  answers: DnsAnswer[];
  authority: DnsAnswer[];
  authenticatedData: boolean | null;
  error?: string;
};

const recordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "CAA"];

const typeLabels: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  257: "CAA",
};

const dnsStatusLabels: Record<number, string> = {
  0: "NOERROR",
  1: "FORMERR",
  2: "SERVFAIL",
  3: "NXDOMAIN",
  4: "NOTIMP",
  5: "REFUSED",
};

export default function ToolClient() {
  const [domain, setDomain] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [queriedName, setQueriedName] = useState("");
  const [results, setResults] = useState<DnsResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkDnsRecords = async () => {
    const targetDomain = normalizeDnsName(domain);

    if (!targetDomain) {
      setError(
        "Enter a valid DNS name such as example.com, www.example.com, or _dmarc.example.com."
      );
      setResults([]);
      setQueriedName("");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setQueriedName(targetDomain);

    const typesToCheck = selectedType === "ALL" ? recordTypes : [selectedType];

    try {
      const dnsResults = await Promise.all(
        typesToCheck.map((type) => fetchDnsRecord(targetDomain, type))
      );
      setResults(dnsResults);
    } catch {
      setError("Unable to complete the DNS queries.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setDomain("");
    setSelectedType("ALL");
    setQueriedName("");
    setResults([]);
    setError("");
    setLoading(false);
  };

  const hasResults = results.length > 0;

  const copyResults = () => {
    if (!hasResults) return;
    navigator.clipboard.writeText(formatDnsReport(queriedName, results));
  };

  return (
    <ToolShell
      title="DNS Records Checker"
      description="Query A, AAAA, CNAME, MX, TXT, NS, SOA, and CAA records through Cloudflare DNS over HTTPS and inspect resolver answers and TTL values."
    >
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            DNS name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="example.com"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            The exact hostname matters: example.com and www.example.com can
            have different records. This tool does not automatically remove
            the www label.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Record type
          </label>
          <YoryantraSelect
            value={selectedType}
            onChange={(value) => setSelectedType(value)}
            options={[
              { label: "All common records", value: "ALL" },
              ...recordTypes.map((type) => ({ label: type, value: type })),
            ]}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={checkDnsRecords}
          disabled={loading}
          className="yoryantra-btn"
        >
          {loading ? "Checking..." : "Check DNS Records"}
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            DNS Lookup Results
          </h3>
        </div>

        {hasResults ? (
          <div className="yoryantra-output">
            <p className="mb-5 break-words text-sm text-gray-700">
              <strong>Queried name:</strong> {queriedName}
            </p>

            <div className="space-y-5">
              {results.map((result) => (
                <div
                  key={result.recordType}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {result.recordType} records
                    </h4>
                    <span className="text-sm text-gray-600">
                      DNS status:{" "}
                      <strong>
                        {result.status === null
                          ? "Request error"
                          : `${result.status} ${result.statusLabel}`}
                      </strong>
                    </span>
                  </div>

                  {result.error ? (
                    <p className="mt-4 text-sm leading-relaxed text-red-700">
                      {result.error}
                    </p>
                  ) : result.answers.length ? (
                    <div className="mt-4 space-y-3">
                      {result.answers.map((answer, index) => (
                        <div
                          key={`${answer.name}-${answer.type}-${answer.data}-${index}`}
                          className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                        >
                          <div className="grid gap-2 text-sm text-gray-700 md:grid-cols-[90px_90px_1fr]">
                            <p>
                              <strong>
                                {typeLabels[answer.type] || `TYPE${answer.type}`}
                              </strong>
                            </p>
                            <p>TTL {answer.TTL}s</p>
                            <p className="break-words font-mono text-xs leading-relaxed">
                              {formatRecordData(answer)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      {result.status === 0
                        ? "The resolver returned NOERROR but no answer records of this type."
                        : result.status === 3
                        ? "The resolver returned NXDOMAIN for this name."
                        : `No answer records were returned for this query.`}
                    </p>
                  )}

                  {result.authenticatedData !== null && (
                    <p className="mt-4 text-xs leading-relaxed text-gray-500">
                      Resolver AD flag: {result.authenticatedData ? "set" : "not set"}.
                      The AD flag reports authenticated DNS data from this recursive
                      resolver; it is not a complete DNSSEC audit of the zone.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
            DNS answers will appear here.
          </pre>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          External DNS lookup
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          DNS checks are not local-only. Your browser sends the DNS name and
          requested record type to Cloudflare&apos;s public DNS-over-HTTPS
          resolver. Results can reflect resolver caching and may differ from
          another resolver or an authoritative nameserver.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reading DNS Answers Without Guessing What They Mean
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A DNS lookup is a resolver view of a name at a point in time. A
            successful HTTP request to the DNS-over-HTTPS service does not mean
            the DNS query itself succeeded, so this page keeps the DNS response
            code visible. NOERROR with an empty answer is also different from
            NXDOMAIN: the first can mean the name exists but has no record of
            the requested type, while NXDOMAIN means the queried name does not
            exist according to the resolver.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Record Types
          </h2>
          <div className="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
            <Info title="A / AAAA" text="IPv4 and IPv6 address records." />
            <Info title="CNAME" text="Aliases one DNS name to another name." />
            <Info title="MX" text="Mail exchanger records, including preference values." />
            <Info title="TXT" text="Text data used by SPF, verification, DKIM-related names, and other systems." />
            <Info title="NS / SOA" text="Nameserver delegation and zone authority metadata." />
            <Info title="CAA" text="Indicates which certificate authorities may issue certificates for a name." />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Resolver and Format Limitations
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool uses Cloudflare&apos;s JSON DNS-over-HTTPS interface for
            practical browser access. Cloudflare notes that the JSON response
            format is not standardized by an IETF RFC and recommends DNS
            wireformat for critical applications that need a formally defined
            protocol representation.
          </p>
          <a
            href="https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/"
            target="_blank"
            rel="noreferrer noopener"
            className="yoryantra-btn-outline mt-4 inline-flex"
          >
            Cloudflare DoH JSON documentation
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/dns-records-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

async function fetchDnsRecord(
  targetDomain: string,
  recordType: string
): Promise<DnsResult> {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
        targetDomain
      )}&type=${encodeURIComponent(recordType)}`,
      { headers: { accept: "application/dns-json" } }
    );

    if (!response.ok) {
      return {
        recordType,
        status: null,
        statusLabel: "",
        answers: [],
        authority: [],
        authenticatedData: null,
        error: `Cloudflare DoH returned HTTP ${response.status}.`,
      };
    }

    const data = (await response.json()) as DnsJsonResponse;
    const status =
      typeof data.Status === "number" && Number.isInteger(data.Status)
        ? data.Status
        : null;

    return {
      recordType,
      status,
      statusLabel:
        status === null ? "Unknown" : dnsStatusLabels[status] || `RCODE ${status}`,
      answers: Array.isArray(data.Answer) ? data.Answer : [],
      authority: Array.isArray(data.Authority) ? data.Authority : [],
      authenticatedData: typeof data.AD === "boolean" ? data.AD : null,
      error:
        typeof data.Comment === "string" && data.Comment.trim()
          ? data.Comment.trim()
          : undefined,
    };
  } catch {
    return {
      recordType,
      status: null,
      statusLabel: "",
      answers: [],
      authority: [],
      authenticatedData: null,
      error: "The DNS-over-HTTPS request could not be completed.",
    };
  }
}

function normalizeDnsName(value: string) {
  let candidate = value.trim();
  if (!candidate) return "";

  try {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
      candidate = new URL(candidate).hostname;
    } else {
      candidate = candidate.split("/")[0].split("?")[0].split("#")[0];
      candidate = new URL(`https://${candidate}`).hostname;
    }
  } catch {
    return "";
  }

  candidate = candidate.replace(/\.$/, "").toLowerCase();

  if (
    !candidate ||
    candidate.length > 253 ||
    candidate.includes("..") ||
    /\s/.test(candidate)
  ) {
    return "";
  }

  const labels = candidate.split(".");
  if (
    labels.some(
      (label) =>
        !label ||
        label.length > 63 ||
        !/^[a-z0-9_-]+$/i.test(label) ||
        label.startsWith("-") ||
        label.endsWith("-")
    )
  ) {
    return "";
  }

  return candidate;
}

function formatRecordData(answer: DnsAnswer) {
  const type = typeLabels[answer.type] || "";

  if (type === "MX") {
    const match = answer.data.match(/^(\d+)\s+(.+)$/);
    if (match) return `priority ${match[1]} → ${match[2]}`;
  }

  if (type === "CAA") {
    const match = answer.data.match(/^(\d+)\s+(\S+)\s+(.+)$/);
    if (match) return `flags ${match[1]}, ${match[2]} ${match[3]}`;
  }

  return answer.data;
}

function formatDnsReport(name: string, results: DnsResult[]) {
  const lines = [`DNS name: ${name}`, ""];

  results.forEach((result) => {
    lines.push(
      `${result.recordType} — ${
        result.status === null
          ? "request error"
          : `${result.status} ${result.statusLabel}`
      }`
    );

    if (result.error) lines.push(`Note: ${result.error}`);

    if (result.answers.length) {
      result.answers.forEach((answer) => {
        lines.push(
          `${typeLabels[answer.type] || `TYPE${answer.type}`} | TTL ${answer.TTL}s | ${formatRecordData(
            answer
          )}`
        );
      });
    } else {
      lines.push("No answer records returned.");
    }

    if (result.authenticatedData !== null) {
      lines.push(`AD flag: ${result.authenticatedData ? "set" : "not set"}`);
    }

    lines.push("");
  });

  return lines.join("\n").trim();
}
