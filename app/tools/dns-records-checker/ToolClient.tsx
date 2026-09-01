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
  truncated: boolean | null;
  recursionAvailable: boolean | null;
  comment: string;
  requestError: string;
};

const RECORD_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SOA",
  "CAA",
];

const TYPE_LABELS: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  257: "CAA",
};

const DNS_STATUS_LABELS: Record<number, string> = {
  0: "NOERROR",
  1: "FORMERR",
  2: "SERVFAIL",
  3: "NXDOMAIN",
  4: "NOTIMP",
  5: "REFUSED",
};

function typeLabel(type: number) {
  return TYPE_LABELS[type] || `TYPE${type}`;
}

function normalizeDnsName(value: string) {
  let candidate = value.trim();

  if (!candidate) {
    return "";
  }

  try {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
      const parsed = new URL(candidate);
      candidate = parsed.hostname;
    } else {
      candidate = candidate
        .split("/")[0]
        .split("?")[0]
        .split("#")[0];

      const parsed = new URL(`https://${candidate}`);
      candidate = parsed.hostname;
    }
  } catch {
    return "";
  }

  candidate = candidate
    .replace(/\.$/, "")
    .toLowerCase();

  if (
    !candidate ||
    candidate.length > 253 ||
    candidate.indexOf("..") !== -1 ||
    /\s/.test(candidate)
  ) {
    return "";
  }

  const labels = candidate.split(".");

  for (const label of labels) {
    if (
      !label ||
      label.length > 63 ||
      !/^[a-z0-9_-]+$/i.test(label) ||
      label.charAt(0) === "-" ||
      label.charAt(label.length - 1) === "-"
    ) {
      return "";
    }
  }

  return candidate;
}

function normalizeDnsTarget(value: string) {
  return value.replace(/\.$/, "");
}

function formatRecordData(answer: DnsAnswer) {
  const type = typeLabel(answer.type);

  if (type === "MX") {
    const match = answer.data.match(/^(\d+)\s+(.+)$/);

    if (match) {
      const target = normalizeDnsTarget(match[2]);

      if (target === "") {
        return `priority ${match[1]} → .`;
      }

      return `priority ${match[1]} → ${target}`;
    }
  }

  if (type === "CNAME" || type === "NS") {
    return normalizeDnsTarget(answer.data);
  }

  if (type === "CAA") {
    const match = answer.data.match(
      /^(\d+)\s+(\S+)\s+(.+)$/
    );

    if (match) {
      return `flags ${match[1]}, tag ${match[2]}, value ${match[3]}`;
    }
  }

  if (type === "SOA") {
    const parts = answer.data.split(/\s+/);

    if (parts.length >= 7) {
      return [
        `primary ${normalizeDnsTarget(parts[0])}`,
        `responsible ${normalizeDnsTarget(parts[1])}`,
        `serial ${parts[2]}`,
        `refresh ${parts[3]}s`,
        `retry ${parts[4]}s`,
        `expire ${parts[5]}s`,
        `minimum ${parts[6]}s`,
      ].join(" · ");
    }
  }

  return answer.data;
}

function resultMeaning(result: DnsResult) {
  if (result.requestError) {
    return result.requestError;
  }

  if (result.status === 3) {
    return "NXDOMAIN: the recursive resolver says the queried DNS name does not exist.";
  }

  if (result.status === 0 && !result.answers.length) {
    if (result.authority.length) {
      return "NOERROR with no answer: the name may exist but no answer of this type was returned. Authority records below can explain the negative response.";
    }

    return "NOERROR with no answer: this is different from NXDOMAIN. The queried name may exist without this record type.";
  }

  if (result.status === 2) {
    return "SERVFAIL: the resolver could not complete the DNS resolution. DNSSEC validation failures, authoritative-server problems, or transient resolution issues are possible causes.";
  }

  if (result.status === 5) {
    return "REFUSED: the DNS server declined this query.";
  }

  if (result.answers.length) {
    return `${result.answers.length} answer record${
      result.answers.length === 1 ? "" : "s"
    } returned by this recursive resolver.`;
  }

  return `DNS response status: ${
    result.status === null
      ? "unknown"
      : `${result.status} ${result.statusLabel}`
  }.`;
}

