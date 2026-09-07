"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CIDRResult = {
  inputAddress: string;
  canonicalCidr: string;
  prefixLength: number;
  prefixBase: string;
  rangeEnd: string;
  directedBroadcast: string;
  subnetMask: string;
  wildcardMask: string;
  firstUsable: string;
  lastUsable: string;
  totalAddresses: number;
  typicalUsableAddresses: number;
  inputWasPrefixBase: boolean;
  usageNote: string;
};

const sampleCIDR = "192.168.1.10/24";

export default function ToolClient() {
  const [input, setInput] = useState(sampleCIDR);
  const [result, setResult] = useState<CIDRResult | null>(null);
  const [error, setError] = useState("");

  function calculateCIDR() {
    try {
      const nextResult = calculateIPv4Cidr(input);
      setResult(nextResult);
      setError("");
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Unable to calculate this CIDR block.");
    }
  }

  function loadExample() {
    setInput(sampleCIDR);
    setResult(null);
    setError("");
  }

  function resetAll() {
    setInput("");
    setResult(null);
    setError("");
  }

  return (
    <ToolShell
      title="CIDR Calculator"
      description="Resolve IPv4 prefix boundaries, masks, host ranges, and /31 or /32 address semantics."
    >
      <section className="space-y-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-medium text-gray-700">
            IPv4 address with prefix
          </label>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setResult(null);
                setError("");
              }}
              placeholder={sampleCIDR}
              spellCheck={false}
              className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />

            <button
              type="button"
              onClick={calculateCIDR}
              className="yoryantra-btn min-h-[44px] whitespace-nowrap"
            >
              Calculate CIDR
            </button>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Enter strict dotted-decimal IPv4 CIDR notation, for example 10.0.5.19/20 or 192.168.1.10/24.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
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
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
              <h2 className="text-xl font-semibold text-gray-900">
                IPv4 block from {result.inputAddress}/{result.prefixLength}
              </h2>

              {!result.inputWasPrefixBase && (
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  The entered address sits inside the block. Its canonical CIDR starts at {result.canonicalCidr}.
                </p>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              <ResultRow label="Canonical CIDR" value={result.canonicalCidr} />
              <ResultRow label="Prefix base" value={result.prefixBase} />
              <ResultRow label="Range end" value={result.rangeEnd} />
              <ResultRow label="Directed broadcast" value={result.directedBroadcast} />
              <ResultRow label="Subnet mask" value={result.subnetMask} />
              <ResultRow label="Wildcard mask" value={result.wildcardMask} />
              <ResultRow label="First usable / endpoint" value={result.firstUsable} />
              <ResultRow label="Last usable / endpoint" value={result.lastUsable} />
              <ResultRow label="Total addresses" value={result.totalAddresses.toLocaleString()} />
              <ResultRow
                label="Typical usable addresses"
                value={result.typicalUsableAddresses.toLocaleString()}
              />
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-600 sm:px-6">
              {result.usageNote}
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
            <h2 className="font-semibold text-gray-900">What the prefix changes</h2>
            <p className="mt-2">
              IPv4 has 32 bits. A /24 fixes the first 24 bits as the network prefix and leaves 8 bits for addresses inside that block. A /20 leaves 12 address bits; a /32 leaves none.
            </p>
            <p className="mt-3">
              CIDR replaced class-based assumptions with explicit prefix lengths. RFC 4632 remains the useful background reference for IPv4 CIDR addressing and aggregation.{" "}
              <a
                href="https://www.rfc-editor.org/rfc/rfc4632.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-2"
              >
                Read RFC 4632
              </a>
              .
            </p>
          </div>

          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
            <h2 className="font-semibold text-amber-950">Before assigning every calculated address</h2>
            <p className="mt-2">
              The generic host count is subnet math, not a promise that every platform lets you assign every address. Cloud providers, appliances, and managed networks can reserve additional addresses inside a subnet.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why /31 and /32 do not follow the usual two-address subtraction
          </h2>

          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              For ordinary IPv4 subnets from /0 through /30, the prefix-base address identifies the subnet and the all-ones host value is the directed broadcast, so the familiar host count subtracts two addresses.
            </p>
            <p>
              RFC 3021 makes a deliberate exception for /31 on point-to-point links: both addresses are interpreted as host endpoints and there is no directed broadcast on that link. A /32 identifies one address rather than a multi-address subnet.{" "}
              <a
                href="https://www.rfc-editor.org/rfc/rfc3021.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-2"
              >
                RFC 3021 explains the /31 case
              </a>
              .
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading a result before it becomes a firewall or VPC rule
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              title="Prefix base"
              text="The first address produced when the host bits are cleared. CIDR configuration should normally be written from this boundary."
            />
            <InfoCard
              title="Wildcard mask"
              text="The bitwise inverse of the subnet mask. Some ACL and routing syntaxes use it, but many cloud interfaces expect CIDR instead."
            />
            <InfoCard
              title="Usable range"
              text="A generic host-assignment view. Confirm platform-specific reservations, point-to-point semantics, and address-policy rules before deployment."
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-600">
          <h2 className="font-semibold text-gray-900">Processing boundary</h2>
          <p className="mt-2">
            The calculation is local browser arithmetic. Entered CIDR values are not sent to a lookup service or resolver.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/cidr-calculator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 px-5 py-4 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)]">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="break-words font-mono text-sm text-gray-900">{value}</div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}

