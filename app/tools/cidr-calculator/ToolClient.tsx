"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CIDRResult = {
 networkAddress: string;
 broadcastAddress: string;
 subnetMask: string;
 wildcardMask: string;
 firstUsable: string;
 lastUsable: string;
 totalHosts: number;
 usableHosts: number;
 cidr: number;
};

export default function ToolClient() {
 const [input, setInput] = useState("192.168.1.10/24");

 const [result, setResult] = useState<CIDRResult | null>(null);

 const [error, setError] = useState("");

 function ipToNumber(ip: string) {
 return ip
 .split(".")
 .map(Number)
 .reduce((acc, octet) => ((acc * 256) + octet) >>> 0, 0);
 }

 function numberToIp(num: number) {
 return [
 (num >>> 24) & 255,
 (num >>> 16) & 255,
 (num >>> 8) & 255,
 num & 255,
 ].join(".");
 }

 function isValidIPv4(ip: string) {
 const parts = ip.split(".");

 if (parts.length !== 4) {
 return false;
 }

 return parts.every((part) => {
 if (!/^\d{1,3}$/.test(part)) {
 return false;
 }

 const num = Number(part);

 return num >= 0 && num <= 255;
 });
 }

 function calculateCIDR() {
 try {
 setError("");
 setResult(null);

 const [ip, cidrString] = input.trim().split("/");

 if (!ip || !cidrString) {
 throw new Error(
 "Enter CIDR in format like 192.168.1.10/24"
 );
 }

 if (!isValidIPv4(ip)) {
 throw new Error("Invalid IPv4 address.");
 }

 if (!/^\d{1,2}$/.test(cidrString)) {
 throw new Error("CIDR prefix must be a whole number from 0 to 32.");
 }

 const cidr = Number(cidrString);

 if (cidr < 0 || cidr > 32) {
 throw new Error("CIDR prefix must be between 0 and 32.");
 }

 const ipNum = ipToNumber(ip);

 const mask =
 cidr === 0
 ? 0
 : (0xffffffff << (32 - cidr)) >>> 0;

 const wildcard = (~mask) >>> 0;

 const network = ipNum & mask;

 const broadcast = network | wildcard;

 const totalHosts = Math.pow(2, 32 - cidr);

 const usableHosts =
 cidr === 32
 ? 1
 : cidr === 31
 ? 2
 : totalHosts - 2;

 const firstUsable =
 cidr >= 31
 ? numberToIp(network)
 : numberToIp((network + 1) >>> 0);

 const lastUsable =
 cidr >= 31
 ? numberToIp(broadcast)
 : numberToIp((broadcast - 1) >>> 0);

 setResult({
 networkAddress: numberToIp(network),
 broadcastAddress: numberToIp(broadcast),
 subnetMask: numberToIp(mask),
 wildcardMask: numberToIp(wildcard),
 firstUsable,
 lastUsable,
 totalHosts,
 usableHosts,
 cidr,
 });
 } catch (err) {
 setError(
 err instanceof Error
 ? err.message
 : "Unable to calculate CIDR."
 );
 }
 }

 function resetAll() {
 setInput("");
 setResult(null);
 setError("");
 }

 return (
 <ToolShell
 title="CIDR Calculator"
 description="Calculate IPv4 network boundaries, subnet and wildcard masks, address ranges, and host counts from CIDR notation."
 >
 <section className="space-y-10">

 <div>
 <label className="block text-sm font-medium text-gray-700">
 CIDR Address
 </label>

 <input
 type="text"
 value={input}
 onChange={(event) =>
 setInput(event.target.value)
 }
 placeholder="192.168.1.10/24"
 className="mt-3 w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
 />

 <p className="mt-3 text-sm text-gray-500">
 Enter IPv4 CIDR notation like 10.0.0.1/16 or 192.168.1.1/24.
 </p>
 </div>

 <div className="flex flex-wrap gap-3">
 <button
 onClick={calculateCIDR}
 className="yoryantra-btn"
 >
 Calculate CIDR
 </button>

 <button
 onClick={resetAll}
 className="yoryantra-btn-outline"
 >
 Reset
 </button>
 </div>

 {error && (
 <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
 {error}
 </div>
 )}

 {result && (
 <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
 <div className="border-b border-gray-200 px-6 py-5">
 <h2 className="text-xl font-semibold text-gray-900">
 CIDR Calculation Result
 </h2>
 </div>

 <div className="divide-y divide-gray-100">

 <ResultRow
 label="Network Address"
 value={result.networkAddress}
 />

 <ResultRow
 label="Broadcast Address"
 value={result.broadcastAddress}
 />

 <ResultRow
 label="Subnet Mask"
 value={result.subnetMask}
 />

 <ResultRow
 label="Wildcard Mask"
 value={result.wildcardMask}
 />

 <ResultRow
 label="First Usable IP"
 value={result.firstUsable}
 />

 <ResultRow
 label="Last Usable IP"
 value={result.lastUsable}
 />

 <ResultRow
 label="Total Hosts"
 value={String(result.totalHosts)}
 />

 <ResultRow
 label="Usable Hosts"
 value={String(result.usableHosts)}
 />
 </div>
 </div>
 )}

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Understanding CIDR Notation and Subnets
 </h2>

 <div className="mt-4 space-y-5 text-gray-600 leading-relaxed">
 <p>
 CIDR stands for Classless Inter-Domain Routing. It is a compact
 way to represent IP ranges and subnet masks using slash notation.
 </p>

 <p>
 Network engineers, DevOps teams, cloud administrators, hosting
 providers, and infrastructure engineers commonly use CIDR blocks
 while configuring VPCs, firewalls, VPNs, routing rules, Docker
 networks, Kubernetes clusters, and internal infrastructure.
 </p>

 <p>
 CIDR calculations help determine usable IP ranges, broadcast
 addresses, network boundaries, and subnet capacities before
 deploying systems into production.
 </p>
 </div>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Common CIDR Examples
 </h2>

 <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 overflow-auto">
 <pre className="whitespace-pre-wrap break-words">
{`192.168.1.10/24
10.0.0.1/16
172.16.10.5/20
192.168.100.10/30`}
 </pre>
 </div>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Practical CIDR Use Cases
 </h2>

 <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
 <ul className="space-y-3 list-disc pl-5">
 <li>
 Designing internal VPC subnet ranges in AWS, Azure, or GCP.
 </li>

 <li>
 Planning Kubernetes cluster node and pod networking.
 </li>

 <li>
 Preparing firewall allowlists and routing tables.
 </li>

 <li>
 Troubleshooting overlapping subnet ranges.
 </li>

 <li>
 Allocating smaller subnet blocks for infrastructure environments.
 </li>

 <li>
 Understanding usable host capacity before deployment.
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
 What is CIDR notation?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 CIDR notation combines an IP address with a subnet prefix length,
 such as /24 or /16, to represent subnet ranges efficiently.
 </p>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900">
 What does /24 mean?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 A /24 subnet means the first 24 bits are used for the network
 portion, leaving 8 bits for host addresses.
 </p>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900">
 Why are usable hosts fewer than total hosts?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 Traditional IPv4 subnets from /0 through /30 reserve one network
 address and one broadcast address. A /31 can use both addresses
 on a point-to-point link, while a /32 represents one address.
 </p>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900">
 How are /31 and /32 ranges counted?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 This calculator treats a /31 as two usable point-to-point
 addresses and a /32 as one individual address. Some older
 systems may present /31 ranges differently.
 </p>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900">
 Is this CIDR calculator processed on the server?
 </h3>

 <p className="mt-2 text-gray-600 leading-relaxed">
 No. All subnet calculations happen directly inside your browser.
 Your IP ranges are not uploaded to a server.
 </p>
 </div>

 </div>
 </div>

 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Related Tools
 </h2>

 <YoryantraRelatedTools currentHref="/tools/cidr-calculator" />
 </div>

 </section>
 </ToolShell>
 );
}

function ResultRow({
 label,
 value,
}: {
 label: string;
 value: string;
}) {
 return (
 <div className="grid gap-2 px-6 py-4 md:grid-cols-[240px_1fr]">
 <div className="text-sm font-medium text-gray-700">
 {label}
 </div>

 <div className="font-mono text-sm text-gray-900 break-all">
 {value}
 </div>
 </div>
 );
}