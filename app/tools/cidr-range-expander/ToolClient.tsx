"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputFormat = "list" | "csv" | "json";

type CIDRDetails = {
  inputAddress: string;
  cidr: string;
  networkAddress: string;
  rangeEndAddress: string;
  directedBroadcastAddress: string;
  firstUsableAddress: string;
  lastUsableAddress: string;
  subnetMask: string;
  wildcardMask: string;
  totalAddresses: number;
  typicalUsableAddresses: number;
  prefixLength: number;
  startNumber: number;
  endNumber: number;
  inputWasPrefixBase: boolean;
};

type ExpansionBounds = {
  start: number;
  end: number;
  count: number;
  boundaryNote: string;
};

const sampleCIDR = "192.168.1.0/29";
const MAX_EXPANDED_ADDRESSES = 65536;

export default function ToolClient() {
  const [input, setInput] = useState(sampleCIDR);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [details, setDetails] = useState<CIDRDetails | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("list");
  const [includeBoundaryAddresses, setIncludeBoundaryAddresses] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  function expandCIDRRange() {
    if (!input.trim()) {
      setError("Enter an IPv4 CIDR block to expand.");
      setOutput("");
      setDetails(null);
      setCopied(false);
      return;
    }

    try {
      const nextDetails = parseCIDR(input);
      const bounds = getExpansionBounds(nextDetails, includeBoundaryAddresses);

      if (bounds.count > MAX_EXPANDED_ADDRESSES) {
        setDetails(nextDetails);
        setOutput("");
        setCopied(false);
        setError(
          `The selected output contains ${bounds.count.toLocaleString()} addresses, above the ${MAX_EXPANDED_ADDRESSES.toLocaleString()}-address browser limit. Choose a narrower prefix or exclude boundary addresses where that applies.`
        );
        return;
      }

      const addresses = expandAddresses(bounds.start, bounds.end);
      setOutput(formatOutput(addresses, outputFormat));
      setDetails(nextDetails);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to expand this CIDR block.");
      setOutput("");
      setDetails(null);
      setCopied(false);
    }
  }

  async function copyOutput() {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Copy failed. Select the generated output and copy it manually.");
    }
  }

  function loadExample() {
    setInput(sampleCIDR);
    setOutput("");
    setError("");
    setDetails(null);
    setOutputFormat("list");
    setIncludeBoundaryAddresses(false);
    setShowDetails(true);
    setCopied(false);
  }

  function resetAll() {
    setInput("");
    setOutput("");
    setError("");
    setDetails(null);
    setOutputFormat("list");
    setIncludeBoundaryAddresses(false);
    setShowDetails(true);
    setCopied(false);
  }

  const currentBounds = details
    ? getExpansionBounds(details, includeBoundaryAddresses)
    : null;

  return (
    <ToolShell
      title="CIDR Range Expander"
      description="Enumerate IPv4 addresses from a CIDR block with explicit boundary and output-size controls."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-medium text-gray-700">IPv4 CIDR block</label>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setOutput("");
              setDetails(null);
              setError("");
              setCopied(false);
            }}
            placeholder={sampleCIDR}
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <button
            type="button"
            onClick={expandCIDRRange}
            className="yoryantra-btn min-h-[44px] whitespace-nowrap"
          >
            Expand CIDR
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          A host address inside the block is accepted; output is normalized to the block's prefix boundary.
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

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Choose what gets emitted</h2>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output format"
            value={outputFormat}
            onChange={(value) => {
              setOutputFormat(value as OutputFormat);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Line list", value: "list" },
              { label: "CSV (one ip column)", value: "csv" },
              { label: "JSON array", value: "json" },
            ]}
          />

          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <div className="font-medium text-amber-950">Expansion safety limit</div>
            <p className="mt-1">
              Address count is checked before any list is allocated. Output above {MAX_EXPANDED_ADDRESSES.toLocaleString()} addresses is refused so a broad prefix cannot freeze the page.
            </p>
          </div>
        </div>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeBoundaryAddresses}
              onChange={(event) => {
                setIncludeBoundaryAddresses(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 shrink-0 h-4 w-4 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Include prefix-base and broadcast boundaries for /0–/30
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                /31 point-to-point prefixes keep both endpoints, and /32 always keeps its single address.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(event) => setShowDetails(event.target.checked)}
              className="mt-1 shrink-0 h-4 w-4 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Show subnet details</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Keep masks, boundaries, counts, and the normalized CIDR visible beside the generated list.
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

      {details && showDetails && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Block details before expansion</h2>

          {!details.inputWasPrefixBase && (
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {details.inputAddress}/{details.prefixLength} is inside the block; expansion starts from normalized {details.cidr}.
            </p>
          )}

          <div className="mt-4 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DetailCard label="Canonical CIDR" value={details.cidr} />
            <DetailCard label="Subnet mask" value={details.subnetMask} />
            <DetailCard label="Wildcard mask" value={details.wildcardMask} />
            <DetailCard label="Prefix base" value={details.networkAddress} />
            <DetailCard label="Range end" value={details.rangeEndAddress} />
            <DetailCard label="Directed broadcast" value={details.directedBroadcastAddress} />
            <DetailCard label="First usable / endpoint" value={details.firstUsableAddress} />
            <DetailCard label="Last usable / endpoint" value={details.lastUsableAddress} />
            <DetailCard label="Total addresses" value={details.totalAddresses.toLocaleString()} />
            <DetailCard label="Typical usable addresses" value={details.typicalUsableAddresses.toLocaleString()} />
            {currentBounds && (
              <DetailCard label="Selected output count" value={currentBounds.count.toLocaleString()} />
            )}
          </div>

          {currentBounds && (
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{currentBounds.boundaryNote}</p>
          )}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Expanded IP output</h2>

          {output && (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Expanded IPv4 addresses will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-600">
        Expansion is local browser arithmetic. The CIDR value is not sent to a network service.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A CIDR block is compact; an address list is not
          </h2>
          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              192.168.1.0/29 describes eight IPv4 addresses in a few characters. Expanding that block is useful when an allowlist, audit, spreadsheet, or script needs individual values rather than a prefix.
            </p>
            <p>
              The size doubles every time the prefix becomes one bit shorter. A /16 already contains 65,536 addresses; a /8 contains more than sixteen million. That growth is why the page refuses oversized output before constructing it.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Boundary addresses are a policy choice, not just a checkbox
          </h2>
          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Traditional IPv4 subnets from /0 through /30 normally keep the prefix-base address for the subnet itself and the all-ones host address for directed broadcast. Excluding those two values is therefore a sensible default for a generic host list.
            </p>
            <p>
              /31 is different. RFC 3021 permits both addresses as endpoints on a point-to-point link, so neither is removed here. /32 represents one address and is emitted as one address.{" "}
              <a
                href="https://www.rfc-editor.org/rfc/rfc3021.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-2"
              >
                RFC 3021 covers the /31 exception
              </a>
              .
            </p>
          </div>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">Why the input is normalized</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              10.0.0.37/24 and 10.0.0.0/24 describe the same /24 block. Host bits are cleared before expansion so the list always matches the actual prefix boundary.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">What CIDR itself standardizes</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              RFC 4632 documents the IPv4 CIDR addressing and aggregation model. Expansion into a text, CSV, or JSON list is an application convenience rather than part of the CIDR standard.{" "}
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
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Output formats have different downstream expectations
          </h2>
          <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
            <FormatCard title="Line list" text="One IP per line works well for simple allowlists, shell input, and visual review." />
            <FormatCard title="CSV" text="A single column named ip with CRLF rows is easier to import into spreadsheets and data tools than one comma-packed line." />
            <FormatCard title="JSON array" text="Quoted string values preserve each address cleanly for application configuration and scripts." />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/cidr-range-expander" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm text-gray-900">{value}</div>
    </div>
  );
}

function FormatCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}

/* PURE HELPERS START */
function parseCIDR(input: string): CIDRDetails {
  const normalized = input.trim();
  const parts = normalized.split("/");

  if (parts.length !== 2) {
    throw new Error("Enter exactly one IPv4 CIDR block, such as 192.168.1.0/29.");
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

  const ipNumber = ipv4ToNumber(ipPart);
  const maskNumber = prefixToMask(prefixLength);
  const networkNumber = (ipNumber & maskNumber) >>> 0;
  const wildcardNumber = (~maskNumber) >>> 0;
  const rangeEndNumber = (networkNumber | wildcardNumber) >>> 0;
  const totalAddresses = 2 ** (32 - prefixLength);

  let directedBroadcastAddress: string;
  let firstUsableNumber: number;
  let lastUsableNumber: number;
  let typicalUsableAddresses: number;

  if (prefixLength <= 30) {
    directedBroadcastAddress = numberToIPv4(rangeEndNumber);
    firstUsableNumber = networkNumber + 1;
    lastUsableNumber = rangeEndNumber - 1;
    typicalUsableAddresses = totalAddresses - 2;
  } else if (prefixLength === 31) {
    directedBroadcastAddress = "None on an RFC 3021 point-to-point link";
    firstUsableNumber = networkNumber;
    lastUsableNumber = rangeEndNumber;
    typicalUsableAddresses = 2;
  } else {
    directedBroadcastAddress = "Not applicable to a single-address /32 prefix";
    firstUsableNumber = networkNumber;
    lastUsableNumber = networkNumber;
    typicalUsableAddresses = 1;
  }

  return {
    inputAddress: numberToIPv4(ipNumber),
    cidr: `${numberToIPv4(networkNumber)}/${prefixLength}`,
    networkAddress: numberToIPv4(networkNumber),
    rangeEndAddress: numberToIPv4(rangeEndNumber),
    directedBroadcastAddress,
    firstUsableAddress: numberToIPv4(firstUsableNumber),
    lastUsableAddress: numberToIPv4(lastUsableNumber),
    subnetMask: numberToIPv4(maskNumber),
    wildcardMask: numberToIPv4(wildcardNumber),
    totalAddresses,
    typicalUsableAddresses,
    prefixLength,
    startNumber: networkNumber,
    endNumber: rangeEndNumber,
    inputWasPrefixBase: ipNumber === networkNumber,
  };
}

function getExpansionBounds(details: CIDRDetails, includeBoundaryAddresses: boolean): ExpansionBounds {
  if (details.prefixLength <= 30) {
    const start = includeBoundaryAddresses ? details.startNumber : details.startNumber + 1;
    const end = includeBoundaryAddresses ? details.endNumber : details.endNumber - 1;
    const count = end >= start ? end - start + 1 : 0;

    return {
      start,
      end,
      count,
      boundaryNote: includeBoundaryAddresses
        ? "The selected output includes both the prefix-base and directed-broadcast addresses."
        : "The selected output omits the traditional prefix-base and directed-broadcast addresses.",
    };
  }

  if (details.prefixLength === 31) {
    return {
      start: details.startNumber,
      end: details.endNumber,
      count: 2,
      boundaryNote:
        "Both /31 addresses are retained because RFC 3021 permits them as point-to-point endpoints; the boundary toggle does not remove either one.",
    };
  }

  return {
    start: details.startNumber,
    end: details.endNumber,
    count: 1,
    boundaryNote:
      "A /32 contains one address, so the boundary toggle does not change the output.",
  };
}

function expandAddresses(start: number, end: number) {
  if (end < start) {
    return [] as string[];
  }

  const addresses: string[] = [];

  for (let current = start; current <= end; current += 1) {
    addresses.push(numberToIPv4(current));
  }

  return addresses;
}

function formatOutput(addresses: string[], format: OutputFormat) {
  if (format === "csv") {
    return ["ip"].concat(addresses).join("\r\n");
  }

  if (format === "json") {
    return JSON.stringify(addresses, null, 2);
  }

  return addresses.join("\n");
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
