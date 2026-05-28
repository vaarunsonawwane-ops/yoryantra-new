"use client";

import { useState } from "react";
import Link from "next/link";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import ToolShell from "@/app/components/ToolShell";

type DNSRecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SOA" | "CAA";

type ResolverResult = {
  resolver: string;
  status: "Found" | "Not found" | "Error";
  answers: string[];
  ttlValues: number[];
  message: string;
};

type DNSJsonAnswer = {
  name: string;
  type: number;
  TTL?: number;
  data: string;
};

type DNSJsonResponse = {
  Status?: number;
  Answer?: DNSJsonAnswer[];
  Authority?: DNSJsonAnswer[];
};

const recordTypes: DNSRecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SOA",
  "CAA",
];

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
  {
    name: "Google DNS",
    url: "https://dns.google/resolve",
  },
  {
    name: "Cloudflare DNS",
    url: "https://cloudflare-dns.com/dns-query",
  },
];

export default function ToolClient() {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState<DNSRecordType>("A");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const checkDNS = async () => {
    const normalizedDomain = normalizeDomain(domain);

    if (!normalizedDomain) {
      setError("Please enter a domain name to check.");
      setOutput("");
      return;
    }

    if (!isValidDomain(normalizedDomain)) {
      setError("Please enter a valid domain name, such as example.com.");
      setOutput("");
      return;
    }

    setIsChecking(true);
    setError("");
    setOutput("Checking DNS records...");

    try {
      const results = await Promise.all(
        resolvers.map((resolver) =>
          queryResolver(resolver.name, resolver.url, normalizedDomain, recordType)
        )
      );

      setOutput(formatReport(normalizedDomain, recordType, results));
      setError("");
    } catch {
      setError("Unable to complete the DNS propagation check.");
      setOutput("");
    } finally {
      setIsChecking(false);
    }
  };

  const loadExample = () => {
    setDomain("yoryantra.com");
    setRecordType("A");
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setDomain("");
    setRecordType("A");
    setOutput("");
    setError("");
    setIsChecking(false);
  };

  return (
    <ToolShell
      title="DNS Propagation Checker"
      description="Check DNS records across public resolvers and review DNS propagation results directly in your browser."
    >
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Domain Name
          </label>

          <input
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="example.com"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />

          <p className="mt-2 text-sm text-gray-500">
            Enter a domain or hostname without http:// or https://.
          </p>
        </div>

			<div>
			  <YoryantraSelect
				label="Record Type"
				value={recordType}
				onChange={(value) =>
				  setRecordType(value as DNSRecordType)
				}
				options={recordTypes.map((type) => ({
				  label: type,
				  value: type,
				}))}
			  />
			</div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={checkDNS}
          disabled={isChecking}
          className="yoryantra-btn disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChecking ? "Checking..." : "Check DNS"}
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            DNS Propagation Report
          </h3>

          {output && !isChecking && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "DNS propagation results will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        DNS propagation can vary by resolver, location, TTL, cache state, and
        record type. This browser check uses public DNS resolvers and should be
        treated as a practical debugging signal, not a guarantee from every
        network worldwide.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking DNS Propagation After Domain and Hosting Changes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            DNS propagation matters when you change nameservers, point a domain
            to new hosting, add verification TXT records, update MX records,
            configure CDN records, or move a website to a new provider. Some
            resolvers may show the new value quickly while others keep cached
            results until TTL expires.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This DNS Propagation Checker helps you check DNS records across
            public resolvers, review returned values, inspect TTL values, and
            compare propagation results for A, AAAA, CNAME, MX, TXT, NS, SOA,
            and CAA records directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing DNS Records Across Public Resolvers
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a domain or hostname.</li>
            <li>Select the DNS record type you want to check.</li>
            <li>
              Click <strong>Check DNS</strong>.
            </li>
            <li>Review resolver results, returned records, and TTL values.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common DNS Propagation Checker Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking A records after moving hosting or changing IP addresses.</li>
            <li>Verifying TXT records for Google Search Console, email, or domain ownership.</li>
            <li>Checking MX records after email provider changes.</li>
            <li>Reviewing CNAME records for CDN, app, or subdomain setup.</li>
            <li>Comparing resolver answers while DNS cache is still updating.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            DNS Record Types You Can Check
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`A      IPv4 address records
AAAA   IPv6 address records
CNAME  Alias records
MX     Mail exchange records
TXT    Verification, SPF, DKIM, and other text records
NS     Nameserver records
SOA    Start of authority records
CAA    Certificate authority authorization records`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a DNS propagation checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A DNS propagation checker queries DNS resolvers and shows which
                records they currently return for a domain. It helps you see
                whether recent DNS changes are visible from public resolvers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do different resolvers show different DNS results?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                DNS resolvers cache records based on TTL and refresh at
                different times. During propagation, one resolver may show the
                new value while another still has the previous cached value.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this check every location worldwide?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This browser tool checks selected public DNS resolvers. It
                is useful for quick debugging, but it does not represent every
                ISP or resolver in every country.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my domain query uploaded to Yoryantra servers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The lookup runs from your browser against public DNS-over-
                HTTPS resolver endpoints. Yoryantra does not receive your query.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/dns-records-checker"
              className="yoryantra-btn-outline"
            >
              DNS Records Checker
            </Link>

            <Link
              href="/tools/http-headers-checker"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Checker
            </Link>

            <Link
              href="/tools/security-headers-scanner"
              className="yoryantra-btn-outline"
            >
              Security Headers Scanner
            </Link>

            <Link
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

async function queryResolver(
  resolverName: string,
  resolverUrl: string,
  domain: string,
  recordType: DNSRecordType
): Promise<ResolverResult> {
  const url = new URL(resolverUrl);
  url.searchParams.set("name", domain);
  url.searchParams.set("type", recordType);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        accept: "application/dns-json",
      },
    });

    if (!response.ok) {
      return {
        resolver: resolverName,
        status: "Error",
        answers: [],
        ttlValues: [],
        message: `Resolver returned HTTP ${response.status}.`,
      };
    }

    const data = (await response.json()) as DNSJsonResponse;
    const answers = (data.Answer || []).filter(
      (answer) => answer.type === typeMap[recordType]
    );

    if (!answers.length) {
      return {
        resolver: resolverName,
        status: "Not found",
        answers: [],
        ttlValues: [],
        message: getDnsStatusMessage(data.Status),
      };
    }

    return {
      resolver: resolverName,
      status: "Found",
      answers: answers.map((answer) => cleanDnsAnswer(answer.data)),
      ttlValues: answers
        .map((answer) => answer.TTL)
        .filter((ttl): ttl is number => typeof ttl === "number"),
      message: "Record returned successfully.",
    };
  } catch {
    return {
      resolver: resolverName,
      status: "Error",
      answers: [],
      ttlValues: [],
      message:
        "Lookup failed. The resolver may be unavailable or blocked by the browser/network.",
    };
  }
}

