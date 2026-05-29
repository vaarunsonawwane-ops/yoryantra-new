"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type SplitMode = "prefix" | "count";
type OutputMode = "summary" | "table" | "json";

type SubnetDetails = {
  input: string;
  ipAddress: string;
  prefixLength: number;
  cidr: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableAddress: string;
  lastUsableAddress: string;
  subnetMask: string;
  wildcardMask: string;
  totalAddresses: number;
  usableAddresses: number;
  ipClass: string;
  ipType: string;
  binaryIp: string;
  binaryMask: string;
  binaryNetwork: string;
  startNumber: number;
  endNumber: number;
};

type SubnetSplit = {
  cidr: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableAddress: string;
  lastUsableAddress: string;
  totalAddresses: number;
  usableAddresses: number;
};

const sampleInput = "192.168.10.25/27";

const MAX_SPLIT_ROWS = 512;

export default function ToolClient() {
  const [input, setInput] = useState(sampleInput);
  const [splitMode, setSplitMode] = useState<SplitMode>("prefix");
  const [splitPrefix, setSplitPrefix] = useState("29");
  const [splitCount, setSplitCount] = useState("4");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [includeBinary, setIncludeBinary] = useState(true);
  const [includeSubnetSplits, setIncludeSubnetSplits] = useState(true);
  const [details, setDetails] = useState<SubnetDetails | null>(null);
  const [splits, setSplits] = useState<SubnetSplit[]>([]);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const calculateSubnet = () => {
    if (!input.trim()) {
      setError("Please enter an IPv4 address with CIDR prefix.");
      setDetails(null);
      setSplits([]);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextDetails = parseIPv4Subnet(input.trim());
      const nextSplits = includeSubnetSplits
        ? calculateSubnetSplits(nextDetails, {
            splitMode,
            splitPrefix,
            splitCount,
          })
        : [];

      const formattedOutput = formatSubnetOutput(nextDetails, nextSplits, {
        outputMode,
        includeBinary,
      });

      setDetails(nextDetails);
      setSplits(nextSplits);
      setOutput(formattedOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to calculate this IPv4 subnet."
      );
      setDetails(null);
      setSplits([]);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setSplitMode("prefix");
    setSplitPrefix("29");
    setSplitCount("4");
    setOutputMode("summary");
    setIncludeBinary(true);
    setIncludeSubnetSplits(true);
    setDetails(null);
    setSplits([]);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setSplitMode("prefix");
    setSplitPrefix("29");
    setSplitCount("4");
    setOutputMode("summary");
    setIncludeBinary(true);
    setIncludeSubnetSplits(true);
    setDetails(null);
    setSplits([]);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="IPv4 Subnet Calculator"
      description="Calculate IPv4 subnet details, CIDR ranges, subnet masks, wildcard masks, usable hosts, binary notation, and subnet splits directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          IPv4 Address / CIDR
        </label>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setDetails(null);
              setSplits([]);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={sampleInput}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <button onClick={calculateSubnet} className="yoryantra-btn">
            Calculate Subnet
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Enter an IPv4 address with CIDR prefix such as 192.168.10.25/27,
          10.0.0.0/24, or 172.16.5.128/26 to calculate network details.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={loadExample} className="yoryantra-btn-outline">
            Load Example
          </button>

          <button onClick={resetAll} className="yoryantra-btn-outline">
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Advanced Subnet Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output Format"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Summary",
                value: "summary",
              },
              {
                label: "Table Text",
                value: "table",
              },
              {
                label: "JSON",
                value: "json",
              },
            ]}
          />

          <YoryantraSelect
            label="Split Method"
            value={splitMode}
            onChange={(value) => {
              setSplitMode(value as SplitMode);
              setOutput("");
              setSplits([]);
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "By New Prefix",
                value: "prefix",
              },
              {
                label: "By Subnet Count",
                value: "count",
              },
            ]}
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {splitMode === "prefix" ? "New Prefix" : "Subnet Count"}
            </label>

            <input
              value={splitMode === "prefix" ? splitPrefix : splitCount}
              onChange={(event) => {
                if (splitMode === "prefix") {
                  setSplitPrefix(event.target.value);
                } else {
                  setSplitCount(event.target.value);
                }

                setOutput("");
                setSplits([]);
                setError("");
                setCopied(false);
              }}
              placeholder={splitMode === "prefix" ? "29" : "4"}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />

            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              {splitMode === "prefix"
                ? "Split the input subnet into smaller subnets using a longer prefix."
                : "Split the input subnet into the closest equal-size subnet count."}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeSubnetSplits}
              onChange={(event) => {
                setIncludeSubnetSplits(event.target.checked);
                setOutput("");
                setSplits([]);
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Include subnet splits
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Generate smaller subnet blocks inside the original IPv4 range.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeBinary}
              onChange={(event) => {
                setIncludeBinary(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Include binary notation
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Show binary IP, subnet mask, and network address for learning
                and debugging.
              </span>
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {details && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Subnet Summary
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Review the calculated IPv4 range, subnet mask, usable host range, and
            address counts.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DetailCard label="CIDR Block" value={details.cidr} />
            <DetailCard label="IP Address" value={details.ipAddress} />
            <DetailCard label="Prefix Length" value={`/${details.prefixLength}`} />
            <DetailCard label="Network Address" value={details.networkAddress} />
            <DetailCard label="Broadcast Address" value={details.broadcastAddress} />
            <DetailCard label="Subnet Mask" value={details.subnetMask} />
            <DetailCard label="Wildcard Mask" value={details.wildcardMask} />
            <DetailCard
              label="First Usable IP"
              value={details.firstUsableAddress}
            />
            <DetailCard
              label="Last Usable IP"
              value={details.lastUsableAddress}
            />
            <DetailCard
              label="Total Addresses"
              value={details.totalAddresses.toLocaleString()}
            />
            <DetailCard
              label="Usable Hosts"
              value={details.usableAddresses.toLocaleString()}
            />
            <DetailCard label="IP Type" value={details.ipType} />
          </div>
        </div>
      )}

      {details && includeBinary && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Binary Breakdown
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Binary values help explain how the prefix length creates the network
            and host portions of the address.
          </p>

          <div className="mt-4 space-y-3">
            <BinaryRow label="IP Address" decimal={details.ipAddress} binary={details.binaryIp} />
            <BinaryRow label="Subnet Mask" decimal={details.subnetMask} binary={details.binaryMask} />
            <BinaryRow
              label="Network Address"
              decimal={details.networkAddress}
              binary={details.binaryNetwork}
            />
          </div>
        </div>
      )}

      {splits.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Subnet Split Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            These smaller subnet blocks are calculated inside the original CIDR
            range. Large previews are capped to keep the browser responsive.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">CIDR</th>
                  <th className="px-4 py-3 font-semibold">Network</th>
                  <th className="px-4 py-3 font-semibold">Broadcast</th>
                  <th className="px-4 py-3 font-semibold">First Usable</th>
                  <th className="px-4 py-3 font-semibold">Last Usable</th>
                  <th className="px-4 py-3 font-semibold">Usable Hosts</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {splits.map((subnet) => (
                  <tr key={subnet.cidr}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                      {subnet.cidr}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {subnet.networkAddress}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {subnet.broadcastAddress}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {subnet.firstUsableAddress}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {subnet.lastUsableAddress}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {subnet.usableAddresses.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {splits.length === MAX_SPLIT_ROWS && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800">
              Split preview is capped at {MAX_SPLIT_ROWS.toLocaleString()} rows
              to keep the page responsive.
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Calculated Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[300px] whitespace-pre-wrap break-words">
          {output || "Subnet calculation output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        IPv4 subnet calculation happens directly in your browser. Your IP
        addresses and network ranges are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Calculating IPv4 Subnets for Network Planning
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            IPv4 subnetting is used to divide address space into smaller,
            manageable network ranges. It appears in firewall rules, route
            tables, VPN configurations, cloud VPCs, security groups, access
            control lists, DHCP scopes, and infrastructure documentation.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This advanced IPv4 Subnet Calculator takes an address with CIDR
            prefix and calculates the network address, broadcast address, usable
            host range, subnet mask, wildcard mask, binary notation, and optional
            subnet splits. It is designed for practical DevOps, networking, and
            security troubleshooting tasks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Advanced Subnet Calculator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter an IPv4 address with CIDR prefix, such as 192.168.10.25/27.</li>
            <li>Choose whether you want summary, table text, or JSON output.</li>
            <li>Enable binary notation when you want to inspect subnet math.</li>
            <li>Enable subnet splits to divide the range into smaller CIDR blocks.</li>
            <li>
              Click <strong>Calculate Subnet</strong> and copy the generated output.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common IPv4 Subnet Calculator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Calculating network and broadcast addresses from CIDR notation.</li>
            <li>Finding first and last usable host addresses.</li>
            <li>Converting prefix length into subnet mask and wildcard mask.</li>
            <li>Splitting a larger network into smaller subnets.</li>
            <li>Planning cloud VPC, firewall, VPN, or ACL network ranges.</li>
            <li>Documenting internal networks for operations and security teams.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example IPv4 Subnet Calculation
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Input:
192.168.10.25/27

Calculated subnet:
CIDR: 192.168.10.0/27
Network: 192.168.10.0
Broadcast: 192.168.10.31
Subnet mask: 255.255.255.224
Wildcard mask: 0.0.0.31
First usable: 192.168.10.1
Last usable: 192.168.10.30
Total addresses: 32
Usable hosts: 30`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding Prefix Length and Subnet Masks
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CIDR prefix length tells you how many bits belong to the network
            portion of an IPv4 address. A /24 prefix means 24 network bits and 8
            host bits. The equivalent subnet mask is 255.255.255.0.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Smaller prefix numbers create larger networks. Larger prefix numbers
            create smaller networks. For example, /24 contains 256 total
            addresses, while /27 contains 32 total addresses.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is an IPv4 subnet calculator?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An IPv4 subnet calculator takes an IP address and CIDR prefix and
                calculates network details such as subnet mask, network address,
                broadcast address, usable host range, and address counts.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does CIDR prefix length mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CIDR prefix length is the number after the slash, such as /24 or
                /27. It defines how many bits are used for the network portion of
                the IPv4 address.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What are usable hosts?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                In traditional IPv4 subnetting, usable hosts are addresses
                between the network address and broadcast address. /31 and /32
                ranges are treated specially because they are often used for
                point-to-point or single-host scenarios.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this split a subnet into smaller subnets?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can split a subnet by choosing a longer prefix or by
                entering a desired subnet count. The preview is capped to keep
                the browser responsive.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support IPv6?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool focuses on IPv4 subnet calculation. IPv6 subnetting has
                different address sizes and needs a separate interface.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my IP addresses uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The calculation happens directly in your browser, and your IP
                addresses are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/cidr-range-expander" className="yoryantra-btn-outline">
              CIDR Range Expander
            </Link>

            <Link href="/tools/dns-lookup" className="yoryantra-btn-outline">
              DNS Lookup
            </Link>

            <Link href="/tools/security-headers-checker" className="yoryantra-btn-outline">
              Security Headers Checker
            </Link>

            <Link href="/tools/http-status-code-checker" className="yoryantra-btn-outline">
              HTTP Status Code Checker
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

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}

function BinaryRow({
  label,
  decimal,
  binary,
}: {
  label: string;
  decimal: string;
  binary: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{label}</div>
          <div className="mt-1 font-mono text-sm text-gray-600">{decimal}</div>
        </div>

        <div className="font-mono text-xs text-gray-600 md:text-right">
          {binary}
        </div>
      </div>
    </div>
  );
}

function parseIPv4Subnet(input: string): SubnetDetails {
  const normalized = input.trim();

  if (!normalized.includes("/")) {
    throw new Error("Input must include a CIDR prefix, such as 192.168.10.25/27.");
  }

  const parts = normalized.split("/");

  if (parts.length !== 2) {
    throw new Error("Please enter one IPv4 address with one CIDR prefix.");
  }

  const [ipPart, prefixPart] = parts;
  const prefixLength = Number(prefixPart);

  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    throw new Error("CIDR prefix must be an integer from 0 to 32.");
  }

  const ipNumber = ipv4ToNumber(ipPart);
  const maskNumber = prefixToMask(prefixLength);
  const wildcardNumber = (~maskNumber) >>> 0;
  const networkNumber = (ipNumber & maskNumber) >>> 0;
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
    input: normalized,
    ipAddress: numberToIPv4(ipNumber),
    prefixLength,
    cidr: `${numberToIPv4(networkNumber)}/${prefixLength}`,
    networkAddress: numberToIPv4(networkNumber),
    broadcastAddress: numberToIPv4(broadcastNumber),
    firstUsableAddress: numberToIPv4(firstUsableNumber),
    lastUsableAddress: numberToIPv4(lastUsableNumber),
    subnetMask: numberToIPv4(maskNumber),
    wildcardMask: numberToIPv4(wildcardNumber),
    totalAddresses,
    usableAddresses,
    ipClass: getIPv4Class(ipNumber),
    ipType: getIPv4Type(ipNumber),
    binaryIp: numberToBinaryIPv4(ipNumber),
    binaryMask: numberToBinaryIPv4(maskNumber),
    binaryNetwork: numberToBinaryIPv4(networkNumber),
    startNumber: networkNumber,
    endNumber: broadcastNumber,
  };
}

function calculateSubnetSplits(
  details: SubnetDetails,
  options: {
    splitMode: SplitMode;
    splitPrefix: string;
    splitCount: string;
  }
): SubnetSplit[] {
  let targetPrefix: number;

  if (options.splitMode === "prefix") {
    targetPrefix = Number(options.splitPrefix);

    if (
      !Number.isInteger(targetPrefix) ||
      targetPrefix < details.prefixLength ||
      targetPrefix > 32
    ) {
      throw new Error(
        `New prefix must be an integer from /${details.prefixLength} to /32.`
      );
    }
  } else {
    const requestedCount = Number(options.splitCount);

    if (!Number.isInteger(requestedCount) || requestedCount < 1) {
      throw new Error("Subnet count must be a positive integer.");
    }

    const powerOfTwoCount = nextPowerOfTwo(requestedCount);
    targetPrefix = details.prefixLength + Math.log2(powerOfTwoCount);

    if (targetPrefix > 32) {
      throw new Error("Subnet count is too large for this IPv4 range.");
    }
  }

  const subnetSize = 2 ** (32 - targetPrefix);
  const subnetCount = 2 ** (targetPrefix - details.prefixLength);
  const previewCount = Math.min(subnetCount, MAX_SPLIT_ROWS);
  const subnets: SubnetSplit[] = [];

  for (let index = 0; index < previewCount; index += 1) {
    const networkNumber = details.startNumber + index * subnetSize;
    const broadcastNumber = networkNumber + subnetSize - 1;
    const hasTraditionalUsableRange = targetPrefix <= 30;
    const firstUsableNumber = hasTraditionalUsableRange
      ? networkNumber + 1
      : networkNumber;
    const lastUsableNumber = hasTraditionalUsableRange
      ? broadcastNumber - 1
      : broadcastNumber;
    const usableAddresses = hasTraditionalUsableRange
      ? Math.max(subnetSize - 2, 0)
      : subnetSize;

    subnets.push({
      cidr: `${numberToIPv4(networkNumber)}/${targetPrefix}`,
      networkAddress: numberToIPv4(networkNumber),
      broadcastAddress: numberToIPv4(broadcastNumber),
      firstUsableAddress: numberToIPv4(firstUsableNumber),
      lastUsableAddress: numberToIPv4(lastUsableNumber),
      totalAddresses: subnetSize,
      usableAddresses,
    });
  }

  return subnets;
}

function formatSubnetOutput(
  details: SubnetDetails,
  splits: SubnetSplit[],
  options: {
    outputMode: OutputMode;
    includeBinary: boolean;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(
      {
        input: details.input,
        cidr: details.cidr,
        ipAddress: details.ipAddress,
        prefixLength: details.prefixLength,
        networkAddress: details.networkAddress,
        broadcastAddress: details.broadcastAddress,
        firstUsableAddress: details.firstUsableAddress,
        lastUsableAddress: details.lastUsableAddress,
        subnetMask: details.subnetMask,
        wildcardMask: details.wildcardMask,
        totalAddresses: details.totalAddresses,
        usableAddresses: details.usableAddresses,
        ipClass: details.ipClass,
        ipType: details.ipType,
        binary: options.includeBinary
          ? {
              ipAddress: details.binaryIp,
              subnetMask: details.binaryMask,
              networkAddress: details.binaryNetwork,
            }
          : undefined,
        subnetSplits: splits,
      },
      null,
      2
    );
  }

  if (options.outputMode === "table") {
    return [
      `CIDR: ${details.cidr}`,
      `IP Address: ${details.ipAddress}`,
      `Prefix Length: /${details.prefixLength}`,
      `Network Address: ${details.networkAddress}`,
      `Broadcast Address: ${details.broadcastAddress}`,
      `Subnet Mask: ${details.subnetMask}`,
      `Wildcard Mask: ${details.wildcardMask}`,
      `First Usable IP: ${details.firstUsableAddress}`,
      `Last Usable IP: ${details.lastUsableAddress}`,
      `Total Addresses: ${details.totalAddresses}`,
      `Usable Hosts: ${details.usableAddresses}`,
      `IP Class: ${details.ipClass}`,
      `IP Type: ${details.ipType}`,
      options.includeBinary ? `Binary IP: ${details.binaryIp}` : "",
      options.includeBinary ? `Binary Mask: ${details.binaryMask}` : "",
      options.includeBinary ? `Binary Network: ${details.binaryNetwork}` : "",
      splits.length > 0 ? "" : "",
      splits.length > 0 ? "Subnet Splits:" : "",
      ...splits.map(
        (subnet) =>
          `${subnet.cidr} | ${subnet.networkAddress} - ${subnet.broadcastAddress} | usable ${subnet.firstUsableAddress} - ${subnet.lastUsableAddress}`
      ),
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `IPv4 Subnet Summary`,
    `CIDR block: ${details.cidr}`,
    `Network: ${details.networkAddress}`,
    `Broadcast: ${details.broadcastAddress}`,
    `Subnet mask: ${details.subnetMask}`,
    `Wildcard mask: ${details.wildcardMask}`,
    `Usable range: ${details.firstUsableAddress} - ${details.lastUsableAddress}`,
    `Total addresses: ${details.totalAddresses.toLocaleString()}`,
    `Usable hosts: ${details.usableAddresses.toLocaleString()}`,
    `IP type: ${details.ipType}`,
    splits.length > 0
      ? `Subnet splits shown: ${splits.length.toLocaleString()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
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

function numberToBinaryIPv4(value: number) {
  return [
    ((value >>> 24) & 255).toString(2).padStart(8, "0"),
    ((value >>> 16) & 255).toString(2).padStart(8, "0"),
    ((value >>> 8) & 255).toString(2).padStart(8, "0"),
    (value & 255).toString(2).padStart(8, "0"),
  ].join(".");
}

function getIPv4Class(ipNumber: number) {
  const firstOctet = (ipNumber >>> 24) & 255;

  if (firstOctet <= 127) {
    return "Class A";
  }

  if (firstOctet <= 191) {
    return "Class B";
  }

  if (firstOctet <= 223) {
    return "Class C";
  }

  if (firstOctet <= 239) {
    return "Class D (multicast)";
  }

  return "Class E (reserved)";
}

function getIPv4Type(ipNumber: number) {
  const ip = numberToIPv4(ipNumber);
  const firstOctet = (ipNumber >>> 24) & 255;
  const secondOctet = (ipNumber >>> 16) & 255;

  if (ip === "0.0.0.0") {
    return "Unspecified";
  }

  if (ip === "255.255.255.255") {
    return "Limited broadcast";
  }

  if (firstOctet === 10) {
    return "Private";
  }

  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) {
    return "Private";
  }

  if (firstOctet === 192 && secondOctet === 168) {
    return "Private";
  }

  if (firstOctet === 127) {
    return "Loopback";
  }

  if (firstOctet === 169 && secondOctet === 254) {
    return "Link-local";
  }

  if (firstOctet >= 224 && firstOctet <= 239) {
    return "Multicast";
  }

  if (firstOctet >= 240) {
    return "Reserved";
  }

  return "Public";
}

function nextPowerOfTwo(value: number) {
  let result = 1;

  while (result < value) {
    result *= 2;
  }

  return result;
}