function collectResultNotes(result: DnsResult) {
  const notes: string[] = [];

  if (result.recordType === "MX") {
    result.answers.forEach((answer) => {
      const match = answer.data.match(/^(\d+)\s+(.+)$/);

      if (
        match &&
        normalizeDnsTarget(match[2]) === ""
      ) {
        notes.push(
          "This MX answer uses the root target '.', which is the null MX convention indicating that the domain does not accept email."
        );
      }
    });
  }

  if (
    result.recordType === "CNAME" &&
    result.answers.some(
      (answer) => typeLabel(answer.type) !== "CNAME"
    )
  ) {
    notes.push(
      "The resolver response can include records reached through the alias chain in addition to the CNAME itself."
    );
  }

  if (
    result.recordType === "TXT" &&
    result.answers.length
  ) {
    notes.push(
      "TXT records are displayed as returned by the resolver. A single logical TXT value can be represented as multiple quoted character strings at the DNS protocol layer."
    );
  }

  if (result.authenticatedData === true) {
    notes.push(
      "The resolver set the AD (Authenticated Data) flag. That means this recursive resolver reports the returned data as DNSSEC-authenticated; it is not a full independent zone-security audit."
    );
  }

  if (result.authenticatedData === false) {
    notes.push(
      "The AD flag was not set. That alone does not prove the zone is unsigned or broken; it only describes this resolver response."
    );
  }

  if (result.truncated === true) {
    notes.push(
      "The DNS JSON response reports the TC (truncated) flag. For protocol-critical investigation, repeat the query with a DNS client that exposes wire-format behavior."
    );
  }

  return notes;
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
      {
        headers: {
          accept: "application/dns-json",
        },
      }
    );

    if (!response.ok) {
      return {
        recordType,
        status: null,
        statusLabel: "",
        answers: [],
        authority: [],
        authenticatedData: null,
        truncated: null,
        recursionAvailable: null,
        comment: "",
        requestError: `Cloudflare DNS-over-HTTPS returned HTTP ${response.status}.`,
      };
    }

    const data =
      (await response.json()) as DnsJsonResponse;
    const status =
      typeof data.Status === "number" &&
      Number.isInteger(data.Status)
        ? data.Status
        : null;

    return {
      recordType,
      status,
      statusLabel:
        status === null
          ? "Unknown"
          : DNS_STATUS_LABELS[status] ||
            `RCODE ${status}`,
      answers: Array.isArray(data.Answer)
        ? data.Answer
        : [],
      authority: Array.isArray(data.Authority)
        ? data.Authority
        : [],
      authenticatedData:
        typeof data.AD === "boolean"
          ? data.AD
          : null,
      truncated:
        typeof data.TC === "boolean"
          ? data.TC
          : null,
      recursionAvailable:
        typeof data.RA === "boolean"
          ? data.RA
          : null,
      comment:
        typeof data.Comment === "string"
          ? data.Comment.trim()
          : "",
      requestError: "",
    };
  } catch {
    return {
      recordType,
      status: null,
      statusLabel: "",
      answers: [],
      authority: [],
      authenticatedData: null,
      truncated: null,
      recursionAvailable: null,
      comment: "",
      requestError:
        "The DNS-over-HTTPS request could not be completed.",
    };
  }
}

function formatDnsReport(
  name: string,
  results: DnsResult[]
) {
  const lines = [
    `DNS name: ${name}`,
    `Resolver: Cloudflare DNS over HTTPS (JSON)`,
    "",
  ];

  results.forEach((result) => {
    lines.push(
      `${result.recordType} — ${
        result.status === null
          ? "request error"
          : `${result.status} ${result.statusLabel}`
      }`
    );

    lines.push(resultMeaning(result));

    if (result.comment) {
      lines.push(`Resolver comment: ${result.comment}`);
    }

    if (result.answers.length) {
      lines.push("Answers:");

      result.answers.forEach((answer) => {
        lines.push(
          `- ${typeLabel(answer.type)} | ${answer.name} | TTL ${answer.TTL}s | ${formatRecordData(
            answer
          )}`
        );
      });
    }

    if (result.authority.length) {
      lines.push("Authority:");

      result.authority.forEach((answer) => {
        lines.push(
          `- ${typeLabel(answer.type)} | ${answer.name} | TTL ${answer.TTL}s | ${formatRecordData(
            answer
          )}`
        );
      });
    }

    const notes = collectResultNotes(result);

    if (notes.length) {
      lines.push("Notes:");
      notes.forEach((note) =>
        lines.push(`- ${note}`)
      );
    }

    lines.push("");
  });

  return lines.join("\n").replace(/\s+$/, "");
}

