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

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This IP Address Inspector
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This IP Address Inspector helps you check whether an IP address is
            valid and identify whether it is IPv4 or IPv6. It is useful for
            developers, network debugging, server configuration, API allowlists,
            and security workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            IPv4 and IPv6 addresses are used to identify devices and servers on
            networks. This tool helps quickly inspect common IP address formats.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking valid IPv4 and IPv6 formats.</li>
            <li>Debugging server and API allowlists.</li>
            <li>Inspecting private network addresses.</li>
            <li>Validating network configuration values.</li>
            <li>Testing firewall or proxy settings.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">
              HTTP Headers Parser
            </Link>

            <Link href="/tools/user-agent-parser" className="yoryantra-btn-outline">
              User Agent Parser
            </Link>

            <Link href="/tools/cors-header-checker" className="yoryantra-btn-outline">
              CORS Header Checker
            </Link>

            <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
              CURL Command Builder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}