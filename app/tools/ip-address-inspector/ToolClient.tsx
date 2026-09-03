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
  expanded: string;
  groups: number[];
  bytes: number[];
};

type RangeInfo = {
  prefix: string;
  bits: number;
  label: string;
  note: string;
  globallyReachable?: "Yes" | "No" | "Context-dependent";
};

const IPV4_RANGES: RangeInfo[] = [
  { prefix: "0.0.0.0", bits: 32, label: "This host on this network", note: "The all-zero IPv4 address is not a normal remote-host address.", globallyReachable: "No" },
  { prefix: "192.0.0.8", bits: 32, label: "IPv4 dummy address", note: "A special-purpose dummy address.", globallyReachable: "No" },
  { prefix: "192.0.0.9", bits: 32, label: "Port Control Protocol Anycast", note: "A globally reachable anycast address assigned for PCP.", globallyReachable: "Yes" },
  { prefix: "192.0.0.10", bits: 32, label: "TURN Anycast", note: "A globally reachable anycast address assigned for Traversal Using Relays around NAT.", globallyReachable: "Yes" },
  { prefix: "192.0.0.170", bits: 32, label: "NAT64/DNS64 Discovery", note: "One of the IPv4 addresses used for NAT64/DNS64 discovery.", globallyReachable: "No" },
  { prefix: "192.0.0.171", bits: 32, label: "NAT64/DNS64 Discovery", note: "One of the IPv4 addresses used for NAT64/DNS64 discovery.", globallyReachable: "No" },
  { prefix: "192.88.99.2", bits: 32, label: "6a44 Relay Anycast", note: "Special-purpose anycast address for the 6a44 mechanism.", globallyReachable: "No" },
  { prefix: "255.255.255.255", bits: 32, label: "Limited broadcast", note: "IPv4 limited broadcast address.", globallyReachable: "No" },

  { prefix: "192.0.0.0", bits: 29, label: "IPv4 Service Continuity Prefix", note: "A more-specific special-purpose block inside 192.0.0.0/24.", globallyReachable: "No" },

  { prefix: "100.64.0.0", bits: 10, label: "Shared Address Space", note: "Shared space commonly used for carrier-grade NAT. It is not RFC 1918 private-use space.", globallyReachable: "No" },
  { prefix: "172.16.0.0", bits: 12, label: "Private-Use (RFC 1918)", note: "Private address space used inside local networks.", globallyReachable: "No" },
  { prefix: "198.18.0.0", bits: 15, label: "Benchmarking", note: "Reserved for network-device benchmark testing.", globallyReachable: "No" },

  { prefix: "169.254.0.0", bits: 16, label: "Link Local", note: "Valid on the local link and not normally forwarded by routers.", globallyReachable: "No" },
  { prefix: "192.168.0.0", bits: 16, label: "Private-Use (RFC 1918)", note: "Private address space commonly used on local networks.", globallyReachable: "No" },

  { prefix: "192.0.0.0", bits: 24, label: "IETF Protocol Assignments", note: "A special-purpose protocol-assignment block. More-specific entries inside it can have different behavior.", globallyReachable: "No" },
  { prefix: "192.0.2.0", bits: 24, label: "Documentation (TEST-NET-1)", note: "Reserved for documentation and examples.", globallyReachable: "No" },
  { prefix: "192.31.196.0", bits: 24, label: "AS112-v4", note: "Special-purpose address space for AS112 service.", globallyReachable: "Yes" },
  { prefix: "192.52.193.0", bits: 24, label: "AMT", note: "Automatic Multicast Tunneling special-purpose block.", globallyReachable: "Yes" },
  { prefix: "192.88.99.0", bits: 24, label: "Deprecated 6to4 Relay Anycast", note: "Historical 6to4 relay anycast block. The general allocation was deprecated; a more-specific address still has a separate assignment.", globallyReachable: "Context-dependent" },
  { prefix: "192.175.48.0", bits: 24, label: "Direct Delegation AS112 Service", note: "Special-purpose address space for direct-delegation AS112 service.", globallyReachable: "Yes" },
  { prefix: "198.51.100.0", bits: 24, label: "Documentation (TEST-NET-2)", note: "Reserved for documentation and examples.", globallyReachable: "No" },
  { prefix: "203.0.113.0", bits: 24, label: "Documentation (TEST-NET-3)", note: "Reserved for documentation and examples.", globallyReachable: "No" },

  { prefix: "0.0.0.0", bits: 8, label: "This network", note: "Special-purpose IPv4 block associated with this network. More-specific entries can have different meaning.", globallyReachable: "No" },
  { prefix: "10.0.0.0", bits: 8, label: "Private-Use (RFC 1918)", note: "Private address space used inside local networks.", globallyReachable: "No" },
  { prefix: "127.0.0.0", bits: 8, label: "Loopback", note: "Refers back to the local host.", globallyReachable: "No" },

  { prefix: "224.0.0.0", bits: 4, label: "IPv4 multicast", note: "IPv4 multicast address space rather than ordinary unicast host addressing.", globallyReachable: "Context-dependent" },
  { prefix: "240.0.0.0", bits: 4, label: "Reserved", note: "IPv4 address space reserved by the protocol.", globallyReachable: "No" },
];