export default function ToolClient() {
  const [domain, setDomain] =
    useState("");
  const [selectedType, setSelectedType] =
    useState("ALL");
  const [queriedName, setQueriedName] =
    useState("");
  const [results, setResults] =
    useState<DnsResult[]>([]);
  const [error, setError] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [copied, setCopied] =
    useState(false);

  const checkDnsRecords = async () => {
    const targetDomain =
      normalizeDnsName(domain);

    if (!targetDomain) {
      setError(
        "Enter a valid DNS name such as example.com, www.example.com, _dmarc.example.com, or a full URL whose hostname should be checked."
      );
      setResults([]);
      setQueriedName("");
      setCopied(false);
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setQueriedName(targetDomain);
    setCopied(false);

    const typesToCheck =
      selectedType === "ALL"
        ? RECORD_TYPES
        : [selectedType];

    try {
      const nextResults =
        await Promise.all(
          typesToCheck.map((recordType) =>
            fetchDnsRecord(
              targetDomain,
              recordType
            )
          )
        );

      setResults(nextResults);
    } catch {
      setError(
        "Unable to complete the DNS queries."
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setDomain("example.com");
    setSelectedType("ALL");
    setQueriedName("");
    setResults([]);
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setDomain("");
    setSelectedType("ALL");
    setQueriedName("");
    setResults([]);
    setError("");
    setLoading(false);
    setCopied(false);
  };

  const hasResults =
    results.length > 0;

  const copyResults = async () => {
    if (!hasResults) return;

    try {
      await navigator.clipboard.writeText(
        formatDnsReport(
          queriedName,
          results
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
        "The DNS report could not be copied. Select and copy the results manually."
      );
    }
  };

  return (
    <ToolShell
      title="DNS Records Checker"
      description="Query common DNS record types through Cloudflare DNS over HTTPS, then interpret the resolver response instead of treating every empty answer as the same failure."
    >
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            DNS name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(event: {
              target: { value: string };
            }) => {
              setDomain(event.target.value);
              setResults([]);
              setQueriedName("");
              setError("");
              setCopied(false);
            }}
            placeholder="example.com or _dmarc.example.com"
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            The exact DNS name matters.{" "}
            <code>example.com</code>,{" "}
            <code>www.example.com</code>, and{" "}
            <code>_dmarc.example.com</code> are different names and can
            legitimately return different records.
          </p>
        </div>

        <div>
          <YoryantraSelect
            label="Record type"
            value={selectedType}
            onChange={(value: string) => {
              setSelectedType(value);
              setResults([]);
              setQueriedName("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "All common records",
                value: "ALL",
              },
              ...RECORD_TYPES.map(
                (recordType) => ({
                  label: recordType,
                  value: recordType,
                })
              ),
            ]}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={checkDnsRecords}
          disabled={loading}
          className="yoryantra-btn disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Checking DNS..."
            : "Check DNS Records"}
        </button>

        <button
          type="button"
          onClick={copyResults}
          disabled={!hasResults}
          className="yoryantra-btn-outline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied
            ? "Copied"
            : "Copy Report"}
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">
          Resolver Results
        </h3>

        {hasResults ? (
          <div className="mt-4 space-y-5">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <strong>
                Queried name:
              </strong>{" "}
              <span className="font-mono">
                {queriedName}
              </span>
              <br />
              <strong>
                Resolver view:
              </strong>{" "}
              Cloudflare recursive DNS over HTTPS.
            </div>

            {results.map((result) => {
              const notes =
                collectResultNotes(result);

              return (
                <div
                  key={result.recordType}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {result.recordType}
                    </h4>
                    <span className="text-sm text-gray-600">
                      {result.status === null
                        ? "Request error"
                        : `${result.status} ${result.statusLabel}`}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {resultMeaning(result)}
                  </p>

                  {result.comment ? (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
                      Resolver comment:{" "}
                      {result.comment}
                    </div>
                  ) : null}

                  {result.answers.length ? (
                    <div className="mt-5">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Answer section
                      </div>
                      <div className="space-y-3">
                        {result.answers.map(
                          (answer, index) => (
                            <RecordRow
                              key={`${answer.name}-${answer.type}-${answer.data}-${index}`}
                              answer={answer}
                            />
                          )
                        )}
                      </div>
                    </div>
                  ) : null}

                  {result.authority.length ? (
                    <div className="mt-5">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Authority section
                      </div>
                      <div className="space-y-3">
                        {result.authority.map(
                          (answer, index) => (
                            <RecordRow
                              key={`authority-${answer.name}-${answer.type}-${answer.data}-${index}`}
                              answer={answer}
                            />
                          )
                        )}
                      </div>
                    </div>
                  ) : null}

                  {notes.length ? (
                    <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
                      {notes.map(
                        (note, index) => (
                          <li
                            key={`${note}-${index}`}
                          >
                            {note}
                          </li>
                        )
                      )}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <pre className="yoryantra-output mt-4 min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
            DNS answers, negative responses, TTLs, and authority data will appear here.
          </pre>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          This lookup leaves your browser
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-900/90">
          DNS cannot be inspected locally from an arbitrary browser page. When
          you run this tool, the DNS name and requested record type are sent to
          Cloudflare&apos;s public DNS-over-HTTPS resolver. The answer can reflect
          recursive-resolver caching and may differ from another resolver or
          from a direct query to the authoritative nameserver. Site-wide
          analytics or advertising scripts, if enabled, are separate from the
          DNS lookup.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              NOERROR With No Answer Is Not the Same Thing as “This Domain Does Not Exist”
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              DNS answers have a response code and one or more sections. A
              resolver can return <strong>NOERROR</strong> while leaving the
              answer section empty. That often means the queried name exists
              but does not have the record type you asked for. For example, a
              host might have an A record but no AAAA record.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              <strong>NXDOMAIN</strong> is different: it says the queried DNS
              name itself does not exist according to that resolver. Keeping
              these cases separate prevents a common troubleshooting mistake
              where “no MX records” gets reported as “the domain is broken.”
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="font-semibold text-gray-900">
              Authority records make negative answers more useful
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Negative DNS responses can include SOA information in the
              authority section. That data helps resolvers cache the negative
              result and can show which zone is authoritative for the answer.
              This checker displays authority records instead of throwing them
              away whenever the requested answer type is absent.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The Record Type Tells You What Question DNS Is Answering
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Info
              title="A / AAAA"
              text="Address records map a name to IPv4 or IPv6 addresses. Having one does not imply the other exists."
            />
            <Info
              title="CNAME"
              text="An alias points one DNS name at another name. The resolver can also return records reached through the alias chain."
            />
            <Info
              title="MX"
              text="Mail exchanger records include a preference number. Lower numbers are normally preferred. A null MX target of . explicitly says the domain does not accept mail."
            />
            <Info
              title="TXT"
              text="Generic text records carry SPF policy, verification values and other application data. DKIM usually lives at a selector-specific name, not automatically at the domain apex."
            />
            <Info
              title="NS / SOA"
              text="NS records identify authoritative nameservers; SOA carries zone authority and timing metadata such as serial, refresh and retry values."
            />
            <Info
              title="CAA"
              text="CAA can restrict which certificate authorities are authorized to issue certificates for a DNS name, subject to the CAA lookup rules used by certificate authorities."
            />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            TTL Is a Cache Lifetime, Not a Propagation Countdown
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The TTL shown with an answer tells a recursive resolver how long
            that record can be cached. After a DNS change, different resolvers
            can hold older cached answers for different amounts of time
            depending on when they queried the previous record.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            That is why “DNS propagation” rarely behaves like one global timer
            that finishes everywhere at the same second. A cached resolver view,
            an authoritative-server view and your operating system&apos;s local
            cache can all disagree temporarily.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            CNAME Answers Can Make an Address Query Look More Complicated Than Expected
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            If <code>www.example.com</code> is a CNAME, asking a recursive
            resolver for its A record can produce both the CNAME and address
            records for the final target. That is useful resolver behavior, but
            it means the answer section is not always made exclusively of the
            record type typed into the selector.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When debugging ownership or delegation rather than normal client
            resolution, query the exact CNAME, NS, or SOA type directly and, if
            necessary, compare the result with an authoritative nameserver.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            DNSSEC: the AD Flag Is Helpful but Narrow Evidence
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            DNSSEC allows a validating recursive resolver to cryptographically
            verify signed DNS data. In a DNS response, the AD flag indicates
            that the resolver considers the relevant data authenticated.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            An AD flag is not a complete DNSSEC audit. This page does not walk
            the chain of trust, inspect DS/DNSKEY records, compare validating
            resolvers, or diagnose why a SERVFAIL occurred. Treat AD as one
            resolver-provided signal, not as a security badge for the entire
            domain.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Public Recursive Resolver Is Not the Same View as the Authoritative Server
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool asks Cloudflare&apos;s recursive resolver. That is useful for
            answering “what would a normal recursive client currently see?”
            It is not the same as asking the authoritative nameserver directly.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you just changed an MX record and the authoritative server shows
            the new value while this checker shows the old one, caching may be
            the explanation. If the authoritative server itself has the wrong
            value, waiting for caches will not fix the configuration.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          Cloudflare&apos;s{" "}
          <a
            href="https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            DNS-over-HTTPS JSON documentation
          </a>{" "}
          is directly relevant because this browser tool uses that JSON
          interface. Cloudflare also notes that the JSON response format does
          not have a formal IETF RFC and recommends DNS wire format for
          protocol-critical applications.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/dns-records-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function RecordRow({
  answer,
}: {
  answer: DnsAnswer;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="grid gap-2 text-sm text-gray-700 md:grid-cols-[90px_1fr_100px]">
        <div className="font-semibold">
          {typeLabel(answer.type)}
        </div>
        <div className="min-w-0">
          <div className="break-all font-mono text-xs leading-relaxed">
            {formatRecordData(answer)}
          </div>
          <div className="mt-1 break-all text-xs text-gray-500">
            owner: {answer.name}
          </div>
        </div>
        <div className="text-xs text-gray-500 md:text-right">
          TTL {answer.TTL}s
        </div>
      </div>
    </div>
  );
}

function Info({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {text}
      </p>
    </div>
  );
}
