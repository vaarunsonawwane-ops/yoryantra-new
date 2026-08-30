"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ParsedIPv4 = {
  normalized: string;
  bytes: number[];
};

type ParsedIPv6 = {
  normalized: string;
  groups: number[];
  bytes: number[];
};

type RangeInfo = {
  prefix: string;
  bits: number;
  label: string;
  note: string;
};

const IPV4_RANGES: RangeInfo[] = [
  { prefix: "0.0.0.0", bits: 32, label: "Unspecified / this host", note: "Special address; not a normal remote host address." },
  { prefix: "255.255.255.255", bits: 32, label: "Limited broadcast", note: "IPv4 limited broadcast address." },
  { prefix: "10.0.0.0", bits: 8, label: "Private-use (RFC 1918)", note: "Private address space used inside local networks." },
  { prefix: "100.64.0.0", bits: 10, label: "Shared address space", note: "Shared space commonly used for carrier-grade NAT; it is not RFC 1918 private space." },
  { prefix: "127.0.0.0", bits: 8, label: "Loopback", note: "Refers back to the local host." },
  { prefix: "169.254.0.0", bits: 16, label: "Link-local", note: "Valid only on the local link; not normally routed." },
  { prefix: "172.16.0.0", bits: 12, label: "Private-use (RFC 1918)", note: "Private address space used inside local networks." },
  { prefix: "192.0.0.0", bits: 24, label: "IETF protocol assignments", note: "Special-purpose protocol assignment block; more-specific addresses can have their own behavior." },
  { prefix: "192.0.2.0", bits: 24, label: "Documentation (TEST-NET-1)", note: "Reserved for examples and documentation." },
  { prefix: "192.168.0.0", bits: 16, label: "Private-use (RFC 1918)", note: "Private address space commonly used on local networks." },
  { prefix: "198.18.0.0", bits: 15, label: "Benchmarking", note: "Reserved for network device benchmark testing." },
  { prefix: "198.51.100.0", bits: 24, label: "Documentation (TEST-NET-2)", note: "Reserved for examples and documentation." },
  { prefix: "203.0.113.0", bits: 24, label: "Documentation (TEST-NET-3)", note: "Reserved for examples and documentation." },
  { prefix: "224.0.0.0", bits: 4, label: "Multicast", note: "IPv4 multicast address space, not ordinary unicast host addressing." },
  { prefix: "240.0.0.0", bits: 4, label: "Reserved", note: "Reserved address space." },
];

const IPV6_RANGES: RangeInfo[] = [
  { prefix: "::", bits: 128, label: "Unspecified", note: "Represents the absence of a specific IPv6 address." },
  { prefix: "::1", bits: 128, label: "Loopback", note: "Refers back to the local host." },
  { prefix: "::ffff:0:0", bits: 96, label: "IPv4-mapped IPv6", note: "Carries an IPv4 address in the final 32 bits." },
  { prefix: "64:ff9b::", bits: 96, label: "IPv4/IPv6 translation", note: "Well-known translation prefix used by NAT64 mechanisms." },
  { prefix: "64:ff9b:1::", bits: 48, label: "IPv4/IPv6 translation", note: "Local-use translation prefix." },
  { prefix: "100::", bits: 64, label: "Discard-only", note: "Special discard-only IPv6 prefix." },
  { prefix: "100:0:0:1::", bits: 64, label: "Dummy IPv6 prefix", note: "Special-purpose dummy prefix." },
  { prefix: "2001::", bits: 32, label: "Teredo", note: "IPv6 transition mechanism prefix." },
  { prefix: "2001:2::", bits: 48, label: "Benchmarking", note: "Reserved for IPv6 benchmarking." },
  { prefix: "2001:20::", bits: 28, label: "ORCHIDv2", note: "Non-routed cryptographic identifier space." },
  { prefix: "2001:db8::", bits: 32, label: "Documentation", note: "Reserved for IPv6 examples and documentation." },
  { prefix: "2002::", bits: 16, label: "6to4", note: "IPv6 transition-mechanism prefix." },
  { prefix: "3fff::", bits: 20, label: "Documentation", note: "Reserved for IPv6 documentation and examples." },
  { prefix: "5f00::", bits: 16, label: "Segment Routing SIDs", note: "Special-purpose prefix for SRv6 segment identifiers." },
  { prefix: "fc00::", bits: 7, label: "Unique-local", note: "Locally assigned IPv6 space; it is not intended for global routing." },
  { prefix: "fe80::", bits: 10, label: "Link-local unicast", note: "Valid on the local link and commonly paired with an interface zone identifier." },
  { prefix: "ff00::", bits: 8, label: "Multicast", note: "IPv6 multicast address space, not ordinary unicast host addressing." },
];

function parseIPv4(value: string): ParsedIPv4 | null {
  const parts = value.split(".");
  if (parts.length !== 4) return null;

  const bytes: number[] = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    if (part.length > 1 && part.charAt(0) === "0") return null;
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null;
    bytes.push(octet);
  }

  return { normalized: bytes.join("."), bytes };
}