const IPV6_RANGES: RangeInfo[] = [
  { prefix: "::", bits: 128, label: "Unspecified Address", note: "Represents the absence of a specific IPv6 address.", globallyReachable: "No" },
  { prefix: "::1", bits: 128, label: "Loopback Address", note: "Refers back to the local host.", globallyReachable: "No" },
  { prefix: "2001:1::1", bits: 128, label: "Port Control Protocol Anycast", note: "Special-purpose globally reachable PCP anycast address.", globallyReachable: "Yes" },
  { prefix: "2001:1::2", bits: 128, label: "TURN Anycast", note: "Special-purpose globally reachable TURN anycast address.", globallyReachable: "Yes" },
  { prefix: "2001:1::3", bits: 128, label: "DNS-SD Service Registration Protocol Anycast", note: "Special-purpose globally reachable DNS-SD service-registration anycast address.", globallyReachable: "Yes" },

  { prefix: "::ffff:0:0", bits: 96, label: "IPv4-mapped IPv6", note: "Represents an IPv4 address in the final 32 bits of an IPv6-form address.", globallyReachable: "No" },
  { prefix: "64:ff9b::", bits: 96, label: "IPv4-IPv6 Translation", note: "Well-known translation prefix used by NAT64 mechanisms.", globallyReachable: "Yes" },

  { prefix: "100::", bits: 64, label: "Discard-Only Address Block", note: "Special-purpose discard-only IPv6 prefix.", globallyReachable: "No" },
  { prefix: "100:0:0:1::", bits: 64, label: "Dummy IPv6 Prefix", note: "Special-purpose dummy prefix.", globallyReachable: "No" },

  { prefix: "64:ff9b:1::", bits: 48, label: "IPv4-IPv6 Translation", note: "Local-use translation prefix.", globallyReachable: "No" },
  { prefix: "2001:2::", bits: 48, label: "Benchmarking", note: "Reserved for IPv6 benchmarking.", globallyReachable: "No" },
  { prefix: "2001:4:112::", bits: 48, label: "AS112-v6", note: "Special-purpose address space for AS112 service.", globallyReachable: "Yes" },
  { prefix: "2620:4f:8000::", bits: 48, label: "Direct Delegation AS112 Service", note: "Special-purpose address space for direct-delegation AS112 service.", globallyReachable: "Yes" },

  { prefix: "2001::", bits: 32, label: "TEREDO", note: "IPv6 transition-mechanism prefix.", globallyReachable: "Context-dependent" },
  { prefix: "2001:3::", bits: 32, label: "AMT", note: "Automatic Multicast Tunneling special-purpose prefix.", globallyReachable: "Yes" },
  { prefix: "2001:db8::", bits: 32, label: "Documentation", note: "Reserved for IPv6 documentation and examples.", globallyReachable: "No" },

  { prefix: "2001:20::", bits: 28, label: "ORCHIDv2", note: "Overlay Routable Cryptographic Hash Identifier space. It is not ordinary globally routed unicast space.", globallyReachable: "Yes" },
  { prefix: "2001:30::", bits: 28, label: "Drone Remote ID DETs Prefix", note: "Special-purpose prefix for Drone Remote ID protocol entity tags.", globallyReachable: "Yes" },

  { prefix: "3fff::", bits: 20, label: "Documentation", note: "Reserved for IPv6 documentation and examples.", globallyReachable: "No" },

  { prefix: "2002::", bits: 16, label: "6to4", note: "IPv6 transition-mechanism prefix.", globallyReachable: "Context-dependent" },
  { prefix: "5f00::", bits: 16, label: "Segment Routing (SRv6) SIDs", note: "Special-purpose prefix for SRv6 segment identifiers.", globallyReachable: "No" },

  { prefix: "fe80::", bits: 10, label: "Link-Local Unicast", note: "Valid on the local link and commonly paired with an interface zone identifier.", globallyReachable: "No" },
  { prefix: "fc00::", bits: 7, label: "Unique-Local", note: "Locally assigned IPv6 space that is not intended for global routing.", globallyReachable: "No" },
  { prefix: "ff00::", bits: 8, label: "IPv6 multicast", note: "IPv6 multicast address space rather than ordinary unicast host addressing.", globallyReachable: "Context-dependent" },

  { prefix: "2001::", bits: 23, label: "IETF Protocol Assignments", note: "Broad special-purpose IETF assignment block. More-specific ranges can have different behavior.", globallyReachable: "No" },
];

