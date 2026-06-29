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

type DnsResult = {
  recordType: string;
  answers: DnsAnswer[];
  error?: string;
};

const recordTypes = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SOA",
  "CAA",
];

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

export default function ToolClient() {
  const [domain, setDomain] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [results, setResults] = useState<DnsResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanDomain = (value: string) => {
    return value
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split("?")[0]
      .toLowerCase();
  };

  const fetchDnsRecord = async (
    targetDomain: string,
    recordType: string
  ): Promise<DnsResult> => {
    try {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
          targetDomain
        )}&type=${recordType}`,
        {
          headers: {
            accept: "application/dns-json",
          },
        }
      );

      if (!response.ok) {
        return {
          recordType,
          answers: [],
          error: "DNS lookup failed for this record type.",
        };
      }

      const data = await response.json();

      return {
        recordType,
        answers: data.Answer || [],
      };
    } catch {
      return {
        recordType,
        answers: [],
        error: "Unable to fetch this DNS record.",
      };
    }
  };

  const checkDnsRecords = async () => {
    const targetDomain = cleanDomain(domain);

    if (!targetDomain) {
      setError("Please enter a domain name.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    const typesToCheck =
      selectedType === "ALL" ? recordTypes : [selectedType];

    try {
      const dnsResults = await Promise.all(
        typesToCheck.map((type) => fetchDnsRecord(targetDomain, type))
      );

      setResults(dnsResults);
    } catch {
      setError("Unable to check DNS records for this domain.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setDomain("");
    setSelectedType("ALL");
    setResults([]);
    setError("");
  };

  const copyResults = () => {
    const output = results
      .map((result) => {
        const rows =
          result.answers.length > 0
            ? result.answers
                .map(
                  (answer) =>
                    `${typeLabels[answer.type] || result.recordType} | TTL: ${
                      answer.TTL
                    } | ${answer.data}`
                )
                .join("\n")
            : "No records found";

        return `${result.recordType} Records\n${rows}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(output);
  };

  const hasResults = results.length > 0;

  return (
    <ToolShell
      title="DNS Records Checker"
      description="Check DNS records including A, AAAA, CNAME, MX, TXT, NS, SOA, CAA, and domain configuration details."
    >
      {/* INPUT */}
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Domain Name
          </label>

          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Record Type
          </label>

          <YoryantraSelect
            value={selectedType}
            onChange={(value) => setSelectedType(value)}
            options={[
              {
                label: "All common records",
                value: "ALL",
              },
              ...recordTypes.map((type) => ({
                label: type,
                value: type,
              })),
            ]}
          />
        </div>
      </div>

      {/* ACTIONS */}
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

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

{/* OUTPUT */}
<div className="mt-8">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-semibold text-gray-900">
      DNS Lookup Results
    </h3>
  </div>

  {hasResults ? (
    <div className="yoryantra-output">
      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.recordType}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h4 className="font-semibold text-gray-900">
                {result.recordType} Records
              </h4>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {result.answers.length} found
              </span>
            </div>

            {result.error && (
              <p className="mt-3 text-sm text-red-600">
                {result.error}
              </p>
            )}

            {result.answers.length > 0 ? (
              <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        Type
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        TTL
                      </th>

                      <th className="px-4 py-3 font-semibold">
                        Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.answers.map((answer, index) => (
                      <tr
                        key={`${result.recordType}-${index}`}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {typeLabels[answer.type] ||
                            result.recordType}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {answer.TTL}
                        </td>

                        <td className="px-4 py-3 break-words text-gray-600">
                          {answer.data}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                No {result.recordType} records found for this domain.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
      DNS records will appear here after checking a domain.
    </pre>
  )}
</div>

      {/* NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          DNS Lookup Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          DNS records can vary depending on resolver, caching, propagation, and
          recent DNS changes. This tool uses DNS-over-HTTPS for browser-based
          lookup and is best for quick configuration checks.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking DNS Records for Domains and Infrastructure
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            DNS records control how a domain points to websites, mail servers,
            verification systems, security policies, and infrastructure
            services. A small DNS mistake can affect website availability,
            email delivery, domain verification, or application routing.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This DNS Records Checker helps developers, site owners, SEO teams,
            and DevOps users quickly inspect common DNS records such as A, AAAA,
            CNAME, MX, TXT, NS, SOA, and CAA records.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the DNS Records Checker
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a domain name such as example.com.</li>
            <li>Select all records or choose a specific DNS record type.</li>
            <li>Click <strong>Check DNS Records</strong>.</li>
            <li>Review record values, TTLs, and configuration details.</li>
            <li>Copy results if you need to share them with a developer or team.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            DNS Records Commonly Checked
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>A records point a domain to IPv4 addresses.</li>
            <li>AAAA records point a domain to IPv6 addresses.</li>
            <li>CNAME records point one hostname to another hostname.</li>
            <li>MX records define mail servers for email delivery.</li>
            <li>TXT records are used for verification, SPF, DKIM, DMARC, and other text-based values.</li>
            <li>NS records show the authoritative nameservers for a domain.</li>
            <li>SOA records contain administrative DNS zone information.</li>
            <li>CAA records control which certificate authorities can issue SSL certificates.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why DNS Records Matter
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Website routing:</strong>{" "}
                A, AAAA, and CNAME records control where website traffic goes.
              </li>

              <li>
                <strong>Email delivery:</strong>{" "}
                MX and TXT records affect email routing, sender verification, and spam protection.
              </li>

              <li>
                <strong>Domain verification:</strong>{" "}
                TXT records are often used by analytics, hosting, SEO, and SaaS platforms.
              </li>

              <li>
                <strong>Security and SSL:</strong>{" "}
                CAA records help control certificate issuance for a domain.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What are DNS records?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                DNS records are configuration entries that tell the internet how
                to route domain traffic, email, verification values, and other
                domain-related services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do DNS records sometimes look different?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                DNS results can vary due to caching, propagation delays,
                resolver differences, and recent changes made at the DNS
                provider.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which DNS records are important for email?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                MX records control mail routing. TXT records often contain SPF,
                DKIM, and DMARC values used for email authentication and
                deliverability.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for DevOps?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. DNS checks are useful when configuring hosting, CDN
                records, email services, SSL certificates, domain verification,
                and infrastructure routing.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/dns-records-checker" />
        </div>
      </section>
    </ToolShell>
  );
}