function parseIPv6(value: string): ParsedIPv6 | null {
  let address = value.toLowerCase();
  const doubleColonCount = (address.match(/::/g) || []).length;
  if (doubleColonCount > 1 || address.indexOf(":::") !== -1) return null;

  const lastColon = address.lastIndexOf(":");
  const possibleIPv4 = lastColon >= 0 ? address.slice(lastColon + 1) : "";
  if (possibleIPv4.indexOf(".") !== -1) {
    const parsedIPv4 = parseIPv4(possibleIPv4);
    if (!parsedIPv4) return null;
    const first = (parsedIPv4.bytes[0] << 8) | parsedIPv4.bytes[1];
    const second = (parsedIPv4.bytes[2] << 8) | parsedIPv4.bytes[3];
    address =
      address.slice(0, lastColon + 1) +
      first.toString(16) +
      ":" +
      second.toString(16);
  }

  const compressed = address.indexOf("::") !== -1;
  const halves = compressed ? address.split("::") : [address];
  if (halves.length > 2) return null;

  const left = halves[0] ? halves[0].split(":") : [];
  const right = compressed && halves[1] ? halves[1].split(":") : [];
  const rawGroups = left.concat(right);

  for (const group of rawGroups) {
    if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
  }

  if (!compressed && rawGroups.length !== 8) return null;
  if (compressed && rawGroups.length >= 8) return null;

  const missing = compressed ? 8 - rawGroups.length : 0;
  const groups: number[] = [];

  for (const group of left) groups.push(parseInt(group, 16));
  for (let index = 0; index < missing; index += 1) groups.push(0);
  for (const group of right) groups.push(parseInt(group, 16));

  if (groups.length !== 8) return null;

  const bytes: number[] = [];
  for (const group of groups) {
    bytes.push((group >> 8) & 255, group & 255);
  }

  return {
    normalized: compressIPv6(groups),
    groups,
    bytes,
  };
}

function compressIPv6(groups: number[]): string {
  const text = groups.map((group) => group.toString(16));
  let bestStart = -1;
  let bestLength = 0;

  for (let index = 0; index < groups.length; ) {
    if (groups[index] !== 0) {
      index += 1;
      continue;
    }

    let end = index;
    while (end < groups.length && groups[end] === 0) end += 1;
    const length = end - index;
    if (length >= 2 && length > bestLength) {
      bestStart = index;
      bestLength = length;
    }
    index = end;
  }

  if (bestStart === -1) return text.join(":");

  const left = text.slice(0, bestStart).join(":");
  const right = text.slice(bestStart + bestLength).join(":");
  if (left && right) return left + "::" + right;
  if (left) return left + "::";
  if (right) return "::" + right;
  return "::";
}

function matchesPrefix(bytes: number[], prefix: number[], bits: number): boolean {
  const fullBytes = Math.floor(bits / 8);
  const remainingBits = bits % 8;

  for (let index = 0; index < fullBytes; index += 1) {
    if (bytes[index] !== prefix[index]) return false;
  }

  if (remainingBits === 0) return true;
  const mask = (255 << (8 - remainingBits)) & 255;
  return (bytes[fullBytes] & mask) === (prefix[fullBytes] & mask);
}

function findIPv4Range(bytes: number[]): RangeInfo | null {
  for (const range of IPV4_RANGES) {
    const parsed = parseIPv4(range.prefix);
    if (parsed && matchesPrefix(bytes, parsed.bytes, range.bits)) return range;
  }
  return null;
}

function findIPv6Range(bytes: number[]): RangeInfo | null {
  for (const range of IPV6_RANGES) {
    const parsed = parseIPv6(range.prefix);
    if (parsed && matchesPrefix(bytes, parsed.bytes, range.bits)) return range;
  }
  return null;
}

function mappedIPv4(groups: number[]): string | null {
  const mapped = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 65535;
  if (!mapped) return null;
  return [
    (groups[6] >> 8) & 255,
    groups[6] & 255,
    (groups[7] >> 8) & 255,
    groups[7] & 255,
  ].join(".");
}