function parseIPv4(value: string): ParsedIPv4 | null {
  const parts = value.split(".");
  if (parts.length !== 4) return null;

  const bytes: number[] = [];

  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    if (part.length > 1 && part.charAt(0) === "0") return null;

    const octet = Number(part);

    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return null;
    }

    bytes.push(octet);
  }

  return {
    normalized: bytes.join("."),
    bytes,
  };
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

  left.forEach((group) => groups.push(parseInt(group, 16)));
  for (let index = 0; index < missing; index += 1) groups.push(0);
  right.forEach((group) => groups.push(parseInt(group, 16)));

  if (groups.length !== 8) return null;

  const bytes: number[] = [];

  groups.forEach((group) => {
    bytes.push((group >> 8) & 255, group & 255);
  });

  const mapped =
    groups.slice(0, 5).every((group) => group === 0) &&
    groups[5] === 0xffff
      ? [
          (groups[6] >> 8) & 255,
          groups[6] & 255,
          (groups[7] >> 8) & 255,
          groups[7] & 255,
        ].join(".")
      : "";

  return {
    normalized: mapped ? `::ffff:${mapped}` : compressIPv6(groups),
    expanded: groups.map((group) => group.toString(16).padStart(4, "0")).join(":"),
    groups,
    bytes,
  };
}

function compressIPv6(groups: number[]) {
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

  if (left && right) return `${left}::${right}`;
  if (left) return `${left}::`;
  if (right) return `::${right}`;
  return "::";
}

function matchesPrefix(bytes: number[], prefix: number[], bits: number) {
  const fullBytes = Math.floor(bits / 8);
  const remainingBits = bits % 8;

  for (let index = 0; index < fullBytes; index += 1) {
    if (bytes[index] !== prefix[index]) return false;
  }

  if (remainingBits === 0) return true;

  const mask = (255 << (8 - remainingBits)) & 255;

  return (
    (bytes[fullBytes] & mask) ===
    (prefix[fullBytes] & mask)
  );
}

