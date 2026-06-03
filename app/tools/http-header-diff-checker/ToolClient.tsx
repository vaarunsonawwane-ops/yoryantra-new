"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type HeaderMap = Record<string, string[]>;

type HeaderDiff = {
  name: string;
  status: "Added" | "Removed" | "Changed" | "Same";
  before: string[];
  after: string[];
};

const sampleBefore = `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: no-cache
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Server: nginx`;

const sampleAfter = `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=3600
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self';
Server: cloudflare`;

export default function ToolClient() {
  const [beforeInput, setBeforeInput] = useState("");
  const [afterInput, setAfterInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const compareHeaders = () => {
    if (!beforeInput.trim()) {
      setError("Please enter the first set of HTTP headers.");
      setOutput("");
      return;
    }

    if (!afterInput.trim()) {
      setError("Please enter the second set of HTTP headers.");
      setOutput("");
      return;
    }

    try {
      const beforeHeaders = parseHeaders(beforeInput);
      const afterHeaders = parseHeaders(afterInput);
      const diff = buildHeaderDiff(beforeHeaders, afterHeaders);

      setOutput(formatDiffReport(diff));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to compare these HTTP headers.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setBeforeInput(sampleBefore);
    setAfterInput(sampleAfter);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setBeforeInput("");
    setAfterInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="HTTP Header Diff Checker"
      description="Compare two sets of HTTP headers and find added, removed, changed, and unchanged response header values."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Headers Before
          </label>

          <textarea
            value={beforeInput}
            onChange={(event) => setBeforeInput(event.target.value)}
            placeholder={sampleBefore}
            className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste the original response headers or header block.
          </p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Headers After
          </label>

          <textarea
            value={afterInput}
            onChange={(event) => setAfterInput(event.target.value)}
            placeholder={sampleAfter}
            className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste the updated response headers or header block.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={compareHeaders} className="yoryantra-btn">
          Compare Headers
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Header Diff Report
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "HTTP header differences will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Comparing HTTP Headers Before and After Website Changes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP headers often change when a site moves hosting, adds a CDN,
            updates server configuration, changes cache rules, enables security
            headers, or modifies redirects. Small header changes can affect
            caching, security, SEO, API behavior, and browser handling.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Header Diff Checker helps you compare two sets of response
            headers, find added headers, removed headers, changed values, and
            unchanged values directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing Response Header Changes in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the first set of HTTP headers into the before box.</li>
            <li>Paste the second set of HTTP headers into the after box.</li>
            <li>
              Click <strong>Compare Headers</strong>.
            </li>
            <li>Review added, removed, changed, and unchanged header values.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common HTTP Header Diff Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Comparing headers before and after a CDN or Cloudflare change.</li>
            <li>Checking cache-control changes after deployment.</li>
            <li>Reviewing security header changes such as CSP, HSTS, and X-Frame-Options.</li>
            <li>Comparing API response headers across environments.</li>
            <li>Finding removed headers after server or proxy configuration updates.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Header Comparison
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
              <p className="mb-2 font-semibold text-gray-900">Before</p>
              <pre className="whitespace-pre-wrap break-words">
{sampleBefore}
              </pre>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
              <p className="mb-2 font-semibold text-gray-900">After</p>
              <pre className="whitespace-pre-wrap break-words">
{sampleAfter}
              </pre>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an HTTP Header Diff Checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It compares two sets of HTTP headers and shows which headers
                were added, removed, changed, or kept the same.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I compare headers from two environments?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can compare headers from staging and production,
                before and after deployment, or different API environments.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool send requests to URLs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool compares pasted header text. It does not fetch
                URLs or send network requests.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my header data uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The header comparison happens directly in your browser. Your
                pasted headers are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-headers-checker"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Checker
            </Link>

            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/http-response-formatter"
              className="yoryantra-btn-outline"
            >
              HTTP Response Formatter
            </Link>

            <Link
              href="/tools/security-headers-scanner"
              className="yoryantra-btn-outline"
            >
              Security Headers Scanner
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function parseHeaders(source: string): HeaderMap {
  const headers: HeaderMap = {};
  const lines = source
    .replace(/\\r\\n/g, "\\n")
    .split("\\n")
    .map((line) => line.trim())
    .filter(Boolean);

  lines.forEach((line) => {
    if (/^HTTP\/\d(?:\.\d)?\s+\d{3}/i.test(line)) {
      return;
    }

    const colonIndex = line.indexOf(":");

    if (colonIndex <= 0) {
      return;
    }

    const name = normalizeHeaderName(line.slice(0, colonIndex));
    const value = line.slice(colonIndex + 1).trim();

    if (!headers[name]) {
      headers[name] = [];
    }

    headers[name].push(value);
  });

  if (!Object.keys(headers).length) {
    throw new Error("No valid HTTP headers were found.");
  }

  return headers;
}

function buildHeaderDiff(before: HeaderMap, after: HeaderMap): HeaderDiff[] {
  const allNames = Array.from(
    new Set([...Object.keys(before), ...Object.keys(after)])
  ).sort();

  return allNames.map((name) => {
    const beforeValues = before[name] || [];
    const afterValues = after[name] || [];
    const beforeText = beforeValues.join("\\n");
    const afterText = afterValues.join("\\n");

    if (!beforeValues.length && afterValues.length) {
      return {
        name,
        status: "Added",
        before: [],
        after: afterValues,
      };
    }

    if (beforeValues.length && !afterValues.length) {
      return {
        name,
        status: "Removed",
        before: beforeValues,
        after: [],
      };
    }

    if (beforeText !== afterText) {
      return {
        name,
        status: "Changed",
        before: beforeValues,
        after: afterValues,
      };
    }

    return {
      name,
      status: "Same",
      before: beforeValues,
      after: afterValues,
    };
  });
}

function formatDiffReport(diff: HeaderDiff[]) {
  const added = diff.filter((item) => item.status === "Added");
  const removed = diff.filter((item) => item.status === "Removed");
  const changed = diff.filter((item) => item.status === "Changed");
  const same = diff.filter((item) => item.status === "Same");

  const lines = [
    "HTTP header comparison completed.",
    "",
    `Added: ${added.length}`,
    `Removed: ${removed.length}`,
    `Changed: ${changed.length}`,
    `Same: ${same.length}`,
    "",
  ];

  const groups: Array<[string, HeaderDiff[]]> = [
    ["Added headers", added],
    ["Removed headers", removed],
    ["Changed headers", changed],
    ["Unchanged headers", same],
  ];

  groups.forEach(([label, items]) => {
    lines.push(label + ":");

    if (!items.length) {
      lines.push("  None");
      lines.push("");
      return;
    }

    items.forEach((item) => {
      lines.push(`  ${item.name}`);

      if (item.status === "Changed") {
        lines.push(`    Before: ${item.before.join(", ")}`);
        lines.push(`    After: ${item.after.join(", ")}`);
      } else if (item.status === "Added") {
        lines.push(`    Value: ${item.after.join(", ")}`);
      } else if (item.status === "Removed") {
        lines.push(`    Value: ${item.before.join(", ")}`);
      } else {
        lines.push(`    Value: ${item.before.join(", ")}`);
      }
    });

    lines.push("");
  });

  return lines.join("\\n").trim();
}

function normalizeHeaderName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}