/* PURE HELPERS START */
function calculateIPv4Cidr(input: string): CIDRResult {
  const parsed = parseIPv4Cidr(input);
  const mask = prefixToMask(parsed.prefixLength);
  const wildcard = (~mask) >>> 0;
  const prefixBase = (parsed.ipNumber & mask) >>> 0;
  const rangeEnd = (prefixBase | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - parsed.prefixLength);

  let directedBroadcast: string;
  let firstUsableNumber: number;
  let lastUsableNumber: number;
  let typicalUsableAddresses: number;
  let usageNote: string;

  if (parsed.prefixLength <= 30) {
    directedBroadcast = numberToIPv4(rangeEnd);
    firstUsableNumber = prefixBase + 1;
    lastUsableNumber = rangeEnd - 1;
    typicalUsableAddresses = totalAddresses - 2;
    usageNote =
      "Traditional IPv4 subnet semantics reserve the prefix-base and directed-broadcast addresses. A platform may reserve more addresses than this generic calculation.";
  } else if (parsed.prefixLength === 31) {
    directedBroadcast = "None on an RFC 3021 point-to-point link";
    firstUsableNumber = prefixBase;
    lastUsableNumber = rangeEnd;
    typicalUsableAddresses = 2;
    usageNote =
      "RFC 3021 allows both /31 addresses to be host endpoints on a point-to-point link. Do not assume the same behavior for an arbitrary shared LAN or an older implementation.";
  } else {
    directedBroadcast = "Not applicable to a single-address /32 prefix";
    firstUsableNumber = prefixBase;
    lastUsableNumber = prefixBase;
    typicalUsableAddresses = 1;
    usageNote =
      "A /32 identifies one IPv4 address. It has no separate host range or directed-broadcast address.";
  }

  return {
    inputAddress: numberToIPv4(parsed.ipNumber),
    canonicalCidr: `${numberToIPv4(prefixBase)}/${parsed.prefixLength}`,
    prefixLength: parsed.prefixLength,
    prefixBase: numberToIPv4(prefixBase),
    rangeEnd: numberToIPv4(rangeEnd),
    directedBroadcast,
    subnetMask: numberToIPv4(mask),
    wildcardMask: numberToIPv4(wildcard),
    firstUsable: numberToIPv4(firstUsableNumber),
    lastUsable: numberToIPv4(lastUsableNumber),
    totalAddresses,
    typicalUsableAddresses,
    inputWasPrefixBase: parsed.ipNumber === prefixBase,
    usageNote,
  };
}

function parseIPv4Cidr(input: string) {
  const normalized = input.trim();
  const parts = normalized.split("/");

  if (parts.length !== 2) {
    throw new Error("Enter exactly one IPv4 CIDR value, such as 192.168.1.10/24.");
  }

  const ipPart = parts[0].trim();
  const prefixPart = parts[1].trim();

  if (!ipPart || !prefixPart) {
    throw new Error("Both the IPv4 address and prefix length are required.");
  }

  if (!/^\d{1,2}$/.test(prefixPart)) {
    throw new Error("CIDR prefix must be a whole number from 0 to 32.");
  }

  const prefixLength = Number(prefixPart);

  if (prefixLength < 0 || prefixLength > 32) {
    throw new Error("CIDR prefix must be between 0 and 32.");
  }

  return {
    ipNumber: ipv4ToNumber(ipPart),
    prefixLength,
  };
}

function ipv4ToNumber(ip: string) {
  const parts = ip.split(".");

  if (parts.length !== 4) {
    throw new Error("IPv4 addresses must contain four decimal octets.");
  }

  const octets = parts.map((part) => {
    if (!(part === "0" || /^[1-9]\d{0,2}$/.test(part))) {
      throw new Error("Use unambiguous decimal IPv4 octets without leading zeros.");
    }

    const value = Number(part);

    if (value < 0 || value > 255) {
      throw new Error("Each IPv4 octet must be between 0 and 255.");
    }

    return value;
  });

  return (
    octets[0] * 16777216 +
    octets[1] * 65536 +
    octets[2] * 256 +
    octets[3]
  ) >>> 0;
}

function numberToIPv4(value: number) {
  const normalized = value >>> 0;
  return [
    (normalized >>> 24) & 255,
    (normalized >>> 16) & 255,
    (normalized >>> 8) & 255,
    normalized & 255,
  ].join(".");
}

function prefixToMask(prefixLength: number) {
  if (prefixLength === 0) {
    return 0;
  }

  return (0xffffffff << (32 - prefixLength)) >>> 0;
}
/* PURE HELPERS END */