function findIPv4Range(bytes: number[]) {
  const ordered = IPV4_RANGES.slice().sort((a, b) => b.bits - a.bits);

  for (const range of ordered) {
    const parsed = parseIPv4(range.prefix);

    if (
      parsed &&
      matchesPrefix(bytes, parsed.bytes, range.bits)
    ) {
      return range;
    }
  }

  return null;
}

function findIPv6Range(bytes: number[]) {
  const ordered = IPV6_RANGES.slice().sort((a, b) => b.bits - a.bits);

  for (const range of ordered) {
    const parsed = parseIPv6(range.prefix);

    if (
      parsed &&
      matchesPrefix(bytes, parsed.bytes, range.bits)
    ) {
      return range;
    }
  }

  return null;
}

function mappedIPv4(groups: number[]) {
  const isMapped =
    groups.slice(0, 5).every((group) => group === 0) &&
    groups[5] === 0xffff;

  if (!isMapped) return "";

  return [
    (groups[6] >> 8) & 255,
    groups[6] & 255,
    (groups[7] >> 8) & 255,
    groups[7] & 255,
  ].join(".");
}

function inIPv6Prefix(bytes: number[], prefix: string, bits: number) {
  const parsed = parseIPv6(prefix);
  return parsed ? matchesPrefix(bytes, parsed.bytes, bits) : false;
}

