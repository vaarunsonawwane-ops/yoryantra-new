"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputFormat = "list" | "csv" | "json";

type CIDRDetails = {
  cidr: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableAddress: string;
  lastUsableAddress: string;
  subnetMask: string;
  wildcardMask: string;
  totalAddresses: number;
  usableAddresses: number;
  prefixLength: number;
  startNumber: number;
  endNumber: number;
};

const sampleCIDR = `192.168.1.0/29`;

const MAX_EXPANDED_ADDRESSES = 65536;

export default function ToolClient() {
  const [input, setInput] = useState(sampleCIDR);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [details, setDetails] = useState<CIDRDetails | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("list");
  const [includeNetworkAndBroadcast, setIncludeNetworkAndBroadcast] =
    useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const expandCIDRRange = () => {
    if (!input.trim()) {
      setError("Please enter a CIDR range.");
      setOutput("");
      setDetails(null);
      return;
    }

    try {
      const cidrDetails = parseCIDR(input.trim());
      const expandedAddresses = expandAddresses(cidrDetails, {
        includeNetworkAndBroadcast,
      });

      if (expandedAddresses.length > MAX_EXPANDED_ADDRESSES) {
        setError(
          `This CIDR range would generate ${expandedAddresses.length.toLocaleString()} addresses. Please use a smaller range or narrow the prefix before expanding.`
        );
        setOutput("");
        setDetails(cidrDetails);
        return;
      }

      setOutput(formatOutput(expandedAddresses, outputFormat));
      setDetails(cidrDetails);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to expand this CIDR range."
      );
      setOutput("");
      setDetails(null);
    }
  };

  const loadExample = () => {
    setInput(sampleCIDR);
    setOutput("");
    setError("");
    setDetails(null);
    setOutputFormat("list");
    setIncludeNetworkAndBroadcast(false);
    setShowDetails(true);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setDetails(null);
    setOutputFormat("list");
    setIncludeNetworkAndBroadcast(false);
    setShowDetails(true);
  };

  return (
    <ToolShell
      title="CIDR Range Expander"
      description="Expand IPv4 CIDR ranges into IP addresses, calculate subnet details, and copy clean IP lists directly in your browser."
    >
      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            CIDR Input
          </label>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={sampleCIDR}
            className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Enter one IPv4 CIDR block such as 192.168.1.0/29, 10.0.0.0/30, or
            172.16.5.128/28 to expand it into individual IP addresses.
          </p>
        </div>

        <div>
          <YoryantraSelect
            label="Output Format"
            value={outputFormat}
            onChange={(value) => {
              setOutputFormat(value as OutputFormat);
              setOutput("");
              setError("");
            }}
            options={[
              {
                label: "Line List",
                value: "list",
              },
              {
                label: "CSV",
                value: "csv",
              },
              {
                label: "JSON Array",
                value: "json",
              },
            ]}
          />

          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Range Options
            </h3>

            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={includeNetworkAndBroadcast}
                  onChange={(event) => {
                    setIncludeNetworkAndBroadcast(event.target.checked);
                    setOutput("");
                    setError("");
                  }}
                  className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Include network and broadcast
                  </span>

                  <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                    Include the first and last addresses in traditional IPv4
                    subnet ranges.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(event) => {
                    setShowDetails(event.target.checked);
                    setError("");
                  }}
                  className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Show subnet details
                  </span>

                  <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                    Display network, broadcast, usable host range, subnet mask,
                    and host count.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={expandCIDRRange} className="yoryantra-btn">
          Expand CIDR Range
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

      {details && showDetails && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            CIDR Details
          </h3>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <DetailRow label="CIDR Block" value={details.cidr} />
            <DetailRow label="Prefix Length" value={`/${details.prefixLength}`} />
            <DetailRow label="Network Address" value={details.networkAddress} />
            <DetailRow label="Broadcast Address" value={details.broadcastAddress} />
            <DetailRow label="First Usable IP" value={details.firstUsableAddress} />
            <DetailRow label="Last Usable IP" value={details.lastUsableAddress} />
            <DetailRow label="Subnet Mask" value={details.subnetMask} />
            <DetailRow label="Wildcard Mask" value={details.wildcardMask} />
            <DetailRow
              label="Total Addresses"
              value={details.totalAddresses.toLocaleString()}
            />
            <DetailRow
              label="Usable Addresses"
              value={details.usableAddresses.toLocaleString()}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Expanded IP Output
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[300px] whitespace-pre-wrap break-words">
          {output || "Expanded IP addresses will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        CIDR expansion happens directly in your browser. Your IP ranges are not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Expanding CIDR Blocks Into Individual IP Addresses
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CIDR notation is a compact way to describe a group of IP addresses.
            It is common in firewall rules, cloud networking, allowlists,
            routing tables, security groups, access control lists, and network
            documentation. A value like 192.168.1.0/29 represents a range, not
            just a single address.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CIDR Range Expander converts IPv4 CIDR blocks into individual
            IP addresses and also shows important subnet details. It helps when
            you need to review a subnet, prepare an allowlist, check firewall
            entries, debug access rules, or understand exactly which addresses a
            CIDR block covers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Expanding a CIDR Range Without Manual Subnet Math
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste an IPv4 CIDR block into the input box.</li>
            <li>Select whether network and broadcast addresses should be included.</li>
            <li>Choose line list, CSV, or JSON output format.</li>
            <li>
              Click <strong>Expand CIDR Range</strong> and copy the generated IP list.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CIDR Range Expander Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking which IP addresses are covered by a CIDR block.</li>
            <li>Preparing firewall, WAF, VPN, or proxy allowlists.</li>
            <li>Reviewing cloud security group and network ACL ranges.</li>
            <li>Debugging subnet allocation and address planning issues.</li>
            <li>Converting CIDR notation into CSV or JSON for scripts and tools.</li>
            <li>Documenting internal network ranges for operations teams.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example CIDR Expansion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Input:
192.168.1.0/29

Output without network and broadcast:
192.168.1.1
192.168.1.2
192.168.1.3
192.168.1.4
192.168.1.5
192.168.1.6

Details:
Network: 192.168.1.0
Broadcast: 192.168.1.7
Subnet mask: 255.255.255.248
Total addresses: 8
Usable addresses: 6`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding Network and Broadcast Addresses
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            In traditional IPv4 subnetting, the first address in a subnet is the
            network address and the last address is the broadcast address. These
            two addresses are usually not assigned to hosts in normal subnet
            planning, which is why the tool can exclude them by default.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Some modern cloud and point-to-point networking situations may treat
            addresses differently, so the tool lets you include the network and
            broadcast addresses when you need the full raw range.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a CIDR range mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A CIDR range describes a group of IP addresses using an address
                and prefix length. For example, 192.168.1.0/29 represents 8
                total IPv4 addresses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support IPv6 CIDR ranges?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This version focuses on IPv4 CIDR expansion. IPv6 ranges can be
                extremely large, so they need a different interface and safety
                limits.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is there an expansion limit?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Large CIDR ranges can contain millions of addresses. The tool
                limits expansion to keep the browser responsive and prevent very
                large accidental output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I include network and broadcast addresses?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Enable the option to include the first and last addresses
                of the range in the expanded output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my IP ranges uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. CIDR expansion happens directly in your browser, and your IP
                ranges are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/dns-lookup" className="yoryantra-btn-outline">
              DNS Lookup
            </Link>

            <Link href="/tools/http-status-code-checker" className="yoryantra-btn-outline">
              HTTP Status Code Checker
            </Link>

            <Link href="/tools/security-headers-checker" className="yoryantra-btn-outline">
              Security Headers Checker
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}

function parseCIDR(input: string): CIDRDetails {
  const normalized = input.trim();

  if (!normalized.includes("/")) {
    throw new Error("CIDR input must include a prefix length, such as 192.168.1.0/24.");
  }

  const [ipPart, prefixPart] = normalized.split("/");

  if (!ipPart || !prefixPart) {
    throw new Error("Please enter a valid IPv4 CIDR range.");
  }

  const prefixLength = Number(prefixPart);

  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    throw new Error("CIDR prefix must be an integer from 0 to 32.");
  }

  const ipNumber = ipv4ToNumber(ipPart);
  const maskNumber = prefixToMask(prefixLength);
  const networkNumber = (ipNumber & maskNumber) >>> 0;
  const wildcardNumber = (~maskNumber) >>> 0;
  const broadcastNumber = (networkNumber | wildcardNumber) >>> 0;
  const totalAddresses = 2 ** (32 - prefixLength);

  const hasTraditionalUsableRange = prefixLength <= 30;
  const firstUsableNumber = hasTraditionalUsableRange
    ? networkNumber + 1
    : networkNumber;
  const lastUsableNumber = hasTraditionalUsableRange
    ? broadcastNumber - 1
    : broadcastNumber;
  const usableAddresses = hasTraditionalUsableRange
    ? Math.max(totalAddresses - 2, 0)
    : totalAddresses;

  return {
    cidr: `${numberToIPv4(networkNumber)}/${prefixLength}`,
    networkAddress: numberToIPv4(networkNumber),
    broadcastAddress: numberToIPv4(broadcastNumber),
    firstUsableAddress: numberToIPv4(firstUsableNumber),
    lastUsableAddress: numberToIPv4(lastUsableNumber),
    subnetMask: numberToIPv4(maskNumber),
    wildcardMask: numberToIPv4(wildcardNumber),
    totalAddresses,
    usableAddresses,
    prefixLength,
    startNumber: networkNumber,
    endNumber: broadcastNumber,
  };
}

function expandAddresses(
  details: CIDRDetails,
  options: {
    includeNetworkAndBroadcast: boolean;
  }
) {
  const start =
    options.includeNetworkAndBroadcast || details.prefixLength > 30
      ? details.startNumber
      : details.startNumber + 1;
  const end =
    options.includeNetworkAndBroadcast || details.prefixLength > 30
      ? details.endNumber
      : details.endNumber - 1;

  if (end < start) {
    return [];
  }

  const addresses: string[] = [];

  for (let current = start; current <= end; current += 1) {
    addresses.push(numberToIPv4(current));
  }

  return addresses;
}

function formatOutput(addresses: string[], format: OutputFormat) {
  if (format === "csv") {
    return addresses.join(",");
  }

  if (format === "json") {
    return JSON.stringify(addresses, null, 2);
  }

  return addresses.join("\n");
}

function ipv4ToNumber(ip: string) {
  const parts = ip.trim().split(".");

  if (parts.length !== 4) {
    throw new Error("Please enter a valid IPv4 address.");
  }

  const octets = parts.map((part) => {
    if (!/^\d+$/.test(part)) {
      throw new Error("IPv4 address can only contain numeric octets.");
    }

    const value = Number(part);

    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error("Each IPv4 octet must be between 0 and 255.");
    }

    return value;
  });

  return (
    ((octets[0] << 24) >>> 0) +
    ((octets[1] << 16) >>> 0) +
    ((octets[2] << 8) >>> 0) +
    octets[3]
  ) >>> 0;
}

function numberToIPv4(value: number) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join(".");
}

function prefixToMask(prefixLength: number) {
  if (prefixLength === 0) {
    return 0;
  }

  return (0xffffffff << (32 - prefixLength)) >>> 0;
}
