"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type NginxIssue = {
  line: number;
  level: "Warning" | "Suggestion";
  message: string;
};

const sampleConfig = `server {
  listen 80;
  server_name example.com www.example.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /static/ {
    root /var/www/example;
  }
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateConfig = () => {
    if (!input.trim()) {
      setError("Please enter an Nginx configuration snippet to check.");
      setOutput("");
      return;
    }

    const issues = checkNginxConfig(input);
    setOutput(formatReport(input, issues));
    setError("");
  };

  const loadExample = () => {
    setInput(sampleConfig);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Nginx Config Validator"
      description="Check Nginx configuration snippets for common syntax issues, server block mistakes, proxy settings, and missing braces."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Nginx Configuration
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleConfig}
          className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste an Nginx server block, location block, or configuration snippet
          to check common issues before deployment.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateConfig} className="yoryantra-btn">
          Check Config
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
            Validation Report
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
          {output || "Nginx configuration check results will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This browser tool checks common Nginx configuration patterns. Always run
        <strong> nginx -t</strong> on the actual server before reloading Nginx.
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Nginx Configuration Before Reloading Servers
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Nginx configuration files often include server blocks, location
            rules, redirects, proxy settings, headers, SSL settings, and static
            file paths. A small missing brace, missing semicolon, or incorrect
            directive can stop Nginx from reloading correctly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Nginx Config Validator helps you check Nginx configuration
            snippets for common syntax issues, brace mismatches, missing
            semicolons, duplicate server names, proxy settings, and basic
            server block mistakes directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing Server Blocks, Locations, and Proxy Rules
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste an Nginx configuration snippet into the input box.</li>
            <li>
              Click <strong>Check Config</strong>.
            </li>
            <li>Review warnings and suggestions in the validation report.</li>
            <li>Run <strong>nginx -t</strong> on your server before applying changes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Nginx Config Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking server blocks before adding them to production.</li>
            <li>Finding missing semicolons in Nginx directives.</li>
            <li>Reviewing reverse proxy settings such as <strong>proxy_pass</strong>.</li>
            <li>Checking brace balance in nested location blocks.</li>
            <li>Reviewing redirects, server names, and header directives.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Nginx Configuration
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleConfig}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an Nginx config validator check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks Nginx configuration text for common issues such as
                missing braces, missing semicolons, empty blocks, duplicate
                server names, and risky or incomplete proxy settings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this replace nginx -t?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool is useful for quick browser checks while editing.
                You should still run <strong>nginx -t</strong> on the actual
                server before reloading Nginx.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I check reverse proxy configuration here?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can paste server blocks with proxy directives such as
                <strong> proxy_pass</strong> and
                <strong> proxy_set_header</strong> to review common patterns.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my Nginx configuration uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The Nginx configuration check happens directly in your
                browser. Your configuration text is not uploaded to a server.
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
              href="/tools/dockerfile-linter"
              className="yoryantra-btn-outline"
            >
              Dockerfile Linter
            </Link>

            <Link
              href="/tools/yaml-validator"
              className="yoryantra-btn-outline"
            >
              YAML Validator
            </Link>

            <Link
              href="/tools/http-headers-checker"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Checker
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

function checkNginxConfig(source: string) {
  const lines = source.split(/\r?\n/);
  const issues: NginxIssue[] = [];
  const serverNames = new Map<string, number>();
  let braceBalance = 0;
  let hasServerBlock = false;
  let hasListen = false;
  let hasServerName = false;
  let hasLocation = false;
  let hasProxyPass = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = stripComment(line).trim();

    if (!trimmed) {
      return;
    }

    const openCount = countMatches(trimmed, "{");
    const closeCount = countMatches(trimmed, "}");

    braceBalance += openCount - closeCount;

    if (braceBalance < 0) {
      issues.push({
        line: lineNumber,
        level: "Warning",
        message: "Closing brace found without a matching opening brace.",
      });

      braceBalance = 0;
    }

    if (/^server\s*\{$/i.test(trimmed)) {
      hasServerBlock = true;
    }

    if (/^listen\s+/i.test(trimmed)) {
      hasListen = true;
    }

    if (/^server_name\s+/i.test(trimmed)) {
      hasServerName = true;
      const names = trimmed
        .replace(/;$/, "")
        .replace(/^server_name\s+/i, "")
        .split(/\s+/)
        .filter(Boolean);

      names.forEach((name) => {
        if (serverNames.has(name)) {
          issues.push({
            line: lineNumber,
            level: "Suggestion",
            message: `Duplicate server_name value "${name}" also appears on line ${serverNames.get(name)}.`,
          });
        } else {
          serverNames.set(name, lineNumber);
        }
      });
    }

    if (/^location\s+/i.test(trimmed)) {
      hasLocation = true;

      if (!trimmed.includes("{")) {
        issues.push({
          line: lineNumber,
          level: "Warning",
          message: "Location block should include an opening brace.",
        });
      }
    }

    if (/^proxy_pass\s+/i.test(trimmed)) {
      hasProxyPass = true;

      if (!/^proxy_pass\s+https?:\/\//i.test(trimmed)) {
        issues.push({
          line: lineNumber,
          level: "Suggestion",
          message: "proxy_pass usually points to an http:// or https:// upstream.",
        });
      }
    }

    if (
      shouldEndWithSemicolon(trimmed) &&
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}")
    ) {
      issues.push({
        line: lineNumber,
        level: "Warning",
        message: "This directive may be missing a semicolon.",
      });
    }

    if (/root\s+\/$/i.test(trimmed)) {
      issues.push({
        line: lineNumber,
        level: "Suggestion",
        message: "Review root path. Using the filesystem root as a web root is usually not intended.",
      });
    }

    if (/ssl\s+on;/i.test(trimmed)) {
      issues.push({
        line: lineNumber,
        level: "Suggestion",
        message: "The ssl on directive is old. Modern configs usually use listen 443 ssl.",
      });
    }

    if (/proxy_set_header\s+Host\s+\$http_host/i.test(trimmed)) {
      issues.push({
        line: lineNumber,
        level: "Suggestion",
        message: "Consider whether $host is more appropriate than $http_host for Host forwarding.",
      });
    }

    if (/add_header\s+/i.test(trimmed) && !/\salways;?$/i.test(trimmed)) {
      issues.push({
        line: lineNumber,
        level: "Suggestion",
        message: "Security headers may need the always flag so they apply to error responses too.",
      });
    }
  });

  if (braceBalance > 0) {
    issues.push({
      line: 0,
      level: "Warning",
      message: "One or more opening braces do not have matching closing braces.",
    });
  }

  if (!hasServerBlock) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "No server block found. This may be fine for snippets, but full site configs usually include one.",
    });
  }

  if (hasServerBlock && !hasListen) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "Server block does not appear to include a listen directive.",
    });
  }

  if (hasServerBlock && !hasServerName) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "Server block does not appear to include server_name.",
    });
  }

  if (hasProxyPass && !source.includes("proxy_set_header")) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "proxy_pass is used, but no proxy_set_header directives were found.",
    });
  }

  if (!hasLocation && hasServerBlock) {
    issues.push({
      line: 0,
      level: "Suggestion",
      message: "No location block found inside the server configuration.",
    });
  }

  return issues;
}

function formatReport(source: string, issues: NginxIssue[]) {
  const nonEmptyLines = source
    .split(/\r?\n/)
    .filter((line) => line.trim()).length;

  const warningCount = issues.filter((issue) => issue.level === "Warning").length;
  const suggestionCount = issues.filter(
    (issue) => issue.level === "Suggestion"
  ).length;

  if (!issues.length) {
    return [
      "Nginx configuration check completed.",
      "",
      `Checked ${nonEmptyLines} non-empty line${nonEmptyLines === 1 ? "" : "s"}.`,
      "",
      "No common issues found in this browser check.",
      "",
      "Reminder: run nginx -t on the actual server before reloading Nginx.",
    ].join("\n");
  }

  const lines = [
    "Nginx configuration check completed.",
    "",
    `Checked lines: ${nonEmptyLines}`,
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
    "Issues found:",
    "",
  ];

  issues.forEach((issue, index) => {
    lines.push(
      `${index + 1}. ${issue.level}${issue.line ? ` on line ${issue.line}` : ""}: ${issue.message}`
    );
  });

  lines.push("");
  lines.push("Reminder: run nginx -t on the actual server before reloading Nginx.");

  return lines.join("\n");
}

function stripComment(line: string) {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    }

    if (char === "#" && !inSingleQuote && !inDoubleQuote) {
      return line.slice(0, index);
    }
  }

  return line;
}

function countMatches(value: string, character: string) {
  return value.split(character).length - 1;
}

function shouldEndWithSemicolon(line: string) {
  const blockStarters = [
    "server",
    "location",
    "upstream",
    "http",
    "events",
    "stream",
    "map",
    "if",
  ];

  return !blockStarters.some((starter) =>
    new RegExp(`^${starter}\\b`, "i").test(line)
  );
}
