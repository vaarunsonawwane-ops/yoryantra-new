"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [robotsInput, setRobotsInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [userAgent, setUserAgent] = useState("*");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const testRobots = () => {
    try {
      if (!robotsInput.trim()) {
        setError("Please enter robots.txt content.");
        setOutput("");
        return;
      }

      if (!urlInput.trim()) {
        setError("Please enter a URL path.");
        setOutput("");
        return;
      }

      const lines = robotsInput
        .split("\n")
        .map((line) => line.trim());

      let activeAgent = false;

      const disallowRules: string[] = [];
      const allowRules: string[] = [];

      lines.forEach((line) => {
        if (
          line.toLowerCase().startsWith("user-agent:")
        ) {
          const agent = line
            .split(":")[1]
            ?.trim();

          activeAgent =
            agent === "*" ||
            agent?.toLowerCase() ===
              userAgent.toLowerCase();
        }

        if (activeAgent) {
          if (
            line.toLowerCase().startsWith("disallow:")
          ) {
            const value = line
              .split(":")[1]
              ?.trim();

            if (value) {
              disallowRules.push(value);
            }
          }

          if (
            line.toLowerCase().startsWith("allow:")
          ) {
            const value = line
              .split(":")[1]
              ?.trim();

            if (value) {
              allowRules.push(value);
            }
          }
        }
      });

      let blocked = false;

      disallowRules.forEach((rule) => {
        if (
          rule !== "/" &&
          urlInput.startsWith(rule)
        ) {
          blocked = true;
        }

        if (rule === "/") {
          blocked = true;
        }
      });

      allowRules.forEach((rule) => {
        if (urlInput.startsWith(rule)) {
          blocked = false;
        }
      });

      setOutput(
        blocked
          ? "Blocked by robots.txt rules."
          : "Allowed by robots.txt rules."
      );

      setError("");
    } catch {
      setError("Unable to test robots.txt rules.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setRobotsInput("");
    setUrlInput("");
    setUserAgent("*");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Robots.txt Tester"
      description="Test robots.txt rules against URLs and user agents instantly."
    >
      {/* ROBOTS INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Robots.txt Content
        </label>

        <textarea
          value={robotsInput}
          onChange={(e) =>
            setRobotsInput(e.target.value)
          }
          placeholder="Paste robots.txt content here..."
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* URL + USER AGENT */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            URL Path
          </label>

          <input
            type="text"
            value={urlInput}
            onChange={(e) =>
              setUrlInput(e.target.value)
            }
            placeholder="/admin/dashboard"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            User Agent
          </label>

          <input
            type="text"
            value={userAgent}
            onChange={(e) =>
              setUserAgent(e.target.value)
            }
            placeholder="Googlebot"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={testRobots}
          className="yoryantra-btn"
        >
          Test Robots.txt
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Test Result
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output ||
            "Robots.txt testing result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Robots.txt Tester?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Robots.txt Tester helps you test
            robots.txt rules against specific URL
            paths and user agents instantly. It is
            useful for SEO professionals, developers,
            website owners, and technical SEO audits.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool checks whether a URL path is
            allowed or blocked based on the
            robots.txt rules and selected user agent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Robots.txt Tester
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your robots.txt content.
            </li>
            <li>
              Enter the URL path you want to test.
            </li>
            <li>
              Specify the user agent if needed.
            </li>
            <li>
              Click <strong>Test Robots.txt</strong>.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Testing blocked URLs for SEO.
            </li>
            <li>
              Debugging robots.txt crawl issues.
            </li>
            <li>
              Verifying search engine access rules.
            </li>
            <li>
              Auditing technical SEO configurations.
            </li>
            <li>
              Checking Googlebot crawl permissions.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`User-agent: *
Disallow: /admin`}
            </pre>

            <p className="mt-4">
              URL:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
/admin/settings
            </pre>

            <p className="mt-4">
              Result:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Blocked by robots.txt rules.
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
                What is robots.txt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Robots.txt is a file used to control
                crawler and search engine access to
                website pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does Disallow mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Disallow tells crawlers not to access
                specific paths or directories.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does Allow mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Allow explicitly permits crawlers to
                access specific paths.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Robots.txt testing happens
                directly in your browser.
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
              href="/tools/robots-txt-generator"
              className="yoryantra-btn-outline"
            >
              Robots.txt Generator
            </Link>

            <Link
              href="/tools/sitemap-generator"
              className="yoryantra-btn-outline"
            >
              Sitemap Generator
            </Link>

            <Link
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>

            <Link
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