export default function ToolClient() {
  const [ip, setIp] = useState("");
  const [output, setOutput] = useState("");

  const inspectIP = () => {
    let value = ip.trim();
    if (!value) {
      setOutput("");
      return;
    }

    if (value.indexOf("/") !== -1) {
      setOutput("Enter one IP address without a CIDR prefix. Use the CIDR Calculator when you need network/prefix calculations.");
      return;
    }

    if (value.charAt(0) === "[" && value.charAt(value.length - 1) === "]") {
      value = value.slice(1, -1);
    }

    let zone = "";
    const zoneIndex = value.indexOf("%");
    if (zoneIndex !== -1) {
      zone = value.slice(zoneIndex + 1);
      value = value.slice(0, zoneIndex);
      if (!zone || value.indexOf("%") !== -1) {
        setOutput("Invalid IPv6 zone identifier syntax.");
        return;
      }
    }

    const ipv4 = parseIPv4(value);
    if (ipv4) {
      if (zone) {
        setOutput("Zone identifiers apply to scoped IPv6 text forms, not IPv4 addresses.");
        return;
      }

      const range = findIPv4Range(ipv4.bytes);
      const privateUse = range ? range.label.indexOf("Private-use") === 0 : false;
      const lines = [
        "Valid IPv4 address",
        "",
        "Normalized: " + ipv4.normalized,
        "Version: IPv4",
        "Private-use (RFC 1918): " + (privateUse ? "Yes" : "No"),
        "Classification: " + (range ? range.label : "No common special-purpose range matched"),
      ];

      if (range) {
        lines.push("Matched range: " + range.prefix + "/" + range.bits);
        lines.push("Note: " + range.note);
      } else {
        lines.push("Note: Syntax alone does not prove that an address is allocated, reachable, or owned by a particular network.");
      }

      setOutput(lines.join("\n"));
      return;
    }

    const ipv6 = parseIPv6(value);
    if (ipv6) {
      const range = findIPv6Range(ipv6.bytes);
      const mapped = mappedIPv4(ipv6.groups);
      const lines = [
        "Valid IPv6 address",
        "",
        "Normalized: " + ipv6.normalized,
        "Version: IPv6",
        "Unique-local: " + (range && range.label === "Unique-local" ? "Yes" : "No"),
        "Classification: " + (range ? range.label : "No common special-purpose range matched"),
      ];

      if (range) {
        lines.push("Matched range: " + range.prefix + "/" + range.bits);
        lines.push("Note: " + range.note);
      } else {
        lines.push("Note: Syntax alone does not prove global routability, assignment, or ownership.");
      }

      if (mapped) lines.push("Embedded IPv4: " + mapped);
      if (zone) lines.push("Zone identifier: " + zone + " (interface scope marker; not part of the 128-bit address)");

      setOutput(lines.join("\n"));
      return;
    }

    setOutput("Invalid IP address syntax. The inspector accepts strict dotted-decimal IPv4 and standard IPv6 forms, including :: compression and IPv4-mapped IPv6.");
  };

  const resetAll = () => {
    setIp("");
    setOutput("");
  };

  return (
    <ToolShell
      title="IP Address Inspector"
      description="Validate IPv4 and IPv6 syntax, normalize IPv6 notation, and recognize common special-purpose address ranges."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          IP Address
        </label>
        <input
          value={ip}
          onChange={(event) => setIp(event.target.value)}
          placeholder="2001:db8::1"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={inspectIP} className="yoryantra-btn">Inspect IP</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">IP Inspection Result</h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <div className="yoryantra-output min-h-[180px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Validation and range details will appear here."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What This Inspector Actually Checks</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The inspector parses one IPv4 or IPv6 address locally in your browser. IPv6 input can use normal zero compression such as <code>2001:db8::1</code>, the loopback form <code>::1</code>, bracketed address text, IPv4-mapped forms, and an optional zone identifier such as <code>fe80::1%eth0</code>.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            After syntax validation, it checks a practical set of IANA special-purpose ranges: private or unique-local space, loopback, link-local, documentation ranges, shared NAT space, benchmarking prefixes, multicast, transition prefixes, and a few protocol-reserved blocks. A syntactically valid address that matches none of these is not automatically proven to be publicly routed or assigned.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ranges Worth Recognizing</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`10.0.0.0/8          → IPv4 private-use
100.64.0.0/10       → shared / carrier-grade NAT space
127.0.0.0/8         → IPv4 loopback
169.254.0.0/16      → IPv4 link-local
192.0.2.0/24        → IPv4 documentation
::1/128             → IPv6 loopback
2001:db8::/32       → IPv6 documentation
fc00::/7            → IPv6 unique-local
fe80::/10           → IPv6 link-local
ff00::/8            → IPv6 multicast`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where the Result Helps</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking allowlist, firewall, proxy, VPN, and server configuration values.</li>
            <li>Catching an IPv6 parser that rejects valid <code>::</code>-compressed notation.</li>
            <li>Separating RFC 1918 private space from shared carrier NAT or documentation ranges.</li>
            <li>Recognizing when an example address should never be treated as a production endpoint.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Limits and References</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            This is an address parser, not an IP intelligence service. It does not contact WHOIS/RDAP, geolocation, ASN, DNS, reputation, or ISP services. Ownership and reachability can change and cannot be inferred from syntax alone.
          </p>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Range classifications follow the IANA IPv4 and IPv6 Special-Purpose Address Space registries and the IPv6 addressing architecture in RFC 4291.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/ip-address-inspector" />
        </div>
      </section>
    </ToolShell>
  );
}
