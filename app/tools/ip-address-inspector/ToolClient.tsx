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
      {/* INPUT */}
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

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={inspectIP} className="yoryantra-btn">
          Inspect IP
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* OUTPUT */}
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

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Working With IP Addresses During Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            IP addresses are used to identify devices, servers, applications,
            APIs, databases, proxies, and services connected to a network. When
            a request fails, a firewall blocks traffic, or an allowlist does not
            behave as expected, checking the IP address format is often a simple
            first step.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This IP Address Inspector helps you validate IPv4 and IPv6 address
            formats and check whether an IPv4 address belongs to a private
            network range. It is useful for server configuration, API allowlists,
            VPN testing, proxy debugging, firewall rules, and cloud deployment
            checks.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool runs directly inside your browser, so you can quickly check
            an IP address without sending it anywhere.
          </p>
        </div>

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
              Review whether the IP address format is valid.
            </li>

            <li>
              Check the detected IP version and private range result.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking valid IPv4 and IPv6 address formats.</li>

            <li>Debugging API allowlists and firewall rules.</li>

            <li>Inspecting private and public network addresses.</li>

            <li>Reviewing proxy, VPN, and server configuration values.</li>

            <li>Testing cloud deployment networking settings.</li>

            <li>Validating IP inputs before saving configuration.</li>

            <li>Debugging infrastructure and network access issues.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example IP Addresses
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`192.168.1.1 → private IPv4 address
10.0.0.5 → private IPv4 address
8.8.8.8 → public IPv4 address
2001:db8::1 → IPv6 address`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Private IP Address Ranges
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>10.0.0.0/8</strong> is commonly used in private
                internal networks.
              </li>

              <li>
                <strong>172.16.0.0/12</strong> covers private addresses from
                172.16.x.x to 172.31.x.x.
              </li>

              <li>
                <strong>192.168.0.0/16</strong> is often used by home routers,
                local devices, and small networks.
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
                What is an IP address?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An IP address is a unique network identifier assigned to
                devices, servers, and services so they can communicate over
                local networks or the internet.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between IPv4 and IPv6?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                IPv4 uses shorter numeric addresses such as 192.168.1.1, while
                IPv6 uses longer hexadecimal addresses designed to support many
                more devices and internet connections.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What are private IP addresses?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Private IP addresses are reserved for local networks and are not
                directly reachable from the public internet. Common private
                ranges include 10.x.x.x, 172.16.x.x–172.31.x.x, and
                192.168.x.x.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why inspect IP addresses during debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Inspecting IP addresses helps catch invalid formats, private
                range mistakes, firewall issues, allowlist problems, and
                network configuration errors.
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

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            IP address debugging often connects with HTTP headers, user agents,
            CORS settings, API requests, status codes, and network
            troubleshooting workflows.
          </p>

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