export default function ToolClient() {
  const [ip, setIp] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const inspectIP = () => {
    let value = ip.trim();

    setCopied(false);
    setError("");

    if (!value) {
      setOutput("");
      return;
    }

    if (value.indexOf("/") !== -1) {
      setOutput(
        "Enter one IP address without a CIDR prefix. Remove the /prefix when the goal is to inspect a single address."
      );
      return;
    }

    if (
      /^\[[^\]]+\]:\d+$/.test(value) ||
      /^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(value)
    ) {
      setOutput(
        "Enter the IP address only, without a TCP/UDP port. For example, use 2001:db8::1 instead of [2001:db8::1]:443."
      );
      return;
    }

    let bracketed = false;

    if (value.charAt(0) === "[" && value.charAt(value.length - 1) === "]") {
      bracketed = true;
      value = value.slice(1, -1);
    }

    let zone = "";
    const zoneIndex = value.indexOf("%");

    if (zoneIndex !== -1) {
      zone = value.slice(zoneIndex + 1);
      value = value.slice(0, zoneIndex);

      if (!zone || value.indexOf("%") !== -1 || /[\s/?#\[\]]/.test(zone)) {
        setOutput("Invalid IPv6 zone identifier syntax.");
        return;
      }
    }

    const ipv4 = parseIPv4(value);

    if (ipv4) {
      if (zone) {
        setOutput(
          "Zone identifiers are used with scoped IPv6 text forms, not IPv4 addresses."
        );
        return;
      }

      if (bracketed) {
        setOutput(
          "Square brackets are used around IPv6 literals in URI host notation. They are not valid around an IPv4 address here."
        );
        return;
      }

      const range = findIPv4Range(ipv4.bytes);
      const privateUse =
        matchesPrefix(ipv4.bytes, [10, 0, 0, 0], 8) ||
        matchesPrefix(ipv4.bytes, [172, 16, 0, 0], 12) ||
        matchesPrefix(ipv4.bytes, [192, 168, 0, 0], 16);

      const lines = [
        "Valid IPv4 address",
        "",
        `Normalized: ${ipv4.normalized}`,
        "Version: IPv4",
        `Private-use (RFC 1918): ${privateUse ? "Yes" : "No"}`,
        `Classification: ${
          range ? range.label : "No bundled special-purpose range matched"
        }`,
      ];

      if (range) {
        lines.push(`Matched range: ${range.prefix}/${range.bits}`);
        if (range.globallyReachable) {
          lines.push(`Globally reachable (registry/context): ${range.globallyReachable}`);
        }
        lines.push(`Note: ${range.note}`);
      } else {
        lines.push(
          "Note: No special-purpose match does not prove allocation, ownership, reachability, or that the address is currently routed on the public Internet."
        );
      }

      setOutput(lines.join("\n"));
      return;
    }

    const ipv6 = parseIPv6(value);

    if (ipv6) {
      const range = findIPv6Range(ipv6.bytes);
      const mapped = mappedIPv4(ipv6.groups);
      const uniqueLocal = inIPv6Prefix(ipv6.bytes, "fc00::", 7);
      const linkLocal = inIPv6Prefix(ipv6.bytes, "fe80::", 10);

      const lines = [
        "Valid IPv6 address",
        "",
        `Normalized: ${ipv6.normalized}`,
        `Expanded: ${ipv6.expanded}`,
        "Version: IPv6",
        `Unique-local: ${uniqueLocal ? "Yes" : "No"}`,
        `Link-local: ${linkLocal ? "Yes" : "No"}`,
        `Classification: ${
          range ? range.label : "No bundled special-purpose range matched"
        }`,
      ];

      if (range) {
        lines.push(`Matched range: ${range.prefix}/${range.bits}`);
        if (range.globallyReachable) {
          lines.push(`Globally reachable (registry/context): ${range.globallyReachable}`);
        }
        lines.push(`Note: ${range.note}`);
      } else {
        lines.push(
          "Note: No special-purpose match does not prove assignment, ownership, reachability, or that the address is globally routed."
        );
      }

      if (mapped) {
        lines.push(`Embedded IPv4: ${mapped}`);

        const parsedMapped = parseIPv4(mapped);
        const mappedRange = parsedMapped
          ? findIPv4Range(parsedMapped.bytes)
          : null;

        if (mappedRange) {
          lines.push(
            `Embedded IPv4 classification: ${mappedRange.label} (${mappedRange.prefix}/${mappedRange.bits})`
          );
        }
      }

      if (zone) {
        lines.push(
          `Zone identifier: ${zone} (interface/scope marker; not part of the 128-bit IPv6 address)`
        );

        if (!linkLocal && !(range && range.label === "IPv6 multicast")) {
          lines.push(
            "Zone note: zone identifiers are meaningful for scoped addresses. Confirm that the target API or operating system expects a zone for this address."
          );
        }
      }

      setOutput(lines.join("\n"));
      return;
    }

    setOutput(
      "Invalid IP address syntax. Accepted input includes strict dotted-decimal IPv4 and standard IPv6 forms with :: compression, IPv4-embedded IPv6, optional IPv6 brackets, and optional zone identifiers."
    );
  };

  const resetAll = () => {
    setIp("");
    setOutput("");
    setCopied(false);
    setError("");
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The inspection result could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="IP Address Inspector"
      description="Validate IPv4 and IPv6 text, normalize IPv6 notation, inspect IPv4-mapped addresses and zone identifiers, and recognize common special-purpose ranges without making ownership or geolocation claims."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          IP Address
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Enter one address such as <code>192.0.2.10</code>,{" "}
          <code>2001:db8::1</code>, <code>::ffff:192.0.2.10</code>, or{" "}
          <code>fe80::1%eth0</code>. Do not include a CIDR prefix or port.
        </p>

        <input
          value={ip}
          onChange={(event) => {
            setIp(event.target.value);
            setOutput("");
            setCopied(false);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") inspectIP();
          }}
          placeholder="2001:db8::1"
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={inspectIP} className="yoryantra-btn">
            Inspect IP
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="yoryantra-btn-outline"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              IP Inspection Result
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Classification uses a bundled set of common special-purpose
              ranges and chooses the most-specific matching prefix.
            </p>
          </div>

          {output ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="mt-4 yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output ||
            "Enter one IPv4 or IPv6 address to validate and inspect it."}
        </pre>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Valid Address Can Still Be the Wrong Address
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Syntax alone cannot tell you who owns an address, whether it is
            allocated, whether a route exists, or whether the host is reachable.
            Those questions require live registration, DNS, routing, or network
            information. Here, the address text is parsed locally and compared
            with a bundled set of special-purpose prefixes.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A lack of a special-purpose match should therefore be read as
            “nothing in this bundled list matched,” not as proof that an address
            is public, assigned, or safe to trust.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The Most Specific Prefix Wins
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Special-purpose registries contain broad blocks with smaller
            assignments inside them. <code>192.0.0.0/24</code>, for example,
            contains the more-specific <code>192.0.0.9/32</code> PCP anycast
            address and <code>192.0.0.10/32</code> TURN anycast address. Matching
            the broad /24 first would give the wrong classification, so ranges
            are checked from longest prefix to shortest.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            “Private,” “Shared,” and “Link-Local” Are Different Categories
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-700">
            <li>
              RFC 1918 private IPv4 space is <code>10.0.0.0/8</code>,{" "}
              <code>172.16.0.0/12</code>, and{" "}
              <code>192.168.0.0/16</code>.
            </li>
            <li>
              <code>100.64.0.0/10</code> is Shared Address Space, commonly
              associated with carrier-grade NAT. It is not RFC 1918 private
              space.
            </li>
            <li>
              <code>169.254.0.0/16</code> and <code>fe80::/10</code> are
              link-local. They are meaningful on a local link rather than as
              ordinary globally routed addresses.
            </li>
            <li>
              TEST-NET IPv4 ranges and IPv6 documentation prefixes exist so
              examples can avoid borrowing real production addresses.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            IPv6 Text Has Many Valid Spellings
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            IPv6 permits leading-zero omission and <code>::</code> compression.
            The normalized form follows RFC 5952: lowercase hexadecimal,
            suppressed leading zeroes, the longest eligible zero run compressed,
            and the first run chosen when two runs have the same length.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            IPv4-mapped IPv6 addresses are shown in mixed notation such as{" "}
            <code>::ffff:192.0.2.10</code>. RFC 5952 recommends that readable
            form when a well-known prefix identifies the embedded IPv4 address.
            The expanded line still shows all eight 16-bit groups when the raw
            bits are what you need to compare.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The normalization rules come from{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc5952"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 5952
            </a>, while the underlying IPv6 address forms are defined by RFC
            4291.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A Zone Identifier Belongs to the Local Interface Context
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Text such as <code>fe80::1%eth0</code> combines an IPv6 address with
            a host-specific zone identifier. The <code>%eth0</code> part is not
            one of the 128 address bits; it tells the local system which zone or
            interface applies to a scoped address.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 9844 now describes zone identifiers as a user-interface
            concern and completely obsoletes the older RFC 6874 URI approach.
            A raw operating-system form should not be assumed to be a portable
            URI host string. Zone names and numeric interface indexes can also
            differ from one machine to another.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="https://www.rfc-editor.org/rfc/rfc9844"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 9844 — Entering IPv6 Zone Identifiers in User Interfaces
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Strict Dotted Decimal Avoids Old IPv4 Ambiguities
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Each IPv4 octet is accepted only as one to three decimal digits
            from 0 through 255. Multi-digit values with a leading zero are
            rejected. Older APIs have accepted octal, hexadecimal, or shortened
            IPv4 forms, which can make the same text mean different things in
            different parsers. Strict dotted decimal avoids that ambiguity.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Special-Purpose Assignments Change Over Time
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The bundled classifications are a convenience snapshot, not a
            replacement for the registries. When an unusual range affects
            routing, filtering, abuse handling, or an allowlist, compare it
            with IANA's live{" "}
            <a
              href="https://www.iana.org/assignments/iana-ipv4-special-registry/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              IPv4 special-purpose registry
            </a>{" "}
            or{" "}
            <a
              href="https://www.iana.org/assignments/iana-ipv6-special-registry/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              IPv6 special-purpose registry
            </a>. IANA also records whether each registered block is valid as a
            source or destination, forwardable, and globally reachable.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Continue From the Address
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/ip-address-inspector" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
