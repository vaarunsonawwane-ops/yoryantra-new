"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [ip, setIp] = useState("");
  const [output, setOutput] = useState("");

  const inspectIP = () => {
    const value = ip.trim();

    const ipv4Regex =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}$/;

    if (ipv4Regex.test(value)) {
      const isPrivate =
        value.startsWith("10.") ||
        value.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(value);

      setOutput(
        `Valid IPv4 address.\n\nType: IPv4\nPrivate range: ${
          isPrivate ? "Yes" : "No"
        }`
      );
      return;
    }

    if (ipv6Regex.test(value)) {
      setOutput("Valid IPv6 address.\n\nType: IPv6");
      return;
    }

    setOutput("Invalid IP address format.");
  };

  const resetAll = () => {
    setIp("");
    setOutput("");
  };

  return (
    <ToolShell
      title="IP Address Inspector"
      description="Inspect IPv4 and IPv6 address format instantly with this free online IP Address Inspector."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          IP Address
        </label>

        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="192.168.1.1"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={inspectIP} className="yoryantra-btn">
          Inspect IP
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            IP Inspection Result
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

        <div className="yoryantra-output min-h-[160px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "IP inspection result will appear here..."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
  {/* ABOUT */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900">
      Understanding IP Address Inspection
    </h2>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This IP Address Inspector helps you validate and inspect IPv4 and
      IPv6 addresses instantly. It is useful for debugging network
      configurations, API allowlists, server access rules, firewall
      settings, proxies, cloud deployments, and infrastructure
      troubleshooting.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      IP addresses are used to identify devices, servers, applications,
      and services connected to networks. During development and server
      administration workflows, validating IP formats quickly can help
      avoid configuration mistakes and connectivity issues.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This tool checks whether an IP address is valid, identifies whether
      it is IPv4 or IPv6, and helps inspect private network ranges
      directly inside your browser.
    </p>
  </div>

  {/* HOW TO USE */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      How to Use the IP Address Inspector
    </h2>

    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
      <li>Enter an IPv4 or IPv6 address into the input field.</li>

      <li>
        Click <strong>Inspect IP</strong>.
      </li>

      <li>
        Review the detected IP version and validation result.
      </li>

      <li>
        Check whether the IP belongs to a private network range.
      </li>
    </ol>
  </div>

  {/* COMMON USE CASES */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Common Use Cases
    </h2>

    <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
      <li>Checking valid IPv4 and IPv6 address formats.</li>

      <li>Debugging API allowlists and firewall rules.</li>

      <li>Inspecting private and public network addresses.</li>

      <li>Reviewing proxy and VPN configuration values.</li>

      <li>Testing cloud deployment networking settings.</li>

      <li>Validating server configuration inputs.</li>

      <li>Debugging infrastructure and networking issues.</li>
    </ul>
  </div>

  {/* EXAMPLE */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Example IP Addresses
    </h2>

    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
      <pre className="whitespace-pre-wrap break-words">
{`192.168.1.1
10.0.0.5
172.16.0.10
2001:db8::1`}
      </pre>
    </div>
  </div>

  {/* FAQ */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Frequently Asked Questions
    </h2>

    <div className="mt-5 space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900">
          What is an IP address?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          An IP address is a unique identifier assigned to devices and
          servers connected to a network. IP addresses allow systems to
          communicate with each other over local networks and the
          internet.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          What is the difference between IPv4 and IPv6?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          IPv4 uses shorter numeric addresses such as 192.168.1.1, while
          IPv6 uses longer hexadecimal addresses designed to support a
          much larger number of devices and internet connections.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          What are private IP addresses?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          Private IP addresses are reserved for local networks and are
          not directly accessible from the public internet. Common
          private ranges include 192.168.x.x, 10.x.x.x, and
          172.16.x.x–172.31.x.x.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Is IP inspection processed on the server?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          No. IP validation and inspection happen directly inside your
          browser.
        </p>
      </div>
    </div>
  </div>

  {/* RELATED TOOLS */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Related Tools
    </h2>

    <div className="mt-4 flex flex-wrap gap-3">
      <Link
        href="/tools/http-headers-parser"
        className="yoryantra-btn-outline"
      >
        HTTP Headers Parser
      </Link>

      <Link
        href="/tools/user-agent-parser"
        className="yoryantra-btn-outline"
      >
        User Agent Parser
      </Link>

      <Link
        href="/tools/cors-header-checker"
        className="yoryantra-btn-outline"
      >
        CORS Header Checker
      </Link>

      <Link
        href="/tools/curl-command-builder"
        className="yoryantra-btn-outline"
      >
        CURL Command Builder
      </Link>

      <Link
        href="/tools/http-status-code-explorer"
        className="yoryantra-btn-outline"
      >
        HTTP Status Code Explorer
      </Link>
    </div>
  </div>
</section>
    </ToolShell>
  );
}