function formatReport(
  domain: string,
  recordType: DNSRecordType,
  results: ResolverResult[]
) {
  const found = results.filter((result) => result.status === "Found").length;
  const notFound = results.filter((result) => result.status === "Not found").length;
  const errors = results.filter((result) => result.status === "Error").length;

  const uniqueAnswers = Array.from(
    new Set(results.flatMap((result) => result.answers))
  ).sort();

  const lines = [
    "DNS propagation check completed.",
    "",
    `Domain: ${domain}`,
    `Record type: ${recordType}`,
    `Resolvers checked: ${results.length}`,
    `Found: ${found}`,
    `Not found: ${notFound}`,
    `Errors: ${errors}`,
    "",
    "Unique answers:",
  ];

  if (uniqueAnswers.length) {
    uniqueAnswers.forEach((answer) => {
      lines.push(`- ${answer}`);
    });
  } else {
    lines.push("No matching records found.");
  }

  lines.push("");
  lines.push("Resolver results:");
  lines.push("");

  results.forEach((result) => {
    lines.push(`${result.resolver}`);
    lines.push(`Status: ${result.status}`);
    lines.push(`Message: ${result.message}`);

    if (result.answers.length) {
      lines.push("Answers:");
      result.answers.forEach((answer) => {
        lines.push(`  - ${answer}`);
      });
    }

    if (result.ttlValues.length) {
      lines.push(`TTL values: ${result.ttlValues.join(", ")} seconds`);
    }

    lines.push("");
  });

  if (uniqueAnswers.length > 1) {
    lines.push(
      "Note: Different answers were returned. DNS may still be propagating, or different resolvers may be receiving different record sets."
    );
  } else if (found > 0 && errors === 0) {
    lines.push("Note: Checked resolvers returned a consistent matching result.");
  }

  return lines.join("\n").trim();
}

function normalizeDomain(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

function isValidDomain(value: string) {
  if (!value || value.length > 253) {
    return false;
  }

  return /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i.test(value);
}

function cleanDnsAnswer(value: string) {
  return value.replace(/^"|"$/g, "").replace(/\\"/g, '"');
}

function getDnsStatusMessage(status?: number) {
  const messages: Record<number, string> = {
    0: "No matching answer was returned.",
    1: "DNS format error.",
    2: "DNS server failure.",
    3: "Domain or record does not exist.",
    4: "DNS query type is not implemented.",
    5: "DNS query was refused.",
  };

  if (typeof status === "number" && status in messages) {
    return messages[status];
  }

  return "No matching answer was returned.";
}
